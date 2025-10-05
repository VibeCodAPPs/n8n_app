const fs = require('fs');
const path = require('path');
const pngToIco = require('png-to-ico');
const sharp = require('sharp');

(async () => {
  try {
    const projectRoot = path.resolve(__dirname, '..');
    // Icono fuente ahora desacoplado, dentro del propio launcher
    const sourcePng = path.resolve(projectRoot, 'assets', 'icon.png');
    const outDir = path.resolve(projectRoot, 'build');
    const outIco = path.resolve(outDir, 'icon.ico');

    if (!fs.existsSync(sourcePng)) {
      console.error(`[icon] PNG no encontrado: ${sourcePng}`);
      process.exit(1);
    }
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // Load image and ensure square 256x256 with transparent padding if needed
    const img = sharp(sourcePng);
    const meta = await img.metadata();
    const size = Math.max(meta.width || 256, meta.height || 256);
    const squared = await img
      .resize({
        width: size,
        height: size,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .resize(256, 256, { fit: 'cover' })
      .png()
      .toBuffer();

    const ico = await pngToIco(squared);
    fs.writeFileSync(outIco, ico);
    console.log(`[icon] ICO generado en: ${outIco}`);
  } catch (err) {
    console.error('[icon] Error generando icono:', err);
    process.exit(1);
  }
})();
