import {
  createDefaultActivityCreateFormState,
  createEmptyAgendaDay,
  createEmptyHotel,
  type ActivityAgendaDay,
  type ActivityAgendaEntry,
  type ActivityAgendaGroup,
  type ActivityCreateFormState,
  type ActivityExtraConfig,
  type ActivityMaterials,
  type FormFieldSummary,
} from './types'

function cleanScalar(value: unknown): unknown | undefined {
  if (value == null) return undefined
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed || undefined
  }
  if (Array.isArray(value)) {
    const cleaned: unknown[] = value
      .map((item) => cleanScalar(item))
      .filter((item) => item !== undefined)
    return cleaned.length ? cleaned : undefined
  }
  return value
}

function cleanObject<T>(value: T): T | undefined {
  if (value == null) return undefined
  if (Array.isArray(value)) {
    const cleaned = value
      .map((item) => cleanObject(item))
      .filter((item) => item !== undefined)
    return (cleaned.length ? cleaned : undefined) as T | undefined
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, inner]) => [key, cleanObject(inner)] as const)
      .filter(([, inner]) => inner !== undefined)
    return (entries.length ? Object.fromEntries(entries) : undefined) as T | undefined
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return (trimmed ? trimmed : undefined) as T | undefined
  }
  return value
}

function splitLegacyTime(rawTime?: unknown) {
  const value = typeof rawTime === 'string' ? rawTime.trim() : ''
  if (!value) return { time_start: '', time_end: '' }
  const [start, end] = value.split('-').map((item) => item.trim())
  return {
    time_start: start || '',
    time_end: end || start || '',
  }
}

function createCompatId(...parts: Array<string | number>) {
  return parts.map((part) => String(part)).join('-')
}

function isNewAgendaDay(value: any): value is ActivityAgendaDay {
  return !!value && typeof value === 'object' && 'display_date' in value && Array.isArray(value.groups)
}

function normalizeAgendaEntry(entry: any, dayIndex: number, groupIndex: number, itemIndex: number): ActivityAgendaEntry {
  if (entry && typeof entry === 'object' && 'time_start' in entry) {
    return {
      id: typeof entry.id === 'string' && entry.id ? entry.id : createCompatId('entry', dayIndex, groupIndex, itemIndex),
      time_start: typeof entry.time_start === 'string' ? entry.time_start : '',
      time_end: typeof entry.time_end === 'string' ? entry.time_end : '',
      type: entry.type || 'speech',
      title: typeof entry.title === 'string' ? entry.title : '',
      speaker: entry.speaker && typeof entry.speaker === 'object'
        ? {
            name: typeof entry.speaker.name === 'string' ? entry.speaker.name : '',
            title: typeof entry.speaker.title === 'string' ? entry.speaker.title : '',
            avatar: typeof entry.speaker.avatar === 'string' ? entry.speaker.avatar : '',
          }
        : {
            name: typeof entry?.speaker === 'string' ? entry.speaker : '',
            title: '',
            avatar: '',
          },
      location: typeof entry.location === 'string' ? entry.location : '',
      description: typeof entry.description === 'string' ? entry.description : '',
      tag: typeof entry.tag === 'string' ? entry.tag : '',
    }
  }

  const legacyTime = splitLegacyTime(entry?.time)
  return {
    id: createCompatId('entry', dayIndex, groupIndex, itemIndex),
    time_start: legacyTime.time_start,
    time_end: legacyTime.time_end,
    type: 'speech',
    title: typeof entry?.title === 'string' ? entry.title : '',
    speaker: {
      name: '',
      title: '',
      avatar: '',
    },
    location: typeof entry?.location === 'string' ? entry.location : '',
    description: typeof entry?.content === 'string' ? entry.content : '',
    tag: '',
  }
}

function normalizeAgendaGroup(group: any, dayIndex: number, groupIndex: number): ActivityAgendaGroup {
  const rawItems = Array.isArray(group?.items) ? group.items : []
  return {
    id: typeof group?.id === 'string' && group.id ? group.id : createCompatId('group', dayIndex, groupIndex),
    title: typeof group?.title === 'string' ? group.title : '',
    time_start: typeof group?.time_start === 'string' ? group.time_start : '',
    time_end: typeof group?.time_end === 'string' ? group.time_end : '',
    moderator: group?.moderator && typeof group.moderator === 'object'
      ? {
          name: typeof group.moderator.name === 'string' ? group.moderator.name : '',
          title: typeof group.moderator.title === 'string' ? group.moderator.title : '',
        }
      : {
          name: '',
          title: '',
        },
    items: rawItems.length
      ? rawItems.map((item: any, itemIndex: number) => normalizeAgendaEntry(item, dayIndex, groupIndex, itemIndex))
      : [createDefaultActivityCreateFormState().extra.agenda_blocks[0].groups[0].items[0]],
  }
}

