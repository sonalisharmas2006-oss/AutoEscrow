const backend = (process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "https://autoescrow-api-zaa0.onrender.com").replace(/\/+$/, "");
const apiBaseUrl = backend.endsWith("/api/v1") ? backend : `${backend}/api/v1`;

if (process.env.RENDER) {
  const api = new URL(apiBaseUrl);
  if (api.protocol !== "https:" || api.username || api.password || /localhost|127\.0\.0\.1/.test(api.hostname)) {
    throw new Error("Set API_BASE_URL to the deployed HTTPS API origin without credentials before building on Render");
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    API_BASE_URL: apiBaseUrl,
    NEXT_PUBLIC_API_BASE_URL: apiBaseUrl,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
