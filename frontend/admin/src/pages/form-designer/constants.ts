import type { PaletteItem } from './types'

export const BUILTIN_STEP_META: Record<string, { title: string; description: string; accent: string; soft: string }> = {
  personal: {
    title: '个人信息',
    description: '报名入口第一步，负责姓名、学校、部门等基础资料。',
    accent: '#1b8f72',
    soft: 'rgba(27, 143, 114, 0.08)',
  },
  payment: {
    title: '缴费信息',
    description: '配置缴费凭证、开票信息、支付截图等字段。',
    accent: '#f59e0b',
    soft: 'rgba(245, 158, 11, 0.08)',
  },
  accommodation: {
    title: '住宿信息',
    description: '配置酒店、房型、入住意向与住宿补充说明。',
    accent: '#8b5cf6',
    soft: 'rgba(139, 92, 246, 0.08)',
  },
  transport: {
    title: '交通信息',
    description: '配置到达、返程、车次/航班等交通字段。',
    accent: '#ef4444',
    soft: 'rgba(239, 68, 68, 0.08)',
  },
}

export const FIELD_TYPE_OPTIONS: Array<{ value: PaletteItem['widget']; label: string; fieldType: PaletteItem['type'] }> = [
  { value: 'input', label: '单行文本', fieldType: 'text' },
  { value: 'textarea', label: '多行文本', fieldType: 'textarea' },
  { value: 'input', label: '数字', fieldType: 'number' },
  { value: 'select', label: '下拉选择', fieldType: 'select' },
  { value: 'radio', label: '单选', fieldType: 'radio' },
  { value: 'checkboxes', label: '复选', fieldType: 'checkbox' },
  { value: 'dateTime', label: '日期时间', fieldType: 'datetime' },
  { value: 'switch', label: '开关', fieldType: 'switch' },
  { value: 'image_upload', label: '图片上传', fieldType: 'text' },
]

export const PALETTE: PaletteItem[] = FIELD_TYPE_OPTIONS
  .filter((item) => item.fieldType !== 'number')
  .map((item) => ({
    type: item.fieldType,
    label: item.label,
    exampleName: item.value,
    widget: item.value,
  }))
