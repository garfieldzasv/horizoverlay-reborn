import React, { Component } from 'react'
import { object, array } from 'prop-types'

import './css/encounter.css'

class Encounter extends Component {
  static propTypes = {
    config: object.isRequired,
    discordData: array,
    // { damage, share }, or null when no limit break has dealt damage yet
    limitBreak: object
  }
  // The button used to fire and forget: no response check, no catch. Every way
  // this can fail -- webhook not filled in, URL wrong, no network, Discord
  // refusing the payload -- looked exactly like success from the overlay, and
  // the only place the reason appeared was a console nobody opens mid-fight.
  state = { status: null }
  componentWillUnmount() {
    clearTimeout(this.statusTimer)
  }
  // Says what happened on the button itself, then puts the label back. There
  // is nowhere else to say it: the overlay is one strip of text over the game.
  //
  // `kind` is carried separately from the text so that nothing has to compare
  // against the wording to know what state it is in.
  report = (text, kind) => {
    clearTimeout(this.statusTimer)
    this.setState({ status: { text, kind } })
    this.statusTimer = setTimeout(() => this.setState({ status: null }), 4000)
  }
  // ACT reports the biggest hit as `WHO-SKILL-AMOUNT`. Split from the right:
  // the amount and the skill are the last two fields, and whatever precedes
  // them is the name, which may itself contain a hyphen.
  topHit() {
    const parts = String(this.props.maxhit || '').split('-')
    if (parts.length < 3) return null
    const amount = parts.pop()
    const skill = parts.pop()
    const who = parts.join('-')
    return { who, skill, amount }
  }

