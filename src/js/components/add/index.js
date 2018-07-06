import { Loading } from "caicloud-ui";
import { browserHistory } from "react-router";
import PropTypes from "prop-types";
import { required } from "../public/validate";
import { reduxForm } from "caicloud-redux-form";
import FormField from "../public/formField_v2";
import FormFrame from "../public/formFrame";
import ImageSelect from "./imageSelect";
import AppSelect from "./appSelect";
import {
  GetRegistries,
  GetClusters,
  GetDeployment,
  CreateDeployment,
  UpdateDeployment
} from "../../services/index";

const { FormLump, FormBtn } = FormFrame;
const testData = {
  metadata: {
    id: "6f16d5e7ff2272c9cd45b24fde186681",
    name: "deploy-cyclone",
    alias: "deploy cyclone",
    creationTime: "2017-08-23T21:17:09.379754063+08:00",
    lastUpdateTime: "2017-08-25T21:17:09.379754063+08:00"
  },
  spec: {
    sourceImage: {
      // object, always
      registry: "cargo.caicloud.io1", // string, always
      project: "caicloud", // string, always
      name: "busybox" // string, always
    },
    targetApplication: {
      // object, always
      cluster: "123", // string, always
      partition: "partition1", // string, always
      application: "app1", // string, always
      container: "c0" // string, always
    },
    trigger: {
      // object, always
      type: "Manual" // string, always
    }
  },
  status: {
    lastExecutionTime: "2017-08-25T21:17:09.379754063+08:00",
    successCount: 10,
    failedCount: 1
  }
};
const test = true;
class Add extends React.Component {
  static propTypes = {
    params: PropTypes.object,
    deployment: PropTypes.string,
    initialize: PropTypes.func,
    handleSubmit: PropTypes.func
  };

  state = {
    index: 1,
    loading: true
  };

  componentDidMount() {
    const { params: { deployment } } = this.props;
    const pathname = browserHistory.getCurrentLocation().pathname.split("/");
    const isUpdate = pathname[pathname.length - 1] === "update";
    if (test) {
      //testData.spec.sourceImage.registry = "Default";
      const domainList = [];
      const idList = [];
      const nameList = [];
      domainList["default"] = "cargo.caicloud.io1";
      domainList["test"] = "cargo.caicloud.io2";
      idList["cluster1"] = "123";
      idList["cluster2"] = "321";
      nameList["Default"] = "default";
      nameList["Test"] = "test";
      this.setState(
        {
          deployment: _.cloneDeep(testData),
          loading: false,
          registryList: ["Default", "Test"],
          clusterList: ["cluster1", "cluster2"],
          domainList,
          idList,
          nameList,
          isUpdate
        },
        () => {
          if (isUpdate) {
            const { deployment, domainList, idList, nameList } = this.state;
            //console.log(domainList, idList);
            const { initialize } = this.props;
            //console.log(deployment);
            for (let domain in domainList) {
              if (
                domainList[domain] ===
                _.get(deployment, "spec.sourceImage.registry")
              ) {
                for (let name in nameList) {
                  if (nameList[name] === domain) {
                    deployment.spec.sourceImage.registry = name;
                    break;
                  }
                }
              }
            }
            for (let id in idList) {
              //console.log(idList[id] === );
              if (
                idList[id] ===
                _.get(deployment, "spec.targetApplication.cluster")
              ) {
                deployment.spec.targetApplication.cluster = id;
                break;
              }
            }
            initialize(deployment);
          }
        }
      );
    } else {
      const getDeployment = new Promise((resolve, reject) => {
        GetDeployment(deployment, deployObj => {
          this.setState({ deployment: deployObj }, () => {
            resolve();
          });
          reject();
        });
      });

      //获取所有的registry的信息，name和domain行成mapping关系，分别用 registryList 以及 domainList
      const getRegistries = new Promise((resolve, reject) => {
        GetRegistries(registries => {
          const registryList = [];
          const domianList = [];
          const nameList = [];
          if (_.get(registries, "items")) {
            for (let item of _.get(registries, "items")) {
              const registry = _.get(item, "metadata.name", "");
              registryList.push(registry);
              const registryDomain = _.get(item, "spec.domain", "");
              domianList[registry] = registryDomain;
            }
            for (let item of _.get(registries, "items")) {
              const registryAlias = _.get(item, "metadata.alias", "");
              const registryName = _.get(item, "metadata.name", "");
              nameList[registryAlias] = registryName;
            }
          }
          this.setState({ registryList, domianList, nameList }, () => {
            resolve();
          });
        });

        reject();
      });

      //the same as above function
      const getClusters = new Promise((resolve, reject) => {
        GetClusters(clusters => {
          const clusterList = [];
          const idList = [];
          if (_.get(clusters, "items")) {
            for (let item of _.get(clusters, "items")) {
              const cluster = _.get(item, "spec.displayName", "");
              clusterList.push(cluster);
              const clusterId = _.get(item, "metadata.id", "");
              idList[cluster] = clusterId;
            }
          }

          this.setState({ clusterList, idList }, () => {
            resolve();
          });
        });
        reject();
      });

      Promise.all([getRegistries, getClusters, getDeployment], () => {
        const { initialize, domainList, clusterList } = this.state;
        for (let domain in domainList) {
          if (
            domainList[domain] ===
            _.get(deployment, "spec.sourceImage.registry")
          ) {
            deployment.spec.sourceImage.registry = domain;
            break;
          }
        }
        for (let cluster in clusterList) {
          if (
            clusterList[cluster] ===
            _.get(deployment, "spec.sourceImage.registry")
          ) {
            deployment.spec.targetApplication.cluster = cluster;
            break;
          }
        }
        this.setState({ deployment, loading: false }, () => {
          initialize(deployment);
        });
      });
    }
  }

