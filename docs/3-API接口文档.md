# API 接口文档

> **创建时间**: 2025年12月02日 23:50
> **最后更新**: 2026年02月28日 16:30
> **维护人**: Cursor AI + Claude AI
> **API 基础路径**: `http://localhost:8000/api/v1`
> **前端Mock模式**: ✅ 已启用 (`CONFIG.USE_MOCK = true`)

---

## 📋 接口变更记录

| 时间 | 变更类型 | 接口路径 | 变更内容 | 操作人 |
|------|----------|----------|----------|--------|
| 2026年02月28日 16:30 | 新增 | `/payments/*` | 缴费记录 CRUD + 后端分页（6个端点） | Cursor AI |
| 2026年02月28日 16:30 | 新增 | `/invoice-headers/*` | 发票抬头 CRUD + 后端分页 + 复制文本（6个端点） | Cursor AI |
| 2026年02月27日 15:00 | 新增 | `/notifications/me/*` | 通知管理接口：单删、批删、清空、全部已读（4个端点） | Cursor AI |
| 2026年01月08日 15:30 | 完善 | 所有接口 | 补充详细请求/响应示例，添加Mock数据支持 | Claude AI |
| 2026年01月08日 15:30 | 新增 | `/activities/:id/comments` | 评论列表、发布、删除接口（7个） | Claude AI |
| 2026年01月08日 15:30 | 新增 | `/activities/:id/rating` | 评分统计、提交评分接口 | Claude AI |
| 2026年01月08日 15:30 | 新增 | `/users/me/signups` | 我的报名列表接口 | Claude AI |
| 2026年01月08日 15:30 | 新增 | `/engagements/:id/...` | 互动接口（收藏、点赞、分享） | Claude AI |
| 2026年01月08日 15:30 | 新增 | `/auth/refresh` | Token刷新接口 | Claude AI |
| 2025年12月16日 15:00 | 新增 | `/registrations` | 前端报名表单提交接口 | Claude AI |
| 2025年12月16日 15:00 | 新增 | `/wechat/decrypt-phone` | 微信手机号解密接口 | Claude AI |
| 2025年12月09日 19:30 | 修改 | `/activities/{id}` | 返回的 agenda 字段支持嵌套结构 | Cursor AI |
| 2025年12月02日 23:50 | 整合 | - | 从 api_overview.md 整合所有接口 | Cursor AI |

---

## 🎯 接口开发状态

### 前端服务层状态

| 模块 | 服务文件 | 接口数量 | Mock数据 | 状态 |
|------|---------|---------|---------|------|
| 活动相关 | `services/activities.ts` | 4 | ✅ | 前端完成 |
| 报名相关 | `services/signups.ts` | 2 | ✅ | 前端完成 |
| 鉴权相关 | `services/auth.ts` | 5 | ✅ | 前端完成 |
| 评论/评分 | `services/comments.ts` | 7 | ✅ | 前端完成 |
| 用户相关 | `services/user.ts` | 4 | ✅ | 前端完成 |
| 互动相关 | `services/engagement.ts` | 6 | ✅ | 前端完成 |
| 通知相关 | `services/notifications.ts` | 7 | ✅ | 前后端完成 |
| 缴费相关 | `services/payments.ts` | 4 | ❌ | 前后端完成 |
| 发票抬头 | `services/invoice-headers.ts` | 6 | ❌ | 前后端完成 |
| **总计** | **9个文件** | **45个** | **78%** | **✅ 前端完成** |

### 后端API状态

| 优先级 | 接口数量 | 状态 | 预计工时 |
|--------|---------|------|---------|
| P0（阻塞上线） | 11 | ⚠️ 待开发 | 15-20h |
| P1（影响体验） | 17 | ⚠️ 待开发 | 20-25h |
| **总计** | **28** | **⚠️ 待开发** | **35-45h** |

---

## 🔐 认证说明

### 小程序端
1. 调用 `/api/v1/auth/wechat-login` 获取用户 token
2. 后续请求在 Header 中携带 `Authorization: Bearer <token>`
3. Token 过期时自动调用 `/api/v1/auth/refresh` 刷新

