// 顶部 import：增加生成器与样式，移除未使用的 useMemo
import { useEffect, useState } from 'react'
import { Button, Space, Table, Select, Input, Switch, Modal, Form, message } from 'antd'
import PageHeader from '../components/PageHeader'
import SectionCard from '../components/SectionCard'
import { listActivities, getActivity, updateActivity } from '../services/activities'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

type FieldType = 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'datetime' | 'number' | 'date' | 'time' | 'switch'
interface FieldOption { label: string; value: string }
interface FieldItem {
  id?: number
  name: string
  label: string
  field_type: FieldType
  required?: boolean
  options?: FieldOption[]
}

// 双向转换：后端字段结构 → x-render schema
function toFRSchema(fields: FieldItem[]) {
  const properties: Record<string, any> = {}
  fields.forEach((f) => {
    const base: any = { title: f.label }
    let prop: any = { ...base }
    switch (f.field_type) {
      case 'text':
        prop = { type: 'string', 'ui:widget': 'input', ...base }
        break
      case 'textarea':
        prop = { type: 'string', 'ui:widget': 'textarea', ...base }
        break
      case 'number':
        prop = { type: 'number', 'ui:widget': 'number', ...base }
        break
      case 'select':
        prop = {
          type: 'string',
          'ui:widget': 'select',
          enum: (f.options || []).map((o) => o.value),
          enumNames: (f.options || []).map((o) => o.label),
          ...base,
        }
        break
      case 'radio':
        prop = {
          type: 'string',
          'ui:widget': 'radio',
          enum: (f.options || []).map((o) => o.value),
          enumNames: (f.options || []).map((o) => o.label),
          ...base,
        }
        break
      case 'checkbox':
        prop = {
          type: 'array',
          items: { type: 'string' },
          'ui:widget': 'checkboxes',
          enum: (f.options || []).map((o) => o.value),
          enumNames: (f.options || []).map((o) => o.label),
          ...base,
        }
        break
      case 'date':
        prop = { type: 'string', 'ui:widget': 'date', ...base }
        break
      case 'time':
        prop = { type: 'string', 'ui:widget': 'time', ...base }
        break
      case 'datetime':
        prop = { type: 'string', 'ui:widget': 'dateTime', ...base }
        break
      case 'switch':
        prop = { type: 'boolean', 'ui:widget': 'switch', ...base }
        break
      default:
        prop = { type: 'string', 'ui:widget': 'input', ...base }
    }
    if (f.required) prop.required = true
    properties[f.name] = prop
  })
  return { type: 'object', properties }
}

// 双向转换：x-render schema → 后端字段结构
function fromFRSchema(schema: any): FieldItem[] {
  const properties = schema?.properties || {}
  return Object.entries(properties).map(([name, conf]: [string, any]) => {
    const widget = conf['ui:widget'] || conf.widget
    let field_type: FieldType = 'text'
    switch (widget) {
      case 'input': field_type = 'text'; break
      case 'textarea': field_type = 'textarea'; break
      case 'number': field_type = 'number'; break
      case 'select': field_type = 'select'; break
      case 'radio': field_type = 'radio'; break
      case 'checkboxes': field_type = 'checkbox'; break
      case 'date': field_type = 'date'; break
      case 'time': field_type = 'time'; break
      case 'dateTime': field_type = 'datetime'; break
      case 'switch': field_type = 'switch'; break
      default: field_type = 'text'
    }
    const options: FieldOption[] =
      (conf.enum || []).map((v: any, i: number) => ({ value: String(v), label: (conf.enumNames || [])[i] || String(v) }))
    return {
      name,
      label: conf.title || name,
      field_type,
      required: !!conf.required,
      options,
    }
  })
}

