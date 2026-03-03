import { Col, DatePicker, Input, InputNumber, Row, Select } from 'antd'
import dayjs from 'dayjs'
import RichEditor from '../../../components/RichEditor'
import SectionCard from '../../../components/SectionCard'
import type { ActivityCreateFormState } from '../types'

type Props = {
  state: ActivityCreateFormState
  onChange: (next: ActivityCreateFormState) => void
}

export default function OverviewTab({ state, onChange }: Props) {
  const updateBase = <K extends keyof ActivityCreateFormState['base']>(key: K, value: ActivityCreateFormState['base'][K]) => {
    onChange({
      ...state,
      base: {
        ...state.base,
        [key]: value,
      },
    })
  }

  const setDate = (key: 'start_time' | 'end_time' | 'signup_start_time' | 'signup_end_time' | 'checkin_start_time' | 'checkin_end_time', value: any) => {
    updateBase(key, value ? value.toISOString() : undefined)
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <SectionCard>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <div className="field-label">活动标题</div>
            <Input value={state.base.title} onChange={(e) => updateBase('title', e.target.value)} placeholder="例如：高校品牌沙龙·长沙" />
          </Col>
          <Col span={12}>
            <div className="field-label">副标题</div>
            <Input value={state.base.subtitle} onChange={(e) => updateBase('subtitle', e.target.value)} placeholder="可选" />
          </Col>
          <Col span={8}>
            <div className="field-label">分类</div>
            <Input value={state.base.category} onChange={(e) => updateBase('category', e.target.value)} placeholder="例如：品牌沙龙" />
          </Col>
          <Col span={8}>
            <div className="field-label">状态</div>
            <Select
              value={state.base.status}
              style={{ width: '100%' }}
              onChange={(value) => updateBase('status', value)}
              options={[
                { label: '草稿', value: 'draft' },
                { label: '计划中', value: 'scheduled' },
                { label: '已发布', value: 'published' },
                { label: '已结束', value: 'closed' },
                { label: '已归档', value: 'archived' },
              ]}
            />
          </Col>
          <Col span={8}>
            <div className="field-label">标签</div>
            <Select
              mode="tags"
              value={state.base.tags}
              style={{ width: '100%' }}
              onChange={(value) => updateBase('tags', value)}
              placeholder="输入标签"
            />
          </Col>
          <Col span={12}>
            <div className="field-label">封面图 URL</div>
            <Input value={state.base.cover_image_url} onChange={(e) => updateBase('cover_image_url', e.target.value)} placeholder="封面图链接" />
          </Col>
          <Col span={12}>
            <div className="field-label">Banner URL</div>
            <Input value={state.base.banner_image_url} onChange={(e) => updateBase('banner_image_url', e.target.value)} placeholder="Banner 链接" />
          </Col>
          <Col span={8}>
            <div className="field-label">城市</div>
            <Input value={state.base.city} onChange={(e) => updateBase('city', e.target.value)} placeholder="城市" />
          </Col>
          <Col span={8}>
            <div className="field-label">地点</div>
            <Input value={state.base.location} onChange={(e) => updateBase('location', e.target.value)} placeholder="地点名称" />
          </Col>
          <Col span={8}>
            <div className="field-label">详细地址</div>
            <Input value={state.base.location_detail} onChange={(e) => updateBase('location_detail', e.target.value)} placeholder="详细地址" />
          </Col>
          <Col span={8}>
            <div className="field-label">联系人</div>
            <Input value={state.base.contact_name} onChange={(e) => updateBase('contact_name', e.target.value)} placeholder="联系人姓名" />
          </Col>
          <Col span={8}>
            <div className="field-label">联系电话</div>
            <Input value={state.base.contact_phone} onChange={(e) => updateBase('contact_phone', e.target.value)} placeholder="联系电话" />
          </Col>
          <Col span={8}>
            <div className="field-label">联系邮箱</div>
            <Input value={state.base.contact_email} onChange={(e) => updateBase('contact_email', e.target.value)} placeholder="联系邮箱" />
          </Col>
          <Col span={8}>
            <div className="field-label">活动开始</div>
            <DatePicker showTime style={{ width: '100%' }} value={state.base.start_time ? dayjs(state.base.start_time) : null} onChange={(v) => setDate('start_time', v)} />
          </Col>
          <Col span={8}>
            <div className="field-label">活动结束</div>
            <DatePicker showTime style={{ width: '100%' }} value={state.base.end_time ? dayjs(state.base.end_time) : null} onChange={(v) => setDate('end_time', v)} />
          </Col>
          <Col span={8}>
            <div className="field-label">名额上限</div>
            <InputNumber min={0} style={{ width: '100%' }} value={state.base.max_participants} onChange={(value) => updateBase('max_participants', typeof value === 'number' ? value : undefined)} placeholder="不填表示不限" />
          </Col>
          <Col span={8}>
            <div className="field-label">报名开始</div>
            <DatePicker showTime style={{ width: '100%' }} value={state.base.signup_start_time ? dayjs(state.base.signup_start_time) : null} onChange={(v) => setDate('signup_start_time', v)} />
          </Col>
          <Col span={8}>
            <div className="field-label">报名截止</div>
            <DatePicker showTime style={{ width: '100%' }} value={state.base.signup_end_time ? dayjs(state.base.signup_end_time) : null} onChange={(v) => setDate('signup_end_time', v)} />
          </Col>
          <Col span={8}>
            <div className="field-label">群二维码 URL</div>
            <Input value={state.base.group_qr_image_url} onChange={(e) => updateBase('group_qr_image_url', e.target.value)} placeholder="群二维码图片链接" />
          </Col>
          <Col span={12}>
            <div className="field-label">签到开始</div>
            <DatePicker showTime style={{ width: '100%' }} value={state.base.checkin_start_time ? dayjs(state.base.checkin_start_time) : null} onChange={(v) => setDate('checkin_start_time', v)} />
          </Col>
          <Col span={12}>
            <div className="field-label">签到结束</div>
            <DatePicker showTime style={{ width: '100%' }} value={state.base.checkin_end_time ? dayjs(state.base.checkin_end_time) : null} onChange={(v) => setDate('checkin_end_time', v)} />
          </Col>
        </Row>
      </SectionCard>

      <SectionCard>
        <div className="field-label" style={{ marginBottom: 8 }}>活动介绍</div>
        <RichEditor
          value={state.base.description}
          onChange={(value) => updateBase('description', value)}
          placeholder="描述活动亮点与介绍"
        />
      </SectionCard>
    </div>
  )
}
