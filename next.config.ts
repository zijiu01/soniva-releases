import type { NextConfig } from "next";

// GitHub Pages 项目站点部署在 https://<user>.github.io/<repo>/，
// 需要在构建时注入 basePath；自定义域名或 user 站点留空即可。
// 用法：NEXT_PUBLIC_BASE_PATH=/soniva-releases pnpm build
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: basePath || undefined,
  images: { unoptimized: true },
};

export default nextConfig;
