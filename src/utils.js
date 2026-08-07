export const MAX_SIZE = 200 * 1024 * 1024;

export const CATEGORIES = {
  document: {
    id: 'document',
    emoji: '📄',
    title: '文档与办公文件',
    desc: 'Word、Excel、PPT、PDF 等办公格式互转',
    color: 'blue',
    bgGradient: 'from-blue-500/20 to-cyan-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    dotColor: 'bg-blue-400',
    accept: '.doc,.docx,.txt,.rtf,.odt,.pdf,.md,.pages,.xls,.xlsx,.csv,.ods,.xlsm,.ppt,.pptx,.odp,.key',
    exts: ['doc','docx','txt','rtf','odt','pdf','md','pages','xls','xlsx','csv','ods','xlsm','ppt','pptx','odp','key'],
    targets: {
      docx: { label: 'Word 文档', ext: 'docx' },
      txt: { label: '纯文本', ext: 'txt' },
      md: { label: 'Markdown', ext: 'md' },
      html: { label: 'HTML 网页', ext: 'html' },
      pdf: { label: 'PDF 文档', ext: 'pdf' },
      csv: { label: 'CSV 表格', ext: 'csv' },
      json: { label: 'JSON 数据', ext: 'json' },
      xlsx: { label: 'Excel 表格', ext: 'xlsx' }
    }
  },
  image: {
    id: 'image',
    emoji: '🖼️',
    title: '图像与图片',
    desc: 'JPG、PNG、WebP、GIF、SVG 等格式互转',
    color: 'purple',
    bgGradient: 'from-purple-500/20 to-pink-500/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
    dotColor: 'bg-purple-400',
    accept: '.jpg,.jpeg,.png,.gif,.bmp,.webp,.tiff,.tif,.heic,.avif,.svg',
    exts: ['jpg','jpeg','png','gif','bmp','webp','tiff','tif','heic','avif','svg'],
    targets: {
      png: { label: 'PNG 图片', ext: 'png' },
      jpg: { label: 'JPEG 图片', ext: 'jpg' },
      webp: { label: 'WebP 图片', ext: 'webp' },
      gif: { label: 'GIF 动图', ext: 'gif' },
      bmp: { label: 'BMP 图片', ext: 'bmp' }
    }
  },
  ebook: {
    id: 'ebook',
    emoji: '📚',
    title: '电子书',
    desc: 'EPUB、MOBI、AZW3 等电子书格式转换',
    color: 'amber',
    bgGradient: 'from-amber-500/20 to-orange-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
    dotColor: 'bg-amber-400',
    accept: '.epub,.mobi,.azw3,.pdf',
    exts: ['epub','mobi','azw3','pdf'],
    targets: {
      txt: { label: '纯文本', ext: 'txt' },
      html: { label: 'HTML 网页', ext: 'html' }
    }
  },
  data: {
    id: 'data',
    emoji: '💾',
    title: '数据与压缩包',
    desc: 'JSON、CSV、XML、YAML 等数据格式互转',
    color: 'emerald',
    bgGradient: 'from-emerald-500/20 to-teal-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
    accept: '.json,.xml,.csv,.yaml,.yml,.toml,.zip,.rar,.7z',
    exts: ['json','xml','csv','yaml','yml','toml','zip','rar','7z'],
    targets: {
      json: { label: 'JSON', ext: 'json' },
      xml: { label: 'XML', ext: 'xml' },
      csv: { label: 'CSV', ext: 'csv' },
      yaml: { label: 'YAML', ext: 'yaml' },
      toml: { label: 'TOML', ext: 'toml' },
      zip: { label: 'ZIP 压缩包', ext: 'zip' }
    }
  }
};

export const SUPPORTED_MATRIX = {
  document: {
    docx:  ['txt','md','html','pdf'],
    xlsx:  ['csv','json','html','xlsx'],
    xls:   ['csv','json','html','xlsx'],
    csv:   ['csv','json','html','xlsx'],
    ods:   ['csv','json','html','xlsx'],
    txt:   ['txt','md','html','pdf'],
    md:    ['txt','md','html','pdf'],
    html:  ['txt','md','html'],
    pdf:   [],
    doc:   [],
    rtf:   [],
    odt:   [],
    pages: [],
    ppt:   [],
    pptx:  [],
    odp:   [],
    key:   [],
    xlsm:  []
  },
  image: {
    jpg:   ['png','jpg','webp','gif','bmp'],
    jpeg:  ['png','jpg','webp','gif','bmp'],
    png:   ['png','jpg','webp','gif','bmp'],
    gif:   ['png','jpg','webp','gif','bmp'],
    bmp:   ['png','jpg','webp','gif','bmp'],
    webp:  ['png','jpg','webp','gif','bmp'],
    tiff:  ['png','jpg','webp','gif','bmp'],
    tif:   ['png','jpg','webp','gif','bmp'],
    svg:   ['png','jpg','webp','bmp'],
    heic:  [],
    avif:  []
  },
  ebook: {
    epub:  ['txt','html'],
    mobi:  ['txt'],
    azw3:  ['txt'],
    pdf:   []
  },
  data: {
    json:  ['json','xml','csv','yaml','toml'],
    xml:   ['json','xml','csv','yaml','toml'],
    csv:   ['json','xml','csv','yaml','toml'],
    yaml:  ['json','xml','csv','yaml','toml'],
    yml:   ['json','xml','csv','yaml','toml'],
    toml:  ['json','xml','csv','yaml','toml'],
    zip:   ['zip'],
    rar:   [],
    '7z':  []
  }
};

export function getSupportedTargets(catId, filename) {
  const ext = getExt(filename);
  const matrix = SUPPORTED_MATRIX[catId];
  return matrix ? (matrix[ext] || []) : [];
}

export function getExt(name) { return name.split('.').pop().toLowerCase(); }
export function getCat(name) {
  const e = getExt(name);
  for (const [c, info] of Object.entries(CATEGORIES)) if (info.exts.includes(e)) return c;
  return null;
}
export function fmtSize(b) {
  if (!b) return '0 B';
  const u = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(b)/Math.log(1024));
  return (b/Math.pow(1024,i)).toFixed(1)+' '+u[i];
}
export function dlBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
export function readAB(file) { return new Promise((r,j)=>{const R=new FileReader();R.onload=e=>r(e.target.result);R.onerror=j;R.readAsArrayBuffer(file);}); }
export function readText(file) { return new Promise((r,j)=>{const R=new FileReader();R.onload=e=>r(e.target.result);R.onerror=j;R.readAsText(file);}); }
export function readData(file) { return new Promise((r,j)=>{const R=new FileReader();R.onload=e=>r(e.target.result);R.onerror=j;R.readAsDataURL(file);}); }
export function sleep(ms){return new Promise(r=>setTimeout(r,ms));}