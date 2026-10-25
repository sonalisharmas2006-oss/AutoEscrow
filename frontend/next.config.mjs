// Render must supply the public backend origin during its static build.
if (process.env.RENDER) {
  const api = new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost");
  if (api.protocol !== "https:" || api.username || api.password || /localhost|127\.0\.0\.1/.test(api.hostname)) {
    throw new Error("Set NEXT_PUBLIC_API_URL to the deployed HTTPS API origin without credentials before building on Render");
  }
}
/** @type {import('next').NextConfig} */
const nextConfig = {
  // The frontend is client-side API driven, so it can be served as a static
  // site while the FastAPI service owns all persisted state.
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
