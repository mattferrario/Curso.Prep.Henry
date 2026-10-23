/* Validador de Productos Digitales — app en un solo archivo, sin dependencias.
   Los datos se guardan en localStorage del navegador. */

const STORAGE_KEY = 'validador-productos-v1';
const WINNER_DAYS = 30;     // un anuncio activo 30+ días suele ser rentable
const SCALING_ADS = 5;      // anunciante con 5+ anuncios activos = está escalando
const MAX_LOW_TICKET = 30;

// ---------- Preguntas ----------

const PROBLEM_FIELDS = [
  { key: 'problem', label: '¿Qué problema detectaste?', type: 'textarea',
    help: 'Escribilo como lo diría la persona que lo sufre, no como lo dirías vos.' },
  { key: 'who', label: '¿Quién lo sufre exactamente?', type: 'text',
    help: 'Ej: mamás primerizas con bebés de 0 a 6 meses que no duermen.' },
  { key: 'type', label: '¿Es un dolor o un deseo?', type: 'radio',
    options: ['Dolor urgente', 'Deseo fuerte', 'Curiosidad'] },
  { key: 'urgency', label: '¿Qué tan urgente es resolverlo?', type: 'scale', min: 1, max: 5,
    ends: ['Puede esperar', 'Lo quiere resolver hoy'] },
  { key: 'frequency', label: '¿Con qué frecuencia le pasa?', type: 'radio',
    options: ['Todos los días', 'Semanal', 'Mensual', 'Ocasional'] },
  { key: 'paying', label: '¿Ya gastan dinero para resolverlo?', type: 'radio',
    options: ['Sí, gastan dinero', 'Buscan solo cosas gratis', 'No sé'] },
  { key: 'currentSolutions', label: '¿Cómo lo intentan resolver hoy y por qué falla?', type: 'textarea' },
  { key: 'evidence', label: '¿Dónde encontraste evidencia del problema?', type: 'checks',
    help: 'Cuantas más fuentes independientes, mejor.',
    options: ['Grupos de Facebook', 'Comentarios de Instagram', 'Comentarios de YouTube', 'TikTok',
      'Reddit / foros', 'Reseñas 1-3★ en Amazon', 'Búsquedas en Google', 'Conversaciones reales'] },
  { key: 'quotes', label: 'Frases textuales que encontraste', type: 'textarea',
    help: 'Copiá y pegá. Estas frases después son tus hooks de anuncios.' },
  { key: 'timeToResult', label: '¿En cuánto tiempo puede ver un resultado con tu producto?', type: 'radio',
    options: ['Menos de 7 días', '7 a 30 días', 'Más de 30 días'] },
];

const NICHE_FIELDS = [
  { key: 'market', label: 'Mercado principal', type: 'radio',
    options: ['Salud y fitness', 'Dinero y negocios', 'Relaciones', 'Desarrollo personal',
      'Crianza y familia', 'Hobbies', 'Educación e idiomas', 'Mascotas', 'Otro'] },
  { key: 'subniche', label: 'Subnicho', type: 'text', help: 'Ej: Salud → Bajar de peso' },
  { key: 'microniche', label: 'Micronicho', type: 'text', help: 'Ej: Bajar de peso para mujeres +40 en menopausia' },
  { key: 'age', label: 'Edad del avatar', type: 'radio', options: ['18-24', '25-34', '35-44', '45-54', '55+'] },
  { key: 'gender', label: 'Género predominante', type: 'radio', options: ['Mujeres', 'Hombres', 'Mixto'] },
  { key: 'countries', label: 'Países objetivo', type: 'checks',
    options: ['Argentina', 'México', 'Colombia', 'Chile', 'Perú', 'España', 'EE.UU. (hispanos)', 'Resto LATAM'] },
  { key: 'pains', label: 'Dolores (qué le pasa, qué siente)', type: 'textarea' },
  { key: 'desires', label: 'Deseos (qué quiere lograr)', type: 'textarea' },
  { key: 'objections', label: 'Objeciones (por qué no compraría)', type: 'textarea' },
  { key: 'words', label: 'Palabras y expresiones que usa', type: 'textarea' },
  { key: 'channels', label: '¿Dónde está?', type: 'checks',
    options: ['Facebook', 'Instagram', 'TikTok', 'YouTube', 'Grupos de Facebook', 'Reddit', 'Pinterest', 'WhatsApp'] },
  { key: 'size', label: 'Tamaño estimado del nicho', type: 'scale', min: 1, max: 5,
    ends: ['Muy chico', 'Masivo'] },
];

