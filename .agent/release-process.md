# 发版流程与产物上传规范 (.agent/release-process.md)

> 本文件回答"一次正式发版要做什么"。当前处于**内测打包阶段**，尚未产生任何公开 Release。

## 1. 职责边界

| 环节 | 在哪做 | 产出 |
|---|---|---|
| 编译 / 签名 / 公证 / 打 DMG | **私有源码仓库** `desktop/`（必须在 Mac 上） | `Soniva-<version>-arm64.dmg`、`Soniva-<version>-x64.dmg`、`latest-mac.yml` |
| 上传产物 | 本仓库对应的 GitHub Releases | Release 资产（不进入 Git） |
| 更新发布记录页 | 本仓库 `src/lib/releases.ts` | 页面展示的版本记录 |
| 部署页面 | GitHub Pages | 线上发布页 |

## 2. 版本号与标签

- 版本号唯一来源：源码仓库 `desktop/package.json` 的 `version`。
- 标签格式 `v<major>.<minor>.<patch>`（如 `v0.1.0`），与 Release 的 tag 一致。
- 同一版本禁止重复打标签；重新上传同名资产用 `--clobber`，不要新建标签。

## 3. 发版步骤（标准流程）

1. **源码侧打包**（在 Mac 上，详见源码仓库 `desktop/docs/RELEASE_GUIDE.md`）：
   ```bash
   corepack pnpm run preflight:mac   # python / 密钥 / 系统代理 / Electron 缓存
   corepack pnpm run dist:mac        # arm64 + x64 签名 + 公证 + DMG
   corepack pnpm run verify:mac      # asar 内容 / 签名 / Gatekeeper 自检
   ```
2. **确认公证与 Gatekeeper 真的通过**：`spctl --assess` 输出必须含 `accepted`。未通过不得发布。
3. **创建 Release 并上传资产**（二选一）：
   ```bash
   # 方式 A：gh（推荐，跨平台）
   gh release create v0.1.0 \
     --repo <owner>/soniva-releases \
     --title "Soniva 0.1.0" \
     --notes-file RELEASE_NOTES_v0.1.0.md \
     out/Soniva-0.1.0-arm64.dmg out/Soniva-0.1.0-x64.dmg out/latest-mac.yml

   # 方式 B：electron-builder 直接发布（源码仓库）
   corepack pnpm run dist:mac:publish   # 需在 electron-builder.yml 填真实 owner/repo
   ```
   ⚠️ `latest-mac.yml` 必须一并上传，否则自动更新失效。
4. **更新页面数据**：编辑 `src/lib/releases.ts`，把该版本从 `upcoming/testing` 改为已发布，补上真实下载地址与更新日志。
5. **验证页面**：`pnpm typecheck && pnpm build`，确认静态导出成功、下载链接可点。
6. **部署**：推送到 `main` 后由 GitHub Pages 自动部署（配置见 README）。

## 4. 发布状态措辞对照（事实驱动）

| 实际状态 | 页面措辞 | 下载按钮 |
|---|---|---|
| 未打包 / 打包失败 | 开发中 | 置灰「即将发布」 |
| 已打包、未公证 / 未上传 | 内测中 | 置灰「内测中」 |
| 已上传 Release，公证通过 | 已发布 | 可用，指向 Release 资产 |
| 有已知问题 | 照实标注 | 可附「已知问题」说明 |

🚨 任何阶段都不得把"未上传"写成"已发布"，不得伪造下载链接。

## 5. 自动更新（electron-updater）注意

- 更新源是 GitHub Releases，依赖 `latest-mac.yml` 与 DMG 同名同目录。
- 源码侧 `electron-builder.yml` 的 `publish.owner` / `publish.repo` 必须指向本仓库实际路径。
- 首次端到端验证方式：发 `0.1.0` → 安装 → 改版本发 `0.1.1` → 观察旧版是否弹出更新提示。

## 6. 回滚

- 产物有问题时：删除或标记对应 Release 为 pre-release，页面数据同步回退状态。
- **不要**通过改写 Git 历史来"撤回"已公开的内容；公开仓库历史不可信撤回。

## 7. 自动化发版（2026-09-24 起，首选方式）

- **一条命令**：基座 `dist:mac` 跑完后执行 `bash scripts/publish-release.sh`
  （`--check` 只校验不发布）。**不依赖任何 AI 会话或常驻进程**，纯本地脚本 +
  GitHub/Vercel 自身机制。
- **推荐入口（2026-09-25 起）**：基座目录直接 `pnpm dist:mac:ship` =
  `dist:mac` 全流程 + 本脚本，打包完自动走门禁→发布→push→通知，不会再出现
  "打包完忘了推第二步"（0.1.4 曾因此滞留本地，且工作区提版被还原、脚本读
  0.1.3 空转；版本号已回填 0.1.4 落库）。路径可用 `SONIVA_RELEASES` 环境变量
  覆盖，默认 `../../Releases/soniva-releases`。
- **部署链**：push main → GitHub Pages 自动部署；Vercel 项目已连 Git，
  push 同样自动触发 Vercel 生产部署（`NEXT_PUBLIC_GITHUB_REPO` 已在 Vercel
  项目环境变量里配置）。
- **门禁**（任一不过即失败退出 + ntfy 通知，绝不带病上线）：
  版本号必须更新 / `out/` 三件齐全 / sha512 与 `latest-mac.yml` 一致 /
  双 DMG 挂载实测 codesign + `spctl accepted` + asar 含渲染层。
- **发布动作**：API 建 Release + 传双 DMG + `latest-mac.yml` → 生成
  `public/releases/<版本>.md`（中英）→ `scripts/gen-devlog.py` 增量重生成开发日志
  → `pnpm verify` + `build` → 精准提交 → push（直连失败自动走本地代理 7897）
  → 通知三通道：邮件（`.env.local` 填 `NOTIFY_EMAIL`，走本机 Mail.app 发信）+ ntfy.sh（频道在 `NTFY_TOPIC`，不入库）+ 本机系统通知。
- 第 3 节的手动流程保留作为兜底；凭据用本机钥匙串 git 凭据（基座 `.env` 的旧
  GH_TOKEN 已失效，仅作历史参考）。
- 终极形态（可选，未做）：desktop 仓库推 tag 触发 GitHub Actions 在云端构建 +
  签名 + 公证 + 发 Release——真"推上去就有"，但私有仓库 macOS runner 计费 10×，
  且需要把证书配成 Secrets，等发版频率上来再评估。
- **通知**：发布成功/失败推三通道——邮件（`NOTIFY_EMAIL`，2026-09-24 用户要求"打包完别再去核对"）+ ntfy + 本机系统通知；另一台电脑在 ntfy 订阅该频道即收。
