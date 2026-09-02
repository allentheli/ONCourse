// ONCourse browser smoke test. Optional: needs Playwright and a Chromium build.
//   npm i playwright   (once; node_modules is gitignored)
//   node tests/browser.js
// Serves the repo on a local port, drives the builder on desktop and phone,
// and exits non-zero on any failure. No network access beyond localhost.
const { spawn } = require('child_process');
const path = require('path');
const root = path.join(__dirname, '..');

let chromium;
try { chromium = require('playwright').chromium; }
catch (e) { console.log('SKIP: playwright not installed (npm i playwright)'); process.exit(0); }

const PORT = 8123;
const BASE = `http://localhost:${PORT}`;

(async () => {
  const srv = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: root, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const out = [];
  const ok = (name, cond) => { out.push((cond ? 'PASS' : 'FAIL') + ' | ' + name); };
  let b;
  try {
    b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
    const errs = [];
    const hook = (p) => p.on('pageerror', e => errs.push(String(e).slice(0, 160)));

    // ---- all pathways render, no label overlaps, no orphan "+" ----
    const p = await b.newPage({ viewport: { width: 1280, height: 950 } });
    hook(p);
    await p.goto(`${BASE}/app.html`, { waitUntil: 'load' });
    await p.waitForTimeout(300);
    const ids = await p.evaluate(() => LIBRARY.map(r => r.id));
    let renderFails = 0, labelIssues = 0;
    for (const id of ids){
      await p.goto('about:blank');
      await p.goto(`${BASE}/app.html#r=${id}&demo=1`, { waitUntil: 'load' });
      await p.waitForTimeout(100);
      const r = await p.evaluate(() => {
        const svg = document.querySelector('.route svg');
        if (!svg || svg.getBoundingClientRect().height < 40) return { ok: false };
        const bold = [...svg.querySelectorAll('text')].filter(t => +t.getAttribute('font-weight') >= 600);
        let overlaps = 0;
        for (let i = 0; i < bold.length; i++) for (let j = i + 1; j < bold.length; j++){
          const a = bold[i].getBoundingClientRect(), c = bold[j].getBoundingClientRect();
          if (Math.abs(a.top - c.top) < 4 && a.right - 2 > c.left && c.right - 2 > a.left) overlaps++;
        }
        const plus = [...svg.querySelectorAll('text')].filter(t => t.textContent.trim() === '+').length;
        return { ok: true, overlaps, plus };
      });
      if (!r.ok) renderFails++;
      if (r.overlaps || r.plus) labelIssues++;
    }
    ok(`all ${ids.length} pathways render`, renderFails === 0);
    ok('no map label overlaps or orphan fragments', labelIssues === 0);

    // ---- desktop: picker, rename sync, type-toggle label, share link ----
    await p.goto('about:blank');
    await p.goto(`${BASE}/app.html#r=capox`, { waitUntil: 'load' });
    await p.waitForTimeout(300);
    ok('inline confirm sits under the selected row', await p.evaluate(() =>
      document.querySelector('.reg.on')?.nextElementSibling?.querySelector('#picker-confirm') != null));
    await p.evaluate(() => { [...document.querySelectorAll('#editor .node-h')].find(h => h.textContent.includes('CAPOX')).click(); });
    await p.waitForTimeout(150);
    await p.evaluate(() => {
      const inp = document.querySelector('.node.open input[data-k=name]');
      inp.value = 'Renamed QA step'; inp.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await p.waitForTimeout(350);
    ok('renaming a step updates the map label', await p.evaluate(() =>
      document.querySelector('#sheet .route svg').textContent.includes('Renamed QA')));
    await p.evaluate(() => {
      const btn = [...document.querySelector('.node.open').querySelectorAll('button.mod')]
        .find(x => x.textContent.includes('Immunotherapy') && !x.classList.contains('on'));
      if (btn) btn.click();
    });
    await p.waitForTimeout(350);
    ok('adding a type extends the map label', await p.evaluate(() =>
      document.querySelector('#sheet .route svg').textContent.includes('immunotherapy')));
    const link = await p.evaluate(() => document.getElementById('linkout').value);
    ok('share link generated', /#p=/.test(link));
    if (/#p=/.test(link)){
      const p2 = await b.newPage(); hook(p2);
      await p2.goto(link.replace(/^https?:\/\/[^\/]+/, BASE), { waitUntil: 'load' });
      await p2.waitForTimeout(350);
      ok('share link opens the plan in patient view', await p2.evaluate(() =>
        document.body.classList.contains('patient') && document.body.innerText.includes('Renamed QA step')));
      await p2.close();
    }

    // ---- phone: pick flow, docked sticky map, expander ----
    const m = await b.newPage({ viewport: { width: 390, height: 844 } });
    hook(m);
    await m.goto(`${BASE}/app.html`, { waitUntil: 'load' });
    await m.waitForTimeout(400);
    ok('phone opens in pick mode (editor hidden)', await m.evaluate(() =>
      document.body.classList.contains('mpick') && getComputedStyle(document.querySelector('.main')).display === 'none'));
    ok('preview card nests under the selected row', await m.evaluate(() => {
      const peek = document.getElementById('mpeek');
      return !peek.hidden && peek.previousElementSibling?.classList.contains('on');
    }));
    await m.click('#mpeek [data-mconfirm]');
    await m.waitForTimeout(350);
    ok('confirm docks the collapsed handout', await m.evaluate(() =>
      document.body.classList.contains('msheet') && getComputedStyle(document.querySelector('#sheet .steps')).display === 'none'));
    await m.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await m.waitForTimeout(250);
    ok('docked map stays pinned while scrolling', await m.evaluate(() => {
      const r = document.querySelector('#sheet .route svg').getBoundingClientRect();
      return r.top >= 0 && r.bottom <= innerHeight;
    }));
    await m.click('#mexpand'); await m.waitForTimeout(250);
    ok('expander shows the full handout', await m.evaluate(() =>
      getComputedStyle(document.querySelector('#sheet .steps')).display !== 'none'));
    await m.close();

    ok('no page errors anywhere', errs.length === 0);
    if (errs.length) console.log('page errors:', errs.slice(0, 5));
  } finally {
    if (b) await b.close();
    srv.kill();
  }
  console.log(out.join('\n'));
  const fails = out.filter(l => l.startsWith('FAIL')).length;
  console.log(fails ? `\n${fails} failure(s).` : '\nOK');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e.message); process.exit(1); });
