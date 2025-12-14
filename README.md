# TabZapDups

A Chrome extension that automatically closes duplicate tabs within the same window.

## Features

- Detects when you navigate to a URL that already exists in another tab
- Queues duplicate tabs for removal after a 5-second delay
- Click the extension icon to cancel pending removals
- Badge shows the number of tabs pending removal
- Configurable URL patterns for matching duplicates
- Configurable ignore patterns for URLs that should never trigger duplicate detection
- Settings sync across devices via Chrome storage

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select this directory

## Configuration

Click the extension icon and select "Options" to configure:

- **URL Patterns**: Regex patterns used to normalize URLs for comparison. The first matching pattern determines what portion of the URL is used for duplicate detection.
- **Ignore Patterns**: Regex patterns for URLs that should never trigger duplicate detection (e.g., `chrome://`, `view-source:`).

## How It Works

When you navigate to a page, TabZapDups checks if another tab in the same window has an equivalent URL. If a duplicate is found, the new tab is queued for removal after a 5-second delay, giving you time to cancel by clicking the extension icon.

## Permissions

- `tabs` - Query and remove tabs
- `webNavigation` - Detect navigation events
- `storage` - Save settings across devices
- `notifications` - Display notifications
- `alarms` - Schedule delayed tab removal
