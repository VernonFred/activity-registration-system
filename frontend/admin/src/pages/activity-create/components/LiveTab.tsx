import { Col, Input, Row, Select, Switch } from 'antd'
import SectionCard from '../../../components/SectionCard'
import type { ActivityCreateFormState } from '../types'

type Props = {
  state: ActivityCreateFormState
  onChange: (next: ActivityCreateFormState) => void
}

export default function LiveTab({ state, onChange }: Props) {
  const live = state.materials.live

  const updateLive = (patch: Partial<typeof live>) => {
    onChange({
      ...state,
      materials: {
        ...state.materials,
        live: {
          ...live,
          ...patch,
        },
      },
    })
  }

  return (
    <SectionCard>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <div className="field-label">启用图片直播</div>
          <Switch checked={live.enabled} onChange={(checked) => updateLive({ enabled: checked })} />
        </Col>
        <Col span={8}>
          <div className="field-label">跳转方式</div>
          <Select
            value={live.action_type}
            style={{ width: '100%' }}
            onChange={(value) => updateLive({ action_type: value })}
            options={[
              { label: '链接', value: 'link' },
              { label: '二维码', value: 'qrcode' },
            ]}
          />
        </Col>
        <Col span={8}>
          <div className="field-label">按钮文案</div>
          <Input value={live.button_text} onChange={(e) => updateLive({ button_text: e.target.value })} placeholder="查看直播" />
        </Col>
        <Col span={24}>
          <div className="field-label">直播封面 URL</div>
          <Input value={live.cover_image_url} onChange={(e) => updateLive({ cover_image_url: e.target.value })} placeholder="直播封面链接" />
        </Col>
        {live.action_type === 'link' ? (
          <Col span={24}>
            <div className="field-label">跳转链接</div>
            <Input value={live.action_url} onChange={(e) => updateLive({ action_url: e.target.value })} placeholder="直播跳转链接" />
          </Col>
        ) : (
          <Col span={24}>
            <div className="field-label">二维码图片 URL</div>
            <Input value={live.qrcode_image_url} onChange={(e) => updateLive({ qrcode_image_url: e.target.value })} placeholder="二维码图片链接" />
          </Col>
        )}
      </Row>
    </SectionCard>
  )
}
