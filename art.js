(function(){
const W = 200, H = 240, CX = 100, CY = 124, FLOOR = 204;
let UID = 0;

function hash(str){
  let h = 2166136261 >>> 0;
  for(let i = 0; i < str.length; i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h;
}
function mulberry(a){
  return function(){
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const n1 = v => Math.round(v * 10) / 10;
function hex2rgb(h){
  h = String(h).replace('#', '');
  if(h.length === 3) h = h.split('').map(x => x + x).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgb2hex(a){ return '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function mix(a, b, t){ const x = hex2rgb(a), y = hex2rgb(b); return rgb2hex(x.map((v, i) => v + (y[i] - v) * t)); }
const lighten = (c, t) => mix(c, '#ffffff', t);
const darken = (c, t) => mix(c, '#000000', t);
function rgb2hsl([r, g, b]){
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
function hsl2hex(h, s, l){
  h = ((h % 360) + 360) % 360 / 360;
  const f = (p, q, t) => { if(t < 0) t += 1; if(t > 1) t -= 1; if(t < 1/6) return p + (q - p) * 6 * t; if(t < 1/2) return q; if(t < 2/3) return p + (q - p) * (2/3 - t) * 6; return p; };
  let r, g, b;
  if(s === 0){ r = g = b = l; }
  else { const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; r = f(p, q, h + 1/3); g = f(p, q, h); b = f(p, q, h - 1/3); }
  return rgb2hex([r * 255, g * 255, b * 255]);
}
function jitter(hex, dh, ds, dl){
  const [h, s, l] = rgb2hsl(hex2rgb(hex));
  return hsl2hex(h + dh, Math.max(0, Math.min(1, s + ds)), Math.max(0, Math.min(1, l + dl)));
}

function makeCtx(seedStr, opts){
  const r = mulberry(hash(seedStr));
  const c = { r, defs: [], tint: opts && opts.tint ? opts.tint : null };
  c.rand = (a, b) => a + (b - a) * r();
  c.int = (a, b) => Math.floor(c.rand(a, b + 1));
  c.pick = a => a[Math.floor(r() * a.length)];
  c.chance = p => r() < p;
  c.sign = () => r() < .5 ? -1 : 1;
  c.id = () => 'az' + (++UID).toString(36);
  const stopsStr = stops => stops.map(s => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`).join('');
  c.lin = (stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => {
    const id = c.id();
    c.defs.push(`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stopsStr(stops)}</linearGradient>`);
    return `url(#${id})`;
  };
  c.rad = (stops, cx = .5, cy = .5, rr = .5, fx, fy) => {
    const id = c.id();
    c.defs.push(`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${rr}"${fx != null ? ` fx="${fx}" fy="${fy}"` : ''}>${stopsStr(stops)}</radialGradient>`);
    return `url(#${id})`;
  };
  c.clip = inner => { const id = c.id(); c.defs.push(`<clipPath id="${id}">${inner}</clipPath>`); return `url(#${id})`; };
  c.hcyl = (col, k = 1) => c.lin([[0, darken(col, .32 * k)], [.22, lighten(col, .22 * k)], [.5, col], [.85, darken(col, .18 * k)], [1, darken(col, .4 * k)]], 0, 0, 1, 0);
  c.glass = () => c.lin([[0, '#ffffff', .2], [.14, '#ffffff', .05], [.5, '#ffffff', .02], [.86, '#ffffff', .06], [1, '#ffffff', .18]], 0, 0, 1, 0);
  c.ball = (col, k = 1) => c.rad([[0, lighten(col, .3 * k)], [.6, col], [1, darken(col, .3 * k)]], .38, .32, .75);
  return c;
}

function shadow(c, x, y, rx, ry, op = .5){
  return `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(rx)}" ry="${n1(ry)}" fill="${c.rad([[0, '#000', op], [.6, '#000', op * .5], [1, '#000', 0]])}"/>`;
}
function arc(x, y, r, a0, a1){
  const p = a => [n1(x + Math.cos(a * Math.PI / 180) * r), n1(y + Math.sin(a * Math.PI / 180) * r)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${x0} ${y0}A${n1(r)} ${n1(r)} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}
function starPath(k, R, ri, rot = -90){
  let d = '';
  for(let i = 0; i < k * 2; i++){
    const a = (i / (k * 2)) * Math.PI * 2 + rot * Math.PI / 180, rr = i % 2 ? ri : R;
    d += (i ? 'L' : 'M') + n1(Math.cos(a) * rr) + ' ' + n1(Math.sin(a) * rr);
  }
  return d + 'Z';
}
function spiral(turns, r0, r1, steps){
  const pts = [], n = steps || Math.round(turns * 36);
  for(let i = 0; i <= n; i++){
    const t = i / n, a = t * turns * Math.PI * 2, rr = r1 - (r1 - r0) * t;
    pts.push(n1(Math.cos(a) * rr) + ' ' + n1(Math.sin(a) * rr));
  }
  return 'M' + pts.join('L');
}
function blob(c, x, y, r, k = 9, amp = .18){
  const pts = [];
  for(let i = 0; i < k; i++){
    const a = i / k * Math.PI * 2, rr = r * (1 + c.rand(-amp, amp));
    pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
  }
  let d = '';
  for(let i = 0; i < k; i++){
    const p0 = pts[(i - 1 + k) % k], p1 = pts[i], p2 = pts[(i + 1) % k], p3 = pts[(i + 2) % k];
    if(i === 0) d += `M${n1(p1[0])} ${n1(p1[1])}`;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${n1(c1[0])} ${n1(c1[1])} ${n1(c2[0])} ${n1(c2[1])} ${n1(p2[0])} ${n1(p2[1])}`;
  }
  return d + 'Z';
}

const HEART = 'M0 32C-46 4-38-40 0-18 38-40 46 4 0 32Z';
const GOLD = '#dcb46c';
const PORCELAIN = ['#f3ece1', '#f3ece1', '#f6f1ea', '#2d5f9a', '#232120', '#b8613b', '#8ea888', '#e7b6ae', '#efe0c2', '#1f6f78', '#d8a53a', '#7a2e3a', '#3b4a7a'];
const BASES = ['#1f4e8c', '#163a6b', '#2a5fa0', '#0f2f57', '#3a6ea8', '#1b4470', '#24568f', '#12325e', '#2c3e66', '#3b5f8a', '#a4552f', '#c06a3e', '#5a6b3a', '#1e5a6e', '#6a2f2a', '#8a6a2a'];

function backdrop(c, hint){
  let base = c.tint && hint === 'tint' ? darken(c.tint, .55) : (hint && hint !== 'tint' ? hint : c.pick(BASES));
  base = jitter(base, c.rand(-10, 10), c.rand(-.05, .05), c.rand(-.03, .03));
  let s = `<rect width="${W}" height="${H}" fill="${c.rad([[0, lighten(base, .18)], [.55, base], [1, darken(base, .5)]], .5, .48, .78)}"/>`;
  const ink = c.pick(['#f3dca6', '#ffffff', GOLD, lighten(base, .5)]);
  const op = n1(c.rand(.06, .11) * 100) / 100;
  const kind = c.pick(['girih', 'dots', 'rays', 'arches', 'waves', 'diamonds', 'rings', 'petals', 'stripes', 'scales', 'lattice', 'stars']);
  const pat = (w, h, inner, rot = 0) => {
    const id = c.id();
    c.defs.push(`<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse"${rot ? ` patternTransform="rotate(${rot})"` : ''}>${inner}</pattern>`);
    return `<rect width="${W}" height="${H}" fill="url(#${id})" opacity="${op}"/>`;
  };
  if(kind === 'girih'){
    const t = c.pick([26, 30, 34]);
    s += pat(t, t, `<path transform="translate(${t/2} ${t/2})" d="${starPath(8, t * .36, t * .2)}" fill="none" stroke="${ink}" stroke-width="1"/><path d="M0 0L${t*.14} 0M0 0L0 ${t*.14}M${t} ${t}L${t*.86} ${t}M${t} ${t}L${t} ${t*.86}" stroke="${ink}"/>`);
  } else if(kind === 'dots'){
    const t = c.pick([10, 12, 14]);
    s += pat(t, t, `<circle cx="${t/4}" cy="${t/4}" r="1.3" fill="${ink}"/><circle cx="${t*.75}" cy="${t*.75}" r="1.3" fill="${ink}"/>`);
  } else if(kind === 'rays'){
    let g = '';
    const k = c.pick([20, 24, 32, 40]);
    for(let i = 0; i < k; i += 2){
      const a0 = i / k * Math.PI * 2, a1 = (i + 1) / k * Math.PI * 2;
      g += `<path d="M${CX} ${CY}L${n1(CX + Math.cos(a0) * 300)} ${n1(CY + Math.sin(a0) * 300)}L${n1(CX + Math.cos(a1) * 300)} ${n1(CY + Math.sin(a1) * 300)}Z"/>`;
    }
    s += `<g fill="${ink}" opacity="${op * .8}">${g}</g>`;
  } else if(kind === 'arches'){
    s += pat(24, 32, `<path d="M3 32V15C3 8 8 4 12 2c4 2 9 6 9 13v17" fill="none" stroke="${ink}"/>`);
  } else if(kind === 'waves'){
    s += pat(32, 14, `<path d="M0 7c8-7 8 7 16 0s8 7 16 0" fill="none" stroke="${ink}" stroke-width="1.1"/>`, c.pick([0, 0, 90, 45]));
  } else if(kind === 'diamonds'){
    s += pat(20, 20, `<path d="M10 2L18 10 10 18 2 10Z" fill="none" stroke="${ink}"/><circle cx="10" cy="10" r="1.2" fill="${ink}"/>`);
  } else if(kind === 'rings'){
    let g = '';
    for(let rr = 18; rr < 220; rr += c.pick([10, 12, 14])) g += `<circle cx="${CX}" cy="${CY}" r="${rr}"/>`;
    s += `<g fill="none" stroke="${ink}" opacity="${op}">${g}</g>`;
  } else if(kind === 'petals'){
    let g = ''; const k = c.pick([8, 10, 12, 16]);
    for(let i = 0; i < k; i++) g += `<ellipse transform="translate(${CX} ${CY}) rotate(${i * 360 / k})" cy="-78" rx="${n1(180 / k)}" ry="40"/>`;
    s += `<g fill="${ink}" fill-opacity=".35" stroke="${ink}" opacity="${op * 1.2}">${g}<circle cx="${CX}" cy="${CY}" r="104" fill="none"/></g>`;
  } else if(kind === 'stripes'){
    s += pat(12, 12, `<path d="M0 0V12" stroke="${ink}" stroke-width="${c.pick([1, 3, 5])}"/>`, c.pick([0, 30, 45, 60, 90, 120]));
  } else if(kind === 'scales'){
    s += pat(20, 12, `<path d="M0 12a10 10 0 0 1 20 0M-10 6a10 10 0 0 1 20 0M10 6a10 10 0 0 1 20 0" fill="none" stroke="${ink}"/>`);
  } else if(kind === 'lattice'){
    s += pat(18, 18, `<path d="M0 9h18M9 0v18" stroke="${ink}"/><circle cx="9" cy="9" r="2.4" fill="none" stroke="${ink}"/>`, 45);
  } else {
    let g = '';
    for(let i = 0; i < 26; i++){ const x = c.rand(4, 196), y = c.rand(4, 236), sz = c.rand(1.5, 4); g += `<path transform="translate(${n1(x)} ${n1(y)})" d="M0 ${-sz}L${sz*.3} ${-sz*.3} ${sz} 0 ${sz*.3} ${sz*.3} 0 ${sz} ${-sz*.3} ${sz*.3} ${-sz} 0 ${-sz*.3} ${-sz*.3}Z"/>`; }
    s += `<g fill="${ink}" opacity="${op * 2}">${g}</g>`;
  }
  s += `<ellipse cx="${CX}" cy="${CY}" rx="92" ry="92" fill="${c.rad([[0, '#fff', .1], [1, '#fff', 0]])}"/>`;
  return s;
}

function floor(c, y = FLOOR){
  const kind = c.pick(['wood', 'marble', 'linen', 'plain', 'plain']);
  let s = '';
  if(kind === 'wood'){
    const col = c.pick(['#6b4125', '#4a2c1a', '#8a5a34', '#3a2418']);
    s += `<rect y="${y}" width="${W}" height="${H - y}" fill="${c.lin([[0, lighten(col, .1)], [1, darken(col, .4)]])}"/>`;
    for(let i = 0; i < 5; i++){ const yy = y + 5 + i * 7 + c.rand(-2, 2); s += `<path d="M0 ${n1(yy)}C60 ${n1(yy + c.rand(-3, 3))} 130 ${n1(yy + c.rand(-3, 3))} 200 ${n1(yy)}" stroke="${darken(col, .3)}" stroke-opacity=".5" fill="none"/>`; }
  } else if(kind === 'marble'){
    const col = c.pick(['#e9e4dc', '#d8d2c8', '#2b2b2e', '#c9d3d6']);
    s += `<rect y="${y}" width="${W}" height="${H - y}" fill="${c.lin([[0, col], [1, darken(col, .3)]])}"/>`;
    for(let i = 0; i < 3; i++) s += `<path d="M${n1(c.rand(0, 80))} ${H}C${n1(c.rand(40, 120))} ${n1(y + c.rand(10, 30))} ${n1(c.rand(80, 160))} ${n1(y + c.rand(0, 20))} ${n1(c.rand(140, 200))} ${y}" stroke="${col === '#2b2b2e' ? '#6f6f78' : '#9d958a'}" stroke-opacity=".5" fill="none" stroke-width=".8"/>`;
  } else if(kind === 'linen'){
    const col = c.pick(['#c9b48f', '#8b3a3a', '#35557a', '#6d7b5a', '#e9dcc0']);
    s += `<rect y="${y}" width="${W}" height="${H - y}" fill="${c.lin([[0, col], [1, darken(col, .35)]])}"/>`;
    const id = c.id();
    c.defs.push(`<pattern id="${id}" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 2h4M2 0v4" stroke="#000" stroke-opacity=".12"/></pattern>`);
    s += `<rect y="${y}" width="${W}" height="${H - y}" fill="url(#${id})"/>`;
  } else {
    s += `<rect y="${y}" width="${W}" height="${H - y}" fill="${c.lin([[0, '#000', .25], [1, '#000', .55]])}"/>`;
  }
  s += `<path d="M0 ${y}H${W}" stroke="#fff" stroke-opacity=".12"/>`;
  return s;
}

function steam(c, x, y, n = 3, spread = 14, h = 1){
  let s = '';
  for(let i = 0; i < n; i++){
    const xx = x + (i - (n - 1) / 2) * spread + c.rand(-3, 3);
    s += `<path class="az-steam" style="animation-delay:${n1(i * .9 + c.rand(0, .6))}s" d="M${n1(xx)} ${y}c-7-9 7-14 0-${n1(22*h)}s7-14 0-${n1(22*h)}" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="3" stroke-linecap="round"/>`;
  }
  return s;
}
function bubbles(c, n, x0, x1, y0, y1, col = '#fff'){
  let s = '';
  for(let i = 0; i < n; i++){
    const x = c.rand(x0, x1), y = c.rand(y0, y1);
    s += `<circle class="az-rise" style="animation-delay:${n1(c.rand(0, 4))}s;animation-duration:${n1(c.rand(2.5, 5))}s" cx="${n1(x)}" cy="${n1(y)}" r="${n1(c.rand(.7, 2.2))}" fill="${col}" fill-opacity="${n1(c.rand(.35, .7) * 100) / 100}"/>`;
  }
  return s;
}
function bean(c, x, y, rot, s = 1){
  const col = c.pick(['#4a2716', '#5a3019', '#3a1e10']);
  return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)}) scale(${s})"><ellipse rx="6" ry="8.4" fill="${c.ball(col, 1.2)}"/><path d="M0-7C3.5-2-3.5 2 0 7" stroke="${darken(col, .5)}" stroke-width="1.4" fill="none"/></g>`;
}
function beansAround(c, n, rMin = 88, rMax = 104, cx = CX, cy = CY){
  let s = '';
  for(let i = 0; i < n; i++){
    const a = c.rand(0, Math.PI * 2), d = c.rand(rMin, rMax);
    const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
    if(x > 8 && x < 192 && y > 20 && y < 232) s += bean(c, x, y, c.rand(0, 360), c.rand(.8, 1.1));
  }
  return s;
}
function cinnamonStick(c, x, y, rot, len = 70){
  const col = c.pick(['#7b3c17', '#8a4520', '#6a3212']);
  return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)})"><rect x="${-len/2}" y="-6" width="${len}" height="12" rx="6" fill="${c.lin([[0, lighten(col, .2)], [.5, col], [1, darken(col, .35)]])}"/><path d="M${-len/2 + 4} -1.5H${len/2 - 4}" stroke="${lighten(col, .3)}" stroke-width="1.4" opacity=".7"/><ellipse cx="${len/2 - 1}" cy="0" rx="2.5" ry="6" fill="${darken(col, .2)}"/></g>`;
}
function starAnise(c, x, y, rot, s = 1){
  let p = '';
  for(let i = 0; i < 8; i++) p += `<ellipse transform="rotate(${i * 45})" cy="-8" rx="3.2" ry="8" fill="${c.lin([[0, '#8a4a22'], [1, '#4a220e']])}"/><circle transform="rotate(${i * 45})" cy="-8" r="1.3" fill="#c28a52"/>`;
  return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)}) scale(${s})">${p}<circle r="2.6" fill="#3a1a0a"/></g>`;
}
function cardamom(c, x, y, rot){
  return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)})"><path d="M0-10C6-7 6 7 0 10-6 7-6-7 0-10Z" fill="${c.ball('#8aa556')}"/><path d="M0-9V9M-2.5-7C-3.5 0-3.5 0-2.5 7M2.5-7C3.5 0 3.5 0 2.5 7" stroke="#5c7432" stroke-width=".7" fill="none"/></g>`;
}
function leaf(c, x, y, rot, s = 1, col){
  col = col || c.pick(['#4f9a45', '#5da84e', '#3f8a3a']);
  return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)}) scale(${n1(s * 100) / 100})"><path d="M0 0C8-10 22-11 28 0 22 11 8 10 0 0Z" fill="${c.lin([[0, lighten(col, .2)], [1, darken(col, .2)]])}"/><path d="M0 0H26M8 0L12-4M14 0L18-4M10 0L14 4M16 0L20 4" stroke="${darken(col, .35)}" stroke-width=".9" fill="none"/></g>`;
}
function mintSprig(c, x, y, rot, s = 1){
  let g = `<path d="M0 0V-26" stroke="#3d6b2c" stroke-width="1.6"/>`;
  g += leaf(c, 0, -8, -150, .55) + leaf(c, 0, -8, -30, .55) + leaf(c, 0, -18, -140, .5) + leaf(c, 0, -18, -40, .5) + leaf(c, 0, -26, -90, .5);
  return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)}) scale(${s})">${g}</g>`;
}
function citrusWheel(c, x, y, r, kind, rot = 0){
  const P = { lemon: ['#f7d34f', '#fff6c2', '#e8b92a'], lime: ['#a8cf4a', '#effad0', '#6f9a26'], orange: ['#f7973a', '#ffe0b8', '#d8661a'], grapefruit: ['#f36d6d', '#ffd8d0', '#cc3f3f'], blood: ['#c4283e', '#ffc2c8', '#8a1024'] }[kind] || ['#f7d34f', '#fff6c2', '#e8b92a'];
  let seg = '';
  for(let i = 0; i < 10; i++){ const a = i / 10 * Math.PI * 2 + rot; seg += `<path d="M0 0L${n1(Math.cos(a) * r * .82)} ${n1(Math.sin(a) * r * .82)}" stroke="${P[1]}" stroke-width="${n1(r * .08)}"/>`; }
  return `<g transform="translate(${n1(x)} ${n1(y)})"><circle r="${r}" fill="${P[2]}"/><circle r="${n1(r * .9)}" fill="${P[1]}"/><circle r="${n1(r * .82)}" fill="${c.rad([[0, lighten(P[0], .3)], [1, P[0]]])}"/>${seg}<circle r="${n1(r * .1)}" fill="${P[1]}"/></g>`;
}
function berry(c, x, y, r, col){
  col = col || c.pick(['#b3123a', '#3b1f5c', '#8e1030', '#26164a']);
  return `<g transform="translate(${n1(x)} ${n1(y)})"><circle r="${r}" fill="${c.ball(col)}"/><circle cx="${n1(-r*.35)}" cy="${n1(-r*.35)}" r="${n1(r*.25)}" fill="#fff" opacity=".45"/></g>`;
}
function strawberry(c, x, y, s, rot = 0){
  let seeds = '';
  for(let i = 0; i < 12; i++){ const sx = c.rand(-9, 9), sy = c.rand(-4, 12); if(Math.abs(sx) < 11 - sy * .5) seeds += `<ellipse cx="${n1(sx)}" cy="${n1(sy)}" rx=".8" ry="1.3" fill="#ffe28a"/>`; }
  return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${rot}) scale(${s})"><path d="M0 20C-8 16-15 4-14-4-13-10-7-12 0-11 7-12 13-10 14-4 15 4 8 16 0 20Z" fill="${c.rad([[0, '#ff6b6b'], [.7, '#d61f35'], [1, '#8f0f22']], .4, .3, .8)}"/>${seeds}<path d="M0-11L-9-15-4-11-11-9-3-9 0-14 3-9 11-9 4-11 9-15Z" fill="#3f8a3a"/></g>`;
}
function cherry(c, x, y, s = 1){
  return `<g transform="translate(${n1(x)} ${n1(y)}) scale(${s})"><path d="M0-6C2-16 8-22 14-24" stroke="#4a6a20" stroke-width="1.6" fill="none"/><circle r="7" fill="${c.ball('#b0152f')}"/><circle cx="-2.4" cy="-2.6" r="2" fill="#fff" opacity=".6"/></g>`;
}
function sprinkles(c, n, x0, x1, y0, y1, cols){
  cols = cols || ['#f7c6d4', '#8ec5e6', '#f6e27a', '#a9d18e', '#fff', '#e66a8a'];
  let s = '';
  for(let i = 0; i < n; i++) s += `<rect x="${n1(c.rand(x0, x1))}" y="${n1(c.rand(y0, y1))}" width="5" height="1.8" rx=".9" fill="${c.pick(cols)}" transform="rotate(${c.int(0, 180)} ${n1(c.rand(x0, x1))} ${n1(c.rand(y0, y1))})"/>`;
  return s;
}
function dust(c, n, cx, cy, rad, col, op = .5, rmax = 1.3){
  let s = '';
  for(let i = 0; i < n; i++){
    const a = c.rand(0, Math.PI * 2), d = Math.sqrt(c.r()) * rad;
    s += `<circle cx="${n1(cx + Math.cos(a) * d)}" cy="${n1(cy + Math.sin(a) * d)}" r="${n1(c.rand(.4, rmax))}" fill="${col}" fill-opacity="${n1(c.rand(op * .4, op) * 100) / 100}"/>`;
  }
  return s;
}
function straw(c, x1, y1, x2, y2, w = 6){
  const col = c.pick(['#e8453c', '#2d6fb0', '#f2c94c', '#2a9d8f', '#f6eee1', '#1c1c1c', '#e07a9a']);
  const striped = c.chance(.6);
  const id = c.id();
  const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  if(striped) c.defs.push(`<pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(${n1(ang + 55)})"><rect width="8" height="8" fill="#fff"/><rect width="4" height="8" fill="${col === '#f6eee1' ? '#c9a05c' : col}"/></pattern>`);
  const fill = striped ? `url(#${id})` : col;
  return `<path d="M${n1(x1)} ${n1(y1)}L${n1(x2)} ${n1(y2)}" stroke="${fill}" stroke-width="${w}" stroke-linecap="round"/><path d="M${n1(x1)} ${n1(y1)}L${n1(x2)} ${n1(y2)}" stroke="#fff" stroke-opacity=".25" stroke-width="${n1(w * .3)}" stroke-linecap="round" transform="translate(-1 0)"/>`;
}
function spoon(c, x, y, rot, s = 1, col){
  col = col || c.pick(['#d9d6d0', '#dcb46c', '#c9c4bc']);
  return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)}) scale(${s})">${shadow(c, 3, 4, 34, 8, .35)}<rect x="0" y="-2.4" width="46" height="4.8" rx="2.4" fill="${c.lin([[0, lighten(col, .4)], [1, darken(col, .25)]])}"/><ellipse cx="-9" cy="0" rx="12" ry="8" fill="${c.rad([[0, lighten(col, .5)], [1, darken(col, .2)]], .6, .4, .7)}"/></g>`;
}
function sugarCube(c, x, y, rot, s = 1, col = '#fbf7ef'){
  return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)}) scale(${s})">${shadow(c, 2, 3, 11, 11, .35)}<rect x="-8" y="-8" width="16" height="16" rx="2.5" fill="${col}"/><path d="M-8 -3H8M-3 -8V8" stroke="#000" stroke-opacity=".05"/>${dust(c, 8, 0, 0, 7, '#e4dccb', .9, .9)}</g>`;
}
function wafer(c, x, y, rot, len = 60){
  return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)})"><rect x="0" y="-5" width="${len}" height="10" rx="4" fill="${c.hcyl('#d9a35a')}"/><path d="M6 -5V5M14 -5V5M22 -5V5M30 -5V5M38 -5V5M46 -5V5M54 -5V5" stroke="#a86f2c" stroke-width=".8" opacity=".6"/></g>`;
}

