const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");

module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: "./src/index.jsx",
  output: {
    path: path.resolve(__dirname, "build"),
    filename:
      process.env.NODE_ENV === "production"
        ? "[name].[contenthash:8].js"
        : "[name].js",
    chunkFilename:
      process.env.NODE_ENV === "production"
        ? "[name].[contenthash:8].chunk.js"
        : "[name].chunk.js",
    clean: true,
    publicPath: "/",
  },
  optimization: {
    minimize: process.env.NODE_ENV === "production",
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          priority: 10,
          reuseExistingChunk: true,
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
          name: "common",
        },
      },
    },
    runtimeChunk: process.env.NODE_ENV === "production" ? "single" : false,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: { loader: "babel-loader" },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: "asset/resource",
      },
    ],
  },
  resolve: { extensions: [".js", ".jsx"] },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      publicPath: "/",
    }),
  ],
  devServer: {
    static: [
      path.join(__dirname, "public"),
      path.join(__dirname, "build"),
    ],
    historyApiFallback: true,
    port: 3000,
    compress: true,
    client: {
      overlay: true,
      progress: true,
    },
    proxy: [
      {
        context: ["/api"],
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    ],
  },
};
