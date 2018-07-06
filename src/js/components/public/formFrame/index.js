// Copyright 2017 caicloud authors. All rights reserved.

import classNames from "classnames";
import PropTypes from "prop-types";
import FormMessage from "../formMessage";
import FormBtn from "./formButton";
import { Ico, IcoSvg, IcoButton } from "caicloud-ui";

/**
 * section of form
 * 因 redux-form 6.x 中有 FormSection 的标签，故避免重名，命名为 FormLump
 *  <FormLump title="string">
 *    {children}
 *  </FormLump>
 */
class FormLump extends React.Component {
  static cuiName = "FormLump";
  render() {
    const { children, title, className } = this.props;
    const lumpCls = classNames({
      "form-lump": true,
      [className]: !!className,
      "no-title": !title
    });
    return (
      <div className={lumpCls}>
        {title && <div className="lump-title">{title}</div>}
        <div className="lump-body">{children}</div>
      </div>
    );
  }
}

FormLump.propTypes = {
  children: PropTypes.object,
  title: PropTypes.string,
  className: PropTypes.string
};

class FormHeadTabs extends React.Component {
  static cuiName = "FormHeadTabs";

  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
    currentIndex: PropTypes.number.isRequired,
    fix: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    editable: PropTypes.bool,
    // 此组件内不负责真正删除 Tab, 而是对外抛出要删除的 index
    handleTabClose: PropTypes.func,
    handleTabAdd: PropTypes.func,
    // 隐藏添加按钮
    hideTabAddIco: PropTypes.bool,
    clickabled: PropTypes.bool.isRequired // 头部是否可点击
  };

  static defaultProps = {
    clickabled: true
  };

  clickHead = (e, index) => {
    const { clickabled, onClick } = this.props;
    if (!clickabled) {
      return null;
    }
    onClick && onClick(e, index);
  };

  getContent = () => {
    const { children, currentIndex, editable, handleTabClose } = this.props;
    return React.Children.map(children, (c, index) => {
      if (c && c.type.cuiName === "FormHeadTab") {
        const props = c.props;
        return (
          <FormHeadTab
            {...props}
            onClose={e => handleTabClose(e, index)}
            editable={editable}
            active={currentIndex === index}
            onClick={e => this.clickHead(e, index)}
          />
        );
      }
    });
  };

  render() {
    const {
      className,
      fix,
      editable,
      handleTabAdd,
      hideTabAddIco
    } = this.props;
    const tabsCls = classNames({
      "form-head-tabs": true,
      [className]: !!className,
      fix,
      editable
    });

    return (
      <div className={tabsCls}>
        {this.getContent()}
        {editable &&
          !hideTabAddIco && (
            <IcoButton
              cls="form-head-tab-add"
              onClick={handleTabAdd}
              type={IcoSvg.plus}
            />
          )}
      </div>
    );
  }
}

class FormHeadTab extends React.Component {
  static cuiName = "FormHeadTab";
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
    active: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
    editable: PropTypes.bool,
    onClose: PropTypes.func
  };
  static defaultProps = {
    active: false,
    disabled: false
  };
  render() {
    const {
      className,
      children,
      active,
      disabled,
      editable,
      onClose
    } = this.props;
    const omitProps = ["active", "disabled", "className"];
    if (disabled) {
      omitProps.push("onClick");
    }
    const _props = _.omit(this.props, omitProps);
    const tabsCls = classNames({
      "form-head-tab": true,
      [className]: !!className,
      active: active,
      disabled: disabled,
      editable
    });
    // 关闭此 Tab
    const handleTabClose = e => {
      e.preventDefault();
      e.stopPropagation();
      onClose(e);
    };
    return (
      <div className={tabsCls} {..._props}>
        {children}
        {editable && (
          <Ico
            cls="form-head-tab-close"
            onClick={handleTabClose}
            type={IcoSvg.close}
          />
        )}
      </div>
    );
  }
}

class FormContentTip extends React.Component {
  static cuiName = "FormContentTip";
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
    active: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired
  };
  static defaultProps = {
    active: false,
    disabled: false
  };
  render() {
    const { className, children, active, disabled } = this.props;
    const omitProps = ["active", "disabled", "className"];
    if (disabled) {
      omitProps.push("onClick");
    }
    const _props = _.omit(this.props, omitProps);
    const tabsCls = classNames({
      "form-content-tip": true,
      [className]: !!className,
      active: active,
      disabled: disabled
    });
    return (
      <div className={tabsCls} {..._props}>
        {children}
      </div>
    );
  }
}

class FormContentTabs extends React.Component {
  static cuiName = "FormContentTabs";
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
    currentIndex: PropTypes.number.isRequired
  };

  getContent = () => {
    const { children, currentIndex } = this.props;
    return React.Children.map(children, (c, index) => {
      const cuiName = c && c.type.cuiName;
      if (cuiName === "FormContentTab") {
        const props = c.props;
        return (
          <FormContentTab
            key={index}
            index={index}
            {...props}
            currentIndex={currentIndex}
          />
        );
      }
    });
  };

  render() {
    const { className } = this.props;
    const tabsCls = classNames({
      "form-contents": true,
      [className]: !!className
    });
    return <div className={tabsCls}>{this.getContent()}</div>;
  }
}

