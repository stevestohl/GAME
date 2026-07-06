import path from 'path'
import { fileURLToPath } from 'url'
import webpack from 'webpack'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const config = {
    entry: {
        employees: './src/employees.jsx',
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'public'),
    },
    // Allows you to leave off .js and .jsx extensions when importing files
    resolve: {
        extensions: ['.js', '.jsx'],
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',                
            },
            {
                // Handles image files
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                // Handles video and audio files (including your new logo!)
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/media/[name].[hash:8][ext]'
                }
            },
        ],
    },
    optimization: {
        splitChunks: {
            name: 'vendor',
            chunks: 'all',
        },
    },
    devtool: 'source-map'
}

// Webpack passes the environment variables and CLI arguments (argv) here
export default function(env, argv) {
    // Dynamically checks if '--mode production' was passed in the terminal script
    if (argv.mode === 'production') {
        config.mode = 'production'
    } else {
        config.mode = 'development'
    }
    return config
}