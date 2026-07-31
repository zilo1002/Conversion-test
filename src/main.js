import {
  MAX_SIZE, FORMAT_MAP, getCategory, getExt,
  formatSize, downloadBlob, getColorClasses, sleep
} from './utils.js';
import { convertImage } from './converters/image.js';
import { convertData } from './converters/data.js';
import { convertDocument } from './converters/document.js';
import { handleArchive, createZipFromFiles } from './converters/archive.js';
import { convertEbook } from './converters/ebook.js';

let files = [];
let converting = false;
const app = document.getElementById('app');

function render() {
  app.innerHTML = `
    <header class="border-b border-slate-800 glass sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
          </div>
          <div>
            <h1 class="text-xl font-bold tracking-tight">FormatHub</h1>
            <p class="text-xs text-slate-400">多格式转换中心</p>
          </div>
        </div>
        <div class="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/50">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          纯前端处理 · 文件不上传服务器
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <section>
        <div id="dropZone" class="group relative border-2 border-dashed border-slate-600 rounded-2xl bg-slate-800/30 hover:bg-slate-800/50 hover:border-cyan-500/50 transition-all duration-300 p-8 sm:p-14 text-center cursor-pointer overflow-hidden">
          <input type="file" id="fileInput" multiple class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
          <div class="relative z-0 pointer-events-none">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-700/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
            </div>
            <h2 class="text-lg sm:text-xl font-semibold mb-2">拖拽文件到此处，或点击上传</h2>
            <p class="text-slate-400 text-sm mb-4">支持多文件同时上传 · 单文件最大 200MB · 纯浏览器端处理</p>
            <div class="flex flex-wrap justify-center gap-2 text-xs text-slate-500">
              <span class="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 uppercase">docx</span>
              <span class="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 uppercase">pdf</span>
              <span class="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 uppercase">png</span>
              <span class="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 uppercase">epub</span>
              <span class="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 uppercase">json</span>
              <span class="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 uppercase">zip</span>
            </div>
          </div>
        </div>
        <div id="fileList" class="hidden mt-6 space-y-3"></div>
      </section>

      <section id="conversionPanel" class="hidden rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-lg font-semibold">转换设置</h3>
            <p class="text-xs text-slate-500 mt-1">选择每个文件的目标格式后点击开始</p>
          </div>
          <div class="flex gap-2">
            <button id="zipAllBtn" class="text-xs px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors hidden">打包为 ZIP</button>
            <button id="clearAllBtn" class="text-xs px-3 py-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-colors">清空全部</button>
          </div>
        </div>
        <div id="conversionList" class="space-y-3"></div>
        <div class="mt-6 flex justify-end">
          <button id="convertBtn" class="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            开始转换
          </button>
        </div>
      </section>

      <section class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${renderCategoryCard('document', '📄', '文档与办公文件', [['文档/文字','DOC/DOCX、TXT、RTF、ODT、PDF、Markdown、PAGES'],['表格/数据','XLS/XLSX、CSV、ODS、XLSM'],['演示文稿','PPT/PPTX、ODP、KEY']], 'PDF ↔ Office 互转 · 文档转图片/TXT')}
        ${renderCategoryCard('image', '🖼️', '图像与图片', [['常见格式','JPG/JPEG、PNG、GIF、BMP、WebP、TIFF'],['新兴/专业格式','HEIC、AVIF、SVG（矢量图）']], '格式互转 · 压缩优化 · 节省空间')}
        ${renderCategoryCard('ebook', '📚', '电子书', [['常见格式','EPUB、MOBI、AZW3、PDF']], '跨阅读器格式转换 · Kindle 适配')}
        ${renderCategoryCard('data', '💾', '数据与压缩包', [['数据格式','JSON、XML、CSV、YAML、TOML'],['压缩格式','ZIP、RAR、7Z']], '数据格式互转 · ZIP 解压与打包')}
      </section>

      <section class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        ${renderFeature('🔒', '本地处理', '文件不上传服务器')}
        ${renderFeature('⚡', '极速转换', '浏览器端直接处理')}
        ${renderFeature('📱', '全平台', '手机/平板/电脑')}
        ${renderFeature('🆓', '完全免费', '无限制使用')}
      </section>

      <section class="rounded-2xl bg-slate-800/30 border border-slate-700/30 p-6">
        <h3 class="text-lg font-semibold mb-4">📋 纯前端支持矩阵</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs text-slate-400 uppercase bg-slate-800/60">
              <tr><th class="px-4 py-3 rounded-l-lg">源格式</th><th class="px-4 py-3">可转目标</th><th class="px-4 py-3 rounded-r-lg">说明</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-700/30">
              <tr><td class="px-4 py-3 font-medium text-blue-400">JPG/PNG/WebP/GIF/BMP</td><td class="px-4 py-3 text-slate-300">互转全部</td><td class="px-4 py-3 text-slate-500">Canvas API</td></tr>
              <tr><td class="px-4 py-3 font-medium text-blue-400">SVG</td><td class="px-4 py-3 text-slate-300">PNG, JPG, WebP, BMP</td><td class="px-4 py-3 text-slate-500">Canvas 渲染矢量图</td></tr>
              <tr><td class="px-4 py-3 font-medium text-blue-400">HEIC</td><td class="px-4 py-3 text-slate-300">JPG, PNG</td><td class="px-4 py-3 text-slate-500">heic2any 解码</td></tr>
              <tr><td class="px-4 py-3 font-medium text-purple-400">JSON/XML/CSV/YAML/TOML</td><td class="px-4 py-3 text-slate-300">互转全部</td><td class="px-4 py-3 text-slate-500">纯文本解析与序列化</td></tr>
              <tr><td class="px-4 py-3 font-medium text-amber-400">DOCX</td><td class="px-4 py-3 text-slate-300">TXT, MD, HTML, PDF</td><td class="px-4 py-3 text-slate-500">mammoth.js 提取</td></tr>
              <tr><td class="px-4 py-3 font-medium text-amber-400">XLSX/XLS/CSV/ODS</td><td class="px-4 py-3 text-slate-300">CSV, JSON, XLSX, HTML</td><td class="px-4 py-3 text-slate-500">SheetJS 解析</td></tr>
              <tr><td class="px-4 py-3 font-medium text-emerald-400">TXT/MD</td><td class="px-4 py-3 text-slate-300">PDF</td><td class="px-4 py-3 text-slate-500">jsPDF 生成</td></tr>
              <tr><td class="px-4 py-3 font-medium text-emerald-400">EPUB</td><td class="px-4 py-3 text-slate-300">TXT, HTML</td><td class="px-4 py-3 text-slate-500">JSZip 解压提取</td></tr>
              <tr><td class="px-4 py-3 font-medium text-emerald-400">MOBI/AZW3</td><td class="px-4 py-3 text-slate-300">TXT</td><td class="px-4 py-3 text-slate-500">文本提取（简单）</td></tr>
              <tr><td class="px-4 py-3 font-medium text-emerald-400">ZIP</td><td class="px-4 py-3 text-slate-300">内容提取 / 重新打包</td><td class="px-4 py-3 text-slate-500">JSZip 解压</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <footer class="border-t border-slate-800 mt-12 py-8 text-center text-slate-500 text-sm">
      <p>FormatHub · 纯前端多格式转换工具</p>
      <p class="mt-1 text-xs">支持 40+ 格式 · 最大 200MB · GitHub Pages 部署</p>
    </footer>

    <div id="toast" class="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none">
      <div class="px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 shadow-xl flex items-center gap-3">
        <span id="toastIcon"></span>
        <span id="toastMsg" class="text-sm font-medium"></span>
      </div>
    </div>

    <div id="extractModal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-slate-800 rounded-2xl border border-slate-700 max-w-lg w-full max-h-[80vh] flex flex-col">
        <div class="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 class="font-semibold">ZIP 内容提取</h3>
          <button id="closeModal" class="p-1 rounded-lg hover:bg-slate-700 text-slate-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div id="extractList" class="p-4 overflow-y-auto space-y-2 flex-1"></div>
      </div>
    </div>
  `;

  bindEvents();
  renderFileList();
}

