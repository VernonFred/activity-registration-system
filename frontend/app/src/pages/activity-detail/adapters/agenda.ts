import type { AgendaDay, AgendaGroup, AgendaItem, AgendaItemType, Speaker } from '../types'

type LegacyAgendaItem = {
  time?: string
  location?: string
  title?: string
  content?: string
}

type LegacyAgendaGroup = {
  title?: string
  items?: LegacyAgendaItem[]
}

type LegacyAgendaDay = {
  day_label?: string
  groups?: LegacyAgendaGroup[]
}

function toNumberId(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function splitLegacyTime(rawTime?: unknown) {
  const value = typeof rawTime === 'string' ? rawTime.trim() : ''
  if (!value) return { time_start: '', time_end: '' }
  const [start, end] = value.split('-').map((part) => part.trim())
  return {
    time_start: start || '',
    time_end: end || start || '',
  }
}

function normalizeSpeaker(rawSpeaker: unknown): Speaker | undefined {
  if (typeof rawSpeaker === 'string') {
    const name = rawSpeaker.trim()
    return name ? { name, title: '' } : undefined
  }

  if (!rawSpeaker || typeof rawSpeaker !== 'object') return undefined
  const speaker = rawSpeaker as Record<string, unknown>
  const name = typeof speaker.name === 'string' ? speaker.name.trim() : ''
  const title = typeof speaker.title === 'string' ? speaker.title.trim() : ''
  const avatar = typeof speaker.avatar === 'string' ? speaker.avatar.trim() : ''

  if (!name && !title && !avatar) return undefined

  return {
    name,
    title,
    avatar: avatar || undefined,
  }
}

function normalizeAgendaItem(item: any, fallbackId: number): AgendaItem {
  if (item && typeof item === 'object' && 'time_start' in item) {
    return {
      id: toNumberId(item.id, fallbackId),
      time_start: typeof item.time_start === 'string' ? item.time_start : '',
      time_end: typeof item.time_end === 'string' ? item.time_end : '',
      title: typeof item.title === 'string' ? item.title : '',
      type: (item.type as AgendaItemType) || 'speech',
      speaker: normalizeSpeaker(item.speaker),
      location: typeof item.location === 'string' ? item.location : '',
      tag: typeof item.tag === 'string' ? item.tag : '',
      description: typeof item.description === 'string' ? item.description : '',
    }
  }

  const legacy = item as LegacyAgendaItem | undefined
  const times = splitLegacyTime(legacy?.time)
  return {
    id: fallbackId,
    time_start: times.time_start,
    time_end: times.time_end,
    title: typeof legacy?.title === 'string' ? legacy.title : '',
    type: 'speech',
    location: typeof legacy?.location === 'string' ? legacy.location : '',
    description: typeof legacy?.content === 'string' ? legacy.content : '',
  }
}

function normalizeAgendaGroup(group: any, dayIndex: number, groupIndex: number): AgendaGroup {
  const rawItems = Array.isArray(group?.items) ? group.items : []
  const fallbackId = dayIndex * 100 + groupIndex + 1

  return {
    id: toNumberId(group?.id, fallbackId),
    title: typeof group?.title === 'string' ? group.title : '',
    time_start: typeof group?.time_start === 'string' ? group.time_start : '',
    time_end: typeof group?.time_end === 'string' ? group.time_end : '',
    moderator: normalizeSpeaker(group?.moderator),
    items: rawItems.map((item: any, itemIndex: number) =>
      normalizeAgendaItem(item, fallbackId * 100 + itemIndex + 1),
    ),
    description: typeof group?.description === 'string' ? group.description : '',
  }
}

function normalizeAgendaDay(day: any, dayIndex: number): AgendaDay {
  const rawGroups = Array.isArray(day?.groups) ? day.groups : []

  if (day && typeof day === 'object' && 'display_date' in day) {
    return {
      id: toNumberId(day.id, dayIndex + 1),
      date: typeof day.date === 'string' ? day.date : '',
      display_date: typeof day.display_date === 'string' ? day.display_date : '',
      groups: rawGroups.map((group: any, groupIndex: number) => normalizeAgendaGroup(group, dayIndex, groupIndex)),
    }
  }

  const legacy = day as LegacyAgendaDay | undefined
  return {
    id: dayIndex + 1,
    date: '',
    display_date: typeof legacy?.day_label === 'string' ? legacy.day_label : '',
    groups: rawGroups.map((group: any, groupIndex: number) => normalizeAgendaGroup(group, dayIndex, groupIndex)),
  }
}

function normalizeFromAgendaArray(agenda: any[]): AgendaDay[] {
  if (!agenda.length) return []

  if ('groups' in agenda[0]) {
    return agenda.map((day: any, index: number) => normalizeAgendaDay(day, index))
  }

  if ('items' in agenda[0]) {
    return [
      {
        id: 1,
        date: '',
        display_date: '',
        groups: agenda.map((group: any, index: number) => normalizeAgendaGroup(group, 0, index)),
      },
    ]
  }

  return [
    {
      id: 1,
      date: '',
      display_date: '',
      groups: [
        {
          id: 1,
          title: '',
          items: agenda.map((item: any, index: number) => normalizeAgendaItem(item, index + 1)),
        },
      ],
    },
  ]
}

export function normalizeAgendaFromDetail(detail: any): AgendaDay[] {
  const agendaBlocks = detail?.extra?.agenda_blocks
  if (Array.isArray(agendaBlocks) && agendaBlocks.length) {
    return normalizeFromAgendaArray(agendaBlocks)
  }

  const legacyAgenda = detail?.agenda
  if (Array.isArray(legacyAgenda) && legacyAgenda.length) {
    return normalizeFromAgendaArray(legacyAgenda)
  }

  return []
}
