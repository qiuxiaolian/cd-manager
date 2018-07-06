// Copyright 2018 caicloud authors. All rights reserved

const path = require("path");
const webpack = require("webpack");
const HappyPack = require("happypack");
const os = require("os");
const MockProxyPlugin = require("./mock-proxy/index");
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });

const isRender = process.env.RENDER_DOM;

module.exports = {
  // 开启缓存。第一次编译会比较慢，之后编译速度非常快
  cache: true,
  // 开启源码 map 文件功能
  devtool: "cheap-module-source-map",
  // 本地开发时走 render.js, 跟 console-web 联调时走 index.js
  entry: {
    index: path.join(
      __dirname,
      `../src/js/${isRender === "true" ? "render" : "index"}.js`
    )
  },
  output: {
    path: path.join(__dirname, "../build"),
    libraryTarget: "amd",
    filename: "[name].js",
    chunkFilename: "[id].js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["happypack/loader?id=js"]
      },
      {
        test: /\.yml$/,
        loader: "yml-loader"
      },
      {
        test: /\.less$/,
        use: ["happypack/loader?id=less"]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.style$/,
        use: [
          "style-loader",
          "css-loader?modules&localIdentName=[name]__[local]-[hash:base64:5]"
        ]
      },
      {
        test: /\.(gif|jpg|png)\??.*$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10240,
              name: "img/[name].[ext]"
            }
          }
        ]
      }
    ]
  },
  resolve: {
    modules: [path.join(__dirname, "../src/js"), "node_modules"],
    extensions: [".js", ".json"]
  },
  plugins: [
    // mock proxy
    new MockProxyPlugin({
      config: {
        staticPath: path.join(__dirname, "../build"),
        viewPath: path.join(__dirname, "../page"),
        // 非 mock 时请求实际目标地址
        targetPrefix: process.env.TARGET_PREFIX,
        // 匹配规则: 匹配到的 url 将转发至 targetPrefix
        targetProxyRule: url => url.includes("/api")
      },
      mockDir: `${__dirname}/../mock/`,
      port: 9000
    }),

    // 定义变量
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        X_MODULE: JSON.stringify(process.env.X_MODULE)
      }
    }),
    // 别名
    new webpack.ProvidePlugin({
      _: "lodash",
      React: "react",
      ReactDOM: "react-dom"
    }),
    // 采用 dll，加快编译速度
    new webpack.DllReferencePlugin({
      name: "common",
      context: path.join(__dirname, "../build/"),
      manifest: require("../build/common-manifest.json")
    }),
    // 采用 dll，加快编译速度
    new webpack.DllReferencePlugin({
      name: "react",
      context: path.join(__dirname, "../build/"),
      manifest: require("../build/react-manifest.json")
    }),
    // 开发环境下设置文件路径为 ModuleID
    new webpack.NamedModulesPlugin(),
    // 对 js、less 采取多进程编译
    new HappyPack({
      id: "js",
      threadPool: happyThreadPool,
      threads: 4,
      loaders: ["babel-loader?cacheDirectory=true"]
    }),
    new HappyPack({
      id: "less",
      threadPool: happyThreadPool,
      threads: 4,
      loaders: ["style-loader", "css-loader", "less-loader"]
    })
  ]
};
