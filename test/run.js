#!/usr/bin/env node
//
// Checks the built overlay in a real browser.
//
//   npm run build && npm test
//
// Every check here stands for something that broke once. They are not a
// specification of the overlay and do not try to be; they are the handful of
// things worth re-confirming after a change, each pinned to the commit that
// made it necessary.

const fs = require('fs')
const path = require('path')
const { serve, Browser } = require('./driver')

const BUILD = path.join(__dirname, '..', 'build')
const HARNESS = fs.readFileSync(path.join(__dirname, 'harness.html'), 'utf8')

// A fixed encounter, so a check compares against a number it was given rather
// than against whatever the mock feed happened to roll. The percentages are
// deliberately not what the totals would produce -- 300000/1000000 is 30%, but
// the field says 31% -- which is the only way to tell "read the field" apart
// from "divided it again and got the same answer".
const FIXTURE = {
  type: 'CombatData',
  isActive: 'true',
  Encounter: {
    title: 'Fixture', CurrentZoneName: 'Fixture', duration: '01:00',
    DURATION: '60', damage: '1000000', healed: '500000',
    encdps: '16666.00', ENCDPS: '16666', enchps: '8333.00', ENCHPS: '8333',
    maxhit: 'Alpha-Spell-99999'
  },
  Combatant: {
    Alpha: combatant('Alpha', 'BLM', '300000', '31%', '0', '0%', '5000', '0'),
    Bravo: combatant('Bravo', 'WHM', '120000', '12%', '400000', '81%', '2000', '6666'),
    Charlie: combatant('Charlie', 'PLD', '80000', '8%', '100000', '19%', '1333', '1666'),
    Delta: combatant('Delta', 'DRG', '450000', '45%', '0', '0%', '7500', '0'),
    'Limit Break': combatant('Limit Break', '', '50000', '5%', '0', '0%', '833', '0')
  }
}

function combatant (name, job, damage, damagePct, healed, healedPct, dps, hps) {
  return {
    name, Job: job, ENCDPS: dps, ENCHPS: hps,
    damage, 'damage%': damagePct, healed, 'healed%': healedPct,
    deaths: '0', 'crithit%': '20%', DirectHitPct: '25%', CritDirectHitPct: '5%',
    maxhit: `${name}-Attack-12345`
  }
}

const results = []
function check (name, ok, detail) {
  results.push({ name, ok, detail })
  const mark = ok ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'
  console.log(`  ${mark} ${name}${detail ? '\n      ' + detail : ''}`)
}

// Pushes the fixture a few times over, because a first frame is not enough for
// everything -- the limit break readout is set from componentWillReceiveProps
// and so cannot appear until a second one arrives.
const feed = (n = 3) => `
  const fixture = ${JSON.stringify(FIXTURE)}
  for (let i = 0; i < ${n}; i++) {
    document.dispatchEvent(new CustomEvent('onOverlayDataUpdate', { detail: fixture }))
    await new Promise(r => setTimeout(r, 250))
  }`

