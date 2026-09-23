// Generates the seed artwork (title posters and feature banners) as PNGs in public/seed/. Actor photos are real (Wikimedia Commons).
// All art is procedural and original — no real people, no stock photos.
// Usage (from api/):  node scripts/generate-art.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const here = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(join(here, '../../supabase/scripts/art-manifest.json'), 'utf8'));
const out = join(here, '../public/seed');

const hash = (s) => [...s].reduce((h, c) => (Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0), 2166136261);
const pick = (arr, seed, salt = 0) => arr[(seed >>> salt) % arr.length];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const BACKDROPS = [
  ['#8E1C2B', '#2B070E'], ['#6B0F1A', '#1C0509'], ['#A8404C', '#3D0A12'], ['#1B3F8F', '#0A1638'],
  ['#9C7A18', '#3A2906'], ['#1F5E4B', '#0B241C'], ['#5B2A86', '#1F0C33'], ['#B4512C', '#3D1208'],
];
const SKIN = ['#C68E64', '#B07A55', '#D9A27A', '#9C6644', '#E0B08A', '#A86F4C'];
const HAIR = ['#1A0F0B', '#24150F', '#2E1B12', '#140B08'];
const OUTFIT = ['#F4E5B6', '#FCF7EE', '#C9A227', '#2B070E', '#E4C55F', '#CE1126', '#0038A8'];
const NETWORK_TINT = { 'ABS-CBN': '#E4C55F', GMA: '#FCF7EE', Viva: '#F4E5B6', TV5: '#E4C55F', Independent: '#CFBB9C' };

function sunburst(cx, cy, color, opacity, r1 = 120, r2 = 900, rays = 16) {
  let d = '';
  for (let i = 0; i < rays; i++) {
    const a1 = (i / rays) * Math.PI * 2;
    const a2 = a1 + (Math.PI * 2) / rays / 2.2;
    const p = (a, r) => `${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`;
    d += `M${p(a1, r1)} L${p(a1, r2)} L${p(a2, r2)} L${p(a2, r1)} Z `;
  }
  return `<path d="${d}" fill="${color}" opacity="${opacity}"/>`;
}

function star(cx, cy, r, color, opacity) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.42 : r;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${color}" opacity="${opacity}"/>`;
}

function portrait({ id, name, gender, generation, network }, index) {
  const h = hash(id);
  // Rotate backdrops by position so neighbours in a grid never match; hash picks the rest.
  const [bg1, bg2] = BACKDROPS[index % BACKDROPS.length];
  const skin = pick(SKIN, h, 3);
  const hair = generation === 'Legends' ? pick(['#6E6A66', '#8A8580', '#4A4643'], h, 5) : pick(HAIR, h, 5);
  const outfit = pick(OUTFIT, h, 7);
  const tint = NETWORK_TINT[network] ?? '#E4C55F';
  const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const female = gender === 'Female';
  const collar = outfit === '#2B070E' ? '#C9A227' : '#2B070E';

  const hairBack = female
    ? `<path d="M168 450 C150 300 236 250 300 252 C372 250 452 300 432 450 C446 548 458 610 482 668 L118 668 C142 610 156 548 168 450 Z" fill="${hair}"/>`
    : '';
  const hairTop = female
    ? `<path d="M186 410 C196 318 258 286 312 288 C374 291 414 330 416 412 C382 356 330 338 296 348 C256 354 216 376 186 410 Z" fill="${hair}"/>`
    : `<path d="M186 428 C176 300 250 266 302 268 C362 266 430 300 414 428 C404 362 364 332 302 336 C242 332 198 360 186 428 Z" fill="${hair}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${tint}" stop-opacity="0.55"/><stop offset="1" stop-color="${tint}" stop-opacity="0"/></radialGradient>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/></linearGradient>
    <linearGradient id="face" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0.10"/><stop offset="0.6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.14"/></linearGradient>
  </defs>
  <rect width="600" height="800" fill="url(#bg)"/>
  ${sunburst(300, 420, tint, 0.09)}
  <circle cx="300" cy="420" r="300" fill="url(#glow)"/>
  <text x="36" y="150" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="150" fill="${tint}" opacity="0.10" letter-spacing="-6">${esc(initials)}</text>
  ${star(508, 108, 20, tint, 0.55)}${star(548, 176, 10, tint, 0.4)}${star(470, 190, 7, tint, 0.35)}
  ${hairBack}
  <path d="M56 800 C66 690 158 640 300 630 C442 640 534 690 544 800 Z" fill="${outfit}"/>
  <path d="M232 636 L300 720 L368 636 C346 630 322 628 300 628 C278 628 254 630 232 636 Z" fill="${collar}" opacity="0.9"/>
  <rect x="256" y="520" width="88" height="130" rx="34" fill="${skin}"/>
  <rect x="256" y="520" width="88" height="130" rx="34" fill="#000" opacity="0.12"/>
  <ellipse cx="300" cy="430" rx="112" ry="136" fill="${skin}"/>
  <ellipse cx="300" cy="430" rx="112" ry="136" fill="url(#face)"/>
  ${hairTop}
  <rect width="600" height="800" fill="url(#shade)"/>
</svg>`;
}

