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
            'process.env.SUPABASE_URL': JSON.stringify(process.env.SUPABASE_URL || 'https://bzjoxjqfpmjhbfijthpp.supabase.co'),
            'process.env.SUPABASE_ANON_KEY': JSON.stringify(process.env.SUPABASE_ANON_KEY || '')
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