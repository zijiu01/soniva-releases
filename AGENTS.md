# Soniva Releases · AI Agent 全局协作指南 (AGENTS.md)

> **致所有 AI 编码助手（Antigravity / Gemini, Claude Code, Cursor 等）：**
> 本仓库是 **Soniva 桌面端的公开分发仓库**，职责只有两件事：
> ① 用 GitHub Releases 存放打包好的桌面端安装包供用户下载；
> ② 用 GitHub Pages 部署一个官网风格的「发布版本记录」页面。
> 在你执行任何改动前，**必须首先阅读本文件**，并按任务性质调阅 `.agent/` 下的专项规则。

## 1. 仓库性质与红线

| 项 | 说明 |
|---|---|
| 仓库性质 | **公开仓库**。任何人可见，包括提交历史、Issue、Release。 |
| 源码位置 | ⛔ **不在这里**。Soniva 源码在独立的私有 monorepo，本仓库只收产物与展示层。 |
| 二进制存放 | ✅ 一律走 **GitHub Releases 资产**；❌ **绝对禁止把 DMG / zip / exe / pkg 提交进 Git**（GitHub 单文件 100MB 硬限制，DMG 约 151MB）。 |
| 站点技术栈 | Next.js（App Router）+ Tailwind CSS 4 + shadcn 风格组件 + `@remixicon/react`，静态导出（`output: "export"`）后部署到 GitHub Pages。 |
| 设计系统 | 与 Soniva 主产品**完全一致**（语义化 HSL Token、暗色优先、RemixIcon）。见 `.agent/design-system.md`。 |

## 2. 目录与职责

| 路径 | 性质 | 说明 |
|---|---|---|
| `src/app/` | 页面与路由（App Router） | 入口文件只做装配，业务 UI 下沉到 `src/components/` |
| `src/components/` | UI 组件 | `ui/` 放基础组件，业务组件按模块分子目录 |
| `src/lib/` | 数据与工具 | 发布记录数据源、站点配置、`cn()` 等纯函数 |
| `public/` | 静态资源 | 图标、OG 图等，体积务必控制 |
| `.agent/` | Agent 协作文档 | 本仓库的规则与状态快照 |
| `out/` | 静态导出产物 | **已被 `.gitignore` 排除，禁止提交** |

## 3. 专项规则索引

- 涉及 **Git 提交、公开仓库安全、大文件/Release 资产、版本号与标签** ── 必读 `.agent/workflow.md`
- 涉及 **代码编写、单文件 300 行红线、增量修改防破坏、Next.js 约定** ── 必读 `.agent/code-style.md`
- 涉及 **UI 编写、组件选型、Tailwind 语义 Token、暗色适配** ── 必读 `.agent/design-system.md`
- 涉及 **发版流程、产物上传、页面数据更新** ── 必读 `.agent/release-process.md`
- 想知道 **现在是什么状态** ── 读 `.agent/STATUS.md`（覆盖式快照，不是日志）

## 4. 绝对红线 (Universal Non-Negotiables)

1. 🚨 **公开仓库密钥红线**：本仓库公开，**绝对禁止**提交任何密钥、Token、证书（`.p12`）、Apple 专用密码、Supabase Key、`.env` 真实值。模板只写 `.env.example`，不含真实值。
2. 🚨 **严禁提交大二进制**：禁止提交 DMG / zip / exe / pkg / `.app` / `.sonivalib` 等产物。GitHub 单文件上限 100MB，且会永久留在 Git 历史里无法清理。产物一律上传到 Releases。
3. 🚨 **严禁全量 Git 提交**：绝对禁止 `git add .`、`git add -A`、`git commit -a`；禁止擅自 `git restore`、`git reset --hard`、`git checkout .`。只许显式暂存本次任务实际修改的文件，提交前必须看 `git diff --cached --name-status`。
4. 🚨 **严格控制单文件体量**：单个源码文件建议 **150~200 行**，硬性上限 **300 行**。超限必须主动拆分，`pnpm lint` 会拦截。
5. 🚨 **增量修改保护已有页面**：必须局部 Diff 替换，严禁整文件覆写，确保已跑通的布局与交互不被破坏。
6. 🚨 **组件选型铁律**：优先使用 `src/components/ui/` 下的 shadcn 风格组件；严禁直接写原生 `<select>` / 裸 `<button>` 承担主要交互样式。
7. 🚨 **禁止虚假发布状态**：在产物未真正上传、签名公证未验证通过之前，页面上的下载按钮必须保持「即将发布 / 内测中」状态，不得展示可用的下载链接或宣称已正式发布。**状态措辞必须与实际事实一致。**

## 5. 入口文件职责红线

> **入口文件是大堂与组装框架，绝对禁止当成工厂车间。**

- 入口文件指 `src/app/**/page.tsx`、`layout.tsx` 等路由/框架顶层文件。
- 只负责装配、轻量数据注入、路由/元信息接线，不承载大段业务 UI、复杂状态机或领域算法。
- 入口文件建议 **50~100 行**；超过 150 行先评估拆分，超过 300 行视为严重违规。
- 新功能默认落在独立组件或 `src/lib/` 模块里，入口只接线传参。
