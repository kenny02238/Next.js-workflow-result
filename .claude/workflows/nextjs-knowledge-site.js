export const meta = {
  name: 'nextjs-knowledge-site',
  description: 'Rewrite verified Next.js content into a learning-oriented knowledge base (not a migration guide): readable short-paragraph prose + Mermaid concept diagrams, with version info as light annotation only',
  phases: [
    { title: 'Rewrite', detail: '12 主題改寫成知識/學習導向 + 設計 Mermaid 圖解' },
    { title: 'Diagram QA', detail: '修正 Mermaid 語法使其可被 v11 正確解析' },
    { title: 'Synthesize', detail: '知識站 intro + glossary' },
  ],
}

const SRCBASE = '/tmp/nextjs-src/'

const KTOPICS = [
  { id: 'app-router', src: 'app-router-file-conventions', title: 'App Router 與檔案慣例', icon: '🗂️', diagram: '元件層級巢狀關係（layout → template → error → loading → page 的包裹順序），適合 flowchart TD' },
  { id: 'server-client-components', src: 'nextjs-server-client-components', title: 'Server Components 與 Client Components', icon: '🧩', diagram: 'Server / Client module graph 邊界（"use client" 邊界、哪些留在 server、哪些送到 client），適合 flowchart' },
  { id: 'data-fetching-caching', src: 'nextjs-data-fetching-and-caching-four-layers', title: '資料抓取與四層快取', icon: '💾', diagram: '四層快取資料流：Request Memoization → Data Cache → Full Route Cache →（client）Router Cache，適合 flowchart LR' },
  { id: 'server-actions', src: 'nextjs-server-actions-mutations', title: 'Server Actions 與資料變更', icon: '⚡', diagram: '表單提交 → Server Action 執行 → 變更資料 → revalidate → 回傳 的流程，適合 sequenceDiagram' },
  { id: 'rendering-streaming', src: 'nextjs-rendering-streaming', title: '渲染策略與 Streaming', icon: '🎬', diagram: 'Static / Dynamic / Streaming 的判定，以及 Suspense streaming 流程，適合 flowchart 或 sequenceDiagram' },
  { id: 'ppr', src: 'nextjs-partial-prerendering-ppr', title: 'Partial Prerendering (PPR)', icon: '🧩', diagram: '同一條 route 的 static shell + dynamic holes 結構，適合 flowchart' },
  { id: 'request-apis', src: 'next15-async-request-apis', title: 'Request APIs（cookies / headers / params）', icon: '🍪', diagram: '此主題較難圖像化；若無清楚流程，diagram.kind 設 none' },
  { id: 'metadata-seo', src: 'nextjs-metadata-api-seo', title: 'Metadata API 與 SEO', icon: '🏷️', diagram: 'metadata 解析與合併（layout → page 合併、static metadata + generateMetadata、檔案約定）流程，適合 flowchart' },
  { id: 'route-handlers-middleware', src: 'route-handlers-and-middleware', title: 'Route Handlers 與 Middleware', icon: '🛣️', diagram: 'request 進來 → middleware（攔截 / 改寫 / 重導）→ Route Handler 回應 的流程，適合 sequenceDiagram' },
  { id: 'optimization', src: 'nextjs-builtin-optimization-components', title: '內建最佳化元件', icon: '🚀', diagram: '多半不需流程圖；若無清楚流程，diagram.kind 設 none' },
  { id: 'tooling', src: 'nextjs-turbopack-config-instrumentation', title: 'Turbopack、設定與 Instrumentation', icon: '🛠️', diagram: '多半不需圖；diagram.kind 可設 none' },
  { id: 'best-practices', src: 'nextjs-best-practices-performance-security', title: '效能、安全、錯誤處理與測試', icon: '🛡️', diagram: '若 error.tsx / global-error 的錯誤邊界層級有助理解可畫 flowchart，否則 none' },
]

