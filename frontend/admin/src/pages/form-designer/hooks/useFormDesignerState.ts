import { useEffect, useMemo, useState } from 'react'
import { message } from 'antd'
import type { DropResult } from '@hello-pangea/dnd'
import type { URLSearchParamsInit } from 'react-router-dom'
import { getActivity, listActivities, updateActivity } from '../../../services/activities'
import { parseActivityDetailToFormState } from '../../activity-create/transform'
import { createDefaultSignupFlow, createEmptySignupStep, type SignupFlowConfig, type SignupStepDefinition } from '../../activity-create/types'
import { FIELD_TYPE_OPTIONS } from '../constants'
import type { FieldItem, FieldOption, PaletteItem } from '../types'
import {
  createBindOptions,
  createFieldFromPalette,
  getEnabledSteps,
  getFieldStepKey,
  getPreviewFields,
  getFieldTypeSelectValue,
} from '../utils'
import {
  applyDesignerDragResult,
  buildDesignerUpdatePayload,
  filterFieldsByRemovedStep,
  getInitialActivityId,
  mapApiFieldsToDesignerFields,
  normalizeActivities,
  patchStepCollection,
  removeStepFromCollection,
  resolveActiveStepKey,
} from '../state-helpers'
import {
  appendFieldOption,
  duplicateFieldAtIndex,
  patchFieldAtIndex,
  patchFieldOptionAtIndex,
  removeFieldAtIndex,
  removeFieldOptionAtIndex,
} from '../field-operations'

