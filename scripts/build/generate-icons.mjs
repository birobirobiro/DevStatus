import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../../');
const publicDir = join(rootDir, 'public');
const sourceIcon = join(publicDir, 'icon.svg');

async function generateIcons() {
  try {
    const svgBuffer = await fs.readFile(sourceIcon);

    // Generate PNG icons
    await Promise.all([
      sharp(svgBuffer)
        .resize(192, 192)
        .png()
        .toFile(join(publicDir, 'icon-192.png')),
      sharp(svgBuffer)
        .resize(512, 512)
        .png()
        .toFile(join(publicDir, 'icon-512.png')),
      sharp(svgBuffer)
        .resize(180, 180)
        .png()
        .toFile(join(publicDir, 'apple-touch-icon.png')),
    ]);

    // Copy SVG to public directory
    await fs.copyFile(sourceIcon, join(publicDir, 'icon.svg'));

    console.log('✅ Icons generated successfully');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
