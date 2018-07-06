import { Numeral, getStringByte } from "./lib/util";
import {
  NAME,
  STORAGE_NAME,
  STORAGE_NAME_v5,
  EMAIL,
  POSITIVE_INT,
  INT
} from "./regexp";

export const required = val => {
  let empty = true;
  if (typeof val === "string") {
    empty = !val.trim();
  } else if (_.isNumber(val)) {
    // because of `_.isEmpty(0.1) === true`
    empty = false;
  } else {
    empty = _.isEmpty(val);
  }

  return empty ? "不能为空" : undefined;
};

// NOTE: 在打包的之后，name 字段会读取不到
required.cuiName = "required";

// 限制名称长度为 2 - 32 个字符, 使用 unicode 计算长度, 一个中文一般算3个长度
export const validateLength = val =>
  val && (getStringByte(val) < 2 || getStringByte(val) > 32)
    ? "名称长度限制 2 - 32 个字符"
    : undefined;

// resource validate, user for resourceAllocation component
/**
 * resource construction
 * {
 *    limits: {
 *      cpu,
 *      memroy,
 *    },
 *    requests: {
 *      cpu,
 *      memory,
 *    }
 * }
 */
export const resourceValidate = resources => {
  const err = {};
  const value = resources;
  const limitCpuErr = required(value && value.limits && value.limits.cpu);
  const limitMemErr = required(value && value.limits && value.limits.memory);
  let reqCpuErr = required(value && value.requests && value.requests.cpu);
  let reqMemErr = required(value && value.requests && value.requests.memory);

  if (value && value.limits && value.requests) {
    if (Numeral.compare(value.requests.cpu, value.limits.cpu, "cpu") > 0) {
      reqCpuErr = `CPU 配额请求不能超过上限`;
    }
    if (
      Numeral.compare(value.requests.memory, value.limits.memory, "memory") > 0
    ) {
      reqMemErr = `内存CPU 配额请求不能超过上限`;
    }
  }
  if (limitCpuErr || limitMemErr) {
    err.limits = {
      cpu: limitCpuErr,
      memory: limitMemErr
    };
  }
  if (reqCpuErr || reqMemErr) {
    err.requests = {
      cpu: reqCpuErr,
      memory: reqMemErr
    };
  }
  if (_.isEmpty(err)) {
    return undefined;
  }
  return err;
};

// app name
export const appName = val =>
  NAME.test(val)
    ? undefined
    : "由小写字母、数字、横杠、下划线组成，长度限制2-32个字符。只能以小写字母开头";

// storage name
export const storageName = val =>
  !STORAGE_NAME.test(val) &&
  "由小写字母、数字、横杠、下划线组成，长度限制2-32个字符。只能以小写字母开头";

export const storageName_v5 = val =>
  !STORAGE_NAME_v5.test(val) &&
  "由小写字母、数字、横杠、下划线组成，长度限制2-32个字符。只能以小写字母开头";

export const email = val =>
  EMAIL.test(val) ? undefined : "邮箱格式错误，请重新填写";

// 当 val 为空不显示错误提示
export const onlyPositiveInt = val =>
  _.isEmpty(val) || POSITIVE_INT.test(val) ? undefined : "必须是正整数";

export const onlyInt = val =>
  _.isEmpty(val) || INT.test(val) ? undefined : "必须是非负整数";

export const positiveInt = val =>
  POSITIVE_INT.test(val) ? undefined : "必须是正整数";
