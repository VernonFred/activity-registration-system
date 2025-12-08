import { View, Text } from '@tarojs/components'
import { ReactNode, CSSProperties } from 'react'
import './index.scss'

export interface ButtonProps {
  /**
   * 按钮类型
   * - primary: 主按钮（深绿色背景）
   * - secondary: 次按钮（白色背景 + 深绿色边框）
   */
  type?: 'primary' | 'secondary'
  
  /**
   * 按钮尺寸
   * - large: 标准按钮（88rpx 高度）
   * - small: 小号按钮（64rpx 高度）
   */
  size?: 'large' | 'small'
  
  /**
   * 是否禁用
   */
  disabled?: boolean
  
  /**
   * 是否块级按钮（宽度 100%）
   */
  block?: boolean
  
  /**
   * 按钮内容
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
}

export const Button = ({
  type = 'primary',
  size = 'large',
  disabled = false,
  block = false,
  children,
  onClick,
  className = '',
  style = {}
}: ButtonProps) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick()
    }
  }

  const classNames = [
    'custom-button',
    `custom-button--${type}`,
    `custom-button--${size}`,
    disabled && 'custom-button--disabled',
    block && 'custom-button--block',
    className
  ].filter(Boolean).join(' ')

  return (
    <View 
      className={classNames} 
      onClick={handleClick}
      style={style}
    >
      <Text className="custom-button__text">{children}</Text>
    </View>
  )
}

export default Button

