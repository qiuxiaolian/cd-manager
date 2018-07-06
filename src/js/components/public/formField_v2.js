// Copyright 2017 caicloud authors. All rights reserved.

import PropTypes from "prop-types";
import {
  Input,
  Switch,
  Ico,
  Textarea,
  Tooltip2 as Tooltip,
  Radio,
  Select
} from "caicloud-ui";
import { Field } from "caicloud-redux-form";
import classNames from "classnames";

const { SelectItem } = Select;
const { ByteInput } = Input;

/**
 * 使用: <FormField component="Radio" payload={{ items: [array], nameKey: 'string', valueKey: 'string' }} />
 * @param <String> nameKey, optional, 默认是 name
 * @param <String> valueKey optional, 默认是 value
 */
const getRadios = field => {
  const {
    input,
    payload: {
      items,
      nameKey = "name",
      valueKey = "value",
      className,
      readonly,
      radioCls = "primary"
    },
    onChange
  } = field;
  return (
    <div className={className}>
      {_.map(items, (o, i) => {
        const value = _.isObject(o) ? _.get(o, valueKey) : o;
        const name = _.isObject(o) ? _.get(o, nameKey) : o;
        // NOTE: 不可点击选择的 Radio buttons 用于显示即将推出的内容
        if (o.viewOnly && o.toolTip) {
          return (
            <Tooltip text={o.toolTip} placement="top" key={i}>
              <Radio
                cls={radioCls}
                key={i}
                checked={false}
                value={value}
                field={field.input}
                disabled
              >
                {name}
              </Radio>
            </Tooltip>
          );
        }
        const item = (
          <Radio
            cls={radioCls}
            key={i}
            checked={value === input.value}
            value={value}
            field={field.input}
            onChange={onChange}
            // 只读模式下 disable 未选中项
            disabled={readonly && value !== input.value}
          >
            {name}
          </Radio>
        );
        return o.toolTip ? (
          <Tooltip text={o.toolTip} placement="top" key={i}>
            {item}
          </Tooltip>
        ) : (
          item
        );
      })}
    </div>
  );
};

/**
 * 使用: <FormField component="Select" payload={{ items: [array], nameKey: 'string', valueKey: 'string', search: true }} />
 * @param <String> nameKey, optional, 默认是 name
 * @param <String> valueKey optional, 默认是 value
 * @param <Bool> search 是否显示搜索
 * 目前只能取第一层的值，后续会加上可以读取深层次的 obj 的值
 */
const getSelects = ({ field }) => {
  const {
    payload: {
      items,
      nameKey = "name",
      valueKey = "value",
      search = false,
      width = "100%",
      clear = false,
      text,
      onChange,
      disabled,
      value = "" // 初始化默认选中
    },
    input,
    autoSelect = true
  } = field;

  const props = {
    field: input,
    width,
    meta: field.meta,
    value: input.value || value,
    search,
    autoSelect,
    clear,
    text,
    disabled
  };

  if (onChange) {
    props.onChange = onChange;
  }

  return (
    <Select {...props}>
      {_.map(items, (o, i) => {
        let value = _.isObject(o) ? _.get(o, valueKey) : o;
        const name = _.isObject(o) ? _.get(o, nameKey) : o;
        return (
          <SelectItem key={i} value={value}>
            {name}
          </SelectItem>
        );
      })}
    </Select>
  );
};

getSelects.propTypes = {
  field: PropTypes.object
};

/**
 * 表单中的 key-value 组件
 * For Redux-form v6.x
 */
export default class FormField extends React.Component {
  getStyle = () => {
    const { autoWidth } = this.props;
    let style = {};
    const key = this.keyEle;
    if (key && autoWidth) {
      const ele = key.childNodes[0].innerHTML;
      style = {
        minWidth: `${ele.length * 14}px`
      };
    }
    return style;
  };

