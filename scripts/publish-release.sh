#!/usr/bin/env bash
# 全自动发版：基座重新打包后，一条命令完成 发布→页面→构建→推送→通知。
#
# 用法：bash scripts/publish-release.sh [--check]
#   --check  只做门禁校验并打印将执行的动作，不改任何东西。
#
# 门禁（任一不过即失败退出并通知，绝不带病上线）：
#   1. 基座版本号 > 线上最新 Release（等号=已发布，静默收工）
#   2. out/ 里双架构 DMG + latest-mac.yml 齐全，且 sha512 与 latest-mac.yml 完全一致
#   3. 双 DMG 挂载实测：签名有效 + spctl accepted（公证票据）+ asar 含渲染层
#
# 发布动作：GitHub API 建 Release + 传 3 资产 → 生成 public/releases/<版本>.md（中英）
#   → 增量重生成开发日志 → pnpm verify + build → 精准提交 → push（直连失败自动走本地代理）
#   → ntfy.sh 远程通知 + 本机系统通知。
# 凭据：本机钥匙串的 GitHub 凭据（git credential fill），不落盘不打印。
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESKTOP="${SONIVA_MONOREPO:-/Volumes/500GB-BLUE/0-Project/Soniva}/desktop"
GH_REPO="zijiu01/soniva-releases"
SITE_URL="https://zijiu01.github.io/soniva-releases"
PROXY="http://127.0.0.1:7897"
CHECK=0
[ "${1:-}" = "--check" ] && CHECK=1

ok()   { echo "✅ $*"; }
bad()  { echo "❌ $*"; }
info() { echo "ℹ️  $*"; }

