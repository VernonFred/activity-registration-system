import { Col, DatePicker, Input, InputNumber, Row, Select, Switch } from 'antd'
import dayjs from 'dayjs'
import { FileText, Clock, MapPin, Settings, PenLine } from 'lucide-react'
import ImageUploader from '../../../components/ImageUploader'
import RichEditor from '../../../components/RichEditor'
import SectionCard from '../../../components/SectionCard'
import type { ActivityCreateFormState } from '../types'

type Props = {
  state: ActivityCreateFormState
  onChange: (next: ActivityCreateFormState) => void
}

export default function OverviewTab({ state, onChange }: Props) {
  const CATEGORY_OPTIONS = [
    { label: '论坛', value: '论坛' },
    { label: '品牌沙龙', value: '品牌沙龙' },
    { label: '培训会议', value: '培训会议' },
    { label: '闭门研讨', value: '闭门研讨' },
    { label: '峰会', value: '峰会' },
    { label: '交流会', value: '交流会' },
  ]

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
    <div className="overview-tab">
      {/* ── 卡片 1: 基本信息 ── */}
      <SectionCard className="overview-tab__card">
        <div className="overview-tab__card-header">
          <FileText size={18} />
          <span>基本信息</span>
        </div>
        <Row gutter={[24, 16]}>
          <Col span={12}>
            <div className="field-label">主标题 <span className="field-required">*</span></div>
            <Input value={state.base.title} onChange={(e) => updateBase('title', e.target.value)} placeholder="例如：高校品牌沙龙·长沙" />
          </Col>
          <Col span={12}>
            <div className="field-label">副标题</div>
            <Input value={state.base.subtitle} onChange={(e) => updateBase('subtitle', e.target.value)} placeholder="可选" />
          </Col>
        </Row>
        <div className="overview-tab__cover-row">
          <div className="overview-tab__cover-panel">
            <div className="field-label">活动封面</div>
            <ImageUploader value={state.base.cover_image_url} onChange={(value) => updateBase('cover_image_url', value || '')} />
          </div>
        </div>
        <Row gutter={[24, 16]} className="overview-tab__meta-row">
          <Col span={8}>
            <div className="field-label">分类</div>
            <Select
              mode="tags"
              maxCount={1}
              value={state.base.category ? [state.base.category] : []}
              style={{ width: '100%' }}
              options={CATEGORY_OPTIONS}
              onChange={(values) => updateBase('category', values?.[0] || '')}
              placeholder="选择或输入分类"
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
          <Col span={8}>
            <div className="field-label">状态 <span className="field-required">*</span></div>
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
        </Row>
      </SectionCard>

      {/* ── 卡片 2: 时间安排 ── */}
      <SectionCard className="overview-tab__card">
        <div className="overview-tab__card-header">
          <Clock size={18} />
          <span>时间安排</span>
        </div>
        <Row gutter={[24, 16]} className="overview-tab__time-row">
          <Col span={8}>
            <div className="field-label">活动开始 <span className="field-required">*</span></div>
            <DatePicker showTime style={{ width: '100%' }} value={state.base.start_time ? dayjs(state.base.start_time) : null} onChange={(v) => setDate('start_time', v)} placeholder="请选择日期" />
          </Col>
          <Col span={8}>
            <div className="field-label">活动结束 <span className="field-required">*</span></div>
            <DatePicker showTime style={{ width: '100%' }} value={state.base.end_time ? dayjs(state.base.end_time) : null} onChange={(v) => setDate('end_time', v)} placeholder="请选择日期" />
          </Col>
          <Col span={8}>
            <div className="field-label">名额上限</div>
            <InputNumber min={0} style={{ width: '100%' }} value={state.base.max_participants} onChange={(value) => updateBase('max_participants', typeof value === 'number' ? value : undefined)} placeholder="不填表示不限" />
          </Col>
        </Row>
        <Row gutter={[24, 16]} className="overview-tab__time-row">
          <Col span={12}>
            <div className="field-label">报名开始</div>
            <DatePicker showTime style={{ width: '100%' }} value={state.base.signup_start_time ? dayjs(state.base.signup_start_time) : null} onChange={(v) => setDate('signup_start_time', v)} placeholder="请选择日期" />
          </Col>
          <Col span={12}>
            <div className="field-label">报名截止</div>
            <DatePicker showTime style={{ width: '100%' }} value={state.base.signup_end_time ? dayjs(state.base.signup_end_time) : null} onChange={(v) => setDate('signup_end_time', v)} placeholder="请选择日期" />
          </Col>
        </Row>
        <Row gutter={[24, 16]} className="overview-tab__time-row">
          <Col span={12}>
            <div className="field-label">签到开始</div>
            <DatePicker showTime style={{ width: '100%' }} value={state.base.checkin_start_time ? dayjs(state.base.checkin_start_time) : null} onChange={(v) => setDate('checkin_start_time', v)} placeholder="请选择日期" />
          </Col>
          <Col span={12}>
            <div className="field-label">签到结束</div>
            <DatePicker showTime style={{ width: '100%' }} value={state.base.checkin_end_time ? dayjs(state.base.checkin_end_time) : null} onChange={(v) => setDate('checkin_end_time', v)} placeholder="请选择日期" />
          </Col>
        </Row>
        <div className="overview-tab__time-assets">
          <div className="overview-tab__time-qr">
            <div className="field-label">活动群二维码</div>
            <ImageUploader value={state.base.group_qr_image_url} onChange={(value) => updateBase('group_qr_image_url', value || '')} />
          </div>
          <div className="overview-tab__time-settings">
            <div className="field-label">显示目前报名人数</div>
            <div className="overview-tab__inline-switch">
              <span className="overview-tab__inline-switch-text">
                {state.extra.overview.show_signup_count ? '显示' : '隐藏'}
              </span>
              <Switch
                checked={state.extra.overview.show_signup_count}
                onChange={(checked) => onChange({
                  ...state,
                  extra: {
                    ...state.extra,
                    overview: {
                      ...state.extra.overview,
                      show_signup_count: checked,
                    },
                  },
                })}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── 卡片 3: 地点与联系方式 ── */}
      <SectionCard className="overview-tab__card">
        <div className="overview-tab__card-header">
          <MapPin size={18} />
          <span>地点与联系方式</span>
        </div>
        <Row gutter={[24, 16]}>
          <Col span={8}>
            <div className="field-label">城市</div>
            <Input value={state.base.city} onChange={(e) => updateBase('city', e.target.value)} placeholder="城市" />
          </Col>
          <Col span={8}>
            <div className="field-label">地点名称</div>
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
        </Row>
      </SectionCard>

      {/* ── 卡片 4: 功能配置 ── */}
      <SectionCard className="overview-tab__card">
        <div className="overview-tab__card-header">
          <Settings size={18} />
          <span>功能配置</span>
        </div>
        <div className="overview-tab__switches">
          <div className="overview-tab__switch-item">
            <div className="overview-tab__switch-info">
              <div className="overview-tab__switch-title">报名审核</div>
              <div className="overview-tab__switch-desc">开启后，用户报名需管理员审核通过</div>
            </div>
            <Switch checked={state.base.approval_required} onChange={(checked) => updateBase('approval_required', checked)} />
          </div>
          <div className="overview-tab__switch-item">
            <div className="overview-tab__switch-info">
              <div className="overview-tab__switch-title">需要缴费</div>
              <div className="overview-tab__switch-desc">开启后，报名流程中需完成缴费</div>
            </div>
            <Switch checked={state.base.require_payment} onChange={(checked) => updateBase('require_payment', checked)} />
          </div>
          <div className="overview-tab__switch-item">
            <div className="overview-tab__switch-info">
              <div className="overview-tab__switch-title">允许反馈</div>
              <div className="overview-tab__switch-desc">允许参会者对活动进行评分和评论</div>
            </div>
            <Switch checked={state.base.allow_feedback} onChange={(checked) => updateBase('allow_feedback', checked)} />
          </div>
          <div className="overview-tab__switch-item">
            <div className="overview-tab__switch-info">
              <div className="overview-tab__switch-title">允许候补</div>
              <div className="overview-tab__switch-desc">名额满时允许用户加入候补名单</div>
            </div>
            <Switch checked={state.base.allow_waitlist} onChange={(checked) => updateBase('allow_waitlist', checked)} />
          </div>
        </div>
      </SectionCard>

      {/* ── 卡片 5: 活动介绍 ── */}
      <SectionCard className="overview-tab__card">
        <div className="overview-tab__card-header">
          <PenLine size={18} />
          <span>活动介绍</span>
        </div>
        <RichEditor
          value={state.base.description}
          onChange={(value) => updateBase('description', value)}
          placeholder="描述活动亮点与介绍"
        />
      </SectionCard>
    </div>
  )
}
