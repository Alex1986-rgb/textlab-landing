// Рендерер инфографик-слайдов для маркетплейсов → SVG (формат 900×1200, 3:4)
// Кросс-платформенные системные шрифты, чтобы карточка выглядела одинаково в любом вьюере.

const FONT = "Arial, 'Helvetica Neue', Helvetica, sans-serif";
const esc = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// ---- силуэты товаров (flat-design, центр ~ (450,600)) ----
function product(shape){
  const P = 'fill="url(#prod)" filter="url(#ds)"';
  const G = 'fill="rgba(255,255,255,.18)"';        // глянец
  const A = 'fill="url(#prodA)"';                   // акцентная деталь
  switch(shape){
    case 'dropper': return `
      <rect x="408" y="372" width="84" height="40" rx="10" ${A}/>
      <rect x="420" y="332" width="60" height="46" rx="20" ${A}/>
      <rect x="416" y="404" width="68" height="40" ${A}/>
      <rect x="362" y="438" width="176" height="332" rx="30" ${P}/>
      <rect x="392" y="500" width="116" height="150" rx="16" fill="rgba(255,255,255,.1)"/>
      <rect x="384" y="452" width="40" height="300" rx="20" ${G}/>`;
    case 'bottle': return `
      <rect x="406" y="372" width="88" height="64" rx="16" ${A}/>
      <rect x="432" y="346" width="36" height="34" rx="8" ${A}/>
      <path d="M372 470 q0 -34 34 -34 h88 q34 0 34 34 v270 q0 36 -36 36 h-84 q-36 0 -36 -36 z" ${P}/>
      <rect x="392" y="520" width="120" height="150" rx="14" fill="rgba(255,255,255,.1)"/>
      <rect x="392" y="476" width="34" height="286" rx="17" ${G}/>`;
    case 'jar': return `
      <ellipse cx="450" cy="448" rx="104" ry="26" ${A}/>
      <rect x="346" y="430" width="208" height="46" rx="14" ${A}/>
      <path d="M356 474 h188 v272 q0 28 -28 28 h-132 q-28 0 -28 -28 z" ${P}/>
      <rect x="392" y="520" width="116" height="150" rx="14" fill="rgba(255,255,255,.1)"/>
      <rect x="372" y="486" width="32" height="270" rx="16" ${G}/>`;
    case 'tube': return `
      <path d="M384 398 l16 26 h100 l16 -26 z" ${A}/>
      <rect x="438" y="376" width="24" height="34" rx="6" ${A}/>
      <path d="M400 424 h100 v300 q0 40 -50 40 q-50 0 -50 -40 z" ${P}/>
      <rect x="430" y="470" width="40" height="220" rx="20" ${G}/>`;
    case 'mug': return `
      <rect x="374" y="392" width="152" height="52" rx="18" ${A}/>
      <rect x="436" y="372" width="28" height="26" rx="8" ${A}/>
      <path d="M388 444 h124 l-14 300 q-2 30 -32 30 h-32 q-30 0 -32 -30 z" ${P}/>
      <rect x="404" y="470" width="34" height="260" rx="17" ${G}/>`;
    case 'headphones': return `
      <path d="M320 600 a130 150 0 0 1 260 0" fill="none" stroke="url(#prod)" stroke-width="34" stroke-linecap="round" filter="url(#ds)"/>
      <rect x="300" y="572" width="74" height="150" rx="26" ${P}/>
      <rect x="526" y="572" width="74" height="150" rx="26" ${P}/>
      <ellipse cx="337" cy="640" rx="20" ry="44" ${A}/>
      <ellipse cx="563" cy="640" rx="20" ry="44" ${A}/>`;
    case 'sneaker': return `
      <path d="M300 700 q-6 -70 60 -86 q40 -10 64 -44 q26 -38 70 -34 q22 2 26 26 q4 26 34 40 l78 36 q40 18 38 50 q-2 24 -34 24 H332 q-30 0 -32 -22 z" ${P}/>
      <path d="M296 700 h312 q18 0 18 22 q0 24 -26 24 H300 q-22 0 -22 -24 q0 -22 18 -22 z" ${A}/>
      <path d="M470 566 q14 18 40 30 l34 16 q-30 8 -54 -6 q-22 -14 -20 -40z" ${G}/>
      <path d="M392 600 l26 30 M430 580 l26 32" stroke="rgba(255,255,255,.25)" stroke-width="10" stroke-linecap="round" fill="none"/>`;
    case 'box': // робот-пылесос, вид сверху
      return `
      <ellipse cx="450" cy="780" rx="180" ry="40" fill="rgba(0,0,0,.25)"/>
      <circle cx="450" cy="600" r="172" ${P}/>
      <circle cx="450" cy="600" r="172" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="2"/>
      <circle cx="450" cy="600" r="120" fill="rgba(255,255,255,.08)"/>
      <circle cx="450" cy="540" r="34" ${A}/>
      <circle cx="450" cy="540" r="14" fill="rgba(255,255,255,.4)"/>
      <path d="M298 600 a152 152 0 0 1 304 0" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="14"/>`;
    default: return `<circle cx="450" cy="600" r="150" ${P}/>`;
  }
}

