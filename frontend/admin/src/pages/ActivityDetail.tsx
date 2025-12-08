import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Col, Descriptions, Divider, Form, Input, message, Row, Segmented, Space, Table, Tag } from 'antd'
import { getActivity, getActivityStats, updateActivity, exportSignups, exportCommentsCsv, exportSharesCsv } from '../services/activities'
import { listSignups } from '../services/signups'
import { getEngagement } from '../services/engagements'
import { getActivityReport } from '../services/reports'
import RichEditor from '../components/RichEditor'
import PageHeader from '../components/PageHeader'
import SectionCard from '../components/SectionCard'

export default function ActivityDetail() {
  const { id } = useParams()
  const activityId = Number(id)
  const [days, setDays] = useState(7)
  const [activity, setActivity] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [engagement, setEngagement] = useState<any>(null)
  const [signups, setSignups] = useState<any[]>([])
  const [series, setSeries] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  const fields = useMemo(() => activity?.form_fields || [], [activity])

  const load = async () => {
    const [a, s, e, r, su] = await Promise.all([
      getActivity(activityId),
      getActivityStats(activityId),
      getEngagement(activityId),
      getActivityReport(activityId, days),
      listSignups({ activity_id: activityId, limit: 200 }),
    ])
    setActivity(a)
    setStats(s)
    setEngagement(e)
    setSeries(r.time_series || [])
    setSignups(su)
    form.setFieldsValue({ description: a.description, agenda: a.agenda })
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, id])

  const dynamicColumns = fields.map((f: any) => ({
    title: f.label,
    dataIndex: ['answers'],
    render: (_: any, row: any) => {
      const ans = (row.answers || []).find((a: any) => a.field_id === f.id)
      return ans?.value_text || (ans?.value_json ? JSON.stringify(ans.value_json) : '')
    },
  }))

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '用户', dataIndex: ['form_snapshot', 'name'], width: 140 },
    { title: '手机号', dataIndex: ['form_snapshot', 'mobile'], width: 140 },
    { title: '状态', dataIndex: 'status', width: 120, render: (v: string) => <Tag color={v === 'approved' ? 'green' : v === 'rejected' ? 'red' : 'default'}>{v}</Tag> },
    { title: '签到', dataIndex: 'checkin_status', width: 120 },
    ...dynamicColumns,
    { title: '创建时间', dataIndex: 'created_at', width: 180 },
  ]

  const saveContent = async () => {
    const values = await form.validateFields()
    setSaving(true)
    try {
      await updateActivity(activityId, values)
      message.success('已保存')
    } finally {
      setSaving(false)
    }
  }

  const download = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <PageHeader
            title={activity?.title || '活动详情'}
            subtitle={`${activity?.city || ''} ${activity?.location || ''}`}
            extra={
              <Space>
                <Button onClick={async () => download(await exportSignups(activityId, 'csv'), `activity_${activityId}_signups.csv`)}>导出报名</Button>
                <Button onClick={async () => download(await exportCommentsCsv(activityId), `activity_${activityId}_comments.csv`)}>导出评论</Button>
                <Button onClick={async () => download(await exportSharesCsv(activityId), `activity_${activityId}_shares.csv`)}>导出分享</Button>
              </Space>
            }
          />
          <SectionCard>
            <Row gutter={16}>
              <Col span={8}>
                <Descriptions column={1} size="small" bordered>
                  <Descriptions.Item label="报名总数">{stats?.total_signups}</Descriptions.Item>
                  <Descriptions.Item label="通过">{stats?.status_counts?.approved}</Descriptions.Item>
                  <Descriptions.Item label="签到">{stats?.checkin_counts?.checked_in}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={8}>
                <Descriptions column={1} size="small" bordered>
                  <Descriptions.Item label="收藏">{engagement?.favorites}</Descriptions.Item>
                  <Descriptions.Item label="点赞">{engagement?.likes}</Descriptions.Item>
                  <Descriptions.Item label="分享">{engagement?.shares}</Descriptions.Item>
                  <Descriptions.Item label="评论">{engagement?.comments}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={8}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Segmented value={days} onChange={(v) => setDays(v as number)} options={[7, 14, 30]} />
                </div>
              </Col>
            </Row>
          </SectionCard>
        </Col>

        <Col span={24}>
          <SectionCard>
            <div className="page-title" style={{ fontSize: 16, marginBottom: 8 }}>报名明细</div>
            <Table rowKey="id" dataSource={signups} columns={columns as any} scroll={{ x: true }} pagination={{ pageSize: 10 }} />
          </SectionCard>
        </Col>

        <Col span={12}>
          <SectionCard>
            <div className="page-title" style={{ fontSize: 16, marginBottom: 8 }}>活动介绍</div>
            <Form form={form} layout="vertical">
              <Form.Item name="description">
                <RichEditor placeholder="输入活动介绍（支持富文本）" />
              </Form.Item>
            </Form>
            <div style={{ textAlign: 'right', marginTop: 8 }}><Button type="primary" loading={saving} onClick={saveContent}>保存</Button></div>
          </SectionCard>
        </Col>
        <Col span={12}>
          <SectionCard>
            <div className="page-title" style={{ fontSize: 16, marginBottom: 8 }}>议程/嘉宾</div>
            <Form form={form} layout="vertical">
              <Form.Item name="agenda">
                <RichEditor placeholder="输入活动议程/嘉宾（支持富文本）" />
              </Form.Item>
            </Form>
            <div style={{ textAlign: 'right', marginTop: 8 }}><Button type="primary" loading={saving} onClick={saveContent}>保存</Button></div>
          </SectionCard>
        </Col>
      </Row>
    </div>
  )
}