### 管理端
1. 调用 `/api/v1/auth/login` 获取管理员 token
2. 后续请求在 Header 中携带 `Authorization: Bearer <token>`

### Token 自动刷新机制

前端已实现HTTP拦截器，当收到401响应时自动刷新Token：

```typescript
// frontend/app/src/services/http.ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      const newToken = await refreshAccessToken()
      error.config.headers['Authorization'] = `Bearer ${newToken}`
      return api(error.config)
    }
    return Promise.reject(error)
  }
)
```

---

## 📡 接口清单

### 1. 认证模块 (Auth) - P0

| 方法 | 路径 | 描述 | 权限 | Mock | 前端文件 |
|------|------|------|------|------|---------|
| POST | `/auth/login` | 管理员登录 | 公开 | ✅ | `services/auth.ts` |
| GET | `/auth/me` | 查看当前管理员信息 | 管理员 | ✅ | `services/auth.ts` |
| POST | `/auth/wechat-login` | 小程序登录 | 公开 | ✅ | `services/auth.ts` |
| **POST** | **`/auth/refresh`** | **Token刷新（新）** | **公开** | **✅** | `services/auth.ts` |
| **POST** | **`/auth/logout`** | **退出登录（新）** | **用户** | **✅** | `services/auth.ts` |
| GET | `/auth/user/me` | 获取当前用户信息 | 用户 | ✅ | `services/auth.ts` |

#### 1.1 微信登录接口详情

**POST** `/api/v1/auth/wechat-login`

**请求体**:
```json
{
  "code": "wx_login_code_123",
  "profile": {
    "nickname": "张三",
    "avatar": "https://..."
  }
}
```

**响应示例**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "refresh_token_abc123",
  "expires_in": 7200,
  "user": {
    "id": 1,
    "name": "张三",
    "avatar": "https://...",
    "phone": "13800138000"
  }
}
```

#### 1.2 Token刷新接口详情

**POST** `/api/v1/auth/refresh`

**请求体**:
```json
{
  "refresh_token": "refresh_token_abc123"
}
```

**响应示例**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 7200
}
```

---

### 2. 活动模块 (Activities)

| 方法 | 路径 | 描述 | 权限 | Mock | 前端文件 |
|------|------|------|------|------|---------|
| **GET** | **`/activities`** | **活动列表（分页）- P0** | **公开** | **✅** | `services/activities.ts` |
| **GET** | **`/activities/featured`** | **热门精选 - P0** | **公开** | **✅** | `services/activities.ts` |
| **GET** | **`/activities/{id}`** | **获取活动详情 - P0** | **公开** | **✅** | `services/activities.ts` |
| GET | `/activities/count` | 活动总数统计 | 公开 | ❌ | - |
| POST | `/activities` | 创建活动 | 管理员 | ❌ | - |
| PATCH | `/activities/{id}` | 更新活动信息 | 管理员 | ❌ | - |
| DELETE | `/activities/{id}` | 删除活动 | 管理员 | ❌ | - |
| POST | `/activities/{id}/checkin-token` | 生成签到二维码 | 管理员 | ❌ | - |
| GET | `/activities/{id}/checkins` | 查看签到记录 | 管理员 | ❌ | - |
| GET | `/activities/{id}/stats` | 查看报名统计 | 管理员 | ❌ | - |
| GET | `/activities/{id}/feedbacks` | 查看反馈列表 | 管理员 | ❌ | - |
| POST | `/activities/{id}/feedback` | 提交反馈 | 用户 | ❌ | - |
| GET | `/activities/{id}/feedback/me` | 获取我的反馈 | 用户 | ❌ | - |
| DELETE | `/activities/{id}/feedback` | 删除我的反馈 | 用户 | ❌ | - |
| GET | `/activities/{id}/exports/signups` | 导出报名名单 | 管理员 | ❌ | - |
| GET | `/activities/{id}/exports/comments` | 导出评论列表 | 管理员 | ❌ | - |
| GET | `/activities/{id}/exports/shares` | 导出分享记录 | 管理员 | ❌ | - |
| GET | `/activities/{id}/feed` | 活动动态流 | 公开 | ❌ | - |

#### 2.1 活动列表接口详情

