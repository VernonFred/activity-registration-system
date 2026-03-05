import { Button, Checkbox, Input, InputNumber, Select, Spin, message } from 'antd'
import { useCallback, useState } from 'react'
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
import ImageUploader from '../../../components/ImageUploader'
import SectionCard from '../../../components/SectionCard'
import type {
  ActivityCreateFormState,
  HotelConfig,
  HotelFacility,
  HotelTransportInfo,
  HotelWeatherInfo,
} from '../types'
import { createEmptyHotel, createEmptyTransportInfo } from '../types'

type Props = {
  state: ActivityCreateFormState
  onChange: (next: ActivityCreateFormState) => void
}

const FACILITY_PRESETS: { icon: string; label: string }[] = [
  { icon: 'wifi', label: '免费WiFi' },
  { icon: 'coffee', label: '咖啡厅' },
  { icon: 'restaurant', label: '餐厅' },
  { icon: 'parking', label: '免费停车' },
  { icon: 'laundry', label: '洗衣房' },
  { icon: 'meeting', label: '会议厅' },
]

const TRANSPORT_TYPE_OPTIONS = [
  { label: '地铁', value: 'subway' },
  { label: '公交', value: 'bus' },
  { label: '自驾', value: 'drive' },
] as const

const TRANSPORT_TYPE_TITLES: Record<string, string> = {
  subway: '地铁',
  bus: '公交',
  drive: '自驾',
}

const TRANSPORT_ICONS: Record<string, typeof TrainFront> = {
  subway: TrainFront,
  bus: Bus,
  drive: Car,
}

/** Build a Tencent Map static image URL from lat/lng */
function buildStaticMapUrl(lat: number, lng: number): string {
  const key = import.meta.env.VITE_TENCENT_MAP_KEY
  if (!key) return ''
  return `https://apis.map.qq.com/ws/staticmap/v2/?key=${key}&center=${lat},${lng}&zoom=15&size=600*300&markers=color:red|${lat},${lng}`
}

/** Build Tencent Map navigation URL */
function buildMapNavUrl(lat: number, lng: number, name?: string): string {
  const key = import.meta.env.VITE_TENCENT_MAP_KEY
  const to = encodeURIComponent(name || '目的地')
  return `https://apis.map.qq.com/uri/v1/routeplan?type=drive&tocoord=${lat},${lng}&to=${to}&referer=${key || 'activity-admin'}`
}

/** Geocode address → { lat, lng } via Tencent Maps JSONP */
function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const key = import.meta.env.VITE_TENCENT_MAP_KEY
  if (!key || !address.trim()) return Promise.resolve(null)

  return new Promise((resolve) => {
    const cbName = `_qqmaps_geocode_${Date.now()}`
    const script = document.createElement('script')
    const timeout = setTimeout(() => {
      cleanup()
      resolve(null)
    }, 8000)

    function cleanup() {
      clearTimeout(timeout)
      delete (window as any)[cbName]
      script.remove()
    }

    ;(window as any)[cbName] = (data: any) => {
      cleanup()
      if (data?.status === 0 && data.result?.location) {
        resolve({ lat: data.result.location.lat, lng: data.result.location.lng })
      } else {
        resolve(null)
      }
    }

    script.src = `https://apis.map.qq.com/ws/geocoder/v1/?address=${encodeURIComponent(address)}&key=${key}&output=jsonp&callback=${cbName}`
    document.head.appendChild(script)
  })
}

/** Fetch weather from 和风天气 API */
async function fetchWeatherByLocation(lat: number, lng: number): Promise<HotelWeatherInfo | null> {
  const key = import.meta.env.VITE_QWEATHER_KEY
  if (!key) return null
  try {
    const url = `https://devapi.qweather.com/v7/weather/now?key=${key}&location=${lng.toFixed(2)},${lat.toFixed(2)}`
    const resp = await fetch(url)
    const data = await resp.json()
    if (data.code !== '200' || !data.now) return null
    return {
      temperature: Number(data.now.temp) || undefined,
      condition: data.now.text || '',
      humidity: Number(data.now.humidity) || undefined,
      wind_speed: Number(data.now.windSpeed) || undefined,
      visibility: Number(data.now.vis) || undefined,
    }
  } catch {
    return null
  }
}