class FormContentTab extends React.Component {
  static cuiName = "FormContentTab";
  static propTypes = {
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
    currentIndex: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired
  };

  getContent = () => {
    const { children } = this.props;
    return React.Children.map(children, (c, index) => {
      if (c) {
        const props = c.props;
        if (c.type.cuiName === "FormContentTip") {
          const props = c.props;
          return <FormContentTip key={index} {...props} />;
        }
        if (c.type.cuiName === "FormLump") {
          return <FormLump key={index} {...props} />;
        }
        if (c.type.cuiName === "FormBtn") {
          return <FormBtn {...props} />;
        }
      }
    });
  };
  // 因涉及到表单的内容，故只是从样式上隐藏非当前页面
  render() {
    const { className, children, currentIndex, index } = this.props;
    const tabsCls = classNames({
      "form-content": true,
      [className]: !!className,
      hide: currentIndex !== index
    });
    return <div className={tabsCls}>{children}</div>;
  }
}

/**
 * 使用说明,用于表单
 * formName 主要用于在长表单的确认按钮处显示错误提示，目前暂无设计图，后续会优化
 * title 目前支持 string
 * <form onSubmit={func}>
 *  <FormFrame className="string">
 *    <FormLump title="string">
 *      {children}
 *    </FormLump>
 *    <FormLump title="string">
 *      {children}
 *    </FormLump>
 *    <FormBtn formName="reduxForm Name" /> // 不传 children 的话默认确认和取消两个按钮
 *  </FormFrame>
 * </form>
 */

class FormFrame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentIndex: 0
    };
  }

  static propTypes = {
    // className 自定义样式
    className: PropTypes.string,
    // form name, 用于 redux-form 6.8, 因组件绑定 form_v6 的 state
    // 如果使用 redux-form 5, 在 submit btn 右侧不会显示错误提示
    formName: PropTypes.string,
    children: PropTypes.object,
    keySize: PropTypes.oneOf(["small", "middle", "lg", "lgx2"]),
    currentIndex: PropTypes.number,
    onClick: PropTypes.func,
    mod: PropTypes.string, // post /api/cargo/workspaces，模块名称会是 cargo/workspaces
    customMsg: PropTypes.bool // 自定义是头部显示
  };

  static defaultProps = {
    keySize: "middle",
    currentIndex: 0
  };

  componentWillMount() {
    const { currentIndex } = this.props;
    this.setState(_.merge({ currentIndex: currentIndex ? currentIndex : 0 }));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentIndex !== this.props.currentIndex) {
      this.setState({ currentIndex: nextProps.currentIndex });
    }
  }

  getFormChild = () => {
    const { children } = this.props;
    const { currentIndex } = this.state;
    return React.Children.map(children, (c, _index) => {
      if (c) {
        const props = c.props;
        if (c.type.cuiName === "FormHeadTabs") {
          return (
            <FormHeadTabs
              key={_index}
              {...props}
              currentIndex={currentIndex}
              onClick={this.clickHead}
            />
          );
        }

        if (c.type.cuiName === "FormContentTabs") {
          return (
            <FormContentTabs
              {...props}
              currentIndex={currentIndex}
              key={_index}
            />
          );
        }
        if (c.type.cuiName === "FormLump") {
          return <FormLump {...props} key={_index} />;
        }
        if (c.type.cuiName === "FormBtn") {
          return <FormBtn key={_index} {...props} />;
        }
      }
    });
  };

  // 点击头部的 tab
  clickHead = (e, index) => {
    const { onClick } = this.props;
    this.setState({ currentIndex: index });
    onClick && onClick(e, index);
  };

  render() {
    const { className, keySize, mod, customMsg } = this.props;
    const formCls = classNames({
      "u-formFrame": true,
      [`${className}`]: !!className,
      [keySize]: !!keySize
    });

    const showMessage = () => {
      if (customMsg === undefined) {
        return <FormMessage mod={mod} />;
      } else {
        return customMsg ? <FormMessage mod={mod} /> : null;
      }
    };

    return (
      <div>
        {/* {showMessage()} */}
        <div className={formCls} ref={d => (this._formFrame = d)}>
          {this.getFormChild()}
        </div>
      </div>
    );
  }
}

FormFrame.FormHeadTabs = FormHeadTabs;
FormFrame.FormHeadTab = FormHeadTab;
FormFrame.FormContentTip = FormContentTip;
FormFrame.FormContentTabs = FormContentTabs;
FormFrame.FormContentTab = FormContentTab;
FormFrame.FormLump = FormLump;
FormFrame.FormBtn = FormBtn;

export default FormFrame;
