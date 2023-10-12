const path = require("path");
const webpack = require("webpack");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  entry: "./src/index.js",

  output: {
    path: path.join(__dirname, "/dist"),
    filename: "bundle.js",
  },

  module: {
    rules: [
      {
        test: /\.js|\.jsx|\.json$/, //kind of file extension this rule should look for and apply in test
        exclude: /node_modules/, //folder to be excluded
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: "./src/index.html",
      favicon: "./src/favicon/icon.ico",
    }),
    new webpack.ProvidePlugin({
      process: "process/browser",
    }),
    new webpack.DefinePlugin({
      "process.env": JSON.stringify(process.env),
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
  devServer: {
    port: 1234,
    https: false,
  },
  resolve: {
    fallback: {
      os: false,
      crypto: false,
      stream: false,
      buffer: false,
    },
    alias: {
      process: "process/browser",
    },
  },
};
