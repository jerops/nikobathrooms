const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/niko-pim-authentication-system.js',
    output: {
        filename: 'niko-pim.min.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'NikoPIM',
        libraryTarget: 'window'
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.SUPABASE_URL': JSON.stringify('https://bzjoxjqfpmjhbfijthpp.supabase.co'),
            'process.env.SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQzMjU1MjYsImV4cCI6MjAzOTkwMTUyNn0.VzKWLBXzfTJvWMfN4_5l5Y3R9fW4O9K6M7xZQqbN5zI')
        })
    ],
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
    mode: 'production'
};