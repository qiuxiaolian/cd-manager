// Copyright 2017 caicloud authors. All rights reserved.

/**
 * webpack dll 编译文件
 * 本地开发的时候，开启 dll 编译方式，可以加快每次的 build 时间
 * dll 里可以存放各类公共库，比如 React，Redux-form.
 * 如果 common 文件非常大，可以切分成多个模块，参考 console-web
 * 注意：dll 里定义的文件列表需要和 prod.js 里 common 里定义的保持一致。
 */
const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: {
    react: ["react", "react-dom", "react-redux", "react-router"],
    common: ["moment", "lodash"]
  },
  module: {
    rules: [
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
  output: {
    path: path.join(__dirname, "../build"),
    filename: "[name].js",
    library: "[name]"
  },
  resolve: {
    modules: ["node_modules"]
  },
  node: {
    fs: "empty"
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, "../build/[name]-manifest.json"),
      name: "[name]",
      context: path.join(__dirname, "../build")
    }),
    // 开发环境下设置文件路径为 ModuleID
    new webpack.NamedModulesPlugin(),
    new webpack.ProvidePlugin({
      _: "lodash",
      React: "react",
      ReactDOM: "react-dom"
    })
  ]
};
