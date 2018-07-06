// Copyright 2017 caicloud authors. All rights reserved.

import moment from "moment";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
// import * as action from "action";

export Numeral from "./unit";

// TODO(smq): deprecate
// 替代toFixed保留小数位
export function ToFix(num, fix = 2) {
  const _fixValue = Math.pow(10, fix);
  return Math.floor(num * _fixValue) / _fixValue;
}

// TODO(smq): deprecate
/**
 * [将 k8s 有带 Gi, Mi, Ki，Ti, GB， MB, KB, TB, m 单位的 String 或者不带单位的 Number | String 转换成 desired 单位的 Number]
 * // NOTE: 此 function 对返回值小数点不统一处理，页面根据业务需求自行处理
 * // TODO: 优化 动态判断 best display unit 根据业务需求方案待确认
 * @param  {[String | Number]}  inputType  [传入 input 类型， oneof ['memory', 'cpu']]
 * @param  {[String | Number]}  input      [传入 k8s 不带单位的 byte, 或者带 Ki， Mi， Gi, GB, MB, KB, m 的 String]
 * @param  {[String]}           targetUnit [转换 targetUnit oneof ['Ki, Mi, Gi, GiB, GB, MB, KB, m, core, Core']]
 * @return {[String | Number]}             [转换后的 output]
 */
export function ConvertK8sUnits(
  input,
  targetUnit = "Gi",
  inputType = "memory"
) {
  const obj = {
    Ki: 1024,
    KB: 1000,
    Mi: 1024 * 1024,
    MB: 1000 * 1000,
    Gi: 1024 * 1024 * 1024,
    GiB: 1024 * 1024 * 1024,
    GB: 1000 * 1000 * 1000,
    Ti: 1024 * 1024 * 1024 * 1024,
    TB: 1000 * 1000 * 1000 * 1000,
    byte: 1, // memory 最小单位
    core: 1000,
    Core: 1000
  };
  if (inputType === "memory") {
    obj["m"] = 0.001; // 107374182400m == 0.1Gi, m 需要向上转换到 byte
  }
  if (inputType === "cpu") {
    obj["m"] = 1; // 1000m = 1Core
  }
  const unitMap = {
    cpu: {
      unitName: "core"
    },
    memory: {
      unitName: "byte"
    }
  };
  let byteOrCpuNum;

  // regexp 去掉单位，保留带小数点数字
  const inputNum = String(input).replace(/[^(0-9) | .]/g, "");
  // 传入 input 是否带单位
  const inputWithoutUnit = String(input).length === inputNum.length;
  // 默认 input 不带单位, input type 为 memory 时，设置单位 byte
  // 默认 input 不带单位, input type 为 cpu 时, 设置单位 core
  const currUnit = inputWithoutUnit
    ? unitMap[inputType].unitName
    : input.slice(-(String(input).length - inputNum.length));
  if (inputWithoutUnit) {
    // type 为 cpu 时 byteOrCpuNum 转换为  m， type 为 memory 时，byteOrCpuNum 转换为 byte
    byteOrCpuNum = input * obj[currUnit];
  } else if (Object.keys(obj).includes(currUnit)) {
    byteOrCpuNum = inputNum * obj[currUnit];
  } else {
    return "bad input, this function only converts Strings suffixed with Ti,Gi, Mi, Ki, TB, GB, MB, KB，m, or Byte(number | string), or cpu core(number | string) to the desired target unit number";
  }
  return byteOrCpuNum / obj[targetUnit];
}

// TODO(smq): deprecate
/**
 * [getMB 将GB，MB单位转换成MB单位的数字]
 * @param  {[type]} string [description]
 * @return {[type]}        [description]
 */
export function parseMB(string) {
  let result = 0;
  if (string && string.indexOf("GB") !== -1) {
    result = parseInt(string, 10) * 1000;
  }

  if (string && string.indexOf("Gi") !== -1) {
    result = parseInt(string, 10) * 1024;
  }

  if (string && string.indexOf("MB") !== -1) {
    result = parseInt(string, 10) * 1;
  }

  if (string && string.indexOf("Mi") !== -1) {
    result = parseInt(string, 10) * 1;
  }

  return result;
}

