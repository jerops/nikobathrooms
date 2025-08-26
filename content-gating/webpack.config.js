const path = require('path');

module.exports = {
  entry: './src/niko-content-gating.js',
  output: {
    filename: 'niko-content-gating.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'NikoContentGating',
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
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'test')
    },
    compress: true,
    port: 8001,
    open: true
  }
};