**GET** `/api/v1/activities`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| per_page | number | 否 | 每页数量，默认 10 |
| status | string | 否 | 活动状态: `upcoming`/`ongoing`/`finished`/`all` |
| city | string | 否 | 城市筛选 |
| keyword | string | 否 | 关键词搜索 |

**响应示例**:
```json
{
  "items": [
    {
      "id": 1,
      "title": "2025暑期培训会",
      "cover_url": "https://...",
      "status": "upcoming",
      "start_time": "2025-08-10T09:00:00Z",
      "end_time": "2025-08-12T18:00:00Z",
      "location_city": "长沙",
      "location_name": "长沙民政职业技术学院",
      "max_participants": 200,
      "current_participants": 85,
      "signup_deadline": "2025-08-05T23:59:59Z",
      "fee_type": "paid",
      "fee_amount": 1200,
      "avg_rating": 4.8,
      "signup_count": 128
    }
  ],
  "total": 100,
  "page": 1,
  "per_page": 10
}
```

#### 2.2 活动详情接口详情

**GET** `/api/v1/activities/{id}`

**响应示例**:
```json
{
  "id": 1,
  "title": "2025暑期培训会",
  "cover_url": "https://...",
  "status": "upcoming",
  "start_time": "2025-08-10T09:00:00Z",
  "end_time": "2025-08-12T18:00:00Z",
  "signup_deadline": "2025-08-05T23:59:59Z",
  "location_city": "长沙",
  "location_name": "长沙民政职业技术学院",
  "location_address": "湖南省长沙市雨花区香樟路22号",
  "description": "活动描述...",
  "max_participants": 200,
  "current_participants": 85,
  "fee_type": "paid",
  "fee_amount": 1200,
  "avg_rating": 4.8,
  "signup_count": 128,
  "agenda": [...],
  "hotels": [...],
  "live_url": "https://..."
}
```

---

### 3. 报名模块 (Signups)

| 方法 | 路径 | 描述 | 权限 | Mock | 前端文件 |
|------|------|------|------|------|---------|
| GET | `/signups` | 报名记录列表 | 管理员 | ❌ | - |
| POST | `/signups` | 创建报名 | 用户 | ❌ | - |
| GET | `/signups/{id}` | 查看报名详情 | 用户/管理员 | ❌ | - |
| PATCH | `/signups/{id}` | 更新报名信息 | 用户/管理员 | ❌ | - |
| POST | `/signups/{id}/review` | 审核报名 | 管理员 | ❌ | - |
| POST | `/signups/{id}/remind` | 发送提醒通知 | 管理员 | ❌ | - |
| POST | `/signups/{id}/checkins` | 核销签到 | 管理员 | ❌ | - |
| POST | `/signups/bulk-review` | 批量审核 | 管理员 | ❌ | - |
| GET | `/signups/{id}/companions` | 同行人员列表 | 用户 | ❌ | - |
| **POST** | **`/signups/{id}/companions`** | **添加同行人员 - P0** | **用户** | **✅** | `services/signups.ts` |
| PATCH | `/signups/{id}/companions/{companion_id}` | 更新同行人员 | 用户 | ❌ | - |
| DELETE | `/signups/{id}/companions/{companion_id}` | 删除同行人员 | 用户 | ❌ | - |
| **POST** | **`/registrations`** | **前端报名表单提交 - P0** | **用户** | **✅** | `services/signups.ts` |

#### 3.1 报名提交接口详情

**POST** `/api/v1/registrations`

前端报名表单提交接口，接收前端结构化表单数据并创建报名记录。

**请求体**:
```json
{
  "activity_id": 1,
  "personal": {
    "name": "张三",
    "school": "清华大学",
    "department": "计算机学院",
    "position": "教授",
    "phone": "13800138000"
  },
  "payment": {
    "invoice_title": "清华大学",
    "email": "zhangsan@example.com",
    "payment_screenshot": "https://example.com/payment.jpg"
  },
  "accommodation": {
    "accommodation_type": "organizer",
    "hotel": "喜来登酒店",
    "room_type": "standard",
    "stay_type": "single"
  },
  "transport": {
    "pickup_point": "火车南站",
    "arrival_time": "2025-12-20 10:00",
    "flight_train_number": "G1234",
    "dropoff_point": "火车南站",
    "return_time": "2025-12-22 15:00",
    "return_flight_train_number": "G5678"
  }
}
```

