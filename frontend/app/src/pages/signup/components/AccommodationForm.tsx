/**
 * 住宿信息表单组件
 * 按设计稿实现: 2025年12月15日
 */
import { View, Text, Picker, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { AccommodationFormData } from '../types'
import { ACCOMMODATION_OPTIONS, HOTEL_OPTIONS, ROOM_TYPE_OPTIONS, STAY_TYPE_OPTIONS } from '../constants'
import './FormStyles.scss'

// 图标
import iconChevronDown from '../../../assets/icons/chevron-down.png'

interface AccommodationFormProps {
  data: AccommodationFormData
  onChange: (data: AccommodationFormData) => void
  theme?: string
  hotelOptions?: { value: string; label: string }[]
  roomIntentOptions?: { value: string; label: string }[]
  occupancyOptions?: { value: string; label: string }[]
  uploadEnabled?: boolean
}

const AccommodationForm: React.FC<AccommodationFormProps> = ({
  data,
  onChange,
  theme = 'light',
  hotelOptions = HOTEL_OPTIONS,
  roomIntentOptions = ROOM_TYPE_OPTIONS,
  occupancyOptions = STAY_TYPE_OPTIONS,
  uploadEnabled = false,
}) => {
  const handleChange = (field: keyof AccommodationFormData, value: string) => {
    onChange({ ...data, [field]: value })
  }

  const handleChooseAttachment = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    }).then(res => {
      handleChange('attachment', res.tempFilePaths[0])
    }).catch(() => {})
  }

  const getHotelLabel = (value: string) => {
    return hotelOptions.find(o => o.value === value)?.label || '请选择'
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
          range={hotelOptions}
          rangeKey="label"
          value={Math.max(0, hotelOptions.findIndex(o => o.value === data.hotel))}
          onChange={(e) => handleChange('hotel', hotelOptions[Number(e.detail.value)].value)}
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
          {roomIntentOptions.map(option => (
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
          {occupancyOptions.map(option => (
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

      {uploadEnabled && (
        <View className="form-item">
          <View className="form-label">
            <Text className="label-text">补充图片</Text>
          </View>
          <View className="file-upload" onClick={handleChooseAttachment}>
            {data.attachment ? (
              <Image src={data.attachment} className="upload-preview" mode="aspectFit" />
            ) : (
              <Text className="upload-text">选择文件  未选择任何文件</Text>
            )}
          </View>
        </View>
      )}
    </View>
  )
}

export default AccommodationForm