async function main () {
  if (!fs.existsSync(path.join(BUILD, 'index.html'))) {
    console.error('No build/index.html. Run `npm run build` first.')
    process.exit(1)
  }

  const site = await serve(BUILD, { '/harness.html': HARNESS })
  const base = `http://127.0.0.1:${site.port}/harness.html`
  const browser = await Browser.launch()
  const t0 = Date.now()

  try {
    // ---- the overlay renders at all ----
    console.log('\n渲染基线')
    {
      const { value, problems } = await browser.visit(
        `${base}?locale=enUS&interval=1000`, {
          script: `(async () => {
            ${feed(2)}
            const qa = s => [...document.querySelectorAll(s)]
            return {
              rows: qa('.combatants .row').length,
              icons: qa('img.job').length,
              iconsLoaded: qa('img.job').every(i => i.complete && i.naturalWidth > 0),
              names: qa('.character-name').map(e => e.textContent.trim())
            }
          })()`
        })
      check('四名参战者各一张卡片', value.rows === 4, `实得 ${value.rows}`)
      check('职业图标全部加载', value.icons >= 3 && value.iconsLoaded,
        `${value.icons} 个，加载完成 ${value.iconsLoaded}`)
      check('极限技不占用卡片位', !value.names.includes('Limit Break'),
        value.names.join(', '))
      check('控制台无错误', problems.length === 0, problems.join('\n      '))
    }

    // ---- 627ae4f: 占比取自 ACT 字段，不再自己算 ----
    console.log('\n占比条读 ACT 的字段（627ae4f）')
    {
      const { value } = await browser.visit(`${base}?locale=enUS&interval=1000`, {
        script: `(async () => {
          ${feed(2)}
          const out = {}
          for (const row of document.querySelectorAll('.combatants .row')) {
            const bars = [...row.querySelectorAll('.damage-percent-fg')]
            out[row.querySelector('.character-name').textContent.trim()] =
              [bars[0] && bars[0].style.width, bars[1] && bars[1].style.width]
          }
          return out
        })()`
      })
      const want = {
        Alpha: ['31%', '0%'], Bravo: ['12%', '81%'],
        Charlie: ['8%', '19%'], Delta: ['45%', '0%']
      }
      const wrong = Object.keys(want).filter(k =>
        !value[k] || value[k][0] !== want[k][0] || value[k][1] !== want[k][1])
      check('条宽逐条等于 damage% / healed%', wrong.length === 0,
        wrong.length ? wrong.map(k => `${k}: 期望 ${want[k]}，实得 ${value[k]}`).join('; ')
          : '四人全符，且与总量算出的值不同 —— 确实读的是字段')
    }

    // ---- 9fb4c5c: 极限技横幅 ----
    console.log('\n极限技横幅（9fb4c5c）')
    {
      const { value } = await browser.visit(`${base}?locale=enUS&lb=1&interval=1000`, {
        script: `(async () => {
          ${feed(3)}
          const q = s => document.querySelector(s)
          return {
            present: !!q('.encounter-limitbreak'),
            share: q('.lb-share') && q('.lb-share').textContent.trim(),
            damage: q('.lb-damage') && q('.lb-damage').textContent.replace(/[^0-9]/g, '')
          }
        })()`
      })
      check('横幅出现（首帧不出是已知行为）', value.present)
      check('占比取自 damage% 而非自算', value.share === '5%', `实得 ${value.share}`)
      check('伤害为 ACT 的原值', value.damage === '50000', `实得 ${value.damage}`)
    }

    // ---- 6e28c1c: 长技能名不撑高卡片 ----
    console.log('\n长技能名不撑高卡片（6e28c1c）')
    {
      const { value } = await browser.visit(`${base}?locale=enUS&maxhit=1&interval=1000`, {
        script: `(async () => {
          ${feed(2)}
          const rows = [...document.querySelectorAll('.combatants .row')]
          const before = rows.map(r => Math.round(r.getBoundingClientRect().height))
          // 青魔真实技能，比卡片宽
          rows[0].querySelector('.maxhit').textContent = 'The Rose of Destruction: 284910'
          await new Promise(r => setTimeout(r, 300))
          const after = rows.map(r => Math.round(r.getBoundingClientRect().height))
          const m = rows[0].querySelector('.maxhit')
          const st = getComputedStyle(m)
          return { before, after, white: st.whiteSpace, over: st.overflow, ell: st.textOverflow }
        })()`
      })
      const same = value.after.every(h => h === value.after[0]) &&
        value.after[0] === value.before[0]
      check('塞入超长技能名后所有卡片等高', same,
        `改前 ${value.before.join('/')} → 改后 ${value.after.join('/')}`)
      check('样式为单行 + 省略号',
        value.white === 'nowrap' && value.over === 'hidden' && value.ell === 'ellipsis',
        `${value.white} / ${value.over} / ${value.ell}`)
    }

    // ---- 折行是这个 fork 的立身之本 ----
    console.log('\n窄窗口折行')
    {
      const { value } = await browser.visit(
        `${base}?locale=enUS&interval=1000`, {
          width: 500, height: 300,
          script: `(async () => {
            ${feed(2)}
            const rows = [...document.querySelectorAll('.combatants .row')]
            return { rows: rows.length,
                     tops: [...new Set(rows.map(r => Math.round(r.getBoundingClientRect().top)))] }
          })()`
        })
      check('放不下时折行而不是裁掉卡片',
        value.rows === 4 && value.tops.length > 1,
        `${value.rows} 张卡分 ${value.tops.length} 行`)
    }

    // ---- 日语那次：六语种都要能渲染 ----
    console.log('\n六个语种')
    for (const locale of ['enUS', 'jaJP', 'ptBR', 'frFR', 'zhCN', 'zhHK']) {
      const { value, problems } = await browser.visit(
        `${base}?locale=${locale}&config=1`, {
          width: 500, height: 900,
          script: `(() => {
            const qa = s => [...document.querySelectorAll(s)]
            const labels = qa('.cfg-label').map(e => e.textContent.trim())
            return {
              fields: qa('.cfg-field').length,
              sections: qa('.config h2').length,
              blank: labels.filter(t => !t).length,
              leaked: labels.filter(t => /^(toggle|leftStat|section|discord)[A-Z0-9]/.test(t)).length
            }
          })()`
        })
      check(locale,
        value.fields === 24 && value.sections === 8 && !value.blank && !value.leaked &&
          problems.length === 0,
        `${value.fields} 行 / ${value.sections} 组，空标签 ${value.blank}，` +
        `未翻译 ${value.leaked}` + (problems.length ? '，' + problems[0] : ''))
    }

    // ---- cadb133: 配置页的行与分隔线 ----
    console.log('\n配置页行距（cadb133）')
    {
      const { value } = await browser.visit(`${base}?locale=enUS&config=1`, {
        width: 500, height: 900,
        script: `(() => {
          const rows = [...document.querySelectorAll('.cfg-field')]
          const gaps = []
          for (let i = 1; i < rows.length; i++) {
            const a = rows[i - 1].getBoundingClientRect()
            const b = rows[i].getBoundingClientRect()
            // 同一分组内才相邻；跨分组的间距是另一回事
            if (Math.abs(b.top - a.bottom) < 20) gaps.push(+(b.top - a.bottom).toFixed(2))
          }
          return { gaps: [...new Set(gaps)] }
        })()`
      })
      check('同组内相邻两行紧挨，间距全为 0',
        value.gaps.length === 1 && value.gaps[0] === 0,
        `实得 ${JSON.stringify(value.gaps)}`)
    }

    // ---- 配置写进去要能读回来 ----
    console.log('\n配置往返')
    {
      const { value } = await browser.visit(`${base}?locale=enUS&config=1`, {
        width: 500, height: 900,
        script: `(async () => {
          const set = (el, v) => {
            // 受控组件：要走原生 setter，再发它监听的那个事件
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v)
            el.dispatchEvent(new Event('input', { bubbles: true }))
          }
          const texts = [...document.querySelectorAll('.config input[type=text]')]
          set(texts[0], 'Round Trip')
          await new Promise(r => setTimeout(r, 300))
          const box = document.querySelector('.cfg-field input[type=checkbox]')
          const was = box.checked
          box.click()
          await new Promise(r => setTimeout(r, 300))
          const stored = JSON.parse(localStorage.getItem('horizoverlay'))
          return { name: stored.characterName, flipped: stored.showRank !== was }
        })()`
      })
      check('文本框写入后落到存储', value.name === 'Round Trip', `实得 ${value.name}`)
      check('开关翻转后落到存储', value.flipped === true)
    }
  } finally {
    await browser.close()
    site.close()
  }

  const failed = results.filter(r => !r.ok)
  const secs = ((Date.now() - t0) / 1000).toFixed(1)
  console.log(`\n${results.length - failed.length}/${results.length} 通过，用时 ${secs}s`)
  if (failed.length) {
    console.log('\n失败：')
    failed.forEach(f => console.log(`  ✗ ${f.name}`))
    process.exit(1)
  }
}

main().catch(err => {
  console.error('\n测试自身出错：', err.message)
  process.exit(2)
})