function normalizeAgendaDay(day: any, dayIndex: number): ActivityAgendaDay {
  if (isNewAgendaDay(day)) {
    const rawGroups = Array.isArray(day.groups) ? day.groups : []
    return {
      id: typeof day.id === 'string' && day.id ? day.id : createCompatId('day', dayIndex),
      display_date: typeof day.display_date === 'string' ? day.display_date : '',
      date: typeof day.date === 'string' ? day.date : '',
      groups: rawGroups.length
        ? rawGroups.map((group: any, groupIndex: number) => normalizeAgendaGroup(group, dayIndex, groupIndex))
        : [createDefaultActivityCreateFormState().extra.agenda_blocks[0].groups[0]],
    }
  }

  const rawGroups = Array.isArray(day?.groups) ? day.groups : []
  return {
    id: createCompatId('day', dayIndex),
    display_date: typeof day?.day_label === 'string' ? day.day_label : '',
    date: '',
    groups: rawGroups.length
      ? rawGroups.map((group: any, groupIndex: number) => normalizeAgendaGroup(group, dayIndex, groupIndex))
      : [createDefaultActivityCreateFormState().extra.agenda_blocks[0].groups[0]],
  }
}

function isEmptyAgendaEntry(entry: ActivityAgendaEntry) {
  return ![
    entry.title,
    entry.time_start,
    entry.time_end,
    entry.speaker?.name,
    entry.location,
    entry.description,
  ].some((value) => typeof value === 'string' && value.trim())
}

function sanitizeAgendaBlocks(days: ActivityAgendaDay[]) {
  return days
    .map((day) => ({
      ...day,
      display_date: day.display_date.trim(),
      date: day.date?.trim() || '',
      groups: day.groups
        .map((group) => ({
          ...group,
          title: group.title.trim(),
          time_start: group.time_start?.trim() || '',
          time_end: group.time_end?.trim() || '',
          moderator: group.moderator
            ? {
                name: group.moderator.name.trim(),
                title: group.moderator.title?.trim() || '',
              }
            : undefined,
          items: group.items
            .map((entry) => ({
              ...entry,
              time_start: entry.time_start.trim(),
              time_end: entry.time_end.trim(),
              title: entry.title.trim(),
              speaker: entry.speaker
                ? {
                    name: entry.speaker.name.trim(),
                    title: entry.speaker.title?.trim() || '',
                    avatar: entry.speaker.avatar?.trim() || '',
                  }
                : undefined,
              location: entry.location?.trim() || '',
              description: entry.description?.trim() || '',
              tag: entry.tag?.trim() || '',
            }))
            .filter((entry) => !isEmptyAgendaEntry(entry)),
        }))
        .filter((group) => group.items.length > 0),
    }))
    .filter((day) => day.groups.length > 0)
}

export function buildActivityPayload(state: ActivityCreateFormState, options?: { includeFormFields?: boolean }) {
  const sanitizedAgendaBlocks = sanitizeAgendaBlocks(state.extra.agenda_blocks)
  const payload: Record<string, unknown> = {
    title: state.base.title.trim(),
    subtitle: cleanScalar(state.base.subtitle),
    category: cleanScalar(state.base.category),
    tags: cleanScalar(state.base.tags),
    cover_image_url: cleanScalar(state.base.cover_image_url),
    banner_image_url: cleanScalar(state.base.banner_image_url),
    city: cleanScalar(state.base.city),
    location: cleanScalar(state.base.location),
    location_detail: cleanScalar(state.base.location_detail),
    contact_name: cleanScalar(state.base.contact_name),
    contact_phone: cleanScalar(state.base.contact_phone),
    contact_email: cleanScalar(state.base.contact_email),
    description: cleanScalar(state.base.description),
    start_time: state.base.start_time,
    end_time: state.base.end_time,
    signup_start_time: state.base.signup_start_time,
    signup_end_time: state.base.signup_end_time,
    checkin_start_time: state.base.checkin_start_time,
    checkin_end_time: state.base.checkin_end_time,
    max_participants: state.base.max_participants,
    approval_required: state.base.approval_required,
    require_payment: state.base.require_payment,
    allow_feedback: state.base.allow_feedback,
    allow_waitlist: state.base.allow_waitlist,
    group_qr_image_url: cleanScalar(state.base.group_qr_image_url),
    status: state.base.status,
    agenda: cleanScalar(state.agendaSummary),
    extra: cleanObject<ActivityExtraConfig>({
      ...state.extra,
      agenda_blocks: sanitizedAgendaBlocks,
    }),
    materials: cleanObject<ActivityMaterials>(state.materials),
  }

  if (options?.includeFormFields) {
    payload.form_fields = []
  }

  return payload
}

