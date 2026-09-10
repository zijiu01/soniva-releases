---
order: 4
---

# Auto-update

Soniva Desktop ships with electron-updater, so later versions can update in
place.

## Update source

- Update artifacts and installers are published together in this repository's GitHub Releases
- The app reads the release metadata to decide whether a newer version exists

## Current status

- 0.1.0 is the first packaged build; no Release artifacts have been uploaded yet
- The end-to-end update flow (upgrading from an older build) is still being verified

## Manual update

Until auto-update is fully available, download the latest installer from the
version timeline and install over the existing app.
