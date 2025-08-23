const path = require('path');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';
  const isProduction = argv.mode === 'production';
  
  // Load environment variables
  require('dotenv').config({
    path: path.resolve(__dirname, '.env.local')
  });

  return {
    entry: {
      'niko-pim': './src/index.js',
      'niko-pim-webflow': './src/webflow-integration.js'
    },
    output: {
      filename: isDevelopment ? '[name].js' : '[name].min.js',
      path: path.resolve(__dirname, 'dist'),
      library: {
        name: '[name]',
        type: 'umd'
      },
      globalObject: 'this',
      clean: true // Clean dist folder before each build
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: {
                    browsers: ['> 1%', 'last 2 versions']
                  }
                }]
              ]
            }
          }
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        // Environment variables for browser
        'process.env.NODE_ENV': JSON.stringify(argv.mode || 'development'),
        'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL || ''),
        'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY || ''),
        'process.env.WEBFLOW_SITE_ID': JSON.stringify(process.env.WEBFLOW_SITE_ID || ''),
        'process.env.WEBFLOW_RETAILERS_ID': JSON.stringify(process.env.WEBFLOW_RETAILERS_ID || ''),
        'process.env.WEBFLOW_CUSTOMERS_ID': JSON.stringify(process.env.WEBFLOW_CUSTOMERS_ID || ''),
        'process.env.WEBFLOW_PRODUCTS_ID': JSON.stringify(process.env.WEBFLOW_PRODUCTS_ID || '')
      }),
      new webpack.BannerPlugin({
        banner: `
Niko PIM Authentication System
Built: ${new Date().toISOString()}
Environment: ${argv.mode || 'development'}
`.trim()
      })
    ],
    resolve: {
      extensions: ['.js', '.json'],
      fallback: {
        "path": false,
        "fs": false
      }
    },
    mode: argv.mode || 'development',
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',
    optimization: {
      minimize: isProduction
    },
    performance: {
      hints: isProduction ? 'warning' : false,
      maxAssetSize: 250000,
      maxEntrypointSize: 250000
    },
    devServer: {
      static: {
        directory: path.join(__dirname),
      },
      compress: true,
      port: 9000,
      open: true,
      hot: true,
      historyApiFallback: true
    }
  };
};