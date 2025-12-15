/**
 * 交通信息表单组件
 * 按设计稿实现: 2025年12月15日
 */
import { View, Text, Input, Picker, Image } from '@tarojs/components'
import type { TransportFormData } from '../types'
import { PICKUP_OPTIONS } from '../constants'
import './FormStyles.scss'

// 图标
import iconChevronDown from '../../../assets/icons/chevron-down.png'
import iconCalendar from '../../../assets/icons/calendar.png'

interface TransportFormProps {
  data: TransportFormData
  onChange: (data: TransportFormData) => void
  theme?: string
}

const TransportForm: React.FC<TransportFormProps> = ({ data, onChange, theme = 'light' }) => {
  const handleChange = (field: keyof TransportFormData, value: string) => {
    onChange({ ...data, [field]: value })
  }

  const getPickupLabel = (value?: string) => {
    return PICKUP_OPTIONS.find(o => o.value === value)?.label || '请选择'
  }

  const formatDateTime = (dateTime?: string) => {
    if (!dateTime) return '年/月/日  --:--'
    return dateTime
  }

  return (
    <View className={`form-container theme-${theme}`}>
      {/* 提示信息 */}
      <View className="info-tip">
        <Text className="tip-text">
          如果您已购买车票或航班，请填写以下信息。如果暂未购买，可以选择稍后填写。
        </Text>
      </View>

      {/* 接站点 */}
      <View className="form-item">
        <View className="form-label">
          <Text className="label-text">接站点</Text>
        </View>
        <Picker
          mode="selector"
          range={PICKUP_OPTIONS}
          rangeKey="label"
          value={PICKUP_OPTIONS.findIndex(o => o.value === data.pickup_point)}
          onChange={(e) => handleChange('pickup_point', PICKUP_OPTIONS[Number(e.detail.value)].value)}
        >
          <View className="form-select">
            <Text className="select-text">{getPickupLabel(data.pickup_point)}</Text>
            <Image src={iconChevronDown} className="select-icon" mode="aspectFit" />
          </View>
        </Picker>
      </View>

      {/* 到达时间 */}
      <View className="form-item">
        <View className="form-label">
          <Text className="label-text">到达时间</Text>
        </View>
        <Picker
          mode="date"
          value={data.arrival_time || ''}
          onChange={(e) => handleChange('arrival_time', e.detail.value)}
        >
          <View className="form-select date-select">
            <Text className="select-text">{formatDateTime(data.arrival_time)}</Text>
            <Image src={iconCalendar} className="select-icon" mode="aspectFit" />
          </View>
        </Picker>
      </View>

      {/* 到达车次/航班号 */}
      <View className="form-item">
        <View className="form-label">
          <Text className="label-text">到达车次/航班号</Text>
        </View>
        <Input
          className="form-input"
          placeholder="例如：G123或CA1234"
          placeholderClass="placeholder"
          value={data.flight_train_number || ''}
          onInput={(e) => handleChange('flight_train_number', e.detail.value)}
        />
      </View>
    </View>
  )
}

export default TransportForm

