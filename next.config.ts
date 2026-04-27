import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.prod.website-files.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Basic security headers
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          // Remove obvious platform hints
          { key: "X-Powered-By", value: "" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // Force 404 for /_src and anything inside it
      {
        source: "/_src/:path*",
        destination: "/404",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;