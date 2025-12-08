import { View } from '@tarojs/components'
import { ReactNode, CSSProperties } from 'react'
import './index.scss'

export interface CardProps {
  /**
   * 卡片内容
   */
  children: ReactNode
  
  /**
   * 点击事件
   */
  onClick?: () => void
  
  /**
   * 自定义类名
   */
  className?: string
  
  /**
   * 自定义样式
   */
  style?: CSSProperties
  
  /**
   * 是否显示阴影
   */
  shadow?: boolean
  
  /**
   * 圆角大小
   * - normal: 32rpx
   * - large: 48rpx
   */
  radius?: 'normal' | 'large'
}

export const Card = ({
  children,
  onClick,
  className = '',
  style = {},
  shadow = true,
  radius = 'normal'
}: CardProps) => {
  const classNames = [
    'custom-card',
    shadow && 'custom-card--shadow',
    `custom-card--radius-${radius}`,
    onClick && 'custom-card--clickable',
    className
  ].filter(Boolean).join(' ')

  return (
    <View 
      className={classNames} 
      onClick={onClick}
      style={style}
    >
      {children}
    </View>
  )
}

export default Card

