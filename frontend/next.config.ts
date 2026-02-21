import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: [
    "@fullcalendar/core",
    "@fullcalendar/react",
    "@fullcalendar/daygrid",
    "@fullcalendar/list",
    "@fullcalendar/interaction",
    "@fullcalendar/timegrid",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  webpack(config) {
    // No-op FullCalendar's JS-based CSS injection (we use static CSS instead).
    // FullCalendar v6 tries to inject CSS via sheet.insertRule() at module
    // evaluation time, which crashes in Next.js (sheet is null during SSR).
    config.module.rules.push({
      test: /internal-common\.(js|cjs)$/,
      include: /@fullcalendar[\\/]core/,
      enforce: "pre" as const,
      use: [
        path.join(process.cwd(), "fullcalendar-css-noop-loader.js"),
      ],
    });
    return config;
  },
};

export default nextConfig;
