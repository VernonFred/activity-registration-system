import { useEffect, useMemo, useState } from 'react'
import {
  AppstoreAddOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  CopyOutlined,
  DeleteOutlined,
  EyeOutlined,
  FormOutlined,
  InboxOutlined,
  PlusOutlined,
  ProfileOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { Button, Input, InputNumber, Popconfirm, Select, Space, Switch, Tag, message } from 'antd'
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd'
import { useSearchParams } from 'react-router-dom'
import SectionCard from '../components/SectionCard'
import { getActivity, listActivities, updateActivity } from '../services/activities'
import { parseActivityDetailToFormState } from './activity-create/transform'
import { createDefaultSignupFlow, createEmptySignupStep, type SignupFlowConfig, type SignupStepDefinition } from './activity-create/types'

type FieldType = 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'datetime' | 'number' | 'switch'
type FieldWidget = 'input' | 'textarea' | 'select' | 'radio' | 'checkboxes' | 'dateTime' | 'switch' | 'image_upload'

type DesignerPreviewField = {
  id: string
  label: string
  widget: FieldWidget
  required: boolean
  placeholder?: string
  options?: Array<{ label: string; value: string }>
}

interface FieldOption {
  label: string
  value: string
}

interface FieldConfig {
  step: string
  bind: string
  widget?: FieldWidget
  upload?: {
    max_count?: number
    required?: boolean
  }
}

interface FieldItem {
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

interface PaletteItem {
  type: FieldType
  label: string
  exampleName: string
  widget: FieldWidget
}

const BUILTIN_STEP_META: Record<string, { title: string; description: string; accent: string; soft: string }> = {
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

const FIELD_TYPE_OPTIONS: Array<{ value: FieldWidget; label: string; fieldType: FieldType }> = [
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

const PALETTE: PaletteItem[] = FIELD_TYPE_OPTIONS
  .filter((item) => item.fieldType !== 'number')
  .map((item) => ({
    type: item.fieldType,
    label: item.label,
    exampleName: item.value,
    widget: item.value,
  }))

function getFieldTypeLabel(widget: FieldWidget, fieldType?: FieldType) {
  if (widget === 'input' && fieldType === 'number') return '数字'
  return FIELD_TYPE_OPTIONS.find((item) => item.value === widget && item.fieldType === (fieldType || item.fieldType))?.label
    || FIELD_TYPE_OPTIONS.find((item) => item.value === widget)?.label
    || '单行文本'
}

function getFieldTypeSelectValue(widget: FieldWidget, fieldType?: FieldType) {
  return `${widget}:${fieldType || 'text'}`
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function createFieldId(stepKey: string, paletteItem: PaletteItem) {
  const suffix = Math.random().toString(36).slice(2, 7)
  return `${stepKey}_${paletteItem.exampleName}_${suffix}`
}

function getEnabledSteps(flow: SignupFlowConfig) {
  return [...flow.steps].filter((step) => step.enabled).sort((left, right) => left.order - right.order)
}

function getFieldStepKey(field: FieldItem) {
  return field.config?.step || 'personal'
}

function getFieldValueKey(field: FieldItem) {
  const bind = field.config?.bind || field.name
  const segments = bind.split('.')
  return segments[segments.length - 1] || field.name
}

function getPreviewFields(fields: FieldItem[], activeStep: string): DesignerPreviewField[] {
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

function sanitizeField(input: Partial<FieldItem>, fallbackStep = 'personal'): FieldItem {
  const widget = (input.config?.widget || (input.field_type === 'textarea' ? 'textarea' : input.field_type === 'select' ? 'select' : input.field_type === 'radio' ? 'radio' : input.field_type === 'checkbox' ? 'checkboxes' : input.field_type === 'datetime' ? 'dateTime' : input.field_type === 'switch' ? 'switch' : 'input')) as FieldWidget
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

function reorder<T>(items: T[], startIndex: number, endIndex: number) {
  const next = [...items]
  const [removed] = next.splice(startIndex, 1)
  next.splice(endIndex, 0, removed)
  return next
}

function moveFieldSubset(fields: FieldItem[], stepKey: string, startIndex: number, endIndex: number) {
  const indexes = fields
    .map((field, index) => ({ field, index }))
    .filter(({ field }) => getFieldStepKey(field) === stepKey)
  const reorderedSubset = reorder(indexes, startIndex, endIndex)
  const next = [...fields]
  reorderedSubset.forEach((entry, subsetIndex) => {
    next[indexes[subsetIndex].index] = entry.field
  })
  return next
}

function createFieldFromPalette(stepKey: string, paletteItem: PaletteItem): FieldItem {
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
      upload: {
        max_count: 1,
        required: false,
      },
    },
  }
}

function insertFieldIntoStep(fields: FieldItem[], stepKey: string, newField: FieldItem, insertIndex: number) {
  const stepIndexes = fields
    .map((field, index) => ({ field, index }))
    .filter(({ field }) => getFieldStepKey(field) === stepKey)

  const next = [...fields]
  if (!stepIndexes.length || insertIndex >= stepIndexes.length) {
    next.push(newField)
    return next
  }

  const targetIndex = stepIndexes[Math.max(insertIndex, 0)].index
  next.splice(targetIndex, 0, newField)
  return next
}

function renderPreviewControl(field: DesignerPreviewField) {
  const baseStyle: React.CSSProperties = {
    minHeight: 52,
    borderRadius: 16,
    border: '1px solid var(--frost-border-input)',
    background: 'var(--frost-bg-input)',
    color: 'var(--frost-text)',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    fontSize: 14,
  }

  if (field.widget === 'dateTime') {
    return <div style={{ ...baseStyle, justifyContent: 'space-between' }}><span>{field.placeholder || '请选择日期和时间'}</span><span>⌄</span></div>
  }
  if (field.widget === 'textarea') {
    return <div style={{ ...baseStyle, minHeight: 108, alignItems: 'flex-start', paddingTop: 16 }}>{field.placeholder || '多行输入'}</div>
  }
  if (field.widget === 'select' || field.widget === 'radio') {
    return <div style={{ ...baseStyle, justifyContent: 'space-between' }}><span>{field.options?.[0]?.label || '请选择'}</span><span>⌄</span></div>
  }
  if (field.widget === 'checkboxes') {
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {(field.options?.length ? field.options : [{ label: '选项', value: 'option' }]).slice(0, 3).map((option) => (
          <div key={option.value} style={{ ...baseStyle, minHeight: 40, padding: '0 12px' }}>{option.label}</div>
        ))}
      </div>
    )
  }
  if (field.widget === 'switch') {
    return <div style={{ ...baseStyle, justifyContent: 'space-between' }}><span>{field.placeholder || '开关字段'}</span><span style={{ width: 36, height: 22, borderRadius: 999, background: '#1b8f72' }} /></div>
  }
  if (field.widget === 'image_upload') {
    return <div style={{ ...baseStyle, minHeight: 88, justifyContent: 'center', borderStyle: 'dashed' }}>上传图片</div>
  }
  return <div style={baseStyle}>{field.placeholder || '请输入'}</div>
}

export default function FormDesigner() {
  const [searchParams, setSearchParams] = useSearchParams()
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
      const rows = Array.isArray(list?.items) ? list.items : Array.isArray(list) ? list : []
      const normalized = rows.map((item: any) => ({ id: item.id, title: item.title || `活动 ${item.id}` }))
      setActivities(normalized)

      const routeActivityId = Number(searchParams.get('activityId') || searchParams.get('activity_id') || 0) || undefined
      const initialId = routeActivityId || normalized[0]?.id
      if (initialId) {
        setSelectedActivityId(initialId)
      }
    }
    bootstrap().catch(() => {
      message.error('活动列表加载失败')
    })
  }, [])

  useEffect(() => {
    if (!selectedActivityId) return
    const load = async () => {
      setLoading(true)
      try {
        const detail = await getActivity(selectedActivityId)
        const parsed = parseActivityDetailToFormState(detail)
        const serverFields: FieldItem[] = (detail?.form_fields || []).map((field: any) => sanitizeField({
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
        setActivityTitle(detail?.title || '')
        setActivityExtra((detail?.extra || {}) as Record<string, any>)
        setFields(serverFields)
        setSignupFlow(parsed.extra.signup_flow)
        const enabledSteps = getEnabledSteps(parsed.extra.signup_flow)
        setActiveStepKey((current) => {
          if (enabledSteps.some((step) => step.key === current)) return current
          return enabledSteps[0]?.key || parsed.extra.signup_flow.steps[0]?.key || ''
        })
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
  const activeStep = useMemo(() => sortedSteps.find((step) => step.key === activeStepKey) || enabledSteps[0] || sortedSteps[0], [sortedSteps, enabledSteps, activeStepKey])
  const currentStepKey = activeStep?.key || ''
  const currentStepFields = useMemo(
    () => fields.map((field, index) => ({ field, index })).filter(({ field }) => getFieldStepKey(field) === currentStepKey),
    [fields, currentStepKey],
  )
  const previewFields = useMemo(() => getPreviewFields(fields, currentStepKey), [fields, currentStepKey])

  useEffect(() => {
    if (!currentStepKey && enabledSteps[0]?.key) {
      setActiveStepKey(enabledSteps[0].key)
    }
  }, [currentStepKey, enabledSteps])

  const bindOptions = useMemo(() => {
    const base = [
      `${currentStepKey}.name`,
      `${currentStepKey}.title`,
      `${currentStepKey}.email`,
      `${currentStepKey}.phone`,
      `${currentStepKey}.attachment`,
    ]
    const existing = currentStepFields.map(({ field }) => field.config?.bind).filter(Boolean) as string[]
    return Array.from(new Set([...base, ...existing]))
  }, [currentStepFields, currentStepKey])

  const updateStep = (stepKey: string, patch: Partial<SignupStepDefinition>) => {
    setSignupFlow((prev) => {
      const nextSteps = prev.steps.map((step) => step.key === stepKey ? { ...step, ...patch } : step)
      const next = { steps: nextSteps.map((step, index) => ({ ...step, order: index })) }
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
      const next = { steps: [...prev.steps, { ...nextStep, order: prev.steps.length }] }
      setActiveStepKey(nextStep.key)
      return next
    })
  }

  const removeStep = (stepKey: string) => {
    setSignupFlow((prev) => {
      const nextSteps = prev.steps.filter((step) => step.key !== stepKey).map((step, index) => ({ ...step, order: index }))
      return { steps: nextSteps }
    })
    setFields((prev) => prev.filter((field) => getFieldStepKey(field) !== stepKey))
  }

  const addField = (paletteItem: PaletteItem) => {
    if (!currentStepKey) {
      message.warning('请先启用并选中一个报名步骤')
      return
    }
    setFields((prev) => [...prev, createFieldFromPalette(currentStepKey, paletteItem)])
  }

  const updateField = (targetIndex: number, patch: Partial<FieldItem>) => {
    setFields((prev) => prev.map((field, index) => {
      if (index !== targetIndex) return field
      const next = { ...field, ...patch }
      if (patch.config) {
        next.config = {
          ...field.config,
          ...patch.config,
          upload: {
            ...field.config?.upload,
            ...patch.config.upload,
          },
        }
      }
      return next
    }))
  }

  const duplicateField = (targetIndex: number) => {
    setFields((prev) => {
      const source = prev[targetIndex]
      if (!source) return prev
      const copyName = `${source.name}_copy_${Math.random().toString(36).slice(2, 6)}`
      const next = sanitizeField({
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
      const clone = [...prev]
      clone.splice(targetIndex + 1, 0, next)
      return clone
    })
  }

  const deleteField = (targetIndex: number) => {
    setFields((prev) => prev.filter((_, index) => index !== targetIndex))
  }

  const updateFieldOption = (fieldIndex: number, optionIndex: number, patch: Partial<FieldOption>) => {
    setFields((prev) => prev.map((field, index) => {
      if (index !== fieldIndex) return field
      const options = [...(field.options || [])]
      options[optionIndex] = { ...options[optionIndex], ...patch }
      return { ...field, options }
    }))
  }

  const addFieldOption = (fieldIndex: number) => {
    setFields((prev) => prev.map((field, index) => {
      if (index !== fieldIndex) return field
      const nextIndex = (field.options?.length || 0) + 1
      return {
        ...field,
        options: [...(field.options || []), { label: `选项 ${nextIndex}`, value: `option_${nextIndex}` }],
      }
    }))
  }

  const removeFieldOption = (fieldIndex: number, optionIndex: number) => {
    setFields((prev) => prev.map((field, index) => {
      if (index !== fieldIndex) return field
      return { ...field, options: (field.options || []).filter((_, idx) => idx !== optionIndex) }
    }))
  }

  const saveDesigner = async () => {
    if (!selectedActivityId) {
      message.warning('请先选择活动')
      return
    }
    setSaving(true)
    try {
      const { signup_config: _legacyConfig, ...restExtra } = activityExtra || {}
      const payload = {
        form_fields: fields.map((field, index) => ({
          id: field.id,
          name: field.name,
          label: field.label,
          field_type: field.field_type,
          required: !!field.required,
          placeholder: field.placeholder || undefined,
          helper_text: field.helper_text || undefined,
          visible: field.visible ?? true,
          display_order: index,
          options: (field.options || []).map((option, optionIndex) => ({
            label: option.label,
            value: option.value,
            display_order: optionIndex,
          })),
          config: {
            step: field.config?.step || currentStepKey,
            bind: field.config?.bind || `${field.config?.step || currentStepKey}.${field.name}`,
            widget: field.config?.widget || 'input',
            upload: field.config?.widget === 'image_upload'
              ? {
                  max_count: field.config?.upload?.max_count || 1,
                  required: !!field.config?.upload?.required,
                }
              : undefined,
          },
        })),
        extra: {
          ...restExtra,
          signup_flow: {
            steps: sortedSteps.map((step, index) => ({
              ...step,
              title: step.title.trim() || `步骤 ${index + 1}`,
              description: step.description?.trim() || '',
              order: index,
            })),
          },
        },
      }
      const updated = await updateActivity(selectedActivityId, payload)
      const serverFields: FieldItem[] = (updated?.form_fields || []).map((field: any) => sanitizeField({
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
      const parsed = parseActivityDetailToFormState(updated)
      setFields(serverFields)
      setActivityExtra((updated?.extra || {}) as Record<string, any>)
      setSignupFlow(parsed.extra.signup_flow)
      message.success('表单设计已保存')
    } catch {
      message.error('表单设计保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    if (source.droppableId === 'steps-list' && destination.droppableId === 'steps-list') {
      setSignupFlow((prev) => ({
        steps: reorder([...prev.steps].sort((left, right) => left.order - right.order), source.index, destination.index).map((step, index) => ({ ...step, order: index })),
      }))
      return
    }

    if (source.droppableId === 'canvas-fields' && destination.droppableId === 'canvas-fields' && currentStepKey) {
      setFields((prev) => moveFieldSubset(prev, currentStepKey, source.index, destination.index))
      return
    }

    if (source.droppableId === 'palette-fields' && destination.droppableId === 'canvas-fields' && currentStepKey) {
      const paletteItem = PALETTE[source.index]
      if (!paletteItem) return
      setFields((prev) => insertFieldIntoStep(prev, currentStepKey, createFieldFromPalette(currentStepKey, paletteItem), destination.index))
    }
  }

  const rightPreviewButton = currentStepKey === enabledSteps[enabledSteps.length - 1]?.key ? '提交报名' : '下一步'
  const renderPaletteCard = (
    item: PaletteItem,
    paletteRef?: (element: HTMLElement | null) => void,
    dragProps?: Record<string, any>,
    snapshot?: { isDragging?: boolean },
  ) => (
    <div
      ref={paletteRef}
      {...dragProps}
      onClick={() => addField(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          addField(item)
        }
      }}
      style={{
        ...(dragProps?.style || {}),
        borderRadius: 22,
        border: snapshot?.isDragging ? '1px solid var(--frost-primary)' : '1px dashed rgba(148, 163, 184, 0.28)',
        background: 'var(--frost-bg-surface-raised)',
        padding: '14px 14px',
        textAlign: 'left',
        display: 'grid',
        gap: 8,
        cursor: snapshot?.isDragging ? 'grabbing' : 'grab',
        minHeight: 88,
        alignContent: 'start',
        boxShadow: snapshot?.isDragging ? '0 12px 28px rgba(15, 23, 42, 0.18)' : 'none',
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--frost-text)' }}>{item.label}</div>
      <div style={{ fontSize: 11, color: 'var(--frost-text-secondary)' }}>
        {item.widget === 'dateTime' ? '日期 + 时间选择器' : item.label}
      </div>
    </div>
  )

  return (
    <div style={{ display: 'grid', gap: 24, fontSize: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, alignItems: 'center' }}>
        <Select
          placeholder="选择活动"
          style={{ width: 320 }}
          value={selectedActivityId}
          loading={loading}
          options={activities.map((item) => ({ label: item.title, value: item.id }))}
          onChange={(value) => setSelectedActivityId(value)}
        />
        <Button type="primary" size="large" onClick={saveDesigner} loading={saving}>保存</Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '320px minmax(0, 1fr) 360px',
            gap: 24,
            alignItems: 'stretch',
          }}
        >
          <div style={{ display: 'grid', gap: 20, height: '100%' }}>
            <SectionCard style={{ padding: 22, borderRadius: 28, height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 800, color: 'var(--frost-text)' }}>
                  <ProfileOutlined style={{ color: 'var(--frost-primary)' }} />
                  报名步骤
                </div>
                <Button icon={<PlusOutlined />} onClick={addCustomStep}>新增步骤</Button>
              </div>
              <Droppable droppableId="steps-list">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} style={{ display: 'grid', gap: 14, alignContent: 'start', height: 'calc(100% - 52px)' }}>
                    {sortedSteps.map((step, index) => {
                      const accent = BUILTIN_STEP_META[step.key]?.accent || '#2563eb'
                      const soft = BUILTIN_STEP_META[step.key]?.soft || 'rgba(37, 99, 235, 0.08)'
                      const count = fields.filter((field) => getFieldStepKey(field) === step.key).length
                      const isActive = step.key === currentStepKey
                      return (
                        <Draggable draggableId={`step-${step.id}`} index={index} key={step.id}>
                          {(dragProvided) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              style={{
                                ...dragProvided.draggableProps.style,
                                borderRadius: 24,
                                border: `1px solid ${isActive ? accent : 'rgba(148, 163, 184, 0.18)'}`,
                                background: isActive ? soft : 'var(--frost-bg-surface-raised)',
                                padding: 16,
                                display: 'grid',
                                gap: 14,
                                cursor: 'pointer',
                                minHeight: 112,
                                alignContent: 'space-between',
                              }}
                              onClick={() => step.enabled && setActiveStepKey(step.key)}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ flex: 1, minWidth: 0, display: 'grid', gap: 8, alignContent: 'start' }}>
                                  <Input
                                    value={step.title}
                                    onChange={(event) => updateStep(step.key, { title: event.target.value })}
                                    onClick={(event) => event.stopPropagation()}
                                    placeholder="步骤名称"
                                    style={{ fontWeight: 700 }}
                                  />
                                </div>
                                <Tag color="processing" style={{ margin: 0, flexShrink: 0, whiteSpace: 'nowrap' }}>{count}项</Tag>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                <Space size={8}>
                                  <span style={{ fontSize: 12, color: 'var(--frost-text-secondary)' }}>启用</span>
                                  <Switch
                                    checked={step.enabled}
                                    onChange={(checked) => {
                                      updateStep(step.key, { enabled: checked })
                                      if (checked) setActiveStepKey(step.key)
                                    }}
                                    onClick={(checked, event) => event?.stopPropagation()}
                                  />
                                </Space>
                                <Space size={4}>
                                  <Button size="small" icon={<ArrowUpOutlined />} disabled={index === 0} onClick={(event) => { event.stopPropagation(); setSignupFlow((prev) => ({ steps: reorder([...prev.steps].sort((a,b)=>a.order-b.order), index, index - 1).map((item, order) => ({ ...item, order })) })) }} />
                                  <Button size="small" icon={<ArrowDownOutlined />} disabled={index === sortedSteps.length - 1} onClick={(event) => { event.stopPropagation(); setSignupFlow((prev) => ({ steps: reorder([...prev.steps].sort((a,b)=>a.order-b.order), index, index + 1).map((item, order) => ({ ...item, order })) })) }} />
                                  {!step.built_in && (
                                    <Popconfirm title="删除后会同时移除该步骤下的全部字段，确认删除？" onConfirm={(event) => { event?.stopPropagation(); removeStep(step.key) }}>
                                      <Button size="small" danger icon={<DeleteOutlined />} onClick={(event) => event.stopPropagation()} />
                                    </Popconfirm>
                                  )}
                                </Space>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      )
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </SectionCard>
          </div>

          <div style={{ display: 'grid', gap: 20, height: '100%' }}>
            <SectionCard style={{ padding: 24, borderRadius: 28, overflow: 'hidden', height: '100%', display: 'grid', gridTemplateRows: 'auto auto 1fr', gap: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 800, color: 'var(--frost-text)' }}>
                  <FormOutlined style={{ color: 'var(--frost-primary)' }} />
                  表单画布
                </div>
                <Tag color="processing" style={{ margin: 0, whiteSpace: 'nowrap' }}>当前 {currentStepFields.length} 项</Tag>
              </div>
              <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: 18, minHeight: 0 }}>
                <div style={{ display: 'grid', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 800, color: 'var(--frost-text)' }}>
                    <AppstoreAddOutlined style={{ color: 'var(--frost-primary)' }} />
                    控件库
                  </div>
                  <Droppable
                    droppableId="palette-fields"
                    direction="horizontal"
                    isDropDisabled
                    renderClone={(provided, snapshot, rubric) =>
                      renderPaletteCard(
                        PALETTE[rubric.source.index],
                        provided.innerRef,
                        { ...provided.draggableProps, ...provided.dragHandleProps },
                        snapshot,
                      )}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}
                      >
                        {PALETTE.map((item, paletteIndex) => (
                          <Draggable key={`${item.widget}-${item.label}`} draggableId={`palette-${item.widget}-${paletteIndex}`} index={paletteIndex}>
                            {(paletteProvided, paletteSnapshot) => (
                              renderPaletteCard(
                                item,
                                paletteProvided.innerRef,
                                { ...paletteProvided.draggableProps, ...paletteProvided.dragHandleProps },
                                paletteSnapshot,
                              )
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
                <div style={{ borderRadius: 28, border: '1px dashed rgba(148, 163, 184, 0.22)', background: 'var(--frost-bg-page)', padding: 20, overflow: 'hidden', minHeight: 0 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--frost-text)', marginBottom: 18 }}>{activeStep?.title || '未选择步骤'}</div>
                <Droppable droppableId="canvas-fields">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} style={{ display: 'grid', gap: 16 }}>
                      {currentStepFields.length === 0 && (
                        <div style={{ minHeight: 260, height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center', gap: 12, color: 'var(--frost-text-secondary)' }}>
                          <InboxOutlined style={{ fontSize: 28, color: 'var(--frost-primary)' }} />
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--frost-text)', marginBottom: 8 }}>{activeStep?.title || '当前步骤'}尚未配置字段</div>
                            <div>从上方控件库添加第一个字段，画布与预览会立即联动。</div>
                          </div>
                        </div>
                      )}
                      {currentStepFields.map(({ field, index }, canvasIndex) => (
                        <Draggable key={`${field.name}-${index}`} draggableId={`field-${field.name}-${index}`} index={canvasIndex}>
                          {(dragProvided) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              style={{
                                ...dragProvided.draggableProps.style,
                                borderRadius: 24,
                                border: '1px solid rgba(148, 163, 184, 0.18)',
                                background: 'var(--frost-bg-surface-raised)',
                                padding: 18,
                                display: 'grid',
                                gap: 16,
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                  <div style={{ width: 38, height: 38, borderRadius: 14, background: 'rgba(37, 99, 235, 0.08)', color: '#2563eb', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                                    <AppstoreAddOutlined />
                                  </div>
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ fontWeight: 800, color: 'var(--frost-text)' }}>{field.label}</div>
                                    <div style={{ fontSize: 12, color: 'var(--frost-text-secondary)' }}>
                                      {getFieldTypeLabel(field.config?.widget || 'input', field.field_type)}
                                    </div>
                                  </div>
                                </div>
                                <Space size={8}>
                                  <Tag color="default" style={{ margin: 0 }}>步骤：{activeStep?.title}</Tag>
                                  <Button size="small" icon={<CopyOutlined />} onClick={() => duplicateField(index)} />
                                  <Button size="small" danger icon={<DeleteOutlined />} onClick={() => deleteField(index)} />
                                </Space>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
                                <div>
                                  <div style={{ fontSize: 12, color: 'var(--frost-text-secondary)', marginBottom: 6 }}>字段标题</div>
                                  <Input value={field.label} onChange={(event) => updateField(index, { label: event.target.value })} />
                                </div>
                                <div>
                                  <div style={{ fontSize: 12, color: 'var(--frost-text-secondary)', marginBottom: 6 }}>占位文案</div>
                                  <Input value={field.placeholder} onChange={(event) => updateField(index, { placeholder: event.target.value })} disabled={field.config?.widget === 'switch' || field.config?.widget === 'image_upload'} />
                                </div>
                                <div>
                                  <div style={{ fontSize: 12, color: 'var(--frost-text-secondary)', marginBottom: 6 }}>组件类型</div>
                                  <Select
                                    className="form-designer-select"
                                    style={{ width: '100%' }}
                                    dropdownStyle={{ background: 'var(--frost-bg-surface-raised)' }}
                                    value={getFieldTypeSelectValue(field.config?.widget || 'input', field.field_type)}
                                    options={FIELD_TYPE_OPTIONS.map((item) => ({ label: item.label, value: getFieldTypeSelectValue(item.value, item.fieldType) }))}
                                    onChange={(value: string) => {
                                      const [widgetValue, fieldTypeValue] = value.split(':') as [FieldWidget, FieldType]
                                      const matched = FIELD_TYPE_OPTIONS.find((item) => item.value === widgetValue && item.fieldType === fieldTypeValue)
                                      updateField(index, {
                                        field_type: matched?.fieldType || field.field_type,
                                        placeholder:
                                          widgetValue === 'dateTime'
                                            ? '请选择日期和时间'
                                            : widgetValue === 'image_upload'
                                              ? ''
                                              : field.placeholder,
                                        config: {
                                          ...field.config,
                                          step: field.config?.step || currentStepKey,
                                          bind: field.config?.bind || `${field.config?.step || currentStepKey}.${field.name}`,
                                          widget: widgetValue,
                                          upload: widgetValue === 'image_upload'
                                            ? { max_count: field.config?.upload?.max_count || 1, required: !!field.config?.upload?.required }
                                            : undefined,
                                        },
                                      })
                                    }}
                                  />
                                </div>
                                <div>
                                  <div style={{ fontSize: 12, color: 'var(--frost-text-secondary)', marginBottom: 6 }}>绑定键</div>
                                  <Select
                                    className="form-designer-select"
                                    style={{ width: '100%' }}
                                    dropdownStyle={{ background: 'var(--frost-bg-surface-raised)' }}
                                    showSearch
                                    value={field.config?.bind}
                                    options={bindOptions.map((value) => ({ label: value, value }))}
                                    onChange={(value) => updateField(index, { config: { ...field.config, step: field.config?.step || currentStepKey, bind: value } })}
                                    dropdownRender={(menu) => (
                                      <div>
                                        {menu}
                                        <div style={{ padding: 8 }}>
                                          <Input
                                            placeholder="输入自定义绑定键，格式：step.field"
                                            onPressEnter={(event) => {
                                              const value = (event.currentTarget.value || '').trim()
                                              if (!value) return
                                              updateField(index, { config: { ...field.config, step: field.config?.step || currentStepKey, bind: value } })
                                            }}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  />
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
                                <Space size={8}>
                                  <span style={{ fontSize: 12, color: 'var(--frost-text-secondary)' }}>必填</span>
                                  <Switch checked={!!field.required} onChange={(checked) => updateField(index, { required: checked })} />
                                </Space>
                                <Space size={8}>
                                  <span style={{ fontSize: 12, color: 'var(--frost-text-secondary)' }}>显示</span>
                                  <Switch checked={field.visible ?? true} onChange={(checked) => updateField(index, { visible: checked })} />
                                </Space>
                                <div style={{ flex: 1 }} />
                                {field.config?.widget === 'image_upload' && (
                                  <Space size={12}>
                                    <span style={{ fontSize: 12, color: 'var(--frost-text-secondary)' }}>最大上传数</span>
                                    <InputNumber min={1} max={9} value={field.config?.upload?.max_count || 1} onChange={(value) => updateField(index, { config: { ...field.config, step: field.config?.step || currentStepKey, bind: field.config?.bind || `${field.config?.step || currentStepKey}.${field.name}`, upload: { ...field.config?.upload, max_count: Number(value) || 1 } } })} />
                                    <span style={{ fontSize: 12, color: 'var(--frost-text-secondary)' }}>上传必填</span>
                                    <Switch checked={!!field.config?.upload?.required} onChange={(checked) => updateField(index, { config: { ...field.config, step: field.config?.step || currentStepKey, bind: field.config?.bind || `${field.config?.step || currentStepKey}.${field.name}`, upload: { ...field.config?.upload, required: checked } } })} />
                                  </Space>
                                )}
                              </div>

                              {(field.config?.widget === 'select' || field.config?.widget === 'radio' || field.config?.widget === 'checkboxes') && (
                                <div style={{ display: 'grid', gap: 10 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ fontSize: 12, color: 'var(--frost-text-secondary)' }}>选项配置</div>
                                    <Button size="small" icon={<PlusOutlined />} onClick={() => addFieldOption(index)}>添加选项</Button>
                                  </div>
                                  {(field.options || []).map((option, optionIndex) => (
                                    <div key={`${option.value}-${optionIndex}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10 }}>
                                      <Input value={option.label} onChange={(event) => updateFieldOption(index, optionIndex, { label: event.target.value })} placeholder="选项文案" />
                                      <Input value={option.value} onChange={(event) => updateFieldOption(index, optionIndex, { value: event.target.value })} placeholder="选项值" />
                                      <Button danger onClick={() => removeFieldOption(index, optionIndex)}>删除</Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                </div>
              </div>
            </SectionCard>
          </div>

          <SectionCard style={{ padding: 24, borderRadius: 28, background: 'var(--frost-bg-surface-raised)', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 800, color: 'var(--frost-text)' }}>
                <EyeOutlined style={{ color: 'var(--frost-primary)' }} />
                实时预览
              </div>
              <Tag color="processing" style={{ margin: 0 }}>{activityTitle || '未选择活动'}</Tag>
            </div>
            <div style={{ borderRadius: 30, background: 'var(--frost-bg-surface)', border: '1px solid var(--frost-border-input)', padding: 18, display: 'grid', gap: 18 }}>
              <div className="form-designer-preview-scroll" style={{ display: 'flex', overflowX: 'auto', gap: 10, paddingBottom: 4 }}>
                {enabledSteps.map((step, index) => {
                  const isActive = step.key === currentStepKey
                  return (
                    <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 'max-content' }}>
                      <div style={{ width: 42, height: 42, borderRadius: 999, display: 'grid', placeItems: 'center', background: isActive ? 'var(--frost-primary)' : 'var(--frost-bg-input)', color: isActive ? '#fff' : 'var(--frost-text-secondary)', fontWeight: 800 }}>{index + 1}</div>
                      <div style={{ minWidth: 88 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--frost-text)' }}>{step.title}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ borderRadius: 28, background: 'var(--frost-bg-surface-raised)', border: '1px solid var(--frost-border-input)', padding: 18, display: 'grid', gap: 14 }}>
                {previewFields.length === 0 ? (
                  <div style={{ minHeight: 320, borderRadius: 22, border: '1px dashed rgba(27,143,114,0.35)', background: 'var(--frost-success-bg)', display: 'grid', placeItems: 'center', textAlign: 'center', color: 'var(--frost-text-secondary)', padding: 20 }}>
                    <div>
                      <InboxOutlined style={{ fontSize: 24, color: '#1b8f72', marginBottom: 12 }} />
                      <div style={{ fontWeight: 700, color: 'var(--frost-text)', marginBottom: 8 }}>当前步骤暂无字段</div>
                      <div>在画布中创建字段后，这里会实时显示报名步骤的样式。</div>
                    </div>
                  </div>
                ) : (
                  previewFields.map((field) => (
                    <div key={field.id} style={{ display: 'grid', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--frost-text)' }}>
                        <span>{field.label}</span>
                        {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                      </div>
                      {renderPreviewControl(field)}
                    </div>
                  ))
                )}
              </div>
              <button
                type="button"
                style={{
                  borderRadius: 18,
                  border: '1px solid var(--frost-border-input)',
                  background: 'linear-gradient(135deg, var(--frost-primary-glow) 0%, var(--frost-info-bg) 100%)',
                  color: 'var(--frost-text)',
                  padding: '14px 18px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: 'inset 0 1px 0 var(--frost-border-strong)',
                }}
              >
                {rightPreviewButton}
              </button>
            </div>
          </SectionCard>
        </div>
      </DragDropContext>
    </div>
  )
}