const TONES = {
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
function toneFill(c, t){ return c.rad([[0, t[0][0]], [.55, t[0][1]], [1, t[0][2]]], .45, .4, .62); }

function latteArt(c, kind, Rl, foam, cut){
  const k = Rl / 58;
  let g = '';
  if(kind === 'heart'){
    const layers = c.int(1, 4);
    for(let i = 0; i < layers; i++){
      const s = 1 - i * (layers > 2 ? .2 : .26);
      g += `<path transform="translate(0 ${i * 5}) scale(${n1(s * 100) / 100})" d="${HEART}" fill="${i % 2 ? cut : foam}"/>`;
    }
    if(c.chance(.7)) g += `<path d="M0-46V${c.int(30, 40)}" stroke="${cut}" stroke-width="2" stroke-linecap="round"/>`;
  } else if(kind === 'rosetta'){
    const n = c.int(6, 10), curve = c.rand(-.25, .25);
    for(let i = 0; i < n; i++){
      const t = i / (n - 1), cy = 40 - t * 72, rx = 46 - t * 32, ry = 10 - t * 4, dx = Math.sin(t * Math.PI) * curve * 20;
      g += `<ellipse cx="${n1(dx)}" cy="${n1(cy)}" rx="${n1(rx)}" ry="${n1(ry)}" fill="${foam}"/>`;
      g += `<ellipse cx="${n1(dx)}" cy="${n1(cy - ry * .55)}" rx="${n1(rx * .84)}" ry="${n1(ry * .72)}" fill="${cut}"/>`;
    }
    g += `<path transform="translate(0 -40) scale(.32)" d="${HEART}" fill="${foam}"/>`;
    g += `<path d="M0-46Q${n1(curve * 30)} 0 0 46" stroke="${cut}" stroke-width="2.2" stroke-linecap="round" fill="none"/>`;
  } else if(kind === 'tulip'){
    const n = c.int(3, 6);
    for(let i = 0; i < n; i++){
      const y = 30 - i * 14, rx = 30 - i * 3;
      g += `<ellipse cy="${y}" rx="${n1(rx)}" ry="13" fill="${foam}"/>`;
      g += `<ellipse cy="${y + 7}" rx="${n1(rx * .78)}" ry="9" fill="${cut}"/>`;
    }
    g += `<path transform="translate(0 ${30 - n * 14}) scale(.45)" d="${HEART}" fill="${foam}"/>`;
    g += `<path d="M0 ${36 - n * 14}V46" stroke="${cut}" stroke-width="2" stroke-linecap="round"/>`;
  } else if(kind === 'swan'){
    for(let i = 0; i < 6; i++){
      const t = i / 5, x = -12 - t * 10, y = 34 - t * 48, rx = 30 - t * 18;
      g += `<ellipse transform="rotate(${n1(-20 - t * 20)} ${n1(x)} ${n1(y)})" cx="${n1(x)}" cy="${n1(y)}" rx="${n1(rx)}" ry="${n1(8 - t * 3)}" fill="${foam}"/>`;
      g += `<ellipse transform="rotate(${n1(-20 - t * 20)} ${n1(x)} ${n1(y - 4)})" cx="${n1(x)}" cy="${n1(y - 4)}" rx="${n1(rx * .82)}" ry="${n1(6 - t * 2)}" fill="${cut}"/>`;
    }
    g += `<path d="M6 38C30 30 34 6 22-10 12-24 20-38 32-34" fill="none" stroke="${foam}" stroke-width="7" stroke-linecap="round"/>`;
    g += `<path transform="translate(33 -34) rotate(70) scale(.2)" d="${HEART}" fill="${foam}"/>`;
  } else if(kind === 'web'){
    [48, 38, 28, 18].forEach(rad => g += `<circle r="${rad}" fill="none" stroke="${foam}" stroke-width="4.4"/>`);
    g += `<circle r="7" fill="${foam}"/>`;
    const kk = c.int(6, 11), bend = c.rand(12, 30) * c.sign();
    for(let i = 0; i < kk; i++){
      const a = i / kk * Math.PI * 2, x = Math.cos(a) * 58, y = Math.sin(a) * 58;
      const qx = Math.cos(a) * 28 + Math.cos(a + Math.PI / 2) * bend * .4, qy = Math.sin(a) * 28 + Math.sin(a + Math.PI / 2) * bend * .4;
      g += `<path d="M0 0Q${n1(qx)} ${n1(qy)} ${n1(x)} ${n1(y)}" fill="none" stroke="${cut}" stroke-width="1.6"/>`;
    }
  } else if(kind === 'wing'){
    g += `<path d="M0-50C34-30 34 30 0 50-34 30-34-30 0-50Z" fill="${foam}"/>`;
    const n = c.int(7, 11);
    for(let i = 1; i < n; i++){
      const y = -44 + i * (88 / n), w = Math.sqrt(1 - Math.pow(y / 50, 2)) * 26;
      g += `<path d="M0 ${n1(y + 6)}Q${n1(w * .6)} ${n1(y - 2)} ${n1(w + 2)} ${n1(y - 8)}M0 ${n1(y + 6)}Q${n1(-w * .6)} ${n1(y - 2)} ${n1(-w - 2)} ${n1(y - 8)}" stroke="${cut}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    }
    g += `<path d="M0-50V52" stroke="${cut}" stroke-width="2.2" stroke-linecap="round"/>`;
  } else {
    g += `<path transform="scale(.9)" d="${HEART}" fill="${foam}"/><path transform="translate(0 4) scale(.55)" d="${HEART}" fill="${cut}"/><path transform="translate(0 7) scale(.3)" d="${HEART}" fill="${foam}"/>`;
  }
  let micro = '';
  for(let i = 0; i < 16; i++){ const a = c.rand(0, 6.28), d = c.rand(10, 55); micro += `<circle cx="${n1(Math.cos(a) * d)}" cy="${n1(Math.sin(a) * d)}" r="${n1(c.rand(.4, 1.2))}" fill="${foam}" fill-opacity=".45"/>`; }
  const ring = c.chance(.5) ? `<circle r="${n1(55)}" fill="none" stroke="${foam}" stroke-opacity=".35" stroke-width="2.5" stroke-dasharray="${c.int(4, 14)} ${c.int(3, 9)}"/>` : '';
  return `<g transform="scale(${n1(k * 100) / 100}) rotate(${c.int(-25, 25)}) scale(${n1(c.rand(.88, 1.04) * 100) / 100})">${ring}${micro}${g}</g>`;
}

function cupTop(c, o){
  const x = o.x != null ? o.x : CX, y = o.y != null ? o.y : CY, R = o.R || 60;
  const color = o.color || c.pick(PORCELAIN);
  const saucer = o.saucer !== false;
  const sR = o.sR || R * 1.36;
  const sColor = o.sColor || (c.chance(.65) ? color : c.pick(PORCELAIN));
  const gold = o.gold != null ? o.gold : c.chance(.35);
  const ha = o.ha != null ? o.ha : c.rand(-55, 55);
  let s = '';
  const cg = c.rad([[0, lighten(color, .38)], [.55, color], [1, darken(color, .28)]], .36, .3, .78);
  if(saucer){
    s += shadow(c, x + 8, y + 10, sR + 8, sR + 8, .6);
    if(o.square){
      const q = sR * .92;
      s += `<rect x="${n1(x - q)}" y="${n1(y - q)}" width="${n1(q * 2)}" height="${n1(q * 2)}" rx="${n1(q * .28)}" fill="${c.rad([[0, lighten(sColor, .3)], [.7, sColor], [1, darken(sColor, .25)]], .4, .35, .8)}"/>`;
      s += `<rect x="${n1(x - q + 7)}" y="${n1(y - q + 7)}" width="${n1(q * 2 - 14)}" height="${n1(q * 2 - 14)}" rx="${n1(q * .22)}" fill="none" stroke="${darken(sColor, .3)}" stroke-opacity=".3" stroke-width="1.5"/>`;
    } else {
      s += `<circle cx="${x}" cy="${y}" r="${n1(sR)}" fill="${c.rad([[0, lighten(sColor, .3)], [.7, sColor], [1, darken(sColor, .25)]], .4, .35, .75)}"/>`;
      s += `<circle cx="${x}" cy="${y}" r="${n1(sR * .76)}" fill="none" stroke="${darken(sColor, .3)}" stroke-opacity=".35" stroke-width="1.5"/>`;
      if(gold) s += `<circle cx="${x}" cy="${y}" r="${n1(sR - 2.5)}" fill="none" stroke="${GOLD}" stroke-width="1.4"/>`;
    }
    if(c.chance(.35)) s += `<circle cx="${x}" cy="${y}" r="${n1(sR * .88)}" fill="none" stroke="${c.pick([GOLD, '#2d5f9a', darken(sColor, .35)])}" stroke-opacity=".7" stroke-width="2.2" stroke-dasharray="1.5 5" stroke-linecap="round"/>`;
    if(o.onSaucer) s += o.onSaucer;
  } else {
    s += shadow(c, x + 6, y + 8, R + 12, R + 12, .6);
  }
  if(o.handle !== false) s += `<g transform="translate(${x} ${y}) rotate(${n1(ha)})"><rect x="${n1(R - 10)}" y="${n1(-R * .15)}" width="${n1(R * .5 + 10)}" height="${n1(R * .3)}" rx="${n1(R * .15)}" fill="${cg}"/>${R > 30 ? `<rect x="${n1(R + 3)}" y="-3.5" width="${n1(R * .5 - 10)}" height="7" rx="3.5" fill="${darken(color, .35)}" opacity=".4"/>` : ''}</g>`;
  s += `<circle cx="${x + 3}" cy="${y + 5}" r="${R}" fill="#000" opacity=".22"/>`;
  s += `<circle cx="${x}" cy="${y}" r="${R}" fill="${cg}"/>`;
  s += `<circle cx="${x}" cy="${y}" r="${n1(R * .9)}" fill="${c.rad([[0, darken(color, .35)], [.82, darken(color, .1)], [1, lighten(color, .15)]])}"/>`;
  const Rl = R * (o.fill || .8);
  const clip = c.clip(`<circle cx="${x}" cy="${y}" r="${n1(Rl)}"/>`);
  s += `<circle cx="${x}" cy="${y}" r="${n1(Rl)}" fill="${o.liquid}"/>`;
  if(o.inner) s += `<g clip-path="${clip}"><g transform="translate(${x} ${y})"><g class="az-spin">${`<circle r="${n1(Rl)}" fill="none"/>`}${o.inner}</g></g></g>`;
  s += `<circle cx="${x}" cy="${y}" r="${n1(Rl)}" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="2.5"/>`;
  if(gold) s += `<circle cx="${x}" cy="${y}" r="${n1(R - 1.3)}" fill="none" stroke="${GOLD}" stroke-width="1.6"/>`;
  s += `<path d="${arc(x, y, R * .95, 195, 250)}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="2.2" stroke-linecap="round"/>`;
  s += `<path class="az-glint" d="${arc(x, y, Rl * .82, 200, 235)}" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="3" stroke-linecap="round"/>`;
  return s;
}

function glassTop(c, o){
  const x = o.x != null ? o.x : CX, y = o.y != null ? o.y : CY, R = o.R || 60;
  let s = '';
  if(o.coaster !== false){
    const cc = o.coasterColor || c.pick(['#b8875a', '#2b2b2b', '#e8dcc4', '#6d3b2a', '#2d5f9a', '#9a6a3a']);
    const cr = R * 1.3;
    s += shadow(c, x + 6, y + 8, cr + 6, cr + 6, .5);
    s += `<circle cx="${x}" cy="${y}" r="${n1(cr)}" fill="${c.rad([[0, lighten(cc, .15)], [1, darken(cc, .2)]])}"/>`;
    s += `<circle cx="${x}" cy="${y}" r="${n1(cr - 5)}" fill="none" stroke="${lighten(cc, .35)}" stroke-opacity=".5" stroke-dasharray="2 3"/>`;
  }
  s += `<circle cx="${x + 5}" cy="${y + 7}" r="${R}" fill="#000" opacity=".3"/>`;
  const Rl = R * .88;
  s += `<circle cx="${x}" cy="${y}" r="${R}" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.55)" stroke-width="2.4"/>`;
  s += `<circle cx="${x}" cy="${y}" r="${n1(Rl)}" fill="${o.liquid}"/>`;
  const clip = c.clip(`<circle cx="${x}" cy="${y}" r="${n1(Rl)}"/>`);
  if(o.inner) s += `<g clip-path="${clip}"><g transform="translate(${x} ${y})"><g class="az-spin"><circle r="${n1(Rl)}" fill="none"/>${o.inner}</g></g></g>`;
  s += `<circle cx="${x}" cy="${y}" r="${n1(Rl)}" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="4"/>`;
  s += `<path d="${arc(x, y, R * .93, 190, 255)}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/>`;
  s += `<path class="az-glint" d="${arc(x, y, R * .7, 205, 240)}" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="5" stroke-linecap="round"/>`;
  return s;
}



function biscotti(c, x, y, rot){
  let g = shadow(c, 3, 5, 22, 10, .4) + `<path d="M-20-7Q-20-10-14-10H16Q21-10 21-4V5Q21 9 16 9H-14Q-20 9-20 5Z" fill="${c.rad([[0, '#f0c47e'], [1, '#c98a3e']], .4, .35, .8)}"/>`;
  for(let i = 0; i < 4; i++) g += `<ellipse cx="${n1(c.rand(-14, 14))}" cy="${n1(c.rand(-5, 4))}" rx="3" ry="2" fill="#f6e2b8" stroke="#b8823e" stroke-width=".6"/>`;
  return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)})">${g}</g>`;
}
function whiskTop(c, x, y, rot){
  let g = `<rect x="0" y="-5" width="54" height="10" rx="5" fill="${c.lin([[0, '#e9d8a6'], [1, '#b89a5a']])}"/>`;
  g += `<circle r="20" fill="#e9d8a6" opacity=".35"/>`;
  for(let i = 0; i < 40; i++){ const a = i / 40 * Math.PI * 2; g += `<path d="M${n1(Math.cos(a) * 6)} ${n1(Math.sin(a) * 6)}L${n1(Math.cos(a) * 19)} ${n1(Math.sin(a) * 19)}" stroke="#d9c38a" stroke-width=".9"/>`; }
  g += `<circle r="6" fill="#c7ad6a"/>`;
  return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)})">${shadow(c, 3, 4, 30, 24, .35)}${g}</g>`;
}
function spiceRing(c, n, r0, r1){
  let s = '';
  for(let i = 0; i < n; i++){
    const a = c.rand(0, Math.PI * 2), d = c.rand(r0, r1), x = CX + Math.cos(a) * d, y = CY + Math.sin(a) * d;
    if(x < 12 || x > 188 || y < 24 || y > 228) continue;
    const k = c.int(0, 2);
    s += k === 0 ? starAnise(c, x, y, c.rand(0, 90), .8) : k === 1 ? cardamom(c, x, y, c.rand(0, 360)) : cinnamonStick(c, x, y, c.rand(0, 180), 40);
  }
  return s;
}

function latteStyle(kind, tone, extra){
  return c => {
    const t = TONES[tone] || TONES.coffee;
    const foam = t[1], cut = t[0][1];
    const k = kind === 'random' ? c.pick(['heart', 'rosetta', 'tulip', 'swan', 'web', 'wing', 'nested']) : kind;
    let bg = backdrop(c);
    let around = extra ? extra(c) : (c.chance(.6) ? beansAround(c, c.int(2, 6)) : '');
    return bg + around + cupTop(c, { liquid: toneFill(c, t), inner: latteArt(c, k, 58 * .82 * (60 / 58), foam, cut), R: c.rand(56, 62) });
  };
}

const S = {};
const G = {};
function def(key, group, label, fn){ S[key] = { group, label, fn }; (G[group] = G[group] || []).push(key); }

def('espresso', 'قهوه گرم', 'اسپرسو (فنجان کوچک از بالا)', c => {
  let s = backdrop(c);
  const cup = c.pick(PORCELAIN);
  const inner = (() => {
    let m = '';
    for(let i = 0; i < 38; i++){
      const a = c.rand(0, 6.28), d = Math.sqrt(c.r()) * 34;
      m += `<ellipse transform="rotate(${c.int(0, 180)} ${n1(Math.cos(a) * d)} ${n1(Math.sin(a) * d)})" cx="${n1(Math.cos(a) * d)}" cy="${n1(Math.sin(a) * d)}" rx="${n1(c.rand(1, 4))}" ry="${n1(c.rand(.6, 1.8))}" fill="${c.pick(['#6a3614', '#f0c48c', '#8a4a1c', '#e2a868'])}" fill-opacity="${n1(c.rand(.25, .6) * 100) / 100}"/>`;
    }
    m += `<path d="${spiral(c.rand(.8, 1.6), 4, 30)}" fill="none" stroke="#f3d09c" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>`;
    return m;
  })();
  const ha = c.rand(-40, 40);
  let onS = '';
  const sp = c.rand(0, 1);
  const sa = (ha + 180 + c.rand(-40, 40)) * Math.PI / 180;
  if(sp < .4) onS += spoon(c, CX + Math.cos(sa) * 58, CY + Math.sin(sa) * 58, sa * 180 / Math.PI + 180 - 60, .7);
  else if(sp < .7) onS += sugarCube(c, CX + Math.cos(sa) * 56, CY + Math.sin(sa) * 56, c.rand(0, 90), .8);
  else onS += bean(c, CX + Math.cos(sa) * 58, CY + Math.sin(sa) * 58, c.rand(0, 360), 1) + bean(c, CX + Math.cos(sa + .3) * 60, CY + Math.sin(sa + .3) * 60, c.rand(0, 360), .9);
  s += cupTop(c, { R: 42, sR: 74, color: cup, ha, liquid: c.rad([[0, '#e8ad6e'], [.5, '#a5642f'], [1, '#4a220c']], .48, .42, .6), inner, onSaucer: onS, fill: .78 });
  s += beansAround(c, c.int(0, 4), 92, 106);
  return s;
});

