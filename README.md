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

2. Prepare your Notion integration:
   - Create an internal integration at https://www.notion.so/profile/integrations and copy the **secret token**.
   - In Notion, open the **Parent Page** you want to use → **Share** → invite your integration (with edit access).
   - Copy the Parent Page link from Notion (Share → Copy link).

3. Open the extension **Options** in Chrome:
   - Paste your Notion **integration token** (`secret_...`)
   - Paste the **Parent Page** share link (or ID — the extension will normalize it automatically)
   - Choose a **Default Target** (Active Window or All Windows)
   - Choose a **Default Format** (Bookmarks, Link mentions, Bulleted list)
   - (Optional) Adjust the page title template (`Tabs – {{date}} {{time}}`)

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
