import { FIELD_TYPE_OPTIONS } from './constants'
import type { DesignerPreviewField, FieldItem, FieldOption, FieldType, FieldWidget, PaletteItem } from './types'
import type { SignupFlowConfig } from '../activity-create/types'

export function getFieldTypeLabel(widget: FieldWidget, fieldType?: FieldType) {
  if (widget === 'input' && fieldType === 'number') return '数字'
  return FIELD_TYPE_OPTIONS.find((item) => item.value === widget && item.fieldType === (fieldType || item.fieldType))?.label
    || FIELD_TYPE_OPTIONS.find((item) => item.value === widget)?.label
    || '单行文本'
}

export function getFieldTypeSelectValue(widget: FieldWidget, fieldType?: FieldType) {
  return `${widget}:${fieldType || 'text'}`
}

export function slugify(input: string) {
  return input.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
}

export function createFieldId(stepKey: string, paletteItem: PaletteItem) {
  const suffix = Math.random().toString(36).slice(2, 7)
  return `${stepKey}_${paletteItem.exampleName}_${suffix}`
}

export function getEnabledSteps(flow: SignupFlowConfig) {
  return [...flow.steps].filter((step) => step.enabled).sort((left, right) => left.order - right.order)
}

export function getFieldStepKey(field: FieldItem) {
  return field.config?.step || 'personal'
}

export function getPreviewFields(fields: FieldItem[], activeStep: string): DesignerPreviewField[] {
  return fields
    .filter((field) => getFieldStepKey(field) === activeStep && (field.visible ?? true))
    .map((field) => ({
      id: field.name,
      label: field.label,
      widget: field.config?.widget || 'input',
      required: !!field.required,
      placeholder: field.placeholder,
      options: field.options,
    }))
}

export function sanitizeField(input: Partial<FieldItem>, fallbackStep = 'personal'): FieldItem {
  const widget = (input.config?.widget || (
    input.field_type === 'textarea' ? 'textarea'
      : input.field_type === 'select' ? 'select'
      : input.field_type === 'radio' ? 'radio'
      : input.field_type === 'checkbox' ? 'checkboxes'
      : input.field_type === 'datetime' ? 'dateTime'
      : input.field_type === 'switch' ? 'switch'
      : 'input'
  )) as FieldWidget
  const step = input.config?.step || fallbackStep
  const fallbackName = typeof input.name === 'string' && input.name ? input.name : `field_${Date.now()}`
  return {
    id: input.id,
    name: fallbackName,
    label: input.label || '未命名字段',
    field_type: input.field_type || 'text',
    required: input.required ?? false,
    placeholder: input.placeholder || '',
    helper_text: input.helper_text || '',
    visible: input.visible ?? true,
    options: Array.isArray(input.options)
      ? input.options.map((option, index) => ({
          label: option.label || `选项 ${index + 1}`,
          value: option.value || `option_${index + 1}`,
        }))
      : [],
    config: {
      step,
      bind: input.config?.bind || `${step}.${slugify(fallbackName) || fallbackName}`,
      widget,
      upload: {
        max_count: input.config?.upload?.max_count ?? 1,
        required: input.config?.upload?.required ?? false,
      },
    },
  }
}

export function reorder<T>(items: T[], startIndex: number, endIndex: number) {
  const next = [...items]
  const [removed] = next.splice(startIndex, 1)
  next.splice(endIndex, 0, removed)
  return next
}

export function moveFieldSubset(fields: FieldItem[], stepKey: string, startIndex: number, endIndex: number) {
  const indexes = fields.map((field, index) => ({ field, index })).filter(({ field }) => getFieldStepKey(field) === stepKey)
  const reorderedSubset = reorder(indexes, startIndex, endIndex)
  const next = [...fields]
  reorderedSubset.forEach((entry, subsetIndex) => {
    next[indexes[subsetIndex].index] = entry.field
  })
  return next
}

export function createFieldFromPalette(stepKey: string, paletteItem: PaletteItem): FieldItem {
  const id = createFieldId(stepKey, paletteItem)
  const baseBindKey = paletteItem.widget === 'image_upload' ? 'attachment' : slugify(paletteItem.label) || paletteItem.exampleName
  return {
    name: id,
    label: paletteItem.label,
    field_type: paletteItem.type,
    required: stepKey === 'personal',
    placeholder:
      paletteItem.widget === 'image_upload'
        ? ''
        : paletteItem.widget === 'dateTime'
          ? '请选择日期和时间'
          : `请输入${paletteItem.label}`,
    helper_text: '',
    visible: true,
    options:
      paletteItem.widget === 'select' || paletteItem.widget === 'radio' || paletteItem.widget === 'checkboxes'
        ? [{ label: '选项 1', value: 'option_1' }, { label: '选项 2', value: 'option_2' }]
        : [],
    config: {
      step: stepKey,
      bind: `${stepKey}.${baseBindKey}`,
      widget: paletteItem.widget,
      upload: { max_count: 1, required: false },
    },
  }
}

export function insertFieldIntoStep(fields: FieldItem[], stepKey: string, newField: FieldItem, insertIndex: number) {
  const stepIndexes = fields.map((field, index) => ({ field, index })).filter(({ field }) => getFieldStepKey(field) === stepKey)
  const next = [...fields]
  if (!stepIndexes.length || insertIndex >= stepIndexes.length) {
    next.push(newField)
    return next
  }
  const targetIndex = stepIndexes[Math.max(insertIndex, 0)].index
  next.splice(targetIndex, 0, newField)
  return next
}

export function getFieldValueKey(field: FieldItem) {
  const bind = field.config?.bind || field.name
  const segments = bind.split('.')
  return segments[segments.length - 1] || field.name
}

export function createBindOptions(currentStepKey: string, currentStepFields: Array<{ field: FieldItem }>) {
  const base = [`${currentStepKey}.name`, `${currentStepKey}.title`, `${currentStepKey}.email`, `${currentStepKey}.phone`, `${currentStepKey}.attachment`]
  const existing = currentStepFields.map(({ field }) => field.config?.bind).filter(Boolean) as string[]
  return Array.from(new Set([...base, ...existing]))
}

export function cloneField(source: FieldItem, currentStepKey: string) {
  const copyName = `${source.name}_copy_${Math.random().toString(36).slice(2, 6)}`
  return sanitizeField({
    ...source,
    id: undefined,
    name: copyName,
    label: `${source.label}（副本）`,
    config: {
      ...source.config,
      step: source.config?.step || currentStepKey,
      bind: `${source.config?.step || currentStepKey}.${slugify(copyName)}`,
    },
  }, source.config?.step || currentStepKey)
}

export function patchOptionList(options: FieldOption[] | undefined, optionIndex: number, patch: Partial<FieldOption>) {
  const next = [...(options || [])]
  next[optionIndex] = { ...next[optionIndex], ...patch }
  return next
}
