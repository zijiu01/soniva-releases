# 工作流、Git 提交与公开仓库安全规范 (.agent/workflow.md)

## 1. 公开仓库安全铁律

- 🚨 **密钥零入库**：任何密钥、Token、证书、Apple 专用密码、Supabase Key、`.env` 真实值一律不得进入 Git。本仓库是公开的，一旦提交即视为泄露，且永久留在历史里。
- 🚨 **只提交展示层与文档**：本仓库只允许出现网站源码、Agent 文档、发布记录数据、图标等轻量文本/静态资源。任何安装包、压缩包、可执行文件都不属于这里。
- 环境变量模板只写 `.env.example`，值一律留空或写占位符。

## 2. 大文件与 Release 资产红线

- 🚨 **GitHub 单文件 100MB 硬限制**：DMG 约 151MB，**物理上无法 push**。绝对禁止 `git add` 任何 DMG / zip / exe / pkg / `.app` / `.sonivalib`。
- ✅ **产物一律走 GitHub Releases 资产**：Release 资产单文件上限 2GB，且不进入 Git 历史，是唯一正确的分发通道。
- 上传方式二选一（详见 `.agent/release-process.md`）：
  - `gh release upload <tag> <file> --clobber`（推荐，跨平台）
  - `electron-builder --publish always`（由源码仓库的 `dist:mac:publish` 触发）
- 仓库根 `.gitignore` 已排除 `out/`、`dist/`、`*.dmg`、`*.zip` 等，**不要为了"方便"用 `-f` 强加**。

## 3. Git 提交规范（精准、可追溯、不越权）

- **禁止全量暂存**：严禁 `git add .`、`git add -A`、`git commit -a`。
- **禁用危险重置**：严禁擅自 `git restore`、`git reset --hard`、`git checkout .`、`git clean -f`。
- **精准显式暂存**：提交时显式列出本次任务实际修改的文件路径。
- **提交前安全检查**：
  1. 暂存前：`git status --short`（确认改动范围）
  2. 暂存后：`git diff --cached --name-status`（确认仅暂存了本次任务的文件）
  3. 提交前顺手确认没有大文件混入：`git diff --cached --numstat`（二进制会显示 `-`）
- **提交信息语言与格式**：标题与正文**必须使用中文**；标题用约定式前缀（`feat:`, `fix`, `style`, `refactor`, `chore`, `docs`, `build`），正文写清"为什么改"。
- **模型精准署名**：末尾按实际参与的 Agent 品牌与具体型号追加署名，禁止抽象挂名（如 `cline.bot` 或 generic AI）：

```text
Co-Authored-By: Antigravity (Gemini 3.6 Flash) <noreply@deepmind.google.com>
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
Co-Authored-By: OpenAI Codex <noreply@openai.com>
```

## 4. 版本号与标签

- 版本号以桌面端源码仓库 `desktop/package.json` 的 `version` 为**唯一权威**，本仓库不得自行发明版本号。
- Git 标签统一 `v<major>.<minor>.<patch>`（例如 `v0.1.0`），与 GitHub Release 的 tag 一一对应。
- 发布记录数据 `src/lib/releases.ts` 中的版本必须与标签一致；**未真实上传产物的版本，不得写入已发布列表**。

## 5. 分支与远程

- 主分支 `main` 直接对应 GitHub Pages 部署源。
- 未经用户明确许可，禁止 `git push`、禁止创建/删除远程标签、禁止改写历史。
- 部署方式见 `.agent/release-process.md`；本地验证优先 `pnpm typecheck`，最终验证 `pnpm build`。

## 6. 允许自动执行的命令

- `git status` / `git diff` / `git log` / `pnpm typecheck` / `pnpm lint`
- 需要用户明确许可：`pnpm build`、`pnpm dev`（长期占用）、`git push`、任何 `gh release` 上传、`rm -rf`。
