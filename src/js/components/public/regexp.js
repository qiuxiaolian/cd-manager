// Copyright 2017 caicloud authors. All rights reserved.

/**
 * 项目的所有正则表达式统一写在这里
 */

// 非负整数
export const INT = /^[0-9]*$/;

export const INT_NUM = /^\+?\-?[0-9]*$/;
export const FLOAT_NUM = /(^\+?\-?[1-9]+[\.]?\d?)|(^\+?\-?[0]+[\.]+\d+)$/;
// 正整数
export const POSITIVE_INT = /^[1-9]\d*$/;
// 正数（包含小数）
export const POSITIVE_NUM = /(^[1-9]+[\.]?\d?)|(^[0]+[\.]+\d+)$/;
// 正数 （包含小数，小数最多两位）
export const POSITIVE_INT_OR_UP_TO_TWO_DIGITS_FLOAT = /^([1-9]{1}\d*(\.\d{1,2})?)$|^(0\.\d[1-9])$|^(0\.[1-9]\d?)$/;
// email 地址，例如 a@b.com, a+b@c.com, a.b@c.com 等
export const EMAIL = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
// 登录密码，长度为8－30个字符
export const PASSWORD = /^[\w\/\-!@#$%&^*()+,.;?]{8,30}$/;
// 手机号码
export const PHONE = /^\d{11}$/;
// IP 地址
export const IP = /^(1\d{2,2}|2[0-4][0-9]|25[0-5]|[1-9][0-9]|[1-9])(\.(1\d{2,2}|2[0-4][0-9]|25[0-5]|[1-9][0-9]|[0-9])){3,3}$/;
// 新建 repo 名称 小写字母、数字或-
export const REPONAME = /^[a-z0-9-]+$/;
// 这是哪里用到的??
// export const NAME = /^[a-z0-9]{4,30}$/;

// 应用名称，由小写字母、数字、横杠组成，只能以英文字母开头，不能以横杠开头和结尾。
export const NAME = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;
// 服务名称，由英文字母、数字、横杠组成，只能以英文字母开头，不能以横杠开头和结尾。长度限制2-32个字符.
export const SERVICE_NAME = /^[a-zA-Z]([-a-z0-9]*[a-z0-9]){1,31}$/;

// 存储名称，由小写字母、数字、横杠、下划线组成，长度限制2-32个字符。只能以小写字母开头。
export const STORAGE_NAME = /^[a-z]([-a-z0-9_]){1,31}$/;

// 存储名称，支持中文和特殊符号，长度限制2-32个字符。(TODO(cx): 支持的内容有歧义，比如英文小写字母是否支持？需再与设计师确定)
// export const STORAGE_NAME_v5 = /^[a-z]([-a-z0-9_]){1,31}$/;

// 应用名称（新）
export const APP_NAME = /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])+$/g;

// 用户名，必须为3-50个字母或数字
export const USERNAME = /^[a-zA-Z0-9]{3,50}$/;

// 集群名称，只能输入英文、数字、横线、下划线、中文
export const CLUSTER_NAME = /^[-_a-zA-Z0-9\u4e00-\u9fa5\uf900-\ufa2d]+$/;
// 权限管理中的名字（用户名、权限组名等），只能输入英文、中文、数字、横线、下划线，长度1-30
export const AUTHCENTER_NAME = /^[-_a-zA-Z0-9\u4e00-\u9fa5\uf900-\ufa2d]{1,30}$/;

// 2.7应用名称，可以输入中文和特殊字符，长度2.32
// TODO: 明确是哪些特殊字符
export const ALIAS_NAME = /^[-_a-zA-Z0-9\u4e00-\u9fa5\uf900-\ufa2d]+$/;
// 应用-环境变量 键的规则 只能使用英文字母，数字和下划线，首个字符不能以数字开头
export const ENV_KEY = /^[A-Za-z_][A-Za-z_0-9]*$/;

// 用户管理 - 用户名
export const AUTH_USERNAME = AUTHCENTER_NAME;
// 权限组管理 - 权限组名
export const AUTH_GROUP_NAME = AUTHCENTER_NAME;

// 域名
export const DOMAIN = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+/;
// 分区名称 支持小写英文字母、数字、下划线，不能以下划线开头，不能超过16个字符
export const PARTITION_NAME = /^[a-z0-9][_a-z0-9]{0,16}$/;
// 负责人名称、镜像标签名、标签别名：只能输入中英文、数字、横线、下划线（更细化的长度不在此规定）
export const MANAGER_NAME = CLUSTER_NAME;
// 项目名称（镜像仓库）：只能输入英文或数字，长度4-30
export const PROJECT_NAME = /^[A-z0-9]{4,30}$/;
// 应用模版名称，只能输入英文、数字、横线、下划线、中文
export const TEMPLATE_NAME = CLUSTER_NAME;
// 配置名称只能为数字, 小写英文字母, "-".
export const CONFIG_NAME = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
// unix 绝对路径
export const UNIX_PATH = /^(\/[^\0]*(?:_[^\0]+)*(?:\-[^\0]+)*)+$/;
// URL
export const URL = /[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*/;
// github的地址校验
export const GIT = /^(https\:\/\/github.com)[\w-_\.\/\?%&=]+(.git)$/;
// 版本号 VERSION: number.number.number (e.g.: 1.0.1)
export const VERSION = /^(\d+\.)(\d+\.)(\*|\d+)$/;
// 报警－策略名称
export const RULENAME = /^[a-zA-Z]([a-zA-Z0-9])*$/;
// 分组标签
export const TAG_NAME = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
// 报警－分组的标签
export const ALERTING_TAG_NAME = TAG_NAME;
// 报警-slack apiurl 和 webhook url
export const APIURL = /^(http|ftp|https):\/\/((([0-9a-zA-Z]+\.){1,2}[\u4e00-\u9fa5_a-zA-Z]+)|(([0-9]{1,3}\.){3}[0-9]{1,3}))(:[1-9][0-9]*)?(\/([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?)?$/;
// 报警 - slack username 和 slack channel
export const SLACK_UNAME = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
// 回车换行
export const LINE_FEED = /(?:\r\n|\r|\n)/;
// gitlab 地址
export const GITLAB = /^(http\:\/\/)|(https\:\/\/)(?!github)[\w-_\.\/\?%&=]+(.git)$/;
// tenant 命名正则 字母或中文开头，支持中文和特殊符号，长度限制 2 - 32 个字符
export const TENANT_NAME = /^[a-z\u4e00-\u9fa5](.){1,31}/i;
