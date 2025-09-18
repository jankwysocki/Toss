importScripts('utils.js', 'notion.js');

function nowParts() {
  const d = new Date();
  const pad = n => String(n).padStart(2,'0');
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`
  };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.action !== 'SAVE_TABS') return;

  (async () => {
    const { notionToken, parentPageId: storedParent, titleTemplate, defaultTarget } =
      await chrome.storage.local.get(['notionToken','parentPageId','titleTemplate','defaultTarget']);

    if (!notionToken) {
      sendResponse({ ok:false, error:'Notion token missing. Open the Options page.' });
      return;
    }
    if (!storedParent) {
      sendResponse({ ok:false, error:'Parent Page is not set. Open the Options page and paste a Notion share link for your parent page.' });
      return;
    }

    const target = (msg.opts?.target || defaultTarget || 'current');
    const tabs = await chrome.tabs.query(target === 'all' ? {} : { currentWindow: true });
    const cleaned = tabs
      .filter(t => /^https?:\/\//.test(t.url || ''))
      .map(t => ({ title: t.title || t.url, url: t.url }));

    if (!cleaned.length) {
      sendResponse({ ok:false, error:'No http(s) tabs found for the selected target.' });
      return;
    }

    const { date, time } = nowParts();
    const pageTitle = (titleTemplate || 'Tabs – {{date}} {{time}}')
      .replace('{{date}}', date)
      .replace('{{time}}', time);

    const created = await notionCreatePage(notionToken, storedParent, pageTitle);

    const format = ['bookmark','mention','bulleted'].includes(msg.opts?.format)
      ? msg.opts.format : 'bookmark';
    const children = cleaned.map(t => makeBlock(t, format));

    for (let i = 0; i < children.length; i += 100) {
      await notionAppendChildren(notionToken, created.id, children.slice(i, i + 100));
      await new Promise(r => setTimeout(r, 300));
    }

    sendResponse({ ok:true, count: cleaned.length, pageUrl: created.url });
  })().catch(err => {
    console.error('[Toss] Error:', err);
    sendResponse({ ok:false, error: String(err.message || err) });
  });

  return true;
});