export function parseActivityDetailToFormState(detail: any): ActivityCreateFormState {
  const defaults = createDefaultActivityCreateFormState()
  const extra = (detail?.extra || {}) as Partial<ActivityExtraConfig>
  const materials = (detail?.materials || {}) as Partial<ActivityMaterials>
  const overviewMap = (extra.overview?.map || {}) as Partial<ActivityExtraConfig['overview']['map']>
  const hasLegacyCoords =
    typeof overviewMap.lat === 'number' &&
    Number.isFinite(overviewMap.lat) &&
    typeof overviewMap.lng === 'number' &&
    Number.isFinite(overviewMap.lng)

  return {
    base: {
      ...defaults.base,
      title: detail?.title || '',
      subtitle: detail?.subtitle || '',
      category: detail?.category || '',
      tags: Array.isArray(detail?.tags) ? detail.tags : [],
      cover_image_url: detail?.cover_image_url || '',
      banner_image_url: detail?.banner_image_url || '',
      city: detail?.city || '',
      location: detail?.location || '',
      location_detail: detail?.location_detail || '',
      contact_name: detail?.contact_name || '',
      contact_phone: detail?.contact_phone || '',
      contact_email: detail?.contact_email || '',
      description: detail?.description || '',
      start_time: detail?.start_time || undefined,
      end_time: detail?.end_time || undefined,
      signup_start_time: detail?.signup_start_time || undefined,
      signup_end_time: detail?.signup_end_time || undefined,
      checkin_start_time: detail?.checkin_start_time || undefined,
      checkin_end_time: detail?.checkin_end_time || undefined,
      max_participants: detail?.max_participants ?? undefined,
      approval_required: detail?.approval_required ?? true,
      require_payment: detail?.require_payment ?? false,
      allow_feedback: detail?.allow_feedback ?? true,
      allow_waitlist: detail?.allow_waitlist ?? true,
      group_qr_image_url: detail?.group_qr_image_url || '',
      status: detail?.status || 'draft',
    },
    agendaSummary: detail?.agenda || '',
    extra: {
      overview: {
        ...defaults.extra.overview,
        ...(extra.overview || {}),
        map: {
          ...defaults.extra.overview.map,
          ...overviewMap,
          enabled:
            typeof overviewMap.enabled === 'boolean'
              ? overviewMap.enabled
              : hasLegacyCoords,
        },
      },
      agenda_blocks: Array.isArray(extra.agenda_blocks) && extra.agenda_blocks.length
        ? extra.agenda_blocks.map((day: any, dayIndex: number) => normalizeAgendaDay(day, dayIndex))
        : [createEmptyAgendaDay()],
      hotels: Array.isArray(extra.hotels) && extra.hotels.length ? extra.hotels.map((hotel: any) => ({
        ...createEmptyHotel(),
        ...hotel,
        room_types: Array.isArray(hotel?.room_types) && hotel.room_types.length ? hotel.room_types : createEmptyHotel().room_types,
        booking: { ...createEmptyHotel().booking, ...(hotel?.booking || {}) },
        map: { ...createEmptyHotel().map, ...(hotel?.map || {}) },
        transport: { ...createEmptyHotel().transport, ...(hotel?.transport || {}) },
        weather: { ...createEmptyHotel().weather, ...(hotel?.weather || {}) },
      })) : [createEmptyHotel()],
      signup_config: {
        payment: {
          ...defaults.extra.signup_config.payment,
          ...(extra.signup_config?.payment || {}),
        },
        accommodation: {
          ...defaults.extra.signup_config.accommodation,
          ...(extra.signup_config?.accommodation || {}),
          hotel_options: Array.isArray(extra.signup_config?.accommodation?.hotel_options)
            ? extra.signup_config!.accommodation!.hotel_options
            : defaults.extra.signup_config.accommodation.hotel_options,
          room_intents: Array.isArray(extra.signup_config?.accommodation?.room_intents)
            ? extra.signup_config!.accommodation!.room_intents
            : defaults.extra.signup_config.accommodation.room_intents,
          occupancy_options: Array.isArray(extra.signup_config?.accommodation?.occupancy_options)
            ? extra.signup_config!.accommodation!.occupancy_options
            : defaults.extra.signup_config.accommodation.occupancy_options,
        },
        transport: {
          ...defaults.extra.signup_config.transport,
          ...(extra.signup_config?.transport || {}),
          pickup_points: Array.isArray(extra.signup_config?.transport?.pickup_points)
            ? extra.signup_config!.transport!.pickup_points
            : defaults.extra.signup_config.transport.pickup_points,
          dropoff_points: Array.isArray(extra.signup_config?.transport?.dropoff_points)
            ? extra.signup_config!.transport!.dropoff_points
            : defaults.extra.signup_config.transport.dropoff_points,
        },
      },
    },
    materials: {
      live: {
        ...defaults.materials.live,
        ...(materials.live || {}),
      },
    },
  }
}

export function extractFormFieldSummary(detail: any): FormFieldSummary {
  const fields = Array.isArray(detail?.form_fields) ? detail.form_fields : []
  return {
    count: fields.length,
    requiredCount: fields.filter((field: any) => !!field?.required).length,
  }
}
