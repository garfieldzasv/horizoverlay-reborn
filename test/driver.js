// Serves build/ and drives a headless Chrome over the DevTools protocol.
//
// No test framework and no new dependencies. What these checks are actually
// about is what the browser lays out -- whether a bar has a width, whether a
// card grew taller -- and jsdom has no layout, so it cannot answer any of it.
// Chrome can, and Node has had everything needed to talk to it since it gained
// a global WebSocket and fetch.

const http = require('http')
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const os = require('os')

const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json',
  '.map': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.ttf': 'font/ttf', '.svg': 'image/svg+xml'
}

// Chrome is not on PATH on Windows and `which` is no help there either.
function findChrome () {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  const guesses = process.platform === 'win32'
    ? [
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
      path.join(os.homedir(), 'AppData/Local/Google/Chrome/Application/chrome.exe')
    ]
    : process.platform === 'darwin'
      ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
      : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser']
  const hit = guesses.find(p => fs.existsSync(p))
  if (!hit) {
    throw new Error(
      'Chrome not found. Set CHROME_PATH to its executable.\nLooked in:\n  ' +
      guesses.join('\n  '))
  }
  return hit
}

function serve (root, extra = {}) {
  const abs = path.resolve(root)
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0].split('#')[0])
    if (extra[rel]) {
      res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-store' })
      return res.end(extra[rel])
    }
    const file = path.join(abs, rel === '/' ? '/index.html' : rel)
    if (!file.startsWith(abs) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404)
      return res.end('404')
    }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    })
    fs.createReadStream(file).pipe(res)
  })
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => {
      resolve({ port: server.address().port, close: () => server.close() })
    })
  })
}

async function waitForCdp (port) {
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/version`)
      return (await r.json()).webSocketDebuggerUrl
    } catch (e) {
      await new Promise(r => setTimeout(r, 200))
    }
  }
  throw new Error('Chrome did not open a debugging port')
}

// One browser for the whole run: launching Chrome costs about a second, and
// these checks are otherwise fast enough that paying it per check would
// dominate the runtime.
class Browser {
  static async launch () {
    const port = 9400 + Math.floor(Math.random() * 500)
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'hz-test-'))
    const proc = spawn(findChrome(), [
      '--headless=new', '--no-sandbox', '--disable-gpu',
      '--disable-dev-shm-usage', '--no-first-run', '--no-default-browser-check',
      `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
      'about:blank'
    ], { stdio: 'ignore' })
    const ws = new WebSocket(await waitForCdp(port))
    await new Promise((res, rej) => {
      ws.addEventListener('open', res)
      ws.addEventListener('error', rej)
    })
    return new Browser(proc, ws, profile)
  }

  constructor (proc, ws, profile) {
    this.proc = proc
    this.ws = ws
    this.profile = profile
    this.nextId = 0
    this.pending = new Map()
    ws.addEventListener('message', ev => {
      const msg = JSON.parse(ev.data)
      const slot = msg.id && this.pending.get(msg.id)
      if (!slot) return
      this.pending.delete(msg.id)
      msg.error ? slot.reject(new Error(JSON.stringify(msg.error))) : slot.resolve(msg.result)
    })
  }

  send (method, params = {}, sessionId) {
    const id = ++this.nextId
    this.ws.send(JSON.stringify({ id, method, params, sessionId }))
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }))
  }

  // Opens a page, runs `script` in it, and hands back both its value and
  // anything the console or the network complained about along the way.
  async visit (url, { script, width = 1560, height = 200, settle = 3000 } = {}) {
    const { targetId } = await this.send('Target.createTarget', { url: 'about:blank' })
    const { sessionId } = await this.send('Target.attachToTarget', { targetId, flatten: true })
    const S = (m, p) => this.send(m, p, sessionId)
    const events = []
    const onMessage = ev => {
      const msg = JSON.parse(ev.data)
      if (msg.sessionId === sessionId && msg.method) events.push(msg)
    }
    this.ws.addEventListener('message', onMessage)
    try {
      await S('Runtime.enable')
      await S('Log.enable')
      await S('Network.enable')
      await S('Page.enable')
      // Without this the viewport is whatever Chrome felt like, and a card
      // measured against it is measured against nothing in particular.
      await S('Emulation.setDeviceMetricsOverride', {
        width, height, deviceScaleFactor: 1, mobile: false
      })
      await S('Page.navigate', { url })
      await new Promise(r => setTimeout(r, settle))
      let value = null
      if (script) {
        const r = await S('Runtime.evaluate', {
          expression: script, returnByValue: true, awaitPromise: true
        })
        if (r.exceptionDetails) {
          const d = r.exceptionDetails
          throw new Error('page script threw: ' +
            ((d.exception && d.exception.description) || d.text))
        }
        value = r.result.value
      }
      return { value, problems: collect(events) }
    } finally {
      this.ws.removeEventListener('message', onMessage)
      await S('Page.close').catch(() => {})
    }
  }

  async close () {
    try { this.ws.close() } catch (e) {}
    this.proc.kill()
    await new Promise(r => setTimeout(r, 300))
    try { fs.rmSync(this.profile, { recursive: true, force: true }) } catch (e) {}
  }
}

// A favicon nobody asked for 404s on every page; it is not a finding.
const IGNORE = /favicon/i

function collect (events) {
  const out = []
  for (const e of events) {
    const p = e.params
    if (e.method === 'Log.entryAdded' && ['error', 'warning'].includes(p.entry.level)) {
      if (!IGNORE.test(p.entry.text) && !IGNORE.test(p.entry.url || '')) {
        out.push(`[${p.entry.level}] ${p.entry.text}`)
      }
    } else if (e.method === 'Runtime.exceptionThrown') {
      const d = p.exceptionDetails
      out.push('[exception] ' + ((d.exception && d.exception.description) || d.text))
    } else if (e.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(p.type)) {
      const text = p.args.map(a => a.value || a.description).join(' ')
      if (!IGNORE.test(text)) out.push(`[console.${p.type}] ${text}`)
    } else if (e.method === 'Network.loadingFailed' && !p.canceled) {
      if (!IGNORE.test(p.request ? p.request.url : '')) {
        out.push(`[network] ${p.errorText} ${p.type}`)
      }
    }
  }
  return out
}

module.exports = { serve, Browser, findChrome }
