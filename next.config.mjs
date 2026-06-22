/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  // GitHub Pages project repos are served at /{repoName}/
  // Set NEXT_PUBLIC_BASE_PATH="" for a custom domain or user/org page.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  images: {
    // next/image optimisation requires a server; disable for static export
    unoptimized: true,
  },
};

export default nextConfig;
