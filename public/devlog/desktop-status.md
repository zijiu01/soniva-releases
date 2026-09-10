---
date: "2026-09-10"
tag: "状态快照"
source: "desktop/.agent/STATUS.md"
---

# desktop/.agent/STATUS.md

> ⚠️ **便利签，不是日志。**只写"当前定下的计划做到哪了"，覆盖擦写；长期规则在根
> `CLAUDE.md` / `AGENTS.md` / `.agent/*.md`，抄进来就是第二份会漂移的真相源；详细历史
> 查 `git log -- desktop/`。**封顶 100 行**（已超标两次，加新内容前先压掉旧内容）。

## 现状一句话

Electron 客户端，加载线上 `app.soniva.uk` + 本地 `.sonivalib` 资源库（SQLite/FTS5、指纹去重、回收站软
删除），工作室已原生重写搬进来。沙盒无图形环境，**所有 GUI 验收必须在用户 Mac 上做**（方案见
`.agent/opus-logs/20260824-013303-*.md`）。

## 分家契约（后续会话以此为准）

- `web/src/app/api/**`、`web/supabase/migrations/**`：**共用唯一一份**，改它=同时改两端。
- `web/src/data/**`、`**/*.i18n.ts`、`lib/i18n/`、`types/chat`、`lib/system-tts`：共用，
  desktop 经 Vite alias **只读**引用，不复制。
- `web/src` 其余：web 独占且冻结，desktop 各自一份；`desktop/src/**` desktop 独占。

三条防漂移：① 搬过去的代码不留"跟网页版保持一致"的注释；② 改 `web/src/data/` 或任何 `*.i18n.ts` 后
必须来 desktop 跑 `typecheck`；③ 🚨 **后端 `/api/*` 加参数一律向后兼容**（桌面端是已安装客户端）。
⚠️ desktop 单独 clone 构建不起来，拆仓库时 alias 要带走。

## 批次进度

- **A~NN-P 各批：代码侧全部完成。**✅ 只有 FF 批在 Mac 上验过，其余全部 🔴 未验证，逐批查
  `git log` 与 `.agent/opus-logs/`。
- **批次 NN（第十八~二十轮，2026-09-08，约 41 条）：进行中，已交付 A/B/C/L/M/N/O/P 八批**，
  🔴 未验；剩 D/E/F/G/H/I/J/K 八批（计划见 `~/.claude/plans/sonnet-glittery-balloon.md`）。两条
  生产硬故障已止血（AI 聊天 500、PDF 打不开，根因见根因表第 5/9 条）。**B 批动了生产计费**：
  改按上游真实 usage 结算，口径见 `web/docs/BILLING_CREDITS_MODEL.md` §8。
- **批次 OO（2026-09-09，PDF 空格预览专项反馈）：三批全部交付，🔴 未验。**计划见
  `~/.claude/plans/pdf-finder-gleaming-hamming.md`。批次3 新增 `PdfAssetAnnotation`
  几何坐标标注（点/框选），跟引文锚点的 `AssetAnnotation` 各存各的 typeMeta 字段、
  各走各的 IPC，不共用；PDF 现在也能"去画板"（`isCanvasDocument()` 统一两处判断）；
  `contracts/library.ts` 拆出 `library-assets-bridge.ts`/`library-annotations.ts`。
- **批次 7（打包分发）：✅ 2026-09-10 在 Mac 上跑通签名+公证+DMG**（arm64/x64 双 `Accepted`、
  staple 通过）。踩了 6 个坑（系统代理 vs 环境变量代理、截断 zip 静默挂死、hdiutil 报错是
  python 的替罪羊、macOS 26 无系统 Python、Homebrew py3.14 坏、软链 python3 因 argv[0] 失效），
  已固化为 `scripts/preflight-mac.sh`（`dist:mac` 前置）+ `docs/RELEASE_GUIDE.md` §12 速查表，
  全过程见 `.agent/opus-logs/20260910-051600-*`。**未做**：`publish.owner/repo` 仍占位；
  自动更新端到端、`.sonivapack` 双击、缩略图、资源库读写均未在打包版实测。
- **未开始**：批次 8（Windows）、9（IndexedDB，可选）、绘画批次 B、批次7 CI 自动化（先手动跑通）。

## 🚨 会复发的根因（每一条都真的犯过第二次）

1. **搬代码 ≠ 搬前提**——TSX 搬了，依赖的全局 CSS/图标字体/z-index/CSS 变量没搬。
2. **跨进程/跨组件树/跨栏目的东西要单独问一句"那边知道吗"**——无 props 路径时一律用模块级
   信号（`*-signal.ts` + `useSyncExternalStore`），作用域问题一律 `useSuspendLibraryShortcuts`。
3. **已确诊的样式/数据陷阱**：橙色是系统强调色（已堵）；`hover:` 特异性高于同级工具类；无
   层级 CSS 会盖掉 `focus-visible`；旧库 FTS5 缺旧行致 UPDATE malformed（已修）。
4. **第二只靴子**——修完一条就 grep 还有谁在做同一件事；**注释可能是过时的假设**（NN-P 删掉了两处
   "视频缩略图要 ffmpeg"），改动前先跑一遍实际调用链。
