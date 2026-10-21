// Generates dist/og-image.png (1200x630) at build time from the headshot asset
// and portfolioData.js, replacing the generic Unsplash stock photo that was
// previously hardcoded as the site's social share image.
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ABOUT_ME } from '../src/data/portfolioData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '../dist');
const WIDTH = 1200;
const HEIGHT = 630;
const PHOTO_WIDTH = 420;

const esc = (str = '') => String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

async function generate() {
    const headshotPath = path.join(__dirname, '../src/assets/headshot.jpg');
    const photo = await sharp(headshotPath)
        .resize(PHOTO_WIDTH, HEIGHT, { fit: 'cover', position: 'top' })
        .toBuffer();

    const overlaySvg = `
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0a0a0a" stop-opacity="1"/>
      <stop offset="60%" stop-color="#0a0a0a" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#0a0a0a" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect x="${WIDTH - PHOTO_WIDTH - 140}" y="0" width="${PHOTO_WIDTH + 140}" height="${HEIGHT}" fill="url(#fade)"/>
  <rect x="80" y="150" width="6" height="90" fill="#e11d48"/>
  <text x="110" y="205" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="900" fill="#ffffff">RAPHAEL</text>
  <text x="110" y="277" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="900" fill="#a3a3a3">J. EDWARDS</text>
  <text x="110" y="330" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" fill="#f43f5e">${esc(ABOUT_ME.role)}</text>
  <text x="110" y="364" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#737373">${esc(ABOUT_ME.location)}</text>
  <text x="110" y="440" font-family="Arial, Helvetica, sans-serif" font-size="21" font-style="italic" fill="#d4d4d4">&#8220;Building resilient teams.</text>
  <text x="110" y="472" font-family="Arial, Helvetica, sans-serif" font-size="21" font-style="italic" fill="#d4d4d4">Solving complex problems.&#8221;</text>
</svg>`;

    fs.mkdirSync(DIST, { recursive: true });
    await sharp({ create: { width: WIDTH, height: HEIGHT, channels: 4, background: '#0a0a0a' } })
        .composite([
            { input: photo, left: WIDTH - PHOTO_WIDTH, top: 0 },
            { input: Buffer.from(overlaySvg), left: 0, top: 0 }
        ])
        .png()
        .toFile(path.join(DIST, 'og-image.png'));

    console.log('  ✓ og-image.png (1200x630)');
}

generate().catch(err => {
    console.error('Failed to generate og-image.png:', err);
    process.exit(1);
});
