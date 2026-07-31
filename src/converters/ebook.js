import { downloadBlob, readFileAsArrayBuffer, getExt } from '../utils.js';
import JSZip from 'jszip';

export async function convertEbook(file, targetFormat) {
  const ext = getExt(file.name);

  if (ext === 'epub') {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const zip = await JSZip.loadAsync(arrayBuffer);

    if (targetFormat === 'txt') {
      let texts = [];
      for (const [path, entry] of Object.entries(zip.files)) {
        if (/\.(xhtml|html|htm)$/i.test(path) && !entry.dir) {
          const html = await entry.async('text');
          const div = document.createElement('div');
          div.innerHTML = html;
          texts.push(div.textContent || div.innerText || '');
        }
      }
      const blob = new Blob([texts.join('\n\n')], { type: 'text/plain;charset=utf-8' });
      downloadBlob(blob, file.name.replace(/\.epub$/i, '.txt'));
      return;
    }

    if (targetFormat === 'html') {
      let htmls = [];
      for (const [path, entry] of Object.entries(zip.files)) {
        if (/\.(xhtml|html|htm)$/i.test(path) && !entry.dir) {
          const html = await entry.async('text');
          htmls.push(html);
        }
      }
      const combined = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + file.name + '</title><style>body{font-family:sans-serif;max-width:800px;margin:40px auto;line-height:1.8;color:#333}</style></head><body>' + htmls.join('<hr>') + '</body></html>';
      const blob = new Blob([combined], { type: 'text/html;charset=utf-8' });
      downloadBlob(blob, file.name.replace(/\.epub$/i, '.html'));
      return;
    }
  }

  if (['mobi','azw3'].includes(ext) && targetFormat === 'txt') {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const uint8 = new Uint8Array(arrayBuffer);
    let text = '';
    for (let i = 0; i < uint8.length; i++) {
      const c = uint8[i];
      if ((c >= 32 && c < 127) || c === 10 || c === 13) {
        text += String.fromCharCode(c);
      }
    }
    text = text.replace(/\s{4,}/g, '\n\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, file.name.replace(/\.[^.]+$/i, '.txt'));
    return;
  }

  throw new Error('电子书该转换组合暂不支持');
}