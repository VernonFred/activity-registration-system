import { Badge, Button, Popconfirm, Space, Tabs } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import SearchCapsule from './SearchCapsule'

export function SignupStatusTabs({
  visible,
  activeTab,
  onChange,
  total,
  stats,
}: {
  visible: boolean
  activeTab: string
  onChange: (key: string) => void
  total: number
  stats: { pending: number; approved: number; rejected: number; notCheckedIn: number; checkedIn: number }
}) {
  if (!visible) return null
  return (
    <Tabs
      activeKey={activeTab}
      onChange={onChange}
      style={{ marginBottom: 16 }}
      items={[
        { key: 'all', label: <Badge count={total} offset={[10, 0]} size="small">全部</Badge> },
        { key: 'pending', label: <Badge count={stats.pending} offset={[10, 0]} size="small" color="orange">待审核</Badge> },
        { key: 'approved', label: <Badge count={stats.approved} offset={[10, 0]} size="small" color="green">已通过</Badge> },
        { key: 'rejected', label: <Badge count={stats.rejected} offset={[10, 0]} size="small" color="red">已驳回</Badge> },
        { key: 'not_checked_in', label: <Badge count={stats.notCheckedIn} offset={[10, 0]} size="small" color="blue">待签到</Badge> },
        { key: 'checked_in', label: <Badge count={stats.checkedIn} offset={[10, 0]} size="small" color="green">已签到</Badge> },
      ]}
    />
  )
}

export function SignupSearchBar({
  nameKw,
  phoneKw,
  schoolKw,
  onName,
  onPhone,
  onSchool,
  onReset,
}: {
  nameKw: string
  phoneKw: string
  schoolKw: string
  onName: (value: string) => void
  onPhone: (value: string) => void
  onSchool: (value: string) => void
  onReset: () => void
}) {
  return (
    <div style={{ marginBottom: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <SearchCapsule placeholder="姓名" value={nameKw} onChange={onName} />
      <SearchCapsule placeholder="手机号" value={phoneKw} onChange={onPhone} />
      <SearchCapsule placeholder="学校" value={schoolKw} onChange={onSchool} />
      <Button className="pill-action" onClick={onReset}>重置</Button>
    </div>
  )
}

export function SignupBatchActions({
  selectedCount,
  canOperate,
  onApprove,
  onReject,
  onExportSelected,
  onDelete,
  showExportAll,
  onExportAll,
}: {
  selectedCount: number
  canOperate: boolean
  onApprove: () => void
  onReject: () => void
  onExportSelected: () => void
  onDelete: () => void
  showExportAll: boolean
  onExportAll: () => void
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
      <Space>
        <span style={{ color: '#666' }}>已选 <strong>{selectedCount}</strong> 项</span>
      </Space>
      <Space wrap>
        <Button type="primary" icon={<CheckCircleOutlined />} disabled={!canOperate} onClick={onApprove} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
          批量通过
        </Button>
        <Button danger icon={<CloseCircleOutlined />} disabled={!canOperate} onClick={onReject}>
          批量驳回
        </Button>
        <Button className="pill-action" onClick={onExportSelected} disabled={!canOperate}>批量导出Excel</Button>
        <Popconfirm title="确认批量删除？" okText="删除" cancelText="取消" okButtonProps={{ danger: true }} onConfirm={onDelete}>
          <Button className="pill-action pill-delete" disabled={!canOperate}>批量删除</Button>
        </Popconfirm>
        {showExportAll && <Button className="pill-action" onClick={onExportAll}>导出全部CSV</Button>}
      </Space>
    </div>
  )
}