export default function FormDesigner() {
  const [activities, setActivities] = useState<any[]>([])
  const [activityId, setActivityId] = useState<number | undefined>(undefined)
  const [fields, setFields] = useState<FieldItem[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<FieldItem | null>(null)
  const [form] = Form.useForm()
  // 新增：生成器 schema（受控）
  const [frSchema, setFrSchema] = useState<any>({ type: 'object', properties: {} })

  useEffect(() => { listActivities({ limit: 100 }).then(setActivities).catch(()=>setActivities([])) }, [])
  useEffect(() => {
    if (!activityId) return
    setLoading(true)
    ;(async () => {
      try {
        const a = await getActivity(activityId)
        const serverFields = (a?.form_fields || []).map((f: any) => ({
          id: f.id, name: f.name, label: f.label, field_type: f.field_type, required: f.required,
          options: (f.options || []).map((o: any) => ({ label: o.label, value: o.value })),
        }))
        setFields(serverFields)
        setFrSchema(toFRSchema(serverFields))
      } catch {
        setFields([])
        setFrSchema({ type: 'object', properties: {} })
      } finally {
        setLoading(false)
      }
    })()
  }, [activityId])

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true) }
  const openEdit = (rec: FieldItem) => { setEditing(rec); form.setFieldsValue(rec); setModalOpen(true) }

  const saveField = async () => {
    const val = await form.validateFields()
    if (editing) {
      setFields((fs)=>fs.map((f)=>f===editing ? { ...editing, ...val } : f))
    } else {
      setFields((fs)=>[...fs, val])
    }
    setModalOpen(false)
  }

  const removeField = (idx: number) => setFields((fs)=>fs.filter((_,i)=>i!==idx))

  // 左侧控件库（作为模板，不直接持久化）
  const PALETTE: { type: FieldType; label: string; exampleName: string }[] = [
    { type: 'text', label: '单行文本', exampleName: 'text_field' },
    { type: 'textarea', label: '多行文本', exampleName: 'textarea_field' },
    { type: 'number', label: '数字', exampleName: 'number_field' },
    { type: 'select', label: '下拉选择', exampleName: 'select_field' },
    { type: 'radio', label: '单选', exampleName: 'radio_field' },
    { type: 'checkbox', label: '复选', exampleName: 'checkbox_field' },
    { type: 'date', label: '日期', exampleName: 'date_field' },
    { type: 'time', label: '时间', exampleName: 'time_field' },
    { type: 'datetime', label: '日期时间', exampleName: 'datetime_field' },
    { type: 'switch', label: '开关', exampleName: 'switch_field' },
  ]

  // 生成唯一字段名，避免重复
  const makeUniqueName = (base: string) => {
    const exists = new Set(fields.map((f) => f.name))
    let i = 1
    let name = `${base}_${i}`
    while (exists.has(name)) {
      i += 1
      name = `${base}_${i}`
    }
    return name
  }

  // 新增：后端字段类型映射与保存方法
  const toBackendType = (t: FieldType) => (t === 'checkbox' ? 'multi_select' : t)

  const persist = async () => {
    if (!activityId) {
      message.warning('请先选择活动')
      return
    }
    try {
      setLoading(true)
      const payload = {
        form_fields: fields.map((f, idx) => ({
          name: f.name,
          label: f.label,
          field_type: toBackendType(f.field_type),
          required: !!f.required,
          display_order: idx,
          options: (f.options || []).map((o, i) => ({
            label: o.label,
            value: o.value,
            display_order: i,
          })),
        })),
      }
      const updated = await updateActivity(activityId, payload)
      message.success('已保存表单')
      const serverFields = (updated?.form_fields || []).map((ff: any) => ({
        id: ff.id,
        name: ff.name,
        label: ff.label,
        field_type: ff.field_type === 'multi_select' ? 'checkbox' : ff.field_type,
        required: ff.required,
        options: (ff.options || []).map((o: any) => ({ label: o.label, value: o.value })),
      }))
      setFields(serverFields)
      setFrSchema(toFRSchema(serverFields))
    } catch (e: any) {
      message.error(e?.response?.data?.detail || '保存失败')
    } finally {
      setLoading(false)
    }
  }

  const onDragEnd = (result: any) => {
    const { source, destination } = result
    if (!destination) return

    // 画布内部排序
    if (source.droppableId === 'canvas' && destination.droppableId === 'canvas') {
      if (source.index === destination.index) return
      setFields((prev) => {
        const next = [...prev]
        const [moved] = next.splice(source.index, 1)
        next.splice(destination.index, 0, moved)
        return next
      })
      return
    }

    // 从控件库拖到画布：创建新字段
    if (source.droppableId === 'palette' && destination.droppableId === 'canvas') {
      const tpl = PALETTE[source.index]
      if (!tpl) return
      const newField: FieldItem = {
        name: makeUniqueName(tpl.exampleName),
        label: tpl.label,
        field_type: tpl.type,
        required: false,
        options: ['select', 'radio', 'checkbox'].includes(tpl.type) ? [] : [],
      }
      setFields((prev) => {
        const next = [...prev]
        next.splice(destination.index, 0, newField)
        return next
      })
      return
    }

    // 其他情况忽略
  }

  return (
    <div>
      <PageHeader title="表单设计" />
      {/* 顶部工具栏：放在卡片外 */}
      <Space style={{ marginBottom: 12, justifyContent: 'space-between', width: '100%' }}>
        <Select
          placeholder="选择活动"
          style={{ width: 320 }}
          options={activities.map((a: any) => ({ label: a.title, value: a.id }))}
          value={activityId}
          onChange={(v) => setActivityId(v)}
        />
        <Space>
          <Button className="pill-action" onClick={openCreate}>+ 新字段</Button>
          <Button className="pill-action" onClick={persist} type="primary">保存</Button>
        </Space>
      </Space>

      <SectionCard>
        {/* 一个 DragDropContext 包裹左右两栏，支持跨区域拖拽 */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display: 'flex', gap: 12 }}>
            {/* 控件库 */}
            <div style={{ width: 240 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>控件库</div>
              <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', padding: 8 }}>
                <Droppable
                  droppableId="palette"
                  isDropDisabled
                  type="FIELD"
                  direction="vertical"
                  renderClone={(provided, snapshot, rubric) => {
                    const p = PALETTE[rubric.source.index]
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          // 合并库注入的样式，保证位移生效
                          ...provided.draggableProps.style,
                          border: '1px dashed #e5e5e5',
                          borderRadius: 8,
                          padding: 10,
                          marginBottom: 8,
                          background: snapshot.isDragging ? '#fff' : '#fafafa',
                          boxShadow: snapshot.isDragging ? '0 6px 20px rgba(0,0,0,0.12)' : 'none',
                          cursor: 'grabbing',
                          userSelect: 'none',
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{p.label}</div>
                        <div style={{ color: '#888', fontSize: 12 }}>{p.type}</div>
                      </div>
                    )
                  }}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        border: snapshot.isDraggingOver ? '1px solid #1677ff' : '1px solid transparent',
                        borderRadius: 8,
                        transition: 'border 120ms ease',
                      }}
                    >
                      {PALETTE.map((p, idx) => (
                        <Draggable key={`palette-${p.type}-${idx}`} draggableId={`palette-${p.type}-${idx}`} index={idx}>
                          {(drag, snap) => (
                            <div
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              style={{
                                // 关键：合并 drag.draggableProps.style
                                ...drag.draggableProps.style,
                                border: '1px dashed #e5e5e5',
                                borderRadius: 8,
                                padding: 10,
                                marginBottom: 8,
                                background: snap.isDragging ? '#fff' : '#fafafa',
                                boxShadow: snap.isDragging ? '0 6px 20px rgba(0,0,0,0.12)' : 'none',
                                cursor: snap.isDragging ? 'grabbing' : 'grab',
                                userSelect: 'none',
                              }}
                            >
                              <div style={{ fontWeight: 600 }}>{p.label}</div>
                              <div style={{ color: '#888', fontSize: 12 }}>{p.type}</div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>

            {/* 画布 */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>表单画布</div>
              <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', padding: 8, minHeight: 300 }}>
                <Droppable droppableId="canvas" type="FIELD" direction="vertical">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{
                        minHeight: 300,
                        border: snapshot.isDraggingOver ? '1px dashed #1677ff' : '1px dashed #f0f0f0',
                        borderRadius: 8,
                        transition: 'border 120ms ease',
                      }}
                    >
                      {fields.length === 0 && (
                        <div style={{ color: '#999', textAlign: 'center', padding: 24 }}>
                          拖拽左侧控件到此处生成字段
                        </div>
                      )}
                      {fields.map((f, idx) => (
                        <Draggable key={`${f.name}-${idx}`} draggableId={`${f.name}-${idx}`} index={idx}>
                          {(drag, snap) => (
                            <div
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              style={{
                                // 关键：合并 drag.draggableProps.style
                                ...drag.draggableProps.style,
                                border: '1px solid #f0f0f0',
                                borderRadius: 8,
                                padding: 12,
                                marginBottom: 8,
                                background: snap.isDragging ? '#fff' : '#fff',
                                boxShadow: snap.isDragging ? '0 6px 20px rgba(0,0,0,0.12)' : 'none',
                                cursor: snap.isDragging ? 'grabbing' : 'grab',
                                userSelect: 'none',
                              }}
                            >
                              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontWeight: 600 }}>{f.label}</span>
                                  <span style={{ color: '#888' }}>
                                    {f.name} · {f.field_type} · {f.required ? '必填' : '可选'}
                                  </span>
                                  <span style={{ color: '#888' }}>
                                    {(f.options || []).map((o) => o.label || o.value).join('、') || '-'}
                                  </span>
                                </div>
                                <Space>
                                  <Button size="small" className="pill-action pill-edit" onClick={() => openEdit(f)}>编辑</Button>
                                  <Button size="small" className="pill-action pill-delete" danger onClick={() => removeField(idx)}>删除</Button>
                                </Space>
                              </Space>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          </div>
        </DragDropContext>
      </SectionCard>

      {/* 弹窗：绑定 onOk，修复“确定无反馈” */}
      <Modal title={editing ? '编辑字段' : '新建字段'} open={modalOpen} onOk={saveField} onCancel={()=>setModalOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="字段名" rules={[{ required: true }]}><Input placeholder="如：lodging_arrangement" /></Form.Item>
          <Form.Item name="label" label="标签" rules={[{ required: true }]}><Input placeholder="如：住宿安排" /></Form.Item>
          <Form.Item name="field_type" label="类型" rules={[{ required: true }]}>
            <Select options={[
              {label:'文本', value:'text'},{label:'多行文本', value:'textarea'},
              {label:'下拉选择', value:'select'},{label:'单选', value:'radio'},
              {label:'复选', value:'checkbox'},{label:'日期时间', value:'datetime'},
            ]} />
          </Form.Item>
          <Form.Item name="required" label="必填" valuePropName="checked"><Switch /></Form.Item>
          <Form.Item shouldUpdate noStyle>
            {() => {
              const t = form.getFieldValue('field_type')
              if (t === 'select' || t === 'radio' || t === 'checkbox') {
                return (
                  <Form.List name="options">
                    {(fieldsOpts, { add, remove }) => (
                      <div>
                        <Space style={{ marginBottom: 8 }}>
                          <Button size="small" onClick={() => add({ label: '', value: '' })}>+ 添加选项</Button>
                        </Space>
                        {fieldsOpts.map(({ key, name, ...restField }) => (
                          <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="start">
                            <Form.Item {...restField} name={[name, 'label']} rules={[{ required: true }]}>
                              <Input placeholder="选项标签" />
                            </Form.Item>
                            <Form.Item {...restField} name={[name, 'value']} rules={[{ required: true }]}>
                              <Input placeholder="选项值" />
                            </Form.Item>
                            <Button danger size="small" onClick={() => remove(name)}>删除</Button>
                          </Space>
                        ))}
                      </div>
                    )}
                  </Form.List>
                )
              }
              return null
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}