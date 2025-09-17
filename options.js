const els = {
  token: document.getElementById('token'),
  parentId: document.getElementById('parentId'),
  titleTpl: document.getElementById('titleTpl'),
  defaultFormat: document.getElementById('defaultFormat'),
  msg: document.getElementById('msg')
};

chrome.storage.local.get(
  ['notionToken','parentPageId','titleTemplate','defaultFormat'],
  (cfg) => {
    els.token.value = cfg.notionToken || '';
    els.parentId.value = cfg.parentPageId || '';
    els.titleTpl.value = cfg.titleTemplate || 'Tabs – {{date}} {{time}}';
    els.defaultFormat.value = cfg.defaultFormat || 'bookmark';
  }
);

document.getElementById('save').addEventListener('click', () => {
  chrome.storage.local.set({
    notionToken: els.token.value.trim(),
    parentPageId: els.parentId.value.trim(),
    titleTemplate: els.titleTpl.value.trim() || 'Tabs – {{date}} {{time}}',
    defaultFormat: els.defaultFormat.value
  }, () => {
    els.msg.textContent = 'Saved.';
    setTimeout(() => els.msg.textContent = '', 1200);
  });
});
