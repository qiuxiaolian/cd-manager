// API doc: https://github.com/caicloud/platform/blob/master/docs/api/monitoring-admin.md#gpu-monitoring

module.exports = {
  // dashboard of gpu-manager
  "GET /api/monitoring/clusters/:cid/gpus/:gpu": {
    dashboards: [
      {
        id: "dashboard.partition",
        type: "build-in",
        title: "Partition Monitoring",
        rows: [
          {
            name: "Detail",
            graphs: [
              {
                name: "Partition Running Pod Count",
                description: "Running pod count of partition",
                targets: [
                  {
                    expr:
                      'sum(kube_pod_status_phase{phase="Running", namespace="{{ .partition }}"})',
                    legendFormat: "Running"
                  }
                ],
                ylabel: "",
                unitDesc: { format: "integer", decimalPlaces: 0, label: "" },
                stacked: false,
                path: "graph.partition.pod_count",
                clusterID: ""
              },
              {
                name: "Partition CPU Usage",
                description: "Partition CPU usage in cores(in 1m)",
                targets: [
                  {
                    expr:
                      'sum(container_cpu_usage_seconds_total:rate:1m{namespace="{{ .partition }}"}) ',
                    legendFormat: "Used"
                  },
                  {
                    expr:
                      'kube_resourcequota{namespace="{{ .partition }}", resource="limits.cpu", type="hard"}',
                    legendFormat: "Limit"
                  },
                  {
                    expr:
                      'kube_resourcequota{namespace="{{ .partition }}", resource="requests.cpu", type="hard"}',
                    legendFormat: "Request"
                  }
                ],
                ylabel: "Cores",
                unitDesc: { format: "number", decimalPlaces: 3, label: "" },
                stacked: false,
                path: "graph.partition.cpu_usage",
                clusterID: ""
              },
              {
                name: "Partition Memory Usage",
                description: "Partition memory usage",
                targets: [
                  {
                    expr:
                      'sum( container_memory_working_set_bytes{namespace="{{ .partition }}"} )',
                    legendFormat: "Used"
                  },
                  {
                    expr:
                      'kube_resourcequota{namespace="{{ .partition }}", resource="limits.memory", type="hard"} ',
                    legendFormat: "Limit"
                  },
                  {
                    expr:
                      'kube_resourcequota{namespace="{{ .partition }}", resource="requests.memory", type="hard"} ',
                    legendFormat: "Request"
                  }
                ],
                ylabel: "",
                unitDesc: { format: "byte", decimalPlaces: 2, label: "" },
                stacked: false,
                path: "graph.partition.mem_usage",
                clusterID: ""
              }
            ]
          }
        ],
        templating: [
          { name: "Cluster", list: "cluster_list", type: "ext_list" },
          { name: "Partition", list: "partition_list", type: "ext_list" }
        ]
      }
    ]
  },

  // rangequery of gpu
  "POST /api/monitoring/cluster/:cid/rangequery": {
    originExpr:
      'sum(kube_pod_status_phase{phase="Running", namespace="testcx2"})',
    matrix: [
      {
        metric: {},
        values: [
          [1524548603, "2"],
          [1524548613, "2"],
          [1524548623, "2"],
          [1524548633, "2"],
          [1524548643, "2"],
          [1524548653, "2"],
          [1524548663, "2"],
          [1524548673, "2"],
          [1524548683, "2"],
          [1524548693, "2"],
          [1524548703, "2"],
          [1524548713, "2"],
          [1524548723, "2"],
          [1524548733, "2"],
          [1524548743, "2"],
          [1524548753, "2"],
          [1524548763, "2"],
          [1524548773, "2"],
          [1524548783, "2"],
          [1524548793, "2"],
          [1524548803, "2"],
          [1524548813, "2"],
          [1524548823, "2"],
          [1524548833, "2"],
          [1524548843, "2"],
          [1524548853, "2"],
          [1524548863, "2"],
          [1524548873, "2"],
          [1524548883, "2"],
          [1524548893, "2"],
          [1524548903, "2"]
        ]
      }
    ],
    lengends: ["Running"]
  }
};
