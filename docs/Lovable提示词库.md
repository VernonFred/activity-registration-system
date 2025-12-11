# Lovable 提示词库

> **使用说明**: 本文档专门用于存放 Lovable AI 设计系统的提示词。将提示词输入 Lovable，获取生成的代码后，结合项目实际情况进行 UI 设计实现。

**项目**: 活动报名系统（Taro 3.6.26 + React + TypeScript + SCSS）  
**设计风格**: Lovable 风格，橙色主色调，双主题（浅色/暗黑）  
**创建日期**: 2025年12月10日  
**最后更新**: 2025年12月10日

---

## 📑 目录

- [活动议程页面](#活动议程页面)
- [活动详情页面](#活动详情页面)（待补充）
- [活动列表页面](#活动列表页面)（待补充）
- [报名表单页面](#报名表单页面)（待补充）

---

## 活动议程页面

### 🎯 功能概述

设计一个现代化的会议活动议程页面，支持多天会议、分组议程、嵌套结构、折叠/展开功能，具有精致的动态交互效果。

### 📋 Lovable 提示词

```
请设计一个会议活动议程页面。

【功能需求】

1. 多天会议切换
   - 顶部显示日期Tab，可横向滚动
   - 点击Tab切换到对应天的议程
   - 最多支持5天会议

2. 议程分组展示
   - 每天包含多个议程分组（如：开幕仪式、主旨报告、专题论坛）
   - 分组头部显示：分组标题、时间范围
   - 分组下方显示主持人信息（姓名、职称）

3. 折叠/展开功能
   - 点击分组头部可以折叠/展开该分组
   - 提供"全部展开/折叠"按钮
   - 默认展开第一个分组
   - 折叠状态需要保存（刷新页面后保持）

4. 议程项展示
   - 每个议程项显示：时间、演讲人（头像、姓名、职称）、演讲主题、地点
   - 茶歇类型的议程项特殊显示（无演讲人，居中展示）
   - 议程项以卡片形式展示

5. 主题模式
   - 支持浅色和暗黑两种主题
   - 需要适配两种模式下的所有元素

6. 交互效果
   - 卡片悬停时有视觉反馈
   - 点击时有按压反馈
   - 折叠/展开有平滑动画
   - Tab切换有过渡效果

【数据结构】

多天会议：
- 日期、显示文本、议程分组列表

议程分组：
- 分组标题、时间范围、主持人（姓名、职称）、议程项列表

议程项：
- 时间范围、类型（演讲/讨论/茶歇/活动）
- 标题、演讲人（姓名、职称、头像）、地点

【页面布局】

从上到下：
1. 日期Tab导航（横向滚动）
2. 全部展开/折叠按钮（右上角）
3. 议程分组列表（垂直滚动）
   - 分组头部（可点击）
   - 主持人信息条
   - 议程项列表（可折叠）

请生成完整的 React 组件和 CSS 样式代码。
```

---

### 📊 数据结构示例

```typescript
// 多天会议数据
interface AgendaDay {
  id: number
  date: string              // "2025-11-12"
  display_date: string      // "2025年11月12日（第一天）"
  groups: AgendaGroup[]     // 该天的议程分组
}

// 议程分组
interface AgendaGroup {
  id: number
  title: string             // "开幕仪式"
  time_start: string        // "09:00"
  time_end: string          // "09:30"
  moderator?: {             // 主持人（可选）
    name: string
    title: string
  }
  items: AgendaItem[]       // 议程项列表
}

// 议程项
interface AgendaItem {
  id: number
  time_start: string        // "09:00"
  time_end: string          // "09:10"
  type: 'speech' | 'discussion' | 'break' | 'activity'
  title: string             // "致辞"
  speaker?: {               // 演讲人（可选，茶歇时无）
    name: string
    title: string
    avatar?: string
  }
  location?: string         // "主会场"
  description?: string      // 描述（可选）
}

// Mock 数据示例
const mockAgenda: AgendaDay[] = [
  {
    id: 1,
    date: '2025-11-12',
    display_date: '2025年11月12日（第一天）',
    groups: [
      {
        id: 11,
        title: '开幕仪式',
        time_start: '09:00',
        time_end: '09:30',
        moderator: {
          name: '张志东',
          title: '职业技术教育分会副理事长\n山东商业职业技术学院党委书记，教授'
        },
        items: [
          {
            id: 111,
            time_start: '09:00',
            time_end: '09:10',
            type: 'speech',
            title: '致辞',
            speaker: {
              name: '李 炯',
              title: '长沙民政职业技术学院党委书记，教授'
            },
            location: '主会场'
          },
          {
            id: 112,
            time_start: '09:10',
            time_end: '09:20',
            type: 'speech',
            title: '讲话',
            speaker: {
              name: '王仁祥',
              title: '湖南省教育厅副厅长'
            },
            location: '主会场'
          }
        ]
      },
      {
        id: 12,
        title: '主旨报告',
        time_start: '09:30',
        time_end: '11:30',
        moderator: {
          name: '刘建湘',
          title: '职业技术教育分会副理事长\n湖南工业职业技术学院党委书记，教授'
        },
        items: [
          {
            id: 121,
            time_start: '09:30',
            time_end: '10:00',
            type: 'speech',
            title: '以智慧平台支撑行业产教融合共同体走深走实',
            speaker: {
              name: '潘海生',
              title: '天津大学教育学院教授\n国家职业教育产教融合智库主任'
            },
            location: '主会场'
          },
          {
            id: 122,
            time_start: '10:30',
            time_end: '10:45',
            type: 'break',
            title: '茶歇'
          }
        ]
      }
    ]
  }
]
```

---

### 📝 使用流程

1. 复制提示词到 Lovable AI
2. 获取生成的代码
3. 将代码给我，我来适配到项目中

---

## 更新日志

### 2025年12月10日
- ✅ 创建 Lovable 提示词库文档
- ✅ 完成活动议程页面提示词
- ✅ 添加完整的数据结构示例
- ✅ 添加设计要点对照表
- ✅ 添加使用流程和注意事项

---

## 待补充页面

- [ ] 活动详情页面
- [ ] 活动列表页面
- [ ] 报名表单页面
- [ ] 我的页面
- [ ] AI 助手页面

---

**文档维护**: 每次新增或优化页面设计时，及时更新对应的 Lovable 提示词。

