import React from 'react'
import ReactDOM from 'react-dom'

import { HashRouter as Router, Route, Switch } from 'react-router-dom'

import Overlay from './Overlay'
import Config from './Config'
import SetupMode from './SetupMode'
import { withHelper } from './helpers'
import initActWebSocket from './actwebsocket'
import initMockData from './testing/testing'

// import Raven from 'raven-js'
// import { sentryUrl } from './sentry'

require(`./images/handle.png`)

initActWebSocket()
initMockData()

// Raven.config(sentryUrl).install()

// The last payload ACT sent, kept so the window can be re-rendered for reasons
// other than new data -- switching the preview on is one.
window.lastData = {}

// There used to be two trees: one rendered at startup with SetupMode on `/`,
// and one rendered on every data update with Overlay on `/`. The first update
// swapped the second in for good, and since showSetup is only read inside
// SetupMode, turning the preview on after a fight had already been recorded
// did nothing at all -- the component that reads the flag was no longer in the
// tree. One tree now, and this is the only place that decides what `/` shows.
//
// withHelper lives here rather than inside Overlay and SetupMode because the
// choice between them is itself a config option; it also gives them the
// storage listener that makes the settings window's toggle arrive here.
const Screen = withHelper({
  WrappedComponent: props =>
    // Before the first payload there is nothing to draw, and the "no data yet"
    // page is SetupMode's too -- it renders the notice with the mock list
    // hidden behind the same flag.
    props.config.showSetup || !props.Combatant ? (
      <SetupMode {...props} />
    ) : (
      <Overlay {...props} />
    )
})

const Root = detail => {
  return (
    <Router>
      <Switch>
        <Route exact path={`/config`} component={Config} />
        <Route path={`/`} render={() => <Screen {...detail} />} />
      </Switch>
    </Router>
  )
}

function render() {
  ReactDOM.render(<Root {...window.lastData} />, document.getElementById('root'))
}

// This will run when data is ON
function onOverlayDataUpdate(e) {
  // discordString is true whenever the user uses '/e discord' in game
  // const discordString =
  //   'detail' in e &&
  //   'payload' in e.detail &&
  //   e.detail.payload[2].toLowerCase().indexOf('discord')

  // regardless, we keep sending combat data
  // if (e.type === 'onOverlayDataUpdate' || discordString) {
  // ... but we save the last data in case the next data isn't combat data
  //   window.lastData = e.detail
  //   ReactDOM.render(<Root {...e.detail} />, document.getElementById('root'))
  // } else if (discordString && window.lastData !== {}) {
  // then we send the last data here, which won't update combat numbers but will send discord stuff
  // ReactDOM.render(
  //   <Root detail={window.lastData} discord={true} />,
  //   document.getElementById('root')
  // )
  // }
  window.lastData = e.detail.msg ? e.detail.msg : e.detail
  render()
}
// Nothing has arrived yet, so this draws the notice page.
render()

// :: Events
// https://github.com/RainbowMage/OverlayPlugin/wiki/JavaScript-API-reference
// https://github.com/hibiyasleep/OverlayPlugin/wiki/Additional-Javascript-API-Reference

// - onOverlayDataUpdate
// This event occurs when the OverlayPlugin sends the new data.
// The overlay's own right-click handler covers the cards, but not the empty
// space around them, and that is most of the window. Blanket it at the document
// instead -- except on the settings page, where you want the native menu to
// paste a webhook URL.
document.addEventListener('contextmenu', function(e) {
  const target = e.target
  if (target && target.closest && target.closest('.config')) return
  e.preventDefault()
})

document.addEventListener('onOverlayDataUpdate', onOverlayDataUpdate)

// - onLogLine
// This event occurs when anything in the chat happens, so we need to clean it up a bit before sending to the component or else it will polute and re-render it a lot unnecessarily
// Not being implemented right now
// document.addEventListener('onLogLine', onOverlayDataUpdate)

// - onOverlayStateUpdate
// This event occurs when the overlay setting has changed.
document.addEventListener('onOverlayStateUpdate', function(e) {
  if (!e.detail.isLocked) {
    document.documentElement.classList.add('resizable')
  } else {
    document.documentElement.classList.remove('resizable')
  }
})
// Receiver of OverlayPluginApi.sendMessage and OverlayPluginApi.broadcastMessage, not being used as far as I know
window.addEventListener('message', function(e) {
  if (e.data.type === 'onOverlayDataUpdate') {
    onOverlayDataUpdate(e.data)
  }
})
