import { useEffect, useMemo, useState } from 'react'
import { Button, message, Spin, Tabs } from 'antd'
import { useNavigate, useSearchParams } from 'react-router-dom'
import SectionCard from '../components/SectionCard'
import { createActivity, getActivity, updateActivity } from '../services/activities'
import AgendaTab from './activity-create/components/AgendaTab'
import HotelTab from './activity-create/components/HotelTab'
import LiveTab from './activity-create/components/LiveTab'
import OverviewTab from './activity-create/components/OverviewTab'
import SignupConfigTab from './activity-create/components/SignupConfigTab'
import { buildActivityPayload, extractFormFieldSummary, parseActivityDetailToFormState } from './activity-create/transform'
import { createDefaultActivityCreateFormState, type ActivityCreateFormState, type FormFieldSummary } from './activity-create/types'

export default function ActivityCreate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activityIdParam = searchParams.get('id')
  const activityId = activityIdParam && Number.isFinite(Number(activityIdParam)) ? Number(activityIdParam) : undefined

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeKey, setActiveKey] = useState('overview')
  const [state, setState] = useState<ActivityCreateFormState>(createDefaultActivityCreateFormState())
  const [fieldSummary, setFieldSummary] = useState<FormFieldSummary>({ count: 0, requiredCount: 0 })

  useEffect(() => {
    if (!activityId) {
      setState(createDefaultActivityCreateFormState())
      setFieldSummary({ count: 0, requiredCount: 0 })
      return
    }

    setLoading(true)
    ;(async () => {
      try {
        const detail = await getActivity(activityId)
        setState(parseActivityDetailToFormState(detail))
        setFieldSummary(extractFormFieldSummary(detail))
      } catch (error: any) {
        message.error(error?.response?.data?.detail || '活动详情加载失败')
      } finally {
        setLoading(false)
      }
    })()
  }, [activityId])

  const handleSubmit = async () => {
    if (!state.base.title.trim()) {
      message.error('请输入活动标题')
      setActiveKey('overview')
      return
    }

    if (!state.base.start_time || !state.base.end_time) {
      message.error('请完整填写活动时间')
      setActiveKey('overview')
      return
    }

    const overviewMap = state.extra.overview.map
    if (
      overviewMap.enabled &&
      (!Number.isFinite(overviewMap.lat) || !Number.isFinite(overviewMap.lng))
    ) {
      message.error('开启地图导航时，请填写完整经纬度')
      setActiveKey('overview')
      return
    }

    setSaving(true)
    try {
      if (activityId) {
        await updateActivity(activityId, buildActivityPayload(state))
        message.success('活动已更新')
      } else {
        await createActivity(buildActivityPayload(state, { includeFormFields: true }))
        message.success('活动已创建')
      }
      navigate('/activities')
    } catch (error: any) {
      message.error(error?.response?.data?.detail || (activityId ? '更新失败' : '创建失败'))
    } finally {
      setSaving(false)
    }
  }

  const tabs = useMemo(() => ([
    {
      key: 'overview',
      label: '活动速览',
      children: <OverviewTab state={state} onChange={setState} />,
    },
    {
      key: 'agenda',
      label: '活动议程',
      children: <AgendaTab state={state} onChange={setState} />,
    },
    {
      key: 'hotel',
      label: '酒店信息',
      children: <HotelTab state={state} onChange={setState} />,
    },
    {
      key: 'live',
      label: '图片直播',
      children: <LiveTab state={state} onChange={setState} />,
    },
    {
      key: 'signup',
      label: '报名配置',
      children: (
        <SignupConfigTab
          state={state}
          onChange={setState}
          fieldSummary={fieldSummary}
          onOpenFormDesigner={() => navigate(activityId ? `/form-designer?activityId=${activityId}` : '/form-designer')}
        />
      ),
    },
  ]), [activityId, fieldSummary, navigate, state])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Button type="primary" loading={saving} onClick={handleSubmit}>保存</Button>
      </div>

      <SectionCard className="activity-create-shell">
        <Spin spinning={loading}>
          <Tabs
            activeKey={activeKey}
            onChange={setActiveKey}
            items={tabs}
            className="activity-create-tabs"
            destroyInactiveTabPane={false}
          />
        </Spin>
      </SectionCard>
    </div>
  )
}
