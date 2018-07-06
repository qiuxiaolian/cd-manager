const WebpackDevServer = require("webpack-dev-server");
const webpack = require("webpack");
const webpackConfig = require("./dev");
const path = require("path");
const MockProxyPlugin = require("./mock-proxy/index");

// mockServer 中间件
webpackConfig.plugins.push(
  new MockProxyPlugin({
    config: {
      staticPath: path.join(__dirname, "../build"),
      viewPath: path.join(__dirname, "../page")
    },
    mockDir: `${__dirname}/../mock/`,
    port: 9001
  })
);

new WebpackDevServer(webpack(webpackConfig), {
  proxy: {
    "*": "http://localhost:9001"
  }
}).listen(9000, "localhost", err => {
  if (err) {
    // eslint-disable-next-line no-console
    return console.log(err);
  }
  // eslint-disable-next-line no-console
  console.info("webpack dev server listening at http://localhost:3030/");
});
