/**
 * 住宿信息表单组件
 * 按设计稿实现: 2025年12月15日
 */
import { View, Text, Picker, Image } from '@tarojs/components'
import type { AccommodationFormData } from '../types'
import { ACCOMMODATION_OPTIONS, HOTEL_OPTIONS, ROOM_TYPE_OPTIONS, STAY_TYPE_OPTIONS } from '../constants'
import './FormStyles.scss'

// 图标
import iconChevronDown from '../../../assets/icons/chevron-down.png'

interface AccommodationFormProps {
  data: AccommodationFormData
  onChange: (data: AccommodationFormData) => void
  theme?: string
}

const AccommodationForm: React.FC<AccommodationFormProps> = ({ data, onChange, theme = 'light' }) => {
  const handleChange = (field: keyof AccommodationFormData, value: string) => {
    onChange({ ...data, [field]: value })
  }

  const getHotelLabel = (value: string) => {
    return HOTEL_OPTIONS.find(o => o.value === value)?.label || '请选择'
  }

  return (
    <View className={`form-container theme-${theme}`}>
      {/* 住宿安排 */}
      <View className="form-item">
        <View className="form-label">
          <Text className="label-text">住宿安排</Text>
          <Text className="required">*</Text>
        </View>
        <View className="radio-group">
          {ACCOMMODATION_OPTIONS.map(option => (
            <View 
              key={option.value}
              className={`radio-item ${data.accommodation_type === option.value ? 'active' : ''}`}
              onClick={() => handleChange('accommodation_type', option.value as 'self' | 'organizer')}
            >
              <View className="radio-circle">
                {data.accommodation_type === option.value && <View className="radio-dot" />}
              </View>
              <Text className="radio-label">{option.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 酒店安排 */}
      <View className="form-item">
        <View className="form-label">
          <Text className="label-text">酒店安排</Text>
          <Text className="required">*</Text>
        </View>
        <Picker
          mode="selector"
          range={HOTEL_OPTIONS}
          rangeKey="label"
          value={HOTEL_OPTIONS.findIndex(o => o.value === data.hotel)}
          onChange={(e) => handleChange('hotel', HOTEL_OPTIONS[Number(e.detail.value)].value)}
        >
          <View className="form-select">
            <Text className="select-text">{getHotelLabel(data.hotel)}</Text>
            <Image src={iconChevronDown} className="select-icon" mode="aspectFit" />
          </View>
        </Picker>
      </View>

      {/* 住宿意向 */}
      <View className="form-item">
        <View className="form-label">
          <Text className="label-text">住宿意向</Text>
          <Text className="required">*</Text>
        </View>
        <View className="radio-group">
          {ROOM_TYPE_OPTIONS.map(option => (
            <View 
              key={option.value}
              className={`radio-item ${data.room_type === option.value ? 'active' : ''}`}
              onClick={() => handleChange('room_type', option.value as 'double' | 'standard')}
            >
              <View className="radio-circle">
                {data.room_type === option.value && <View className="radio-dot" />}
              </View>
              <Text className="radio-label">{option.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 户型 */}
      <View className="form-item">
        <View className="form-label">
          <Text className="label-text">户型</Text>
          <Text className="required">*</Text>
        </View>
        <View className="radio-group">
          {STAY_TYPE_OPTIONS.map(option => (
            <View 
              key={option.value}
              className={`radio-item ${data.stay_type === option.value ? 'active' : ''}`}
              onClick={() => handleChange('stay_type', option.value as 'single' | 'shared')}
            >
              <View className="radio-circle">
                {data.stay_type === option.value && <View className="radio-dot" />}
              </View>
              <Text className="radio-label">{option.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

export default AccommodationForm

