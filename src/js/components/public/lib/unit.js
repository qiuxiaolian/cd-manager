// Copyright 2017 caicloud authors. All rights reserved.
// Unit converter using Numeral http://numeraljs.com/
// convert convention: https://github.com/caicloud/console-web/issues/3496

import numeral from "numeral";
import _ from "lodash";

/**
 * [unformateMilli] for Numeral
 * description: 针对 K8 的特殊计数单位 'm'(代表千分之一)进行处理，'2000m' --> '2'
 * @param  {[String/Number/null/undefined]} input example: '2000m'
 * @return {[Number]} example: 2
 */
function unformateMilli(input) {
  if (typeof input === "number") {
    return input;
  }
  if (input === undefined || input === null) {
    return 0;
  }
  if (typeof input !== "string") {
    // FIXME: jiayu remove console log
    // eslint-disable-next-line no-console
    return console.log(
      "unformateMilli function from lib/util.js expect string or num, but got:",
      typeof input
    );
  }
  let output = _.cloneDeep(input);
  if (input.indexOf("m") === input.length - 1) {
    const inputWithoutMilli = +input.substring(0, input.length - 1);
    output = inputWithoutMilli / 1000;
  }
  return output;
}

/**
 * [TransToIbTargetUnit 转换至目标单位大小] 用于进度条分子转换成与分母相同的单位，结果最多保留1位小数
 * @param       {[Number]} value [输入值]
 * @param       {[String]} unit  [目标单位]
 * @return
 * {
 *    value: '2',
 *    unit: 'KiB',
 * }
 */
function TransToIbTargetUnit(value, unit) {
  const binary = {
    base: 1024,
    suffixes: ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"]
  };
  const num = numeral(
    (value / Math.pow(binary.base, binary.suffixes.indexOf(unit))).toFixed(2)
  ).format("0.[0]");
  return { num, unit };
}

/**
 * [NumeralCompare 比较两个数值大小] for Numeral
 * @param {[String/Num]} value1   数值1，example: '1Gi'
 * @param {[String/Num]} value2   数值2，example: '2Mi'
 * @param {[String]} [resource='memory'] 资源类型，one of 'memory', 'cpu'
 * @return {[Number]} value1 与 value2 的差值，B 或 Core 为单位，正数则 value1 大于 value2
 */
function NumeralCompare(value1, value2, resource = "memory") {
  const processedValue1 = unformateMilli(value1);
  const processedValue2 = unformateMilli(value2);
  const numValue1 = numeral(
    `${processedValue1}${resource === "cpu" ? "" : "B"}`
  ).value();
  const numValue2 = numeral(
    `${processedValue2}${resource === "cpu" ? "" : "B"}`
  ).value();
  return numValue1 - numValue2;
}

/**
 * [NumeralMinus 两个数值相减] for Numeral
 * @param {[String/Num]} value1   数值1，example: '1Gi'
 * @param {[String/Num]} value2   数值2，example: '2Mi'
 * @param {[String]} [resource='memory'] 资源类型，one of 'memory', 'cpu'
 * @return {[String]} value1 与 value2 的差值(formated)
 * 当 value1 小于 value 2 时，返回值为 '0 Core' or '0 B'（负数无意义）
 */
function NumeralMinus(value1, value2, resource = "memory") {
  const diff = NumeralCompare(value1, value2, resource);
  const suffix = resource === "cpu" ? " Core" : "";

  if (diff <= 0) {
    return `0 ${suffix}`;
  }

  const input = resource === "memory" ? `${diff}B` : diff;
  const formatStr = resource === "memory" ? "0.[00] ib" : "0.[00]";
  return numeral(input).format(formatStr) + suffix;
}

