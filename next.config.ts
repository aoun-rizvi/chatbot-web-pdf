import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            // Keep your existing policy pieces; ensure img-src allows blob: and data:
            value: [
              "default-src 'self'",
              "img-src 'self' blob: data: https:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "connect-src 'self' https:",
              "font-src 'self' data:",
              "media-src 'self' blob: data:",
              "object-src 'none'",
              "base-uri 'self'",
              "frame-ancestors 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
