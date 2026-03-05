import { AutoComplete, Button, DatePicker, Input, TimePicker } from 'antd'
import dayjs from 'dayjs'
import { Calendar, Layers, Mic, Plus, Trash2 } from 'lucide-react'
import SectionCard from '../../../components/SectionCard'
import type {
  ActivityAgendaDay,
  ActivityAgendaEntry,
  ActivityAgendaGroup,
  ActivityCreateFormState,
} from '../types'
import {
  createEmptyAgendaDay,
  createEmptyAgendaEntry,
  createEmptyAgendaGroup,
} from '../types'

const { RangePicker: TimeRangePicker } = TimePicker

type Props = {
  state: ActivityCreateFormState
  onChange: (next: ActivityCreateFormState) => void
}

const ENTRY_TYPE_OPTIONS = [
  { label: '演讲', value: 'speech' },
  { label: '茶歇', value: 'break' },
  { label: '讨论', value: 'discussion' },
  { label: '活动', value: 'activity' },
] as const

const ENTRY_TYPE_VALUE_TO_LABEL: Record<string, string> = {
  speech: '演讲',
  break: '茶歇',
  discussion: '讨论',
  activity: '活动',
}

const ENTRY_TYPE_LABEL_TO_VALUE: Record<string, string> = Object.fromEntries(
  Object.entries(ENTRY_TYPE_VALUE_TO_LABEL).map(([value, label]) => [label, value]),
)

const TIME_FORMAT = 'HH:mm'
const DAY_FORMAT = 'YYYY-MM-DD HH:mm'

/** Convert "HH:mm" string to dayjs, or null */
function timeToDayjs(t?: string) {
  if (!t) return null
  const d = dayjs(t, TIME_FORMAT)
  return d.isValid() ? d : null
}

function dateToDayjs(date?: string) {
  if (!date) return null
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(date)) {
    const parsed = dayjs(date.replace(' ', 'T') + ':00')
    return parsed.isValid() ? parsed : null
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const parsed = dayjs(`${date}T00:00:00`)
    return parsed.isValid() ? parsed : null
  }
  const parsed = dayjs(date)
  return parsed.isValid() ? parsed : null
}

function toTypeDisplayValue(type?: string) {
  if (!type) return ''
  return ENTRY_TYPE_VALUE_TO_LABEL[type] || type
}

function toTypeStoredValue(raw?: string) {
  const value = (raw || '').trim()
  if (!value) return ''
  return ENTRY_TYPE_LABEL_TO_VALUE[value] || value
}