5. 🚨 **对称性是最高发的一类**（LL 两次、NN 三次）：BYOK Key 上行不过滤下行过滤；翻译守卫剥
   了额度桶后缀、AI 会话没剥（→路由 500）；挑内容有进无出；气泡失焦丢弃、右栏失焦保存。
6. **手抄常量**（已第五次）——品牌/型号/槽位/后缀列表一律从注册表推导。
7. **"我提了 5 次了"先怀疑归因，别加大同方向的改动**（MM 批）——按钮高度本来就一致（真凶是
   多包一层 wrapper）；"MD 编辑样式变化"也不是依赖不行，是编辑态少了那套字号。🚨 **"是不是
   依赖没做对"通常也是错误归因**（NN-P：pdfjs 早就装好，缺的是主进程那条管线里没人调它）。
8. **把 500 伪装成 400 会让 bug 永远查不出来**；**注释不是压行的余量**（超了就拆文件）；
   **Record 索引 TS 兜不住**（NN 批），目录访问收进一个返回空数组的函数。
9. **新 hook 挂载晚于触发它挂载的那次事件**（NN-O 批）——那次事件的"后半段"（比如 keyup）会被
   刚挂好的监听器错误接管，加个"这次按下是不是我自己收到的"标记位。

## 主动收窄 / 明确未做（不是遗漏）

- 长期收窄：切库靠整页刷新（NN-E 待改）、多库并存/库图标/文件夹「描述」「密码保护」/工作室
  付费引导 UI 未做；火山方舟翻译不支持 BYOK；MD 所见即所得是**块级**的（NN-J 拟换
  CodeMirror 6）；图片不进古文今译。
- **NN 批**：计费 bug 没加自动化回归（`web/` 无测试运行器）改用结构性兜底；两条 `api/*/route.ts`(348/341) 仍超 300 行；方舟 Responses 的 usage 帧无文档依据，解不出退估算。
- **LL/MM 批**（逐条见 `.agent/opus-logs/20260907-批次LL-*.md`、`20260908-批次MM-*.md`）：画板不做无限
  画布/手绘/协作、比稿无会话；Windows 剪贴板多文件只取第一条；标注取色器不做（NN-K 拟补）；Finder
  看不到缩略图**不是 bug**；`use-canvas-document` 整表读再 find（**已知债**）。
- **已解决、别再排查**：AI 会话分档计费、方舟 256K 上下文、翻译响应 100~220 秒（已改流式）；🚨 `JWT issued at future` 是本地 Docker 时钟漂移（重启 supabase），不是 bug。**OO 批**：PDF 预览滚动记忆只到"第几页"，不到页内像素偏移，未做。
- 🚨 **"改了生成物参数"≠"用户看到的东西变了"**——缩略图只在导入时生成一次且缓存跨重启存活，改
  参数必须回答存量怎么办（`thumbVersion` + URL `?v=` + `thumbnail-maintenance.ts` 的扫描三件套）。

## 存量债 / 已知沙盒限制

- 超 300 行、在豁免表里：`asset-repository.ts`、`folders.ts`、`FolderTreeRow.tsx`、`features/studio/**`
  （"从 web 逐字复制"，新写代码不在此列）；`HomeLayout`/`App`/`LibraryShell` 贴着上限。
- **基线：`corepack pnpm lint` 0 error / 117 warning、`test` 239 通过**，再红就是新问题。🚨 `tsc
  --noEmit` 默认只查 main/library/preload，渲染进程要另跑 `tsc -p tsconfig.renderer.json --noEmit`；
  `web/` 无测试运行器只能 `npx tsc --noEmit`；`electron` 装不起来（缺 GTK/ATK），`pnpm` 全局不可用
  一律 `corepack pnpm`，沙盒 `nativeImage` 只返回路径字符串。

## 待 Mac 验收

⚠️ **schema 仍是 v6，旧库第一次打开会跑迁移——先拿不重要的库试。NN 批必看三条**：🚨 ①**AI
聊天能正常聊**（原 100% 报 500）；②**计费口径变了**（按上游真实 usage 结算、图片翻译开始扣，
账单页多出 `settlement` 流水，拿长中文/英文各一笔核对）；③预览器：竖图/小图即铺满、小地图可点
可拖、cr2 能出图。**MM/NN-M/NN-N/NN-O 批仍未验**：整屏截图授权引导、画板划词高亮与右栏双向
定位、访达多图 ⌘V、设置弹窗中性灰底、拖拽预览/全屏控件淡出/右栏无分割线、拖拽角标裁切、空格
预览秒开秒关（真根因见第 9 条教训）、选中框空隙与同心圆角。
**NN-P/NN-Q 批**（PDF/SVG/视频卡片缩略图 + pdf.js 主线程改造，详情见对应 opus-log）：三类卡片
有画面、**空格预览 PDF 出第一页且不糊**、视频角标出时长、关窗后能退出；失败时终端有
`[PdfViewer]` 日志。**批次 OO**（PDF 专项）验收：Finder 按钮/分割线/留白按反馈改了、多位数页码
可正常输入、缩放/滚动关闭重开能记住且跨 PDF 不串号、有书签的 PDF 出目录侧栏能跳转、PDF 能"去
画板"点击/框选落标注且左右栏双向联动。更早各批见 `.agent/opus-logs/`，BB~II 用
`git log -p -- desktop/.agent/STATUS.md` 翻。