def('espresso-side', 'قهوه گرم', 'فنجان اسپرسو از کنار', c => {
  let s = backdrop(c) + floor(c);
  const col = c.pick(PORCELAIN), sc = c.chance(.6) ? col : c.pick(PORCELAIN);
  const w = c.rand(36, 44), top = c.rand(118, 128), bot = 188;
  s += shadow(c, CX + 4, 198, 72, 12, .55);
  s += `<ellipse cx="${CX}" cy="192" rx="64" ry="12" fill="${c.hcyl(sc)}"/><ellipse cx="${CX}" cy="189" rx="54" ry="8" fill="${darken(sc, .12)}"/>`;
  s += `<path d="M${CX + w - 2} ${top + 12}c22-6 28 22 4 32" fill="none" stroke="${c.hcyl(col)}" stroke-width="7" stroke-linecap="round"/>`;
  s += `<path d="M${CX - w} ${top}H${CX + w}C${CX + w} ${bot - 20} ${CX + w * .6} ${bot} ${CX} ${bot}S${CX - w} ${bot - 20} ${CX - w} ${top}Z" fill="${c.hcyl(col)}"/>`;
  const deco = c.int(0, 3);
  if(deco === 1) s += `<path d="M${CX - w + 1} ${top + 14}H${CX + w - 1}" stroke="${GOLD}" stroke-width="2.5"/>`;
  if(deco === 2){ for(let i = 0; i < 7; i++) s += `<circle cx="${n1(CX - w * .8 + i * w * .27)}" cy="${top + 22}" r="2" fill="${c.pick(['#2d5f9a', GOLD, '#b8613b'])}"/>`; }
  if(deco === 3) s += `<path d="M${CX - w + 3} ${top + 26}Q${CX} ${top + 14} ${CX + w - 3} ${top + 26}" stroke="#2d5f9a" stroke-width="3" fill="none"/>`;
  s += `<ellipse cx="${CX}" cy="${top}" rx="${n1(w)}" ry="9" fill="${lighten(col, .2)}"/>`;
  s += `<ellipse cx="${CX}" cy="${top + 1}" rx="${n1(w - 4)}" ry="6.5" fill="${c.rad([[0, '#e2a868'], [.6, '#a5642f'], [1, '#5a2c10']])}"/>`;
  s += steam(c, CX, top - 10, 3, 12);
  s += beansAround(c, c.int(1, 4), 70, 90, CX, 200);
  return s;
});

def('americano', 'قهوه گرم', 'آمریکانو (ماگ بزرگ)', c => {
  let s = backdrop(c);
  let inner = `<circle r="44" fill="none" stroke="#b77a41" stroke-opacity=".55" stroke-width="4"/>`;
  for(let i = 0; i < 8; i++){ const a = c.rand(0, 6.28), d = c.rand(20, 40); inner += `<ellipse cx="${n1(Math.cos(a) * d)}" cy="${n1(Math.sin(a) * d)}" rx="${n1(c.rand(3, 9))}" ry="${n1(c.rand(1.5, 4))}" fill="#b98050" fill-opacity=".3"/>`; }
  inner += `<rect x="-26" y="-34" width="${c.int(14, 22)}" height="30" rx="4" fill="#fff" fill-opacity=".09" transform="rotate(${c.int(-30, 30)})"/>`;
  let side = '';
  if(c.chance(.5)){
    const gx = c.pick([40, 160]), gy = 210;
    side += glassTop(c, { x: gx, y: gy, R: 20, coaster: false, liquid: 'rgba(170,210,235,.35)', inner: '' });
  }
  s += side + cupTop(c, { R: 64, saucer: c.chance(.45), liquid: c.rad([[0, '#5f361b'], [.6, '#2e170a'], [1, '#120602']], .45, .4, .6), inner });
  s += beansAround(c, c.int(2, 5), 92, 108);
  return s;
});

def('latte-rosetta', 'قهوه گرم', 'لاته آرت روزتا', latteStyle('rosetta', 'coffee'));
def('latte-tulip', 'قهوه گرم', 'لاته در لیوان شیشه‌ای', c => {
  let s = backdrop(c);
  const t = TONES.coffee2;
  s += glassTop(c, { R: 58, liquid: toneFill(c, t), inner: `<circle r="50" fill="none" stroke="#f7ecd9" stroke-opacity=".35" stroke-width="6"/>` + latteArt(c, c.pick(['tulip', 'rosetta']), 44, t[1], t[0][1]) });
  const side = c.pick([-1, 1]);
  s += spoon(c, CX + side * 70, CY + 88, side > 0 ? 200 : -20, .75) + sugarCube(c, CX - side * 72, CY - 84, c.rand(0, 40), .8);
  return s;
});
def('latte-heart', 'قهوه گرم', 'لاته قلب با بیسکوتی', c => {
  let s = backdrop(c);
  const t = TONES[c.pick(['coffee', 'coffee2'])];
  const ha = c.rand(-40, 40);
  const sa = (ha + 180 + c.rand(-35, 35)) * Math.PI / 180;
  const onS = biscotti(c, CX + Math.cos(sa) * 66, CY + Math.sin(sa) * 66, sa * 180 / Math.PI + 90);
  s += cupTop(c, { R: 56, sR: 84, ha, liquid: toneFill(c, t), inner: latteArt(c, c.pick(['heart', 'nested']), 45, t[1], t[0][1]), onSaucer: onS });
  return s;
});
def('latte-swan', 'قهوه گرم', 'لاته آرت قو', latteStyle('swan', 'coffee2'));
def('latte-web', 'قهوه گرم', 'لاته آرت حلقه‌ای', latteStyle('web', 'coffee'));
def('latte-wing', 'قهوه گرم', 'لاته آرت پَر', latteStyle('wing', 'coffee2'));

def('flatwhite', 'قهوه گرم', 'فلت وایت (فنجان کوچک، بشقاب مربعی)', c => {
  let s = backdrop(c);
  const t = TONES.dark;
  const ha = c.pick([-35, 35, 145, 215]) + c.rand(-8, 8);
  const sa = (ha + 180) * Math.PI / 180;
  const onS = sugarCube(c, CX + Math.cos(sa + .5) * 58, CY + Math.sin(sa + .5) * 58, c.rand(0, 40), .65) + spoon(c, CX + Math.cos(sa - .5) * 62, CY + Math.sin(sa - .5) * 62, (sa - .5) * 180 / Math.PI + 90, .6);
  s += cupTop(c, { R: 46, sR: 82, square: true, ha, fill: .78, liquid: toneFill(c, t), inner: latteArt(c, c.pick(['rosetta', 'tulip', 'wing']), 36, t[1], t[0][1]), onSaucer: onS });
  return s;
});
def('cappuccino', 'قهوه گرم', 'کاپوچینو با پودر کاکائو', c => {
  let s = backdrop(c);
  const cocoa = c.pick(['#6b3a1f', '#4e2a15', '#7a4a2a']);
  const stencil = c.pick(['star', 'heart', 'paisley', 'crescent', 'leaf', 'flower']);
  let sh = '';
  if(stencil === 'star') sh = `<path d="${starPath(8, 26, 13)}"/>`;
  if(stencil === 'heart') sh = `<path transform="scale(.75)" d="${HEART}"/>`;
  if(stencil === 'paisley') sh = `<path transform="scale(1.1) rotate(${c.int(-40, 40)})" d="M0-30C20-30 30-5 20 15 10 32-20 34-24 12-26 0-14-8-4-4 4 0 4-12-4-16-10-20-6-30 0-30Z"/>`;
  if(stencil === 'crescent') sh = `<path d="M8-26A26 26 0 1 0 8 26 20 20 0 1 1 8-26Z"/><path transform="translate(14 -2)" d="${starPath(5, 8, 3.5)}"/>`;
  if(stencil === 'leaf') sh = `<path d="M0-30C18-18 18 18 0 30-18 18-18-18 0-30Z"/><path d="M0-28V30" stroke="#f3e6d2" stroke-width="2"/>`;
  if(stencil === 'flower'){ for(let i = 0; i < 6; i++) sh += `<ellipse transform="rotate(${i * 60})" cy="-15" rx="7" ry="13"/>`; sh += `<circle r="6" fill="#f3e6d2"/>`; }
  let inner = `<g fill="${cocoa}" fill-opacity=".55">${sh}</g>` + dust(c, 70, 0, 0, 44, cocoa, .6, 1.2);
  inner += `<circle r="46" fill="none" stroke="${cocoa}" stroke-opacity=".3" stroke-width="6"/>`;
  s += cupTop(c, { R: 60, liquid: c.rad([[0, '#fbf3e6'], [.7, '#ead8bd'], [1, '#b0804f']], .45, .42, .6), inner });
  s += beansAround(c, c.int(0, 3), 92, 106);
  return s;
});

function sideGlass(c, shape, o = {}){
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
function drawGlass(c, shape, layers, o = {}){
  const { g, p } = sideGlass(c, shape);
  let s = shadow(c, CX + 4, g.bot + 2, g.bw + 26, 9, .6);
  if(shape === 'mug' || shape === 'jar') s += `<path d="M${CX + g.tw - 1} ${g.top + 24}c${shape === 'jar' ? 20 : 26}-2 ${shape === 'jar' ? 22 : 28} 50 0 56" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="8"/><path d="M${CX + g.tw - 1} ${g.top + 24}c${shape === 'jar' ? 20 : 26}-2 ${shape === 'jar' ? 22 : 28} 50 0 56" fill="none" stroke="rgba(255,255,255,.2)" stroke-width="3" transform="translate(2 0)"/>`;
  const clip = c.clip(`<path d="${p}"/>`);
  const lTop = o.level != null ? o.level : g.top + 14;
  s += `<g clip-path="${clip}">${layers(g, lTop)}</g>`;
  s += `<path d="${p}" fill="${c.glass()}" stroke="rgba(255,255,255,.55)" stroke-width="2"/>`;
  s += `<path d="M${CX - g.bw + 4} ${g.bot - 3}H${CX + g.bw - 4}" stroke="rgba(255,255,255,.35)" stroke-width="${shape === 'rocks' || shape === 'gibraltar' ? 7 : 4}" stroke-linecap="round"/>`;
  s += `<path d="M${CX - g.tw + 7} ${g.top + 10}L${CX - g.bw + 7} ${g.bot - 16}" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>`;
  s += `<ellipse cx="${CX}" cy="${g.top}" rx="${g.tw}" ry="4" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.6"/>`;
  if(shape === 'jar'){ for(let i = 1; i <= 2; i++) s += `<path d="M${CX - g.tw} ${g.top + i * 5}Q${CX} ${g.top + i * 5 + 4} ${CX + g.tw} ${g.top + i * 5}" stroke="rgba(255,255,255,.45)" fill="none"/>`; }
  if(o.drops){ for(let i = 0; i < o.drops; i++){ const yy = c.rand(g.top + 20, g.bot - 10), xx = CX + c.rand(-g.bw + 4, g.bw - 4); s += `<ellipse cx="${n1(xx)}" cy="${n1(yy)}" rx="1.3" ry="2" fill="#fff" fill-opacity=".45"/>`; } }
  return { s, g };
}
function ice(c, n, x0, x1, y0, y1){
  let s = '';
  for(let i = 0; i < n; i++){
    const x = c.rand(x0, x1), y = c.rand(y0, y1), sz = c.rand(14, 22);
    s += `<rect class="az-drift" style="animation-delay:-${n1(c.rand(0, 6))}s" x="${n1(x - sz / 2)}" y="${n1(y - sz / 2)}" width="${n1(sz)}" height="${n1(sz)}" rx="4" transform="rotate(${c.int(-30, 30)} ${n1(x)} ${n1(y)})" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.6)" stroke-width="1.2"/>`;
  }
  return s;
}

def('cortado', 'قهوه گرم', 'کورتادو (لیوان کوتاه)', c => {
  let s = backdrop(c) + floor(c);
  const r = drawGlass(c, 'gibraltar', (g, lt) => {
    return `<rect x="0" y="${lt}" width="200" height="120" fill="${c.lin([[0, '#f7ecd9'], [.18, '#e7caa0'], [.5, '#b77d4a'], [.8, '#7a4520'], [1, '#4a260f']])}"/><ellipse cx="${CX}" cy="${lt}" rx="${g.tw}" ry="4" fill="#fbf3e4"/>`;
  }, { level: 124 });
  s += r.s;
  s += c.chance(.6) ? spoon(c, CX + c.pick([-58, 58]), 214, c.pick([10, 170, -10]), .7) : sugarCube(c, CX + c.pick([-56, 56]), 206, c.rand(0, 90), .8);
  s += beansAround(c, c.int(0, 3), 70, 90, CX, 210);
  return s;
});

def('caramel', 'قهوه گرم', 'کارامل ماکیاتو', c => {
  let s = backdrop(c);
  const cc = c.pick(['#c97a2b', '#b8661f', '#d88c32']);
  let inner = latteArt(c, c.pick(['rosetta', 'tulip', 'heart']), 46, '#fffaf0', '#d9a86a');
  const rot = c.int(0, 180), n = c.int(3, 4);
  let dr = '';
  for(let k = 0; k < n; k++){
    const y = -36 + k * (72 / (n - 1)) + c.rand(-4, 4), a = c.rand(6, 11);
    const d = `M-62 ${n1(y)}C-40 ${n1(y - a)} -20 ${n1(y + a)} 0 ${n1(y)}S40 ${n1(y - a)} 62 ${n1(y)}`;
    dr += `<path d="${d}" stroke="${darken(cc, .2)}" stroke-width="3.6" fill="none" stroke-linecap="round" opacity=".35" transform="translate(1 1.5)"/><path d="${d}" stroke="${cc}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#ffd9a0" stroke-width=".9" fill="none" stroke-linecap="round" opacity=".8" transform="translate(-.6 -.8)"/>`;
  }
  inner += `<g transform="rotate(${rot})">${dr}</g>`;
  const ha = c.rand(-40, 40);
  const sa = (ha + 180 + c.rand(-30, 30)) * Math.PI / 180;
  const onS = `<g transform="translate(${n1(CX + Math.cos(sa) * 64)} ${n1(CY + Math.sin(sa) * 64)})"><circle r="11" fill="#fbf6ef"/><circle r="8" fill="${c.rad([[0, lighten(cc, .3)], [1, darken(cc, .2)]])}"/></g>`;
  s += cupTop(c, { R: 58, ha, liquid: c.rad([[0, '#fdf7ec'], [.7, '#f1e2c8'], [1, '#c9955c']], .45, .42, .6), inner, onSaucer: onS });
  return s;
});
def('mocha', 'قهوه گرم', 'موکا (ماگ شیشه‌ای)', c => {
  let s = backdrop(c) + floor(c);
  const shape = c.pick(['mug', 'tumbler']);
  const r = drawGlass(c, shape, (g, lt) => {
    let l = `<rect x="0" y="${lt}" width="200" height="200" fill="${c.lin([[0, '#fbf3e6'], [.14, '#f0dcc0'], [.2, '#9a6a45'], [.55, '#6a3c22'], [1, '#2c140a']])}"/>`;
    for(let i = 0; i < 6; i++){ const x = CX - g.tw + 6 + i * (g.tw * 2 - 12) / 5; l += `<path d="M${n1(x)} ${lt}q${c.int(-6, 6)} 30 ${c.int(-3, 3)} ${c.int(40, 90)}" stroke="#3a1a0a" stroke-width="${n1(c.rand(2, 4))}" fill="none" stroke-linecap="round" opacity=".75"/>`; }
    return l;
  }, { level: shape === 'mug' ? 92 : 112 });
  s += r.s;
  const top = r.g.top;
  const cream = `M${CX - r.g.tw + 2} ${top}C${CX - r.g.tw + 2} ${top - 16} ${CX - 16} ${top - 18} ${CX - 10} ${top - 28}C${CX - 4} ${top - 38} ${CX + 6} ${top - 38} ${CX + 10} ${top - 28}C${CX + 16} ${top - 18} ${CX + r.g.tw - 2} ${top - 16} ${CX + r.g.tw - 2} ${top}Z`;
  s += `<path d="${cream}" fill="${c.rad([[0, '#ffffff'], [1, '#e8dccb']], .4, .3, .8)}"/>`;
  s += `<path d="M${CX - 22} ${top - 12}L${CX - 12} ${top - 24}L${CX - 2} ${top - 10}L${CX + 8} ${top - 26}L${CX + 20} ${top - 10}" stroke="#3a1a0a" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += dust(c, 26, CX, top - 16, 18, '#4a2412', .7, 1.2);
  s += beansAround(c, c.int(0, 3), 76, 92, CX, 214);
  return s;
});

def('affogato', 'قهوه گرم', 'آفوگاتو (بستنی و اسپرسو)', c => {
  let s = backdrop(c) + floor(c);
  const bowl = `M${CX - 50} 134C${CX - 50} 176 ${CX - 26} 190 ${CX} 190S${CX + 50} 176 ${CX + 50} 134Z`;
  s += shadow(c, CX + 4, 204, 60, 9, .6);
  s += `<path d="M${CX - 8} 188h16l6 14h-28z" fill="rgba(255,255,255,.25)" stroke="rgba(255,255,255,.5)"/>`;
  const clip = c.clip(`<path d="${bowl}"/>`);
  s += `<g clip-path="${clip}"><rect x="0" y="160" width="200" height="40" fill="${c.lin([[0, '#8a4e22'], [1, '#3a1a08']])}"/></g>`;
  const ic = c.pick(['#fbf2df', '#f6e7b8', '#fff6ea']);
  s += `<path d="${blob(c, CX, 138, 34, 11, .1)}" fill="${c.rad([[0, '#ffffff'], [.6, ic], [1, darken(ic, .15)]], .4, .3, .8)}"/>`;
  s += `<path d="M${CX + 4} 106C${CX + 10} 116 ${CX + 24} 122 ${CX + 28} 136C${CX + 32} 150 ${CX + 30} 160 ${CX + 32} 170" stroke="${c.lin([[0, '#8a4a1a'], [1, '#4a220a']])}" stroke-width="9" fill="none" stroke-linecap="round" opacity=".95"/><path d="M${CX + 6} 110C${CX + 12} 118 ${CX + 22} 124 ${CX + 25} 134" stroke="#c98a4a" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/>`;
  s += `<path d="${blob(c, CX - 10, 128, 10, 8, .2)}" fill="#fff" opacity=".35"/>`;
  s += `<path d="${bowl}" fill="${c.glass()}" stroke="rgba(255,255,255,.55)" stroke-width="2"/><ellipse cx="${CX}" cy="134" rx="50" ry="6" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.6"/>`;
  s += `<g transform="translate(${CX + 44} 70) rotate(${c.int(30, 45)})"><path d="M-12-16H12L14 10Q14 18 6 18H-6Q-14 18-14 10Z" fill="${c.hcyl(c.pick(['#d9d6d0', '#f3ece1', '#2d5f9a']))}"/><path d="M-14-16L-22-20" stroke="#bbb" stroke-width="3"/></g>`;
  s += `<path d="M${CX + 30} 84Q${CX + 14} 96 ${CX + 6} 112" stroke="#5a2c10" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  if(c.chance(.7)) s += wafer(c, CX - 40, 116, -60, 48);
  s += beansAround(c, c.int(1, 3), 64, 84, CX, 212);
  return s;
});

def('filter', 'قهوه گرم', 'قهوه دمی (کمکس)', c => {
  let s = backdrop(c) + floor(c);
  const wood = c.pick(['#8a5a34', '#6b4125', '#a8743f']);
  const flask = `M${CX - 14} 56L${CX - 44} 104Q${CX - 58} 128 ${CX - 50} 164Q${CX - 44} 198 ${CX} 198Q${CX + 44} 198 ${CX + 50} 164Q${CX + 58} 128 ${CX + 44} 104L${CX + 14} 56Z`;
  s += shadow(c, CX + 4, 202, 64, 9, .6);
  const clip = c.clip(`<path d="${flask}"/>`);
  s += `<g clip-path="${clip}"><rect y="${c.int(142, 158)}" width="200" height="80" fill="${c.lin([[0, '#6a3614'], [1, '#2a1206']])}"/><path d="M${CX - 30} 56L${CX} 104L${CX + 30} 56Z" fill="#f7f1e6" opacity=".85"/></g>`;
  s += `<path d="${flask}" fill="${c.glass()}" stroke="rgba(255,255,255,.55)" stroke-width="2"/>`;
  s += `<path d="M${CX - 28} 94Q${CX} 112 ${CX + 28} 94L${CX + 22} 124Q${CX} 132 ${CX - 22} 124Z" fill="${c.hcyl(wood)}"/>`;
  s += `<path d="M${CX} 116c-6 8-2 18 4 26M${CX} 116c6 8 10 16 4 28" stroke="#4a2a14" stroke-width="2" fill="none"/><circle cx="${CX}" cy="116" r="3.5" fill="${darken(wood, .3)}"/>`;
  s += steam(c, CX, 50, 2, 12, .7);
  if(c.chance(.7)) s += cupTop(c, { x: c.pick([34, 166]), y: 212, R: 18, saucer: false, liquid: '#2e170a', gold: false });
  return s;
});

def('hot-chocolate', 'نوشیدنی گرم', 'هات چاکلت با مارشمالو', c => {
  let s = backdrop(c);
  let inner = '';
  const n = c.int(5, 9);
  for(let i = 0; i < n; i++){
    const a = c.rand(0, 6.28), d = c.rand(4, 34), x = Math.cos(a) * d, y = Math.sin(a) * d, col = c.pick(['#fbf6ef', '#f7c6d4', '#fbf6ef', '#fde2b8']), sz = c.rand(10, 15);
    inner += `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${c.int(0, 90)})"><rect x="${n1(-sz / 2 + 2)}" y="${n1(-sz / 2 + 2)}" width="${n1(sz)}" height="${n1(sz)}" rx="4" fill="#000" opacity=".25"/><rect x="${n1(-sz / 2)}" y="${n1(-sz / 2)}" width="${n1(sz)}" height="${n1(sz)}" rx="4" fill="${c.rad([[0, '#fff'], [1, col]], .35, .3, .8)}"/></g>`;
  }
  inner += dust(c, 40, 0, 0, 46, '#3a1a0a', .6);
  s += cupTop(c, { R: 62, liquid: c.rad([[0, '#8a5234'], [.6, '#5a2e1a'], [1, '#2a110a']], .45, .42, .6), inner });
  if(c.chance(.6)) s += cinnamonStick(c, c.pick([40, 160]), c.pick([44, 208]), c.rand(0, 180), 60);
  return s;
});

