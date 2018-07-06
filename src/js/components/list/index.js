import { DataGrid, Button, Ico, IcoSvg, Menu, Modal } from "caicloud-ui";
import { browserHistory } from "react-router";
import moment from "moment";
import {
  ListDeployments,
  GetRegistries,
  DeleteDeployment,
  GetClusters
} from "../../services/index";
const { Actions } = DataGrid;
const PAGE_LIMIT = 10;
const { EllipsisMenu } = Menu;
const testData = {
  metadata: {
    id: "6f16d5e7ff2272c9cd45b24fde186681",
    name: "deploy-cyclone",
    alias: "deploy cyclone",
    creationTime: "2017-08-23T21:17:09.379754063+08:00",
    lastUpdateTime: "2017-08-25T21:17:09.379754063+08:00",
    total: 1
  },
  spec: {
    sourceImage: {
      // object, always
      registry: "cargo.caicloud.io", // string, always
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
export default class List extends React.Component {
  state = {
    paging: {
      limit: PAGE_LIMIT
    },
    loading: false,
    total: 0
  };

  componentDidMount() {
    if (test) {
      const registryList = [];
      registryList["cargo.caicloud.io"] = "Default";
      const clusterList = [];
      clusterList["123"] = "cluster1";
      this.setState({ registryList, clusterList });
    }
  }

  ListDeployment() {
    this.setState({ loading: true });
    ListDeployments(deploymentList => {
      if (_.get(deploymentList, "items")) {
        GetRegistries(registries => {
          this.setState(registries, () => {
            this.updateDeploymentList(_.get(deploymentList, "items"));
          });
        });
      }
    });
  }

  updateDeploymentList(deploymentList) {
    const { registryList, clusterList } = this.state;

    const registry = _.get(deploymentList, "spec.sourceImage.registry");
    const cluster = _.get(deploymentList, "spec.targetApplication.cluster");
    const newList = {
      metadata: {
        alias: _.get(deploymentList, "metadata.alias", ""),
        name: _.get(deploymentList, "metadata.name", "")
      },
      spec: {
        //_.get(deploymentList, "spec.trigger.name", "")
        sourceImage: `${registryList[registry]}/${_.get(
          deploymentList,
          "spec.sourceImage.project",
          ""
        )}/${_.get(deploymentList, "spec.sourceImage.name", "")}`,
        targetApplication: `${clusterList[cluster]}/${_.get(
          deploymentList,
          "spec.targetApplication.partition",
          ""
        )}/${_.get(deploymentList, "spec.targetApplication.application", "")}`,
        trigger: {
          type: _.get(deploymentList, "spec.trigger.name", "")
        }
      },
      status: {
        lastExecutionTime: _.get(
          deploymentList,
          "status.lastExecutionTime",
          ""
        ),
        count: `${_.get(deploymentList, "status.successCount", "")}/${_.get(
          deploymentList,
          "status.successCount",
          ""
        ) + _.get(deploymentList, "status.failedCount", "")}`
      },
      operaion: "操作"
    };

    return newList;
    //this.setState({ deploymentList: newList, loading: false });
  }

  ListDeploymentList = (query = {}) => {
    const {
      deploymentList = [],
      paging: { start = 0, limit = PAGE_LIMIT }
    } = this.state;

    this.setState({ loading: true });
    const data = {
      ...query,
      start,
      limit
    };
    if (test) {
      const registryList = [];
      registryList["cargo.caicloud.io"] = "Default";
      const clusterList = [];
      clusterList["123"] = "cluster1";
      this.setState({ registryList, clusterList }, () => {
        deploymentList.push(testData);
        const nextState = deploymentList.map(element =>
          this.updateDeploymentList(element)
        );
        this.setState({ deploymentList: nextState, total: 1 });
      });
    } else {
      ListDeployments(data, deploymentList => {
        if (_.get(deploymentList, "items")) {
          //获取所有的registry的信息，name和domain行成mapping关系，分别用 registryList 以及 domainList
          const getRegistries = new Promise((resolve, reject) => {
            GetRegistries(registries => {
              const registryList = [];
              if (_.get(registries, "items")) {
                for (let item of _.get(registries, "items")) {
                  const registryDomain = _.get(item, "spec.domain", "");
                  const registry = _.get(item, "metadata.alias", "");
                  registryList[registryDomain] = registry;
                }
              }

              this.setState({ registryList }, () => {
                resolve();
              });
            });

            reject();
          });

          //the same as above function
          const getClusters = new Promise((resolve, reject) => {
            GetClusters(clusters => {
              const clusterList = [];
              if (_.get(clusters, "items")) {
                for (let item of _.get(clusters, "items")) {
                  const clusterId = _.get(item, "metadata.id", "");
                  const cluster = _.get(item, "spec.displayName", "");
                  clusterList[clusterId] = cluster;
                }
              }

              this.setState({ clusterList }, () => {
                resolve();
              });
            });
            reject();
          });

          Promise.all([getRegistries, getClusters], () => {
            const nextState = _.get(deploymentList, "items").map(element =>
              this.updateDeploymentList(element)
            );

            this.setState({
              deploymentList: nextState,
              total: deploymentList.metadata.total,
              loading: false
            });
          });
        }
      });
    }
  };

  getNames = () => {};

  goToDetail(row) {
    browserHistory.push(
      `/plugin/cd-manager/deployments/${_.get(row, "metadata.name")}`
    );
  }

  add() {
    browserHistory.push(`/plugin/cd-manager/add`);
  }

  update(row) {
    const deplomentName = _.get(_.get(row, "row"), "_original.metadata.name");
    browserHistory.push(
      `/plugin/cd-manager/deployments/${deplomentName}/update`
    );
  }

  delete(row) {
    const { paging: { start = 0, limit = PAGE_LIMIT } } = this.state;
    const deploymentName = _.get(_.get(row, "row"), "_original.metadata.name");
    if (!test) {
      DeleteDeployment(deploymentName, () => {
        this.ListDeploymentList({ start, limit });
      });
    }
    //this.ListDeploymentList({ start, limit });
  }

  confirmDelete = row => {
    Modal.confirm({
      title: "你点击了按钮，这里是个提示",
      onConfirm: (e, close) => {
        close(); // 关闭确认框
        this.delete(row);
      }
    });
  };

  render() {
    const columns = [
      {
        Header: "名称",
        accessor: "metadata.alias"
      },
      {
        Header: "更新镜像源",
        accessor: "spec.sourceImage"
      },
      {
        Header: "待更新应用",
        accessor: "spec.targetApplication"
      },
      {
        Header: "触发策略",
        accessor: "spec.trigger.type",
        Cell: row => {
          return row.value === "OnPush" ? "自动触发" : "手动触发";
        }
      },
      {
        Header: "最近执行时间",
        accessor: "status.lastExecutionTime",
        Cell: row => {
          return moment(row.value).format("YYYY-MM-DD HH:mm:ss");
        }
      },
      {
        Header: "执行次数",
        accessor: "status.count",
        maxWidth: 100
      },
      {
        Header: "操作",
        accessor: "operation",
        width: 70,
        Cell: row => {
          return (
            <Actions>
              <EllipsisMenu
                texts={["修改配置", "删除"]}
                size="small"
                onClicks={[
                  () => this.update(row),
                  () => this.confirmDelete(row)
                ]}
              />
            </Actions>
          );
        }
      }
    ];
    const { deploymentList, loading, paging, total } = this.state;
    //const testData = [deploymentList];

    return (
      <div className="plugin-cd-list">
        <Button className="blue btn-new" onClick={this.add}>
          <Ico type={IcoSvg.plus} />新增
        </Button>
        <DataGrid
          loading={loading}
          data={deploymentList}
          columns={columns}
          onRowClick={row => this.goToDetail(row)}
          onFetchData={this.ListDeploymentList}
          paging={{
            ...paging,
            total
          }}
          fetchParams={{ ...paging }}
          onPagination={paging => this.setState({ paging })}
          autoUpdateQuery={true}
        />
      </div>
    );
  }
}
