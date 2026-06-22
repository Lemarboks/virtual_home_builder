import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  output: 'export',
  // GitHub Pages serves the app at /virtual_home_builder/ for this repo
  basePath: isProd ? '/virtual_home_builder' : '',
  assetPrefix: isProd ? '/virtual_home_builder/' : '',
  trailingSlash: true,
  images: { unoptimized: true },
}

export default nextConfig