  submit = data => {
    const { nameList, idList, domainList, isUpdate } = this.state;
    const { params: { deployment } } = this.props;
    const formData = _.cloneDeep(data);
    const registryName = nameList[_.get(formData, "spec.sourceImage.registry")];
    if (_.get(formData, "spec.sourceImage")) {
      formData.spec.sourceImage.registry = domainList[registryName];
    }

    if (_.get(formData, "spec.targetApplication")) {
      formData.spec.targetApplication.cluster =
        idList[_.get(formData, "spec.targetApplication.cluster")];
    }
    if (test) {
      //console.log(formData);
      if (isUpdate) {
        browserHistory.replace(`/plugin/cd-manager/deployments/${deployment}`);
      } else {
        browserHistory.push(`/plugin/cd-manager`);
      }
    } else {
      if (isUpdate) {
        UpdateDeployment(deployment, formData, () => {
          browserHistory.push(`/plugin/cd-manager/deployments/${deployment}`);
        });
      } else {
        CreateDeployment(formData, () => {
          browserHistory.push(`/plugin/cd-manager`);
        });
      }
    }
  };

  render() {
    //const { params: { deployment } } = this.props;
    const { handleSubmit } = this.props;
    const {
      loading,
      deployment,
      registryList,
      clusterList,
      idList,
      domianList,
      nameList
    } = this.state;
    return loading ? (
      <Loading />
    ) : (
      <form className="plugin-cd-add" onSubmit={handleSubmit(this.submit)}>
        <FormFrame keySize="lg">
          <FormLump title="基本信息">
            <FormField
              name={"名称"}
              component="Input"
              fieldName="metadata.alias"
              width={400}
              maxlength="32"
              tip={"支持中文和特殊符号，长度限制 2-32 个字符。"}
              onChange={this.changeName}
              required
              validate={[required]}
              //onChange={e => console.log(e.target.value)}
            />
            <div className="source-image">
              <ImageSelect
                deployment={deployment}
                registryList={registryList}
                domianList={domianList}
                nameList={nameList}
              />
            </div>
            <div className="source-image">
              <AppSelect
                deployment={deployment}
                clusterList={clusterList}
                idList={idList}
              />
            </div>
            <FormField
              name={"触发策略"}
              fieldName="spec.trigger.type"
              component="Radio"
              width={134}
              payload={{
                items: [
                  {
                    name: "更新触发",
                    value: "OnPush"
                  },
                  {
                    name: "手动触发",
                    value: "Manual"
                  }
                ]
              }}
              autoSelected
              validate={[required]}
            />
          </FormLump>
          <FormBtn />
        </FormFrame>
      </form>
    );
  }
}

const AddForm = reduxForm({
  form: "add"
})(Add);

export default AddForm;
