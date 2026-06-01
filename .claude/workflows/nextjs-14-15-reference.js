export const meta = {
  name: 'nextjs-14-15-reference',
  description: 'Research Next.js 14→15 (App Router, RSC, caching, Server Actions, PPR, Next15 async APIs & breaking changes) from official docs + community, verify version-sensitive claims, return structured content for a polished HTML reference',
  phases: [
    { title: 'Research', detail: 'parallel web research over 14 Next.js topic areas' },
    { title: 'Verify', detail: 'adversarially verify version-sensitive claims vs official docs' },
    { title: 'Synthesize', detail: 'consolidate intro, migration cheat-sheet, glossary' },
  ],
}

const TOPIC_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    topicId: { type: 'string' },
    title: { type: 'string' },
    summary: { type: 'string', description: '2-4 句總覽，中英混合（術語英文、說明繁中）' },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          heading: { type: 'string' },
          body: { type: 'string', description: '說明文字，中英混合，可用簡單條列符號 - ' },
          code: { type: 'string', description: '完整可讀的程式碼範例，沒有就空字串' },
          codeLang: { type: 'string', description: 'tsx | ts | js | bash | json，預設 tsx' },
          version: { type: 'string', description: '此功能引入或改變的版本，如 14.0 / 14.2 / 15.0；無則空字串' },
          bestPractices: { type: 'array', items: { type: 'string' } },
          gotchas: { type: 'array', items: { type: 'string' } },
        },
        required: ['heading', 'body'],
      },
    },
    keyClaims: {
      type: 'array',
      description: '此主題中「版本敏感、容易寫錯」的事實宣稱，供查證階段驗證',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: { claim: { type: 'string' }, version: { type: 'string' } },
        required: ['claim'],
      },
    },
    citations: { type: 'array', items: { type: 'string' }, description: '參考 URL（優先官方文件）' },
  },
  required: ['topicId', 'title', 'summary', 'sections', 'citations'],
}

const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    claim: { type: 'string' },
    verdict: { type: 'string', enum: ['confirmed', 'refuted', 'uncertain'] },
    correction: { type: 'string', description: '若 refuted/uncertain，寫出正確說法；否則空字串' },
    source: { type: 'string', description: '查證所依據的 URL' },
  },
  required: ['claim', 'verdict'],
}

const SYNTH_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    intro: { type: 'string', description: '整份指南的開場總覽，中英混合，3-6 句' },
    migrationCheatsheet: {
      type: 'array',
      description: 'Next 14 → 15 breaking changes / 升級重點，逐條',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          change: { type: 'string' },
          impact: { type: 'string' },
          action: { type: 'string', description: '開發者該怎麼改' },
          version: { type: 'string' },
        },
        required: ['change', 'action'],
      },
    },
    glossary: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: { term: { type: 'string' }, definition: { type: 'string' } },
        required: ['term', 'definition'],
      },
    },
    latestVersionNote: { type: 'string', description: '截至研究時 Next.js 的最新穩定版本與重點' },
  },
  required: ['intro', 'migrationCheatsheet', 'glossary'],
}

