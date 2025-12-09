/**
 * 报名列表页 - 常量定义
 * 创建时间: 2025年12月09日 12:00
 */

import type { FilterOption } from './types'

// 城市筛选选项
export const CITY_FILTERS: FilterOption[] = [
  { label: '城市', value: '' },
  { label: '全国', value: 'all' },
  { label: '北京', value: '北京' },
  { label: '上海', value: '上海' },
  { label: '广州', value: '广州' },
  { label: '深圳', value: '深圳' },
  { label: '杭州', value: '杭州' },
  { label: '长沙', value: '长沙' },
]

// 时间筛选选项
export const TIME_FILTERS: FilterOption[] = [
  { label: '时间', value: '' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '近三个月', value: 'quarter' },
  { label: '今年', value: 'year' },
]

// 状态筛选选项
export const STATUS_FILTERS: FilterOption[] = [
  { label: '状态', value: '' },
  { label: '报名中', value: 'signup' },
  { label: '进行中', value: 'ongoing' },
  { label: '已结束', value: 'ended' },
]

// 状态标签配置
export const STATUS_TAGS = [
  { label: '已开始', value: 'started', active: true },
  { label: '已结束', value: 'ended', active: false },
  { label: '延期', value: 'postponed', active: false },
]