const OFFER_FIELDS = [
  { key: 'format', label: 'Formato del producto', type: 'radio',
    options: ['Ebook', 'Guía PDF', 'Workbook', 'Plantillas', 'Checklist', 'Pack PDF + videos'] },
  { key: 'title', label: 'Título del producto', type: 'text' },
  { key: 'promise', label: 'Promesa principal', type: 'textarea',
    help: 'Resultado + en cuánto tiempo + sin la objeción principal. Ej: "Dormí a tu bebé en 7 noches sin dejarlo llorar".' },
  { key: 'differentiator', label: '¿Qué te diferencia de la competencia?', type: 'textarea',
    help: 'Mirá las debilidades que anotaste en Competencia.' },
  { key: 'bonuses', label: 'Bonos (uno por línea)', type: 'textarea' },
  { key: 'guarantee', label: 'Garantía', type: 'radio', options: ['7 días', '15 días', '30 días', 'Sin garantía'] },
];

const ECON_FIELDS = [
  { key: 'price', label: 'Precio principal (USD)', def: 9.9 },
  { key: 'bumpPrice', label: 'Order bump (USD)', def: 4.9 },
  { key: 'bumpRate', label: '% que toma el bump', def: 30 },
  { key: 'upsellPrice', label: 'Upsell (USD)', def: 19.9 },
  { key: 'upsellRate', label: '% que toma el upsell', def: 10 },
  { key: 'fee', label: 'Comisión plataforma + impuestos (%)', def: 12 },
  { key: 'cpa', label: 'CPA estimado (USD por venta)', def: 6 },
  { key: 'budget', label: 'Presupuesto diario de prueba (USD)', def: 10 },
];

const CHECKLIST = [
  ['Producto', [
    'Índice del ebook armado según los dolores del avatar',
    'Contenido escrito / maquetado (Canva, Google Docs)',
    'Mockup 3D del producto',
    'Bonos listos',
  ]],
  ['Venta', [
    'Producto cargado en Hotmart / Kiwify / Gumroad',
    'Order bump y upsell configurados',
    'Página de ventas (headline = promesa)',
    'Prueba de compra completa hecha',
  ]],
  ['Meta Ads', [
    'Business Manager, página y cuenta publicitaria',
    'Píxel / API de conversiones instalado',
    '3 a 5 creativos con hooks distintos (usá las frases textuales)',
    'Campaña de prueba con presupuesto chico (ABO)',
  ]],
  ['Medición', [
    'Revisar CTR, CPC y CPA a las 48-72 h',
    'Apagar creativos sin ventas al gastar 1,5× el precio',
    'Escalar los que están por debajo del CPA de equilibrio',
  ]],
];

const COUNTRIES = { ALL: 'Todos', AR: 'Argentina', MX: 'México', CO: 'Colombia', CL: 'Chile', PE: 'Perú', ES: 'España', US: 'EE.UU.' };
const AD_FORMATS = ['Video', 'Imagen', 'Carrusel', 'UGC'];
const PLATFORMS = ['Hotmart', 'Kiwify', 'Gumroad', 'Amazon Kindle', 'Etsy', 'Web propia', 'Otra'];

// ---------- Estado ----------

function newProject(name) {
  return {
    id: Math.random().toString(36).slice(2, 10),
    name,
    createdAt: new Date().toISOString(),
    problem: {}, niche: {}, offer: {},
    econ: Object.fromEntries(ECON_FIELDS.map(f => [f.key, f.def])),
    research: { keywords: '', country: 'ALL' },
    ads: [], competitors: [], checklist: {},
  };
}

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (s && Array.isArray(s.projects) && s.projects.length) return s;
  } catch (e) { /* storage bloqueado o datos corruptos */ }
  const p = newProject('Mi primer ebook');
  return { projects: [p], currentId: p.id, tab: 'resumen' };
}

let state = load();

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignorar */ }
}

const current = () => state.projects.find(p => p.id === state.currentId) || state.projects[0];

function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
function setPath(obj, path, value) {
  const keys = path.split('.');
  const last = keys.pop();
  const target = keys.reduce((o, k) => (o[k] ??= {}), obj);
  target[last] = value;
}