export default function AgendaTab({ state, onChange }: Props) {
  const updateAgendaBlocks = (agenda_blocks: ActivityAgendaDay[]) => {
    onChange({
      ...state,
      extra: {
        ...state.extra,
        agenda_blocks,
      },
    })
  }

  const updateDay = (dayIndex: number, patch: Partial<ActivityAgendaDay>) => {
    const days = [...state.extra.agenda_blocks]
    days[dayIndex] = { ...days[dayIndex], ...patch }
    updateAgendaBlocks(days)
  }

  const updateGroup = (dayIndex: number, groupIndex: number, patch: Partial<ActivityAgendaGroup>) => {
    const days = [...state.extra.agenda_blocks]
    const groups = [...days[dayIndex].groups]
    groups[groupIndex] = { ...groups[groupIndex], ...patch }
    days[dayIndex] = { ...days[dayIndex], groups }
    updateAgendaBlocks(days)
  }

  const updateEntry = (dayIndex: number, groupIndex: number, entryIndex: number, patch: Partial<ActivityAgendaEntry>) => {
    const days = [...state.extra.agenda_blocks]
    const groups = [...days[dayIndex].groups]
    const items = [...groups[groupIndex].items]
    items[entryIndex] = { ...items[entryIndex], ...patch }
    groups[groupIndex] = { ...groups[groupIndex], items }
    days[dayIndex] = { ...days[dayIndex], groups }
    updateAgendaBlocks(days)
  }

  const removeDay = (dayIndex: number) => {
    const next = state.extra.agenda_blocks.filter((_, index) => index !== dayIndex)
    updateAgendaBlocks(next.length ? next : [createEmptyAgendaDay()])
  }

  const removeGroup = (dayIndex: number, groupIndex: number) => {
    const days = [...state.extra.agenda_blocks]
    const groups = days[dayIndex].groups.filter((_, index) => index !== groupIndex)
    days[dayIndex] = {
      ...days[dayIndex],
      groups: groups.length ? groups : [createEmptyAgendaGroup()],
    }
    updateAgendaBlocks(days)
  }

  const removeEntry = (dayIndex: number, groupIndex: number, entryIndex: number) => {
    const days = [...state.extra.agenda_blocks]
    const groups = [...days[dayIndex].groups]
    const items = groups[groupIndex].items.filter((_, index) => index !== entryIndex)
    groups[groupIndex] = {
      ...groups[groupIndex],
      items: items.length ? items : [createEmptyAgendaEntry()],
    }
    days[dayIndex] = { ...days[dayIndex], groups }
    updateAgendaBlocks(days)
  }

  return (
    <div className="agenda-tab">
      {state.extra.agenda_blocks.map((day, dayIndex) => (
        <SectionCard key={day.id || `agenda-day-${dayIndex}`}>
          {/* ---- Day header ---- */}
          <div className="agenda-tab__day-header">
            <div className="agenda-tab__day-title">
              <Calendar size={15} />
              <span>议程日 {dayIndex + 1}</span>
            </div>
            <Button
              type="text"
              danger
              size="small"
              icon={<Trash2 size={13} />}
              onClick={() => removeDay(dayIndex)}
            >
              删除
            </Button>
          </div>

          {/* ---- Day date fields (2-col) ---- */}
          <div className="agenda-tab__day-fields">
            <div>
              <div className="field-label">显示日期</div>
              <Input
                value={day.display_date}
                onChange={(e) => updateDay(dayIndex, { display_date: e.target.value })}
                placeholder="用于小程序议程顶部日期标签"
              />
            </div>
            <div>
              <div className="field-label">日期时间（可选）</div>
              <DatePicker
                showTime
                format={DAY_FORMAT}
                style={{ width: '100%' }}
                value={dateToDayjs(day.date)}
                onChange={(value) => {
                  const formatted = value ? value.format(DAY_FORMAT) : ''
                  const autoLabel = value ? value.format('YYYY年MM月DD日') : ''
                  updateDay(dayIndex, {
                    date: formatted,
                    display_date: day.display_date?.trim() ? day.display_date : autoLabel,
                  })
                }}
                placeholder="请选择日期时间"
              />
            </div>
          </div>

          {/* ---- Groups ---- */}
          {day.groups.map((group, groupIndex) => (
            <div key={group.id || `agenda-group-${dayIndex}-${groupIndex}`} className="agenda-tab__group">
              {/* Group header */}
              <div className="agenda-tab__group-header">
                <div className="agenda-tab__group-title">
                  <Layers size={13} />
                  <span>分组 {groupIndex + 1}</span>
                </div>
                <Button
                  type="text"
                  danger
                  size="small"
                  onClick={() => removeGroup(dayIndex, groupIndex)}
                >
                  删除分组
                </Button>
              </div>

              {/* Group fields: Row 1 — title + time range */}
              <div className="agenda-tab__group-fields">
                <div className="agenda-tab__field-half">
                  <div className="field-label">分组标题</div>
                  <Input
                    value={group.title}
                    onChange={(e) => updateGroup(dayIndex, groupIndex, { title: e.target.value })}
                    placeholder="例如：开幕仪式 / 主旨报告"
                  />
                </div>
                <div className="agenda-tab__field-half">
                  <div className="field-label">时间范围</div>
                  <TimeRangePicker
                    format={TIME_FORMAT}
                    style={{ width: '100%' }}
                    value={[timeToDayjs(group.time_start), timeToDayjs(group.time_end)]}
                    onChange={(vals) => {
                      updateGroup(dayIndex, groupIndex, {
                        time_start: vals?.[0]?.format(TIME_FORMAT) ?? '',
                        time_end: vals?.[1]?.format(TIME_FORMAT) ?? '',
                      })
                    }}
                    placeholder={['开始', '结束']}
                  />
                </div>
              </div>

              {/* Group fields: Row 2 — moderator */}
              <div className="agenda-tab__group-fields">
                <div className="agenda-tab__field-half">
                  <div className="field-label">主持人姓名</div>
                  <Input
                    value={group.moderator?.name}
                    onChange={(e) => updateGroup(dayIndex, groupIndex, {
                      moderator: {
                        ...(group.moderator || { name: '', title: '' }),
                        name: e.target.value,
                      },
                    })}
                    placeholder="可选"
                  />
                </div>
                <div className="agenda-tab__field-half">
                  <div className="field-label">主持人头衔</div>
                  <Input
                    value={group.moderator?.title}
                    onChange={(e) => updateGroup(dayIndex, groupIndex, {
                      moderator: {
                        ...(group.moderator || { name: '', title: '' }),
                        title: e.target.value,
                      },
                    })}
                    placeholder="可选"
                  />
                </div>
              </div>

              {/* ---- Entries ---- */}
              {group.items.map((entry, entryIndex) => (
                <div key={entry.id || `agenda-entry-${dayIndex}-${groupIndex}-${entryIndex}`} className="agenda-tab__entry">
                  {/* Entry header */}
                  <div className="agenda-tab__entry-header">
                    <div className="agenda-tab__entry-title">
                      <Mic size={12} />
                      <span>议程项 {entryIndex + 1}</span>
                    </div>
                    <Button
                      type="text"
                      danger
                      size="small"
                      onClick={() => removeEntry(dayIndex, groupIndex, entryIndex)}
                    >
                      删除
                    </Button>
                  </div>

                  {/* Entry Row 1: time + type + tag */}
                  <div className="agenda-tab__entry-row-3">
                    <div>
                      <div className="field-label">时间</div>
                      <TimeRangePicker
                        format={TIME_FORMAT}
                        style={{ width: '100%' }}
                        value={[timeToDayjs(entry.time_start), timeToDayjs(entry.time_end)]}
                        onChange={(vals) => {
                          updateEntry(dayIndex, groupIndex, entryIndex, {
                            time_start: vals?.[0]?.format(TIME_FORMAT) ?? '',
                            time_end: vals?.[1]?.format(TIME_FORMAT) ?? '',
                          })
                        }}
                        placeholder={['开始', '结束']}
                      />
                    </div>
                    <div>
                      <div className="field-label">类型</div>
                      <AutoComplete
                        style={{ width: '100%' }}
                        options={ENTRY_TYPE_OPTIONS as any}
                        value={toTypeDisplayValue(entry.type)}
                        onChange={(value) =>
                          updateEntry(dayIndex, groupIndex, entryIndex, {
                            type: toTypeStoredValue(value) as ActivityAgendaEntry['type'],
                          })}
                        filterOption={(inputValue, option) =>
                          String(option?.value || '')
                            .toLowerCase()
                            .includes(inputValue.toLowerCase())
                          || String(option?.label || '')
                            .toLowerCase()
                            .includes(inputValue.toLowerCase())
                        }
                      >
                        <Input allowClear placeholder="选择或输入类型" />
                      </AutoComplete>
                    </div>
                    <div>
                      <div className="field-label">标签</div>
                      <Input
                        value={entry.tag}
                        onChange={(e) => updateEntry(dayIndex, groupIndex, entryIndex, { tag: e.target.value })}
                        placeholder="可选"
                      />
                    </div>
                  </div>

                  {/* Entry Row 2: title (full width) */}
                  <div>
                    <div className="field-label">标题</div>
                    <Input
                      value={entry.title}
                      onChange={(e) => updateEntry(dayIndex, groupIndex, entryIndex, { title: e.target.value })}
                      placeholder="议程标题"
                    />
                  </div>

                  {/* Entry Row 3: speaker + location */}
                  <div className="agenda-tab__entry-row-3">
                    <div>
                      <div className="field-label">演讲人</div>
                      <Input
                        value={entry.speaker?.name}
                        onChange={(e) => updateEntry(dayIndex, groupIndex, entryIndex, {
                          speaker: {
                            ...(entry.speaker || { name: '', title: '', avatar: '' }),
                            name: e.target.value,
                          },
                        })}
                        placeholder="姓名"
                      />
                    </div>
                    <div>
                      <div className="field-label">头衔</div>
                      <Input
                        value={entry.speaker?.title}
                        onChange={(e) => updateEntry(dayIndex, groupIndex, entryIndex, {
                          speaker: {
                            ...(entry.speaker || { name: '', title: '', avatar: '' }),
                            title: e.target.value,
                          },
                        })}
                        placeholder="头衔"
                      />
                    </div>
                    <div>
                      <div className="field-label">地点</div>
                      <Input
                        value={entry.location}
                        onChange={(e) => updateEntry(dayIndex, groupIndex, entryIndex, { location: e.target.value })}
                        placeholder="可选"
                      />
                    </div>
                  </div>

                  {/* Entry Row 4: description */}
                  <div>
                    <div className="field-label">描述</div>
                    <Input.TextArea
                      value={entry.description}
                      onChange={(e) => updateEntry(dayIndex, groupIndex, entryIndex, { description: e.target.value })}
                      placeholder="描述（可选）"
                      autoSize={{ minRows: 2, maxRows: 4 }}
                    />
                  </div>
                </div>
              ))}

              <Button
                type="dashed"
                size="small"
                icon={<Plus size={13} />}
                onClick={() => updateGroup(dayIndex, groupIndex, { items: [...group.items, createEmptyAgendaEntry()] })}
              >
                新增议程项
              </Button>
            </div>
          ))}

          <Button
            type="dashed"
            icon={<Plus size={14} />}
            onClick={() => updateDay(dayIndex, { groups: [...day.groups, createEmptyAgendaGroup()] })}
          >
            新增分组
          </Button>
        </SectionCard>
      ))}

      <Button
        type="dashed"
        block
        icon={<Plus size={14} />}
        onClick={() => updateAgendaBlocks([...state.extra.agenda_blocks, createEmptyAgendaDay()])}
      >
        新增议程日
      </Button>
    </div>
  )
}
