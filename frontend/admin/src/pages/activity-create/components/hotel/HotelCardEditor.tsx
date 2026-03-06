import { Button, Checkbox, Input, InputNumber, Select, Spin } from 'antd'
import {
  Building2,
  Bus,
  Car,
  CloudSun,
  Crosshair,
  Droplets,
  Eye,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Star,
  Thermometer,
  Trash2,
  TrainFront,
  Wind,
} from 'lucide-react'
import ImageUploader from '../../../../components/ImageUploader'
import SectionCard from '../../../../components/SectionCard'
import type { HotelConfig, HotelFacility, HotelTransportInfo } from '../../types'

type FacilityPreset = { icon: string; label: string }

type Props = {
  hotel: HotelConfig
  hotelIndex: number
  facilities: readonly FacilityPreset[]
  geocoding: boolean
  weatherLoading: boolean
  transportOptions: readonly { label: string; value: 'subway' | 'bus' | 'drive' }[]
  transportTitles: Record<string, string>
  transportIcons: Record<string, typeof TrainFront>
  onRemove: () => void
  onUpdateHotel: (patch: Partial<HotelConfig>) => void
  onToggleFacility: (preset: FacilityPreset) => void
  onGeocode: () => void
  onLatLngChange: (field: 'lat' | 'lng', value: number | null) => void
  onUpdateTransport: (transportIndex: number, patch: Partial<HotelTransportInfo>) => void
  onRemoveTransport: (transportIndex: number) => void
  onAddTransport: () => void
  onFetchWeather: () => void
}

