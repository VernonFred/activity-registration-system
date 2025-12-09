/**
 * Signup 页面类型定义
 * 创建时间: 2025年12月9日
 */

// 表单字段选项
export interface FormFieldOption {
  id: number
  label: string
  value: string
  is_default?: boolean
}

// 表单字段
export interface FormField {
  id: number
  label: string
  field_type: string
  required: boolean
  options?: FormFieldOption[]
  name: string
  placeholder?: string
  display_order?: number
}

// 步骤定义
export interface StepConfig {
  key: string
  title: string
  keywords: string[]
}

