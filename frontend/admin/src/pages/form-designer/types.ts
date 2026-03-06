export type FieldType = 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'datetime' | 'number' | 'switch'
export type FieldWidget = 'input' | 'textarea' | 'select' | 'radio' | 'checkboxes' | 'dateTime' | 'switch' | 'image_upload'

export type DesignerPreviewField = {
  id: string
  label: string
  widget: FieldWidget
  required: boolean
  placeholder?: string
  options?: Array<{ label: string; value: string }>
}

export interface FieldOption {
  label: string
  value: string
}

export interface FieldConfig {
  step: string
  bind: string
  widget?: FieldWidget
  upload?: {
    max_count?: number
    required?: boolean
  }
}

export interface FieldItem {
  id?: number
  name: string
  label: string
  field_type: FieldType
  required?: boolean
  placeholder?: string
  helper_text?: string
  visible?: boolean
  options?: FieldOption[]
  config?: FieldConfig
}

export interface PaletteItem {
  type: FieldType
  label: string
  exampleName: string
  widget: FieldWidget
}
