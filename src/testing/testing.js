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

const PARTY = [
  // name,            job,   role,   dps,  hps,  deaths
  ['光之战士', 'PLD', 'tank', 6820, 320, 0],
  ['Yshtola Rhul', 'DRK', 'tank', 7140, 180, 0],
  // The longest name FFXIV allows, carrying a death: this is the case where
  // the name line runs out of room, and the fixture should exercise it.
  ['Alphinaud Leveilleur', 'WHM', 'healer', 4210, 9840, 1],
  ['星极大魔法使', 'AST', 'healer', 3980, 8760, 1],
  ['Zidane Tribal', 'NIN', 'dps', 12480, 0, 0],
  ['龙骑士小明', 'DRG', 'dps', 13150, 0, 0],
  ['Vivi Ornitier', 'BLM', 'dps', 13890, 0, 0],
  ['Freya Crescent', 'BRD', 'dps', 11620, 210, 0],
  ['召唤宝宝', 'SMN', 'dps', 12940, 0, 0],
  ['Garnet Alexandros', 'RDM', 'dps', 11980, 640, 0],
  ['Adelbert Steiner', 'GNB', 'tank', 7310, 90, 0],
  ['Quina Quen', 'SGE', 'healer', 4460, 9210, 0]
]

const MAXHITS = [
  '天辉-38921',
  '深恶痛绝-42210',
  'Meteor-71203',
  '背刺-29104',
  '苍天龙炎冲-33180'
]

function jitter(base, pct) {
  return Math.round(base * (1 + (Math.random() * 2 - 1) * pct))
}

// Jobless combatants -- pets, companions -- only reach the overlay when 显示无
// 职业单位 is on, and they take a different code path for both icon and colour.
// `mockPet=1` puts one in, named the way a Chinese client reports it so the
// English name matching genuinely misses.
const PET = ['陆行鸟', '', 'other', 9200, 0, 0]

function buildData(seconds, size, scale, withPet) {
  const members = PARTY.slice(0, size).concat(withPet ? [PET] : [])
  const rows = members.map(([name, job, role, dps, hps, deaths], i) => ({
    name,
    job,
    role,
    dps: jitter(dps * scale, 0.04),
    hps: hps ? jitter(hps * scale, 0.06) : 0,
    deaths,
    maxhit: MAXHITS[i % MAXHITS.length]
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
      'healed%': '12%',
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
      title: '绝欧米茄验证战',
      CurrentZoneName: '绝欧米茄验证战',
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
        detail: buildData(seconds, size, scale, withPet)
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
