import { DataGrid, CardBox, Status } from "caicloud-ui";
import { Fragment } from "react";
import moment from "moment";
import { ListRecord } from "../../services/index";
import PropTypes from "prop-types";

const { Actions } = DataGrid;
const PAGE_LIMIT = 10;

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
    result: "Failed",
    errorMessage: "release not found"
  }
};
const test = true;
export default class Overview extends React.Component {
  static propTypes = {
    deployment: PropTypes.object,
    curImage: PropTypes.string,
    application: PropTypes.object
  };

  state = {
    paging: {
      limit: PAGE_LIMIT
    },

    loading: false,
    total: 0
  };

  componentWillReceiveProps(nextProps) {
    const { deployment } = nextProps;
    const { paging: { start = 0, limit = PAGE_LIMIT } } = this.state;
    this.ListRecordList({ start, limit }, _.get(deployment, "metadata.name"));
  }

  ListRecordList = (query = {}, deployment) => {
    const {
      recordList = [],
      paging: { start = 0, limit = PAGE_LIMIT }
    } = this.state;

    this.setState({ loading: true });
    const data = {
      ...query,
      start,
      limit
    };

    if (test) {
      recordList.push(testData);
      const nextState = recordList;
      this.setState({
        recordList: nextState,
        total: recordList.length,
        loading: false
      });
      return;
    }

    ListRecord(deployment, data, recordList => {
      if (_.get(recordList, "items")) {
        const nextState = _.get(recordList, "items");

        this.setState({
          recordList: nextState,
          total: recordList.metadata.total,
          loading: false
        });
      }
    });
  };

  render() {
    const { deployment, curImage, application } = this.props;
    const { loading, paging, total, recordList } = this.state;
    const columns = [
      {
        Header: "状态",
        accessor: "status.result",
        Cell: row => {
          return (
            <Actions>
              {row.value === "Succeeded" ? (
                <Status text="成功" color="green" />
              ) : (
                <Status text="失败" color="red" />
              )}
            </Actions>
          );
        }
      },
      {
        Header: "开始时间",
        accessor: "metadata.creationTime",
        Cell: row => {
          return moment(row.value).format("YYYY-MM-DD HH:mm:ss");
        }
      },
      {
        Header: "结束时间",
        accessor: "metadata.lastUpdateTime",
        Cell: row => {
          return moment(row.value).format("YYYY-MM-DD HH:mm:ss");
        }
      },
      {
        Header: "触发原因",
        accessor: "status.type",
        Cell: row => {
          return row.value === "OnPush" ? "自动触发" : "手动触发";
        }
      },
      {
        Header: "备注",
        accessor: "status.errorMessage"
      }
    ];

    return (
      <Fragment>
        <CardBox
          title="基本信息"
          dataLeft={[
            {
              name: "待更新应用",
              value: `${_.get(application, "cluster", "")}/${_.get(
                application,
                "partition",
                ""
              )}/${_.get(application, "application", "")}`
            }
          ]}
          dataRight={[{ name: "当前镜像", value: curImage }]}
        />
        <div className="title-record">执行记录</div>
        <DataGrid
          loading={loading}
          columns={columns}
          data={recordList}
          onFetchData={(query = {}) =>
            this.ListRecordList(query, _.get(deployment, "metadata.name"))
          }
          paging={{
            ...paging,
            total
          }}
          fetchParams={{ ...paging }}
          onPagination={paging => this.setState({ paging })}
          autoUpdateQuery={true}
        />
      </Fragment>
    );
  }
}
