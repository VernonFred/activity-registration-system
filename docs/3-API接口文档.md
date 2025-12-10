# API 接口文档

> **创建时间**: 2025年12月02日 23:50  
> **最后更新**: 2025年12月10日 08:00  
> **维护人**: Cursor AI  
> **API 基础路径**: `http://localhost:8000/api/v1`

---

## 📋 接口变更记录

| 时间 | 变更类型 | 接口路径 | 变更内容 | 操作人 |
|------|----------|----------|----------|--------|
| 2025年12月09日 19:30 | 修改 | `/activities/{id}` | 返回的 agenda 字段支持嵌套结构 | Cursor AI |
| 2025年12月02日 23:50 | 整合 | - | 从 api_overview.md 整合所有接口 | Cursor AI |
| 2024年01月28日 | 新增 | `/signups/bulk-review` | 批量审核报名 | - |
| 2024年01月28日 | 新增 | `/users/me` | 用户资料管理 | - |
| 2024年01月28日 | 新增 | `/signups/{id}/companions` | 同行人员管理 | - |

---

## 🔐 认证说明

### 小程序端
1. 调用 `/api/v1/auth/wechat-login` 获取用户 token
2. 后续请求在 Header 中携带 `Authorization: Bearer <token>`

### 管理端
1. 调用 `/api/v1/auth/login` 获取管理员 token
2. 后续请求在 Header 中携带 `Authorization: Bearer <token>`

---

## 📡 接口清单

### 1. 认证模块 (Auth)

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| POST | `/auth/login` | 管理员登录 | 公开 |
| GET | `/auth/me` | 查看当前管理员信息 | 管理员 |
| POST | `/auth/wechat-login` | 小程序登录 | 公开 |
| GET | `/auth/user/me` | 获取当前用户信息 | 用户 |

### 2. 活动模块 (Activities)

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | `/activities` | 活动列表（分页） | 公开 |
| GET | `/activities/count` | 活动总数统计 | 公开 |
| POST | `/activities` | 创建活动 | 管理员 |
| GET | `/activities/{id}` | 获取活动详情 | 公开 |
| PATCH | `/activities/{id}` | 更新活动信息 | 管理员 |
| DELETE | `/activities/{id}` | 删除活动 | 管理员 |
| POST | `/activities/{id}/checkin-token` | 生成签到二维码 | 管理员 |
| GET | `/activities/{id}/checkins` | 查看签到记录 | 管理员 |
| GET | `/activities/{id}/stats` | 查看报名统计 | 管理员 |
| GET | `/activities/{id}/feedbacks` | 查看反馈列表 | 管理员 |
| POST | `/activities/{id}/feedback` | 提交反馈 | 用户 |
| GET | `/activities/{id}/feedback/me` | 获取我的反馈 | 用户 |
| DELETE | `/activities/{id}/feedback` | 删除我的反馈 | 用户 |
| GET | `/activities/{id}/exports/signups` | 导出报名名单 | 管理员 |
| GET | `/activities/{id}/exports/comments` | 导出评论列表 | 管理员 |
| GET | `/activities/{id}/exports/shares` | 导出分享记录 | 管理员 |
| GET | `/activities/{id}/feed` | 活动动态流 | 公开 |
| POST | `/activities/{id}/favorite` | 收藏活动 | 用户 |
| DELETE | `/activities/{id}/favorite` | 取消收藏 | 用户 |
| POST | `/activities/{id}/like` | 点赞活动 | 用户 |
| DELETE | `/activities/{id}/like` | 取消点赞 | 用户 |
| POST | `/activities/{id}/share` | 记录分享 | 用户/匿名 |
| GET | `/activities/{id}/engagement` | 获取互动统计 | 公开 |
| GET | `/activities/{id}/comments` | 评论列表 | 公开 |
| POST | `/activities/{id}/comments` | 提交评论 | 用户 |
| DELETE | `/activities/{id}/comments/{comment_id}` | 删除评论 | 用户/管理员 |

### 3. 报名模块 (Signups)

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | `/signups` | 报名记录列表 | 管理员 |
| POST | `/signups` | 创建报名 | 用户 |
| GET | `/signups/{id}` | 查看报名详情 | 用户/管理员 |
| PATCH | `/signups/{id}` | 更新报名信息 | 用户/管理员 |
| POST | `/signups/{id}/review` | 审核报名 | 管理员 |
| POST | `/signups/{id}/remind` | 发送提醒通知 | 管理员 |
| POST | `/signups/{id}/checkins` | 核销签到 | 管理员 |
| POST | `/signups/bulk-review` | 批量审核 | 管理员 |
| GET | `/signups/{id}/companions` | 同行人员列表 | 用户 |
| POST | `/signups/{id}/companions` | 添加同行人员 | 用户 |
| PATCH | `/signups/{id}/companions/{companion_id}` | 更新同行人员 | 用户 |
| DELETE | `/signups/{id}/companions/{companion_id}` | 删除同行人员 | 用户 |

### 4. 用户模块 (Users)

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | `/users/me` | 获取当前用户资料 | 用户 |
| PATCH | `/users/me` | 更新当前用户资料 | 用户 |
| GET | `/users/me/stats` | 获取用户统计 | 用户 |

### 5. 通知模块 (Notifications)

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | `/notifications` | 通知日志列表 | 管理员 |
| GET | `/notifications/me` | 我的通知记录 | 用户 |
| POST | `/notifications/preview` | 通知预览 | 管理员 |

### 6. 徽章模块 (Badges)

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | `/badges` | 徽章列表 | 管理员 |
| POST | `/badges` | 创建徽章 | 管理员 |
| POST | `/badges/{code}/award` | 发放徽章 | 管理员 |
| GET | `/badges/me` | 我的徽章 | 用户 |

### 7. 徽章规则模块 (Badge Rules)

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | `/badge-rules` | 规则列表 | 管理员 |
| POST | `/badge-rules` | 创建规则 | 管理员 |
| PATCH | `/badge-rules/{id}` | 更新规则 | 管理员 |
| DELETE | `/badge-rules/{id}` | 删除规则 | 管理员 |
| POST | `/badge-rules/{id}/preview` | 规则预览 | 管理员 |

### 8. 报表模块 (Reports)

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | `/reports/overview` | 仪表盘概览 | 管理员 |
| GET | `/reports/activity/{id}` | 活动维度统计 | 管理员 |

### 9. 审计模块 (Audit)

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | `/audit-logs` | 操作日志列表 | 管理员 |

### 10. 调度器模块 (Scheduler)

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | `/scheduler/tasks` | 周期任务列表 | 管理员 |
| POST | `/scheduler/run` | 立即运行任务 | 管理员 |

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

## 📝 变更记录

| 时间 | 变更内容 | 操作人 |
|------|----------|--------|
| 2025年12月02日 23:50 | 创建文档，整合所有接口 | Cursor AI |

---

**下次更新**: 新增接口时同步更新

