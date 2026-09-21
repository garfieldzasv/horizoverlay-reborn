import React from 'react'
import Encounter from './Encounter'
import { mockEncounter, getMockData, getMockPet } from './helpers'
import { RateLine, DeathMark } from './CombatantHorizontal'
import locale from './locale'

import './css/reboot.css'
import './css/overlay.css'
import './css/setupMode.css'

var images = require.context('./images', false, /\.png$/)

// Mirrors DataText in CombatantHorizontal.js -- setup mode renders its own
// markup, so the two have to be kept saying the same thing.
function leftValue(stat, mock) {
  if (stat === 'crit') return mock.crit
  if (stat === 'dhit') return mock.dhit
  if (stat === 'cdh') return mock.cdh
  if (stat === 'job') return mock.jobLabel
  return mock.hps
}
function leftLabel(stat) {
  if (stat === 'crit') return ' CRIT'
  if (stat === 'dhit') return ' DH'
  if (stat === 'cdh') return ' CDH'
  if (stat === 'job') return null
  return ' HPS'
}

// No withHelper here: index.js wraps the Overlay/SetupMode choice in a single
// one, because the thing that chooses between them is itself a config option.
function SetupMode(props) {
  const { maxCombatants } = props.config
  // 显示无职业单位 is about whether pets show up at all, so the preview spends its
  // last slot on one rather than growing the list -- the slot count is what the
  // window is being sized against.
  const roster = getMockData(props.config.locale)
  const mockData = props.config.showJobless
    ? roster
        .slice(0, maxCombatants - 1)
        .concat(getMockPet(props.config.locale, maxCombatants))
    : roster
  const colorClass = props.config.color
  const isVisible = props.config.showSetup ? 'show' : 'hide'
  const loc = locale[props.config.locale]
  return (
    <div
      className={`setupMode ${colorClass}${
        props.config.locale === 'zhCN' || props.config.locale === 'zhHK'
          ? ' chinese'
          : ''
      }`}
      onContextMenu={props.openConfig}
      style={{ zoom: props.config.zoom }}
    >
      <div className={`wrapper ${isVisible}`}>
        <div className="combatants">
          {mockData.map((mock, index) => {
            if (index >= maxCombatants) return false
            if (!mock.isSelf && props.config.enableSoloMode) return false
            let maxhit
            if (mock.maxhit) maxhit = mock.maxhit.replace(/-([^-]*)$/, ': $1')
            return (
              mock.name.toLowerCase() !== 'limit break' && (
                <div
                  className={`row${
                    mock.isSelf && props.config.showSelf ? ' self' : ''
                  } ${mock.jobRole} ${mock.jobClass} `}
                  style={{ order: mock.rank }}
                  key={mock.rank}
                >
                  <div className="name">
                    {props.config.showDeaths && <span className="name-pad" />}
                    {props.config.showRank ? (
                      <span className="rank">{`${mock.rank}. `}</span>
                    ) : null}
                    <span className={`character-name ${ !mock.isSelf && props.config.enableStreamerMode ? 'streamer-mode' : '' }`}>
                      {mock.isSelf && props.config.showSelf
                        ? props.config.characterName
                        : mock.name}
                    </span>
                    {props.config.showDeaths && <DeathMark deaths={mock.deaths} />}
                  </div>
                  <div
                    className={`data-items${
                      props.config.showHighlight ? ' highlight' : ''
                    }${
                      props.config.leftStat === 'hps' && mock.isHealing
                        ? ' inverse'
                        : ''
                    }`}
                  >
                    {props.config.showJobIcon ? (
                      <img
                        src={images(`./${mock.job}.png`)}
                        className="job"
                        alt={mock.jobFull}
                      />
                    ) : null}
                    <div
                      className={`dps${
                        mock.isHealing ? ' relevant' : ' irrelevant'
                      }`}
                    >
                      <div>
                        <span className="damage-stats">
                          {leftValue(props.config.leftStat, mock)}
                        </span>
                        <span className="label">
                          {leftLabel(props.config.leftStat)}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`dps${
                        mock.isHealing ? ' irrelevant' : ' relevant'
                      }`}
                    >
                      <div>
                        <span className="damage-stats">{mock.dps}</span>
                        <span className="label"> DPS</span>
                      </div>
                    </div>
                  </div>
                  {(props.config.showDamageBar ||
                    props.config.showHealBar) && (
                    <div>
                      {props.config.showDamageBar && (
                        <div className="damage-percent-bg">
                          <div
                            className="damage-percent-fg"
                            style={{ width: `${mock.damagePct}%` }}
                          />
                        </div>
                      )}
                      {props.config.showHealBar && (
                        <div className="damage-percent-bg">
                          <div
                            className="damage-percent-fg"
                            style={{ width: `${mock.healPct}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {props.config.showRates && (
                    <RateLine crit={mock.crit} dhit={mock.dhit} cdh={mock.cdh} />
                  )}
                  <div className="maxhit">
                    {props.config.showMaxhit && maxhit}
                  </div>
                </div>
              )
            )
          })}
        </div>
        <Encounter
          {...mockEncounter}
          CurrentZoneName={loc.setupMode.sampleZone}
          discordData={[]}
          config={props.config}
        />
        <div className="instructions">
          <div
            dangerouslySetInnerHTML={{
              __html: loc.setupMode.instructionsTitle
            }}
          />
          <div
            dangerouslySetInnerHTML={{
              __html: loc.setupMode.instructions
            }}
          />
        </div>
      </div>
      <div className={`notice`}>
        <span className="notice-title">Horizoverlay Reborn</span>
        <div
          dangerouslySetInnerHTML={{
            __html: loc.initial.help
          }}
        />
      </div>
    </div>
  )
}

export default SetupMode
