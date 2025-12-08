# Git 版本管理指南

> **创建时间**: 2025年12月03日 00:05  
> **最后更新**: 2025年12月03日 00:05  
> **维护人**: Cursor AI

---

## 📋 变更记录

| 时间 | 变更类型 | 变更内容 | 操作人 |
|------|----------|----------|--------|
| 2025年12月03日 00:05 | 创建 | 创建 Git 版本管理指南 | Cursor AI |

---

## 🎯 为什么需要 Git/GitHub

| 功能 | 说明 |
|------|------|
| **版本控制** | 记录每次代码修改，可以随时回退 |
| **代码备份** | 代码存储在云端，不怕丢失 |
| **协作开发** | 多人协作时可以合并代码 |
| **修改历史** | 查看谁在什么时候改了什么 |

---

## 🚀 快速开始（5 分钟上手）

### 第一步：创建 GitHub 账号

1. 访问 [https://github.com](https://github.com)
2. 点击 "Sign up" 注册账号
3. 验证邮箱

### 第二步：创建新仓库

1. 登录 GitHub 后，点击右上角 "+" → "New repository"
2. 填写信息：
   - **Repository name**: `activity-registration-system`（或你喜欢的名字）
   - **Description**: `活动报名系统 - 微信小程序 + 管理端`
   - **Visibility**: 选择 `Private`（私有）或 `Public`（公开）
   - ❌ 不要勾选 "Add a README file"
3. 点击 "Create repository"

### 第三步：本地初始化 Git

在终端执行以下命令：

```bash
# 进入项目目录
cd /Users/Python项目/活动报名系统

# 初始化 Git 仓库
git init

# 配置用户信息（首次使用需要）
git config user.name "你的名字"
git config user.email "你的邮箱@example.com"
```

### 第四步：创建 .gitignore 文件

这个文件告诉 Git 哪些文件不需要跟踪：

```bash
# 在项目根目录创建 .gitignore
```

内容如下（我会帮你创建）：

```
# 依赖目录
node_modules/
.venv/
__pycache__/

# 编译输出
dist/
build/

# 环境配置
.env
.env.local

# IDE
.idea/
.vscode/
*.swp

# 系统文件
.DS_Store
Thumbs.db

# 日志
*.log
npm-debug.log*

# 小程序
project.private.config.json
```

### 第五步：关联远程仓库

```bash
# 添加远程仓库（把 YOUR_USERNAME 替换成你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/activity-registration-system.git
```

### 第六步：首次提交

```bash
# 添加所有文件
git add .

# 创建第一次提交
git commit -m "初始化项目：活动报名系统"

# 推送到 GitHub（首次需要设置上游分支）
git push -u origin main
```

**注意**：首次推送时，GitHub 会要求你登录验证。

---

## 📅 日常使用流程

### 每次修改代码后

```bash
# 1. 查看修改了哪些文件
git status

# 2. 添加修改的文件
git add .

# 3. 提交修改（写清楚改了什么）
git commit -m "修复：搜索页清除全部按钮对齐问题"

# 4. 推送到 GitHub
git push
```

### 提交信息规范

| 前缀 | 使用场景 | 示例 |
|------|----------|------|
| `新增：` | 新功能 | `新增：活动详情页四Tab切换` |
| `修复：` | Bug 修复 | `修复：轮播图不居中问题` |
| `优化：` | 代码优化 | `优化：首页加载性能` |
| `文档：` | 文档更新 | `文档：更新 API 接口文档` |
| `样式：` | 样式调整 | `样式：调整卡片阴影效果` |
| `重构：` | 代码重构 | `重构：拆分首页组件` |

---

## 🔧 常用命令速查

| 命令 | 作用 |
|------|------|
| `git status` | 查看当前状态 |
| `git add .` | 添加所有修改 |
| `git add 文件名` | 添加指定文件 |
| `git commit -m "信息"` | 提交修改 |
| `git push` | 推送到远程 |
| `git pull` | 拉取远程更新 |
| `git log` | 查看提交历史 |
| `git log --oneline` | 简洁查看历史 |
| `git diff` | 查看修改内容 |

---

## ❓ 常见问题

### Q1：推送时提示需要登录

**解决方案**：

1. 使用 HTTPS 方式（推荐新手）：
   - 首次推送时会弹出登录窗口
   - 输入 GitHub 用户名和密码（或 Personal Access Token）

2. 生成 Personal Access Token：
   - GitHub → Settings → Developer settings → Personal access tokens
   - 点击 "Generate new token"
   - 勾选 `repo` 权限
   - 复制生成的 token，用它代替密码

### Q2：提示 "fatal: not a git repository"

**原因**：当前目录不是 Git 仓库

**解决**：先执行 `git init`

### Q3：想要撤销修改

```bash
# 撤销工作区的修改（未 add）
git checkout -- 文件名

# 撤销暂存区的修改（已 add，未 commit）
git reset HEAD 文件名

# 撤销最近一次提交（已 commit，未 push）
git reset --soft HEAD~1
```

### Q4：想要回退到之前的版本

```bash
# 查看历史提交
git log --oneline

# 回退到指定版本（保留修改）
git reset --soft 版本号

# 回退到指定版本（丢弃修改）
git reset --hard 版本号
```

---

## 📱 推荐工具

### 图形化工具（适合新手）

| 工具 | 平台 | 说明 |
|------|------|------|
| **GitHub Desktop** | Mac/Windows | GitHub 官方，最简单 |
| **Sourcetree** | Mac/Windows | 功能强大 |
| **GitKraken** | 全平台 | 界面美观 |

### VS Code / Cursor 内置

- 左侧边栏有 Git 图标
- 可以可视化查看修改、提交、推送

---

## 🎯 建议的工作流程

### 每天开始工作前

```bash
git pull  # 拉取最新代码（如果有多人协作）
```

### 完成一个功能后

```bash
git add .
git commit -m "新增：xxx功能"
git push
```

### 每天结束工作时

```bash
git add .
git commit -m "进度：今日完成xxx"
git push
```

---

## 📝 变更记录

| 时间 | 变更内容 | 操作人 |
|------|----------|--------|
| 2025年12月03日 00:05 | 创建文档 | Cursor AI |

---

**下次更新**: 根据使用情况补充