def('pink-chocolate', 'نوشیدنی گرم', 'پینک چاکلت', c => {
  let s = backdrop(c, c.pick(['#4b1628', '#3a1d2e', '#1c3a5e', '#1f4e8c']));
  const t = TONES.pink;
  const ha = c.rand(-40, 40);
  const sa = (ha + 180 + c.rand(-30, 30)) * Math.PI / 180;
  const onS = `<g transform="translate(${n1(CX + Math.cos(sa) * 64)} ${n1(CY + Math.sin(sa) * 64)}) rotate(${c.int(0, 90)})"><rect x="-8" y="-8" width="16" height="16" rx="5" fill="#fff"/><rect x="-5" y="-5" width="10" height="10" rx="3" fill="#f7c6d4"/></g>`;
  s += cupTop(c, { R: 56, ha, color: c.pick(['#f3ece1', '#f7d7de', '#fbf6ef', '#2d5f9a']), liquid: toneFill(c, t), inner: latteArt(c, c.pick(['heart', 'nested']), 45, t[1], t[0][1]) + sprinkles(c, 26, -40, 40, -40, 40), onSaucer: onS });
  return s;
});
def('matcha', 'نوشیدنی گرم', 'ماچا لاته در کاسه', c => {
  let s = backdrop(c, c.pick(['#243b2f', '#27361c', '#0e3b3b', '#1b4470', '#5a6b3a']));
  const t = TONES.matcha;
  let mat = '';
  const mc = c.pick(['#c9b27a', '#b89a5a', '#d9c48f']);
  mat += `<rect x="18" y="30" width="164" height="190" rx="6" fill="${mc}"/>`;
  for(let y = 36; y < 220; y += 6) mat += `<path d="M18 ${y}H182" stroke="${darken(mc, .25)}" stroke-width="1"/>`;
  mat += `<path d="M18 30V220M182 30V220" stroke="${darken(mc, .4)}" stroke-width="3"/>`;
  s += `<g transform="rotate(${c.int(-8, 8)} 100 124)">${shadow(c, 104, 130, 90, 100, .4)}${mat}</g>`;
  s += cupTop(c, { R: 62, saucer: false, handle: false, color: c.pick(['#5a4a3a', '#2b2b2b', '#d9cdb4', '#6b7a5a', '#3a4a6a']), gold: false, fill: .84, liquid: toneFill(c, t), inner: latteArt(c, c.pick(['rosetta', 'heart', 'swan', 'tulip']), 50, t[1], t[0][1]) });
  const wa = c.pick([35, 145]);
  s += whiskTop(c, CX + Math.cos(wa * Math.PI / 180) * 70, CY + Math.sin(wa * Math.PI / 180) * 80, wa + 20);
  s += `<g transform="translate(${CX - Math.cos(wa * Math.PI / 180) * 64} ${CY - Math.sin(wa * Math.PI / 180) * 78})"><ellipse rx="14" ry="10" fill="${c.rad([[0, '#b7d67a'], [1, '#6e9a3f']])}"/></g>`;
  return s;
});
def('masala', 'نوشیدنی گرم', 'ماسالا (چای ادویه‌ای)', c => {
  let s = backdrop(c, c.pick(['#5a3a12', '#3e1f15', '#402b1e', '#a4552f', '#1f4e8c']));
  const t = TONES.chai;
  const inner = latteArt(c, c.pick(['heart', 'web']), 46, t[1], t[0][1]) + dust(c, 50, 0, 0, 44, '#7a3c14', .7) + starAnise(c, c.rand(-14, 14), c.rand(-14, 14), c.rand(0, 90), 1.1);
  s += cupTop(c, { R: 56, color: c.pick(['#b8613b', '#f3ece1', '#2d5f9a', '#efe0c2']), liquid: toneFill(c, t), inner });
  s += spiceRing(c, 6, 92, 106);
  return s;
});
def('sesame-date', 'نوشیدنی گرم', 'کنجد و خرما', c => {
  let s = backdrop(c, c.pick(['#3e1f15', '#5a3a12', '#402b1e']));
  const t = TONES.chai;
  let inner = latteArt(c, c.pick(['tulip', 'heart', 'swan']), 49, t[1], t[0][1]);
  for(let i = 0; i < 40; i++){ const a = c.rand(0, 6.28), d = c.rand(0, 44); inner += `<ellipse cx="${n1(Math.cos(a) * d)}" cy="${n1(Math.sin(a) * d)}" rx="1.1" ry="2" fill="#fff4dc" transform="rotate(${c.int(0, 180)} ${n1(Math.cos(a) * d)} ${n1(Math.sin(a) * d)})"/>`; }
  s += cupTop(c, { R: 58, liquid: toneFill(c, t), inner });
  for(let i = 0; i < c.int(2, 4); i++){
    const a = c.rand(0, 6.28), x = CX + Math.cos(a) * 94, y = CY + Math.sin(a) * 100;
    if(x < 10 || x > 190 || y < 20 || y > 230) continue;
    s += `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${c.int(0, 180)})">${shadow(c, 2, 3, 16, 10, .4)}<path d="${blob(c, 0, 0, 12, 8, .08)}" transform="scale(1.3 .7)" fill="${c.ball('#5a2410', 1.2)}"/><path d="M-10 -2Q0 -6 10 -2" stroke="#8a4020" stroke-width="1" fill="none"/></g>`;
  }
  return s;
});

def('hazelnut-milk', 'نوشیدنی گرم', 'شیر شکلات فندق', c => {
  let s = backdrop(c);
  const t = TONES.choco;
  const inner = latteArt(c, c.pick(['rosetta', 'tulip', 'heart']), 46, t[1], t[0][1]) + dust(c, 18, 0, 0, 36, '#c79a66', .9, 1.8);
  s += cupTop(c, { R: 58, color: c.pick(['#6a3a22', '#f3ece1', '#232120', '#d8a53a']), liquid: toneFill(c, t), inner });
  for(let i = 0; i < c.int(4, 6); i++){
    const a = c.rand(0, 6.28), x = CX + Math.cos(a) * 96, y = CY + Math.sin(a) * 102;
    if(x < 10 || x > 190 || y < 20 || y > 230) continue;
    s += `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${c.int(0, 360)})"><circle r="8" fill="${c.ball('#9a5a2a')}"/><path d="M-7-3Q0-10 7-3" fill="#c79a66" stroke="#7a4a1a" stroke-width=".8"/></g>`;
  }
  return s;
});
def('honey-milk', 'نوشیدنی گرم', 'شیر عسل دارچین', c => {
  let s = backdrop(c, c.pick(['#5a3a12', '#402b1e', '#1c3a5e']));
  let inner = `<path d="${spiral(c.rand(2.5, 3.5), 2, 42)}" stroke="#e0a42a" stroke-width="3" fill="none" stroke-linecap="round" opacity=".85"/>` + dust(c, 40, 0, 0, 44, '#8a4520', .55);
  const ha = c.rand(-30, 30);
  const da = (ha + 150) * Math.PI / 180;
  const dip = `<g transform="translate(${n1(CX + Math.cos(da) * 66)} ${n1(CY + Math.sin(da) * 66)}) rotate(${n1(ha + 150 + 90)})"><rect x="-2.5" y="0" width="5" height="46" rx="2.5" fill="#b98a4e"/><g transform="translate(0 -6)"><ellipse rx="10" ry="12" fill="#d59a3a"/><path d="M-10-4H10M-10 2H10M-9 8H9M-9-9H9" stroke="#8a5a1a" stroke-width="1.6"/></g></g>`;
  s += cupTop(c, { R: 56, ha, liquid: c.rad([[0, '#fffaf0'], [.7, '#f5e8cc'], [1, '#d7bb8a']], .45, .42, .6), inner, onSaucer: dip });
  s += cinnamonStick(c, c.pick([36, 164]), c.pick([40, 212]), c.rand(0, 180), 58);
  return s;
});

function istekan(c, o = {}){
  return `<g transform="translate(${CX} 196) scale(1.22) translate(${-CX} -196)">${istekanBody(c, o)}</g>`;
}
function istekanBody(c, o = {}){
  const tea = o.tea || c.pick([['#e0672a', '#8b1f08'], ['#d9581e', '#6e1606'], ['#e8862e', '#9a3a0a'], ['#c9421c', '#5a1004']]);
  const saucer = o.saucer || c.pick(['#f3ece1', '#2d5f9a', '#f3ece1', '#1f6f78', '#efe0c2', '#b8613b']);
  let s = shadow(c, CX + 4, 198, 70, 12, .55);
  s += `<ellipse cx="${CX}" cy="192" rx="60" ry="12" fill="${c.hcyl(saucer)}"/><ellipse cx="${CX}" cy="189" rx="48" ry="7.5" fill="${darken(saucer, .12)}"/>`;
  s += `<ellipse cx="${CX}" cy="192" rx="57" ry="10.5" fill="none" stroke="${GOLD}" stroke-width="1.3"/>`;
  if(c.chance(.5)){ for(let i = 0; i < 9; i++){ const a = Math.PI * (.15 + i * .09); s += `<circle cx="${n1(CX + Math.cos(a) * 54)}" cy="${n1(192 + Math.sin(a) * 9)}" r="1.6" fill="${c.pick([GOLD, '#b8233a', '#1f6f78'])}"/>`; } }
  if(o.onSaucer) s += o.onSaucer;
  const top = 100;
  const p = `M${CX - 28} ${top}C${CX - 28} ${top + 24} ${CX - 16} ${top + 32} ${CX - 16} ${top + 48}C${CX - 16} ${top + 64} ${CX - 24} ${top + 72} ${CX - 24} ${top + 84}Q${CX - 24} ${top + 92} ${CX - 16} ${top + 92}H${CX + 16}Q${CX + 24} ${top + 92} ${CX + 24} ${top + 84}C${CX + 24} ${top + 72} ${CX + 16} ${top + 64} ${CX + 16} ${top + 48}C${CX + 16} ${top + 32} ${CX + 28} ${top + 24} ${CX + 28} ${top}Z`;
  const clip = c.clip(`<path d="${p}"/>`);
  s += `<g clip-path="${clip}"><rect y="${top + 9}" width="200" height="100" fill="${c.lin([[0, tea[0], .92], [1, tea[1], .98]])}"/><ellipse cx="${CX}" cy="${top + 9}" rx="28" ry="3" fill="${lighten(tea[0], .3)}" opacity=".6"/>${o.inGlass || ''}</g>`;
  s += `<path d="${p}" fill="${c.glass()}" stroke="rgba(255,255,255,.6)" stroke-width="1.8"/>`;
  s += `<path d="M${CX - 20} ${top + 10}C${CX - 20} ${top + 26} ${CX - 12} ${top + 34} ${CX - 11} ${top + 46}" stroke="#fff" stroke-opacity=".45" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  s += `<ellipse cx="${CX}" cy="${top}" rx="28" ry="3.5" fill="none" stroke="${c.chance(.5) ? GOLD : 'rgba(255,255,255,.7)'}" stroke-width="1.6"/>`;
  if(o.steam !== false) s += steam(c, CX, top - 8, 3, 11);
  return s;
}
def('tea-glass', 'چای و دمنوش', 'چای در استکان کمرباریک', c => {
  let s = backdrop(c) + floor(c);
  let onS = '';
  const g = c.int(0, 2);
  if(g === 0) onS = sugarCube(c, CX - 40, 186, c.rand(0, 40), .7) + sugarCube(c, CX + 42, 187, c.rand(0, 40), .7);
  let inGlass = '';
  if(g === 1) inGlass = `<rect x="${CX + 4}" y="60" width="5" height="120" fill="#8a5a2a" transform="rotate(12 ${CX} 140)"/>` + (() => { let k = ''; for(let i = 0; i < 18; i++) k += `<rect x="${n1(CX + c.rand(-2, 12))}" y="${n1(c.rand(140, 185))}" width="${n1(c.rand(4, 8))}" height="${n1(c.rand(4, 8))}" fill="#f2b23c" fill-opacity=".8" transform="rotate(${c.int(0, 90)} ${CX + 6} 160)"/>`; return k; })();
  s += istekan(c, { onSaucer: onS, inGlass });
  if(g === 1) s += `<rect x="${CX + 12}" y="52" width="5" height="60" rx="2" fill="#8a5a2a" transform="rotate(12 ${CX} 140)"/>`;
  if(g === 2) s += `<g transform="translate(${c.pick([36, 164])} 206)">${shadow(c, 0, 8, 26, 6, .5)}<ellipse rx="22" ry="7" fill="${c.hcyl('#e9dcc0')}"/>${sugarCube(c, -6, -6, 10, .55)}${sugarCube(c, 7, -5, 30, .55)}${sugarCube(c, 0, -14, 50, .55)}</g>`;
  return s;
});

def('tea-cardamom', 'چای و دمنوش', 'چای هل و دارچین (فنجان شیشه‌ای)', c => {
  let s = backdrop(c) + floor(c);
  const tea = c.pick([['#e0672a', '#8b1f08'], ['#d9581e', '#6e1606'], ['#c9421c', '#5a1004']]);
  const r = drawGlass(c, 'mug', (g, lt) => {
    let l = `<rect y="${lt}" width="200" height="200" fill="${c.lin([[0, tea[0], .9], [1, tea[1]]])}"/>`;
    for(let i = 0; i < 3; i++) l += cardamom(c, CX + c.rand(-20, 20), lt + c.rand(4, 30), c.rand(0, 360));
    return l;
  }, { level: 108 });
  s += r.s;
  s += cinnamonStick(c, CX + 10, 96, -68, 90);
  s += steam(c, CX - 10, 82, 2, 14);
  for(let i = 0; i < 3; i++) s += cardamom(c, c.pick([30, 44, 156, 170]) + c.rand(-6, 6), 214 + c.rand(-6, 6), c.rand(0, 360));
  return s;
});

def('teapot', 'چای و دمنوش', 'قوری و دمنوش', c => {
  let s = backdrop(c) + floor(c);
  const pot = c.pick(['#2d5f9a', '#f3ece1', '#1f6f78', '#b8613b', '#efe0c2', '#7a2e3a', '#3b4a7a']);
  const px = c.pick([78, 86]), py = 150;
  s += shadow(c, px + 4, 200, 64, 10, .6);
  s += `<path d="M${px + 40} 150C${px + 58} 146 ${px + 62} 124 ${px + 76} 112" stroke="${c.hcyl(pot)}" stroke-width="11" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M${px - 42} 128c-26 4-26 44 2 44" stroke="${c.hcyl(pot)}" stroke-width="8" fill="none"/>`;
  s += `<path d="M${px - 48} 150C${px - 48} 116 ${px - 28} 104 ${px} 104S${px + 48} 116 ${px + 48} 150C${px + 48} 184 ${px + 24} 198 ${px} 198S${px - 48} 184 ${px - 48} 150Z" fill="${c.ball(pot, .9)}"/>`;
  const flower = c.pick(['#b8233a', '#f3ece1', GOLD, '#2d5f9a', '#e07a9a']);
  const fc = pot === flower ? '#b8233a' : flower;
  for(let i = 0; i < 3; i++){
    const fx = px - 26 + i * 26 + c.rand(-4, 4), fy = 150 + c.rand(-8, 10);
    let f = '';
    for(let j = 0; j < 6; j++) f += `<ellipse transform="rotate(${j * 60})" cy="-5" rx="3" ry="5.5" fill="${fc}"/>`;
    s += `<g transform="translate(${n1(fx)} ${n1(fy)}) scale(${n1(c.rand(.8, 1.2) * 100) / 100})">${f}<circle r="2.4" fill="${GOLD}"/></g>`;
    s += leaf(c, fx + 6, fy + 4, c.rand(-40, 40), .35, '#3f8a3a');
  }
  s += `<path d="M${px - 46} 132Q${px} 124 ${px + 46} 132" stroke="${GOLD}" stroke-width="2" fill="none"/>`;
  s += `<ellipse cx="${px}" cy="106" rx="26" ry="6" fill="${darken(pot, .15)}"/><path d="M${px - 22} 106Q${px} 84 ${px + 22} 106Z" fill="${c.ball(pot)}"/><circle cx="${px}" cy="88" r="5" fill="${c.ball(GOLD)}"/>`;
  s += steam(c, px + 78, 104, 2, 8, .7);
  const herb = c.tint || c.pick(['#c2334a', '#e39a2a', '#d9c24a', '#7a2a6a', '#b84a1a', '#9ab83a']);
  const gx = c.pick([158, 160]);
  s += shadow(c, gx + 2, 202, 24, 5, .5);
  s += `<path d="M${gx - 18} 164H${gx + 18}L${gx + 15} 200H${gx - 15}Z" fill="${herb}" opacity=".85"/><path d="M${gx - 20} 156H${gx + 20}L${gx + 16} 202H${gx - 16}Z" fill="${c.glass()}" stroke="rgba(255,255,255,.6)" stroke-width="1.6"/>`;
  return s;
});

function herbalTop(kind){
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
    let s = backdrop(c, c.pick(P.bg));
    const liq = c.tint ? [lighten(c.tint, .25), darken(c.tint, .4)] : P.liq;
    let inner = '';
    const float = () => {
      const a = c.rand(0, 6.28), d = c.rand(4, 38);
      return [Math.cos(a) * d, Math.sin(a) * d];
    };
    if(kind === 'rose' || kind === 'borage'){
      for(let i = 0; i < c.int(6, 10); i++){ const [x, y] = float(); inner += `<path transform="translate(${n1(x)} ${n1(y)}) rotate(${c.int(0, 360)})" d="M0 0C6-8 14-6 12 2 10 8 4 8 0 0Z" fill="${c.pick(['#f27a98', '#d93a60', '#f7a8bc'])}" opacity=".95"/>`; }
      for(let i = 0; i < c.int(3, 6); i++){ const [x, y] = float(); let f = ''; for(let j = 0; j < 5; j++) f += `<path transform="rotate(${j * 72})" d="M0 0L-3.5-9 0-11 3.5-9Z" fill="${c.pick(['#4a7ad8', '#6a5ad8', '#3a6ac8'])}"/>`; inner += `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${c.int(0, 72)})">${f}<circle r="1.8" fill="#1a1a3a"/></g>`; }
    }
    if(kind === 'citrus'){
      for(let i = 0; i < c.int(2, 4); i++){ const [x, y] = float(); inner += citrusWheel(c, x, y, c.rand(11, 15), c.pick(['orange', 'lemon', 'blood']), c.rand(0, 6)); }
      inner += cinnamonStick(c, c.rand(-10, 10), c.rand(-10, 10), c.rand(0, 180), 50);
    }
    if(kind === 'chamomile'){
      for(let i = 0; i < c.int(5, 9); i++){ const [x, y] = float(); let f = ''; for(let j = 0; j < 12; j++) f += `<ellipse transform="rotate(${j * 30})" cy="-6.5" rx="1.8" ry="4.5" fill="#fffaf0"/>`; inner += `<g transform="translate(${n1(x)} ${n1(y)}) scale(${n1(c.rand(.8, 1.2) * 100) / 100})">${f}<circle r="3.4" fill="#f2b21c"/></g>`; }
    }
    if(kind === 'berry'){
      for(let i = 0; i < c.int(8, 12); i++){ const [x, y] = float(); inner += berry(c, x, y, c.rand(3, 5)); }
      for(let i = 0; i < 2; i++){ const [x, y] = float(); let f = ''; for(let j = 0; j < 5; j++) f += `<ellipse transform="rotate(${j * 72})" cy="-7" rx="5" ry="8" fill="#9a1030" opacity=".8"/>`; inner += `<g transform="translate(${n1(x)} ${n1(y)})">${f}</g>`; }
    }
    if(kind === 'mint'){
      for(let i = 0; i < c.int(4, 7); i++){ const [x, y] = float(); inner += leaf(c, x, y, c.rand(0, 360), c.rand(.6, .9)); }
      const [x, y] = float(); inner += citrusWheel(c, x, y, 14, 'lemon', 0);
    }
    if(kind === 'quince'){
      for(let i = 0; i < c.int(2, 4); i++){ const [x, y] = float(); inner += `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${c.int(0, 360)})"><path d="M-16 0A16 16 0 0 1 16 0Q0 8-16 0Z" fill="#f7e2a0" stroke="#e0b24a" stroke-width="2"/><path d="M-4-4L0 0 4-4" stroke="#8a5a1a" stroke-width="1.4" fill="none"/></g>`; }
      inner += starAnise(c, c.rand(-10, 10), c.rand(-10, 10), c.rand(0, 90), .7);
    }
    inner += bubbles(c, 8, -40, 40, -40, 40, '#fff');
    s += glassTop(c, { R: 58, liquid: c.rad([[0, lighten(liq[0], .15)], [.7, liq[0]], [1, liq[1]]], .45, .42, .62), inner });
    if(kind === 'borage' || kind === 'rose'){ for(let i = 0; i < 3; i++){ const a = c.rand(0, 6.28); s += `<path transform="translate(${n1(CX + Math.cos(a) * 96)} ${n1(CY + Math.sin(a) * 100)}) rotate(${c.int(0, 360)})" d="M0 0C6-8 14-6 12 2 10 8 4 8 0 0Z" fill="#e2506a"/>`; } }
    if(kind === 'quince' || kind === 'citrus') s += cinnamonStick(c, c.pick([36, 164]), c.pick([42, 212]), c.rand(0, 180), 52);
    return s;
  };
}
def('herbal-rose', 'چای و دمنوش', 'دمنوش گل محمدی', herbalTop('rose'));
def('herbal-borage', 'چای و دمنوش', 'دمنوش گل گاوزبان', herbalTop('borage'));
def('herbal-citrus', 'چای و دمنوش', 'دمنوش مرکبات', herbalTop('citrus'));
def('herbal-chamomile', 'چای و دمنوش', 'دمنوش بابونه', herbalTop('chamomile'));
def('herbal-berry', 'چای و دمنوش', 'دمنوش میوه‌های قرمز', herbalTop('berry'));
def('herbal-mint', 'چای و دمنوش', 'دمنوش نعناع و لیمو', herbalTop('mint'));
def('herbal-quince', 'چای و دمنوش', 'دمنوش به و دارچین', herbalTop('quince'));

