import { useEffect, useMemo, useState } from 'react'
import { Table, Button, Input, Segmented, Form, Select, message, Modal, DatePicker, Switch, Space, Popconfirm, Row, Col } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

function SearchCapsule({ onSearch, onChange }: { onSearch: (kw: string) => void; onChange?: (kw: string) => void }) {
  const [val, setVal] = useState('')
  const doSearch = () => onSearch(val.trim())
  return (
    <div className="search-pill" style={{ width: 380 }}>
      <Input
        allowClear
        bordered={false}
        prefix={<SearchOutlined />}
        placeholder="Search here"
        value={val}
        onChange={(e) => { const v = e.target.value; setVal(v); onChange?.(v); if (v === '') onSearch('') }}
        onPressEnter={doSearch}
        style={{ flex: 1, height: 40 }}
      />
      <Button type="primary" className="pill-btn" onClick={doSearch}>Search</Button>
    </div>
  )
}
import RichEditor from '../components/RichEditor'
import PageHeader from '../components/PageHeader'
import FilterBar from '../components/FilterBar'
import SectionCard from '../components/SectionCard'
import { listActivities, createActivity, updateActivity, deleteActivity, ActivityStatus } from '../services/activities'
import dayjs from 'dayjs'
import LocationSelect from '../components/LocationSelect'
import RegionCascader from '../components/RegionCascader'
import SectionPill from '../components/SectionPill'
import ImageUploader from '../components/ImageUploader'

const STATUS_LABEL: Record<ActivityStatus, string> = {
  draft: '草稿',
  scheduled: '计划中',
  published: '已发布',
  closed: '已结束',
  archived: '已归档',
}

const STATUS_COLORS: Record<ActivityStatus, string> = {
  draft: 'default',
  scheduled: 'processing',
  published: 'success',
  closed: 'warning',
  archived: 'default',
}

