// Everything in this overlay is a parallelogram sheared -30deg, and the eye
// reads those slanted edges as continuous lines running down the card. Anything
// sitting below the main band therefore has to move left by tan(30deg) times its
// vertical distance from that band, or its edge lands beside the line instead of
// on it.
//
// Two things need that treatment: the encounter banner under the whole list, and
// the share bars under each card. The distances depend on the type scale and on
// which optional rows are switched on, so they are measured rather than guessed
// at with a constant per combination.
//
// Only horizontal offsets are written back, never anything that affects height,
// so a pass cannot change what the next pass would measure.

const TAN30 = Math.tan(Math.PI / 6)

const last = {}

function centre(rect) {
  return rect.top + rect.height / 2
}

function set(name, value) {
  // The overlay re-renders every second with data that never moves any of this,
  // and writing a custom property forces a restyle.
  if (last[name] !== undefined && Math.abs(value - last[name]) < 0.5) return
  last[name] = value
  document.documentElement.style.setProperty(name, `${value.toFixed(2)}px`)
}

export default function syncSkewAlign() {
  const cards = document.querySelectorAll('.data-items')
  if (!cards.length) return

  // The cards wrap when the window is too narrow, and the banner then sits under
  // the last row -- that is the row its edges have to continue, not the first.
  let card = cards[0]
  let top = card.getBoundingClientRect().top
  for (let i = 1; i < cards.length; i++) {
    const t = cards[i].getBoundingClientRect().top
    if (t > top) {
      top = t
      card = cards[i]
    }
  }

  const band = card.getBoundingClientRect()
  if (!band.height) return
  const bandY = centre(band)

  // Share bars, in DOM order: whichever are switched on, first one then second.
  // Every card has the same geometry, so measuring one sets it for all.
  const row = card.parentElement
  const bars = row ? row.querySelectorAll('.damage-percent-bg') : []
  for (let i = 0; i < bars.length && i < 2; i++) {
    const r = bars[i].getBoundingClientRect()
    if (r.height) set(`--bar-shift-${i + 1}`, TAN30 * (centre(r) - bandY))
  }

  // The banner keeps its own variable: the CSS derives both its width and its
  // offset from the vertical gap rather than from a ready-made shift.
  const banner = document.querySelector('.encounter .skewer')
  if (banner) {
    const r = banner.getBoundingClientRect()
    if (r.height) set('--band-gap-y', centre(r) - bandY)
  }
}

// The bundled webfont has different metrics from whatever renders before it
// loads, and the swap does not go through React, so nothing would re-measure.
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    for (const k of Object.keys(last)) delete last[k]
    syncSkewAlign()
  })
}
