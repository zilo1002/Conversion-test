import { downloadBlob, readFileAsDataURL, getExt } from '../utils.js';

export async function convertImage(file, targetFormat) {
  const ext = getExt(file.name);

  if (ext === 'heic') {
    const heic2any = await import('heic2any');
    const blob = await heic2any.default({
      blob: file,
      toType: 'image/' + (targetFormat === 'jpg' ? 'jpeg' : targetFormat)
    });
    downloadBlob(blob, file.name.replace(/\.heic$/i, '.' + targetFormat));
    return;
  }

  if (ext === 'svg') {
    if (targetFormat === 'svg') {
      downloadBlob(file, file.name);
      return;
    }
    const text = await file.text();
    const svgBlob = new Blob([text], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || 800;
    canvas.height = img.naturalHeight || 600;
    const ctx = canvas.getContext('2d');
    if (targetFormat === 'png') ctx.clearRect(0, 0, canvas.width, canvas.height);
    else { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    const mime = targetFormat === 'jpg' ? 'image/jpeg' : 'image/' + targetFormat;
    const outBlob = await new Promise(resolve => canvas.toBlob(resolve, mime, 0.92));
    downloadBlob(outBlob, file.name.replace(/\.svg$/i, '.' + targetFormat));
    return;
  }

  const dataUrl = await readFileAsDataURL(file);
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = dataUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');

  if (targetFormat === 'png' || targetFormat === 'webp' || targetFormat === 'gif') {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);

  const mime = targetFormat === 'jpg' ? 'image/jpeg' : 'image/' + targetFormat;
  const blob = await new Promise(resolve => canvas.toBlob(resolve, mime, targetFormat === 'webp' ? 0.85 : 0.92));

  if (!blob) throw new Error('浏览器不支持此格式导出');

  const newName = file.name.replace(/\.[^.]+$/, '.' + targetFormat);
  downloadBlob(blob, newName);
}

export async function compressImage(file, quality = 0.8, maxWidth = null) {
  const dataUrl = await readFileAsDataURL(file);
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = dataUrl;
  });

  let w = img.naturalWidth, h = img.naturalHeight;
  if (maxWidth && w > maxWidth) {
    h = Math.round(h * maxWidth / w);
    w = maxWidth;
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);

  const ext = getExt(file.name);
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  const blob = await new Promise(resolve => canvas.toBlob(resolve, mime, quality));
  const newName = file.name.replace(/\.[^.]+$/, ext === 'png' ? '.png' : '.jpg');
  downloadBlob(blob, newName);
}