  sendToDiscord = () => {
    // finish the fight for ACT
    // Right now bugging everything so it's off
    // window.OverlayPluginApi.endEncounter()

    const { config } = this.props
    const data = this.props.discordData || []

    if (!data.length) {
      // Nothing has come through from ACT yet. Sending anyway posted a header
      // with an empty table under it, which reads like the fight had no one in
      // it rather than like the overlay had nothing to send.
      this.report('No data yet', 'error')
      return
    }

    const webhook = (config.discord || '').trim()
    if (!webhook) {
      this.report('No webhook set', 'error')
      return
    }

    // Under anonymous mode the roster is reported by finishing position, so a
    // log can be shared without naming anyone in it. Position, not identity:
    // Player 1 is whoever ACT sorted first, and the numbering does not survive
    // between pulls.
    const shown = (name, index) =>
      config.discordAnonymous ? `Player ${index + 1}` : name

    // Laid out as one fenced code block. Every column ahead of the name is
    // ASCII, so the widths hold whatever the names are: Discord's monospace
    // face draws a CJK glyph at about 1.67 times a Latin one rather than the
    // 2 that padding by display width assumes, and a name column ahead of the
    // numbers pulled every row out of line by up to 6px. Last column, nothing
    // after it to misalign.
    const cols = [
      { head: 'JOB', left: true, get: c => c.job || 'PET' },
      { head: 'DPS', get: c => c.dps },
      // Both shares arrive from helpers' share(), already carrying their sign,
      // and both headers carry it too. Bare DMG and HEAL read as totals beside
      // DPS and HPS, which are the real thing -- and DMG collided with the
      // banner's own DMG, where it does mean a total.
      { head: 'DMG%', get: c => c.damage },
      { head: 'HPS', get: c => c.hps },
      { head: 'HEAL%', get: c => c.healed },
      { head: 'DIE', get: c => c.deaths },
      { head: 'CRIT', get: c => c.crit },
      { head: 'DHIT', get: c => c.dhit }
    ]
    // Sized to the contents so six-figure numbers cannot push a column over.
    const cells = data.map(c => cols.map(col => String(col.get(c))))
    const widths = cols.map((col, i) =>
      Math.max(col.head.length, ...cells.map(row => row[i].length))
    )
    const line = values =>
      values
        .map((v, i) => (cols[i].left ? v.padEnd(widths[i]) : v.padStart(widths[i])))
        .join('  ')
    const header = `${line(cols.map(c => c.head))}  NAME`
    const table = [
      header,
      '-'.repeat(header.length),
      ...cells.map((row, i) => `${line(row)}  ${shown(data[i].characterName, i)}`)
    ].join('\n')

    // The overlay collapses ACT's placeholder title the same way.
    const zone =
      this.props.title === 'Encounter' ? this.props.CurrentZoneName : this.props.title
    const hit = this.topHit()
    let summary = `${zone}  ${this.props.duration}  ${this.props.ENCDPS} DPS`
    if (hit) {
      const real = hit.who === 'YOU' ? config.characterName : hit.who
      const at = data.findIndex(c => c.characterName === real)
      // Anonymous mode has to cover this line too. Naming the top hit while
      // the table is numbered would give the whole thing away, and an unknown
      // name is left off rather than guessed at.
      const by = config.discordAnonymous
        ? at >= 0 ? `Player ${at + 1} ` : ''
        : `${real} `
      summary += `  |  Top hit ${by}${hit.skill} ${hit.amount}`
    }

    this.report('Sending...', 'sending')
    fetch(webhook, {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'Horizoverlay Reborn',
        // Blank line between the summary and the table: the summary is prose
        // about the pull, the table is the roster, and without the gap the
        // header row reads as a second line of the summary.
        content: `\`\`\`\n${summary}\n\n${table}\n\`\`\``
      })
    })
      .then(response => {
        if (response.ok) {
          this.report('Sent', 'ok')
          return
        }
        // Discord caps a message at 2000 characters. A row costs about 51 of
        // them now, so a full 24-player alliance comes to roughly 1350 and
        // this should not fire -- it used to at eleven players. Kept because
        // it is the one refusal with a cause worth naming, and silence is what
        // this whole branch exists to avoid.
        this.report(
          response.status === 400
            ? 'Too long for Discord'
            : `Discord error ${response.status}`,
          'error'
        )
      })
      // Anything that never reached Discord: no network, DNS, a URL that is
      // not a webhook at all. fetch rejects without a status for these.
      .catch(() => this.report('No connection', 'error'))
  }
  render() {
    const { config } = this.props
    const { status } = this.state
    let dps =
      this.props.encdps.length <= 7 ? this.props.encdps : this.props.ENCDPS
    let totalDps = parseFloat(dps)

    // Looks stupid but it's better than isNaN()
    // eslint-disable-next-line
    totalDps = totalDps !== totalDps ? '∞' : totalDps

    let title =
      this.props.title === 'Encounter'
        ? this.props.CurrentZoneName
        : this.props.title
    // The button is only worth a slot once it can do something. It used to
    // appear on `showDiscord` alone, webhook or not, which put a permanent
    // slab on every overlay whose owner had never set one up.
    const showSend = config.showDiscord && Boolean((config.discord || '').trim())
    const limitBreak = this.props.limitBreak
    const showLimitBreak = Boolean(config.showLimitBreak && limitBreak)
    let hasOptions =
      config.showTotalDps || config.showDuration || showSend || showLimitBreak
    return (
      <div className={`encounter${hasOptions ? ' show' : ''}`}>
        {/* Two side slabs flank the banner, one card wide each, on the same
            skewed grammar. Neither moves when the other is absent: the button
            is a click target, and one that slides sideways the first time
            somebody uses limit break -- mid-fight, which is exactly when it
            gets pressed -- is worse than an empty gap. */}
        {showSend && (
          <div className="encounter-discord">
            <button
              type="button"
              onClick={this.sendToDiscord}
              // Disabled for as long as the status shows, not just while
              // the request is in flight. Against a fast endpoint a send
              // finishes inside the gap between the two halves of a
              // double-click, so the button was live again in time to post
              // the same report twice -- measured: two clicks 300ms apart
              // put two identical messages in the channel.
              disabled={Boolean(status)}
              className={status ? status.kind : ''}
            >
              {status ? status.text : 'Send to Discord'}
            </button>
          </div>
        )}
        <div className="skewer">
          <div className="encounter-title">{title}</div>
          <div
            className={`encounter-totaldps${config.showTotalDps
              ? ' show'
              : ''}`}
          >
            {totalDps}
            <span className="label">{' DPS'}</span>
          </div>
          <div
            className={`encounter-duration${config.showDuration
              ? ' show'
              : ''}`}
          >
            <span role="img" aria-label="Time">
              🕒
            </span>{' '}
            {this.props.duration}
          </div>
        </div>
        {showLimitBreak && (
          <div className="encounter-limitbreak">
            <span>
              <span className="lb-label">LB</span>
              <span className="lb-damage">
                {/* A hidden copy of the unit on the other side of the number,
                    so the two balance and the number itself lands on the
                    slab's centre line -- the unit is small and dim enough to
                    read as punctuation, so centring the pair put the number
                    about 10px left of where it looked like it belonged. Same
                    construction the card's name line uses for the death slot;
                    positioning the real one absolutely instead either got it
                    clipped or turned it into a superscript. */}
                <span className="label lb-pad" aria-hidden="true">
                  {' DMG'}
                </span>
                {limitBreak.damage}
                {/* Leading space, the way the band's ' DPS' and ' HPS' carry
                    one -- without it a seven-figure total runs straight into
                    its unit. */}
                <span className="label">{' DMG'}</span>
              </span>
              <span className="lb-share">{limitBreak.share}</span>
            </span>
          </div>
        )}
      </div>
    )
  }
}

export default Encounter
