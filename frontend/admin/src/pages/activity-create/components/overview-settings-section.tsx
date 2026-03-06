import { Switch } from 'antd'
import { Settings } from 'lucide-react'
import SectionCard from '../../../components/SectionCard'
import type { ActivityCreateFormState } from '../types'

type BaseUpdater = <K extends keyof ActivityCreateFormState['base']>(
  key: K,
  value: ActivityCreateFormState['base'][K],
) => void

type OverviewUpdater = (patch: Partial<ActivityCreateFormState['extra']['overview']>) => void

export function SettingsSection({
  state,
  updateBase,
  updateOverview,
}: {
  state: ActivityCreateFormState
  updateBase: BaseUpdater
  updateOverview: OverviewUpdater
}) {
  const items = [
    {
      title: '报名审核',
      desc: '开启后，用户报名需管理员审核通过',
      checked: state.base.approval_required,
      onToggle: (checked: boolean) => updateBase('approval_required', checked),
    },
    {
      title: '需要缴费',
      desc: '开启后，报名流程中需完成缴费',
      checked: state.base.require_payment,
      onToggle: (checked: boolean) => updateBase('require_payment', checked),
    },
    {
      title: '允许反馈',
      desc: '允许参会者对活动进行评分和评论',
      checked: state.base.allow_feedback,
      onToggle: (checked: boolean) => updateBase('allow_feedback', checked),
    },
    {
      title: '显示报名人数',
      desc: '在小程序活动详情页展示当前报名人数',
      checked: state.extra.overview.show_signup_count,
      onToggle: (checked: boolean) => updateOverview({ show_signup_count: checked }),
    },
  ]

  return (
    <SectionCard className="overview-tab__card">
      <div className="overview-tab__card-header">
        <Settings size={16} />
        <span>功能配置</span>
      </div>
      <div className="overview-tab__switches">
        {items.map((item) => (
          <div key={item.title} className="overview-tab__switch-item">
            <div className="overview-tab__switch-info">
              <div className="overview-tab__switch-title">{item.title}</div>
              <div className="overview-tab__switch-desc">{item.desc}</div>
            </div>
            <Switch checked={item.checked} onChange={item.onToggle} />
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
