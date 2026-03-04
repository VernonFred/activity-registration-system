import { Button, Col, DatePicker, Input, InputNumber, Row, Select, Switch } from 'antd'
import dayjs from 'dayjs'
import { FileText, Clock, MapPin, Settings, PenLine, ExternalLink } from 'lucide-react'
import ImageUploader from '../../../components/ImageUploader'
import RichEditor from '../../../components/RichEditor'
import SectionCard from '../../../components/SectionCard'
import type { ActivityCreateFormState } from '../types'

const { RangePicker } = DatePicker

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

  const updateOverview = (patch: Partial<ActivityCreateFormState['extra']['overview']>) => {
    onChange({
      ...state,
      extra: {
        ...state.extra,
        overview: {
          ...state.extra.overview,
          ...patch,
        },
      },
    })
  }

  const handleOpenCoordPicker = () => {
    window.open('https://lbs.qq.com/getPoint/', '_blank')
  }

  return (
    <div className="overview-tab">
      {/* ══ 第一行: 基本信息 + 时间安排 (等高) ══ */}
      <div className="overview-tab__row overview-tab__row--stretch">
        {/* ── 基本信息 ── */}
        <SectionCard className="overview-tab__card">
          <div className="overview-tab__card-header">
            <FileText size={16} />
            <span>基本信息</span>
          </div>
          <div className="overview-tab__form-grid">
            <Row gutter={[16, 14]}>
              <Col span={12}>
                <div className="field-label">主标题 <span className="field-required">*</span></div>
                <Input value={state.base.title} onChange={(e) => updateBase('title', e.target.value)} placeholder="例如：高校品牌沙龙·长沙" />
              </Col>
              <Col span={12}>
                <div className="field-label">副标题</div>
                <Input value={state.base.subtitle} onChange={(e) => updateBase('subtitle', e.target.value)} placeholder="可选" />
              </Col>
            </Row>
            <div className="overview-tab__field-block">
              <div className="field-label">分类</div>
              <Select
                mode="tags"
                maxCount={1}
                value={state.base.category ? [state.base.category] : []}
                style={{ width: '100%' }}
                options={CATEGORY_OPTIONS}
                onChange={(values) => updateBase('category', values?.[0] || '')}
                placeholder="选择或输入"
              />
            </div>
            <div className="overview-tab__field-block">
              <div className="field-label">标签</div>
              <Select
                mode="tags"
                value={state.base.tags}
                style={{ width: '100%' }}
                onChange={(value) => updateBase('tags', value)}
                placeholder="输入标签"
              />
            </div>
            <div className="overview-tab__field-block">
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
            </div>
            <div className="overview-tab__upload-block">
              <div className="field-label">活动封面</div>
              <ImageUploader value={state.base.cover_image_url} onChange={(value) => updateBase('cover_image_url', value || '')} />
            </div>
          </div>
        </SectionCard>

        {/* ── 时间安排 ── */}
        <SectionCard className="overview-tab__card">
          <div className="overview-tab__card-header">
            <Clock size={16} />
            <span>时间安排</span>
          </div>
          <div className="overview-tab__form-grid">
            <div>
              <div className="field-label">活动时间 <span className="field-required">*</span></div>
              <RangePicker
                showTime
                style={{ width: '100%' }}
                value={[
                  state.base.start_time ? dayjs(state.base.start_time) : null,
                  state.base.end_time ? dayjs(state.base.end_time) : null,
                ]}
                onChange={(dates) => {
                  updateBase('start_time', dates?.[0]?.toISOString() as any)
                  updateBase('end_time', dates?.[1]?.toISOString() as any)
                }}
                placeholder={['开始时间', '结束时间']}
              />
            </div>
            <div>
              <div className="field-label">报名时间</div>
              <RangePicker
                showTime
                style={{ width: '100%' }}
                value={[
                  state.base.signup_start_time ? dayjs(state.base.signup_start_time) : null,
                  state.base.signup_end_time ? dayjs(state.base.signup_end_time) : null,
                ]}
                onChange={(dates) => {
                  updateBase('signup_start_time', dates?.[0]?.toISOString() as any)
                  updateBase('signup_end_time', dates?.[1]?.toISOString() as any)
                }}
                placeholder={['报名开始', '报名截止']}
              />
            </div>
            <div>
              <div className="field-label">签到时间</div>
              <RangePicker
                showTime
                style={{ width: '100%' }}
                value={[
                  state.base.checkin_start_time ? dayjs(state.base.checkin_start_time) : null,
                  state.base.checkin_end_time ? dayjs(state.base.checkin_end_time) : null,
                ]}
                onChange={(dates) => {
                  updateBase('checkin_start_time', dates?.[0]?.toISOString() as any)
                  updateBase('checkin_end_time', dates?.[1]?.toISOString() as any)
                }}
                placeholder={['签到开始', '签到结束']}
              />
            </div>
            <div>
              <div className="field-label">名额上限</div>
              <InputNumber min={0} style={{ width: '100%' }} value={state.base.max_participants} onChange={(value) => updateBase('max_participants', typeof value === 'number' ? value : undefined)} placeholder="不填表示不限" />
            </div>
            <div>
              <div className="field-label">活动群二维码</div>
              <ImageUploader value={state.base.group_qr_image_url} onChange={(value) => updateBase('group_qr_image_url', value || '')} />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ══ 第二行: 地点与联系方式（全宽, 双栏内部布局） ══ */}
      <SectionCard className="overview-tab__card">
        <div className="overview-tab__card-header">
          <MapPin size={16} />
          <span>地点与联系方式</span>
        </div>
          <div className="overview-tab__location-grid">
          {/* 左列：地点信息 */}
          <div className="overview-tab__location-col">
            <div className="overview-tab__col-title">地点信息</div>
            <div className="overview-tab__form-grid">
              <div>
                <div className="field-label">城市</div>
                <Input value={state.base.city} onChange={(e) => updateBase('city', e.target.value)} placeholder="城市" />
              </div>
              <div>
                <div className="field-label">地点名称</div>
                <Input value={state.base.location} onChange={(e) => updateBase('location', e.target.value)} placeholder="地点名称" />
              </div>
              <div>
                <div className="field-label">详细地址</div>
                <Input value={state.base.location_detail} onChange={(e) => updateBase('location_detail', e.target.value)} placeholder="详细地址" />
              </div>
            </div>
          </div>
          {/* 右列：联系方式 */}
          <div className="overview-tab__location-col">
            <div className="overview-tab__col-title">联系方式</div>
            <div className="overview-tab__form-grid">
              <div>
                <div className="field-label">联系人</div>
                <Input value={state.base.contact_name} onChange={(e) => updateBase('contact_name', e.target.value)} placeholder="联系人姓名" />
              </div>
              <div>
                <div className="field-label">联系电话</div>
                <Input value={state.base.contact_phone} onChange={(e) => updateBase('contact_phone', e.target.value)} placeholder="联系电话" />
              </div>
              <div>
                <div className="field-label">联系邮箱</div>
                <Input value={state.base.contact_email} onChange={(e) => updateBase('contact_email', e.target.value)} placeholder="联系邮箱" />
              </div>
            </div>
          </div>
        </div>
        {/* ── 地图导航 ── */}
        <div className="overview-tab__sub-block">
          <div className="overview-tab__sub-block-top">
            <span className="overview-tab__sub-block-title">地图导航</span>
            <Switch
              size="small"
              checked={state.extra.overview.map.enabled}
              onChange={(checked) => updateOverview({
                map: { ...state.extra.overview.map, enabled: checked },
              })}
            />
          </div>
          {state.extra.overview.map.enabled && (
            <div className="overview-tab__map-fields">
              <Row gutter={[20, 14]}>
                <Col span={12}>
                  <div className="field-label">导航地址</div>
                  <Input
                    value={state.extra.overview.map.address}
                    onChange={(e) => updateOverview({
                      map: { ...state.extra.overview.map, address: e.target.value },
                    })}
                    placeholder="默认使用上方详细地址"
                  />
                </Col>
                <Col span={12}>
                  <div className="field-label">显示名称</div>
                  <Input
                    value={state.extra.overview.map.label}
                    onChange={(e) => updateOverview({
                      map: { ...state.extra.overview.map, label: e.target.value },
                    })}
                    placeholder="默认使用地点名称"
                  />
                </Col>
              </Row>
              <Row gutter={[20, 14]} align="bottom">
                <Col span={8}>
                  <div className="field-label">纬度</div>
                  <InputNumber
                    min={-90} max={90} precision={6}
                    style={{ width: '100%' }}
                    value={state.extra.overview.map.lat}
                    onChange={(value) => updateOverview({
                      map: { ...state.extra.overview.map, lat: typeof value === 'number' ? value : undefined },
                    })}
                    placeholder="例如 28.2282"
                  />
                </Col>
                <Col span={8}>
                  <div className="field-label">经度</div>
                  <InputNumber
                    min={-180} max={180} precision={6}
                    style={{ width: '100%' }}
                    value={state.extra.overview.map.lng}
                    onChange={(value) => updateOverview({
                      map: { ...state.extra.overview.map, lng: typeof value === 'number' ? value : undefined },
                    })}
                    placeholder="例如 112.9388"
                  />
                </Col>
                <Col span={8}>
                  <Button
                    type="link"
                    icon={<ExternalLink size={13} />}
                    onClick={handleOpenCoordPicker}
                    className="overview-tab__coord-picker-btn"
                  >
                    坐标拾取
                  </Button>
                </Col>
              </Row>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ══ 第三行: 活动介绍（全宽） ══ */}
      <SectionCard className="overview-tab__card">
        <div className="overview-tab__card-header">
          <PenLine size={16} />
          <span>活动介绍</span>
        </div>
        <RichEditor
          value={state.base.description}
          onChange={(value) => updateBase('description', value)}
          placeholder="描述活动亮点与介绍"
        />
      </SectionCard>

      {/* ══ 第四行: 功能配置（全宽, 在最底部） ══ */}
      <SectionCard className="overview-tab__card">
        <div className="overview-tab__card-header">
          <Settings size={16} />
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
              <div className="overview-tab__switch-title">显示报名人数</div>
              <div className="overview-tab__switch-desc">在小程序活动详情页展示当前报名人数</div>
            </div>
            <Switch
              checked={state.extra.overview.show_signup_count}
              onChange={(checked) => updateOverview({ show_signup_count: checked })}
            />
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
