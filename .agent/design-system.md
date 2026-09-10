# 组件与 UI 设计系统规范 (.agent/design-system.md)

> 与 Soniva 主产品（`web/`）设计系统保持一致：暗色优先、语义化 HSL/oklch Token、RemixIcon。

## 1. 视觉美学与主题 Token

- **颜色体系**：统一使用语义化 Token（`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`），**严禁硬编码颜色**（如 `bg-[#121212]`, `text-black`, `bg-white`）。
- **主题切换**：通过 `<html data-theme="dark|light">` 切换，Token 定义在 `src/app/globals.css`，与主产品同名同值。
- **极简与质感**：卡片/弹层使用克制的玻璃拟态与柔和描边；主按钮使用品牌前景色，避免刺眼纯红（危险操作除外）。
- **间距与圆角**：圆角统一 `rounded-lg` / `rounded-xl` / `rounded-full`，遵守现代 App 精致标准。
- **默认暗色**：首屏默认 `dark`，跟随用户上次选择（localStorage），无选择时跟随系统。

## 2. 图标规范 (Icon System)

- 统一使用 `@remixicon/react`（业务/展示）与 `lucide-react`（基础组件，如需要）。
- 尺寸用样式类（`w-4 h-4` / `w-5 h-5`），**严禁** `style={{ width: 18 }}`。
- 常用：下载 `<RiDownloadLine />`、苹果 `<RiAppleFill />`、检查 `<RiCheckLine />`、时间 `<RiHistoryLine />`。

## 3. 组件选型绝对优先级

编写任何界面时，严格按以下顺序：

1. **第一选择**：`src/components/ui/` 下已有的 shadcn 风格组件（`Button`, `Badge`, `Card` 等）。
2. **第二选择**：基于已有组件组合封装（如 `Button` + `Badge` 组合成下载卡片）。
3. **第三选择**：自定义组件，样式必须完全对齐 Token（`bg-card`, `border-border`, `ring-ring`）。

🚨 **严禁**直接使用原生 `<select>` / 裸 `<button>` / 裸 `<input>` 承担主要交互样式。

## 4. 主题适配 (Dark Mode) 铁律

- 编写或修改组件时，**绝对禁止写死硬编码颜色**。
- 必须使用语义化变量类名：
  - 背景容器：`bg-background` / `bg-card` / `bg-muted` / `bg-popover`
  - 文本前景：`text-foreground` / `text-muted-foreground` / `text-primary`
  - 边框环影：`border-border` / `ring-ring`
- 新组件交付前自检：**"该组件在 light / dark 两种模式下是否有色差或背景断层？"**

## 5. 样式被覆盖时的强制排查 SOP（禁止假修改）

当样式未生效或被覆盖时，严禁盲目叠加 `!important`，必须按序诊断：

1. **全局层**：检查 `src/app/globals.css` 的 `@import`、Tailwind 指令与变量定义是否有冲突。
2. **配置层**：检查 Tailwind 4 的 `@theme inline` 是否把新变量正确映射为工具类。
3. **父级层**：确认父容器是否设置了覆盖性的 `color` / `background`。

## 6. 无障碍与响应式

- 交互元素必须有可见 focus 态（`focus-visible:ring-2 ring-ring`）。
- 正文与背景对比度满足 WCAG AA；`<html lang="zh-CN">`。
- 移动端优先，断点至少覆盖 `sm` / `md` / `lg`；下载卡片在窄屏纵向堆叠。