// TODO(smq): deprecate
/**
 * 把后端带单位的字符串转换成数字。统一把 M 调成 G。
 * @param {String or Number} string 需要转换的字符串
 * @param {Int} fix 保留几位小数点
 * @return {Number}
 */
export function parseGB(string, fix = 2) {
  if (_.isNumber(string)) {
    // 有时不确定是字符串还是数字，为数字时直接返回
    return string;
  }
  if (string && string.indexOf("GB") !== -1) {
    // 原值非整数的时候, 默认保留4位小数（考虑到可能达到但一般不超过4位小数）
    return ToFix(parseFloat(string), fix || 4);
  }

  if (string && string.indexOf("Gi") !== -1) {
    return ToFix(parseFloat(string), fix || 4);
  }

  if (string && string.indexOf("MB") !== -1) {
    //使用Math处理多位小数的问题
    return ToFix(parseInt(string, 10) / 1024, fix);
  }

  if (string && string.indexOf("Mi") !== -1) {
    return ToFix(parseInt(string, 10) / 1024, fix);
  }
  if (string && string.indexOf("m") !== -1) {
    const value = parseInt(string, 10);
    // 内存会有 m 这个单位，这个单位是指千分之一B
    // cpu 也会有 m 这个单位，但 cpu 的值不会超过 1000 000 m = 1000核
    // 内存如果是 1 Mi，值约等于 1024 000 000 m
    if (value > 1000 * 1000) {
      return ToFix(parseInt(string, 10) / 1000 / 1024 / 1024 / 1024, fix);
    }
    return ToFix(parseInt(string, 10) / 1000, fix);
  }

  return string;
}

// TODO(smq): deprecate
/**
 * [将cpu都转化为core单位]
 * @param  {String or Number} string 需要转换的字符串
 * @param  {Int} fix 保留几位小数点
 * @return {Number}       [description]
 */
export function parseCore(string, fix) {
  if (_.isNumber(string)) {
    return string;
  }
  if (string && string.indexOf("m") !== -1) {
    return ToFix(parseInt(string, 10) / 1000, fix || 2);
  }
  return string * 1;
}

/**
 * 获取dom节点的绝对left和top
 * @param  {[type]} dom [description]
 * @return {[type]}     [description]
 */
