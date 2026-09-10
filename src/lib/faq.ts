export interface FaqItem {
  question: string;
  answer: string;
}

export const faqs: FaqItem[] = [
  {
    question: "现在可以下载 Soniva 桌面端吗？",
    answer:
      "还不能。首个内测版本正在做签名、公证与安装包验证，产物尚未上传到 Releases，下载入口暂时保持「即将发布」状态。",
  },
  {
    question: "支持哪些操作系统？",
    answer:
      "首发计划支持 macOS，覆盖 Apple Silicon 与 Intel 两种架构。Windows 版本仍在规划中。",
  },
  {
    question: "安装时提示「来自身份不明的开发者」怎么办？",
    answer:
      "正式产物会经过 Developer ID 签名与 Apple 公证，正常安装不会出现该提示。如果遇到拦截，说明该产物尚未完成公证，请勿使用，等待正式版本。",
  },
  {
    question: "桌面端和网页版是什么关系？",
    answer:
      "两者共用同一套账号、云端服务与设计系统。桌面端额外提供本地资源库、素材预览、分享包等桌面能力，并内置自动更新。",
  },
  {
    question: "以后需要手动重新下载新版本吗？",
    answer:
      "不需要。桌面端已内置自动更新，正式发布后新版本会在应用内提示，确认后即可一键重启完成更新。",
  },
];
