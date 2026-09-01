// Dependency-free sanity check for ONCourse. Run: node tests/check.js
// Exits non-zero if the library is malformed, so it can gate a commit.
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/../regimens.js', 'utf8');
const ctx = {}; new Function('with(this){' + src + '; this.LIBRARY = LIBRARY; this.CHANGELOG = CHANGELOG; this.APP_VERSION = APP_VERSION; this.MODS = MODS; }').call(ctx);
const { LIBRARY, CHANGELOG, APP_VERSION, MODS } = ctx;
const errors = [], warnings = [];
const ids = new Set();
const CATS = ['breast','gi','lung','gu','hn','skin','other'];
for (const r of LIBRARY){
  const tag = `[${r.id || '?'}]`;
  for (const k of ['id','disease','group','name','plan','title','subtitle','trial','summary','nodes','refs','added','reviewed','reviewedBy']) if (r[k] === undefined || r[k] === '') errors.push(`${tag} missing ${k}`);
  if (ids.has(r.id)) errors.push(`${tag} duplicate id`); ids.add(r.id);
  if (!CATS.includes(r.disease)) errors.push(`${tag} unknown disease category ${r.disease}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.added || '') || !/^\d{4}-\d{2}-\d{2}$/.test(r.reviewed || '')) errors.push(`${tag} dates must be YYYY-MM-DD`);
  if (!Array.isArray(r.refs) || !r.refs.length) warnings.push(`${tag} has no references`);
  let decisions = 0;
  (function walk(ns, depth){
    if (!Array.isArray(ns) || !ns.length) errors.push(`${tag} empty node list`);
    for (const n of ns || []){
      if (!['phase','rest','event','decision'].includes(n.t)) errors.push(`${tag} bad node type ${n.t}`);
      if (n.t === 'phase'){
        if (!n.name || !n.plain) errors.push(`${tag} phase "${n.name || '?'}" needs name and plain text`);
        for (const m of n.mods || []) if (!MODS[m]) errors.push(`${tag} unknown modality ${m}`);
        if ((n.mods || []).includes('watch') && n.mods.length > 1) errors.push(`${tag} surveillance must be the only type on "${n.name}"`);
        if (n.mode === 'cycles' && !(+n.cycles > 0 && +n.cycleDays > 0)) errors.push(`${tag} "${n.name}" cycles/cycleDays must be positive`);
        if (n.mode !== 'cycles' && n.mode !== 'weekdays' && !(+n.weeks > 0)) errors.push(`${tag} "${n.name}" needs weeks`);
        if (n.plain && n.plain.length > 420) warnings.push(`${tag} "${n.name}" plain text is long (${n.plain.length} chars)`);
      }
      if (n.t === 'decision'){
        decisions++;
        if (depth > 0) errors.push(`${tag} decisions must be top-level`);
        if (!n.branches || n.branches.length < 2) errors.push(`${tag} decision "${n.name}" needs 2+ branches`);
        for (const b of n.branches || []){ if (!b.cond) errors.push(`${tag} branch without a condition`); walk(b.nodes, depth + 1); }
      }
    }
  })(r.nodes, 0);
}
if (!/^\d+\.\d+(\.\d+)?$/.test(APP_VERSION)) errors.push('APP_VERSION must look like 0.5.1');
for (const c of CHANGELOG){ if (!c.date || !c.text) errors.push('CHANGELOG entry missing date or text'); }
if (CHANGELOG[0] && LIBRARY.some(r => r.added === CHANGELOG[0].date) === false) warnings.push('Newest changelog date matches no regimen "added" date — fine if the change was not a new regimen');
console.log(`ONCourse library check: ${LIBRARY.length} pathways, version ${APP_VERSION}, ${CHANGELOG.length} changelog entries`);
warnings.forEach(w => console.log('  warning:', w));
errors.forEach(e => console.log('  ERROR:', e));
if (errors.length){ console.log(`\n${errors.length} error(s). Do not commit.`); process.exit(1); }
console.log('OK');
