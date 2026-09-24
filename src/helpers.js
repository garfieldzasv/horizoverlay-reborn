import React, { Component } from 'react'
import { shape, bool, string } from 'prop-types'
import syncSkewAlign from './skewAlign'
import { read as readConfig, write as writeConfig } from './configStore'

export const defaultConfig = {
  showSetup: false,
  color: 'byRole',
  characterName: 'YOU',
  showRank: true,
  showJobIcon: true,
  leftStat: 'hps',
  showHighlight: false,
  showSelf: true,
  showMaxhit: false,
  showRates: false,
  showDeaths: true,
  showDuration: true,
  showTotalDps: true,
  showLimitBreak: false,
  showDamageBar: true,
  showHealBar: true,
  showDiscord: false,
  discordAnonymous: false,
  showJobless: false,
  enableSoloMode: false,
  enableStreamerMode: false,
  zoom: '1',
  discord: '',
  maxCombatants: 8,
  locale: 'zhCN'
}

// Narrow enough that the settings page lays out in a single column, and as tall
// as fits on a 1080p screen -- the whole form is about 1300px tall at this width.
const CONFIG_WINDOW = { width: 500, height: 900 }

// Declaring as a function makes it hoisted and don't mess with constructor from React.Component
export function withHelper({ WrappedComponent, isConfig = false }) {
  return class withConfig extends Component {
    static defaultProps = {
      config: defaultConfig
    }
    static propTypes = {
      config: shape({
        showSetup: bool.isRequired,
        color: string.isRequired,
        characterName: string.isRequired,
        showDuration: bool.isRequired,
        showTotalDps: bool.isRequired,
        leftStat: string.isRequired,
        showJobIcon: bool.isRequired,
        showRank: bool.isRequired,
        showDamageBar: bool.isRequired,
        showHealBar: bool.isRequired,
		showJobless: bool.isRequired,
        zoom: string.isRequired
      })
    }
    state = { ...this.props }
    componentWillMount() {
      window.addEventListener('storage', this.updateState, false)
      this.updateState()
    }
    componentWillReceiveProps(nextProps) {
      this.updateState()
    }
    componentDidMount() {
      syncSkewAlign()
    }
    componentDidUpdate() {
      syncSkewAlign()
    }
    componentWillUnmount() {
      window.removeEventListener('storage', this.updateState)
    }
    updateState = () => {
      const stored = readConfig()
      // Merge over the defaults rather than replacing them: a config saved by an
      // older build is missing every option added since, and those would read as
      // undefined -- i.e. silently off -- instead of taking their default.
      const config = { ...this.props.config, ...(stored ? JSON.parse(stored) : {}) }
      // The left cell used to be a yes/no on HPS. Carry that choice over rather
      // than silently resetting it to HPS for anyone who had turned it off.
      if (config.leftStat === undefined) {
        config.leftStat = config.showHps === false ? 'job' : 'hps'
      }
      const serialised = JSON.stringify(config)
      // Only write when the merge actually changed something. The config window
      // and the overlay both listen for 'storage', so an unconditional write
      // would have them waking each other in a loop.
      if (serialised !== stored) writeConfig(serialised)
      this.setState({ config })
    }
    openConfig = e => {
      // right-click is how the settings open, so the browser's own menu would
      // only ever be in the way here
      if (e) e.preventDefault()

      // './#/config' only landed on the page because a server was mapping './'
      // to index.html. From a file:// path it resolves to the directory, which
      // is why right-click did nothing once this was loaded into ACT.
      const url = `${window.location.href.split('#')[0]}#/config`
      const windowFeatures =
        'menubar=no,location=no,resizable=yes,scrollbars=yes,status=no' +
        `,width=${CONFIG_WINDOW.width},height=${CONFIG_WINDOW.height}`

      let win = null
      try {
        win = window.open(url, 'Horizoverlay Config', windowFeatures)
      } catch (e) {
        win = null
      }

      // ACT's CEF blocks popups in most setups and hands back null, and the old
      // code called .focus() on it unguarded -- a TypeError that took the whole
      // handler down. Fall back to this window; Config grows a way back when it
      // sees it has no opener.
      if (!win) {
        window.location.hash = '#/config'
        return
      }

      this.setState({ isConfigOpen: true })
      this.configWindow = win
      win.focus()
      win.onbeforeunload = () => {
        this.setState({ isConfigOpen: false })
        this.configWindow = null
      }
    }
    render = () => {
      const { Combatant, Encounter, isActive } = this.props
      return (
        <WrappedComponent
          {...this.state}
          Combatant={Combatant}
          Encounter={Encounter}
          isActive={isActive}
          openConfig={this.openConfig}
          handleReset={this.updateState}
        />
      )
    }
  }
}

