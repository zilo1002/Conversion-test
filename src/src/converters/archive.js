import { downloadBlob, readFileAsArrayBuffer, getExt } from '../utils.js';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export async function handleArchive(file, targetFormat) {
  const ext = getExt(file.name);

  if (ext === 'zip' && targetFormat === 'extract') {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const zip = await JSZip.loadAsync(arrayBuffer);
    const folderName = file.name.replace(/\.zip$/i, '');

    const entries = [];
    for (const [path, zipEntry] of Object.entries(zip.files)) {
      if (!zipEntry.dir) {
        const content = await zipEntry.async('blob');
        entries.push({ path, content, size: zipEntry._data.uncompressedSize });
      }
    }
    return { type: 'extracted', entries, folderName };
  }

  if (targetFormat === 'zip') {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const zip = new JSZip();
    zip.file(file.name, arrayBuffer);
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, file.name + '.zip');
    return;
  }

  throw new Error('压缩包处理暂不支持此操作');
}

export async function createZipFromFiles(files) {
  const zip = new JSZip();
  for (const file of files) {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    zip.file(file.name, arrayBuffer);
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'archive.zip');
}