export default function HotelCardEditor({
  hotel,
  hotelIndex,
  facilities,
  geocoding,
  weatherLoading,
  transportOptions,
  transportTitles,
  transportIcons,
  onRemove,
  onUpdateHotel,
  onToggleFacility,
  onGeocode,
  onLatLngChange,
  onUpdateTransport,
  onRemoveTransport,
  onAddTransport,
  onFetchWeather,
}: Props) {
  return (
    <SectionCard>
      <div className="hotel-tab__hotel-header">
        <div className="hotel-tab__hotel-title">
          <Building2 size={15} />
          <span>酒店 {hotelIndex + 1}</span>
        </div>
        <Button type="text" danger size="small" icon={<Trash2 size={13} />} onClick={onRemove}>
          删除
        </Button>
      </div>

      <div className="hotel-tab__section">
        <div className="hotel-tab__section-title">
          <Star size={13} />
          <span>基本信息</span>
        </div>
        <div className="hotel-tab__fields-2col">
          <div>
            <div className="field-label">酒店名称</div>
            <Input value={hotel.name} onChange={(event) => onUpdateHotel({ name: event.target.value })} placeholder="酒店名称" />
          </div>
          <div>
            <div className="field-label">酒店地址</div>
            <Input value={hotel.address} onChange={(event) => onUpdateHotel({ address: event.target.value })} placeholder="详细地址" />
          </div>
        </div>
        <div>
          <div className="field-label">酒店图片</div>
          <div className="hotel-tab__dropzone">
            <ImageUploader value={hotel.image} onChange={(url) => onUpdateHotel({ image: url })} />
          </div>
        </div>
        <div>
          <div className="field-label">设施配置</div>
          <div className="hotel-tab__facilities-grid">
            {facilities.map((preset) => (
              <Checkbox key={preset.icon} checked={hotel.facilities.some((item) => item.icon === preset.icon)} onChange={() => onToggleFacility(preset)}>
                {preset.label}
              </Checkbox>
            ))}
          </div>
        </div>
      </div>

      <div className="hotel-tab__section">
        <div className="hotel-tab__section-title">
          <Building2 size={13} />
          <span>房型与价格</span>
        </div>
        <div className="hotel-tab__fields-3col">
          <div>
            <div className="field-label">房型名称</div>
            <Input value={hotel.room_type} onChange={(event) => onUpdateHotel({ room_type: event.target.value })} placeholder="例如：商务标准间" />
          </div>
          <div>
            <div className="field-label">价格（元/晚）</div>
            <InputNumber style={{ width: '100%' }} value={hotel.price} onChange={(value) => onUpdateHotel({ price: typeof value === 'number' ? value : undefined })} placeholder="例如：328" min={0} />
          </div>
          <div>
            <div className="field-label">价格备注</div>
            <Input value={hotel.price_note} onChange={(event) => onUpdateHotel({ price_note: event.target.value })} placeholder="例如：单双同价、含早餐" />
          </div>
        </div>
      </div>

      <div className="hotel-tab__section">
        <div className="hotel-tab__section-title">
          <Phone size={13} />
          <span>预订与联系</span>
        </div>
        <div>
          <div className="field-label">预订说明</div>
          <Input.TextArea value={hotel.booking_tip} onChange={(event) => onUpdateHotel({ booking_tip: event.target.value })} placeholder="例如：预订时请报公司名称享受优惠价格" autoSize={{ minRows: 2, maxRows: 4 }} />
        </div>
        <div className="hotel-tab__fields-2col">
          <div>
            <div className="field-label">联系人</div>
            <Input value={hotel.contact_name} onChange={(event) => onUpdateHotel({ contact_name: event.target.value })} placeholder="联系人姓名" />
          </div>
          <div>
            <div className="field-label">联系电话</div>
            <Input value={hotel.contact_phone} onChange={(event) => onUpdateHotel({ contact_phone: event.target.value })} placeholder="联系电话" />
          </div>
        </div>
      </div>

      <div className="hotel-tab__section">
        <div className="hotel-tab__section-title">
          <MapPin size={13} />
          <span>位置地图</span>
          <Button
            type="link"
            size="small"
            icon={geocoding ? <Spin size="small" /> : <Crosshair size={12} />}
            onClick={onGeocode}
            disabled={geocoding}
            style={{ marginLeft: 'auto', padding: 0, height: 'auto' }}
          >
            {geocoding ? '定位中...' : '根据地址自动定位'}
          </Button>
        </div>

        {hotel.map_image ? (
          <div className="hotel-tab__map-preview">
            {hotel.map_url ? (
              <a href={hotel.map_url} target="_blank" rel="noopener noreferrer" title="点击打开腾讯地图导航">
                <img src={hotel.map_image} alt="地图预览（点击导航）" onError={(event) => { (event.target as HTMLImageElement).style.display = 'none' }} />
                <div className="hotel-tab__map-nav-hint">点击打开腾讯地图导航</div>
              </a>
            ) : (
              <img src={hotel.map_image} alt="地图预览" onError={(event) => { (event.target as HTMLImageElement).style.display = 'none' }} />
            )}
          </div>
        ) : (
          <div className="hotel-tab__map-placeholder">
            <MapPin size={20} style={{ opacity: 0.3 }} />
            <span>填写酒店名称和地址后，点击「根据地址自动定位」生成地图</span>
          </div>
        )}

        <div className="hotel-tab__fields-2col">
          <div>
            <div className="field-label">纬度 (lat)</div>
            <InputNumber style={{ width: '100%' }} value={hotel.lat} onChange={(value) => onLatLngChange('lat', value)} placeholder="自动填入或手动输入" step={0.000001} precision={6} />
          </div>
          <div>
            <div className="field-label">经度 (lng)</div>
            <InputNumber style={{ width: '100%' }} value={hotel.lng} onChange={(value) => onLatLngChange('lng', value)} placeholder="自动填入或手动输入" step={0.000001} precision={6} />
          </div>
        </div>
      </div>

      <div className="hotel-tab__section">
        <div className="hotel-tab__section-title">
          <Car size={13} />
          <span>交通指南</span>
        </div>
        {hotel.transport.map((item, transportIndex) => {
          const Icon = transportIcons[item.type] || Car
          return (
            <div key={`transport-${hotelIndex}-${transportIndex}`} className="hotel-tab__transport-item">
              <div className="hotel-tab__transport-header">
                <div className="hotel-tab__transport-badge">
                  <Icon size={12} />
                  <span>{transportTitles[item.type] || item.title}</span>
                </div>
                <Button type="text" danger size="small" onClick={() => onRemoveTransport(transportIndex)}>
                  删除
                </Button>
              </div>
              <div className="hotel-tab__fields-2col">
                <div>
                  <div className="field-label">类型</div>
                  <Select
                    style={{ width: '100%' }}
                    value={item.type}
                    onChange={(value) => onUpdateTransport(transportIndex, { type: value as HotelTransportInfo['type'], title: transportTitles[value] || item.title })}
                    options={transportOptions as any}
                  />
                </div>
                <div>
                  <div className="field-label">描述</div>
                  <Input value={item.description} onChange={(event) => onUpdateTransport(transportIndex, { description: event.target.value })} placeholder="例如：地铁2号线 世纪大道站 3号出口" />
                </div>
              </div>
            </div>
          )
        })}
        <Button type="dashed" size="small" icon={<Plus size={13} />} onClick={onAddTransport}>
          新增交通方式
        </Button>
      </div>

      <div className="hotel-tab__section">
        <div className="hotel-tab__section-title">
          <CloudSun size={13} />
          <span>当地天气</span>
          {typeof hotel.lat === 'number' && typeof hotel.lng === 'number' && (
            <Button
              type="link"
              size="small"
              icon={weatherLoading ? <Spin size="small" /> : <RefreshCw size={12} />}
              onClick={onFetchWeather}
              disabled={weatherLoading}
              style={{ marginLeft: 'auto', padding: 0, height: 'auto' }}
            >
              {weatherLoading ? '获取中...' : '刷新天气'}
            </Button>
          )}
        </div>
        {hotel.weather.condition || hotel.weather.temperature != null ? (
          <div className="hotel-tab__weather-card">
            {hotel.weather.condition && <div className="hotel-tab__weather-item"><CloudSun size={14} /><span>{hotel.weather.condition}</span></div>}
            {hotel.weather.temperature != null && <div className="hotel-tab__weather-item"><Thermometer size={14} /><span>{hotel.weather.temperature}°C</span></div>}
            {hotel.weather.humidity != null && <div className="hotel-tab__weather-item"><Droplets size={14} /><span>湿度 {hotel.weather.humidity}%</span></div>}
            {hotel.weather.wind_speed != null && <div className="hotel-tab__weather-item"><Wind size={14} /><span>风速 {hotel.weather.wind_speed} km/h</span></div>}
            {hotel.weather.visibility != null && <div className="hotel-tab__weather-item"><Eye size={14} /><span>能见度 {hotel.weather.visibility} km</span></div>}
          </div>
        ) : (
          <div className="hotel-tab__weather-empty">定位酒店地址后自动获取当地天气信息</div>
        )}
      </div>
    </SectionCard>
  )
}