**响应**:
```json
{
  "registration_id": 123,
  "status": "pending",
  "created_at": "2026-01-08T10:00:00Z"
}
```

#### 3.2 添加同行人员接口详情

**POST** `/api/v1/signups/{id}/companions`

**请求体**: 与 3.1 相同（不含 `activity_id`）

**响应**:
```json
{
  "companion_id": 456,
  "status": "pending",
  "created_at": "2026-01-08T10:05:00Z"
}
```

---

### 4. 用户模块 (Users) - P1

| 方法 | 路径 | 描述 | 权限 | Mock | 前端文件 |
|------|------|------|------|------|---------|
| **GET** | **`/users/me`** | **获取当前用户资料 - P1** | **用户** | **✅** | `services/user.ts` |
| **PATCH** | **`/users/me`** | **更新当前用户资料 - P1** | **用户** | **✅** | `services/user.ts` |
| **GET** | **`/users/me/signups`** | **我的报名列表 - P1** | **用户** | **✅** | `services/user.ts` |
| GET | `/users/me/stats` | 获取用户统计 | 用户 | ❌ | - |

#### 4.1 我的报名列表接口详情

**GET** `/api/v1/users/me/signups`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 状态筛选: `pending`/`approved`/`rejected`/`all` |
| page | number | 否 | 页码 |
| per_page | number | 否 | 每页数量 |
| keyword | string | 否 | 关键词搜索 |

**响应示例**:
```json
{
  "items": [
    {
      "id": 1,
      "activity": {
        "id": 1,
        "title": "2025暑期培训会",
        "cover_url": "https://...",
        "start_time": "2025-08-10T09:00:00Z",
        "location_city": "长沙"
      },
      "status": "approved",
      "created_at": "2026-01-05T10:00:00Z",
      "reviewed_at": "2026-01-06T14:00:00Z",
      "personal": {...},
      "companions": [...]
    }
  ],
  "total": 10,
  "page": 1,
  "per_page": 10
}
```

---

### 5. 评论/评分模块 (Comments) - P1 ✨ 新增

| 方法 | 路径 | 描述 | 权限 | Mock | 前端文件 |
|------|------|------|------|------|---------|
| **GET** | **`/activities/{id}/comments`** | **评论列表 - P1** | **公开** | **✅** | `services/comments.ts` |
| **POST** | **`/activities/{id}/comments`** | **提交评论 - P1** | **用户** | **✅** | `services/comments.ts` |
| **DELETE** | **`/comments/{id}`** | **删除评论 - P1** | **用户** | **✅** | `services/comments.ts` |
| **GET** | **`/activities/{id}/rating`** | **获取评分统计 - P1** | **公开** | **✅** | `services/comments.ts` |
| **POST** | **`/activities/{id}/rating`** | **提交评分 - P1** | **用户** | **✅** | `services/comments.ts` |
| **POST** | **`/comments/{id}/like`** | **点赞评论 - P1** | **用户** | **✅** | `services/comments.ts` |
| **DELETE** | **`/comments/{id}/like`** | **取消点赞 - P1** | **用户** | **✅** | `services/comments.ts` |

#### 5.1 获取评论列表

**GET** `/api/v1/activities/{id}/comments`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| per_page | number | 否 | 每页数量，默认 20 |
| sort_by | string | 否 | 排序: `newest`/`hottest`/`rating_desc` |

**响应示例**:
```json
{
  "items": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "name": "张三",
        "avatar": "https://..."
      },
      "rating": 5,
      "content": "活动很棒！",
      "images": ["https://..."],
      "created_at": "2026-01-05T14:30:00Z",
      "like_count": 28,
      "reply_count": 3,
      "is_liked": false,
      "replies": [...]
    }
  ],
  "total": 100,
  "page": 1,
  "per_page": 20,
  "avg_rating": 4.8
}
```

#### 5.2 提交评论

**POST** `/api/v1/activities/{id}/comments`

