import React, { Component } from 'react'
import { bool, string, number, object, oneOfType } from 'prop-types'
import { jobRoles, otherIcons } from './helpers'
var images = require.context('./images', false, /\.png$/)

DataWrapper.propTypes = {
  text: oneOfType([string, number]).isRequired,
  label: string,
  relevant: oneOfType([bool, string, number]).isRequired
}
DataText.propTypes = {
  type: string.isRequired,
  show: bool,
  data: object
}
ShareBars.propTypes = {
  damage: string,
  heal: string,
  showDamage: bool,
  showHeal: bool
}

export default class CombatantHorizontal extends Component {
  static propTypes = {
    encounterDamage: oneOfType([string, number]).isRequired,
    encounterHealed: oneOfType([string, number]),
    rank: number,
    data: object.isRequired,
    config: object.isRequired,
    isSelf: bool.isRequired
  }
  render() {
    const { config, data, isSelf } = this.props
    const order = this.props.rank
    const jobName = data.Job || 'WHO?'
    const name = data.name.toLowerCase()
    let jobStyleClass, jobIcon, damageWidth

    // don't need to render this component if this is a limit break
    if (!data.Job && name === 'limit break') return null

    // Also don't need to render if the player is in solo mode and this isn't the player's info
    if (!isSelf && config.enableSoloMode) return null

    // Role class, always. An unrecognised job leaves it empty rather than
    // undefined, which used to end up in the class list verbatim.
    jobStyleClass = ''
    let roleName = ''
    for (const role in jobRoles) {
      if (jobRoles[role].indexOf(data.Job.toLowerCase()) >= 0) roleName = role
      if (data.Job === '') {
        for (const job of jobRoles[role]) {
          if (name.indexOf(job) >= 0) roleName = role
        }
      }
    }
    if (roleName) jobStyleClass = ` job-${roleName}`

    // Share of the encounter's damage and of its healing. ACT can report either
    // total as 0 or absent before anything has landed, so guard the divide.
    damageWidth = share(data.damage, this.props.encounterDamage)
    const healWidth = share(data.healed, this.props.encounterHealed)

    // Job icon
    if (config.showJobIcon) {
      jobIcon = './'
      if (data.Job === '') {
        // Pets and other jobless combatants are only identifiable by name, and
        // otherIcons is an English list -- on a Chinese client ACT reports 陆行鸟,
        // 宝石兽 and friends, none of which match. The fallback used to be the
        // error icon, which read as "something is broken" rather than "this is a
        // pet". A carbuncle is at least the right kind of thing.
        let newIcon = 'carbuncle'
        for (const otherIcon of otherIcons) {
          if (name.indexOf(otherIcon) >= 0) newIcon = otherIcon
        }
        jobIcon += newIcon
      } else {
        jobIcon += data.Job.toLowerCase()
      }
      try {
        jobIcon = images(`${jobIcon}.png`)
      } catch (e) {
        console.error(e)
        jobIcon = images('./empty.png')
      }
    }

    // Character name (self, instead of 'YOU')
    const characterName = isSelf ? config.characterName : data.name

    // Which half of the band gets the emphasis is the role's call. It used to
    // be `data.ENCHPS > data.ENCDPS`, but ACT hands those over as strings, so
    // that was a lexicographic compare: "2169" > "113605" is true, and a DPS
    // with any healing at all got flagged as a healer.
    // Only meaningful while the left cell is HPS: that is the one case where a
    // healer's important number sits on the left and the emphasis should flip.
    const isHealing = config.leftStat === 'hps' && roleName === 'healer'

    let maxhit
    if (data.maxhit) maxhit = data.maxhit.replace(/-([^-]*)$/, ": $1")
    return (
      <div
        className={`row ${data.Job}${jobStyleClass}${
          isSelf && config.showSelf ? ' self' : ''
        }`}
        style={{ order }}
      >
        <div className="name">
          {/* A hidden copy of the death slot, balancing it so the name stays
              centred on the card. Paired with it: both appear, or neither. */}
          {config.showDeaths && <DeathMark deaths={data.deaths} pad />}
          {config.showRank ? (
            <span className="rank">{`${this.props.rank}. `}</span>
          ) : (
            ''
          )}
          <span className={`character-name ${ !isSelf && config.enableStreamerMode ? 'streamer-mode' : '' }`}>{characterName}</span>
          {config.showDeaths && <DeathMark deaths={data.deaths} />}
        </div>
        <div
          className={`data-items${config.showHighlight ? ' highlight' : ''}${
            isHealing ? ' inverse' : ''
          }`}
        >
          {jobIcon && <img src={jobIcon} className="job" alt={jobName} />}
          <DataText type={config.leftStat} isHealing={isHealing} {...data} />
          <DataText type="dps" isHealing={isHealing} {...data} />
        </div>
        <ShareBars
          damage={damageWidth}
          heal={healWidth}
          showDamage={config.showDamageBar}
          showHeal={config.showHealBar}
        />
        {config.showRates && (
          <RateLine
            crit={data['crithit%']}
            dhit={data.DirectHitPct}
            cdh={data.CritDirectHitPct || data.DirectCritHitPct}
          />
        )}
        <div className="maxhit">{config.showMaxhit && maxhit}</div>
      </div>
    )
  }
}

