import type { ActivityStatus } from '../../services/activities'

export type ActivityBasePayload = {
  title: string
  subtitle?: string
  category?: string
  tags?: string[]
  cover_image_url?: string
  banner_image_url?: string
  city?: string
  location?: string
  location_detail?: string
  contact_name?: string
  contact_phone?: string
  contact_email?: string
  description?: string
  start_time?: string
  end_time?: string
  signup_start_time?: string
  signup_end_time?: string
  checkin_start_time?: string
  checkin_end_time?: string
  max_participants?: number
  approval_required: boolean
  require_payment: boolean
  allow_feedback: boolean
  allow_waitlist: boolean
  group_qr_image_url?: string
  status: ActivityStatus
}

export type ActivityAgendaModerator = {
  name: string
  title?: string
}

export type ActivityAgendaSpeaker = {
  name: string
  title?: string
  avatar?: string
}

export type ActivityAgendaEntry = {
  id: string
  time_start: string
  time_end: string
  type: 'speech' | 'break' | 'discussion' | 'activity' | string
  title: string
  speaker?: ActivityAgendaSpeaker
  location?: string
  description?: string
  tag?: string
}

export type ActivityAgendaGroup = {
  id: string
  title: string
  time_start?: string
  time_end?: string
  moderator?: ActivityAgendaModerator
  items: ActivityAgendaEntry[]
}

export type ActivityAgendaDay = {
  id: string
  display_date: string
  date?: string
  groups: ActivityAgendaGroup[]
}

export type HotelFacility = {
  icon: string
  label: string
}

export type HotelTransportInfo = {
  type: 'subway' | 'bus' | 'drive'
  title: string
  description: string
}

export type HotelWeatherInfo = {
  temperature?: number
  condition?: string
  humidity?: number
  wind_speed?: number
  visibility?: number
}

export type HotelConfig = {
  id: string
  name: string
  logo?: string
  image?: string
  room_type?: string
  price?: number
  price_note?: string
  booking_tip?: string
  contact_name?: string
  contact_phone?: string
  facilities: HotelFacility[]
  address?: string
  lat?: number
  lng?: number
  map_image?: string
  map_url?: string
  transport: HotelTransportInfo[]
  weather: HotelWeatherInfo
}

export type ActivityExtraConfig = {
  overview: {
    show_signup_count: boolean
    map: {
      enabled: boolean
      address?: string
      lat?: number
      lng?: number
      label?: string
    }
  }
  agenda_blocks: ActivityAgendaDay[]
  hotels: HotelConfig[]
  signup_config: {
    payment: {
      enabled: boolean
      qr_image_url?: string
      invoice_enabled: boolean
      receipt_required: boolean
    }
    accommodation: {
      enabled: boolean
      hotel_options: string[]
      room_intents: string[]
      occupancy_options: string[]
    }
    transport: {
      enabled: boolean
      note?: string
      pickup_points: string[]
      dropoff_points: string[]
    }
  }
}

export type ActivityMaterials = {
  live: {
    enabled: boolean
    cover_image_url?: string
    action_type: 'link' | 'qrcode'
    action_url?: string
    button_text?: string
    qrcode_image_url?: string
  }
}

export type ActivityCreateFormState = {
  base: ActivityBasePayload
  agendaSummary: string
  extra: ActivityExtraConfig
  materials: ActivityMaterials
}

export type FormFieldSummary = {
  count: number
  requiredCount: number
}

function createAgendaNodeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createEmptyAgendaEntry(): ActivityAgendaEntry {
  return {
    id: createAgendaNodeId(),
    time_start: '',
    time_end: '',
    type: 'speech',
    title: '',
    speaker: {
      name: '',
      title: '',
      avatar: '',
    },
    location: '',
    description: '',
    tag: '',
  }
}

export function createEmptyAgendaGroup(): ActivityAgendaGroup {
  return {
    id: createAgendaNodeId(),
    title: '',
    time_start: '',
    time_end: '',
    moderator: {
      name: '',
      title: '',
    },
    items: [createEmptyAgendaEntry()],
  }
}

export function createEmptyAgendaDay(): ActivityAgendaDay {
  return {
    id: createAgendaNodeId(),
    display_date: '',
    date: '',
    groups: [createEmptyAgendaGroup()],
  }
}

export function createEmptyHotel(): HotelConfig {
  return {
    id: String(Date.now()),
    name: '',
    logo: '',
    image: '',
    room_type: '',
    price: undefined,
    price_note: '',
    booking_tip: '',
    contact_name: '',
    contact_phone: '',
    facilities: [],
    address: '',
    lat: undefined,
    lng: undefined,
    map_image: '',
    map_url: '',
    transport: [],
    weather: {},
  }
}

export function createEmptyTransportInfo(): HotelTransportInfo {
  return { type: 'subway', title: '地铁', description: '' }
}

export function createDefaultActivityCreateFormState(): ActivityCreateFormState {
  return {
    base: {
      title: '',
      subtitle: '',
      category: '',
      tags: [],
      cover_image_url: '',
      banner_image_url: '',
      city: '',
      location: '',
      location_detail: '',
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      description: '',
      start_time: undefined,
      end_time: undefined,
      signup_start_time: undefined,
      signup_end_time: undefined,
      checkin_start_time: undefined,
      checkin_end_time: undefined,
      max_participants: undefined,
      approval_required: true,
      require_payment: false,
      allow_feedback: true,
      allow_waitlist: true,
      group_qr_image_url: '',
      status: 'draft',
    },
    agendaSummary: '',
    extra: {
      overview: {
        show_signup_count: true,
        map: {
          enabled: false,
          address: '',
          lat: undefined,
          lng: undefined,
          label: '',
        },
      },
      agenda_blocks: [createEmptyAgendaDay()],
      hotels: [createEmptyHotel()],
      signup_config: {
        payment: {
          enabled: false,
          qr_image_url: '',
          invoice_enabled: false,
          receipt_required: false,
        },
        accommodation: {
          enabled: false,
          hotel_options: [],
          room_intents: ['大床房', '标准间'],
          occupancy_options: ['单住', '合住'],
        },
        transport: {
          enabled: false,
          note: '',
          pickup_points: [],
          dropoff_points: [],
        },
      },
    },
    materials: {
      live: {
        enabled: false,
        cover_image_url: '',
        action_type: 'link',
        action_url: '',
        button_text: '查看直播',
        qrcode_image_url: '',
      },
    },
  }
}
