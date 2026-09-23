#!/usr/bin/env python3
"""把 desktop 仓库的全量提交按天生成 soniva-releases 的开发日志 md。

用法：python3 scripts/gen-devlog.py [monorepo路径]
默认 monorepo 路径取环境变量 SONIVA_MONOREPO，再默认到本机常用位置。
按作者日期分桶；一天一篇 public/devlog/<日期>.md，内容为当日全部提交。
可重复执行（幂等）：无新提交时产物不变，git 不会产生 diff。
"""
import collections
import os
import re
import subprocess
import sys

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(REPO_ROOT, "public", "devlog")
DEFAULT_MONOREPO = "/Volumes/500GB-BLUE/0-Project/Soniva"

SCOPE_ZH = {
    "desktop": "桌面端", "library": "素材库", "screenshot": "截图", "clipboard": "剪贴板",
    "selection-bubble": "划词气泡", "studio": "工作室", "studio-reading": "朗读",
    "studio-status": "工作台状态", "studio-folder-picker": "文件夹选择", "tts": "语音合成",
    "board": "画板", "notes": "笔记", "word-cards": "单词卡", "billing-center": "账单中心",
    "settings": "设置", "telemetry": "匿名统计", "voice-input": "语音输入",
    "quicklook": "空格预览", "sfx": "提示音", "import": "导入", "slot": "插件通道",
    "docs": "开发文档", "ci": "CI", "devlog": "开发日志", "auth": "登录", "login": "登录",
    "updater": "自动更新", "pack": "分享包", "types": "类型", "i18n": "多语言",
    "bubble-settings": "气泡设置", "quote-stack": "摘录卡", "dictation": "听写",
}
TYPE_ZH = {
    "feat": "新功能", "fix": "修复", "docs": "文档", "chore": "工程", "refactor": "重构",
    "perf": "性能", "style": "样式", "build": "构建", "test": "测试",
}


def export_commits(monorepo: str) -> str:
    cmd = ["git", "-C", monorepo, "log", "--format=%h|%ad|%s", "--date=format:%Y-%m-%d", "--", "desktop/"]
    return subprocess.run(cmd, check=True, capture_output=True, text=True).stdout


def main() -> int:
    monorepo = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("SONIVA_MONOREPO", DEFAULT_MONOREPO)
    raw = export_commits(monorepo)

    days: dict = collections.OrderedDict()
    for line in raw.splitlines():
        if not line:
            continue
        h, d, s = line.split("|", 2)
        days.setdefault(d, []).append((h, s))

    os.makedirs(OUT_DIR, exist_ok=True)
    written = 0
    for d in sorted(days):
        commits = list(reversed(days[d]))  # git log 新在前，日志按时间正序
        scopes: collections.Counter = collections.Counter()
        types: collections.Counter = collections.Counter()
        for _, s in commits:
            m = re.match(r"^(\w+)(?:\(([\w-]+)\))?:", s)
            if m:
                types[m.group(1)] += 1
                if m.group(2):
                    scopes[m.group(2)] += 1
            else:
                types["其他"] += 1
        themes = "、".join(SCOPE_ZH.get(sc, sc) for sc, _ in scopes.most_common(3)) or "综合开发"
        tc = "，".join(f"{TYPE_ZH.get(t, t)} {c} 个" for t, c in types.most_common())

        out = ["---", f'date: "{d}"', 'tag: "开发日志"', 'source: "desktop 仓库 git log"', "---", ""]
        out.append(f"# 桌面端开发日志 · {d}")
        out.append("")
        out.append(f"当日 {len(commits)} 个提交（{tc}）。主要涉及：{themes}。")
        out.append("")
        out.append("## 提交记录")
        out.append("")
        for h, s in commits:
            out.append(f"- `{h}` {s.strip()}")
        path = os.path.join(OUT_DIR, f"{d}.md")
        with open(path, "w", encoding="utf-8") as fh:
            fh.write("\n".join(out) + "\n")
        written += 1

    print(f"devlog: regenerated {written} daily docs from {sum(len(v) for v in days.values())} commits")
    return 0


if __name__ == "__main__":
    sys.exit(main())
