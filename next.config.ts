import type { NextConfig } from "next";
import { noindexHeaders } from "./src/lib/seo";

const nextConfig: NextConfig = {
  // Keep student plans (names in the title) and preview fixtures out of search results (src/lib/seo.ts).
  async headers() {
    return noindexHeaders();
  },
};

export default nextConfig;
