export const MAX_SIZE = 200 * 1024 * 1024;

export const FORMAT_MAP = {
  document: {
    ext: ['doc','docx','txt','rtf','odt','pdf','md','pages','xls','xlsx','csv','ods','xlsm','ppt','pptx','odp','key'],
    label: '文档办公',
    color: 'blue',
    targets: { docx: 'Word', txt: '纯文本', md: 'Markdown', html: 'HTML', pdf: 'PDF', xlsx: 'Excel', csv: 'CSV', jpg: 'JPG图片', png: 'PNG图片' }
  },
  image: {
    ext: ['jpg','jpeg','png','gif','bmp','webp','tiff','tif','heic','avif','svg'],
    label: '图像图片',
    color: 'purple',
    targets: { png: 'PNG', jpg: 'JPEG', webp: 'WebP', gif: 'GIF', bmp: 'BMP', svg: 'SVG' }
  },
  ebook: {
    ext: ['epub','mobi','azw3'],
    label: '电子书',
    color: 'amber',
    targets: { epub: 'EPUB', mobi: 'MOBI', azw3: 'AZW3', txt: '纯文本', html: 'HTML' }
  },
  data: {
    ext: ['json','xml','csv','yaml','yml','toml','zip','rar','7z'],
    label: '数据压缩',
    color: 'emerald',
    targets: { json: 'JSON', xml: 'XML', csv: 'CSV', yaml: 'YAML', toml: 'TOML', zip: 'ZIP' }
  }
};

export function getCategory(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  for (const [cat, info] of Object.entries(FORMAT_MAP)) {
    if (info.ext.includes(ext)) return cat;
  }
  return 'document';
}

export function getExt(filename) {
  return filename.split('.').pop().toLowerCase();
}

export function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function getColorClasses(cat) {
  const map = {
    document: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', glow: 'shadow-blue-500/20' },
    image: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', glow: 'shadow-purple-500/20' },
    ebook: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', glow: 'shadow-amber-500/20' },
    data: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20' }
  };
  return map[cat] || map.document;
}

export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}