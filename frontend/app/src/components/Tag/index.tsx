import { View, Text } from '@tarojs/components'
import { ReactNode, CSSProperties } from 'react'
import './index.scss'

export interface TagProps {
  /**
   * 标签类型（对应活动状态）
   * - ongoing: 进行中（蓝色）
   * - signup: 报名中（绿色）
   * - upcoming: 即将开始（黄色）
   * - finished: 已结束（灰色）
   * - free: 免费（绿色）
   * - paid: 需付费（橙色）
   */
  type?: 'ongoing' | 'signup' | 'upcoming' | 'finished' | 'free' | 'paid' | 'custom'
  
  /**
   * 标签内容
   */
  children: ReactNode
  
  /**
   * 自定义背景色（当 type 为 custom 时生效）
   */
  bgColor?: string
  
  /**
   * 自定义文字颜色（当 type 为 custom 时生效）
   */
  textColor?: string
  
  /**
   * 自定义类名
   */
  className?: string
  
  /**
   * 自定义样式
   */
  style?: CSSProperties
  
  /**
   * 点击事件
   */
  onClick?: () => void
}

export const Tag = ({
  type = 'custom',
  children,
  bgColor,
  textColor,
  className = '',
  style = {},
  onClick
}: TagProps) => {
  const classNames = [
    'custom-tag',
    type !== 'custom' && `custom-tag--${type}`,
    className
  ].filter(Boolean).join(' ')

  const customStyle = type === 'custom' ? {
    backgroundColor: bgColor,
    color: textColor,
    ...style
  } : style

  return (
    <View 
      className={classNames} 
      style={customStyle}
      onClick={onClick}
    >
      <Text className="custom-tag__text">{children}</Text>
    </View>
  )
}

export default Tag

