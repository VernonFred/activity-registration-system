/**
 * 组件库统一导出文件
 * 严格遵循设计规范 V4.0
 */

// 按钮组件
export { Button } from './Button'
export type { ButtonProps } from './Button'

// 卡片组件
export { Card } from './Card'
export type { CardProps } from './Card'

// 输入框组件
export { Input, SearchInput } from './Input'
export type { InputProps, SearchInputProps } from './Input'

// 标签组件
export { Tag } from './Tag'
export type { TagProps } from './Tag'

// 空状态组件
export { Empty } from './Empty'
export type { EmptyProps } from './Empty'

// 加载组件（骨架屏）
export { CardSkeleton, ListSkeleton, SkeletonBlock } from './Loading'
export type { LoadingProps, ListSkeletonProps, SkeletonBlockProps } from './Loading'

// 弹窗组件（已有）
export { ComingSoonModal, ActivityPromotionModal } from './Modal'

// 自定义导航栏（已有）
export { default as CustomTabBar } from './CustomTabBar'

// Tab 栏组件（已有）
export { default as TabBar } from './TabBar'

