import { Button } from "caicloud-ui";
import classNames from "classnames";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { browserHistory } from "react-router";

/**
 * submit button of form
 * 没有 children 的话，默认使用确认和取消两个按钮
 * submitText 可定义 submit btn 的 text
 * 如是 6.x 的 redux-form 在表单存在错误时，按钮右侧会出现提示
 */
class FormBtn extends React.Component {
  static cuiName = "FormBtn";
  static propTypes = {
    children: PropTypes.object,
    className: PropTypes.string,
    error: PropTypes.object,
    submitFailed: PropTypes.bool,
    submitText: PropTypes.string,
    onSubmit: PropTypes.func,
    cancelText: PropTypes.string,
    onCancel: PropTypes.func,
    form_v6: PropTypes.object,
    formName: PropTypes.string
  };

  getPosition = () => {
    const position = this._btn && this._btn.getBoundingClientRect();
    const top = _.get(position, "top", 0);
    const height = _.get(position, "height", 73);
    const clientHeight = window.innerHeight;
    return top + height === clientHeight;
  };

  render() {
    const {
      children,
      className,
      submitText,
      onSubmit,
      cancelText,
      onCancel,
      form_v6,
      formName
    } = this.props;
    const _submitText = submitText || "确定";
    const _cancelText = cancelText || "取消";
    const btnCls = classNames({
      "form-btn": true,
      [className]: !!className
    });
    const formInfo = _.get(form_v6, formName);
    // 不存在 validate error 的话，formInfo 中是没有 syncErrors 字段的
    const error = formInfo && formInfo.syncErrors;
    const submitFailed = formInfo && formInfo.submitFailed;
    // 是否正在提交
    const submitting = _.get(form_v6, `${formName}.submitting`, false);

    return (
      <div className={btnCls} ref={d => (this._btn = d)}>
        {children ? (
          children
        ) : (
          <div>
            <Button
              cls="blue"
              disabled={submitting}
              type="submit"
              onClick={onSubmit && onSubmit}
            >
              {_submitText}
            </Button>
            <Button
              cls="cancel"
              onClick={onCancel ? onCancel : () => browserHistory.goBack()}
            >
              {_cancelText}
            </Button>
          </div>
        )}
        {/* 长表单的才会在按钮旁边显示错误提示 */}
        {submitFailed &&
          error &&
          this.getPosition() && (
            <div className="error-tip">{"表单内存在格式错误，请检查"}</div>
          )}
      </div>
    );
  }
}

const stateToProps = state => {
  return {
    form_v6: state.form_v6
  };
};

const dispatchToProps = () => {
  return {};
};

export default connect(stateToProps, dispatchToProps)(FormBtn);
