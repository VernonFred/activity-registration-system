/**
 * 酒店信息Tab组件 - 按设计稿重构
 * 创建时间: 2025年12月9日
 * 更新时间: 2025年12月14日
 */
import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useState } from 'react'
import type { Hotel } from '../types'

// 图标
import iconMapPin from '../../../assets/icons/map-pin.png'
import iconPhone from '../../../assets/icons/phone.png'
import iconPhoneCall from '../../../assets/icons/phone-call.png'
import iconWifi from '../../../assets/icons/wifi.png'
import iconCoffee from '../../../assets/icons/coffee.png'
import iconUtensils from '../../../assets/icons/utensils-crossed.png'
import iconParking from '../../../assets/icons/parking-meter.png'
import iconWashing from '../../../assets/icons/washing-machine.png'
import iconPresentation from '../../../assets/icons/presentation.png'
import iconNavigation from '../../../assets/icons/navigation.png'
import iconBus from '../../../assets/icons/bus.png'
import iconCar from '../../../assets/icons/car-front.png'
import iconCloud from '../../../assets/icons/cloud.png'
import iconDroplets from '../../../assets/icons/droplets.png'
import iconWind from '../../../assets/icons/wind.png'
import iconEye from '../../../assets/icons/eye.png'

// 设施图标映射
const FACILITY_ICONS: Record<string, string> = {
  'wifi': iconWifi,
  '免费WiFi': iconWifi,
  'coffee': iconCoffee,
  '咖啡厅': iconCoffee,
  'restaurant': iconUtensils,
  '餐厅': iconUtensils,
  'parking': iconParking,
  '免费停车': iconParking,
  'laundry': iconWashing,
  '洗衣房': iconWashing,
  'meeting': iconPresentation,
  '会议厅': iconPresentation,
}

interface HotelTabProps {
  hotels: Hotel[]
  onCall: (phone: string) => void
  theme: string
}