// A `share(part, total)` used to live here, dividing a combatant's total by the
// encounter's to get the width of a bar and the percentage in the report. It is
// gone: ACT sends `damage%` and `healed%` already worked out, and the overlay
// displays what the parser reports rather than recomputing it. See the note in
// CombatantHorizontal.

export function getRandom(min, max) {
  const first = Math.ceil(min)
  const last = Math.floor(max)
  return Math.floor(Math.random() * (last - first + 1)) + first
}

// A row gets exactly one of these as a `job-*` class, whatever the theme. Base
// classes are listed alongside the jobs they grow into, and pets follow their
// owner: the scholar's fairies heal, the summoner's egis cast, the machinist's
// turrets shoot.
export const jobRoles = {
  tank: ['pld', 'war', 'drk', 'gnb', 'gla', 'mrd'],
  healer: ['whm', 'sch', 'ast', 'sge', 'cnj', 'eos', 'selene'],
  melee: ['mnk', 'drg', 'nin', 'sam', 'rpr', 'vpr', 'bst', 'pgl', 'pug', 'lnc', 'rog', 'chocobo'],
  ranged: ['brd', 'mch', 'dnc', 'arc', 'rook', 'bishop'],
  caster: ['blm', 'smn', 'rdm', 'pct', 'blu', 'thm', 'acn', 'carbuncle', 'garuda', 'ifrit', 'titan']
}

// Colour themes. Adding one: append an entry here, add a matching class block
// at the bottom of src/css/overlay.css, and a label under `config` in every
// locale. Nothing else has to change.
// What the left-hand cell on a card shows. HPS is close to zero for everyone
// but healers, which left that half of most cards looking empty -- crit and
// direct hit are populated for every job.
export const leftStats = [
  { value: 'hps', label: 'toggleOption3' },
  { value: 'crit', label: 'leftStatCrit' },
  { value: 'dhit', label: 'leftStatDhit' },
  { value: 'cdh', label: 'leftStatCdh' },
  { value: 'job', label: 'leftStatJob' }
]

export const themes = [
  { value: 'byRole', label: 'themeOption1' },
  { value: 'blackWhite', label: 'themeOption2' },
  { value: 'byJob', label: 'themeOption3' }
]

// A language picker that renames its own options is a trap: pick the wrong one
// and the way back is a list you can no longer read. So these labels are
// endonyms -- each language written as its own speakers write it -- and they
// are literals rather than locale keys, which is what makes the list identical
// in all five languages.
export const locales = [
  { value: 'enUS', label: 'English' },
  { value: 'ptBR', label: 'Português' },
  { value: 'zhCN', label: '简体中文' },
  { value: 'zhHK', label: '正體中文' },
  { value: 'frFR', label: 'Français' }
]

export const otherIcons = [
  'lb',
  'chocobo',
  'bishop',
  'rook',
  'eos',
  'selene',
  'carbuncle',
  'garuda',
  'ifrit',
  'titan'
]

