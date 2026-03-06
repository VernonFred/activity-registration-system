import { Input, Select, Switch } from 'antd'
import ImageUploader from '../../../components/ImageUploader'
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
      <div className="live-tab">
        <div className="live-tab__section live-tab__section--compact">
          <div className="live-tab__switch-row">
            <div>
              <div className="field-label">启用图片直播</div>
              <div className="live-tab__hint">
                关闭后，小程序端将隐藏「图片直播」Tab
              </div>
            </div>
            <Switch checked={live.enabled} onChange={(checked) => updateLive({ enabled: checked })} />
          </div>
        </div>

        <div className="live-tab__section">
          <div className="live-tab__grid-2">
            <div>
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
            </div>
            <div>
              <div className="field-label">按钮文案</div>
              <Input
                value={live.button_text}
                onChange={(e) => updateLive({ button_text: e.target.value })}
                placeholder="查看直播"
              />
            </div>
          </div>
        </div>

        <div className="live-tab__section">
          <div className="field-label">直播封面</div>
          <div className="live-tab__dropzone">
            <ImageUploader
              value={live.cover_image_url}
              onChange={(url) => updateLive({ cover_image_url: url })}
            />
          </div>
        </div>

        <div className="live-tab__section">
          {live.action_type === 'link' ? (
            <>
              <div className="field-label">跳转链接</div>
              <Input
                value={live.action_url}
                onChange={(e) => updateLive({ action_url: e.target.value })}
                placeholder="直播跳转链接（支持 https://...）"
              />
            </>
          ) : (
            <>
              <div className="field-label">二维码图片</div>
              <div className="live-tab__dropzone">
                <ImageUploader
                  value={live.qrcode_image_url}
                  onChange={(url) => updateLive({ qrcode_image_url: url })}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </SectionCard>
  )
}
