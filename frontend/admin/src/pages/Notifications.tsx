import { useEffect, useState } from 'react'
import { Button, Card, Drawer, Form, InputNumber, Select, Table } from 'antd'
import { listLogs, preview } from '../services/notifications'

export default function Notifications() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<number | undefined>(undefined)
  const [limit, setLimit] = useState(50)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  const [previewData, setPreviewData] = useState<any | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await listLogs({ user_id: userId, limit })
      setData(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, limit])

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>通知日志</div>
      <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }}>
        用户ID：<InputNumber value={userId} onChange={(v) => setUserId(v || undefined)} style={{ width: 160 }} />
        &nbsp;&nbsp;条数：<InputNumber min={1} max={200} value={limit} onChange={(v) => setLimit((v as number) || 50)} />
        &nbsp;&nbsp;<Button onClick={load}>刷新</Button>
        &nbsp;&nbsp;<Button type="primary" onClick={() => { setPreviewData(null); form.resetFields(); setOpen(true) }}>生成预览</Button>
      </Card>
      <Table
        rowKey="id"
        loading={loading}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 80 },
          { title: '渠道', dataIndex: 'channel', width: 100 },
          { title: '事件', dataIndex: 'event', width: 160 },
          { title: '状态', dataIndex: 'status', width: 120 },
          { title: '用户', dataIndex: 'user_id', width: 100 },
          { title: '活动', dataIndex: 'activity_id', width: 100 },
          { title: '创建时间', dataIndex: 'created_at', width: 200 },
          { title: '发送时间', dataIndex: 'sent_at', width: 200 },
          { title: '重试', dataIndex: 'retry_count', width: 80 },
          { title: '错误', dataIndex: 'error_message' },
        ]}
        dataSource={data}
      />

      <Drawer title="通知预览" open={open} onClose={() => setOpen(false)} width={520}
        extra={<Button type="primary" onClick={async () => {
          const values = await form.validateFields()
          const res = await preview(values)
          setPreviewData(res)
        }}>生成</Button>}
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="渠道" name="channel" rules={[{ required: true }]}>
            <Select options={[{label:'WECHAT', value:'wechat'},{label:'EMAIL', value:'email'},{label:'SMS', value:'sms'}]} />
          </Form.Item>
          <Form.Item label="事件" name="event" rules={[{ required: true }]}>
            <Select options={[
              {label:'signup_submitted', value:'signup_submitted'},
              {label:'signup_approved', value:'signup_approved'},
              {label:'signup_rejected', value:'signup_rejected'},
              {label:'signup_reminder', value:'signup_reminder'},
              {label:'checkin_reminder', value:'checkin_reminder'},
            ]} />
          </Form.Item>
          <Form.Item label="用户ID" name="user_id"><InputNumber style={{width:'100%'}} /></Form.Item>
          <Form.Item label="活动ID" name="activity_id"><InputNumber style={{width:'100%'}} /></Form.Item>
          <Form.Item label="报名ID" name="signup_id"><InputNumber style={{width:'100%'}} /></Form.Item>
        </Form>
        {previewData ? (
          <pre style={{ background:'#f7f8fa', padding:12, borderRadius:8, overflow:'auto' }}>{JSON.stringify(previewData, null, 2)}</pre>
        ) : null}
      </Drawer>
    </div>
  )
}
