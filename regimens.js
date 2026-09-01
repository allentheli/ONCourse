/* ===================== Regimen library ===================== */
const MODS = {
  chemo:     { label:'Chemotherapy',                 color:'#3457D5' },
  io:        { label:'Immunotherapy',                color:'#0E9F8E' },
  targeted:  { label:'Targeted therapy',             color:'#7A4FD6' },
  endocrine: { label:'Hormone (endocrine) therapy',  color:'#C48A16' },
  radiation: { label:'Radiation',                    color:'#E0603C' },
  surgery:   { label:'Surgery',                      color:'#172033' },
  watch:     { label:'Surveillance',                 color:'#4C9A5B' },
};

// small constructors keep the library readable
const P = (o) => Object.assign({ t:'phase', mods:['chemo'], mode:'cycles', cycleDays:21, cycles:4, on:true }, o);
const R = (name, weeks, plain) => ({ t:'rest', name, weeks, plain });
const S = (name, plain) => ({ t:'event', name, mods:['surgery'], plain });
const D = (o) => Object.assign({ t:'decision', emph:null, only:false }, o);
const Br = (cond, nodes) => ({ cond, nodes });

// reusable pieces
const RADIATION_ALONGSIDE = () => P({ name:'Radiation (if recommended)', short:'Radiation', mods:['radiation'], mode:'weekdays', weeks:'', optional:true, on:true, concurrent:true,
  plain:'Daily radiation, Monday to Friday. Your radiation oncologist sets the number of sessions. Many people need this after surgery; your team will confirm.' });
const RADIATION_AFTER = (on=true) => P({ name:'Radiation (if recommended)', short:'Radiation', mods:['radiation'], mode:'weekdays', weeks:'', optional:true, on,
  plain:'Daily radiation, Monday to Friday, starting a few weeks after the previous step ends. Your radiation oncologist sets the number of sessions.' });
const ENDOCRINE_ALONGSIDE = () => P({ name:'Hormone (endocrine) therapy, if hormone-receptor positive', short:'Hormone tablet', mods:['endocrine'], mode:'daily', weeks:260, optional:true, on:false, concurrent:true,
  plain:'If the cancer is hormone-receptor positive: one tablet a day (such as tamoxifen, letrozole, or anastrozole) for 5 to 10 years, starting around this same time.' });
const SURGERY_BREAST = () => S('Surgery', 'Lumpectomy or mastectomy, with lymph node surgery. The removed tissue is examined under the microscope to see how well the treatment worked.');
const HEAL = (weeks=4) => R('Healing after surgery', weeks, 'Time to recover from surgery before treatment restarts.');
const RECOVER = (weeks=4) => R('Recovery before surgery', weeks, 'A break for your body to recover and for the surgical team to plan. Imaging is often repeated now.');

