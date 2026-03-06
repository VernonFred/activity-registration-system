# 管理后台活动创建页面重构计划（#007）

> 创建时间：2026年3月3日
> 对应问题：`docs/问题跟踪归档/2026-03-W1_03.02-03.08.md` → `#007`

---

## 修订版（2026-03-05）—— 当前生效

> 本节覆盖本文档中与旧方案冲突的条目，后续实现以本节为准。

- 报名相关配置统一收口到 `表单设计`，不再保留 `活动创建 > 报名配置`。
- `ActivityCreate` 顶部 Tabs 从 5 个调整为 4 个：`活动速览 / 活动议程 / 酒店信息 / 图片直播`。
- 新增 `extra.signup_flow` 作为报名流程真源（步骤启用、每步上传开关）。
- `extra.signup_config` 仅作为历史兼容读取，不再作为主写入结构。
- 小程序报名流程从固定 4 步改为按 `signup_flow` 动态生成步骤，保留双读单写兼容：
  1) `extra.signup_flow`
  2) 旧 `extra.signup_config`
  3) 本地常量兜底

## 修订版（2026-03-06）—— `FormDesigner` 工作台收口

> 本节补充 2026-03-06 的页面结构与交互约束；如与旧描述冲突，以本节为准。

- `FormDesigner` 当前页面结构固定为三栏工作台：
  - 左侧：`报名步骤`
  - 中间：`控件库 + 表单画布`
  - 右侧：`实时预览`
- 左侧不再堆叠控件库，避免步骤区与控件区混排导致文案挤压。
- 顶部不再保留 4 张状态卡。
- 页头不再保留冗余品牌说明文案，只保留必要标题、活动选择和保存动作。
- 右侧预览在浅色模式下使用浅色容器；暗黑模式下再切换为深色语义容器。
- 本轮优先恢复交互可用性：
  - 步骤切换可点击
  - 控件可添加
  - 字段可编辑
  - 保存继续写入 `form_fields + extra.signup_flow`


## 目标

将管理后台 `ActivityCreate` 从当前的长表单页面重构为顶部分栏 Tabs，并让后台配置能力与小程序端的以下展示/流程对齐：

- 活动速览
- 活动议程
- 酒店信息
- 图片直播
- 报名流程（个人信息 / 缴费信息 / 住宿信息 / 交通信息）

同时保持职责边界清晰：

- `表单设计`：统一负责报名字段与报名流程步骤配置
- `ActivityCreate`：只负责活动详情相关的 4 个内容 Tab

---

## 页面结构

`ActivityCreate` 固定为 4 个 Tabs：

1. 活动速览
2. 活动议程
3. 酒店信息
4. 图片直播

### 页面级规则

- 顶部保留保存按钮
- 保存成功默认返回活动列表
- 页面内不出现“文章管理”配置
- 页面内不内嵌字段拖拽设计器
- `活动速览 > 基本信息` 当前收口基线：
  - `主标题 / 副标题` 使用等宽双列
  - `分类 / 标签 / 状态 / 活动封面` 使用独立纵向段落
- `活动速览 > 地点与联系方式` 当前收口基线：
  - 左侧地点信息与右侧联系方式都保持三行纵向结构
  - 不再使用左侧混排、右侧纵排的不对称布局

---

## 数据结构

## 1. 顶层字段

继续使用现有活动顶层字段：

- `title`
- `subtitle`
- `category`
- `tags`
- `cover_image_url`
- `banner_image_url`
- `city`
- `location`
- `location_detail`
- `contact_name`
- `contact_phone`
- `contact_email`
- `description`
- `agenda`
- `start_time`
- `end_time`
- `signup_start_time`
- `signup_end_time`
- `checkin_start_time`
- `checkin_end_time`
- `max_participants`
- `approval_required`
- `require_payment`
- `allow_feedback`
- `allow_waitlist`
- `group_qr_image_url`
- `status`

## 1.1 `extra.overview`

用于承载活动速览页的展示补充配置：

- `show_signup_count`
- `map.lat`
- `map.lng`
- `map.label`

## 2. `agenda`

- 保留为议程摘要 / 富文本总说明
- 兼容当前已有实现

## 3. `extra`

用于承载结构化业务配置：

- `extra.agenda_blocks`
- `extra.hotels`
- `extra.signup_config`

### `extra.signup_config`

负责：

- 支付规则
- 住宿规则
- 交通规则

