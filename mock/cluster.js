module.exports = {
  /**
   * Mock Data
   * Support type as Object and Array
   * TODO:
   * 1、guide docs
   * 2、support hot-update
   * 3、generate mockdata by tools such as mockjs
   */

  "GET /api/cluster_v2": {
    metadata: {
      total: 2
    },
    items: [
      {
        metadata: {
          id: "32793e34-79d2-432b-ac17-708b61b80e6a",
          name: "32793e34-79d2-432b-ac17-708b61b80e6a",
          creationTime: "2018-04-17T11:45:38+08:00",
          lastUpdateTime: "2018-04-17T11:45:38+08:00",
          lastTransitionTime: "2018-04-17T11:45:38+08:00"
        },
        spec: {
          displayName: "multiple-tenant-current",
          isControlCluster: true,
          provider: "baremetal",
          network: {
            type: "canal"
          },
          isHighAvailable: true,
          mastersVIP: "192.168.18.240"
        },
        status: {
          phase: "Ready",
          conditions: [
            {
              type: "MasterReady",
              status: "True",
              lastHeartbeatTime: "2018-04-17T14:08:36+08:00",
              lastTransitionTime: "2018-04-17T14:08:36+08:00",
              reason: "ConditionReason:ControllerCheck",
              message: ""
            },
            {
              type: "NodeNumMismatch",
              status: "False",
              lastHeartbeatTime: "2018-04-17T14:08:36+08:00",
              lastTransitionTime: "2018-04-17T14:08:36+08:00",
              reason: "ConditionReason:ControllerCheck",
              message: ""
            },
            {
              type: "AddonReady",
              status: "True",
              lastHeartbeatTime: "2018-04-17T14:08:36+08:00",
              lastTransitionTime: "2018-04-17T14:08:36+08:00",
              reason: "ConditionReason:ControllerCheck",
              message: ""
            }
          ],
          capacity: {}
        }
      },
      {
        metadata: {
          id: "44793e34-79d2-432b-ac17-708b61b80e6a",
          name: "44793e34-79d2-432b-ac17-708b61b80e6a",
          creationTime: "2018-04-17T11:45:38+08:00",
          lastUpdateTime: "2018-04-17T11:45:38+08:00",
          lastTransitionTime: "2018-04-17T11:45:38+08:00"
        },
        spec: {
          displayName: "single-tenant-current",
          isControlCluster: true,
          provider: "baremetal",
          network: {
            type: "canal"
          },
          isHighAvailable: true,
          mastersVIP: "192.168.18.240"
        },
        status: {
          phase: "Ready",
          conditions: [
            {
              type: "MasterReady",
              status: "True",
              lastHeartbeatTime: "2018-04-17T14:08:36+08:00",
              lastTransitionTime: "2018-04-17T14:08:36+08:00",
              reason: "ConditionReason:ControllerCheck",
              message: ""
            },
            {
              type: "NodeNumMismatch",
              status: "False",
              lastHeartbeatTime: "2018-04-17T14:08:36+08:00",
              lastTransitionTime: "2018-04-17T14:08:36+08:00",
              reason: "ConditionReason:ControllerCheck",
              message: ""
            },
            {
              type: "AddonReady",
              status: "True",
              lastHeartbeatTime: "2018-04-17T14:08:36+08:00",
              lastTransitionTime: "2018-04-17T14:08:36+08:00",
              reason: "ConditionReason:ControllerCheck",
              message: ""
            }
          ],
          capacity: {}
        }
      }
    ]
  },

  "GET /api/cluster_v2/:cid": async (req, res) => {
    res.json({ params: req.params, query: req.query });
  },

  "POST /api/cluster_v2/:cid": async (req, res) => {
    res.json({ params: req.params, body: req.body });
  }
};
