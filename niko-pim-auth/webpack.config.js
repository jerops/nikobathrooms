const path = require('path');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';
  const isProduction = argv.mode === 'production';
  
  // Load environment variables
  require('dotenv').config({
    path: path.resolve(__dirname, '.env.local')
  });

  // FIXED: Direct credential injection to ensure browser compatibility
  const environmentVars = {
    'process.env.NODE_ENV': JSON.stringify(argv.mode || 'development'),
    // HARDCODED CREDENTIALS TO BYPASS ENV VARIABLE ISSUES
    'process.env.SUPABASE_URL': JSON.stringify('https://bzjoxjqfpmjhbfijthpp.supabase.co'),
    'process.env.SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ0MDUyMjQsImV4cCI6MjAzOTk4MTIyNH0.p5eJJqvF_HhMAVkqpvpWp7Gqy2qEFnq6MfI_kD8DfJQ'),
    'process.env.WEBFLOW_SITE_ID': JSON.stringify('67378d122c9df01858dd36f6'),
    'process.env.WEBFLOW_RETAILERS_ID': JSON.stringify('6738c46e5f48be10cf90c694'),
    'process.env.WEBFLOW_CUSTOMERS_ID': JSON.stringify('68a6dc21ddfb81569ba773a4'),
    'process.env.WEBFLOW_PRODUCTS_ID': JSON.stringify('68976be7e5fd935483628fca')
  };

  console.log('🔧 Webpack Environment Variables:');
  console.log('- SUPABASE_URL: ✅ Hardcoded');
  console.log('- SUPABASE_ANON_KEY: ✅ Hardcoded');

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
      new webpack.DefinePlugin(environmentVars),
      new webpack.BannerPlugin({
        banner: `
Niko PIM Authentication System
Built: ${new Date().toISOString()}
Environment: ${argv.mode || 'development'}
Status: CREDENTIALS HARDCODED FOR INITIALIZATION FIX
`.trim()
      }),
      new webpack.ProvidePlugin({
        process: 'process/browser',
      })
    ],
    resolve: {
      extensions: ['.js', '.json'],
      fallback: {
        "path": false,
        "fs": false,
        "process": require.resolve("process/browser")
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