import type { Dispatch, SetStateAction } from 'react'
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, PlusOutlined, ProfileOutlined } from '@ant-design/icons'
import { Button, Input, Popconfirm, Space, Switch, Tag } from 'antd'
import { Draggable, Droppable } from '@hello-pangea/dnd'
import SectionCard from '../../../components/SectionCard'
import { BUILTIN_STEP_META } from '../constants'
import { reorder } from '../utils'
import type { FieldItem } from '../types'
import type { SignupFlowConfig, SignupStepDefinition } from '../../activity-create/types'

type Props = {
  sortedSteps: SignupStepDefinition[]
  currentStepKey: string
  fields: FieldItem[]
  signupFlow: SignupFlowConfig
  addCustomStep: () => void
  updateStep: (stepKey: string, patch: Partial<SignupStepDefinition>) => void
  setActiveStepKey: (stepKey: string) => void
  setSignupFlow: Dispatch<SetStateAction<SignupFlowConfig>>
  removeStep: (stepKey: string) => void
}

export default function StepSidebar({
  sortedSteps,
  currentStepKey,
  fields,
  signupFlow,
  addCustomStep,
  updateStep,
  setActiveStepKey,
  setSignupFlow,
  removeStep,
}: Props) {
  return (
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
              const count = fields.filter((field) => (field.config?.step || 'personal') === step.key).length
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
                            onClick={(_checked, event) => event?.stopPropagation()}
                          />
                        </Space>
                        <Space size={4}>
                          <Button
                            size="small"
                            icon={<ArrowUpOutlined />}
                            disabled={index === 0}
                            onClick={(event) => {
                              event.stopPropagation()
                              setSignupFlow((prev) => ({
                                steps: reorder([...prev.steps].sort((a, b) => a.order - b.order), index, index - 1).map((item, order) => ({ ...item, order })),
                              }))
                            }}
                          />
                          <Button
                            size="small"
                            icon={<ArrowDownOutlined />}
                            disabled={index === sortedSteps.length - 1}
                            onClick={(event) => {
                              event.stopPropagation()
                              setSignupFlow((prev) => ({
                                steps: reorder([...prev.steps].sort((a, b) => a.order - b.order), index, index + 1).map((item, order) => ({ ...item, order })),
                              }))
                            }}
                          />
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
  )
}
