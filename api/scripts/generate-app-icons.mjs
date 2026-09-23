// Renders the PinoyStars app icon set into ../mobile/assets/images.
// Usage (from api/):  node scripts/generate-app-icons.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const out = join(dirname(fileURLToPath(import.meta.url)), '../../mobile/assets/images');
const MAROON = '#3D0A12';
const MAROON_2 = '#6B0F1A';
const GOLD = '#E4C55F';

/** Eight slim, symmetric rays like the sun on the Philippine flag. */
function rays(cx, cy, r1, r2, n, color, opacity) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2 + Math.PI / n;
    const w = 0.075; // half-width in radians at the outer edge
    const p = (ang, r) => `${(cx + Math.cos(ang) * r).toFixed(1)} ${(cy + Math.sin(ang) * r).toFixed(1)}`;
    d += `M${p(a - w / 3, r1)} L${p(a - w, r2)} L${p(a + w, r2)} L${p(a + w / 3, r1)} Z `;
  }
  return `<path d="${d}" fill="${color}" opacity="${opacity}"/>`;
}

function star(cx, cy, r, color) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.44 : r;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${color}" stroke="${color}" stroke-width="${r * 0.08}" stroke-linejoin="round"/>`;
}

/** The mark alone, centred in a `size` box; `scale` shrinks it into Android's adaptive safe zone. */
const mark = (size, scale, color = GOLD, withRays = true) => {
  const c = size / 2;
  return `${withRays ? rays(c, c, size * 0.3 * scale, size * 0.44 * scale, 8, color, 0.55) : ''}${star(c, c, size * 0.24 * scale, color)}`;
};

const bg = (size) => `<defs><radialGradient id="g" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stop-color="${MAROON_2}"/><stop offset="1" stop-color="${MAROON}"/></radialGradient></defs><rect width="${size}" height="${size}" fill="url(#g)"/>`;

const svg = (size, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${body}</svg>`;
const render = (s, file) => writeFileSync(join(out, file), new Resvg(s).render().asPng());

render(svg(1024, bg(1024) + mark(1024, 1)), 'icon.png');
render(svg(1024, mark(1024, 0.62)), 'android-icon-foreground.png');
render(svg(1024, bg(1024)), 'android-icon-background.png');
render(svg(1024, mark(1024, 0.62, '#FFFFFF', false)), 'android-icon-monochrome.png');
render(svg(512, mark(512, 1)), 'splash-icon.png');
render(svg(96, bg(96) + mark(96, 1)), 'favicon.png');
console.log('App icons written to mobile/assets/images');
