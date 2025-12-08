# 活动会议报名系统

面向品牌部门使用的微信小程序 + 管理后台。小程序侧负责活动浏览、报名、通知与签到；后台负责活动配置、报名审核、通知推送以及数据导出。

## 仓库结构

```
backend/        # FastAPI 服务端代码
  app/
  tests/
frontend/       # Taro + React 小程序/H5 前端
docs/           # 业务文档、接口规范等
会议报名系统.md # 产品规划文档
```

## 技术栈
- 前端：Taro + React + TypeScript（Taro 3.6.5），SCSS 自定义样式。
- 后端：FastAPI + SQLAlchemy + MySQL，Pydantic 做参数校验；Alembic 进行数据库迁移。
- 部署：Docker 容器化，Nginx 反向代理；微信小程序部署到公司云服务器。

## 开发环境要求
- Python 3.10+
- Node.js 18+
- 包管理器：推荐使用 `pnpm`（依赖安装更快、占用更少），也可兼容 `npm`。文档后续会同时给出 pnpm/npx 对应命令。
- Docker（用于本地容器化测试）

## 下一步
1. 接入微信小程序登录、完善审核通知与签到逻辑。
2. 完善前端页面联调（活动详情、报名信息、管理员审核视图）。
3. 梳理 OpenAPI 文档与自动化测试。

## 后端本地运行指南
1. **创建虚拟环境并安装依赖**
   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env，调整数据库地址、密钥等
   ```
   - 如需对接正式微信登录，将 `.env` 中的 `WECHAT_APPID`、`WECHAT_SECRET` 设置为真实值，并把 `WECHAT_MOCK_ENABLED` 调整为 `false`；可通过 `WECHAT_TIMEOUT` 配置微信接口超时（秒）。
   - 徽章自动发放默认开启，相关配置：
     ```env
     BADGE_AUTO_RULES_ENABLED=true
     BADGE_FIRST_ATTENDANCE_CODE=first_attendance
     BADGE_CHECKIN_CODE=checkin_complete
     BADGE_REPEAT_ATTENDANCE_CODE=repeat_attendance
     BADGE_REPEAT_ATTENDANCE_THRESHOLD=3
     ```
     如无需自动发放，可将 `BADGE_AUTO_RULES_ENABLED` 设为 `false`。
3. **准备本地 MySQL 数据库**
   ```sql
   CREATE DATABASE IF NOT EXISTS event_signup CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'event_user'@'localhost' IDENTIFIED BY 'change_me';
   GRANT ALL PRIVILEGES ON event_signup.* TO 'event_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
   然后在 `.env` 的 `DATABASE_URL` 中填入 `mysql+pymysql://event_user:change_me@localhost:3306/event_signup`。
4. **运行开发服务器**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   访问 `http://localhost:8000/health` 验证服务正常。

5. **数据库迁移（Alembic）**
   - 生成迁移（示例）：
     ```bash
     alembic revision -m "create user table"
     ```
   - 应用迁移：
     ```bash
     alembic upgrade head
     ```

## 样本数据填充
- 在 MySQL 中执行迁移后，可运行脚本写入样例活动和报名数据：
  ```bash
  cd backend
  source .venv/bin/activate
  python -m scripts.seed_data
  ```
  数据将包括长沙站活动、行程/住宿表单字段以及示例报名记录，便于前端联调。
  默认会创建管理员账号 `admin / Admin@123`，用于后台登录接口测试。

## 运行测试
- 使用 pytest 执行后端单元测试：
  ```bash
  cd backend
  source .venv/bin/activate
  pytest
  ```

## 前端本地运行指南
1. 进入 `frontend/admin` 并安装依赖：
   ```bash
   npm install
   sudo npm install -g @tarojs/cli   # 或使用 npx @tarojs/cli
   ```
2. **启动开发模式**
   ```bash
   npm run dev:weapp   # 生成 dist/，使用微信开发者工具导入调试
   npm run dev:h5      # 浏览器预览
   ```
3. **接口配置**：默认使用 `http://localhost:8000/api/v1`，可通过设置 `TARO_APP_API_BASE` 环境变量覆盖。

## 阶段性回归（截至当前）
- 后端：活动/报名/导出/审核/签到/通知/审计/报表闭环能力已搭建，`form_fields` 支持覆盖式更新；批量删除与导出 CSV/XLSX 接入，测试通过。
- 管理端：活动创建/列表/详情、报名管理、通知中心、调度器页面就绪；表单设计已支持左控件库 → 右画布拖拽与保存；近期修复拖拽反馈问题。
- 小程序端：页面与服务层骨架就绪；活动列表与报名页基础联调打通；`form_fields` 渲染与微信登录将优先推进。

## 下一步规划与优先级
- P0：管理端批量审核/签到核验、导出规范化、表单设计增强；小程序端字段映射与报名提交、登录打通；后端表单字段级 CRUD 与 OpenAPI 扩展。
- P1：通知模板与渠道接入、调度器重试与审计、报表扩展、徽章规则配置管理。
- P2：对象存储直传、长列表优化、视觉统一与暗色模式。
