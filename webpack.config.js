const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Vocabularity Trainer',
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
            ['@babel/preset-typescript']
          ]
        }
      }]
    }],
  },
  devServer: {
    hot: true,
  },
};