export function useFormDesignerState(
  searchParams: URLSearchParams,
  setSearchParams: (nextInit: URLSearchParamsInit) => void,
) {
  const [activities, setActivities] = useState<Array<{ id: number; title: string }>>([])
  const [selectedActivityId, setSelectedActivityId] = useState<number | undefined>(undefined)
  const [activityTitle, setActivityTitle] = useState('')
  const [activityExtra, setActivityExtra] = useState<Record<string, any>>({})
  const [fields, setFields] = useState<FieldItem[]>([])
  const [signupFlow, setSignupFlow] = useState<SignupFlowConfig>(createDefaultSignupFlow())
  const [activeStepKey, setActiveStepKey] = useState('personal')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const bootstrap = async () => {
      const list = await listActivities({ limit: 200 })
      const normalized = normalizeActivities(list)
      setActivities(normalized)
      const initialId = getInitialActivityId(searchParams, normalized)
      if (initialId) setSelectedActivityId(initialId)
    }
    bootstrap().catch(() => message.error('活动列表加载失败'))
  }, [])

  useEffect(() => {
    if (!selectedActivityId) return
    const load = async () => {
      setLoading(true)
      try {
        const detail = await getActivity(selectedActivityId)
        const parsed = parseActivityDetailToFormState(detail)
        const serverFields = mapApiFieldsToDesignerFields(detail?.form_fields || [])
        setActivityTitle(detail?.title || '')
        setActivityExtra((detail?.extra || {}) as Record<string, any>)
        setFields(serverFields)
        setSignupFlow(parsed.extra.signup_flow)
        setActiveStepKey((current) => resolveActiveStepKey(parsed.extra.signup_flow, current))
      } catch {
        message.error('活动配置加载失败')
      } finally {
        setLoading(false)
      }
    }
    load()
    setSearchParams({ activityId: String(selectedActivityId) })
  }, [selectedActivityId])

  const enabledSteps = useMemo(() => getEnabledSteps(signupFlow), [signupFlow])
  const sortedSteps = useMemo(() => [...signupFlow.steps].sort((left, right) => left.order - right.order), [signupFlow])
  const activeStep = useMemo(
    () => sortedSteps.find((step) => step.key === activeStepKey) || enabledSteps[0] || sortedSteps[0],
    [sortedSteps, enabledSteps, activeStepKey],
  )
  const currentStepKey = activeStep?.key || ''
  const currentStepFields = useMemo(
    () => fields.map((field, index) => ({ field, index })).filter(({ field }) => getFieldStepKey(field) === currentStepKey),
    [fields, currentStepKey],
  )
  const previewFields = useMemo(() => getPreviewFields(fields, currentStepKey), [fields, currentStepKey])

  useEffect(() => {
    if (!currentStepKey && enabledSteps[0]?.key) setActiveStepKey(enabledSteps[0].key)
  }, [currentStepKey, enabledSteps])

  const bindOptions = useMemo(() => createBindOptions(currentStepKey, currentStepFields), [currentStepKey, currentStepFields])

  const updateStep = (stepKey: string, patch: Partial<SignupStepDefinition>) => {
    setSignupFlow((prev) => {
      const next = patchStepCollection(prev.steps, stepKey, patch)
      const nextEnabled = getEnabledSteps(next)
      if (!nextEnabled.some((step) => step.key === activeStepKey)) {
        setActiveStepKey(nextEnabled[0]?.key || next.steps[0]?.key || '')
      }
      return next
    })
  }

  const addCustomStep = () => {
    setSignupFlow((prev) => {
      const nextStep = createEmptySignupStep(prev.steps.map((step) => step.key))
      setActiveStepKey(nextStep.key)
      return { steps: [...prev.steps, { ...nextStep, order: prev.steps.length }] }
    })
  }

  const removeStep = (stepKey: string) => {
    setSignupFlow((prev) => removeStepFromCollection(prev.steps, stepKey))
    setFields((prev) => filterFieldsByRemovedStep(prev, stepKey))
  }

  const addField = (paletteItem: PaletteItem) => {
    if (!currentStepKey) {
      message.warning('请先启用并选中一个报名步骤')
      return
    }
    setFields((prev) => [...prev, createFieldFromPalette(currentStepKey, paletteItem)])
  }

  const updateField = (targetIndex: number, patch: Partial<FieldItem>) => {
    setFields((prev) => patchFieldAtIndex(prev, targetIndex, patch))
  }

  const duplicateField = (targetIndex: number) => {
    setFields((prev) => duplicateFieldAtIndex(prev, targetIndex, currentStepKey))
  }

  const deleteField = (targetIndex: number) => setFields((prev) => removeFieldAtIndex(prev, targetIndex))

  const updateFieldOption = (fieldIndex: number, optionIndex: number, patch: Partial<FieldOption>) => {
    setFields((prev) => patchFieldOptionAtIndex(prev, fieldIndex, optionIndex, patch))
  }

  const addFieldOption = (fieldIndex: number) => {
    setFields((prev) => appendFieldOption(prev, fieldIndex))
  }

  const removeFieldOption = (fieldIndex: number, optionIndex: number) => {
    setFields((prev) => removeFieldOptionAtIndex(prev, fieldIndex, optionIndex))
  }

  const saveDesigner = async () => {
    if (!selectedActivityId) {
      message.warning('请先选择一个活动')
      return
    }
    setSaving(true)
    try {
      const payload = buildDesignerUpdatePayload(fields, currentStepKey, activityExtra, signupFlow)
      const updated = await updateActivity(selectedActivityId, payload)
      const serverFields = mapApiFieldsToDesignerFields(updated?.form_fields || [])
      const parsed = parseActivityDetailToFormState(updated)
      setFields(serverFields)
      setActivityExtra((updated?.extra || {}) as Record<string, any>)
      setSignupFlow(parsed.extra.signup_flow)
      message.success('报名流程已保存')
    } catch {
      message.error('保存失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  const handleDragEnd = (result: DropResult) => {
    setSignupFlow((prevFlow) => {
      let nextFlow = prevFlow
      setFields((prevFields) => {
        const next = applyDesignerDragResult(result, currentStepKey, prevFields, prevFlow)
        nextFlow = next.signupFlow
        return next.fields
      })
      return nextFlow
    })
  }

  return {
    activities,
    selectedActivityId,
    setSelectedActivityId,
    activityTitle,
    fields,
    signupFlow,
    setSignupFlow,
    activeStep,
    currentStepKey,
    currentStepFields,
    previewFields,
    sortedSteps,
    bindOptions,
    saving,
    loading,
    enabledSteps,
    rightPreviewButton: currentStepKey === enabledSteps[enabledSteps.length - 1]?.key ? '提交报名' : '下一步',
    updateStep,
    addCustomStep,
    removeStep,
    addField,
    updateField,
    duplicateField,
    deleteField,
    updateFieldOption,
    addFieldOption,
    removeFieldOption,
    saveDesigner,
    handleDragEnd,
    setActiveStepKey,
    fieldTypeOptions: FIELD_TYPE_OPTIONS,
    getFieldTypeSelectValue,
  }
}
