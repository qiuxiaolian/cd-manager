// CopyRight 2018 caicloud authors. All rights reserved

const server = require("./server.js");
const actions = require("./actions");

// 用于 server mock 的中间件

function MockProxyPlugin(options) {
  const { config, mockDir } = options;
  actions.readMockData(mockDir); // 读取 mock 路由配置
  this.options = options;
  this.options.config = Object.assign({}, config, { actions: actions.actions });
}

MockProxyPlugin.prototype.apply = function(compiler) {
  server(this.options);

  compiler.plugin("emit", (compilation, callback) => {
    callback();
  });
};

module.exports = MockProxyPlugin;
