import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOTE: do NOT add a turbopack rule for "*.css" pointing at
  // "@tailwindcss/turbopack". Tailwind v4 already hooks in via
  // `@import "tailwindcss"` in globals.css — that rule crashes `next dev`
  // with `require() of ES Module .../magic-string/dist/index.mjs`.
  cacheComponents: false,
};

export default nextConfig;
