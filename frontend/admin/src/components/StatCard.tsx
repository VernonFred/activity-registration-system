import { Card, Skeleton } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

interface StatCardProps {
  title: string
  value?: number | string
  loading?: boolean
  trend?: number  // percentage change, e.g. 12.5 or -3.2
  suffix?: string
}

export default function StatCard({ title, value, loading, trend, suffix }: StatCardProps) {
  return (
    <Card size="small" className="stat-card" bordered={false}>
      <div className="stat-card__label">{title}</div>
      {loading ? (
        <Skeleton paragraph={false} active title={{ width: 80 }} />
      ) : (
        <>
          <div className="stat-card__value">
            {value ?? '-'}
            {suffix && <span style={{ fontSize: 14, fontWeight: 500, marginLeft: 4, opacity: 0.5 }}>{suffix}</span>}
          </div>
          {trend !== undefined && (
            <div className={`stat-card__trend ${trend >= 0 ? 'stat-card__trend--up' : 'stat-card__trend--down'}`}>
              {trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              {Math.abs(trend).toFixed(1)}%
            </div>
          )}
        </>
      )}
    </Card>
  )
}
