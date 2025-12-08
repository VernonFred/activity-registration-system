import { View, Input as TaroInput, Text, Image } from '@tarojs/components'
import { useState, CSSProperties } from 'react'
import './index.scss'

// 搜索图标 - Lucide Icons PNG
import iconSearch from '../../assets/icons/search.png'

export interface InputProps {
  /**
   * 输入框类型
   */
  type?: 'text' | 'number' | 'idcard' | 'digit'
  
  /**
   * 输入框值
   */
  value: string
  
  /**
   * 占位符文本
   */
  placeholder?: string
  
  /**
   * 是否禁用
   */
  disabled?: boolean
  
  /**
   * 最大长度
   */
  maxlength?: number
  
  /**
   * 输入事件
   */
  onInput?: (value: string) => void
  
  /**
   * 确认事件（点击键盘完成按钮）
   */
  onConfirm?: (value: string) => void
  
  /**
   * 聚焦事件
   */
  onFocus?: () => void
  
  /**
   * 失焦事件
   */
  onBlur?: () => void
  
  /**
   * 自定义类名
   */
  className?: string
  
  /**
   * 自定义样式
   */
  style?: CSSProperties
}

export const Input = ({
  type = 'text',
  value,
  placeholder = '请输入',
  disabled = false,
  maxlength = 140,
  onInput,
  onConfirm,
  onFocus,
  onBlur,
  className = '',
  style = {}
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false)

  const handleInput = (e: any) => {
    if (onInput) {
      onInput(e.detail.value)
    }
  }

  const handleConfirm = (e: any) => {
    if (onConfirm) {
      onConfirm(e.detail.value)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (onFocus) {
      onFocus()
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (onBlur) {
      onBlur()
    }
  }

  const classNames = [
    'custom-input',
    isFocused && 'custom-input--focused',
    disabled && 'custom-input--disabled',
    className
  ].filter(Boolean).join(' ')

  return (
    <View className={classNames} style={style}>
      <TaroInput
        className="custom-input__field"
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        maxlength={maxlength}
        onInput={handleInput}
        onConfirm={handleConfirm}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholderClass="custom-input__placeholder"
      />
    </View>
  )
}

/**
 * 搜索输入框组件
 */
export interface SearchInputProps extends Omit<InputProps, 'type'> {
  /**
   * 是否显示清除按钮
   */
  clearable?: boolean
  
  /**
   * 清除事件
   */
  onClear?: () => void
}

export const SearchInput = ({
  value,
  placeholder = '搜索活动...',
  clearable = true,
  onClear,
  onInput,
  onConfirm,
  className = '',
  ...restProps
}: SearchInputProps) => {
  const handleClear = () => {
    if (onClear) {
      onClear()
    }
    if (onInput) {
      onInput('')
    }
  }

  return (
    <View className={`custom-search-input ${className}`}>
      <Image src={iconSearch} className="custom-search-input__icon" mode="aspectFit" />
      <Input
        {...restProps}
        value={value}
        placeholder={placeholder}
        onInput={onInput}
        onConfirm={onConfirm}
        className="custom-search-input__input"
      />
      {clearable && value && (
        <Text 
          className="custom-search-input__clear"
          onClick={handleClear}
        >
          ✕
        </Text>
      )}
    </View>
  )
}

export default Input
