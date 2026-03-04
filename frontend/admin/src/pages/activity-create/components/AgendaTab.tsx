import { Button, Col, Input, Row, Select, Space } from 'antd'
import RichEditor from '../../../components/RichEditor'
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
    <div style={{ display: 'grid', gap: 16 }}>
      <SectionCard>
        <div className="field-label" style={{ marginBottom: 8 }}>议程摘要</div>
        <RichEditor
          value={state.agendaSummary}
          onChange={(agendaSummary) => onChange({ ...state, agendaSummary })}
          placeholder="填写议程摘要与说明"
        />
      </SectionCard>

      {state.extra.agenda_blocks.map((day, dayIndex) => (
        <SectionCard key={day.id || `agenda-day-${dayIndex}`}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <div className="field-label">议程日 {dayIndex + 1}</div>
              <Button danger onClick={() => removeDay(dayIndex)}>删除议程日</Button>
            </Space>

            <Row gutter={[12, 12]}>
              <Col xs={24} md={14}>
                <div className="field-label" style={{ marginBottom: 8 }}>显示日期</div>
                <Input
                  value={day.display_date}
                  onChange={(e) => updateDay(dayIndex, { display_date: e.target.value })}
                  placeholder="例如：2025年11月12日（第一天）"
                />
              </Col>
              <Col xs={24} md={10}>
                <div className="field-label" style={{ marginBottom: 8 }}>日期（可选）</div>
                <Input
                  value={day.date}
                  onChange={(e) => updateDay(dayIndex, { date: e.target.value })}
                  placeholder="例如：2025-11-12"
                />
              </Col>
            </Row>

            {day.groups.map((group, groupIndex) => (
              <div key={group.id || `agenda-group-${dayIndex}-${groupIndex}`} className="activity-builder-card">
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <div className="field-label">议程分组 {groupIndex + 1}</div>
                    <Button danger type="text" onClick={() => removeGroup(dayIndex, groupIndex)}>删除分组</Button>
                  </Space>

                  <Row gutter={[12, 12]}>
                    <Col xs={24} md={12}>
                      <div className="field-label" style={{ marginBottom: 8 }}>分组标题</div>
                      <Input
                        value={group.title}
                        onChange={(e) => updateGroup(dayIndex, groupIndex, { title: e.target.value })}
                        placeholder="例如：开幕仪式 / 主旨报告"
                      />
                    </Col>
                    <Col xs={24} md={6}>
                      <div className="field-label" style={{ marginBottom: 8 }}>开始时间</div>
                      <Input
                        value={group.time_start}
                        onChange={(e) => updateGroup(dayIndex, groupIndex, { time_start: e.target.value })}
                        placeholder="09:00"
                      />
                    </Col>
                    <Col xs={24} md={6}>
                      <div className="field-label" style={{ marginBottom: 8 }}>结束时间</div>
                      <Input
                        value={group.time_end}
                        onChange={(e) => updateGroup(dayIndex, groupIndex, { time_end: e.target.value })}
                        placeholder="09:30"
                      />
                    </Col>
                    <Col xs={24} md={12}>
                      <div className="field-label" style={{ marginBottom: 8 }}>主持人姓名</div>
                      <Input
                        value={group.moderator?.name}
                        onChange={(e) => updateGroup(dayIndex, groupIndex, {
                          moderator: {
                            ...(group.moderator || { name: '', title: '' }),
                            name: e.target.value,
                          },
                        })}
                        placeholder="主持人姓名（可选）"
                      />
                    </Col>
                    <Col xs={24} md={12}>
                      <div className="field-label" style={{ marginBottom: 8 }}>主持人头衔</div>
                      <Input
                        value={group.moderator?.title}
                        onChange={(e) => updateGroup(dayIndex, groupIndex, {
                          moderator: {
                            ...(group.moderator || { name: '', title: '' }),
                            title: e.target.value,
                          },
                        })}
                        placeholder="主持人头衔（可选）"
                      />
                    </Col>
                  </Row>

                  {group.items.map((entry, entryIndex) => (
                    <div key={entry.id || `agenda-entry-${dayIndex}-${groupIndex}-${entryIndex}`} className="activity-builder-subcard">
                      <Space direction="vertical" size={10} style={{ width: '100%' }}>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <div className="field-label">议程项 {entryIndex + 1}</div>
                          <Button danger type="text" onClick={() => removeEntry(dayIndex, groupIndex, entryIndex)}>删除议程项</Button>
                        </Space>

                        <Row gutter={[12, 12]}>
                          <Col xs={24} md={6}>
                            <div className="field-label" style={{ marginBottom: 8 }}>开始时间</div>
                            <Input
                              value={entry.time_start}
                              onChange={(e) => updateEntry(dayIndex, groupIndex, entryIndex, { time_start: e.target.value })}
                              placeholder="09:00"
                            />
                          </Col>
                          <Col xs={24} md={6}>
                            <div className="field-label" style={{ marginBottom: 8 }}>结束时间</div>
                            <Input
                              value={entry.time_end}
                              onChange={(e) => updateEntry(dayIndex, groupIndex, entryIndex, { time_end: e.target.value })}
                              placeholder="09:30"
                            />
                          </Col>
                          <Col xs={24} md={6}>
                            <div className="field-label" style={{ marginBottom: 8 }}>类型</div>
                            <Select
                              style={{ width: '100%' }}
                              value={entry.type}
                              options={ENTRY_TYPE_OPTIONS as any}
                              onChange={(type) => updateEntry(dayIndex, groupIndex, entryIndex, { type })}
                            />
                          </Col>
                          <Col xs={24} md={6}>
                            <div className="field-label" style={{ marginBottom: 8 }}>标签</div>
                            <Input
                              value={entry.tag}
                              onChange={(e) => updateEntry(dayIndex, groupIndex, entryIndex, { tag: e.target.value })}
                              placeholder="可选标签"
                            />
                          </Col>
                          <Col span={24}>
                            <div className="field-label" style={{ marginBottom: 8 }}>标题</div>
                            <Input
                              value={entry.title}
                              onChange={(e) => updateEntry(dayIndex, groupIndex, entryIndex, { title: e.target.value })}
                              placeholder="议程标题"
                            />
                          </Col>
                          <Col xs={24} md={12}>
                            <div className="field-label" style={{ marginBottom: 8 }}>演讲人姓名</div>
                            <Input
                              value={entry.speaker?.name}
                              onChange={(e) => updateEntry(dayIndex, groupIndex, entryIndex, {
                                speaker: {
                                  ...(entry.speaker || { name: '', title: '', avatar: '' }),
                                  name: e.target.value,
                                },
                              })}
                              placeholder="演讲人姓名（可选）"
                            />
                          </Col>
                          <Col xs={24} md={12}>
                            <div className="field-label" style={{ marginBottom: 8 }}>演讲人头衔</div>
                            <Input
                              value={entry.speaker?.title}
                              onChange={(e) => updateEntry(dayIndex, groupIndex, entryIndex, {
                                speaker: {
                                  ...(entry.speaker || { name: '', title: '', avatar: '' }),
                                  title: e.target.value,
                                },
                              })}
                              placeholder="演讲人头衔（可选）"
                            />
                          </Col>
                          <Col span={24}>
                            <div className="field-label" style={{ marginBottom: 8 }}>地点</div>
                            <Input
                              value={entry.location}
                              onChange={(e) => updateEntry(dayIndex, groupIndex, entryIndex, { location: e.target.value })}
                              placeholder="地点（可选）"
                            />
                          </Col>
                          <Col span={24}>
                            <div className="field-label" style={{ marginBottom: 8 }}>描述</div>
                            <Input.TextArea
                              value={entry.description}
                              onChange={(e) => updateEntry(dayIndex, groupIndex, entryIndex, { description: e.target.value })}
                              placeholder="描述（可选）"
                              autoSize={{ minRows: 2, maxRows: 5 }}
                            />
                          </Col>
                        </Row>
                      </Space>
                    </div>
                  ))}

                  <Button onClick={() => updateGroup(dayIndex, groupIndex, { items: [...group.items, createEmptyAgendaEntry()] })}>
                    新增议程项
                  </Button>
                </Space>
              </div>
            ))}

            <Button onClick={() => updateDay(dayIndex, { groups: [...day.groups, createEmptyAgendaGroup()] })}>新增分组</Button>
          </Space>
        </SectionCard>
      ))}

      <Button type="dashed" onClick={() => updateAgendaBlocks([...state.extra.agenda_blocks, createEmptyAgendaDay()])}>
        新增议程日
      </Button>
    </div>
  )
}
