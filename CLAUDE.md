# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TabZap is a Chrome extension that automatically closes duplicate tabs within the same window. When a user navigates to a URL that already exists in another tab, the extension queues the duplicate for removal after a 5-second delay (clicking the extension icon cancels pending removals).

## Architecture

This is a Manifest V2 Chrome extension with the following structure:

- **background.js** - Service worker that listens for navigation events (`chrome.webNavigation.onCompleted`), detects duplicates, and manages tab removal with a delayed queue system
- **config.js** - Configuration management using `chrome.storage.sync` for persistence across devices. Stores patterns as string arrays that get converted to RegExp at runtime
- **options.js/options.html** - Settings UI allowing users to edit URL patterns and ignore patterns (one regex per line in textareas)

## Key Concepts

**URL Patterns** (`urlPatterns`): Regex patterns used to normalize URLs for comparison. The first matching pattern determines what portion of the URL is used. Default patterns handle Google Docs/Drive/Keep URLs and strip URL fragments.

**Ignore Patterns** (`ignorePatterns`): Regex patterns for URLs that should never trigger duplicate detection (e.g., `chrome://`, `view-source:`).

**Duplicate Queue**: Tabs marked for removal are held in `globalQueue` for 5 seconds. The badge shows pending removals. Clicking the extension icon clears the queue and cancels removals.

## Development

Load the extension in Chrome via `chrome://extensions/` with Developer Mode enabled, using "Load unpacked" pointed at this directory. No build step required.

## Chrome APIs Used

- `chrome.tabs` - Tab querying and removal
- `chrome.webNavigation` - Navigation completion events
- `chrome.storage.sync` - Cross-device settings persistence
- `chrome.browserAction` - Extension icon and badge
- `chrome.notifications` - Notification display (partially implemented)
