import { useEffect, useState } from 'react'
import { Col, Row, Segmented, Select, Empty } from 'antd'
import StatCard from '../components/StatCard'
import { getOverview, getActivityReport } from '../services/reports'
import { listActivities } from '../services/activities'
import PageHeader from '../components/PageHeader'
import SectionCard from '../components/SectionCard'
import ActivityCard from '../components/ActivityCard'
import { listAuditLogs } from '../services/audit'
import { listLogs } from '../services/notifications'
import RecentEventsCard from '../components/RecentEventsCard'
import ActivityFeedCard from '../components/ActivityFeedCard'
import { recentFeed } from '../services/engagements'

export default function Dashboard() {
  const [days, setDays] = useState(7)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activityId, setActivityId] = useState<number | undefined>(undefined)
  const [options, setOptions] = useState<any[]>([])
  const [topActivities, setTopActivities] = useState<any[]>([])
  const [feed, setFeed] = useState<any[]>([])
  const [notifs, setNotifs] = useState<any[]>([])

  useEffect(() => {
    // load activities for selector once
    listActivities({ limit: 6 })
      .then((res) => {
        setOptions(res.map((a: any) => ({ label: a.title, value: a.id })))
        setTopActivities(res.slice(0, 4))
      })
      .catch(() => setOptions([]))
    // activity feed：默认取第一个活动的 feed；若无活动则用演示数据
    recentFeedForTop().then(setFeed)
    listLogs({ limit: 10 })
      .then((arr) => setNotifs(arr && arr.length ? arr : [
        { id: 'n1', event: 'signup_submitted', status: 'SENT', channel: 'WECHAT', created_at: new Date().toISOString() },
        { id: 'n2', event: 'signup_approved', status: 'SENT', channel: 'WECHAT', created_at: new Date(Date.now() - 1800_000).toISOString() },
        { id: 'n3', event: 'checkin_reminder', status: 'PENDING', channel: 'WECHAT', created_at: new Date(Date.now() - 3600_000).toISOString() },
      ]))
      .catch(() => setNotifs([
        { id: 'n1', event: 'signup_submitted', status: 'SENT', channel: 'WECHAT', created_at: new Date().toISOString() },
        { id: 'n2', event: 'signup_approved', status: 'SENT', channel: 'WECHAT', created_at: new Date(Date.now() - 1800_000).toISOString() },
        { id: 'n3', event: 'checkin_reminder', status: 'PENDING', channel: 'WECHAT', created_at: new Date(Date.now() - 3600_000).toISOString() },
      ]))
  }, [])

  useEffect(() => {
    setLoading(true)
    const loader = activityId ? getActivityReport(activityId, days) : getOverview(days)
    loader.then(setData).finally(() => setLoading(false))
  }, [days, activityId])

  return (
    <div>
      <PageHeader title="仪表盘" subtitle="全局概览" />
      <Row gutter={[16, 16]}>
        {/* 顶部大图根据最新规划移除，聚焦卡片与活动流 */}
        <Col xs={24} lg={14}>
          <div className="page-title" style={{ fontSize: 16, margin: '0 0 8px 0' }}>当前活动</div>
          {/* 每个活动单独一张卡片，不再包一层大卡片 */}
          {topActivities.length ? topActivities.map((a: any) => <ActivityCard key={a.id} activity={a} />) : <SectionCard><Empty description="暂无活动" /></SectionCard>}
          <div style={{ height: 16 }} />
          {/* 活动流放在活动卡片下方 */}
          <div className="page-title" style={{ fontSize: 16, margin: '0 0 8px 0' }}>活动流</div>
          <ActivityFeedCard withTitle={false} items={(feed && feed.length ? feed : demoFeed()).map((f: any, i: number) => ({
            id: `${f.type}-${i}`,
            userName: f.user_name || '匿名用户',
            userTitle: f.type === 'comment' ? '发布了评论' : f.content,
            chips: [ { icon: 'upload', text: f.content } ],
          }))} />
        </Col>
        <Col xs={24} lg={10}>
          <div className="page-title" style={{ fontSize: 16, margin: '0 0 8px 0' }}>最近通知</div>
          <RecentEventsCard withTitle={false} items={notifs.map((n: any, i: number) => ({
            id: n.id,
            title: eventLabel(n.event) + (n.status ? ` · ${n.status}` : ''),
            time: n.created_at,
            direction: i % 2 ? 'down' : 'up',
            content: n.payload?.text || n.payload?.template || `渠道：${n.channel}`,
          }))} />
        </Col>
        {/* 移除底部小指标卡片 */}
        {/* 底部 8 张小卡片按你的要求移除，不在仪表盘展示 */}
      </Row>
    </div>
  )
}

function eventLabel(ev: string) {
  const map: Record<string, string> = {
    signup_submitted: '报名提交',
    signup_approved: '审核通过',
    signup_rejected: '审核驳回',
    signup_reminder: '报名提醒',
    checkin_reminder: '签到提醒',
  }
  return map[ev?.toLowerCase()] || ev
}

function auditText(a: any) {
  const map: Record<string, string> = {
    signup_reviewed: '已完成一次报名审核',
    task_run: '系统调度已运行一项任务',
    badge_rule_triggered: '规则引擎触发一次自动授勋',
  }
  return map[a?.action?.toLowerCase()] || '系统产生了一条活动记录'
}

async function recentFeedForTop() {
  try {
    const list = await listActivities({ limit: 1 })
    if (!list.length) return []
    const f = await recentFeed(list[0].id, 10)
    return f
  } catch {
    return []
  }
}

function demoFeed() {
  const now = new Date()
  return [
    { type: 'comment', user_name: '奥斯卡·雪洛韦', content: '已完成一次报名审核', created_at: now.toISOString() },
    { type: 'share', user_name: '艾米丽·泰勒', content: '分享了活动（微信）', created_at: new Date(now.getTime() - 3600_000).toISOString() },
  ]
}