**请求体**:
```json
{
  "rating": 5,
  "content": "活动很棒！",
  "images": ["https://..."],
  "parent_id": null
}
```

#### 5.3 获取评分统计

**GET** `/api/v1/activities/{id}/rating`

**响应示例**:
```json
{
  "average": 4.8,
  "total_count": 128,
  "user_rating": 5,
  "distribution": {
    "5": 98,
    "4": 20,
    "3": 6,
    "2": 2,
    "1": 2
  }
}
```

---

### 6. 互动模块 (Engagement) - P1 ✨ 新增

| 方法 | 路径 | 描述 | 权限 | Mock | 前端文件 |
|------|------|------|------|------|---------|
| **GET** | **`/activities/{id}/engagement`** | **获取互动统计 - P1** | **公开** | **✅** | `services/engagement.ts` |
| **POST** | **`/engagements/{id}/favorite`** | **收藏活动 - P1** | **用户** | **✅** | `services/engagement.ts` |
| **DELETE** | **`/engagements/{id}/favorite`** | **取消收藏 - P1** | **用户** | **✅** | `services/engagement.ts` |
| **POST** | **`/engagements/{id}/like`** | **点赞活动 - P1** | **用户** | **✅** | `services/engagement.ts` |
| **DELETE** | **`/engagements/{id}/like`** | **取消点赞 - P1** | **用户** | **✅** | `services/engagement.ts` |
| **POST** | **`/engagements/{id}/share`** | **记录分享 - P1** | **用户** | **✅** | `services/engagement.ts` |

#### 6.1 获取互动数据

**GET** `/api/v1/activities/{id}/engagement`

**响应示例**:
```json
{
  "favorite_count": 45,
  "like_count": 128,
  "share_count": 32,
  "is_favorited": false,
  "is_liked": false
}
```

#### 6.2 记录分享

**POST** `/api/v1/engagements/{id}/share`

**请求体**:
```json
{
  "channel": "wechat"
}
```

**说明**: `channel` 可选值: `wechat`/`moments`/`link`

---

### 7. 通知模块 (Notifications)

| 方法 | 路径 | 描述 | 权限 | Mock |
|------|------|------|------|------|
| GET | `/notifications` | 通知日志列表 | 管理员 | ✅ |
| GET | `/notifications/me` | 我的通知记录 | 用户 | ✅ |
| POST | `/notifications/preview` | 通知预览 | 管理员 | ❌ |
| POST | `/notifications/enqueue` | 发送通知（入队） | 管理员 | ❌ |
| DELETE | `/notifications/me` | 清空我的全部通知 | 用户 | ✅ |
| PUT | `/notifications/me/read-all` | 标记全部通知已读 | 用户 | ✅ |
| POST | `/notifications/me/batch-delete` | 批量删除通知 | 用户 | ✅ |
| DELETE | `/notifications/{id}` | 删除单条通知 | 用户 | ✅ |

#### 7.1 清空我的全部通知

**DELETE** `/api/v1/notifications/me`

**权限**: 用户（需登录）

**响应**: `204 No Content`

**说明**: 删除当前用户的所有通知记录

#### 7.2 标记全部通知已读

**PUT** `/api/v1/notifications/me/read-all`

**权限**: 用户（需登录）

**响应**: `204 No Content`

**说明**: 将当前用户所有 `pending`/`sent` 状态的通知标记为 `read`，前端不再显示"新"标签

#### 7.3 批量删除通知

**POST** `/api/v1/notifications/me/batch-delete`

**权限**: 用户（需登录）

**请求体**:
```json
{
  "ids": [1, 2, 3]
}
```

**响应**: `204 No Content`

**说明**: 仅删除属于当前用户的通知，不属于当前用户的 ID 会被忽略

#### 7.4 删除单条通知

**DELETE** `/api/v1/notifications/{notification_id}`

**权限**: 用户（需登录，只能删除自己的通知）

**响应**: `204 No Content`

**错误**: `404` — 通知不存在或不属于当前用户

---

### 8. 缴费模块 (Payments) - ✅ 已完成 ✨ 新增

