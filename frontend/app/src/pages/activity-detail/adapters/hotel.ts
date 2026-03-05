import type { Hotel, HotelFacility, TransportInfo, WeatherInfo } from '../types'

function toNumberId(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

function normalizeFacilities(rawFacilities: unknown): HotelFacility[] {
  if (!Array.isArray(rawFacilities)) return []
  return rawFacilities
    .map((facility) => {
      if (typeof facility === 'string') {
        const label = facility.trim()
        return label ? { icon: label, label } : null
      }
      if (facility && typeof facility === 'object') {
        const data = facility as Record<string, unknown>
        const icon = typeof data.icon === 'string' ? data.icon.trim() : ''
        const label = typeof data.label === 'string' ? data.label.trim() : ''
        if (!icon && !label) return null
        return { icon: icon || label, label: label || icon }
      }
      return null
    })
    .filter((facility): facility is HotelFacility => !!facility)
}

function normalizeTransport(rawTransport: unknown): TransportInfo[] {
  if (Array.isArray(rawTransport)) {
    return rawTransport
      .map((item) => {
        if (!item || typeof item !== 'object') return null
        const data = item as Record<string, unknown>
        const type = typeof data.type === 'string' ? data.type : ''
        const title = typeof data.title === 'string' ? data.title : ''
        const description = typeof data.description === 'string' ? data.description : ''
        if (!type && !title && !description) return null
        const normalizedType = type === 'subway' || type === 'bus' || type === 'drive' ? type : 'drive'
        return {
          type: normalizedType,
          title: title || (normalizedType === 'subway' ? '地铁' : normalizedType === 'bus' ? '公交' : '自驾'),
          description,
        } as TransportInfo
      })
      .filter((item): item is TransportInfo => !!item)
  }

  if (rawTransport && typeof rawTransport === 'object') {
    const data = rawTransport as Record<string, unknown>
    const list: TransportInfo[] = []
    if (typeof data.metro === 'string' && data.metro.trim()) {
      list.push({ type: 'subway', title: '地铁', description: data.metro.trim() })
    }
    if (typeof data.bus === 'string' && data.bus.trim()) {
      list.push({ type: 'bus', title: '公交', description: data.bus.trim() })
    }
    if (typeof data.drive === 'string' && data.drive.trim()) {
      list.push({ type: 'drive', title: '自驾', description: data.drive.trim() })
    }
    return list
  }

  return []
}

function normalizeWeather(rawWeather: unknown): WeatherInfo | undefined {
  if (!rawWeather || typeof rawWeather !== 'object') return undefined
  const data = rawWeather as Record<string, unknown>
  const condition = typeof data.condition === 'string' ? data.condition.trim() : ''
  const temperature = toNumber(data.temperature)
  const humidity = toNumber(data.humidity)
  const windSpeed = toNumber(data.wind_speed)
  const visibility = toNumber(data.visibility)

  if (!condition && temperature == null && humidity == null && windSpeed == null && visibility == null) {
    return undefined
  }

  return {
    condition: condition || '',
    temperature: temperature ?? 0,
    humidity: humidity ?? 0,
    wind_speed: windSpeed ?? 0,
    visibility: visibility ?? 0,
  }
}

function normalizeSingleHotel(raw: unknown, index: number): Hotel | null {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Record<string, any>

  let roomType = typeof data.room_type === 'string' ? data.room_type : ''
  let price = toNumber(data.price)
  if ((!roomType || price == null) && Array.isArray(data.room_types) && data.room_types.length > 0) {
    const first = data.room_types[0] || {}
    if (!roomType && typeof first.name === 'string') roomType = first.name
    if (price == null) price = toNumber(first.price)
  }

  let mapImage = typeof data.map_image === 'string' ? data.map_image : ''
  let mapUrl = typeof data.map_url === 'string' ? data.map_url : ''
  if ((!mapImage || !mapUrl) && data.map && typeof data.map === 'object') {
    if (!mapImage && typeof data.map.image === 'string') mapImage = data.map.image
    if (!mapUrl && typeof data.map.url === 'string') mapUrl = data.map.url
  }

  const booking = data.booking && typeof data.booking === 'object' ? data.booking : {}
  const hotel: Hotel = {
    id: toNumberId(data.id, index + 1),
    name: typeof data.name === 'string' ? data.name : '',
    logo: typeof data.logo === 'string' ? data.logo : '',
    image: typeof data.image === 'string' ? data.image : (typeof data.image_url === 'string' ? data.image_url : ''),
    room_type: roomType || '',
    price: price ?? 0,
    price_note: typeof data.price_note === 'string' ? data.price_note : '',
    booking_tip: typeof data.booking_tip === 'string' ? data.booking_tip : (typeof booking.notice === 'string' ? booking.notice : ''),
    contact_name: typeof data.contact_name === 'string' ? data.contact_name : (typeof booking.contact_name === 'string' ? booking.contact_name : ''),
    contact_phone: typeof data.contact_phone === 'string'
      ? data.contact_phone
      : (typeof data.phone === 'string' ? data.phone : (typeof booking.contact_phone === 'string' ? booking.contact_phone : '')),
    facilities: normalizeFacilities(data.facilities),
    address: typeof data.address === 'string' ? data.address : (typeof data.location === 'string' ? data.location : ''),
    map_url: mapUrl || '',
    map_image: mapImage || '',
    transport: normalizeTransport(data.transport),
    weather: normalizeWeather(data.weather),
  }

  return hotel
}

export function normalizeHotelsFromDetail(detail: any): Hotel[] {
  const rawHotels = Array.isArray(detail?.extra?.hotels)
    ? detail.extra.hotels
    : (Array.isArray(detail?.hotels) ? detail.hotels : [])

  return rawHotels
    .map((hotel: unknown, index: number) => normalizeSingleHotel(hotel, index))
    .filter((hotel): hotel is Hotel => !!hotel)
}