# ---------- 通知（远程 ntfy + 本机系统通知，均尽力而为不阻塞） ----------
notify() { # notify <标题> <正文>
  [ -f "$REPO_ROOT/.env.local" ] && . "$REPO_ROOT/.env.local"
  if [ -n "${NTFY_TOPIC:-}" ]; then
    curl -s -m 10 -H "Title: $1" -H "Tags: rocket" -d "$2" "https://ntfy.sh/$NTFY_TOPIC" >/dev/null 2>&1 || true
  fi
  osascript -e "display notification \"$2\" with title \"$1\"" >/dev/null 2>&1 || true
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
if [ -n "$LATEST" ] && [ "$VER" != "$(printf '%s\n%s\n' "$LATEST" "$VER" | sort -V | tail -1)" ]; then
  info "线上已是最新（${LATEST} >= ${VER}），无事可做。"
  exit 0
fi

# ---------- 2. 产物与 sha512 ----------
OUT="$DESKTOP/out"
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

# ---------- 3. 挂载实测公证 ----------
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

# ---------- --check 到此为止 ----------
if [ "$CHECK" = "1" ]; then
  info "--check 通过：将发布 v${VER} —— 建 Release + 传 3 资产 + 生成页面 + push + 通知"
  exit 0
fi

# ---------- 4. 建 Release + 传资产（幂等：已存在就跳过） ----------
REL_ID=$(curl ${CURL[@]+"${CURL[@]}"} -s -m 15 -H "Authorization: Bearer $TOKEN" \
  "https://api.github.com/repos/$GH_REPO/releases/tags/v$VER" | python3 -c "import json,sys;print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
if [ -n "$REL_ID" ]; then
  info "Release v${VER} 已存在（id=${REL_ID}），跳过创建"
else
  NOTES=$(mktemp)
  printf '# Soniva %s\n\nSoniva 桌面端 %s 发布。Developer ID 签名 + Apple 公证通过（Gatekeeper accepted），\n双架构 DMG（Apple Silicon / Intel）与自动更新清单 latest-mac.yml 一并上传。\n\n更新说明与开发过程见发布记录页：%s/releases/%s\n' "$VER" "$VER" "$SITE_URL" "$VER" > "$NOTES"
  PAYLOAD=$(mktemp)
  python3 -c "import json,sys;f=open(sys.argv[1]);print(json.dumps({'tag_name':'v'+sys.argv[2],'target_commitish':'main','name':'Soniva '+sys.argv[2],'body':f.read(),'draft':False,'prerelease':False}))" "$NOTES" "$VER" > "$PAYLOAD"
  RESP=$(curl ${CURL[@]+"${CURL[@]}"} -s -m 30 -X POST -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/vnd.github+json" -d @"$PAYLOAD" "https://api.github.com/repos/$GH_REPO/releases")
  REL_ID=$(echo "$RESP" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d.get('id',''))" 2>/dev/null)
  rm -f "$NOTES" "$PAYLOAD"
  [ -n "$REL_ID" ] || die 4 "创建 Release v$VER 失败：$(echo "$RESP" | head -c 200)"
  ok "Release v${VER} 已创建（id=${REL_ID}）"
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
upload "$DMG_ARM" "Soniva-$VER-arm64.dmg"
upload "$DMG_X64" "Soniva-$VER.dmg"
upload "$YML" "latest-mac.yml"

# ---------- 5. 页面数据 + 开发日志 ----------
REL_DIR="$REPO_ROOT/public/releases"
MB_ARM=$(( $(stat -f %z "$DMG_ARM") / 1048576 ))
MB_X64=$(( $(stat -f %z "$DMG_X64") / 1048576 ))
TODAY=$(date +%F)
gen_page() { # gen_page <语言后缀「.en」或空> <若干文案>
  local suffix="$1" size_arm size_x64
  if [ "$suffix" = ".en" ]; then
    size_arm="~${MB_ARM} MB"; size_x64="~${MB_X64} MB"
    cat > "$REL_DIR/$VER.en.md" <<EOF
---
version: "$VER"
tag: "v$VER"
date: "$TODAY"
channel: released
downloads:
  - id: macos-arm64
    platform: macOS
    arch: Apple Silicon
    filename: Soniva-$VER-arm64.dmg
    size: $size_arm
  - id: macos-x64
    platform: macOS
    arch: Intel
    filename: Soniva-$VER.dmg
    size: $size_x64
---

# Soniva $VER

Soniva Desktop $VER is out. Developer ID signed, notarized and Gatekeeper accepted.
Dual-arch DMG (Apple Silicon / Intel) plus the latest-mac.yml update manifest are
attached to the release. See the release notes and the matching dev-log entry for
what changed in this version.
EOF
  else
    size_arm="约 ${MB_ARM} MB"; size_x64="约 ${MB_X64} MB"
    cat > "$REL_DIR/$VER.md" <<EOF
---
version: "$VER"
tag: "v$VER"
date: "$TODAY"
channel: released
downloads:
  - id: macos-arm64
    platform: macOS
    arch: Apple Silicon
    filename: Soniva-$VER-arm64.dmg
    size: $size_arm
  - id: macos-x64
    platform: macOS
    arch: Intel
    filename: Soniva-$VER.dmg
    size: $size_x64
---

# Soniva $VER

Soniva 桌面端 $VER 发布。Developer ID 签名 + Apple 公证通过（Gatekeeper accepted），
双架构 DMG 与自动更新清单 latest-mac.yml 已随 Release 上传。本版本更新说明见当日
《桌面端开发日志》（首页时间线同日条目）。
EOF
  fi
}
[ -f "$REL_DIR/$VER.md" ] || gen_page ""
[ -f "$REL_DIR/$VER.en.md" ] || gen_page ".en"
ok "发布页数据就绪（public/releases/$VER.md）"
python3 "$REPO_ROOT/scripts/gen-devlog.py" >/dev/null || die 5 "开发日志重生成失败"

# ---------- 6. 构建验证 + 提交 + 推送 ----------
cd "$REPO_ROOT"
pnpm verify >/dev/null 2>&1 || die 5 "pnpm verify（typecheck/lint）失败"
pnpm build >/dev/null 2>&1 || die 5 "pnpm build 失败"
ok "typecheck/lint/build 全部通过"
git add "public/releases/$VER.md" "public/releases/$VER.en.md" public/devlog/ scripts/ 2>/dev/null
if git diff --cached --quiet; then
  info "没有需要提交的变更"
else
  git commit -m "feat(releases): 自动发版 v${VER}：Release 资产、发布页数据与当日开发日志

- scripts/publish-release.sh 全自动流水线产物：门禁（版本/产物/sha512/公证实测）全过后执行
- 同步增量开发日志（scripts/gen-devlog.py）

Co-Authored-By: GLM-5.3-Flash <noreply@z.ai>"
fi
git push origin main >/dev/null 2>&1 || git -c http.proxy="$PROXY" push origin main >/dev/null 2>&1 || die 6 "git push 失败（直连与代理都试了）"
ok "已 push，GitHub Pages 将自动部署 $SITE_URL"

notify "Soniva v$VER 已发布" "Release 资产/发布页/日志已更新并推送，Pages 部署中。$SITE_URL"
info "🎉 v$VER 发版完成"