const TOPICS = [
  { id: 'app-router', title: 'App Router 與檔案慣例', brief: 'app/ 目錄、layout/page/loading/error/not-found/template/default 檔案慣例、route groups (folder)、dynamic segments [slug]/[...slug]/[[...slug]]、parallel routes @slot、intercepting routes (.)(..)、linking 與 navigation (next/link, useRouter, redirect, permanentRedirect)、route 設定 (dynamic, revalidate, fetchCache, runtime, preferredRegion)。' },
  { id: 'rsc', title: 'React Server Components 與 Client Components', brief: 'Server vs Client Components 預設行為、"use client" 邊界、composition patterns（把 Client 包在 Server 外、用 children 傳 Server 進 Client）、serialization 限制、何時用哪一種、context provider 放置、third-party 套件處理。' },
  { id: 'data-fetching-caching', title: '資料抓取與快取（四層快取）', brief: 'async server component 直接 fetch、fetch 的 cache/next.revalidate/tags 選項、Request Memoization、Data Cache、Full Route Cache、(Client-side) Router Cache 四者差異、unstable_cache、revalidatePath/revalidateTag、cookies/headers 造成 dynamic、Next 15 重大改變：fetch 與 GET Route Handler 與 Client Router Cache 預設不再快取（uncached by default），需明確 opt-in。務必標清 14 vs 15 預設差異。' },
  { id: 'server-actions', title: 'Server Actions 與資料變更', brief: '"use server"（檔案層級與 inline）、form action、programmatic 呼叫、useActionState（取代 useFormState）、useFormStatus、useOptimistic、progressive enhancement、revalidate 與 redirect 在 action 中、安全性（closure 加密、allowedOrigins、dead code elimination、只在 server 執行）、Next 14 起 stable。' },
  { id: 'rendering-streaming', title: '渲染策略與 Streaming', brief: 'Static / Dynamic / Streaming rendering、generateStaticParams、dynamicParams、loading.js 與 React Suspense、streaming with Suspense、何時頁面變 dynamic、edge vs node runtime、ISR（revalidate）。' },
  { id: 'ppr', title: 'Partial Prerendering (PPR)', brief: 'PPR 概念（同一頁 static shell + dynamic holes）、experimental.ppr 設定（incremental / true）、Suspense fallback 作為 static shell、目前 stability 狀態（截至最新版本是否仍 experimental / canary）、與既有快取模型的關係。請特別查證最新 stability 狀態。' },
  { id: 'async-request-apis', title: 'Next 15 非同步 Request APIs（Breaking）', brief: 'Next 15 起 cookies()/headers()/draftMode() 變成 async，需 await；page/layout/route 的 params 與 searchParams 變成 Promise 需 await；codemod (next-codemod / upgrade)；過渡期的同步存取 deprecation 行為。務必標清這是 15.0 的 breaking change，14 仍是同步。' },
  { id: 'metadata-seo', title: 'Metadata API 與 SEO', brief: 'static metadata export、generateMetadata（async、含 parent）、viewport 與 themeColor 改用 viewport export（14.2 起從 metadata 移出）、file-based metadata（favicon/icon/apple-icon、opengraph-image / twitter-image 與 alt、sitemap.ts、robots.ts、manifest.ts）、metadataBase。' },
  { id: 'route-handlers-middleware', title: 'Route Handlers 與 Middleware', brief: 'app/**/route.ts 的 GET/POST/PUT/PATCH/DELETE/OPTIONS/HEAD、NextRequest/NextResponse、dynamic vs static route handler、Next 15 起 GET handler 預設不快取（14 為快取）、middleware.ts、matcher 設定、在 middleware 讀寫 cookie/header、redirect/rewrite、Node.js runtime middleware（最新版本是否支援，請查證）。' },
  { id: 'optimizations', title: '內建最佳化元件', brief: 'next/image（fill、sizes、priority、placeholder、remotePatterns、loader）、next/font（local 與 google、preload、CSS variable）、next/script（strategy）、next/link（prefetch 行為，Next 15 prefetch 與 Router Cache staleTimes 互動）、next/form（Next 15 引入的 <Form> 元件，client-side navigation + prefetch）。' },
  { id: 'tooling-config', title: 'Turbopack、設定與 Instrumentation', brief: 'Turbopack：next dev --turbo（dev 已 stable）與 build（beta/alpha 狀態，請查證最新）、next.config.ts（Next 15 支援 TypeScript 設定檔）、instrumentation.ts（register、onRequestError，Next 15 起 stable）、after() API（回應後執行工作，Next 15 stable）、experimental flags 概覽、ESLint 9 / flat config 支援。' },
  { id: 'nextjs15-whats-new', title: 'Next.js 15 全新功能總覽', brief: 'React 19 支援（與 React 18 相容性）、async request APIs、caching 預設變更、@next/codemod upgrade CLI、Turbopack dev stable、靜態路由指示器、forbidden()/unauthorized() 與 forbidden.tsx/unauthorized.tsx（403/401，experimental authInterrupts）、staleTimes 設定、next/form、self-hosting 改善（Cache-Control、sharp、image optimization）、TypeScript next.config.ts、bundlePagesRouterDependencies / serverExternalPackages 改名。並查證 15.0→15.x 後續小版本與目前是否已有 Next 16。' },
  { id: 'version-timeline', title: '版本演進時間軸 14.0 → 15.x', brief: '逐版本重點：14.0（Server Actions stable, PPR preview, next/image 改善）、14.1、14.2（Turbopack dev 進展、error overlay、Tree-shaking、viewport export 分離）、15.0（React 19, async APIs, caching 變更, Turbopack dev stable）、15.1、15.2、15.3、15.4、15.5 等後續版本各自重點。請以官方 blog / release notes 查證每個版本的實際發布內容與日期。' },
  { id: 'best-practices-security', title: '最佳實踐、效能與安全', brief: '效能（bundle 分析、dynamic import、第三方 script、@next/third-parties、streaming 優先、避免不必要 dynamic）、安全（Server Actions 安全模型、taint API experimental.taint、server-only / client-only 套件、環境變數 NEXT_PUBLIC_ 邊界、Data Access Layer 模式、避免把 secret 傳到 client）、錯誤處理（error.tsx、global-error.tsx、not-found）、測試（Vitest/Jest 對 async server component 的限制、Playwright E2E）、common pitfalls。' },
]

