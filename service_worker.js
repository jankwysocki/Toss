// service_worker.js
// Load helpers first
importScripts('utils.js', 'notion.js');

// ---------- small helpers ----------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function mapWithConcurrency(items, limit, worker) {
  const ret = [];
  let i = 0;
  const runners = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
    while (i < items.length) {
      const idx = i++;
      ret[idx] = await worker(items[idx], idx);
    }
  });
  await Promise.all(runners);
  return ret;
}

// naive 429 backoff wrapper (parses thrown error message from notionFetch)
async function withRetry429(fn, { base = 400, max = 3000, tries = 5 } = {}) {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (e) {
      const msg = String(e?.message || e);
      const is429 = msg.includes(' 429 ') || msg.toLowerCase().includes('rate limit');
      if (!is429 || ++attempt >= tries) throw e;
      const delay = Math.min(max, base * Math.pow(2, attempt - 1));
      await sleep(delay);
    }
  }
}

function nowParts() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

// Robust formatter: case-insensitive, allows spaces inside {{ ... }}
function formatTitle(tpl, ctx) {
  const template = tpl || 'Tabs – {{date}} {{time}}';
  const vars = {
    date: ctx.date,
    time: ctx.time,
    datetime: `${ctx.date} ${ctx.time}`,
    count: String(ctx.count),
    target: ctx.target,
    activeTitle: ctx.activeTitle || '',
  };
  let out = template;
  for (const [key, val] of Object.entries(vars)) {
    const re = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
    out = out.replace(re, val);
  }
  return out;
}

// ---------- main handler ----------
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.action !== 'SAVE_TABS') return;

  (async () => {
    const {
      notionToken,
      parentPageId: storedParent,
      titleTemplate,
      defaultTarget,
    } = await chrome.storage.local.get([
      'notionToken',
      'parentPageId',
      'titleTemplate',
      'defaultTarget',
    ]);

    if (!notionToken) {
      sendResponse({ ok: false, error: 'Notion token missing. Open the Options page.' });
      return;
    }
    if (!storedParent) {
      sendResponse({
        ok: false,
        error:
          'Parent Page is not set. Open the Options page and paste a Notion share link for your parent page.',
      });
      return;
    }

    const target = msg.opts?.target || defaultTarget || 'current';
    const tabs = await chrome.tabs.query(target === 'all' ? {} : { currentWindow: true });

    const cleaned = tabs
      .filter((t) => /^https?:\/\//.test(t.url || ''))
      .map((t) => ({ title: t.title || t.url, url: t.url }));

    if (!cleaned.length) {
      sendResponse({ ok: false, error: 'No http(s) tabs found for the selected target.' });
      return;
    }

    const { date, time } = nowParts();
    const ctx = {
      date,
      time,
      count: cleaned.length,
      target: target === 'all' ? 'All Windows' : 'Active Window',
      activeTitle: target === 'current' ? tabs.find((t) => t.active)?.title || '' : '',
    };
    const pageTitle = formatTitle(titleTemplate, ctx);

    const fmt = ['bookmark', 'mention', 'bulleted', 'database'].includes(msg.opts?.format)
      ? msg.opts.format
      : 'bookmark';

    if (fmt === 'database') {
      // Create a database (no extra page) and insert each tab as a row
      const db = await notionCreateDatabase(notionToken, storedParent, pageTitle);
      const dbId = db.id;

      // Insert rows with limited concurrency & 429 backoff
      await mapWithConcurrency(cleaned, 4, async ({ title, url }) => {
        await withRetry429(() => notionCreateDatabaseRow(notionToken, dbId, title, url));
      });

      sendResponse({ ok: true, count: cleaned.length, pageUrl: db.url });
    } else {
      // Non-database formats: create a page and append blocks in chunks of 100
      const created = await notionCreatePage(notionToken, storedParent, pageTitle);
      const children = cleaned.map(({ title, url }) => makeBlock({ title, url }, fmt));

      for (let i = 0; i < children.length; i += 100) {
        await notionAppendChildren(notionToken, created.id, children.slice(i, i + 100));
        await sleep(250);
      }

      sendResponse({ ok: true, count: cleaned.length, pageUrl: created.url });
    }
  })().catch((err) => {
    console.error('[Toss] Error:', err);
    sendResponse({ ok: false, error: String(err.message || err) });
  });

  return true; // keep the message channel open for async
});
