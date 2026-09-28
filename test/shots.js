#!/usr/bin/env node
//
// Reshoots the screenshots the READMEs use, in all six languages.
//
//   npm run build && npm run shots
//   node test/shots.js enUS jaJP     just those two
//
// The conditions are not obvious from looking at the files, which is why this
// exists rather than being redone by hand each release. Cards carry the crit /
// direct hit / critical direct hit rates and the max-hit line, and the encounter
// bar carries the limit break readout, so rates, maxhit and lb all have to be
// on. The limit break only appears on the second frame, so `interval` cannot be
// 0 -- that means "send one frame and stop".
//
// The settings window's size follows CONFIG_WINDOW in helpers.js. It is 780x940
// now; it was 500x900 before the form went to two columns, and the old shot
// stopped being a picture of the current window at that point.
//
// `name` decides which card is "you", and leaving it out costs a feature: the
// white self card simply is not in the picture. It is worth knowing why the old
// shots looked like they had no such setting -- the name handed in was the same
// string as the card's own name, so the highlight landed on a card that read
// exactly as it would have anyway.
//
// The two kinds of shot need different names. The overlay finds you by matching
// the name, so whoever is given it lights up, and the first row is the one to
// light. Setup mode does not match -- its self is fixed at the fourth row of
// the mock list -- but the card still prints characterName, so handing it the
// first row's name puts that name on screen twice.

const fs = require('fs')
const path = require('path')
const { serve, Browser } = require('./driver')

const BUILD = path.join(__dirname, '..', 'build')
const HARNESS = fs.readFileSync(path.join(__dirname, 'harness.html'), 'utf8')
const OUT = path.join(__dirname, '..', 'screenshots')

const LOCALES = ['enUS', 'jaJP', 'zhCN', 'zhHK', 'frFR', 'ptBR']

// First and fourth of the mock roster. labelSet maps enUS, ptBR and frFR onto
// the same English set, which is why three of them repeat.
const SELF = {
  enUS: 'Vivi Ornitier', ptBR: 'Vivi Ornitier', frFR: 'Vivi Ornitier',
  jaJP: 'Vivi Ornitier', zhCN: '黑魔法师阿三', zhHK: '黑魔法師阿三'
}
const SELF_SETUP = {
  enUS: 'Garnet Alexandros', ptBR: 'Garnet Alexandros',
  frFR: 'Garnet Alexandros', jaJP: 'Garnet Alexandros',
  zhCN: '光之战士', zhHK: '光之戰士'
}

// file, harness query, viewport
const SHOTS = [
  ['overlay-byrole.png', 'color=byRole&rates=1&maxhit=1&lb=1&interval=800', 1560, 160],
  ['overlay-byjob.png', 'color=byJob&rates=1&maxhit=1&lb=1&interval=800', 1560, 160],
  ['overlay-blackwhite.png', 'color=blackWhite&rates=1&maxhit=1&lb=1&interval=800', 1560, 160],
  ['overlay-6digit.png', 'color=byRole&rates=1&maxhit=1&lb=1&stress=1&interval=800', 1560, 160],
  ['setup-mode.png', 'setup=1&rates=1&maxhit=1', 1560, 240],
  ['wrap-900px.png', 'color=byRole&rates=1&maxhit=1&lb=1&interval=800', 900, 220],
  ['config.png', 'config=1', 780, 940]
]

;(async () => {
  if (!fs.existsSync(path.join(BUILD, 'index.html'))) {
    console.error('No build/index.html. Run `npm run build` first.')
    process.exit(1)
  }
  const want = process.argv.slice(2).filter(a => !a.startsWith('-'))
  const bad = want.filter(l => !LOCALES.includes(l))
  if (bad.length) {
    console.error('Unknown locale: ' + bad.join(', '))
    process.exit(1)
  }
  const locales = want.length ? want : LOCALES

  const site = await serve(BUILD, { '/harness.html': HARNESS })
  const browser = await Browser.launch()
  const base = `http://127.0.0.1:${site.port}/harness.html`
  let problems = 0

  try {
    for (const loc of locales) {
      const dir = path.join(OUT, loc)
      fs.mkdirSync(dir, { recursive: true })
      for (const [file, query, width, height] of SHOTS) {
        const who = file === 'setup-mode.png' ? SELF_SETUP[loc] : SELF[loc]
        const { problems: found } = await browser.visit(
          `${base}?locale=${loc}&name=${encodeURIComponent(who)}&${query}`, {
            width, height, settle: 3200,
            screenshot: path.join(dir, file)
          })
        const errors = found.filter(p => /error|exception/i.test(p))
        problems += errors.length
        console.log('  %s/%s %dx%d%s', loc, file.padEnd(24), width, height,
          errors.length ? '  ' + errors[0] : '')
      }
    }

    // The bit of the icon set the READMEs quote inline, kept in step with it.
    fs.copyFileSync(path.join(__dirname, '..', 'src', 'images', 'bst.png'),
      path.join(OUT, 'bst-icon.png'))
    console.log('  bst-icon.png  <- src/images/bst.png')
  } finally {
    await browser.close()
    site.close()
  }

  if (problems) {
    console.error('\n%d shot(s) logged an error.', problems)
    process.exit(1)
  }
})().catch(e => { console.error(e); process.exit(1) })
