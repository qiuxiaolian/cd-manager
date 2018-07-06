import {
  Detail2 as Detail,
  Tabs,
  Menu,
  Button,
  Modal,
  Loading
} from "caicloud-ui";
import Overview from "./overview";
import PropTypes from "prop-types";
import { browserHistory } from "react-router";
import {
  GetDeployment,
  GetRegistries,
  GetImageTag,
  GetResources,
  TriggerDeployment,
  GetClusters,
  DeleteDeployment
} from "../../services/index";
import moment from "moment";

const {
  DetailHead,
  DetailHeadName,
  DetailHeadItem,
  DetailHeadContent,
  DetailBody,
  DetailHeadStatus,
  DetailAction
} = Detail;

const { Tab, TabHeads, TabContent, TabContents } = Tabs;
const { EllipsisMenu } = Menu;

const test = true;

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
      cluster: "cluster1", // string, always
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
export default class CDDetail extends React.Component {
  state = {
    deployment: {},
    loading: true,
    latestTag: "1.0.2",
    image: {
      registry: "default",
      project: "caicloud",
      repository: "busybox",
      latestTag: "v1.0.0"
    },
    curImage: "v3.2.2",
    updateBtnDisabled: false
  };

  componentDidMount() {
    const { params: { deployment } } = this.props;
    this.setState({ loading: true });
    //console.log(mission);
    this.SetDeployment(deployment);
  }

  componentDidUpdate() {}

  SetDeployment = deployment => {
    if (!test) {
      GetDeployment(deployment, res => {
        this.SetDeployment(res);
      });
    } else {
      this.setState({
        deployment: testData,
        image: {
          registry: "Default",
          project: "caicloud",
          repository: "busybox",
          latestTag: "v1.1.0"
        },
        application: {
          cluster: "cluster1",
          partition: "partition1",
          application: "application1"
        },
        curImage: "v1.0.1",
        loading: false
      });
    }
  };

  SetRegistries = deployment => {
    GetRegistries(registries => {
      let registry = "Default";
      if (_.get(registries, "items")) {
        for (let item of registries) {
          if (
            _.get(item, "spec.domain") ===
            _.get(deployment, "spec.sourceImage.registry")
          ) {
            registry = _.get(item, "metadata.alias");
          }
        }
      }
      let project = _.get(deployment, "spec.sourceImage.project");
      let repository = _.get(deployment, "spec.sourceImage.name");
      this.SetImageTag(registry, project, repository, deployment);
    });
  };
  // data.items[0].metadata.name
  SetImageTag = (registry, project, repository, deployment) => {
    GetImageTag(
      { registry: registry.toLowerCase(), project, repository },
      data => {
        const latestTag = _.get(data, "items[0].metadata.name");
        this.setState(
          { image: { registry, project, repository, latestTag } },
          this.SetApplication(deployment)
        );
      }
    );
  };

  SetApplication(deployment) {
    GetClusters(clusters => {
      let cluster = "";
      if (_.get(clusters, "items")) {
        for (let item of _.get(clusters, "items")) {
          if (
            _.get(
              deployment,
              "spec.targetApplication.cluster" === _.get(item, "metadata.id")
            )
          ) {
            cluster = _.get(item, "spec.displayName");
          }
        }
      }

      const clusterID = _.get(deployment, "spec.targetApplication.cluster");
      const partition = _.get(deployment, "spec.targetApplication.partition");
      const application = _.get(
        deployment,
        "spec.targetApplication.application"
      );
      this.setState({ application: { cluster, partition, application } });
      GetResources({ clusterID, partition, application }, app => {
        let curImage = "";
        const { image } = this.state;
        const pods = _.get(app, "pods");
        if (!pods[0]) {
          Modal.confirm({
            title: `Can't find pods`,
            maskClosable: true
          });
          return;
        }
        for (let container of _.get(pods[0], "spec.containers")) {
          const imageAddress = `${_.get(
            deployment,
            "spec.sourceImage.registry"
          )}/${_.get(image, "project")}/${_.get(image, "repository")}`;
          if (_.get(container, "spec.image").startsWith(imageAddress)) {
            curImage = _.get(container, "spec.image");
          }
        }

        if (curImage.split(":")[1] === _.get(image, "latestTag")) {
          this.setState({
            updateBtnDisabled: true,
            curImage: curImage.split(":")[1],
            application: { cluster, partition, application },
            loading: false
          });
        } else {
          this.setState({
            updateBtnDisabled: false,
            curImage: curImage.split(":")[1],
            application: { cluster, partition, application },
            loading: false
          });
        }
      });
    });
  }

