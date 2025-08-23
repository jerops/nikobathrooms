const path = require('path');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';
  const isProduction = argv.mode === 'production';
  
  // Load environment variables
  require('dotenv').config({
    path: path.resolve(__dirname, '.env.local')
  });

  // Define environment variables for injection
  const environmentVars = {
    'process.env.NODE_ENV': JSON.stringify(argv.mode || 'development'),
    'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL || 'https://bzjoxjqfpmjhbfijthpp.supabase.co'),
    'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ0MDUyMjQsImV4cCI6MjAzOTk4MTIyNH0.p5eJJqvF_HhMAVkqpvpWp7Gqy2qEFnq6MfI_kD8DfJQ'),
    'process.env.WEBFLOW_SITE_ID': JSON.stringify(process.env.WEBFLOW_SITE_ID || '67378d122c9df01858dd36f6'),
    'process.env.WEBFLOW_RETAILERS_ID': JSON.stringify(process.env.WEBFLOW_RETAILERS_ID || '6738c46e5f48be10cf90c694'),
    'process.env.WEBFLOW_CUSTOMERS_ID': JSON.stringify(process.env.WEBFLOW_CUSTOMERS_ID || '68a6dc21ddfb81569ba773a4'),
    'process.env.WEBFLOW_PRODUCTS_ID': JSON.stringify(process.env.WEBFLOW_PRODUCTS_ID || '68976be7e5fd935483628fca'),
    // Also provide fallback globals for browser compatibility
    'typeof process': JSON.stringify('object'),
    'process': JSON.stringify({
      env: {
        NODE_ENV: argv.mode || 'development',
        SUPABASE_URL: process.env.SUPABASE_URL || 'https://bzjoxjqfpmjhbfijthpp.supabase.co',
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ0MDUyMjQsImV4cCI6MjAzOTk4MTIyNH0.p5eJJqvF_HhMAVkqpvpWp7Gqy2qEFnq6MfI_kD8DfJQ',
        WEBFLOW_SITE_ID: process.env.WEBFLOW_SITE_ID || '67378d122c9df01858dd36f6',
        WEBFLOW_RETAILERS_ID: process.env.WEBFLOW_RETAILERS_ID || '6738c46e5f48be10cf90c694',
        WEBFLOW_CUSTOMERS_ID: process.env.WEBFLOW_CUSTOMERS_ID || '68a6dc21ddfb81569ba773a4',
        WEBFLOW_PRODUCTS_ID: process.env.WEBFLOW_PRODUCTS_ID || '68976be7e5fd935483628fca'
      }
    })
  };

  console.log('🔧 Webpack Environment Variables:');
  console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Loaded' : '❌ Missing');
  console.log('- SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Loaded' : '❌ Missing');

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
      new webpack.DefinePlugin(environmentVars),
      new webpack.BannerPlugin({
        banner: `
Niko PIM Authentication System
Built: ${new Date().toISOString()}
Environment: ${argv.mode || 'development'}
Supabase URL: ${process.env.SUPABASE_URL || 'https://bzjoxjqfpmjhbfijthpp.supabase.co'}
`.trim()
      }),
      // Additional plugin to ensure process is available
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