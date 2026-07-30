/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { webpack }) => {
    // RainbowKit's default connectors pull in @coinbase/cdp-sdk, which imports
    // optional @x402/* payment modules we never use. Ignore them so the build
    // doesn't fail trying to resolve those unshipped submodules.
    config.plugins.push(
      new webpack.IgnorePlugin({ resourceRegExp: /^@x402(\/|$)/ })
    );
    return config;
  },
};

module.exports = nextConfig;
