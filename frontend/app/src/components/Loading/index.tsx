import { View } from '@tarojs/components'
import { CSSProperties } from 'react'
import './index.scss'

export interface LoadingProps {
  /**
   * 自定义类名
   */
  className?: string
  
  /**
   * 自定义样式
   */
  style?: CSSProperties
}

/**
 * 卡片骨架屏组件
 */
export const CardSkeleton = ({ 
  className = '', 
  style = {} 
}: LoadingProps) => {
  return (
    <View className={`skeleton-card ${className}`} style={style}>
      <View className="skeleton-card__image" />
      <View className="skeleton-card__body">
        <View className="skeleton-card__title" />
        <View className="skeleton-card__line" />
        <View className="skeleton-card__line skeleton-card__line--short" />
      </View>
    </View>
  )
}

/**
 * 列表骨架屏组件
 */
export interface ListSkeletonProps extends LoadingProps {
  /**
   * 骨架屏数量
   */
  count?: number
}

export const ListSkeleton = ({ 
  count = 3, 
  className = '', 
  style = {} 
}: ListSkeletonProps) => {
  return (
    <View className={`skeleton-list ${className}`} style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </View>
  )
}

/**
 * 通用骨架屏块
 */
export interface SkeletonBlockProps extends LoadingProps {
  /**
   * 宽度
   */
  width?: string
  
  /**
   * 高度
   */
  height?: string
  
  /**
   * 圆角
   */
  radius?: string
}

export const SkeletonBlock = ({ 
  width = '100%', 
  height = '40rpx',
  radius = '8rpx',
  className = '', 
  style = {} 
}: SkeletonBlockProps) => {
  return (
    <View 
      className={`skeleton-block ${className}`} 
      style={{ 
        width, 
        height, 
        borderRadius: radius,
        ...style 
      }} 
    />
  )
}

export default CardSkeleton

