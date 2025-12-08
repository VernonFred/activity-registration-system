import PageHeader from '../components/PageHeader'
import SectionCard from '../components/SectionCard'

export default function ReviewNotify() {
  return (
    <div>
      <PageHeader title="审核与通知管理" subtitle="手动发送、定时发送与审核队列（开发中）" />
      <SectionCard>这里将接入通知 enqueue、审核列表、预览与日志统一展示。</SectionCard>
    </div>
  )
}

