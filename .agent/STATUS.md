# .agent/STATUS.md

> ⚠️ 本文件是**覆盖更新**的状态快照，不是日志。禁止追加历史记录，禁止超过 150 行。
> 只回答"现在是什么状态"。历史见 Git log 与 `.agent/opus-logs/`（如有）。

## 本仓库（soniva-releases）状态

| 项 | 状态 |
|---|---|
| 仓库性质 | 公开分发仓库，只放展示层与文档 |
| 网站 | ✅ DevLog 三栏（shadcn 中性风）：Hero + 快速定位频率图（每天一颗方块、按年折叠、空日定位最近日志）/搜索/最新发布包 ｜ 月度分组卡片流 ｜ Markdown 阅读区（点卡片滚到卡片顶部对齐预览）；主色回中性黑，仅频率图用 chart 蓝梯度；文档照录桌面端仓库原始 md（展示层滤 emoji）；导航/页脚保持不动 |
| 部署 | ⏳ GitHub Pages 尚未绑定；部署配置见 `README.md` |
| Release 资产 | ⬜ **尚未上传任何产物**（0.1.0 仍在打包验证） |
| 页面数据 | `public/releases/*.md`（0.1.0 内测中）+ `public/devlog/*.md`（3 份桌面端原文档）；另有 `src/lib/content/mock-entries.ts` 演示占位数据（2023→2026.8 共 72 条，复用真实文档内容只铺日期），真实日志就位后删除该文件并摘除 timeline.ts 的调用 |
| 下载入口 | ⛔ 全部置灰「即将发布」——产物未上传前禁止放开 |

## 上游桌面端（Soniva Desktop）状态

| 项 | 状态 |
|---|---|
| 版本 | `0.1.0`（`desktop/package.json`） |
| 阶段 | 🟡 **首次打包验证中**（批次 7），未正式发布 |
| 签名 | ✅ Developer ID 签名通过（Team `KFU26MTY8J`） |
| 公证 | ✅ arm64 / x64 双双 `Accepted` |
| 钉票据 | ✅ staple 通过 |
| DMG | 🟡 可生成（151MB）；最终一轮正确命名的双架构 DMG + `latest-mac.yml` 需重跑确认 |
| 自动更新 | ⬜ 端到端未验证（需发两个版本实测） |
| Windows | ⛔ 未开始（批次 8） |
| 发布源配置 | ⏳ `electron-builder.yml` 的 `publish.owner/repo` 需指向本仓库真实路径 |

## 最近一次打包暴露的关键教训

- 打包白屏根因：`electron-builder.yml` 的 `files` 漏了 `dist-renderer/`，**开发环境复现不出来**，靠 `verify:mac` 脚本查 asar 才拦住。
- 打包前置检查已脚本化：`preflight-mac.sh`（python / 系统代理 / Electron 缓存完整性 / 残留 DMG 卷）。
- 完整排障记录在源码仓库 `.agent/opus-logs/20260910-051600-桌面端首次打包发布-Mac实战排障全记录.md`。

## 下一步（阻塞项）

1. 在 Mac 上重跑完整 `dist:mac`，确认两个 DMG 命名正确且 `latest-mac.yml` 生成。
2. `electron-builder.yml` 的 `publish.owner/repo` 改为本仓库真实路径。
3. 创建 `v0.1.0` Release 并上传 DMG + `latest-mac.yml`。
4. 上传完成后：更新 `public/releases/0.1.0.md` 的 `channel` 为 `released`，放开下载入口。
5. 绑定 GitHub Pages，确认线上页面可访问。
