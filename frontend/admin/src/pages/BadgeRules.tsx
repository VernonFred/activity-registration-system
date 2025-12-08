import { useEffect, useState } from 'react'
import { Table, Button, Tag, Drawer, Form, Input, Select, Switch, InputNumber, Space, message } from 'antd'
import { listRules, createRule, updateRule, deleteRule, previewRule, BadgeRuleType } from '../services/badgeRules'
import { listBadges } from '../services/badges'

const RULE_OPTIONS: { label: string; value: BadgeRuleType }[] = [
  { label: '首次审批通过', value: 'first_approved' },
  { label: '累计审批通过', value: 'total_approved' },
  { label: '累计签到', value: 'total_checked_in' },
  { label: '活动标签累计', value: 'activity_tag_attendance' },
]

export default function BadgeRules() {
  const [rules, setRules] = useState<any[]>([])
  const [badges, setBadges] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form] = Form.useForm()

  const load = async () => {
    setLoading(true)
    try {
      const [r, b] = await Promise.all([listRules(), listBadges()])
      setRules(r)
      setBadges(b)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onCreate = () => {
    setEditing(null)
    form.resetFields()
    setOpen(true)
  }
  const onEdit = (record: any) => {
    setEditing(record)
    form.setFieldsValue({
      name: record.name,
      rule_type: record.rule_type,
      badge_id: record.badge_id,
      threshold: record.threshold,
      activity_tag_scope: record.activity_tag_scope,
      is_active: record.is_active,
    })
    setOpen(true)
  }
  const onDelete = async (record: any) => {
    await deleteRule(record.id)
    message.success('已删除规则')
    load()
  }
  const submit = async () => {
    const values = await form.validateFields()
    try {
      if (editing) {
        await updateRule(editing.id, values)
      } else {
        await createRule({ ...values, is_active: true })
      }
      message.success('已保存')
      setOpen(false)
      load()
    } catch (e: any) {
      message.error(e?.response?.data?.detail || '操作失败')
    }
  }

  const onPreview = async (record: any) => {
    try {
      const res = await previewRule(record.id, { user_id: 1 })
      message.info(res.eligible ? '当前用户满足规则（示例 user_id=1）' : '未满足')
    } catch (e: any) {
      message.error(e?.response?.data?.detail || '预览失败')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 600 }}>徽章规则</div>
        <Button type="primary" onClick={onCreate}>新建规则</Button>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        columns={[
          { title: '名称', dataIndex: 'name' },
          { title: '类型', dataIndex: 'rule_type', render: (v) => <Tag>{v}</Tag> },
          { title: '徽章ID', dataIndex: 'badge_id' },
          { title: '阈值', dataIndex: 'threshold' },
          { title: '启用', dataIndex: 'is_active', render: (v) => (v ? <Tag color="green">ON</Tag> : <Tag color="red">OFF</Tag>) },
          {
            title: '操作',
            width: 220,
            render: (_: any, record: any) => (
              <Space>
                <Button type="link" onClick={() => onEdit(record)}>编辑</Button>
                <Button type="link" onClick={() => onPreview(record)}>预览</Button>
                <Button type="link" danger onClick={() => onDelete(record)}>删除</Button>
              </Space>
            ),
          },
        ]}
        dataSource={rules}
      />

      <Drawer
        title={editing ? '编辑规则' : '新建规则'}
        open={open}
        onClose={() => setOpen(false)}
        width={520}
        destroyOnClose
        extra={<Button type="primary" onClick={submit}>{editing ? '保存' : '创建'}</Button>}
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="规则名称" name="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="例如：首次参会" />
          </Form.Item>
          <Form.Item label="规则类型" name="rule_type" rules={[{ required: true }]}>
            <Select options={RULE_OPTIONS} placeholder="选择规则类型" />
          </Form.Item>
          <Form.Item label="目标徽章" name="badge_id" rules={[{ required: true, message: '请选择徽章' }]}>
            <Select options={badges.map((b) => ({ label: `${b.name} (${b.code})`, value: b.id }))} showSearch optionFilterProp="label" />
          </Form.Item>
          <Form.Item label="阈值（可选）" name="threshold">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="根据类型填写，如累计次数阈值" />
          </Form.Item>
          <Form.Item label="标签范围（仅用于活动标签累计）" name="activity_tag_scope">
            <Select mode="tags" placeholder="输入或选择标签" />
          </Form.Item>
          <Form.Item label="启用" name="is_active" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  )
}
