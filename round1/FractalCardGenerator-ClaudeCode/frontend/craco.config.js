module.exports = {
  // CRACO configuration to allow TypeScript 5 with react-scripts 5.0.1
  webpack: {
    configure: (webpackConfig) => {
      return webpackConfig;
    }
  },
  typescript: {
    enableTypeChecking: true
  }
};
