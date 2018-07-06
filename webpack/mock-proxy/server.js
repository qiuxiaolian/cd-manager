// CopyRight 2018 caicloud authors. All rights reserved

const express = require("express");
const pathToRegexp = require("path-to-regexp");
const bodyParser = require("body-parser");
const request = require("request");

// Decode param value.
function decode_param(val) {
  if (typeof val !== "string" || val.length === 0) {
    return val;
  }
  try {
    return decodeURIComponent(val);
  } catch (err) {
    return undefined;
  }
}

// 匹配 params
function getParams(match, keys) {
  const params = {};
  for (let i = 1; i < match.length; i++) {
    const key = keys[i - 1];
    const prop = key.name;
    const val = decode_param(match[i]);

    if (
      val !== undefined ||
      !Object.prototype.hasOwnProperty.call(params, prop)
    ) {
      params[prop] = val;
    }
  }
  return params;
}

/**
 * 匹配路由 并获取 params
 * @param {object} actions 路由集合
 * @param {string} actionKey 当前路由 key
 */
function matchAction(actions, actionKey) {
  const result = { params: {}, act: null };
  Object.keys(actions).forEach(act => {
    const keys = [];
    const regexp = pathToRegexp(act, keys);
    const match = regexp.exec(actionKey);
    if (match) {
      result.params = getParams(match, keys);
      result.act = act;
    }
  });
  return result;
}

// 用于处理 mock 数据的 express 实例
module.exports = function({ config, port = 9001 }) {
  // 判断配置信息存在
  if (config) {
    const app = express();
    const staticPath = config.staticPath;

    app.use(bodyParser.json({ limit: "5mb" }));
    app.use(bodyParser.urlencoded({ limit: "5mb", extended: false }));

    if (staticPath instanceof Array) {
      staticPath.forEach(path => {
        app.use(express.static(path));
      });
    } else if (staticPath) {
      app.use(express.static(staticPath));
    }

    app.set("views", config.viewPath);
    app.engine("html", require("ejs").renderFile);
    app.set("view engine", "html");

    app.use(async function(req, res, next) {
      req.config = config;
      next();
    });

    app.use(async function(req, res, next) {
      console.info(req.method, req.originalUrl);
      next();
    });

    app.use(async function(req, res, next) {
      if (
        req.config.targetPrefix &&
        req.config.targetProxyRule(req.originalUrl)
      ) {
        const targetUrl = `${req.config.targetPrefix}${req.originalUrl}`;
        console.info("[Proxy]: ", targetUrl);
        const proxy = request(targetUrl);
        req.pipe(proxy);
        return proxy.pipe(res);
      }
      next();
    });

    // 用中间件处理所有请求
    app.use(async function(req, res, next) {
      const config = req.config;
      const actionKey = `${req.method} ${req.path}`;
      const { params, act } = matchAction(config.actions, actionKey);
      const action = act && config.actions[act];

      // 判断请求的接口在配置中
      if (action && typeof action === "object") {
        // 对象类型直接以 JSON 返回
        return res.json(action);
      } else if (typeof action === "function") {
        // 支持自定义处理 action
        req.params = Object.assign({}, req.param, params);
        return await action(req, res);
      }
      next();
    });

    app.get("*", (req, res) => {
      res.render("index");
    });

    // 启动server
    const server = app.listen(port, function() {
      const host = server.address().address;
      const port = server.address().port;
      console.info("Mock server listening at http://%s:%s", host, port);
    });
  } else {
    console.info("No Config File!");
  }
};