// Feeds the encounter bar in setup mode. Totals are derived from mockRows below
// so the two can never drift apart.
const mockTotalDps = () => mockRows.reduce((sum, r) => sum + r.dps, 0)
const mockTotalHps = () => mockRows.reduce((sum, r) => sum + r.hps, 0)

// A full alliance, because Max Combatants goes up to 24 and the preview has to
// to show whatever that is set to.
//
// Ranks 1-8 are deliberately not the top eight by DPS: eight cards is the common
// case, so that slice carries one of everything worth looking at -- all five
// roles, the self card, both limited jobs, and a healer (the only row whose
// highlight leans the other way). Ranks 9-24 just fill the alliance out.
const mockRows = [
  { rank: 1, job: 'blm', jobClass: 'Blm', jobFull: 'Black Mage', jobRole: 'job-caster', isSelf: false, dps: 138420, hps: 0, hit: 284910 },
  { rank: 2, job: 'drg', jobClass: 'Drg', jobFull: 'Dragoon', jobRole: 'job-melee', isSelf: false, dps: 132905, hps: 0, hit: 261340 },
  { rank: 3, job: 'mch', jobClass: 'Mch', jobFull: 'Machinist', jobRole: 'job-ranged', isSelf: false, dps: 127613, hps: 0, hit: 198720 },
  { rank: 4, job: 'brd', jobClass: 'Brd', jobFull: 'Bard', jobRole: 'job-ranged', isSelf: true, dps: 119847, hps: 0, hit: 152060 },
  { rank: 5, job: 'pld', jobClass: 'Pld', jobFull: 'Paladin', jobRole: 'job-tank', isSelf: false, dps: 72104, hps: 4820, hit: 98450 },
  { rank: 6, job: 'bst', jobClass: 'Bst', jobFull: 'Beastmaster', jobRole: 'job-melee', isSelf: false, dps: 69538, hps: 0, hit: 91270 },
  { rank: 7, job: 'ast', jobClass: 'Ast', jobFull: 'Astrologian', jobRole: 'job-healer', isSelf: false, dps: 41258, hps: 102843, hit: 58210 },
  { rank: 8, job: 'blu', jobClass: 'Blu', jobFull: 'Blue Mage', jobRole: 'job-caster', isSelf: false, dps: 39760, hps: 4380, hit: 64380 },
  { rank: 9, job: 'sam', jobClass: 'Sam', jobFull: 'Samurai', jobRole: 'job-melee', isSelf: false, dps: 38940, hps: 0, hit: 248760 },
  { rank: 10, job: 'nin', jobClass: 'Nin', jobFull: 'Ninja', jobRole: 'job-melee', isSelf: false, dps: 37820, hps: 0, hit: 231450 },
  { rank: 11, job: 'mnk', jobClass: 'Mnk', jobFull: 'Monk', jobRole: 'job-melee', isSelf: false, dps: 36710, hps: 0, hit: 204180 },
  { rank: 12, job: 'rdm', jobClass: 'Rdm', jobFull: 'Red Mage', jobRole: 'job-caster', isSelf: false, dps: 35490, hps: 2180, hit: 176030 },
  { rank: 13, job: 'smn', jobClass: 'Smn', jobFull: 'Summoner', jobRole: 'job-caster', isSelf: false, dps: 34260, hps: 0, hit: 269340 },
  { rank: 14, job: 'dnc', jobClass: 'Dnc', jobFull: 'Dancer', jobRole: 'job-ranged', isSelf: false, dps: 33100, hps: 3260, hit: 141870 },
  { rank: 15, job: 'war', jobClass: 'War', jobFull: 'Warrior', jobRole: 'job-tank', isSelf: false, dps: 32040, hps: 4210, hit: 96180 },
  { rank: 16, job: 'drk', jobClass: 'Drk', jobFull: 'Dark Knight', jobRole: 'job-tank', isSelf: false, dps: 30980, hps: 3915, hit: 91270 },
  { rank: 17, job: 'gnb', jobClass: 'Gnb', jobFull: 'Gunbreaker', jobRole: 'job-tank', isSelf: false, dps: 29870, hps: 3680, hit: 88940 },
  { rank: 18, job: 'pld', jobClass: 'Pld', jobFull: 'Paladin', jobRole: 'job-tank', isSelf: false, dps: 28750, hps: 4400, hit: 85210 },
  { rank: 19, job: 'war', jobClass: 'War', jobFull: 'Warrior', jobRole: 'job-tank', isSelf: false, dps: 27640, hps: 3990, hit: 83670 },
  { rank: 20, job: 'whm', jobClass: 'Whm', jobFull: 'White Mage', jobRole: 'job-healer', isSelf: false, dps: 26530, hps: 98165, hit: 64380 },
  { rank: 21, job: 'sch', jobClass: 'Sch', jobFull: 'Scholar', jobRole: 'job-healer', isSelf: false, dps: 25420, hps: 95320, hit: 51290 },
  { rank: 22, job: 'sge', jobClass: 'Sge', jobFull: 'Sage', jobRole: 'job-healer', isSelf: false, dps: 24310, hps: 93110, hit: 49870 },
  { rank: 23, job: 'ast', jobClass: 'Ast', jobFull: 'Astrologian', jobRole: 'job-healer', isSelf: false, dps: 23200, hps: 90480, hit: 47630 },
  { rank: 24, job: 'whm', jobClass: 'Whm', jobFull: 'White Mage', jobRole: 'job-healer', isSelf: false, dps: 22090, hps: 88240, hit: 46180 },
  // Filtered out of the list by name -- kept so the limit break share is real
  // and so the filter itself stays exercised.
  { rank: 25, job: '', jobClass: '', jobFull: '', jobRole: '', isSelf: false, dps: 18200, hps: 0, hit: 92104 }
]

