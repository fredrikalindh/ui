import { createMDX } from 'fumadocs-mdx/next';

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Dedupe jotai to prevent multiple instances
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'jotai': require.resolve('jotai'),
      };
    }
    return config;
  },
};

const withMDX = createMDX({
  // customise the config file path
  // configPath: "source.config.ts"
});

export default withMDX(config);