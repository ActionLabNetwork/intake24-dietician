const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const WebpackBar = require('webpackbar')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const Dotenv = require('dotenv-webpack')
const path = require('path')

module.exports = {
  context: __dirname, // to automatically find tsconfig.json
  entry: './src/app.ts',
  mode: 'development',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: './tsconfig.json',
        logLevel: 'info',
        logInfoToStdOut: true,
        extensions: ['.ts'],
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        // add transpileOnly option if you use ts-loader < 9.3.0
        // options: {
        //   transpileOnly: true
        // }
      },
    ],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new WebpackBar({ name: 'Api Server' }),
    new Dotenv({ path: '.env.development' }),
  ],
  target: 'node',
  externals: [nodeExternals()],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 9000,
  },
}
