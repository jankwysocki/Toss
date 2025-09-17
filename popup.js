const el = {
  parentId: document.getElementById('parentIdInput'),
  format: document.getElementById('format'),
  save: document.getElementById('save'),
  status: document.getElementById('status')
};

async function refreshButton() {
  chrome.storage.local.get(['notionToken', 'parentPageId', 'defaultFormat'], (cfg) => {
    // Pre-fill fields on first open
    if (!el.parentId.dataset._init && cfg.parentPageId) {
      el.parentId.value = cfg.parentPageId;
      el.parentId.dataset._init = '1';
    }
    if (!el.format.dataset._init) {
      el.format.value = cfg.defaultFormat || 'bookmark';
      el.format.dataset._init = '1';
    }
    // Only validation: token must exist
    el.save.disabled = !cfg.notionToken;
  });
}

document.addEventListener('DOMContentLoaded', refreshButton);

el.save.addEventListener('click', () => {
  el.status.textContent = 'Saving...';
  chrome.runtime.sendMessage({
    action: 'SAVE_TABS',
    opts: {
      parentPageId: el.parentId.value.trim(),
      format: el.format.value
    }
  }, (resp) => {
    if (chrome.runtime.lastError) {
      el.status.textContent = 'Error: ' + chrome.runtime.lastError.message;
      return;
    }
    if (resp?.ok) {
      // Persist parent ID for convenience if user provided one
      if (el.parentId.value.trim()) {
        chrome.storage.local.set({ parentPageId: el.parentId.value.trim() });
      }
      el.status.innerHTML = `Saved ${resp.count} tabs. <a target="_blank" href="${resp.pageUrl}">Open Notion page</a>`;
    } else {
      el.status.textContent = 'Error: ' + (resp?.error || 'Unknown');
    }
  });
});
