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
