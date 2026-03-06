import { Button, message } from 'antd'
import { useCallback, useState } from 'react'
import { Bus, Car, Plus, TrainFront } from 'lucide-react'
import type { ActivityCreateFormState, HotelConfig, HotelTransportInfo, HotelWeatherInfo } from '../types'
import { createEmptyHotel, createEmptyTransportInfo } from '../types'
import HotelCardEditor from './hotel/HotelCardEditor'
import { buildMapNavUrl, buildStaticMapUrl, fetchWeatherByLocation, geocodeAddress } from './hotel/hotel-services'

type Props = {
  state: ActivityCreateFormState
  onChange: (next: ActivityCreateFormState) => void
}

const FACILITY_PRESETS = [
  { icon: 'wifi', label: '免费WiFi' },
  { icon: 'coffee', label: '咖啡厅' },
  { icon: 'restaurant', label: '餐厅' },
  { icon: 'parking', label: '免费停车' },
  { icon: 'laundry', label: '洗衣房' },
  { icon: 'meeting', label: '会议厅' },
] as const

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
    const next = state.extra.hotels.filter((_, hotelIndex) => hotelIndex !== index)
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
    hotels[hotelIndex] = {
      ...hotels[hotelIndex],
      transport: hotels[hotelIndex].transport.filter((_, index) => index !== transportIndex),
    }
    updateHotels(hotels)
  }

  const toggleFacility = (hotelIndex: number, preset: { icon: string; label: string }) => {
    const hotel = state.extra.hotels[hotelIndex]
    const exists = hotel.facilities.some((facility) => facility.icon === preset.icon)
    updateHotel(hotelIndex, {
      facilities: exists
        ? hotel.facilities.filter((facility) => facility.icon !== preset.icon)
        : [...hotel.facilities, preset],
    })
  }

  const applyLatLng = useCallback((hotelIndex: number, lat: number, lng: number, extraPatch?: Partial<HotelConfig>) => {
    const hotel = state.extra.hotels[hotelIndex]
    const patch: Partial<HotelConfig> = { lat, lng, ...extraPatch }
    const imageUrl = buildStaticMapUrl(lat, lng)
    if (imageUrl) patch.map_image = imageUrl
    patch.map_url = buildMapNavUrl(lat, lng, hotel.name || hotel.address)
    updateHotel(hotelIndex, patch)

    if (import.meta.env.VITE_QWEATHER_KEY) {
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
  }, [onChange, state])

  const handleGeocode = useCallback(async (hotelIndex: number) => {
    const hotel = state.extra.hotels[hotelIndex]
    const address = [hotel.address, hotel.name].filter(Boolean).join(' ')
    if (!address.trim()) {
      message.warning('请先填写酒店名称或地址')
      return
    }
    if (!import.meta.env.VITE_TENCENT_MAP_KEY) {
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
  }, [applyLatLng, state.extra.hotels])

  const handleLatLngChange = useCallback((hotelIndex: number, field: 'lat' | 'lng', value: number | null) => {
    const hotel = state.extra.hotels[hotelIndex]
    const newLat = field === 'lat' ? value ?? undefined : hotel.lat
    const newLng = field === 'lng' ? value ?? undefined : hotel.lng
    const patch: Partial<HotelConfig> = { [field]: value ?? undefined }

    if (typeof newLat === 'number' && typeof newLng === 'number' && Number.isFinite(newLat) && Number.isFinite(newLng)) {
      const imageUrl = buildStaticMapUrl(newLat, newLng)
      if (imageUrl) patch.map_image = imageUrl
      patch.map_url = buildMapNavUrl(newLat, newLng, hotel.name || hotel.address)
    }

    updateHotel(hotelIndex, patch)
  }, [state.extra.hotels])

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
      updateHotel(hotelIndex, { weather: weather as HotelWeatherInfo })
      message.success('天气信息已更新')
    } else {
      message.error('获取天气失败，请检查 API 配置')
    }
  }, [state.extra.hotels])

  return (
    <div className="hotel-tab">
      {state.extra.hotels.map((hotel, hotelIndex) => (
        <HotelCardEditor
          key={hotel.id || `hotel-${hotelIndex}`}
          hotel={hotel}
          hotelIndex={hotelIndex}
          facilities={FACILITY_PRESETS}
          geocoding={Boolean(geocoding[hotelIndex])}
          weatherLoading={Boolean(weatherLoading[hotelIndex])}
          transportOptions={TRANSPORT_TYPE_OPTIONS}
          transportTitles={TRANSPORT_TYPE_TITLES}
          transportIcons={TRANSPORT_ICONS}
          onRemove={() => removeHotel(hotelIndex)}
          onUpdateHotel={(patch) => updateHotel(hotelIndex, patch)}
          onToggleFacility={(preset) => toggleFacility(hotelIndex, preset)}
          onGeocode={() => void handleGeocode(hotelIndex)}
          onLatLngChange={(field, value) => handleLatLngChange(hotelIndex, field, value)}
          onUpdateTransport={(transportIndex, patch) => updateTransport(hotelIndex, transportIndex, patch)}
          onRemoveTransport={(transportIndex) => removeTransport(hotelIndex, transportIndex)}
          onAddTransport={() => updateHotel(hotelIndex, { transport: [...hotel.transport, createEmptyTransportInfo()] })}
          onFetchWeather={() => void handleFetchWeather(hotelIndex)}
        />
      ))}

      <Button type="dashed" block icon={<Plus size={14} />} onClick={() => updateHotels([...state.extra.hotels, createEmptyHotel()])}>
        新增酒店
      </Button>
    </div>
  )
}