export function getPosition(dom) {
  if (document.documentElement.getBoundingClientRect) {
    return {
      left:
        dom.getBoundingClientRect().left +
        Math.max(document.body.scrollLeft, document.documentElement.scrollLeft),
      top:
        dom.getBoundingClientRect().top +
        Math.max(document.body.scrollTop, document.documentElement.scrollTop)
    };
  } else {
    let top = dom.offsetTop,
      left = dom.offsetLeft,
      pos = null;
    if (dom.offsetParent) {
      pos = getPosition(dom.offsetParent);
      top += pos.top;
      left += pos.left;
    }
    return {
      left,
      top
    };
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

export function QueryStringToJSON(str) {
  const params = str.split("&");
  const result = {};

  params.forEach(p => {
    p = p.split("=");
    const name = decodeURIComponent(p[0]).replace("[]", "");
    const value = decodeURIComponent(p[1]);
    if (name.length) {
      if (result[name] !== undefined) {
        if (!result[name].push) {
          result[name] = [result[name]];
        }
        result[name].push(value || "");
      } else {
        result[name] = value || "";
      }
    }
  });

  return result;
}

export function GetQueryObj() {
  const queryStr = window.location.search.substring(
    1,
    window.location.search.length
  );
  return QueryStringToJSON(queryStr);
}

// TODO(smq): deprecate
/**
 * [parseToBytes 转换成 bytes]
 * @param  {[type]} string [description]
 * @return {[type]}        [description]
 */
export function parseToBytes(string) {
  if (string && string.indexOf("G") !== -1) {
    return parseInt(string, 10) * 1000 * 1000 * 1000;
  }

  if (string && string.indexOf("M") !== -1) {
    return parseInt(string, 10) * 1000 * 1000;
  }

  if (string && string.indexOf("K") !== -1) {
    return parseInt(string, 10) * 1000;
  }

  return parseInt(string, 10);
}

export function FormatTime(time) {
  return moment(time).format("YYYY-MM-DD HH:mm:ss");
}

/**
 * 绑定 store 和 actions 到组件
 * @param {object required} stateMap  state map object:
 *  {
 *    clusters: 'clusters',
 *    application: 'application',
 *  }
 * @param {string required} actions   action name: 'application'
 * @param {object required} component component: SomeComponent
 */
export function Connect(stateMap, actions, component) {
  // 从字符串取对象的映射值
  // ref: http://stackoverflow.com/questions/10934664/convert-string-in-dot-notation-to-get-the-object-reference
  function ref(obj, str) {
    if (typeof str !== "string") {
      return {};
    }
    return str.split(".").reduce((o, x) => o[x], obj);
  }
  const stateToProps = state => {
    const result = {};
    _.forEach(stateMap, (value, key) => {
      // 判断为对象：直接赋值，为字符串时从state中获取对应字段
      if (_.isObject(value)) {
        _.assignIn(result, { [key]: value });
      } else {
        const field = ref(state, value);
        _.assignIn(result, { [key]: field });
      }
    });
    return result;
  };
  const dispatchToProps = dispatch => {
    if (typeof actions !== "string") {
      return {};
    }

    // return {};
    return bindActionCreators(action[actions], dispatch);
  };
  return connect(stateToProps, dispatchToProps)(component);
}

/**
 * 计算 2 个时间的时间差。
 * @param {Date} 开始时间
 * @param {Date} 结束时间，可选。默认是当前时间
 * @param {bool} 是否精确到秒
 * @return {String} 一段描述时间差的文字
 */
// 格式化时间
export function convertTimeFormat(time) {
  return moment(time).format("YYYY-MM-DD HH:mm:ss");
}

// 版本号最后一位加 1
// VERSION 格式如：1.0.0，由数字 + 小数点组成
export function bumpVersion(version) {
  if (typeof version === "string") {
    const arr = version.split(".");
    const length = arr.length;
    if (typeof +arr[length - 1] === "number") {
      arr[length - 1] = +arr[length - 1] + 1;
    }
    return arr.join(".");
  }
  return version;
}

/**
 * Round a given number to a specific decimal, default as 2
 * @param number {number} raw number
 * @param decimal {number} decimals preserved
 */
export function roundNumber(number = 0, decimal = 2) {
  return _.round(number, decimal);
}

/**
 * Format unix time as an moment object
 * @param unixTime {number} unix time stamp
 * @return {moment.Moment | *} {object} moment time object
 */
export function parseUnixTime(unixTime) {
  return moment.unix(unixTime);
}

/**
 * 中英文混合输入,计算字符串字节长度
 * 使用utf-8编码
 */
export function getStringByte(str) {
  let total = 0,
    charCode,
    i,
    len = str.length;
  for (i = 0; i < len; i++) {
    charCode = str.charCodeAt(i);
    if (charCode <= 0x007f) {
      total += 1;
    } else if (charCode <= 0x07ff) {
      total += 2;
    } else if (charCode <= 0xffff) {
      total += 3;
    } else {
      total += 4;
    }
  }
  return total;
}

const defaultUnit = {
  prefixes: [
    {
      id: "Bps",
      symbol: "Bps",
      show: "Bps"
    },
    {
      id: "KBps",
      symbol: "KBps",
      show: "KBps"
    },
    {
      id: "MBps",
      symbol: "MBps",
      show: "MBps"
    },
    {
      id: "GBps",
      symbol: "GBps",
      show: "GBps"
    }
  ],
  scaleFactor: 1000,
  type: "scale"
};
// 将后端返回的流量监控数据转换为合适单位的数据
export function formatScale(
  value,
  decimal = 2,
  unit = defaultUnit,
  offset = 0
) {
  let v = Math.abs(value);
  let i = offset;
  for (; i < unit.prefixes.length - 1; i++) {
    if (v >= unit.scaleFactor) {
      v = v / unit.scaleFactor;
    } else {
      break;
    }
  }
  if (value < 0) {
    v = v * -1;
  }

  return v.toFixed(decimal) + " " + unit.prefixes[i].symbol;
}
