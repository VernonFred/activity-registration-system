/**
 * 酒店信息Tab组件 - Lovable 风格
 * 创建时间: 2025年12月9日
 */
import { View, Text, Image, ScrollView } from '@tarojs/components'
import type { Hotel } from '../types'

// 图标
import iconMapPin from '../../../assets/icons/map-pin.png'
import iconPhone from '../../../assets/icons/phone.png'

interface HotelTabProps {
  hotels: Hotel[]
  onCall: (phone: string) => void
  theme: string
}

const HotelTab: React.FC<HotelTabProps> = ({ hotels, onCall, theme }) => {
  return (
    <View className={`tab-content hotel theme-${theme}`}>
      {/* 酒店选择器 */}
      <ScrollView className="hotel-tabs" scrollX showScrollbar={false}>
        {hotels.map((hotel, index) => (
          <View key={hotel.id} className={`hotel-tab ${index === 0 ? 'active' : ''}`}>
            <Text className="tab-text">{hotel.name}</Text>
          </View>
        ))}
      </ScrollView>

      {/* 酒店详情 */}
      {hotels.slice(0, 1).map((hotel) => (
        <View key={hotel.id} className="hotel-detail">
          {/* 酒店卡片 */}
          <View className="hotel-card">
            <Image
              className="hotel-image"
              src={hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
              mode="aspectFill"
            />
            <View className="hotel-info">
                <Text className="hotel-name">{hotel.name}</Text>
              <View className="hotel-address">
                <Image src={iconMapPin} className="addr-icon" mode="aspectFit" />
                <Text className="addr-text">{hotel.address}</Text>
              </View>
            </View>
          </View>

          {/* 房型价格 */}
          <View className="room-card">
            <View className="room-info">
              <Text className="room-type">{hotel.room_type}</Text>
              <Text className="room-note">单双同价</Text>
            </View>
            <View className="room-price">
              <Text className="price-symbol">¥</Text>
              <Text className="price-amount">{hotel.price}</Text>
              <Text className="price-unit">/晚</Text>
            </View>
          </View>

          {/* 预订信息 */}
          <View className="booking-card">
            <View className="booking-item">
                <Text className="booking-label">预订说明</Text>
                <Text className="booking-text">{hotel.booking_tip}</Text>
            </View>
            <View className="booking-divider" />
            <View className="booking-item contact">
              <View className="contact-info">
                <Text className="booking-label">预定联系人</Text>
                <Text className="contact-name">{hotel.contact_name}</Text>
              </View>
              <View className="contact-phone" onClick={() => onCall(hotel.contact_phone || '')}>
                <Image src={iconPhone} className="phone-icon" mode="aspectFit" />
                <Text className="phone-text">{hotel.contact_phone}</Text>
              </View>
            </View>
          </View>

          {/* 设施列表 */}
          <View className="facilities-card">
            <Text className="section-title">酒店设施</Text>
            <View className="facilities-grid">
              {(hotel.facilities || []).map((f, i) => (
                <View key={i} className="facility-item">
                  <Text className="facility-text">{f}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 预订按钮 */}
          <View className="booking-button" onClick={() => onCall(hotel.contact_phone || '')}>
            <Text className="btn-text">拨打电话预定</Text>
          </View>
        </View>
      ))}
    </View>
  )
}

export default HotelTab