| 方法 | 路径 | 描述 | 权限 | Mock | 前端文件 |
|------|------|------|------|------|---------|
| **GET** | **`/payments`** | **缴费记录分页列表** | **用户** | **❌** | `services/payments.ts` |
| **GET** | **`/payments/{id}`** | **缴费详情** | **用户** | **❌** | `services/payments.ts` |
| **POST** | **`/payments`** | **创建缴费记录** | **用户** | **❌** | `services/payments.ts` |
| **PATCH** | **`/payments/{id}`** | **更新缴费记录** | **用户** | **❌** | `services/payments.ts` |
| **DELETE** | **`/payments/{id}`** | **删除缴费记录** | **用户** | **❌** | `services/payments.ts` |
| **POST** | **`/payments/bulk-delete`** | **批量删除缴费** | **用户** | **❌** | `services/payments.ts` |

#### 8.1 缴费记录分页列表

**GET** `/api/v1/payments`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| per_page | number | 否 | 每页数量，默认 5，最大 50 |
| status | string | 否 | 状态筛选: `paid`/`unpaid` |
| category | string | 否 | 类型筛选: `论坛`/`峰会`/`研讨会`/`培训` |
| activity_id | number | 否 | 活动ID筛选 |

**响应示例**:
```json
{
  "items": [
    {
      "id": 1,
      "user_id": 1,
      "activity_id": 101,
      "activity_title": "暑期培训会议",
      "amount": 63.00,
      "category": "论坛",
      "status": "paid",
      "pay_date": "2025-10-10",
      "cover_url": "https://...",
      "date_range": "2025年11月10日—13日",
      "time_range": "9:00 AM - 5:00 PM",
      "payer": "张三",
      "order_no": "20241026143000123456",
      "transaction_no": "CONF_884812345678",
      "payment_screenshot": null,
      "created_at": "2026-01-08T10:00:00Z",
      "updated_at": "2026-01-08T10:00:00Z"
    }
  ],
  "total": 8,
  "page": 1,
  "per_page": 5,
  "total_pages": 2
}
```

---

### 9. 发票抬头模块 (Invoice Headers) - ✅ 已完成 ✨ 新增

| 方法 | 路径 | 描述 | 权限 | Mock | 前端文件 |
|------|------|------|------|------|---------|
| **GET** | **`/invoice-headers`** | **发票抬头分页列表** | **用户** | **❌** | `services/invoice-headers.ts` |
| **GET** | **`/invoice-headers/{id}`** | **发票抬头详情** | **用户** | **❌** | `services/invoice-headers.ts` |
| **GET** | **`/invoice-headers/{id}/copy-text`** | **获取完整复制文本** | **用户** | **❌** | `services/invoice-headers.ts` |
| **POST** | **`/invoice-headers`** | **创建发票抬头** | **用户** | **❌** | `services/invoice-headers.ts` |
| **PATCH** | **`/invoice-headers/{id}`** | **更新发票抬头** | **用户** | **❌** | `services/invoice-headers.ts` |
| **DELETE** | **`/invoice-headers/{id}`** | **删除发票抬头** | **用户** | **❌** | `services/invoice-headers.ts` |

#### 9.1 发票抬头分页列表

**GET** `/api/v1/invoice-headers`

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码，默认 1 |
| per_page | number | 否 | 每页数量，默认 4，最大 50 |
| type | string | 否 | 类型筛选: `personal`/`company` |

**响应示例**:
```json
{
  "items": [
    {
      "id": 1,
      "user_id": 1,
      "name": "湖南大学",
      "type": "company",
      "tax_number": "91430000738820X",
      "address": "长沙市岳麓区麓山南路",
      "phone": "0731-88821234",
      "bank_name": "中国银行长沙分行",
      "bank_account": "7328 0000 1234 5678",
      "created_at": "2026-01-08T10:00:00Z",
      "updated_at": "2026-01-08T10:00:00Z"
    }
  ],
  "total": 6,
  "page": 1,
  "per_page": 4,
  "total_pages": 2
}
```

#### 9.2 获取发票抬头复制文本

**GET** `/api/v1/invoice-headers/{id}/copy-text`

**响应示例**:
```json
{
  "text": "湖南大学\n税号: 91430000738820X\n地址: 长沙市岳麓区麓山南路\n电话: 0731-88821234\n开户银行: 中国银行长沙分行\n银行账号: 7328 0000 1234 5678"
}
```

