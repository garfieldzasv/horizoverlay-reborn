import React, { Component } from 'react'
import { withHelper, themes, leftStats, locales } from './helpers'
import { write as writeConfig, clear as clearConfig } from './configStore'
import locale from './locale'

import './css/config.css'

class ConfigRaw extends Component {
  // withHelper hands the merged config down as a prop; the settings page edits
  // it locally and writes through, so it keeps its own copy.
  state = { config: this.props.config }

  handleConfig = e => {
    const target = e.target
    if (target.type === 'text') e.preventDefault()
    const config = { ...this.state.config }

    // Why aren't HTML elements more consistent? 😦
    config[target.name] =
      target.type === 'checkbox' ? target.checked : target.value

    this.setState({ config })
    writeConfig(JSON.stringify(config))
  }

  resetConfig = () => {
    clearConfig()
    // send to the wrapper component
    this.props.handleReset()
    // well that's horrible
    window.location.reload()
  }

  // *** IMPORTANT ***
  // state comes from withHelper, which reads it back out of storage and keeps
  // it in step with the overlay window through the 'storage' event.

  field(key, label) {
    const { config } = this.state
    return (
      <label className="cfg-field" key={key} htmlFor={key}>
        <span className="cfg-label">{label}</span>
        <input
          type="checkbox"
          id={key}
          name={key}
          checked={Boolean(config[key])}
          onChange={this.handleConfig}
        />
      </label>
    )
  }

  render() {
    const { config } = this.state
    const loc = locale[config.locale].config
    const zoomPct = Math.round((parseFloat(config.zoom) || 1) * 100)

    // No zoom on the settings page itself: dragging the slider would rescale
    // the page under the cursor. It sets the overlay window's zoom, not this
    // one's.
    return (
      <div className="config">
        <form className="cfg-form" onSubmit={e => e.preventDefault()}>
          <div className="cfg-actions">
            <label className="cfg-toggle" htmlFor="showSetup">
              <input
                type="checkbox"
                id="showSetup"
                name="showSetup"
                checked={Boolean(config.showSetup)}
                onChange={this.handleConfig}
              />
              <span>{loc.setupTitle}</span>
            </label>

            {/* A popup can just be closed. When the overlay had to fall back to
                navigating its own window, this is the only way back to it. */}
            {!window.opener && (
              <button
                type="button"
                onClick={() => {
                  window.location.hash = '#/'
                }}
              >
                {loc.backTitle}
              </button>
            )}

            <button type="button" className="cfg-reset" onClick={this.resetConfig}>
              {loc.resetTitle}
            </button>

            <span
              className="cfg-help"
              dangerouslySetInnerHTML={{ __html: loc.help }}
            />
          </div>

          <div className="cfg-grid">
            <section className="cfg-section">
              <h2>{loc.localeTitle}</h2>
              <label className="cfg-field cfg-field--solo" htmlFor="locale">
                <select
                  id="locale"
                  name="locale"
                  value={config.locale}
                  onChange={this.handleConfig}
                >
                  {locales.map(l => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            <section className="cfg-section">
              <h2>{loc.themeTitle}</h2>
              {/* A select rather than radios: more themes can be added without
                  the section growing and reflowing the columns. */}
              <label className="cfg-field cfg-field--solo" htmlFor="color">
                <select
                  id="color"
                  name="color"
                  value={config.color}
                  onChange={this.handleConfig}
                >
                  {themes.map(t => (
                    <option key={t.value} value={t.value}>
                      {loc[t.label]}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            <section className="cfg-section">
              <h2>{loc.sectionCard}</h2>
              {this.field('showRank', loc.toggleOption1)}
              {this.field('showJobIcon', loc.toggleOption2)}
              <label className="cfg-field" htmlFor="leftStat">
                <span className="cfg-label">{loc.leftStatTitle}</span>
                <select
                  id="leftStat"
                  name="leftStat"
                  value={config.leftStat}
                  onChange={this.handleConfig}
                >
                  {leftStats.map(s => (
                    <option key={s.value} value={s.value}>
                      {loc[s.label]}
                    </option>
                  ))}
                </select>
              </label>
              {this.field('showDamageBar', loc.toggleOption15)}
              {this.field('showHealBar', loc.toggleOption8)}
              {this.field('showRates', loc.toggleOption16)}
              {this.field('showMaxhit', loc.toggleOption11)}
              {this.field('showDeaths', loc.toggleOption17)}
              {this.field('showHighlight', loc.toggleOption4)}
            </section>

            <section className="cfg-section">
              <h2>{loc.sectionBanner}</h2>
              {this.field('showDuration', loc.toggleOption6)}
              {this.field('showTotalDps', loc.toggleOption7)}
            </section>

            <section className="cfg-section">
              <h2>{loc.sectionRoster}</h2>
              <label className="cfg-field" htmlFor="maxCombatants">
                <span className="cfg-label">{loc.maxCombatantsTitle}</span>
                <input
                  type="number"
                  min="1"
                  max="24"
                  id="maxCombatants"
                  name="maxCombatants"
                  value={config.maxCombatants}
                  onChange={this.handleConfig}
                />
              </label>
              {this.field('showJobless', loc.toggleOption12)}
            </section>

            <section className="cfg-section">
              <h2>{loc.sectionSelf}</h2>
              <label className="cfg-field cfg-field--stack" htmlFor="characterName">
                <span className="cfg-label">{loc.nameHelp}</span>
                <input
                  type="text"
                  id="characterName"
                  name="characterName"
                  value={config.characterName}
                  onChange={this.handleConfig}
                />
              </label>
              {this.field('showSelf', loc.toggleOption5)}
              {this.field('enableSoloMode', loc.toggleOption14)}
              {this.field('enableStreamerMode', loc.toggleOption13)}
            </section>

            <section className="cfg-section">
              <h2>{loc.zoomTitle}</h2>
              <label className="cfg-field" htmlFor="zoom">
                <span className="cfg-label cfg-value">{zoomPct}%</span>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  id="zoom"
                  name="zoom"
                  value={config.zoom}
                  onChange={this.handleConfig}
                />
              </label>
            </section>

            <section className="cfg-section">
              <h2>{loc.discordTitle}</h2>
              {this.field('showDiscord', loc.discordToggle)}
              {this.field('discordAnonymous', loc.discordAnonymous)}
              <label className="cfg-field cfg-field--solo" htmlFor="discord">
                <input
                  type="text"
                  id="discord"
                  name="discord"
                  value={config.discord}
                  placeholder={loc.discordHelp}
                  onChange={this.handleConfig}
                />
              </label>
            </section>
          </div>
        </form>
      </div>
    )
  }
}

const Config = withHelper({ WrappedComponent: ConfigRaw, isConfig: true })
export default Config
