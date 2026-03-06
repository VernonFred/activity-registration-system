/**
 * 交通信息表单组件
 * 按设计稿实现: 2025年12月15日
 */
import { useState } from 'react'
import { View, Text, Input, Picker, Image, Swiper, SwiperItem } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { TransportFormData } from '../types'
import { PICKUP_OPTIONS } from '../constants'
import './FormStyles.scss'

// 图标
import iconChevronDown from '../../../assets/icons/chevron-down.png'
import iconCalendar from '../../../assets/icons/calendar.png'
import iconArrowRight from '../../../assets/icons/arrow-right.png'

interface TransportFormProps {
  data: TransportFormData
  onChange: (data: TransportFormData) => void
  theme?: string
  pickupOptions?: { value: string; label: string }[]
  dropoffOptions?: { value: string; label: string }[]
  note?: string
  uploadEnabled?: boolean
}

const TransportForm: React.FC<TransportFormProps> = ({
  data,
  onChange,
  theme = 'light',
  pickupOptions = PICKUP_OPTIONS,
  dropoffOptions = PICKUP_OPTIONS,
  note = '如果您已购买车票或航班，请填写以下信息。如果暂未购买，可以选择稍后填写。',
  uploadEnabled = false,
}) => {
  const [activePanel, setActivePanel] = useState(0)

  const handleChange = (field: keyof TransportFormData, value: string) => {
    onChange({ ...data, [field]: value })
  }

  const getPickupLabel = (value?: string) => {
    return pickupOptions.find(o => o.value === value)?.label || '选择接站地点'
  }
  
  const getDropoffLabel = (value?: string) => {
    return dropoffOptions.find(o => o.value === value)?.label || '选择送站地点'
  }

  const formatDateTime = (dateTime?: string) => {
    if (!dateTime) return '年/月/日 --:--'
    return dateTime
  }

  const panels = [
    { key: 'arrival', title: '到达信息', tone: 'green' as const },
    { key: 'return', title: '返程信息', tone: 'red' as const },
  ]

  const handleChooseAttachment = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    }).then(res => {
      handleChange('attachment', res.tempFilePaths[0])
    }).catch(() => {})
  }

  return (
    <View className={`form-container transport-form-container theme-${theme}`}>
      {/* 提示信息 */}
      <View className="info-tip">
        <Text className="tip-text">
          {note}
        </Text>
      </View>

      <Swiper
        className="transport-swiper"
        current={activePanel}
        onChange={(e) => setActivePanel(e.detail.current)}
        circular={false}
        autoplay={false}
        duration={220}
      >
        <SwiperItem>
          <View className="transport-swiper-item">
            <View className="form-card green">
              <View className="form-card-header">
                <View className="header-icon">
                  <Image src={iconArrowRight} className="icon-img" mode="aspectFit" />
                </View>
                <Text className="header-title">到达信息</Text>
              </View>

              <View className="form-item">
                <Picker
                  mode="selector"
                  range={pickupOptions}
                  rangeKey="label"
                  value={Math.max(0, pickupOptions.findIndex(o => o.value === data.pickup_point))}
                  onChange={(e) => handleChange('pickup_point', pickupOptions[Number(e.detail.value)].value)}
                >
                  <View className="form-select">
                    <Text className="select-text">{getPickupLabel(data.pickup_point)}</Text>
                    <Image src={iconChevronDown} className="select-icon" mode="aspectFit" />
                  </View>
                </Picker>
              </View>

              <View className="form-item">
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

              <View className="form-item">
                <Input
                  className="form-input"
                  placeholder="航班/车次号"
                  placeholderClass="placeholder"
                  value={data.flight_train_number || ''}
                  onInput={(e) => handleChange('flight_train_number', e.detail.value)}
                />
              </View>
            </View>
          </View>
        </SwiperItem>

        <SwiperItem>
          <View className="transport-swiper-item">
            <View className="form-card red">
              <View className="form-card-header">
                <View className="header-icon" style={{ transform: 'rotate(180deg)' }}>
                  <Image src={iconArrowRight} className="icon-img" mode="aspectFit" />
                </View>
                <Text className="header-title">返程信息</Text>
              </View>

              <View className="form-item">
                <Picker
                  mode="selector"
                  range={dropoffOptions}
                  rangeKey="label"
                  value={Math.max(0, dropoffOptions.findIndex(o => o.value === data.dropoff_point))}
                  onChange={(e) => handleChange('dropoff_point', dropoffOptions[Number(e.detail.value)].value)}
                >
                  <View className="form-select">
                    <Text className="select-text">{getDropoffLabel(data.dropoff_point)}</Text>
                    <Image src={iconChevronDown} className="select-icon" mode="aspectFit" />
                  </View>
                </Picker>
              </View>

              <View className="form-item">
                <Picker
                  mode="date"
                  value={data.return_time || ''}
                  onChange={(e) => handleChange('return_time', e.detail.value)}
                >
                  <View className="form-select date-select">
                    <Text className="select-text">{formatDateTime(data.return_time)}</Text>
                    <Image src={iconCalendar} className="select-icon" mode="aspectFit" />
                  </View>
                </Picker>
              </View>

              <View className="form-item">
                <Input
                  className="form-input"
                  placeholder="航班/车次号"
                  placeholderClass="placeholder"
                  value={data.return_flight_train_number || ''}
                  onInput={(e) => handleChange('return_flight_train_number', e.detail.value)}
                />
              </View>
            </View>
          </View>
        </SwiperItem>
      </Swiper>

      <View className="transport-swiper-dots">
        {panels.map((panel, index) => (
          <View
            key={`${panel.key}-dot`}
            className={`transport-dot ${activePanel === index ? 'active' : ''}`}
          />
        ))}
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

export default TransportForm