function renderCategoryCard(cat, emoji, title, items, footer) {
  const colors = getColorClasses(cat);
  return `
    <div class="category-card group relative rounded-2xl bg-slate-800/30 border border-slate-700/40 hover:${colors.border} p-6 transition-all duration-300 hover:bg-slate-800/50 category-glow">
      <div class="flex items-start justify-between mb-4">
        <div class="w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center text-xl">${emoji}</div>
        <span class="text-xs font-medium ${colors.text} ${colors.bg} px-2 py-1 rounded-full">${FORMAT_MAP[cat].label}</span>
      </div>
      <h3 class="text-lg font-semibold mb-3">${title}</h3>
      <div class="space-y-2 text-sm text-slate-400">
        ${items.map(([k, v]) => '<div><span class="text-slate-300 font-medium">' + k + ':</span> <span class="text-xs">' + v + '</span></div>').join('')}
      </div>
      <div class="mt-4 pt-4 border-t border-slate-700/40">
        <p class="text-xs text-slate-500">${footer}</p>
      </div>
    </div>
  `;
}

function renderFeature(icon, title, desc) {
  return `
    <div class="text-center p-4 rounded-xl bg-slate-800/20 border border-slate-700/20 hover:border-slate-600/40 transition-colors">
      <div class="text-2xl mb-2">${icon}</div>
      <p class="text-sm font-medium">${title}</p>
      <p class="text-xs text-slate-500 mt-1">${desc}</p>
    </div>
  `;
}
function bindEvents() {
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const clearAllBtn = document.getElementById('clearAllBtn');
  const convertBtn = document.getElementById('convertBtn');
  const zipAllBtn = document.getElementById('zipAllBtn');
  const closeModal = document.getElementById('closeModal');

  fileInput.addEventListener('change', e => { handleFiles(e.target.files); e.target.value = ''; });

  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drop-active'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drop-active'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drop-active');
    handleFiles(e.dataTransfer.files);
  });

  clearAllBtn.addEventListener('click', () => { files = []; renderFileList(); });
  convertBtn.addEventListener('click', startConversion);
  zipAllBtn.addEventListener('click', async () => {
    try {
      zipAllBtn.disabled = true;
      zipAllBtn.textContent = '打包中...';
      await createZipFromFiles(files.map(f => f.file));
      showToast('✅', '已打包为 ZIP 下载');
    } catch (e) {
      showToast('❌', e.message);
    } finally {
      zipAllBtn.disabled = false;
      zipAllBtn.textContent = '打包为 ZIP';
    }
  });
  closeModal.addEventListener('click', () => document.getElementById('extractModal').classList.add('hidden'));
}

