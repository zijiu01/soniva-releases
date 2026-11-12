#!/usr/bin/env bash
# 全自动发版：基座重新打包后，一条命令完成 发布→页面→构建→推送→通知。
#
# 用法：bash scripts/publish-release.sh [--check] [--win]
#   --check  只做门禁校验并打印将执行的动作，不改任何东西。
#   --win    只补传 Windows 资产（setup.exe + blockmap + portable.exe + latest.yml）
#            到【已存在】的同版本 Release 并把发布页补上 Windows 下载条目——用于
#            Mac 已发、Windows 后补（2026-11-13 起随发常态化）。跳过 Mac 门禁与
#            版本号门禁（那两个门禁管的是"新版本首发"，补传资产不是新版本）。
#
# 门禁（任一不过即失败退出并通知，绝不带病上线）：
#   1. 基座版本号 > 线上最新 Release（等号=已发布，静默收工；--win 模式跳过）
#   2. out/ 里双架构 DMG + latest-mac.yml 齐全，且 sha512 与 latest-mac.yml 完全一致；
#      out/ 里同时有 Windows 产物时，setup.exe 的 sha512 与 latest.yml 对账（--win 模式
#      只做这一半；portable 不在 latest.yml 里——自动更新只走 NSIS 安装包——仅验存在）
#   3. 双 DMG 挂载实测：签名有效 + spctl accepted（公证票据）+ asar 含渲染层
#      （--win 模式跳过；Windows 包无证书不签名，没有公证可测）
#
# 发布动作：GitHub API 建 Release + 传 Mac 7 资产（双架构 zip+blockmap、双架构 DMG、
#   latest-mac.yml），out/ 里有 Windows 产物时再传 4 资产 → 生成
#   public/releases/<版本>.md（中英，含 Windows 下载条目）
#   → 增量重生成开发日志 → pnpm verify + build → 提交进 SonivaSlots 宿主仓库
#   → git subtree push 前缀回公开仓库（直连失败自动走本地代理）
#   → ntfy.sh 远程通知 + 本机系统通知。
# 凭据：本机钥匙串的 GitHub 凭据（git credential fill），不落盘不打印。
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESKTOP="${SONIVA_MONOREPO:-/Volumes/500GB-BLUE/0-Project/Soniva}/desktop"
GH_REPO="zijiu01/soniva-releases"
SITE_URL="https://zijiu01.github.io/soniva-releases"
PROXY="http://127.0.0.1:7897"
CHECK=0
WIN_ONLY=0
for arg in "$@"; do
  case "$arg" in
    --check) CHECK=1 ;;
    --win)   WIN_ONLY=1 ;;
    *) bad "未知参数：$arg（支持 --check / --win）"; exit 1 ;;
  esac
done

ok()   { echo "✅ $*"; }
bad()  { echo "❌ $*"; }
info() { echo "ℹ️  $*"; }

# ---------- 通知（邮件 + 远程 ntfy + 本机系统通知，均尽力而为不阻塞） ----------
# 邮件（2026-09-24 用户要求"打包完别再去核对，邮件告诉我"）：.env.local 里填
# NOTIFY_EMAIL=你的邮箱 即启用——走本机 Mail.app 已登录的账号发信（osascript
# Apple Events），零新依赖、不需要任何 API 密钥。首次运行 macOS 会弹一次
# "终端想要控制邮件"授权，允许一次即可；Mail 没登录/授权被拒时静默放弃，
# ntfy 与系统通知照发。
send_email() { # send_email <标题> <正文>
  [ -n "${NOTIFY_EMAIL:-}" ] || return 0
  osascript - "$1" "$2" <<'ASEOF' >/dev/null 2>&1 || true
on run argv
  tell application "Mail"
    set msg to make new outgoing message with properties {subject:(item 1 of argv), content:(item 2 of argv) & linefeed & linefeed & "—— Soniva 自动发版流水线（" & (do shell script "date '+%F %T'") & "）", visible:false}
    send msg
  end tell
end run
ASEOF
}
notify() { # notify <标题> <正文>
  [ -f "$REPO_ROOT/.env.local" ] && . "$REPO_ROOT/.env.local"
  if [ -n "${NTFY_TOPIC:-}" ]; then
    curl -s -m 10 -H "Title: $1" -H "Tags: rocket" -d "$2" "https://ntfy.sh/$NTFY_TOPIC" >/dev/null 2>&1 || true
  fi
  osascript -e "display notification \"$2\" with title \"$1\"" >/dev/null 2>&1 || true
  send_email "$1" "$2"
}

