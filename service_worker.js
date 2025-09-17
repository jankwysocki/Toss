// MV3: bring helper funcs into global scope
importScripts('notion.js');

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
    const { notionToken, parentPageId: defaultParent, titleTemplate } =
      await chrome.storage.local.get(['notionToken','parentPageId','titleTemplate']);

    if (!notionToken) {
      sendResponse({ ok:false, error:'Notion token missing. Open the Options page.' });
      return;
    }

    // Read current window tabs
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const cleaned = tabs
      .filter(t => /^https?:\/\//.test(t.url || ''))
      .map(t => ({ title: t.title || t.url, url: t.url }));

    if (!cleaned.length) {
      sendResponse({ ok:false, error:'No http(s) tabs in this window.' });
      return;
    }

    const parentFromPopup = (msg.opts?.parentPageId || '').trim();
    const parentToUse = parentFromPopup || defaultParent || '';

    const { date, time } = nowParts();
    const pageTitle = (titleTemplate || 'Tabs – {{date}} {{time}}')
      .replace('{{date}}', date)
      .replace('{{time}}', time);

    let created;
    try {
      created = await notionCreatePage(notionToken, parentToUse, pageTitle);
    } catch (e) {
      // If user gave no parent and workspace creation failed (permissions), guide them.
      if (!parentToUse) {
        sendResponse({ ok:false, error:'Workspace create failed. Provide a Parent Page ID and try again.' });
        return;
      }
      throw e;
    }

    const format = ['bookmark','mention','bulleted'].includes(msg.opts?.format)
      ? msg.opts.format : 'bookmark';

    const children = cleaned.map(t => makeBlock(t, format));

    // Append in chunks of 100 to respect Notion limits
    for (let i = 0; i < children.length; i += 100) {
      await notionAppendChildren(notionToken, created.id, children.slice(i, i + 100));
      await new Promise(r => setTimeout(r, 300)); // gentle pacing
    }

    sendResponse({ ok:true, count: cleaned.length, pageUrl: created.url });
  })().catch(err => {
    console.error(err);
    sendResponse({ ok:false, error: String(err.message || err) });
  });

  return true; // keep channel open
});
