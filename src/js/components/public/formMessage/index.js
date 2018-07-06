// Copyright 2018 caicloud authors. All rights reserved.

import PropTypes from "prop-types";
import { Ico, IcoSvg } from "caicloud-ui";
import { Connect } from "../lib/util";
import classNames from "classnames";
import Transition from "react-motion-ui-pack";

class FormMessage extends React.Component {
  static propTypes = {
    text: PropTypes.string,
    showClose: PropTypes.bool,
    style: PropTypes.object,
    mod: PropTypes.string, // post /api/cargo/workspaces，模块名称会是 cargo/workspaces
    http: PropTypes.object,
    ClearPostMsg: PropTypes.func.isRequired,
    show: PropTypes.func, // 用于直接发起的请求产生的错误的情况
    msgText: PropTypes.string,
    type: PropTypes.oneOf(["error", "tip"]),
    animation: PropTypes.bool // 是否需要动画
  };

  static defautlProps = {
    type: "error",
    animation: true
  };

  constructor(props) {
    super(props);
    this.state = {
      show: props.show
    };
  }

  componentWillReceiveProps(nextProps) {
    const { show } = this.props;
    if (nextProps.show !== show) {
      this.setState({ show: nextProps.show });
    }
  }

  componentWillUnMount() {
    const { ClearPostMsg, mod } = this.props;
    ClearPostMsg({ mod });
  }

  hideMeg = () => {
    this.setState({ show: false });
  };

  render() {
    const { http: { postRequest }, mod, msgText, type, animation } = this.props;
    const { show } = this.state;
    const cls = classNames({
      "u-system-message": true,
      [type]: !!type
    });
    // NOTE: 后续对方法需要处理
    const modInfo = _.get(postRequest, `${mod}`);

    const dom = (
      <div className={cls} style={{}} key="form-msg">
        <Ico type={IcoSvg.failedSmall} />
        <div className="error-text">{modInfo || msgText}</div>
        {/* // TODO: 要求设计师提供 20*20 大小的 close 图标 */}
        {type === "tip" && (
          <Ico
            type={IcoSvg.close}
            className="close"
            onClick={() => {
              this.hideMeg();
            }}
          />
        )}
      </div>
    );

    if (modInfo || (!mod && show)) {
      if (animation) {
        return (
          <Transition
            enter={{
              translateY: 0
            }}
            leave={{ translateY: -32 }}
          >
            {dom}
          </Transition>
        );
      } else {
        return dom;
      }
    }

    return null;
  }
}

module.exports = Connect(
  {
    http: "http"
  },
  "http",
  FormMessage
);