die() { # die <退出码> <原因>
  bad "$2"
  notify "Soniva 自动发版失败" "$2"
  exit "$1"
}

# ---------- 网络：API 不可达时切本地代理 ----------
CURL=()
probe() {
  local code
  code=$(curl ${CURL[@]+"${CURL[@]}"} -s -o /dev/null -w '%{http_code}' -m 8 https://api.github.com/ || echo 000)
  if [ "$code" = "000" ]; then
    info "api.github.com 直连失败，切换本地代理 $PROXY"
    CURL=(-x "$PROXY")
  fi
}
gh_token() {
  GIT_TERMINAL_PROMPT=0 git credential fill <<EOF 2>/dev/null | sed -n 's/^password=//p'
protocol=https
host=github.com
EOF
}

# ---------- 1. 版本号对比 ----------
VER=$(grep -m1 '"version"' "$DESKTOP/package.json" | sed 's/[^0-9.]//g')
[ -n "$VER" ] || die 2 "读不到基座版本号（$DESKTOP/package.json）"
probe
TOKEN=$(gh_token)
[ -n "$TOKEN" ] || die 2 "拿不到 GitHub 凭据（钥匙串 git credential）"
LATEST=$(curl ${CURL[@]+"${CURL[@]}"} -s -m 15 -H "Authorization: Bearer $TOKEN" \
  "https://api.github.com/repos/$GH_REPO/releases/latest" | python3 -c "import json,sys;print(json.load(sys.stdin).get('tag_name',''))" 2>/dev/null)
LATEST=${LATEST#v}
info "基座版本 $VER ｜ 线上最新 ${LATEST:-无}"
if [ "$WIN_ONLY" = "1" ]; then
  info "--win 补传模式：跳过版本号门禁（线上最新 ${LATEST:-无}，要求 v$VER 已存在）"
elif [ -n "$LATEST" ] && [ "$VER" != "$(printf '%s\n%s\n' "$LATEST" "$VER" | sort -V | tail -1)" ]; then
  info "线上已是最新（${LATEST} >= ${VER}），无事可做。"
  exit 0
fi

# ---------- 2. 产物与 sha512 ----------
OUT="$DESKTOP/out"
MB_ARM=""; MB_X64=""
if [ "$WIN_ONLY" = "0" ]; then
  DMG_ARM="$OUT/Soniva-$VER-arm64.dmg"
  DMG_X64="$OUT/Soniva-$VER.dmg"
  YML="$OUT/latest-mac.yml"
  for f in "$DMG_ARM" "$DMG_X64" "$YML"; do
    [ -f "$f" ] || die 2 "产物缺失：$f —— 先在基座跑 dist:mac"
  done
  python3 - "$YML" "$OUT" <<'PYEOF' || die 3 "sha512 校验失败：产物与 latest-mac.yml 不一致"
import base64, hashlib, re, sys, os
yml, out = sys.argv[1], sys.argv[2]
text = open(yml).read()
entries = re.findall(r"- url: (\S+)\n\s+sha512: (\S+)\n\s+size: (\d+)", text)
if len(entries) < 2: sys.exit("latest-mac.yml 里解析不出双架构条目")
for name, b64, size in entries:
    p = os.path.join(out, name)
    if not os.path.isfile(p): sys.exit(f"缺文件 {name}")
    data = open(p, "rb").read()
    if len(data) != int(size): sys.exit(f"{name} 大小不符")
    if base64.b64encode(hashlib.sha512(data).digest()).decode() != b64: sys.exit(f"{name} sha512 不符")
    print(f"  sha512 OK  {name}  {len(data)}B")
PYEOF
  ok "产物齐全，sha512 与 latest-mac.yml 一致"
else
  # --win 补传模式：跳过 Mac 的存在性/sha512/公证实测门禁（Mac 已发），但路径仍指向
  # 实际文件——发布页的 Mac 尺寸（MB_ARM/MB_X64）要从它们 stat 出来。
  DMG_ARM="$OUT/Soniva-$VER-arm64.dmg"
  DMG_X64="$OUT/Soniva-$VER.dmg"
  YML="$OUT/latest-mac.yml"
fi

# ---------- 2.5 Windows 产物（2026-11-13 起随发常态化；缺了不挡 Mac 发版，可 --win 后补） ----------
# latest.yml 只列 setup.exe（自动更新只走 NSIS 安装包），所以 sha512 对账覆盖 setup 与
# 它的 blockmap；portable 是手动下载的免安装版，没有清单可对账，只验存在。
WIN_SETUP="$OUT/Soniva-$VER-x64-setup.exe"
WIN_BLOCKMAP="$WIN_SETUP.blockmap"
WIN_PORTABLE="$OUT/Soniva-$VER-x64-portable.exe"
WIN_YML="$OUT/latest.yml"
HAVE_WIN=1
for f in "$WIN_SETUP" "$WIN_BLOCKMAP" "$WIN_PORTABLE" "$WIN_YML"; do
  [ -f "$f" ] || HAVE_WIN=0
done
if [ "$WIN_ONLY" = "1" ] && [ "$HAVE_WIN" = "0" ]; then
  die 2 "--win 要求 Windows 产物齐全（$WIN_SETUP、$WIN_PORTABLE、$WIN_YML）——先在基座跑 pnpm dist:win:same"
fi
if [ "$HAVE_WIN" = "1" ]; then
  python3 - "$WIN_YML" "$OUT" <<'PYEOF' || die 3 "Windows sha512 校验失败：产物与 latest.yml 不一致"
import base64, hashlib, re, sys, os
yml, out = sys.argv[1], sys.argv[2]
text = open(yml).read()
entries = re.findall(r"- url: (\S+)\n\s+sha512: (\S+)\n\s+size: (\d+)", text)
if not entries: sys.exit("latest.yml 里解析不出 setup.exe 条目")
for name, b64, size in entries:
    p = os.path.join(out, name)
    if not os.path.isfile(p): sys.exit(f"缺文件 {name}")
    data = open(p, "rb").read()
    if len(data) != int(size): sys.exit(f"{name} 大小不符")
    if base64.b64encode(hashlib.sha512(data).digest()).decode() != b64: sys.exit(f"{name} sha512 不符")
    print(f"  sha512 OK  {name}  {len(data)}B")
PYEOF
  MB_WIN=$(( $(stat -f %z "$WIN_SETUP") / 1048576 ))
  MB_PORTABLE=$(( $(stat -f %z "$WIN_PORTABLE") / 1048576 ))
  ok "Windows 产物齐全，sha512 与 latest.yml 一致"
else
  MB_WIN=""; MB_PORTABLE=""
  info "out/ 没有 Windows 产物，本次只发 Mac——后补：bash scripts/publish-release.sh --win"
fi

# ---------- 3. 挂载实测公证（--win 跳过：Windows 包无证书不签名，DMG 才有公证可测） ----------
if [ "$WIN_ONLY" = "0" ]; then
  for dmg in "$DMG_ARM" "$DMG_X64"; do
    MNT=$(mktemp -d)/mnt && mkdir -p "$MNT"
    hdiutil attach -readonly -nobrowse -mountpoint "$MNT" "$dmg" >/dev/null || die 3 "挂载失败：$dmg"
    APP="$MNT/Soniva.app"
    if [ ! -d "$APP" ]; then hdiutil detach "$MNT" -quiet; die 3 "$dmg 里没有 Soniva.app"; fi
    codesign --verify --deep --strict "$APP" >/dev/null 2>&1 || { hdiutil detach "$MNT" -quiet; die 3 "签名无效：$dmg"; }
    SPCTL_OUT=$(spctl --assess --type execute --verbose "$APP" 2>&1)
    ASAR_OK=$(npx --yes asar list "$APP/Contents/Resources/app.asar" 2>/dev/null | grep -cx "/dist-renderer/index.html" || true)
    hdiutil detach "$MNT" -quiet
    echo "$SPCTL_OUT" | grep -q accepted || die 3 "Gatekeeper 未放行（公证没过）：$dmg"
    [ "$ASAR_OK" = "1" ] || die 3 "asar 缺 dist-renderer/index.html（会白屏）：$dmg"
    ok "公证/Gatekeeper/asar 实测通过：$(basename "$dmg")"
  done
fi

# ---------- --check 到此为止 ----------
if [ "$CHECK" = "1" ]; then
  if [ "$WIN_ONLY" = "1" ]; then
    info "--check 通过（--win）：将为 v${VER} 补传 4 个 Windows 资产 + 发布页补 Windows 条目 + push"
  else
    if [ "$HAVE_WIN" = "1" ]; then WIN_DESC="含 Windows 4 资产"; else WIN_DESC="无 Windows 产物"; fi
    info "--check 通过：将发布 v${VER} —— 建 Release + 传资产（${WIN_DESC}）+ 生成页面 + push + 通知"
  fi
  exit 0
fi

# ---------- 4. 建 Release + 传资产（幂等：已存在就跳过） ----------
REL_ID=$(curl ${CURL[@]+"${CURL[@]}"} -s -m 15 -H "Authorization: Bearer $TOKEN" \
  "https://api.github.com/repos/$GH_REPO/releases/tags/v$VER" | python3 -c "import json,sys;print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
if [ -n "$REL_ID" ]; then
  info "Release v${VER} 已存在（id=${REL_ID}），跳过创建"
else
  NOTES=$(mktemp)
  if [ "$HAVE_WIN" = "1" ]; then
    printf '# Soniva %s\n\nSoniva 桌面端 %s 发布。\nMac：Developer ID 签名 + Apple 公证通过（Gatekeeper accepted），双架构 DMG（Apple Silicon / Intel）。\nWindows：x64 安装包（NSIS 向导式）与免安装便携版，未代码签名，首次运行如遇 SmartScreen 提示，选「更多信息 → 仍要运行」。自动更新清单 latest-mac.yml / latest.yml 一并上传。\n\n更新说明与开发过程见发布记录页：%s/releases/%s\n' "$VER" "$VER" "$SITE_URL" "$VER" > "$NOTES"
  else
    printf '# Soniva %s\n\nSoniva 桌面端 %s 发布。Developer ID 签名 + Apple 公证通过（Gatekeeper accepted），\n双架构 DMG（Apple Silicon / Intel）与自动更新清单 latest-mac.yml 一并上传。\n\n更新说明与开发过程见发布记录页：%s/releases/%s\n' "$VER" "$VER" "$SITE_URL" "$VER" > "$NOTES"
  fi
  PAYLOAD=$(mktemp)
  python3 -c "import json,sys;f=open(sys.argv[1]);print(json.dumps({'tag_name':'v'+sys.argv[2],'target_commitish':'main','name':'Soniva '+sys.argv[2],'body':f.read(),'draft':False,'prerelease':False}))" "$NOTES" "$VER" > "$PAYLOAD"
  RESP=$(curl ${CURL[@]+"${CURL[@]}"} -s -m 30 -X POST -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/vnd.github+json" -d @"$PAYLOAD" "https://api.github.com/repos/$GH_REPO/releases")
  REL_ID=$(echo "$RESP" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d.get('id',''))" 2>/dev/null)
  rm -f "$NOTES" "$PAYLOAD"
  [ -n "$REL_ID" ] || die 4 "创建 Release v$VER 失败：$(echo "$RESP" | head -c 200)"
  ok "Release v${VER} 已创建（id=${REL_ID}）"
fi
if [ "$WIN_ONLY" = "1" ] && [ -z "$REL_ID" ]; then
  die 4 "Release v$VER 不存在——--win 只补传已发布的版本，请先走完整发版（不带 --win）"
fi
upload() { # upload <本地文件> <资产名>（已存在的资产跳过，幂等重跑安全）
  local code exists
  exists=$(curl ${CURL[@]+"${CURL[@]}"} -s -m 15 -H "Authorization: Bearer $TOKEN" \
    "https://api.github.com/repos/$GH_REPO/releases/$REL_ID" | \
    A="$2" python3 -c "import json,sys,os;print('yes' if any(a['name']==os.environ['A'] for a in json.load(sys.stdin).get('assets',[])) else 'no')" 2>/dev/null)
  if [ "$exists" = "yes" ]; then
    info "资产已存在，跳过：$2"
    return 0
  fi
  code=$(curl ${CURL[@]+"${CURL[@]}"} -s -o /dev/null -w '%{http_code}' -m 570 -X POST \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/octet-stream" \
    --data-binary @"$1" "https://uploads.github.com/repos/$GH_REPO/releases/$REL_ID/assets?name=$2")
  [ "$code" = "201" ] || die 4 "上传 $2 失败（HTTP ${code}）"
  ok "已上传 $2"
}
# 🚨 2026-10-01 根因修复：自动更新一直 404——这里原来只传 3 资产（双架构 DMG +
# yml），但 09-27 起 latest-mac.yml 里引用了双架构 zip（MacUpdater 只认 zip，
# 不认 dmg），zip 从没被上传过。0.1.6 老客户端每次 update-available → 自动下载
# zip → 404 → 错误落进"免打扰"分支，用户端零反馈（"重启了也没通知"即此）。
# zip 必须随包上传；blockmap 供差量下载，缺了会退回全量下载（不致命但费流量）。
if [ "$WIN_ONLY" = "0" ]; then
  upload "$OUT/Soniva-$VER-mac.zip" "Soniva-$VER-mac.zip"
  upload "$OUT/Soniva-$VER-arm64-mac.zip" "Soniva-$VER-arm64-mac.zip"
  upload "$OUT/Soniva-$VER-mac.zip.blockmap" "Soniva-$VER-mac.zip.blockmap"
  upload "$OUT/Soniva-$VER-arm64-mac.zip.blockmap" "Soniva-$VER-arm64-mac.zip.blockmap"
  upload "$DMG_ARM" "Soniva-$VER-arm64.dmg"
  upload "$DMG_X64" "Soniva-$VER.dmg"
  upload "$YML" "latest-mac.yml"
fi
# Windows 资产（2026-11-13 起）：setup 走自动更新，blockmap 供差量下载，portable 只给
# 手动下载（自动更新不覆盖它），latest.yml 是 electron-updater 的轮询清单，缺了就
# update-available → 404（Mac 那次 404 事故的 Windows 版，别再犯）。
if [ "$HAVE_WIN" = "1" ]; then
  upload "$WIN_SETUP" "Soniva-$VER-x64-setup.exe"
  upload "$WIN_BLOCKMAP" "Soniva-$VER-x64-setup.exe.blockmap"
  upload "$WIN_PORTABLE" "Soniva-$VER-x64-portable.exe"
  upload "$WIN_YML" "latest.yml"
fi
# --win 补传时 Release 说明建的是 Mac 单平台版：把 Windows 一句补进正文（幂等，
# 已含 Windows 字样就不再 PATCH）。
if [ "$WIN_ONLY" = "1" ]; then
  BODY=$(curl ${CURL[@]+"${CURL[@]}"} -s -m 15 -H "Authorization: Bearer $TOKEN" \
    "https://api.github.com/repos/$GH_REPO/releases/$REL_ID" | python3 -c "import json,sys;print(json.load(sys.stdin).get('body',''))" 2>/dev/null)
  case "$BODY" in
    *Windows*)
      info "Release 说明已含 Windows 段，跳过"
      ;;
    *)
      PATCH=$(mktemp)
      WIN_NOTE=$(printf 'Windows x64 安装包（Soniva-%s-x64-setup.exe）与免安装便携版已随 Release 上传。未代码签名，首次运行如遇 SmartScreen 提示，选「更多信息 → 仍要运行」。自动更新清单 latest.yml 一并上传。' "$VER")
      NEW_BODY=$(BODY="$BODY" NOTE="$WIN_NOTE" python3 -c "import os;print(os.environ['BODY'].rstrip() + '\n\n' + os.environ['NOTE'])")
      printf '%s' "$NEW_BODY" | python3 -c "import json,sys;print(json.dumps({'body': sys.stdin.read()}))" > "$PATCH"
      curl ${CURL[@]+"${CURL[@]}"} -s -o /dev/null -m 30 -X PATCH -H "Authorization: Bearer $TOKEN" \
        -H "Accept: application/vnd.github+json" -d @"$PATCH" \
        "https://api.github.com/repos/$GH_REPO/releases/$REL_ID" || die 4 "更新 Release 说明失败"
      rm -f "$PATCH"
      ok "Release 说明已补 Windows 段"
      ;;
  esac
fi

# ---------- 5. 页面数据 + 开发日志 ----------
REL_DIR="$REPO_ROOT/public/releases"
[ -f "$DMG_ARM" ] && MB_ARM=$(( $(stat -f %z "$DMG_ARM") / 1048576 ))
[ -f "$DMG_X64" ] && MB_X64=$(( $(stat -f %z "$DMG_X64") / 1048576 ))
TODAY=$(date +%F)
gen_page() { # gen_page <语言后缀「.en」或空>
  local suffix="$1" size_arm size_x64 win_zh win_en downloads
  # 下载条目整段先拼进 downloads 变量再进模板——$( ) 命令替换会吞末尾换行，
  # 直接把条目变量放 heredoc 里会跟 "---" 粘成一行炸掉 YAML（0.1.25 补传踩过）。
  size_arm="约 ${MB_ARM} MB"; size_x64="约 ${MB_X64} MB"
  [ "$suffix" = ".en" ] && { size_arm="~${MB_ARM} MB"; size_x64="~${MB_X64} MB"; }
  downloads="  - id: macos-arm64
    platform: macOS
    arch: Apple Silicon
    filename: Soniva-$VER-arm64.dmg
    size: $size_arm
  - id: macos-x64
    platform: macOS
    arch: Intel
    filename: Soniva-$VER.dmg
    size: $size_x64"
  if [ "$HAVE_WIN" = "1" ]; then
    win_zh="Windows x64 安装包与免安装便携版已一并上传（未签名，首次运行如遇 SmartScreen 提示选「更多信息 → 仍要运行」）。"
    win_en=" Windows x64 installer and portable build are attached as well (unsigned; SmartScreen may warn on first run)."
    if [ "$suffix" = ".en" ]; then
      downloads="$downloads
  - id: windows-x64
    platform: Windows
    arch: x64 installer
    filename: Soniva-$VER-x64-setup.exe
    size: $size_x64
  - id: windows-x64-portable
    platform: Windows
    arch: x64 portable
    filename: Soniva-$VER-x64-portable.exe
    size: $size_x64"
    else
      downloads="$downloads
  - id: windows-x64
    platform: Windows
    arch: x64 安装版
    filename: Soniva-$VER-x64-setup.exe
    size: $size_arm
  - id: windows-x64-portable
    platform: Windows
    arch: x64 免安装
    filename: Soniva-$VER-x64-portable.exe
    size: $size_arm"
    fi
  else
    win_zh=""; win_en=""
  fi
  if [ "$suffix" = ".en" ]; then
    cat > "$REL_DIR/$VER.en.md" <<EOF
---
version: "$VER"
tag: "v$VER"
date: "$TODAY"
channel: released
downloads:
$downloads
---

# Soniva $VER

Soniva Desktop $VER is out. Developer ID signed, notarized and Gatekeeper accepted.
Dual-arch DMG (Apple Silicon / Intel) plus the latest-mac.yml update manifest are
attached to the release.$win_en See the release notes and the matching dev-log entry for
what changed in this version.
EOF
  else
    cat > "$REL_DIR/$VER.md" <<EOF
---
version: "$VER"
tag: "v$VER"
date: "$TODAY"
channel: released
downloads:
$downloads
---

# Soniva $VER

Soniva 桌面端 $VER 发布。Developer ID 签名 + Apple 公证通过（Gatekeeper accepted），
双架构 DMG 与自动更新清单 latest-mac.yml 已随 Release 上传。${win_zh}本版本更新说明见当日
《桌面端开发日志》（首页时间线同日条目）。
EOF
  fi
}
[ -f "$REL_DIR/$VER.md" ] || gen_page ""
[ -f "$REL_DIR/$VER.en.md" ] || gen_page ".en"
# 0.1.25 起才有的 Windows 条目：旧页面（如 --win 补传场景）没有，直接重写补齐——
# 页面本来就是流水线产物，不留手改内容。
if [ "$HAVE_WIN" = "1" ] && [ -f "$REL_DIR/$VER.md" ] && ! grep -q "windows-x64" "$REL_DIR/$VER.md"; then
  gen_page ""
  gen_page ".en"
  ok "发布页已补 Windows 下载条目（public/releases/$VER.md）"
fi
ok "发布页数据就绪（public/releases/$VER.md）"
if [ "$WIN_ONLY" = "0" ]; then
  python3 "$REPO_ROOT/scripts/gen-devlog.py" >/dev/null || die 5 "开发日志重生成失败"
fi

# ---------- 6. 构建验证 ----------
cd "$REPO_ROOT"
# 2026-10-01：verify/build 的输出原来被整体吞掉，失败时只给一句"失败"——
# 0.1.7~0.1.11 四个版本的发布页全卡在这看不出来原因。改成失败时先打出
# 真实报错再 die，成功时保持安静。
RUN_LOG=$(mktemp)
pnpm verify >"$RUN_LOG" 2>&1 || { tail -n 40 "$RUN_LOG"; rm -f "$RUN_LOG"; die 5 "pnpm verify（typecheck/lint）失败（上方为真实报错）"; }
pnpm build >"$RUN_LOG" 2>&1 || { tail -n 40 "$RUN_LOG"; rm -f "$RUN_LOG"; die 5 "pnpm build 失败（上方为真实报错）"; }
rm -f "$RUN_LOG"
ok "typecheck/lint/build 全部通过"
# ---------- 7. 同步公开仓库（2026-11-12 起源码迁入 SonivaSlots monorepo）----------
# 页面数据提交进宿主 SonivaSlots（显式前缀路径，不吞并行改动），再 git subtree push
# 把 soniva-releases 前缀历史回推公开仓库触发 Pages+Vercel 部署——subtree split
# 复现原提交 SHA，对公开仓库是无缝快进；独立克隆模式已随旧检出退役。
TOP=$(git rev-parse --show-toplevel 2>/dev/null || echo "$REPO_ROOT")
[ "$TOP" != "$REPO_ROOT" ] || die 6 "发版已迁入 SonivaSlots/soniva-releases（monorepo），旧独立检出已退役，请在 monorepo 检出内运行"
FOREIGN=$(git -C "$TOP" diff --cached --name-only | grep -v '^soniva-releases/' || true)
if [ -n "$FOREIGN" ]; then
  echo "$FOREIGN" | head -5
  die 6 "monorepo 暂存区有 soniva-releases 之外的改动（上方前 5 个），先让对应会话提交或退出暂存再发版"
fi
git -C "$TOP" add "soniva-releases/public/releases/$VER.md" "soniva-releases/public/releases/$VER.en.md" soniva-releases/public/devlog/ soniva-releases/scripts/ 2>/dev/null
if git -C "$TOP" diff --cached --quiet; then
  info "没有需要提交的变更"
else
  git -C "$TOP" commit -m "feat(releases): 自动发版 v${VER}：Release 资产、发布页数据与当日开发日志

- scripts/publish-release.sh 全自动流水线产物：门禁（版本/产物/sha512/公证实测）全过后执行
- 同步增量开发日志（scripts/gen-devlog.py）

Co-Authored-By: GLM-5.3-Flash <noreply@z.ai>"
fi
git -C "$TOP" subtree push --prefix=soniva-releases "https://github.com/$GH_REPO.git" main >/dev/null 2>&1 \
  || git -C "$TOP" -c http.proxy="$PROXY" subtree push --prefix=soniva-releases "https://github.com/$GH_REPO.git" main >/dev/null 2>&1 \
  || die 6 "subtree push 公开仓库失败（直连与代理都试了）"
ok "已 push 公开仓库，GitHub Pages 将自动部署 $SITE_URL"

notify "Soniva v$VER 已发布" "Release 资产/发布页/日志已更新并推送，Pages 部署中。$SITE_URL"
info "🎉 v$VER 发版完成"
