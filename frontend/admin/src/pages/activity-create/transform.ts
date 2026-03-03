import {
  createDefaultActivityCreateFormState,
  createEmptyAgendaBlock,
  createEmptyHotel,
  type ActivityCreateFormState,
  type ActivityExtraConfig,
  type ActivityMaterials,
  type FormFieldSummary,
} from './types'

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

export function buildActivityPayload(state: ActivityCreateFormState, options?: { includeFormFields?: boolean }) {
  const payload: Record<string, unknown> = {
    ...state.base,
    description: state.base.description?.trim() || undefined,
    agenda: state.agendaSummary?.trim() || undefined,
    extra: cleanObject<ActivityExtraConfig>(state.extra),
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
      agenda_blocks: Array.isArray(extra.agenda_blocks) && extra.agenda_blocks.length ? extra.agenda_blocks : [createEmptyAgendaBlock()],
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
