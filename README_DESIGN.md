# 设计系统使用指南 - 快速开始

> 为开发团队提供的快速参考

---

## 📖 核心文档（按优先级）

### 1. 设计指南（必读！）⭐⭐⭐
**文件**：`docs/DESIGN_GUIDELINES.md`（完整版，48KB）

**包含内容：**
- ✅ 设计稿使用方式（提取布局/逻辑，不照搬配色/审美）
- ✅ 完整设计系统（配色/间距/字体/圆角/阴影/边框/动画）
- ✅ 核心组件规范（按钮/输入框/搜索框/卡片/标签/图标）
- ✅ 图标策略（SVG 内联，禁止 PNG）
- ✅ 响应式设计
- ✅ 开发工作流
- ✅ 设计检查清单

### 2. 设计系统 V2 说明
**文件**：`docs/DESIGN_SYSTEM_V2.md`

**包含内容：**
- 设计规范详解
- 新旧设计对比
- 验收标准

### 3. V2 实现示例
**文件**：`frontend/app/DESIGN_V2_README.md`

**包含内容：**
- 首页 V2 实现
- 如何预览 V2
- V1 vs V2 对比

---

## 🎨 设计基调

### 风格定位
**Modern B2B SaaS** - 简洁、专业、高品质

### 灵感来源
- **Linear**：极简主义、高效交互
- **Vercel**：清爽、现代、优雅
- **Stripe**：专业、可信赖、细节完美

---

## 🚀 快速开发指南

### 每开发一个页面的步骤：

```bash
1️⃣ 查看设计稿
   - 管理端：/管理端参考样式/
   - 小程序端：/小程序端设计/

2️⃣ 提取信息（从设计稿）
   ✅ 布局结构
   ✅ 功能逻辑
   ✅ 交互流程
   ❌ 不要照搬：配色、间距、具体审美

3️⃣ 应用设计系统（从 DESIGN_GUIDELINES.md）
   ✅ 配色：主色 #3b82f6，中性灰 #171717~#fafafa
   ✅ 间距：4px Grid（8rpx/16rpx/24rpx/32rpx...）
   ✅ 字体：xs/sm/base/lg/xl/2xl
   ✅ 圆角：sm/md/lg/xl/full
   ✅ 阴影：柔和、透明度低（0.04-0.08）
   ✅ 图标：SVG 内联（禁止 PNG）

4️⃣ 精修细节
   - 调整间距（4px Grid）
   - 调整阴影（柔和）
   - 调整动画（200ms）
   - 调整字距（-0.2rpx ~ -0.4rpx）

5️⃣ 验证
   - UI 与设计稿逻辑一致 ✅
   - 视觉风格符合设计系统 ✅
   - 响应式适配正常 ✅
   - 交互流畅 ✅
```

---

## 🎯 核心设计规范（速查）

### 配色
```scss
// 主色
$primary: #3b82f6;       // Blue-500
$primary-hover: #2563eb; // Blue-600

// 文字
$text-primary: #171717;   // 标题
$text-body: #404040;      // 正文
$text-helper: #737373;    // 辅助

// 背景
$bg-page: #fafafa;        // 页面背景
$bg-card: #fff;           // 卡片背景

// 边框
$border: #f0f0f0;         // 非常浅的灰
```

### 间距（4px Grid）
```scss
8rpx / 16rpx / 24rpx / 32rpx / 48rpx / 64rpx
```

### 字体
```scss
// 大小
20rpx(xs) / 22rpx(sm) / 26rpx(base) / 28rpx(lg) / 32rpx(xl) / 36rpx(2xl)

// 字重
400(normal) / 500(medium) / 600(semibold) / 700(bold)

// 行高
1.2(tight) / 1.4(normal) / 1.5(relaxed)
```

### 圆角
```scss
8rpx(sm) / 12rpx(md) / 16rpx(lg) / 20rpx(xl) / 9999rpx(full)
```

### 阴影（柔和）
```scss
box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04), 
            0 1rpx 2rpx rgba(0, 0, 0, 0.06);
```

---

## 🧩 常用组件示例

### 主要按钮
```scss
.btn-primary {
  height: 80rpx;
  padding: 0 32rpx;
  background: #2563eb;
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  box-shadow: 0 2rpx 4rpx rgba(37, 99, 235, 0.2);
}
```

### 搜索框
```scss
.search-bar {
  height: 72rpx;
  padding: 0 20rpx;
  background: #fafafa;
  border-radius: 36rpx;  // 胶囊形状
  display: flex;
  align-items: center;
  gap: 12rpx;
}
```

### 活动卡片
```scss
.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04), 
              0 1rpx 2rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #f0f0f0;
}
```

### 状态标签（优雅徽章）
```scss
.badge-success {
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  background: rgba(34, 197, 94, 0.1);  // 浅色背景
  border: 1rpx solid rgba(34, 197, 94, 0.2);
  color: #16a34a;
  font-size: 22rpx;
  font-weight: 500;
}
```

---

## 🎭 图标使用（重要！）

### ❌ 禁止
```tsx
// 不要使用 PNG/JPG 图标
import icon from '@/assets/icons/search.png'  // ❌
```

### ✅ 正确做法

#### 小程序端（内联 SVG）
```tsx
// components/Icons/SearchIcon.tsx
export const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" 
       fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

// 使用
import { SearchIcon } from '@/components/Icons'

<View className="icon">
  <SearchIcon />
</View>

// 样式化
.icon {
  display: flex;
  align-items: center;
  color: #737373;  // 通过 color 控制颜色
}
```

#### Web/管理端（lucide-react）
```tsx
import { Search } from 'lucide-react'

<Search size={20} color="#737373" strokeWidth={2} />
```

---

## ✅ 开发检查清单

每完成一个页面，检查以下项目：

### 视觉
- [ ] 配色符合设计系统
- [ ] 间距使用 4px Grid
- [ ] 字体大小/字重正确
- [ ] 阴影柔和（透明度 0.04-0.08）
- [ ] 图标全部 SVG（无 PNG）

### 交互
- [ ] 过渡动画 200ms
- [ ] Hover 状态明显
- [ ] Active 状态有反馈
- [ ] 加载/错误状态清晰

### 响应式
- [ ] 小程序：安全区域处理
- [ ] Web：屏幕适配良好

---

## 📂 设计稿位置

```
/Users/Python项目/活动报名系统/
├── 管理端参考样式/     ← Web 管理端设计稿
└── 小程序端设计/       ← 微信小程序设计稿
```

---

## 💡 记住

1. **设计稿**：只提取逻辑，不照搬视觉
2. **设计系统**：严格遵守配色/间距/字体规范
3. **图标**：必须用 SVG，禁止 PNG
4. **细节**：柔和阴影、4px Grid、-0.2rpx 字距

---

**Need Help?**  
完整文档：`docs/DESIGN_GUIDELINES.md`  
问题反馈：随时沟通调整


