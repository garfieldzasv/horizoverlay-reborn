import React from 'react'
import Encounter from './Encounter'
import Combatants from './Combatants'

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
    let battler = dataArray.slice(0, maxRows)
    let combatant
    let discordData = []

    for (const ref in battler) {
      combatant = this.props.Combatant[battler[ref]]

      // Send to Discord the right name in Settings
      if (combatant.name.toUpperCase() === 'YOU')
        combatant.name = this.props.config.characterName

      // Send limit break data separated
      if (combatant.name.toLowerCase() === 'limit break') {
        this.handleLimitBreak(
          parseInt(
            this.props.Combatant.damage / this.props.Encounter.damage * 100,
            10
          )
        )
        break
      }

      discordData.push({
        job: combatant.Job,
        characterName: combatant.name,
        dps: combatant.ENCDPS,
        damage: parseInt(
          combatant.damage / this.props.Encounter.damage * 100,
          10
        ),
        hps: combatant.ENCHPS,
        healed: combatant['healed%'],
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