**说明**: 返回完整格式化文本，前端直接写入剪贴板。个人发票仅返回名称。

---

### 10. 徽章模块 (Badges)

| 方法 | 路径 | 描述 | 权限 | Mock |
|------|------|------|------|------|
| GET | `/badges` | 徽章列表 | 管理员 | ❌ |
| POST | `/badges` | 创建徽章 | 管理员 | ❌ |
| POST | `/badges/{code}/award` | 发放徽章 | 管理员 | ❌ |
| GET | `/badges/me` | 我的徽章 | 用户 | ❌ |

---

### 11. 徽章规则模块 (Badge Rules)

| 方法 | 路径 | 描述 | 权限 | Mock |
|------|------|------|------|------|
| GET | `/badge-rules` | 规则列表 | 管理员 | ❌ |
| POST | `/badge-rules` | 创建规则 | 管理员 | ❌ |
| PATCH | `/badge-rules/{id}` | 更新规则 | 管理员 | ❌ |
| DELETE | `/badge-rules/{id}` | 删除规则 | 管理员 | ❌ |
| POST | `/badge-rules/{id}/preview` | 规则预览 | 管理员 | ❌ |

---

### 12. 报表模块 (Reports)

| 方法 | 路径 | 描述 | 权限 | Mock |
|------|------|------|------|------|
| GET | `/reports/overview` | 仪表盘概览 | 管理员 | ❌ |
| GET | `/reports/activity/{id}` | 活动维度统计 | 管理员 | ❌ |

---

### 13. 审计模块 (Audit)

| 方法 | 路径 | 描述 | 权限 | Mock |
|------|------|------|------|------|
| GET | `/audit-logs` | 操作日志列表 | 管理员 | ❌ |

---

### 14. 调度器模块 (Scheduler)

| 方法 | 路径 | 描述 | 权限 | Mock |
|------|------|------|------|------|
| GET | `/scheduler/tasks` | 周期任务列表 | 管理员 | ❌ |
| POST | `/scheduler/run` | 立即运行任务 | 管理员 | ❌ |

---

### 15. 微信模块 (WeChat)

| 方法 | 路径 | 描述 | 权限 | Mock | 前端文件 |
|------|------|------|------|------|---------|
| **POST** | **`/wechat/decrypt-phone`** | **微信手机号解密 - P0** | **公开** | **✅** | `services/auth.ts` |

#### 13.1 微信手机号解密接口详情

**POST** `/api/v1/wechat/decrypt-phone`

解密微信小程序授权获取的用户手机号。

**配置模式**:
- **Mock模式** (开发环境): 返回模拟手机号 `13800138000`
- **真实模式** (生产环境): 调用微信API解密

**请求体**:
```json
{
  "encrypted_data": "加密数据",
  "iv": "偏移向量"
}
```

**响应** (成功):
```json
{
  "phone": "13800138000"
}
```

---

## 🔄 Mock 模式说明

### 配置方式

```typescript
// frontend/app/src/config/index.ts
export default {
  USE_MOCK: true,  // ✅ 开启Mock模式（当前）
  API_BASE_URL: 'http://localhost:8000/api/v1'
}
```

### Mock 数据特性

1. **模拟网络延迟**: 200-500ms
2. **完整数据结构**: 与真实API完全一致
3. **状态管理**: 支持点赞、收藏等状态变化
4. **分页逻辑**: 支持分页、筛选、排序

### 切换到真实API

**步骤 1**: 修改配置文件
```typescript
export default {
  USE_MOCK: false,  // ❌ 关闭Mock模式
  API_BASE_URL: 'https://your-api-domain.com/api/v1'
}
```

**步骤 2**: 验证后端接口可用性

**步骤 3**: 测试完整业务流程

---

## 📦 数据库字段补充建议

### activities 表补充字段

