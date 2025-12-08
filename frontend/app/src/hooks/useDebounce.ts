/**
 * 防抖 Hook
 * 用于搜索输入等需要延迟执行的场景
 */
import { useState, useEffect } from 'react'

/**
 * 使用防抖
 * @param value 要防抖的值
 * @param delay 延迟时间（毫秒），默认300ms
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // 设置定时器
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // 清理函数：在value变化或组件卸载时清除定时器
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