/**
 * [NumeralSingle 用于单个数据的展示的单位转换] for Numeral
 *
 * @param {[String/Num]} input support: 2, '2', '2m', '2Gi', undefined, null
 * @param {[String]} resource support: 'cpu' or 'memory'
 * @param {[String/Num]} alot 分配额度 support: 2, '2', '2m', '2Gi'
 * 注意这里分配额度后，输出的值是剩余量
 *
 * @return example: '1.11 Core', '10 GiB', '- Core', '- MiB'
 *
 * Note(2017-10-23 sunmengqing):
 * 界面做单位展示（进度条除外），cpu 单位统一 Core，memory 单位统一 xiB(KiB, MiB, GiB...)
 * memory to Best: 不得小于1，最多保留两位小数
 */
function NumeralSingle(input, resource = "memory", alot = 0) {
  if (input === undefined || input === null) {
    return resource === "cpu" ? "- Core" : "- MiB";
  }

  const processedInput = `${unformateMilli(input)}${
    resource === "memory" ? "B" : ""
  }`;
  const processedAlot = `${unformateMilli(alot)}${
    resource === "memory" ? "B" : ""
  }`;

  const numeralInput = numeral(processedInput).value();
  const numeralAlot = numeral(processedAlot).value();
  return NumeralMinus(numeralInput, numeralAlot, resource);
}

/**
 * [NumeralTransObj 用于单个数据的展示的单位转换，返回将数值部分与数量级单位部分分开] for Numeral
 * Note: 有些界面需要从样式上区分数值部分与单位部分，通过 Numeral 转换后能直接拿到分开的数据更方便
 *
 * @param {[String/Num]} input support: 2, '2', '2m', '2Gi', undefined, null
 * @param {[String]} resource support: 'cpu' or 'memory'
 * @param {[String/Num]} alot 分配额度 support: 2, '2', '2m', '2Gi'
 * 注意这里分配额度后，输出的值是剩余量
 *
 * @return
 * {
 *    num: '3',
 *    suffix: 'GiB',
 * }
 */
function NumeralTransObj(input, resource = "memory", alot = 0) {
  const trans = NumeralSingle(input, resource, alot);
  const transArr = trans.split(" ");
  return {
    num: transArr[0],
    suffix: transArr[1]
  };
}

/**
 * 去掉数值和单位之间的空格 (后端不接受带空格的值)
 * @param {*} input same as NumeralSingle
 * @return same as NumeralSingle
 * e.g. `1 GiB` -> `1GiB`, `1 Mi` -> `1Mi`
 */
function NumeralTransWithoutSpace(input, resource, alot) {
  const obj = NumeralTransObj(input, resource, alot);
  return _.isEmpty(obj) ? input : `${obj.num}${obj.suffix}`;
}

/**
 * [NumeralPrefixValue 获取值的不含单位部分] 例如用于校验填入值是否为正整数，需要取前面的值
 * @param {[String/Number]} input support: 1, '1', '1 Mi', '1Mi', '1MiB', '1m'
 * @return {[Number]}
 */
function NumeralPrefixValue(input) {
  let inputStr = `${input}`;
  // 处理 'm'
  if (inputStr.indexOf("m") === inputStr.length - 1) {
    return +inputStr.slice(0, inputStr.length - 1);
  }
  // 处理 'B'
  if (inputStr.indexOf("B") === inputStr.length - 1) {
    inputStr = inputStr.slice(0, inputStr.length - 1);
  }
  return +numeral(inputStr).value();
}

/**
 * [NumeralProgressTitleObj 进度条上方的信息对象] for Numeral
 *
 * @param {[String/Number]} used example: 0, '0', '10Gi'
 * @param {[String/Number]} hard example: 2, '2', '10Gi'
 * @param {String} [resource='memory'] supported: 'cpu' or 'memory' or 'int'
 * @param {[String/StringNum]} alot example: 2, '2'
 * @param {[String/StringNum]} usedAlot example: 2, '2'
 * @return {[Object]} example: { used: '2', rest: ' / 4 Core'} or { used: '2', rest: ' / 4 MiB'}
 *
 * Note(2017-10-24 sunmengqing):
 * 进度条展示，cpu 单位统一 Core，memory 单位按照分母的 toBest 单位动态转换。数字均最多保留两位小数
 */
