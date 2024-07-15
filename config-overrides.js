const { override, fixBabelImports, addWebpackPlugin } = require('customize-cra');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// module.exports = function override(config, env) {
//   // do stuff with the webpack config...
//   return config;
// };

module.exports = override(
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: 'css',
  }),
  addWebpackPlugin(new CompressionPlugin({
    algorithm: 'gzip',    
    test: new RegExp('\\.(js|css)$'),
    threshold: 10240, 
    minRatio: 0.8
  })),
  addWebpackPlugin(new CopyWebpackPlugin([
    {
      from: 'node_modules/pdfjs-dist/cmaps/',
      to: 'cmaps/'
    },
  ])),
);

