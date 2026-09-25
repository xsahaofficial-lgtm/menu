(function(){
const W = 200, H = 240, CX = 100, CY = 124, FLOOR = 204;

function hashKardan(str){
  let h = 2166136261 >>> 0;
  for(let i = 0; i < str.length; i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h;
}
function adadTasadofi(a){
  return function(){
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const gerd = v => Math.round(v * 10) / 10;
function hexBeRgb(h){
  h = String(h).replace('#', '');
  if(h.length === 3) h = h.split('').map(x => x + x).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbBeHex(a){ return '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function tarkibRang(a, b, t){ const x = hexBeRgb(a), y = hexBeRgb(b); return rgbBeHex(x.map((v, i) => v + (y[i] - v) * t)); }
const roshanTar = (c, t) => tarkibRang(c, '#ffffff', t);
const tireTar = (c, t) => tarkibRang(c, '#000000', t);
function rgbBeHsl([r, g, b]){
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0; const l = (mx + mn) / 2;
  if(mx !== mn){
    const d = mx - mn;
    s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  return [h * 360, s, l];
}
function hslBeHex(h, s, l){
  h = ((h % 360) + 360) % 360 / 360;
  const f = (p, q, t) => { if(t < 0) t += 1; if(t > 1) t -= 1; if(t < 1/6) return p + (q - p) * 6 * t; if(t < 1/2) return q; if(t < 2/3) return p + (q - p) * (2/3 - t) * 6; return p; };
  let r, g, b;
  if(s === 0){ r = g = b = l; }
  else { const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; r = f(p, q, h + 1/3); g = f(p, q, h); b = f(p, q, h - 1/3); }
  return rgbBeHex([r * 255, g * 255, b * 255]);
}
function larzeshRang(hex, dh, ds, dl){
  const [h, s, l] = rgbBeHsl(hexBeRgb(hex));
  return hslBeHex(h + dh, Math.max(0, Math.min(1, s + ds)), Math.max(0, Math.min(1, l + dl)));
}

function sakhtZamine(seedStr, opts){
  const r = adadTasadofi(hashKardan(seedStr));
  const c = { tas: r, tarifha: [], rangAsli: opts && opts.tint ? opts.tint : null };
  c.bein = (a, b) => a + (b - a) * r();
  c.sahih = (a, b) => Math.floor(c.bein(a, b + 1));
  c.yeki = a => a[Math.floor(r() * a.length)];
  c.shans = p => r() < p;
  c.alamat = () => r() < .5 ? -1 : 1;
  const pre = 'z' + hashKardan(seedStr).toString(36);
  let n = 0;
  c.shenase = () => pre + (++n).toString(36);
  const matnTavaghof = stops => stops.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`).join('');
  c.khatti = (stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => {
    const id = c.shenase();
    c.tarifha.push(`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${matnTavaghof(stops)}</linearGradient>`);
    return `url(#${id})`;
  };
  c.shoaei = (stops, cx = .5, cy = .5, rr = .5, fx, fy) => {
    const id = c.shenase();
    c.tarifha.push(`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${rr}"${fx != null ? ` fx="${fx}" fy="${fy}"` : ''}>${matnTavaghof(stops)}</radialGradient>`);
    return `url(#${id})`;
  };
  c.boresh = inner => { const id = c.shenase(); c.tarifha.push(`<clipPath id="${id}">${inner}</clipPath>`); return `url(#${id})`; };
  c.ostovane = (col, k = 1) => c.khatti([[0, tireTar(col, .32 * k)], [.22, roshanTar(col, .22 * k)], [.5, col], [.85, tireTar(col, .18 * k)], [1, tireTar(col, .4 * k)]], 0, 0, 1, 0);
  c.shishe = () => c.khatti([[0, '#ffffff', .2], [.14, '#ffffff', .05], [.5, '#ffffff', .02], [.86, '#ffffff', .06], [1, '#ffffff', .18]], 0, 0, 1, 0);
  c.gooy = (col, k = 1) => c.shoaei([[0, roshanTar(col, .3 * k)], [.6, col], [1, tireTar(col, .3 * k)]], .38, .32, .75);
  return c;
}

function saye(c, x, y, rx, ry, op = .5){
  return `<ellipse cx="${gerd(x)}" cy="${gerd(y)}" rx="${gerd(rx)}" ry="${gerd(ry)}" fill="${c.shoaei([[0, '#000', op], [.6, '#000', op * .5], [1, '#000', 0]])}"/>`;
}
function kaman(x, y, r, a0, a1){
  const p = a => [gerd(x + Math.cos(a * Math.PI / 180) * r), gerd(y + Math.sin(a * Math.PI / 180) * r)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${x0} ${y0}A${gerd(r)} ${gerd(r)} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}
function masirSetare(k, R, ri, rot = -90){
  let d = '';
  for(let i = 0; i < k * 2; i++){
    const a = (i / (k * 2)) * Math.PI * 2 + rot * Math.PI / 180, rr = i % 2 ? ri : R;
    d += (i ? 'L' : 'M') + gerd(Math.cos(a) * rr) + ' ' + gerd(Math.sin(a) * rr);
  }
  return d + 'Z';
}
function marpich(turns, r0, r1, steps){
  const pts = [], n = steps || Math.round(turns * 36);
  for(let i = 0; i <= n; i++){
    const t = i / n, a = t * turns * Math.PI * 2, rr = r1 - (r1 - r0) * t;
    pts.push(gerd(Math.cos(a) * rr) + ' ' + gerd(Math.sin(a) * rr));
  }
  return 'M' + pts.join('L');
}
function lakeNarm(c, x, y, r, k = 9, amp = .18){
  const pts = [];
  for(let i = 0; i < k; i++){
    const a = i / k * Math.PI * 2, rr = r * (1 + c.bein(-amp, amp));
    pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
  }
  let d = '';
  for(let i = 0; i < k; i++){
    const p0 = pts[(i - 1 + k) % k], p1 = pts[i], p2 = pts[(i + 1) % k], p3 = pts[(i + 2) % k];
    if(i === 0) d += `M${gerd(p1[0])} ${gerd(p1[1])}`;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${gerd(c1[0])} ${gerd(c1[1])} ${gerd(c2[0])} ${gerd(c2[1])} ${gerd(p2[0])} ${gerd(p2[1])}`;
  }
  return d + 'Z';
}

const GHALB = 'M0 32C-46 4-38-40 0-18 38-40 46 4 0 32Z';
const TALAEI = '#dcb46c';
const CHINI = ['#f3ece1', '#f3ece1', '#f6f1ea', '#2d5f9a', '#232120', '#b8613b', '#8ea888', '#e7b6ae', '#efe0c2', '#1f6f78', '#d8a53a', '#7a2e3a', '#3b4a7a'];
const ZAMINEHA = ['#1f4e8c', '#163a6b', '#2a5fa0', '#0f2f57', '#3a6ea8', '#1b4470', '#24568f', '#12325e', '#2c3e66', '#3b5f8a', '#a4552f', '#c06a3e', '#5a6b3a', '#1e5a6e', '#6a2f2a', '#8a6a2a'];

function pasZamine(c, hint){
  let base = c.rangAsli && hint === 'tint' ? tireTar(c.rangAsli, .55) : (hint && hint !== 'tint' ? hint : c.yeki(ZAMINEHA));
  base = larzeshRang(base, c.bein(-10, 10), c.bein(-.05, .05), c.bein(-.03, .03));
  let s = `<rect width="${W}" height="${H}" fill="${c.shoaei([[0, roshanTar(base, .18)], [.55, base], [1, tireTar(base, .5)]], .5, .48, .78)}"/>`;
  const ink = c.yeki(['#f3dca6', '#ffffff', TALAEI, roshanTar(base, .5)]);
  const op = gerd(c.bein(.06, .11) * 100) / 100;
  const kind = c.yeki(['girih', 'dots', 'rays', 'arches', 'waves', 'diamonds', 'rings', 'petals', 'stripes', 'scales', 'lattice', 'stars']);
  const olgu = (w, h, inner, rot = 0) => {
    const id = c.shenase();
    c.tarifha.push(`<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse"${rot ? ` patternTransform="rotate(${rot})"` : ''}>${inner}</pattern>`);
    return `<rect width="${W}" height="${H}" fill="url(#${id})" opacity="${op}"/>`;
  };
  if(kind === 'girih'){
    const t = c.yeki([26, 30, 34]);
    s += olgu(t, t, `<path transform="translate(${t/2} ${t/2})" d="${masirSetare(8, t * .36, t * .2)}" fill="none" stroke="${ink}" stroke-width="1"/><path d="M0 0L${t*.14} 0M0 0L0 ${t*.14}M${t} ${t}L${t*.86} ${t}M${t} ${t}L${t} ${t*.86}" stroke="${ink}"/>`);
  } else if(kind === 'dots'){
    const t = c.yeki([10, 12, 14]);
    s += olgu(t, t, `<circle cx="${t/4}" cy="${t/4}" r="1.3" fill="${ink}"/><circle cx="${t*.75}" cy="${t*.75}" r="1.3" fill="${ink}"/>`);
  } else if(kind === 'rays'){
    let g = '';
    const k = c.yeki([20, 24, 32, 40]);
    for(let i = 0; i < k; i += 2){
      const a0 = i / k * Math.PI * 2, a1 = (i + 1) / k * Math.PI * 2;
      g += `<path d="M${CX} ${CY}L${gerd(CX + Math.cos(a0) * 300)} ${gerd(CY + Math.sin(a0) * 300)}L${gerd(CX + Math.cos(a1) * 300)} ${gerd(CY + Math.sin(a1) * 300)}Z"/>`;
    }
    s += `<g fill="${ink}" opacity="${op * .8}">${g}</g>`;
  } else if(kind === 'arches'){
    s += olgu(24, 32, `<path d="M3 32V15C3 8 8 4 12 2c4 2 9 6 9 13v17" fill="none" stroke="${ink}"/>`);
  } else if(kind === 'waves'){
    s += olgu(32, 14, `<path d="M0 7c8-7 8 7 16 0s8 7 16 0" fill="none" stroke="${ink}" stroke-width="1.1"/>`, c.yeki([0, 0, 90, 45]));
  } else if(kind === 'diamonds'){
    s += olgu(20, 20, `<path d="M10 2L18 10 10 18 2 10Z" fill="none" stroke="${ink}"/><circle cx="10" cy="10" r="1.2" fill="${ink}"/>`);
  } else if(kind === 'rings'){
    let g = '';
    for(let rr = 18; rr < 220; rr += c.yeki([10, 12, 14])) g += `<circle cx="${CX}" cy="${CY}" r="${rr}"/>`;
    s += `<g fill="none" stroke="${ink}" opacity="${op}">${g}</g>`;
  } else if(kind === 'petals'){
    let g = ''; const k = c.yeki([8, 10, 12, 16]);
    for(let i = 0; i < k; i++) g += `<ellipse transform="translate(${CX} ${CY}) rotate(${i * 360 / k})" cy="-78" rx="${gerd(180 / k)}" ry="40"/>`;
    s += `<g fill="${ink}" fill-opacity=".35" stroke="${ink}" opacity="${op * 1.2}">${g}<circle cx="${CX}" cy="${CY}" r="104" fill="none"/></g>`;
  } else if(kind === 'stripes'){
    s += olgu(12, 12, `<path d="M0 0V12" stroke="${ink}" stroke-width="${c.yeki([1, 3, 5])}"/>`, c.yeki([0, 30, 45, 60, 90, 120]));
  } else if(kind === 'scales'){
    s += olgu(20, 12, `<path d="M0 12a10 10 0 0 1 20 0M-10 6a10 10 0 0 1 20 0M10 6a10 10 0 0 1 20 0" fill="none" stroke="${ink}"/>`);
  } else if(kind === 'lattice'){
    s += olgu(18, 18, `<path d="M0 9h18M9 0v18" stroke="${ink}"/><circle cx="9" cy="9" r="2.4" fill="none" stroke="${ink}"/>`, 45);
  } else {
    let g = '';
    for(let i = 0; i < 26; i++){ const x = c.bein(4, 196), y = c.bein(4, 236), sz = c.bein(1.5, 4); g += `<path transform="translate(${gerd(x)} ${gerd(y)})" d="M0 ${-sz}L${sz*.3} ${-sz*.3} ${sz} 0 ${sz*.3} ${sz*.3} 0 ${sz} ${-sz*.3} ${sz*.3} ${-sz} 0 ${-sz*.3} ${-sz*.3}Z"/>`; }
    s += `<g fill="${ink}" opacity="${op * 2}">${g}</g>`;
  }
  s += `<ellipse cx="${CX}" cy="${CY}" rx="92" ry="92" fill="${c.shoaei([[0, '#fff', .1], [1, '#fff', 0]])}"/>`;
  return s;
}

function rooyeMiz(c, y = FLOOR){
  const kind = c.yeki(['wood', 'marble', 'linen', 'plain', 'plain']);
  let s = '';
  if(kind === 'wood'){
    const col = c.yeki(['#6b4125', '#4a2c1a', '#8a5a34', '#3a2418']);
    s += `<rect y="${y}" width="${W}" height="${H - y}" fill="${c.khatti([[0, roshanTar(col, .1)], [1, tireTar(col, .4)]])}"/>`;
    for(let i = 0; i < 5; i++){ const yy = y + 5 + i * 7 + c.bein(-2, 2); s += `<path d="M0 ${gerd(yy)}C60 ${gerd(yy + c.bein(-3, 3))} 130 ${gerd(yy + c.bein(-3, 3))} 200 ${gerd(yy)}" stroke="${tireTar(col, .3)}" stroke-opacity=".5" fill="none"/>`; }
  } else if(kind === 'marble'){
    const col = c.yeki(['#e9e4dc', '#d8d2c8', '#2b2b2e', '#c9d3d6']);
    s += `<rect y="${y}" width="${W}" height="${H - y}" fill="${c.khatti([[0, col], [1, tireTar(col, .3)]])}"/>`;
    for(let i = 0; i < 3; i++) s += `<path d="M${gerd(c.bein(0, 80))} ${H}C${gerd(c.bein(40, 120))} ${gerd(y + c.bein(10, 30))} ${gerd(c.bein(80, 160))} ${gerd(y + c.bein(0, 20))} ${gerd(c.bein(140, 200))} ${y}" stroke="${col === '#2b2b2e' ? '#6f6f78' : '#9d958a'}" stroke-opacity=".5" fill="none" stroke-width=".8"/>`;
  } else if(kind === 'linen'){
    const col = c.yeki(['#c9b48f', '#8b3a3a', '#35557a', '#6d7b5a', '#e9dcc0']);
    s += `<rect y="${y}" width="${W}" height="${H - y}" fill="${c.khatti([[0, col], [1, tireTar(col, .35)]])}"/>`;
    const id = c.shenase();
    c.tarifha.push(`<pattern id="${id}" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 2h4M2 0v4" stroke="#000" stroke-opacity=".12"/></pattern>`);
    s += `<rect y="${y}" width="${W}" height="${H - y}" fill="url(#${id})"/>`;
  } else {
    s += `<rect y="${y}" width="${W}" height="${H - y}" fill="${c.khatti([[0, '#000', .25], [1, '#000', .55]])}"/>`;
  }
  s += `<path d="M0 ${y}H${W}" stroke="#fff" stroke-opacity=".12"/>`;
  return s;
}

function bokhar(c, x, y, n = 3, spread = 14, h = 1){
  let s = '';
  for(let i = 0; i < n; i++){
    const xx = x + (i - (n - 1) / 2) * spread + c.bein(-3, 3);
    s += `<path class="az-steam" style="animation-delay:${gerd(i * .9 + c.bein(0, .6))}s" d="M${gerd(xx)} ${y}c-7-9 7-14 0-${gerd(22*h)}s7-14 0-${gerd(22*h)}" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="3" stroke-linecap="round"/>`;
  }
  return s;
}
function habab(c, n, x0, x1, y0, y1, col = '#fff'){
  let s = '';
  for(let i = 0; i < n; i++){
    const x = c.bein(x0, x1), y = c.bein(y0, y1);
    s += `<circle class="az-rise" style="animation-delay:${gerd(c.bein(0, 4))}s;animation-duration:${gerd(c.bein(2.5, 5))}s" cx="${gerd(x)}" cy="${gerd(y)}" r="${gerd(c.bein(.7, 2.2))}" fill="${col}" fill-opacity="${gerd(c.bein(.35, .7) * 100) / 100}"/>`;
  }
  return s;
}
function daneGhahve(c, x, y, rot, s = 1){
  const col = c.yeki(['#4a2716', '#5a3019', '#3a1e10']);
  return `<g transform="translate(${gerd(x)} ${gerd(y)}) rotate(${gerd(rot)}) scale(${s})"><ellipse rx="6" ry="8.4" fill="${c.gooy(col, 1.2)}"/><path d="M0-7C3.5-2-3.5 2 0 7" stroke="${tireTar(col, .5)}" stroke-width="1.4" fill="none"/></g>`;
}
function daneHayeAtraf(c, n, rMin = 88, rMax = 104, cx = CX, cy = CY){
  let s = '';
  for(let i = 0; i < n; i++){
    const a = c.bein(0, Math.PI * 2), d = c.bein(rMin, rMax);
    const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
    if(x > 8 && x < 192 && y > 20 && y < 232) s += daneGhahve(c, x, y, c.bein(0, 360), c.bein(.8, 1.1));
  }
  return s;
}
function chubDarchin(c, x, y, rot, len = 70){
  const col = c.yeki(['#7b3c17', '#8a4520', '#6a3212']);
  return `<g transform="translate(${gerd(x)} ${gerd(y)}) rotate(${gerd(rot)})"><rect x="${-len/2}" y="-6" width="${len}" height="12" rx="6" fill="${c.khatti([[0, roshanTar(col, .2)], [.5, col], [1, tireTar(col, .35)]])}"/><path d="M${-len/2 + 4} -1.5H${len/2 - 4}" stroke="${roshanTar(col, .3)}" stroke-width="1.4" opacity=".7"/><ellipse cx="${len/2 - 1}" cy="0" rx="2.5" ry="6" fill="${tireTar(col, .2)}"/></g>`;
}
function badiyan(c, x, y, rot, s = 1){
  let p = '';
  for(let i = 0; i < 8; i++) p += `<ellipse transform="rotate(${i * 45})" cy="-8" rx="3.2" ry="8" fill="${c.khatti([[0, '#8a4a22'], [1, '#4a220e']])}"/><circle transform="rotate(${i * 45})" cy="-8" r="1.3" fill="#c28a52"/>`;
  return `<g transform="translate(${gerd(x)} ${gerd(y)}) rotate(${gerd(rot)}) scale(${s})">${p}<circle r="2.6" fill="#3a1a0a"/></g>`;
}
function hel(c, x, y, rot){
  return `<g transform="translate(${gerd(x)} ${gerd(y)}) rotate(${gerd(rot)})"><path d="M0-10C6-7 6 7 0 10-6 7-6-7 0-10Z" fill="${c.gooy('#8aa556')}"/><path d="M0-9V9M-2.5-7C-3.5 0-3.5 0-2.5 7M2.5-7C3.5 0 3.5 0 2.5 7" stroke="#5c7432" stroke-width=".7" fill="none"/></g>`;
}
function barg(c, x, y, rot, s = 1, col){
  col = col || c.yeki(['#4f9a45', '#5da84e', '#3f8a3a']);
  return `<g transform="translate(${gerd(x)} ${gerd(y)}) rotate(${gerd(rot)}) scale(${gerd(s * 100) / 100})"><path d="M0 0C8-10 22-11 28 0 22 11 8 10 0 0Z" fill="${c.khatti([[0, roshanTar(col, .2)], [1, tireTar(col, .2)]])}"/><path d="M0 0H26M8 0L12-4M14 0L18-4M10 0L14 4M16 0L20 4" stroke="${tireTar(col, .35)}" stroke-width=".9" fill="none"/></g>`;
}
function shakheNana(c, x, y, rot, s = 1){
  let g = `<path d="M0 0V-26" stroke="#3d6b2c" stroke-width="1.6"/>`;
  g += barg(c, 0, -8, -150, .55) + barg(c, 0, -8, -30, .55) + barg(c, 0, -18, -140, .5) + barg(c, 0, -18, -40, .5) + barg(c, 0, -26, -90, .5);
  return `<g transform="translate(${gerd(x)} ${gerd(y)}) rotate(${gerd(rot)}) scale(${s})">${g}</g>`;
}
function halgheLimu(c, x, y, r, kind, rot = 0){
  const P = { lemon: ['#f7d34f', '#fff6c2', '#e8b92a'], lime: ['#a8cf4a', '#effad0', '#6f9a26'], orange: ['#f7973a', '#ffe0b8', '#d8661a'], grapefruit: ['#f36d6d', '#ffd8d0', '#cc3f3f'], blood: ['#c4283e', '#ffc2c8', '#8a1024'] }[kind] || ['#f7d34f', '#fff6c2', '#e8b92a'];
  let seg = '';
  for(let i = 0; i < 10; i++){ const a = i / 10 * Math.PI * 2 + rot; seg += `<path d="M0 0L${gerd(Math.cos(a) * r * .82)} ${gerd(Math.sin(a) * r * .82)}" stroke="${P[1]}" stroke-width="${gerd(r * .08)}"/>`; }
  return `<g transform="translate(${gerd(x)} ${gerd(y)})"><circle r="${r}" fill="${P[2]}"/><circle r="${gerd(r * .9)}" fill="${P[1]}"/><circle r="${gerd(r * .82)}" fill="${c.shoaei([[0, roshanTar(P[0], .3)], [1, P[0]]])}"/>${seg}<circle r="${gerd(r * .1)}" fill="${P[1]}"/></g>`;
}
function tut(c, x, y, r, col){
  col = col || c.yeki(['#b3123a', '#3b1f5c', '#8e1030', '#26164a']);
  return `<g transform="translate(${gerd(x)} ${gerd(y)})"><circle r="${r}" fill="${c.gooy(col)}"/><circle cx="${gerd(-r*.35)}" cy="${gerd(-r*.35)}" r="${gerd(r*.25)}" fill="#fff" opacity=".45"/></g>`;
}
function tutFarangi(c, x, y, s, rot = 0){
  let seeds = '';
  for(let i = 0; i < 12; i++){ const sx = c.bein(-9, 9), sy = c.bein(-4, 12); if(Math.abs(sx) < 11 - sy * .5) seeds += `<ellipse cx="${gerd(sx)}" cy="${gerd(sy)}" rx=".8" ry="1.3" fill="#ffe28a"/>`; }
  return `<g transform="translate(${gerd(x)} ${gerd(y)}) rotate(${rot}) scale(${s})"><path d="M0 20C-8 16-15 4-14-4-13-10-7-12 0-11 7-12 13-10 14-4 15 4 8 16 0 20Z" fill="${c.shoaei([[0, '#ff6b6b'], [.7, '#d61f35'], [1, '#8f0f22']], .4, .3, .8)}"/>${seeds}<path d="M0-11L-9-15-4-11-11-9-3-9 0-14 3-9 11-9 4-11 9-15Z" fill="#3f8a3a"/></g>`;
}
function gilas(c, x, y, s = 1){
  return `<g transform="translate(${gerd(x)} ${gerd(y)}) scale(${s})"><path d="M0-6C2-16 8-22 14-24" stroke="#4a6a20" stroke-width="1.6" fill="none"/><circle r="7" fill="${c.gooy('#b0152f')}"/><circle cx="-2.4" cy="-2.6" r="2" fill="#fff" opacity=".6"/></g>`;
}
function pashidani(c, n, x0, x1, y0, y1, cols){
  cols = cols || ['#f7c6d4', '#8ec5e6', '#f6e27a', '#a9d18e', '#fff', '#e66a8a'];
  let s = '';
  for(let i = 0; i < n; i++) s += `<rect x="${gerd(c.bein(x0, x1))}" y="${gerd(c.bein(y0, y1))}" width="5" height="1.8" rx=".9" fill="${c.yeki(cols)}" transform="rotate(${c.sahih(0, 180)} ${gerd(c.bein(x0, x1))} ${gerd(c.bein(y0, y1))})"/>`;
  return s;
}
function pudr(c, n, cx, cy, rad, col, op = .5, rmax = 1.3){
  let s = '';
  for(let i = 0; i < n; i++){
    const a = c.bein(0, Math.PI * 2), d = Math.sqrt(c.tas()) * rad;
    s += `<circle cx="${gerd(cx + Math.cos(a) * d)}" cy="${gerd(cy + Math.sin(a) * d)}" r="${gerd(c.bein(.4, rmax))}" fill="${col}" fill-opacity="${gerd(c.bein(op * .4, op) * 100) / 100}"/>`;
  }
  return s;
}
function niKhordani(c, x1, y1, x2, y2, w = 6){
  const col = c.yeki(['#e8453c', '#2d6fb0', '#f2c94c', '#2a9d8f', '#f6eee1', '#1c1c1c', '#e07a9a']);
  const striped = c.shans(.6);
  const id = c.shenase();
  const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  if(striped) c.tarifha.push(`<pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(${gerd(ang + 55)})"><rect width="8" height="8" fill="#fff"/><rect width="4" height="8" fill="${col === '#f6eee1' ? '#c9a05c' : col}"/></pattern>`);
  const fill = striped ? `url(#${id})` : col;
  return `<path d="M${gerd(x1)} ${gerd(y1)}L${gerd(x2)} ${gerd(y2)}" stroke="${fill}" stroke-width="${w}" stroke-linecap="round"/><path d="M${gerd(x1)} ${gerd(y1)}L${gerd(x2)} ${gerd(y2)}" stroke="#fff" stroke-opacity=".25" stroke-width="${gerd(w * .3)}" stroke-linecap="round" transform="translate(-1 0)"/>`;
}
function ghashogh(c, x, y, rot, s = 1, col){
  col = col || c.yeki(['#d9d6d0', '#dcb46c', '#c9c4bc']);
  return `<g transform="translate(${gerd(x)} ${gerd(y)}) rotate(${gerd(rot)}) scale(${s})">${saye(c, 3, 4, 34, 8, .35)}<rect x="0" y="-2.4" width="46" height="4.8" rx="2.4" fill="${c.khatti([[0, roshanTar(col, .4)], [1, tireTar(col, .25)]])}"/><ellipse cx="-9" cy="0" rx="12" ry="8" fill="${c.shoaei([[0, roshanTar(col, .5)], [1, tireTar(col, .2)]], .6, .4, .7)}"/></g>`;
}
function ghandHabbe(c, x, y, rot, s = 1, col = '#fbf7ef'){
  return `<g transform="translate(${gerd(x)} ${gerd(y)}) rotate(${gerd(rot)}) scale(${s})">${saye(c, 2, 3, 11, 11, .35)}<rect x="-8" y="-8" width="16" height="16" rx="2.5" fill="${col}"/><path d="M-8 -3H8M-3 -8V8" stroke="#000" stroke-opacity=".05"/>${pudr(c, 8, 0, 0, 7, '#e4dccb', .9, .9)}</g>`;
}
function vafel(c, x, y, rot, len = 60){
  return `<g transform="translate(${gerd(x)} ${gerd(y)}) rotate(${gerd(rot)})"><rect x="0" y="-5" width="${len}" height="10" rx="4" fill="${c.ostovane('#d9a35a')}"/><path d="M6 -5V5M14 -5V5M22 -5V5M30 -5V5M38 -5V5M46 -5V5M54 -5V5" stroke="#a86f2c" stroke-width=".8" opacity=".6"/></g>`;
}

const TONHA = {
  coffee: [['#c9905a', '#8a5530', '#46240d'], '#f7ecd9'],
  coffee2: [['#d7a06a', '#9a6238', '#553014'], '#fbf1e0'],
  dark: [['#a86a3c', '#6a3a1c', '#2e1406'], '#f6e8d2'],
  matcha: [['#a3c872', '#6e9a3f', '#3d5e1f'], '#f7f5e4'],
  pink: [['#f6b3c6', '#d9738f', '#9c3b57'], '#fff3f6'],
  chai: [['#dcaa76', '#a8703f', '#6b4020'], '#faeedd'],
  choco: [['#8e5638', '#5c3120', '#2e160c'], '#f3e5d3'],
  milk: [['#fbf6ee', '#efe4d2', '#d9c7aa'], '#ffffff'],
  honey: [['#f8e9c8', '#ecd3a0', '#c9a060'], '#fffaf0']
};
function rangeMayee(c, t){ return c.shoaei([[0, t[0][0]], [.55, t[0][1]], [1, t[0][2]]], .45, .4, .62); }

function naghsheLatte(c, kind, Rl, foam, cut){
  const k = Rl / 58;
  let g = '';
  if(kind === 'heart'){
    const layers = c.sahih(1, 4);
    for(let i = 0; i < layers; i++){
      const s = 1 - i * (layers > 2 ? .2 : .26);
      g += `<path transform="translate(0 ${i * 5}) scale(${gerd(s * 100) / 100})" d="${GHALB}" fill="${i % 2 ? cut : foam}"/>`;
    }
    if(c.shans(.7)) g += `<path d="M0-46V${c.sahih(30, 40)}" stroke="${cut}" stroke-width="2" stroke-linecap="round"/>`;
  } else if(kind === 'rosetta'){
    const n = c.sahih(6, 10), curve = c.bein(-.25, .25);
    for(let i = 0; i < n; i++){
      const t = i / (n - 1), cy = 40 - t * 72, rx = 46 - t * 32, ry = 10 - t * 4, dx = Math.sin(t * Math.PI) * curve * 20;
      g += `<ellipse cx="${gerd(dx)}" cy="${gerd(cy)}" rx="${gerd(rx)}" ry="${gerd(ry)}" fill="${foam}"/>`;
      g += `<ellipse cx="${gerd(dx)}" cy="${gerd(cy - ry * .55)}" rx="${gerd(rx * .84)}" ry="${gerd(ry * .72)}" fill="${cut}"/>`;
    }
    g += `<path transform="translate(0 -40) scale(.32)" d="${GHALB}" fill="${foam}"/>`;
    g += `<path d="M0-46Q${gerd(curve * 30)} 0 0 46" stroke="${cut}" stroke-width="2.2" stroke-linecap="round" fill="none"/>`;
  } else if(kind === 'tulip'){
    const n = c.sahih(10, 13), kaj = c.bein(-.35, .35);
    let akhar = 0;
    for(let i = 0; i < n; i++){
      const t = i / (n - 1), cy = 42 - t * 80, rx = 36 - t * 28, ry = 6.6 - t * 3, dx = Math.sin(t * Math.PI) * kaj * 18;
      g += `<ellipse cx="${gerd(dx)}" cy="${gerd(cy)}" rx="${gerd(rx)}" ry="${gerd(ry)}" fill="${foam}"/>`;
      g += `<ellipse cx="${gerd(dx)}" cy="${gerd(cy - ry * .6)}" rx="${gerd(rx * .86)}" ry="${gerd(ry * .74)}" fill="${cut}"/>`;
      akhar = dx;
    }
    g += `<path transform="translate(${gerd(akhar)} -42) scale(.26)" d="${GHALB}" fill="${foam}"/>`;
    g += `<path d="M0-46Q${gerd(kaj * 26)} 0 0 46" stroke="${cut}" stroke-width="1.6" stroke-linecap="round" fill="none"/>`;
  } else if(kind === 'swan'){
    for(let i = 0; i < 6; i++){
      const t = i / 5, x = -12 - t * 10, y = 34 - t * 48, rx = 30 - t * 18;
      g += `<ellipse transform="rotate(${gerd(-20 - t * 20)} ${gerd(x)} ${gerd(y)})" cx="${gerd(x)}" cy="${gerd(y)}" rx="${gerd(rx)}" ry="${gerd(8 - t * 3)}" fill="${foam}"/>`;
      g += `<ellipse transform="rotate(${gerd(-20 - t * 20)} ${gerd(x)} ${gerd(y - 4)})" cx="${gerd(x)}" cy="${gerd(y - 4)}" rx="${gerd(rx * .82)}" ry="${gerd(6 - t * 2)}" fill="${cut}"/>`;
    }
    g += `<path d="M6 38C30 30 34 6 22-10 12-24 20-38 32-34" fill="none" stroke="${foam}" stroke-width="7" stroke-linecap="round"/>`;
    g += `<path transform="translate(33 -34) rotate(70) scale(.2)" d="${GHALB}" fill="${foam}"/>`;
  } else if(kind === 'web'){
    [48, 38, 28, 18].forEach(rad => g += `<circle r="${rad}" fill="none" stroke="${foam}" stroke-width="4.4"/>`);
    g += `<circle r="7" fill="${foam}"/>`;
    const kk = c.sahih(6, 11), bend = c.bein(12, 30) * c.alamat();
    for(let i = 0; i < kk; i++){
      const a = i / kk * Math.PI * 2, x = Math.cos(a) * 58, y = Math.sin(a) * 58;
      const qx = Math.cos(a) * 28 + Math.cos(a + Math.PI / 2) * bend * .4, qy = Math.sin(a) * 28 + Math.sin(a + Math.PI / 2) * bend * .4;
      g += `<path d="M0 0Q${gerd(qx)} ${gerd(qy)} ${gerd(x)} ${gerd(y)}" fill="none" stroke="${cut}" stroke-width="1.6"/>`;
    }
  } else if(kind === 'star'){
    g += `<path d="${masirSetare(5, 40, 17)}" fill="${foam}" stroke="${foam}" stroke-width="7" stroke-linejoin="round"/>`;
    g += `<path d="${masirSetare(5, 21, 9)}" fill="${cut}" fill-opacity=".45" stroke="${cut}" stroke-opacity=".45" stroke-width="3" stroke-linejoin="round"/>`;
    for(let i = 0; i < 5; i++){ const a = (i * 72 - 90) * Math.PI / 180; g += `<path d="M0 0L${gerd(Math.cos(a) * 38)} ${gerd(Math.sin(a) * 38)}" stroke="${cut}" stroke-width="1.2" stroke-linecap="round"/>`; }
    g += `<circle r="5" fill="${foam}"/>`;
  } else if(kind === 'wing'){
    g += `<path d="M0-50C34-30 34 30 0 50-34 30-34-30 0-50Z" fill="${foam}"/>`;
    const n = c.sahih(7, 11);
    for(let i = 1; i < n; i++){
      const y = -44 + i * (88 / n), w = Math.sqrt(1 - Math.pow(y / 50, 2)) * 26;
      g += `<path d="M0 ${gerd(y + 6)}Q${gerd(w * .6)} ${gerd(y - 2)} ${gerd(w + 2)} ${gerd(y - 8)}M0 ${gerd(y + 6)}Q${gerd(-w * .6)} ${gerd(y - 2)} ${gerd(-w - 2)} ${gerd(y - 8)}" stroke="${cut}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    }
    g += `<path d="M0-50V52" stroke="${cut}" stroke-width="2.2" stroke-linecap="round"/>`;
  } else {
    g += `<path transform="scale(.9)" d="${GHALB}" fill="${foam}"/><path transform="translate(0 4) scale(.55)" d="${GHALB}" fill="${cut}"/><path transform="translate(0 7) scale(.3)" d="${GHALB}" fill="${foam}"/>`;
  }
  let micro = '';
  for(let i = 0; i < 16; i++){ const a = c.bein(0, 6.28), d = c.bein(10, 55); micro += `<circle cx="${gerd(Math.cos(a) * d)}" cy="${gerd(Math.sin(a) * d)}" r="${gerd(c.bein(.4, 1.2))}" fill="${foam}" fill-opacity=".45"/>`; }
  const ring = c.shans(.5) ? `<circle r="${gerd(55)}" fill="none" stroke="${foam}" stroke-opacity=".35" stroke-width="2.5" stroke-dasharray="${c.sahih(4, 14)} ${c.sahih(3, 9)}"/>` : '';
  return `<g transform="scale(${gerd(k * 100) / 100}) rotate(${c.sahih(-25, 25)}) scale(${gerd(c.bein(.88, 1.04) * 100) / 100})">${ring}${micro}${g}</g>`;
}

function fenjanAzBala(c, o){
  const x = o.x != null ? o.x : CX, y = o.y != null ? o.y : CY, R = o.R || 60;
  const color = o.color || c.yeki(CHINI);
  const saucer = o.saucer !== false;
  const sR = o.sR || R * 1.36;
  const sColor = o.sColor || (c.shans(.65) ? color : c.yeki(CHINI));
  const gold = o.gold != null ? o.gold : c.shans(.35);
  const ha = o.ha != null ? o.ha : c.bein(-55, 55);
  let s = '';
  const cg = c.shoaei([[0, roshanTar(color, .38)], [.55, color], [1, tireTar(color, .28)]], .36, .3, .78);
  if(saucer){
    s += saye(c, x + 8, y + 10, sR + 8, sR + 8, .6);
    if(o.square){
      const q = sR * .92;
      s += `<rect x="${gerd(x - q)}" y="${gerd(y - q)}" width="${gerd(q * 2)}" height="${gerd(q * 2)}" rx="${gerd(q * .28)}" fill="${c.shoaei([[0, roshanTar(sColor, .3)], [.7, sColor], [1, tireTar(sColor, .25)]], .4, .35, .8)}"/>`;
      s += `<rect x="${gerd(x - q + 7)}" y="${gerd(y - q + 7)}" width="${gerd(q * 2 - 14)}" height="${gerd(q * 2 - 14)}" rx="${gerd(q * .22)}" fill="none" stroke="${tireTar(sColor, .3)}" stroke-opacity=".3" stroke-width="1.5"/>`;
    } else {
      s += `<circle cx="${x}" cy="${y}" r="${gerd(sR)}" fill="${c.shoaei([[0, roshanTar(sColor, .3)], [.7, sColor], [1, tireTar(sColor, .25)]], .4, .35, .75)}"/>`;
      s += `<circle cx="${x}" cy="${y}" r="${gerd(sR * .76)}" fill="none" stroke="${tireTar(sColor, .3)}" stroke-opacity=".35" stroke-width="1.5"/>`;
      if(gold) s += `<circle cx="${x}" cy="${y}" r="${gerd(sR - 2.5)}" fill="none" stroke="${TALAEI}" stroke-width="1.4"/>`;
    }
    if(c.shans(.35)) s += `<circle cx="${x}" cy="${y}" r="${gerd(sR * .88)}" fill="none" stroke="${c.yeki([TALAEI, '#2d5f9a', tireTar(sColor, .35)])}" stroke-opacity=".7" stroke-width="2.2" stroke-dasharray="1.5 5" stroke-linecap="round"/>`;
    if(o.onSaucer) s += o.onSaucer;
  } else {
    s += saye(c, x + 6, y + 8, R + 12, R + 12, .6);
  }
  if(o.handle !== false) s += `<g transform="translate(${x} ${y}) rotate(${gerd(ha)})"><rect x="${gerd(R - 10)}" y="${gerd(-R * .15)}" width="${gerd(R * .5 + 10)}" height="${gerd(R * .3)}" rx="${gerd(R * .15)}" fill="${cg}"/>${R > 30 ? `<rect x="${gerd(R + 3)}" y="-3.5" width="${gerd(R * .5 - 10)}" height="7" rx="3.5" fill="${tireTar(color, .35)}" opacity=".4"/>` : ''}</g>`;
  s += `<circle cx="${x + 3}" cy="${y + 5}" r="${R}" fill="#000" opacity=".22"/>`;
  s += `<circle cx="${x}" cy="${y}" r="${R}" fill="${cg}"/>`;
  s += `<circle cx="${x}" cy="${y}" r="${gerd(R * .9)}" fill="${c.shoaei([[0, tireTar(color, .35)], [.82, tireTar(color, .1)], [1, roshanTar(color, .15)]])}"/>`;
  const Rl = R * (o.fill || .8);
  const clip = c.boresh(`<circle cx="${x}" cy="${y}" r="${gerd(Rl)}"/>`);
  s += `<circle cx="${x}" cy="${y}" r="${gerd(Rl)}" fill="${o.liquid}"/>`;
  if(o.inner) s += `<g clip-path="${clip}"><g transform="translate(${x} ${y})"><g class="az-spin">${`<circle r="${gerd(Rl)}" fill="none"/>`}${o.inner}</g></g></g>`;
  s += `<circle cx="${x}" cy="${y}" r="${gerd(Rl)}" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="2.5"/>`;
  if(gold) s += `<circle cx="${x}" cy="${y}" r="${gerd(R - 1.3)}" fill="none" stroke="${TALAEI}" stroke-width="1.6"/>`;
  s += `<path d="${kaman(x, y, R * .95, 195, 250)}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.2" stroke-linecap="round"/>`;
  s += `<path class="az-glint" d="${kaman(x, y, Rl * .82, 200, 235)}" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="3" stroke-linecap="round"/>`;
  return s;
}

function livanAzBala(c, o){
  const x = o.x != null ? o.x : CX, y = o.y != null ? o.y : CY, R = o.R || 60;
  let s = '';
  if(o.coaster !== false){
    const cc = o.coasterColor || c.yeki(['#b8875a', '#2b2b2b', '#e8dcc4', '#6d3b2a', '#2d5f9a', '#9a6a3a']);
    const cr = R * 1.3;
    s += saye(c, x + 6, y + 8, cr + 6, cr + 6, .5);
    s += `<circle cx="${x}" cy="${y}" r="${gerd(cr)}" fill="${c.shoaei([[0, roshanTar(cc, .15)], [1, tireTar(cc, .2)]])}"/>`;
    s += `<circle cx="${x}" cy="${y}" r="${gerd(cr - 5)}" fill="none" stroke="${roshanTar(cc, .35)}" stroke-opacity=".5" stroke-dasharray="2 3"/>`;
  }
  s += `<circle cx="${x + 5}" cy="${y + 7}" r="${R}" fill="#000" opacity=".3"/>`;
  const Rl = R * .88;
  s += `<circle cx="${x}" cy="${y}" r="${R}" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.55)" stroke-width="2.4"/>`;
  s += `<circle cx="${x}" cy="${y}" r="${gerd(Rl)}" fill="${o.liquid}"/>`;
  const clip = c.boresh(`<circle cx="${x}" cy="${y}" r="${gerd(Rl)}"/>`);
  if(o.inner) s += `<g clip-path="${clip}"><g transform="translate(${x} ${y})"><g class="az-spin"><circle r="${gerd(Rl)}" fill="none"/>${o.inner}</g></g></g>`;
  s += `<circle cx="${x}" cy="${y}" r="${gerd(Rl)}" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="4"/>`;
  s += `<path d="${kaman(x, y, R * .93, 190, 255)}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/>`;
  s += `<path class="az-glint" d="${kaman(x, y, R * .7, 205, 240)}" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="5" stroke-linecap="round"/>`;
  return s;
}



function hamzanAzBala(c, x, y, rot){
  let g = `<rect x="0" y="-5" width="54" height="10" rx="5" fill="${c.khatti([[0, '#e9d8a6'], [1, '#b89a5a']])}"/>`;
  g += `<circle r="20" fill="#e9d8a6" opacity=".35"/>`;
  for(let i = 0; i < 40; i++){ const a = i / 40 * Math.PI * 2; g += `<path d="M${gerd(Math.cos(a) * 6)} ${gerd(Math.sin(a) * 6)}L${gerd(Math.cos(a) * 19)} ${gerd(Math.sin(a) * 19)}" stroke="#d9c38a" stroke-width=".9"/>`; }
  g += `<circle r="6" fill="#c7ad6a"/>`;
  return `<g transform="translate(${gerd(x)} ${gerd(y)}) rotate(${gerd(rot)})">${saye(c, 3, 4, 30, 24, .35)}${g}</g>`;
}
function adviyeDorTaDor(c, n, r0, r1){
  let s = '';
  for(let i = 0; i < n; i++){
    const a = c.bein(0, Math.PI * 2), d = c.bein(r0, r1), x = CX + Math.cos(a) * d, y = CY + Math.sin(a) * d;
    if(x < 12 || x > 188 || y < 24 || y > 228) continue;
    const k = c.sahih(0, 2);
    s += k === 0 ? badiyan(c, x, y, c.bein(0, 90), .8) : k === 1 ? hel(c, x, y, c.bein(0, 360)) : chubDarchin(c, x, y, c.bein(0, 180), 40);
  }
  return s;
}


function changal(c, x, y){
  const col = c.yeki(['#d4d0c8', '#cfcac2', TALAEI]);
  const g = c.khatti([[0, roshanTar(col, .45)], [1, tireTar(col, .25)]]);
  return `<g transform="translate(${x} ${y}) scale(1.2 .74)">${saye(c, 12, 7, 40, 6, .3)}<rect x="0" y="-2.6" width="48" height="5.2" rx="2.6" fill="${g}"/><path d="M1-6H-5Q-12-9-12-4V4Q-12 9-5 6H1Z" fill="${g}"/><path d="M-11-7.2H-29M-11-2.4H-29M-11 2.4H-29M-11 7.2H-29" stroke="${col}" stroke-width="2.6" stroke-linecap="round"/><path d="M-12-8.4V8.4" stroke="${col}" stroke-width="2.6" stroke-linecap="round"/><path d="M4-1H44" stroke="#fff" stroke-opacity=".5" stroke-width="1"/></g>`;
}
function tameshk(c, x, y, r){
  let g = '';
  const col = c.yeki(['#d6245a', '#c21e4e', '#e03a6a']);
  [[0, 0], [-1, -.9], [1, -.9], [-1.4, .3], [1.4, .3], [-.7, 1.1], [.7, 1.1], [0, -1.6], [0, 1.8]].forEach(([dx, dy]) => {
    g += `<circle cx="${gerd(dx * r * .42)}" cy="${gerd(dy * r * .42)}" r="${gerd(r * .36)}" fill="${c.gooy(col)}"/>`;
  });
  return `<g transform="translate(${gerd(x)} ${gerd(y)})">${g}<path d="M-3-${gerd(r * .95)}L0-${gerd(r * .7)}L3-${gerd(r * .95)}" stroke="#4a7a2a" stroke-width="1.2" fill="none"/></g>`;
}

function sabkeLatte(kind, tone, extra){
  return c => {
    const t = TONHA[tone] || TONHA.coffee;
    const foam = t[1], cut = t[0][1];
    const k = kind === 'random' ? c.yeki(['heart', 'rosetta', 'tulip', 'swan', 'web', 'wing', 'nested']) : kind;
    let bg = pasZamine(c);
    let around = extra ? extra(c) : (c.shans(.6) ? daneHayeAtraf(c, c.sahih(2, 6)) : '');
    return bg + around + fenjanAzBala(c, { liquid: rangeMayee(c, t), inner: naghsheLatte(c, k, 58 * .82 * (60 / 58), foam, cut), R: c.bein(56, 62) });
  };
}

const S = {};
const G = {};
function sabt(key, group, label, fn){ S[key] = { group, label, fn }; (G[group] = G[group] || []).push(key); }

sabt('espresso', 'قهوه', 'اسپرسو', c => {
  let s = pasZamine(c);
  const cup = c.yeki(CHINI);
  const inner = (() => {
    let m = '';
    for(let i = 0; i < 38; i++){
      const a = c.bein(0, 6.28), d = Math.sqrt(c.tas()) * 34;
      m += `<ellipse transform="rotate(${c.sahih(0, 180)} ${gerd(Math.cos(a) * d)} ${gerd(Math.sin(a) * d)})" cx="${gerd(Math.cos(a) * d)}" cy="${gerd(Math.sin(a) * d)}" rx="${gerd(c.bein(1, 4))}" ry="${gerd(c.bein(.6, 1.8))}" fill="${c.yeki(['#6a3614', '#f0c48c', '#8a4a1c', '#e2a868'])}" fill-opacity="${gerd(c.bein(.25, .6) * 100) / 100}"/>`;
    }
    m += `<path d="${marpich(c.bein(.8, 1.6), 4, 30)}" fill="none" stroke="#f3d09c" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>`;
    return m;
  })();
  const ha = c.bein(-40, 40);
  let onS = '';
  const sp = c.bein(0, 1);
  const sa = (ha + 180 + c.bein(-40, 40)) * Math.PI / 180;
  if(sp < .4) onS += ghashogh(c, CX + Math.cos(sa) * 58, CY + Math.sin(sa) * 58, sa * 180 / Math.PI + 180 - 60, .7);
  else if(sp < .7) onS += ghandHabbe(c, CX + Math.cos(sa) * 56, CY + Math.sin(sa) * 56, c.bein(0, 90), .8);
  else onS += daneGhahve(c, CX + Math.cos(sa) * 58, CY + Math.sin(sa) * 58, c.bein(0, 360), 1) + daneGhahve(c, CX + Math.cos(sa + .3) * 60, CY + Math.sin(sa + .3) * 60, c.bein(0, 360), .9);
  s += fenjanAzBala(c, { R: 42, sR: 74, color: cup, ha, liquid: c.shoaei([[0, '#e8ad6e'], [.5, '#a5642f'], [1, '#4a220c']], .48, .42, .6), inner, onSaucer: onS, fill: .78 });
  s += daneHayeAtraf(c, c.sahih(0, 4), 92, 106);
  return s;
});

sabt('espresso-side', 'قهوه', 'فنجان', c => {
  let s = pasZamine(c) + rooyeMiz(c);
  const col = c.yeki(CHINI), sc = c.shans(.6) ? col : c.yeki(CHINI);
  const w = c.bein(36, 44), top = c.bein(118, 128), bot = 188;
  s += saye(c, CX + 4, 198, 72, 12, .55);
  s += `<ellipse cx="${CX}" cy="192" rx="64" ry="12" fill="${c.ostovane(sc)}"/><ellipse cx="${CX}" cy="189" rx="54" ry="8" fill="${tireTar(sc, .12)}"/>`;
  s += `<path d="M${CX + w - 2} ${top + 12}c22-6 28 22 4 32" fill="none" stroke="${c.ostovane(col)}" stroke-width="7" stroke-linecap="round"/>`;
  s += `<path d="M${CX - w} ${top}H${CX + w}C${CX + w} ${bot - 20} ${CX + w * .6} ${bot} ${CX} ${bot}S${CX - w} ${bot - 20} ${CX - w} ${top}Z" fill="${c.ostovane(col)}"/>`;
  const deco = c.sahih(0, 3);
  if(deco === 1) s += `<path d="M${CX - w + 1} ${top + 14}H${CX + w - 1}" stroke="${TALAEI}" stroke-width="2.5"/>`;
  if(deco === 2){ for(let i = 0; i < 7; i++) s += `<circle cx="${gerd(CX - w * .8 + i * w * .27)}" cy="${top + 22}" r="2" fill="${c.yeki(['#2d5f9a', TALAEI, '#b8613b'])}"/>`; }
  if(deco === 3) s += `<path d="M${CX - w + 3} ${top + 26}Q${CX} ${top + 14} ${CX + w - 3} ${top + 26}" stroke="#2d5f9a" stroke-width="3" fill="none"/>`;
  s += `<ellipse cx="${CX}" cy="${top}" rx="${gerd(w)}" ry="9" fill="${roshanTar(col, .2)}"/>`;
  s += `<ellipse cx="${CX}" cy="${top + 1}" rx="${gerd(w - 4)}" ry="6.5" fill="${c.shoaei([[0, '#e2a868'], [.6, '#a5642f'], [1, '#5a2c10']])}"/>`;
  s += bokhar(c, CX, top - 10, 3, 12);
  s += daneHayeAtraf(c, c.sahih(1, 4), 70, 90, CX, 200);
  return s;
});

sabt('americano', 'قهوه', 'آمریکانو', c => {
  let s = pasZamine(c);
  let inner = `<circle r="44" fill="none" stroke="#b77a41" stroke-opacity=".55" stroke-width="4"/>`;
  for(let i = 0; i < 8; i++){ const a = c.bein(0, 6.28), d = c.bein(20, 40); inner += `<ellipse cx="${gerd(Math.cos(a) * d)}" cy="${gerd(Math.sin(a) * d)}" rx="${gerd(c.bein(3, 9))}" ry="${gerd(c.bein(1.5, 4))}" fill="#b98050" fill-opacity=".3"/>`; }
  inner += `<rect x="-26" y="-34" width="${c.sahih(14, 22)}" height="30" rx="4" fill="#fff" fill-opacity=".09" transform="rotate(${c.sahih(-30, 30)})"/>`;
  let side = '';
  if(c.shans(.5)){
    const gx = c.yeki([40, 160]), gy = 210;
    side += livanAzBala(c, { x: gx, y: gy, R: 20, coaster: false, liquid: 'rgba(170,210,235,.35)', inner: '' });
  }
  s += side + fenjanAzBala(c, { R: 64, saucer: c.shans(.45), liquid: c.shoaei([[0, '#5f361b'], [.6, '#2e170a'], [1, '#120602']], .45, .4, .6), inner });
  s += daneHayeAtraf(c, c.sahih(2, 5), 92, 108);
  return s;
});

sabt('latte-rosetta', 'قهوه', 'روزتا', sabkeLatte('rosetta', 'coffee'));
sabt('latte-tulip', 'قهوه', 'ستاره', c => {
  let s = pasZamine(c);
  const t = TONHA.coffee2;
  s += livanAzBala(c, { R: 58, liquid: rangeMayee(c, t), inner: `<circle r="50" fill="none" stroke="#f7ecd9" stroke-opacity=".35" stroke-width="6"/>` + naghsheLatte(c, 'star', 44, t[1], t[0][1]) });
  const side = c.yeki([-1, 1]);
  s += ghashogh(c, CX + side * 70, CY + 88, side > 0 ? 200 : -20, .75) + ghandHabbe(c, CX - side * 72, CY - 84, c.bein(0, 40), .8);
  return s;
});
sabt('latte-heart', 'قهوه', 'قلب', c => {
  let s = pasZamine(c);
  const t = TONHA[c.yeki(['coffee', 'coffee2'])];
  const ha = c.bein(-40, 40);
  s += fenjanAzBala(c, { R: 56, sR: 84, ha, liquid: rangeMayee(c, t), inner: naghsheLatte(c, c.yeki(['heart', 'nested']), 45, t[1], t[0][1]) });
  return s;
});
sabt('latte-swan', 'قهوه', 'قو', sabkeLatte('swan', 'coffee2'));
sabt('latte-web', 'قهوه', 'حلقه', sabkeLatte('web', 'coffee'));
sabt('latte-wing', 'قهوه', 'پر', sabkeLatte('wing', 'coffee2'));

sabt('flatwhite', 'قهوه', 'فلت‌وایت', c => {
  let s = pasZamine(c);
  const t = TONHA.dark;
  const ha = c.yeki([-35, 35, 145, 215]) + c.bein(-8, 8);
  const sa = (ha + 180) * Math.PI / 180;
  const onS = ghandHabbe(c, CX + Math.cos(sa + .5) * 58, CY + Math.sin(sa + .5) * 58, c.bein(0, 40), .65) + ghashogh(c, CX + Math.cos(sa - .5) * 62, CY + Math.sin(sa - .5) * 62, (sa - .5) * 180 / Math.PI + 90, .6);
  s += fenjanAzBala(c, { R: 46, sR: 82, square: true, ha, fill: .78, liquid: rangeMayee(c, t), inner: naghsheLatte(c, 'heart', 36, t[1], t[0][1]), onSaucer: onS });
  return s;
});
sabt('cappuccino', 'قهوه', 'کاپوچینو', c => {
  let s = pasZamine(c);
  const cocoa = c.yeki(['#6b3a1f', '#4e2a15', '#7a4a2a']);
  const stencil = c.yeki(['star', 'heart', 'paisley', 'crescent', 'leaf', 'flower']);
  let sh = '';
  if(stencil === 'star') sh = `<path d="${masirSetare(8, 26, 13)}"/>`;
  if(stencil === 'heart') sh = `<path transform="scale(.75)" d="${GHALB}"/>`;
  if(stencil === 'paisley') sh = `<path transform="scale(1.1) rotate(${c.sahih(-40, 40)})" d="M0-30C20-30 30-5 20 15 10 32-20 34-24 12-26 0-14-8-4-4 4 0 4-12-4-16-10-20-6-30 0-30Z"/>`;
  if(stencil === 'crescent') sh = `<path d="M8-26A26 26 0 1 0 8 26 20 20 0 1 1 8-26Z"/><path transform="translate(14 -2)" d="${masirSetare(5, 8, 3.5)}"/>`;
  if(stencil === 'leaf') sh = `<path d="M0-30C18-18 18 18 0 30-18 18-18-18 0-30Z"/><path d="M0-28V30" stroke="#f3e6d2" stroke-width="2"/>`;
  if(stencil === 'flower'){ for(let i = 0; i < 6; i++) sh += `<ellipse transform="rotate(${i * 60})" cy="-15" rx="7" ry="13"/>`; sh += `<circle r="6" fill="#f3e6d2"/>`; }
  let inner = `<g fill="${cocoa}" fill-opacity=".55">${sh}</g>` + pudr(c, 70, 0, 0, 44, cocoa, .6, 1.2);
  inner += `<circle r="46" fill="none" stroke="${cocoa}" stroke-opacity=".3" stroke-width="6"/>`;
  s += fenjanAzBala(c, { R: 60, liquid: c.shoaei([[0, '#fbf3e6'], [.7, '#ead8bd'], [1, '#b0804f']], .45, .42, .6), inner });
  s += daneHayeAtraf(c, c.sahih(0, 3), 92, 106);
  return s;
});

function shekleLivan(c, shape, o = {}){
  const shapes = {
    gibraltar: { top: 112, bot: 198, tw: 42, bw: 36, curve: 0 },
    tumbler: { top: 104, bot: 198, tw: 38, bw: 32, curve: 0 },
    tall: { top: 58, bot: 200, tw: 34, bw: 27, curve: 0 },
    mug: { top: 84, bot: 198, tw: 38, bw: 38, curve: 0 },
    rocks: { top: 126, bot: 198, tw: 44, bw: 40, curve: 0 },
    jar: { top: 70, bot: 200, tw: 36, bw: 38, curve: 1 },
    highball: { top: 62, bot: 200, tw: 30, bw: 30, curve: 0 }
  };
  const g = shapes[shape];
  const p = `M${CX - g.tw} ${g.top}L${CX + g.tw} ${g.top}L${CX + g.bw} ${g.bot - 6}Q${CX + g.bw} ${g.bot} ${CX + g.bw - 6} ${g.bot}H${CX - g.bw + 6}Q${CX - g.bw} ${g.bot} ${CX - g.bw} ${g.bot - 6}Z`;
  return { g, p };
}
function keshidanLivan(c, shape, layers, o = {}){
  const { g, p } = shekleLivan(c, shape);
  let s = saye(c, CX + 4, g.bot + 2, g.bw + 26, 9, .6);
  if(shape === 'mug' || shape === 'jar') s += `<path d="M${CX + g.tw - 1} ${g.top + 24}c${shape === 'jar' ? 20 : 26}-2 ${shape === 'jar' ? 22 : 28} 50 0 56" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="8"/><path d="M${CX + g.tw - 1} ${g.top + 24}c${shape === 'jar' ? 20 : 26}-2 ${shape === 'jar' ? 22 : 28} 50 0 56" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="3" transform="translate(2 0)"/>`;
  const clip = c.boresh(`<path d="${p}"/>`);
  const lTop = o.level != null ? o.level : g.top + 14;
  s += `<g clip-path="${clip}">${layers(g, lTop)}</g>`;
  s += `<path d="${p}" fill="${c.shishe()}" stroke="rgba(255,255,255,.55)" stroke-width="2"/>`;
  s += `<path d="M${CX - g.bw + 4} ${g.bot - 3}H${CX + g.bw - 4}" stroke="rgba(255,255,255,.35)" stroke-width="${shape === 'rocks' || shape === 'gibraltar' ? 7 : 4}" stroke-linecap="round"/>`;
  s += `<path d="M${CX - g.tw + 7} ${g.top + 10}L${CX - g.bw + 7} ${g.bot - 16}" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>`;
  s += `<ellipse cx="${CX}" cy="${g.top}" rx="${g.tw}" ry="4" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.6"/>`;
  if(shape === 'jar'){ for(let i = 1; i <= 2; i++) s += `<path d="M${CX - g.tw} ${g.top + i * 5}Q${CX} ${g.top + i * 5 + 4} ${CX + g.tw} ${g.top + i * 5}" stroke="rgba(255,255,255,.45)" fill="none"/>`; }
  if(o.drops){ for(let i = 0; i < o.drops; i++){ const yy = c.bein(g.top + 20, g.bot - 10), xx = CX + c.bein(-g.bw + 4, g.bw - 4); s += `<ellipse cx="${gerd(xx)}" cy="${gerd(yy)}" rx="1.3" ry="2" fill="#fff" fill-opacity=".45"/>`; } }
  return { s, g };
}
function yakh(c, n, x0, x1, y0, y1){
  let s = '';
  for(let i = 0; i < n; i++){
    const x = c.bein(x0, x1), y = c.bein(y0, y1), sz = c.bein(14, 22);
    s += `<rect class="az-drift" style="animation-delay:-${gerd(c.bein(0, 6))}s" x="${gerd(x - sz / 2)}" y="${gerd(y - sz / 2)}" width="${gerd(sz)}" height="${gerd(sz)}" rx="4" transform="rotate(${c.sahih(-30, 30)} ${gerd(x)} ${gerd(y)})" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.6)" stroke-width="1.2"/>`;
  }
  return s;
}

sabt('cortado', 'قهوه', 'کورتادو', c => {
  let s = pasZamine(c) + rooyeMiz(c);
  const r = keshidanLivan(c, 'gibraltar', (g, lt) => {
    return `<rect x="0" y="${lt}" width="200" height="120" fill="${c.khatti([[0, '#f7ecd9'], [.18, '#e7caa0'], [.5, '#b77d4a'], [.8, '#7a4520'], [1, '#4a260f']])}"/><ellipse cx="${CX}" cy="${lt}" rx="${g.tw}" ry="4" fill="#fbf3e4"/>`;
  }, { level: 124 });
  s += r.s;
  s += c.shans(.6) ? ghashogh(c, CX + c.yeki([-58, 58]), 214, c.yeki([10, 170, -10]), .7) : ghandHabbe(c, CX + c.yeki([-56, 56]), 206, c.bein(0, 90), .8);
  s += daneHayeAtraf(c, c.sahih(0, 3), 70, 90, CX, 210);
  return s;
});

sabt('caramel', 'قهوه', 'کارامل', c => {
  let s = pasZamine(c);
  const cc = c.yeki(['#c97a2b', '#b8661f', '#d88c32']);
  let inner = naghsheLatte(c, 'heart', 46, '#fffaf0', '#d9a86a');
  const rot = c.sahih(0, 180), mowj = c.sahih(12, 16), dam = c.bein(2.5, 4);
  let d = '';
  for(let k = 0; k <= 120; k++){
    const a = k / 120 * Math.PI * 2, rr = 43 + Math.sin(a * mowj) * dam;
    d += (k ? 'L' : 'M') + gerd(Math.cos(a) * rr) + ' ' + gerd(Math.sin(a) * rr);
  }
  let dr = `<path d="${d}Z" stroke="${tireTar(cc, .2)}" stroke-width="3.6" fill="none" opacity=".35" transform="translate(1 1.5)"/><path d="${d}Z" stroke="${cc}" stroke-width="3" fill="none"/><path d="${d}Z" stroke="#ffd9a0" stroke-width=".9" fill="none" opacity=".8" transform="translate(-.6 -.8)"/>`;
  for(let k = 0; k < 6; k++){ const a = k / 6 * Math.PI * 2 + .3; dr += `<circle cx="${gerd(Math.cos(a) * 33)}" cy="${gerd(Math.sin(a) * 33)}" r="1.8" fill="${cc}"/>`; }
  inner += `<g transform="rotate(${rot})">${dr}</g>`;
  const ha = c.bein(-40, 40);
  const sa = (ha + 180 + c.bein(-30, 30)) * Math.PI / 180;
  const onS = `<g transform="translate(${gerd(CX + Math.cos(sa) * 64)} ${gerd(CY + Math.sin(sa) * 64)})"><circle r="11" fill="#fbf6ef"/><circle r="8" fill="${c.shoaei([[0, roshanTar(cc, .3)], [1, tireTar(cc, .2)]])}"/></g>`;
  s += fenjanAzBala(c, { R: 58, ha, liquid: c.shoaei([[0, '#fdf7ec'], [.7, '#f1e2c8'], [1, '#c9955c']], .45, .42, .6), inner, onSaucer: onS });
  return s;
});
sabt('mocha', 'قهوه', 'موکا', c => {
  let s = pasZamine(c) + rooyeMiz(c);
  const shape = c.yeki(['mug', 'tumbler']);
  const r = keshidanLivan(c, shape, (g, lt) => {
    let l = `<rect x="0" y="${lt}" width="200" height="200" fill="${c.khatti([[0, '#fbf3e6'], [.14, '#f0dcc0'], [.2, '#9a6a45'], [.55, '#6a3c22'], [1, '#2c140a']])}"/>`;
    for(let i = 0; i < 6; i++){ const x = CX - g.tw + 6 + i * (g.tw * 2 - 12) / 5; l += `<path d="M${gerd(x)} ${lt}q${c.sahih(-6, 6)} 30 ${c.sahih(-3, 3)} ${c.sahih(40, 90)}" stroke="#3a1a0a" stroke-width="${gerd(c.bein(2, 4))}" fill="none" stroke-linecap="round" opacity=".75"/>`; }
    return l;
  }, { level: shape === 'mug' ? 92 : 112 });
  s += r.s;
  const top = r.g.top;
  const cream = `M${CX - r.g.tw + 2} ${top}C${CX - r.g.tw + 2} ${top - 16} ${CX - 16} ${top - 18} ${CX - 10} ${top - 28}C${CX - 4} ${top - 38} ${CX + 6} ${top - 38} ${CX + 10} ${top - 28}C${CX + 16} ${top - 18} ${CX + r.g.tw - 2} ${top - 16} ${CX + r.g.tw - 2} ${top}Z`;
  s += `<path d="${cream}" fill="${c.shoaei([[0, '#ffffff'], [1, '#e8dccb']], .4, .3, .8)}"/>`;
  s += `<path d="M${CX - 22} ${top - 12}L${CX - 12} ${top - 24}L${CX - 2} ${top - 10}L${CX + 8} ${top - 26}L${CX + 20} ${top - 10}" stroke="#3a1a0a" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += pudr(c, 26, CX, top - 16, 18, '#4a2412', .7, 1.2);
  s += daneHayeAtraf(c, c.sahih(0, 3), 76, 92, CX, 214);
  return s;
});

sabt('affogato', 'قهوه', 'آفوگاتو', c => {
  let s = pasZamine(c) + rooyeMiz(c);
  const bowl = `M${CX - 52} 128C${CX - 52} 164 ${CX - 30} 178 ${CX} 178S${CX + 52} 164 ${CX + 52} 128Z`;
  s += saye(c, CX + 4, 204, 58, 9, .6);
  s += `<path d="M${CX - 4} 178V196" stroke="rgba(255,255,255,.55)" stroke-width="5"/><ellipse cx="${CX}" cy="198" rx="30" ry="5" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.55)" stroke-width="1.5"/>`;
  const clip = c.boresh(`<path d="${bowl}"/>`);
  s += `<g clip-path="${clip}"><rect x="0" y="150" width="200" height="40" fill="${c.khatti([[0, '#8a4e22'], [1, '#3a1a08']])}"/><ellipse cx="${CX}" cy="150" rx="50" ry="4" fill="#b8763a" opacity=".6"/></g>`;
  const ic = c.yeki(['#fbf2df', '#f6e7b8', '#fff6ea']);
  const sy = 124;
  s += `<path d="${lakeNarm(c, CX, sy, 32, 12, .08)}" fill="${c.shoaei([[0, '#ffffff'], [.6, ic], [1, tireTar(ic, .16)]], .4, .3, .8)}"/>`;
  let top = `M${CX - 29} ${sy - 4}C${CX - 26} ${sy - 30} ${CX + 24} ${sy - 36} ${CX + 30} ${sy - 6}`;
  const dripsX = [22, 10, -3, -15, -24].map(v => v + c.bein(-2, 2));
  let prevX = CX + 30;
  dripsX.forEach(dx => {
    const x = CX + dx, L = c.bein(6, 20), w = c.bein(2.2, 3.4);
    top += `Q${gerd((prevX + x + w) / 2)} ${gerd(sy + 1)} ${gerd(x + w)} ${gerd(sy - 1)}V${gerd(sy + L)}a${gerd(w)} ${gerd(w)} 0 0 1 ${gerd(-2 * w)} 0V${gerd(sy - 1)}`;
    prevX = x - w;
  });
  top += `Q${gerd((prevX + CX - 29) / 2)} ${gerd(sy + 2)} ${CX - 29} ${sy - 4}Z`;
  s += `<path d="${top}" fill="${c.khatti([[0, '#8a4a1c'], [1, '#4a220a']])}"/><path d="M${CX - 16} ${sy - 20}Q${CX} ${sy - 28} ${CX + 14} ${sy - 22}" stroke="#d9a060" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".7"/>`;
  s += `<path d="${bowl}" fill="${c.shishe()}" stroke="rgba(255,255,255,.6)" stroke-width="2"/><ellipse cx="${CX}" cy="128" rx="52" ry="6" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="1.6"/><path d="M${CX - 42} 138Q${CX - 40} 158 ${CX - 26} 168" stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  if(c.shans(.7)) s += `<g transform="translate(${CX + 10} ${sy - 18}) rotate(-58)"><rect x="0" y="-5" width="50" height="10" rx="4" fill="${c.ostovane('#d9a35a')}"/><path d="M8 -5V5M16 -5V5M24 -5V5M32 -5V5M40 -5V5" stroke="#a86f2c" stroke-width=".8" opacity=".6"/></g>`;
  else s += shakheNana(c, CX + 6, sy - 24, 15, .9);
  const gx = CX + c.yeki([-66, 66]);
  const shot = `M${gx - 13} 170H${gx + 13}L${gx + 11} 202H${gx - 11}Z`;
  const sc = c.boresh(`<path d="${shot}"/>`);
  s += saye(c, gx + 2, 204, 18, 4, .5) + `<g clip-path="${sc}"><rect x="${gx - 14}" y="178" width="28" height="26" fill="${c.khatti([[0, '#e2a868'], [.25, '#8a4a1c'], [1, '#2a1206']])}"/></g><path d="${shot}" fill="${c.shishe()}" stroke="rgba(255,255,255,.6)" stroke-width="1.4"/>`;
  s += daneHayeAtraf(c, c.sahih(1, 3), 64, 86, CX, 216);
  return s;
});
sabt('filter', 'قهوه', 'قهوه‌ساز', c => {
  let s = pasZamine(c) + rooyeMiz(c);
  const body = c.yeki(['#1f2a3a', '#2d5f9a', '#e9e4dc', '#8a2d2d', '#2b2b2b', '#1f6f78']);
  const steel = '#c9ced6';
  const light = body === '#e9e4dc';
  s += saye(c, CX + 6, 204, 70, 10, .6);
  s += `<rect x="46" y="190" width="112" height="13" rx="5" fill="${c.ostovane(light ? '#9aa0a8' : steel)}"/>`;
  s += `<rect x="112" y="38" width="44" height="156" rx="10" fill="${c.ostovane(body)}"/>`;
  s += `<rect x="122" y="96" width="24" height="62" rx="5" fill="rgba(200,225,245,.35)" stroke="rgba(255,255,255,.5)"/><rect x="124" y="${c.sahih(116, 132)}" width="20" height="30" rx="3" fill="rgba(110,170,220,.55)"/><path d="M127 100V152" stroke="#fff" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/>`;
  s += `<circle cx="134" cy="172" r="5" fill="${steel}" stroke="${tireTar(body, .3)}"/><circle cx="134" cy="172" r="2" fill="#6ee07a" class="az-glint"/>`;
  s += `<rect x="44" y="38" width="114" height="46" rx="14" fill="${c.ostovane(body)}"/><rect x="44" y="74" width="114" height="10" rx="4" fill="${tireTar(body, .25)}"/>`;
  s += `<path d="M52 46H150" stroke="#fff" stroke-opacity=".25" stroke-width="3" stroke-linecap="round"/><rect x="60" y="54" width="34" height="8" rx="4" fill="${steel}" opacity=".8"/>`;
  s += `<path d="M60 84H106L100 100H66Z" fill="${tireTar(body, .35)}"/><rect x="78" y="100" width="10" height="4" rx="1" fill="#222"/>`;
  s += `<path d="M83 104V128" stroke="#5a2c10" stroke-width="2.2" stroke-linecap="round"/><circle class="az-drip" cx="83" cy="112" r="2.2" fill="#5a2c10"/>`;
  s += `<ellipse cx="83" cy="191" rx="34" ry="5" fill="#1a1a1a"/>`;
  const pot = `M58 132Q56 128 62 126H104Q110 128 108 132L112 166Q114 188 92 190H74Q52 188 54 166Z`;
  const clip = c.boresh(`<path d="${pot}"/>`);
  s += `<path d="M106 136c14 2 14 34 0 36" fill="none" stroke="#1a1a1a" stroke-width="6" stroke-linecap="round"/>`;
  s += `<g clip-path="${clip}"><rect x="40" y="${c.sahih(150, 160)}" width="90" height="50" fill="${c.khatti([[0, '#6a3614'], [1, '#2a1206']])}"/><ellipse cx="83" cy="${c.sahih(150, 160)}" rx="30" ry="3" fill="#8a4a1c" opacity=".7"/></g>`;
  s += `<path d="${pot}" fill="${c.shishe()}" stroke="rgba(255,255,255,.6)" stroke-width="1.6"/><path d="M60 126H106L104 134H62Z" fill="#1a1a1a"/><path d="M64 140Q60 160 64 180" stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  s += daneHayeAtraf(c, c.sahih(2, 4), 62, 84, CX, 216);
  return s;
});
sabt('hot-chocolate', 'گرم', 'هات‌چاکلت', c => {
  let s = pasZamine(c);
  const inner = naghsheLatte(c, c.yeki(['rosetta', 'tulip']), 48, '#f6e8d6', '#5c3120') + pudr(c, 40, 0, 0, 46, '#2a110a', .55);
  const ha = c.bein(-40, 40);
  s += fenjanAzBala(c, { R: 60, ha, liquid: c.shoaei([[0, '#8a5234'], [.6, '#5a2e1a'], [1, '#2a110a']], .45, .42, .6), inner });
  return s;
});
sabt('pink-chocolate', 'گرم', 'پینک', c => {
  let s = pasZamine(c, c.yeki(['#4b1628', '#3a1d2e', '#1c3a5e', '#1f4e8c']));
  const t = TONHA.pink;
  const ha = c.bein(-40, 40);
  const sa = (ha + 180 + c.bein(-30, 30)) * Math.PI / 180;
  const onS = `<g transform="translate(${gerd(CX + Math.cos(sa) * 64)} ${gerd(CY + Math.sin(sa) * 64)}) rotate(${c.sahih(0, 90)})"><rect x="-8" y="-8" width="16" height="16" rx="5" fill="#fff"/><rect x="-5" y="-5" width="10" height="10" rx="3" fill="#f7c6d4"/></g>`;
  s += fenjanAzBala(c, { R: 56, ha, color: c.yeki(['#f3ece1', '#f7d7de', '#fbf6ef', '#2d5f9a']), liquid: rangeMayee(c, t), inner: naghsheLatte(c, c.yeki(['heart', 'nested']), 45, t[1], t[0][1]) + pashidani(c, 26, -40, 40, -40, 40), onSaucer: onS });
  return s;
});
sabt('matcha', 'گرم', 'ماچا', c => {
  let s = pasZamine(c, c.yeki(['#243b2f', '#27361c', '#0e3b3b', '#1b4470', '#5a6b3a']));
  const t = TONHA.matcha;
  let mat = '';
  const mc = c.yeki(['#c9b27a', '#b89a5a', '#d9c48f']);
  mat += `<rect x="18" y="30" width="164" height="190" rx="6" fill="${mc}"/>`;
  for(let y = 36; y < 220; y += 6) mat += `<path d="M18 ${y}H182" stroke="${tireTar(mc, .25)}" stroke-width="1"/>`;
  mat += `<path d="M18 30V220M182 30V220" stroke="${tireTar(mc, .4)}" stroke-width="3"/>`;
  s += `<g transform="rotate(${c.sahih(-8, 8)} 100 124)">${saye(c, 104, 130, 90, 100, .4)}${mat}</g>`;
  s += fenjanAzBala(c, { R: 62, saucer: false, handle: false, color: c.yeki(['#5a4a3a', '#2b2b2b', '#d9cdb4', '#6b7a5a', '#3a4a6a']), gold: false, fill: .84, liquid: rangeMayee(c, t), inner: naghsheLatte(c, c.yeki(['rosetta', 'heart', 'swan', 'tulip']), 50, t[1], t[0][1]) });
  const wa = c.yeki([35, 145]);
  s += hamzanAzBala(c, CX + Math.cos(wa * Math.PI / 180) * 70, CY + Math.sin(wa * Math.PI / 180) * 80, wa + 20);
  return s;
});
sabt('masala', 'گرم', 'ماسالا', c => {
  let s = pasZamine(c, c.yeki(['#5a3a12', '#3e1f15', '#402b1e', '#a4552f', '#1f4e8c']));
  const t = TONHA.chai;
  const inner = naghsheLatte(c, c.yeki(['heart', 'web']), 46, t[1], t[0][1]) + pudr(c, 50, 0, 0, 44, '#7a3c14', .7) + badiyan(c, c.bein(-14, 14), c.bein(-14, 14), c.bein(0, 90), 1.1);
  s += fenjanAzBala(c, { R: 56, color: c.yeki(['#b8613b', '#f3ece1', '#2d5f9a', '#efe0c2']), liquid: rangeMayee(c, t), inner });
  s += adviyeDorTaDor(c, 6, 92, 106);
  return s;
});
sabt('sesame-date', 'گرم', 'خرما', c => {
  let s = pasZamine(c, c.yeki(['#3e1f15', '#5a3a12', '#402b1e']));
  const t = TONHA.chai;
  let inner = naghsheLatte(c, c.yeki(['tulip', 'heart', 'swan']), 49, t[1], t[0][1]);
  for(let i = 0; i < 40; i++){ const a = c.bein(0, 6.28), d = c.bein(0, 44); inner += `<ellipse cx="${gerd(Math.cos(a) * d)}" cy="${gerd(Math.sin(a) * d)}" rx="1.1" ry="2" fill="#fff4dc" transform="rotate(${c.sahih(0, 180)} ${gerd(Math.cos(a) * d)} ${gerd(Math.sin(a) * d)})"/>`; }
  s += fenjanAzBala(c, { R: 58, liquid: rangeMayee(c, t), inner });
  for(let i = 0; i < c.sahih(2, 4); i++){
    const a = c.bein(0, 6.28), x = CX + Math.cos(a) * 94, y = CY + Math.sin(a) * 100;
    if(x < 10 || x > 190 || y < 20 || y > 230) continue;
    s += `<g transform="translate(${gerd(x)} ${gerd(y)}) rotate(${c.sahih(0, 180)})">${saye(c, 2, 3, 16, 10, .4)}<path d="${lakeNarm(c, 0, 0, 12, 8, .08)}" transform="scale(1.3 .7)" fill="${c.gooy('#5a2410', 1.2)}"/><path d="M-10 -2Q0 -6 10 -2" stroke="#8a4020" stroke-width="1" fill="none"/></g>`;
  }
  return s;
});

sabt('hazelnut-milk', 'گرم', 'شیرشکلات', c => {
  let s = pasZamine(c);
  const t = TONHA.choco;
  const inner = naghsheLatte(c, c.yeki(['rosetta', 'tulip', 'heart']), 46, t[1], t[0][1]) + pudr(c, 18, 0, 0, 36, '#c79a66', .9, 1.8);
  s += fenjanAzBala(c, { R: 58, color: c.yeki(['#6a3a22', '#f3ece1', '#232120', '#d8a53a']), liquid: rangeMayee(c, t), inner });
  for(let i = 0; i < c.sahih(4, 6); i++){
    const a = c.bein(0, 6.28), x = CX + Math.cos(a) * 96, y = CY + Math.sin(a) * 102;
    if(x < 10 || x > 190 || y < 20 || y > 230) continue;
    s += `<g transform="translate(${gerd(x)} ${gerd(y)}) rotate(${c.sahih(0, 360)})"><circle r="8" fill="${c.gooy('#9a5a2a')}"/><path d="M-7-3Q0-10 7-3" fill="#c79a66" stroke="#7a4a1a" stroke-width=".8"/></g>`;
  }
  return s;
});
sabt('honey-milk', 'گرم', 'شیرعسل', c => {
  let s = pasZamine(c, c.yeki(['#5a3a12', '#402b1e', '#1c3a5e']));
  let inner = `<path d="${marpich(c.bein(2.5, 3.5), 2, 42)}" stroke="#e0a42a" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85"/>` + pudr(c, 40, 0, 0, 44, '#8a4520', .55);
  const ha = c.bein(-30, 30);
  const da = (ha + 150) * Math.PI / 180;
  const dip = `<g transform="translate(${gerd(CX + Math.cos(da) * 66)} ${gerd(CY + Math.sin(da) * 66)}) rotate(${gerd(ha + 150 + 90)})"><rect x="-2.5" y="0" width="5" height="46" rx="2.5" fill="#b98a4e"/><g transform="translate(0 -6)"><ellipse rx="10" ry="12" fill="#d59a3a"/><path d="M-10-4H10M-10 2H10M-9 8H9M-9-9H9" stroke="#8a5a1a" stroke-width="1.6"/></g></g>`;
  s += fenjanAzBala(c, { R: 56, ha, liquid: c.shoaei([[0, '#fffaf0'], [.7, '#f5e8cc'], [1, '#d7bb8a']], .45, .42, .6), inner, onSaucer: dip });
  s += chubDarchin(c, c.yeki([36, 164]), c.yeki([40, 212]), c.bein(0, 180), 58);
  return s;
});

function istekan(c, o = {}){
  return `<g transform="translate(${CX} 196) scale(1.22) translate(${-CX} -196)">${badaneIstekan(c, o)}</g>`;
}
function badaneIstekan(c, o = {}){
  const tea = o.tea || c.yeki([['#e0672a', '#8b1f08'], ['#d9581e', '#6e1606'], ['#e8862e', '#9a3a0a'], ['#c9421c', '#5a1004']]);
  const saucer = o.saucer || c.yeki(['#f3ece1', '#2d5f9a', '#f3ece1', '#1f6f78', '#efe0c2', '#b8613b']);
  let s = saye(c, CX + 4, 198, 70, 12, .55);
  s += `<ellipse cx="${CX}" cy="192" rx="60" ry="12" fill="${c.ostovane(saucer)}"/><ellipse cx="${CX}" cy="189" rx="48" ry="7.5" fill="${tireTar(saucer, .12)}"/>`;
  s += `<ellipse cx="${CX}" cy="192" rx="57" ry="10.5" fill="none" stroke="${TALAEI}" stroke-width="1.3"/>`;
  if(c.shans(.5)){ for(let i = 0; i < 9; i++){ const a = Math.PI * (.15 + i * .09); s += `<circle cx="${gerd(CX + Math.cos(a) * 54)}" cy="${gerd(192 + Math.sin(a) * 9)}" r="1.6" fill="${c.yeki([TALAEI, '#b8233a', '#1f6f78'])}"/>`; } }
  if(o.onSaucer) s += o.onSaucer;
  const top = 100;
  const p = `M${CX - 28} ${top}C${CX - 28} ${top + 24} ${CX - 16} ${top + 32} ${CX - 16} ${top + 48}C${CX - 16} ${top + 64} ${CX - 24} ${top + 72} ${CX - 24} ${top + 84}Q${CX - 24} ${top + 92} ${CX - 16} ${top + 92}H${CX + 16}Q${CX + 24} ${top + 92} ${CX + 24} ${top + 84}C${CX + 24} ${top + 72} ${CX + 16} ${top + 64} ${CX + 16} ${top + 48}C${CX + 16} ${top + 32} ${CX + 28} ${top + 24} ${CX + 28} ${top}Z`;
  const clip = c.boresh(`<path d="${p}"/>`);
  s += `<g clip-path="${clip}"><rect y="${top + 9}" width="200" height="100" fill="${c.khatti([[0, tea[0], .92], [1, tea[1], .98]])}"/><ellipse cx="${CX}" cy="${top + 9}" rx="28" ry="3" fill="${roshanTar(tea[0], .3)}" opacity=".6"/>${o.inGlass || ''}</g>`;
  s += `<path d="${p}" fill="${c.shishe()}" stroke="rgba(255,255,255,.6)" stroke-width="1.8"/>`;
  s += `<path d="M${CX - 20} ${top + 10}C${CX - 20} ${top + 26} ${CX - 12} ${top + 34} ${CX - 11} ${top + 46}" stroke="#fff" stroke-opacity=".45" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  s += `<ellipse cx="${CX}" cy="${top}" rx="28" ry="3.5" fill="none" stroke="${c.shans(.5) ? TALAEI : 'rgba(255,255,255,.7)'}" stroke-width="1.6"/>`;
  if(o.steam !== false) s += bokhar(c, CX, top - 8, 3, 11);
  return s;
}
sabt('tea-glass', 'چای', 'استکان', c => {
  let s = pasZamine(c) + rooyeMiz(c);
  let onS = '';
  const g = c.sahih(0, 2);
  if(g === 0) onS = ghandHabbe(c, CX - 40, 186, c.bein(0, 40), .7) + ghandHabbe(c, CX + 42, 187, c.bein(0, 40), .7);
  let inGlass = '';
  if(g === 1) inGlass = `<rect x="${CX + 4}" y="60" width="5" height="120" fill="#8a5a2a" transform="rotate(12 ${CX} 140)"/>` + (() => { let k = ''; for(let i = 0; i < 18; i++) k += `<rect x="${gerd(CX + c.bein(-2, 12))}" y="${gerd(c.bein(140, 185))}" width="${gerd(c.bein(4, 8))}" height="${gerd(c.bein(4, 8))}" fill="#f2b23c" fill-opacity=".8" transform="rotate(${c.sahih(0, 90)} ${CX + 6} 160)"/>`; return k; })();
  s += istekan(c, { onSaucer: onS, inGlass });
  if(g === 1) s += `<rect x="${CX + 12}" y="52" width="5" height="60" rx="2" fill="#8a5a2a" transform="rotate(12 ${CX} 140)"/>`;
  if(g === 2) s += `<g transform="translate(${c.yeki([36, 164])} 206)">${saye(c, 0, 8, 26, 6, .5)}<ellipse rx="22" ry="7" fill="${c.ostovane('#e9dcc0')}"/>${ghandHabbe(c, -6, -6, 10, .55)}${ghandHabbe(c, 7, -5, 30, .55)}${ghandHabbe(c, 0, -14, 50, .55)}</g>`;
  return s;
});

sabt('tea-cardamom', 'چای', 'هل', c => {
  let s = pasZamine(c) + rooyeMiz(c);
  const tea = c.yeki([['#e0672a', '#8b1f08'], ['#d9581e', '#6e1606'], ['#c9421c', '#5a1004']]);
  const r = keshidanLivan(c, 'mug', (g, lt) => {
    let l = `<rect y="${lt}" width="200" height="200" fill="${c.khatti([[0, tea[0], .9], [1, tea[1]]])}"/>`;
    for(let i = 0; i < 3; i++) l += hel(c, CX + c.bein(-20, 20), lt + c.bein(4, 30), c.bein(0, 360));
    return l;
  }, { level: 108 });
  s += r.s;
  s += chubDarchin(c, CX + 10, 96, -68, 90);
  s += bokhar(c, CX - 10, 82, 2, 14);
  for(let i = 0; i < 3; i++) s += hel(c, c.yeki([30, 44, 156, 170]) + c.bein(-6, 6), 214 + c.bein(-6, 6), c.bein(0, 360));
  return s;
});

sabt('teapot', 'چای', 'قوری', c => {
  let s = pasZamine(c) + rooyeMiz(c);
  const pot = c.yeki(['#2d5f9a', '#f3ece1', '#1f6f78', '#b8613b', '#efe0c2', '#7a2e3a', '#3b4a7a']);
  const px = c.yeki([78, 86]), py = 150;
  s += saye(c, px + 4, 200, 64, 10, .6);
  s += `<path d="M${px + 40} 150C${px + 58} 146 ${px + 62} 124 ${px + 76} 112" stroke="${c.ostovane(pot)}" stroke-width="11" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M${px - 42} 128c-26 4-26 44 2 44" stroke="${c.ostovane(pot)}" stroke-width="8" fill="none"/>`;
  s += `<path d="M${px - 48} 150C${px - 48} 116 ${px - 28} 104 ${px} 104S${px + 48} 116 ${px + 48} 150C${px + 48} 184 ${px + 24} 198 ${px} 198S${px - 48} 184 ${px - 48} 150Z" fill="${c.gooy(pot, .9)}"/>`;
  const flower = c.yeki(['#b8233a', '#f3ece1', TALAEI, '#2d5f9a', '#e07a9a']);
  const fc = pot === flower ? '#b8233a' : flower;
  for(let i = 0; i < 3; i++){
    const fx = px - 26 + i * 26 + c.bein(-4, 4), fy = 150 + c.bein(-8, 10);
    let f = '';
    for(let j = 0; j < 6; j++) f += `<ellipse transform="rotate(${j * 60})" cy="-5" rx="3" ry="5.5" fill="${fc}"/>`;
    s += `<g transform="translate(${gerd(fx)} ${gerd(fy)}) scale(${gerd(c.bein(.8, 1.2) * 100) / 100})">${f}<circle r="2.4" fill="${TALAEI}"/></g>`;
    s += barg(c, fx + 6, fy + 4, c.bein(-40, 40), .35, '#3f8a3a');
  }
  s += `<path d="M${px - 46} 132Q${px} 124 ${px + 46} 132" stroke="${TALAEI}" stroke-width="2" fill="none"/>`;
  s += `<ellipse cx="${px}" cy="106" rx="26" ry="6" fill="${tireTar(pot, .15)}"/><path d="M${px - 22} 106Q${px} 84 ${px + 22} 106Z" fill="${c.gooy(pot)}"/><circle cx="${px}" cy="88" r="5" fill="${c.gooy(TALAEI)}"/>`;
  s += bokhar(c, px + 78, 104, 2, 8, .7);
  const herb = c.rangAsli || c.yeki(['#c2334a', '#e39a2a', '#d9c24a', '#7a2a6a', '#b84a1a', '#9ab83a']);
  const gx = c.yeki([158, 160]);
  s += saye(c, gx + 2, 202, 24, 5, .5);
  s += `<path d="M${gx - 18} 164H${gx + 18}L${gx + 15} 200H${gx - 15}Z" fill="${herb}" opacity=".85"/><path d="M${gx - 20} 156H${gx + 20}L${gx + 16} 202H${gx - 16}Z" fill="${c.shishe()}" stroke="rgba(255,255,255,.6)" stroke-width="1.6"/>`;
  return s;
});

function damnushAzBala(kind){
  return c => {
    const P = {
      rose: { liq: ['#e2506a', '#7a1428'], bg: ['#4b1628', '#3a1d2e', '#1c3a5e'] },
      borage: { liq: ['#8a5ad0', '#3a1a6a'], bg: ['#3a2849', '#1c3a5e', '#13294a'] },
      citrus: { liq: ['#f6a23a', '#a0460e'], bg: ['#5a3a12', '#1c3a5e', '#0e3b3b'] },
      chamomile: { liq: ['#f4d36b', '#b88a14'], bg: ['#27361c', '#1c3a5e', '#5a3a12'] },
      berry: { liq: ['#c2243e', '#4a0616'], bg: ['#3a1d2e', '#4b1628', '#13294a'] },
      mint: { liq: ['#cfe59a', '#6f8f2a'], bg: ['#243b2f', '#0e3b3b', '#27361c'] },
      quince: { liq: ['#f2b25a', '#a8521a'], bg: ['#402b1e', '#5a3a12', '#3e1f15'] }
    }[kind];
    let s = pasZamine(c, c.yeki(P.bg));
    const liq = c.rangAsli ? [roshanTar(c.rangAsli, .25), tireTar(c.rangAsli, .4)] : P.liq;
    let inner = '';
    const shenavar = () => {
      const a = c.bein(0, 6.28), d = c.bein(4, 38);
      return [Math.cos(a) * d, Math.sin(a) * d];
    };
    if(kind === 'rose' || kind === 'borage'){
      for(let i = 0; i < c.sahih(6, 10); i++){ const [x, y] = shenavar(); inner += `<path transform="translate(${gerd(x)} ${gerd(y)}) rotate(${c.sahih(0, 360)})" d="M0 0C6-8 14-6 12 2 10 8 4 8 0 0Z" fill="${c.yeki(['#f27a98', '#d93a60', '#f7a8bc'])}" opacity=".95"/>`; }
      for(let i = 0; i < c.sahih(3, 6); i++){ const [x, y] = shenavar(); let f = ''; for(let j = 0; j < 5; j++) f += `<path transform="rotate(${j * 72})" d="M0 0L-3.5-9 0-11 3.5-9Z" fill="${c.yeki(['#4a7ad8', '#6a5ad8', '#3a6ac8'])}"/>`; inner += `<g transform="translate(${gerd(x)} ${gerd(y)}) rotate(${c.sahih(0, 72)})">${f}<circle r="1.8" fill="#1a1a3a"/></g>`; }
    }
    if(kind === 'citrus'){
      for(let i = 0; i < c.sahih(2, 4); i++){ const [x, y] = shenavar(); inner += halgheLimu(c, x, y, c.bein(11, 15), c.yeki(['orange', 'lemon', 'blood']), c.bein(0, 6)); }
      inner += chubDarchin(c, c.bein(-10, 10), c.bein(-10, 10), c.bein(0, 180), 50);
    }
    if(kind === 'chamomile'){
      for(let i = 0; i < c.sahih(5, 9); i++){ const [x, y] = shenavar(); let f = ''; for(let j = 0; j < 12; j++) f += `<ellipse transform="rotate(${j * 30})" cy="-6.5" rx="1.8" ry="4.5" fill="#fffaf0"/>`; inner += `<g transform="translate(${gerd(x)} ${gerd(y)}) scale(${gerd(c.bein(.8, 1.2) * 100) / 100})">${f}<circle r="3.4" fill="#f2b21c"/></g>`; }
    }
    if(kind === 'berry'){
      for(let i = 0; i < c.sahih(8, 12); i++){ const [x, y] = shenavar(); inner += tut(c, x, y, c.bein(3, 5)); }
      for(let i = 0; i < 2; i++){ const [x, y] = shenavar(); let f = ''; for(let j = 0; j < 5; j++) f += `<ellipse transform="rotate(${j * 72})" cy="-7" rx="5" ry="8" fill="#9a1030" opacity=".8"/>`; inner += `<g transform="translate(${gerd(x)} ${gerd(y)})">${f}</g>`; }
    }
    if(kind === 'mint'){
      for(let i = 0; i < c.sahih(4, 7); i++){ const [x, y] = shenavar(); inner += barg(c, x, y, c.bein(0, 360), c.bein(.6, .9)); }
      const [x, y] = shenavar(); inner += halgheLimu(c, x, y, 14, 'lemon', 0);
    }
    if(kind === 'quince'){
      for(let i = 0; i < c.sahih(2, 4); i++){ const [x, y] = shenavar(); inner += `<g transform="translate(${gerd(x)} ${gerd(y)}) rotate(${c.sahih(0, 360)})"><path d="M-16 0A16 16 0 0 1 16 0Q0 8-16 0Z" fill="#f7e2a0" stroke="#e0b24a" stroke-width="2"/><path d="M-4-4L0 0 4-4" stroke="#8a5a1a" stroke-width="1.4" fill="none"/></g>`; }
      inner += badiyan(c, c.bein(-10, 10), c.bein(-10, 10), c.bein(0, 90), .7);
    }
    inner += habab(c, 8, -40, 40, -40, 40, '#fff');
    s += livanAzBala(c, { R: 58, liquid: c.shoaei([[0, roshanTar(liq[0], .15)], [.7, liq[0]], [1, liq[1]]], .45, .42, .62), inner });
    if(kind === 'borage' || kind === 'rose'){ for(let i = 0; i < 3; i++){ const a = c.bein(0, 6.28); s += `<path transform="translate(${gerd(CX + Math.cos(a) * 96)} ${gerd(CY + Math.sin(a) * 100)}) rotate(${c.sahih(0, 360)})" d="M0 0C6-8 14-6 12 2 10 8 4 8 0 0Z" fill="#e2506a"/>`; } }
    if(kind === 'quince' || kind === 'citrus') s += chubDarchin(c, c.yeki([36, 164]), c.yeki([42, 212]), c.bein(0, 180), 52);
    return s;
  };
}
sabt('herbal-rose', 'چای', 'گل‌محمدی', damnushAzBala('rose'));
sabt('herbal-borage', 'چای', 'گاوزبان', damnushAzBala('borage'));
sabt('herbal-citrus', 'چای', 'مرکبات', damnushAzBala('citrus'));
sabt('herbal-chamomile', 'چای', 'بابونه', damnushAzBala('chamomile'));
sabt('herbal-berry', 'چای', 'توت', damnushAzBala('berry'));
sabt('herbal-mint', 'چای', 'نعناع', damnushAzBala('mint'));
sabt('herbal-quince', 'چای', 'به', damnushAzBala('quince'));

sabt('tea-latte', 'چای', 'چای‌لاته', c => {
  let s = pasZamine(c) + rooyeMiz(c);
  const tea = c.rangAsli || c.yeki(['#c96a2a', '#b85a1a', '#d08a3a']);
  const r = keshidanLivan(c, c.yeki(['tumbler', 'mug']), (g, lt) => `<rect y="${lt}" width="200" height="200" fill="${c.khatti([[0, '#fffaf0'], [.28, '#f3e3c6'], [.36, roshanTar(tea, .2)], [.6, tea], [1, tireTar(tea, .4)]])}"/>` + pudr(c, 20, CX, lt + 2, 26, '#8a4520', .7), {});
  s += r.s + bokhar(c, CX, r.g.top - 6, 2, 14, .8);
  s += chubDarchin(c, c.yeki([34, 166]), 214, c.bein(-20, 20), 50) + badiyan(c, c.yeki([166, 34]), 212, c.bein(0, 90), .8);
  return s;
});

function sabkeSard(kind){
  return c => {
    let s = pasZamine(c) + rooyeMiz(c);
    const shape = c.yeki(['tall', 'tumbler', 'jar', 'highball']);
    const r = keshidanLivan(c, shape, (g, lt) => {
      let l = '';
      if(kind === 'americano') l += `<rect y="${lt}" width="200" height="200" fill="${c.khatti([[0, '#6a3a1a'], [.08, '#3a1a08'], [1, '#1a0a03']])}"/>`;
      else {
        const milk = kind === 'mocha' ? '#d9bfa6' : '#f3e9da';
        const cof = kind === 'mocha' ? '#4a2210' : '#6a3a1a';
        const mid = lt + c.bein(26, 50);
        l += `<rect y="${lt}" width="200" height="200" fill="${milk}"/>`;
        l += `<path d="M0 ${lt}H200V${gerd(mid)}C160 ${gerd(mid + 12)} 140 ${gerd(mid - 10)} 100 ${gerd(mid + 6)}S40 ${gerd(mid - 8)} 0 ${gerd(mid + 8)}Z" fill="${c.khatti([[0, cof], [1, roshanTar(cof, .3)]])}"/>`;
        l += `<path d="M20 ${gerd(mid + 14)}C60 ${gerd(mid + 30)} 120 ${gerd(mid + 4)} 180 ${gerd(mid + 26)}" stroke="${cof}" stroke-opacity=".35" stroke-width="8" fill="none"/>`;
        if(kind === 'caramel' || kind === 'mocha'){
          const sc = kind === 'caramel' ? '#c97a2b' : '#3a1a0a';
          for(let i = 0; i < 5; i++){ const x = CX - g.tw + 6 + i * (g.tw * 2 - 12) / 4; l += `<path d="M${gerd(x)} ${lt}q${c.sahih(-8, 8)} 40 ${c.sahih(-4, 4)} ${c.sahih(60, 120)}" stroke="${sc}" stroke-width="${gerd(c.bein(2.5, 4))}" fill="none" stroke-linecap="round" opacity=".8"/>`; }
          l += `<rect y="${g.bot - 14}" width="200" height="20" fill="${sc}" opacity=".85"/>`;
        }
      }
      l += yakh(c, c.sahih(3, 5), CX - g.bw + 12, CX + g.bw - 12, lt + 4, lt + 70);
      l += habab(c, 6, CX - g.bw + 6, CX + g.bw - 6, lt + 20, g.bot - 10, '#fff');
      return l;
    }, { drops: c.sahih(8, 16) });
    s += niKhordani(c, CX + c.bein(-6, 8), r.g.bot - 30, CX + c.bein(18, 34), r.g.top - c.bein(24, 40), 6) + r.s;
    if(kind === 'mocha' && c.shans(.6)) s += `<path d="M${CX - r.g.tw + 2} ${r.g.top}C${CX - 20} ${r.g.top - 22} ${CX + 20} ${r.g.top - 22} ${CX + r.g.tw - 2} ${r.g.top}Z" fill="#fbf4ea"/>` + pudr(c, 20, CX, r.g.top - 8, 14, '#3a1a0a', .7);
    s += daneHayeAtraf(c, c.sahih(0, 3), 70, 88, CX, 214);
    return s;
  };
}
sabt('iced-americano', 'سرد', 'آیس‌آمریکانو', sabkeSard('americano'));
sabt('iced-latte', 'سرد', 'آیس‌لاته', sabkeSard('latte'));
sabt('iced-caramel', 'سرد', 'آیس‌کارامل', sabkeSard('caramel'));
sabt('iced-mocha', 'سرد', 'آیس‌موکا', sabkeSard('mocha'));

const RANG_NUSHIDANI = {
  sky: ['#bfe8ff', '#2a7ad6'], ruby: ['#ff9fb0', '#b3123a'], emerald: ['#b9f3c6', '#0f8a4e'], sunset: ['#ffe07a', '#ff4e2e'],
  violet: ['#e2c2ff', '#6b2fb3'], coconut: ['#fffdf6', '#e6dac2'], peach: ['#ffd9b8', '#f07f4f'], lagoon: ['#b8fff2', '#0f8f8a'], rose: ['#ffd0dc', '#e04a78']
};
function maktail(shape){
  return c => {
    let s = pasZamine(c) + rooyeMiz(c);
    let col;
    if(c.rangAsli) col = [roshanTar(c.rangAsli, .45), c.rangAsli];
    else col = RANG_NUSHIDANI[c.yeki(Object.keys(RANG_NUSHIDANI))];
    const liquid = c.khatti([[0, col[0], .92], [1, col[1], .96]]);
    if(shape === 'coupe' || shape === 'martini'){
      const bowl = shape === 'coupe'
        ? `M${CX - 54} 96C${CX - 54} 130 ${CX - 28} 144 ${CX} 144S${CX + 54} 130 ${CX + 54} 96Z`
        : `M${CX - 56} 88L${CX} 148L${CX + 56} 88Z`;
      s += saye(c, CX + 4, 202, 44, 8, .6);
      s += `<path d="M${CX} 144V196" stroke="rgba(255,255,255,.55)" stroke-width="4"/><ellipse cx="${CX}" cy="198" rx="30" ry="5" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.55)" stroke-width="1.6"/>`;
      const clip = c.boresh(`<path d="${bowl}"/>`);
      s += `<g clip-path="${clip}"><rect y="${shape === 'coupe' ? 102 : 96}" width="200" height="60" fill="${liquid}"/>${habab(c, 10, CX - 36, CX + 36, 108, 138)}</g>`;
      s += `<path d="${bowl}" fill="${c.shishe()}" stroke="rgba(255,255,255,.6)" stroke-width="1.8"/>`;
      s += `<ellipse cx="${CX}" cy="${shape === 'coupe' ? 96 : 88}" rx="${shape === 'coupe' ? 54 : 56}" ry="5" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="1.6"/>`;
      if(c.shans(.5)) s += `<path d="M${CX - 54} 96Q${CX} 104 ${CX + 54} 96" stroke="#fff" stroke-width="3" stroke-dasharray="1 2.5" stroke-linecap="round" fill="none" opacity=".85"/>`;
      const gk = c.sahih(0, 3);
      if(gk === 0) s += halgheLimu(c, CX + 46, 94, 15, c.yeki(['lemon', 'lime', 'orange', 'grapefruit']), 0);
      if(gk === 1) s += `<path d="M${CX - 40} 70L${CX + 10} 120" stroke="#caa36a" stroke-width="2"/>` + tut(c, CX - 26, 84, 6) + tut(c, CX - 18, 92, 6) + tut(c, CX - 10, 100, 6);
      if(gk === 2) s += gilas(c, CX + 20, 112, 1);
      if(gk === 3) s += shakheNana(c, CX + 34, 100, 20, 1);
    } else if(shape === 'hurricane'){
      s += niKhordani(c, CX - 6, 150, CX - 24, 30, 5);
      const p = `M${CX - 30} 58C${CX - 36} 96 ${CX - 18} 110 ${CX - 22} 136C${CX - 28} 170 ${CX - 30} 186 ${CX - 12} 186H${CX + 12}C${CX + 30} 186 ${CX + 28} 170 ${CX + 22} 136C${CX + 18} 110 ${CX + 36} 96 ${CX + 30} 58Z`;
      s += saye(c, CX + 4, 204, 40, 7, .6);
      s += `<path d="M${CX} 186V200" stroke="rgba(255,255,255,.55)" stroke-width="6"/><ellipse cx="${CX}" cy="201" rx="26" ry="4" fill="rgba(255,255,255,.25)" stroke="rgba(255,255,255,.55)"/>`;
      const clip = c.boresh(`<path d="${p}"/>`);
      s += `<g clip-path="${clip}"><rect y="70" width="200" height="140" fill="${liquid}"/>${yakh(c, 3, CX - 18, CX + 18, 78, 120)}${habab(c, 12, CX - 22, CX + 22, 90, 180)}</g>`;
      s += `<path d="${p}" fill="${c.shishe()}" stroke="rgba(255,255,255,.6)" stroke-width="1.8"/><ellipse cx="${CX}" cy="58" rx="30" ry="4" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.6"/>`;
      s += c.shans(.5) ? halgheLimu(c, CX + 28, 58, 16, c.yeki(['orange', 'lemon', 'lime']), 0) : `<g transform="translate(${CX + 18} 36) rotate(20)"><path d="M0 30V-2" stroke="#caa36a" stroke-width="1.6"/><path d="M-22 0Q0-18 22 0Q0-6-22 0Z" fill="${c.yeki(['#e8453c', '#2a9d8f', '#f2c94c', '#e07a9a'])}"/><path d="M0-10L-12-2M0-10L12-2M0-10V0" stroke="#fff" stroke-opacity=".6"/></g>`;
    } else {
      const glassShape = shape;
      const r = keshidanLivan(c, glassShape, (g, lt) => {
        let l = `<rect y="${lt}" width="200" height="200" fill="${liquid}"/>`;
        if(c.shans(.5)) l += `<rect y="${g.bot - 40}" width="200" height="50" fill="${col[1]}" opacity=".5"/>`;
        l += yakh(c, c.sahih(2, 4), CX - g.bw + 12, CX + g.bw - 12, lt + 4, lt + 60);
        if(c.shans(.6)) l += halgheLimu(c, CX + c.bein(-10, 10), lt + c.bein(50, 80), 13, c.yeki(['lemon', 'lime', 'orange', 'grapefruit']), c.bein(0, 3));
        if(c.shans(.5)) l += shakheNana(c, CX + c.bein(-12, 12), lt + c.bein(40, 80), c.bein(-30, 30), .8);
        l += habab(c, 16, CX - g.bw + 6, CX + g.bw - 6, lt + 10, g.bot - 6);
        return l;
      }, { drops: c.sahih(4, 12) });
      s += niKhordani(c, CX + c.bein(-8, 8), r.g.bot - 20, CX + c.bein(16, 34), r.g.top - c.bein(20, 36), 6) + r.s;
      const gk = c.sahih(0, 2);
      if(gk === 0) s += halgheLimu(c, CX - r.g.tw + 2, r.g.top + 2, 16, c.yeki(['orange', 'lemon', 'lime', 'grapefruit']), 0);
      if(gk === 1) s += shakheNana(c, CX - 10, r.g.top + 6, -10, 1.1);
      if(gk === 2) s += `<g transform="translate(${CX - 14} ${r.g.top - 4}) rotate(-25)"><path d="M0 0V-30" stroke="#6a4a2a" stroke-width="1.6"/>${barg(c, 0, -8, -140, .35, '#5a7a4a')}${barg(c, 0, -14, -40, .35, '#5a7a4a')}${barg(c, 0, -20, -140, .35, '#5a7a4a')}${barg(c, 0, -26, -40, .35, '#5a7a4a')}</g>`;
    }
    for(let i = 0; i < c.sahih(0, 2); i++) s += halgheLimu(c, c.yeki([30, 170]) + c.bein(-8, 8), 216 + c.bein(-4, 6), c.bein(9, 12), c.yeki(['lemon', 'lime', 'orange']), c.bein(0, 3));
    return s;
  };
}
sabt('mocktail-coupe', 'ماکتیل', 'کوپ', maktail('coupe'));
sabt('mocktail-martini', 'ماکتیل', 'مارتینی', maktail('martini'));
sabt('mocktail-highball', 'ماکتیل', 'بلند', maktail('highball'));
sabt('mocktail-hurricane', 'ماکتیل', 'هاریکن', maktail('hurricane'));
sabt('mocktail-jar', 'ماکتیل', 'شیشه', maktail('jar'));
sabt('mocktail-rocks', 'ماکتیل', 'کوتاه', maktail('rocks'));

const SHIKHA = {
  strawberry: { col: '#f7a9c0', sauce: '#d61f35', top: 'strawberry' },
  oreo: { col: '#cfc6bd', sauce: '#1e1a18', top: 'oreo' },
  biscuit: { col: '#e8c89a', sauce: '#b5651d', top: 'biscuit' },
  peanut: { col: '#d9a86a', sauce: '#8a4a1a', top: 'peanut' },
  mint: { col: '#bfe6c8', sauce: '#2e160c', top: 'mint' },
  hazelnut: { col: '#9a6a48', sauce: '#3a1a0a', top: 'hazelnut' },
  coffee: { col: '#c89a70', sauce: '#4a2210', top: 'beans' },
  vanilla: { col: '#f6e7c0', sauce: '#c97a2b', top: 'cherry' },
  mango: { col: '#ffc24a', sauce: '#ff7a2a', top: 'fruit' }
};
function shik(flavor){
  return c => {
    const F = SHIKHA[flavor];
    const col = c.rangAsli || F.col;
    let s = pasZamine(c) + rooyeMiz(c);
    const shape = c.yeki(['tall', 'jar', 'tumbler', 'sundae']);
    const mark = s.length;
    let top, tw;
    if(shape === 'sundae'){
      const p = `M${CX - 40} 84C${CX - 42} 120 ${CX - 20} 150 ${CX - 8} 158V186H${CX + 8}V158C${CX + 20} 150 ${CX + 42} 120 ${CX + 40} 84Z`;
      s += saye(c, CX + 4, 204, 40, 7, .6) + `<ellipse cx="${CX}" cy="198" rx="28" ry="6" fill="rgba(255,255,255,.25)" stroke="rgba(255,255,255,.55)"/><path d="M${CX - 8} 186L${CX - 12} 198H${CX + 12}L${CX + 8} 186" fill="rgba(255,255,255,.2)"/>`;
      const clip = c.boresh(`<path d="${p}"/>`);
      let l = `<rect y="84" width="200" height="120" fill="${c.khatti([[0, roshanTar(col, .15)], [1, tireTar(col, .15)]])}"/>`;
      for(let i = 0; i < 5; i++){ const x = CX - 32 + i * 16; l += `<path d="M${x} 84q${c.sahih(-6, 6)} 30 ${c.sahih(-3, 3)} ${c.sahih(30, 60)}" stroke="${F.sauce}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".8"/>`; }
      s += `<g clip-path="${clip}">${l}</g><path d="${p}" fill="${c.shishe()}" stroke="rgba(255,255,255,.6)" stroke-width="1.8"/>`;
      top = 84; tw = 40;
    } else {
      const r = keshidanLivan(c, shape, (g, lt) => {
        let l = `<rect y="${lt}" width="200" height="200" fill="${c.khatti([[0, roshanTar(col, .15)], [1, tireTar(col, .15)]])}"/>`;
        for(let i = 0; i < 5; i++){ const x = CX - g.tw + 6 + i * (g.tw * 2 - 12) / 4; l += `<path d="M${gerd(x)} ${lt}q${c.sahih(-6, 6)} 30 ${c.sahih(-3, 3)} ${c.sahih(40, 90)}" stroke="${F.sauce}" stroke-width="${gerd(c.bein(3, 5))}" fill="none" stroke-linecap="round" opacity=".8"/>`; }
        if(F.top === 'oreo') l += pudr(c, 60, CX, (lt + g.bot) / 2, 40, '#1e1a18', .8, 1.8);
        if(F.top === 'mint') l += pudr(c, 40, CX, (lt + g.bot) / 2, 40, '#2e160c', .9, 1.8);
        return l;
      }, { level: null });
      s += r.s;
      top = r.g.top; tw = r.g.tw;
    }
    const cream = `M${CX - tw - 2} ${top + 2}C${CX - tw - 8} ${top - 12} ${CX - tw + 6} ${top - 20} ${CX - 18} ${top - 18}C${CX - 22} ${top - 34} ${CX - 4} ${top - 40} ${CX + 2} ${top - 32}C${CX + 6} ${top - 48} ${CX + 26} ${top - 42} ${CX + 20} ${top - 24}C${CX + tw + 4} ${top - 24} ${CX + tw + 8} ${top - 8} ${CX + tw + 2} ${top + 2}Z`;
    s += `<path d="${cream}" fill="${c.shoaei([[0, '#ffffff'], [.8, '#f4ecdf'], [1, '#d9ccb8']], .4, .3, .9)}"/>`;
    s += `<path d="M${CX - tw + 4} ${top - 8}Q${CX - 10} ${top - 2} ${CX - 16} ${top - 16}M${CX + 4} ${top - 16}Q${CX + 12} ${top - 8} ${CX + tw - 4} ${top - 10}" stroke="#d9ccb8" stroke-width="1.4" fill="none"/>`;
    let zz = `M${CX - 26} ${top - 14}`;
    for(let i = 0; i < 6; i++) zz += `L${CX - 20 + i * 9} ${top - (i % 2 ? 30 : 12)}`;
    s += `<path d="${zz}" stroke="${F.sauce}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    const tx = CX + c.bein(-6, 6), ty = top - 36;
    if(F.top === 'strawberry') s += tutFarangi(c, tx + 4, ty, 1, c.sahih(-20, 20)) + tutFarangi(c, tx - 20, ty + 12, .7, -30);
    if(F.top === 'oreo') s += `<g transform="translate(${gerd(tx + 8)} ${gerd(ty)}) rotate(${c.sahih(-30, -10)})"><rect x="-17" y="-8" width="34" height="16" rx="8" fill="#1e1a18"/><rect x="-15" y="-2.5" width="30" height="5" fill="#f6f1ea"/></g>` + pudr(c, 20, tx - 6, ty + 16, 14, '#1e1a18', .9, 1.6);
    if(F.top === 'biscuit') s += `<g transform="translate(${gerd(tx + 6)} ${gerd(ty - 2)}) rotate(${c.sahih(-25, -8)})"><rect x="-18" y="-11" width="36" height="22" rx="2" fill="${c.ostovane('#e0a85a')}"/>${[-10, -3, 4, 11].map(x => `<circle cx="${x}" cy="-4" r="1.2" fill="#a86a2a"/><circle cx="${x}" cy="4" r="1.2" fill="#a86a2a"/>`).join('')}</g><g transform="translate(${gerd(tx - 16)} ${gerd(ty + 10)}) rotate(20)"><rect x="-12" y="-8" width="24" height="16" rx="2" fill="${c.ostovane('#e0a85a')}"/></g>`;
    if(F.top === 'peanut'){ for(let i = 0; i < 9; i++) s += `<ellipse cx="${gerd(tx + c.bein(-24, 24))}" cy="${gerd(ty + c.bein(6, 22))}" rx="3.5" ry="2.4" fill="${c.gooy('#c98a4a')}" transform="rotate(${c.sahih(0, 180)} ${gerd(tx)} ${gerd(ty + 14)})"/>`; }
    if(F.top === 'mint') s += shakheNana(c, tx + 4, ty + 16, c.sahih(-15, 15), 1) + pudr(c, 14, tx, ty + 18, 16, '#2e160c', 1, 2);
    if(F.top === 'hazelnut'){ for(let i = 0; i < 4; i++) s += `<g transform="translate(${gerd(tx + c.bein(-20, 20))} ${gerd(ty + c.bein(4, 20))})"><circle r="5.5" fill="${c.gooy('#9a5a2a')}"/><path d="M-5-2Q0-7 5-2" fill="#c79a66"/></g>`; }
    if(F.top === 'beans'){ for(let i = 0; i < 5; i++) s += daneGhahve(c, tx + c.bein(-22, 22), ty + c.bein(6, 22), c.bein(0, 360), .7); }
    if(F.top === 'cherry') s += gilas(c, tx, ty + 8, 1.1) + pashidani(c, 14, tx - 24, tx + 24, ty + 8, ty + 24);
    if(F.top === 'fruit') s += `<g transform="translate(${gerd(tx)} ${gerd(ty + 6)})"><path d="M-14 8Q-14-10 0-12 14-10 14 8Z" fill="${c.gooy('#ffb020')}"/><path d="M-8-2L8-2M-10 3H10" stroke="#e08a10" stroke-width="1"/></g>` + tut(c, tx - 18, ty + 16, 5, '#26164a');
    const st = niKhordani(c, CX + c.bein(0, 10), top + 30, CX + c.bein(22, 36), top - c.bein(60, 76), 7);
    return s.slice(0, mark) + st + s.slice(mark);
  };
}
sabt('shake-strawberry', 'شیک', 'توت‌فرنگی', shik('strawberry'));
sabt('shake-oreo', 'شیک', 'اورئو', shik('oreo'));
sabt('shake-biscuit', 'شیک', 'بیسکوییت', shik('biscuit'));
sabt('shake-peanut', 'شیک', 'بادام‌زمینی', shik('peanut'));
sabt('shake-mint', 'شیک', 'شکلات‌نعناع', shik('mint'));
sabt('shake-hazelnut', 'شیک', 'فندق', shik('hazelnut'));
sabt('shake-coffee', 'شیک', 'قهوه', shik('coffee'));
sabt('shake-vanilla', 'شیک', 'وانیل', shik('vanilla'));
sabt('smoothie-mango', 'شیک', 'انبه', shik('mango'));

function boshghab(c, x = CX, y = 186, rx = 76, ry = 20){
  const col = c.yeki(['#f3ece1', '#f6f1ea', '#2d5f9a', '#232120', '#efe0c2', '#1f6f78', '#b8613b', '#8ea888']);
  let s = saye(c, x + 5, y + 8, rx + 8, ry + 6, .6);
  s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c.ostovane(col, .7)}"/>`;
  s += `<ellipse cx="${x}" cy="${y - 2}" rx="${gerd(rx * .74)}" ry="${gerd(ry * .64)}" fill="${tireTar(col, .08)}"/>`;
  if(c.shans(.4)) s += `<ellipse cx="${x}" cy="${y}" rx="${rx - 3}" ry="${ry - 2}" fill="none" stroke="${TALAEI}" stroke-width="1.2"/>`;
  if(c.shans(.35)) s += `<ellipse cx="${x}" cy="${y}" rx="${gerd(rx * .88)}" ry="${gerd(ry * .82)}" fill="none" stroke="${c.yeki(['#2d5f9a', TALAEI, '#b8233a'])}" stroke-width="2" stroke-dasharray="1.5 4" stroke-linecap="round"/>`;
  return s;
}
function takhte(c, x = CX, y = 186, w = 150){
  const col = c.yeki(['#a8743f', '#8a5a34', '#c28e55']);
  return saye(c, x + 5, y + 10, w / 2 + 6, 14, .6) + `<rect x="${x - w / 2}" y="${y - 12}" width="${w}" height="24" rx="12" fill="${c.khatti([[0, roshanTar(col, .15)], [1, tireTar(col, .2)]])}"/><rect x="${x - w / 2}" y="${y + 6}" width="${w}" height="6" rx="3" fill="${tireTar(col, .35)}"/><circle cx="${x + w / 2 - 12}" cy="${y}" r="3.5" fill="${tireTar(col, .5)}"/>`;
}
function zirSarv(c, y = 186){ return c.shans(.35) ? takhte(c, CX, y) : boshghab(c, CX, y); }

function shekleKruasan(c, base){
  const cy0 = 22, Rm = 46, A0 = 188, A1 = 352, n = 7;
  const pt = (a, r) => [Math.cos(a * Math.PI / 180) * r, cy0 + Math.sin(a * Math.PI / 180) * r];
  const thick = u => 6 + 36 * Math.pow(Math.sin(u * Math.PI), .85);
  const f = p => gerd(p[0]) + ' ' + gerd(p[1]);
  let order = [];
  for(let i = 0; i < n; i++) order.push(i);
  order.sort((a, b) => Math.abs(b - (n - 1) / 2) - Math.abs(a - (n - 1) / 2));
  let g = '';
  const grad = c.shoaei([[0, roshanTar(base, .42)], [.55, base], [1, tireTar(base, .42)]], .5, .45, .6);
  order.forEach(i => {
    const u0 = i / n, u1 = (i + 1) / n, um = (u0 + u1) / 2;
    const a0 = A0 + u0 * (A1 - A0), a1 = A0 + u1 * (A1 - A0), am = (a0 + a1) / 2;
    const t0 = thick(u0), t1 = thick(u1), tm = thick(um);
    const o0 = pt(a0, Rm + t0 / 2), o1 = pt(a1, Rm + t1 / 2), i1 = pt(a1, Rm - t1 / 2), i0 = pt(a0, Rm - t0 / 2);
    const om = pt(am, Rm + tm / 2 + 6), im = pt(am, Rm - tm / 2 - 1);
    const e1 = pt(a1 + 3, Rm), e0 = pt(a0 - 3, Rm);
    g += `<path d="M${f(o0)}Q${f(om)} ${f(o1)}Q${f(e1)} ${f(i1)}Q${f(im)} ${f(i0)}Q${f(e0)} ${f(o0)}Z" fill="${grad}" stroke="${tireTar(base, .45)}" stroke-width="1.1"/>`;
    const h0 = pt(a0 + 4, Rm + t0 / 2 - 3), h1 = pt(a1 - 4, Rm + t1 / 2 - 3), hm = pt(am, Rm + tm / 2 + 1);
    g += `<path d="M${f(h0)}Q${f(hm)} ${f(h1)}" stroke="#fff" stroke-opacity=".35" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    const l0 = pt(am - 3, Rm + tm * .2), l1 = pt(am + 3, Rm - tm * .2);
    g += `<path d="M${f(l0)}L${f(l1)}" stroke="${tireTar(base, .3)}" stroke-width=".8" opacity=".5"/>`;
  });
  const noke = (a, dir) => { const p = pt(a, Rm); const q = pt(a - dir * 10, Rm - 4); return `<path d="M${f(pt(a, Rm + 4))}Q${gerd(q[0] - dir * 2)} ${gerd(q[1] + 10)} ${gerd(q[0] - dir * 4)} ${gerd(q[1] + 14)}Q${f(p)} ${f(pt(a, Rm - 4))}Z" fill="${tireTar(base, .15)}" stroke="${tireTar(base, .45)}" stroke-width="1"/>`; };
  return noke(A0 + 2, -1) + noke(A1 - 2, 1) + g;
}
function kruasan(variant){
  return c => {
    let s = pasZamine(c) + boshghabAzBala(c, CX, CY + 6, 90);
    const base = c.yeki(['#e7a64f', '#dc9442', '#eab262', '#d98c3a']);
    const rot = c.sahih(-18, 18);
    let g = saye(c, 3, 14, 66, 34, .22) + shekleKruasan(c, base);
    if(variant === 'chocolate'){
      const cy0 = 22, Rm = 46, A0 = 188, A1 = 352;
      const zekhamat = u => 6 + 36 * Math.pow(Math.sin(u * Math.PI), .85);
      [[11, 0, 1.7], [7, .045, 1.1]].forEach(([n, faz, w], pass) => {
        const pts = [];
        for(let i = 0; i <= n; i++){
          const u = .12 + faz + (.76 - faz) * i / n + c.bein(-.008, .008);
          const a = (A0 + u * (A1 - A0)) * Math.PI / 180, side = (i + pass) % 2 ? 1 : -1;
          const r = Rm + side * (zekhamat(u) / 2 + (side > 0 ? c.bein(1.5, 3.5) : c.bein(0, 1.5)));
          pts.push([Math.cos(a), Math.sin(a), r]);
        }
        let d = `M${gerd(pts[0][0] * pts[0][2])} ${gerd(cy0 + pts[0][1] * pts[0][2])}`;
        for(let i = 1; i < pts.length; i++){
          const [ca, sa, r] = pts[i], [pca, psa, pr] = pts[i - 1];
          const k1 = pr + (r - pr) * .38, k2 = r - (r - pr) * .38;
          d += `C${gerd(pca * k1)} ${gerd(cy0 + psa * k1)} ${gerd(ca * k2)} ${gerd(cy0 + sa * k2)} ${gerd(ca * r)} ${gerd(cy0 + sa * r)}`;
        }
        g += `<path d="${d}" stroke="#000" stroke-opacity=".16" stroke-width="${w + 1}" fill="none" stroke-linecap="round" transform="translate(.8 1.4)"/>`;
        g += `<path d="${d}" stroke="${pass ? '#4a2210' : '#2e1406'}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
        g += `<path d="${d}" stroke="#b07e56" stroke-opacity=".5" stroke-width=".5" fill="none" stroke-linecap="round" transform="translate(-.4 -.5)"/>`;
      });
      for(let i = 0; i < 2; i++){ const u = c.bein(.25, .75), a = (A0 + u * (A1 - A0)) * Math.PI / 180, r = Rm + zekhamat(u) / 2 + 3; g += `<ellipse cx="${gerd(Math.cos(a) * r)}" cy="${gerd(cy0 + Math.sin(a) * r)}" rx="1.1" ry="1.7" fill="#2e1406"/>`; }
      g += pudr(c, 16, 0, -10, 40, '#3a1a0a', .7, .9);
    }
    if(variant === 'almond'){ for(let i = 0; i < 18; i++){ const a = c.bein(200, 340) * Math.PI / 180, d = c.bein(34, 62); const x = Math.cos(a) * d, y = 22 + Math.sin(a) * d; g += `<ellipse cx="${gerd(x)}" cy="${gerd(y)}" rx="4" ry="2" fill="#f6e2b8" stroke="#c9a060" stroke-width=".6" transform="rotate(${c.sahih(0, 180)} ${gerd(x)} ${gerd(y)})"/>`; } g += pudr(c, 70, 0, -6, 50, '#fff', .95, 1.1); }
    s += `<g transform="translate(${CX} ${CY + 4}) rotate(${rot}) scale(1.14)">${g}</g>`;
    const side = c.yeki([-1, 1]);
    if(variant === 'plain'){
      s += `<g transform="translate(${CX - side * 56} ${CY + 64}) rotate(${c.sahih(-20, 20)})"><rect x="-11" y="-8" width="22" height="16" rx="3" fill="#f7e7a8"/><rect x="-11" y="-8" width="22" height="5" rx="2" fill="#fff6d0"/></g>`;
    }
    return s;
  };
}
sabt('croissant', 'شیرینی', 'کروسان', kruasan('plain'));
sabt('croissant-chocolate', 'شیرینی', 'کروسان‌شکلاتی', kruasan('chocolate'));
sabt('croissant-almond', 'شیرینی', 'کروسان‌بادام', kruasan('almond'));

sabt('kouign-amann', 'شیرینی', 'کویینگ‌امان', c => {
  let s = pasZamine(c);
  s += boshghabAzBala(c, CX, CY, 84);
  const base = c.yeki(['#c9782a', '#b8682a', '#d98a3a']);
  let g = '';
  for(let i = 0; i < 4; i++){
    g += `<path transform="rotate(${i * 90 + 45})" d="M0 0C18-10 40-8 44 0 40 8 18 10 0 0Z" fill="${c.shoaei([[0, roshanTar(base, .3)], [1, tireTar(base, .35)]], .7, .5, .8)}"/>`;
  }
  g += `<circle r="36" fill="${c.shoaei([[0, roshanTar(base, .35)], [.7, base], [1, tireTar(base, .3)]], .4, .35, .7)}"/>`;
  for(let i = 0; i < 4; i++) g += `<path transform="rotate(${i * 90})" d="M0 0L30 0" stroke="${tireTar(base, .35)}" stroke-width="2"/>`;
  g += `<circle r="12" fill="${roshanTar(base, .2)}"/>` + pudr(c, 50, 0, 0, 38, '#fff3d0', .8, 1.2);
  g += `<path d="${kaman(0, 0, 30, 200, 260)}" stroke="#fff" stroke-opacity=".4" stroke-width="3" fill="none"/>`;
  s += `<g transform="translate(${CX} ${CY}) rotate(${c.sahih(0, 90)})">${g}</g>`;
  return s;
});

function boshghabAzBala(c, x, y, r){
  const col = c.yeki(['#f3ece1', '#f6f1ea', '#2d5f9a', '#232120', '#efe0c2', '#1f6f78', '#b8613b', '#8ea888', '#e7b6ae']);
  let s = saye(c, x + 7, y + 9, r + 8, r + 8, .6);
  s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.shoaei([[0, roshanTar(col, .25)], [.8, col], [1, tireTar(col, .2)]], .4, .35, .75)}"/>`;
  s += `<circle cx="${x}" cy="${y}" r="${gerd(r * .74)}" fill="none" stroke="${tireTar(col, .25)}" stroke-opacity=".35" stroke-width="1.5"/>`;
  if(c.shans(.45)) s += `<circle cx="${x}" cy="${y}" r="${r - 3}" fill="none" stroke="${TALAEI}" stroke-width="1.4"/>`;
  if(c.shans(.4)){ let d = ''; const k = c.yeki([12, 16, 20]); for(let i = 0; i < k; i++){ const a = i / k * Math.PI * 2; d += `<circle cx="${gerd(x + Math.cos(a) * r * .87)}" cy="${gerd(y + Math.sin(a) * r * .87)}" r="2" fill="${c.yeki(['#2d5f9a', TALAEI, '#b8233a'])}"/>`; } s += d; }
  return s;
}

sabt('choco-twist', 'شیرینی', 'تویست', c => {
  let s = pasZamine(c);
  s += boshghabAzBala(c, CX, CY + 4, 90);
  const base = c.yeki(['#e2a04a', '#d9923c', '#e8ac58']);
  const pichide = (x, y, rot, L) => {
    const cap = `M${-L / 2} -14A14 14 0 0 0 ${-L / 2} 14H${L / 2}A14 14 0 0 0 ${L / 2} -14Z`;
    const cl = c.boresh(`<path d="${cap}"/>`);
    let g = saye(c, 3, 6, L / 2 + 14, 18, .45);
    g += `<path d="${cap}" fill="${tireTar(base, .15)}"/>`;
    let bands = '';
    for(let bx = -L / 2 - 20; bx < L / 2 + 10; bx += 15){
      bands += `<path d="M${bx} -16L${bx + 11} -16L${bx + 22} 16L${bx + 11} 16Z" fill="${c.khatti([[0, roshanTar(base, .35)], [.5, base], [1, tireTar(base, .3)]])}"/>`;
      bands += `<path d="M${bx + 11.5} -16L${bx + 22.5} 16" stroke="#3a1a0a" stroke-width="2.4" opacity=".85"/>`;
      bands += `<path d="M${bx + 2} -12L${bx + 8} 4" stroke="#fff" stroke-opacity=".3" stroke-width="2" stroke-linecap="round"/>`;
    }
    g += `<g clip-path="${cl}">${bands}<rect x="${-L / 2 - 14}" y="-14" width="${L + 28}" height="28" fill="${c.khatti([[0, '#fff', .12], [.5, '#fff', 0], [1, '#000', .25]])}"/></g>`;
    g += `<path d="${cap}" fill="none" stroke="${tireTar(base, .45)}" stroke-width="1"/>`;
    g += pudr(c, 26, 0, 0, L / 2, '#fff8e0', .9, 1.1);
    return `<g transform="translate(${gerd(x)} ${gerd(y)}) rotate(${gerd(rot)})">${g}</g>`;
  };
  const r0 = c.bein(-35, -20);
  s += pichide(CX - 4, CY - 18, r0, 124) + pichide(CX + 6, CY + 24, r0 + c.bein(-6, 6), 118);
  return s;
});
function kuki(kind){
  return c => {
    let s = pasZamine(c);
    const P = {
      double: { base: '#5a2e1a', chip: ['#2a120a', '#f6e7d0'], deco: 'salt' },
      ny: { base: '#d59a52', chip: ['#3a1a0a', '#5a2e1a'], deco: 'chunk' },
      lemon: { base: '#f3dc8a', chip: ['#fff'], deco: 'lemon' }
    }[kind];
    if(c.shans(.5)) s += boshghabAzBala(c, CX, CY, 86);
    const n = c.sahih(2, 3);
    for(let k = 0; k < n; k++){
      const x = CX + c.bein(-26, 26) * (k ? 1 : .3), y = CY + c.bein(-26, 26) * (k ? 1 : .3), r = c.bein(30, 38);
      s += saye(c, x + 4, y + 6, r + 4, r + 4, .5);
      s += `<path d="${lakeNarm(c, x, y, r, 12, .06)}" fill="${c.shoaei([[0, roshanTar(P.base, .2)], [.7, P.base], [1, tireTar(P.base, .35)]], .45, .4, .6)}"/>`;
      for(let i = 0; i < 5; i++){ const a = c.bein(0, 6.28), d = c.bein(4, r * .7); s += `<path d="M${gerd(x + Math.cos(a) * d)} ${gerd(y + Math.sin(a) * d)}l${c.sahih(-8, 8)} ${c.sahih(-6, 6)}l${c.sahih(-6, 6)} ${c.sahih(-6, 6)}" stroke="${tireTar(P.base, .3)}" stroke-width="1" fill="none" opacity=".6"/>`; }
      if(P.deco !== 'lemon'){
        for(let i = 0; i < c.sahih(6, 10); i++){ const a = c.bein(0, 6.28), d = c.bein(0, r * .75), cx = x + Math.cos(a) * d, cy = y + Math.sin(a) * d; s += `<path d="${lakeNarm(c, cx, cy, P.deco === 'chunk' ? c.bein(4, 7) : c.bein(2.5, 4), 6, .3)}" fill="${c.yeki(P.chip)}"/>`; }
        if(P.deco === 'salt') s += pudr(c, 12, x, y, r * .7, '#fff', 1, 1.4);
      } else {
        for(let i = 0; i < 6; i++){ const a = c.bein(0, 6.28), d = c.bein(4, r * .7); s += `<path d="M${gerd(x + Math.cos(a) * d)} ${gerd(y + Math.sin(a) * d)}l${c.sahih(-10, 10)} ${c.sahih(-8, 8)}" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".9"/>`; }
        s += pudr(c, 20, x, y, r * .8, '#fff', .9, 1.1) + pudr(c, 8, x, y, r * .6, '#e0b020', .9, 1.2);
      }
    }
    if(kind === 'lemon') s += halgheLimu(c, c.yeki([40, 160]), c.yeki([44, 206]), 18, 'lemon', c.bein(0, 3));
    if(kind === 'double' && c.shans(.6)){ s += `<g transform="translate(${c.yeki([38, 162])} ${c.yeki([42, 210])}) rotate(${c.sahih(-30, 30)})"><rect x="-16" y="-11" width="32" height="22" rx="2" fill="#3a1a0a"/><path d="M-5-11V11M6-11V11M-16 0H16" stroke="#1e0a04" stroke-width="1.2"/></g>`; }
    return s;
  };
}
sabt('cookie-double', 'شیرینی', 'کوکی', kuki('double'));
sabt('cookie-ny', 'شیرینی', 'نیویورکی', kuki('ny'));
sabt('cookie-lemon', 'شیرینی', 'لیمویی', kuki('lemon'));

sabt('cinnamon-roll', 'شیرینی', 'سینامون', c => {
  let s = pasZamine(c) + boshghabAzBala(c, CX, CY, 88);
  const base = c.yeki(['#d9924a', '#c98040', '#e0a050']);
  s += saye(c, CX + 4, CY + 6, 60, 60, .5);
  s += `<circle cx="${CX}" cy="${CY}" r="54" fill="${c.shoaei([[0, roshanTar(base, .25)], [.8, base], [1, tireTar(base, .3)]])}"/>`;
  s += `<g transform="translate(${CX} ${CY}) rotate(${c.sahih(0, 360)})"><path d="${marpich(3.2, 3, 50)}" stroke="${tireTar(base, .45)}" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="${marpich(3.2, 3, 50)}" stroke="${roshanTar(base, .3)}" stroke-width="1.2" fill="none" transform="translate(-1.5 -1.5)"/>`;
  let z = 'M-44 -20';
  for(let i = 0; i < 9; i++) z += `Q${-40 + i * 10} ${i % 2 ? 30 : -30} ${-34 + i * 10} ${i % 2 ? -18 : 18}`;
  s += `<path d="${z}" stroke="#fffaf0" stroke-width="4" fill="none" stroke-linecap="round" opacity=".95" transform="rotate(${c.sahih(0, 180)})"/></g>`;
  s += pudr(c, 30, CX, CY, 50, '#6a3212', .6);
  return s;
});

sabt('pastel-nata', 'شیرینی', 'ناتا', c => {
  let s = pasZamine(c);
  const n = c.sahih(1, 3);
  const pos = n === 1 ? [[CX, CY, 58]] : n === 2 ? [[CX - 34, CY - 18, 42], [CX + 32, CY + 24, 42]] : [[CX - 36, CY - 28, 36], [CX + 36, CY - 16, 36], [CX, CY + 40, 36]];
  if(c.shans(.6)) s += boshghabAzBala(c, CX, CY, 92);
  pos.forEach(([x, y, r]) => {
    s += saye(c, x + 4, y + 6, r + 4, r + 4, .55);
    let crust = 'M';
    const k = 16;
    for(let i = 0; i <= k * 2; i++){ const a = i / (k * 2) * Math.PI * 2, rr = i % 2 ? r : r * .92; crust += `${i ? 'L' : ''}${gerd(x + Math.cos(a) * rr)} ${gerd(y + Math.sin(a) * rr)}`; }
    s += `<path d="${crust}Z" fill="${c.shoaei([[0, '#f2c27a'], [1, '#a8601e']])}"/>`;
    s += `<circle cx="${x}" cy="${y}" r="${gerd(r * .78)}" fill="${c.shoaei([[0, '#ffe7a0'], [.7, '#f6c85a'], [1, '#d8943a']])}"/>`;
    for(let i = 0; i < c.sahih(4, 8); i++){ const a = c.bein(0, 6.28), d = c.bein(0, r * .6); s += `<path d="${lakeNarm(c, x + Math.cos(a) * d, y + Math.sin(a) * d, c.bein(3, 8), 7, .35)}" fill="${c.yeki(['#5a2a0a', '#7a3a10', '#3a1a06'])}" opacity="${gerd(c.bein(.5, .9) * 100) / 100}"/>`; }
    s += `<path d="${kaman(x, y, r * .6, 200, 250)}" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  });
  if(c.shans(.5)) s += chubDarchin(c, c.yeki([36, 164]), c.yeki([40, 214]), c.bein(0, 180), 54);
  return s;
});

function boreshKeyk(c, o){
  const x = CX + c.bein(-6, 6), y = 150, w = 64, h = o.h || 46, d = 30;
  let s = '';
  const noke = [x - w + 6, y + 18], back = [x + w - 10, y - 4], backL = [x + 4, y - 26];
  const top = `M${noke[0]} ${noke[1] - h}L${backL[0]} ${backL[1] - h}L${back[0]} ${back[1] - h}Z`;
  const side = `M${noke[0]} ${noke[1] - h}L${back[0]} ${back[1] - h}L${back[0]} ${back[1]}L${noke[0]} ${noke[1]}Z`;
  const end = `M${back[0]} ${back[1] - h}L${backL[0]} ${backL[1] - h}L${backL[0]} ${backL[1]}L${back[0]} ${back[1]}Z`;
  s += saye(c, x + 4, y + 18, 72, 16, .55);
  s += `<path d="${end}" fill="${tireTar(o.crust || o.layers[0], .25)}"/>`;
  const clip = c.boresh(`<path d="${side}"/>`);
  let bands = '';
  let acc = 0;
  const tot = o.layers.length;
  o.layers.forEach((col, i) => {
    const hh = h / tot;
    bands += `<path d="M0 ${gerd(noke[1] - h + acc)}L200 ${gerd(noke[1] - h + acc - 22 * 1.5)}V${gerd(noke[1] - h + acc + hh - 22 * 1.5)}L0 ${gerd(noke[1] - h + acc + hh)}Z" fill="${col}"/>`;
    acc += hh;
  });
  s += `<g clip-path="${clip}"><rect width="200" height="240" fill="${o.layers[0]}"/>${bands}${o.sideExtra ? o.sideExtra(noke, back, h) : ''}</g>`;
  s += `<path d="${side}" fill="none" stroke="#000" stroke-opacity=".12"/>`;
  s += `<path d="${top}" fill="${o.top}"/>`;
  if(o.topExtra) s += o.topExtra(noke, back, backL, h);
  return s;
}
function keyk(kind){
  return c => {
    let s = pasZamine(c) + rooyeMiz(c) + boshghab(c, CX, 180, 84, 22);
    const K = {
      mocha: { layers: ['#5a2e1a', '#e8d2b0', '#5a2e1a', '#e8d2b0', '#4a2412'], top: '#3a1a0a', extra: 'beans' },
      redvelvet: { layers: ['#9a1a2a', '#fbf4ea', '#9a1a2a', '#fbf4ea', '#8a1424'], top: '#fbf4ea', extra: 'crumbs' },
      tresleches: { layers: ['#f2d49a', '#f7e4b8', '#f2d49a', '#fff8ea'], top: '#fffaf0', extra: 'cherry' },
      walnut: { layers: ['#c08a4a', '#b07a3a', '#c08a4a'], top: '#8a5a2a', extra: 'walnut', h: 40 },
      apple: { layers: ['#e8b870', '#f2cc88', '#e0a860'], top: '#c9782a', extra: 'apple', h: 38 },
      cheesecake: { layers: ['#f7e3a8', '#f7e3a8', '#f1d890', '#c07a2a'], top: '#3a1a08', extra: 'burnt', h: 52 }
    }[kind];
    if(kind === 'tresleches') s += `<ellipse cx="${CX}" cy="176" rx="64" ry="14" fill="#fffaf0" opacity=".9"/>`;
    s += boreshKeyk(c, {
      layers: K.layers, top: K.top, h: K.h,
      sideExtra: kind === 'walnut' ? (t, b) => { let q = ''; for(let i = 0; i < 8; i++) q += `<path d="${lakeNarm(c, c.bein(t[0] + 10, b[0] - 10), c.bein(b[1] - 30, t[1] - 8), 3.5, 6, .3)}" fill="#6a3a1a"/>`; return q; } : kind === 'cheesecake' ? (t, b, h) => `<path d="M${t[0]} ${t[1] - h}L${b[0]} ${b[1] - h}V${b[1] - h + 8}L${t[0]} ${t[1] - h + 8}Z" fill="#8a4a14"/>` : null,
      topExtra: (t, b, bl, h) => {
        let q = '';
        const cx = (t[0] + b[0] + bl[0]) / 3, cy = (t[1] + b[1] + bl[1]) / 3 - h;
        if(K.extra === 'beans') for(let i = 0; i < 3; i++) q += daneGhahve(c, cx - 14 + i * 14, cy + c.bein(-3, 3), c.bein(0, 360), .7);
        if(K.extra === 'crumbs') q += pudr(c, 30, cx, cy, 16, '#9a1a2a', 1, 2);
        if(K.extra === 'cherry') q += gilas(c, cx + 6, cy, .9) + pudr(c, 20, cx, cy, 14, '#b07a3a', .7);
        if(K.extra === 'walnut') for(let i = 0; i < 3; i++) q += `<path d="${lakeNarm(c, cx - 14 + i * 14, cy + c.bein(-3, 3), 5, 7, .3)}" fill="${c.gooy('#8a5a2a')}"/>`;
        if(K.extra === 'apple') for(let i = 0; i < 5; i++) q += `<path d="M${gerd(cx - 22 + i * 10)} ${gerd(cy + 4)}a7 7 0 0 1 12 -6" stroke="#f6e2a0" stroke-width="3.5" fill="none"/><path d="M${gerd(cx - 22 + i * 10)} ${gerd(cy + 4)}a7 7 0 0 1 12 -6" stroke="#b8233a" stroke-width="1" fill="none" transform="translate(-1 -1.5)"/>`;
        if(K.extra === 'burnt') for(let i = 0; i < 8; i++) q += `<path d="${lakeNarm(c, cx + c.bein(-24, 24), cy + c.bein(-6, 6), c.bein(3, 7), 7, .35)}" fill="${c.yeki(['#1a0a02', '#5a2a0a'])}" opacity=".7"/>`;
        return q;
      }
    });
    if(c.shans(.7)) s += changal(c, CX + 30, 197);
    return s;
  };
}
sabt('cake-mocha', 'شیرینی', 'کیک‌موکا', keyk('mocha'));
sabt('cake-redvelvet', 'شیرینی', 'ردولوت', keyk('redvelvet'));
sabt('cake-tresleches', 'شیرینی', 'سه‌شیر', keyk('tresleches'));
sabt('cake-walnut', 'شیرینی', 'گردویی', keyk('walnut'));
sabt('cake-apple', 'شیرینی', 'سیب', keyk('apple'));
sabt('cheesecake', 'شیرینی', 'چیزکیک', keyk('cheesecake'));

sabt('brownie', 'شیرینی', 'براونی', c => {
  let s = pasZamine(c) + boshghabAzBala(c, CX, CY, 88);
  const n = c.sahih(2, 4);
  const pos = [[-24, -20], [24, -14], [-10, 28], [30, 32]];
  for(let i = 0; i < n; i++){
    const [dx, dy] = pos[i], x = CX + dx + c.bein(-4, 4), y = CY + dy + c.bein(-4, 4), rot = c.bein(-20, 20), w = c.bein(38, 46);
    let g = saye(c, 4, 6, w * .7, w * .7, .6);
    g += `<rect x="${gerd(-w / 2)}" y="${gerd(-w / 2)}" width="${gerd(w)}" height="${gerd(w)}" rx="4" fill="#2a1006"/>`;
    g += `<rect x="${gerd(-w / 2 + 3)}" y="${gerd(-w / 2 + 2)}" width="${gerd(w - 6)}" height="${gerd(w - 7)}" rx="3" fill="${c.shoaei([[0, '#6a3a20'], [.7, '#4a2412'], [1, '#2e140a']], .4, .35, .8)}"/>`;
    for(let j = 0; j < 5; j++) g += `<path d="M${gerd(c.bein(-w / 2 + 5, w / 2 - 5))} ${gerd(c.bein(-w / 2 + 5, w / 2 - 5))}l${c.sahih(-9, 9)} ${c.sahih(-6, 6)}l${c.sahih(-7, 7)} ${c.sahih(-7, 7)}" stroke="#8a5a3a" stroke-width="1" fill="none" opacity=".8"/>`;
    for(let j = 0; j < 3; j++) g += `<path d="${lakeNarm(c, c.bein(-w / 3, w / 3), c.bein(-w / 3, w / 3), 3.4, 6, .3)}" fill="${c.gooy('#9a6a3a')}"/>`;
    g += `<path d="M${gerd(-w / 2 + 6)} ${gerd(-w / 2 + 6)}L${gerd(w / 2 - 12)} ${gerd(-w / 2 + 6)}" stroke="#fff" stroke-opacity=".18" stroke-width="3" stroke-linecap="round"/>`;
    s += `<g transform="translate(${gerd(x)} ${gerd(y)}) rotate(${gerd(rot)})">${g}</g>`;
  }
  s += pudr(c, 60, CX, CY, 60, '#fff', .8, 1.1);
  if(c.shans(.5)) s += shakheNana(c, c.yeki([34, 166]), c.yeki([48, 214]), c.bein(-40, 40), .9);
  return s;
});

sabt('dessert-cup', 'شیرینی', 'دسر', c => {
  let s = pasZamine(c) + rooyeMiz(c);
  const car = c.yeki(['#c97a2b', '#b5651d', '#d88c32']);
  const r = keshidanLivan(c, c.yeki(['tumbler', 'rocks', 'jar']), (g, lt) => {
    const hh = g.bot - lt;
    const bands = [['#a8743f', .22], ['#fbf3e6', .22], ['#d9a86a', .16], ['#fbf3e6', .2], [car, .2]].reverse();
    let acc = lt, l = '';
    bands.forEach(([col, f]) => { const h2 = hh * f; l += `<path d="M0 ${gerd(acc + 3)}Q50 ${gerd(acc - 2)} 100 ${gerd(acc + 3)}T200 ${gerd(acc + 3)}V${gerd(acc + h2 + 4)}H0Z" fill="${col}"/>`; acc += h2; });
    l += pudr(c, 30, CX, g.bot - hh * .12, 30, '#7a4a1a', .9, 1.6);
    return l;
  }, { level: null });
  s += r.s;
  s += `<g transform="translate(${CX + 8} ${r.g.top - 4}) rotate(${c.sahih(-30, -10)})"><rect x="-14" y="-10" width="28" height="20" rx="2" fill="${c.ostovane('#c98a3a')}"/><path d="M-10-6H10M-10 0H10M-10 6H10" stroke="#a86a2a" stroke-width=".8"/></g>`;
  s += `<path d="M${CX - r.g.tw + 4} ${r.g.top + 2}q10 10 20 0t20 0t20 0" stroke="${car}" stroke-width="3" fill="none"/>`;
  s += ghashogh(c, CX + c.yeki([-60, 60]), 214, c.yeki([0, 180]), .7);
  return s;
});

sabt('toast', 'میان‌وعده', 'تست', c => {
  let s = pasZamine(c);
  if(c.shans(.55)){
    const wood = c.yeki(['#b07a44', '#9a6a3a', '#c28e55']);
    let rg = '';
    for(let y = 52; y < 208; y += c.sahih(9, 14)) rg += `<path d="M26 ${y}C70 ${y + c.sahih(-3, 3)} 130 ${y + c.sahih(-3, 3)} 174 ${y}" stroke="${tireTar(wood, .25)}" stroke-opacity=".45" fill="none"/>`;
    s += `<g transform="rotate(${c.sahih(-6, 6)} 100 128)">${saye(c, 106, 136, 88, 98, .5)}<rect x="22" y="40" width="156" height="172" rx="20" fill="${c.shoaei([[0, roshanTar(wood, .15)], [1, tireTar(wood, .15)]])}"/>${rg}<circle cx="100" cy="54" r="5" fill="${tireTar(wood, .5)}"/></g>`;
  } else s += boshghabAzBala(c, CX, CY + 6, 92);
  const S = 100, h = S / 2, gap = c.bein(15, 20);
  const noon = c.khatti([[0, '#f2c878'], [1, '#d9953f']], 0, 0, 1, 1);
  const mojdar = (o, amp) => {
    let d = '';
    for(let k = 0; k <= 20; k++){
      const t = k / 20, x = h - t * S, y = -h + t * S, w = Math.sin(t * Math.PI * 7) * amp;
      d += (k ? 'L' : 'M') + gerd(x + o + w) + ' ' + gerd(y + o + w);
    }
    return d;
  };
  const nime = (sign) => {
    const tri = sign < 0 ? `M${-h} ${-h}L${h} ${-h}L${-h} ${h}Z` : `M${h} ${h}L${-h} ${h}L${h} ${-h}Z`;
    let g = '';
    [['#6cbf4a', 9, 1.8, 5.5], ['#f3a9a2', 5.5, 1, 5.5], ['#f6c742', 2.2, .6, 4.5]].forEach(([col, o, amp, w]) => {
      g += `<path d="${mojdar(-sign * o, amp)}" stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
    });
    const cl = c.boresh(`<path d="${tri}"/>`);
    let marks = '';
    for(let k = -5; k <= 5; k++) marks += `<path d="M${k * 16 - 60} -60L${k * 16 + 60} 60" stroke="#8a4a14" stroke-width="3.2" opacity=".42"/>`;
    g += `<path d="${tri}" fill="#c07a34" stroke="#b06a28" stroke-width="9" stroke-linejoin="round"/>`;
    g += `<path d="${tri}" fill="${noon}"/><g clip-path="${cl}">${marks}${pudr(c, 30, sign * -h * .3, sign * -h * .3, h * .8, '#b8702a', .6, 1.1)}</g>`;
    const off = sign * gap / 2;
    return `<g transform="translate(${gerd(off)} ${gerd(off)}) rotate(${gerd(sign * c.bein(2, 5))})">${g}</g>`;
  };
  s += `<g transform="translate(${CX} ${CY + 4}) rotate(${c.sahih(-24, 24)})">${saye(c, 5, 8, h * 1.5, h * 1.5, .45)}${nime(-1)}${nime(1)}</g>`;
  const px = c.yeki([34, 166]), py = c.yeki([54, 204]);
  if(c.shans(.5)) s += `<g transform="translate(${px} ${py})">${saye(c, 2, 3, 18, 18, .4)}<circle r="15" fill="#fbf6ef"/><circle r="11.5" fill="${c.shoaei([[0, '#e8453c'], [1, '#a81e18']])}"/><circle cx="-3" cy="-4" r="3" fill="#fff" opacity=".4"/></g>`;
  else for(let k = 0; k < 3; k++) s += `<g transform="translate(${gerd(px + k * 9 - 9)} ${gerd(py + (k % 2) * 5)})"><ellipse rx="8" ry="5" fill="#6f9a3a" stroke="#4a6a20"/><circle r="1" cx="-2" fill="#e8f0c0"/><circle r="1" cx="2" fill="#e8f0c0"/></g>`;
  return s;
});
sabt('egg-skillet', 'میان‌وعده', 'تخم‌مرغ', c => {
  let s = pasZamine(c);
  const hx = c.bein(-40, 40) * Math.PI / 180 - Math.PI / 4;
  s += saye(c, CX + 8, CY + 10, 90, 90, .6);
  s += `<g transform="translate(${CX} ${CY}) rotate(${gerd(hx * 180 / Math.PI)})"><rect x="70" y="-9" width="46" height="18" rx="6" fill="#2a2a2a"/><circle cx="106" cy="0" r="3.5" fill="#111"/></g>`;
  s += `<circle cx="${CX}" cy="${CY}" r="80" fill="${c.shoaei([[0, '#3a3a3a'], [1, '#141414']])}"/><circle cx="${CX}" cy="${CY}" r="68" fill="${c.shoaei([[0, '#2a2a2a'], [1, '#1a1a1a']])}"/>`;
  const eggs = c.sahih(2, 3);
  for(let i = 0; i < eggs; i++){
    const a = i / eggs * 6.28 + c.bein(0, 1), x = CX + Math.cos(a) * 26, y = CY + Math.sin(a) * 26;
    s += `<path d="${lakeNarm(c, x, y, 26, 10, .18)}" fill="#fffaf0"/><path d="${lakeNarm(c, x, y, 26, 10, .18)}" fill="none" stroke="#e8b060" stroke-width="2" opacity=".6"/>`;
    s += `<circle cx="${gerd(x + 2)}" cy="${gerd(y + 2)}" r="10" fill="${c.gooy('#f7a51c')}"/><circle cx="${gerd(x - 1)}" cy="${gerd(y - 1)}" r="3" fill="#fff" opacity=".55"/>`;
  }
  for(let i = 0; i < c.sahih(5, 9); i++){ const a = c.bein(0, 6.28), d = c.bein(10, 56), x = CX + Math.cos(a) * d, y = CY + Math.sin(a) * d; s += `<circle cx="${gerd(x)}" cy="${gerd(y)}" r="7" fill="${c.gooy('#b8302a')}"/>${pudr(c, 4, x, y, 5, '#6a1410', 1, 1)}`; }
  s += pudr(c, 40, CX, CY, 60, '#3f8a3a', .9, 1.4) + pudr(c, 20, CX, CY, 60, '#111', .9, 1);
  return s;
});

sabt('focaccia', 'میان‌وعده', 'فوکاچیا', c => {
  let s = pasZamine(c);
  s += `<g transform="translate(${CX} ${CY}) rotate(${c.sahih(-12, 12)})">`;
  s += saye(c, 6, 8, 80, 66, .6);
  s += `<rect x="-72" y="-58" width="144" height="116" rx="14" fill="${c.shoaei([[0, '#f6cf82'], [.8, '#e0a456'], [1, '#b8762c']])}"/>`;
  for(let i = 0; i < 18; i++){ const x = c.bein(-60, 60), y = c.bein(-46, 46); s += `<ellipse cx="${gerd(x)}" cy="${gerd(y)}" rx="3.5" ry="3" fill="#c98a3a"/><ellipse cx="${gerd(x - .8)}" cy="${gerd(y - .8)}" rx="2" ry="1.6" fill="#fff" opacity=".35"/>`; }
  for(let i = 0; i < c.sahih(4, 7); i++) s += `<path d="${lakeNarm(c, c.bein(-50, 50), c.bein(-36, 36), c.bein(8, 14), 9, .3)}" fill="#fff4d0" opacity=".85"/>`;
  for(let i = 0; i < c.sahih(3, 6); i++){ const x = c.bein(-50, 50), y = c.bein(-40, 40); s += `<circle cx="${gerd(x)}" cy="${gerd(y)}" r="7" fill="${c.gooy('#e0302a')}"/><circle cx="${gerd(x)}" cy="${gerd(y)}" r="3" fill="#ffb0a0" opacity=".6"/>`; }
  for(let i = 0; i < 6; i++){ const x = c.bein(-56, 56), y = c.bein(-44, 44), r = c.sahih(0, 180); s += `<g transform="translate(${gerd(x)} ${gerd(y)}) rotate(${r})"><path d="M-10 0H10" stroke="#3d5a2a" stroke-width="1.2"/>${[-8, -4, 0, 4, 8].map(k => `<path d="M${k} 0l-2-4M${k} 0l-2 4" stroke="#4a6a3a" stroke-width="1.2"/>`).join('')}</g>`; }
  s += pudr(c, 40, 0, 0, 60, '#fff', .8, 1);
  s += `</g>`;
  return s;
});

sabt('syrup', 'افزودنی', 'سیروپ', c => {
  let s = pasZamine(c, c.yeki(['#1f4e8c', '#163a6b', '#2c3e66', '#3a1d2e', '#12325e'])) + rooyeMiz(c);
  const liq = c.rangAsli || c.yeki(['#e8578a', '#f06a9a', '#d94878', '#ec5f95']);
  const x = CX - 18;
  const badane = `M${x - 25} 190V122Q${x - 25} 106 ${x - 11} 100Q${x - 7} 97 ${x - 7} 88V56H${x + 7}V88Q${x + 7} 97 ${x + 11} 100Q${x + 25} 106 ${x + 25} 122V190Q${x + 25} 200 ${x + 15} 200H${x - 15}Q${x - 25} 200 ${x - 25} 190Z`;
  const cl = c.boresh(`<path d="${badane}"/>`);
  s += saye(c, x + 4, 203, 34, 7, .6);
  s += `<g clip-path="${cl}"><rect x="${x - 30}" y="76" width="60" height="130" fill="${c.khatti([[0, roshanTar(liq, .25)], [.5, liq], [1, tireTar(liq, .35)]], 0, 0, 1, 0)}"/><ellipse cx="${x - 6}" cy="150" rx="10" ry="40" fill="#fff" opacity=".12"/></g>`;
  s += `<path d="${badane}" fill="${c.shishe()}" stroke="rgba(255,255,255,.55)" stroke-width="1.6"/>`;
  s += `<path d="M${x - 19} 118V186" stroke="#fff" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/>`;
  s += `<rect x="${x - 8}" y="48" width="16" height="10" rx="2" fill="${c.ostovane('#c9ced6')}"/><path d="M${x} 48L${x + 14} 26" stroke="${c.ostovane('#c9ced6')}" stroke-width="4.5" stroke-linecap="round"/><path d="M${x + 14} 26L${x + 17} 22" stroke="#9aa0a8" stroke-width="3" stroke-linecap="round"/>`;
  const lab = c.yeki(['#fbf4e8', '#f3e6d0']);
  let gol = '';
  for(let k = 0; k < 5; k++) gol += `<ellipse transform="rotate(${k * 72})" cy="-4.2" rx="3" ry="4.6" fill="${liq}"/>`;
  s += `<rect x="${x - 19}" y="134" width="38" height="40" rx="4" fill="${lab}"/><rect x="${x - 16}" y="137" width="32" height="34" rx="3" fill="none" stroke="${TALAEI}" stroke-width=".8"/><g transform="translate(${x} 150)">${gol}<circle r="2.2" fill="${TALAEI}"/></g><path d="M${x - 10} 162H${x + 10}M${x - 7} 166H${x + 7}" stroke="#9a8a7a" stroke-width="1"/>`;
  const gx = CX + 42;
  const jam = `M${gx - 16} 164H${gx + 16}L${gx + 13} 200H${gx - 13}Z`;
  const jcl = c.boresh(`<path d="${jam}"/>`);
  s += saye(c, gx + 2, 203, 20, 4, .5) + `<g clip-path="${jcl}"><rect x="${gx - 20}" y="184" width="40" height="20" fill="${liq}" opacity=".85"/></g><path d="${jam}" fill="${c.shishe()}" stroke="rgba(255,255,255,.6)" stroke-width="1.4"/>`;
  s += tameshk(c, gx - 30, 204, 7) + tameshk(c, gx + 26, 206, 6) + tameshk(c, x - 40, 206, 6.5);
  return s;
});
sabt('honey', 'افزودنی', 'عسل', c => {
  let s = pasZamine(c, c.yeki(['#5a3a12', '#402b1e', '#1f4e8c', '#1c3a5e', '#5a6b3a'])) + rooyeMiz(c);
  const jx = CX - 14;
  s += saye(c, jx + 4, 204, 44, 8, .6);
  const jar = `M${jx - 30} 118Q${jx - 36} 124 ${jx - 36} 136V188Q${jx - 36} 200 ${jx - 24} 200H${jx + 24}Q${jx + 36} 200 ${jx + 36} 188V136Q${jx + 36} 124 ${jx + 30} 118Z`;
  const cl = c.boresh(`<path d="${jar}"/>`);
  const lvl = c.sahih(128, 136);
  s += `<g clip-path="${cl}"><rect x="${jx - 40}" y="${lvl}" width="80" height="80" fill="${c.khatti([[0, '#ffcf4a'], [.5, '#f0a41c'], [1, '#b8650a']])}"/><ellipse cx="${jx - 6}" cy="${lvl + 36}" rx="18" ry="26" fill="#fff3b0" opacity=".35"/><ellipse cx="${jx}" cy="${lvl}" rx="34" ry="4" fill="#ffe08a"/></g>`;
  s += `<path d="${jar}" fill="${c.shishe()}" stroke="rgba(255,255,255,.6)" stroke-width="1.8"/>`;
  s += `<rect x="${jx - 30}" y="110" width="60" height="9" rx="3" fill="rgba(255,255,255,.3)" stroke="rgba(255,255,255,.6)"/>`;
  s += `<path d="M${jx - 26} 128V190" stroke="#fff" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/>`;
  const lab = c.yeki(['#f6eee1', '#efe0c2']);
  s += `<rect x="${jx - 24}" y="152" width="48" height="28" rx="3" fill="${lab}" opacity=".95"/><path transform="translate(${jx} 166)" d="M0-8L7-4V4L0 8-7 4V-4Z" fill="none" stroke="#b8650a" stroke-width="1.4"/><path d="M${jx - 18} 157H${jx + 18}M${jx - 18} 176H${jx + 18}" stroke="#c9a060" stroke-width=".8"/>`;
  const hx = jx + 4, hy = 76;
  s += `<path d="M${hx} ${hy + 14}Q${hx - 1} ${hy + 30} ${hx} ${lvl}" stroke="${c.khatti([[0, '#ffc23a'], [1, '#e8900a']])}" stroke-width="4" fill="none" stroke-linecap="round"/><circle class="az-drip" cx="${hx}" cy="${hy + 30}" r="2.8" fill="#f2a20a"/>`;
  s += `<g transform="translate(${hx} ${hy}) rotate(${c.sahih(-40, -28)})"><rect x="-3" y="-72" width="6" height="64" rx="3" fill="${c.ostovane('#b98a4e')}"/><g><ellipse rx="12" ry="15" fill="${c.ostovane('#d59a3a')}"/><path d="M-12-7H12M-12 0H12M-11 7H11" stroke="#8a5a1a" stroke-width="2.4"/><path d="M-9 10Q0 22 9 10" fill="#f2a20a"/></g></g>`;
  const cx2 = CX + 58, cy2 = 190;
  const comb = `M${cx2 - 30} ${cy2 + 10}L${cx2 - 34} ${cy2 - 8}L${cx2 - 14} ${cy2 - 22}L${cx2 + 18} ${cy2 - 18}L${cx2 + 32} ${cy2 - 2}L${cx2 + 26} ${cy2 + 14}Z`;
  const ccl = c.boresh(`<path d="${comb}"/>`);
  let cells = '';
  for(let r = -4; r <= 4; r++) for(let q = -5; q <= 5; q++){
    const x = cx2 + q * 9 + (r % 2 ? 4.5 : 0), y = cy2 + r * 7.8;
    cells += `<path transform="translate(${gerd(x)} ${gerd(y)})" d="M0-5L4.3-2.5V2.5L0 5-4.3 2.5V-2.5Z" fill="${c.yeki(['#f7b41c', '#f2a20a', '#ffc84a'])}" stroke="#c9780a" stroke-width="1"/>`;
  }
  s += saye(c, cx2 + 2, cy2 + 14, 36, 7, .5) + `<path d="${comb}" fill="#e89a10"/><g clip-path="${ccl}">${cells}</g><path d="${comb}" fill="none" stroke="#b8650a" stroke-width="1.6"/><path d="M${cx2 - 20} ${cy2 - 12}L${cx2 + 8} ${cy2 - 14}" stroke="#fff" stroke-opacity=".45" stroke-width="2" stroke-linecap="round"/>`;
  return s;
});
function sos(col, name){
  return c => {
    let s = pasZamine(c);
    s += boshghabAzBala(c, CX, CY + 10, 84);
    s += saye(c, CX + 4, CY + 14, 54, 54, .5);
    const bowl = c.yeki(['#f3ece1', '#232120', '#2d5f9a', '#efe0c2']);
    s += `<circle cx="${CX}" cy="${CY + 10}" r="48" fill="${c.gooy(bowl)}"/><circle cx="${CX}" cy="${CY + 10}" r="40" fill="${c.shoaei([[0, roshanTar(col, .25)], [.7, col], [1, tireTar(col, .35)]], .45, .4, .6)}"/>`;
    s += `<g transform="translate(${CX} ${CY + 10})"><path d="${marpich(2, 3, 30)}" stroke="${roshanTar(col, .35)}" stroke-width="3" fill="none" opacity=".6"/></g>`;
    s += `<path d="${kaman(CX, CY + 10, 34, 200, 250)}" stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    return s;
  };
}
sabt('sauce-chocolate', 'افزودنی', 'سس‌شکلات', sos('#4a2210'));
sabt('sauce-caramel', 'افزودنی', 'سس‌کارامل', sos('#c97a2b'));

sabt('water', 'افزودنی', 'آب', c => {
  let s = pasZamine(c, c.yeki(['#1c3a5e', '#13294a', '#0e3b3b', '#173840'])) + rooyeMiz(c);
  const x = CX - 20;
  s += saye(c, x + 4, 202, 30, 7, .6);
  const b = `M${x - 18} 96Q${x - 18} 80 ${x - 8} 72L${x - 7} 52H${x + 7}L${x + 8} 72Q${x + 18} 80 ${x + 18} 96V194Q${x + 18} 200 ${x + 12} 200H${x - 12}Q${x - 18} 200 ${x - 18} 194Z`;
  s += `<path d="${b}" fill="rgba(170,215,240,.28)" stroke="rgba(255,255,255,.6)" stroke-width="1.6"/>`;
  s += `<rect x="${x - 8}" y="40" width="16" height="13" rx="2" fill="${c.yeki(['#2d6fb0', '#e8453c', '#f6eee1'])}"/>`;
  s += `<rect x="${x - 18}" y="126" width="36" height="34" fill="${c.yeki(['#f6eee1', '#2d6fb0'])}"/><path d="M${x - 18} 146q6-5 12 0t12 0 12 0" stroke="#5aa0d8" stroke-width="2" fill="none"/>`;
  s += `<path d="M${x - 12} 96V186" stroke="#fff" stroke-opacity=".4" stroke-width="3" stroke-linecap="round"/>`;
  for(let i = 0; i < 10; i++) s += `<ellipse cx="${gerd(x + c.bein(-14, 14))}" cy="${gerd(c.bein(100, 190))}" rx="1.2" ry="1.8" fill="#fff" fill-opacity=".55"/>`;
  const gx = CX + 36;
  s += saye(c, gx + 2, 202, 26, 6, .5);
  s += `<path d="M${gx - 20} 140H${gx + 20}L${gx + 16} 200H${gx - 16}Z" fill="${c.shishe()}" stroke="rgba(255,255,255,.6)" stroke-width="1.6"/><path d="M${gx - 18} 156H${gx + 18}L${gx + 16} 199H${gx - 16}Z" fill="rgba(170,215,240,.3)"/>`;
  s += habab(c, 6, gx - 12, gx + 12, 160, 196) + halgheLimu(c, gx + 16, 142, 12, 'lemon', 0);
  return s;
});

function shotRizi(joft){
  return c => {
    let s = pasZamine(c);
    const steel = '#b8bec6';
    s += `<rect x="0" y="196" width="200" height="44" fill="${c.khatti([[0, '#6a7078'], [1, '#2a2e34']])}"/>`;
    for(let x = 8; x < 200; x += 12) s += `<rect x="${x}" y="202" width="6" height="30" rx="3" fill="#1a1c20" opacity=".7"/>`;
    s += `<path d="M0 196H200" stroke="#fff" stroke-opacity=".25"/>`;
    s += `<rect x="20" y="-10" width="160" height="32" rx="6" fill="${c.ostovane(steel)}"/><rect x="66" y="22" width="68" height="14" rx="3" fill="${c.ostovane('#9aa0a8')}"/>`;
    s += `<path d="M62 36H138L134 58Q132 66 122 66H78Q68 66 66 58Z" fill="${c.ostovane('#8a9098')}"/><path d="M138 44H176Q186 44 186 52Q186 60 176 60H136Z" fill="${c.ostovane('#1a1a1a')}"/><circle cx="174" cy="52" r="3" fill="#555"/>`;
    const spX = joft ? [-12, 12] : [0];
    spX.forEach(dx => { s += `<path d="M${CX + dx - 6} 66H${CX + dx + 6}L${CX + dx + 3} 76H${CX + dx - 3}Z" fill="${c.ostovane(steel)}"/>`; });
    const livanha = [CX];
    const sathe = [];
    livanha.forEach((gx, k) => {
      const top = 142, bot = 196, w = 24;
      const lvl = top + c.sahih(16, 24);
      const p = `M${gx - w} ${top}H${gx + w}L${gx + w - 3} ${bot}H${gx - w + 3}Z`;
      const cl = c.boresh(`<path d="${p}"/>`);
      let crema = '';
      for(let i = 0; i < 10; i++) crema += `<ellipse cx="${gerd(gx + c.bein(-w + 3, w - 3))}" cy="${gerd(lvl + c.bein(0, 6))}" rx="${gerd(c.bein(1.5, 4))}" ry="1" fill="${c.yeki(['#8a4a1c', '#f0c48c'])}" opacity=".6"/>`;
      s += saye(c, gx + 2, bot + 2, w + 8, 4, .6);
      s += `<g clip-path="${cl}"><rect x="${gx - w - 2}" y="${lvl}" width="${w * 2 + 4}" height="60" fill="${c.khatti([[0, '#e2a868'], [.22, '#b8763a'], [.35, '#5a2c10'], [1, '#1e0c04']])}"/>${crema}</g>`;
      s += `<path d="${p}" fill="${c.shishe()}" stroke="rgba(255,255,255,.6)" stroke-width="1.6"/><path d="M${gx - w + 5} ${bot - 4}H${gx + w - 5}" stroke="rgba(255,255,255,.4)" stroke-width="7"/><path d="M${gx - w + 5} ${top + 6}L${gx - w + 7} ${bot - 12}" stroke="#fff" stroke-opacity=".4" stroke-width="2.4" stroke-linecap="round"/>`;
      sathe.push([gx, lvl]);
    });
    spX.forEach((dx, k) => {
      const [gx, lvl] = [CX + dx * .4, sathe[0][1]];
      s += `<path d="M${CX + dx} 76Q${CX + dx} ${gerd((76 + lvl) / 2)} ${gerd(gx)} ${lvl}" stroke="#7a3e16" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M${CX + dx} 78Q${CX + dx} ${gerd((76 + lvl) / 2)} ${gerd(gx)} ${lvl}" stroke="#e8b070" stroke-width="1" fill="none" opacity=".6"/>`;
    });
    s += bokhar(c, CX, 138, 2, 16, .6);
    return s;
  };
}
sabt('shot', 'افزودنی', 'شات', shotRizi(false));
sabt('shot-double', 'افزودنی', 'شات‌دبل', shotRizi(true));
sabt('icecream', 'افزودنی', 'بستنی', c => {
  let s = pasZamine(c) + rooyeMiz(c);
  const bowl = c.yeki(['#f3ece1', '#2d5f9a', '#232120', '#1f6f78', '#e7b6ae', '#efe0c2']);
  const rimY = 146, rx = 58, ry = 11;
  s += saye(c, CX + 4, 206, 64, 10, .6);
  s += `<path d="M${CX - 14} 196h28l5 10h-38z" fill="${tireTar(bowl, .15)}"/>`;
  s += `<ellipse cx="${CX}" cy="${rimY}" rx="${rx}" ry="${ry}" fill="${roshanTar(bowl, .15)}"/><ellipse cx="${CX}" cy="${rimY + 1}" rx="${rx - 4}" ry="${ry - 3}" fill="${tireTar(bowl, .35)}"/>`;
  const flavors = [['#f6e9c8', 'vanilla'], ['#f3c44a', 'saffron'], ['#5a2e1a', 'choco'], ['#f7b0c4', 'straw'], ['#b8d68a', 'pistachio']];
  const k = c.sahih(2, 3);
  const xs = k === 2 ? [-18, 18] : [-26, 26, 0];
  const ys = k === 2 ? [136, 138] : [140, 141, 120];
  for(let i = 0; i < k; i++){
    const f = c.yeki(flavors);
    const x = CX + xs[i] + c.bein(-3, 3), y = ys[i] + c.bein(-2, 2), r = k === 2 ? c.bein(25, 28) : c.bein(22, 25);
    s += `<path d="${lakeNarm(c, x, y, r, 11, .08)}" fill="${c.shoaei([[0, roshanTar(f[0], .35)], [.7, f[0]], [1, tireTar(f[0], .2)]], .4, .3, .8)}"/>`;
    s += `<path d="${kaman(x, y, r * .6, 200, 250)}" stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    if(f[1] === 'saffron') s += pudr(c, 14, x, y, r * .7, '#5a8a2a', 1, 1.6) + `<path d="${lakeNarm(c, x + 6, y + 4, 6, 6, .3)}" fill="#fffaf0" opacity=".9"/>`;
    if(f[1] === 'choco') s += pudr(c, 10, x, y, r * .7, '#2a1006', 1, 1.5);
    if(f[1] === 'straw') s += pudr(c, 12, x, y, r * .7, '#c2183a', 1, 1.3);
    if(f[1] === 'pistachio') s += pudr(c, 12, x, y, r * .7, '#4a7a2a', 1, 1.5);
  }
  if(c.shans(.6)) s += `<g transform="translate(${CX + 24} 150) rotate(-62)"><rect x="0" y="-5" width="54" height="10" rx="4" fill="${c.ostovane('#d9a35a')}"/><path d="M8 -5V5M16 -5V5M24 -5V5M32 -5V5M40 -5V5M48 -5V5" stroke="#a86f2c" stroke-width=".8" opacity=".6"/></g>`;
  const front = `M${CX - rx} ${rimY}A${rx} ${ry} 0 0 0 ${CX + rx} ${rimY}C${CX + rx} ${rimY + 36} ${CX + 32} 198 ${CX} 198S${CX - rx} ${rimY + 36} ${CX - rx} ${rimY}Z`;
  s += `<path d="${front}" fill="${c.ostovane(bowl)}"/>`;
  s += `<path d="M${CX - rx} ${rimY}A${rx} ${ry} 0 0 0 ${CX + rx} ${rimY}" fill="none" stroke="${roshanTar(bowl, .4)}" stroke-width="2.5"/>`;
  if(c.shans(.5)){ for(let i = 0; i < 9; i++){ const t = i / 8, x = CX - 44 + t * 88; s += `<circle cx="${gerd(x)}" cy="${gerd(rimY + 22 + Math.sin(t * Math.PI) * 10)}" r="2" fill="${bowl === '#f3ece1' || bowl === '#efe0c2' ? '#2d5f9a' : TALAEI}"/>`; } }
  return s;
});

sabt('nabat', 'افزودنی', 'نبات', c => {
  let s = pasZamine(c, c.yeki(['#1f4e8c', '#12325e', '#5a3a12', '#402b1e', '#1c3a5e']));
  s += boshghabAzBala(c, CX, CY, 90);
  const bolur = (x, y, r, rot) => {
    let d = '';
    for(let i = 0; i < 6; i++){ const a = (i / 6 * 360 + rot) * Math.PI / 180, rr = r * c.bein(.8, 1.12); d += (i ? 'L' : 'M') + gerd(x + Math.cos(a) * rr) + ' ' + gerd(y + Math.sin(a) * rr); }
    const col = c.yeki(['#f7c85a', '#f2b438', '#fbd77a', '#eea62a']);
    return `<path d="${d}Z" fill="${col}" fill-opacity=".78" stroke="#fff6d8" stroke-opacity=".75" stroke-width=".5"/>`;
  };
  const chub = (x, y, rot, L) => {
    let g = saye(c, 3, 5, L / 2 + 6, 9, .3) + `<rect x="${-L / 2}" y="-1.4" width="${L}" height="2.8" rx="1.4" fill="#a8743f"/>`;
    const a0 = -L / 2 + 8, a1 = L * .22;
    for(let t = a0; t < a1; t += 2.6){
      const u = (t - a0) / (a1 - a0), w = 2 + 7 * Math.pow(Math.sin(u * Math.PI), .7);
      const k = w > 6 ? 3 : 2;
      for(let j = 0; j < k; j++) g += bolur(t + c.bein(-1, 1), -w + (j + .5) * (2 * w / k) + c.bein(-1, 1), c.bein(2.2, 3.6), c.bein(0, 60));
    }
    g += `<path d="M${a0} -3L${a1 - 6} -4" stroke="#fff" stroke-opacity=".5" stroke-width=".8" stroke-linecap="round"/>`;
    return `<g transform="translate(${gerd(x)} ${gerd(y)}) rotate(${gerd(rot)})">${g}</g>`;
  };
  const r0 = c.bein(-40, -20), n = c.sahih(2, 3);
  for(let i = 0; i < n; i++){
    const off = (i - (n - 1) / 2) * 26;
    const nx = Math.cos((r0 + 90) * Math.PI / 180) * off, ny = Math.sin((r0 + 90) * Math.PI / 180) * off;
    s += chub(CX + nx + c.bein(-4, 4), CY + ny, r0 + c.bein(-6, 6), c.bein(130, 150));
  }
  for(let i = 0; i < 16; i++){
    const a = c.bein(0, Math.PI * 2), d = c.bein(20, 74), x = CX + Math.cos(a) * d, y = CY + Math.sin(a) * d;
    s += `<path transform="translate(${gerd(x)} ${gerd(y)}) rotate(${c.sahih(0, 180)})" d="M-5 0Q0 ${gerd(c.bein(-3, 3))} 5 0" stroke="${c.yeki(['#d8401a', '#e8601a', '#c02a10'])}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`;
  }
  for(let i = 0; i < 4; i++){
    const a = c.bein(0, Math.PI * 2), d = c.bein(40, 70);
    const x = CX + Math.cos(a) * d, y = CY + Math.sin(a) * d;
    for(let j = 0; j < 4; j++) s += bolur(x + c.bein(-4, 4), y + c.bein(-4, 4), c.bein(2.2, 3.4), c.bein(0, 60));
  }
  return s;
});
sabt('medallion', 'دیگر', 'کاشی', c => {
  const pal = c.yeki([['#1f5680', '#0a1f33', '#48b5c4'], ['#135a5a', '#062424', '#e0b25e'], ['#6a1f33', '#240910', '#48b5c4'], ['#233d78', '#0b1430', '#e39a6d']]);
  const G2 = '#d9b36e', k = c.yeki([6, 8, 8, 10, 12, 16]);
  let s = `<rect width="${W}" height="${H}" fill="${c.shoaei([[0, pal[0]], [1, pal[1]]], .5, .5, .7)}"/>`;
  let m = `<circle r="88" fill="none" stroke="${G2}" stroke-opacity=".45"/><circle r="81" fill="none" stroke="${G2}" stroke-width="1.5" stroke-dasharray=".5 6" stroke-linecap="round"/>`;
  for(let i = 0; i < k; i++){
    const a = i * 360 / k;
    m += `<ellipse transform="rotate(${a})" cy="-52" rx="${gerd(64 / k + 3)}" ry="24" fill="${G2}" fill-opacity=".08" stroke="${G2}"/>`;
    m += `<rect transform="rotate(${a + 180 / k}) translate(0 -72) rotate(45)" x="-3" y="-3" width="6" height="6" fill="${pal[2]}"/>`;
  }
  m += `<path d="${masirSetare(k, 42, 24)}" fill="${pal[1]}" stroke="${G2}" stroke-width="1.4"/><path d="${masirSetare(k, 30, 17)}" transform="rotate(${180 / k})" fill="none" stroke="${pal[2]}" stroke-width="1.2"/><circle r="12" fill="${G2}" fill-opacity=".18" stroke="${G2}"/><circle r="4" fill="${G2}"/>`;
  [[0, 0], [200, 0], [0, 240], [200, 240]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="34" fill="none" stroke="${G2}" stroke-opacity=".3"/><circle cx="${x}" cy="${y}" r="24" fill="${pal[2]}" fill-opacity=".15"/>`; });
  s += `<g transform="translate(${CX} ${CY})"><g class="az-spin"><circle r="90" fill="none"/>${m}</g></g>`;
  return s;
});

const PISHFARZ_DASTE = {
  espresso: ['latte-rosetta', 'latte-tulip', 'latte-heart', 'cappuccino', 'espresso', 'espresso-side', 'americano', 'flatwhite', 'cortado', 'caramel', 'mocha', 'latte-swan', 'latte-web', 'latte-wing'],
  iced: ['iced-latte', 'iced-americano', 'iced-caramel', 'iced-mocha'],
  mug: ['hot-chocolate', 'matcha', 'masala', 'honey-milk', 'hazelnut-milk', 'pink-chocolate', 'sesame-date', 'filter'],
  tea: ['tea-glass', 'tea-cardamom', 'teapot', 'herbal-rose', 'herbal-borage', 'herbal-citrus', 'herbal-chamomile', 'herbal-berry', 'herbal-mint', 'herbal-quince', 'tea-latte'],
  cocktail: ['mocktail-coupe', 'mocktail-highball', 'mocktail-hurricane', 'mocktail-jar', 'mocktail-rocks', 'mocktail-martini'],
  shake: ['shake-strawberry', 'shake-oreo', 'shake-biscuit', 'shake-peanut', 'shake-mint', 'shake-hazelnut', 'shake-coffee', 'shake-vanilla', 'smoothie-mango'],
  cake: ['croissant', 'croissant-chocolate', 'croissant-almond', 'kouign-amann', 'choco-twist', 'cookie-double', 'cookie-ny', 'cookie-lemon', 'cinnamon-roll', 'pastel-nata', 'cheesecake', 'cake-mocha', 'cake-redvelvet', 'cake-tresleches', 'cake-walnut', 'cake-apple', 'brownie', 'dessert-cup'],
  toast: ['toast', 'egg-skillet', 'focaccia'],
  drop: ['syrup', 'honey', 'sauce-chocolate', 'sauce-caramel', 'water', 'shot', 'shot-double', 'icecream', 'nabat']
};

function sabkeMonaseb(item, ikon){
  if(item && item.art && S[item.art]) return item.art;
  const list = PISHFARZ_DASTE[ikon] || Object.keys(S);
  const r = adadTasadofi(hashKardan(String(item && item.id) + '|' + (item && item.title)));
  return list[Math.floor(r() * list.length)];
}

function matnSvg(item, opts){
  opts = opts || {};
  const key = opts.style || sabkeMonaseb(item, opts.icon);
  return keshidan(item, Object.assign({}, opts, {style: key})).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
}
const ANBAR_ADRES = new Map();
function adresTasvir(item, opts){
  const matn = matnSvg(item, opts);
  const ck = hashKardan(matn);
  if(ANBAR_ADRES.has(ck)) return ANBAR_ADRES.get(ck);
  const url = URL.createObjectURL(new Blob([matn], {type: 'image/svg+xml'}));
  ANBAR_ADRES.set(ck, url);
  return url;
}
const ANBAR_TASVIR = new Map();
const NAME_ANBAR = 'az-art-1';
function tasvirJpg(item, opts, w){
  const matn = matnSvg(item, opts);
  const ck = hashKardan(matn).toString(36) + '-' + w;
  if(ANBAR_TASVIR.has(ck)) return ANBAR_TASVIR.get(ck);
  const reqUrl = location.origin + '/__az-art/' + ck + '.jpg';
  const kar = (async () => {
    let store = null;
    try {
      if(window.caches && /^https?:$/.test(location.protocol)){
        store = await caches.open(NAME_ANBAR);
        const hit = await store.match(reqUrl);
        if(hit) return URL.createObjectURL(await hit.blob());
      }
    } catch(e){ store = null; }
    const src = URL.createObjectURL(new Blob([matn], {type: 'image/svg+xml'}));
    const lakeNarm = await new Promise(done => {
      const img = new Image();
      img.onload = () => {
        try {
          const cv = document.createElement('canvas');
          cv.width = w;
          cv.height = Math.round(w * 1.2);
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
          cv.toBlob(b => done(b), 'image/jpeg', .9);
        } catch(e){ done(null); }
      };
      img.onerror = () => done(null);
      img.src = src;
    });
    if(!lakeNarm) return src;
    URL.revokeObjectURL(src);
    if(store){ try { await store.put(reqUrl, new Response(lakeNarm, {headers: {'Content-Type': 'image/jpeg'}})); } catch(e){} }
    return URL.createObjectURL(lakeNarm);
  })();
  ANBAR_TASVIR.set(ck, kar);
  return kar;
}
function keshidan(item, opts){
  opts = opts || {};
  const key = opts.style || sabkeMonaseb(item, opts.icon);
  const st = S[key] || S.medallion;
  const seedStr = String(item.id) + '|' + key + '|' + (item.artSeed || 0);
  const c = sakhtZamine(seedStr, { tint: item.artColor || null });
  let body;
  try { body = st.fn(c); }
  catch(e){ const c2 = sakhtZamine(seedStr, {}); body = S.medallion.fn(c2); c.tarifha = c2.tarifha; }
  const cls = 'az-art' + (opts.className ? ' ' + opts.className : '');
  return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" data-style="${key}"><defs>${c.tarifha.join('')}</defs>${body}</svg>`;
}


const BOKHAR_IKON = (x, y) => `<path class="az-steam" d="M${x-5} ${y}c-2-2.5 2-4 0-7"/><path class="az-steam" style="animation-delay:.9s" d="M${x} ${y}c-2-2.5 2-4 0-7"/><path class="az-steam" style="animation-delay:1.8s" d="M${x+5} ${y}c-2-2.5 2-4 0-7"/>`;
const IKONHA = {
  espresso: ['قهوه', `<path d="M10 22h22v6a11 11 0 0 1-11 11 11 11 0 0 1-11-11z"/><path d="M32 24h3a4.5 4.5 0 0 1 0 9h-3.6"/><path d="M6 43h30"/>${BOKHAR_IKON(21, 17)}`],
  iced: ['سرد', `<path d="M12 10h24l-3 32H15z"/><path d="M13.3 19h21.4" opacity=".5"/><rect class="az-bob" x="17" y="22" width="7" height="7" rx="1.5"/><rect class="az-bob" style="animation-delay:-1.4s" x="25" y="28" width="6" height="6" rx="1.5"/><path d="M29 3l-3 26"/>`],
  mug: ['گرم', `<path d="M10 17h22v13a10 10 0 0 1-10 10h-2a10 10 0 0 1-10-10z"/><path d="M32 20h2.5a5 5 0 0 1 0 10H32"/><path class="az-beat" fill="currentColor" fill-opacity=".35" d="M21 32c-3.5-2.4-5-4-5-6a2.6 2.6 0 0 1 5-1 2.6 2.6 0 0 1 5 1c0 2-1.5 3.6-5 6z"/>${BOKHAR_IKON(21, 13)}`],
  tea: ['چای', `<path d="M16 15h16c0 5-3 7-3 11s4 5 4 9a4 4 0 0 1-4 4H19a4 4 0 0 1-4-4c0-4 4-5 4-9s-3-6-3-11z"/><path d="M18.3 29h11.4" opacity=".55"/><path d="M9 43h30"/><path class="az-sway" d="M35 15c0-5 3-8 8-8 0 5-3 8-8 8zM35 15l4-4"/>${BOKHAR_IKON(24, 11)}`],
  cocktail: ['ماکتیل', `<path d="M8 10h32L24 27z"/><path d="M24 27v12M17 40h14"/><circle cx="36" cy="9" r="5"/><path d="M36 4v10M31 9h10" opacity=".5"/><circle class="az-bub" cx="20" cy="17" r="1.2"/><circle class="az-bub" style="animation-delay:.8s" cx="26" cy="20" r="1"/><circle class="az-bub" style="animation-delay:1.6s" cx="23" cy="15" r="1.3"/>`],
  shake: ['شیک', `<path d="M14 19h20l-2.5 24h-15z"/><path d="M13 19c0-4 3-6 5.5-6 1-3 3.5-4.5 5.5-4.5s4.5 1.5 5.5 4.5c2.5 0 5.5 2 5.5 6z"/><circle class="az-beat" cx="24" cy="6" r="2.4" fill="currentColor" fill-opacity=".35"/><path d="M29 12l6-9"/><path d="M17 28h14" opacity=".5"/>`],
  cake: ['شیرینی', `<path d="M9 25h30v15H9z"/><path d="M9 29c3 3 5 0 7.5 1.5S20 33 22.5 30s4 2 7 0 5 1 9.5-1"/><path d="M24 25v-8"/><path class="az-flame" d="M24 15c-2.2-2-2.2-4.4 0-7 2.2 2.6 2.2 5 0 7z"/><path d="M6 43h36"/>`],
  toast: ['میان وعده', `<path d="M12 42V22a7 7 0 0 1 2-13h20a7 7 0 0 1 2 13v20z"/><path d="M18 30c2-2 4 2 6 0s4 2 6 0" opacity=".6"/><path class="az-twinkle" d="M41 2v8M37 6h8"/>`],
  drop: ['افزودنی', `<path d="M24 5c6 8 11 13 11 20a11 11 0 0 1-22 0c0-7 5-12 11-20z"/><path d="M18.5 26a5.5 5.5 0 0 0 5.5 5.5" opacity=".6"/><path class="az-drop" d="M24 39c1.3 1.8 2.2 2.9 2.2 4a2.2 2.2 0 0 1-4.4 0c0-1.1.9-2.2 2.2-4z"/>`],
  star: ['ستاره', `<path d="M24 4l5 14 15 1-12 9 4 15-12-9-12 9 4-15L4 19l15-1z"/>`],
  leaf: ['برگ', `<path d="M8 40C8 18 22 8 40 8c0 18-10 32-32 32z"/><path d="M8 40L30 18"/>`]
};
function ikon(key, cls){
  const ic = IKONHA[key] || IKONHA.star;
  return `<svg class="az-icon${cls ? ' ' + cls : ''}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ic[1]}</svg>`;
}

const ESTIL = `
.az-art .az-steam{animation:az-steam 3.2s ease-in-out infinite;opacity:0;transform-box:fill-box;transform-origin:50% 100%;}
@keyframes az-steam{0%{opacity:0;transform:translateY(6px) scaleY(.6);}35%{opacity:1;}100%{opacity:0;transform:translateY(-14px) scaleY(1.15);}}
.az-art .az-rise{animation:az-rise 4s ease-in infinite;}
@keyframes az-rise{0%{transform:translateY(0);opacity:0;}20%{opacity:1;}100%{transform:translateY(-34px);opacity:0;}}
.az-art .az-drift{transform-box:fill-box;transform-origin:center;animation:az-drift 7s ease-in-out infinite alternate;}
@keyframes az-drift{to{transform:translate(2px,-3px) rotate(9deg);}}
.az-art .az-glint{animation:az-glint 5s ease-in-out infinite;}
@keyframes az-glint{0%,100%{stroke-opacity:.12;}50%{stroke-opacity:.38;}}
.az-art .az-spin{transform-box:fill-box;transform-origin:center;animation:az-spin 60s linear infinite;animation-play-state:paused;}
@keyframes az-spin{to{transform:rotate(360deg);}}
.az-art .az-drip{animation:az-drip 2.6s ease-in infinite;}
@keyframes az-drip{0%,40%{transform:translateY(-8px);opacity:0;}55%{opacity:1;}100%{transform:translateY(22px);opacity:0;}}
.az-paused .az-art *{animation-play-state:paused !important;}
.az-icon .az-steam{animation:az-isteam 2.8s ease-in-out infinite;opacity:0;transform-box:fill-box;transform-origin:bottom;}
@keyframes az-isteam{0%{opacity:0;transform:translateY(3px) scaleY(.7);}40%{opacity:.9;}100%{opacity:0;transform:translateY(-6px) scaleY(1.1);}}
.az-icon .az-bob{animation:az-bob 3.2s ease-in-out infinite;transform-box:fill-box;transform-origin:center;}
@keyframes az-bob{50%{transform:translateY(-2px) rotate(8deg);}}
.az-icon .az-bub{animation:az-bub 2.4s ease-in infinite;opacity:0;}
@keyframes az-bub{0%{opacity:0;transform:translateY(4px);}30%{opacity:1;}100%{opacity:0;transform:translateY(-9px);}}
.az-icon .az-flame{animation:az-flame 1.3s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:50% 100%;fill:currentColor;fill-opacity:.3;}
@keyframes az-flame{0%{transform:scale(1,1) rotate(-3deg);}50%{transform:scale(.88,1.12) rotate(3deg);}100%{transform:scale(1.05,.92) rotate(-2deg);}}
.az-icon .az-sway{animation:az-sway 3.6s ease-in-out infinite;transform-box:fill-box;transform-origin:0% 100%;}
@keyframes az-sway{50%{transform:rotate(-14deg);}}
.az-icon .az-beat{animation:az-beat 1.6s ease-in-out infinite;transform-box:fill-box;transform-origin:center;}
@keyframes az-beat{15%{transform:scale(1.2);}30%{transform:scale(1);}45%{transform:scale(1.12);}60%{transform:scale(1);}}
.az-icon .az-drop{animation:az-dropi 2.4s ease-in infinite;transform-box:fill-box;fill:currentColor;fill-opacity:.4;}
@keyframes az-dropi{0%,30%{opacity:0;transform:translateY(-6px) scale(.4);}45%{opacity:1;transform:translateY(-2px) scale(1);}100%{opacity:0;transform:translateY(5px);}}
.az-icon .az-twinkle{animation:az-twinkle 2.2s ease-in-out infinite;transform-box:fill-box;transform-origin:center;}
@keyframes az-twinkle{50%{transform:scale(.4) rotate(45deg);opacity:.4;}}
@media (prefers-reduced-motion: reduce){.az-art *,.az-icon *{animation:none !important;}}
`;
function afzudanEstil(){
  if(typeof document === 'undefined' || document.getElementById('az-art-css')) return;
  const st = document.createElement('style');
  st.id = 'az-art-css';
  st.textContent = ESTIL;
  document.head.appendChild(st);
}
afzudanEstil();

window.Naghsh = {
  keshidan,
  adresTasvir,
  tasvirJpg,
  sabkeMonaseb,
  sabkha: S,
  goruhha: G,
  fehrest: Object.keys(S),
  onvan: k => (S[k] ? S[k].label : k),
  pishfarzDaste: PISHFARZ_DASTE,
  ikonha: IKONHA,
  ikon
};
})();
