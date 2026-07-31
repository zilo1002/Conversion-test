FormatHub 🔄
纯前端多格式文件转换工具 — 文件在浏览器本地处理，零上传、零服务器。

Deploy
License

✨ 功能特性
纯前端处理 — 所有转换在浏览器内完成，文件不上传任何服务器
隐私安全 — 敏感文档无需离开本地设备
多文件批量 — 支持同时上传多个文件，独立设置目标格式
200MB 单文件限制 — 大文件友好
全平台适配 — 手机、平板、电脑完美响应
零成本部署 — GitHub Pages 免费托管，自动 CI/CD
📂 支持格式
分类	源格式	可转换目标
🖼️ 图片	JPG、PNG、WebP、GIF、BMP、SVG	互转全部（Canvas 编码）
📊 数据	JSON、XML、CSV、YAML、TOML	互转全部（纯文本解析）
📄 文档	DOCX	TXT、Markdown、HTML、PDF
📈 表格	XLSX、XLS、CSV、ODS	CSV、JSON、XLSX、HTML
📝 文本	TXT、Markdown	PDF（jsPDF 生成）
📚 电子书	EPUB	TXT、HTML（ZIP 解压提取）
📚 电子书	MOBI、AZW3	TXT（简单文本提取）
💾 压缩包	ZIP	内容提取 / 重新打包
🚀 快速部署
方式一：GitHub Actions 自动部署（推荐）
Fork 或新建仓库

在 GitHub 新建仓库，命名为 file-converter
将所有文件上传至 main 分支
确认 vite.config.js 的 base 路径

如果你的仓库名是 file-converter：

export default defineConfig({
  base: '/file-converter/',
  // ...
})
如果是 用户名.github.io 仓库：

export default defineConfig({
  base: '/',
  // ...
})
生成 package-lock.json

在本地或 GitHub Codespaces 运行：

npm install
git add package-lock.json
git commit -m "add lockfile"
git push
开启 GitHub Pages

进入仓库 Settings → Pages

Source 选择 GitHub Actions
保存后，Actions 会自动构建并部署
查看部署状态

进入仓库 Actions 标签页，确认工作流显示 🟢 绿色对勾

访问站点

部署成功后，Settings → Pages 顶部会显示：

🟢 Your site is live at https://你的用户名.github.io/file-converter/

方式二：手动部署到 gh-pages 分支
如果你不想用 Actions：

npm install
npm run build
git add dist -f
git commit -m "deploy"
git subtree push --prefix dist origin gh-pages
然后在 Settings → Pages 中选择 gh-pages 分支部署。

📁 项目结构
file-converter/
├── .github/workflows/deploy.yml   # GitHub Actions 自动部署配置
├── index.html                      # 入口 HTML
├── package.json                    # 项目依赖
├── package-lock.json               # 锁定依赖版本（必需）
├── vite.config.js                  # Vite 构建配置
├── src/
│   ├── main.js                     # 主逻辑 & UI 渲染
│   ├── utils.js                    # 工具函数（格式识别、文件读取等）
│   └── converters/
│       ├── image.js                # 图片格式转换（Canvas）
│       ├── data.js                 # 数据格式互转（JSON/XML/CSV/YAML/TOML）
│       ├── document.js             # 文档处理（DOCX/XLSX → 多种格式）
│       ├── archive.js              # ZIP 压缩包处理
│       └── ebook.js                # 电子书提取（EPUB/MOBI/AZW3）
└── README.md
🛠️ 本地开发
# 克隆仓库
git clone https://github.com/你的用户名/file-converter.git
cd file-converter

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
⚠️ 已知限制
由于是纯前端实现，以下功能受限：

限制	说明
DOCX 生成	只能读取/提取，无法生成 DOCX 文件
PPTX 处理	暂不支持 PowerPoint 解析
RAR / 7Z	浏览器端解压困难，仅支持 ZIP 格式
MOBI → EPUB	格式复杂，仅支持简单文本提取
大文件	受浏览器内存限制，建议 200MB 以内
HEIC	依赖 heic2any，部分浏览器可能不支持
🐛 常见问题
Q: Actions 部署后没有显示网址？
A: 按以下顺序排查：

进入仓库 Actions 标签，确认工作流是 🟢 成功状态
确认 vite.config.js 中的 base 与仓库名一致
确认已提交 package-lock.json（npm install 会自动生成）
确认仓库是 Public（私有仓库需 GitHub Pro 才能用 Pages）
首次部署可能需要等待 2-3 分钟
Q: 部署后页面空白、资源 404？
A: 99% 是 base 路径配置错误。检查 vite.config.js：

仓库名为 file-converter → base: '/file-converter/'
用户名为 abc，仓库名为 abc.github.io → base: '/'
修改后重新 push，Actions 会自动重新部署。

Q: 手机能用吗？
A: 完全支持。界面已做移动端适配，拖拽上传在手机上点击即可选择文件。

Q: 文件安全吗？
A: 100% 本地处理。所有转换逻辑在浏览器内执行，文件不会上传到任何服务器。可以断网使用（CDN 库需首次联网加载）。

🧰 技术栈
Vite — 构建工具
Tailwind CSS — 样式框架（CDN）
JSZip — ZIP 处理
SheetJS — Excel 解析
mammoth.js — DOCX 提取
jsPDF — PDF 生成
PapaParse — CSV 解析
js-yaml — YAML 处理
📄 License
MIT License — 自由使用、修改、分发。
