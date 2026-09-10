---
date: "2026-09-10"
tag: "发布指南"
source: "desktop/Docs/RELEASE_GUIDE.md"
---

# Soniva 桌面端发布指南（批次7：签名 + 公证 + 官网直发 + 自动更新）

> ⚠️ **这份文档描述的每一步，除了"读文档本身"，全部只能在 Mac 上完成。**
> 这次改动的沙盒环境是 Linux，没有 Apple 的证书体系、没有 `codesign`/
> `xcrun notarytool`/`iconutil`，代码和配置已经在仓库里改好了，但**没有跑过、
> 没有验证过**。照着下面的步骤在你自己的 Mac 上走一遍，才算真正打包发布成功。

## 这次范围

- ✅ 分发渠道：官网直接下载 DMG（Developer ID 签名 + Apple 公证），不上架
  Mac App Store。
- ✅ 自动更新：electron-updater，更新源是 GitHub Releases。
- ❌ Windows 打包（批次8）：不在这次范围内，独立处理。
- ❌ CI/CD 自动化构建：这次先手动在 Mac 上跑通，稳定之后再考虑要不要上
  GitHub Actions。

## 1. Apple Developer 后台要准备的东西

登录 [developer.apple.com](https://developer.apple.com)（用你已有的 Apple
开发者账号）：

1. **Developer ID Application 证书**（不是 "Mac App Store" 证书，也不是
   "Developer ID Installer"——那是给 .pkg 安装包用的，我们只发 DMG）。
   路径：Certificates, Identifiers & Profiles → Certificates → 点右上角 "+"
   → 选 "Developer ID Application" → 按提示用 Keychain Access 生成一个
   证书签名请求（CSR）文件上传 → 下载生成好的证书，双击导入本地 Keychain。
2. **Team ID**：Membership 页面（左侧菜单，账号名下面）能看到，一串 10 位
   字母数字。
3. **App 专用密码**：去 [appleid.apple.com](https://appleid.apple.com) →
   登录 → "登录与安全" → "App 专用密码" → 生成一个，标注用途写
   "Soniva 公证"方便以后认出来。**这个密码只显示一次，生成后立刻复制保存**，
   不是你平时登录用的 Apple ID 密码。

## 2. 导出证书为 .p12

打开 Mac 自带的"钥匙串访问"（Keychain Access）：

1. 左侧选 "登录" 钥匙串 → "我的证书" 分类。
2. 找到刚才导入的 "Developer ID Application: 你的名字/公司 (TEAMID)"。
3. 右键 → 导出 → 存为 `.p12` 格式，设置一个导出密码（记住它，等下要填进
   `CSC_KEY_PASSWORD`）。

## 3. 本地安装依赖

沙盒已经把 `electron-builder`、`@electron/notarize`、`electron-updater` 加进
了 `desktop/package.json`，但这几个包（尤其 electron-builder 会拉取一些
macOS 专用的原生工具）必须在 Mac 上重新装一遍：

```bash
cd desktop
corepack pnpm install
```

## 4. 图标：把占位方块换成正式 .icns

仓库根目录 `macOS图标/` 文件夹里已经有一整套按 macOS 标准尺寸切好的图
（16~512，@1x/@2x）。沙盒生成不了 `.icns`（依赖 macOS 自带的 `iconutil`），
在 Mac 上跑：

```bash
cd desktop
bash scripts/build-icns.sh
```

跑完会在 `resources/icons/soniva.icns` 生成文件。然后打开
`electron-builder.yml`，把 `mac.icon` 那一行从占位 PNG 改成：

```yaml
mac:
  icon: resources/icons/soniva.icns
```

（顶层 `fileAssociations` 里 `.sonivapack` 关联图标要不要一起换成正式设计，
你自己决定——不换也不影响签名打包。）

## 5. 填密钥：desktop/.env

复制一份模板（这份文件已经在 `.gitignore` 里，不会被提交）：

```bash
cd desktop
cp .env.example .env
```

打开 `.env`，把下面这些值填进去：

| 变量 | 从哪里拿 |
|---|---|
| `APPLE_ID` | 你的 Apple 开发者账号邮箱 |
| `APPLE_APP_SPECIFIC_PASSWORD` | 第 1 步在 appleid.apple.com 生成的 App 专用密码 |
| `APPLE_TEAM_ID` | 第 1 步 Membership 页面的 Team ID |
| `CSC_LINK` | 第 2 步导出的 `.p12` 文件路径（绝对路径最保险） |
| `CSC_KEY_PASSWORD` | 第 2 步导出时设置的密码 |
| `GH_TOKEN` | 第 7 步要用，先跳过，等发布阶段再回来填 |

这几个变量名（`CSC_LINK`/`CSC_KEY_PASSWORD`）是 electron-builder 自己认的
约定名字，不能改。

跑打包命令前要把这些变量加载进当前终端会话，例如：

```bash
export $(grep -v '^#' .env | xargs)
```

（或者用你习惯的 `direnv`/`dotenv-cli` 之类工具，效果一样，能保证这些变量
在跑 `pnpm run dist:mac` 的那个终端进程里存在就行。）

## 6. 签名/公证配置在哪，各自是干什么的

已经落在仓库里的三个文件，不用改，但建议对照看一遍知道系统在做什么：

- **`electron-builder.yml`**：`mac.hardenedRuntime: true` 打开加固运行时
  （Apple 公证的前提条件）；`mac.entitlements`/`entitlementsInherit` 指向
  下面这个 plist；`afterSign` 指定签名完成后调用 `scripts/notarize.js`。
- **`build/entitlements.mac.plist`**：加固运行时默认会拦掉 Electron/V8 需要
  的 JIT 编译能力，这个文件逐条放行必需的权限（文件里每一条都有注释写了
  为什么需要）。
- **`scripts/notarize.js`**：`afterSign` 钩子，读 `.env` 里的三个 Apple 变量
  调用 `@electron/notarize` 把签好名的 `.app` 提交给 Apple 公证服务。**如果
  这三个变量缺任意一个，会跳过公证并打印警告**，不会报错崩掉——方便你先
  测试签名流程本身，但跳过公证的产物用户双击打不开（Gatekeeper 拦截）。

## 7. 打包

**`dist:mac` 会先自动跑 `scripts/preflight-mac.sh` 前置检查**（python、Apple
密钥、系统代理、Electron 缓存包完整性）。这四项里任何一项不对，都会让你在
等了十几分钟公证之后才在最后一步失败——所以先让脚本红脸，比事后排查便宜得多。
也可以单独跑：`corepack pnpm run preflight:mac`。

### 四条命令，按需要选

| 命令 | 做什么 | 什么时候用 |
|---|---|---|
| `dist:mac` | arm64 + x64 全套，签名+公证+DMG | 正式发版 |
| `dist:mac:arm64` | 只打 Apple Silicon | 只给自己/Apple Silicon 用户；或 x64 那半失败了要重跑 |
| `dist:mac:x64` | 只打 Intel | arm64 已经好了，单独补 Intel |
| `dist:mac:fast` | arm64 + **跳过公证** | 只想验证代码/签名/DMG 流程，不发给别人 |

**为什么要能分开打**：公证是两次独立的网络请求（每个架构一次），
国内网络下经常一个成功一个超时。全套失败时，**已经成功的那一半产物还在
`out/` 里**，不用整体重来，只补失败的那个架构即可。

⚠️ `dist:mac:fast` 产出的 DMG **过不了 Gatekeeper**，别人双击会被拦，
只能自己本机测试用。

公证遇到 `HTTPClientError.connectTimeout` 时，`scripts/notarize.js`
**会自动等 30 秒重试，最多 3 次**（只对网络类错误重试；Apple 判定 Invalid
这种真失败会立刻抛出，不浪费时间）。

```bash
cd desktop
corepack pnpm run dist:mac
```

这条命令会依次：编译代码 → electron-builder 签名 → 提交 Apple 公证
（**公证通常几分钟，网络/Apple 服务器繁忙时可能更久，命令会一直等，不要
以为卡住了就中断它**）→ 生成 DMG，产物在 `desktop/out/` 目录下。

## 8. 验证签名和公证真的生效了

**不要看到命令跑完没报错就当成功。**一条命令跑完三项自检（asar 内容完整性、
代码签名、Gatekeeper 放行）：

```bash
cd desktop
corepack pnpm run verify:mac                              # 默认查 out/mac-arm64
bash scripts/verify-mac-build.sh out/mac/Soniva.app       # x64 那份
```

🚨 **它为什么要查 asar 里的文件**：2026-09-10 首次打包出来的 App 双击是
**白屏**——`electron-builder.yml` 的 `files` 漏了 `dist-renderer/`（vite 的
渲染进程产物），主进程 `loadFile("../../dist-renderer/index.html")` 加载了一个
asar 里根本不存在的文件。**这个错误在开发环境 100% 复现不出来**，因为
`pnpm dev` 时那些文件就明晃晃躺在磁盘上。以后往主进程里加任何
`path.join(__dirname, "../../xxx")` 形式的运行时资源，都必须同步进 `files`，
并且用这个脚本验一遍。

下面两条是自检脚本内部用的原始命令，需要看详细输出时手动跑：

```bash
# 验证代码签名（应该输出 "Soniva.app: valid on disk" / "satisfies its Designated Requirement"）
codesign --verify --deep --strict --verbose=2 out/mac-arm64/Soniva.app

# 验证公证票据是否已经"钉"在 App 上（Gatekeeper 真正检查的是这个）
spctl --assess --type execute --verbose out/mac-arm64/Soniva.app
```

`spctl` 那条如果输出包含 `accepted`，说明一个从没装过 Soniva 的用户双击 DMG
里的 App 能正常打开，不会弹"来自身份不明的开发者"。如果输出 `rejected`，
回头检查 `.env` 里三个 Apple 变量、或者用
`xcrun notarytool history --apple-id "$APPLE_ID" --password "$APPLE_APP_SPECIFIC_PASSWORD" --team-id "$APPLE_TEAM_ID"`
查最近一次公证请求的失败原因。

## 9. 发布到 GitHub Releases（自动更新的数据源）

`electron-builder.yml` 里 `publish.owner`/`publish.repo` 现在是占位值
（`soniva-team-placeholder`/`soniva-desktop-releases-placeholder`），**首次
发布前必须改成你实际要用来存放 Release 的 GitHub 仓库**（可以是当前这个
仓库，也可以专门建一个只放桌面端发布产物的仓库——后者更常见，因为源码仓库
未必想公开，但 electron-updater 需要能访问到 Release 资产）。

改好之后，`.env` 里补上 `GH_TOKEN`（GitHub → Settings → Developer settings
→ Personal access tokens，勾 `repo` 权限），然后：

```bash
corepack pnpm run dist:mac:publish
```

这会把 DMG 和自动更新要用的 `latest-mac.yml` 一起上传到 GitHub Releases。

## 10. 验证自动更新真的能用

自动更新的代码（`desktop/src/main/auto-updater.ts` + 渲染进程弹出的
"发现新版本"提示）在沙盒里完全没跑过真实流量——`app.isPackaged` 为
false（`pnpm dev`）时这段代码直接跳过不执行，必须打包验证：

1. 按上面步骤打包发布一个版本（比如 `0.1.0`）安装到一台 Mac 上。
2. 把 `desktop/package.json` 的 `version` 改成更高的号（比如 `0.1.1`），
   重新走一遍 6~9 步发布。
3. 回到装着 `0.1.0` 的那台 Mac，正常打开 Soniva，等一小会儿——如果自动
   更新生效，界面右下角会弹出一个提示"新版本 0.1.1 已下载完成"，带一个
   "立即重启更新"按钮。点了之后应用会退出并自动装上新版本。
4. 如果不点按钮，正常退出应用（不是强制关闭进程）也会自动装上新版本
   （`autoInstallOnAppQuit`）。

## 11. 已知踩坑点，打包后务必确认

- **双 HTML 入口**：渲染进程现在有 `index.html` 和 `thumbnail-worker.html`
  两个入口，`electron-builder.yml` 的 `files` 字段打的是整个 `dist/**/*`，
  理论上两个都会被带上，但**第一次打包后一定要实测缩略图生成功能**
  （拖一批图片/视频进资源库，看缩略图是否正常出来），确认 worker 那个
  HTML 真的被正确加载了。
- **`.sonivapack` 文件关联**：打包安装后，找一个 `.sonivapack` 分享包文件
  双击，确认系统真的把它跟 Soniva 关联上并弹出导入。`pnpm dev` 跑的开发版
  不会注册这个关联，只有正式安装包才会。
- **`.sonivalib` 本地资源库路径**：确认打包后的 App（`app.asar` 归档结构）
  仍然能正常创建/打开本地资源库、读写 SQLite 数据库文件——这条代码逻辑
  没变，但"路径解析在打包环境下是否还成立"只能实测，不能只看源码判断。

## 12. 排障速查表（首次打包踩过的坑，全部真实发生过）

> 完整的排查过程、每一次误判和打脸依据，见
> `.agent/opus-logs/20260910-051600-桌面端首次打包发布-Mac实战排障全记录.md`。
> 这里只留"症状 → 先查什么"。

### 三个反直觉的前提，先记住

1. **"终端没有新输出" ≠ "卡住了"，"打印了 downloaded" ≠ "文件是好的"。**
   判断死活看 `ps aux` 里那个进程的 **TIME 列涨不涨**，不要看终端。
2. **报错的那一步，往往不是出问题的那一步。**（`hdiutil` 连错 6 次，
   真凶是它上游的 python。）
3. **同一家服务的两个接口，连通性可以完全不同。**
   （`notarytool` 提交 vs `stapler` 钉票据；`github.com` vs
   `objects.githubusercontent.com`。）

### 症状对照表

| 症状 | 先查什么 |
|---|---|
| 终端长时间无输出 | `ps aux \| grep -E 'app-builder\|codesign\|notarytool\|stapler\|electron-builder' \| grep -v grep`，看 TIME 列 |
| 卡在 `packaging arch=xxx`，无报错 | Electron 缓存 zip 被截断了（见下） |
| 公证超时 `HTTPClientError.connectTimeout` | `scutil --proxy`，`HTTPSEnable` 必须是 1 |
| 想知道 Apple 那边到底什么状态 | `xcrun notarytool history --apple-id "$APPLE_ID" --password "$APPLE_APP_SPECIFIC_PASSWORD" --team-id "$APPLE_TEAM_ID"` |
| `unable to execute hdiutil`（连续多次） | 看它**上一条**报错；手动去掉 `-quiet` 重跑拿真实错误 |
| `Command failed: which python` | macOS 26 已移除系统 Python，见下面「python」 |
| DMG 少一个 / 命名不对 | 别用 `--prepackaged`，跑完整 `dist:mac` |

### 坑 1：`xcrun notarytool` 只认系统代理

`xcrun notarytool` / `xcrun stapler` 是 Apple 系统工具，走
**macOS 系统代理**；而 `app-builder`（下载 Electron 的 Go 二进制）只认
`https_proxy` / `http_proxy` **环境变量**。两者互不相通。

国内网络必须在代理客户端里开**「系统代理 / System Proxy」模式**，
光在终端 `export https_proxy=...` 对公证完全无效。验证：

```bash
scutil --proxy     # HTTPEnable / HTTPSEnable 都要是 1
```

### 坑 2：被中断的下载 = 静默挂死

`Ctrl+C` / `kill` 打断下载会在缓存里留下**截断的 zip**，
`app-builder` 的 `unpack-electron` 遇到它**不报错，直接永远挂住**。
这是首次打包"卡了好几个小时"的真凶。

```bash
# 尺寸：arm64 应 122MB、x64 应 124MB
find ~/Library/Caches/electron -name "*.zip" -exec ls -lh {} \;

# 完整性（最准）
find ~/Library/Caches/electron -name "*.zip" | while read z; do
  echo "=== $z"
  unzip -t "$z" >/dev/null 2>&1 && echo "完整 ✅" || echo "损坏 ❌"
done
```

❌ 的删掉重跑即可。**不要整个 `rm -rf ~/Library/Caches/electron`**——
那会把好的那份也删掉，逼你重新下 120MB。

下载慢/一路 `retrying` 时，可以换国内镜像：

```bash
export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
export ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/"
```

手动放包时，缓存目录结构是
`~/Library/Caches/electron/<下载URL的sha256>/<原文件名>`，
子目录名不能自己起：

```bash
url="https://github.com/electron/electron/releases/download/v43.4.1/electron-v43.4.1-darwin-arm64.zip"
dir="$HOME/Library/Caches/electron/$(echo -n "$url" | shasum -a 256 | cut -d' ' -f1)"
mkdir -p "$dir" && cp <下好的文件> "$dir/"
```

### 坑 3：python（DMG 生成必需）

DMG 的窗口布局由 `dmg-builder` 调 python 完成，python 一炸，
**临时目录会被清掉**，随后所有 `hdiutil create` 都在往不存在的目录写，
于是报一串跟 hdiutil 无关的 `unable to execute hdiutil`。

三个连环坑：

- **macOS 26 已彻底移除系统 Python**——`which python` 空不是你没装。
- **Homebrew python@3.14 是坏的**：`pyexpat` 链到了旧版
  `/usr/lib/libexpat.1.dylib`，`import plistlib` 直接 `Symbol not found`。
- **软链接到 `/usr/bin/python3` 无效**：那是 Apple 的 xcrun 转发器，
  **按 argv[0] 找工具**；软链改名叫 `python`，它就去找一个叫 `python`
  的工具，报 `xcode-select: Failed to locate 'python'`。

先找出机器上哪个 python 真能用：

```bash
for p in /usr/bin/python3 /opt/homebrew/bin/python3 \
         /opt/homebrew/opt/python@3.12/bin/python3.12 \
         /Applications/Xcode.app/Contents/Developer/usr/bin/python3; do
  [ -x "$p" ] && printf "%-60s -> " "$p" && ("$p" -c "import plistlib;print('OK')" 2>&1 | tail -1)
done
```

然后用**包装脚本**（不是软链接）：

```bash
printf '#!/bin/sh\nexec /usr/bin/python3 "$@"\n' > ~/bin/python
chmod +x ~/bin/python
export PATH="$HOME/bin:$PATH"
python -c "import plistlib; print('shim OK')"
```

### 坑 4：`--prepackaged` 的命名陷阱

`.app` 已经签名公证完、只想补打 DMG 时，`--prepackaged` 能跳过重新公证：

```bash
npx electron-builder --mac dmg --prepackaged out/mac-arm64/Soniva.app
```

但它**不会从 app 路径推断架构**，`${arch}` 占位符解析错误——两个架构
连着跑会输出到同一个文件名，后一个静默覆盖前一个。要么显式传
`--config.dmg.artifactName`，要么跑完整的 `dist:mac`（顺带还能生成
自动更新要用的 `latest-mac.yml`）。

### 坑 6：`hdiutil detach ... Exit code: 16`（资源忙）

dmg-builder 会把 DMG **挂载起来**写窗口布局，写完再 `detach`。卸载不掉就报：

```
⨯ unable to execute hdiutil args=["detach","-quiet","/Volumes/Soniva 0.1.0-arm64"]
  Exit code: 16
```

`16` = 资源忙。最常见是 **Finder 自动打开了那个卷的窗口**，其次是 Spotlight
正在索引它，或者上一次构建失败留下了没卸载的卷。

```bash
# 看现在挂着哪些 Soniva 卷
hdiutil info | grep /Volumes/Soniva

# 强制卸载
hdiutil detach -force "/Volumes/Soniva 0.1.0-arm64"

# 还是不行就看谁占着它
lsof +D "/Volumes/Soniva 0.1.0-arm64" 2>/dev/null | head
```

**打包时不要在 Finder 里点开弹出来的那个 Soniva 卷**——一点开就占住了。

`scripts/preflight-mac.sh` 每次会自动清理残留的 Soniva DMG 卷（只处理
`hdiutil info` 认得的磁盘映像，不会碰真实硬盘分区），所以这个坑一般不会
在**开跑时**复发；但构建**过程中**被 Finder 占住仍然会中招。

### 坑 5：脚本必须兼容 bash 3.2

macOS 自带 `/bin/bash` 是 **3.2**（Apple 因 GPLv3 不升级），
**不支持 `declare -A` 关联数组**——写了会被当成算术下标解析，
报 `invalid arithmetic operator`。替代写法见 `scripts/build-icns.sh`：
多行字符串 + `while IFS='|' read -r k v; ... done <<< "${MAP}"`。

另外：`$VAR` 后面紧跟**全角标点**（中文逗号等）时，bash 可能把多字节
UTF-8 的首字节当成标识符的一部分，报莫名其妙的 `unbound variable`。
**一律写 `${VAR}`。**

## 参考：需要在 Mac 上手动完成的操作清单（一次性汇总）

- [ ] Apple Developer 后台创建 Developer ID Application 证书
- [ ] 生成 App 专用密码、记下 Team ID
- [ ] Keychain Access 导出证书为 `.p12`
- [ ] `desktop/.env` 填好全部真实密钥（不要提交进 git）
- [ ] 跑 `scripts/build-icns.sh` 生成正式 `.icns`，改 `electron-builder.yml`
- [ ] `electron-builder.yml` 的 `publish.owner`/`publish.repo` 改成真实仓库
- [ ] `pnpm run preflight:mac` 前置检查全绿（python / 密钥 / 系统代理 / 缓存包）
- [ ] `pnpm run dist:mac` 跑通
- [ ] `pnpm run verify:mac` 自检全绿（asar 内容 / 签名 / Gatekeeper）
- [ ] `pnpm run dist:mac:publish` 发布到 GitHub Releases
- [ ] 打两个版本号，实测自动更新端到端流程
- [ ] 实测缩略图、`.sonivapack` 双击关联、本地资源库读写