function share(part, total) {
  const whole = parseFloat(total)
  if (!whole) return '0%'
  return `${parseInt((part / whole) * 100, 10)}%`
}

// Both bars use the same classes on purpose -- they are the same bar, one for
// damage dealt and one for healing done, stacked in that order.
function ShareBars({ damage, heal, showDamage, showHeal }) {
  if (!showDamage && !showHeal) return null
  return (
    <div>
      {showDamage && (
        <div className="damage-percent-bg">
          <div className="damage-percent-fg" style={{ width: damage }} />
        </div>
      )}
      {showHeal && (
        <div className="damage-percent-bg">
          <div className="damage-percent-fg" style={{ width: heal }} />
        </div>
      )}
    </div>
  )
}

// ACT usually hands the rates over with their % already attached, but not every
// build does, and a line reading `35CRIT` invites being read as a count rather
// than a rate. Normalising here keeps the three columns saying the same thing.
function pct(value) {
  if (value === undefined || value === null || value === '') return '0%'
  const s = String(value)
  return s.endsWith('%') ? s : s + '%'
}

// Crit, direct hit and crit direct hit, on one line under the bars. Same
// grammar as the band above it -- value in the small size, unit in the label
// size -- so it reads as part of the card rather than as a footnote. Separated
// by spacing alone: a middot between each pair costs 19px, which is most of
// what the three % signs need, and buys nothing.
export function RateLine({ crit, dhit, cdh }) {
  return (
    <div className="rates">
      <span>
        {pct(crit)}
        <span className="label">CRIT</span>
      </span>
      <span>
        {pct(dhit)}
        <span className="label">DH</span>
      </span>
      <span>
        {pct(cdh)}
        <span className="label">CDH</span>
      </span>
    </div>
  )
}

// Deaths are an event, not a rate, and in most fights most people have none,
// so a permanent `死:0` on every card would be noise. Nothing is drawn at zero.
// The box is still rendered though: it is the right-hand third of the name
// line, and an equally flexed pad holds the left-hand third, which is what
// keeps the name on the card's centre line whether or not anyone died.
//
// Written in the card's own grammar -- a value with a label-sized unit after
// it, the same construction as `23%CRIT` above and `127613 DPS` in the band.
// The unit is DTH and not D, because a label-sized D beside a digit reads as a
// zero: `2D` becomes `20` in a screenshot, and three letters cannot. Not DEATH
// either -- that overruns the name line, which has nothing to spare once a
// name is long.
// `pad` renders the same box, hidden, on the other side of the name. Balancing
// it with an empty span did not hold: this box floors at its own min-content --
// its padding when empty, its text when not -- and an empty pad floors at zero,
// so the two sides were never equal and the name sat about 2px left of centre
// whatever the count was. A hidden copy has the same intrinsic width by
// construction, for every count and every name length.
export function DeathMark({ deaths, pad }) {
  const n = parseInt(deaths, 10)
  const className = pad ? 'deaths deaths-pad' : 'deaths'
  if (!n) return <span className={className} />
  return (
    <span className={className} aria-hidden={pad ? 'true' : undefined}>
      {n}
      <span className="label">{n > 1 ? 'DTHS' : 'DTH'}</span>
    </span>
  )
}

function DataWrapper(props) {
  return (
    <div className={props.relevant ? 'dps' : 'dps irrelevant'}>
      <div>
        <span className="damage-stats">{props.text}</span>
        <span className="label">{props.label}</span>
      </div>
    </div>
  )
}

function DataText({ type, show = true, isHealing = false, ...data } = {}) {
  if (!show) return null
  let text, label, relevant
  switch (type) {
    // same story as the band: the role says which number matters, not a
    // string comparison of the two
    case 'hps':
      text = data.ENCHPS
      label = ' HPS'
      relevant = isHealing
      break
    case 'dps':
      text = data.ENCDPS
      label = ' DPS'
      relevant = !isHealing
      break
    // ACT hands these over already carrying their % sign
    case 'crit':
      text = data['crithit%'] || '0%'
      label = ' CRIT'
      relevant = '1'
      break
    case 'dhit':
      text = data.DirectHitPct || '0%'
      label = ' DH'
      relevant = '1'
      break
    case 'cdh':
      // The FFXIV plugin renamed this: 1.5.1.3 spelled it DirectCritHitPct and
      // later builds CritDirectHitPct, so read both.
      text = data.CritDirectHitPct || data.DirectCritHitPct || '0%'
      label = ' CDH'
      relevant = '1'
      break
    case 'job':
      // Pets arrive with an empty Job, which left this slot blank while every
      // other card carried a three-letter code. PET rather than SMN (taken by
      // Summoner) or a summon-specific word -- chocobos and turrets land here
      // too.
      text = data.Job ? data.Job.toUpperCase() : 'PET'
      label = ''
      relevant = '1'
      break
    default:
  }
  return <DataWrapper text={text} label={label} relevant={relevant} />
}