## 4. `materials`

用于承载媒体配置：

- `materials.live`

---

## 前端文件拆分

## 容器页

- `frontend/admin/src/pages/ActivityCreate.tsx`

职责：

- 管理 Tabs 切换
- 管理保存逻辑
- 管理编辑态回填
- 调用 payload 转换层

## 子组件目录

- `frontend/admin/src/pages/activity-create/components/`

新增：

- `OverviewTab.tsx`
- `AgendaTab.tsx`
- `HotelTab.tsx`
- `LiveTab.tsx`
- `SignupConfigTab.tsx`

## 类型与转换层

新增：

- `frontend/admin/src/pages/activity-create/types.ts`
- `frontend/admin/src/pages/activity-create/transform.ts`

规则：

- 页面组件禁止直接拼装最终 API payload
- 提交统一走 `buildActivityPayload()`
- 回填统一走 `parseActivityDetailToFormState()`

---

## 提交流程

### 创建

1. 进入 `ActivityCreate`
2. 默认落在 `活动速览`
3. 填写各 Tab 内容
4. 点击保存
5. 调用 `createActivity(payload)`
6. 成功后跳转到 `/activities`

### 编辑

1. 带活动 ID 进入页面
2. 调用 `getActivity(id)`
3. 通过转换层回填表单状态
4. 点击保存
5. 调用 `updateActivity(id, payload)`
6. 成功后跳转到 `/activities`

---

## 编辑回填规则

- 老活动没有 `extra` / `materials` 时，按空态回填，不报错
- 老活动已有 `form_fields` 时，只在 `表单设计` 中统一维护步骤与字段，不在 `ActivityCreate` 中重复配置报名流程
- 所有结构化字段缺失时都使用默认空结构兜底

---

## 测试清单

## UI

- `ActivityCreate` 已改为 4 个 Tabs（`活动速览 / 活动议程 / 酒店信息 / 图片直播`）
- 顶部保存按钮可用
- 不再是长表单
- 不出现“文章管理”字段

## 数据

- 顶层字段保存正常
- `extra` 保存结构化议程 / 酒店 / 报名流程配置（`signup_flow`）
- `materials.live` 保存直播配置
- `form_fields` 仍由 `表单设计` 页面维护

## 联调

- `POST /activities` 正常
- `PATCH /activities/{id}` 正常
- `GET /activities/{id}` 回填正常
- 地址区域有经纬度时，可直接触发地图导航
- 地址区域无经纬度时，保持静态展示，不依赖外部地理编码服务

## 回归

- `FormDesigner` 正常
- `SignupManage` 正常
- `Activities` 列表与创建入口不受影响

---

## 本阶段不做

- 不新增后端接口
- 不重做后台导航结构
- 不把文章管理合并进活动创建
- 不取消 `表单设计`

---

## 当前补充重点（2026年3月4日）

- `活动速览 > 时间安排`
  - `group_qr_image_url` 已通过上传组件接入
  - `show_signup_count` 已通过 `extra.overview.show_signup_count` 接入
- `活动速览 > 地点与联系方式`
  - `extra.overview.map.lat/lng/label` 已接入第一轮
  - 小程序端地址区域优先使用经纬度直接打开地图导航
  - 第一版不引入外部地理编码服务


---

## 2026年3月6日修订

### 结构修订

- `ActivityCreate` 不再承载报名规则配置，相关能力已统一迁移至 `FormDesigner`
- `SignupConfigTab.tsx` 已下线，活动创建页维持 4 个业务 Tabs
- `FormDesigner` 已成为报名流程唯一配置入口，负责：
  - 步骤启用与排序
  - 步骤标题编辑
  - 自定义步骤新增/删除
  - 字段拖拽、字段配置、实时预览

### 数据修订

- `extra.signup_flow` 已从固定 4 步 `Record` 结构升级为动态 `steps[]` 结构
- `form_fields[].config.step` 已从固定联合类型放宽为动态 `step_key`
- 小程序报名页与后端 `/registrations` 已同步支持动态步骤提交流程
- 旧 `signup_flow` / `signup_config` 仍保留只读兼容，保存统一写新结构

### 下一阶段实现重点

1. 拆分 `FormDesigner.tsx`，避免继续在超长单文件上叠加逻辑
2. 拆分 `frontend/admin/src/styles/index.css`，把表单设计相关样式抽到独立模块
3. 对动态步骤链路执行一次完整端到端回归
