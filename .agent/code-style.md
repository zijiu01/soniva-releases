# 核心代码规范与防破坏指南 (.agent/code-style.md)

## 1. 单文件体量控制（硬性 300 行红线）

为防止上下文膨胀、降低审查成本，必须遵守：

- **文件行数限制**：单个源码文件（`.tsx` / `.ts` / `.css`）**建议 150~200 行，硬性上限严禁超过 300 行**。
- **主动拆分策略**：
  - 发布记录与文档内容 ── 一律放 `public/releases/`、`public/docs/` 的 Markdown
    （frontmatter 存元数据，正文写内容），组件只负责渲染，**禁止在 TS 里写死文案**。
  - 卡片、时间线条目、下载按钮等可复用 UI ── 拆成独立组件。
  - 主题切换、语言、内容读取等逻辑 ── 抽为 Hook 或 `src/lib/` 纯函数。
- `pnpm lint` 内置 `scripts/check-file-size.mjs` 机器执行本规则，超限即失败。

### 入口文件通用防呆规则

- **适用范围**：`src/app/**/page.tsx`、`layout.tsx` 等路由/框架顶层文件。
- **定位**：入口是"大堂"，只做装配、轻量数据注入、元信息接线，业务逻辑与具体 UI 工厂必须下沉。
- **目标体量**：建议 **50~100 行**；超过 150 行先评估拆分；超过 300 行视为严重违规。
- **禁止回流**：已拆出的组件/Hook/数据不得为图省事重新搬回入口文件。

## 2. 防破坏修改指南

- **禁止全量覆写**：除非新建文件，严禁生成整份新文件替代旧文件，必须局部 Diff 增量替换。
- **保留现有 UI & 逻辑结构**：修改前先看懂现有样式与组件结构，不得擅自删除已有类名、结构或函数。
- **改前说明 & 改后验证**：
  1. 修改前用 2 句中文简述计划。
  2. 改完运行 `pnpm typecheck`；交付前运行 `pnpm build` 确认静态导出成功。

## 3. Next.js / React 约定

- 使用 App Router；默认 Server Component，只有需要浏览器 API / 状态时才加 `"use client"`。
- 静态导出（`output: "export"`）：**禁止使用依赖服务端的运行时能力**（Route Handler 写操作、动态 SSR、cookies/headers 等），数据一律在构建期静态生成或浏览器端拉取。
- 图片用 `next/image` 时必须设 `unoptimized`（见 `next.config.ts`）；优先用内联 SVG 或小体积静态图。
- TypeScript 严格模式，**严禁滥用 `any`**；组件 props 必须显式定义类型。
- 样式统一走 Tailwind 语义 Token，禁止写死颜色（见 `.agent/design-system.md`）。

## 4. 依赖与包管理

- 包管理器统一 **pnpm**，唯一锁文件 `pnpm-lock.yaml`；禁止生成 `package-lock.json` / `yarn.lock`。
- 新增依赖前先确认现有依赖能满足需求，避免为一个小功能引入重型库。

## 5. 数据真实性红线

- `public/releases/*.md` 的 frontmatter 是发布记录唯一数据源，**必须与 GitHub Releases 实际状态一致**。
- 未上传产物的版本只能标记为 `upcoming` / `testing`，下载入口显示"即将发布"，严禁伪造可下载链接或"已正式发布"字样。
- 已知问题（如未公证、Gatekeeper 拦截）必须在页面如实提示，不得隐瞒。