export const mockEncounter = {
  title: 'Encounter',
  duration: '05:23',
  encdps: String(mockTotalDps()),
  ENCDPS: mockTotalDps().toFixed(2),
  enchps: String(mockTotalHps()),
  ENCHPS: mockTotalHps().toFixed(2),
  damage: String(mockTotalDps() * 323),
  healed: String(mockTotalHps() * 323),
  maxhit: 'Vivi Ornitier-Meteor-284910',
  // Same shape the live overlay builds: { damage, share }. It was a bare
  // number, which setup mode spread straight onto the readout -- truthy, so
  // the banner appeared, with both fields undefined, so it read "LB" and
  // nothing else. The live path was fine; only the preview was wrong.
  // Setup mode does not go through ACT, so this stands in for the `damage%` the
  // live path reads off the combatant. Truncated rather than rounded, because
  // that is what ACT does and the preview should not show a percentage the real
  // thing would never print. mockTotalDps already counts limit break, so the
  // denominator matches the encounter total ACT reports.
  limitBreak: {
    damage: String(18200 * 323),
    share: Math.floor(18200 / mockTotalDps() * 100) + '%'
  }
}

// Chinese names run to the 6-character maximum and skill names to 4, which is
// the widest a CN character ID and skill name can be in game. ACT always reports
// limit break in English, so that row keeps its English name in both sets.
// Order matches mockRows.
// Which set of fake names and skills a locale gets. Not one set per locale:
// what matters is the client the player is actually looking at, because that is
// what ACT reads its log from.
//
// Chinese players are on the CN service, whose client is Simplified; Traditional
// has no client of its own, so the Traditional set is that same list converted
// -- the names a Traditional reader recognises, not a different game. Everyone
// else is on Global and
// sees English, French included: there is no French service, so a French player
// is reading the same English log as everyone else on Global.
const labelSet = {
  enUS: 'en',
  ptBR: 'en',
  frFR: 'en',
  zhCN: 'zhCN',
  zhHK: 'zhHK'
}