  getComponent = field => {
    const {
      component,
      type,
      maxLength,
      placeholder,
      defaultUnit,
      keyName,
      suffix,
      prefix,
      width,
      disabled,
      rows,
      onBlur,
      onChange,
      onFocus,
      children,
      payload,
      readonly,
      ico
    } = this.props;
    const { input, meta } = field;
    const _attr = _.assign({}, input, meta);

    if (_.isFunction(component)) {
      return component(field);
    }

    if (_.isFunction(children)) {
      return children({ field, payload });
    }
    if (children) {
      return children;
    }

    switch (component) {
      case "Switch":
        return (
          <Switch
            key={keyName}
            disabled={disabled}
            field={_attr}
            tooltip={_.get(payload, "tooltip")}
            onChange={onChange}
          />
        );
      case "Radio":
        return getRadios({ ...field, onChange });
      case "Select":
        return getSelects({ field });
      case "Input":
        return (
          <Input
            type={type}
            width={width}
            field={_attr}
            placeholder={placeholder}
            maxLength={maxLength || 256}
            disabled={disabled}
            suffix={suffix}
            prefix={prefix}
            onBlur={onBlur}
            onFocus={onFocus}
            onChange={onChange}
            ico={ico}
          />
        );
      case "ByteInput":
        return (
          <ByteInput
            type={type}
            onChange={onChange}
            placeholder={placeholder}
            field={_attr}
            defaultUnit={defaultUnit || "Mi"}
          />
        );
      case "Textarea":
        return (
          <Textarea
            placeholder={placeholder}
            field={_attr}
            rows={rows || 3}
            width={width}
            disabled={disabled}
          />
        );
      default:
        return component;
    }
  };

  judgeRequired = () => {
    const { required, validate } = this.props;
    // 如果 field validate 中含 required 的校验，则无需额外添加 required 属性
    // required 属性主要是为了兼容 form validate
    if (required) return true;
    if (validate) {
      if (validate instanceof Array) {
        let arr = validate.map(o => o.cuiName);
        return arr.includes("required");
      } else {
        return validate.cuiName === "required";
      }
    }
    return false;
  };

  render() {
    const {
      payload,
      tip,
      name,
      fieldName,
      noKey,
      className,
      tooltip,
      type,
      nameComponent,
      noItem,
      tooltipLength,
      validate,
      normalize,
      autoSelect,
      parse
    } = this.props;
    const isRequired = this.judgeRequired();
    const wrapClassName = classNames({
      item: !noItem,
      [`${className}`]: !!className,
      required: isRequired
    });

    // 根据传入的属性预定义 parse
    const parseFunc =
      type === "number" ? val => val && _.toNumber(val) : undefined;

    return (
      <div className={wrapClassName}>
        {!noKey && (
          <div
            className="key"
            ref={d => (this.keyEle = d)}
            style={this.getStyle()}
          >
            <div>{name}</div>
            {tooltip && (
              <Tooltip text={tooltip} placement="top" length={tooltipLength}>
                <Ico type={IcoPath.help} cls="key-tip mini" />
              </Tooltip>
            )}
            {nameComponent && !name && nameComponent}
          </div>
        )}
        {/* payload: 当 component 传入 function 时，用于向 component 传入任意的自定义参数 */}
        <div className="value">
          <Field
            name={fieldName}
            payload={payload}
            validate={validate}
            normalize={normalize}
            parse={parse || parseFunc}
            component={this.getComponent}
            autoSelect={autoSelect}
          />
          {tip && <div className="tip explain">{tip}</div>}
        </div>
      </div>
    );
  }
}

FormField.propTypes = {
  // 表单 key 部分文案
  name: PropTypes.string,
  /*
     * redux-form 中 field 的 name
     */
  fieldName: PropTypes.string,
  /*
     * value 部分需要渲染的组件
     * string 时可选：Input、Textarea、Switch
     * function 时：传入组件函数，组件函数中可接收 field，此时可通过 payload 传入需要的数据
     * element时：直接传入组件
     */
  component: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    PropTypes.element
  ]),
  tip: PropTypes.string,
  /*
     * Field-level 校验规则数组
     */
  validate: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
  autoWidth: PropTypes.any,
  type: PropTypes.any,
  maxLength: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  payload: PropTypes.any,
  noKey: PropTypes.bool,
  className: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  defaultUnit: PropTypes.string,
  keyName: PropTypes.string,
  suffix: PropTypes.string,
  prefix: PropTypes.string,
  ico: PropTypes.string, // input ico
  disabled: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  rows: PropTypes.any,
  tooltip: PropTypes.any,
  tooltipLength: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  nameComponent: PropTypes.any,
  normalize: PropTypes.any,
  autoSelect: PropTypes.bool,
  noItem: PropTypes.bool,
  required: PropTypes.bool, // 是否必填，如果必填的话，在 key 前面加上红色的＊
  readonly: PropTypes.bool,
  autoComplete: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  parse: PropTypes.func,
  imageInputProps: PropTypes.object // 用于镜像选择组件对各 input 的特殊定义
};

FormField.defaultProps = {
  type: "text",
  tooltipLength: "xlarge",
  width: "100%",
  required: false
};