def('tea-latte', 'چای و دمنوش', 'چای لاته لایه‌ای', c => {
  let s = backdrop(c) + floor(c);
  const tea = c.tint || c.pick(['#c96a2a', '#b85a1a', '#d08a3a']);
  const r = drawGlass(c, c.pick(['tumbler', 'mug']), (g, lt) => `<rect y="${lt}" width="200" height="200" fill="${c.lin([[0, '#fffaf0'], [.28, '#f3e3c6'], [.36, lighten(tea, .2)], [.6, tea], [1, darken(tea, .4)]])}"/>` + dust(c, 20, CX, lt + 2, 26, '#8a4520', .7), {});
  s += r.s + steam(c, CX, r.g.top - 6, 2, 14, .8);
  s += cinnamonStick(c, c.pick([34, 166]), 214, c.rand(-20, 20), 50) + starAnise(c, c.pick([166, 34]), 212, c.rand(0, 90), .8);
  return s;
});

function icedStyle(kind){
  return c => {
    let s = backdrop(c) + floor(c);
    const shape = c.pick(['tall', 'tumbler', 'jar', 'highball']);
    const r = drawGlass(c, shape, (g, lt) => {
      let l = '';
      if(kind === 'americano') l += `<rect y="${lt}" width="200" height="200" fill="${c.lin([[0, '#6a3a1a'], [.08, '#3a1a08'], [1, '#1a0a03']])}"/>`;
      else {
        const milk = kind === 'mocha' ? '#d9bfa6' : '#f3e9da';
        const cof = kind === 'mocha' ? '#4a2210' : '#6a3a1a';
        const mid = lt + c.rand(26, 50);
        l += `<rect y="${lt}" width="200" height="200" fill="${milk}"/>`;
        l += `<path d="M0 ${lt}H200V${n1(mid)}C160 ${n1(mid + 12)} 140 ${n1(mid - 10)} 100 ${n1(mid + 6)}S40 ${n1(mid - 8)} 0 ${n1(mid + 8)}Z" fill="${c.lin([[0, cof], [1, lighten(cof, .3)]])}"/>`;
        l += `<path d="M20 ${n1(mid + 14)}C60 ${n1(mid + 30)} 120 ${n1(mid + 4)} 180 ${n1(mid + 26)}" stroke="${cof}" stroke-opacity=".35" stroke-width="8" fill="none"/>`;
        if(kind === 'caramel' || kind === 'mocha'){
          const sc = kind === 'caramel' ? '#c97a2b' : '#3a1a0a';
          for(let i = 0; i < 5; i++){ const x = CX - g.tw + 6 + i * (g.tw * 2 - 12) / 4; l += `<path d="M${n1(x)} ${lt}q${c.int(-8, 8)} 40 ${c.int(-4, 4)} ${c.int(60, 120)}" stroke="${sc}" stroke-width="${n1(c.rand(2.5, 4))}" fill="none" stroke-linecap="round" opacity=".8"/>`; }
          l += `<rect y="${g.bot - 14}" width="200" height="20" fill="${sc}" opacity=".85"/>`;
        }
      }
      l += ice(c, c.int(3, 5), CX - g.bw + 12, CX + g.bw - 12, lt + 4, lt + 70);
      l += bubbles(c, 6, CX - g.bw + 6, CX + g.bw - 6, lt + 20, g.bot - 10, '#fff');
      return l;
    }, { drops: c.int(8, 16) });
    s += straw(c, CX + c.rand(-6, 8), r.g.bot - 30, CX + c.rand(18, 34), r.g.top - c.rand(24, 40), 6) + r.s;
    if(kind === 'mocha' && c.chance(.6)) s += `<path d="M${CX - r.g.tw + 2} ${r.g.top}C${CX - 20} ${r.g.top - 22} ${CX + 20} ${r.g.top - 22} ${CX + r.g.tw - 2} ${r.g.top}Z" fill="#fbf4ea"/>` + dust(c, 20, CX, r.g.top - 8, 14, '#3a1a0a', .7);
    s += beansAround(c, c.int(0, 3), 70, 88, CX, 214);
    return s;
  };
}
def('iced-americano', 'نوشیدنی سرد', 'آیس آمریکانو', icedStyle('americano'));
def('iced-latte', 'نوشیدنی سرد', 'آیس لاته لایه‌ای', icedStyle('latte'));
def('iced-caramel', 'نوشیدنی سرد', 'آیس کارامل ماکیاتو', icedStyle('caramel'));
def('iced-mocha', 'نوشیدنی سرد', 'آیس موکا', icedStyle('mocha'));

const DRINK_COLORS = {
  sky: ['#bfe8ff', '#2a7ad6'], ruby: ['#ff9fb0', '#b3123a'], emerald: ['#b9f3c6', '#0f8a4e'], sunset: ['#ffe07a', '#ff4e2e'],
  violet: ['#e2c2ff', '#6b2fb3'], coconut: ['#fffdf6', '#e6dac2'], peach: ['#ffd9b8', '#f07f4f'], lagoon: ['#b8fff2', '#0f8f8a'], rose: ['#ffd0dc', '#e04a78']
};
function mocktail(shape){
  return c => {
    let s = backdrop(c) + floor(c);
    let col;
    if(c.tint) col = [lighten(c.tint, .45), c.tint];
    else col = DRINK_COLORS[c.pick(Object.keys(DRINK_COLORS))];
    const liquid = c.lin([[0, col[0], .92], [1, col[1], .96]]);
    if(shape === 'coupe' || shape === 'martini'){
      const bowl = shape === 'coupe'
        ? `M${CX - 54} 96C${CX - 54} 130 ${CX - 28} 144 ${CX} 144S${CX + 54} 130 ${CX + 54} 96Z`
        : `M${CX - 56} 88L${CX} 148L${CX + 56} 88Z`;
      s += shadow(c, CX + 4, 202, 44, 8, .6);
      s += `<path d="M${CX} 144V196" stroke="rgba(255,255,255,.55)" stroke-width="4"/><ellipse cx="${CX}" cy="198" rx="30" ry="5" fill="rgba(255,255,255,.2)" stroke="rgba(255,255,255,.55)" stroke-width="1.6"/>`;
      const clip = c.clip(`<path d="${bowl}"/>`);
      s += `<g clip-path="${clip}"><rect y="${shape === 'coupe' ? 102 : 96}" width="200" height="60" fill="${liquid}"/>${bubbles(c, 10, CX - 36, CX + 36, 108, 138)}</g>`;
      s += `<path d="${bowl}" fill="${c.glass()}" stroke="rgba(255,255,255,.6)" stroke-width="1.8"/>`;
      s += `<ellipse cx="${CX}" cy="${shape === 'coupe' ? 96 : 88}" rx="${shape === 'coupe' ? 54 : 56}" ry="5" fill="none" stroke="rgba(255,255,255,.65)" stroke-width="1.6"/>`;
      if(c.chance(.5)) s += `<path d="M${CX - 54} 96Q${CX} 104 ${CX + 54} 96" stroke="#fff" stroke-width="3" stroke-dasharray="1 2.5" stroke-linecap="round" fill="none" opacity=".85"/>`;
      const gk = c.int(0, 3);
      if(gk === 0) s += citrusWheel(c, CX + 46, 94, 15, c.pick(['lemon', 'lime', 'orange', 'grapefruit']), 0);
      if(gk === 1) s += `<path d="M${CX - 40} 70L${CX + 10} 120" stroke="#caa36a" stroke-width="2"/>` + berry(c, CX - 26, 84, 6) + berry(c, CX - 18, 92, 6) + berry(c, CX - 10, 100, 6);
      if(gk === 2) s += cherry(c, CX + 20, 112, 1);
      if(gk === 3) s += mintSprig(c, CX + 34, 100, 20, 1);
    } else if(shape === 'hurricane'){
      s += straw(c, CX - 6, 150, CX - 24, 30, 5);
      const p = `M${CX - 30} 58C${CX - 36} 96 ${CX - 18} 110 ${CX - 22} 136C${CX - 28} 170 ${CX - 30} 186 ${CX - 12} 186H${CX + 12}C${CX + 30} 186 ${CX + 28} 170 ${CX + 22} 136C${CX + 18} 110 ${CX + 36} 96 ${CX + 30} 58Z`;
      s += shadow(c, CX + 4, 204, 40, 7, .6);
      s += `<path d="M${CX} 186V200" stroke="rgba(255,255,255,.55)" stroke-width="6"/><ellipse cx="${CX}" cy="201" rx="26" ry="4" fill="rgba(255,255,255,.25)" stroke="rgba(255,255,255,.55)"/>`;
      const clip = c.clip(`<path d="${p}"/>`);
      s += `<g clip-path="${clip}"><rect y="70" width="200" height="140" fill="${liquid}"/>${ice(c, 3, CX - 18, CX + 18, 78, 120)}${bubbles(c, 12, CX - 22, CX + 22, 90, 180)}</g>`;
      s += `<path d="${p}" fill="${c.glass()}" stroke="rgba(255,255,255,.6)" stroke-width="1.8"/><ellipse cx="${CX}" cy="58" rx="30" ry="4" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.6"/>`;
      s += c.chance(.5) ? citrusWheel(c, CX + 28, 58, 16, c.pick(['orange', 'lemon', 'lime']), 0) : `<g transform="translate(${CX + 18} 36) rotate(20)"><path d="M0 30V-2" stroke="#caa36a" stroke-width="1.6"/><path d="M-22 0Q0-18 22 0Q0-6-22 0Z" fill="${c.pick(['#e8453c', '#2a9d8f', '#f2c94c', '#e07a9a'])}"/><path d="M0-10L-12-2M0-10L12-2M0-10V0" stroke="#fff" stroke-opacity=".6"/></g>`;
    } else {
      const glassShape = shape;
      const r = drawGlass(c, glassShape, (g, lt) => {
        let l = `<rect y="${lt}" width="200" height="200" fill="${liquid}"/>`;
        if(c.chance(.5)) l += `<rect y="${g.bot - 40}" width="200" height="50" fill="${col[1]}" opacity=".5"/>`;
        l += ice(c, c.int(2, 4), CX - g.bw + 12, CX + g.bw - 12, lt + 4, lt + 60);
        if(c.chance(.6)) l += citrusWheel(c, CX + c.rand(-10, 10), lt + c.rand(50, 80), 13, c.pick(['lemon', 'lime', 'orange', 'grapefruit']), c.rand(0, 3));
        if(c.chance(.5)) l += mintSprig(c, CX + c.rand(-12, 12), lt + c.rand(40, 80), c.rand(-30, 30), .8);
        l += bubbles(c, 16, CX - g.bw + 6, CX + g.bw - 6, lt + 10, g.bot - 6);
        return l;
      }, { drops: c.int(4, 12) });
      s += straw(c, CX + c.rand(-8, 8), r.g.bot - 20, CX + c.rand(16, 34), r.g.top - c.rand(20, 36), 6) + r.s;
      const gk = c.int(0, 2);
      if(gk === 0) s += citrusWheel(c, CX - r.g.tw + 2, r.g.top + 2, 16, c.pick(['orange', 'lemon', 'lime', 'grapefruit']), 0);
      if(gk === 1) s += mintSprig(c, CX - 10, r.g.top + 6, -10, 1.1);
      if(gk === 2) s += `<g transform="translate(${CX - 14} ${r.g.top - 4}) rotate(-25)"><path d="M0 0V-30" stroke="#6a4a2a" stroke-width="1.6"/>${leaf(c, 0, -8, -140, .35, '#5a7a4a')}${leaf(c, 0, -14, -40, .35, '#5a7a4a')}${leaf(c, 0, -20, -140, .35, '#5a7a4a')}${leaf(c, 0, -26, -40, .35, '#5a7a4a')}</g>`;
    }
    for(let i = 0; i < c.int(0, 2); i++) s += citrusWheel(c, c.pick([30, 170]) + c.rand(-8, 8), 216 + c.rand(-4, 6), c.rand(9, 12), c.pick(['lemon', 'lime', 'orange']), c.rand(0, 3));
    return s;
  };
}
def('mocktail-coupe', 'ماکتیل', 'ماکتیل در جام کوپ', mocktail('coupe'));
def('mocktail-martini', 'ماکتیل', 'ماکتیل در جام مثلثی', mocktail('martini'));
def('mocktail-highball', 'ماکتیل', 'ماکتیل در لیوان بلند', mocktail('highball'));
def('mocktail-hurricane', 'ماکتیل', 'ماکتیل در جام هاریکن', mocktail('hurricane'));
def('mocktail-jar', 'ماکتیل', 'ماکتیل در شیشه دهانه‌گشاد', mocktail('jar'));
def('mocktail-rocks', 'ماکتیل', 'ماکتیل در لیوان کوتاه', mocktail('rocks'));

