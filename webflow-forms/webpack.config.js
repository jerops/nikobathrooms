const path = require('path');

module.exports = {
  entry: './src/niko-webflow-forms.js',
  output: {
    filename: 'niko-webflow-forms.min.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'NikoWebflowForms',
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