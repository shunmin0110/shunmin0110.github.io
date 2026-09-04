# 禾捷電子科技官網（harjet-technology.com）

這個 repo 是禾捷電子科技有限公司（HarJET Technology）的官方網站，用 GitHub Pages 發布。
每次開工先讀本檔與 `notes/`，接續前次進度，不要重問已知資訊。

## 現況
- 網址：https://harjet-technology.com（網域註冊在 Wix，DNS 在 Wix 設 A/CNAME 指向 GitHub Pages）
- 發布：push 到 `main` 即自動上線（約 1 分鐘）。`CNAME` 檔綁網域，勿刪。
- 純靜態：HTML + `style.css` + `main.js`，無框架、無建置步驟。
- 頁面：`index.html` 首頁、`traffic.html` 智慧交通（主攻）、`products.html` HJ-873AI 產品頁、`about.html` 關於＋聯絡
- 首頁主視覺：`main.js` 內 Canvas 動畫「AI 車流辨識」；尊重 prefers-reduced-motion。

## 品牌規範（VI）
- 色（官方值，2026-09-04 由 .ai 取得）：深藍 #43667C（主色）、墨藍 #002A3A、灰藍 #A2B9CB、淺灰 #D9D9D6；青色 #5CC8E0 只用於 AI 辨識相關元素。
  **`style.css` 目前仍用舊估讀值（#0F2A3C／#1F3D52／#A8BCC9／#D8DAD6），尚未換成官方值** —— 見待辦。
- 字體：英文 Goldman（Google Fonts）、中文 Noto Sans TC、標籤 IBM Plex Mono
- 品牌概念「和・捷・悅」；標語「創新 迅捷 和悅」
- Logo：盾牌 HJ 字標。原始 `.ai`（69MB）放在 `assets/`，已被 `.gitignore` 排除、不進版本庫，**別刪掉本機那份**；備份在使用者 Google Drive「240205-墨翰設計-禾捷電子科技有限公司-LOGO-OK.ai」。
  網站用的 `assets/logo-mark*.svg／png` 已於 2026-09-04 由該 .ai 直接抽出向量路徑產生（正式版，非重繪）：
  `logo-mark.svg` #43667C 淺底／favicon、`logo-mark-light.svg` #D9D9D6 深底、`logo-mark-white.svg` #FFFFFF 墨藍底，
  另有去背 `logo-mark.png`／`logo-mark-white.png`（1024px 高）。比例 75.295:82.957，**不是方形，勿在 CSS 鎖死 38×38**。

## 內容原則
- 公司定位：AI 影像辨識 × 智慧交通 × 專案管理（PCM）的智慧資通訊整合商，主攻智慧交通
- HJ-873AI 為合作原廠產品，網站以禾捷品牌呈現，**不提原廠名稱**
- 不捏造案例、數字、認證；缺的資料用【待填】標示
- 繁體中文（台灣用語）

## 待辦
- [x] 以正式 Logo 檔取代 `assets/logo-mark*.svg`，並用 VI 橫式組合重做攝影機機身合成（`assets/hj-873ai.png`，底圖為 commit 1a399ef 的未加標原始算圖，依機身側面平面做仿射貼合）
- [ ] 攝影機正式產品圖（使用者已有 HarJET 標版本）、現場照片、AI 辨識截圖
- [ ] 團體照：`assets/LINE_ALBUM_*.jpg` 共 4 張已放在本機但**未 commit、未上頁面**（含員工與孩童人像，上線前需使用者確認肖像同意）
- [x] 電話 06-3127016、地址 臺南市永康區大灣路942巷71弄139號、統編 93523931（已填入 about.html 與各頁 footer）
- [ ] 工程實績實際案件
- [ ] Google Search Console 登記、提交 sitemap.xml
- [ ] VI 色碼校正：官方值已確認（見上），待把 `style.css` 的 `--navy`／`--blue`／`--steel`／`--light` 換成 #002A3A／#43667C／#A2B9CB／#D9D9D6 並全站檢查對比

## 資料
- `notes/company-profile.md`：公司簡介、VI、決策紀錄
- `notes/HJ-873AI-spec.md`：產品規格（來源：原廠規格書）
