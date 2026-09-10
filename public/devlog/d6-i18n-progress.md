---
date: "2026-08-29"
tag: "开发日志"
source: "desktop/.agent/d6-i18n-progress.md"
---

# D6：renderer i18n 接线进度（2026-08-29 全部完成）

> 覆盖式快照，不是日志——完成的批次直接从"待办"表挪掉，不留勾选历史。
> 改了什么查 `git log -- desktop/src/renderer`。

模式：`<Component>.i18n.ts` colocated 字典（`Dictionary` 类型，zh-CN/en-US
都写）+ 组件内 `useT(xxxDictionary)`。真实用户可见字符串才算数——大量命中
是源码注释（"真机反馈……"这类），不用管，扫描时用
`grep -nP '[\x{4e00}-\x{9fff}]' file | grep -vP '^\s*\d+:\s*(//|\*|/\*)'`
排除注释行。

## 已完成

- 批次1：`CreateLibraryDialog.tsx`、`TitleBar.tsx`、`ConfirmDialog.tsx`、
  `LibraryShell.tsx`、`ExportSelectionPopover.tsx`
- 批次2：`SelectionToolbar.tsx`、`AssetDetailPanel.tsx`、`FilterBar.tsx`，
  顺带把 `shared/lib/format.ts` 的模块级 `ASSET_TYPE_LABEL` 常量改成
  `use-asset-type-label.ts` 的 hook 版（模块级常量没法跟着 locale 走）
- 批次3：`TagBrowser.tsx`、`PackImportConflictsDialog.tsx`、
  `LibraryDialogs.tsx`、`FolderRowContextMenu.tsx`
- 批次4：`use-pack-actions.ts`、`AssetCard.tsx`、`use-folder-navigation.ts`、
  `use-file-import.ts`
- 批次5：`AssetTagPicker.tsx`、`use-tag-navigation.ts`、
  `LibraryContentPanel.tsx`、`batch-progress-toast.tsx`、`export-drag.ts`——
  后两个是命令式调用（拖拽事件/toast custom render），不在 React 组件树里
  用不了 `useT()`，改用新导出的 `locale-context.tsx` 的 `readStoredLocale()`
  直接按当前 locale 查字典。`shared/lib/size-buckets.ts` 扫过确认
  `label` 是数字区间（"< 1 MB" 这类），不涉及语言，跳过不用改。

- 批次6：`feature-registry.tsx`+`SidebarNavItems.tsx`+`LibraryShell.tsx`——
  `FEATURES[].labelKey` 从"值就是中文本身"改成真正的字典 key
  （`feature-registry.i18n.ts`），三处消费方（`getFeature(x).labelKey`）
  统一改 `t(labelKey)`
- 批次7：`use-library-asset-actions.ts`——资产操作 hook（trash/restore/
  purge/move 单个+批量两套 toast 文案），跟 use-pack-actions.ts 一样是
  hook 内部直接调 `useT()`，不是命令式代码
- 批次8：`FolderTree.tsx`——标题行（文件夹计数/新建/全部展开/全部收起）
  +删除确认弹窗。顺带确认 `app/Sidebar.tsx` 之前的 ~21 行估算是误判：
  全是多行 JSX 注释的续行（没有 `//`/`*` 前缀，被旧 grep 规则漏判成真实
  字符串），实际零处需要改，从待办表移除，不用再排它的批次。
- 批次9：`SidebarLibraryMenu.tsx`——库名菜单（加载中占位/新建资源库/
  导出整库到电脑/导入文件/导入文件夹/导入分享包两种落点）

确认 `features/library/components/FolderTreeRow.tsx` 之前的 ~7 行
估算也是同一种误判（命中全是多行注释续行）：实际零处需要 i18n。这个
文件超 300 行硬上限是纯文件体积问题，跟 D6 无关，不用为了 i18n 去拆它，
从待办表移除。
- 批次10（最后一批）：`shared/dev/ComponentGallery.tsx`——仅开发环境
  可见的组件展示页，全部区块标题/演示文案/T6 临时链路测试 Section 收尾。

## 待办

无。D6 renderer i18n 接线全部完成，`grep -rl` 命中过、上面没单独列出
的其余文件抽查过都是纯注释（含常见的多行 JSX 注释续行误判），不用动。

## 注意事项

- hooks（`use-*.ts`）里的字符串大多是 `toast()` 调用的标题/描述——字典 key
  按语义命名（如 `deleteFailedTitle`），不要照抄变量名。
- `feature-registry.tsx` 的栏目标题是 D3 注册表的一部分，改的时候确认
  `SidebarNavItems.tsx`/`VIEW_TITLES` 这类消费方跟着换成 `t()`，不要留
  一半硬编码一半 i18n。
- 每批做完跑 `corepack pnpm typecheck && corepack pnpm lint && corepack pnpm test`，
  单独提交。
