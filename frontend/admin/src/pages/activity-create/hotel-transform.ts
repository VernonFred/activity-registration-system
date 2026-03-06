import { createEmptyHotel, type HotelConfig, type HotelTransportInfo, type HotelWeatherInfo } from './types'

function normalizeTransport(raw: any): HotelTransportInfo[] {
  if (Array.isArray(raw)) {
    return raw.map((item: any) => ({
      type: item?.type || 'subway',
      title: typeof item?.title === 'string' ? item.title : '',
      description: typeof item?.description === 'string' ? item.description : '',
    }))
  }
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const result: HotelTransportInfo[] = []
    if (raw.metro) result.push({ type: 'subway', title: '地铁', description: String(raw.metro) })
    if (raw.bus) result.push({ type: 'bus', title: '公交', description: String(raw.bus) })
    if (raw.drive) result.push({ type: 'drive', title: '自驾', description: String(raw.drive) })
    return result
  }
  return []
}

export function normalizeHotelConfig(hotel: any): HotelConfig {
  const empty = createEmptyHotel()

  let roomType = typeof hotel?.room_type === 'string' ? hotel.room_type : ''
  let price = typeof hotel?.price === 'number' ? hotel.price : undefined
  if (!roomType && Array.isArray(hotel?.room_types) && hotel.room_types.length > 0) {
    const first = hotel.room_types[0]
    roomType = typeof first?.name === 'string' ? first.name : ''
    const parsedPrice = Number(first?.price)
    if (Number.isFinite(parsedPrice) && parsedPrice > 0) price = parsedPrice
  }

  let mapImage = typeof hotel?.map_image === 'string' ? hotel.map_image : ''
  let mapUrl = typeof hotel?.map_url === 'string' ? hotel.map_url : ''
  if (!mapImage && hotel?.map && typeof hotel.map === 'object') {
    mapImage = typeof hotel.map.image === 'string' ? hotel.map.image : ''
    mapUrl = typeof hotel.map.url === 'string' ? hotel.map.url : ''
  }

  const rawWeather = hotel?.weather || {}
  const toNum = (v: any) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }

  let facilities = empty.facilities
  if (Array.isArray(hotel?.facilities)) {
    facilities = hotel.facilities.map((f: any) => {
      if (typeof f === 'string') return { icon: f, label: f }
      return { icon: f?.icon || '', label: f?.label || '' }
    })
  }

  return {
    id: typeof hotel?.id === 'string' || typeof hotel?.id === 'number' ? String(hotel.id) : empty.id,
    name: typeof hotel?.name === 'string' ? hotel.name : '',
    logo: typeof hotel?.logo === 'string' ? hotel.logo : '',
    image: typeof hotel?.image === 'string' ? hotel.image : (typeof hotel?.image_url === 'string' ? hotel.image_url : ''),
    room_type: roomType,
    price,
    price_note: typeof hotel?.price_note === 'string' ? hotel.price_note : '',
    booking_tip: typeof hotel?.booking_tip === 'string' ? hotel.booking_tip : (typeof hotel?.booking?.notice === 'string' ? hotel.booking.notice : ''),
    contact_name: typeof hotel?.contact_name === 'string' ? hotel.contact_name : (typeof hotel?.booking?.contact_name === 'string' ? hotel.booking.contact_name : ''),
    contact_phone: typeof hotel?.contact_phone === 'string' ? hotel.contact_phone : (typeof hotel?.booking?.contact_phone === 'string' ? hotel.booking.contact_phone : (typeof hotel?.phone === 'string' ? hotel.phone : '')),
    facilities,
    address: typeof hotel?.address === 'string' ? hotel.address : '',
    lat: toNum(hotel?.lat ?? hotel?.map?.lat),
    lng: toNum(hotel?.lng ?? hotel?.map?.lng),
    map_image: mapImage,
    map_url: mapUrl,
    transport: normalizeTransport(hotel?.transport),
    weather: {
      temperature: toNum(rawWeather.temperature),
      condition: typeof rawWeather.condition === 'string' ? rawWeather.condition : '',
      humidity: toNum(rawWeather.humidity),
      wind_speed: toNum(rawWeather.wind_speed),
      visibility: toNum(rawWeather.visibility),
    } as HotelWeatherInfo,
  }
}

export function normalizeHotels(raw: any) {
  return Array.isArray(raw) && raw.length
    ? raw.map((hotel: any) => normalizeHotelConfig(hotel))
    : [createEmptyHotel()]
}
