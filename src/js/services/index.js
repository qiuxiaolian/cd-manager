// Copyright 2018 caicloud authors. All rights reserved

import { ajax } from "lib/util";

//list all deployment
export const ListDepolyments = (data, success) => {
  ajax.get({
    url: `/api/v1alpha1/deployments`,
    data,
    success
  });
};

//delete particular deployment
export const DeleteDeployment = (deployment, success) => {
  ajax.delete({
    url: `/api/v1alpha1/deployments/${deployment}`,
    success
  });
};

export const CreateDeployment = (data, success) => {
  ajax.delete({
    url: `/api/v1alpha1/deployments`,
    data,
    success
  });
};

export const UpdateDeployment = (deployment, data, success) => {
  ajax.delete({
    url: `/api/v1alpha1/deployments/${deployment}`,
    data,
    success
  });
};

export const ListRecord = (deployment, data, success) => {
  ajax.get({
    url: `/api/v1alpha1/deployments/${deployment}/records`,
    data,
    success
  });
};

export const GetDeployment = (deployment, success) => {
  ajax.get({
    url: `/api/v1alpha1/deployments/${deployment}`,
    success
  });
};

//拿到镜像的registry
export const GetRegistries = success => {
  ajax.get({
    url: `/api/cargo/registries`,
    success
  });
};

//拿到镜像的project
export const GetProjects = (data, success) => {
  ajax.get({
    url: `/api/cargo/registries/${_.get(
      data,
      "registry"
    )}/projects?data={"q":"","includePublic":true}`,
    success
  });
};

export const GetRepositories = (data, success) => {
  ajax.get({
    url: `/api/cargo/registries/${_.get(data, "registry")}/projects/${_.get(
      data,
      "project"
    )}/searchRepositories`,
    success
  });
};

export const GetImageTag = (data, success) => {
  ajax.get({
    url: `/api/cargo/registries/${data.registry}/projects/${
      data.project
    }/repositories/${data.repository}/tags`,
    data,
    success
  });
};

export const GetClusters = success => {
  ajax.get({
    url: `/api/cluster_v2`,
    success
  });
};

export const GetPartitions = (data, success) => {
  ajax.get({
    url: `/api/application/cluster/${_.get(data, "clusterID", "")}`,
    success
  });
};

export const GetApplications = (data, success) => {
  ajax.get({
    url: `/api/application/cluster/${_.get(
      data,
      "clusterID",
      ""
    )}/partition/${_.get(data, "partition")}`,
    success
  });
};

export const GetResources = (data, success) => {
  ajax.get({
    url: `/api/application/cluster/${_.get(
      data,
      "clusterID"
    )}/partition/${_.get(data, "partition")}/application/${_.get(
      data,
      "application"
    )}/resources`,
    success
  });
};

export const TriggerDeployment = (deployment, data, success) => {
  ajax.post({
    url: `/api/v1alpha1/deployments/${deployment}/records`,
    data,
    success
  });
};