const LIBRARY = [

/* ---------------- BREAST ---------------- */
{
  id:'kn522', plan:'Chemo-immunotherapy around surgery', group:'Triple-negative', added:'2026-08-31', reviewed:'2026-08-31', refs:[{t:'Schmid P et al. Pembrolizumab for early triple-negative breast cancer. NEJM 2020 (KEYNOTE-522)',q:'KEYNOTE-522 Schmid pembrolizumab early triple-negative NEJM 2020'},{t:'Schmid P et al. Overall survival with pembrolizumab in early-stage TNBC. NEJM 2024',q:'KEYNOTE-522 overall survival Schmid NEJM 2024'}], disease:'breast', name:'KEYNOTE-522: chemo + pembrolizumab, surgery, pembrolizumab',
  trial:'KEYNOTE-522', summary:'Triple-negative, stage II–III. Neoadjuvant chemo-immunotherapy, surgery, adjuvant pembrolizumab.',
  title:'Chemotherapy with immunotherapy before surgery, then immunotherapy after',
  subtitle:'Triple-negative breast cancer, stage II to III',
  nodes:[
    P({ name:'Paclitaxel + carboplatin + pembrolizumab (Keytruda)', short:'Carbo + paclitaxel + immunotherapy', mods:['chemo','io'], cycleDays:21, cycles:4,
        visits:[{d:1,label:'Paclitaxel, carboplatin, and pembrolizumab'},{d:8,label:'Paclitaxel and carboplatin'},{d:15,label:'Paclitaxel and carboplatin'}],
        plain:'Paclitaxel weekly plus carboplatin (weekly or once per 3-week cycle), plus pembrolizumab every 3 weeks. Pembrolizumab is immunotherapy: it helps your own immune system recognize and attack cancer cells.' }),
    P({ name:'Doxorubicin (or epirubicin) + cyclophosphamide + pembrolizumab', short:'AC + immunotherapy', mods:['chemo','io'], cycleDays:21, cycles:4,
        visits:[{d:1,label:'Doxorubicin, cyclophosphamide, and pembrolizumab'}],
        plain:'Two different chemotherapy drugs every 3 weeks, with pembrolizumab continuing. A growth-factor injection after each dose helps your blood counts recover.' }),
    RECOVER(4),
    SURGERY_BREAST(),
    HEAL(5),
    D({ name:'Pathology results', short:'Results', question:'What did the pathology report show?',
        plain:'The report tells us whether any cancer remained in the tissue removed at surgery. Immunotherapy continues either way; if cancer remained, an oral chemotherapy may be added.',
        branches:[
          Br('No remaining cancer (complete response)', [
            P({ name:'Pembrolizumab (Keytruda)', short:'Pembrolizumab', mods:['io'], cycleDays:21, cycles:9, plain:'Immunotherapy on its own, every 3 weeks, for 9 more doses. Each visit is short.' }),
            RADIATION_ALONGSIDE(),
          ]),
          Br('Some cancer remained', [
            P({ name:'Pembrolizumab (Keytruda)', short:'Pembrolizumab', mods:['io'], cycleDays:21, cycles:9, plain:'Immunotherapy on its own, every 3 weeks, for 9 more doses.' }),
            P({ name:'Capecitabine (oral chemotherapy)', short:'Capecitabine tablets', mods:['chemo'], cycleDays:21, cycles:8, optional:true, on:true, concurrent:true,
                visits:[{d:1,label:'Start 14 days of capecitabine tablets, then 7 days off'}],
                plain:'Chemotherapy tablets taken at home for 2 weeks out of every 3, for about 6 months, alongside immunotherapy. If you carry a BRCA gene change, olaparib tablets for 1 year may be recommended instead.' }),
            RADIATION_ALONGSIDE(),
          ]),
        ] }),
  ]
},
{
  id:'db11', plan:'HER2-targeted therapy around surgery', group:'HER2-positive', added:'2026-08-31', reviewed:'2026-08-31', refs:[{t:'DESTINY-Breast11 primary publication (Annals of Oncology, 2026)',q:'DESTINY-Breast11 trastuzumab deruxtecan neoadjuvant'},{t:'Geyer CE et al. DESTINY-Breast05: T-DXd vs T-DM1 for residual disease. NEJM 2026',q:'DESTINY-Breast05 trastuzumab deruxtecan residual invasive disease'}], disease:'breast', name:'DESTINY-Breast11: T-DXd then THP, surgery, HER2 therapy',
  trial:'DESTINY-Breast11', summary:'HER2-positive, high-risk stage II–III. T-DXd ×4, THP ×4, surgery, adjuvant HER2 therapy by response.',
  title:'HER2-targeted treatment before surgery, then continued after',
  subtitle:'HER2-positive breast cancer, stage II to III',
  nodes:[
    P({ name:'Trastuzumab deruxtecan (Enhertu)', short:'Enhertu (T-DXd)', mods:['targeted'], cycleDays:21, cycles:4,
        plain:'An antibody that locks onto the HER2 protein on cancer cells and delivers chemotherapy directly inside them. Given by IV every 3 weeks, 4 times.' }),
    P({ name:'Paclitaxel + trastuzumab + pertuzumab (THP)', short:'Paclitaxel + HER2 antibodies', mods:['chemo','targeted'], cycleDays:21, cycles:4,
        visits:[{d:1,label:'Paclitaxel, trastuzumab, and pertuzumab'},{d:8,label:'Paclitaxel'},{d:15,label:'Paclitaxel'}],
        plain:'Weekly chemotherapy (paclitaxel) plus two HER2-targeted antibodies every 3 weeks.' }),
    RECOVER(4),
    SURGERY_BREAST(),
    HEAL(4),
    D({ name:'Pathology results', short:'Results', question:'What did the pathology report show?',
        plain:'The report tells us whether any cancer remained. HER2-targeted treatment continues either way, to complete about one year in total.',
        branches:[
          Br('No remaining cancer (complete response)', [
            P({ name:'Trastuzumab + pertuzumab', short:'HER2 antibodies (HP)', mods:['targeted'], cycleDays:21, cycles:13, plain:'The two HER2 antibodies continue every 3 weeks, without chemotherapy, to complete one year. Often given as an injection under the skin.' }),
            RADIATION_ALONGSIDE(),
            ENDOCRINE_ALONGSIDE(),
          ]),
          Br('Some cancer remained', [
            P({ name:'Trastuzumab deruxtecan (Enhertu)', short:'Enhertu (T-DXd)', mods:['targeted'], cycleDays:21, cycles:14, plain:'Trastuzumab deruxtecan every 3 weeks for up to 14 doses (DESTINY-Breast05). Trastuzumab emtansine (Kadcyla) for 14 doses is an alternative.' }),
            RADIATION_ALONGSIDE(),
            ENDOCRINE_ALONGSIDE(),
          ]),
        ] }),
  ]
},
{
  id:'tchp', plan:'Chemo with HER2 antibodies around surgery', group:'HER2-positive', added:'2026-08-31', reviewed:'2026-08-31', refs:[{t:'Schneeweiss A et al. TRYPHAENA. Annals of Oncology 2013',q:'TRYPHAENA pertuzumab trastuzumab docetaxel carboplatin neoadjuvant'},{t:'von Minckwitz G et al. KATHERINE: T-DM1 for residual disease. NEJM 2019',q:'KATHERINE trastuzumab emtansine residual invasive HER2'}], disease:'breast', name:'TCHP, surgery, trastuzumab + pertuzumab',
  trial:'NCCN standard (NeoSphere, TRAIN-2, KATHERINE, DESTINY-Breast05)', summary:'HER2-positive, stage II–III. TCHP ×6, surgery, HER2 therapy by response.',
  title:'Chemotherapy with HER2-targeted antibodies before surgery, then antibodies after',
  subtitle:'HER2-positive breast cancer, stage II to III',
  nodes:[
    P({ name:'Docetaxel + carboplatin + trastuzumab + pertuzumab (TCHP)', short:'Docetaxel + carbo + HER2 antibodies', mods:['chemo','targeted'], cycleDays:21, cycles:6,
        plain:'Two chemotherapy drugs plus two HER2-targeted antibodies, all given by IV every 3 weeks, 6 times.' }),
    RECOVER(4),
    SURGERY_BREAST(),
    HEAL(4),
    D({ name:'Pathology results', short:'Results', question:'What did the pathology report show?',
        plain:'HER2-targeted treatment continues either way, to complete about one year in total.',
        branches:[
          Br('No remaining cancer (complete response)', [
            P({ name:'Trastuzumab + pertuzumab', short:'HER2 antibodies (HP)', mods:['targeted'], cycleDays:21, cycles:11, plain:'The two antibodies continue every 3 weeks, without chemotherapy, to complete one year. Often given as an injection under the skin.' }),
            RADIATION_ALONGSIDE(),
            ENDOCRINE_ALONGSIDE(),
          ]),
          Br('Some cancer remained', [
            P({ name:'Trastuzumab deruxtecan (Enhertu) or trastuzumab emtansine (Kadcyla)', short:'Enhertu or Kadcyla', mods:['targeted'], cycleDays:21, cycles:14, plain:'An antibody that carries chemotherapy directly into HER2-positive cells, every 3 weeks for up to 14 doses.' }),
            RADIATION_ALONGSIDE(),
            ENDOCRINE_ALONGSIDE(),
          ]),
        ] }),
  ]
},
{
  id:'ddac-t', plan:'Chemotherapy after surgery', group:'Triple-negative', added:'2026-08-31', reviewed:'2026-08-31', refs:[{t:'Citron ML et al. CALGB 9741 dose-dense chemotherapy. JCO 2003',q:'CALGB 9741 dose-dense doxorubicin cyclophosphamide paclitaxel Citron'},{t:'Sparano JA et al. ECOG 1199 weekly paclitaxel. NEJM 2008',q:'ECOG 1199 weekly paclitaxel Sparano NEJM 2008'}], disease:'breast', name:'Surgery, dose-dense AC then weekly paclitaxel',
  trial:'CALGB 9741 / ECOG 1199', summary:'HR-positive or triple-negative, node-positive or high risk. Adjuvant AC ×4 (every 2 weeks), paclitaxel ×12, radiation, endocrine therapy.',
  title:'Surgery first, then chemotherapy, radiation, and hormone therapy',
  subtitle:'Breast cancer, stage II to III',
  nodes:[
    SURGERY_BREAST(),
    HEAL(4),
    P({ name:'Doxorubicin + cyclophosphamide (dose-dense AC)', short:'Doxorubicin + cyclophosphamide', mods:['chemo'], cycleDays:14, cycles:4,
        plain:'Two chemotherapy drugs every 2 weeks, with a growth-factor injection after each dose to support your blood counts.' }),
    P({ name:'Paclitaxel', short:'Paclitaxel', mods:['chemo'], cycleDays:7, cycles:12, plain:'One chemotherapy drug given weekly for 12 weeks. Visits are shorter than the AC visits.' }),
    RADIATION_AFTER(true),
    P({ name:'Hormone (endocrine) therapy, if hormone-receptor positive', short:'Hormone tablet', mods:['endocrine'], mode:'daily', weeks:260, optional:true, on:true,
        plain:'If the cancer is hormone-receptor positive: one tablet a day (such as tamoxifen, letrozole, or anastrozole) for 5 to 10 years, starting once chemotherapy is finished.' }),
  ]
},
{
  id:'hrplus', plan:'Hormone therapy plus a targeted tablet', group:'HR-positive, HER2-negative', added:'2026-08-31', reviewed:'2026-08-31', refs:[{t:'Johnston SRD et al. monarchE: abemaciclib plus endocrine therapy. JCO 2020',q:'monarchE abemaciclib adjuvant Johnston'},{t:'Slamon D et al. NATALEE: ribociclib plus NSAI. NEJM 2024',q:'NATALEE ribociclib early breast cancer Slamon NEJM 2024'}], disease:'breast', name:'HR-positive high risk: surgery, endocrine therapy + CDK4/6 inhibitor',
  trial:'monarchE / NATALEE', summary:'HR-positive, HER2-negative, high risk. Surgery, optional chemo, radiation, endocrine therapy plus abemaciclib (2 y) or ribociclib (3 y).',
  title:'Surgery, then daily tablets that block hormones and slow cancer-cell growth',
  subtitle:'Hormone-receptor positive, HER2-negative breast cancer, higher-risk stage II to III',
  nodes:[
    SURGERY_BREAST(),
    HEAL(4),
    P({ name:'Chemotherapy (if recommended)', short:'Docetaxel + cyclophosphamide', mods:['chemo'], cycleDays:21, cycles:4, optional:true, on:false,
        plain:'Chemotherapy is recommended for some people based on stage and tumor test results (such as Oncotype DX). A common option is docetaxel + cyclophosphamide every 3 weeks, 4 times.' }),
    RADIATION_AFTER(true),
    P({ name:'Hormone therapy + abemaciclib (Verzenio)', short:'Hormone + abemaciclib', mods:['endocrine','targeted'], mode:'daily', weeks:104,
        plain:'A daily hormone-blocking tablet plus abemaciclib twice a day for 2 years. Abemaciclib is a targeted drug that slows the growth of cancer cells. Ribociclib (Kisqali) for 3 years is an alternative.' }),
    P({ name:'Hormone therapy continues', short:'Hormone tablet', mods:['endocrine'], mode:'daily', weeks:156,
        plain:'The hormone-blocking tablet continues on its own to complete 5 to 10 years in total.' }),
  ]
},

/* ---------------- GI ---------------- */
{
  id:'prodige23', plan:'Treatment before and after rectal surgery', group:'Rectal', added:'2026-08-31', reviewed:'2026-08-31', refs:[{t:'Conroy T et al. PRODIGE 23. Lancet Oncology 2021',q:'PRODIGE 23 mFOLFIRINOX rectal Conroy Lancet Oncology 2021'}], disease:'gi', name:'Rectal TNT: FOLFIRINOX, chemoradiation, surgery, FOLFOX',
  trial:'PRODIGE 23', summary:'Locally advanced rectal cancer. mFOLFIRINOX ×6, long-course chemoradiation, surgery, adjuvant mFOLFOX6 ×6.',
  title:'Chemotherapy and chemoradiation before surgery, then a short course of chemotherapy after',
  subtitle:'Rectal cancer, stage II to III',
  nodes:[
    P({ name:'mFOLFIRINOX', short:'FOLFIRINOX', mods:['chemo'], cycleDays:14, cycles:6,
        visits:[{d:1,label:'Oxaliplatin, irinotecan, leucovorin, then a 5-FU pump worn home for about 46 hours'}],
        plain:'Three chemotherapy drugs by IV every 2 weeks. One of them (5-FU) runs through a small pump you wear home for about 2 days, then a nurse disconnects it.' }),
    P({ name:'Chemoradiation', short:'Radiation + capecitabine', mods:['radiation','chemo'], mode:'weekdays', weeks:5,
        plain:'Radiation to the pelvis every weekday for 5 weeks, with a low-dose chemotherapy tablet (capecitabine) on radiation days to make the radiation work better.' }),
    R('Recovery before surgery', 7, 'About 6 to 8 weeks for the tumor to keep shrinking and your body to recover. Imaging is repeated before surgery.'),
    S('Surgery (rectal resection)', 'Removal of the rectal tumor and surrounding tissue. A temporary ostomy (stoma) is common and is usually reversed a few months later.'),
    R('Healing after surgery', 6, 'Recovery from surgery, usually 6 to 8 weeks before chemotherapy restarts.'),
    P({ name:'mFOLFOX6', short:'FOLFOX', mods:['chemo'], cycleDays:14, cycles:6,
        visits:[{d:1,label:'Oxaliplatin and leucovorin, then a 5-FU pump for about 46 hours'}],
        plain:'Two chemotherapy drugs (oxaliplatin and 5-FU) every 2 weeks for 3 months, to lower the chance of the cancer coming back. Capecitabine tablets are an alternative.' }),
  ]
},
{
  id:'rapido', plan:'Radiation and chemo before rectal surgery', group:'Rectal', added:'2026-08-31', reviewed:'2026-08-31', refs:[{t:'Bahadoer RR et al. RAPIDO. Lancet Oncology 2021',q:'RAPIDO short-course radiotherapy rectal Bahadoer Lancet Oncology 2021'}], disease:'gi', name:'Rectal TNT: short-course radiation, CAPOX, surgery',
  trial:'RAPIDO', summary:'Locally advanced high-risk rectal cancer. 5 days of radiation, CAPOX ×6 (or FOLFOX ×9), surgery.',
  title:'One week of radiation, then chemotherapy, then surgery',
  subtitle:'Rectal cancer, stage II to III (higher risk)',
  nodes:[
    P({ name:'Short-course radiation', short:'Radiation (5 days)', mods:['radiation'], mode:'weekdays', weeks:1,
        plain:'Five daily radiation treatments over one week.' }),
    R('Short break', 2, 'Chemotherapy starts about 2 weeks after radiation ends (11 to 18 days in the RAPIDO trial).'),
    P({ name:'CAPOX', short:'CAPOX', mods:['chemo'], cycleDays:21, cycles:6,
        visits:[{d:1,label:'Oxaliplatin by IV, then capecitabine tablets twice a day for 14 days'}],
        plain:'Oxaliplatin by IV every 3 weeks plus capecitabine tablets at home for 2 of every 3 weeks, for about 4 and a half months. FOLFOX every 2 weeks (9 cycles) is an alternative.' }),
    R('Recovery before surgery', 3, 'A short break of 2 to 4 weeks, with imaging to plan surgery.'),
    S('Surgery (rectal resection)', 'Removal of the rectal tumor and surrounding tissue. A temporary ostomy (stoma) is common and is usually reversed a few months later.'),
    R('Healing after surgery', 6, 'Recovery from surgery. No further chemotherapy is planned after surgery in this approach.'),
  ]
},
{
  id:'opra', plan:'Treatment first, surgery only if needed', group:'Rectal', added:'2026-08-31', reviewed:'2026-08-31', refs:[{t:'Garcia-Aguilar J et al. OPRA organ preservation. JCO 2022',q:'OPRA organ preservation rectal Garcia-Aguilar JCO 2022'},{t:'Verheij FS et al. OPRA long-term results. JCO 2024',q:'OPRA long-term results watch-and-wait Verheij'}], disease:'gi', name:'Rectal organ preservation: chemoradiation, FOLFOX, then watch-and-wait or surgery',
  trial:'OPRA', summary:'Rectal cancer aiming to avoid surgery. Chemoradiation, consolidation FOLFOX ×8, restaging, then watch-and-wait if complete response.',
  title:'Chemoradiation and chemotherapy first, then a decision about surgery',
  subtitle:'Rectal cancer, stage II to III',
  nodes:[
    P({ name:'Chemoradiation', short:'Radiation + capecitabine', mods:['radiation','chemo'], mode:'weekdays', weeks:6,
        plain:'Radiation to the pelvis every weekday for about 5 to 6 weeks, with a low-dose chemotherapy tablet (capecitabine) on radiation days.' }),
    P({ name:'Consolidation chemotherapy (FOLFOX)', short:'FOLFOX', mods:['chemo'], cycleDays:14, cycles:8,
        visits:[{d:1,label:'Oxaliplatin and leucovorin, then a 5-FU pump for about 46 hours'}],
        plain:'Oxaliplatin and 5-FU every 2 weeks for 8 cycles (about 4 months), given after radiation to shrink the tumor as much as possible. CAPOX (5 cycles) is an alternative.' }),
    R('Recovery and restaging', 8, 'About 8 weeks after chemotherapy ends (the trial allowed 4 to 12): an exam, a scope, and an MRI to see whether any tumor remains.'),
    D({ name:'Restaging results', short:'Results', question:'Is there any tumor left?',
        plain:'Whether surgery is needed depends on what the exam, scope, and MRI show.',
        branches:[
          Br('No tumor found (complete response)', [
            P({ name:'Watch and wait (close monitoring)', short:'Watch and wait', mods:['watch'], mode:'ongoing', weeks:104, freqText:'Exam, scope, and MRI every 3 to 4 months',
                plain:'No surgery for now. Exams, scopes, and MRIs every 3 to 4 months for 2 years, then less often. If the tumor regrows, surgery is done at that point and is still effective for most people.' }),
          ]),
          Br('Tumor still present', [
            S('Surgery (rectal resection)', 'Removal of the rectal tumor and surrounding tissue. A temporary ostomy (stoma) is common and is usually reversed a few months later.'),
            R('Healing after surgery', 6, 'Recovery from surgery, followed by regular monitoring.'),
          ]),
        ] }),
  ]
},
{
  id:'flot', plan:'Chemo-immunotherapy around stomach surgery', group:'Esophageal and stomach', added:'2026-08-31', reviewed:'2026-08-31', refs:[{t:'Al-Batran SE et al. FLOT4-AIO. Lancet 2019',q:'FLOT4 perioperative docetaxel oxaliplatin Al-Batran Lancet 2019'},{t:'Janjigian YY et al. MATTERHORN: perioperative durvalumab. NEJM 2025',q:'MATTERHORN durvalumab FLOT gastric NEJM 2025'}], disease:'gi', name:'Gastric/GEJ: FLOT + durvalumab, surgery, FLOT + durvalumab',
  trial:'FLOT4 / MATTERHORN', summary:'Resectable stomach or GEJ adenocarcinoma. FLOT ×4 with durvalumab, surgery, FLOT ×4 with durvalumab, durvalumab ×10.',
  title:'Chemotherapy with immunotherapy before and after surgery',
  subtitle:'Stomach or gastroesophageal junction cancer, stage II to III',
  nodes:[
    P({ name:'FLOT chemotherapy', short:'FLOT', mods:['chemo'], cycleDays:14, cycles:4,
        visits:[{d:1,label:'Docetaxel, oxaliplatin, leucovorin, then a 5-FU pump worn home for 24 hours'}],
        plain:'Four chemotherapy drugs by IV every 2 weeks, 4 times. One of them (5-FU) runs through a small pump you wear home for a day.' }),
    P({ name:'Durvalumab (Imfinzi)', short:'Durvalumab', mods:['io'], cycleDays:28, cycles:2, optional:true, on:true, concurrent:true,
        plain:'Immunotherapy by IV every 4 weeks, on the same days as chemotherapy: 2 doses before surgery. It helps your immune system recognize and attack cancer cells.' }),
    R('Recovery before surgery', 5, 'About 4 to 6 weeks to recover, with scans to plan the operation.'),
    S('Surgery (gastrectomy)', 'Removal of part or all of the stomach, with nearby lymph nodes. Recovery takes several weeks and includes learning a new way of eating.'),
    R('Healing after surgery', 7, 'Recovery and adjusting to eating after stomach surgery, usually 6 to 8 weeks before treatment restarts.'),
    P({ name:'FLOT chemotherapy', short:'FLOT', mods:['chemo'], cycleDays:14, cycles:4,
        visits:[{d:1,label:'Docetaxel, oxaliplatin, leucovorin, then a 5-FU pump worn home for 24 hours'}],
        plain:'The same four chemotherapy drugs every 2 weeks, 4 more times.' }),
    P({ name:'Durvalumab (Imfinzi)', short:'Durvalumab', mods:['io'], cycleDays:28, cycles:2, optional:true, on:true, concurrent:true,
        plain:'Immunotherapy every 4 weeks, on chemotherapy days: 2 doses after surgery.' }),
    P({ name:'Durvalumab (Imfinzi) alone', short:'Durvalumab alone', mods:['io'], cycleDays:28, cycles:10, optional:true, on:true,
        plain:'Immunotherapy on its own every 4 weeks for 10 more doses (about 10 months). Each visit is short.' }),
  ]
},
{
  id:'cross', plan:'Chemoradiation, then surgery', group:'Esophageal and stomach', added:'2026-08-31', reviewed:'2026-08-31', refs:[{t:'van Hagen P et al. CROSS. NEJM 2012',q:'CROSS chemoradiotherapy esophageal van Hagen NEJM 2012'},{t:'Kelly RJ et al. CheckMate 577: adjuvant nivolumab. NEJM 2021',q:'CheckMate 577 adjuvant nivolumab esophageal Kelly NEJM 2021'}], disease:'gi', name:'Esophageal: CROSS chemoradiation, surgery, nivolumab if needed',
  trial:'CROSS / CheckMate 577', summary:'Esophageal or GEJ cancer, stage II–III. Weekly carboplatin/paclitaxel with radiation, surgery, adjuvant nivolumab if cancer remained.',
  title:'Chemoradiation, then surgery, then immunotherapy if any cancer remained',
  subtitle:'Esophageal or gastroesophageal junction cancer, stage II to III',
  nodes:[
    P({ name:'Chemoradiation (CROSS)', short:'Radiation + carbo/paclitaxel', mods:['radiation','chemo'], mode:'weekdays', weeks:5,
        plain:'Radiation every weekday for about 5 weeks, plus low-dose carboplatin and paclitaxel by IV once a week to make the radiation more effective.' }),
    R('Recovery before surgery', 7, 'Recovery and restaging scans. Surgery usually happens 6 to 8 weeks after radiation ends.'),
    S('Surgery (esophagectomy)', 'Removal of the affected part of the esophagus; the stomach is reshaped to reconnect. Recovery takes several weeks.'),
    R('Healing after surgery', 8, 'Recovery from surgery; treatment, if needed, restarts 4 to 16 weeks after the operation.'),
    D({ name:'Pathology results', short:'Results', question:'What did the pathology report show?',
        plain:'If no cancer remained in the removed tissue, no further treatment is needed. If some remained, a year of immunotherapy lowers the chance of it coming back.',
        branches:[
          Br('No remaining cancer (complete response)', [
            P({ name:'Monitoring', short:'Surveillance', mods:['watch'], mode:'ongoing', weeks:52, freqText:'Visits and scans every 3 to 6 months',
                plain:'No further treatment. Visits and scans on a regular schedule.' }),
          ]),
          Br('Some cancer remained', [
            P({ name:'Nivolumab (Opdivo)', short:'Nivolumab', mods:['io'], cycleDays:14, cycles:8, plain:'Immunotherapy by IV every 2 weeks for the first 16 weeks. It helps your immune system recognize and attack cancer cells.' }),
            P({ name:'Nivolumab (Opdivo)', short:'Nivolumab', mods:['io'], cycleDays:28, cycles:9, plain:'Then every 4 weeks to complete one year in total.' }),
          ]),
        ] }),
  ]
},
{
  id:'capox', plan:'Chemotherapy after colon surgery', group:'Colon', added:'2026-08-31', reviewed:'2026-08-31', refs:[{t:'Grothey A et al. IDEA collaboration: 3 vs 6 months. NEJM 2018',q:'IDEA collaboration duration adjuvant oxaliplatin colon Grothey NEJM 2018'}], disease:'gi', name:'Colon stage III: surgery, CAPOX (3 or 6 months)',
  trial:'IDEA collaboration', summary:'Stage III colon cancer. Surgery, adjuvant CAPOX ×4 (3 months) or ×8 (6 months), surveillance.',
  title:'Surgery, then chemotherapy to lower the chance of the cancer returning',
  subtitle:'Colon cancer, stage III',
  nodes:[
    S('Surgery (colectomy)', 'Removal of the section of colon containing the cancer, with nearby lymph nodes.'),
    R('Healing after surgery', 5, 'Recovery from surgery. Chemotherapy usually starts within 6 to 8 weeks of the operation.'),
    P({ name:'CAPOX', short:'CAPOX', mods:['chemo'], cycleDays:21, cycles:4,
        visits:[{d:1,label:'Oxaliplatin by IV, then capecitabine tablets twice a day for 14 days'}],
        plain:'Oxaliplatin by IV every 3 weeks plus capecitabine tablets at home for 2 of every 3 weeks. Four cycles (3 months) for most stage III cancers; 8 cycles (6 months) for higher-risk cancers. FOLFOX every 2 weeks is an alternative.' }),
    P({ name:'Monitoring (surveillance)', short:'Surveillance', mods:['watch'], mode:'ongoing', weeks:52, freqText:'Blood test every 3 to 6 months, scan yearly',
        plain:'Regular check-ups: a blood test (CEA) every 3 to 6 months, a CT scan every 6 to 12 months, and a colonoscopy about one year after surgery.' }),
  ]
},
{
  id:'prodige24', plan:'Chemotherapy after pancreas surgery', group:'Pancreas', added:'2026-08-31', reviewed:'2026-08-31', refs:[{t:'Conroy T et al. PRODIGE 24: adjuvant mFOLFIRINOX. NEJM 2018',q:'PRODIGE 24 FOLFIRINOX adjuvant pancreatic Conroy NEJM 2018'}], disease:'gi', name:'Pancreatic: surgery, adjuvant mFOLFIRINOX',
  trial:'PRODIGE 24', summary:'Resected pancreatic cancer. Surgery, mFOLFIRINOX ×12 (6 months), surveillance.',
  title:'Surgery, then six months of chemotherapy',
  subtitle:'Pancreatic cancer, removed by surgery',
  nodes:[
    S('Surgery (Whipple or distal pancreatectomy)', 'Removal of the part of the pancreas containing the cancer, with nearby lymph nodes.'),
    R('Healing after surgery', 8, 'Recovery from surgery. Chemotherapy usually starts 6 to 12 weeks after the operation.'),
    P({ name:'mFOLFIRINOX', short:'FOLFIRINOX', mods:['chemo'], cycleDays:14, cycles:12,
        visits:[{d:1,label:'Oxaliplatin, irinotecan, leucovorin, then a 5-FU pump worn home for about 46 hours'}],
        plain:'Three chemotherapy drugs by IV every 2 weeks for 6 months. One of them (5-FU) runs through a small pump you wear home for about 2 days.' }),
    P({ name:'Monitoring (surveillance)', short:'Surveillance', mods:['watch'], mode:'ongoing', weeks:52, freqText:'Visits, blood tests, and scans every 3 to 6 months',
        plain:'Regular visits with blood tests and scans every 3 to 6 months.' }),
  ]
},

/* ---------------- LUNG ---------------- */
{
  id:'kn671', plan:'Chemo-immunotherapy around lung surgery', group:'Non-small cell, operable', added:'2026-08-31', reviewed:'2026-08-31', refs:[{t:'Wakelee H et al. KEYNOTE-671. NEJM 2023',q:'KEYNOTE-671 perioperative pembrolizumab Wakelee NEJM 2023'}], disease:'lung', name:'KEYNOTE-671: chemo + pembrolizumab, surgery, pembrolizumab',
  trial:'KEYNOTE-671', summary:'Resectable NSCLC, stage II–IIIB. Cisplatin doublet + pembrolizumab ×4, surgery, pembrolizumab ×13.',
  title:'Chemotherapy with immunotherapy before surgery, then immunotherapy after',
  subtitle:'Non-small cell lung cancer, stage II to III (operable)',
  nodes:[
    P({ name:'Cisplatin-based chemotherapy + pembrolizumab (Keytruda)', short:'Cisplatin chemo + pembrolizumab', mods:['chemo','io'], cycleDays:21, cycles:4,
        visits:[{d:1,label:'Cisplatin, pemetrexed (or gemcitabine), and pembrolizumab'}],
        plain:'Chemotherapy (cisplatin with pemetrexed or gemcitabine) plus pembrolizumab every 3 weeks, 4 times, to shrink the cancer before surgery. Pembrolizumab is immunotherapy: it helps your immune system recognize and attack cancer cells.' }),
    RECOVER(4),
    S('Surgery (lung resection)', 'Removal of the lobe (or part) of the lung containing the cancer, plus nearby lymph nodes.'),
    R('Healing after surgery', 6, 'Recovery from surgery. Treatment restarts 4 to 12 weeks after the operation.'),
    RADIATION_AFTER(false),
    P({ name:'Pembrolizumab (Keytruda)', short:'Pembrolizumab', mods:['io'], cycleDays:21, cycles:13, plain:'Immunotherapy on its own every 3 weeks for 13 doses (about 9 months). Each visit is short.' }),
  ]
},
{
  id:'cm816', plan:'Chemo-immunotherapy before lung surgery', group:'Non-small cell, operable', added:'2026-08-31', reviewed:'2026-08-31', refs:[{t:'Forde PM et al. CheckMate 816. NEJM 2022',q:'CheckMate 816 neoadjuvant nivolumab Forde NEJM 2022'}], disease:'lung', name:'CheckMate 816: chemo + nivolumab, then surgery',
  trial:'CheckMate 816', summary:'Resectable NSCLC, stage IB–IIIA. Platinum doublet + nivolumab ×3, surgery, then treatment based on pathology.',
  title:'Chemotherapy with immunotherapy before surgery',
  subtitle:'Non-small cell lung cancer, stage IB to IIIA (operable)',
  nodes:[
    P({ name:'Platinum-based chemotherapy + nivolumab (Opdivo)', short:'Platinum chemo + nivolumab', mods:['chemo','io'], cycleDays:21, cycles:3,
        plain:'Chemotherapy plus nivolumab immunotherapy every 3 weeks, 3 times, to shrink the cancer before surgery.' }),
    RECOVER(4),
    S('Surgery (lung resection)', 'Removal of the lobe (or part) of the lung containing the cancer, plus nearby lymph nodes.'),
    R('Healing after surgery', 6, 'Recovery from surgery while the pathology report is reviewed.'),
    D({ name:'Pathology results', short:'Results', question:'What did the pathology report show?',
        plain:'If no cancer remained, monitoring is enough. If some remained, your doctor will discuss further treatment.',
        branches:[
          Br('No remaining cancer (complete response)', [
            P({ name:'Monitoring', short:'Surveillance', mods:['watch'], mode:'ongoing', weeks:52, freqText:'Visits and scans every 3 to 6 months', plain:'No further treatment. Visits and CT scans on a regular schedule.' }),
          ]),
          Br('Some cancer remained', [
            P({ name:'Further treatment (to be discussed)', short:'Further treatment', mods:['io'], cycleDays:28, cycles:13, optional:true, on:true,
                plain:'Options may include continuing immunotherapy for up to a year (as in the CheckMate 77T study), more chemotherapy, or radiation, depending on the pathology.' }),
          ]),
        ] }),
  ]
},
{
  id:'cm77t', plan:'Chemo-immunotherapy around lung surgery', group:'Non-small cell, operable', added:'2026-08-31', reviewed:'2026-08-31', refs:[{t:'Cascone T et al. CheckMate 77T. NEJM 2024',q:'CheckMate 77T perioperative nivolumab Cascone NEJM 2024'}], disease:'lung', name:'CheckMate 77T: chemo + nivolumab, surgery, nivolumab',
  trial:'CheckMate 77T', summary:'Resectable NSCLC, stage II–IIIB. Platinum doublet + nivolumab ×4, surgery, nivolumab every 4 weeks for a year.',
  title:'Chemotherapy with immunotherapy before surgery, then immunotherapy after',
  subtitle:'Non-small cell lung cancer, stage II to III (operable)',
  nodes:[
    P({ name:'Platinum-based chemotherapy + nivolumab (Opdivo)', short:'Platinum chemo + nivolumab', mods:['chemo','io'], cycleDays:21, cycles:4,
        plain:'Chemotherapy plus nivolumab immunotherapy every 3 weeks, 4 times, to shrink the cancer before surgery.' }),
    RECOVER(4),
    S('Surgery (lung resection)', 'Removal of the lobe (or part) of the lung containing the cancer, plus nearby lymph nodes.'),
    R('Healing after surgery', 6, 'Recovery from surgery before immunotherapy restarts.'),
    P({ name:'Nivolumab (Opdivo)', short:'Nivolumab', mods:['io'], cycleDays:28, cycles:13, plain:'Immunotherapy on its own every 4 weeks for up to a year. Each visit is short.' }),
  ]
},
{
  id:'pacific', plan:'Chemoradiation, then immunotherapy', group:'Non-small cell, stage III', added:'2026-08-31', reviewed:'2026-08-31', refs:[{t:'Antonia SJ et al. PACIFIC. NEJM 2017',q:'PACIFIC durvalumab stage III Antonia NEJM 2017'}], disease:'lung', name:'PACIFIC: chemoradiation, then durvalumab',
  trial:'PACIFIC', summary:'Unresectable stage III NSCLC. Concurrent chemoradiation, then durvalumab for up to 12 months.',
  title:'Chemoradiation, then a year of immunotherapy',
  subtitle:'Non-small cell lung cancer, stage III (not treated with surgery)',
  nodes:[
    P({ name:'Chemoradiation', short:'Chemoradiation', mods:['radiation','chemo'], mode:'weekdays', weeks:6,
        plain:'Radiation to the chest every weekday for about 6 weeks, with chemotherapy at the same time (commonly weekly carboplatin and paclitaxel, or cisplatin and etoposide every 3 weeks).' }),
    R('Recovery', 3, 'A short break of 1 to 6 weeks. A CT scan confirms the cancer has not grown before immunotherapy starts.'),
    P({ name:'Durvalumab (Imfinzi)', short:'Durvalumab', mods:['io'], cycleDays:28, cycles:13, plain:'Immunotherapy by IV every 4 weeks (or every 2 weeks) for up to 12 months. It helps your immune system keep the cancer from coming back.' }),
  ]
},
{
  id:'adaura', plan:'Surgery, then a targeted tablet', group:'Non-small cell, operable', added:'2026-08-31', reviewed:'2026-08-31', refs:[{t:'Wu YL et al. ADAURA. NEJM 2020',q:'ADAURA osimertinib adjuvant Wu NEJM 2020'},{t:'Tsuboi M et al. ADAURA overall survival. NEJM 2023',q:'ADAURA overall survival osimertinib Tsuboi NEJM 2023'}], disease:'lung', name:'ADAURA: surgery, chemo, osimertinib for 3 years',
  trial:'ADAURA', summary:'EGFR-mutated NSCLC, stage IB–IIIA, resected. Surgery, optional cisplatin doublet ×4, osimertinib daily for 3 years.',
  title:'Surgery, then a daily targeted tablet for three years',
  subtitle:'Non-small cell lung cancer with an EGFR mutation, stage IB to IIIA',
  nodes:[
    S('Surgery (lung resection)', 'Removal of the lobe (or part) of the lung containing the cancer, plus nearby lymph nodes.'),
    HEAL(6),
    P({ name:'Chemotherapy (if recommended)', short:'Cisplatin chemo', mods:['chemo'], cycleDays:21, cycles:4, optional:true, on:true,
        plain:'Cisplatin-based chemotherapy every 3 weeks, 4 times, is recommended for many stage II to III cancers before starting the targeted tablet.' }),
    P({ name:'Osimertinib (Tagrisso)', short:'Osimertinib', mods:['targeted'], mode:'daily', weeks:156, freqText:'One tablet daily; clinic visits every 2 to 3 months',
        plain:'A targeted tablet taken once a day for 3 years. It blocks the EGFR signal that drives this type of cancer. Clinic visits and scans every few months.' }),
    P({ name:'Monitoring (surveillance)', short:'Surveillance', mods:['watch'], mode:'ongoing', weeks:104, freqText:'Visits and scans every 6 months', plain:'Regular visits and CT scans after the tablet is finished.' }),
  ]
},
{
  id:'alina', plan:'Surgery, then a targeted tablet', group:'Non-small cell, operable', added:'2026-08-31', reviewed:'2026-08-31', refs:[{t:'Wu YL et al. ALINA: adjuvant alectinib. NEJM 2024',q:'ALINA alectinib adjuvant ALK Wu NEJM 2024'}], disease:'lung', name:'ALINA: surgery, alectinib for 2 years',
  trial:'ALINA', summary:'ALK-positive NSCLC, stage IB–IIIA, resected. Surgery, alectinib twice daily for 2 years.',
  title:'Surgery, then a targeted tablet for two years',
  subtitle:'Non-small cell lung cancer with an ALK rearrangement, stage IB to IIIA',
  nodes:[
    S('Surgery (lung resection)', 'Removal of the lobe (or part) of the lung containing the cancer, plus nearby lymph nodes.'),
    HEAL(6),
    P({ name:'Alectinib (Alecensa)', short:'Alectinib', mods:['targeted'], mode:'daily', weeks:104, freqText:'Tablets twice daily; clinic visits every 2 to 3 months',
        plain:'A targeted tablet taken twice a day for 2 years. It blocks the ALK signal that drives this type of cancer. Clinic visits and scans every few months.' }),
    P({ name:'Monitoring (surveillance)', short:'Surveillance', mods:['watch'], mode:'ongoing', weeks:104, freqText:'Visits and scans every 6 months', plain:'Regular visits and CT scans after the tablet is finished.' }),
  ]
},
{
  id:'laura', plan:'Chemoradiation, then a targeted tablet', group:'Non-small cell, stage III', added:'2026-08-31', reviewed:'2026-08-31', refs:[{t:'Lu S et al. LAURA. NEJM 2024',q:'LAURA osimertinib after chemoradiotherapy stage III NEJM 2024'}], disease:'lung', name:'LAURA: chemoradiation, then osimertinib',
  trial:'LAURA', summary:'EGFR-mutated unresectable stage III NSCLC. Chemoradiation, then osimertinib daily as long as it keeps working.',
  title:'Chemoradiation, then a daily targeted tablet',
  subtitle:'Non-small cell lung cancer with an EGFR mutation, stage III (not treated with surgery)',
  nodes:[
    P({ name:'Chemoradiation', short:'Chemoradiation', mods:['radiation','chemo'], mode:'weekdays', weeks:6,
        plain:'Radiation to the chest every weekday for about 6 weeks, with chemotherapy at the same time.' }),
    R('Recovery', 3, 'A short break of 1 to 6 weeks. A CT scan confirms the cancer has not grown before the tablet starts.'),
    P({ name:'Osimertinib (Tagrisso)', short:'Osimertinib', mods:['targeted'], mode:'daily', weeks:156, openEnded:true, freqText:'One tablet daily; clinic visits every 2 to 3 months',
        plain:'A targeted tablet taken once a day for as long as it keeps the cancer controlled, which is often years. Scans every few months check that it is working.' }),
  ]
},
{
  id:'adriatic', plan:'Chemoradiation, then immunotherapy', group:'Small cell', added:'2026-08-31', reviewed:'2026-08-31', refs:[{t:'Cheng Y et al. ADRIATIC. NEJM 2024',q:'ADRIATIC durvalumab limited-stage small-cell Cheng NEJM 2024'}], disease:'lung', name:'Limited-stage SCLC: chemoradiation, then durvalumab',
  trial:'ADRIATIC', summary:'Limited-stage small cell lung cancer. Cisplatin/etoposide ×4 with concurrent chest radiation, optional PCI, durvalumab for up to 2 years.',
  title:'Chemotherapy with radiation, then up to two years of immunotherapy',
  subtitle:'Small cell lung cancer, limited stage',
  nodes:[
    P({ name:'Cisplatin (or carboplatin) + etoposide', short:'Cisplatin + etoposide', mods:['chemo'], cycleDays:21, cycles:4,
        visits:[{d:1,label:'Cisplatin and etoposide'},{d:2,label:'Etoposide'},{d:3,label:'Etoposide'}],
        plain:'Chemotherapy every 3 weeks, 4 times. Etoposide is given on 3 days in a row at the start of each cycle.' }),
    P({ name:'Radiation to the chest', short:'Radiation', mods:['radiation'], mode:'weekdays', weeks:3, concurrent:true,
        plain:'Radiation to the chest twice a day for 3 weeks (or once a day for about 6 weeks), starting with the first or second chemotherapy cycle.' }),
    P({ name:'Preventive brain radiation (PCI)', short:'Brain radiation', mods:['radiation'], mode:'weekdays', weeks:2, optional:true, on:false,
        plain:'Low-dose radiation to the brain over about 2 weeks to lower the chance of cancer spreading there. Recommended for some people; MRI monitoring is an alternative.' }),
    R('Recovery', 3, 'A short break of 1 to 6 weeks, with scans to confirm the cancer has responded.'),
    P({ name:'Durvalumab (Imfinzi)', short:'Durvalumab', mods:['io'], cycleDays:28, cycles:24, plain:'Immunotherapy by IV every 4 weeks for up to 2 years. It helps your immune system keep the cancer from coming back.' }),
  ]
},

/* ---------------- BREAST (additions) ---------------- */
{
  id:'apt', plan:'Paclitaxel and trastuzumab after surgery', group:'HER2-positive', added:'2026-08-31', reviewed:'2026-08-31',
  refs:[{t:'Tolaney SM et al. APT trial: paclitaxel and trastuzumab for small HER2-positive cancers. NEJM 2015',q:'APT trial adjuvant paclitaxel trastuzumab node-negative HER2 Tolaney NEJM 2015'}],
  disease:'breast', name:'APT: surgery, weekly paclitaxel + trastuzumab, then trastuzumab',
  trial:'APT trial', summary:'HER2-positive, small (≤3 cm), node-negative. Surgery, weekly paclitaxel + trastuzumab ×12, trastuzumab to complete one year.',
  title:'Surgery first, then gentle weekly chemotherapy with a HER2 antibody, then the antibody alone',
  subtitle:'HER2-positive breast cancer, stage I',
  nodes:[
    SURGERY_BREAST(),
    HEAL(4),
    P({ name:'Paclitaxel + trastuzumab', short:'Paclitaxel + trastuzumab', mods:['chemo','targeted'], cycleDays:7, cycles:12,
        visits:[{d:1,label:'Paclitaxel and trastuzumab'}],
        plain:'A lower-intensity chemotherapy (paclitaxel) plus the HER2 antibody trastuzumab, both given weekly for 12 weeks.' }),
    P({ name:'Trastuzumab', short:'Trastuzumab', mods:['targeted'], cycleDays:21, cycles:13,
        plain:'The HER2 antibody continues on its own every 3 weeks to complete one year. Often given as an injection under the skin.' }),
    RADIATION_ALONGSIDE(),
    ENDOCRINE_ALONGSIDE(),
  ]
},
{
  id:'tc4', plan:'Short chemotherapy after surgery', group:'Triple-negative', added:'2026-08-31', reviewed:'2026-08-31',
  refs:[{t:'Jones S et al. US Oncology 9735: docetaxel + cyclophosphamide vs AC. JCO 2009',q:'US Oncology 9735 docetaxel cyclophosphamide adjuvant Jones JCO 2009'}],
  disease:'breast', name:'Surgery, then docetaxel + cyclophosphamide ×4 (TC)',
  trial:'US Oncology 9735', summary:'HR-positive or triple-negative, lower risk. Surgery, TC every 3 weeks ×4, radiation, endocrine therapy if HR-positive.',
  title:'Surgery first, then four cycles of chemotherapy',
  subtitle:'Breast cancer, stage I to II',
  nodes:[
    SURGERY_BREAST(),
    HEAL(4),
    P({ name:'Docetaxel + cyclophosphamide (TC)', short:'Docetaxel + cyclophosphamide', mods:['chemo'], cycleDays:21, cycles:4,
        plain:'Two chemotherapy drugs by IV every 3 weeks, 4 times (about 3 months). A growth-factor injection after each dose supports your blood counts.' }),
    RADIATION_AFTER(true),
    P({ name:'Hormone (endocrine) therapy, if hormone-receptor positive', short:'Hormone tablet', mods:['endocrine'], mode:'daily', weeks:260, optional:true, on:true,
        plain:'If the cancer is hormone-receptor positive: one tablet a day for 5 to 10 years, starting after chemotherapy.' }),
  ]
},
{
  id:'endo', plan:'Hormone therapy after surgery', group:'HR-positive, HER2-negative', added:'2026-08-31', reviewed:'2026-08-31',
  refs:[{t:'Davies C et al. ATLAS: 10 years of tamoxifen. Lancet 2013',q:'ATLAS tamoxifen 10 years Davies Lancet 2013'},{t:'Sparano JA et al. TAILORx. NEJM 2018',q:'TAILORx Oncotype 21-gene Sparano NEJM 2018'}],
  disease:'breast', name:'Surgery, radiation, endocrine therapy only',
  trial:'NCCN standard (TAILORx, ATLAS)', summary:'HR-positive, HER2-negative, lower risk (low genomic score). Surgery, radiation, 5–10 years of a hormone-blocking tablet. No chemotherapy.',
  title:'Surgery and radiation, then a daily hormone-blocking tablet',
  subtitle:'Hormone-receptor positive, HER2-negative breast cancer, stage I to II',
  nodes:[
    SURGERY_BREAST(),
    HEAL(4),
    RADIATION_AFTER(true),
    P({ name:'Hormone (endocrine) therapy', short:'Hormone tablet', mods:['endocrine'], mode:'daily', weeks:260,
        plain:'One tablet a day (tamoxifen, or an aromatase inhibitor such as letrozole or anastrozole) for 5 to 10 years. For some premenopausal women, an injection to pause the ovaries is added.' }),
  ]
},

/* ---------------- GU ---------------- */
{
  id:'niagara', plan:'Chemo-immunotherapy around bladder surgery', group:'Bladder', added:'2026-08-31', reviewed:'2026-08-31',
  refs:[{t:'Powles T et al. NIAGARA: perioperative durvalumab. NEJM 2024;391:1773',q:'NIAGARA durvalumab neoadjuvant chemotherapy bladder Powles NEJM 2024'}],
  disease:'gu', name:'NIAGARA: chemo + durvalumab, cystectomy, durvalumab',
  trial:'NIAGARA', summary:'Muscle-invasive bladder cancer, cisplatin-eligible. Gemcitabine/cisplatin + durvalumab ×4, cystectomy, durvalumab ×8.',
  title:'Chemotherapy with immunotherapy before bladder surgery, then immunotherapy after',
  subtitle:'Muscle-invasive bladder cancer (stage II to IIIA)',
  nodes:[
    P({ name:'Gemcitabine + cisplatin + durvalumab (Imfinzi)', short:'Gem/cis + durvalumab', mods:['chemo','io'], cycleDays:21, cycles:4,
        visits:[{d:1,label:'Cisplatin, gemcitabine, and durvalumab'},{d:8,label:'Gemcitabine'}],
        plain:'Two chemotherapy drugs (gemcitabine on days 1 and 8, cisplatin on day 1) plus durvalumab every 3 weeks, 4 times. Durvalumab is immunotherapy: it helps your immune system recognize and attack cancer cells.' }),
    R('Recovery before surgery', 5, 'About 4 to 6 weeks to recover, with scans and surgical planning.'),
    S('Surgery (radical cystectomy)', 'Removal of the bladder with nearby lymph nodes, and creation of a new way for urine to leave the body (a urinary diversion). Recovery takes several weeks.'),
    R('Healing after surgery', 8, 'Recovery from surgery, usually 6 to 10 weeks before immunotherapy restarts.'),
    P({ name:'Durvalumab (Imfinzi)', short:'Durvalumab', mods:['io'], cycleDays:28, cycles:8, plain:'Immunotherapy on its own every 4 weeks for 8 doses (about 8 months). Each visit is short.' }),
  ]
},
{
  id:'ev303', plan:'Antibody-drug and immunotherapy around bladder surgery', group:'Bladder', added:'2026-09-01', reviewed:'2026-09-01',
  refs:[{t:'KEYNOTE-905 / EV-303: perioperative enfortumab vedotin + pembrolizumab, cisplatin-ineligible MIBC (ESMO 2025 LBA2; FDA approval Nov 2025)',q:'KEYNOTE-905 EV-303 enfortumab vedotin pembrolizumab perioperative muscle-invasive bladder'},{t:'KEYNOTE-B15 / EV-304: cisplatin-eligible MIBC, positive topline 2026',q:'KEYNOTE-B15 EV-304 enfortumab vedotin pembrolizumab cisplatin-eligible muscle-invasive bladder'}],
  disease:'gu', name:'KEYNOTE-905 / EV-303: enfortumab vedotin + pembrolizumab, cystectomy, EV + pembrolizumab',
  trial:'KEYNOTE-905 / EV-303', summary:'Muscle-invasive bladder cancer, cisplatin-ineligible (or declining cisplatin). EV + pembrolizumab ×3, cystectomy, EV + pembrolizumab ×6, then pembrolizumab ×8.',
  title:'An antibody-drug medicine with immunotherapy before bladder surgery, then continued after',
  subtitle:'Muscle-invasive bladder cancer (stage II to IIIA), when cisplatin is not an option',
  nodes:[
    P({ name:'Enfortumab vedotin (Padcev) + pembrolizumab (Keytruda)', short:'Enfortumab + pembrolizumab', mods:['targeted','io'], cycleDays:21, cycles:3,
        visits:[{d:1,label:'Enfortumab vedotin and pembrolizumab'},{d:8,label:'Enfortumab vedotin'}],
        plain:'Enfortumab vedotin is an antibody that finds bladder cancer cells and delivers chemotherapy directly into them, given by IV on days 1 and 8 of each 3-week cycle. Pembrolizumab is immunotherapy, given on day 1. Three cycles before surgery.' }),
    R('Recovery before surgery', 5, 'About 4 to 6 weeks to recover, with scans and surgical planning.'),
    S('Surgery (radical cystectomy)', 'Removal of the bladder with nearby lymph nodes, and creation of a new way for urine to leave the body (a urinary diversion). Recovery takes several weeks.'),
    R('Healing after surgery', 8, 'Recovery from surgery, usually 6 to 10 weeks before treatment restarts.'),
    P({ name:'Enfortumab vedotin + pembrolizumab', short:'Enfortumab + pembrolizumab', mods:['targeted','io'], cycleDays:21, cycles:6,
        visits:[{d:1,label:'Enfortumab vedotin and pembrolizumab'},{d:8,label:'Enfortumab vedotin'}],
        plain:'The same combination continues after surgery for 6 cycles (about 4 months).' }),
    P({ name:'Pembrolizumab (Keytruda)', short:'Pembrolizumab', mods:['io'], cycleDays:21, cycles:8,
        plain:'Immunotherapy on its own every 3 weeks for 8 more doses, to complete about one year of pembrolizumab in total. Each visit is short.' }),
  ]
},
{
  id:'cm274', plan:'Chemo, bladder surgery, then immunotherapy', group:'Bladder', added:'2026-08-31', reviewed:'2026-08-31',
  refs:[{t:'Bajorin DF et al. CheckMate 274: adjuvant nivolumab. NEJM 2021',q:'CheckMate 274 adjuvant nivolumab urothelial Bajorin NEJM 2021'},{t:'Grossman HB et al. SWOG 8710: neoadjuvant MVAC. NEJM 2003',q:'SWOG 8710 neoadjuvant chemotherapy cystectomy Grossman NEJM 2003'}],
  disease:'gu', name:'Chemo, cystectomy, adjuvant nivolumab (CheckMate 274)',
  trial:'SWOG 8710 / CheckMate 274', summary:'Muscle-invasive bladder cancer. Cisplatin-based chemo ×4, cystectomy, nivolumab for up to 1 year if high-risk pathology.',
  title:'Chemotherapy before bladder surgery, then immunotherapy after if the pathology is high risk',
  subtitle:'Muscle-invasive bladder cancer (stage II to IIIA)',
  nodes:[
    P({ name:'Gemcitabine + cisplatin (or dose-dense MVAC)', short:'Gem/cis chemo', mods:['chemo'], cycleDays:21, cycles:4,
        visits:[{d:1,label:'Cisplatin and gemcitabine'},{d:8,label:'Gemcitabine'}],
        plain:'Cisplatin-based chemotherapy every 3 weeks, 4 times, to shrink the cancer before surgery. Dose-dense MVAC (every 2 weeks) is an alternative.' }),
    R('Recovery before surgery', 5, 'About 4 to 6 weeks to recover, with scans and surgical planning.'),
    S('Surgery (radical cystectomy)', 'Removal of the bladder with nearby lymph nodes, and creation of a urinary diversion.'),
    R('Healing after surgery', 8, 'Recovery from surgery. If immunotherapy is recommended, it starts within about 4 months.'),
    D({ name:'Pathology results', short:'Results', question:'What did the pathology report show?',
        plain:'If cancer had grown through the bladder wall or into lymph nodes despite chemotherapy, a year of immunotherapy lowers the chance of it coming back.',
        branches:[
          Br('Little or no cancer remained', [
            P({ name:'Surveillance', short:'Surveillance', mods:['watch'], mode:'ongoing', weeks:104, freqText:'Scans every 3 to 6 months', plain:'No further treatment. Scans and visits on a regular schedule.' }),
          ]),
          Br('High-risk cancer remained', [
            P({ name:'Nivolumab (Opdivo)', short:'Nivolumab', mods:['io'], cycleDays:28, cycles:13, plain:'Immunotherapy by IV every 2 or 4 weeks for up to one year. Pembrolizumab is an alternative.' }),
          ]),
        ] }),
  ]
},
{
  id:'trimodality', plan:'Bladder-preserving chemoradiation', group:'Bladder', added:'2026-08-31', reviewed:'2026-08-31',
  refs:[{t:'James ND et al. BC2001: chemoradiotherapy for bladder cancer. NEJM 2012',q:'BC2001 radiotherapy chemoradiotherapy bladder cancer James NEJM 2012'}],
  disease:'gu', name:'Trimodality bladder preservation: TURBT, chemoradiation, surveillance',
  trial:'BC2001 / NCCN', summary:'Muscle-invasive bladder cancer, bladder preservation. Maximal TURBT, chemoradiation 6–7 weeks, cystoscopic surveillance.',
  title:'Removing the tumor through a scope, then chemoradiation to keep your bladder',
  subtitle:'Muscle-invasive bladder cancer (stage II to IIIA), bladder-preserving approach',
  nodes:[
    S('Scope surgery to remove the visible tumor (TURBT)', 'The tumor is removed through the urethra with a scope, without any incision. This is done as completely as possible before radiation.'),
    R('Recovery', 3, 'A few weeks to heal before radiation begins.'),
    P({ name:'Chemoradiation', short:'Radiation + chemo', mods:['radiation','chemo'], mode:'weekdays', weeks:7,
        plain:'Radiation to the bladder every weekday for about 6 to 7 weeks, with low-dose chemotherapy (cisplatin, or 5-FU with mitomycin) to make the radiation more effective.' }),
    P({ name:'Surveillance', short:'Surveillance', mods:['watch'], mode:'ongoing', weeks:104, freqText:'Scope checks every 3 months at first, plus scans',
        plain:'Scope checks of the bladder every 3 months at first, then less often, with scans. If the cancer returns, surgery to remove the bladder remains an option.' }),
  ]
},
{
  id:'kn564', plan:'Kidney surgery, then immunotherapy', group:'Kidney', added:'2026-08-31', reviewed:'2026-08-31',
  refs:[{t:'Choueiri TK et al. KEYNOTE-564: adjuvant pembrolizumab. NEJM 2021',q:'KEYNOTE-564 adjuvant pembrolizumab renal cell Choueiri NEJM 2021'},{t:'Choueiri TK et al. KEYNOTE-564 overall survival. NEJM 2024',q:'KEYNOTE-564 overall survival adjuvant pembrolizumab NEJM 2024'}],
  disease:'gu', name:'KEYNOTE-564: nephrectomy, then pembrolizumab for a year',
  trial:'KEYNOTE-564', summary:'Clear-cell kidney cancer at higher risk of recurrence after surgery. Nephrectomy, pembrolizumab every 3 weeks ×17.',
  title:'Kidney surgery, then a year of immunotherapy',
  subtitle:'Kidney cancer (clear-cell type) at higher risk of returning after surgery',
  nodes:[
    S('Surgery (nephrectomy)', 'Removal of the affected kidney, or the part of it containing the cancer.'),
    R('Healing after surgery', 8, 'Recovery from surgery. Immunotherapy starts within 12 weeks of the operation.'),
    P({ name:'Pembrolizumab (Keytruda)', short:'Pembrolizumab', mods:['io'], cycleDays:21, cycles:17, plain:'Immunotherapy by IV every 3 weeks for 17 doses (about one year). It helps your immune system find and destroy any remaining cancer cells.' }),
    P({ name:'Surveillance', short:'Surveillance', mods:['watch'], mode:'ongoing', weeks:104, freqText:'Scans every 6 months', plain:'Regular visits and CT scans after immunotherapy is finished.' }),
  ]
},
{
  id:'kidney-surv', plan:'Kidney surgery, then surveillance', group:'Kidney', added:'2026-08-31', reviewed:'2026-08-31',
  refs:[{t:'NCCN Guidelines: Kidney Cancer (surveillance after nephrectomy)',q:'NCCN kidney cancer surveillance after nephrectomy'}],
  disease:'gu', name:'Nephrectomy, then surveillance',
  trial:'NCCN standard', summary:'Kidney cancer at lower risk of recurrence. Partial or radical nephrectomy, then scans on a schedule. No drug treatment.',
  title:'Kidney surgery, then regular scans',
  subtitle:'Kidney cancer, stage I to II',
  nodes:[
    S('Surgery (partial or radical nephrectomy)', 'Removal of the part of the kidney containing the cancer, or the whole kidney.'),
    R('Healing after surgery', 6, 'Recovery from surgery.'),
    P({ name:'Surveillance', short:'Surveillance', mods:['watch'], mode:'ongoing', weeks:260, freqText:'Scans every 6 to 12 months',
        plain:'No further treatment is needed. Blood tests and scans every 6 to 12 months for 5 years to make sure the cancer has not returned.' }),
  ]
},
{
  id:'prostate-long', plan:'Radiation with long-course hormone therapy', group:'Prostate', added:'2026-08-31', reviewed:'2026-08-31',
  refs:[{t:'Bolla M et al. EORTC 22961: 3 years vs 6 months of ADT with radiation. NEJM 2009',q:'EORTC 22961 duration androgen suppression radiotherapy Bolla NEJM 2009'},{t:'Attard G et al. STAMPEDE: abiraterone for high-risk non-metastatic prostate cancer. Lancet 2022',q:'STAMPEDE abiraterone high-risk non-metastatic prostate Attard Lancet 2022'}],
  disease:'gu', name:'Radiation + 2–3 years of ADT (± abiraterone)',
  trial:'EORTC 22961 / STAMPEDE', summary:'High-risk localized prostate cancer. Hormone therapy (ADT) for 2–3 years with radiation; abiraterone for 2 years in very high-risk disease.',
  title:'Hormone therapy for two to three years, with radiation to the prostate',
  subtitle:'Prostate cancer, high risk (localized)',
  nodes:[
    P({ name:'Hormone therapy begins (ADT injection)', short:'Hormone therapy', mods:['endocrine'], cycleDays:84, cycles:1,
        visits:[{d:1,label:'ADT injection (lasts 3 months)'}],
        plain:'An injection that lowers testosterone, the hormone prostate cancer feeds on. It usually starts 2 to 3 months before radiation and is repeated every 3 or 6 months.' }),
    P({ name:'Radiation to the prostate', short:'Radiation', mods:['radiation'], mode:'weekdays', weeks:'',
        plain:'Daily radiation, Monday to Friday. Your radiation oncologist sets the number of sessions, from as few as 5 to as many as 39 depending on the technique.' }),
    P({ name:'Hormone therapy continues', short:'Hormone therapy', mods:['endocrine'], cycleDays:84, cycles:11,
        visits:[{d:1,label:'ADT injection'}],
        plain:'Injections continue every 3 or 6 months to complete 2 to 3 years in total. Hot flashes, tiredness, and loss of muscle are common and manageable.' }),
    P({ name:'Abiraterone + prednisone tablets (very high risk)', short:'Abiraterone', mods:['endocrine'], mode:'daily', weeks:104, optional:true, on:false, concurrent:true,
        plain:'For very high-risk cancers, abiraterone tablets with low-dose prednisone every day for 2 years alongside the injections (STAMPEDE).' }),
    P({ name:'Surveillance', short:'Surveillance', mods:['watch'], mode:'ongoing', weeks:260, freqText:'PSA blood test every 3 to 6 months', plain:'A PSA blood test every 3 to 6 months, then yearly.' }),
  ]
},
{
  id:'prostate-short', plan:'Radiation with short-course hormone therapy', group:'Prostate', added:'2026-08-31', reviewed:'2026-08-31',
  refs:[{t:'Jones CU et al. RTOG 94-08: short-term ADT with radiation. NEJM 2011',q:'RTOG 9408 short-term androgen deprivation radiotherapy Jones NEJM 2011'}],
  disease:'gu', name:'Radiation + 4–6 months of ADT',
  trial:'RTOG 94-08', summary:'Intermediate-risk localized prostate cancer. Hormone therapy for 4–6 months with radiation to the prostate.',
  title:'A few months of hormone therapy, with radiation to the prostate',
  subtitle:'Prostate cancer, intermediate risk (localized)',
  nodes:[
    P({ name:'Hormone therapy begins (ADT injection)', short:'Hormone therapy', mods:['endocrine'], cycleDays:84, cycles:1,
        visits:[{d:1,label:'ADT injection (lasts 3 months)'}],
        plain:'An injection that lowers testosterone for a few months, starting about 2 months before radiation.' }),
    P({ name:'Radiation to the prostate', short:'Radiation', mods:['radiation'], mode:'weekdays', weeks:'',
        plain:'Daily radiation, Monday to Friday. Your radiation oncologist sets the number of sessions, from 5 to 28 depending on the technique.' }),
    P({ name:'Hormone therapy continues', short:'Hormone therapy', mods:['endocrine'], cycleDays:84, cycles:1,
        visits:[{d:1,label:'ADT injection'}],
        plain:'One more injection to complete 4 to 6 months in total. Testosterone recovers over the following months.' }),
    P({ name:'Surveillance', short:'Surveillance', mods:['watch'], mode:'ongoing', weeks:260, freqText:'PSA blood test every 6 months', plain:'A PSA blood test every 6 months, then yearly.' }),
  ]
},
{
  id:'prostatectomy', plan:'Prostate surgery, then surveillance', group:'Prostate', added:'2026-08-31', reviewed:'2026-08-31',
  refs:[{t:'Hamdy FC et al. ProtecT: 15-year outcomes. NEJM 2023',q:'ProtecT 15-year outcomes prostatectomy radiotherapy monitoring Hamdy NEJM 2023'},{t:'Vale CL et al. ARTISTIC meta-analysis: adjuvant vs early salvage radiotherapy. Lancet 2020',q:'ARTISTIC adjuvant early salvage radiotherapy prostatectomy Vale Lancet 2020'}],
  disease:'gu', name:'Radical prostatectomy, PSA surveillance, radiation only if PSA rises',
  trial:'ProtecT / ARTISTIC', summary:'Localized prostate cancer. Surgery, then PSA monitoring; early salvage radiation (with or without ADT) if PSA rises.',
  title:'Surgery to remove the prostate, then PSA checks, with radiation only if needed',
  subtitle:'Prostate cancer, localized',
  nodes:[
    S('Surgery (radical prostatectomy)', 'Removal of the prostate and, when needed, nearby lymph nodes, usually with robotic assistance.'),
    R('Healing after surgery', 6, 'Recovery, including regaining bladder control. The first PSA check is at about 6 to 8 weeks.'),
    P({ name:'PSA surveillance', short:'Surveillance', mods:['watch'], mode:'ongoing', weeks:260, freqText:'PSA blood test every 3 to 6 months',
        plain:'After surgery the PSA should be undetectable. It is checked every 3 to 6 months for the first years, then yearly.' }),
    P({ name:'Radiation if the PSA rises (salvage)', short:'Radiation if needed', mods:['radiation'], mode:'weekdays', weeks:'', optional:true, on:false,
        plain:'If the PSA rises, radiation to the area where the prostate was, sometimes with a few months of hormone therapy, can still cure the cancer.' }),
  ]
},
{
  id:'active-surv', plan:'Active surveillance', group:'Prostate', added:'2026-08-31', reviewed:'2026-08-31',
  refs:[{t:'Hamdy FC et al. ProtecT: active monitoring vs surgery vs radiotherapy. NEJM 2016',q:'ProtecT active monitoring surgery radiotherapy localised prostate Hamdy NEJM 2016'}],
  disease:'gu', name:'Active surveillance (low-risk prostate cancer)',
  trial:'ProtecT / NCCN', summary:'Low-risk localized prostate cancer. No treatment now; PSA, MRI, and repeat biopsies on a schedule, with treatment if the cancer changes.',
  title:'Careful monitoring instead of treatment, with treatment only if the cancer changes',
  subtitle:'Prostate cancer, low risk (localized)',
  nodes:[
    P({ name:'Active surveillance', short:'Active surveillance', mods:['watch'], mode:'ongoing', weeks:260, openEnded:true, freqText:'PSA every 6 months; MRI and biopsy at set intervals',
        plain:'Low-risk prostate cancer often never needs treatment. A PSA blood test every 6 months, an MRI every 1 to 2 years, and a repeat biopsy at set intervals watch for change. If the cancer becomes more active, surgery or radiation is offered then, with the same chance of cure.' }),
  ]
},
];

