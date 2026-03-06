import {
  createDefaultActivityCreateFormState,
  createEmptyAgendaDay,
  type ActivityAgendaDay,
  type ActivityAgendaEntry,
  type ActivityAgendaGroup,
} from './types'
import { createCompatId, splitLegacyTime } from './transform-helpers'

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
    speaker: { name: '', title: '', avatar: '' },
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
      : { name: '', title: '' },
    items: rawItems.length
      ? rawItems.map((item: any, itemIndex: number) => normalizeAgendaEntry(item, dayIndex, groupIndex, itemIndex))
      : [createDefaultActivityCreateFormState().extra.agenda_blocks[0].groups[0].items[0]],
  }
}

export function normalizeAgendaDay(day: any, dayIndex: number): ActivityAgendaDay {
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

export function sanitizeAgendaBlocks(days: ActivityAgendaDay[]) {
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

export function normalizeAgendaBlocks(raw: any) {
  return Array.isArray(raw) && raw.length
    ? raw.map((day: any, dayIndex: number) => normalizeAgendaDay(day, dayIndex))
    : [createEmptyAgendaDay()]
}
