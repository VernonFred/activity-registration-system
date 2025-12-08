import { View, Text, Image } from '@tarojs/components'
import { CSSProperties } from 'react'
import './index.scss'

// 空状态图标
import iconInbox from '../../assets/icons/inbox.png'

export interface EmptyProps {
  /**
   * 主标题
   */
  title?: string
  
  /**
   * 副标题（辅助说明）
   */
  desc?: string
  
  /**
   * 自定义类名
   */
  className?: string
  
  /**
   * 自定义样式
   */
  style?: CSSProperties
}

export const Empty = ({
  title = '暂无数据',
  desc = '',
  className = '',
  style = {}
}: EmptyProps) => {
  return (
    <View className={`custom-empty ${className}`} style={style}>
      <Image src={iconInbox} className="custom-empty__icon" mode="aspectFit" />
      {title && <Text className="custom-empty__title">{title}</Text>}
      {desc && <Text className="custom-empty__desc">{desc}</Text>}
    </View>
  )
}

export default Empty
