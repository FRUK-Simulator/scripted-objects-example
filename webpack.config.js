const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = env => {
  console.log("Webpack build env:", env);

  let mode = env && env.production ? 'production' : 'development';
  let devtool = env && env.production ? false : 'inline-source-map';

  console.log("mode:", mode);
  console.log("Devtool:", devtool);

  return {
    entry: './src/index.ts',
    mode: mode,
    devtool: devtool,
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.ttf$/,
          use: ['file-loader'],
        },
      ]
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'static/dist'),
    },
    publicPath: 'dist/',
    devServer: {
      writeToDisk: true,
      contentBase: path.resolve(__dirname, 'static'),
      compress: true,
      port: 8080,
      hot: true,
      overlay: true
    },
    plugins: [
      new MonacoWebpackPlugin({publicPath: 'dist/', languages: ['javascript']})
    ]
  };
};
