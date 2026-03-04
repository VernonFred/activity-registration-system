# 管理后台活动创建页面重构计划（#007）

> 创建时间：2026年3月3日
> 对应问题：`docs/问题跟踪归档/2026-03-W1_03.02-03.08.md` → `#007`

---

## 目标

将管理后台 `ActivityCreate` 从当前的长表单页面重构为顶部分栏 Tabs，并让后台配置能力与小程序端的以下展示/流程对齐：

- 活动速览
- 活动议程
- 酒店信息
- 图片直播
- 报名流程（个人信息 / 缴费信息 / 住宿信息 / 交通信息）

同时保持职责边界清晰：

- `表单设计`：只负责报名字段（`form_fields`）
- `活动创建 > 报名配置`：只负责支付 / 住宿 / 交通 / 审核 / 候补等流程规则

---

## 页面结构

`ActivityCreate` 固定为 5 个 Tabs：

1. 活动速览
2. 活动议程
3. 酒店信息
4. 图片直播
5. 报名配置

### 页面级规则

- 顶部保留保存按钮
- 保存成功默认返回活动列表
- 页面内不出现“文章管理”配置
- 页面内不内嵌字段拖拽设计器

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
- 老活动已有 `form_fields` 时，只在 `报名配置` 中展示摘要，不在本页直接编辑字段
- 所有结构化字段缺失时都使用默认空结构兜底

---

## 测试清单

## UI

- `ActivityCreate` 已改为 5 个 Tabs
- 顶部保存按钮可用
- 不再是长表单
- 不出现“文章管理”字段

## 数据

- 顶层字段保存正常
- `extra` 保存结构化议程 / 酒店 / 报名规则
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
