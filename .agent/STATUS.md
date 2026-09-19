# .agent/STATUS.md

> ⚠️ 本文件是**覆盖更新**的状态快照，不是日志。禁止追加历史记录，禁止超过 150 行。
> 只回答"现在是什么状态"。历史见 Git log 与 `.agent/opus-logs/`（如有）。

## 本仓库（soniva-releases）状态

| 项 | 状态 |
|---|---|
| 仓库性质 | 公开分发仓库，只放展示层与文档 |
| 网站 | ✅ DevLog 两栏（shadcn 中性风）：Hero + 快速定位频率图（每天一颗方块、按年折叠、月份倒序）/搜索/最新发布包 ｜ 月度分组卡片流；卡片点击新标签打开详情页；新增本地 /terms 使用条款页（照录官网 legal markdown）；文档照录桌面端仓库原始 md（展示层滤 emoji）；导航/页脚保持不动 |
| Release 资产 | ✅ **v0.1.2 已发布**（2026-09-20）：`Soniva-0.1.2-arm64.dmg`（172MB）+ `Soniva-0.1.2.dmg`（Intel，176MB）+ `latest-mac.yml`，公证/Gatekeeper 均通过 |
| 页面数据 | `public/releases/0.1.2.md`（channel: released，首发即 0.1.2——0.1.0/0.1.1 从未公开发布，条目已删）+ `public/devlog/*.md`（3 份桌面端原文档）；另有 `src/lib/content/mock-entries.ts` 演示占位数据（复用真实文档内容只铺日期），真实日志就位后删除该文件并摘除 timeline.ts 的调用 |
| 下载入口 | ✅ 已放开，指向 `github.com/zijiu01/soniva-releases/releases/download/v0.1.2/` 真实资产 |
| 自动更新 | ⬜ latest-mac.yml 已随 Release 上传，但端到端链路未实测 |

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

1. 验证 GitHub Pages 部署：push main 后 Actions 自动构建（`deploy-pages.yml`），确认线上页面与下载链接可达。
2. 自动更新端到端实测：装 0.1.2 → 发 0.1.3 → 观察旧版是否弹更新。
3. 真实 DevLog 日志就位后删除 `mock-entries.ts` 演示数据。
4. Windows 打包（批次 8）。