const mockLabels = {
  zhCN: [
    ['黑魔法师阿三', '万象灵炎'],
    ['龙骑士小明', '苍天龙炎'],
    ['机工士小钢', '回转飞锯'],
    ['光之战士', '死亡宣告'],
    ['骑士铁壁', '圣盾阵'],
    ['驯兽师阿狼', '野兽咆哮'],
    ['星极大魔法使', '天辉'],
    ['青魔法师小蓝', '月之笛'],
    ['武士一刀斋', '照破'],
    ['忍者影', '水遁之术'],
    ['武僧铁拳', '争雷'],
    ['赤魔法师小红', '赤复活'],
    ['召唤师小绿', '死星核爆'],
    ['舞者踏歌', '强音之剑'],
    ['战士怒涛', '原初解放'],
    ['暗黑骑士小黑', '血溅五步'],
    ['绝枪战士铁', '血壤'],
    ['骑士坚盾', '神圣阵'],
    ['战士裂空', '原初之魂'],
    ['白魔导师小花', '炽天迴向'],
    ['学者书虫', '秽浊之灾'],
    ['贤者小贤', '智识之灵'],
    ['占星术士小星', '大宇宙'],
    ['白魔法师小白', '天赐祝福'],
    ['Limit Break', 'Limit Break']
  ],
  zhHK: [
    ['黑魔法師阿三', '萬象靈炎'],
    ['龍騎士小明', '蒼天龍炎'],
    ['機工士小鋼', '迴轉飛鋸'],
    ['光之戰士', '死亡宣告'],
    ['騎士鐵壁', '聖盾陣'],
    ['馴獸師阿狼', '野獸咆哮'],
    ['星極大魔法使', '天輝'],
    ['青魔法師小藍', '月之笛'],
    ['武士一刀齋', '照破'],
    ['忍者影', '水遁之術'],
    ['武僧鐵拳', '爭雷'],
    ['赤魔法師小紅', '赤復活'],
    ['召喚師小綠', '死星核爆'],
    ['舞者踏歌', '強音之劍'],
    ['戰士怒濤', '原初解放'],
    ['暗黑騎士小黑', '血濺五步'],
    ['絕槍戰士鐵', '血壤'],
    ['騎士堅盾', '神聖陣'],
    ['戰士裂空', '原初之魂'],
    ['白魔導師小花', '熾天迴向'],
    ['學者書蟲', '穢濁之災'],
    ['賢者小賢', '智識之靈'],
    ['占星術士小星', '大宇宙'],
    ['白魔法師小白', '天賜祝福'],
    ['Limit Break', 'Limit Break']
  ],
  en: [
    ['Vivi Ornitier', 'Meteor'],
    ['Freya Crescent', "Rei's Wind"],
    ['Cid Fabool', 'Chain Saw'],
    ['Garnet Alexandros', 'Alexander'],
    ['Adelbert Steiner', 'Power Break'],
    ['Amarant Coral', 'Beast Roar'],
    ['Eiko Carol', 'Holy'],
    ['Quina Quen', 'Frog Drop'],
    ['Hien Rijin', 'Midare Setsugekka'],
    ['Yugiri Mistwalker', 'Hyoton'],
    ['Lyse Hext', 'Riddle of Fire'],
    ['Arenvald Lentinus', 'Verholy'],
    ['Ryne Waters', 'Deathflare'],
    ['Sadu Heltoha', 'Tillana'],
    ['Curious Gorge', 'Inner Release'],
    ['Sidurgu Orl', 'Bloodspiller'],
    ['Thancred Waters', 'Gnashing Fang'],
    ['Haurchefant Greystone', 'Holy Sheltron'],
    ['Bremondt', 'Primal Rend'],
    ['Yshtola Rhul', 'Afflatus Misery'],
    ['Alisaie Leveilleur', 'Broil'],
    ['Krile Baldesion', 'Pneuma'],
    ['Urianger Augurelt', 'Macrocosmos'],
    ['Minfilia Warde', 'Glare'],
    ['Limit Break', 'Limit Break']
  ]
}

