const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    'view-transitions': './src/view-transitions.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].min.js',
    clean: true,
    library: {
      name: 'NikoBathroomsViewTransitions',
      type: 'umd',
      export: 'default'
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'view-transitions.min.css'
    })
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      })
    ]
  }
};