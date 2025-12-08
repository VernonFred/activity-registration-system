import { Card, Skeleton } from 'antd'

export default function StatCard({ title, value, loading }: { title: string; value?: number | string; loading?: boolean }) {
  return (
    <Card size="small" style={{ borderRadius: 12 }}>
      <div style={{ color: '#999', marginBottom: 8 }}>{title}</div>
      {loading ? (
        <Skeleton paragraph={false} active title={{ width: 80 }} />
      ) : (
        <div style={{ fontSize: 28, fontWeight: 600 }}>{value ?? '-'}</div>
      )}
    </Card>
  )
}

