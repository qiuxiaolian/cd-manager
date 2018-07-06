// API doc: https://github.com/caicloud/compass-plugins/blob/master/docs/gpu-manager.md

const GPUObj = {
  metadata: {
    id: "GPU-a6866db7-c9c7-e130-d18f-d50496c0e7a7",
    name: "GPU-a6866db7-c9c7-e130-d18f-d50496c0e7a7",
    lastUpdateTime: "2006-01-02T15:04:05Z07:00"
  },
  spec: {
    general: {
      // object, always
      brand: "", // string, always
      specification: "", // string, always
      pciExpressInterfaces: "PCI-E 3.0" // string, always
    },
    cores: {
      // object, always
      brand: "GeForce GTX 750 Ti", // string, always
      specification: "GeForce", // string, always
      clocksBase: "1071 MHz", // string, always
      clocksMax: "1346 MHz" // string, always
    },
    memory: {
      // object, always
      type: "", // string, always
      size: "1997 MiB", // string, always
      busWidth: "", // string, always
      clocks: "2700 MHz" // string, always
    }
  },
  status: {
    cluster: "cluster-debug", // string, always
    nodeName: "kube-node-192-168-8-60", // string, always
    hostIP: "192.168.8.60", // string, always
    phase: "using", // string, always
    processes: [
      // array, always
      "app-tf-ocr" // string, omitempty
    ]
  }
};

module.exports = {
  "GET /api/v1alpha1/gpus": (req, res) => {
    const { limit } = req.query;
    const total = limit ? Number(limit) : 6;
    res.json({
      metadata: {
        total: total * 2
      },
      items: Array(total).fill(GPUObj)
    });
  },

  "GET /api/v1alpha1/gpuspecs": {
    metadata: {
      total: 2
    },
    items: [
      "GeForce GT 1030", // string, omitempty
      "GeForce GTX 750 Ti"
    ]
  },

  "GET /api/v1alpha1/gpus/:id": (req, res) => {
    const { id } = req.params;
    res.json({
      ...GPUObj,
      metadata: {
        ...GPUObj.metadata,
        id
      }
    });
  }
};