```sql
-- P0 字段
ALTER TABLE activities ADD COLUMN city VARCHAR(50);
ALTER TABLE activities ADD COLUMN signup_deadline TIMESTAMP;
ALTER TABLE activities ADD COLUMN max_participants INTEGER;
ALTER TABLE activities ADD COLUMN current_participants INTEGER DEFAULT 0;

-- P1 字段
ALTER TABLE activities ADD COLUMN avg_rating DECIMAL(3,2);
ALTER TABLE activities ADD COLUMN signup_count INTEGER DEFAULT 0;
ALTER TABLE activities ADD COLUMN is_free BOOLEAN DEFAULT FALSE;
ALTER TABLE activities ADD COLUMN price DECIMAL(10,2);
ALTER TABLE activities ADD COLUMN agenda JSONB;
ALTER TABLE activities ADD COLUMN allow_signup_during_event BOOLEAN DEFAULT FALSE;
```

### signups 表补充字段

```sql
ALTER TABLE signups ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE signups ADD COLUMN reviewed_at TIMESTAMP;
ALTER TABLE signups ADD COLUMN rejection_reason TEXT;
ALTER TABLE signups ADD COLUMN personal JSONB;
ALTER TABLE signups ADD COLUMN payment JSONB;
ALTER TABLE signups ADD COLUMN accommodation JSONB;
ALTER TABLE signups ADD COLUMN transport JSONB;
```

### 新增表建议

```sql
-- 评论表
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  activity_id INTEGER REFERENCES activities(id),
  user_id INTEGER REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  images JSONB,
  parent_id INTEGER REFERENCES comments(id),
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 评论点赞表
CREATE TABLE comment_likes (
  id SERIAL PRIMARY KEY,
  comment_id INTEGER REFERENCES comments(id),
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- 互动表
CREATE TABLE engagements (
  id SERIAL PRIMARY KEY,
  activity_id INTEGER REFERENCES activities(id),
  user_id INTEGER REFERENCES users(id),
  type VARCHAR(20), -- favorite/like/share
  channel VARCHAR(20), -- 分享渠道
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(activity_id, user_id, type)
);
```

---

## 🎯 后端开发建议

### 开发顺序（按优先级）

**Week 1 (P0 - 阻塞上线):**
1. Day 1: 活动相关接口（4个）- 15-20h
2. Day 2: 报名相关接口（2个）- 6-8h
3. Day 3-4: 微信登录鉴权（5个）- 12-15h
4. Day 5: 联调测试、Bug修复

**Week 2 (P1 - 影响体验):**
1. Day 1-2: 评论/评分接口（7个）- 15-18h
2. Day 3: 用户/报名列表接口（4个）- 8-10h
3. Day 4: 互动接口（6个）- 10-12h
4. Day 5: 联调测试、Bug修复

### 技术选型建议

- **框架**: FastAPI (推荐) / Flask / Django
- **数据库**: PostgreSQL
- **鉴权**: JWT
- **文件存储**: 阿里云OSS / 腾讯云COS
- **缓存**: Redis
- **任务队列**: Celery (如需)

### 接口规范

1. **RESTful 风格**: 统一使用 GET/POST/PUT/PATCH/DELETE
2. **错误码统一**:
   - 400: 请求参数错误
   - 401: 未登录/Token过期
   - 403: 无权限
   - 404: 资源不存在
   - 409: 操作冲突（如重复报名）
   - 500: 服务器错误
3. **分页参数**: 统一使用 `page` 和 `per_page`
4. **时间格式**: ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`)
5. **响应格式**:
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "per_page": 10
}
```

---

## 📊 活动状态流转

```
draft → scheduled/published/archived
scheduled → published/closed/archived
published → closed/archived
closed → archived
```

- 首次发布自动写入 `publish_time`
- 归档自动写入 `archive_time`

---

## 📝 接口文档维护规范

### 更新流程
1. 前端新增接口 → 更新本文档
2. 后端实现接口 → 标记Mock状态为 ❌
3. 联调完成 → 更新变更记录

### 文档结构
- 📋 接口变更记录 - 记录所有变更
- 🎯 接口开发状态 - 前后端开发进度
- 📡 接口清单 - 详细接口列表
- 🔄 Mock 模式说明 - Mock配置和切换
- 📦 数据库补充 - 字段和表结构建议

---

**文档维护**: Claude AI + Cursor AI
**最后更新**: 2026年02月28日 16:30
**下次更新**: 后端接口实现时同步更新
