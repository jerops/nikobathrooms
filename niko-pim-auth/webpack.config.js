const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'niko-pim.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'NikoPIM',
    libraryTarget: 'umd',
    globalObject: 'this'
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
  mode: 'development'
};