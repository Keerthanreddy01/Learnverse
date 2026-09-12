/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: [
      'msedge-tts',
      'ws',
      'isomorphic-ws',
      'fluent-ffmpeg',
      'ffmpeg-static',
      'sharp',
      'pdf-parse',
    ],
  },
}

export default nextConfig
