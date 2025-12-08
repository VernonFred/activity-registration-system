import { useState } from 'react'
import { Button, Col, DatePicker, Form, Input, InputNumber, Row, Select, Switch, Tag, message } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import PageHeader from '../components/PageHeader'
import SectionCard from '../components/SectionCard'
import RichEditor from '../components/RichEditor'
import { createActivity } from '../services/activities'

export default function ActivityCreate() {
  const [saving, setSaving] = useState(false)
  const [desc, setDesc] = useState('')
  const [agenda, setAgenda] = useState('')
  const [form] = Form.useForm()

  const submit = async () => {
    const v = await form.validateFields()
    setSaving(true)
    try {
      const payload: any = {
        title: v.title,
        subtitle: v.subtitle,
        city: v.city,
        location: v.location,
        status: v.status,
        start_time: v.start_time ? (v.start_time as Dayjs).toISOString() : undefined,
        end_time: v.end_time ? (v.end_time as Dayjs).toISOString() : undefined,
        signup_start_time: v.signup_start_time ? (v.signup_start_time as Dayjs).toISOString() : undefined,
        signup_end_time: v.signup_end_time ? (v.signup_end_time as Dayjs).toISOString() : undefined,
        approval_required: v.approval_required,
        max_participants: v.max_participants,
        tags: v.tags,
        description: desc,
        agenda: agenda,
        form_fields: [],
      }
      await createActivity(payload)
      message.success('已创建活动')
      form.resetFields()
      setDesc('')
      setAgenda('')
    } catch (e: any) {
      message.error(e?.response?.data?.detail || '创建失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="活动创建" subtitle="新建活动与报名表单" extra={<Button type="primary" loading={saving} onClick={submit}>保存</Button>} />
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <SectionCard>
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="活动标题" name="title" rules={[{ required: true, message: '请输入活动标题' }]}>
                    <Input placeholder="例如：高校品牌沙龙·长沙" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="副标题" name="subtitle">
                    <Input placeholder="可选" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="城市" name="city"><Input placeholder="城市" /></Form.Item>
                </Col>
                <Col span={16}>
                  <Form.Item label="地点" name="location"><Input placeholder="地点详情" /></Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="状态" name="status" initialValue="draft" rules={[{ required: true }]}>
                    <Select options={[
                      {label:'草稿', value:'draft'},
                      {label:'计划中', value:'scheduled'},
                      {label:'已发布', value:'published'},
                      {label:'已结束', value:'closed'},
                      {label:'已归档', value:'archived'},
                    ]} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="开始时间" name="start_time"><DatePicker showTime style={{ width: '100%' }} /></Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="结束时间" name="end_time"><DatePicker showTime style={{ width: '100%' }} /></Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="报名开始" name="signup_start_time"><DatePicker showTime style={{ width: '100%' }} /></Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="报名截止" name="signup_end_time"><DatePicker showTime style={{ width: '100%' }} /></Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="是否需要审核" name="approval_required" valuePropName="checked" initialValue={true}><Switch /></Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="名额上限" name="max_participants"><InputNumber min={0} style={{ width: '100%' }} placeholder="不填表示不限" /></Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="标签" name="tags"><Select mode="tags" placeholder="输入或选择标签" /></Form.Item>
                </Col>
              </Row>
            </Form>
          </SectionCard>
        </Col>

        <Col span={12}>
          <SectionCard>
            <div className="page-title" style={{ fontSize: 16, marginBottom: 8 }}>活动介绍</div>
            <RichEditor value={desc} onChange={setDesc} placeholder="描述活动亮点与介绍" />
          </SectionCard>
        </Col>
        <Col span={12}>
          <SectionCard>
            <div className="page-title" style={{ fontSize: 16, marginBottom: 8 }}>议程/嘉宾</div>
            <RichEditor value={agenda} onChange={setAgenda} placeholder="填写活动议程、嘉宾等信息" />
          </SectionCard>
        </Col>
      </Row>
    </div>
  )
}

