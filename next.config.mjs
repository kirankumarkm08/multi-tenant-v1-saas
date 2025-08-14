/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!base || !base.startsWith("https://")) {
      throw new Error("NEXT_PUBLIC_API_BASE_URL must be set to an HTTPS URL");
    }
    return [
      {
        source: "/api/:path*",
        destination: `${base}/:path*`,
      },
    ];
  },
};

export default nextConfig;
