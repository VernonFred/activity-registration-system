import type { FieldItem, FieldOption } from './types'
import { cloneField, patchOptionList } from './utils'

export function patchFieldAtIndex(fields: FieldItem[], targetIndex: number, patch: Partial<FieldItem>) {
  return fields.map((field, index) => {
    if (index !== targetIndex) return field
    const next = { ...field, ...patch }
    if (patch.config) {
      next.config = {
        ...field.config,
        ...patch.config,
        upload: { ...field.config?.upload, ...patch.config.upload },
      }
    }
    return next
  })
}

export function duplicateFieldAtIndex(fields: FieldItem[], targetIndex: number, currentStepKey: string) {
  const source = fields[targetIndex]
  if (!source) return fields
  const next = cloneField(source, currentStepKey)
  const clone = [...fields]
  clone.splice(targetIndex + 1, 0, next)
  return clone
}

export function removeFieldAtIndex(fields: FieldItem[], targetIndex: number) {
  return fields.filter((_, index) => index !== targetIndex)
}

export function patchFieldOptionAtIndex(
  fields: FieldItem[],
  fieldIndex: number,
  optionIndex: number,
  patch: Partial<FieldOption>,
) {
  return fields.map((field, index) =>
    index === fieldIndex ? { ...field, options: patchOptionList(field.options, optionIndex, patch) } : field,
  )
}

export function appendFieldOption(fields: FieldItem[], fieldIndex: number) {
  return fields.map((field, index) => {
    if (index !== fieldIndex) return field
    const nextIndex = (field.options?.length || 0) + 1
    return { ...field, options: [...(field.options || []), { label: `选项 ${nextIndex}`, value: `option_${nextIndex}` }] }
  })
}

export function removeFieldOptionAtIndex(fields: FieldItem[], fieldIndex: number, optionIndex: number) {
  return fields.map((field, index) =>
    index === fieldIndex
      ? { ...field, options: (field.options || []).filter((_, currentIndex) => currentIndex !== optionIndex) }
      : field,
  )
}
