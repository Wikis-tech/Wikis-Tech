import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin-wikis",
        permanent: false,
      },
      {
        source: "/admin/:path*",
        destination: "/admin-wikis/:path*",
        permanent: false,
      },
      {
        source: "/admin-wikis/dashboard",
        destination: "/admin-wikis",
        permanent: false,
      },
      {
        source: "/admin-wikis/home",
        destination: "/admin-wikis/pages/home",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
