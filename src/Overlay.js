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
    limitBreak: 0,
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
    const limitBreak = dataArray.filter(isLimitBreak)[0]
    if (limitBreak !== undefined) {
      this.handleLimitBreak(
        parseInt(
          this.props.Combatant.damage / this.props.Encounter.damage * 100,
          10
        )
      )
    }

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
