import { Loading, Input, Modal } from "caicloud-ui";
import { reduxForm } from "caicloud-redux-form";
import FormField from "../public/formField_v2";
import PropTypes from "prop-types";
import { required } from "../public/validate";
import { browserHistory } from "react-router";
import {
  GetPartitions,
  GetApplications,
  GetResources
} from "../../services/index";

const test = true;
class AppSelect extends React.Component {
  static propTypes = {
    params: PropTypes.object,
    deployment: PropTypes.string,
    change: PropTypes.func,
    clusterList: PropTypes.array,
    idList: PropTypes.array
  };

  state = {
    loading: true
  };

  componentDidMount() {
    const { deployment, clusterList } = this.props;
    const pathname = browserHistory.getCurrentLocation().pathname.split("/");
    const isUpdate = pathname[pathname.length - 1] === "update";
    this.setState({
      clusterList,
      isUpdate,
      loading: false,
      clusterValue: isUpdate
        ? _.get(deployment, "spec.targetApplication.cluster", "")
        : clusterList[0],
      partitionValue: isUpdate
        ? _.get(deployment, "spec.targetApplication.partition", "")
        : "",
      applicationValue: isUpdate
        ? _.get(deployment, "spec.targetApplication.application", "")
        : ""
    });
  }

  //生成相对应的input组件
  renderInput = ({
    input,
    meta,
    payload: { list, onFocus, onChange, placeholder, disabled = false }
  }) => {
    const _attr = _.assign({}, input, meta);
    return (
      <Input
        field={_attr}
        placeholder={placeholder}
        disabled={disabled}
        width={150}
        onChange={onChange}
        onFocus={onFocus}
        suggestion={{ list }}
      />
    );
  };

  changeCluster = val => {
    const { change } = this.props;
    change("spec.targetApplication.partition", "");
    change("spec.targetApplication.application", "");
    change("spec.targetApplication.container", "");

    this.setState({ clusterValue: val, applicationValue: "", container: "" });
  };

  focusPartition = () => {
    if (test) {
      this.setState({
        partitionList: ["partition1", "partition2"]
      });
    } else {
      const { clusterValue } = this.state;
      const { idList } = this.props;
      GetPartitions({ clusterID: idList[clusterValue] }, partitions => {
        const partitionList = [];
        if (_.get(partitions, "items")) {
          for (let item of _.get(partitions, "items")) {
            const partition = _.get(item, "metadata.partition");
            partitionList.push(partition);
          }
        }
        this.setState({ partitionList });
      });
    }
  };

  changePartition = e => {
    const { change } = this.props;
    change("spec.targetApplication.application", "");
    change("spec.targetApplication.container", "");
    this.setState({
      applicationValue: "",
      partitionValue: e.target.value
    });
  };

  focusApplication = () => {
    if (test) {
      const { partitionList, partitionValue } = this.state;
      if (partitionList && partitionList.indexOf(partitionValue) === -1) {
        Modal.confirm({
          title: `content Partition: ${partitionValue} not found`
        });
      } else {
        this.setState({
          applicationList: ["app1", "app2"]
        });
      }
    } else {
      const { partitionList, partitionValue, clusterValue } = this.state;
      const { idList } = this.props;
      if (partitionList && partitionList.indexOf(partitionValue) === -1) {
        Modal.confirm({
          title: `content Partition: ${partitionValue} not found`,
          maskClosable: true
        });
      } else {
        GetApplications(
          {
            clusterID: idList[clusterValue],
            partition: partitionValue
          },
          applications => {
            const applicationList = [];
            if (_.get(applications, "items")) {
              for (let item of _.get(applications, "items")) {
                const application = _.get(item, "metadata.partition");
                applicationList.push(application);
              }
            }
            this.setState({ applicationList });
          }
        );
      }
    }
  };

  changeApplication = e => {
    const { change } = this.props;
    change("spec.targetApplication.container", "");
    this.setState({ applicationValue: e.target.value });
  };

  focusContainer = () => {
    const {
      partitionValue,
      clusterValue,
      applicationList,
      applicationValue
    } = this.state;
    if (applicationList && applicationList.indexOf(applicationValue) === -1) {
      Modal.confirm({
        title: `content Application: ${applicationValue} not found`
      });
    } else {
      if (test) {
        this.setState({
          containerList: ["c0", "c1", "c2"]
        });
      } else {
        const { idList } = this.props;
        GetResources(
          {
            clusterID: idList[clusterValue],
            partition: partitionValue,
            application: applicationValue
          },
          resources => {
            const pods = _.get(resources, "pods");
            if (!pods[0]) {
              Modal.confirm({
                title: `Can't find pods`,
                maskClosable: true
              });
              return;
            }

            const containerList = [];
            for (let pod of _.get(pods[0], "spec.containers")) {
              const container = _.get(pod, "metadata.name");
              containerList.push(container);
            }

            this.setState({ containerList });
          }
        );
      }
    }
  };

  render() {
    const {
      loading,
      clusterList,
      partitionList,
      applicationList,
      containerList,
      partitionValue,
      applicationValue,
      isUpdate
    } = this.state;
    return loading ? (
      <Loading className="app-loading" />
    ) : (
      <div>
        <span className="name">待更新应用</span>
        <div className="value">
          <FormField
            noKey
            fieldName="spec.targetApplication.cluster"
            component="Select"
            payload={{
              items: clusterList,
              placeholder: "选择集群",
              onChange: this.changeCluster,
              width: 150
            }}
            validate={[required]}
          />
        </div>
        <span className="slash"> / </span>
        <div className="value">
          <FormField
            noKey
            fieldName="spec.targetApplication.partition"
            component={this.renderInput}
            payload={{
              list: partitionList,
              placeholder: "选择分区",
              disabled: false,
              onChange: this.changePartition,
              onFocus: this.focusPartition
            }}
            validate={[required]}
          />
        </div>
        <span className="slash"> / </span>
        <div className="value">
          <FormField
            noKey
            fieldName="spec.targetApplication.application"
            component={this.renderInput}
            payload={{
              list: applicationList,
              placeholder: "选择应用",
              disabled: isUpdate ? false : partitionValue ? false : true,
              onChange: this.changeApplication,
              onFocus: this.focusApplication
            }}
            validate={[required]}
          />
        </div>
        <span className="slash"> / </span>
        <div className="value">
          <FormField
            noKey
            fieldName="spec.targetApplication.container"
            component={this.renderInput}
            payload={{
              list: containerList,
              placeholder: "选择容器",
              disabled: isUpdate ? false : applicationValue ? false : true,
              onChange: this.changeContainer,
              onFocus: this.focusContainer
            }}
            validate={[required]}
          />
        </div>
      </div>
    );
  }
}

const ReduxAppSelect = reduxForm({
  form: "add"
  //getFormState: state => state.form_v6
})(AppSelect);

export default ReduxAppSelect;