function wrap(title, max) {
  const words = title.split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

function poster({ id, title, year, type }, index) {
  const h = hash(id);
  const [bg1, bg2] = BACKDROPS[(index * 3) % BACKDROPS.length];
  const accent = pick(['#E4C55F', '#F4E5B6', '#FCD116', '#FCF7EE', '#FF8A5B'], h, 6);
  const lines = wrap(title.toUpperCase(), 11);
  const longest = Math.max(...lines.map((l) => l.length));
  const size = Math.min(64, Math.floor(330 / Math.max(longest, 4) / 0.62));
  const motif = h % 3;
  const shape =
    motif === 0
      ? `<circle cx="200" cy="230" r="120" fill="${accent}" opacity="0.9"/><circle cx="200" cy="230" r="120" fill="${bg2}" opacity="0.25"/>`
      : motif === 1
        ? `<path d="M200 90 L330 330 L70 330 Z" fill="${accent}" opacity="0.88"/>`
        : `<rect x="90" y="120" width="220" height="220" rx="14" transform="rotate(12 200 230)" fill="${accent}" opacity="0.88"/>`;
  const startY = 470 - (lines.length - 1) * size * 0.95;
  const text = lines
    .map((l, i) => `<text x="36" y="${(startY + i * size * 0.95).toFixed(0)}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${size}" fill="#FCF7EE" letter-spacing="-1">${esc(l)}</text>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient></defs>
  <rect width="400" height="600" fill="url(#bg)"/>
  ${sunburst(200, 230, accent, 0.07, 60, 700, 20)}
  ${shape}
  <text x="36" y="56" font-family="Arial, sans-serif" font-weight="700" font-size="15" fill="${accent}" letter-spacing="4">${esc(type.toUpperCase())}</text>
  ${text}
  <rect x="36" y="540" width="40" height="3" fill="${accent}"/>
  <text x="36" y="572" font-family="Arial, sans-serif" font-weight="700" font-size="18" fill="#FCF7EE" opacity="0.8" letter-spacing="2">${year}</text>
</svg>`;
}

function newsBanner({ id, tag }, index) {
  const h = hash(id + tag);
  const [bg1, bg2] = BACKDROPS[(index * 5 + 1) % BACKDROPS.length];
  const accent = pick(['#E4C55F', '#FCD116', '#F4E5B6'], h, 4);
  const beams = [140, 400, 660]
    .map((x, i) => `<path d="M${x} -20 L${x - 150 + i * 30} 470 L${x + 150 + i * 30} 470 Z" fill="url(#beam)" opacity="${0.5 - i * 0.08}"/>`)
    .join('');
  const bulbs = Array.from({ length: 14 }, (_, i) => `<circle cx="${30 + i * 57}" cy="26" r="7" fill="${accent}" opacity="${0.35 + ((h >> i) & 1) * 0.5}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></linearGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${accent}" stop-opacity="0.7"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#bg)"/>
  ${beams}
  <path d="M0 380 C200 350 600 350 800 380 L800 450 L0 450 Z" fill="#CE1126" opacity="0.85"/>
  <path d="M300 450 L360 380 L440 380 L500 450 Z" fill="#8E1C2B"/>
  ${star(400, 250, 46, accent, 0.9)}
  ${bulbs}
  <text x="40" y="330" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="96" fill="#FCF7EE" opacity="0.12" letter-spacing="-3">${esc(tag.toUpperCase())}</text>
</svg>`;
}

function render(svg, file) {
  const png = new Resvg(svg, { font: { loadSystemFonts: true, defaultFontFamily: 'Arial' } }).render().asPng();
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, png);
}

manifest.actors.forEach((a, i) => render(portrait(a, i), join(out, 'actors', `${a.id}.png`)));
manifest.titles.forEach((t, i) => render(poster(t, i), join(out, 'titles', `${t.id}.png`)));
manifest.news.forEach((n, i) => render(newsBanner(n, i), join(out, 'news', `${n.id}.png`)));
console.log(`Rendered ${manifest.actors.length} portraits, ${manifest.titles.length} posters, ${manifest.news.length} banners → public/seed/`);
