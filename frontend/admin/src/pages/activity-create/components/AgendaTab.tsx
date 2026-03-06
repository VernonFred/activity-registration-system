import { Button, DatePicker, Input } from 'antd'
import { Calendar, Plus, Trash2 } from 'lucide-react'
import SectionCard from '../../../components/SectionCard'
import type {
  ActivityAgendaDay,
  ActivityAgendaEntry,
  ActivityAgendaGroup,
  ActivityCreateFormState,
} from '../types'
import { createEmptyAgendaDay, createEmptyAgendaEntry, createEmptyAgendaGroup } from '../types'
import { DAY_FORMAT, dateToDayjs } from './agenda-helpers'
import { AgendaGroupEditor } from './AgendaGroupEditor'

type Props = {
  state: ActivityCreateFormState
  onChange: (next: ActivityCreateFormState) => void
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

          {day.groups.map((group, groupIndex) => (
            <AgendaGroupEditor
              key={group.id || `agenda-group-${dayIndex}-${groupIndex}`}
              dayIndex={dayIndex}
              groupIndex={groupIndex}
              group={group}
              updateGroup={updateGroup}
              updateEntry={updateEntry}
              removeGroup={removeGroup}
              removeEntry={removeEntry}
            />
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
