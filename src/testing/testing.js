// Local mock data feed.
//
// Emits the same `onOverlayDataUpdate` CustomEvent that ACT's OverlayPlugin
// sends, so the overlay can be previewed in a normal browser without ACT.
//
// Enable with `?mock=1` in the URL (before the hash), e.g.
//   http://localhost:3000/?mock=1#/
// Optional knobs:
//   &mockInterval=1000   update period in ms (0 = send once)
//   &mockParty=8         how many combatants to send (1-24)

import { mockRoster, mockZoneFor, defaultConfig } from '../helpers'
import { read as readConfig } from '../configStore'

// This runs before React mounts, so there is no config prop to read from yet;
// the stored value is the same one withHelper will pick up a moment later.
// The fallback is defaultConfig's rather than a literal: an overlay nobody has
// configured would otherwise come up with its interface in one language and
// these names in another.
function storedLocale() {
  try {
    return JSON.parse(readConfig() || '{}').locale || defaultConfig.locale
  } catch (e) {
    return defaultConfig.locale
  }
}

// Per-row numbers only. Who these people are -- name, job, and the skill on
// their biggest hit -- comes from the shared roster in helpers.js, which tracks
// the interface language. The roster used to be spelled out here as a fixed
// mix of Chinese and Latin names, which is not what either service looks like:
// CN characters have Chinese names, Global characters have Latin ones.
//
// Rates are second-by-second here rather than the whole-fight totals setup mode
// shows, so these are an order of magnitude smaller on purpose.
const NUMBERS = [
  // dps,  hps, deaths
  [13890, 0, 0],
  [13150, 0, 0],
  [12480, 0, 0],
  [11620, 210, 1],
  [7310, 90, 0],
  [12940, 0, 0],
  [3980, 8760, 1],
  [11980, 640, 0],
  [12100, 0, 0],
  [11450, 0, 0],
  [10980, 0, 0],
  [11730, 320, 0]
]

function jitter(base, pct) {
  return Math.round(base * (1 + (Math.random() * 2 - 1) * pct))
}

// Jobless combatants -- pets, companions -- only reach the overlay when 显示无
// 职业单位 is on, and they take a different code path for both icon and colour.
// `mockPet=1` puts one in, named the way a Chinese client reports it so the
// English name matching genuinely misses.
// Named the way a Chinese client reports it even in the English preview: the
// point of this row is that the English name matching misses and the icon has
// to fall back, which an English name would not exercise.
const PET = ['陆行鸟', '', '喙突', 9200, 0, 0]

function buildData(seconds, size, scale, withPet, locale) {
  const cast = mockRoster(locale)
  const members = NUMBERS.slice(0, size)
    .map((n, i) => [cast[i].name, cast[i].job, cast[i].skill].concat(n))
    .concat(withPet ? [PET] : [])
  const rows = members.map(([name, job, skill, dps, hps, deaths], i) => ({
    name,
    job,
    dps: jitter(dps * scale, 0.04),
    hps: hps ? jitter(hps * scale, 0.06) : 0,
    deaths,
    // Roughly a few seconds of output. Indexing a fixed list instead put the
    // biggest hit of the fight on a healer and the smallest on the top DPS.
    maxhit: skill + '-' + Math.round(dps * 3.2)
  }))

  // The overlay ranks by insertion order, so sort by the relevant number.
  rows.sort((a, b) => Math.max(b.dps, b.hps) - Math.max(a.dps, a.hps))

  const totalDamage = rows.reduce((sum, r) => sum + r.dps * seconds, 0)
  const totalHealed = rows.reduce((sum, r) => sum + r.hps * seconds, 0)
  const Combatant = {}

  rows.forEach(r => {
    Combatant[r.name] = {
      name: r.name,
      Job: r.job,
      ENCDPS: String(r.dps),
      ENCHPS: String(r.hps),
      damage: String(r.dps * seconds),
      healed: String(r.hps * seconds),
      // ACT sends this, so the mock does too. It used to be a flat '12%' for
      // everyone, which is not a number any encounter could produce -- it had
      // a DPS with no healing at all claiming the same cut as the healer.
      'healed%': totalHealed
        ? Math.round(r.hps * seconds / totalHealed * 100) + '%'
        : '0%',
      deaths: String(r.deaths),
      'crithit%': (18 + Math.floor(Math.random() * 12)) + '%',
      DirectHitPct: (22 + Math.floor(Math.random() * 15)) + '%',
      // Crit and direct hit are independent rolls, so the joint rate is roughly
      // their product. Faking it as a third unrelated random number produced
      // previews where CDH came out above DH, which cannot happen.
      CritDirectHitPct: (5 + Math.floor(Math.random() * 8)) + '%',
      maxhit: r.maxhit
    }
  })

  // Limit break is reported as a pseudo combatant with no job.
  Combatant['Limit Break'] = {
    name: 'Limit Break',
    Job: '',
    ENCDPS: '1820',
    ENCHPS: '0',
    damage: String(1820 * seconds),
    healed: '0',
    'healed%': '0%',
    deaths: '0',
    'crithit%': '0%',
    DirectHitPct: '0%',
    maxhit: 'Limit Break-92104'
  }

  const totalDps = Math.round(totalDamage / seconds)
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return {
    isActive: 'true',
    Encounter: {
      title: mockZoneFor(locale),
      CurrentZoneName: mockZoneFor(locale),
      duration: `${mm}:${ss}`,
      damage: String(totalDamage),
      healed: String(totalHealed),
      encdps: String(totalDps),
      ENCDPS: String(totalDps),
      maxhit: 'YOU-Meteor-71203',
      DURATION: String(seconds)
    },
    Combatant
  }
}

export default function initMockData() {
  const params = new URLSearchParams(window.location.search)
  const wantsMock = Boolean(params.get('mock'))
  const backdrop = params.get('mockBackdrop')

  // The overlay is transparent, which reads as white-on-white in a plain
  // browser. On by default alongside the fake data, and available on its own
  // (`mockBackdrop=1`) to preview setup mode, which only renders when no data
  // is arriving at all.
  if (backdrop !== '0' && (wantsMock || backdrop)) {
    document.documentElement.style.background =
      'linear-gradient(140deg,#1b2330 0%,#2b3547 45%,#141a24 100%)'
  }

  if (!wantsMock) return

  const locale = storedLocale()
  const size = Math.min(24, Math.max(1, parseInt(params.get('mockParty'), 10) || 8))
  // `mockStress=1` pushes DPS/HPS into 6 digits, which is the widest the layout
  // has to survive. Keep the default realistic so the preview still looks real.
  const scale = params.get('mockStress') ? 10 : 1
  const withPet = Boolean(params.get('mockPet'))
  const interval = params.has('mockInterval')
    ? parseInt(params.get('mockInterval'), 10)
    : 1000

  let seconds = 187
  const send = () => {
    document.dispatchEvent(
      new CustomEvent('onOverlayDataUpdate', {
        detail: buildData(seconds, size, scale, withPet, locale)
      })
    )
  }

  // index.js registers its listener below this call, so the first push has to
  // wait for the current task to finish.
  setTimeout(send, 0)
  if (interval > 0) {
    setInterval(() => {
      seconds += Math.max(1, Math.round(interval / 1000))
      send()
    }, interval)
  }
}
