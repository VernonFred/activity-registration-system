import { Button, Col, Input, InputNumber, Row, Space } from 'antd'
import SectionCard from '../../../components/SectionCard'
import type { ActivityCreateFormState, HotelConfig, HotelRoomType } from '../types'
import { createEmptyHotel } from '../types'

type Props = {
  state: ActivityCreateFormState
  onChange: (next: ActivityCreateFormState) => void
}

export default function HotelTab({ state, onChange }: Props) {
  const updateHotels = (hotels: HotelConfig[]) => {
    onChange({
      ...state,
      extra: {
        ...state.extra,
        hotels,
      },
    })
  }

  const updateHotel = (index: number, patch: Partial<HotelConfig>) => {
    const hotels = [...state.extra.hotels]
    hotels[index] = { ...hotels[index], ...patch }
    updateHotels(hotels)
  }

  const updateRoomType = (hotelIndex: number, roomIndex: number, patch: Partial<HotelRoomType>) => {
    const hotels = [...state.extra.hotels]
    const roomTypes = [...hotels[hotelIndex].room_types]
    roomTypes[roomIndex] = { ...roomTypes[roomIndex], ...patch }
    hotels[hotelIndex] = { ...hotels[hotelIndex], room_types: roomTypes }
    updateHotels(hotels)
  }

  const removeHotel = (index: number) => {
    const next = state.extra.hotels.filter((_, hotelIndex) => hotelIndex !== index)
    updateHotels(next.length ? next : [createEmptyHotel()])
  }

  const removeRoomType = (hotelIndex: number, roomIndex: number) => {
    const hotels = [...state.extra.hotels]
    const roomTypes = hotels[hotelIndex].room_types.filter((_, index) => index !== roomIndex)
    hotels[hotelIndex] = {
      ...hotels[hotelIndex],
      room_types: roomTypes.length ? roomTypes : createEmptyHotel().room_types,
    }
    updateHotels(hotels)
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {state.extra.hotels.map((hotel, hotelIndex) => (
        <SectionCard key={hotel.id || `hotel-${hotelIndex}`}>
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <div className="field-label">酒店 {hotelIndex + 1}</div>
              <Button danger onClick={() => removeHotel(hotelIndex)}>删除酒店</Button>
            </Space>
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <div className="field-label">酒店名称</div>
                <Input value={hotel.name} onChange={(e) => updateHotel(hotelIndex, { name: e.target.value })} placeholder="酒店名称" />
              </Col>
              <Col span={12}>
                <div className="field-label">标签</div>
                <Input value={hotel.tag} onChange={(e) => updateHotel(hotelIndex, { tag: e.target.value })} placeholder="例如：推荐酒店" />
              </Col>
              <Col span={12}>
                <div className="field-label">图片 URL</div>
                <Input value={hotel.image_url} onChange={(e) => updateHotel(hotelIndex, { image_url: e.target.value })} placeholder="酒店图片链接" />
              </Col>
              <Col span={12}>
                <div className="field-label">联系电话</div>
                <Input value={hotel.phone} onChange={(e) => updateHotel(hotelIndex, { phone: e.target.value })} placeholder="联系电话" />
              </Col>
              <Col span={24}>
                <div className="field-label">地址</div>
                <Input value={hotel.address} onChange={(e) => updateHotel(hotelIndex, { address: e.target.value })} placeholder="酒店地址" />
              </Col>
            </Row>

            <div className="activity-builder-card">
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <div className="field-label">房型配置</div>
                {hotel.room_types.map((roomType, roomIndex) => (
                  <div key={`hotel-room-${hotelIndex}-${roomIndex}`} className="activity-builder-subcard">
                    <Space direction="vertical" size={10} style={{ width: '100%' }}>
                      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <div className="field-label">房型 {roomIndex + 1}</div>
                        <Button danger type="text" onClick={() => removeRoomType(hotelIndex, roomIndex)}>删除房型</Button>
                      </Space>
                      <Row gutter={[12, 12]}>
                        <Col span={8}>
                          <Input value={roomType.name} onChange={(e) => updateRoomType(hotelIndex, roomIndex, { name: e.target.value })} placeholder="房型名称" />
                        </Col>
                        <Col span={8}>
                          <Input value={roomType.price} onChange={(e) => updateRoomType(hotelIndex, roomIndex, { price: e.target.value })} placeholder="价格" />
                        </Col>
                        <Col span={8}>
                          <Input value={roomType.description} onChange={(e) => updateRoomType(hotelIndex, roomIndex, { description: e.target.value })} placeholder="说明" />
                        </Col>
                      </Row>
                    </Space>
                  </div>
                ))}
                <Button onClick={() => updateHotel(hotelIndex, { room_types: [...hotel.room_types, { name: '', price: '', description: '' }] })}>新增房型</Button>
              </Space>
            </div>

            <Row gutter={[12, 12]}>
              <Col span={24}>
                <div className="field-label">预订说明</div>
                <Input.TextArea value={hotel.booking.notice} onChange={(e) => updateHotel(hotelIndex, { booking: { ...hotel.booking, notice: e.target.value } })} autoSize={{ minRows: 2, maxRows: 4 }} placeholder="预订说明" />
              </Col>
              <Col span={12}>
                <div className="field-label">预订联系人</div>
                <Input value={hotel.booking.contact_name} onChange={(e) => updateHotel(hotelIndex, { booking: { ...hotel.booking, contact_name: e.target.value } })} placeholder="联系人" />
              </Col>
              <Col span={12}>
                <div className="field-label">预订电话</div>
                <Input value={hotel.booking.contact_phone} onChange={(e) => updateHotel(hotelIndex, { booking: { ...hotel.booking, contact_phone: e.target.value } })} placeholder="联系电话" />
              </Col>
              <Col span={8}>
                <div className="field-label">地图纬度</div>
                <InputNumber style={{ width: '100%' }} value={hotel.map.lat} onChange={(value) => updateHotel(hotelIndex, { map: { ...hotel.map, lat: typeof value === 'number' ? value : undefined } })} />
              </Col>
              <Col span={8}>
                <div className="field-label">地图经度</div>
                <InputNumber style={{ width: '100%' }} value={hotel.map.lng} onChange={(value) => updateHotel(hotelIndex, { map: { ...hotel.map, lng: typeof value === 'number' ? value : undefined } })} />
              </Col>
              <Col span={8}>
                <div className="field-label">导航标签</div>
                <Input value={hotel.map.navigation_label} onChange={(e) => updateHotel(hotelIndex, { map: { ...hotel.map, navigation_label: e.target.value } })} placeholder="例如：导航前往酒店" />
              </Col>
              <Col span={24}>
                <div className="field-label">地图地址</div>
                <Input value={hotel.map.address} onChange={(e) => updateHotel(hotelIndex, { map: { ...hotel.map, address: e.target.value } })} placeholder="地图地址" />
              </Col>
              <Col span={8}>
                <div className="field-label">地铁</div>
                <Input value={hotel.transport.metro} onChange={(e) => updateHotel(hotelIndex, { transport: { ...hotel.transport, metro: e.target.value } })} placeholder="地铁指南" />
              </Col>
              <Col span={8}>
                <div className="field-label">公交</div>
                <Input value={hotel.transport.bus} onChange={(e) => updateHotel(hotelIndex, { transport: { ...hotel.transport, bus: e.target.value } })} placeholder="公交指南" />
              </Col>
              <Col span={8}>
                <div className="field-label">自驾</div>
                <Input value={hotel.transport.drive} onChange={(e) => updateHotel(hotelIndex, { transport: { ...hotel.transport, drive: e.target.value } })} placeholder="自驾指南" />
              </Col>
              <Col span={6}>
                <div className="field-label">温度</div>
                <Input value={hotel.weather.temperature} onChange={(e) => updateHotel(hotelIndex, { weather: { ...hotel.weather, temperature: e.target.value } })} placeholder="温度" />
              </Col>
              <Col span={6}>
                <div className="field-label">湿度</div>
                <Input value={hotel.weather.humidity} onChange={(e) => updateHotel(hotelIndex, { weather: { ...hotel.weather, humidity: e.target.value } })} placeholder="湿度" />
              </Col>
              <Col span={6}>
                <div className="field-label">风速</div>
                <Input value={hotel.weather.wind_speed} onChange={(e) => updateHotel(hotelIndex, { weather: { ...hotel.weather, wind_speed: e.target.value } })} placeholder="风速" />
              </Col>
              <Col span={6}>
                <div className="field-label">能见度</div>
                <Input value={hotel.weather.visibility} onChange={(e) => updateHotel(hotelIndex, { weather: { ...hotel.weather, visibility: e.target.value } })} placeholder="能见度" />
              </Col>
            </Row>
          </Space>
        </SectionCard>
      ))}

      <Button type="dashed" onClick={() => updateHotels([...state.extra.hotels, createEmptyHotel()])}>新增酒店</Button>
    </div>
  )
}
