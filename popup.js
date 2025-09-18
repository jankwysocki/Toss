const el = {
  save: document.getElementById('save'),
  status: document.getElementById('status')
};

function getSelected(name, def) {
  const r = document.querySelector(`input[name="${name}"]:checked`);
  return r ? r.value : def;
}

function setSelected(name, value) {
  const t = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (t) t.checked = true;
}

function refreshButton() {
  chrome.storage.local.get(['notionToken','defaultTarget','defaultFormat'], (cfg) => {
    el.save.disabled = !cfg.notionToken;
    setSelected('target', cfg.defaultTarget || 'current');
    setSelected('fmt', cfg.defaultFormat || 'bookmark');
  });
}
document.addEventListener('DOMContentLoaded', () => {
  refreshButton();

  const link = document.getElementById('openOptionsLink');
  if (link) {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (chrome.runtime && chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL('options.html'));
      }
    });
  }
});

el.save.addEventListener('click', () => {
  el.status.textContent = 'Saving...';

  chrome.runtime.sendMessage({
    action: 'SAVE_TABS',
    opts: {
      target: getSelected('target', 'current'),
      format: getSelected('fmt', 'bookmark')
    }
  }, (resp) => {
    if (chrome.runtime.lastError) {
      el.status.textContent = 'Error: ' + chrome.runtime.lastError.message;
      return;
    }
    if (resp?.ok) {
      el.status.innerHTML = `Saved ${resp.count} tabs. <a target="_blank" href="${resp.pageUrl}">Open Notion page</a>`;
    } else {
      el.status.textContent = 'Error: ' + (resp?.error || 'Unknown');
    }
  });
});