export default function Activities() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [statusSeg, setStatusSeg] = useState<'all' | ActivityStatus>('all')
  // 移除 Chips 过滤（后续如需再打开）
  const [province] = useState<string | undefined>(undefined)
  const [city] = useState<string | undefined>(undefined)
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [current, setCurrent] = useState<any | null>(null)
  const [form] = Form.useForm()

  const statuses = useMemo(() => (statusSeg === 'all' ? undefined : [statusSeg]), [statusSeg])

  // Region chips and filtered data
  const displayData = useMemo<any[]>(() => {
    let arr = data
    if (statusSeg !== 'all') arr = arr.filter((d) => d.status === statusSeg)
    if (keyword) arr = arr.filter((d) => (d.title || '').toLowerCase().includes(keyword.toLowerCase()))
    return arr
  }, [data, statusSeg, keyword])

  const load = async () => {
    setLoading(true)
    try {
      const res = await listActivities()
      setData(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onOpenCreate = () => {
    setIsEditing(false)
    setCurrent(null)
    form.resetFields()
    form.setFieldsValue({ status: 'draft', approval_required: true })
    setModalOpen(true)
  }

  const onEdit = (record: any) => {
    setIsEditing(true)
    setCurrent(record)
    form.resetFields()
    form.setFieldsValue({
      title: record.title,
      subtitle: record.subtitle,
      city: record.city,
      location: record.location,
      status: record.status,
      tags: record.tags,
      description: record.description,
      approval_required: record.approval_required,
      require_payment: record.require_payment,
      payment_note: record?.extra?.payment_note,
      cover_image_data: record?.extra?.cover_image_data,
      payment_qr_data: record?.extra?.payment_qr_data,
      region: record?.extra?.region_path,
      meeting_range: record.start_time && record.end_time ? [dayjs(record.start_time), dayjs(record.end_time)] : undefined,
      signup_range: record.signup_start_time && record.signup_end_time ? [dayjs(record.signup_start_time), dayjs(record.signup_end_time)] : undefined,
      checkin_range: record.checkin_start_time && record.checkin_end_time ? [dayjs(record.checkin_start_time), dayjs(record.checkin_end_time)] : undefined,
      // max_participants removed per latest design
    })
    setModalOpen(true)
  }

  // disable and clear payment fields when switch is off
  const requirePayment = Form.useWatch('require_payment', form)
  useEffect(() => {
    if (!requirePayment) {
      form.setFieldsValue({ payment_note: undefined, payment_qr_data: undefined })
    }
  }, [requirePayment])

  const buildPayload = (v: any) => {
    const payload: any = {
      title: v.title,
      subtitle: v.subtitle,
      city: (v.region && v.region[1]) || v.city,
      location: v.location,
      status: v.status,
      start_time: v.meeting_range?.[0] ? v.meeting_range[0].toISOString() : undefined,
      end_time: v.meeting_range?.[1] ? v.meeting_range[1].toISOString() : undefined,
      signup_start_time: v.signup_range?.[0] ? v.signup_range[0].toISOString() : undefined,
      signup_end_time: v.signup_range?.[1] ? v.signup_range[1].toISOString() : undefined,
      checkin_start_time: v.checkin_range?.[0] ? v.checkin_range[0].toISOString() : undefined,
      checkin_end_time: v.checkin_range?.[1] ? v.checkin_range[1].toISOString() : undefined,
      approval_required: v.approval_required,
      require_payment: v.require_payment,
      // removed per latest design
      tags: v.tags,
      description: v.description,
      agenda: v.agenda,
      extra: {
        ...(isEditing && current?.extra ? current.extra : {}),
        ...(v.payment_note ? { payment_note: v.payment_note } : {}),
        ...(v.region ? { region_path: v.region } : {}),
        ...(v.cover_image_data ? { cover_image_data: v.cover_image_data } : {}),
        ...(v.payment_qr_data ? { payment_qr_data: v.payment_qr_data } : {}),
        ...(v.group_qr_data ? { group_qr_data: v.group_qr_data } : {}),
      },
    }
    return payload
  }

  const onSubmit = async () => {
    const v = await form.validateFields()
    const payload = buildPayload(v)
    try {
      if (isEditing && current) {
        await updateActivity(current.id, payload)
        message.success('已更新活动')
      } else {
        await createActivity({ ...payload, form_fields: [] })
        message.success('已创建活动')
      }
      setModalOpen(false)
      load()
    } catch (e: any) {
      message.error(e?.response?.data?.detail || (isEditing ? '更新失败' : '创建失败'))
    }
  }

  return (
    <div>
      <PageHeader title="活动创建" extra={<Button type="primary" onClick={onOpenCreate}>+ 新活动</Button>} />
      {/* 顶部筛选与搜索 */}
      <FilterBar plain style={{ marginBottom: 12 }}>
        <Segmented
          options={[
            { label: '全部', value: 'all' },
            { label: '草稿', value: 'draft' },
            { label: '计划中', value: 'scheduled' },
            { label: '已发布', value: 'published' },
            { label: '已结束', value: 'closed' },
            { label: '已归档', value: 'archived' },
          ]}
          value={statusSeg}
          onChange={(v) => setStatusSeg(v as any)}
        />
        <SearchCapsule onSearch={(kw) => setKeyword(kw)} onChange={(kw) => setKeyword(kw)} />
      </FilterBar>

      <SectionCard>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 8, gap: 12, flexWrap: 'wrap' }}>
          <Space>
            <span>已选 {selectedRowKeys.length} 项</span>
            <Popconfirm
              title="确认批量删除？"
              okText="删除"
              cancelText="取消"
              okButtonProps={{ danger: true }}
              onConfirm={async () => {
                if (!selectedRowKeys.length) return
                try {
                  for (const id of selectedRowKeys) {
                    await deleteActivity(id as number)
                  }
                  message.success(`已删除 ${selectedRowKeys.length} 项`)
                  setSelectedRowKeys([])
                  await load()
                } catch (e: any) {
                  message.error(e?.response?.data?.detail || '批量删除失败')
                }
              }}
            >
              <Button className="pill-action pill-delete" size="small" disabled={!selectedRowKeys.length}>批量删除</Button>
            </Popconfirm>
            {/* 删除“清除选择”按钮，功能重复 */}
            {/* <Button className="pill-action" size="small" onClick={() => setSelectedRowKeys([])} disabled={!selectedRowKeys.length}>清除选择</Button> */}
          </Space>
        </div>
        <Table
          rowKey="id"
          loading={loading}
          rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys as (string | number)[]) }}
          columns={[
            { title: '标题', dataIndex: 'title' },
            { title: '城市', dataIndex: 'city', width: 120 },
            {
              title: '状态',
              dataIndex: 'status',
              width: 120,
              render: (v: ActivityStatus) => <span className={`status-grad grad-${v}`}>{STATUS_LABEL[v]}</span>,
            },
            { title: '创建时间', dataIndex: 'created_at', width: 200 },
            {
              title: '操作',
              width: 200,
              render: (_: any, record: any) => (
                <Space>
                  <Button size="small" className="pill-action pill-edit" onClick={() => onEdit(record)}>编辑</Button>
                  <Popconfirm
                    title="确认删除该活动？"
                    okText="删除"
                    cancelText="取消"
                    okButtonProps={{ danger: true }}
                    onConfirm={async () => {
                      try {
                        await deleteActivity(record.id)
                        message.success('已删除')
                        setSelectedRowKeys((keys) => keys.filter((k) => k !== record.id))
                        await load()
                      } catch (e: any) {
                        message.error(e?.response?.data?.detail || '删除失败')
                      }
                    }}
                  >
                    <Button size="small" className="pill-action pill-delete">删除</Button>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
          dataSource={displayData}
        />
      </SectionCard>

      {/* 新建/编辑弹窗（统一样式） */}
      <Modal title={isEditing ? '编辑活动' : '新建活动'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={onSubmit} okText={isEditing ? '保存' : '创建'} width={980} destroyOnClose>
        <Form form={form} layout="vertical" initialValues={{ status: 'draft', approval_required: true }}>
          <SectionCard>
            <SectionPill color="brand" style={{ marginTop: 0 }}>基本信息</SectionPill>
            <Row gutter={[12, 12]}>
              <Col span={24}>
                <Form.Item label="活动标题" name="title" rules={[{ required: true, message: '请输入活动标题' }]}> 
                  <Input placeholder="例如：高校品牌沙龙·长沙" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Space size={16} wrap>
                  <div style={{ width: 200 }}>
                    <Form.Item label="封面图" name="cover_image_data" valuePropName="value"><ImageUploader /></Form.Item>
                  </div>
                  <div style={{ width: 200 }}>
                    <Form.Item label="活动群二维码" name="group_qr_data" valuePropName="value"><ImageUploader /></Form.Item>
                  </div>
                  <div style={{ width: 200 }}>
                    <Form.Item label="缴费二维码" name="payment_qr_data" valuePropName="value">
                      <ImageUploader disabled={!requirePayment} />
                    </Form.Item>
                  </div>
                </Space>
              </Col>
              <Col span={24}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <SectionPill color="orange">是否缴费</SectionPill>
                  <Form.Item name="require_payment" valuePropName="checked" style={{ margin: 0 }}>
                    <Switch />
                  </Form.Item>
                </div>
              </Col>
              <Col span={24}>
                <Form.Item noStyle shouldUpdate={(prev, cur) => prev.require_payment !== cur.require_payment}>
                  {({ getFieldValue }) => (
                    <Form.Item label="缴费链接" name="payment_note">
                      <Input placeholder="填写缴费链接" disabled={!getFieldValue('require_payment')} />
                    </Form.Item>
                  )}
                </Form.Item>
              </Col>
              <Col span={24}><Form.Item label="标签" name="tags"><Select mode="tags" placeholder="输入或选择标签" options={[{label:'论坛',value:'论坛'},{label:'峰会',value:'峰会'},{label:'交流会',value:'交流会'}]} /></Form.Item></Col>
              <Col span={24}><Form.Item label="简介" name="subtitle"><Input placeholder="一句话简介（可选）" /></Form.Item></Col>
              <Col span={12}>
                <Form.Item label="所在地区" name="region">
                  <RegionCascader />
                </Form.Item>
              </Col>
              <Col span={16}>
                <Form.Item noStyle shouldUpdate={(prev, cur) => prev.region !== cur.region}>
                  {({ getFieldValue }) => (
                    <Form.Item label="地点" name="location">
                      <LocationSelect placeholder="选择常用场地或自定义输入" regionPath={getFieldValue('region')} />
                    </Form.Item>
                  )}
                </Form.Item>
              </Col>
              <Col span={24}><Form.Item label="详情内容" name="description"><RichEditor placeholder="详细介绍、流程与须知" /></Form.Item></Col>
            </Row>

            <SectionPill color="green">时间设置</SectionPill>
            <Row gutter={[16, 16]}>
              <Col span={8}><Form.Item label="报名时间" name="signup_range"><DatePicker.RangePicker showTime format="MM/DD HH:mm" style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={8}><Form.Item label="签到时间" name="checkin_range"><DatePicker.RangePicker showTime format="MM/DD HH:mm" style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={8}><Form.Item label="会议时间" name="meeting_range"><DatePicker.RangePicker showTime format="MM/DD HH:mm" style={{ width: '100%' }} /></Form.Item></Col>
            </Row>

            <SectionPill color="orange">发布与审核</SectionPill>
            <Row gutter={[16, 16]} align="middle">
              <Col span={6}>
                <Form.Item label="状态" name="status" rules={[{ required: true }]}>
                  <Select options={[
                    { label: '草稿', value: 'draft' },
                    { label: '即将开始（计划中）', value: 'scheduled' },
                    { label: '报名中（已发布）', value: 'published' },
                    { label: '已结束', value: 'closed' },
                    { label: '已归档', value: 'archived' },
                  ]} />
                </Form.Item>
              </Col>
              <Col span={6}><Form.Item label="需要审核" name="approval_required" valuePropName="checked"><Switch /></Form.Item></Col>
            </Row>
          </SectionCard>
        </Form>
      </Modal>
    </div>
  )
}
