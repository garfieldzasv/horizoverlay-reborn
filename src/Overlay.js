import React from 'react'
import Encounter from './Encounter'
import Combatants from './Combatants'
import { share } from './helpers'

import './css/reboot.css'
import './css/index.css'
import './css/overlay.css'

// No withHelper here: index.js wraps the Overlay/SetupMode choice in a single
// one, because the thing that chooses between them is itself a config option.
class Overlay extends React.Component {
  state = {
    // Null until a limit break lands, and null again for one that did no
    // damage: a tank's has none by design, so there is nothing to show a
    // share of. { damage, share } once there is.
    limitBreak: null,
    discordData: []
  }
  handleLimitBreak = value => {
    this.setState({ limitBreak: value })
  }
  componentWillReceiveProps(nextProps) {
    if (Object.getOwnPropertyNames(this.props.Combatant).length === 0)
      return false

    let maxRows = this.props.config.maxCombatants
    let dataArray = Object.keys(this.props.Combatant)
    const isLimitBreak = key =>
      this.props.Combatant[key].name.toLowerCase() === 'limit break'

    // Limit break is a pseudo combatant, not a player. It has its own readout
    // in the banner and does not belong in the roster the report is about.
    //
    // It comes out before the slice, the way Combatants.js does it, so
    // maxCombatants means that many players in the report as well as on
    // screen. Handling it inside the loop instead used to cost a player
    // whenever it sorted above one.
    // The share used to come out of `this.props.Combatant.damage` -- the
    // combatant dictionary's own `damage` property, which does not exist. That
    // is undefined, so the whole expression was NaN, so `limitBreak > 0` in
    // the banner was always false and the readout never appeared. It has been
    // broken for as long as the banner has had a slot for it.
    //
    // ACT reports limit break as one pseudo combatant keyed 'Limit Break', so
    // every cast in the encounter accumulates into this single record and the
    // share covers all of them together. There is no per-cast breakdown, and
    // no way to tell who cast it: the record carries 86 fields and not one of
    // them names a player.
    const lbKey = dataArray.filter(isLimitBreak)[0]
    const lb = lbKey === undefined ? null : this.props.Combatant[lbKey]
    this.handleLimitBreak(
      lb && parseFloat(lb.damage) > 0
        ? { damage: lb.damage, share: share(lb.damage, this.props.Encounter.damage) }
        : null
    )

    let battler = dataArray.filter(key => !isLimitBreak(key)).slice(0, maxRows)
    let combatant
    let discordData = []

    for (const ref in battler) {
      combatant = this.props.Combatant[battler[ref]]

      // Send to Discord the right name in Settings
      if (combatant.name.toUpperCase() === 'YOU')
        combatant.name = this.props.config.characterName

      // Limit break used to be found here, and finding it ran `break` -- which
      // ends the loop rather than skipping the one entry. ACT orders
      // combatants by damage and limit break almost always lands last, so on a
      // normal pull the two read the same. Only almost, though: let someone
      // disconnect for a stretch and their damage can fall under the raid's
      // limit break, and every player sorted below it left the report without
      // a word. Measured on an 8-player party with limit break moved to the
      // middle: 8 rows became 4. It is filtered out above the loop now.

      discordData.push({
        job: combatant.Job,
        characterName: combatant.name,
        dps: combatant.ENCDPS,
        damage: share(combatant.damage, this.props.Encounter.damage),
        hps: combatant.ENCHPS,
        // Worked out from the totals, the way the share bar on a card already
        // does, rather than read from ACT's `healed%`. Not because that field
        // is wrong -- checked against a captured payload, ACT's `damage%` and
        // `healed%` match the computed share exactly on every combatant -- but
        // so the card and the report run one formula instead of two. The mock
        // was the thing that made this look like a bug: it hard-coded
        // `healed%` to 12% for everyone.
        healed: share(combatant.healed, this.props.Encounter.healed),
        deaths: combatant.deaths,
        crit: combatant['crithit%'],
        dhit: combatant.DirectHitPct
        // maxhit: combatant.maxhit.split('-')
      })
    }
    this.setState({ discordData })
  }
  render() {
    const props = this.props
    return (
      <div
        className={`damage-meter ${props.config.color}${
          props.isActive ? '' : ' inactive'
        }${
          props.config.locale === 'zhCN' || props.config.locale === 'zhHK'
            ? ' chinese'
            : ''
        }`}
        onContextMenu={props.openConfig}
        style={{ zoom: props.config.zoom }}
      >
        <Combatants
          data={props.Combatant}
          encounterDamage={props.Encounter.damage}
          encounterHealed={props.Encounter.healed}
          config={props.config}
        />
        <Encounter
          {...props.Encounter}
          limitBreak={this.state.limitBreak}
          discordData={this.state.discordData}
          config={props.config}
        />
      </div>
    )
  }
}

export default Overlay