const KNOWLEDGE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    topicId: { type: 'string' },
    title: { type: 'string' },
    icon: { type: 'string', description: '單一 emoji' },
    tagline: { type: 'string', description: '一句話說明這個主題是什麼' },
    overview: { type: 'string', description: '2-4 句核心觀念，短句好讀' },
    sections: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          heading: { type: 'string' },
          body: { type: 'string', description: '好讀：短段落用空行分隔，清單用 - 開頭，避免超長段落' },
          code: { type: 'string', description: '程式碼範例，無則空字串' },
          codeLang: { type: 'string', description: 'tsx | ts | js | bash | json，預設 tsx' },
          since: { type: 'string', description: '功能引入版本輕註記，如 14.0；無則空字串' },
          bestPractices: { type: 'array', items: { type: 'string' } },
          gotchas: { type: 'array', items: { type: 'string' } },
        },
        required: ['heading', 'body'],
      },
    },
    diagram: {
      type: 'object',
      additionalProperties: false,
      properties: {
        kind: { type: 'string', enum: ['mermaid', 'none'] },
        title: { type: 'string' },
        code: { type: 'string', description: 'Mermaid 定義；kind=none 時留空' },
        caption: { type: 'string' },
      },
      required: ['kind'],
    },
    citations: { type: 'array', items: { type: 'string' } },
  },
  required: ['topicId', 'title', 'overview', 'sections', 'diagram'],
}

const DIAGRAM_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    kind: { type: 'string', enum: ['mermaid', 'none'] },
    title: { type: 'string' },
    code: { type: 'string' },
    caption: { type: 'string' },
    valid: { type: 'boolean' },
    notes: { type: 'string' },
  },
  required: ['kind', 'valid'],
}

const SYNTH_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    intro: { type: 'string' },
    glossary: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: { term: { type: 'string' }, definition: { type: 'string' } },
        required: ['term', 'definition'],
      },
    },
  },
  required: ['intro', 'glossary'],
}

const rewritePrompt = (kt) => `你正在打造一個「Next.js 14+ 知識站」（學習與查詢導向，給工程師平時查閱、學習用），這「不是」升級指南。

步驟：
1. 先用 Read 工具讀取這個主題的「已查證來源內容」：${SRCBASE}${kt.src}.json（內含 title / summary / sections，事實已查證過）。若無法讀取該檔，改用 WebSearch / WebFetch 查 nextjs.org/docs 取得內容（先用 ToolSearch 載入工具）。
2. 以該來源為「事實基礎」，把這個主題改寫成知識站格式。主題定位：${kt.title}。

改寫原則（重要）：
- 「知識 / 學習導向」框架：講「這是什麼、怎麼運作、怎麼用、何時用、最佳實踐、常見錯誤」。
- 「移除升級語氣」：不要以「14 → 15 升級」「breaking change」「版本對照」當主軸或標題。版本資訊改成「輕註記」——用每個 section 的 since 欄位標示功能引入版本（如 "14.0"）；只有當「目前最新穩定版的實際行為」需要提醒時，才在內文用「一句話」帶過（例如「自 15 起 fetch 預設不快取，需明確 opt-in」），不要整段都在講升級或歷史演進。
- 以「目前（Next.js 14 / 15 / 16 最新穩定版）的正確行為」為準，當成現況知識來寫。
- 可讀性（這點很重要）：body 必須好讀——使用「短段落」，段落之間以「空行」分隔；清單用「- 」開頭；避免一大段超長文字，每段聚焦一個重點。
- 中英混合：技術術語 / API 名稱用英文，說明用繁體中文。
- 每個 section 視內容附：清楚的程式碼範例（code，TypeScript / TSX 優先；無則空字串）、bestPractices、gotchas。
- 產出 5-8 個 sections，內容紮實、實務導向；overview 寫 2-4 句核心觀念（短句好讀）；tagline 一句話。

圖解（diagram）：
- 若此主題有「適合圖像化」的概念或流程就提供 Mermaid。建議：${kt.diagram}。
- 只用基本語法：flowchart TD / flowchart LR / sequenceDiagram。
- 所有節點文字「一律用雙引號包」，例如 A["layout.tsx"]、B["Server Component"]。不要用分號結尾、不要在圖裡放 emoji、避免節點文字內出現未包雙引號的 ( ) : ; 等字元。保持精簡（建議 5-12 個節點）。
- title 圖標題；caption 一句話說明這張圖。
- 若不適合圖像化，diagram.kind 設為 "none"，code / caption 留空。

直接回傳結構化結果。`