const researchPrompt = (t) => `你是一位資深 Next.js 技術文件作者。請研究主題：「${t.title}」。

涵蓋重點：
${t.brief}

要求：
1. 先用 WebSearch / WebFetch 工具查閱「最新」官方文件（nextjs.org/docs、nextjs.org/blog release notes）與可信社群分享，確認到 2025-2026 的最新狀態。若這些工具未載入，先用 ToolSearch 以 "select:WebSearch,WebFetch" 載入它們。
2. 內容務必「中英混合」：技術術語、API 名稱、設定鍵保留英文；說明用繁體中文。
3. 涵蓋 Next.js 14 → 15 全部相關核心，並「明確標註版本差異」（哪個版本引入、哪個版本是 breaking change）。
4. 每個 section 盡量附「完整、可直接讀懂」的程式碼範例（TypeScript / TSX 優先），放在 code 欄位，codeLang 標好語言。
5. 每個 section 視情況補 bestPractices（最佳實踐）與 gotchas（常見地雷 / 易錯點）。
6. 產出 5-8 個 sections，內容要紮實、實務導向，這份內容會被放進正式團隊參考文件。
7. keyClaims：列出 3-5 條「版本敏感、寫錯會出事」的事實宣稱（例如某預設行為在哪個版本改變），供後續查證。
8. citations：附上你實際參考的官方 URL。

直接回傳結構化結果。`

const verifyPrompt = (claim, topicTitle) => `你是嚴格的 Next.js 文件事實查核員。請查證以下關於「${topicTitle}」的版本敏感宣稱是否正確：

宣稱：「${claim.claim}」${claim.version ? `（聲稱版本：${claim.version}）` : ''}

要求：
- 用 WebSearch / WebFetch 對照「官方文件 nextjs.org/docs 或官方 blog」。若工具未載入，先 ToolSearch "select:WebSearch,WebFetch"。
- 特別留意 Next.js 14 與 15 之間的差異（caching 預設、async request APIs、route handler 快取等最常被寫錯）。
- verdict：confirmed（官方明確支持）、refuted（官方明確相反）、uncertain（查不到明確依據）。
- 若 refuted 或 uncertain，在 correction 寫出正確/最新說法。
- source 填你查證所依據的 URL。
- 保守原則：查不到明確官方依據就 uncertain，不要硬說 confirmed。`

const synthPrompt = (topics) => {
  const outline = topics
    .map((t) => `- ${t.title}: ${t.summary}`)
    .join('\n')
  return `以下是一份 Next.js 14 → 15 完整參考文件的各主題摘要：

${outline}

請產出整份文件的彙整層內容（中英混合，術語英文、說明繁中）：
1. intro：整份指南的開場總覽（3-6 句），點出這份文件涵蓋 Next.js 14→15 哪些核心與適用對象（App Router 為主）。
2. migrationCheatsheet：Next.js 14 → 15 的 breaking changes / 升級重點逐條（async request APIs、caching 預設變更、GET route handler 預設不快取、Client Router Cache staleTimes、React 19、ESLint 9、設定鍵改名等），每條含 change / impact / action / version。請力求完整。
3. glossary：10-16 條關鍵術語的精簡定義（RSC、PPR、Streaming、Data Cache、Full Route Cache、Router Cache、Request Memoization、Server Actions、Hydration、ISR、Dynamic Rendering、Static Rendering、Edge Runtime、Suspense 等）。
4. latestVersionNote：截至目前你查到的 Next.js 最新穩定版本與其重點（請以官方資訊為準）。

直接回傳結構化結果。`
}

phase('Research')
const verified = await pipeline(
  TOPICS,
  (t) => agent(researchPrompt(t), { label: `research:${t.id}`, phase: 'Research', schema: TOPIC_SCHEMA }),
  (topic, orig) => {
    if (!topic) return null
    const claims = (topic.keyClaims || []).slice(0, 4)
    if (!claims.length) return { ...topic, verdicts: [] }
    return parallel(
      claims.map((c) => () =>
        agent(verifyPrompt(c, topic.title), { label: `verify:${orig.id}`, phase: 'Verify', schema: VERDICT_SCHEMA }),
      ),
    ).then((vs) => ({ ...topic, verdicts: vs.filter(Boolean) }))
  },
)
const topics = verified.filter(Boolean)
log(`Research+Verify 完成：${topics.length}/${TOPICS.length} 主題`)

phase('Synthesize')
const synthesis = await agent(synthPrompt(topics), { label: 'synthesize', phase: 'Synthesize', schema: SYNTH_SCHEMA })

return { topics, synthesis }
