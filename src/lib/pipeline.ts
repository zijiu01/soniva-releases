export type PipelineState = "done" | "active" | "pending";

export interface PipelineStep {
  id: string;
  label: string;
  detail: string;
  state: PipelineState;
}

/**
 * 构建与发布流水线状态。数据必须与 .agent/STATUS.md 保持一致，
 * 产物未真正上传前，"上传 Releases" 一律保持 pending。
 */
export const pipeline: PipelineStep[] = [
  {
    id: "build",
    label: "编译打包",
    detail: "主进程、渲染进程与静态资源已打入应用",
    state: "done",
  },
  {
    id: "sign",
    label: "代码签名",
    detail: "Developer ID 签名通过",
    state: "done",
  },
  {
    id: "notarize",
    label: "Apple 公证",
    detail: "arm64 与 x64 均通过",
    state: "done",
  },
  {
    id: "dmg",
    label: "安装包生成",
    detail: "双架构 DMG 生成与命名校验中",
    state: "active",
  },
  {
    id: "verify",
    label: "Gatekeeper 验证",
    detail: "安装包放行校验",
    state: "pending",
  },
  {
    id: "publish",
    label: "上传 Releases",
    detail: "尚未上传任何产物",
    state: "pending",
  },
];