const diagramDoctorPrompt = (d) => `檢查並修正以下 Mermaid 圖，使其能被 Mermaid v11 正確解析、無語法錯誤。

title: ${d.title}
原始 code：
${d.code}

規則：
- 只允許 flowchart TD / flowchart LR / graph TD / graph LR / sequenceDiagram 開頭。
- 所有節點文字一律用雙引號包，例如 A["next/link"]、B["Server Component"]。
- 移除 / 改寫節點文字內未跳脫且會導致解析失敗的字元（( ) [ ] { } : ; | 等）——用雙引號包住整段文字，或把文字改寫乾淨。
- 移除任何非法或多餘的行。保留原本語意與結構，只修語法。
- sequenceDiagram 的訊息文字若含特殊字元也要清乾淨。
- 若內容根本無法構成「合法且有意義」的圖，valid=false 且 kind="none"。

回傳：valid（是否已是合法可渲染）、修正後的 code（valid=true 時填）、title、caption。`

const synthesisPrompt = (titles) => `這是一個「Next.js 14+ 知識站」，包含以下主題：
${titles.map((t) => '- ' + t).join('\n')}

請產出（中英混合，知識 / 學習導向，避免升級語氣）：
1. intro：3-5 句開場，說明這個知識站涵蓋 Next.js App Router（14 / 15 / 16 現況）的哪些核心知識、適合誰、可如何使用（查詢與學習）。短句、好讀。
2. glossary：18-22 條關鍵術語精簡定義，每條 term + definition（中英混合）。涵蓋如 RSC、Client Component、"use client"、Server Action、Streaming、Suspense、PPR、Request Memoization、Data Cache、Full Route Cache、Router Cache、ISR、Static / Dynamic Rendering、Edge Runtime、Route Handler、Middleware、Hydration、Metadata、generateStaticParams、revalidate、Turbopack 等。`

phase('Rewrite')
const built = await pipeline(
  KTOPICS,
  (kt) => agent(rewritePrompt(kt), { label: `rewrite:${kt.id}`, phase: 'Rewrite', schema: KNOWLEDGE_SCHEMA }),
  (topic, kt) => {
    if (!topic) return null
    const d = topic.diagram
    if (!d || d.kind !== 'mermaid' || !d.code || !d.code.trim()) return topic
    return agent(diagramDoctorPrompt(d), { label: `diagram:${kt.id}`, phase: 'Diagram QA', schema: DIAGRAM_SCHEMA })
      .then((fx) => {
        if (fx && fx.valid && fx.code && fx.code.trim()) {
          return { ...topic, diagram: { kind: 'mermaid', title: fx.title || d.title, code: fx.code, caption: fx.caption || d.caption } }
        }
        return { ...topic, diagram: { kind: 'none', title: '', code: '', caption: '' } }
      })
      .catch(() => topic)
  },
)

const topics = built
  .map((t, i) => (t ? { ...t, topicId: KTOPICS[i].id, icon: t.icon && t.icon.trim() ? t.icon : KTOPICS[i].icon } : null))
  .filter(Boolean)
log(`知識主題完成：${topics.length}/${KTOPICS.length}，含圖解：${topics.filter((t) => t.diagram && t.diagram.kind === 'mermaid').length}`)

phase('Synthesize')
const synthesis = await agent(synthesisPrompt(topics.map((t) => t.title)), { label: 'synthesize', phase: 'Synthesize', schema: SYNTH_SCHEMA })

return { topics, synthesis }
