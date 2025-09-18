// utils.js
function normalizeNotionParentInput(input) {
  if (!input) return { pageId: '', display: '', raw: '' };

  const raw = String(input).trim();

  // remove "?source=copy_link" etc. for cleaner parsing/display
  const noQuery = raw.replace(/\?source=copy[_-]link.*$/i, '');

  // Try to parse as URL first to get the last path segment
  let pathTail = '';
  try {
    const u = new URL(noQuery);
    const segs = u.pathname.split('/').filter(Boolean);
    pathTail = segs[segs.length - 1] || '';
  } catch {
    // not a URL — that's fine
  }

  // Build a candidate string we can scan for IDs:
  // prefer the last segment if we have it; else scan the whole string
  const candidate = pathTail || noQuery;

  // 1) Look for a hyphenated UUID first (36 chars with hyphens)
  let id32 = '';
  const hyphenated = candidate.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  if (hyphenated) {
    id32 = hyphenated[0].replace(/-/g, '');
  } else {
    // 2) Fallback: look for a 32-hex run (no hyphens)
    const bare = candidate.match(/[0-9a-f]{32}/i);
    if (bare) id32 = bare[0];
  }

  // Hyphenate as 8-4-4-4-12 (lowercase)
  const pageId = id32
    ? id32.toLowerCase().replace(/^(.{8})(.{4})(.{4})(.{4})(.{12}).*$/, '$1-$2-$3-$4-$5')
    : '';

  // Compact display: “…/<last-segment>” if URL, else show hyphenated ID, else raw
  let display = '';
  if (pathTail) {
    display = `.../${pathTail}`;
  } else if (pageId) {
    display = `.../${pageId}`;
  } else {
    display = noQuery;
  }

  return { pageId, display, raw };
}
