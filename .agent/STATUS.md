# .agent/STATUS.md

> ⚠️ 本文件是**覆盖更新**的状态快照，不是日志。禁止追加历史记录，禁止超过 150 行。
> 只回答"现在是什么状态"。历史见 Git log 与 `.agent/opus-logs/`（如有）。

## 本仓库（soniva-releases）状态

| 项 | 状态 |
|---|---|
| 仓库性质 | 公开分发仓库，只放展示层与文档 |
| 网站 | ✅ DevLog 两栏（shadcn 中性风）：Hero + 快速定位频率图（每天一颗方块、按年折叠、月份倒序）/搜索/最新发布包 ｜ 月度分组卡片流（**卡片示意图已停用**，回退图标块）；卡片点击新标签打开详情页；新增本地 /terms 使用条款页（照录官网 legal markdown）；文档照录桌面端仓库原始 md（展示层滤 emoji）；导航/页脚保持不动 |
| Release 资产 | ✅ **v0.1.2 已发布**（2026-09-20）：`Soniva-0.1.2-arm64.dmg`（172MB）+ `Soniva-0.1.2.dmg`（Intel，176MB）+ `latest-mac.yml`，公证/Gatekeeper 均通过 |
| 页面数据 | `public/releases/*.md`（v0.1.2 released + 后续版本由自动发版脚本生成）+ `public/devlog/*.md` **真实开发日志 31 篇**：总览《从 0 到 v0.1.2》1 篇 + 按天日志 30 篇（2026-08-24→09-24，desktop git log 按作者日逐日落档，1300 上下提交，`scripts/gen-devlog.py` 随自动发版增量重生成）+ 桌面端原文档 3 份；`mock-entries.ts` 已删除；卡片示意图已停用 |
| 下载入口 | ✅ 已放开，指向 `github.com/zijiu01/soniva-releases/releases/download/v0.1.2/` 真实资产 |
| 自动发版 | ✅ `scripts/publish-release.sh`（门禁：版本/产物/sha512/公证实测 → Release+页面+日志+push+ntfy 通知）+ ZCode 每 30 分钟巡检；ntfy 频道在 `.env.local` 的 `NTFY_TOPIC` |
| 自动更新 | ⬜ latest-mac.yml 已随 Release 上传，但端到端链路未实测 |
| 部署 | ✅ GitHub Pages 已启用（build_type=workflow）并部署成功：https://zijiu01.github.io/soniva-releases/ ；曾因 workflow 的 pnpm version 输入与 packageManager 字段冲突失败，已修复 |

## 上游桌面端（Soniva Desktop）状态

| 项 | 状态 |
|---|---|
| 版本 | `0.1.2`（`desktop/package.json`），已作为首个公开版本发布 |
| 签名 | ✅ Developer ID 签名通过（Team `KFU26MTY8J`） |
| 公证 | ✅ 双架构 DMG 挂载实测 `spctl accepted`（Notarized Developer ID） |
| 发布源配置 | ✅ `electron-builder.yml` publish 已指向 `zijiu01/soniva-releases` |
| Windows | ⛔ 未开始 |
| 注意 | 基座 `.env` 的 GH_TOKEN 已失效（API 401）；发版上传可改用本机钥匙串 git 凭据（repo scope 有效） |

## 下一步（阻塞项）

1. 自动更新端到端实测：装 0.1.2 → 发 0.1.3 → 观察旧版是否弹更新（0.1.3 已打包）。
2. Windows 打包（批次 8）。
