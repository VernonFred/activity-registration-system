import { EyeOutlined, InboxOutlined } from '@ant-design/icons'
import { Tag } from 'antd'
import SectionCard from '../../../components/SectionCard'
import { renderPreviewControl } from '../preview'
import type { DesignerPreviewField } from '../types'
import type { SignupStepDefinition } from '../../activity-create/types'

type Props = {
  activityTitle: string
  enabledSteps: SignupStepDefinition[]
  currentStepKey: string
  previewFields: DesignerPreviewField[]
  rightPreviewButton: string
}

export default function PreviewPanel({ activityTitle, enabledSteps, currentStepKey, previewFields, rightPreviewButton }: Props) {
  return (
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
  )
}
