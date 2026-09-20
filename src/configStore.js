// localStorage is not guaranteed to be there. ACT loads overlays through CEF,
// and a page opened from a file:// path can get a SecurityError on the very
// first access depending on how the browser was launched. That used to throw
// out of componentWillMount and leave a blank overlay -- which, for a damage
// meter you only see mid-fight, is a bad way to find out.
//
// Falling back to memory keeps the overlay rendering and the config window
// usable; the only thing lost is persistence across a reload.

const KEY = 'horizoverlay'

let memory = null
let warned = false

function unavailable(e) {
  if (!warned) {
    warned = true
    console.warn(
      '[horizoverlay] localStorage is unavailable, settings will not persist ' +
        'across a reload. Serving the overlay over http:// instead of file:// ' +
        'usually fixes this.',
      e
    )
  }
}

export function read() {
  try {
    return localStorage.getItem(KEY)
  } catch (e) {
    unavailable(e)
    return memory
  }
}

export function write(value) {
  memory = value
  try {
    localStorage.setItem(KEY, value)
  } catch (e) {
    unavailable(e)
  }
}

export function clear() {
  memory = null
  try {
    localStorage.clear()
  } catch (e) {
    unavailable(e)
  }
}