function handleFiles(fileList) {
  Array.from(fileList).forEach(file => {
    if (file.size > MAX_SIZE) {
      showToast('⚠️', '「' + file.name + '」超过 200MB，已跳过');
      return;
    }
    const ext = getExt(file.name);
    const cat = getCategory(file.name);
    if (!FORMAT_MAP[cat].ext.includes(ext)) {
      showToast('⚠️', '「' + file.name + '」格式暂不支持');
      return;
    }
    files.push({ file, id: Date.now() + Math.random(), status: 'pending', progress: 0 });
  });
  renderFileList();
}

window.removeFile = function(idx) {
  files.splice(idx, 1);
  renderFileList();
};

function renderFileList() {
  const list = document.getElementById('fileList');
  const panel = document.getElementById('conversionPanel');
  const zipAllBtn = document.getElementById('zipAllBtn');

  if (!list) return;
  if (files.length === 0) {
    list.classList.add('hidden');
    panel.classList.add('hidden');
    return;
  }

  list.classList.remove('hidden');
  panel.classList.remove('hidden');
  if (zipAllBtn) zipAllBtn.classList.remove('hidden');

  list.innerHTML = files.map((item, idx) => {
    const { file } = item;
    const ext = getExt(file.name);
    const cat = getCategory(file.name);
    const colors = getColorClasses(cat);
    let statusIcon = '';
    if (item.status === 'done') statusIcon = ' ✅';
    else if (item.status === 'error') statusIcon = ' ❌';
    else if (item.status === 'converting') statusIcon = ' <span class="inline-block w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></span>';

    return '<div class="slide-in flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50' + (item.status === 'done' ? ' border-emerald-500/30' : '') + '">' +
      '<div class="w-10 h-10 rounded-lg ' + colors.bg + ' ' + colors.text + ' flex items-center justify-center text-xs font-bold uppercase shrink-0">' + ext + '</div>' +
      '<div class="flex-1 min-w-0">' +
        '<p class="font-medium truncate text-sm">' + file.name + statusIcon + '</p>' +
        '<p class="text-xs text-slate-500">' + formatSize(file.size) + ' · ' + FORMAT_MAP[cat].label + '</p>' +
        (item.status === 'converting' ? '<div class="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 progress-bar" style="width:' + item.progress + '%"></div></div>' : '') +
        (item.status === 'error' ? '<p class="text-xs text-red-400 mt-1">' + item.error + '</p>' : '') +
      '</div>' +
      '<button onclick="removeFile(' + idx + ')" class="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-500 transition-colors shrink-0">' +
        '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>' +
      '</button>' +
    '</div>';
  }).join('');

  renderConversionSettings();
}