// ---------- Utilidades ----------

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = v => (v === '' || v == null || isNaN(+v) ? null : +v);
const usd = v => (v == null || isNaN(v) ? '—' : 'US$ ' + v.toFixed(2));
const filled = v => (Array.isArray(v) ? v.length > 0 : v != null && String(v).trim() !== '');
const avg = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
function median(a) {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function daysBetween(start, end) {
  if (!start) return null;
  const a = new Date(start), b = end ? new Date(end) : new Date();
  if (isNaN(a) || isNaN(b)) return null;
  return Math.max(0, Math.round((b - a) / 86400000));
}

function bars(entries, fmt = v => v) {
  const max = Math.max(1, ...entries.map(e => e[1]));
  if (!entries.length) return '<p class="empty">Sin datos todavía.</p>';
  return `<div class="bars">${entries.map(([label, v]) => `
    <div class="bar-row"><span>${esc(label)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(v / max) * 100}%"></div></div>
      <span class="v">${fmt(v)}</span></div>`).join('')}</div>`;
}
const countBy = (arr, key) => {
  const m = {};
  arr.forEach(x => { if (x[key]) m[x[key]] = (m[x[key]] || 0) + 1; });
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
};
const kpi = (label, value, hint = '') =>
  `<div class="card kpi"><div class="label">${label}</div><div class="value">${value}</div><div class="hint">${hint}</div></div>`;

// ---------- Cálculos ----------

function adStats(p) {
  const ads = p.ads.map(a => ({ ...a, days: daysBetween(a.startDate, a.endDate) }));
  const withDays = ads.filter(a => a.days != null);
  const advertisers = {};
  ads.forEach(a => {
    const k = (a.advertiser || '').trim().toLowerCase();
    if (!k) return;
    advertisers[k] = Math.max(advertisers[k] || 0, num(a.activeAds) || 0);
  });
  const prices = ads.map(a => num(a.price)).filter(v => v != null);
  return {
    total: ads.length,
    advertisers: Object.keys(advertisers).length,
    scaling: Object.values(advertisers).filter(n => n >= SCALING_ADS).length,
    winners: withDays.filter(a => a.days >= WINNER_DAYS).length,
    avgDays: avg(withDays.map(a => a.days)),
    formats: countBy(ads, 'format'),
    medianPrice: median(prices),
    topAngles: withDays.filter(a => a.angle).sort((a, b) => b.days - a.days).slice(0, 5),
  };
}

function compStats(p) {
  const c = p.competitors;
  const prices = c.map(x => num(x.price)).filter(v => v != null);
  const ratings = c.map(x => num(x.rating)).filter(v => v != null);
  return {
    total: c.length,
    minPrice: prices.length ? Math.min(...prices) : null,
    maxPrice: prices.length ? Math.max(...prices) : null,
    avgPrice: avg(prices),
    medianPrice: median(prices),
    reviews: c.reduce((s, x) => s + (num(x.reviews) || 0), 0),
    avgRating: avg(ratings),
    platforms: countBy(c, 'platform'),
    weaknesses: c.filter(x => filled(x.weaknesses)).length,
  };
}

function econ(p) {
  const e = Object.fromEntries(ECON_FIELDS.map(f => [f.key, num(p.econ[f.key]) ?? 0]));
  const aov = e.price + e.bumpPrice * e.bumpRate / 100 + e.upsellPrice * e.upsellRate / 100;
  const net = aov * (1 - e.fee / 100);
  const salesDay = e.cpa > 0 ? e.budget / e.cpa : 0;
  return {
    ...e, aov, net,
    breakEvenCpa: net,
    breakEvenRoas: net > 0 ? aov / net : null,
    salesDay,
    profitDay: salesDay * net - e.budget,
    profitPerSale: net - e.cpa,
  };
}

function score(p) {
  const pr = p.problem, ni = p.niche, of = p.offer;
  const a = adStats(p), c = compStats(p), e = econ(p);

  const problem =
    ((num(pr.urgency) || 0) / 5) * 7 +
    ({ 'Todos los días': 5, 'Semanal': 4, 'Mensual': 2, 'Ocasional': 1 }[pr.frequency] || 0) +
    ({ 'Sí, gastan dinero': 6, 'Buscan solo cosas gratis': 1 }[pr.paying] || 0) +
    (Math.min((pr.evidence || []).length, 5) / 5) * 5 +
    ({ 'Dolor urgente': 3, 'Deseo fuerte': 2.5, 'Curiosidad': 0.5 }[pr.type] || 0) +
    ['market', 'microniche', 'pains', 'words'].filter(k => filled(ni[k])).length;

  const demand =
    (Math.min(a.total, 10) / 10) * 6 +
    (Math.min(a.winners, 5) / 5) * 10 +
    (Math.min(a.advertisers, 5) / 5) * 6 +
    (Math.min(a.scaling, 3) / 3) * 8;

  let competition = c.total === 0 ? 0 : c.total < 3 ? 5 : c.total <= 15 ? 8 : 6;
  if (c.reviews >= 100) competition += 3;
  if ((c.avgRating != null && c.avgRating < 4.3) || c.weaknesses >= 2) competition += 4;

  const price = num(p.econ.price);
  const offer =
    (price == null ? 0 : price <= MAX_LOW_TICKET ? 4 : 1) +
    (filled(of.promise) ? 3 : 0) +
    (filled(of.differentiator) ? 3 : 0) +
    (filled(of.bonuses) ? 2 : 0) +
    (filled(of.format) ? 1 : 0) +
    ((num(p.econ.bumpRate) || 0) > 0 || (num(p.econ.upsellRate) || 0) > 0 ? 2 : 0);

  const economics = e.cpa <= 0 || e.net <= 0 ? 0
    : e.cpa <= e.breakEvenCpa * 0.6 ? 10
    : e.cpa <= e.breakEvenCpa * 0.85 ? 7
    : e.cpa <= e.breakEvenCpa ? 4 : 0;

  const parts = [
    ['Problema y nicho', problem, 30],
    ['Demanda en Meta', demand, 30],
    ['Competencia', competition, 15],
    ['Oferta', offer, 15],
    ['Números', economics, 10],
  ];
  const total = Math.round(parts.reduce((s, x) => s + x[1], 0));
  return { total, parts, a, c, e };
}

function verdict(total) {
  if (total >= 70) return { cls: 'good', label: 'Validado: lanzá la campaña de prueba', color: 'var(--good)' };
  if (total >= 45) return { cls: 'warn', label: 'Dudoso: completá la investigación o ajustá la oferta', color: 'var(--warn)' };
  return { cls: 'bad', label: 'No validado: pivoteá el problema o el nicho', color: 'var(--bad)' };
}

function nextSteps(p, s) {
  const tips = [];
  const { a, c, e } = s;
  if (!filled(p.problem.problem)) tips.push('Definí el problema en la pestaña Problema.');
  if ((p.problem.evidence || []).length < 3) tips.push('Buscá evidencia en al menos 3 fuentes distintas (grupos, comentarios, reseñas).');
  if (p.problem.paying === 'Buscan solo cosas gratis') tips.push('El avatar no suele pagar: buscá un ángulo con más dolor o cambiá de avatar.');
  if (a.total < 10) tips.push(`Registrá al menos 10 anuncios de la Biblioteca de Meta (llevás ${a.total}).`);
  if (a.total >= 5 && a.winners === 0) tips.push(`Ningún anuncio lleva ${WINNER_DAYS}+ días activo: señal de que nadie está ganando plata todavía.`);
  if (a.scaling === 0 && a.total >= 5) tips.push(`No encontraste anunciantes con ${SCALING_ADS}+ anuncios activos (escalando).`);
  if (c.total < 3) tips.push('Cargá al menos 3 productos similares para ver precios y debilidades.');
  if (c.total > 15) tips.push('Mucha competencia: diferenciate con un micronicho más específico.');
  if (!filled(p.offer.promise)) tips.push('Escribí la promesa principal de la oferta.');
  if (num(p.econ.price) > MAX_LOW_TICKET) tips.push(`El precio supera los US$ ${MAX_LOW_TICKET} del modelo low ticket.`);
  if (e.cpa > e.breakEvenCpa) tips.push(`El CPA estimado (${usd(e.cpa)}) supera el de equilibrio (${usd(e.breakEvenCpa)}): sumá order bump/upsell o subí el precio.`);
  if (!tips.length) tips.push('Todo en orden. Armá 3-5 creativos y lanzá la campaña de prueba.');
  return tips;
}

// ---------- Formularios ----------

function fieldHtml(section, f, data) {
  const path = `${section}.${f.key}`;
  const v = data[f.key];
  const help = f.help ? `<p class="help">${esc(f.help)}</p>` : '';
  const name = `${state.currentId}-${path}`;
  if (f.type === 'text') return `<div class="field"><label>${f.label}</label>${help}<input type="text" data-path="${path}" value="${esc(v)}"></div>`;
  if (f.type === 'textarea') return `<div class="field"><label>${f.label}</label>${help}<textarea data-path="${path}">${esc(v)}</textarea></div>`;
  if (f.type === 'radio') return `<div class="field"><span class="q">${f.label}</span>${help}<div class="options">${
    f.options.map(o => `<label class="chip"><input type="radio" name="${name}" data-path="${path}" value="${esc(o)}" ${v === o ? 'checked' : ''}>${esc(o)}</label>`).join('')}</div></div>`;
  if (f.type === 'checks') return `<div class="field"><span class="q">${f.label}</span>${help}<div class="options">${
    f.options.map(o => `<label class="chip"><input type="checkbox" data-path="${path}" data-multi value="${esc(o)}" ${(v || []).includes(o) ? 'checked' : ''}>${esc(o)}</label>`).join('')}</div></div>`;
  if (f.type === 'scale') {
    const opts = [];
    for (let i = f.min; i <= f.max; i++) opts.push(`<label class="chip"><input type="radio" name="${name}" data-path="${path}" data-num value="${i}" ${+v === i ? 'checked' : ''}>${i}</label>`);
    return `<div class="field"><span class="q">${f.label}</span>${help}<div class="scale"><span class="ends">${f.ends[0]}</span>${opts.join('')}<span class="ends">${f.ends[1]}</span></div></div>`;
  }
  return '';
}

const formCard = (title, section, fields, data) =>
  `<div class="card"><h3>${title}</h3>${fields.map(f => fieldHtml(section, f, data)).join('')}</div>`;

const progress = (fields, data) => fields.filter(f => filled(data[f.key])).length / fields.length;

// ---------- Pestañas ----------

const TABS = [
  { id: 'resumen', label: 'Resumen', render: renderSummary, live: renderSummary },
  { id: 'problema', label: '1. Problema', done: p => progress(PROBLEM_FIELDS, p.problem) >= 0.8,
    render: p => `<h2>Problema</h2><p class="lead">Todo producto que vende resuelve un problema concreto que la gente ya está intentando resolver.</p>
      ${formCard('Preguntas de validación', 'problem', PROBLEM_FIELDS, p.problem)}` },
  { id: 'nicho', label: '2. Nicho y avatar', done: p => progress(NICHE_FIELDS, p.niche) >= 0.8,
    render: p => `<h2>Nicho y avatar</h2><p class="lead">Bajá de mercado → subnicho → micronicho. Cuanto más específico, más fácil vender barato.</p>
      <div class="grid g2">${formCard('Nicho', 'niche', NICHE_FIELDS.slice(0, 3).concat(NICHE_FIELDS.slice(-1)), p.niche)}
      ${formCard('Avatar', 'niche', NICHE_FIELDS.slice(3, -1), p.niche)}</div>` },
  { id: 'meta', label: '3. Investigación en Meta', done: p => p.ads.length >= 10, render: renderMeta, live: metaLive },
  { id: 'competencia', label: '4. Competencia', done: p => p.competitors.length >= 3, render: renderCompetitors, live: compLive },
  { id: 'oferta', label: '5. Oferta y números', done: p => progress(OFFER_FIELDS, p.offer) >= 0.8, render: renderOffer, live: econLive },
  { id: 'lanzamiento', label: '6. Lanzamiento', done: p => CHECKLIST.flatMap(g => g[1]).every(i => p.checklist[i]), render: renderChecklist },
];

function renderSummary(p) {
  const s = score(p);
  const v = verdict(s.total);
  const steps = TABS.filter(t => t.done);
  return `<h2>${esc(p.name)}</h2><p class="lead">Puntaje de validación calculado con todo lo que cargaste. Completá cada paso para que sea confiable.</p>
  <div id="live">
  <div class="grid g2">
    <div class="card">
      <div class="verdict">
        <div class="score-ring" style="background:conic-gradient(${v.color} ${s.total * 3.6}deg, var(--line) 0)"><span>${s.total}</span></div>
        <div><span class="badge ${v.cls}">${v.label}</span>
          <p class="help" style="margin-top:8px">70+ validado · 45-69 dudoso · menos de 45 no validado</p></div>
      </div>
    </div>
    <div class="card"><h3>Puntaje por área</h3>${bars(s.parts.map(([l, x, m]) => [l, (x / m) * 100]), x => Math.round(x) + '%')}</div>
  </div>
  <div class="grid g4" style="margin-top:14px">
    ${kpi('Anuncios ganadores', s.a.winners, `${WINNER_DAYS}+ días activos de ${s.a.total} registrados`)}
    ${kpi('Anunciantes escalando', s.a.scaling, `${SCALING_ADS}+ anuncios activos`)}
    ${kpi('Competidores', s.c.total, `${s.c.reviews} reseñas en total`)}
    ${kpi('Precio mediano competencia', usd(s.c.medianPrice), 'productos similares')}
    ${kpi('Ticket promedio', usd(s.e.aov), 'con bump y upsell')}
    ${kpi('CPA de equilibrio', usd(s.e.breakEvenCpa), `estimado: ${usd(s.e.cpa)}`)}
    ${kpi('Ganancia por día', usd(s.e.profitDay), `con ${usd(s.e.budget)} de presupuesto`)}
    ${kpi('Pasos completos', `${steps.filter(t => t.done(p)).length}/${steps.length}`, '')}
  </div>
  <div class="card" style="margin-top:14px"><h3>Próximos pasos</h3><ul class="tips">${nextSteps(p, s).map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
  </div>`;
}

function researchLinks(p) {
  const kws = (p.research.keywords || '').split(',').map(k => k.trim()).filter(Boolean);
  if (!kws.length) return '<p class="help">Escribí palabras clave separadas por coma para generar las búsquedas.</p>';
  const country = p.research.country || 'ALL';
  const ad = q => `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${country}&q=${encodeURIComponent(q)}&search_type=keyword_unordered&media_type=all`;
  const link = (href, label) => `<a class="btn ghost sm" target="_blank" rel="noopener" href="${href}">${esc(label)}</a>`;
  return kws.map(k => `<div class="field"><span class="q">${esc(k)}</span><div class="links">
    ${link(ad(k), 'Meta Ads: ' + k)}
    ${link(ad(k + ' ebook'), '+ ebook')}
    ${link(ad(k + ' guía'), '+ guía')}
    ${link(ad(k + ' pdf'), '+ pdf')}
    ${link(ad(k + ' hotmart'), '+ hotmart')}
    ${link('https://trends.google.com/trends/explore?q=' + encodeURIComponent(k), 'Google Trends')}
    ${link('https://www.youtube.com/results?search_query=' + encodeURIComponent(k), 'YouTube')}
    ${link('https://www.tiktok.com/search?q=' + encodeURIComponent(k), 'TikTok')}
    ${link('https://www.reddit.com/search/?q=' + encodeURIComponent(k), 'Reddit')}
    ${link('https://www.amazon.com/s?i=digital-text&k=' + encodeURIComponent(k), 'Amazon Kindle')}
    ${link('https://www.google.com/search?q=' + encodeURIComponent(k + ' site:hotmart.com OR site:pay.hotmart.com'), 'Hotmart (Google)')}
  </div></div>`).join('');
}

function renderMeta(p) {
  const rows = p.ads.map((a, i) => `<tr>
    <td><input type="text" data-path="ads.${i}.advertiser" value="${esc(a.advertiser)}" placeholder="Página"></td>
    <td><input type="url" data-path="ads.${i}.url" value="${esc(a.url)}" placeholder="https://"></td>
    <td><input type="date" data-path="ads.${i}.startDate" value="${esc(a.startDate)}"></td>
    <td><input type="date" data-path="ads.${i}.endDate" value="${esc(a.endDate)}" title="Vacío = sigue activo"></td>
    <td class="num" data-days="${i}"></td>
    <td><input type="number" min="0" data-path="ads.${i}.activeAds" value="${esc(a.activeAds)}" style="min-width:70px"></td>
    <td><select data-path="ads.${i}.format"><option value=""></option>${AD_FORMATS.map(f => `<option ${a.format === f ? 'selected' : ''}>${f}</option>`).join('')}</select></td>
    <td><input type="text" data-path="ads.${i}.angle" value="${esc(a.angle)}" placeholder="Hook / ángulo"></td>
    <td><input type="number" min="0" step="0.01" data-path="ads.${i}.price" value="${esc(a.price)}" style="min-width:70px"></td>
    <td><button class="btn ghost danger sm" data-del="ads" data-i="${i}">✕</button></td></tr>`).join('');
  return `<h2>Investigación de mercado en Meta</h2>
  <p class="lead">Buscá en la Biblioteca de Anuncios. Un anuncio que lleva ${WINNER_DAYS}+ días activo casi seguro es rentable; un anunciante con ${SCALING_ADS}+ anuncios activos del mismo producto está escalando.</p>
  <div class="card"><h3>Generador de búsquedas</h3>
    <div class="grid g2">
      <div class="field"><label>Palabras clave (separadas por coma)</label>
        <input type="text" data-path="research.keywords" data-refresh value="${esc(p.research.keywords)}" placeholder="dormir bebé, ansiedad, ayuno intermitente"></div>
      <div class="field"><label>País</label><select data-path="research.country" data-refresh>
        ${Object.entries(COUNTRIES).map(([k, n]) => `<option value="${k}" ${p.research.country === k ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
    </div>
    <div id="links">${researchLinks(p)}</div>
  </div>
  <div class="card"><h3>Anuncios encontrados</h3>
    <div class="table-wrap"><table><thead><tr><th>Anunciante</th><th>Link</th><th>Inicio</th><th>Fin</th><th>Días</th><th>Anuncios activos</th><th>Formato</th><th>Ángulo</th><th>Precio</th><th></th></tr></thead>
    <tbody>${rows || '<tr><td colspan="10" class="empty">Todavía no cargaste anuncios.</td></tr>'}</tbody></table></div>
    <p><button class="btn" data-add="ads">+ Agregar anuncio</button></p>
  </div>
  <div id="live"></div>`;
}

function metaLive(p) {
  const a = adStats(p);
  document.querySelectorAll('[data-days]').forEach(td => {
    const ad = p.ads[+td.dataset.days];
    const d = ad && daysBetween(ad.startDate, ad.endDate);
    td.innerHTML = d == null ? '—' : d >= WINNER_DAYS ? `<span class="badge good">${d}</span>` : d;
  });
  return `<div class="grid g4">
    ${kpi('Anuncios', a.total)}
    ${kpi('Anunciantes únicos', a.advertisers)}
    ${kpi('Ganadores', a.winners, `${WINNER_DAYS}+ días activos`)}
    ${kpi('Escalando', a.scaling, `${SCALING_ADS}+ anuncios activos`)}
    ${kpi('Días promedio activo', a.avgDays == null ? '—' : Math.round(a.avgDays))}
    ${kpi('Precio mediano ofrecido', usd(a.medianPrice))}
  </div>
  <div class="grid g2" style="margin-top:14px">
    <div class="card"><h3>Formatos de anuncio</h3>${bars(a.formats)}</div>
    <div class="card"><h3>Ángulos que más duran</h3>${a.topAngles.length
      ? bars(a.topAngles.map(x => [x.angle, x.days]), v => v + ' d')
      : '<p class="empty">Cargá ángulos y fechas.</p>'}</div>
  </div>`;
}

function renderCompetitors(p) {
  const rows = p.competitors.map((c, i) => `<tr>
    <td><input type="text" data-path="competitors.${i}.name" value="${esc(c.name)}"></td>
    <td><select data-path="competitors.${i}.platform"><option value=""></option>${PLATFORMS.map(x => `<option ${c.platform === x ? 'selected' : ''}>${x}</option>`).join('')}</select></td>
    <td><input type="url" data-path="competitors.${i}.url" value="${esc(c.url)}" placeholder="https://"></td>
    <td><input type="number" min="0" step="0.01" data-path="competitors.${i}.price" value="${esc(c.price)}" style="min-width:70px"></td>
    <td><input type="number" min="0" data-path="competitors.${i}.reviews" value="${esc(c.reviews)}" style="min-width:70px"></td>
    <td><input type="number" min="0" max="5" step="0.1" data-path="competitors.${i}.rating" value="${esc(c.rating)}" style="min-width:60px"></td>
    <td><input type="text" data-path="competitors.${i}.strengths" value="${esc(c.strengths)}"></td>
    <td><input type="text" data-path="competitors.${i}.weaknesses" value="${esc(c.weaknesses)}" placeholder="Leé las reseñas negativas"></td>
    <td><button class="btn ghost danger sm" data-del="competitors" data-i="${i}">✕</button></td></tr>`).join('');
  return `<h2>Competencia y productos similares</h2>
  <p class="lead">Que haya competencia es bueno: confirma que hay gente comprando. Lo que buscás son sus debilidades para mejorar la oferta.</p>
  <div class="card"><div class="table-wrap"><table><thead><tr><th>Producto</th><th>Plataforma</th><th>Link</th><th>Precio</th><th>Reseñas</th><th>Rating</th><th>Fortalezas</th><th>Debilidades</th><th></th></tr></thead>
    <tbody>${rows || '<tr><td colspan="9" class="empty">Todavía no cargaste competidores.</td></tr>'}</tbody></table></div>
    <p><button class="btn" data-add="competitors">+ Agregar producto</button></p></div>
  <div id="live"></div>`;
}

function compLive(p) {
  const c = compStats(p);
  const sugg = c.medianPrice == null ? '—'
    : `${usd(Math.max(4.9, c.medianPrice * 0.8))} – ${usd(Math.min(MAX_LOW_TICKET, c.medianPrice))}`;
  return `<div class="grid g4">
    ${kpi('Productos', c.total)}
    ${kpi('Precio mínimo', usd(c.minPrice))}
    ${kpi('Precio promedio', usd(c.avgPrice))}
    ${kpi('Precio máximo', usd(c.maxPrice))}
    ${kpi('Reseñas totales', c.reviews, 'prueba de demanda')}
    ${kpi('Rating promedio', c.avgRating == null ? '—' : c.avgRating.toFixed(1) + ' ★', c.avgRating != null && c.avgRating < 4.3 ? 'hay clientes insatisfechos: oportunidad' : '')}
    ${kpi('Precio sugerido', sugg, 'para entrar al mercado')}
  </div>
  <div class="card" style="margin-top:14px"><h3>Plataformas</h3>${bars(c.platforms)}</div>`;
}

function renderOffer(p) {
  return `<h2>Oferta y números</h2>
  <p class="lead">En low ticket la ganancia está en el ticket promedio: precio bajo de entrada + order bump + upsell para que el anuncio se pague solo.</p>
  <div class="grid g2">
    ${formCard('Oferta', 'offer', OFFER_FIELDS, p.offer)}
    <div class="card"><h3>Calculadora</h3>
      ${ECON_FIELDS.map(f => `<div class="field"><label>${f.label}</label><input type="number" min="0" step="0.01" data-path="econ.${f.key}" data-num value="${esc(p.econ[f.key])}"></div>`).join('')}
    </div>
  </div>
  <div id="live"></div>`;
}

function econLive(p) {
  const e = econ(p);
  return `<div class="grid g4" style="margin-top:14px">
    ${kpi('Ticket promedio', usd(e.aov))}
    ${kpi('Neto por venta', usd(e.net), 'después de comisiones')}
    ${kpi('CPA de equilibrio', usd(e.breakEvenCpa), 'lo máximo que podés pagar por venta')}
    ${kpi('ROAS de equilibrio', e.breakEvenRoas == null ? '—' : e.breakEvenRoas.toFixed(2) + '×')}
    ${kpi('Ganancia por venta', usd(e.profitPerSale), e.profitPerSale < 0 ? 'perdés plata en cada venta' : '')}
    ${kpi('Ventas por día', e.salesDay.toFixed(1))}
    ${kpi('Ganancia por día', usd(e.profitDay))}
    ${kpi('Ganancia por mes', usd(e.profitDay * 30))}
  </div>`;
}

function renderChecklist(p) {
  return `<h2>Lanzamiento</h2><p class="lead">Cuando el puntaje da 70+, armá el producto y salí a testear con poco presupuesto.</p>
  <div class="grid g2">${CHECKLIST.map(([group, items]) => `<div class="card"><h3>${group}</h3>${
    items.map(i => `<label class="check-item"><input type="checkbox" data-check="${esc(i)}" ${p.checklist[i] ? 'checked' : ''}><span>${esc(i)}</span></label>`).join('')}</div>`).join('')}</div>`;
}

// ---------- Render ----------

const $ = s => document.querySelector(s);

function renderProjects() {
  $('#projectSelect').innerHTML = state.projects.map(p => `<option value="${p.id}" ${p.id === state.currentId ? 'selected' : ''}>${esc(p.name)}</option>`).join('');
}

function renderTabs() {
  const p = current();
  const existing = document.querySelectorAll('#tabs [data-tab]');
  // Actualizar en el lugar: reemplazar los botones durante un clic (blur → change) haría perder el clic.
  if (existing.length === TABS.length) {
    existing.forEach((btn, i) => {
      const t = TABS[i];
      btn.classList.toggle('active', state.tab === t.id);
      const dot = btn.querySelector('.dot');
      if (dot) dot.classList.toggle('done', t.done(p));
    });
    return;
  }
  $('#tabs').innerHTML = TABS.map(t => `<button class="tab ${state.tab === t.id ? 'active' : ''}" data-tab="${t.id}">${t.label}${
    t.done ? `<span class="dot ${t.done(p) ? 'done' : ''}"></span>` : ''}</button>`).join('');
}

function renderView() {
  const tab = TABS.find(t => t.id === state.tab) || TABS[0];
  $('#view').innerHTML = tab.render(current());
  refreshLive();
}

function refreshLive() {
  const tab = TABS.find(t => t.id === state.tab) || TABS[0];
  const p = current();
  if (tab.live && $('#live')) {
    const html = tab.live(p);
    // El resumen devuelve la vista completa; nos quedamos con el bloque #live.
    if (tab.id === 'resumen') {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      $('#live').innerHTML = tmp.querySelector('#live').innerHTML;
    } else {
      $('#live').innerHTML = html;
    }
  }
  const links = $('#links');
  if (links) {
    const html = researchLinks(p);
    if (links.dataset.html !== html) { links.innerHTML = html; links.dataset.html = html; }
  }
  renderTabs();
}

function renderAll() { renderProjects(); renderTabs(); renderView(); }

// ---------- Eventos ----------

function readInput(el) {
  const path = el.dataset.path;
  const p = current();
  if ('multi' in el.dataset) {
    const all = document.querySelectorAll(`[data-path="${path}"][data-multi]`);
    return [path, [...all].filter(x => x.checked).map(x => x.value)];
  }
  if (el.type === 'radio' && !el.checked) return [path, getPath(p, path)];
  if ('num' in el.dataset || el.type === 'number') return [path, el.value === '' ? '' : +el.value];
  return [path, el.value];
}

document.addEventListener('input', e => {
  const el = e.target;
  if (!el.dataset.path) return;
  const [path, value] = readInput(el);
  setPath(current(), path, value);
  save();
  refreshLive();
});

document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.check) {
    current().checklist[el.dataset.check] = el.checked;
    save(); renderTabs();
    return;
  }
  if (el.dataset.path) {
    const [path, value] = readInput(el);
    setPath(current(), path, value);
    save(); refreshLive();
  }
});

document.addEventListener('click', e => {
  const t = e.target.closest('[data-tab],[data-add],[data-del]');
  if (!t) return;
  const p = current();
  if (t.dataset.tab) { state.tab = t.dataset.tab; save(); renderTabs(); renderView(); }
  if (t.dataset.add) { p[t.dataset.add].push({}); save(); renderView(); }
  if (t.dataset.del) { p[t.dataset.del].splice(+t.dataset.i, 1); save(); renderView(); }
});

$('#projectSelect').addEventListener('change', e => { state.currentId = e.target.value; save(); renderAll(); });

$('#newProject').addEventListener('click', () => {
  const name = prompt('Nombre del producto o idea:', 'Nueva idea');
  if (!name) return;
  const p = newProject(name);
  state.projects.push(p);
  state.currentId = p.id;
  state.tab = 'problema';
  save(); renderAll();
});

$('#renameProject').addEventListener('click', () => {
  const p = current();
  const name = prompt('Nuevo nombre:', p.name);
  if (!name) return;
  p.name = name; save(); renderAll();
});

$('#deleteProject').addEventListener('click', () => {
  const p = current();
  if (!confirm(`¿Borrar "${p.name}"? No se puede deshacer.`)) return;
  state.projects = state.projects.filter(x => x.id !== p.id);
  if (!state.projects.length) state.projects.push(newProject('Mi primer ebook'));
  state.currentId = state.projects[0].id;
  save(); renderAll();
});

$('#exportData').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `validador-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

$('#importData').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data.projects) || !data.projects.length) throw new Error('formato');
    state = { tab: 'resumen', ...data, currentId: data.currentId || data.projects[0].id };
    save(); renderAll();
  } catch (err) {
    alert('El archivo no es un respaldo válido del validador.');
  }
  e.target.value = '';
});

renderAll();
