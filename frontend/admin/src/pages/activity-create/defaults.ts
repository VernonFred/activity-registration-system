import type {
  ActivityAgendaDay,
  ActivityAgendaEntry,
  ActivityAgendaGroup,
  ActivityCreateFormState,
  HotelConfig,
  HotelTransportInfo,
  SignupFlowConfig,
  SignupStepDefinition,
} from './models'

const BUILTIN_SIGNUP_STEP_PRESETS = [
  {
    key: 'personal',
    title: '个人信息',
    description: '报名入口第一步，负责姓名、学校、部门等基础资料。',
  },
  {
    key: 'payment',
    title: '缴费信息',
    description: '配置缴费凭证、开票信息、支付截图等字段。',
  },
  {
    key: 'accommodation',
    title: '住宿信息',
    description: '配置酒店、房型、入住意向与住宿补充说明。',
  },
  {
    key: 'transport',
    title: '交通信息',
    description: '配置到达、返程、车次/航班等交通字段。',
  },
] as const

function createNodeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createDefaultSignupFlow(): SignupFlowConfig {
  return {
    steps: BUILTIN_SIGNUP_STEP_PRESETS.map((step, index) => ({
      id: createNodeId(step.key),
      key: step.key,
      title: step.title,
      description: step.description,
      enabled: step.key !== 'accommodation',
      built_in: true,
      order: index,
    })),
  }
}

export function createEmptySignupStep(existingKeys: string[]): SignupStepDefinition {
  let index = 1
  let key = `custom_step_${index}`
  while (existingKeys.includes(key)) {
    index += 1
    key = `custom_step_${index}`
  }
  return {
    id: createNodeId('step'),
    key,
    title: `自定义步骤 ${index}`,
    description: '补充未来可扩展的报名流程节点。',
    enabled: true,
    built_in: false,
    order: existingKeys.length,
  }
}

export function createEmptyAgendaEntry(): ActivityAgendaEntry {
  return {
    id: createNodeId('entry'),
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
    id: createNodeId('group'),
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
    id: createNodeId('day'),
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
      signup_flow: createDefaultSignupFlow(),
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
