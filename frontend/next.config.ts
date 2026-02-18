import type { NextConfig } from "next";

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
};

export default nextConfig;