function NumeralProgressTitleObj(
  used,
  hard,
  resource = "memory",
  alot = 0,
  usedAlot = 0
) {
  const processedUsed = unformateMilli(used);
  const processedHard = unformateMilli(hard);
  const processedAlot = unformateMilli(alot);
  const processedUsedAlot = unformateMilli(usedAlot);

  // 整数类型，不需要单位，不需要动态转换单位
  // 比如：新增分区，存储分配的时候，显示数据卷数量
  if (resource === "int" || resource === "gpu") {
    const addedUsed = numeral(processedUsed)
      .add(processedAlot)
      .subtract(processedUsedAlot)
      .value();
    return {
      used: used === undefined ? "-" : addedUsed,
      rest: hard === undefined ? " / -" : ` / ${hard}`
    };
  }

  if (resource === "cpu") {
    const addedUsed = numeral(processedUsed)
      .add(processedAlot)
      .subtract(processedUsedAlot)
      .value();
    return {
      used: used === undefined ? "-" : numeral(addedUsed).format("0.[0]"),
      rest:
        hard === undefined
          ? used === undefined ? " / -" : " / - Core"
          : ` / ${numeral(processedHard).format("0.[0]")} Core`
    };
  }

  const processedUsedValue = numeral(`${processedUsed}B`).value();
  const processedAlotValue = numeral(`${processedAlot}B`).value();
  const processedUsedAlotValue = numeral(`${processedUsedAlot}B`).value();
  const addedUsed = numeral(processedUsedValue || 0)
    .add(processedAlotValue || 0)
    .subtract(processedUsedAlotValue || 0)
    .value();

  return {
    used:
      used === undefined || hard === undefined
        ? "-"
        : `${
            TransToIbTargetUnit(
              addedUsed,
              NumeralTransObj(processedHard).suffix
            ).num
          }`,
    rest:
      hard === undefined
        ? " / -"
        : ` / ${numeral(`${processedHard}B`).format("0.[0] ib")}`
  };
}

/**
 * [NumeralProgressTitle 输出进度条上方的数字+单位展示] for Numeral
 *
 * @param {[String/Number]} used example: 0, '0', '10Gi'
 * @param {[String/Number]} hard example: 2, '2', '10Gi'
 * @param {String} [resource='memory'] supported: 'cpu' or 'memory'
 * @param {[String/StringNum]} alot example: 2, '2', '2Gi', '2Mi' 分配额
 * * @param {[String/StringNum]} usedAlot example: 2, '2', '2Gi', '2Mi' used 中已包含的分配额
 * @return {[String]} example: '0/2 Core' or '0/2 MiB'
 *
 * Note(2017-10-24 sunmengqing):
 * 进度条展示，cpu 单位统一 Core，memory 单位按照分母的 toBest 单位动态转换。数字均最多保留两位小数
 */
function NumeralProgressTitle(
  used,
  hard,
  resource = "memory",
  alot = 0,
  usedAlot = 0
) {
  const obj = NumeralProgressTitleObj(used, hard, resource, alot, usedAlot);
  return `${obj.used}${obj.rest}`;
}

/**
 * [ProgressPercentage 输出进度条所需的百分率] for Numeral
 * @param {[String/Number]} used example: 0, '0', '10Gi'
 * @param {[String/Number]} hard example: 2, '2', '10Gi'
 * @param {[String]} [resource='memory'] supported: 'cpu' or 'memory' or 'int' int: 整数类型，不需要单位，不需要动态转化单位
 * @param {[StringNum]} [alot=0]
 * @param {[StringNum]} [usedAlot=0]
 * @return {[Number]} 0.2 (equals to 20%)
 */
