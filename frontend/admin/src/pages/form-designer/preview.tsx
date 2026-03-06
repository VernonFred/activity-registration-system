import type { CSSProperties } from 'react'
import type { DesignerPreviewField } from './types'

export function renderPreviewControl(field: DesignerPreviewField) {
  const baseStyle: CSSProperties = {
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
