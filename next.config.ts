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
      {
        protocol: "https",
        hostname: "pixabay.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking — no framing by anyone
          { key: "X-Frame-Options", value: "DENY" },

          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },

          // Limit referrer info sent to third parties
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          // Strip platform hint
          { key: "X-Powered-By", value: "" },

          // Permissions policy — disable features we don't use
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(self)",
          },

          // Content Security Policy
          // - default-src 'self': blocks all unexpected origins by default
          // - script-src: allows Next.js inline scripts (needed for hydration)
          // - style-src: allows Tailwind inline styles
          // - img-src: our CDN domains + data URIs for inline images
          // - connect-src: Paystack API + our own origin
          // - frame-ancestors 'none': belt-and-suspenders with X-Frame-Options
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://cdn.prod.website-files.com https://images.unsplash.com https://pixabay.com https://images.pexels.com https://res.cloudinary.com",
              "font-src 'self' data:",
              "connect-src 'self' https://api.paystack.co",
              "frame-src https://checkout.paystack.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },

          // HSTS — enforce HTTPS for 1 year (only meaningful in production,
          // harmless in development because browsers ignore it on localhost)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/_src/:path*",
        destination: "/404",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;