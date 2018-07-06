import * as ajaxUtil from "./ajax";

// ajax
export const ajax = ajaxUtil;

/**
 * 把数组，object扁平化。私有函数，不导出。
 * a = ['A', 'B', 'C'] 会转化成 a[0]=A, a[1]=B, a[2]=B
 * b = { 'name': 'allen', 'age': 10} 会转化成 b[name]=allen, b[age]=10
 * @param  {[type]} prefix [description]
 * @param  {[type]} obj    [description]
 * @param  {[type]} add    [description]
 * @return {[type]}        [description]
 */
function _buildParams(prefix, obj, add) {
  if (obj instanceof Array) {
    _.each(obj, (v, k) => {
      const k2 = typeof v === "object" && v != null ? k : "";
      _buildParams(`${prefix}[${k2}]`, v, add);
    });
  } else if (obj instanceof Object) {
    _.each(obj, (value, key) => {
      _buildParams(`${prefix}[${key}]`, value, add);
    });
  } else {
    add(prefix, obj);
  }
}

/**
 * 把一个object对象转换成 key=value&key=value的形式。
 * @param  {[type]} a [description]
 * @return {[type]}   [description]
 */
export function JSONToQueryString(a) {
  // TODO fix me why not used
  // const r20 = /%20/g;
  const s = [];
  const add = (key, value) => {
    s[s.length] = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  };

  if (a instanceof Object) {
    _.each(a, (value, key) => {
      _buildParams(key, value, add);
    });
  } else if (a instanceof String) {
    return a;
  }
  // 现在不把空格转换成＋，因为请求后端的时候，无法识别出来
  // return s.join('&').replace(r20, '+');
  return s.join("&");
}

export const GPUStatusMap = {
  using: {
    text: "正在使用",
    color: "default"
  },
  free: {
    text: "空闲",
    color: "gray"
  }
};
