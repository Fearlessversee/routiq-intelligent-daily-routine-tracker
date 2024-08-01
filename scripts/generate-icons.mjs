#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const cwd = process.cwd();
const input = path.resolve(cwd, 'public', 'favicon.png');
const outDir = path.resolve(cwd, 'public', 'icons');

if (!fs.existsSync(input)) {
  console.error('Input file not found:', input);
  process.exit(1);
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const tasks = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-512-maskable.png', size: 512 },
];

async function run() {
  for (const t of tasks) {
    const out = path.resolve(outDir, t.name);
    await sharp(input)
      .resize(t.size, t.size, { fit: 'cover' })
      .png()
      .toFile(out);
    console.log('Wrote', out);
  }

  // apple-touch-icon (180x180)
  const appleOut = path.resolve(cwd, 'public', 'apple-touch-icon.png');
  await sharp(input).resize(180, 180, { fit: 'cover' }).png().toFile(appleOut);
  console.log('Wrote', appleOut);

  console.log('\nDone. Add the generated files in `public/icons/` to your manifest.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
