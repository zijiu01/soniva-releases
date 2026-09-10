---
order: 3
---

# Troubleshooting

## macOS says the app is damaged or cannot be verified

First make sure the download is complete and came from this repository's
Releases. If it is still blocked, run:

```bash
xattr -dr com.apple.quarantine /Applications/Soniva.app
```

Then open it again. This only removes the quarantine flag left by the browser;
it does not modify the app itself.

## Blank screen after launch

0.1.0 is the first beta build. If you see a blank screen, fully quit the app and
open it again, and make sure you are online. If it persists, open an issue with
your macOS version, chip, and a screenshot.

## "Another instance is already running"

Soniva uses a single-instance lock. Quit the running window from the Dock, or
press `⌘Q`, then reopen.

## Asset library

- If a `.sonivalib` file is damaged, the index can be rebuilt from sidecar files
- Deleted assets go to a trash and can be restored in the app

## Still stuck?

Open an issue on the GitHub repository with your macOS version, chip, Soniva
version, reproduction steps, and a screenshot.
