# Soniva Releases

Soniva 桌面端的**公开发布仓库**。这里做两件事：

1. 通过 **GitHub Releases** 存放打包好的桌面端安装包（DMG），供用户下载；
2. 通过 **GitHub Pages** 部署一个官网风格的「发布版本记录」页面。

> ⚠️ 源码不在这里。Soniva 源码位于独立的私有仓库，本仓库只收产物与展示层。
> **安装包等大文件一律走 Releases 资产，绝不提交进 Git**（GitHub 单文件上限 100MB）。

## 当前状态

| 项 | 状态 |
|---|---|
| 桌面端版本 | `0.1.0` |
| 阶段 | 🟡 首次打包验证中（签名 / 公证 / 安装包校验） |
| 公开下载 | ⛔ 未开放，页面显示「即将发布」 |
| Release 资产 | ⬜ 尚未上传 |

状态快照见 [`.agent/STATUS.md`](.agent/STATUS.md)，以事实为准，不虚报发布状态。

## 技术栈

- Next.js（App Router）+ React 19 + Tailwind CSS 4
- `@base-ui/react` + shadcn 风格组件 + `motion`（动画图标，与 Web 营销站 `soniva-website` 一致）
- `react-markdown` + `remark-gfm` 渲染内容，`gray-matter` 解析 frontmatter
- 静态导出（`output: "export"`）后部署到 GitHub Pages

## 内容模型（不写死）

页面的发布记录与文档**全部由 Markdown 驱动**，卡片信息从 md 中摘录，不在 TS 里硬编码：

- `public/releases/<version>.md`（英文版 `<version>.en.md`）：frontmatter 存版本号、日期、
  渠道（`released` / `testing` / `upcoming`）与下载资产；正文写更新说明。
  卡片标题取正文 `# ` 标题，摘要取首个 `##` 之前的首段。
- `public/docs/<slug>.md`（英文版 `<slug>.en.md`）：安装 / 首启 / 排障 / 更新等文档，
  可选 `order` frontmatter 控制排序。
- `public/devlog/<slug>.md`：开发日志文档，**照录桌面端仓库的原始 md**（frontmatter 存
  `date` / `tag` / `source`，正文不改写），按日期倒序展示。

构建期由 `src/lib/content/releases.ts`、`src/lib/content/docs.ts`、
`src/lib/content/devlog.ts` 读取并生成清单；
`/releases/<version>`、`/docs/<slug>`、`/devlog/<slug>` 通过 `generateStaticParams`
静态生成。新增版本、文档或日志只需新增 md 文件，无需改任何组件。

## 路由

| 路径 | 说明 |
|---|---|
| `/` | DevLog 首页：Hero + 快速定位年历/最新发布包 ｜ 月度分组时间线（发布+文档）｜ 详情面板 |
| `/releases/<version>` | 单版本详情：下载资产 + 更新说明 |
| `/devlog/<slug>` | 单篇开发日志 |
| `/docs` | 安装与排障文档列表 |
| `/docs/<slug>` | 单篇文档 |

## 目录结构

```
public/releases/   每个版本一个 md（frontmatter + 更新说明正文）
public/docs/       安装 / 排障等文档 md
public/devlog/     开发日志手记 md（date / tag frontmatter）
src/app/           页面与路由（入口只做装配）
src/components/    UI 组件（ui/ 基础组件，markdown/ 渲染器）
src/hooks/         主题、语言等浏览器状态
src/lib/           站点配置、i18n、内容读取与纯函数
scripts/           单文件行数检查等
.agent/            Agent 协作文档与状态快照
```

## 本地开发

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm verify       # typecheck + 单文件 300 行检查
pnpm build        # 静态导出到 out/
```

环境变量见 [`.env.example`](.env.example)：

- `NEXT_PUBLIC_GITHUB_REPO`：形如 `owner/repo`，配置后页面显示 GitHub 外链与 Release 下载地址。
- `NEXT_PUBLIC_BASE_PATH`：GitHub Pages 项目站点子路径（如 `/soniva-releases`），自定义域名留空。

## 部署到 GitHub Pages

仓库已内置 [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml)：

1. 在仓库 **Settings → Pages** 把 Source 设为 **GitHub Actions**；
2. 推送到 `main` 后自动构建并部署；
3. 项目站点默认 basePath 为 `/<repo>`；使用自定义域名时，在仓库变量里设置 `NEXT_PUBLIC_BASE_PATH` 覆盖。

## 发版流程

完整流程见 [`.agent/release-process.md`](.agent/release-process.md)。核心顺序：

1. 在 Mac 上于源码仓库完成签名、公证、DMG 打包与自检；
2. 创建 `v<version>` Release，上传两个架构的 DMG 与 `latest-mac.yml`；
3. 新增/更新 `public/releases/<version>.md`，把 `channel` 从 `testing` 改为 `released`；
4. `pnpm verify && pnpm build`，推送触发 Pages 部署。

## 安全声明

- 本仓库公开，**禁止提交任何密钥、证书、`.env` 真实值**。
- 产物未完成公证前不得开放下载；页面措辞必须与实际状态一致。
- 发现问题请通过 Issue 反馈，不要从第三方渠道下载安装包。

## Agent 协作文档

- [`AGENTS.md`](AGENTS.md)：全局协作指南与绝对红线
- [`.agent/workflow.md`](.agent/workflow.md)：Git 提交、公开仓库安全、大文件规范
- [`.agent/code-style.md`](.agent/code-style.md)：单文件 300 行红线、Next.js 约定
- [`.agent/design-system.md`](.agent/design-system.md)：设计系统与组件选型
- [`.agent/release-process.md`](.agent/release-process.md)：发版流程
- [`.agent/STATUS.md`](.agent/STATUS.md)：当前状态快照
