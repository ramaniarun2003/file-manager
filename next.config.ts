const nextConfig = {
  output: 'export',
  trailingSlash: true,
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.tsx',
      },
    },
  },
};
export default nextConfig;