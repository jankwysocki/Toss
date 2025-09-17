#Toss
## Send Tabs → Notion

A minimalist Chrome (MV3) extension that exports all tabs from the **current window** to a new Notion page — as **web bookmarks**, **link mentions**, or a **bulleted list**.

## Features
- One-click: capture current window’s tabs
- Three formats: Bookmarks, Link mentions, Bulleted list
- Parent Page ID **optional**: if provided → save there; if not → create at workspace top-level
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

## Usage
- Open a Chrome window with the tabs you want to save
- Click the extension icon
- (Optional) Paste a **Parent Page ID** to target a specific page
- Pick a format → **Save tabs to Notion**
- A new Notion page is created with all your links

## Permissions
- `tabs` (read open tabs’ titles/URLs)
- `storage` (save your token and preferences locally)

## Privacy
All data (Notion token, preferences) is stored locally via `chrome.storage.local`. No external servers.

## License
MIT

## Author
Jan Wysocki
