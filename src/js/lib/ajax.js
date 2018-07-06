// Copyright 2017 caicloud authors. All rights reserved.

import { JSONToQueryString } from "./util";
import "whatwg-fetch";

/**
 * http method option
 * @type {Object}
 */
export const optionMap = {
  get: {
    method: "GET",
    mode: "cors",
    cache: "default",
    credentials: "include"
  },
  post: {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    },
    credentials: "include"
  },
  put: {
    method: "PUT",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    },
    credentials: "include"
  },
  patch: {
    method: "PATCH",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    },
    credentials: "include"
  },
  delete: {
    method: "DELETE",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
    },
    credentials: "include"
  },
  upload: {
    method: "POST",
    credentials: "include"
  }
};

export function ajax(type, o, options) {
  if (!o.isOrigin) {
    options.headers = Object.assign({}, options.headers, {
      "X-Module": process.env.X_MODULE
    });
  } else if (options.headers && options.headers["X-Module"]) {
    options.headers["X-Module"] = undefined;
  }
  return fetch(o.url, options)
    .then(response => {
      const clone = response.clone();

      // 登录过期
      // if (clone.status === 401) {
      //   window.location.href = "/logout";
      //   return;
      // }

      // 状态码 204 的时候，没有 body 内容，clone.json() 会报错。
      if (clone.status === 204 || clone.statusText === "No Content") {
        o.success();
      } else {
        console.log(clone);
        clone.json().then(data => {
          // 2xx 统一认为是请求成功了。
          if (clone.status >= 200 && clone.status < 300) {
            o.success(data);
          }
        });
      }

      return Promise.resolve(response);
    })
    .catch(error => {
      // 这里的错误，是未知错误，非后端接口的错误，也不是 Nodejs 的报错。
      console.error("FETCH CATCH ERROR", error);
    });
}

export function get(o) {
  const ajaxObj = o;
  if (!_.isEmpty(ajaxObj.data)) {
    ajaxObj.url +=
      (ajaxObj.url.indexOf("?") === -1 ? "?" : "&") +
      JSONToQueryString(ajaxObj.data);
  }
  return ajax("get", ajaxObj, optionMap.get);
}

export function post(o) {
  const options = optionMap.post;
  options.body = JSONToQueryString(o.data);
  return ajax("post", o, options);
}

export function put(o) {
  const options = optionMap.put;
  options.body = JSONToQueryString(o.data);
  return ajax("put", o, options);
}

export function patch(o) {
  const options = optionMap.patch;
  options.body = JSONToQueryString(o.data);
  return ajax("patch", o, options);
}

export function remove(o) {
  const options = optionMap.delete;
  options.body = JSONToQueryString(o.data);
  return ajax("delete", o, options);
}

export function upload(o) {
  const options = optionMap.upload;
  options.body = o.data;
  return ajax("upload", o, options);
}
