import { Alert, Button, Col, Input, Row, Select, Space, Switch, Tag } from 'antd'
import SectionCard from '../../../components/SectionCard'
import type { ActivityCreateFormState, FormFieldSummary } from '../types'

type Props = {
  state: ActivityCreateFormState
  onChange: (next: ActivityCreateFormState) => void
  fieldSummary: FormFieldSummary
  onOpenFormDesigner: () => void
}

export default function SignupConfigTab({ state, onChange, fieldSummary, onOpenFormDesigner }: Props) {
  const updateBase = (patch: Partial<ActivityCreateFormState['base']>) => {
    onChange({
      ...state,
      base: {
        ...state.base,
        ...patch,
      },
    })
  }

  const updateSignupConfig = (patch: Partial<ActivityCreateFormState['extra']['signup_config']>) => {
    onChange({
      ...state,
      extra: {
        ...state.extra,
        signup_config: {
          ...state.extra.signup_config,
          ...patch,
        },
      },
    })
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <SectionCard>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <div className="field-label">报名字段摘要</div>
          <div>
            <Tag color="blue">字段数 {fieldSummary.count}</Tag>
            <Tag color="green">必填字段 {fieldSummary.requiredCount}</Tag>
          </div>
          <Alert
            type="info"
            showIcon
            message="报名字段继续在“表单设计”中维护，这里只负责流程规则。"
            action={<Button size="small" onClick={onOpenFormDesigner}>前往表单设计</Button>}
          />
        </Space>
      </SectionCard>

      <SectionCard>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <div className="field-label">需要审核</div>
            <Switch checked={state.base.approval_required} onChange={(checked) => updateBase({ approval_required: checked })} />
          </Col>
          <Col span={6}>
            <div className="field-label">需要缴费</div>
            <Switch checked={state.base.require_payment} onChange={(checked) => {
              updateBase({ require_payment: checked })
              updateSignupConfig({ payment: { ...state.extra.signup_config.payment, enabled: checked } })
            }} />
          </Col>
          <Col span={6}>
            <div className="field-label">允许反馈</div>
            <Switch checked={state.base.allow_feedback} onChange={(checked) => updateBase({ allow_feedback: checked })} />
          </Col>
          <Col span={6}>
            <div className="field-label">允许候补</div>
            <Switch checked={state.base.allow_waitlist} onChange={(checked) => updateBase({ allow_waitlist: checked })} />
          </Col>
        </Row>
      </SectionCard>

      <SectionCard>
        <Row gutter={[16, 16]}>
          <Col span={24}><div className="field-label">缴费规则</div></Col>
          <Col span={8}>
            <div className="field-label">启用缴费</div>
            <Switch
              checked={state.extra.signup_config.payment.enabled}
              onChange={(checked) => {
                updateBase({ require_payment: checked })
                updateSignupConfig({ payment: { ...state.extra.signup_config.payment, enabled: checked } })
              }}
            />
          </Col>
          <Col span={8}>
            <div className="field-label">启用发票</div>
            <Switch
              checked={state.extra.signup_config.payment.invoice_enabled}
              onChange={(checked) => updateSignupConfig({ payment: { ...state.extra.signup_config.payment, invoice_enabled: checked } })}
            />
          </Col>
          <Col span={8}>
            <div className="field-label">要求回执</div>
            <Switch
              checked={state.extra.signup_config.payment.receipt_required}
              onChange={(checked) => updateSignupConfig({ payment: { ...state.extra.signup_config.payment, receipt_required: checked } })}
            />
          </Col>
          <Col span={24}>
            <div className="field-label">缴费二维码 URL</div>
            <Input
              value={state.extra.signup_config.payment.qr_image_url}
              onChange={(e) => updateSignupConfig({ payment: { ...state.extra.signup_config.payment, qr_image_url: e.target.value } })}
              placeholder="缴费二维码图片链接"
            />
          </Col>
        </Row>
      </SectionCard>

      <SectionCard>
        <Row gutter={[16, 16]}>
          <Col span={24}><div className="field-label">住宿规则</div></Col>
          <Col span={8}>
            <div className="field-label">启用住宿信息</div>
            <Switch
              checked={state.extra.signup_config.accommodation.enabled}
              onChange={(checked) => updateSignupConfig({ accommodation: { ...state.extra.signup_config.accommodation, enabled: checked } })}
            />
          </Col>
          <Col span={16}>
            <div className="field-label">酒店选项</div>
            <Select
              mode="tags"
              value={state.extra.signup_config.accommodation.hotel_options}
              style={{ width: '100%' }}
              onChange={(value) => updateSignupConfig({ accommodation: { ...state.extra.signup_config.accommodation, hotel_options: value } })}
              placeholder="例如：喜来登酒店 / 芙蓉国温德姆"
            />
          </Col>
          <Col span={12}>
            <div className="field-label">住宿意向</div>
            <Select
              mode="tags"
              value={state.extra.signup_config.accommodation.room_intents}
              style={{ width: '100%' }}
              onChange={(value) => updateSignupConfig({ accommodation: { ...state.extra.signup_config.accommodation, room_intents: value } })}
            />
          </Col>
          <Col span={12}>
            <div className="field-label">户型选项</div>
            <Select
              mode="tags"
              value={state.extra.signup_config.accommodation.occupancy_options}
              style={{ width: '100%' }}
              onChange={(value) => updateSignupConfig({ accommodation: { ...state.extra.signup_config.accommodation, occupancy_options: value } })}
            />
          </Col>
        </Row>
      </SectionCard>

      <SectionCard>
        <Row gutter={[16, 16]}>
          <Col span={24}><div className="field-label">交通规则</div></Col>
          <Col span={8}>
            <div className="field-label">启用交通信息</div>
            <Switch
              checked={state.extra.signup_config.transport.enabled}
              onChange={(checked) => updateSignupConfig({ transport: { ...state.extra.signup_config.transport, enabled: checked } })}
            />
          </Col>
          <Col span={16}>
            <div className="field-label">说明文案</div>
            <Input
              value={state.extra.signup_config.transport.note}
              onChange={(e) => updateSignupConfig({ transport: { ...state.extra.signup_config.transport, note: e.target.value } })}
              placeholder="填写交通说明"
            />
          </Col>
          <Col span={12}>
            <div className="field-label">到达点</div>
            <Select
              mode="tags"
              value={state.extra.signup_config.transport.pickup_points}
              style={{ width: '100%' }}
              onChange={(value) => updateSignupConfig({ transport: { ...state.extra.signup_config.transport, pickup_points: value } })}
              placeholder="例如：高铁站 / 机场"
            />
          </Col>
          <Col span={12}>
            <div className="field-label">返程点</div>
            <Select
              mode="tags"
              value={state.extra.signup_config.transport.dropoff_points}
              style={{ width: '100%' }}
              onChange={(value) => updateSignupConfig({ transport: { ...state.extra.signup_config.transport, dropoff_points: value } })}
              placeholder="例如：高铁站 / 机场"
            />
          </Col>
        </Row>
      </SectionCard>
    </div>
  )
}
