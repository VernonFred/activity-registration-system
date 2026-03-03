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

export type AgendaItem = {
  time: string
  location?: string
  title: string
  content?: string
}

export type AgendaGroup = {
  title: string
  items: AgendaItem[]
}

export type AgendaBlock = {
  day_label: string
  groups: AgendaGroup[]
}

export type HotelRoomType = {
  name: string
  price?: string
  description?: string
}

export type HotelConfig = {
  id: string
  name: string
  tag?: string
  image_url?: string
  address?: string
  phone?: string
  room_types: HotelRoomType[]
  booking: {
    notice?: string
    contact_name?: string
    contact_phone?: string
  }
  map: {
    lat?: number
    lng?: number
    address?: string
    navigation_label?: string
  }
  transport: {
    metro?: string
    bus?: string
    drive?: string
  }
  weather: {
    temperature?: string
    humidity?: string
    wind_speed?: string
    visibility?: string
  }
}

export type ActivityExtraConfig = {
  agenda_blocks: AgendaBlock[]
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

export function createEmptyAgendaItem(): AgendaItem {
  return { time: '', title: '', location: '', content: '' }
}

export function createEmptyAgendaGroup(): AgendaGroup {
  return { title: '', items: [createEmptyAgendaItem()] }
}

export function createEmptyAgendaBlock(): AgendaBlock {
  return { day_label: '', groups: [createEmptyAgendaGroup()] }
}

export function createEmptyHotel(): HotelConfig {
  return {
    id: String(Date.now()),
    name: '',
    tag: '',
    image_url: '',
    address: '',
    phone: '',
    room_types: [{ name: '', price: '', description: '' }],
    booking: {
      notice: '',
      contact_name: '',
      contact_phone: '',
    },
    map: {
      lat: undefined,
      lng: undefined,
      address: '',
      navigation_label: '',
    },
    transport: {
      metro: '',
      bus: '',
      drive: '',
    },
    weather: {
      temperature: '',
      humidity: '',
      wind_speed: '',
      visibility: '',
    },
  }
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
      agenda_blocks: [createEmptyAgendaBlock()],
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