export default function HotelTab({ state, onChange }: Props) {
  const [geocoding, setGeocoding] = useState<Record<number, boolean>>({})
  const [weatherLoading, setWeatherLoading] = useState<Record<number, boolean>>({})

  const updateHotels = (hotels: HotelConfig[]) => {
    onChange({ ...state, extra: { ...state.extra, hotels } })
  }

  const updateHotel = (index: number, patch: Partial<HotelConfig>) => {
    const hotels = [...state.extra.hotels]
    hotels[index] = { ...hotels[index], ...patch }
    updateHotels(hotels)
  }

  const removeHotel = (index: number) => {
    const next = state.extra.hotels.filter((_, i) => i !== index)
    updateHotels(next.length ? next : [createEmptyHotel()])
  }

  const updateTransport = (hotelIndex: number, transportIndex: number, patch: Partial<HotelTransportInfo>) => {
    const hotels = [...state.extra.hotels]
    const transport = [...hotels[hotelIndex].transport]
    transport[transportIndex] = { ...transport[transportIndex], ...patch }
    hotels[hotelIndex] = { ...hotels[hotelIndex], transport }
    updateHotels(hotels)
  }

  const removeTransport = (hotelIndex: number, transportIndex: number) => {
    const hotels = [...state.extra.hotels]
    const transport = hotels[hotelIndex].transport.filter((_, i) => i !== transportIndex)
    hotels[hotelIndex] = { ...hotels[hotelIndex], transport }
    updateHotels(hotels)
  }

  const toggleFacility = (hotelIndex: number, preset: { icon: string; label: string }) => {
    const hotel = state.extra.hotels[hotelIndex]
    const exists = hotel.facilities.some((f) => f.icon === preset.icon)
    const facilities = exists
      ? hotel.facilities.filter((f) => f.icon !== preset.icon)
      : [...hotel.facilities, preset]
    updateHotel(hotelIndex, { facilities })
  }

  /** Apply lat/lng and auto-generate map + fetch weather */
  const applyLatLng = useCallback((hotelIndex: number, lat: number, lng: number, extraPatch?: Partial<HotelConfig>) => {
    const hotel = state.extra.hotels[hotelIndex]
    const patch: Partial<HotelConfig> = { lat, lng, ...extraPatch }

    const imgUrl = buildStaticMapUrl(lat, lng)
    if (imgUrl) patch.map_image = imgUrl
    patch.map_url = buildMapNavUrl(lat, lng, hotel.name || hotel.address)

    updateHotel(hotelIndex, patch)

    // Auto-fetch weather
    const qweatherKey = import.meta.env.VITE_QWEATHER_KEY
    if (qweatherKey) {
      setWeatherLoading((prev) => ({ ...prev, [hotelIndex]: true }))
      fetchWeatherByLocation(lat, lng).then((weather) => {
        if (weather) {
          const hotels = [...state.extra.hotels]
          hotels[hotelIndex] = { ...hotels[hotelIndex], ...patch, weather }
          onChange({ ...state, extra: { ...state.extra, hotels } })
        }
        setWeatherLoading((prev) => ({ ...prev, [hotelIndex]: false }))
      })
    }
  }, [state.extra.hotels])

  /** Geocode hotel address → auto-fill lat/lng + map + weather */
  const handleGeocode = useCallback(async (hotelIndex: number) => {
    const hotel = state.extra.hotels[hotelIndex]
    const address = [hotel.address, hotel.name].filter(Boolean).join(' ')
    if (!address.trim()) {
      message.warning('请先填写酒店名称或地址')
      return
    }

    const mapKey = import.meta.env.VITE_TENCENT_MAP_KEY
    if (!mapKey) {
      message.warning('腾讯地图 API Key 未配置（.env 中 VITE_TENCENT_MAP_KEY）')
      return
    }

    setGeocoding((prev) => ({ ...prev, [hotelIndex]: true }))
    const result = await geocodeAddress(address)
    setGeocoding((prev) => ({ ...prev, [hotelIndex]: false }))

    if (result) {
      applyLatLng(hotelIndex, result.lat, result.lng)
      message.success('已定位到地址坐标')
    } else {
      message.error('地址解析失败，请检查地址是否完整（建议包含城市名）')
    }
  }, [state.extra.hotels, applyLatLng])

  /** Manual lat/lng change — also triggers map + weather refresh */
  const handleLatLngChange = useCallback((hotelIndex: number, field: 'lat' | 'lng', value: number | null) => {
    const hotel = state.extra.hotels[hotelIndex]
    const newLat = field === 'lat' ? value ?? undefined : hotel.lat
    const newLng = field === 'lng' ? value ?? undefined : hotel.lng
    const patch: Partial<HotelConfig> = { [field]: value ?? undefined }

    if (typeof newLat === 'number' && typeof newLng === 'number' && Number.isFinite(newLat) && Number.isFinite(newLng)) {
      const imgUrl = buildStaticMapUrl(newLat, newLng)
      if (imgUrl) patch.map_image = imgUrl
      patch.map_url = buildMapNavUrl(newLat, newLng, hotel.name || hotel.address)
    }

    updateHotel(hotelIndex, patch)
  }, [state.extra.hotels])

  /** Manual weather refresh */
  const handleFetchWeather = useCallback(async (hotelIndex: number) => {
    const hotel = state.extra.hotels[hotelIndex]
    if (typeof hotel.lat !== 'number' || typeof hotel.lng !== 'number') {
      message.warning('请先定位酒店地址获取经纬度')
      return
    }

    setWeatherLoading((prev) => ({ ...prev, [hotelIndex]: true }))
    const weather = await fetchWeatherByLocation(hotel.lat, hotel.lng)
    setWeatherLoading((prev) => ({ ...prev, [hotelIndex]: false }))

    if (weather) {
      updateHotel(hotelIndex, { weather })
      message.success('天气信息已更新')
    } else {
      message.error('获取天气失败，请检查 API 配置')
    }
  }, [state.extra.hotels])

  return (
    <div className="hotel-tab">
      {state.extra.hotels.map((hotel, hotelIndex) => (
        <SectionCard key={hotel.id || `hotel-${hotelIndex}`}>
          {/* ---- Hotel header ---- */}
          <div className="hotel-tab__hotel-header">
            <div className="hotel-tab__hotel-title">
              <Building2 size={15} />
              <span>酒店 {hotelIndex + 1}</span>
            </div>
            <Button type="text" danger size="small" icon={<Trash2 size={13} />} onClick={() => removeHotel(hotelIndex)}>
              删除
            </Button>
          </div>

          {/* ---- Section 1: Basic Info ---- */}
          <div className="hotel-tab__section">
            <div className="hotel-tab__section-title">
              <Star size={13} />
              <span>基本信息</span>
            </div>
            <div className="hotel-tab__fields-2col">
              <div>
                <div className="field-label">酒店名称</div>
                <Input
                  value={hotel.name}
                  onChange={(e) => updateHotel(hotelIndex, { name: e.target.value })}
                  placeholder="酒店名称"
                />
              </div>
              <div>
                <div className="field-label">酒店地址</div>
                <Input
                  value={hotel.address}
                  onChange={(e) => updateHotel(hotelIndex, { address: e.target.value })}
                  placeholder="详细地址"
                />
              </div>
            </div>
            <div>
              <div className="field-label">酒店图片</div>
              <div className="hotel-tab__dropzone">
                <ImageUploader
                  value={hotel.image}
                  onChange={(url) => updateHotel(hotelIndex, { image: url })}
                />
              </div>
            </div>
            <div>
              <div className="field-label">设施配置</div>
              <div className="hotel-tab__facilities-grid">
                {FACILITY_PRESETS.map((preset) => (
                  <Checkbox
                    key={preset.icon}
                    checked={hotel.facilities.some((f) => f.icon === preset.icon)}
                    onChange={() => toggleFacility(hotelIndex, preset)}
                  >
                    {preset.label}
                  </Checkbox>
                ))}
              </div>
            </div>
          </div>

          {/* ---- Section 2: Room & Price ---- */}
          <div className="hotel-tab__section">
            <div className="hotel-tab__section-title">
              <Building2 size={13} />
              <span>房型与价格</span>
            </div>
            <div className="hotel-tab__fields-3col">
              <div>
                <div className="field-label">房型名称</div>
                <Input
                  value={hotel.room_type}
                  onChange={(e) => updateHotel(hotelIndex, { room_type: e.target.value })}
                  placeholder="例如：商务标准间"
                />
              </div>
              <div>
                <div className="field-label">价格（元/晚）</div>
                <InputNumber
                  style={{ width: '100%' }}
                  value={hotel.price}
                  onChange={(value) => updateHotel(hotelIndex, { price: typeof value === 'number' ? value : undefined })}
                  placeholder="例如：328"
                  min={0}
                />
              </div>
              <div>
                <div className="field-label">价格备注</div>
                <Input
                  value={hotel.price_note}
                  onChange={(e) => updateHotel(hotelIndex, { price_note: e.target.value })}
                  placeholder="例如：单双同价、含早餐"
                />
              </div>
            </div>
          </div>

          {/* ---- Section 3: Booking & Contact ---- */}
          <div className="hotel-tab__section">
            <div className="hotel-tab__section-title">
              <Phone size={13} />
              <span>预订与联系</span>
            </div>
            <div>
              <div className="field-label">预订说明</div>
              <Input.TextArea
                value={hotel.booking_tip}
                onChange={(e) => updateHotel(hotelIndex, { booking_tip: e.target.value })}
                placeholder="例如：预订时请报公司名称享受优惠价格"
                autoSize={{ minRows: 2, maxRows: 4 }}
              />
            </div>
            <div className="hotel-tab__fields-2col">
              <div>
                <div className="field-label">联系人</div>
                <Input
                  value={hotel.contact_name}
                  onChange={(e) => updateHotel(hotelIndex, { contact_name: e.target.value })}
                  placeholder="联系人姓名"
                />
              </div>
              <div>
                <div className="field-label">联系电话</div>
                <Input
                  value={hotel.contact_phone}
                  onChange={(e) => updateHotel(hotelIndex, { contact_phone: e.target.value })}
                  placeholder="联系电话"
                />
              </div>
            </div>
          </div>

          {/* ---- Section 4: Location Map (腾讯地图静态图) ---- */}
          <div className="hotel-tab__section">
            <div className="hotel-tab__section-title">
              <MapPin size={13} />
              <span>位置地图</span>
              <Button
                type="link"
                size="small"
                icon={geocoding[hotelIndex] ? <Spin size="small" /> : <Crosshair size={12} />}
                onClick={() => handleGeocode(hotelIndex)}
                disabled={geocoding[hotelIndex]}
                style={{ marginLeft: 'auto', padding: 0, height: 'auto' }}
              >
                {geocoding[hotelIndex] ? '定位中...' : '根据地址自动定位'}
              </Button>
            </div>

            {/* Map preview — click to open navigation */}
            {hotel.map_image && (
              <div className="hotel-tab__map-preview">
                {hotel.map_url ? (
                  <a href={hotel.map_url} target="_blank" rel="noopener noreferrer" title="点击打开腾讯地图导航">
                    <img
                      src={hotel.map_image}
                      alt="地图预览（点击导航）"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                    <div className="hotel-tab__map-nav-hint">点击打开腾讯地图导航</div>
                  </a>
                ) : (
                  <img
                    src={hotel.map_image}
                    alt="地图预览"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                )}
              </div>
            )}

            {!hotel.map_image && (
              <div className="hotel-tab__map-placeholder">
                <MapPin size={20} style={{ opacity: 0.3 }} />
                <span>填写酒店名称和地址后，点击「根据地址自动定位」生成地图</span>
              </div>
            )}

            <div className="hotel-tab__fields-2col">
              <div>
                <div className="field-label">纬度 (lat)</div>
                <InputNumber
                  style={{ width: '100%' }}
                  value={hotel.lat}
                  onChange={(value) => handleLatLngChange(hotelIndex, 'lat', value)}
                  placeholder="自动填入或手动输入"
                  step={0.000001}
                  precision={6}
                />
              </div>
              <div>
                <div className="field-label">经度 (lng)</div>
                <InputNumber
                  style={{ width: '100%' }}
                  value={hotel.lng}
                  onChange={(value) => handleLatLngChange(hotelIndex, 'lng', value)}
                  placeholder="自动填入或手动输入"
                  step={0.000001}
                  precision={6}
                />
              </div>
            </div>
          </div>

          {/* ---- Section 6: Transport ---- */}
          <div className="hotel-tab__section">
            <div className="hotel-tab__section-title">
              <Car size={13} />
              <span>交通指南</span>
            </div>
            {hotel.transport.map((item, transportIndex) => {
              const Icon = TRANSPORT_ICONS[item.type] || Car
              return (
                <div key={`transport-${hotelIndex}-${transportIndex}`} className="hotel-tab__transport-item">
                  <div className="hotel-tab__transport-header">
                    <div className="hotel-tab__transport-badge">
                      <Icon size={12} />
                      <span>{TRANSPORT_TYPE_TITLES[item.type] || item.title}</span>
                    </div>
                    <Button type="text" danger size="small" onClick={() => removeTransport(hotelIndex, transportIndex)}>
                      删除
                    </Button>
                  </div>
                  <div className="hotel-tab__fields-2col">
                    <div>
                      <div className="field-label">类型</div>
                      <Select
                        style={{ width: '100%' }}
                        value={item.type}
                        onChange={(value) => updateTransport(hotelIndex, transportIndex, {
                          type: value as HotelTransportInfo['type'],
                          title: TRANSPORT_TYPE_TITLES[value] || item.title,
                        })}
                        options={TRANSPORT_TYPE_OPTIONS as any}
                      />
                    </div>
                    <div>
                      <div className="field-label">描述</div>
                      <Input
                        value={item.description}
                        onChange={(e) => updateTransport(hotelIndex, transportIndex, { description: e.target.value })}
                        placeholder="例如：地铁2号线 世纪大道站 3号出口"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
            <Button
              type="dashed"
              size="small"
              icon={<Plus size={13} />}
              onClick={() => updateHotel(hotelIndex, { transport: [...hotel.transport, createEmptyTransportInfo()] })}
            >
              新增交通方式
            </Button>
          </div>

          {/* ---- Section 7: Weather (和风天气 API — 只读) ---- */}
          <div className="hotel-tab__section">
            <div className="hotel-tab__section-title">
              <CloudSun size={13} />
              <span>当地天气</span>
              {typeof hotel.lat === 'number' && typeof hotel.lng === 'number' && (
                <Button
                  type="link"
                  size="small"
                  icon={weatherLoading[hotelIndex] ? <Spin size="small" /> : <RefreshCw size={12} />}
                  onClick={() => handleFetchWeather(hotelIndex)}
                  disabled={weatherLoading[hotelIndex]}
                  style={{ marginLeft: 'auto', padding: 0, height: 'auto' }}
                >
                  {weatherLoading[hotelIndex] ? '获取中...' : '刷新天气'}
                </Button>
              )}
            </div>
            {hotel.weather.condition || hotel.weather.temperature != null ? (
              <div className="hotel-tab__weather-card">
                {hotel.weather.condition && (
                  <div className="hotel-tab__weather-item">
                    <CloudSun size={14} />
                    <span>{hotel.weather.condition}</span>
                  </div>
                )}
                {hotel.weather.temperature != null && (
                  <div className="hotel-tab__weather-item">
                    <Thermometer size={14} />
                    <span>{hotel.weather.temperature}°C</span>
                  </div>
                )}
                {hotel.weather.humidity != null && (
                  <div className="hotel-tab__weather-item">
                    <Droplets size={14} />
                    <span>湿度 {hotel.weather.humidity}%</span>
                  </div>
                )}
                {hotel.weather.wind_speed != null && (
                  <div className="hotel-tab__weather-item">
                    <Wind size={14} />
                    <span>风速 {hotel.weather.wind_speed} km/h</span>
                  </div>
                )}
                {hotel.weather.visibility != null && (
                  <div className="hotel-tab__weather-item">
                    <Eye size={14} />
                    <span>能见度 {hotel.weather.visibility} km</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="hotel-tab__weather-empty">
                定位酒店地址后自动获取当地天气信息
              </div>
            )}
          </div>
        </SectionCard>
      ))}

      <Button
        type="dashed"
        block
        icon={<Plus size={14} />}
        onClick={() => updateHotels([...state.extra.hotels, createEmptyHotel()])}
      >
        新增酒店
      </Button>
    </div>
  )
}
