// next.config.js
module.exports = {
  async rewrites() {
    const base =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://165.227.182.17/api";
    return [
      {
        source: "/api/:path*",
        destination: `${base}/:path*`,
      },
    ];
  },
};