  update = () => {
    const { params: { deployment } } = this.props;
    browserHistory.push(`/plugin/cd-manager/deployments/${deployment}/update`);
  };

  confirmUpdate = () => {
    const { curImage, image, application } = this.state;
    Modal.confirm({
      title: "是否立即将",
      content: (
        <div className="confirm-update">
          <p>
            <span className="image-name">
              {_.get(application, "cluster", "")}/{_.get(
                application,
                "partition",
                ""
              )}/{_.get(application, "application", "")}
            </span>{" "}
            镜像从{" "}
          </p>
          <p className="from-to">
            <span style={{ color: "orange" }}>{curImage}</span> 更新到{" "}
            <span style={{ color: "orange" }}>
              {_.get(image, "latestTag", "")}
            </span>
          </p>
        </div>
      ),
      onConfirm: (e, close) => {
        close(); // 关闭确认框
        this.updateMission();
      }
    });
  };

  updateMission() {
    const { deployment } = this.state;
    if (!test) {
      const data = { spec: _.get(deployment, "spec") };
      TriggerDeployment(deployment, data, res => {
        this.setState({ deployment: res });
      });
    } else {
      this.setState({ deployment });
    }
  }

  delete() {
    const { params: { deployment } } = this.props;
    if (!test) {
      DeleteDeployment(deployment);
    }
    browserHistory.push("/plugin/cd-manager");
  }

  confirmDelete = () => {
    Modal.confirm({
      title: "你点击了按钮，这里是个提示",
      onConfirm: (e, close) => {
        close(); // 关闭确认框
        this.delete();
      }
    });
  };

  render() {
    //const { params: { deployment } } = this.props;
    const {
      deployment,
      loading,
      image,
      curImage,
      updateBtnDisabled,
      application
    } = this.state;
    const component = (
      <DetailAction className="plugin-cd-detail-action">
        <Button
          className="no-margin-right small btn"
          onClick={() => this.confirmUpdate()}
          disabled={updateBtnDisabled}
        >
          更新任务
        </Button>
        <EllipsisMenu
          className="ellipsis-menu"
          texts={["修改配置", "删除"]}
          onClicks={[() => this.update(), () => this.confirmDelete()]}
        />
      </DetailAction>
    );

    return loading ? (
      <Loading />
    ) : (
      <Detail className="plugin-cd-detail" actions={component}>
        <DetailHead>
          <DetailHeadName>
            {_.get(deployment, "metadata.alias", "")}
          </DetailHeadName>
          <DetailHeadContent className="detail-head-content">
            <DetailHeadItem
              name="更新镜像源"
              value={`${_.get(image, "registry", "")}/${_.get(
                image,
                "project",
                ""
              )}/${_.get(image, "repository", "")}`}
            />
            <DetailHeadItem name="当前最新Tag" value={image.latestTag} />
            <DetailHeadItem
              name="最近修改时间"
              value={moment(deployment.metadata.creationTime).format(
                "YYYY-MM-DD HH:mm:ss"
              )}
            />
          </DetailHeadContent>
          <DetailHeadStatus>
            <div className="rich-status-item">
              <div className="status-title">触发策略</div>
              <div className="content">
                {_.get(deployment, "spec.trigger") === "OnPush"
                  ? "更新"
                  : "手动"}
              </div>
            </div>
            <div className="rich-status-item">
              <div className="status-title">执行次数</div>
              <div className="content">
                {_.get(deployment, "status.successCount", 0)}/{_.get(
                  deployment,
                  "status.successCount",
                  0
                ) + _.get(deployment, "status.failedCount", 0)}
              </div>
            </div>
          </DetailHeadStatus>
        </DetailHead>
        <DetailBody>
          <Tabs>
            <TabHeads>
              <Tab>概览</Tab>
            </TabHeads>
            <TabContents>
              <TabContent>
                <Overview
                  className="cai-tabs-content"
                  deployment={deployment}
                  image={image}
                  application={application}
                  curImage={curImage}
                />
              </TabContent>
            </TabContents>
          </Tabs>
        </DetailBody>
      </Detail>
    );
  }
}

CDDetail.propTypes = {
  params: PropTypes.object
};
