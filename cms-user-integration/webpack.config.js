const path = require('path');

module.exports = {
  entry: './src/niko-cms-integration.js',
  output: {
    filename: 'niko-cms-integration.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'NikoCMSIntegration',
    libraryTarget: 'umd',
    globalObject: 'this',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  optimization: {
    minimize: true
  }
};