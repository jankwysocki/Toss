# Toss

## Send Tabs → Notion
A minimalist Chrome (MV3) extension that exports your open tabs to a new Notion sub-page — as **web bookmarks**, **link mentions**, or a **bulleted list**.

## Features
- One-click: capture tabs from your browser
- Selectable target: **Active Window** or **All Windows**
- Three formats: **Bookmarks**, **Link mentions**, **Bulleted list**
- Requires a chosen **Parent Page** in Notion (new pages are created underneath it)
- Clean UI (IBM Plex Mono), privacy-friendly (no servers)

## Install (Unpacked)
1. Clone this repo and open it in Chrome:
   - Go to `chrome://extensions`
   - Enable **Developer mode**
   - Click **Load unpacked** and select the project folder
2. Open the extension **Options**:
   - Paste your Notion **integration token** (`secret_...`)
   - (Optional) Default Parent Page ID
   - (Optional) Adjust page title template and default format

## Notion prerequisites
1) Create an internal integration: https://www.notion.so/profile/integrations (copy the secret token).
2) Open your target **Parent Page** in Notion → Share → invite your integration (can edit).
3) In the extension Options:
   - Paste your integration token.
   - Paste the Parent Page share link (or ID).
   - Choose Default Target and Default Format.

## Usage
1) Open a Chrome window with the tabs you want to save
2) Click the extension icon
3) Pick a target and format → **Save tabs to Notion**
4) A new Notion page is created with all your links

## Permissions
- `tabs` (read open tabs’ titles/URLs)
- `storage` (save your token and preferences locally)

## Privacy
All data (Notion token, preferences) is stored locally via `chrome.storage.local`. No external servers.

## License
MIT

## Author
Jan Wysocki
