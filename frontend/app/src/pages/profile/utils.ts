/**
 * Profile 页面工具函数
 * 创建时间: 2025年12月9日
 */

/**
 * 格式化日期
 * @param dateStr 日期字符串
 * @returns 格式化后的日期 YYYY-MM-DD
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

