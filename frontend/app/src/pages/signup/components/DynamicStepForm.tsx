import { View, Text, Input, Picker, Image, Textarea, Switch as TaroSwitch } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { FormField, StepValues } from '../types'
import './FormStyles.scss'

interface DynamicStepFormProps {
  fields: FormField[]
  values: StepValues
  onChange: (next: StepValues) => void
  theme?: string
  paymentQrImageUrl?: string
  paymentInvoiceEnabled?: boolean
  transportNote?: string
}

function getValueKey(field: FormField) {
  const bind = field.config?.bind || field.name
  const segments = bind.split('.')
  return segments[segments.length - 1] || field.name
}

function chooseUpload(maxCount = 1) {
  return Taro.chooseImage({
    count: maxCount,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
  }).then((res) => (maxCount > 1 ? res.tempFilePaths : res.tempFilePaths[0] || ''))
}

const DynamicStepForm: React.FC<DynamicStepFormProps> = ({
  fields,
  values,
  onChange,
  theme = 'light',
  paymentQrImageUrl,
  paymentInvoiceEnabled = true,
  transportNote,
}) => {
  const setFieldValue = (field: FormField, value: any) => {
    onChange({
      ...values,
      [getValueKey(field)]: value,
    })
  }

  const renderField = (field: FormField) => {
    const key = getValueKey(field)
    const value = values[key]
    const widget = field.config?.widget || 'input'

    if (widget === 'image_upload') {
      const maxCount = field.config?.upload?.max_count || 1
      const files = Array.isArray(value) ? value : value ? [value] : []
      return (
        <View className="form-item" key={field.name}>
          <View className="form-label">
            <Text className="label-text">{field.label}</Text>
            {(field.required || field.config?.upload?.required) && <Text className="required">*</Text>}
          </View>
          <View className="file-upload" onClick={() => chooseUpload(maxCount).then((result) => setFieldValue(field, result)).catch(() => {})}>
            {files.length > 0 ? (
              <View style={{ display: 'flex', gap: '12rpx', flexWrap: 'wrap' }}>
                {files.map((file: string) => (
                  <Image key={file} src={file} className="upload-preview" mode="aspectFit" />
                ))}
              </View>
            ) : (
              <Text className="upload-text">选择文件  未选择任何文件</Text>
            )}
          </View>
        </View>
      )
    }

    if (widget === 'textarea') {
      return (
        <View className="form-item" key={field.name}>
          <View className="form-label">
            <Text className="label-text">{field.label}</Text>
            {field.required && <Text className="required">*</Text>}
          </View>
          <Textarea
            className="form-input"
            style={{ height: '160rpx', paddingTop: '24rpx' }}
            placeholder={field.placeholder || '请输入'}
            placeholderClass="placeholder"
            value={value || ''}
            onInput={(e) => setFieldValue(field, e.detail.value)}
          />
        </View>
      )
    }

    if (widget === 'select') {
      const options = field.options || []
      const currentIndex = Math.max(0, options.findIndex((option) => option.value === value))
      return (
        <View className="form-item" key={field.name}>
          <View className="form-label">
            <Text className="label-text">{field.label}</Text>
            {field.required && <Text className="required">*</Text>}
          </View>
          <Picker
            mode="selector"
            range={options}
            rangeKey="label"
            value={currentIndex}
            onChange={(e) => setFieldValue(field, options[Number(e.detail.value)]?.value || '')}
          >
            <View className="form-select">
              <Text className="select-text">{options.find((option) => option.value === value)?.label || field.placeholder || '请选择'}</Text>
              <Text className="select-icon">⌄</Text>
            </View>
          </Picker>
        </View>
      )
    }

    if (widget === 'radio') {
      return (
        <View className="form-item" key={field.name}>
          <View className="form-label">
            <Text className="label-text">{field.label}</Text>
            {field.required && <Text className="required">*</Text>}
          </View>
          <View className="radio-group">
            {(field.options || []).map((option) => (
              <View key={option.value} className={`radio-item ${value === option.value ? 'active' : ''}`} onClick={() => setFieldValue(field, option.value)}>
                <View className="radio-circle">{value === option.value && <View className="radio-dot" />}</View>
                <Text className="radio-label">{option.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )
    }

    if (widget === 'checkboxes') {
      const currentValues: string[] = Array.isArray(value) ? value : []
      return (
        <View className="form-item" key={field.name}>
          <View className="form-label">
            <Text className="label-text">{field.label}</Text>
            {field.required && <Text className="required">*</Text>}
          </View>
          <View className="radio-group">
            {(field.options || []).map((option) => {
              const checked = currentValues.includes(option.value)
              return (
                <View
                  key={option.value}
                  className={`radio-item ${checked ? 'active' : ''}`}
                  onClick={() => {
                    const next = checked
                      ? currentValues.filter((item) => item !== option.value)
                      : [...currentValues, option.value]
                    setFieldValue(field, next)
                  }}
                >
                  <View className="radio-circle">{checked && <View className="radio-dot" />}</View>
                  <Text className="radio-label">{option.label}</Text>
                </View>
              )
            })}
          </View>
        </View>
      )
    }

    if (widget === 'switch') {
      return (
        <View className="form-item" key={field.name}>
          <View className="form-label">
            <Text className="label-text">{field.label}</Text>
          </View>
          <View className="form-select">
            <Text className="select-text">{field.placeholder || '开关项'}</Text>
            <TaroSwitch checked={!!value} color="#1E5A3C" onChange={(e) => setFieldValue(field, e.detail.value)} />
          </View>
        </View>
      )
    }

    return (
      <View className="form-item" key={field.name}>
        <View className="form-label">
          <Text className="label-text">{field.label}</Text>
          {field.required && <Text className="required">*</Text>}
        </View>
        <Input
          className="form-input"
          placeholder={field.placeholder || '请输入'}
          placeholderClass="placeholder"
          value={typeof value === 'string' ? value : ''}
          onInput={(e) => setFieldValue(field, e.detail.value)}
        />
      </View>
    )
  }

  return (
    <View className={`form-container theme-${theme}`}>
      {paymentQrImageUrl && (
        <View className="qrcode-section">
          <View className="qrcode-wrapper">
            <Image src={paymentQrImageUrl} className="upload-preview" mode="aspectFit" />
          </View>
          <Text className="qrcode-tip">请扫码或识别二维码进行缴费</Text>
        </View>
      )}

      {transportNote && (
        <View className="info-tip">
          <Text className="tip-text">{transportNote}</Text>
        </View>
      )}

      {fields
        .filter((field) => paymentInvoiceEnabled || getValueKey(field) !== 'invoice_title')
        .map(renderField)}
    </View>
  )
}

export default DynamicStepForm