function badge(s){
  const t = esc(s.badge);
  const w = t.length*26 + 56;
  const x = 840 - w;
  let fill, txt='#0c0e16';
  if(s.badgeType==='rating'){ fill='#ffd166'; }
  else if(s.badgeType==='sale'){ fill='#ff5a6e'; txt='#fff'; }
  else { fill=s.accent; txt='#0c0e16'; }
  return `<g>
    <rect x="${x}" y="54" width="${w}" height="56" rx="28" fill="${fill}"/>
    <text x="${x+w/2}" y="92" text-anchor="middle" font-family="${FONT}" font-size="30" font-weight="800" fill="${txt}">${t}</text>
  </g>`;
}

function benefitChip(y, accent, text){
  return `<g>
    <rect x="60" y="${y}" width="780" height="84" rx="20" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.12)"/>
    <circle cx="104" cy="${y+42}" r="22" fill="${accent}"/>
    <path d="M93 ${y+42} l8 9 l14 -17" fill="none" stroke="#0c0e16" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="146" y="${y+52}" font-family="${FONT}" font-size="29" font-weight="700" fill="#fff">${esc(text)}</text>
  </g>`;
}

function svgForSlide(s){
  const chipsY = [836, 926, 1016];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200" width="900" height="1200" font-family="${FONT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="${s.bg1}"/><stop offset="1" stop-color="${s.bg2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${s.accent}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${s.accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="prod" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${s.accent2}"/><stop offset="1" stop-color="${s.accent}"/>
    </linearGradient>
    <linearGradient id="prodA" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/><stop offset="1" stop-color="${s.accent2}"/>
    </linearGradient>
    <filter id="ds" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#000" flood-opacity="0.45"/>
    </filter>
  </defs>

  <rect width="900" height="1200" fill="url(#bg)"/>
  <circle cx="760" cy="150" r="280" fill="${s.accent}" opacity="0.14"/>
  <circle cx="120" cy="1080" r="240" fill="${s.accent2}" opacity="0.1"/>

  <!-- brand -->
  <rect x="60" y="54" width="${esc(s.brand).length*20+48}" height="56" rx="14" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.16)"/>
  <text x="${60+(esc(s.brand).length*20+48)/2}" y="92" text-anchor="middle" font-size="28" font-weight="800" letter-spacing="2" fill="#fff">${esc(s.brand)}</text>
  ${badge(s)}

  <!-- headline -->
  <text x="60" y="232" font-size="78" font-weight="800" fill="#fff" letter-spacing="-1">
    ${s.headline.map((l,i)=>`<tspan x="60" dy="${i?86:0}">${esc(l)}</tspan>`).join('')}
  </text>
  <rect x="62" y="${232 + (s.headline.length-1)*86 + 26}" width="150" height="10" rx="5" fill="${s.accent}"/>
  <text x="62" y="${232 + (s.headline.length-1)*86 + 92}" font-size="34" font-weight="600" fill="${s.accent}">${esc(s.sub)}</text>

  <!-- product -->
  <circle cx="450" cy="630" r="250" fill="url(#glow)"/>
  <g transform="translate(0,58) translate(450,600) scale(0.9) translate(-450,-600)">${product(s.shape)}</g>

  <!-- benefits -->
  ${s.benefits.slice(0,3).map((b,i)=>benefitChip(chipsY[i], s.accent, b)).join('\n  ')}

  <!-- guarantee -->
  <rect x="60" y="1112" width="780" height="62" rx="18" fill="${s.accent}" opacity="0.16"/>
  <rect x="60" y="1112" width="780" height="62" rx="18" fill="none" stroke="${s.accent}" stroke-opacity="0.5"/>
  <circle cx="104" cy="1143" r="16" fill="${s.accent}"/>
  <path d="M95 1143 l6 7 l11 -13" fill="none" stroke="#0c0e16" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="136" y="1153" font-size="27" font-weight="700" fill="#fff">${esc(s.guarantee)}</text>
</svg>`;
}

module.exports = { svgForSlide };
