import { Input, Loading, Modal } from "caicloud-ui";
import { reduxForm } from "caicloud-redux-form";
import PropTypes from "prop-types";
import FormField from "../public/formField_v2";
import { required } from "../public/validate";
import { GetProjects, GetRepositories } from "../../services/index";
import { browserHistory } from "react-router";

const test = true;
class ImageSelect extends React.Component {
  static propTypes = {
    params: PropTypes.object,
    deployment: PropTypes.string,
    registryList: PropTypes.list,
    change: PropTypes.func
  };

  state = {
    loading: true
  };

  componentDidMount() {
    const { deployment, registryList } = this.props;
    const pathname = browserHistory.getCurrentLocation().pathname.split("/");
    const isUpdate = pathname[pathname.length - 1] === "update";
    this.setState({ isUpdate });
    this.setState({
      loading: false,
      registryList: registryList,
      registryValue: isUpdate
        ? _.get(deployment, "spec.sourceImage.registry")
        : registryList[0],
      projectValue: isUpdate
        ? _.get(deployment, "spec.sourceImage.project")
        : ""
    });
  }

  renderInput = ({
    input,
    meta,
    payload: { list, onFocus, onChange, placeholder, disabled = false }
  }) => {
    const _attr = _.assign({}, input, meta);
    return (
      //<Tooltip text="不能为空" placement="top" type="error">
      <Input
        field={_attr}
        placeholder={placeholder}
        disabled={disabled}
        width={150}
        onChange={onChange}
        onFocus={onFocus}
        suggestion={{ list }}
      />
      //</Tooltip>
    );
  };

  changeRegistry = val => {
    const { change } = this.props;
    change("spec.sourceImage.project", "");
    change("spec.sourceImage.name", "");
    this.setState({
      registryValue: val,
      projectValue: ""
    });
  };

  focusProject = () => {
    //console.log(this.state.registryValue);
    const { registryValue, nameList } = this.state;
    if (test) {
      this.setState({
        projectList: ["google", "facebook"]
      });
    } else {
      GetProjects({ registry: nameList[registryValue] }, projects => {
        const projectList = [];
        if (_.get(projects, "items")) {
          for (let item of _.get(projects, "items")) {
            const project = _.get(item, "metadata.name", "");
            projectList.push(project);
          }
        }
        this.setState({ projectList });
      });
    }
  };

  changeProject = e => {
    const { change } = this.props;
    change("spec.sourceImage.name", "");
    if (test) {
      this.setState({
        projectValue: e.target.value
      });
    }
  };

  focusName = () => {
    const { projectList, projectValue, registryValue, nameList } = this.state;
    if (projectList && projectList.indexOf(projectValue) === -1) {
      Modal.confirm({
        title: `content project: ${projectValue} not found`
      });
    } else {
      if (test) {
        this.setState({ repoList: ["V1.0.0", "V1.1.1"] });
      } else {
        GetRepositories(
          {
            registry: nameList[registryValue],
            project: projectValue
          },
          repositories => {
            const repoList = [];
            if (_.get(repositories, "items")) {
              for (let item of _.get(repositories, "items")) {
                const repository = _.get(item, "metadata.name", "");
                repoList.push(repository);
              }
            }
            this.setState({ repoList });
          }
        );
      }
    }
  };

  render() {
    const {
      registryList,
      projectList,
      projectValue,
      repoList,
      loading,
      isUpdate
    } = this.state;
    return loading ? (
      <Loading className="app-loading" />
    ) : (
      <div>
        <span className="name">更新镜像源</span>
        <div className="value">
          <FormField
            noKey
            fieldName="spec.sourceImage.registry"
            component="Select"
            payload={{
              items: registryList,
              placeholder: "选择仓库",
              onChange: this.changeRegistry,
              width: 150
            }}
            validate={[required]}
          />
        </div>
        <span className="slash"> / </span>
        <div className="value">
          <FormField
            noKey
            fieldName="spec.sourceImage.project"
            component={this.renderInput}
            payload={{
              list: projectList,
              placeholder: "选择项目",
              disabled: false,
              onChange: this.changeProject,
              onFocus: this.focusProject
            }}
            validate={[required]}
          />
        </div>
        <span className="slash"> / </span>
        <div className="value">
          <FormField
            noKey
            fieldName="spec.sourceImage.name"
            component={this.renderInput}
            payload={{
              list: repoList,
              onFocus: this.focusName,
              placeholder: "选择仓库",
              disabled: isUpdate ? false : projectValue ? false : true
            }}
            validate={[required]}
          />
        </div>
      </div>
    );
  }
}

const ReduxImageSelect = reduxForm({
  form: "add"
  //getFormState: state => state.form_v6
})(ImageSelect);

export default ReduxImageSelect;
