const sharp = require('sharp');

async function processImage() {
  const { data, info } = await sharp('src/images/logo.jpeg')
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const bg_r = data[0];
  const bg_g = data[1];
  const bg_b = data[2];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const avg_bg = (bg_r + bg_g + bg_b) / 3;
    const avg_px = (r + g + b) / 3;

    const targetR = 0;
    const targetG = 0;
    const targetB = 139;

    const r_dist = Math.abs(r - bg_r);
    const g_dist = Math.abs(g - bg_g);
    const b_dist = Math.abs(b - bg_b);

    if (r_dist < 40 && g_dist < 40 && b_dist < 40) {
      data[i + 3] = 0;
    } else {
      let intensity = avg_px / (avg_bg || 1);
      intensity = Math.max(0, Math.min(1, intensity));

      let alpha = Math.floor((1 - intensity) * 255 * 2.0);
      alpha = Math.max(0, Math.min(255, alpha));

      if (alpha > 10) {
        data[i] = targetR;
        data[i + 1] = targetG;
        data[i + 2] = targetB;
        data[i + 3] = alpha;
      } else {
        data[i + 3] = 0;
      }
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  }).png().toFile('src/images/logo2.png');
}

processImage().then(() => console.log('Done')).catch(console.error);