const APP_VERSION = '0.3.1';
const CHANGELOG = [
  { date:'2026-09-01', text:'Added perioperative enfortumab vedotin + pembrolizumab for cisplatin-ineligible muscle-invasive bladder cancer (KEYNOTE-905 / EV-303; FDA-approved November 2025). The cisplatin-eligible trial (KEYNOTE-B15 / EV-304) read out positive in 2026 and is noted in the references.' },
  { date:'2026-08-31', text:'Added GU regimens: bladder (NIAGARA, chemotherapy then cystectomy with adjuvant nivolumab, bladder-preserving chemoradiation), kidney (KEYNOTE-564, surveillance), prostate (long- and short-course ADT with radiation, prostatectomy with PSA surveillance, active surveillance).' },
  { date:'2026-08-31', text:'Breast library regrouped by receptor status; added APT (small HER2-positive), TC ×4, and endocrine-only plans.' },
  { date:'2026-08-31', text:'Radiation steps no longer carry a default length; the radiation oncologist\'s course is entered per patient.' },
  { date:'2026-08-31', text:'Source verification pass: KEYNOTE-522 carboplatin wording, RAPIDO interval after radiation, OPRA restaging window, colon surveillance CT interval corrected.' },
  { date:'2026-08-31', text:'First release: 20 regimens across breast, GI, and lung; share links and QR codes; one-page print.' },
];
