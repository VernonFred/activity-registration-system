import { AutoComplete, Button, Input, TimePicker } from 'antd'
import { Layers, Mic, Plus, Trash2 } from 'lucide-react'
import type { ActivityAgendaEntry, ActivityAgendaGroup } from '../types'
import { createEmptyAgendaEntry } from '../types'
import { ENTRY_TYPE_OPTIONS, TIME_FORMAT, timeToDayjs, toTypeDisplayValue, toTypeStoredValue } from './agenda-helpers'

const { RangePicker: TimeRangePicker } = TimePicker

type Props = {
  dayIndex: number
  groupIndex: number
  group: ActivityAgendaGroup
  updateGroup: (dayIndex: number, groupIndex: number, patch: Partial<ActivityAgendaGroup>) => void
  updateEntry: (
    dayIndex: number,
    groupIndex: number,
    entryIndex: number,
    patch: Partial<ActivityAgendaEntry>,
  ) => void
  removeGroup: (dayIndex: number, groupIndex: number) => void
  removeEntry: (dayIndex: number, groupIndex: number, entryIndex: number) => void
}

export function AgendaGroupEditor({
  dayIndex,
  groupIndex,
  group,
  updateGroup,
  updateEntry,
  removeGroup,
  removeEntry,
}: Props) {
  return (
    <div className="agenda-tab__group">
      <div className="agenda-tab__group-header">
        <div className="agenda-tab__group-title">
          <Layers size={13} />
          <span>分组 {groupIndex + 1}</span>
        </div>
        <Button type="text" danger size="small" onClick={() => removeGroup(dayIndex, groupIndex)}>
          删除分组
        </Button>
      </div>

      <div className="agenda-tab__group-fields">
        <div className="agenda-tab__field-half">
          <div className="field-label">分组标题</div>
          <Input value={group.title} onChange={(e) => updateGroup(dayIndex, groupIndex, { title: e.target.value })} placeholder="例如：开幕仪式 / 主旨报告" />
        </div>
        <div className="agenda-tab__field-half">
          <div className="field-label">时间范围</div>
          <TimeRangePicker
            format={TIME_FORMAT}
            style={{ width: '100%' }}
            value={[timeToDayjs(group.time_start), timeToDayjs(group.time_end)]}
            onChange={(vals) => updateGroup(dayIndex, groupIndex, { time_start: vals?.[0]?.format(TIME_FORMAT) ?? '', time_end: vals?.[1]?.format(TIME_FORMAT) ?? '' })}
            placeholder={['开始', '结束']}
          />
        </div>
      </div>

      <div className="agenda-tab__group-fields">
        <div className="agenda-tab__field-half">
          <div className="field-label">主持人姓名</div>
          <Input
            value={group.moderator?.name}
            onChange={(e) => updateGroup(dayIndex, groupIndex, { moderator: { ...(group.moderator || { name: '', title: '' }), name: e.target.value } })}
            placeholder="可选"
          />
        </div>
        <div className="agenda-tab__field-half">
          <div className="field-label">主持人头衔</div>
          <Input
            value={group.moderator?.title}
            onChange={(e) => updateGroup(dayIndex, groupIndex, { moderator: { ...(group.moderator || { name: '', title: '' }), title: e.target.value } })}
            placeholder="可选"
          />
        </div>
      </div>

      {group.items.map((entry, entryIndex) => (
        <div key={entry.id || `agenda-entry-${dayIndex}-${groupIndex}-${entryIndex}`} className="agenda-tab__entry">
          <div className="agenda-tab__entry-header">
            <div className="agenda-tab__entry-title">
              <Mic size={12} />
              <span>议程项 {entryIndex + 1}</span>
            </div>
            <Button type="text" danger size="small" onClick={() => removeEntry(dayIndex, groupIndex, entryIndex)}>
              删除
            </Button>
          </div>

          <div className="agenda-tab__entry-row-3">
            <div>
              <div className="field-label">时间</div>
              <TimeRangePicker
                format={TIME_FORMAT}
                style={{ width: '100%' }}
                value={[timeToDayjs(entry.time_start), timeToDayjs(entry.time_end)]}
                onChange={(vals) => updateEntry(dayIndex, groupIndex, entryIndex, { time_start: vals?.[0]?.format(TIME_FORMAT) ?? '', time_end: vals?.[1]?.format(TIME_FORMAT) ?? '' })}
                placeholder={['开始', '结束']}
              />
            </div>
            <div>
              <div className="field-label">类型</div>
              <AutoComplete
                style={{ width: '100%' }}
                options={ENTRY_TYPE_OPTIONS as any}
                value={toTypeDisplayValue(entry.type)}
                onChange={(value) => updateEntry(dayIndex, groupIndex, entryIndex, { type: toTypeStoredValue(value) as ActivityAgendaEntry['type'] })}
                filterOption={(inputValue, option) => String(option?.value || '').toLowerCase().includes(inputValue.toLowerCase()) || String(option?.label || '').toLowerCase().includes(inputValue.toLowerCase())}
              >
                <Input allowClear placeholder="选择或输入类型" />
              </AutoComplete>
            </div>
            <div>
              <div className="field-label">标签</div>
              <Input value={entry.tag} onChange={(e) => updateEntry(dayIndex, groupIndex, entryIndex, { tag: e.target.value })} placeholder="可选" />
            </div>
          </div>

          <div>
            <div className="field-label">标题</div>
            <Input value={entry.title} onChange={(e) => updateEntry(dayIndex, groupIndex, entryIndex, { title: e.target.value })} placeholder="议程标题" />
          </div>

          <div className="agenda-tab__entry-row-3">
            <div>
              <div className="field-label">演讲人</div>
              <Input
                value={entry.speaker?.name}
                onChange={(e) => updateEntry(dayIndex, groupIndex, entryIndex, { speaker: { ...(entry.speaker || { name: '', title: '', avatar: '' }), name: e.target.value } })}
                placeholder="姓名"
              />
            </div>
            <div>
              <div className="field-label">头衔</div>
              <Input
                value={entry.speaker?.title}
                onChange={(e) => updateEntry(dayIndex, groupIndex, entryIndex, { speaker: { ...(entry.speaker || { name: '', title: '', avatar: '' }), title: e.target.value } })}
                placeholder="头衔"
              />
            </div>
            <div>
              <div className="field-label">地点</div>
              <Input value={entry.location} onChange={(e) => updateEntry(dayIndex, groupIndex, entryIndex, { location: e.target.value })} placeholder="可选" />
            </div>
          </div>

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
  )
}
