// Simple Notion API helpers (global functions for importScripts)
const NOTION_API = 'https://api.notion.com/v1';
const NOTION_VER = '2022-06-28';

async function notionFetch(token, path, method='GET', body) {
  const res = await fetch(`${NOTION_API}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': NOTION_VER,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Notion ${method} ${path} failed: ${res.status} ${text}`);
  return text ? JSON.parse(text) : {};
}

// parentPageId: string|''|null; if falsy → use workspace top-level
async function notionCreatePage(token, parentPageId, title) {
  const parent = parentPageId
    ? { type: 'page_id', page_id: parentPageId }
    : { type: 'workspace', workspace: true };

  return notionFetch(token, '/pages', 'POST', {
    parent,
    properties: {
      title: { title: [{ type: 'text', text: { content: title } }] }
    }
  });
}

async function notionAppendChildren(token, blockId, children) {
  return notionFetch(token, `/blocks/${blockId}/children`, 'PATCH', { children });
}

// block builders
function makeBlock(item, format) {
  const { title, url } = item;

  if (format === 'bulleted') {
    return {
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [{ type: 'text', text: { content: title, link: { url } } }]
      }
    };
  }
  if (format === 'mention') {
    return {
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: title, link: { url } } }]
      }
    };
  }
  // default bookmark
  return { type: 'bookmark', bookmark: { url } };
}
