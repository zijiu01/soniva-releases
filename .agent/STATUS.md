# .agent/STATUS.md

> ⚠️ 本文件是**覆盖更新**的状态快照，不是日志。禁止追加历史记录，禁止超过 150 行。
> 只回答"现在是什么状态"。历史见 Git log 与 `.agent/opus-logs/`（如有）。

## 本仓库（soniva-releases）状态

| 项 | 状态 |
|---|---|
| 仓库性质 | 公开分发仓库，只放展示层与文档 |
| 五站改版（2026-10-23） | 已接第6/10批及交互精修：官网同源1600px轨道、深浅Token、字阶；2026-10-24最新改为统一背景、两侧双纵线315deg斜纹，交点遮盖已删除、日志底部增强点阵（亮18%/暗22%、180px区），页头页脚补回竖线；导航按钮统一40px，主题/语言及Cookie图标仅留页脚，下载与插件导航始终新标签。开发模式跨站走3001/3002/插件3003，生产域名不变；不是iframe，发布包/自动更新/流水线不变。静态语言水合、浏览器/GA4实测仍待；全局记录见官网 .agent/sites-revamp-progress.md |
| 网站 | ✅ 下载在上、日志在下：发布源驱动的版本/日期/芯片安装包，诚实的芯片检测和手动选择，非Mac转浏览器；三步安装、安装/版本/开发详情同轨栅格；更新日历使用桌面纸墨色阶，年份按钮补左右内边距，方块用Base UI日期气泡与紧凑间距防溢出；侧栏限制可视高度并可滚动；安装/排障文档列表同轨；Windows明确筹备中无安装包；搜索/年热图/全部日志功能保留并拓宽。页脚单条上分割线，不接宣传视频。平台图标改用主站同版Remix Icon 4.9.0的RiAppleFill/RiWindowsFill，SVG/ICO同源官网，标签标题统一下载中心·Soniva。类型/15项测试/体量/HTTP验证通过；未运行build或部署；本地3002按用户要求保持预览，1920/手机/深浅实际界面待浏览器复核 |
| 匿名统计（2026-10-02） | ✅ ①下载点击 → `sendBeacon` POST web 生产 `/api/downloads/track`（契约在 web 仓库该路由顶部），落 web 库 `download_events` 表（9-23 已建，站点不直连 PostgREST——那张表只收服务端写入）；②GA4（复用主站 G-MY14R4KCP5，`NEXT_PUBLIC_GA_MEASUREMENT_ID` 可覆盖）+ Cookie 同意条（同意后才加载 gtag，localStorage 存 `soniva_cookie_consent`）；③桌面端更新器事件 → `desktop_update_events`，建表已进 web 迁移链（`20261002000000`）。⚠️ 两通道上线前置：**生产 db push（本地链欠 6+1 个迁移）+ web 重新部署（生产停在 9-19，track 路由未上线）** |
| Release 资产 | 页面当前读取公开发布记录中的 **v0.1.22**（2026-10-11，双架构）；本轮不修改安装包、发布元数据或流水线，不把记录中的签名/公证结果当成本轮重新安装验证 |
| 页面数据 | `public/releases/*.md`（v0.1.2~v0.1.4 released，后续版本由自动发版脚本生成）+ `public/devlog/*.md` **真实开发日志 36 篇**（总览 1 + 按天日志，`scripts/gen-devlog.py` 随自动发版增量重生成）+ 桌面端原文档；卡片示意图已停用 |
| 下载入口 | 首页与版本详情共用DownloadLink保留匿名计数及同意后GA4；从发布元数据生成GitHub Releases资产地址，不硬编码最新版本。Mac选择arm64/x64；不确定时明确默认Apple、不误判MacIntel；未手工触发真实下载统计 |
| 自动发版 | ✅ `scripts/publish-release.sh` 一条命令（门禁：版本/产物/sha512/公证实测 → Release+页面+日志+push+ntfy/邮件通知）；2026-09-25 起基座封装 `pnpm dist:mac:ship`＝打包+自动发版一条命令，不依赖 AI 会话/常驻进程；部署=push 触发 GitHub Pages + Vercel Git 双通道；ntfy 频道在 `.env.local` 的 `NTFY_TOPIC` |
| 自动更新 | ⬜ latest-mac.yml 随 Release 上传，端到端链路未实测；2026-10-02 起桌面端更新器四态事件匿名写 `desktop_update_events`（见上游仓库 update-telemetry.ts，同一张建表 SQL） |
| 部署 | ✅ GitHub Pages 已启用（build_type=workflow）并部署成功：https://zijiu01.github.io/soniva-releases/ ；曾因 workflow 的 pnpm version 输入与 packageManager 字段冲突失败，已修复 |

## 上游桌面端（Soniva Desktop）状态

| 项 | 状态 |
|---|---|
| 版本 | `0.1.4`（`desktop/package.json`，2026-09-25 回填落库并发布；0.1.4 打包时的工作区提版曾被还原，已修复为随功能批次提交） |
| 签名 | ✅ Developer ID 签名通过（Team `KFU26MTY8J`） |
| 公证 | ✅ 双架构 DMG 挂载实测 `spctl accepted`（Notarized Developer ID） |
| 发布源配置 | ✅ `electron-builder.yml` publish 已指向 `zijiu01/soniva-releases` |
| Windows | ⛔ 未开始 |
| 注意 | 基座 `.env` 的 GH_TOKEN 已失效（API 401）；发版上传可改用本机钥匙串 git 凭据（repo scope 有效） |

## 下一步（阻塞项）

1. **生产库 db push**：本地迁移链欠 6+1 个（20260921→20261002000000），待用户点头在 web/ 执行 `supabase db push`（含下载统计两表、插件表补录、桌面更新事件表）。
2. **web 重新部署生产**：生产 Vercel 停在 9-19，`/api/downloads/track` 与 GitHub 快照 cron 均未上线——部署后下载计数通道才通。
3. 自动更新端到端实测：装 0.1.2 → 发 0.1.4 → 观察旧版是否弹更新（0.1.2 无应用内更新交互界面，本跳只能手动下载安装 0.1.4，实测从 0.1.4 起观察后续版本）。
4. Windows 打包（批次 8）。
