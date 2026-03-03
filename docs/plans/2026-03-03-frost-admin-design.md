# Frost Admin — 管理后台 UI 设计文档

> **日期**: 2026-03-03
> **风格**: Apple Vision Pro 磨砂玻璃 (visionOS)
> **色系**: 冷色调 Teal 青碧
> **主题**: 暗黑 + 浅色双模式

## 1. 设计决策

| 决策 | 选择 | 原因 |
|------|------|------|
| 美学方向 | Apple Vision Pro | 用户要求毛玻璃、透明、线性、精致 |
| 主色调 | Teal (#0d9488) | 冷色调，比翠绿更精致，兼具专业感 |
| 主题模式 | 双主题同步实现 | 用户明确要求与小程序一致 |
| 图标系统 | Lucide React | 线性风格，与 Vision Pro 美学统一 |
| 字体 | Inter + JetBrains Mono | 现代感 + 数据可读性 |

## 2. 色彩系统

### 浅色模式 (Light)

```css
--color-primary: #0d9488;        /* Teal 600 */
--color-primary-light: #14b8a6;  /* Teal 500 */
--color-primary-lighter: #99f6e4; /* Teal 200 */
--color-bg-page: mesh gradient (teal + slate blur circles);
--color-bg-surface: rgba(255, 255, 255, 0.72);
--color-bg-surface-hover: rgba(255, 255, 255, 0.82);
--color-bg-sidebar: rgba(15, 23, 42, 0.92);
--color-border: rgba(255, 255, 255, 0.20);
--color-border-subtle: rgba(255, 255, 255, 0.10);
--color-text: #0f172a;
--color-text-secondary: #475569;
--color-text-muted: #64748b;
--color-shadow: rgba(0, 0, 0, 0.06);
```

### 暗黑模式 (Dark)

```css
--color-primary: #2dd4bf;        /* Teal 400 */
--color-primary-light: #5eead4;  /* Teal 300 */
--color-primary-lighter: #0d9488; /* Teal 600 dimmed */
--color-bg-page: #030712 + subtle teal mesh;
--color-bg-surface: rgba(30, 41, 59, 0.60);
--color-bg-surface-hover: rgba(30, 41, 59, 0.75);
--color-bg-sidebar: rgba(2, 6, 23, 0.95);
--color-border: rgba(148, 163, 184, 0.10);
--color-border-subtle: rgba(148, 163, 184, 0.06);
--color-text: #f1f5f9;
--color-text-secondary: #cbd5e1;
--color-text-muted: #94a3b8;
--color-shadow: rgba(0, 0, 0, 0.20);
```

### 语义色

```css
--color-success: #10b981 / #34d399 (dark);
--color-warning: #f59e0b / #fbbf24 (dark);
--color-error: #ef4444 / #f87171 (dark);
--color-info: #0ea5e9 / #38bdf8 (dark);
```

## 3. 磨砂玻璃效果

```css
/* 卡片 / 面板 */
.glass-surface {
  background: var(--color-bg-surface);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow:
    0 1px 2px var(--color-shadow),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* Header */
.glass-header {
  background: var(--color-bg-surface);
  backdrop-filter: blur(20px) saturate(160%);
  border-bottom: 1px solid var(--color-border-subtle);
}

/* Sidebar */
.glass-sidebar {
  background: var(--color-bg-sidebar);
  backdrop-filter: blur(24px) saturate(180%);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}
```

## 4. 布局结构

```
┌────────────────────────────────────────────────────┐
│  Mesh Gradient Background (fixed, full viewport)   │
│                                                    │
│  ┌─ Sidebar ─┐  ┌─ Main ────────────────────────┐ │
│  │ Dark Glass │  │ ┌─ Header (Glass) ──────────┐ │ │
│  │ 240px      │  │ │ Breadcrumb  Search  Theme │ │ │
│  │ Collapsible│  │ └────────────────────────────┘ │ │
│  │            │  │                                │ │
│  │ Logo       │  │  ┌─ Content ────────────────┐  │ │
│  │ Nav Groups │  │  │ PageHeader               │  │ │
│  │ - Items    │  │  │ Glass Cards / Tables     │  │ │
│  │            │  │  │                          │  │ │
│  │ Collapse   │  │  └──────────────────────────┘  │ │
│  │ User Info  │  │                                │ │
│  └────────────┘  └────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

### 4.1 Sidebar 交互基线（按 SnowUI / Big-Small 参考）

- 侧边栏存在两种稳定状态：
  - `Big`：完整信息态（头像 / 用户名 / 分组 / 主导航 / 底部 CTA）
  - `Small`：窄栏态（仅头像 / 图标主导航 / 底部按钮）
- `Small` 状态下，带子项的主导航允许通过悬浮卡片弹出子菜单
- 折叠不是“完全收起”，而是从完整信息架构切换到紧凑操作架构
- 视觉上保留：
  - 超大圆角容器
  - 轻磨砂玻璃
  - 极细边框
  - 柔和投影
  - 顶部用户信息区

## 5. 动效规范

| 交互 | 动效 | 时长 |
|------|------|------|
| 卡片 hover | translateY(-2px) + shadow 加深 | 200ms ease |
| 侧边栏折叠 | width 240px ↔ 72px | 300ms cubic-bezier |
| 页面切换 | opacity 0→1 + translateY(8→0) | 250ms ease-out |
| 按钮 hover | 背景色加亮 + subtle scale(1.02) | 150ms ease |
| 主题切换 | CSS 变量 transition | 350ms ease |
| 数字变化 | CountUp 动画 | 600ms |

## 6. 仪表盘内容规范

**只展示可操作数据，零废话**:

- Row 1: 4x StatCard (报名总数/待审核/今日签到/活动数 + 趋势)
- Row 2: 报名趋势折线图 (7/14/30天切换) + 活动状态环形图
- Row 3: 最近活动表格 (名称/状态/报名数/时间/操作)

## 7. 实施步骤

1. **Step 1**: tokens.css + antdTheme.ts + index.css + useTheme.ts
2. **Step 2**: AdminLayout.tsx + Login.tsx
3. **Step 3**: Dashboard.tsx
4. **Step 4**: Activities / SignupManage / 其他核心页面
5. **Step 5**: 空壳页 + 新增页 (PaymentManage / UserManage)
