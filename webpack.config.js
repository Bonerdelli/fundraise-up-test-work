const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Vocabularity Trainer',
      template: 'src/index.html',
    }),
  ],
  module: {
    rules: [{
      test: /\.(?:ts)$/,
      exclude: /node_modules/,
      use: [{
        loader: "babel-loader",
        options: {
          presets: [
            ['@babel/preset-typescript'],
          ],
        },
      }],
    }],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devServer: {
    hot: true,
  },
};
