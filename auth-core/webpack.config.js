const path = require('path');

module.exports = {
  entry: './src/niko-auth-core.js',
  output: {
    filename: 'niko-auth-core.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'NikoAuthCore',
      type: 'window'
    },
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
  mode: 'production'
};