// What a pet looks like once it reaches the overlay: no role, so it paints the
// neutral grey, and the carbuncle icon -- which is what CombatantHorizontal
// falls back to when it cannot match the name against otherIcons. `job` carries
// the icon here because setup mode looks it up directly, with none of the live
// path's name matching.
export function getMockPet(locale, rank) {
  const set = labelSet[locale] || 'en'
  const chocobo = { zhCN: '陆行鸟', zhHK: '陸行鳥', en: 'Chocobo' }
  const beak = { zhCN: '喙突', zhHK: '喙突', en: 'Choco Beak' }
  return {
    isSelf: false,
    name: chocobo[set],
    jobClass: '',
    jobFull: 'Chocobo',
    // `job` only picks the icon here; the text is its own field, because a pet
    // has no job code and borrowing this one printed CARBUNCLE on the card.
    job: 'carbuncle',
    jobLabel: 'PET',
    jobRole: '',
    rank,
    dps: '9200',
    edps: '9200.00',
    hps: '0',
    ehps: '0.00',
    isHealing: false,
    crit: '12%',
    dhit: '9%',
    cdh: '2%',
    deaths: '0',
    damagePct: '1',
    healPct: '0',
    maxhit: beak[set] + '-14820'
  }
}

// The cast, without any of the layout-mode shaping. Setup mode and the live
// mock feed both draw from this, so the two previews show the same party
// rather than two unrelated ones. Limit break is the last row and is left to
// the caller: the live feed reports it as a pseudo-combatant, setup mode folds
// it into the encounter bar.
export function mockRoster(locale) {
  const labels = mockLabels[labelSet[locale] || 'en']
  return mockRows.map((row, i) => ({
    name: labels[i][0],
    skill: labels[i][1],
    job: row.job.toUpperCase()
  }))
}

// The zone the fake encounter claims to be in. Setup mode has its own from the
// locale file (a striking dummy); this is the live feed's, where a real fight
// name reads more like the thing being previewed.
export const mockZone = {
  en: 'The Omega Protocol',
  zhCN: '绝欧米茄验证战',
  zhHK: '絕歐米茄驗證戰'
}

export function mockZoneFor(locale) {
  return mockZone[labelSet[locale] || 'en']
}

export function getMockData(locale) {
  const labels = mockLabels[labelSet[locale] || 'en']
  // Shares are derived, not written down: hand-maintained percentages have to be
  // rebalanced every time a row changes, and had already drifted off 100 twice.
  const totalDps = mockTotalDps()
  const totalHps = mockTotalHps()
  return mockRows.map((row, i) => {
    const [name, skill] = labels[i]
    return {
      isSelf: row.isSelf,
      name,
      jobClass: row.jobClass,
      jobFull: row.jobFull,
      job: row.job,
      jobLabel: row.job.toUpperCase(),
      jobRole: row.jobRole,
      rank: row.rank,
      dps: String(row.dps),
      edps: row.dps.toFixed(2),
      hps: String(row.hps),
      ehps: row.hps.toFixed(2),
      isHealing: row.jobRole === 'job-healer',
      crit: 18 + ((row.rank * 7) % 16) + '%',
      dhit: 22 + ((row.rank * 11) % 19) + '%',
      cdh: 6 + ((row.rank * 5) % 9) + '%',
      // Two of the eight, because the marker earns its place by being rare --
      // a preview where every card carries one does not show that.
      deaths: String(row.rank === 3 ? 2 : row.rank === 7 ? 1 : 0),
      damagePct: String(Math.round((row.dps / totalDps) * 100)),
      healPct: String(totalHps ? Math.round((row.hps / totalHps) * 100) : 0),
      maxhit: skill + '-' + row.hit
    }
  })
}
