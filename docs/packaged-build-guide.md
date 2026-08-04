# Packaged Build Guide

**ED Rare Router**  
Version: Beta 2  
Last Updated: August 4, 2026

**Author:** R.W. Harper (CMDR Mactavious)  
**License:** GNU General Public License v3.0

## ⚠️ Disclaimer

**THIS IS A DEVELOPMENT/HOBBY PROJECT - USE AT YOUR OWN RISK**

This software is provided "AS IS" without warranty of any kind, express or implied. No guarantees or warranties are given. The authors and contributors are not liable for any damages arising from use of this software. See the [LICENSE](../LICENSE) file for full terms.

---

This guide is for the double-click executable build - the one from the **[Releases page](https://github.com/rwharpernc/ED-Rare-Router/releases/latest)**, not the source code. If you're building/running from source instead, see the **[Developer Guide](./development.md)**.

## What's in the download

Unzip the archive and you'll see:

```
ED-Rare-Router/
  ED-Rare-Router.exe        (or ED-Rare-Router, on Linux)
  README-FIRST.txt          quick-start card, generated at build time
  node-runtime/             bundled portable Node.js - nothing to install
  app/
    dist/                   the built application
    data/                   cache files live here once the app runs
    (app/.config.json appears here after first-run setup)
```

`README-FIRST.txt` covers the bare minimum to get running; this guide goes further - where your settings actually live, how to change the port, how to update, and troubleshooting specific to the packaged build.

## Running it

1. Unzip the whole folder somewhere you can write files - Desktop or Documents is fine. Avoid `Program Files` (Windows may block it from saving settings there).
2. Double-click `ED-Rare-Router.exe` (Windows) or run `./ED-Rare-Router` (Linux). A status window opens with a few log lines - leave it open while you use the app.
3. Your browser should open automatically to `http://127.0.0.1:4321`. If it doesn't, open that address yourself.
4. To stop the app, close the status window (or Ctrl+C in it).

## First-run setup

On first run you're redirected to a short setup form - the same one described in the Setup Guide's **[Step 3: Fill out the setup form](./setup-guide.md#step-3-fill-out-the-setup-form)**. Everything is optional, but an EDSM "contact" string (your email or a URL) is recommended. There's no `npm install` or terminal step here - the form is all you need.

## Where your settings and data actually live

Not in a hidden system folder - everything is inside the `app/` folder next to the executable:

- **`app/.config.json`** - written by the setup form. Delete it to redo setup; edit it directly to change settings without going through the form again.
- **`app/data/`** - cache files (system lookups, rare-origin coordinates if you've supplied one, etc.). Safe to delete individual files or the whole folder; the app regenerates what it needs.

Back up or reset the app by copying or deleting this `app/` folder - nothing else on your machine is touched.

## Changing the port or host

By default the app binds to `127.0.0.1:4321`. If that port is taken or you want to reach it from another device, set environment variables before launching:

- `EDRR_PORT` - port number (default `4321`)
- `EDRR_HOST` - host/interface to bind (default `127.0.0.1`; use `0.0.0.0` to allow connections from other devices on your network)

On Windows (PowerShell), from inside the unzipped folder:

```powershell
$env:EDRR_PORT = "5000"
.\ED-Rare-Router.exe
```

On Linux:

```bash
EDRR_PORT=5000 ./ED-Rare-Router
```

## Updating to a new release

Each release is a fresh, self-contained folder - unzipping a new version doesn't touch an old one automatically. To carry your settings and cache forward:

1. Download and unzip the new version somewhere new.
2. Copy `app/.config.json` and `app/data/` from your old folder into the same locations in the new one.
3. Delete the old folder once you've confirmed the new one runs.

## Uninstalling

Delete the folder. The packaged build doesn't touch the Windows registry, install services, or write anywhere outside the folder you unzipped it into.

## Troubleshooting

- **"Windows protected your PC" / SmartScreen warning, or an antivirus flag** - the executable isn't code-signed (a paid certificate isn't practical for a hobby project), so Windows and some antivirus engines treat any unrecognized new binary with suspicion. This is expected for an unsigned executable, not a sign of a problem with the app itself. Click "More info" → "Run anyway" if you're comfortable doing so, given you downloaded it from the official [Releases page](https://github.com/rwharpernc/ED-Rare-Router/releases/latest).
- **"Port X is already in use by another program"** - the status window will tell you this directly. Close whatever else is using that port, or set `EDRR_PORT` to a different number (see above) and try again.
- **Browser doesn't open automatically** - open `http://127.0.0.1:4321` (or your custom port) yourself; the app is still running as long as the status window is open.
- **Status window closes immediately / "Could not find the bundled Node runtime"** - the download is likely incomplete or corrupted. Re-download the archive and unzip the whole thing again, including the `node-runtime/` folder.
- Other issues: see the [Setup Guide's Troubleshooting section](./setup-guide.md#troubleshooting) (the setup form itself behaves identically in the packaged build).

## Outgrowing the packaged build

If you want to modify the code, run it against a custom Node setup, or just prefer working from source, see the **[Developer Guide](./development.md)**.