function NumeralProgressPercentBase(
  used,
  hard,
  resource = "memory",
  alot = 0,
  usedAlot = 0
) {
  const suffix = resource === "memory" ? "B" : "";
  hard = hard || 0;
  alot = alot || 0;
  usedAlot = usedAlot || 0;
  const usedValue = numeral(`${unformateMilli(used)}${suffix}`).value();
  const alotValue = numeral(`${unformateMilli(alot)}${suffix}`).value();
  const usedAlotValue = numeral(`${unformateMilli(usedAlot)}${suffix}`).value();
  const hardValue = numeral(`${unformateMilli(hard)}${suffix}`).value();
  const output = (usedValue + alotValue - usedAlotValue) / hardValue;
  return output;
}

/**
 * [ProgressPercentage 输出进度条所需的百分率] for Numeral
 * @param {[String/Number]} used example: 0, '0', '10Gi'
 * @param {[String/Number]} hard example: 2, '2', '10Gi'
 * @param {[String]} [resource='memory'] supported: 'cpu' or 'memory'
 * @param {[StringNum]} [alot=0]
 * @param {[StringNum]} [usedAlot=0]
 * @return {[Number]} 百分率（整数） example: 80
 */
function NumeralProgressPercentage(
  used,
  hard,
  resource = "memory",
  alot = 0,
  usedAlot = 0
) {
  const baseNum = NumeralProgressPercentBase(
    used,
    hard,
    resource,
    alot,
    usedAlot
  );
  const percentage = (baseNum * 100).toFixed(20);
  if (percentage < 0.0045) {
    return 0;
  }
  return +numeral(percentage).format("0");
}

/**
 * [ProgressPercentage 是否溢出，即是否分配了超出剩余使用量的值] for Numeral
 * @param {[String/Number]} used example: 0, '0', '10Gi'
 * @param {[String/Number]} hard example: 2, '2', '10Gi'
 * @param {[String]} [resource='memory'] supported: 'cpu' or 'memory'
 * @param {[StringNum]} [alot=0]
 * @param {[StringNum]} [usedAlot=0]
 * @return {[Boolean]} true or false
 */
function NumeralProgressExceed(
  used,
  hard,
  resource = "memory",
  alot = 0,
  usedAlot = 0
) {
  const baseNum = NumeralProgressPercentBase(
    used,
    hard,
    resource,
    alot,
    usedAlot
  );
  return +numeral(baseNum).value() > 1;
}

/**
 * [NumeralProgressPlus 进度条，支持两段式、三段式、N 段式]
 * @param       {[Array]} data [进度条数据]
 *
 * Example 1:
 * input: ['0.4 Gi', '0.8 Gi', '2GiB']
 * output: [20, 40]
 *
 * Example 2:
 * input: ['0.4 Gi', '0.8 Gi']
 * output: [50]
 *
 */
function NumeralProgressPlus(data) {
  const dataArr = _.dropRight(data);
  return dataArr.map(item =>
    NumeralProgressPercentage(item, data[data.length - 1])
  );
}

/**
 * [_add 两个值相加] 私有
 * @param       {[String]} resource [数据类型] one of 'memory', 'cpu'
 * @param       {[String]} n1       [被加数] example: '1Gi', '3m'
 * @param       {[String]} n2       [加数]
 * @return      {[String]}          [经单位转换的数值] example: '2 GiB'
 */
function _add(resource, n1, n2) {
  const suffix = resource === "memory" ? "B" : "";
  const n1Value = numeral(`${unformateMilli(n1 || 0)}${suffix}`).value();
  const n2Value = numeral(`${unformateMilli(n2 || 0)}${suffix}`).value();
  return NumeralSingle(n1Value + n2Value, resource);
}

/**
 * [NumeralSum 连加]
 * @param       {[Array]} arr      [需要连加的数字组成的数组]
 * @param       {[type]} resource [数据类型] one of 'memory', 'cpu'
 *
 * Example:
 * input ['1Gi', '2Gi', '1Gi'], 'memory'
 * output: '4Gi'
 */
function NumeralSum(arr, resource) {
  let result = 0;
  arr.map(addend => {
    result = _add(resource, result, addend);
  });
  return result;
}

