# Horizoverlay Reborn

English · [简体中文](README_zhCN.md) · [正體中文](README_zhHK.md) · [Português](README_ptBR.md) · [Français](README_frFR.md)

A horizontal damage meter overlay for Final Fantasy XIV, showing the whole party's DPS and HPS in one row of cards. A rebuild of [Horizoverlay](https://github.com/bsides/horizoverlay).

![](screenshots/enUS/overlay-byrole.png)

## Install

1. In OverlayPlugin, create a new overlay of type MiniParse
2. Set its URL to:

   ```
   https://garfieldzasv.github.io/horizoverlay-reborn/
   ```

3. Turn off **Enable clickthru** for this overlay, or right-click will not open the settings
4. Right-click the overlay to open the settings

If you would rather not depend on the network, grab the zip from [Releases](https://github.com/garfieldzasv/horizoverlay-reborn/releases) and unpack it. A recent OverlayPlugin -- the one the all-in-one ACT packages ship -- has a `...` button beside the URL field: click it and pick `index.html` out of the folder, no path to work out. On an older build, type the full `file://` path yourself. Both are the same build as the hosted page, though the hosted one keeps your settings more reliably, because browsers block `localStorage` on `file://` paths.

Window width: a row of 4 needs 759px, 6 needs 1138px, 8 needs 1517px, 12 needs 2276px, 24 needs 4551px. Cards wrap when they do not fit.

ACTWebSocket works too, just append `?HOST_PORT=ws://127.0.0.1:10501/` to the URL. Use the local copy for that; a page served over https may not be allowed to open a plain `ws://` connection.

## Features

Right-click to open the settings. Everything takes effect immediately and saves itself.

<img src="screenshots/enUS/config.png" width="420">

* Six interface languages: English, Japanese, Portuguese, Simplified Chinese, Traditional Chinese, French
* Three color themes: by role, black & white, and by role in detail
* The right half of a card is DPS; the left half switches between HPS, crit rate, direct hit rate, crit direct hit rate and the job code
* Two share bars, one for DPS and one for HPS
* Rank number, job icon, max hit and highlight, each toggled separately
* An encounter bar with duration, total DPS and, if you want it, the damage limit break contributed
* 1 to 24 combatants, with an option to include chocobos, egis and other jobless units
* Your own card pinned to white; you can also show only yourself, or blur everyone else's name
* Zoom from 0.5x to 2x
* Setup mode, a mock-data preview so you can set things up outside a fight
* A Discord webhook that posts the fight to your channel, optionally with the names replaced by Player 1, 2, 3

The detailed theme, one color per sub-role:

![](screenshots/enUS/overlay-byjob.png)

Black & white:

![](screenshots/enUS/overlay-blackwhite.png)

Setup mode:

![](screenshots/enUS/setup-mode.png)

## What changed from the original

* A bundled monospaced font, so the digits stop jittering as DPS refreshes
* Cards sized for six-digit numbers
* Cards wrap instead of being silently cut off
* The damage percentage text is gone, replaced by a second bar for healing share
* The left half is selectable; the original only offered HPS
* Cards, banners and share bars line their slanted edges up automatically
* An extra theme that splits DPS into melee, ranged and caster
* 59 job icons, including Beastmaster <img src="screenshots/bst-icon.png" width="18"> from patch 7.56
* Pets use a summon icon in neutral grey, instead of a disconnected-network icon in black
* A rebuilt settings page
* No third-party requests and no analytics; fonts and icons are bundled (the original's hosted page carries Google Analytics)

The original, with a proportional font and narrower cards:

![](screenshots/upstream-1300px.png)

Six digits fit now:

![](screenshots/enUS/overlay-6digit.png)

Same 900px, same eight players. The original drops the first and last card:

![](screenshots/upstream-900px-clipped.png)

Now it wraps onto two rows:

![](screenshots/enUS/wrap-900px.png)

## FAQ

**Right-click does nothing.** Check that Enable clickthru is off. You can also append `#/config` to the URL to open the settings directly.

**Settings are lost on restart.** `localStorage` is blocked on a `file://` path. Use the hosted URL, or serve the unpacked directory over local HTTP.

**A percentage reads 0% for everyone.** Your build of ACT does not provide that field. Pick another one.

**A job icon shows a carbuncle.** That unit's name did not match any known pet name. Nothing breaks.

For anything else, please [open an issue](https://github.com/garfieldzasv/horizoverlay-reborn/issues).

## Building

You need Node.js.

```bash
npm install
npm run build
```

For development use `npm start` and add `?mock=1#/` to the URL for mock data. [DEVLOG.md](DEVLOG.md) covers adding a color theme and where the card geometry and type scale live.

## License and credits

Derived from [bsides/horizoverlay](https://github.com/bsides/horizoverlay), Copyright 2017 Rafael "BSIDES" Pereira, Apache-2.0, and released under the same license. [NOTICE](NOTICE) lists what changed.

The bundled Maple Mono CN comes from [subframe7536/maple-font](https://github.com/subframe7536/maple-font) under the SIL Open Font License 1.1, repacked as woff2 and otherwise unmodified.

Job icons are derived from FINAL FANTASY XIV artwork. FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd. This project is unaffiliated with and unendorsed by Square Enix.