const HotelTab: React.FC<HotelTabProps> = ({ hotels, onCall, theme }) => {
  const [activeHotelIndex, setActiveHotelIndex] = useState(0)

  const activeHotel = hotels[activeHotelIndex]

  if (!activeHotel) {
    return (
      <View className={`tab-content hotel empty theme-${theme}`}>
        <Text className="empty-text">暂无酒店信息</Text>
      </View>
    )
  }

  return (
    <View className={`tab-content hotel theme-${theme}`}>
      {/* 酒店切换胶囊按钮 */}
      <ScrollView className="hotel-tabs" scrollX showScrollbar={false}>
        {hotels.map((hotel, index) => (
          <View
            key={hotel.id}
            className={`hotel-tab ${index === activeHotelIndex ? 'active' : ''}`}
            onClick={() => setActiveHotelIndex(index)}
          >
            <Text className="tab-text">{hotel.name}</Text>
          </View>
        ))}
      </ScrollView>

      {/* 酒店详情卡片 */}
      <View className="hotel-hero-card">
        {/* 背景图片 */}
        <Image
          className="hero-bg"
          src={activeHotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
          mode="aspectFill"
        />
        <View className="hero-overlay" />
        
        {/* 酒店信息 */}
        <View className="hero-content">
          <View className="hotel-name-row">
            {activeHotel.logo && (
              <Image src={activeHotel.logo} className="hotel-logo" mode="aspectFit" />
            )}
            <Text className="hotel-name">{activeHotel.name}</Text>
          </View>
          
          {/* 预订提示 */}
          {activeHotel.booking_tip && (
            <View className="booking-tip-row">
              <Image src={iconMapPin} className="tip-icon" mode="aspectFit" />
              <Text className="tip-text">{activeHotel.booking_tip}</Text>
            </View>
          )}
          
          {/* 联系电话 */}
          {activeHotel.contact_phone && (
            <View className="phone-row" onClick={() => onCall(activeHotel.contact_phone || '')}>
              <Image src={iconPhone} className="phone-icon" mode="aspectFit" />
              <Text className="phone-text">{activeHotel.contact_phone}</Text>
            </View>
          )}
          
          {/* 设施图标网格 */}
          <View className="facilities-grid">
            {(activeHotel.facilities || []).slice(0, 6).map((facility, i) => {
              const iconSrc = typeof facility === 'string' 
                ? FACILITY_ICONS[facility] || iconWifi 
                : FACILITY_ICONS[facility.icon] || iconWifi
              const label = typeof facility === 'string' ? facility : facility.label
              
              return (
                <View key={i} className="facility-item">
                  <Image src={iconSrc} className="facility-icon" mode="aspectFit" />
                  <Text className="facility-label">{label}</Text>
                </View>
              )
            })}
          </View>
        </View>
      </View>

      {/* 房型价格 */}
      <View className="room-price-card">
        <View className="room-info">
          <Text className="room-type">{activeHotel.room_type}</Text>
          <Text className="room-note">{activeHotel.price_note || '单双同价'}</Text>
        </View>
        <View className="price-box">
          <Text className="price-symbol">¥</Text>
          <Text className="price-amount">{activeHotel.price}</Text>
          <Text className="price-unit">/晚</Text>
        </View>
      </View>

      {/* 预订说明（不折叠，直接显示） */}
      {activeHotel.booking_tip && (
        <View className="booking-tip-card">
          <View className="tip-header">
            <View className="tip-title-row">
              <Image src={iconMapPin} className="section-icon" mode="aspectFit" />
              <Text className="section-title">预订说明</Text>
            </View>
          </View>
          <View className="tip-content">
            <Text className="tip-text">{activeHotel.booking_tip}</Text>
          </View>
        </View>
      )}

      {/* 预定联系人 */}
      <View className="contact-card">
        <View className="contact-header">
          <Image src={iconPhoneCall} className="section-icon" mode="aspectFit" />
          <Text className="section-title">预定联系人</Text>
        </View>
        <View className="contact-info">
          <Text className="contact-name">{activeHotel.contact_name}</Text>
          <Text className="contact-phone">{activeHotel.contact_phone}</Text>
        </View>
      </View>
      
      {/* 拨打电话按钮 - 独立于卡片下方 */}
      <View className="call-button" onClick={() => onCall(activeHotel.contact_phone || '')}>
        <Text className="call-text">拨打电话预定</Text>
      </View>

      {/* 位置地图 */}
      {activeHotel.map_image && (
        <View className="map-card">
          <View className="map-header">
            <Image src={iconMapPin} className="section-icon" mode="aspectFit" />
            <Text className="section-title">位置地图</Text>
          </View>
          <Image 
            src={activeHotel.map_image} 
            className="map-image" 
            mode="aspectFill"
          />
        </View>
      )}

      {/* 交通指南 */}
      {activeHotel.transport && activeHotel.transport.length > 0 && (
        <View className="transport-card">
          <View className="transport-header">
            <Image src={iconNavigation} className="section-icon" mode="aspectFit" />
            <Text className="section-title">交通指南</Text>
          </View>
          {activeHotel.transport.map((item, i) => {
            const transportIcon = item.type === 'subway' ? iconBus 
              : item.type === 'bus' ? iconBus 
              : iconCar
            return (
              <View key={i} className="transport-item">
                <View className="transport-title-row">
                  <Text className="transport-type">{item.title}</Text>
                </View>
                <Text className="transport-desc">{item.description}</Text>
              </View>
            )
          })}
        </View>
      )}

      {/* 当地天气 */}
      {activeHotel.weather && (
        <View className="weather-card">
          <View className="weather-header">
            <Image src={iconCloud} className="section-icon" mode="aspectFit" />
            <Text className="section-title">当地天气</Text>
          </View>
          <View className="weather-main">
            <Text className="weather-temp">{activeHotel.weather.temperature}°C</Text>
            <Text className="weather-condition">{activeHotel.weather.condition}</Text>
          </View>
          <View className="weather-details">
            <View className="weather-item">
              <Image src={iconDroplets} className="weather-icon" mode="aspectFit" />
              <Text className="weather-label">湿度</Text>
              <Text className="weather-value">{activeHotel.weather.humidity}%</Text>
            </View>
            <View className="weather-item">
              <Image src={iconWind} className="weather-icon" mode="aspectFit" />
              <Text className="weather-label">风速</Text>
              <Text className="weather-value">{activeHotel.weather.wind_speed}km/h</Text>
            </View>
            <View className="weather-item">
              <Image src={iconEye} className="weather-icon" mode="aspectFit" />
              <Text className="weather-label">能见度</Text>
              <Text className="weather-value">{activeHotel.weather.visibility}km</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default HotelTab
