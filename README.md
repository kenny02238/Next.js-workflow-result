# Next.js 14+ 知識站 (Knowledge Site)

> 一份**學習與查詢導向**的 Next.js App Router 知識站，涵蓋 Next.js **14 / 15 / 16** 的核心功能與最佳實踐。單一自包含 HTML，開啟即用。

整份內容以**繁體中文為主、技術術語保留英文**（中英混合），包含 12 大主題、近 90 段程式碼範例、12 張概念圖解（Mermaid）與術語表。

---

## ⚠️ 請先讀這段（重要說明 / Disclaimer）

- **這是 AI 生成的內容**：透過 [Claude Code](https://claude.com/claude-code) 的多代理 workflow，自動研究官方文件並改寫而成（流程見下方「內容怎麼產生的」）。
- **研究時間點：約 2026-06**。當時 Next.js 最新穩定版為 **16.2.6**。Next.js 改版速度很快，**部分行為、預設值或 API 可能已經變動**。
- **官方文件才是唯一可信來源**：實作前請以 **[nextjs.org/docs](https://nextjs.org/docs)** 為準。本站內容雖經過對抗式事實查核，**仍可能有錯誤或過時之處**。
- **非官方、與 Vercel / Next.js 無任何關係**，僅為個人學習與分享用途。
- 發現錯誤歡迎開 **Issue** 指正 🙏

---

## 🚀 如何使用

**最簡單**：直接用瀏覽器開啟 [`index.html`](./index.html) 即可（不需任何 build、server 或安裝）。

```bash
# 方法 1：直接開
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows

# 方法 2：起一個本機 static server（圖解 / 字型走 CDN，建議連網）
npx serve .
```

> 💡 若你把這個 repo 開啟 **GitHub Pages**（Settings → Pages → 從 root 部署），就能用網址線上瀏覽。

### 內建功能

- 🔍 即時關鍵字搜尋
- 🌗 深色 / 淺色主題切換（圖解會跟著變色）
- 🧭 側欄導覽 + scroll-spy
- 📋 程式碼一鍵複製、語法高亮（Prism）
- 📊 概念圖解（Mermaid，自動主題化）
- 📱 RWD（手機收合側欄）

---

## 📚 內容範圍（12 大主題）

|     | 主題                                   | 重點                                                                                               |
| --- | -------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 🗂️  | App Router 與檔案慣例                  | layout / page / loading / error / template、route groups、dynamic / parallel / intercepting routes |
| 🧩  | Server Components 與 Client Components | `"use client"` 邊界、composition、何時用哪種                                                       |
| 💾  | 資料抓取與四層快取                     | Request Memoization · Data Cache · Full Route Cache · Router Cache                                 |
| ⚡  | Server Actions 與資料變更              | `"use server"`、form action、`useActionState`、revalidate、安全模型                                |
| 🎬  | 渲染策略與 Streaming                   | Static / Dynamic / Streaming、Suspense                                                             |
| 🧪  | Partial Prerendering (PPR)             | static shell + dynamic holes                                                                       |
| 🍪  | Request APIs                           | `cookies()` / `headers()` / `params` / `searchParams`（async）                                     |
| 🏷️  | Metadata API 與 SEO                    | `generateMetadata`、檔案約定、`viewport` export                                                    |
| 🛣️  | Route Handlers 與 Middleware           | `route.ts`、`middleware`、攔截 / 改寫 / 重導                                                       |
| 🚀  | 內建最佳化元件                         | `next/image` · `font` · `script` · `link` · `form`                                                 |
| 🛠️  | Turbopack、設定與 Instrumentation      | Turbopack、`next.config.ts`、`instrumentation.ts`、`after()`                                       |
| 🛡️  | 效能、安全、錯誤處理與測試             | bundle、DAL、error 邊界、testing                                                                   |

> 版本差異（14 → 15 → 16）以**輕註記**方式標在各功能旁（如「Since 14.0」）；完整版本演進時間軸收在頁面底部的**附錄**。

---

## 🛠️ 內容怎麼產生的

採用 [Claude Code](https://claude.com/claude-code) 的多代理 **workflow**（腳本收錄在 [`.claude/workflows/`](./.claude/workflows/)），分兩階段：

1. **研究 + 查證**（`nextjs-14-15-reference.js`）
   - 多個 agent 並行查閱 **nextjs.org 官方文件與 release blog**
   - 對「版本敏感、容易寫錯」的宣稱做**對抗式事實查核**（adversarial verification）
2. **改寫成知識站 + 圖解**（`nextjs-knowledge-site.js`）
   - 以查證過的內容為本，改寫成**學習導向**結構：核心觀念 → 圖解 → 怎麼用 → 何時用 → 範例 → 最佳實踐 → 常見錯誤
   - 為適合圖像化的概念自動產生 **Mermaid 圖解**

原始研究資料（含查核結果）保留在 [`nextjs-research-raw.json`](./nextjs-research-raw.json)；網站實際使用的結構化資料在 [`nextjs-knowledge-data.json`](./nextjs-knowledge-data.json)。

---

## 📁 專案結構

```
.
├── index.html                       # 知識站本體（自包含，開啟即用）
├── nextjs-knowledge-data.json       # 網站使用的結構化知識資料
├── nextjs-research-raw.json         # 原始研究資料（含對抗式查核結果）
└── .claude/
    └── workflows/                   # 可重複執行的 Claude Code workflow
        ├── nextjs-14-15-reference.js
        └── nextjs-knowledge-site.js
```

---

## 🧰 技術

- 單一 **HTML** 檔，無框架、無 build step
- [Prism.js](https://prismjs.com/)（語法高亮，CDN）
- [Mermaid](https://mermaid.js.org/)（概念圖解，CDN）
- Google Fonts：Inter / JetBrains Mono / Noto Sans TC（CDN）

> 字型、語法高亮與圖解走 CDN，**完全離線時這些會降級**（純文字仍可閱讀）。

---

## 🤝 回報與貢獻

內容若有錯誤、過時或表達不清，歡迎開 **Issue** 或 **PR** 指正。請務必附上**官方文件連結**作為依據。

## 📄 授權與聲明

僅供學習與分享。**非官方文件**，與 Vercel / Next.js 無關。實作請以 [nextjs.org/docs](https://nextjs.org/docs) 為準。
