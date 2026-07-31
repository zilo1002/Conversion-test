import { downloadBlob, readFileAsArrayBuffer, readFileAsText, getExt } from '../utils.js';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export async function convertDocument(file, targetFormat) {
  const ext = getExt(file.name);

  if (ext === 'docx') {
    if (targetFormat === 'txt' || targetFormat === 'md') {
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const result = await mammoth.extractRawText({ arrayBuffer });
      const blob = new Blob([result.value], { type: 'text/plain;charset=utf-8' });
      downloadBlob(blob, file.name.replace(/\.docx$/i, '.' + targetFormat));
      return;
    }
    if (targetFormat === 'html') {
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + file.name + '</title></head><body>' + result.value + '</body></html>';
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      downloadBlob(blob, file.name.replace(/\.docx$/i, '.html'));
      return;
    }
    if (targetFormat === 'pdf') {
      const arrayBuffer = await readFileAsArrayBuffer(file);
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const div = document.createElement('div');
      div.innerHTML = result.value;
      div.style.cssText = 'position:fixed;left:-9999px;top:0;width:800px;padding:40px;background:#fff;color:#000;font-family:sans-serif;line-height:1.6;';
      document.body.appendChild(div);
      const canvas = await html2canvas(div, { scale: 2 });
      document.body.removeChild(div);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(file.name.replace(/\.docx$/i, '.pdf'));
      return;
    }
  }

  if (['xlsx','xls','csv','ods'].includes(ext)) {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    if (targetFormat === 'csv') {
      const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      downloadBlob(blob, file.name.replace(/\.[^.]+$/i, '.csv'));
      return;
    }
    if (targetFormat === 'json') {
      const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
      downloadBlob(blob, file.name.replace(/\.[^.]+$/i, '.json'));
      return;
    }
    if (targetFormat === 'xlsx') {
      const out = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      downloadBlob(new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), file.name.replace(/\.[^.]+$/i, '.xlsx'));
      return;
    }
    if (targetFormat === 'html') {
      const html = XLSX.utils.sheet_to_html(workbook.Sheets[workbook.SheetNames[0]]);
      const blob = new Blob(['<!DOCTYPE html><html><head><meta charset="utf-8"><style>table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px}</style></head><body>' + html + '</body></html>'], { type: 'text/html' });
      downloadBlob(blob, file.name.replace(/\.[^.]+$/i, '.html'));
      return;
    }
  }

  if (['txt','md'].includes(ext) && targetFormat === 'pdf') {
    const text = await readFileAsText(file);
    const pdf = new jsPDF();
    const lines = pdf.splitTextToSize(text, 180);
    let y = 20;
    for (const line of lines) {
      if (y > 280) { pdf.addPage(); y = 20; }
      pdf.text(line, 15, y);
      y += 6;
    }
    pdf.save(file.name.replace(/\.[^.]+$/i, '.pdf'));
    return;
  }

  if (['txt','md','html'].includes(ext) && ['txt','md','html'].includes(targetFormat)) {
    const text = await readFileAsText(file);
    const mime = targetFormat === 'html' ? 'text/html' : 'text/plain';
    const blob = new Blob([text], { type: mime + ';charset=utf-8' });
    downloadBlob(blob, file.name.replace(/\.[^.]+$/i, '.' + targetFormat));
    return;
  }

  throw new Error('该转换组合暂不支持，请尝试其他格式');
}