import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "export",
  outputFileTracingRoot: path.join(__dirname),
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
