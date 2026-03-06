import {
  createDefaultActivityCreateFormState,
  type ActivityCreateFormState,
  type ActivityExtraConfig,
  type ActivityMaterials,
} from './types'
import { normalizeAgendaBlocks, sanitizeAgendaBlocks } from './agenda-transform'
import { normalizeHotels } from './hotel-transform'
import { normalizeSignupFlow, sanitizeSignupFlow } from './signup-flow-transform'
import { cleanObject, cleanScalar } from './transform-helpers'

export function buildActivityPayload(state: ActivityCreateFormState, options?: { includeFormFields?: boolean }) {
  const sanitizedAgendaBlocks = sanitizeAgendaBlocks(state.extra.agenda_blocks)
  const sanitizedSignupFlow = sanitizeSignupFlow(state.extra.signup_flow)
  const { signup_config: _legacySignupConfig, ...extraWithoutLegacyConfig } = state.extra
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
    require_payment: sanitizedSignupFlow.steps.some((step) => step.key === 'payment' && step.enabled),
    allow_feedback: state.base.allow_feedback,
    allow_waitlist: state.base.allow_waitlist,
    group_qr_image_url: cleanScalar(state.base.group_qr_image_url),
    status: state.base.status,
    agenda: cleanScalar(state.agendaSummary),
    extra: cleanObject<ActivityExtraConfig>({
      ...extraWithoutLegacyConfig,
      agenda_blocks: sanitizedAgendaBlocks,
      signup_flow: sanitizedSignupFlow,
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
  const normalizedSignupFlow = normalizeSignupFlow(extra, defaults.extra.signup_flow)

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
      require_payment: normalizedSignupFlow.steps.some((step) => step.key === 'payment' && step.enabled),
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
          enabled: typeof overviewMap.enabled === 'boolean' ? overviewMap.enabled : hasLegacyCoords,
        },
      },
      agenda_blocks: normalizeAgendaBlocks(extra.agenda_blocks),
      hotels: normalizeHotels(extra.hotels),
      signup_flow: normalizedSignupFlow,
      signup_config: extra.signup_config,
    },
    materials: {
      live: {
        ...defaults.materials.live,
        ...(materials.live || {}),
      },
    },
  }
}
