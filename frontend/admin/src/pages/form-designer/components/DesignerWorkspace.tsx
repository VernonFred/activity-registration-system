import {
  AppstoreAddOutlined,
  FormOutlined,
  InboxOutlined,
} from '@ant-design/icons'
import { Tag } from 'antd'
import { Droppable } from '@hello-pangea/dnd'
import SectionCard from '../../../components/SectionCard'
import { PALETTE } from '../constants'
import type { FieldItem, FieldOption, PaletteItem } from '../types'
import type { SignupStepDefinition } from '../../activity-create/types'
import FieldEditorCard from './FieldEditorCard'
import PaletteGrid from './PaletteGrid'

type Props = {
  activeStep?: SignupStepDefinition
  currentStepKey: string
  currentStepFields: Array<{ field: FieldItem; index: number }>
  bindOptions: string[]
  addField: (item: PaletteItem) => void
  updateField: (index: number, patch: Partial<FieldItem>) => void
  duplicateField: (index: number) => void
  deleteField: (index: number) => void
  updateFieldOption: (fieldIndex: number, optionIndex: number, patch: Partial<FieldOption>) => void
  addFieldOption: (fieldIndex: number) => void
  removeFieldOption: (fieldIndex: number, optionIndex: number) => void
}

export default function DesignerWorkspace(props: Props) {
  const {
    activeStep,
    currentStepKey,
    currentStepFields,
    bindOptions,
    addField,
    updateField,
    duplicateField,
    deleteField,
    updateFieldOption,
    addFieldOption,
    removeFieldOption,
  } = props

  return (
    <SectionCard style={{ padding: 24, borderRadius: 28, overflow: 'hidden', height: '100%', display: 'grid', gridTemplateRows: 'auto auto 1fr', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 800, color: 'var(--frost-text)' }}>
          <AppstoreAddOutlined style={{ color: 'var(--frost-primary)' }} />
          控件库
        </div>
      </div>
      <PaletteGrid items={PALETTE} addField={addField} />
      <div style={{ minHeight: 0, display: 'grid', gridTemplateRows: 'auto 1fr', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, fontWeight: 800, color: 'var(--frost-text)' }}>
            <FormOutlined style={{ color: 'var(--frost-primary)' }} />
            表单画布
          </div>
          <Tag color="processing" style={{ margin: 0, whiteSpace: 'nowrap' }}>当前 {currentStepFields.length} 项</Tag>
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
                  <FieldEditorCard
                    key={`${field.name}-${index}`}
                    field={field}
                    index={index}
                    canvasIndex={canvasIndex}
                    activeStep={activeStep}
                    currentStepKey={currentStepKey}
                    bindOptions={bindOptions}
                    duplicateField={duplicateField}
                    deleteField={deleteField}
                    updateField={updateField}
                    updateFieldOption={updateFieldOption}
                    addFieldOption={addFieldOption}
                    removeFieldOption={removeFieldOption}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </div>
    </SectionCard>
  )
}
