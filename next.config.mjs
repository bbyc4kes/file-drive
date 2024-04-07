/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: `${process.env.CONVEX_URL_DOMAIN}`,
      },
    ],
  },
}

export default nextConfig