/**
 * [_minus 两个值相减] 私有
 * @param       {[String]} resource [数据类型] one of 'memory', 'cpu'
 * @param       {[String]} n1       [被减数] example: '1Gi', '3m'
 * @param       {[String]} n2       [减数]
 * @return      {[String]}          [经单位转换的数值] example: '2 GiB'
 */
function _minus(resource, n1, n2) {
  return NumeralSingle(NumeralCompare(n1, n2, resource), resource);
}

/**
 * [NumeralSubstract 连减]
 * @param       {[Array]} arr [需要连减的数字组成的数组]
 * @param       {[String]} resource [数据类型] one of 'memory', 'cpu'
 *
 * Example:
 * input ['4Gi', '1Gi', '2Gi'], "memory"
 * output: '1 GiB'
 */
function NumeralSubstract(arr, resource) {
  const minuend = arr[0];
  const subtrahendArr = _.drop(arr);
  let result = Numeral.trans(minuend, resource);
  subtrahendArr.map(subtrahend => {
    result = _minus(resource, result, subtrahend);
  });
  return result;
}

/**
 * [Numeral 单位转换]
 *
 * Usage:
 * Numeral.trans(input, resource, alot) 单个数据转换
 * Numeral.transWithoutSpace(input, resource) 单个数据转换，与 trans 相同，但输出的数值与单位之间没有空格
 * Numeral.transObj(input, resource) 单个数据转换，输出对象给需要对数值突出显示的界面用，例如主机列表
 * Numeral.prefixValue(input) 获取一个数值的不含数量级单位的部分（例如用于校验填入值是否为正整数）
 * // NOTE: Numeral.transObj().num 与 Numeral.prefixValue() 的区别是，后者不进行单位转换
 * Numeral.compare(value1, value2, resource) 比较两个值的大小
 * Numeral.progress(used, hard, resource, alot, usedAlot).percent 进度条百分率
 * Numeral.progress(used, hard, resource, alot, usedAlot).title 进度条标题
 * Numeral.progress(used, hard, resource, alot, usedAlot).titleObj 给需要对使用量突出显示的进度条标题使用，例如分区列表
 * {
 *    used: 30, 进度条标题中的使用量
 *    rest: ' / 100 Core'
 * }
 * Numeral.progress(used, hard, resoure, alot, usedAlot).exceed 是否溢出，即是否分配了超出剩余使用量的值
 * // Manipulate functions（加减乘除基础方法）:
 * Numeral.sum(Array) 连加
 * Numeral.substract(Array) 连减
 * TODO Numeral.multiply(Array) 连乘
 * TODO Numeral.divide(Array) 连除
 */
const Numeral = {
  trans(input, resource, alot) {
    return NumeralSingle(input, resource, alot);
  },
  transWithoutSpace(input, resource, alot) {
    return NumeralTransWithoutSpace(input, resource, alot);
  },
  transObj(input, resource, alot) {
    return NumeralTransObj(input, resource, alot);
  },
  prefixValue(input) {
    return NumeralPrefixValue(input);
  },
  compare(value1, value2, resource) {
    return NumeralCompare(value1, value2, resource);
  },
  progress(used, hard, resource, alot, usedAlot) {
    return {
      title: NumeralProgressTitle(used, hard, resource, alot, usedAlot),
      titleObj: NumeralProgressTitleObj(used, hard, resource, alot, usedAlot),
      percent: NumeralProgressPercentage(used, hard, resource, alot, usedAlot),
      exceed: NumeralProgressExceed(used, hard, resource, alot, usedAlot)
    };
  },
  progressPlus(data) {
    return {
      percent: NumeralProgressPlus(data)
    };
  },
  // Manipulate functions
  sum(arr, resource) {
    return NumeralSum(arr, resource);
  },
  substract(arr, resource) {
    return NumeralSubstract(arr, resource);
  }
};

export default Numeral;
