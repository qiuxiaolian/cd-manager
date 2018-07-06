// CopyRight 2018 caicloud authors. All rights reserved

const fs = require("fs");

// mock 路由集合
const actions = {};

// TODO: 支持 mock 热更新
function readMockData(mockDir) {
  fs.readdir(mockDir, function(err, files) {
    // 遍历 js 文件
    const mods = files.filter(file => /(.*?)\.js/.test(file));
    mods.forEach(o => {
      const action = require(`${mockDir}/${o}`);
      for (const actionType in action) {
        actions[actionType] = action[actionType];
      }
    });
  });
}

module.exports = {
  readMockData,
  actions
};