const SHAKES = {
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
function shake(flavor){
  return c => {
    const F = SHAKES[flavor];
    const col = c.tint || F.col;
    let s = backdrop(c) + floor(c);
    const shape = c.pick(['tall', 'jar', 'tumbler', 'sundae']);
    const mark = s.length;
    let top, tw;
    if(shape === 'sundae'){
      const p = `M${CX - 40} 84C${CX - 42} 120 ${CX - 20} 150 ${CX - 8} 158V186H${CX + 8}V158C${CX + 20} 150 ${CX + 42} 120 ${CX + 40} 84Z`;
      s += shadow(c, CX + 4, 204, 40, 7, .6) + `<ellipse cx="${CX}" cy="198" rx="28" ry="6" fill="rgba(255,255,255,.25)" stroke="rgba(255,255,255,.55)"/><path d="M${CX - 8} 186L${CX - 12} 198H${CX + 12}L${CX + 8} 186" fill="rgba(255,255,255,.2)"/>`;
      const clip = c.clip(`<path d="${p}"/>`);
      let l = `<rect y="84" width="200" height="120" fill="${c.lin([[0, lighten(col, .15)], [1, darken(col, .15)]])}"/>`;
      for(let i = 0; i < 5; i++){ const x = CX - 32 + i * 16; l += `<path d="M${x} 84q${c.int(-6, 6)} 30 ${c.int(-3, 3)} ${c.int(30, 60)}" stroke="${F.sauce}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".8"/>`; }
      s += `<g clip-path="${clip}">${l}</g><path d="${p}" fill="${c.glass()}" stroke="rgba(255,255,255,.6)" stroke-width="1.8"/>`;
      top = 84; tw = 40;
    } else {
      const r = drawGlass(c, shape, (g, lt) => {
        let l = `<rect y="${lt}" width="200" height="200" fill="${c.lin([[0, lighten(col, .15)], [1, darken(col, .15)]])}"/>`;
        for(let i = 0; i < 5; i++){ const x = CX - g.tw + 6 + i * (g.tw * 2 - 12) / 4; l += `<path d="M${n1(x)} ${lt}q${c.int(-6, 6)} 30 ${c.int(-3, 3)} ${c.int(40, 90)}" stroke="${F.sauce}" stroke-width="${n1(c.rand(3, 5))}" fill="none" stroke-linecap="round" opacity=".8"/>`; }
        if(F.top === 'oreo') l += dust(c, 60, CX, (lt + g.bot) / 2, 40, '#1e1a18', .8, 1.8);
        if(F.top === 'mint') l += dust(c, 40, CX, (lt + g.bot) / 2, 40, '#2e160c', .9, 1.8);
        return l;
      }, { level: null });
      s += r.s;
      top = r.g.top; tw = r.g.tw;
    }
    const cream = `M${CX - tw - 2} ${top + 2}C${CX - tw - 8} ${top - 12} ${CX - tw + 6} ${top - 20} ${CX - 18} ${top - 18}C${CX - 22} ${top - 34} ${CX - 4} ${top - 40} ${CX + 2} ${top - 32}C${CX + 6} ${top - 48} ${CX + 26} ${top - 42} ${CX + 20} ${top - 24}C${CX + tw + 4} ${top - 24} ${CX + tw + 8} ${top - 8} ${CX + tw + 2} ${top + 2}Z`;
    s += `<path d="${cream}" fill="${c.rad([[0, '#ffffff'], [.8, '#f4ecdf'], [1, '#d9ccb8']], .4, .3, .9)}"/>`;
    s += `<path d="M${CX - tw + 4} ${top - 8}Q${CX - 10} ${top - 2} ${CX - 16} ${top - 16}M${CX + 4} ${top - 16}Q${CX + 12} ${top - 8} ${CX + tw - 4} ${top - 10}" stroke="#d9ccb8" stroke-width="1.4" fill="none"/>`;
    let zz = `M${CX - 26} ${top - 14}`;
    for(let i = 0; i < 6; i++) zz += `L${CX - 20 + i * 9} ${top - (i % 2 ? 30 : 12)}`;
    s += `<path d="${zz}" stroke="${F.sauce}" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    const tx = CX + c.rand(-6, 6), ty = top - 36;
    if(F.top === 'strawberry') s += strawberry(c, tx + 4, ty, 1, c.int(-20, 20)) + strawberry(c, tx - 20, ty + 12, .7, -30);
    if(F.top === 'oreo') s += `<g transform="translate(${n1(tx + 8)} ${n1(ty)}) rotate(${c.int(-30, -10)})"><rect x="-17" y="-8" width="34" height="16" rx="8" fill="#1e1a18"/><rect x="-15" y="-2.5" width="30" height="5" fill="#f6f1ea"/></g>` + dust(c, 20, tx - 6, ty + 16, 14, '#1e1a18', .9, 1.6);
    if(F.top === 'biscuit') s += `<g transform="translate(${n1(tx + 6)} ${n1(ty - 2)}) rotate(${c.int(-25, -8)})"><rect x="-18" y="-11" width="36" height="22" rx="2" fill="${c.hcyl('#e0a85a')}"/>${[-10, -3, 4, 11].map(x => `<circle cx="${x}" cy="-4" r="1.2" fill="#a86a2a"/><circle cx="${x}" cy="4" r="1.2" fill="#a86a2a"/>`).join('')}</g><g transform="translate(${n1(tx - 16)} ${n1(ty + 10)}) rotate(20)"><rect x="-12" y="-8" width="24" height="16" rx="2" fill="${c.hcyl('#e0a85a')}"/></g>`;
    if(F.top === 'peanut'){ for(let i = 0; i < 9; i++) s += `<ellipse cx="${n1(tx + c.rand(-24, 24))}" cy="${n1(ty + c.rand(6, 22))}" rx="3.5" ry="2.4" fill="${c.ball('#c98a4a')}" transform="rotate(${c.int(0, 180)} ${n1(tx)} ${n1(ty + 14)})"/>`; }
    if(F.top === 'mint') s += mintSprig(c, tx + 4, ty + 16, c.int(-15, 15), 1) + dust(c, 14, tx, ty + 18, 16, '#2e160c', 1, 2);
    if(F.top === 'hazelnut'){ for(let i = 0; i < 4; i++) s += `<g transform="translate(${n1(tx + c.rand(-20, 20))} ${n1(ty + c.rand(4, 20))})"><circle r="5.5" fill="${c.ball('#9a5a2a')}"/><path d="M-5-2Q0-7 5-2" fill="#c79a66"/></g>`; }
    if(F.top === 'beans'){ for(let i = 0; i < 5; i++) s += bean(c, tx + c.rand(-22, 22), ty + c.rand(6, 22), c.rand(0, 360), .7); }
    if(F.top === 'cherry') s += cherry(c, tx, ty + 8, 1.1) + sprinkles(c, 14, tx - 24, tx + 24, ty + 8, ty + 24);
    if(F.top === 'fruit') s += `<g transform="translate(${n1(tx)} ${n1(ty + 6)})"><path d="M-14 8Q-14-10 0-12 14-10 14 8Z" fill="${c.ball('#ffb020')}"/><path d="M-8-2L8-2M-10 3H10" stroke="#e08a10" stroke-width="1"/></g>` + berry(c, tx - 18, ty + 16, 5, '#26164a');
    const st = straw(c, CX + c.rand(0, 10), top + 30, CX + c.rand(22, 36), top - c.rand(60, 76), 7);
    return s.slice(0, mark) + st + s.slice(mark);
  };
}
def('shake-strawberry', 'شیک و اسمودی', 'شیک توت‌فرنگی', shake('strawberry'));
def('shake-oreo', 'شیک و اسمودی', 'شیک اورئو', shake('oreo'));
def('shake-biscuit', 'شیک و اسمودی', 'شیک بیسکوییت', shake('biscuit'));
def('shake-peanut', 'شیک و اسمودی', 'شیک بادام‌زمینی', shake('peanut'));
def('shake-mint', 'شیک و اسمودی', 'شیک شکلات نعناع', shake('mint'));
def('shake-hazelnut', 'شیک و اسمودی', 'شیک شکلات فندق', shake('hazelnut'));
def('shake-coffee', 'شیک و اسمودی', 'شیک قهوه', shake('coffee'));
def('shake-vanilla', 'شیک و اسمودی', 'شیک وانیل', shake('vanilla'));
def('smoothie-mango', 'شیک و اسمودی', 'اسموتی انبه', shake('mango'));

function plate(c, x = CX, y = 186, rx = 76, ry = 20){
  const col = c.pick(['#f3ece1', '#f6f1ea', '#2d5f9a', '#232120', '#efe0c2', '#1f6f78', '#b8613b', '#8ea888']);
  let s = shadow(c, x + 5, y + 8, rx + 8, ry + 6, .6);
  s += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c.hcyl(col, .7)}"/>`;
  s += `<ellipse cx="${x}" cy="${y - 2}" rx="${n1(rx * .74)}" ry="${n1(ry * .64)}" fill="${darken(col, .08)}"/>`;
  if(c.chance(.4)) s += `<ellipse cx="${x}" cy="${y}" rx="${rx - 3}" ry="${ry - 2}" fill="none" stroke="${GOLD}" stroke-width="1.2"/>`;
  if(c.chance(.35)) s += `<ellipse cx="${x}" cy="${y}" rx="${n1(rx * .88)}" ry="${n1(ry * .82)}" fill="none" stroke="${c.pick(['#2d5f9a', GOLD, '#b8233a'])}" stroke-width="2" stroke-dasharray="1.5 4" stroke-linecap="round"/>`;
  return s;
}
function board(c, x = CX, y = 186, w = 150){
  const col = c.pick(['#a8743f', '#8a5a34', '#c28e55']);
  return shadow(c, x + 5, y + 10, w / 2 + 6, 14, .6) + `<rect x="${x - w / 2}" y="${y - 12}" width="${w}" height="24" rx="12" fill="${c.lin([[0, lighten(col, .15)], [1, darken(col, .2)]])}"/><rect x="${x - w / 2}" y="${y + 6}" width="${w}" height="6" rx="3" fill="${darken(col, .35)}"/><circle cx="${x + w / 2 - 12}" cy="${y}" r="3.5" fill="${darken(col, .5)}"/>`;
}
function servingBase(c, y = 186){ return c.chance(.35) ? board(c, CX, y) : plate(c, CX, y); }

function croissantShape(c, base){
  const cy0 = 22, Rm = 46, A0 = 188, A1 = 352, n = 7;
  const pt = (a, r) => [Math.cos(a * Math.PI / 180) * r, cy0 + Math.sin(a * Math.PI / 180) * r];
  const thick = u => 6 + 36 * Math.pow(Math.sin(u * Math.PI), .85);
  const f = p => n1(p[0]) + ' ' + n1(p[1]);
  let order = [];
  for(let i = 0; i < n; i++) order.push(i);
  order.sort((a, b) => Math.abs(b - (n - 1) / 2) - Math.abs(a - (n - 1) / 2));
  let g = '';
  const grad = c.rad([[0, lighten(base, .42)], [.55, base], [1, darken(base, .42)]], .5, .45, .6);
  order.forEach(i => {
    const u0 = i / n, u1 = (i + 1) / n, um = (u0 + u1) / 2;
    const a0 = A0 + u0 * (A1 - A0), a1 = A0 + u1 * (A1 - A0), am = (a0 + a1) / 2;
    const t0 = thick(u0), t1 = thick(u1), tm = thick(um);
    const o0 = pt(a0, Rm + t0 / 2), o1 = pt(a1, Rm + t1 / 2), i1 = pt(a1, Rm - t1 / 2), i0 = pt(a0, Rm - t0 / 2);
    const om = pt(am, Rm + tm / 2 + 6), im = pt(am, Rm - tm / 2 - 1);
    const e1 = pt(a1 + 3, Rm), e0 = pt(a0 - 3, Rm);
    g += `<path d="M${f(o0)}Q${f(om)} ${f(o1)}Q${f(e1)} ${f(i1)}Q${f(im)} ${f(i0)}Q${f(e0)} ${f(o0)}Z" fill="${grad}" stroke="${darken(base, .45)}" stroke-width="1.1"/>`;
    const h0 = pt(a0 + 4, Rm + t0 / 2 - 3), h1 = pt(a1 - 4, Rm + t1 / 2 - 3), hm = pt(am, Rm + tm / 2 + 1);
    g += `<path d="M${f(h0)}Q${f(hm)} ${f(h1)}" stroke="#fff" stroke-opacity=".35" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    const l0 = pt(am - 3, Rm + tm * .2), l1 = pt(am + 3, Rm - tm * .2);
    g += `<path d="M${f(l0)}L${f(l1)}" stroke="${darken(base, .3)}" stroke-width=".8" opacity=".5"/>`;
  });
  const tip = (a, dir) => { const p = pt(a, Rm); const q = pt(a - dir * 10, Rm - 4); return `<path d="M${f(pt(a, Rm + 4))}Q${n1(q[0] - dir * 2)} ${n1(q[1] + 10)} ${n1(q[0] - dir * 4)} ${n1(q[1] + 14)}Q${f(p)} ${f(pt(a, Rm - 4))}Z" fill="${darken(base, .15)}" stroke="${darken(base, .45)}" stroke-width="1"/>`; };
  return tip(A0 + 2, -1) + tip(A1 - 2, 1) + g;
}
function croissant(variant){
  return c => {
    let s = backdrop(c) + plateTop(c, CX, CY + 6, 90);
    const base = c.pick(['#e7a64f', '#dc9442', '#eab262', '#d98c3a']);
    const rot = c.int(-18, 18);
    let g = shadow(c, 3, 14, 66, 34, .22) + croissantShape(c, base);
    if(variant === 'chocolate'){ let z = 'M-52 -8'; for(let i = 0; i < 10; i++) z += `L${-46 + i * 10} ${i % 2 ? -34 : 4}`; g += `<path d="${z}" stroke="#3a1a0a" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".92"/>`; }
    if(variant === 'almond'){ for(let i = 0; i < 18; i++){ const a = c.rand(200, 340) * Math.PI / 180, d = c.rand(34, 62); const x = Math.cos(a) * d, y = 22 + Math.sin(a) * d; g += `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="4" ry="2" fill="#f6e2b8" stroke="#c9a060" stroke-width=".6" transform="rotate(${c.int(0, 180)} ${n1(x)} ${n1(y)})"/>`; } g += dust(c, 70, 0, -6, 50, '#fff', .95, 1.1); }
    s += `<g transform="translate(${CX} ${CY + 4}) rotate(${rot}) scale(1.14)">${g}</g>`;
    const side = c.pick([-1, 1]);
    if(variant === 'plain'){
      s += `<g transform="translate(${CX + side * 58} ${CY + 60})">${shadow(c, 2, 3, 16, 12, .4)}<circle r="13" fill="#fbf6ef"/><circle r="10" fill="${c.pick(['#b8233a', '#e0752a', '#6a1f5a'])}"/><circle cx="-3" cy="-3" r="2.5" fill="#fff" opacity=".5"/></g>`;
      s += `<g transform="translate(${CX - side * 56} ${CY + 64}) rotate(${c.int(-20, 20)})"><rect x="-11" y="-8" width="22" height="16" rx="3" fill="#f7e7a8"/><rect x="-11" y="-8" width="22" height="5" rx="2" fill="#fff6d0"/></g>`;
    }
    return s;
  };
}
def('croissant', 'کیک و شیرینی', 'کروسان کره‌ای', croissant('plain'));
def('croissant-chocolate', 'کیک و شیرینی', 'کروسان شکلاتی', croissant('chocolate'));
def('croissant-almond', 'کیک و شیرینی', 'کروسان بادام', croissant('almond'));

def('kouign-amann', 'کیک و شیرینی', 'کویینگ امان', c => {
  let s = backdrop(c);
  s += plateTop(c, CX, CY, 84);
  const base = c.pick(['#c9782a', '#b8682a', '#d98a3a']);
  let g = '';
  for(let i = 0; i < 4; i++){
    g += `<path transform="rotate(${i * 90 + 45})" d="M0 0C18-10 40-8 44 0 40 8 18 10 0 0Z" fill="${c.rad([[0, lighten(base, .3)], [1, darken(base, .35)]], .7, .5, .8)}"/>`;
  }
  g += `<circle r="36" fill="${c.rad([[0, lighten(base, .35)], [.7, base], [1, darken(base, .3)]], .4, .35, .7)}"/>`;
  for(let i = 0; i < 4; i++) g += `<path transform="rotate(${i * 90})" d="M0 0L30 0" stroke="${darken(base, .35)}" stroke-width="2"/>`;
  g += `<circle r="12" fill="${lighten(base, .2)}"/>` + dust(c, 50, 0, 0, 38, '#fff3d0', .8, 1.2);
  g += `<path d="${arc(0, 0, 30, 200, 260)}" stroke="#fff" stroke-opacity=".4" stroke-width="3" fill="none"/>`;
  s += `<g transform="translate(${CX} ${CY}) rotate(${c.int(0, 90)})">${g}</g>`;
  return s;
});

function plateTop(c, x, y, r){
  const col = c.pick(['#f3ece1', '#f6f1ea', '#2d5f9a', '#232120', '#efe0c2', '#1f6f78', '#b8613b', '#8ea888', '#e7b6ae']);
  let s = shadow(c, x + 7, y + 9, r + 8, r + 8, .6);
  s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.rad([[0, lighten(col, .25)], [.8, col], [1, darken(col, .2)]], .4, .35, .75)}"/>`;
  s += `<circle cx="${x}" cy="${y}" r="${n1(r * .74)}" fill="none" stroke="${darken(col, .25)}" stroke-opacity=".35" stroke-width="1.5"/>`;
  if(c.chance(.45)) s += `<circle cx="${x}" cy="${y}" r="${r - 3}" fill="none" stroke="${GOLD}" stroke-width="1.4"/>`;
  if(c.chance(.4)){ let d = ''; const k = c.pick([12, 16, 20]); for(let i = 0; i < k; i++){ const a = i / k * Math.PI * 2; d += `<circle cx="${n1(x + Math.cos(a) * r * .87)}" cy="${n1(y + Math.sin(a) * r * .87)}" r="2" fill="${c.pick(['#2d5f9a', GOLD, '#b8233a'])}"/>`; } s += d; }
  return s;
}

def('choco-twist', 'کیک و شیرینی', 'چاکلت تویست', c => {
  let s = backdrop(c) + floor(c) + servingBase(c, 186);
  const base = '#dd9a45';
  let g = '';
  for(let i = 0; i < 7; i++){
    const x = -42 + i * 14;
    g += `<ellipse cx="${x}" cy="${i % 2 ? 4 : -4}" rx="12" ry="14" transform="rotate(${i % 2 ? 30 : -30} ${x} 0)" fill="${c.rad([[0, lighten(base, .3)], [.6, base], [1, darken(base, .4)]], .4, .3, .8)}"/>`;
    g += `<path d="M${x - 6} ${i % 2 ? 0 : -8}Q${x} ${i % 2 ? 10 : 2} ${x + 6} ${i % 2 ? 2 : -8}" stroke="#3a1a0a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }
  const two = c.chance(.5);
  if(two) s += `<g transform="translate(${CX + 6} 170) rotate(${c.int(-16, -6)}) scale(1)">${g}</g>`;
  s += `<g transform="translate(${CX} ${two ? 146 : 156}) rotate(${c.int(-12, 12)}) scale(1.1)">${g}${dust(c, 30, 0, -4, 50, '#fff', .8, 1)}</g>`;
  return s;
});

function cookie(kind){
  return c => {
    let s = backdrop(c);
    const P = {
      double: { base: '#5a2e1a', chip: ['#2a120a', '#f6e7d0'], deco: 'salt' },
      ny: { base: '#d59a52', chip: ['#3a1a0a', '#5a2e1a'], deco: 'chunk' },
      lemon: { base: '#f3dc8a', chip: ['#fff'], deco: 'lemon' }
    }[kind];
    if(c.chance(.5)) s += plateTop(c, CX, CY, 86);
    const n = c.int(2, 3);
    for(let k = 0; k < n; k++){
      const x = CX + c.rand(-26, 26) * (k ? 1 : .3), y = CY + c.rand(-26, 26) * (k ? 1 : .3), r = c.rand(30, 38);
      s += shadow(c, x + 4, y + 6, r + 4, r + 4, .5);
      s += `<path d="${blob(c, x, y, r, 12, .06)}" fill="${c.rad([[0, lighten(P.base, .2)], [.7, P.base], [1, darken(P.base, .35)]], .45, .4, .6)}"/>`;
      for(let i = 0; i < 5; i++){ const a = c.rand(0, 6.28), d = c.rand(4, r * .7); s += `<path d="M${n1(x + Math.cos(a) * d)} ${n1(y + Math.sin(a) * d)}l${c.int(-8, 8)} ${c.int(-6, 6)}l${c.int(-6, 6)} ${c.int(-6, 6)}" stroke="${darken(P.base, .3)}" stroke-width="1" fill="none" opacity=".6"/>`; }
      if(P.deco !== 'lemon'){
        for(let i = 0; i < c.int(6, 10); i++){ const a = c.rand(0, 6.28), d = c.rand(0, r * .75), cx = x + Math.cos(a) * d, cy = y + Math.sin(a) * d; s += `<path d="${blob(c, cx, cy, P.deco === 'chunk' ? c.rand(4, 7) : c.rand(2.5, 4), 6, .3)}" fill="${c.pick(P.chip)}"/>`; }
        if(P.deco === 'salt') s += dust(c, 12, x, y, r * .7, '#fff', 1, 1.4);
      } else {
        for(let i = 0; i < 6; i++){ const a = c.rand(0, 6.28), d = c.rand(4, r * .7); s += `<path d="M${n1(x + Math.cos(a) * d)} ${n1(y + Math.sin(a) * d)}l${c.int(-10, 10)} ${c.int(-8, 8)}" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".9"/>`; }
        s += dust(c, 20, x, y, r * .8, '#fff', .9, 1.1) + dust(c, 8, x, y, r * .6, '#e0b020', .9, 1.2);
      }
    }
    if(kind === 'lemon') s += citrusWheel(c, c.pick([40, 160]), c.pick([44, 206]), 18, 'lemon', c.rand(0, 3));
    if(kind === 'double' && c.chance(.6)){ s += `<g transform="translate(${c.pick([38, 162])} ${c.pick([42, 210])}) rotate(${c.int(-30, 30)})"><rect x="-16" y="-11" width="32" height="22" rx="2" fill="#3a1a0a"/><path d="M-5-11V11M6-11V11M-16 0H16" stroke="#1e0a04" stroke-width="1.2"/></g>`; }
    return s;
  };
}
def('cookie-double', 'کیک و شیرینی', 'کوکی دبل چاکلت', cookie('double'));
def('cookie-ny', 'کیک و شیرینی', 'کوکی نیویورکی', cookie('ny'));
def('cookie-lemon', 'کیک و شیرینی', 'کوکی لیمویی', cookie('lemon'));

def('cinnamon-roll', 'کیک و شیرینی', 'سینامون رول', c => {
  let s = backdrop(c) + plateTop(c, CX, CY, 88);
  const base = c.pick(['#d9924a', '#c98040', '#e0a050']);
  s += shadow(c, CX + 4, CY + 6, 60, 60, .5);
  s += `<circle cx="${CX}" cy="${CY}" r="54" fill="${c.rad([[0, lighten(base, .25)], [.8, base], [1, darken(base, .3)]])}"/>`;
  s += `<g transform="translate(${CX} ${CY}) rotate(${c.int(0, 360)})"><path d="${spiral(3.2, 3, 50)}" stroke="${darken(base, .45)}" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="${spiral(3.2, 3, 50)}" stroke="${lighten(base, .3)}" stroke-width="1.2" fill="none" transform="translate(-1.5 -1.5)"/>`;
  let z = 'M-44 -20';
  for(let i = 0; i < 9; i++) z += `Q${-40 + i * 10} ${i % 2 ? 30 : -30} ${-34 + i * 10} ${i % 2 ? -18 : 18}`;
  s += `<path d="${z}" stroke="#fffaf0" stroke-width="4" fill="none" stroke-linecap="round" opacity=".95" transform="rotate(${c.int(0, 180)})"/></g>`;
  s += dust(c, 30, CX, CY, 50, '#6a3212', .6);
  return s;
});

def('pastel-nata', 'کیک و شیرینی', 'پاستل د ناتا', c => {
  let s = backdrop(c);
  const n = c.int(1, 3);
  const pos = n === 1 ? [[CX, CY, 58]] : n === 2 ? [[CX - 34, CY - 18, 42], [CX + 32, CY + 24, 42]] : [[CX - 36, CY - 28, 36], [CX + 36, CY - 16, 36], [CX, CY + 40, 36]];
  if(c.chance(.6)) s += plateTop(c, CX, CY, 92);
  pos.forEach(([x, y, r]) => {
    s += shadow(c, x + 4, y + 6, r + 4, r + 4, .55);
    let crust = 'M';
    const k = 16;
    for(let i = 0; i <= k * 2; i++){ const a = i / (k * 2) * Math.PI * 2, rr = i % 2 ? r : r * .92; crust += `${i ? 'L' : ''}${n1(x + Math.cos(a) * rr)} ${n1(y + Math.sin(a) * rr)}`; }
    s += `<path d="${crust}Z" fill="${c.rad([[0, '#f2c27a'], [1, '#a8601e']])}"/>`;
    s += `<circle cx="${x}" cy="${y}" r="${n1(r * .78)}" fill="${c.rad([[0, '#ffe7a0'], [.7, '#f6c85a'], [1, '#d8943a']])}"/>`;
    for(let i = 0; i < c.int(4, 8); i++){ const a = c.rand(0, 6.28), d = c.rand(0, r * .6); s += `<path d="${blob(c, x + Math.cos(a) * d, y + Math.sin(a) * d, c.rand(3, 8), 7, .35)}" fill="${c.pick(['#5a2a0a', '#7a3a10', '#3a1a06'])}" opacity="${n1(c.rand(.5, .9) * 100) / 100}"/>`; }
    s += `<path d="${arc(x, y, r * .6, 200, 250)}" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  });
  if(c.chance(.5)) s += cinnamonStick(c, c.pick([36, 164]), c.pick([40, 214]), c.rand(0, 180), 54);
  return s;
});

function wedge(c, o){
  const x = CX + c.rand(-6, 6), y = 150, w = 64, h = o.h || 46, d = 30;
  let s = '';
  const tip = [x - w + 6, y + 18], back = [x + w - 10, y - 4], backL = [x + 4, y - 26];
  const top = `M${tip[0]} ${tip[1] - h}L${backL[0]} ${backL[1] - h}L${back[0]} ${back[1] - h}Z`;
  const side = `M${tip[0]} ${tip[1] - h}L${back[0]} ${back[1] - h}L${back[0]} ${back[1]}L${tip[0]} ${tip[1]}Z`;
  const end = `M${back[0]} ${back[1] - h}L${backL[0]} ${backL[1] - h}L${backL[0]} ${backL[1]}L${back[0]} ${back[1]}Z`;
  s += shadow(c, x + 4, y + 18, 72, 16, .55);
  s += `<path d="${end}" fill="${darken(o.crust || o.layers[0], .25)}"/>`;
  const clip = c.clip(`<path d="${side}"/>`);
  let bands = '';
  let acc = 0;
  const tot = o.layers.length;
  o.layers.forEach((col, i) => {
    const hh = h / tot;
    bands += `<path d="M0 ${n1(tip[1] - h + acc)}L200 ${n1(tip[1] - h + acc - 22 * 1.5)}V${n1(tip[1] - h + acc + hh - 22 * 1.5)}L0 ${n1(tip[1] - h + acc + hh)}Z" fill="${col}"/>`;
    acc += hh;
  });
  s += `<g clip-path="${clip}"><rect width="200" height="240" fill="${o.layers[0]}"/>${bands}${o.sideExtra ? o.sideExtra(tip, back, h) : ''}</g>`;
  s += `<path d="${side}" fill="none" stroke="#000" stroke-opacity=".12"/>`;
  s += `<path d="${top}" fill="${o.top}"/>`;
  if(o.topExtra) s += o.topExtra(tip, back, backL, h);
  return s;
}
function cake(kind){
  return c => {
    let s = backdrop(c) + floor(c) + plate(c, CX, 180, 84, 22);
    const K = {
      mocha: { layers: ['#5a2e1a', '#e8d2b0', '#5a2e1a', '#e8d2b0', '#4a2412'], top: '#3a1a0a', extra: 'beans' },
      redvelvet: { layers: ['#9a1a2a', '#fbf4ea', '#9a1a2a', '#fbf4ea', '#8a1424'], top: '#fbf4ea', extra: 'crumbs' },
      tresleches: { layers: ['#f2d49a', '#f7e4b8', '#f2d49a', '#fff8ea'], top: '#fffaf0', extra: 'cherry' },
      walnut: { layers: ['#c08a4a', '#b07a3a', '#c08a4a'], top: '#8a5a2a', extra: 'walnut', h: 40 },
      apple: { layers: ['#e8b870', '#f2cc88', '#e0a860'], top: '#c9782a', extra: 'apple', h: 38 },
      cheesecake: { layers: ['#f7e3a8', '#f7e3a8', '#f1d890', '#c07a2a'], top: '#3a1a08', extra: 'burnt', h: 52 }
    }[kind];
    if(kind === 'tresleches') s += `<ellipse cx="${CX}" cy="176" rx="64" ry="14" fill="#fffaf0" opacity=".9"/>`;
    s += wedge(c, {
      layers: K.layers, top: K.top, h: K.h,
      sideExtra: kind === 'walnut' ? (t, b) => { let q = ''; for(let i = 0; i < 8; i++) q += `<path d="${blob(c, c.rand(t[0] + 10, b[0] - 10), c.rand(b[1] - 30, t[1] - 8), 3.5, 6, .3)}" fill="#6a3a1a"/>`; return q; } : kind === 'cheesecake' ? (t, b, h) => `<path d="M${t[0]} ${t[1] - h}L${b[0]} ${b[1] - h}V${b[1] - h + 8}L${t[0]} ${t[1] - h + 8}Z" fill="#8a4a14"/>` : null,
      topExtra: (t, b, bl, h) => {
        let q = '';
        const cx = (t[0] + b[0] + bl[0]) / 3, cy = (t[1] + b[1] + bl[1]) / 3 - h;
        if(K.extra === 'beans') for(let i = 0; i < 3; i++) q += bean(c, cx - 14 + i * 14, cy + c.rand(-3, 3), c.rand(0, 360), .7);
        if(K.extra === 'crumbs') q += dust(c, 30, cx, cy, 16, '#9a1a2a', 1, 2);
        if(K.extra === 'cherry') q += cherry(c, cx + 6, cy, .9) + dust(c, 20, cx, cy, 14, '#b07a3a', .7);
        if(K.extra === 'walnut') for(let i = 0; i < 3; i++) q += `<path d="${blob(c, cx - 14 + i * 14, cy + c.rand(-3, 3), 5, 7, .3)}" fill="${c.ball('#8a5a2a')}"/>`;
        if(K.extra === 'apple') for(let i = 0; i < 5; i++) q += `<path d="M${n1(cx - 22 + i * 10)} ${n1(cy + 4)}a7 7 0 0 1 12 -6" stroke="#f6e2a0" stroke-width="3.5" fill="none"/><path d="M${n1(cx - 22 + i * 10)} ${n1(cy + 4)}a7 7 0 0 1 12 -6" stroke="#b8233a" stroke-width="1" fill="none" transform="translate(-1 -1.5)"/>`;
        if(K.extra === 'burnt') for(let i = 0; i < 8; i++) q += `<path d="${blob(c, cx + c.rand(-24, 24), cy + c.rand(-6, 6), c.rand(3, 7), 7, .35)}" fill="${c.pick(['#1a0a02', '#5a2a0a'])}" opacity=".7"/>`;
        return q;
      }
    });
    if(kind === 'cheesecake'){
      s += `<path d="M${CX - 70} 150L${CX - 60} 130M${CX + 60} 120L${CX + 70} 100" stroke="#e8dcc4" stroke-width="3" opacity=".6"/>`;
    }
    if(c.chance(.6)) s += `<g transform="translate(${CX + 62} 186) rotate(${c.int(-20, 10)})"><rect x="-2" y="-30" width="4" height="36" rx="2" fill="#cfcac2"/><rect x="-5" y="-40" width="10" height="12" rx="2" fill="#cfcac2"/><path d="M-4-40V-46M0-40V-46M4-40V-46" stroke="#cfcac2" stroke-width="1.4"/></g>`;
    return s;
  };
}
def('cake-mocha', 'کیک و شیرینی', 'کیک موکا', cake('mocha'));
def('cake-redvelvet', 'کیک و شیرینی', 'کیک ردولوت', cake('redvelvet'));
def('cake-tresleches', 'کیک و شیرینی', 'کیک سه شیر', cake('tresleches'));
def('cake-walnut', 'کیک و شیرینی', 'کیک گردویی', cake('walnut'));
def('cake-apple', 'کیک و شیرینی', 'کیک سیب و دارچین', cake('apple'));
def('cheesecake', 'کیک و شیرینی', 'چیزکیک سن‌سباستین', cake('cheesecake'));

def('brownie', 'کیک و شیرینی', 'براونی', c => {
  let s = backdrop(c) + plateTop(c, CX, CY, 88);
  const n = c.int(2, 4);
  const pos = [[-24, -20], [24, -14], [-10, 28], [30, 32]];
  for(let i = 0; i < n; i++){
    const [dx, dy] = pos[i], x = CX + dx + c.rand(-4, 4), y = CY + dy + c.rand(-4, 4), rot = c.rand(-20, 20), w = c.rand(38, 46);
    let g = shadow(c, 4, 6, w * .7, w * .7, .6);
    g += `<rect x="${n1(-w / 2)}" y="${n1(-w / 2)}" width="${n1(w)}" height="${n1(w)}" rx="4" fill="#2a1006"/>`;
    g += `<rect x="${n1(-w / 2 + 3)}" y="${n1(-w / 2 + 2)}" width="${n1(w - 6)}" height="${n1(w - 7)}" rx="3" fill="${c.rad([[0, '#6a3a20'], [.7, '#4a2412'], [1, '#2e140a']], .4, .35, .8)}"/>`;
    for(let j = 0; j < 5; j++) g += `<path d="M${n1(c.rand(-w / 2 + 5, w / 2 - 5))} ${n1(c.rand(-w / 2 + 5, w / 2 - 5))}l${c.int(-9, 9)} ${c.int(-6, 6)}l${c.int(-7, 7)} ${c.int(-7, 7)}" stroke="#8a5a3a" stroke-width="1" fill="none" opacity=".8"/>`;
    for(let j = 0; j < 3; j++) g += `<path d="${blob(c, c.rand(-w / 3, w / 3), c.rand(-w / 3, w / 3), 3.4, 6, .3)}" fill="${c.ball('#9a6a3a')}"/>`;
    g += `<path d="M${n1(-w / 2 + 6)} ${n1(-w / 2 + 6)}L${n1(w / 2 - 12)} ${n1(-w / 2 + 6)}" stroke="#fff" stroke-opacity=".18" stroke-width="3" stroke-linecap="round"/>`;
    s += `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)})">${g}</g>`;
  }
  s += dust(c, 60, CX, CY, 60, '#fff', .8, 1.1);
  if(c.chance(.5)) s += mintSprig(c, c.pick([34, 166]), c.pick([48, 214]), c.rand(-40, 40), .9);
  return s;
});

def('dessert-cup', 'کیک و شیرینی', 'دسر لیوانی کاراملی', c => {
  let s = backdrop(c) + floor(c);
  const car = c.pick(['#c97a2b', '#b5651d', '#d88c32']);
  const r = drawGlass(c, c.pick(['tumbler', 'rocks', 'jar']), (g, lt) => {
    const hh = g.bot - lt;
    const bands = [['#a8743f', .22], ['#fbf3e6', .22], ['#d9a86a', .16], ['#fbf3e6', .2], [car, .2]].reverse();
    let acc = lt, l = '';
    bands.forEach(([col, f]) => { const h2 = hh * f; l += `<path d="M0 ${n1(acc + 3)}Q50 ${n1(acc - 2)} 100 ${n1(acc + 3)}T200 ${n1(acc + 3)}V${n1(acc + h2 + 4)}H0Z" fill="${col}"/>`; acc += h2; });
    l += dust(c, 30, CX, g.bot - hh * .12, 30, '#7a4a1a', .9, 1.6);
    return l;
  }, { level: null });
  s += r.s;
  s += `<g transform="translate(${CX + 8} ${r.g.top - 4}) rotate(${c.int(-30, -10)})"><rect x="-14" y="-10" width="28" height="20" rx="2" fill="${c.hcyl('#c98a3a')}"/><path d="M-10-6H10M-10 0H10M-10 6H10" stroke="#a86a2a" stroke-width=".8"/></g>`;
  s += `<path d="M${CX - r.g.tw + 4} ${r.g.top + 2}q10 10 20 0t20 0t20 0" stroke="${car}" stroke-width="3" fill="none"/>`;
  s += spoon(c, CX + c.pick([-60, 60]), 214, c.pick([0, 180]), .7);
  return s;
});

def('toast', 'میان وعده', 'تست ساندویچ', c => {
  let s = backdrop(c) + floor(c) + servingBase(c, 194);
  const wav = (x0, x1, y, amp, per, rev) => {
    const pts = [];
    for(let x = x0; x <= x1 + .01; x += per / 4) pts.push([x, y + Math.sin((x - x0) / per * Math.PI * 2) * amp]);
    if(rev) pts.reverse();
    return pts.map(p => `L${n1(p[0])} ${n1(p[1])}`).join('');
  };
  const piece = (x, y, w, H, depth, flip) => {
    const x1 = x + w, y0 = y - H;
    let g = '';
    const face = `M${x} ${y0}H${x1}V${y}H${x}Z`;
    const cl = c.clip(`<path d="${face}"/>`);
    let f = `<rect x="${x}" y="${y0}" width="${w}" height="${H}" fill="#f6e2b8"/>`;
    const b = (t, h, col, amp) => `<path d="M${x} ${n1(y0 + t)}${wav(x, x1, y0 + t, amp, 14)}${wav(x, x1, y0 + t + h, amp, 14, true)}Z" fill="${col}"/>`;
    f += b(H * .25, H * .1, '#e2453a', 1);
    f += b(H * .34, H * .1, '#f6c742', .6);
    for(let k = 0; k < 5; k++){ const dx = x + 8 + k * (w - 16) / 4; f += `<path d="M${n1(dx - 3)} ${n1(y0 + H * .44)}L${n1(dx)} ${n1(y0 + H * .54)}L${n1(dx + 3)} ${n1(y0 + H * .44)}Z" fill="#f6c742"/>`; }
    f += b(H * .43, H * .18, '#f3a9a2', 1.6);
    f += `<path d="M${x} ${n1(y0 + H * .52)}${wav(x, x1, y0 + H * .52, 1.4, 10)}" stroke="#f9cbc4" stroke-width="1.2" fill="none"/>`;
    f += b(H * .6, H * .1, '#6cbf4a', 2.4);
    f += dust(c, 26, x + w / 2, y0 + H * .12, w * .45, '#d9b27a', .9, 1.3) + dust(c, 20, x + w / 2, y0 + H * .85, w * .45, '#d9b27a', .9, 1.3);
    g += `<g clip-path="${cl}">${f}</g>`;
    g += `<path d="${face}" fill="none" stroke="#b8732a" stroke-width="3"/>`;
    const apex = [x + w * .5 + flip * w * .18, y0 - depth];
    const top = `M${x} ${y0}L${x1} ${y0}L${n1(apex[0])} ${n1(apex[1])}Z`;
    const tcl = c.clip(`<path d="${top}"/>`);
    g += `<path d="${top}" fill="${c.lin([[0, '#e2a352'], [1, '#c8802c']])}" stroke="#a8601e" stroke-width="3" stroke-linejoin="round"/>`;
    let marks = '';
    for(let k = -2; k <= 3; k++) marks += `<path d="M${n1(x + k * 22)} ${y0}L${n1(x + k * 22 + 36)} ${n1(y0 - depth)}" stroke="#7a3a10" stroke-width="3" opacity=".45"/>`;
    g += `<g clip-path="${tcl}">${marks}</g>`;
    return g;
  };
  const back = c.chance(.5) ? 1 : -1;
  let sw = shadow(c, CX + 4, 192, 80, 12, .5);
  sw += piece(CX - 44 + back * 8, 166, 96, 34, 30, back);
  sw += piece(CX - 60 - back * 6, 192, 112, 40, 34, -back);
  const tx = CX - 4 + c.rand(-10, 10);
  sw += `<path d="M${n1(tx)} 150V96" stroke="#e8d4a8" stroke-width="2.2"/><circle cx="${n1(tx)}" cy="93" r="6" fill="${c.ball(c.pick(['#3a4a1a', '#1a1a1a', '#6a7a2a']))}"/><circle cx="${n1(tx)}" cy="93" r="2" fill="#b8233a"/>`;
  s += `<g transform="translate(${CX} 194) scale(1.14) translate(${-CX} -194)">${sw}</g>`;
  const gx = CX + c.pick([-62, 62]);
  for(let k = 0; k < 3; k++) s += `<g transform="translate(${n1(gx + k * 9 - 9)} ${n1(200 + (k % 2) * 4)})"><ellipse rx="8" ry="5" fill="#6f9a3a" stroke="#4a6a20"/><circle r="1" cx="-2" fill="#e8f0c0"/><circle r="1" cx="2" fill="#e8f0c0"/></g>`;
  return s;
});
def('egg-skillet', 'میان وعده', 'تابه تخم‌مرغ و پپرونی', c => {
  let s = backdrop(c);
  const hx = c.rand(-40, 40) * Math.PI / 180 - Math.PI / 4;
  s += shadow(c, CX + 8, CY + 10, 90, 90, .6);
  s += `<g transform="translate(${CX} ${CY}) rotate(${n1(hx * 180 / Math.PI)})"><rect x="70" y="-9" width="46" height="18" rx="6" fill="#2a2a2a"/><circle cx="106" cy="0" r="3.5" fill="#111"/></g>`;
  s += `<circle cx="${CX}" cy="${CY}" r="80" fill="${c.rad([[0, '#3a3a3a'], [1, '#141414']])}"/><circle cx="${CX}" cy="${CY}" r="68" fill="${c.rad([[0, '#2a2a2a'], [1, '#1a1a1a']])}"/>`;
  const eggs = c.int(2, 3);
  for(let i = 0; i < eggs; i++){
    const a = i / eggs * 6.28 + c.rand(0, 1), x = CX + Math.cos(a) * 26, y = CY + Math.sin(a) * 26;
    s += `<path d="${blob(c, x, y, 26, 10, .18)}" fill="#fffaf0"/><path d="${blob(c, x, y, 26, 10, .18)}" fill="none" stroke="#e8b060" stroke-width="2" opacity=".6"/>`;
    s += `<circle cx="${n1(x + 2)}" cy="${n1(y + 2)}" r="10" fill="${c.ball('#f7a51c')}"/><circle cx="${n1(x - 1)}" cy="${n1(y - 1)}" r="3" fill="#fff" opacity=".55"/>`;
  }
  for(let i = 0; i < c.int(5, 9); i++){ const a = c.rand(0, 6.28), d = c.rand(10, 56), x = CX + Math.cos(a) * d, y = CY + Math.sin(a) * d; s += `<circle cx="${n1(x)}" cy="${n1(y)}" r="7" fill="${c.ball('#b8302a')}"/>${dust(c, 4, x, y, 5, '#6a1410', 1, 1)}`; }
  s += dust(c, 40, CX, CY, 60, '#3f8a3a', .9, 1.4) + dust(c, 20, CX, CY, 60, '#111', .9, 1);
  return s;
});

def('focaccia', 'میان وعده', 'فوکاچیا پنیری', c => {
  let s = backdrop(c);
  s += `<g transform="translate(${CX} ${CY}) rotate(${c.int(-12, 12)})">`;
  s += shadow(c, 6, 8, 80, 66, .6);
  s += `<rect x="-72" y="-58" width="144" height="116" rx="14" fill="${c.rad([[0, '#f6cf82'], [.8, '#e0a456'], [1, '#b8762c']])}"/>`;
  for(let i = 0; i < 18; i++){ const x = c.rand(-60, 60), y = c.rand(-46, 46); s += `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="3.5" ry="3" fill="#c98a3a"/><ellipse cx="${n1(x - .8)}" cy="${n1(y - .8)}" rx="2" ry="1.6" fill="#fff" opacity=".35"/>`; }
  for(let i = 0; i < c.int(4, 7); i++) s += `<path d="${blob(c, c.rand(-50, 50), c.rand(-36, 36), c.rand(8, 14), 9, .3)}" fill="#fff4d0" opacity=".85"/>`;
  for(let i = 0; i < c.int(3, 6); i++){ const x = c.rand(-50, 50), y = c.rand(-40, 40); s += `<circle cx="${n1(x)}" cy="${n1(y)}" r="7" fill="${c.ball('#e0302a')}"/><circle cx="${n1(x)}" cy="${n1(y)}" r="3" fill="#ffb0a0" opacity=".6"/>`; }
  for(let i = 0; i < 6; i++){ const x = c.rand(-56, 56), y = c.rand(-44, 44), r = c.int(0, 180); s += `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${r})"><path d="M-10 0H10" stroke="#3d5a2a" stroke-width="1.2"/>${[-8, -4, 0, 4, 8].map(k => `<path d="M${k} 0l-2-4M${k} 0l-2 4" stroke="#4a6a3a" stroke-width="1.2"/>`).join('')}</g>`; }
  s += dust(c, 40, 0, 0, 60, '#fff', .8, 1);
  s += `</g>`;
  return s;
});

def('syrup', 'افزودنی', 'بطری سیروپ', c => {
  let s = backdrop(c) + floor(c);
  const liq = c.tint || c.pick(['#c97a2b', '#8a1a2a', '#4a7a2a', '#6a3a1a', '#d4a020', '#b8233a']);
  const x = CX + c.rand(-8, 8);
  s += shadow(c, x + 4, 202, 40, 8, .6);
  const body = `M${x - 26} 94Q${x - 26} 84 ${x - 16} 80L${x - 12} 62H${x + 12}L${x + 16} 80Q${x + 26} 84 ${x + 26} 94V194Q${x + 26} 200 ${x + 20} 200H${x - 20}Q${x - 26} 200 ${x - 26} 194Z`;
  s += `<path d="${body}" fill="${c.hcyl(liq)}"/><path d="${body}" fill="${c.glass()}" stroke="rgba(255,255,255,.4)"/>`;
  s += `<rect x="${x - 22}" y="120" width="44" height="50" rx="3" fill="${c.pick(['#f6eee1', '#1a1a1a', '#efe0c2'])}"/><path transform="translate(${x} 145)" d="${starPath(8, 12, 6)}" fill="none" stroke="${liq}" stroke-width="1.4"/><path d="M${x - 16} 126H${x + 16}M${x - 16} 164H${x + 16}" stroke="${GOLD}" stroke-width="1"/>`;
  s += `<rect x="${x - 10}" y="50" width="20" height="14" rx="2" fill="#1a1a1a"/><rect x="${x - 3}" y="30" width="6" height="22" fill="#2a2a2a"/><path d="M${x} 32H${x + 24}V38" stroke="#2a2a2a" stroke-width="5" fill="none" stroke-linejoin="round"/><rect x="${x - 12}" y="24" width="24" height="8" rx="3" fill="#1a1a1a"/>`;
  s += `<path d="M${x - 19} 96V190" stroke="#fff" stroke-opacity=".3" stroke-width="3" stroke-linecap="round"/>`;
  return s;
});

def('honey', 'افزودنی', 'ظرف عسل و قاشق', c => {
  let s = backdrop(c) + floor(c);
  const x = CX - 10;
  s += shadow(c, x + 4, 202, 48, 9, .6);
  const jar = `M${x - 36} 110Q${x - 40} 110 ${x - 40} 120V190Q${x - 40} 200 ${x - 30} 200H${x + 30}Q${x + 40} 200 ${x + 40} 190V120Q${x + 40} 110 ${x + 36} 110Z`;
  s += `<path d="${jar}" fill="${c.lin([[0, '#f7c040'], [1, '#c77a0a']])}"/><path d="${jar}" fill="${c.glass()}" stroke="rgba(255,255,255,.45)"/>`;
  let hex = '';
  for(let r = 0; r < 3; r++) for(let q = 0; q < 4; q++){ const hx = x - 24 + q * 16 + (r % 2) * 8, hy = 140 + r * 14; hex += `<path transform="translate(${hx} ${hy})" d="M0-8L7-4V4L0 8-7 4V-4Z" fill="none" stroke="#fff3c0" stroke-opacity=".5"/>`; }
  s += hex;
  s += `<rect x="${x - 38}" y="98" width="76" height="14" rx="3" fill="${c.pick(['#b8233a', '#2d5f9a', '#efe0c2', '#1f6f78'])}"/><path d="M${x - 38} 112q9 8 19 0t19 0 19 0 19 0" fill="${c.pick(['#b8233a', '#2d5f9a', '#f3ece1'])}"/>`;
  s += `<g transform="translate(${x + 40} 90) rotate(38)"><rect x="-3" y="-60" width="6" height="70" rx="3" fill="#b98a4e"/><g transform="translate(0 16)"><ellipse rx="11" ry="14" fill="#d59a3a"/><path d="M-11-6H11M-11 1H11M-10 8H10" stroke="#8a5a1a" stroke-width="2"/></g></g>`;
  s += `<path d="M${x + 30} 128q-2 20 1 36" stroke="#e8a82a" stroke-width="4" fill="none" stroke-linecap="round"/><circle class="az-drip" cx="${x + 31}" cy="170" r="3.2" fill="#e8a82a"/>`;
  return s;
});

function sauce(col, name){
  return c => {
    let s = backdrop(c);
    s += plateTop(c, CX, CY + 10, 84);
    s += shadow(c, CX + 4, CY + 14, 54, 54, .5);
    const bowl = c.pick(['#f3ece1', '#232120', '#2d5f9a', '#efe0c2']);
    s += `<circle cx="${CX}" cy="${CY + 10}" r="48" fill="${c.ball(bowl)}"/><circle cx="${CX}" cy="${CY + 10}" r="40" fill="${c.rad([[0, lighten(col, .25)], [.7, col], [1, darken(col, .35)]], .45, .4, .6)}"/>`;
    s += `<g transform="translate(${CX} ${CY + 10})"><path d="${spiral(2, 3, 30)}" stroke="${lighten(col, .35)}" stroke-width="3" fill="none" opacity=".6"/></g>`;
    s += `<path d="${arc(CX, CY + 10, 34, 200, 250)}" stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    s += spoon(c, CX + 50, CY - 40, 130, .9);
    s += `<path d="M${CX + 22} ${CY - 16}q-4 12 -2 22" stroke="${col}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    return s;
  };
}
def('sauce-chocolate', 'افزودنی', 'سس شکلات', sauce('#4a2210'));
def('sauce-caramel', 'افزودنی', 'سس کارامل', sauce('#c97a2b'));

def('water', 'افزودنی', 'آب معدنی', c => {
  let s = backdrop(c, c.pick(['#1c3a5e', '#13294a', '#0e3b3b', '#173840'])) + floor(c);
  const x = CX - 20;
  s += shadow(c, x + 4, 202, 30, 7, .6);
  const b = `M${x - 18} 96Q${x - 18} 80 ${x - 8} 72L${x - 7} 52H${x + 7}L${x + 8} 72Q${x + 18} 80 ${x + 18} 96V194Q${x + 18} 200 ${x + 12} 200H${x - 12}Q${x - 18} 200 ${x - 18} 194Z`;
  s += `<path d="${b}" fill="rgba(170,215,240,.28)" stroke="rgba(255,255,255,.6)" stroke-width="1.6"/>`;
  s += `<rect x="${x - 8}" y="40" width="16" height="13" rx="2" fill="${c.pick(['#2d6fb0', '#e8453c', '#f6eee1'])}"/>`;
  s += `<rect x="${x - 18}" y="126" width="36" height="34" fill="${c.pick(['#f6eee1', '#2d6fb0'])}"/><path d="M${x - 18} 146q6-5 12 0t12 0 12 0" stroke="#5aa0d8" stroke-width="2" fill="none"/>`;
  s += `<path d="M${x - 12} 96V186" stroke="#fff" stroke-opacity=".4" stroke-width="3" stroke-linecap="round"/>`;
  for(let i = 0; i < 10; i++) s += `<ellipse cx="${n1(x + c.rand(-14, 14))}" cy="${n1(c.rand(100, 190))}" rx="1.2" ry="1.8" fill="#fff" fill-opacity=".55"/>`;
  const gx = CX + 36;
  s += shadow(c, gx + 2, 202, 26, 6, .5);
  s += `<path d="M${gx - 20} 140H${gx + 20}L${gx + 16} 200H${gx - 16}Z" fill="${c.glass()}" stroke="rgba(255,255,255,.6)" stroke-width="1.6"/><path d="M${gx - 18} 156H${gx + 18}L${gx + 16} 199H${gx - 16}Z" fill="rgba(170,215,240,.3)"/>`;
  s += bubbles(c, 6, gx - 12, gx + 12, 160, 196) + citrusWheel(c, gx + 16, 142, 12, 'lemon', 0);
  return s;
});

def('shot', 'افزودنی', 'شات اسپرسو', c => {
  let s = backdrop(c) + floor(c);
  const n = c.int(1, 2);
  for(let i = 0; i < n; i++){
    const x = n === 1 ? CX : CX - 26 + i * 52, top = 132 + i * 6;
    const p = `M${x - 22} ${top}L${x + 22} ${top}L${x + 18} 198H${x - 18}Z`;
    s += shadow(c, x + 3, 202, 30, 6, .6);
    const clip = c.clip(`<path d="${p}"/>`);
    s += `<g clip-path="${clip}"><rect y="${top + 10}" width="200" height="80" fill="${c.lin([[0, '#e8b070'], [.18, '#b8763a'], [.3, '#6a3a1a'], [1, '#2a1206']])}"/></g>`;
    s += `<path d="${p}" fill="${c.glass()}" stroke="rgba(255,255,255,.6)" stroke-width="1.6"/><path d="M${x - 18} 194H${x + 18}" stroke="rgba(255,255,255,.4)" stroke-width="6"/>`;
    for(let k = 1; k <= 2; k++) s += `<path d="M${x + 12} ${top + 14 * k + 10}H${x + 19}" stroke="#fff" stroke-opacity=".5"/>`;
  }
  s += beansAround(c, c.int(3, 6), 60, 92, CX, 206);
  return s;
});

def('icecream', 'افزودنی', 'بستنی', c => {
  let s = backdrop(c) + floor(c);
  const bowl = c.pick(['#f3ece1', '#2d5f9a', '#232120', '#1f6f78', '#e7b6ae', '#efe0c2']);
  const rimY = 146, rx = 58, ry = 11;
  s += shadow(c, CX + 4, 206, 64, 10, .6);
  s += `<path d="M${CX - 14} 196h28l5 10h-38z" fill="${darken(bowl, .15)}"/>`;
  s += `<ellipse cx="${CX}" cy="${rimY}" rx="${rx}" ry="${ry}" fill="${lighten(bowl, .15)}"/><ellipse cx="${CX}" cy="${rimY + 1}" rx="${rx - 4}" ry="${ry - 3}" fill="${darken(bowl, .35)}"/>`;
  const flavors = [['#f6e9c8', 'vanilla'], ['#f3c44a', 'saffron'], ['#5a2e1a', 'choco'], ['#f7b0c4', 'straw'], ['#b8d68a', 'pistachio']];
  const k = c.int(2, 3);
  const xs = k === 2 ? [-18, 18] : [-26, 26, 0];
  const ys = k === 2 ? [136, 138] : [140, 141, 120];
  for(let i = 0; i < k; i++){
    const f = c.pick(flavors);
    const x = CX + xs[i] + c.rand(-3, 3), y = ys[i] + c.rand(-2, 2), r = k === 2 ? c.rand(25, 28) : c.rand(22, 25);
    s += `<path d="${blob(c, x, y, r, 11, .08)}" fill="${c.rad([[0, lighten(f[0], .35)], [.7, f[0]], [1, darken(f[0], .2)]], .4, .3, .8)}"/>`;
    s += `<path d="${arc(x, y, r * .6, 200, 250)}" stroke="#fff" stroke-opacity=".45" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    if(f[1] === 'saffron') s += dust(c, 14, x, y, r * .7, '#5a8a2a', 1, 1.6) + `<path d="${blob(c, x + 6, y + 4, 6, 6, .3)}" fill="#fffaf0" opacity=".9"/>`;
    if(f[1] === 'choco') s += dust(c, 10, x, y, r * .7, '#2a1006', 1, 1.5);
    if(f[1] === 'straw') s += dust(c, 12, x, y, r * .7, '#c2183a', 1, 1.3);
    if(f[1] === 'pistachio') s += dust(c, 12, x, y, r * .7, '#4a7a2a', 1, 1.5);
  }
  if(c.chance(.6)) s += `<g transform="translate(${CX + 24} 150) rotate(-62)"><rect x="0" y="-5" width="54" height="10" rx="4" fill="${c.hcyl('#d9a35a')}"/><path d="M8 -5V5M16 -5V5M24 -5V5M32 -5V5M40 -5V5M48 -5V5" stroke="#a86f2c" stroke-width=".8" opacity=".6"/></g>`;
  const front = `M${CX - rx} ${rimY}A${rx} ${ry} 0 0 0 ${CX + rx} ${rimY}C${CX + rx} ${rimY + 36} ${CX + 32} 198 ${CX} 198S${CX - rx} ${rimY + 36} ${CX - rx} ${rimY}Z`;
  s += `<path d="${front}" fill="${c.hcyl(bowl)}"/>`;
  s += `<path d="M${CX - rx} ${rimY}A${rx} ${ry} 0 0 0 ${CX + rx} ${rimY}" fill="none" stroke="${lighten(bowl, .4)}" stroke-width="2.5"/>`;
  if(c.chance(.5)){ for(let i = 0; i < 9; i++){ const t = i / 8, x = CX - 44 + t * 88; s += `<circle cx="${n1(x)}" cy="${n1(rimY + 22 + Math.sin(t * Math.PI) * 10)}" r="2" fill="${bowl === '#f3ece1' || bowl === '#efe0c2' ? '#2d5f9a' : GOLD}"/>`; } }
  return s;
});

def('nabat', 'افزودنی', 'نبات زعفرانی', c => {
  let s = backdrop(c, c.pick(['#5a3a12', '#402b1e', '#3e1f15', '#1c3a5e', '#1f4e8c'])) + floor(c);
  const crystal = (x, y, r, rot) => {
    let d = '';
    for(let i = 0; i < 6; i++){ const a = (i / 6 * 360 + rot) * Math.PI / 180, rr = r * c.rand(.75, 1.15); d += (i ? 'L' : 'M') + n1(x + Math.cos(a) * rr) + ' ' + n1(y + Math.sin(a) * rr); }
    const col = c.pick(['#f7c040', '#f2a20a', '#ffd06a', '#e8900a', '#f8b830']);
    return `<path d="${d}Z" fill="${c.lin([[0, lighten(col, .35)], [1, darken(col, .2)]], 0, 0, 1, 1)}" fill-opacity=".92" stroke="#fff3c0" stroke-opacity=".6" stroke-width=".6"/><path d="M${n1(x - r * .4)} ${n1(y - r * .3)}l${n1(r * .5)} ${n1(-r * .2)}" stroke="#fff" stroke-opacity=".6" stroke-width=".8"/>`;
  };
  const n = c.int(3, 4);
  let sticks = '';
  for(let i = 0; i < n; i++){
    const off = i - (n - 1) / 2, x = CX + off * 15 + c.rand(-3, 3), rot = off * 9 + c.rand(-3, 3);
    let g = `<rect x="-1.8" y="-128" width="3.6" height="130" rx="1.8" fill="#9a6a3a"/>`;
    const y0 = -118 + c.rand(-6, 6), y1 = -52 + c.rand(-6, 6);
    for(let y = y0; y < y1; y += 5.5){
      const t = (y - y0) / (y1 - y0), w = 4 + 11 * Math.sin(t * Math.PI);
      const k = w > 10 ? 3 : 2;
      for(let j = 0; j < k; j++) g += crystal(-w + (j + .5) * (2 * w / k) + c.rand(-2, 2), y + c.rand(-2, 2), c.rand(4, 6.5), c.rand(0, 60));
    }
    sticks += `<g transform="translate(${n1(x)} 198) rotate(${n1(rot)})">${g}</g>`;
  }
  s += shadow(c, CX + 4, 202, 50, 8, .55);
  s += sticks;
  const p = `M${CX - 36} 150H${CX + 36}L${CX + 30} 200H${CX - 30}Z`;
  s += `<path d="${p}" fill="${c.glass()}" stroke="rgba(255,255,255,.6)" stroke-width="1.8"/><ellipse cx="${CX}" cy="150" rx="36" ry="4" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.4"/><path d="M${CX - 28} 158L${CX - 24} 194" stroke="#fff" stroke-opacity=".4" stroke-width="3" stroke-linecap="round"/>`;
  for(let i = 0; i < 6; i++){ const x = c.pick([30, 42, 158, 170]) + c.rand(-8, 8), y = 212 + c.rand(-6, 10); s += crystal(x, y, c.rand(4, 7), c.rand(0, 60)); }
  return s;
});
def('medallion', 'نقش کلی', 'نقش کاشی ایرانی', c => {
  const pal = c.pick([['#1f5680', '#0a1f33', '#48b5c4'], ['#135a5a', '#062424', '#e0b25e'], ['#6a1f33', '#240910', '#48b5c4'], ['#233d78', '#0b1430', '#e39a6d']]);
  const G2 = '#d9b36e', k = c.pick([6, 8, 8, 10, 12, 16]);
  let s = `<rect width="${W}" height="${H}" fill="${c.rad([[0, pal[0]], [1, pal[1]]], .5, .5, .7)}"/>`;
  let m = `<circle r="88" fill="none" stroke="${G2}" stroke-opacity=".45"/><circle r="81" fill="none" stroke="${G2}" stroke-width="1.5" stroke-dasharray=".5 6" stroke-linecap="round"/>`;
  for(let i = 0; i < k; i++){
    const a = i * 360 / k;
    m += `<ellipse transform="rotate(${a})" cy="-52" rx="${n1(64 / k + 3)}" ry="24" fill="${G2}" fill-opacity=".08" stroke="${G2}"/>`;
    m += `<rect transform="rotate(${a + 180 / k}) translate(0 -72) rotate(45)" x="-3" y="-3" width="6" height="6" fill="${pal[2]}"/>`;
  }
  m += `<path d="${starPath(k, 42, 24)}" fill="${pal[1]}" stroke="${G2}" stroke-width="1.4"/><path d="${starPath(k, 30, 17)}" transform="rotate(${180 / k})" fill="none" stroke="${pal[2]}" stroke-width="1.2"/><circle r="12" fill="${G2}" fill-opacity=".18" stroke="${G2}"/><circle r="4" fill="${G2}"/>`;
  [[0, 0], [200, 0], [0, 240], [200, 240]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="34" fill="none" stroke="${G2}" stroke-opacity=".3"/><circle cx="${x}" cy="${y}" r="24" fill="${pal[2]}" fill-opacity=".15"/>`; });
  s += `<g transform="translate(${CX} ${CY})"><g class="az-spin"><circle r="90" fill="none"/>${m}</g></g>`;
  return s;
});

const CATEGORY_DEFAULTS = {
  espresso: ['latte-rosetta', 'latte-tulip', 'latte-heart', 'cappuccino', 'espresso', 'espresso-side', 'americano', 'flatwhite', 'cortado', 'caramel', 'mocha', 'latte-swan', 'latte-web', 'latte-wing'],
  iced: ['iced-latte', 'iced-americano', 'iced-caramel', 'iced-mocha'],
  mug: ['hot-chocolate', 'matcha', 'masala', 'honey-milk', 'hazelnut-milk', 'pink-chocolate', 'sesame-date', 'filter'],
  tea: ['tea-glass', 'tea-cardamom', 'teapot', 'herbal-rose', 'herbal-borage', 'herbal-citrus', 'herbal-chamomile', 'herbal-berry', 'herbal-mint', 'herbal-quince', 'tea-latte'],
  cocktail: ['mocktail-coupe', 'mocktail-highball', 'mocktail-hurricane', 'mocktail-jar', 'mocktail-rocks', 'mocktail-martini'],
  shake: ['shake-strawberry', 'shake-oreo', 'shake-biscuit', 'shake-peanut', 'shake-mint', 'shake-hazelnut', 'shake-coffee', 'shake-vanilla', 'smoothie-mango'],
  cake: ['croissant', 'croissant-chocolate', 'croissant-almond', 'kouign-amann', 'choco-twist', 'cookie-double', 'cookie-ny', 'cookie-lemon', 'cinnamon-roll', 'pastel-nata', 'cheesecake', 'cake-mocha', 'cake-redvelvet', 'cake-tresleches', 'cake-walnut', 'cake-apple', 'brownie', 'dessert-cup'],
  toast: ['toast', 'egg-skillet', 'focaccia'],
  drop: ['syrup', 'honey', 'sauce-chocolate', 'sauce-caramel', 'water', 'shot', 'icecream', 'nabat']
};

function resolveStyle(item, icon){
  if(item && item.art && S[item.art]) return item.art;
  const list = CATEGORY_DEFAULTS[icon] || Object.keys(S);
  const r = mulberry(hash(String(item && item.id) + '|' + (item && item.title)));
  return list[Math.floor(r() * list.length)];
}

function render(item, opts){
  opts = opts || {};
  const key = opts.style || resolveStyle(item, opts.icon);
  const st = S[key] || S.medallion;
  const seedStr = String(item.id) + '|' + key + '|' + (item.artSeed || 0);
  const c = makeCtx(seedStr, { tint: item.artColor || null });
  let body;
  try { body = st.fn(c); }
  catch(e){ const c2 = makeCtx(seedStr, {}); body = S.medallion.fn(c2); c.defs = c2.defs; }
  const cls = 'az-art' + (opts.className ? ' ' + opts.className : '');
  return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" data-style="${key}"><defs>${c.defs.join('')}</defs>${body}</svg>`;
}


const STEAM_I = (x, y) => `<path class="az-steam" d="M${x-5} ${y}c-2-2.5 2-4 0-7"/><path class="az-steam" style="animation-delay:.9s" d="M${x} ${y}c-2-2.5 2-4 0-7"/><path class="az-steam" style="animation-delay:1.8s" d="M${x+5} ${y}c-2-2.5 2-4 0-7"/>`;
const ICONS = {
  espresso: ['قهوه', `<path d="M10 22h22v6a11 11 0 0 1-11 11 11 11 0 0 1-11-11z"/><path d="M32 24h3a4.5 4.5 0 0 1 0 9h-3.6"/><path d="M6 43h30"/>${STEAM_I(21, 17)}`],
  iced: ['سرد', `<path d="M12 10h24l-3 32H15z"/><path d="M13.3 19h21.4" opacity=".5"/><rect class="az-bob" x="17" y="22" width="7" height="7" rx="1.5"/><rect class="az-bob" style="animation-delay:-1.4s" x="25" y="28" width="6" height="6" rx="1.5"/><path d="M29 3l-3 26"/>`],
  mug: ['گرم', `<path d="M10 17h22v13a10 10 0 0 1-10 10h-2a10 10 0 0 1-10-10z"/><path d="M32 20h2.5a5 5 0 0 1 0 10H32"/><path class="az-beat" fill="currentColor" fill-opacity=".35" d="M21 32c-3.5-2.4-5-4-5-6a2.6 2.6 0 0 1 5-1 2.6 2.6 0 0 1 5 1c0 2-1.5 3.6-5 6z"/>${STEAM_I(21, 13)}`],
  tea: ['چای', `<path d="M16 15h16c0 5-3 7-3 11s4 5 4 9a4 4 0 0 1-4 4H19a4 4 0 0 1-4-4c0-4 4-5 4-9s-3-6-3-11z"/><path d="M18.3 29h11.4" opacity=".55"/><path d="M9 43h30"/><path class="az-sway" d="M35 15c0-5 3-8 8-8 0 5-3 8-8 8zM35 15l4-4"/>${STEAM_I(24, 11)}`],
  cocktail: ['ماکتیل', `<path d="M8 10h32L24 27z"/><path d="M24 27v12M17 40h14"/><circle cx="36" cy="9" r="5"/><path d="M36 4v10M31 9h10" opacity=".5"/><circle class="az-bub" cx="20" cy="17" r="1.2"/><circle class="az-bub" style="animation-delay:.8s" cx="26" cy="20" r="1"/><circle class="az-bub" style="animation-delay:1.6s" cx="23" cy="15" r="1.3"/>`],
  shake: ['شیک', `<path d="M14 19h20l-2.5 24h-15z"/><path d="M13 19c0-4 3-6 5.5-6 1-3 3.5-4.5 5.5-4.5s4.5 1.5 5.5 4.5c2.5 0 5.5 2 5.5 6z"/><circle class="az-beat" cx="24" cy="6" r="2.4" fill="currentColor" fill-opacity=".35"/><path d="M29 12l6-9"/><path d="M17 28h14" opacity=".5"/>`],
  cake: ['شیرینی', `<path d="M9 25h30v15H9z"/><path d="M9 29c3 3 5 0 7.5 1.5S20 33 22.5 30s4 2 7 0 5 1 9.5-1"/><path d="M24 25v-8"/><path class="az-flame" d="M24 15c-2.2-2-2.2-4.4 0-7 2.2 2.6 2.2 5 0 7z"/><path d="M6 43h36"/>`],
  toast: ['میان وعده', `<path d="M12 42V22a7 7 0 0 1 2-13h20a7 7 0 0 1 2 13v20z"/><path d="M18 30c2-2 4 2 6 0s4 2 6 0" opacity=".6"/><path class="az-twinkle" d="M41 2v8M37 6h8"/>`],
  drop: ['افزودنی', `<path d="M24 5c6 8 11 13 11 20a11 11 0 0 1-22 0c0-7 5-12 11-20z"/><path d="M18.5 26a5.5 5.5 0 0 0 5.5 5.5" opacity=".6"/><path class="az-drop" d="M24 39c1.3 1.8 2.2 2.9 2.2 4a2.2 2.2 0 0 1-4.4 0c0-1.1.9-2.2 2.2-4z"/>`],
  star: ['ستاره', `<path d="M24 4l5 14 15 1-12 9 4 15-12-9-12 9 4-15L4 19l15-1z"/>`],
  leaf: ['برگ', `<path d="M8 40C8 18 22 8 40 8c0 18-10 32-32 32z"/><path d="M8 40L30 18"/>`]
};
function icon(key, cls){
  const ic = ICONS[key] || ICONS.star;
  return `<svg class="az-icon${cls ? ' ' + cls : ''}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ic[1]}</svg>`;
}

const CSS = `
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
function injectCSS(){
  if(typeof document === 'undefined' || document.getElementById('az-art-css')) return;
  const st = document.createElement('style');
  st.id = 'az-art-css';
  st.textContent = CSS;
  document.head.appendChild(st);
}
injectCSS();

window.AzArt = {
  render,
  resolveStyle,
  styles: S,
  groups: G,
  list: Object.keys(S),
  label: k => (S[k] ? S[k].label : k),
  categoryDefaults: CATEGORY_DEFAULTS,
  icons: ICONS,
  icon
};
})();
