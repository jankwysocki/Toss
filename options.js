const els = {
  token: document.getElementById('token'),
  parentId: document.getElementById('parentId'),
  defaultTarget: document.getElementById('defaultTarget'),
  defaultFormat: document.getElementById('defaultFormat'),
  titleTpl: document.getElementById('titleTpl'),
  msg: document.getElementById('msg')
};

chrome.storage.local.get(
  ['notionToken','parentPageId','parentPageDisplay','defaultTarget','defaultFormat','titleTemplate'],
  (cfg) => {
    els.token.value = cfg.notionToken || '';
    els.parentId.value = cfg.parentPageDisplay || cfg.parentPageId || '';
    els.defaultTarget.value = cfg.defaultTarget || 'current';
    els.defaultFormat.value = cfg.defaultFormat || 'bookmark';
    els.titleTpl.value = cfg.titleTemplate || 'Tabs – {{date}} {{time}}';
  }
);

els.parentId.addEventListener('blur', () => {
  const norm = normalizeNotionParentInput(els.parentId.value);
  if (norm.display) els.parentId.value = norm.display;
});

document.getElementById('save').addEventListener('click', () => {
  const norm = normalizeNotionParentInput(els.parentId.value);
  chrome.storage.local.set({
    notionToken: els.token.value.trim(),
    parentPageId: norm.pageId,
    parentPageDisplay: norm.display || '',
    defaultTarget: els.defaultTarget.value,
    defaultFormat: els.defaultFormat.value,
    titleTemplate: els.titleTpl.value.trim() || 'Tabs – {{date}} {{time}}'
  }, () => {
    if (norm.display) els.parentId.value = norm.display;
    els.msg.textContent = 'Saved.';
    setTimeout(() => els.msg.textContent = '', 1200);
  });
});
