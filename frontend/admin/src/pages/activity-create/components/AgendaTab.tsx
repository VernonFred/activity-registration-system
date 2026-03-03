import { Button, Col, Input, Row, Space } from 'antd'
import RichEditor from '../../../components/RichEditor'
import SectionCard from '../../../components/SectionCard'
import type { ActivityCreateFormState, AgendaBlock, AgendaGroup, AgendaItem } from '../types'
import { createEmptyAgendaBlock, createEmptyAgendaGroup, createEmptyAgendaItem } from '../types'

type Props = {
  state: ActivityCreateFormState
  onChange: (next: ActivityCreateFormState) => void
}

export default function AgendaTab({ state, onChange }: Props) {
  const updateAgendaBlocks = (agenda_blocks: AgendaBlock[]) => {
    onChange({
      ...state,
      extra: {
        ...state.extra,
        agenda_blocks,
      },
    })
  }

  const updateBlock = (blockIndex: number, patch: Partial<AgendaBlock>) => {
    const blocks = [...state.extra.agenda_blocks]
    blocks[blockIndex] = { ...blocks[blockIndex], ...patch }
    updateAgendaBlocks(blocks)
  }

  const updateGroup = (blockIndex: number, groupIndex: number, patch: Partial<AgendaGroup>) => {
    const blocks = [...state.extra.agenda_blocks]
    const groups = [...blocks[blockIndex].groups]
    groups[groupIndex] = { ...groups[groupIndex], ...patch }
    blocks[blockIndex] = { ...blocks[blockIndex], groups }
    updateAgendaBlocks(blocks)
  }

  const updateItem = (blockIndex: number, groupIndex: number, itemIndex: number, patch: Partial<AgendaItem>) => {
    const blocks = [...state.extra.agenda_blocks]
    const groups = [...blocks[blockIndex].groups]
    const items = [...groups[groupIndex].items]
    items[itemIndex] = { ...items[itemIndex], ...patch }
    groups[groupIndex] = { ...groups[groupIndex], items }
    blocks[blockIndex] = { ...blocks[blockIndex], groups }
    updateAgendaBlocks(blocks)
  }

  const removeBlock = (blockIndex: number) => {
    const next = state.extra.agenda_blocks.filter((_, index) => index !== blockIndex)
    updateAgendaBlocks(next.length ? next : [createEmptyAgendaBlock()])
  }

  const removeGroup = (blockIndex: number, groupIndex: number) => {
    const blocks = [...state.extra.agenda_blocks]
    const groups = blocks[blockIndex].groups.filter((_, index) => index !== groupIndex)
    blocks[blockIndex] = { ...blocks[blockIndex], groups: groups.length ? groups : [createEmptyAgendaGroup()] }
    updateAgendaBlocks(blocks)
  }

  const removeItem = (blockIndex: number, groupIndex: number, itemIndex: number) => {
    const blocks = [...state.extra.agenda_blocks]
    const groups = [...blocks[blockIndex].groups]
    const items = groups[groupIndex].items.filter((_, index) => index !== itemIndex)
    groups[groupIndex] = { ...groups[groupIndex], items: items.length ? items : [createEmptyAgendaItem()] }
    blocks[blockIndex] = { ...blocks[blockIndex], groups }
    updateAgendaBlocks(blocks)
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

      {state.extra.agenda_blocks.map((block, blockIndex) => (
        <SectionCard key={`agenda-block-${blockIndex}`}>
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <div className="field-label">议程日程块 {blockIndex + 1}</div>
              <Button danger onClick={() => removeBlock(blockIndex)}>删除日程块</Button>
            </Space>
            <Input
              value={block.day_label}
              onChange={(e) => updateBlock(blockIndex, { day_label: e.target.value })}
              placeholder="例如：第一天 / 7月21日"
            />

            {block.groups.map((group, groupIndex) => (
              <div key={`agenda-group-${blockIndex}-${groupIndex}`} className="activity-builder-card">
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <div className="field-label">分组 {groupIndex + 1}</div>
                    <Button danger type="text" onClick={() => removeGroup(blockIndex, groupIndex)}>删除分组</Button>
                  </Space>
                  <Input
                    value={group.title}
                    onChange={(e) => updateGroup(blockIndex, groupIndex, { title: e.target.value })}
                    placeholder="例如：上午场 / 主论坛"
                  />
                  {group.items.map((item, itemIndex) => (
                    <div key={`agenda-item-${blockIndex}-${groupIndex}-${itemIndex}`} className="activity-builder-subcard">
                      <Space direction="vertical" size={10} style={{ width: '100%' }}>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <div className="field-label">议程项 {itemIndex + 1}</div>
                          <Button danger type="text" onClick={() => removeItem(blockIndex, groupIndex, itemIndex)}>删除议程项</Button>
                        </Space>
                        <Row gutter={[12, 12]}>
                          <Col span={8}>
                            <Input value={item.time} onChange={(e) => updateItem(blockIndex, groupIndex, itemIndex, { time: e.target.value })} placeholder="时间" />
                          </Col>
                          <Col span={16}>
                            <Input value={item.location} onChange={(e) => updateItem(blockIndex, groupIndex, itemIndex, { location: e.target.value })} placeholder="地点（可选）" />
                          </Col>
                          <Col span={24}>
                            <Input value={item.title} onChange={(e) => updateItem(blockIndex, groupIndex, itemIndex, { title: e.target.value })} placeholder="议程标题" />
                          </Col>
                          <Col span={24}>
                            <Input.TextArea value={item.content} onChange={(e) => updateItem(blockIndex, groupIndex, itemIndex, { content: e.target.value })} placeholder="议程说明（可选）" autoSize={{ minRows: 2, maxRows: 5 }} />
                          </Col>
                        </Row>
                      </Space>
                    </div>
                  ))}
                  <Button onClick={() => updateGroup(blockIndex, groupIndex, { items: [...group.items, createEmptyAgendaItem()] })}>新增议程项</Button>
                </Space>
              </div>
            ))}
            <Button onClick={() => updateBlock(blockIndex, { groups: [...block.groups, createEmptyAgendaGroup()] })}>新增分组</Button>
          </Space>
        </SectionCard>
      ))}

      <Button type="dashed" onClick={() => updateAgendaBlocks([...state.extra.agenda_blocks, createEmptyAgendaBlock()])}>新增议程日程块</Button>
    </div>
  )
}
