module.exports = {
  "GET /api/machine": {
    metadata: {
      total: 3
    },
    items: [
      {
        metadata: {
          id: "1.0.0.1",
          name: "1.0.0.1",
          creationTime: "2018-04-18T14:02:20+08:00",
          lastUpdateTime: "2018-04-18T14:02:20+08:00",
          lastTransitionTime: "2018-04-18T14:02:20+08:00"
        },
        spec: {
          provider: "baremetal",
          address: [
            {
              type: "ExternalIP",
              address: "1.0.0.1"
            }
          ],
          tags: [],
          cluster: "",
          isMaster: false
        },
        status: {
          phase: "Failed",
          schedulable: false,
          nodeRefer: "",
          capacity: {}
        }
      },
      {
        metadata: {
          id: "192.168.1.1",
          name: "192.168.1.1",
          creationTime: "2018-04-18T14:01:54+08:00",
          lastUpdateTime: "2018-04-18T14:01:54+08:00",
          lastTransitionTime: "2018-04-18T14:01:54+08:00"
        },
        spec: {
          provider: "baremetal",
          address: [
            {
              type: "ExternalIP",
              address: "192.168.1.1"
            }
          ],
          tags: [],
          cluster: "",
          isMaster: false
        },
        status: {
          phase: "Failed",
          schedulable: false,
          nodeRefer: "",
          capacity: {}
        }
      },
      {
        metadata: {
          id: "225.1.1.1",
          name: "225.1.1.1",
          creationTime: "2018-04-18T14:02:02+08:00",
          lastUpdateTime: "2018-04-18T14:02:02+08:00",
          lastTransitionTime: "2018-04-18T14:02:02+08:00"
        },
        spec: {
          provider: "baremetal",
          address: [
            {
              type: "ExternalIP",
              address: "225.1.1.1"
            }
          ],
          tags: [],
          cluster: "",
          isMaster: false
        },
        status: {
          phase: "Failed",
          schedulable: false,
          nodeRefer: "",
          capacity: {}
        }
      }
    ]
  }
};
