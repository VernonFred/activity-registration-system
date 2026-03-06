import {
  AppstoreAddOutlined,
  CopyOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { Button, Input, InputNumber, Select, Space, Switch, Tag } from 'antd'
import { Draggable } from '@hello-pangea/dnd'
import type { FieldOption, FieldType, FieldWidget, PaletteItem } from '../types'
import type { FieldItem } from '../types'
import type { SignupStepDefinition } from '../../activity-create/types'
import { FIELD_TYPE_OPTIONS } from '../constants'
import { getFieldTypeLabel, getFieldTypeSelectValue } from '../utils'

type Props = {
  field: FieldItem
  index: number
  canvasIndex: number
  activeStep?: SignupStepDefinition
  currentStepKey: string
  bindOptions: string[]
  duplicateField: (index: number) => void
  deleteField: (index: number) => void
  updateField: (index: number, patch: Partial<FieldItem>) => void
  updateFieldOption: (fieldIndex: number, optionIndex: number, patch: Partial<FieldOption>) => void
  addFieldOption: (fieldIndex: number) => void
  removeFieldOption: (fieldIndex: number, optionIndex: number) => void
}

export default function FieldEditorCard({
  field,
  index,
  canvasIndex,
  activeStep,
  currentStepKey,
  bindOptions,
  duplicateField,
  deleteField,
  updateField,
  updateFieldOption,
  addFieldOption,
  removeFieldOption,
}: Props) {
  return (
    <Draggable draggableId={`field-${field.name}-${index}`} index={canvasIndex}>
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
                <div style={{ fontSize: 12, color: 'var(--frost-text-secondary)' }}>{getFieldTypeLabel(field.config?.widget || 'input', field.field_type)}</div>
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
                    placeholder: widgetValue === 'dateTime' ? '请选择日期和时间' : widgetValue === 'image_upload' ? '' : field.placeholder,
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
  )
}