function renderConversionSettings() {
  const conversionList = document.getElementById('conversionList');
  if (!conversionList) return;

  conversionList.innerHTML = files.map((item, idx) => {
    const { file } = item;
    const cat = getCategory(file.name);
    const targets = FORMAT_MAP[cat].targets;
    const colors = getColorClasses(cat);

    return '<div class="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-slate-900/40 border border-slate-700/30">' +
      '<div class="flex items-center gap-3 flex-1 min-w-0">' +
        '<span class="w-2 h-2 rounded-full ' + colors.text.replace('text-', 'bg-') + '"></span>' +
        '<span class="text-sm truncate">' + file.name + '</span>' +
        '<span class="text-xs text-slate-500 shrink-0">→</span>' +
      '</div>' +
      '<select id="target-' + idx + '" class="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:border-cyan-500 focus:outline-none text-slate-200">' +
        Object.entries(targets).map(([val, label]) => '<option value="' + val + '">' + label + ' (' + val.toUpperCase() + ')</option>').join('') +
      '</select>' +
    '</div>';
  }).join('');
}

async function startConversion() {
  if (converting || files.length === 0) return;
  converting = true;
  const btn = document.getElementById('convertBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="inline-flex items-center gap-2"><span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> 转换中 ' + files.length + ' 个文件...</span>';

  for (let i = 0; i < files.length; i++) {
    const item = files[i];
    const targetSelect = document.getElementById('target-' + i);
    const targetFormat = targetSelect ? targetSelect.value : 'txt';

    item.status = 'converting';
    item.progress = 10;
    renderFileList();

    try {
      await sleep(200);
      item.progress = 40;
      renderFileList();

      const cat = getCategory(item.file.name);
      if (cat === 'image') {
        await convertImage(item.file, targetFormat);
      } else if (cat === 'data') {
        if (['zip','rar','7z'].includes(getExt(item.file.name))) {
          const result = await handleArchive(item.file, targetFormat);
          if (result && result.type === 'extracted') {
            showExtractModal(result);
            item.status = 'done';
            item.progress = 100;
            renderFileList();
            continue;
          }
        } else {
          await convertData(item.file, targetFormat);
        }
      } else if (cat === 'document') {
        await convertDocument(item.file, targetFormat);
      } else if (cat === 'ebook') {
        await convertEbook(item.file, targetFormat);
      }

      item.progress = 100;
      item.status = 'done';
      showToast('✅', '「' + item.file.name + '」转换完成');
    } catch (err) {
      item.status = 'error';
      item.error = err.message || '转换失败';
      showToast('❌', '「' + item.file.name + '」' + item.error);
    }
    renderFileList();
    await sleep(300);
  }

  converting = false;
  btn.disabled = false;
  btn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> 开始转换';
}

function showExtractModal(result) {
  const modal = document.getElementById('extractModal');
  const list = document.getElementById('extractList');
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  list.innerHTML = result.entries.map(entry => {
    return '<div class="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">' +
      '<div class="min-w-0">' +
        '<p class="text-sm truncate">' + entry.path + '</p>' +
        '<p class="text-xs text-slate-500">' + formatSize(entry.size) + '</p>' +
      '</div>' +
      '<button class="text-xs px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors shrink-0 ml-2" ' +
        'onclick="downloadExtracted(' + "'" + entry.path.replace(/'/g, "\\'") + "'" + ')">' +
        '下载' +
      '</button>' +
    '</div>';
  }).join('');

  window._extractedEntries = result.entries;
}

window.downloadExtracted = function(path) {
  const entry = window._extractedEntries ? window._extractedEntries.find(e => e.path === path) : null;
  if (entry && entry.content) {
    downloadBlob(entry.content, path.split('/').pop());
    showToast('✅', '已下载 ' + path.split('/').pop());
  }
};

function showToast(icon, msg) {
  const toast = document.getElementById('toast');
  const toastIcon = document.getElementById('toastIcon');
  const toastMsg = document.getElementById('toastMsg');
  toastIcon.textContent = icon;
  toastMsg.textContent = msg;
  toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
  }, 3000);
}

render();