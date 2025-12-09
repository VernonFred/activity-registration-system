/**
 * ActivityDetail 页面工具函数
 * 创建时间: 2025年12月9日
 */

/**
 * 格式化日期
 * @param dateStr 日期字符串
 * @returns 格式化后的日期 YYYY.MM.DD
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

/**
 * 格式化时间
 * @param dateStr 日期字符串
 * @returns 格式化后的时间 HH:MM
 */
export function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * 格式化距离
 * @param km 公里数
 * @returns 格式化后的距离字符串
 */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(1)}km`
}

