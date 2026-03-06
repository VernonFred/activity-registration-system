import type { URLSearchParamsInit } from 'react-router-dom'
import type { DropResult } from '@hello-pangea/dnd'
import type { SignupFlowConfig, SignupStepDefinition } from '../activity-create/types'
import type { FieldItem, PaletteItem } from './types'
import { createFieldFromPalette, getEnabledSteps, getFieldStepKey, insertFieldIntoStep, moveFieldSubset, reorder, sanitizeField, slugify } from './utils'
import { PALETTE } from './constants'

export function normalizeActivities(list: any): Array<{ id: number; title: string }> {
  const rows = Array.isArray(list?.items) ? list.items : Array.isArray(list) ? list : []
  return rows.map((item: any) => ({ id: item.id, title: item.title || `活动 ${item.id}` }))
}

export function getInitialActivityId(
  searchParams: URLSearchParams,
  activities: Array<{ id: number; title: string }>,
) {
  const routeActivityId = Number(searchParams.get('activityId') || searchParams.get('activity_id') || 0) || undefined
  return routeActivityId || activities[0]?.id
}

export function mapApiFieldsToDesignerFields(apiFields: any[] = []): FieldItem[] {
  return apiFields.map((field: any) => sanitizeField({
    id: field.id,
    name: field.name,
    label: field.label,
    field_type: field.field_type,
    required: field.required,
    placeholder: field.placeholder,
    helper_text: field.helper_text,
    visible: field.visible,
    options: field.options,
    config: field.config,
  }))
}

export function resolveActiveStepKey(
  signupFlow: SignupFlowConfig,
  currentStepKey: string,
) {
  const enabledSteps = getEnabledSteps(signupFlow)
  if (enabledSteps.some((step) => step.key === currentStepKey)) return currentStepKey
  return enabledSteps[0]?.key || signupFlow.steps[0]?.key || ''
}

export function patchStepCollection(
  steps: SignupStepDefinition[],
  stepKey: string,
  patch: Partial<SignupStepDefinition>,
) {
  const nextSteps = steps.map((step) => step.key === stepKey ? { ...step, ...patch } : step)
  return { steps: nextSteps.map((step, index) => ({ ...step, order: index })) }
}

export function removeStepFromCollection(steps: SignupStepDefinition[], stepKey: string) {
  return { steps: steps.filter((step) => step.key !== stepKey).map((step, index) => ({ ...step, order: index })) }
}

export function filterFieldsByRemovedStep(fields: FieldItem[], stepKey: string) {
  return fields.filter((field) => getFieldStepKey(field) !== stepKey)
}

export function buildDesignerUpdatePayload(
  fields: FieldItem[],
  currentStepKey: string,
  activityExtra: Record<string, any>,
  signupFlow: SignupFlowConfig,
) {
  const sanitizedFields = fields.map((field, index) => ({
    name: field.name || `field_${index + 1}`,
    label: field.label || `字段 ${index + 1}`,
    field_type: field.field_type,
    required: !!field.required,
    placeholder: field.placeholder || undefined,
    helper_text: field.helper_text || undefined,
    visible: field.visible ?? true,
    options: field.options?.length ? field.options : undefined,
    config: {
      step: field.config?.step || currentStepKey || 'personal',
      bind: field.config?.bind || `${field.config?.step || currentStepKey || 'personal'}.${slugify(field.name || field.label || `field_${index + 1}`)}`,
      widget: field.config?.widget || 'input',
      upload: field.config?.widget === 'image_upload'
        ? { max_count: field.config?.upload?.max_count || 1, required: !!field.config?.upload?.required }
        : undefined,
    },
  }))

  const { signup_config: _legacyConfig, ...restExtra } = activityExtra || {}
  return {
    form_fields: sanitizedFields,
    extra: { ...restExtra, signup_flow: signupFlow },
  }
}

export function applyDesignerDragResult(
  result: DropResult,
  currentStepKey: string,
  fields: FieldItem[],
  signupFlow: SignupFlowConfig,
) {
  const { source, destination } = result
  if (!destination) return { fields, signupFlow }

  if (source.droppableId === 'steps-list' && destination.droppableId === 'steps-list') {
    return {
      fields,
      signupFlow: {
        steps: reorder([...signupFlow.steps].sort((a, b) => a.order - b.order), source.index, destination.index)
          .map((step, index) => ({ ...step, order: index })),
      },
    }
  }

  if (source.droppableId === 'canvas-fields' && destination.droppableId === 'canvas-fields' && currentStepKey) {
    return {
      fields: moveFieldSubset(fields, currentStepKey, source.index, destination.index),
      signupFlow,
    }
  }

  if (source.droppableId === 'palette-fields' && destination.droppableId === 'canvas-fields' && currentStepKey) {
    const paletteItem: PaletteItem | undefined = PALETTE[source.index]
    if (!paletteItem) return { fields, signupFlow }
    return {
      fields: insertFieldIntoStep(fields, currentStepKey, createFieldFromPalette(currentStepKey, paletteItem), destination.index),
      signupFlow,
    }
  }

  return { fields, signupFlow }
}
