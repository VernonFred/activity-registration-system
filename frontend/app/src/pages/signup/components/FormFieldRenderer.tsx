/**
 * 表单字段渲染组件
 * 创建时间: 2025年12月9日
 */
import { View, Text, Input, Picker, Textarea, Switch } from '@tarojs/components'
import type { FormField } from '../types'

interface FormFieldRendererProps {
  field: FormField
  value: any
  onChange: (key: string, value: any) => void
}

const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({ field, value, onChange }) => {
  switch (field.field_type) {
    case 'textarea':
      return (
        <Textarea
          className="textarea-input"
          value={value || ''}
          placeholder={field.placeholder || `请输入${field.label}`}
          onInput={e => onChange(field.name, e.detail.value)}
          maxlength={500}
        />
      )

    case 'number':
      return (
        <Input
          className="input"
          type="number"
          value={value || ''}
          placeholder={field.placeholder || `请输入${field.label}`}
          onInput={e => onChange(field.name, e.detail.value)}
        />
      )

    case 'select':
    case 'radio':
      return (
        <Picker
          mode="selector"
          range={field.options?.map(opt => opt.label) || []}
          value={field.options?.findIndex(opt => opt.value === value) ?? -1}
          onChange={e => {
            const selectedValue = field.options?.[Number(e.detail.value)]?.value || ''
            onChange(field.name, selectedValue)
          }}
        >
          <View className="picker-value">
            {field.options?.find(opt => opt.value === value)?.label || '请选择'}
            <Text className="picker-arrow">▼</Text>
          </View>
        </Picker>
      )

    case 'multi_select':
    case 'checkbox':
      return (
        <View className="checkbox-group">
          {field.options?.map(opt => (
            <View
              key={opt.id}
              className={`checkbox-item ${(value || []).includes(opt.value) ? 'checked' : ''}`}
              onClick={() => {
                const current = value || []
                const newVal = current.includes(opt.value)
                  ? current.filter((v: string) => v !== opt.value)
                  : [...current, opt.value]
                onChange(field.name, newVal)
              }}
            >
              <View className="checkbox-box">
                {(value || []).includes(opt.value) && <Text className="checkbox-check">✓</Text>}
              </View>
              <Text className="checkbox-label">{opt.label}</Text>
            </View>
          ))}
        </View>
      )

    case 'date':
      return (
        <Picker
          mode="date"
          value={value || ''}
          onChange={e => onChange(field.name, e.detail.value)}
        >
          <View className="picker-value">
            {value || '请选择日期'}
            <Text className="picker-arrow">▼</Text>
          </View>
        </Picker>
      )

    case 'time':
      return (
        <Picker
          mode="time"
          value={value || ''}
          onChange={e => onChange(field.name, e.detail.value)}
        >
          <View className="picker-value">
            {value || '请选择时间'}
            <Text className="picker-arrow">▼</Text>
          </View>
        </Picker>
      )

    case 'datetime':
      return (
        <View className="datetime-picker">
          <Picker
            mode="date"
            value={value?.split(' ')[0] || ''}
            onChange={e => {
              const time = value?.split(' ')[1] || '09:00'
              onChange(field.name, `${e.detail.value} ${time}`)
            }}
          >
            <View className="picker-value half">
              {value?.split(' ')[0] || '选择日期'}
            </View>
          </Picker>
          <Picker
            mode="time"
            value={value?.split(' ')[1] || '09:00'}
            onChange={e => {
              const date = value?.split(' ')[0] || ''
              onChange(field.name, `${date} ${e.detail.value}`)
            }}
          >
            <View className="picker-value half">
              {value?.split(' ')[1] || '选择时间'}
            </View>
          </Picker>
        </View>
      )

    case 'switch':
      return (
        <View className="switch-wrapper">
          <Switch
            checked={!!value}
            onChange={e => onChange(field.name, e.detail.value)}
            color="#0052d9"
          />
          <Text className="switch-label">{value ? '是' : '否'}</Text>
        </View>
      )

    default: // text
      return (
        <Input
          className="input"
          value={value || ''}
          placeholder={field.placeholder || `请输入${field.label}`}
          onInput={e => onChange(field.name, e.detail.value)}
        />
      )
  }
}

export default FormFieldRenderer

