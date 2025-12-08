import { useEffect, useMemo, useState } from 'react'
import { Button, Select, Space, Table, Input, message, Tag, Popconfirm, Modal, Badge, Tabs, Tooltip, Drawer, Descriptions, Timeline, Empty, Spin } from 'antd'
import PageHeader from '../components/PageHeader'
import SectionCard from '../components/SectionCard'
import { getActivity, listActivities, exportSignups } from '../services/activities'
import { listSignups, bulkDeleteSignups, countSignups, bulkReviewSignups, checkinSignup, getSignup } from '../services/signups'
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, ScanOutlined, EyeOutlined, UserOutlined, PhoneOutlined, MailOutlined, BankOutlined } from '@ant-design/icons'

type Signup = any

const SIGNUP_STATUS_LABEL: Record<string, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回',
  waitlisted: '候补',
  cancelled: '已取消',
}
const CHECKIN_STATUS_LABEL: Record<string, string> = {
  not_checked_in: '未签到',
  checked_in: '已签到',
  no_show: '缺席',
}

const STATUS_COLOR: Record<string, string> = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
  waitlisted: 'blue',
  cancelled: 'default',
}

const CHECKIN_COLOR: Record<string, string> = {
  not_checked_in: 'default',
  checked_in: 'green',
  no_show: 'red',
}

export default function SignupManage() {
  const [activityId, setActivityId] = useState<number | undefined>(undefined)
  const [activity, setActivity] = useState<any | null>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [signups, setSignups] = useState<Signup[]>([])
  const [loading, setLoading] = useState(false)
  const [nameKw, setNameKw] = useState('')
  const [phoneKw, setPhoneKw] = useState('')
  const [schoolKw, setSchoolKw] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string|number)[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  
  // 批量审核相关状态
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve')
  const [reviewMessage, setReviewMessage] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  
  // 签到核验相关状态
  const [checkinDrawerVisible, setCheckinDrawerVisible] = useState(false)
  const [checkinLoading, setCheckinLoading] = useState(false)
  
  // 报名详情抽屉
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false)
  const [detailSignup, setDetailSignup] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  
  // 当前Tab
  const [activeTab, setActiveTab] = useState<string>('all')

  // 从后端加载活动列表（移除 mock）
  async function reloadActivities() {
    try {
      // 修复：后端 limit 上限为 100，避免 422
      const res = await listActivities({ limit: 100 })
      setActivities(res || [])
    } catch (e: any) {
      message.error(e?.response?.data?.detail || '加载活动失败')
      setActivities([])
    }
  }

  useEffect(() => {
    reloadActivities()
  }, [])

  useEffect(() => {
    if (!activityId) return
    setLoading(true)
    Promise.all([
      getActivity(activityId).catch(() => null),
      countSignups({ activity_id: activityId }).catch(() => ({ total: 0 })),
      listSignups({ activity_id: activityId, limit: pageSize, offset: (page - 1) * pageSize }).catch(() => []),
    ])
      .then(([act, cnt, su]) => {
        setActivity(act)
        setTotal((cnt as any)?.total || 0)
        setSignups(su || [])
      })
      .finally(() => setLoading(false))
  }, [activityId])

  const columns = useMemo(() => {
    const base: any[] = [
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        fixed: 'left',
        render: (status: string) => (
          <Tag color={STATUS_COLOR[status] || 'default'}>
            {SIGNUP_STATUS_LABEL[status] || status}
          </Tag>
        ),
      },
      {
        title: '签到',
        dataIndex: 'checkin_status',
        width: 90,
        fixed: 'left',
        render: (status: string) => (
          <Tag color={CHECKIN_COLOR[status] || 'default'}>
            {CHECKIN_STATUS_LABEL[status] || status}
          </Tag>
        ),
      },
    ]

    const FIELD_MAP: { key: string; title: string; labels: string[] }[] = [
      { key: 'name', title: '姓名', labels: ['姓名','名字'] },
      { key: 'school', title: '学校', labels: ['学校','单位','机构'] },
      { key: 'dept', title: '部门/职位', labels: ['部门','职位','岗位'] },
      { key: 'phone', title: '手机号码', labels: ['手机','电话','手机号'] },
      { key: 'email', title: '邮箱', labels: ['邮箱','Email','电子邮箱'] },
      { key: 'stay_arrange', title: '住宿安排', labels: ['住宿安排'] },
      { key: 'hotel', title: '入住酒店', labels: ['入住酒店','酒店','宾馆'] },
      { key: 'stay_pref', title: '住宿意向', labels: ['住宿意向'] },
      { key: 'room_type', title: '住宿户型', labels: ['户型','房型'] },
      { key: 'invoice', title: '发票信息', labels: ['发票','发票信息'] },
      { key: 'pickup', title: '接站点', labels: ['接站点','接站','接机'] },
      { key: 'arrive_no', title: '到会车次/航班', labels: ['到会车次/航班','到达车次','到达航班','航班号','列车号'] },
      { key: 'arrive_time', title: '到会时间', labels: ['到会时间','到达时间','到达日期','到达'] },
      { key: 'drop', title: '送站点', labels: ['送站点','送站','送机'] },
      { key: 'return_no', title: '返程车次/航班', labels: ['返程车次/航班','返程车次','返程航班'] },
      { key: 'return_time', title: '返程时间', labels: ['返程时间','返回时间','离开时间'] },

      // 移除：报名时间
    ]

    function getVal(r: any, labels: string[]) {
      const ans = (r.answers || []).find((a: any) => {
        const field = (activity?.form_fields || []).find((f: any) => f.id === a.field_id)
        const lbl = field?.label || ''
        return labels.some((t) => lbl.includes(t))
      })
      if (!ans) return ''
      return ans.value_text ?? (Array.isArray(ans.value_json) ? ans.value_json.join(',') : (ans.value_json ? JSON.stringify(ans.value_json) : ''))
    }

    const mapped: any[] = FIELD_MAP.map((f) => ({
      title: f.title,
      dataIndex: f.key,
      width: 160,
      render: (_: any, r: any) => f.key === 'created_at' ? r.created_at : (getVal(r, f.labels) || '-')
    }))

    // 其余未映射字段，按原有顺序补齐
    const used = new Set(FIELD_MAP.flatMap((f) => f.labels))
    const extra = (activity?.form_fields || [])
      .filter((f: any) => !(Array.from(used).some((t) => (f.label || '').includes(t))))
      .map((f: any) => ({
        title: f.label,
        dataIndex: `field_${f.id}`,
        width: 160,
        render: (_: any, r: any) => {
          const ans = (r.answers || []).find((a: any) => a.field_id === f.id)
          const val = ans?.value_text ?? (Array.isArray(ans?.value_json) ? ans?.value_json.join(',') : (ans?.value_json ? JSON.stringify(ans?.value_json) : ''))
          return val || '-'
        }
      }))

    // 操作列
    const actionCol = {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => showSignupDetail(record.id)}
            />
          </Tooltip>
          {record.status === 'approved' && record.checkin_status === 'not_checked_in' && (
            <Tooltip title="签到">
              <Button 
                type="text" 
                size="small" 
                icon={<ScanOutlined style={{ color: '#52c41a' }} />}
                onClick={() => handleCheckin(record.id, 'checked_in')}
                loading={checkinLoading}
              />
            </Tooltip>
          )}
          {record.status === 'pending' && (
            <>
              <Tooltip title="通过">
                <Button 
                  type="text" 
                  size="small" 
                  icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  onClick={async () => {
                    try {
                      await bulkReviewSignups([record.id], 'approve')
                      message.success('已通过')
                      await reloadSignups()
                    } catch (e: any) {
                      message.error(e?.response?.data?.detail || '操作失败')
                    }
                  }}
                />
              </Tooltip>
              <Tooltip title="驳回">
                <Button 
                  type="text" 
                  size="small" 
                  icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                  onClick={async () => {
                    try {
                      await bulkReviewSignups([record.id], 'reject')
                      message.success('已驳回')
                      await reloadSignups()
                    } catch (e: any) {
                      message.error(e?.response?.data?.detail || '操作失败')
                    }
                  }}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    }

    return [...base, ...mapped, ...extra, actionCol]
  }, [activity, checkinLoading])

  function getAnswerByLabels(r: any, labels: string[]): string | undefined {
    const found = (r.answers || []).find((a: any) => {
      const field = (activity?.form_fields || []).find((f: any) => f.id === a.field_id)
      const lbl = field?.label || ''
      return labels.some((t) => lbl.includes(t))
    })
    if (!found) return undefined
    return found.value_text ?? (Array.isArray(found.value_json) ? found.value_json.join(',') : (found.value_json ? JSON.stringify(found.value_json) : ''))
  }

  // 根据Tab过滤数据
  const filteredByTab = useMemo(() => {
    if (activeTab === 'all') return signups
    if (activeTab === 'pending') return signups.filter(s => s.status === 'pending')
    if (activeTab === 'approved') return signups.filter(s => s.status === 'approved')
    if (activeTab === 'rejected') return signups.filter(s => s.status === 'rejected')
    if (activeTab === 'not_checked_in') return signups.filter(s => s.checkin_status === 'not_checked_in' && s.status === 'approved')
    if (activeTab === 'checked_in') return signups.filter(s => s.checkin_status === 'checked_in')
    return signups
  }, [signups, activeTab])

  const data = useMemo(() => {
    let list = filteredByTab
    if (nameKw) list = list.filter((r) => (getAnswerByLabels(r, ['姓名','名字']) || '').includes(nameKw))
    if (phoneKw) list = list.filter((r) => (getAnswerByLabels(r, ['手机','电话']) || '').includes(phoneKw))
    if (schoolKw) list = list.filter((r) => (getAnswerByLabels(r, ['学校','单位']) || '').includes(schoolKw))
    return list
  }, [filteredByTab, nameKw, phoneKw, schoolKw, activity])

  async function exportSelectedExcel() {
    if (!activityId) { message.info('请先选择活动'); return }
    const ids = (selectedRowKeys as number[]) || []
    const blob = await exportSignups(activityId, 'xlsx', ids.length ? ids : undefined)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `signups_${activityId}${ids.length ? '_selected' : ''}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function bulkDelete() {
      if (!selectedRowKeys.length) { message.info('请先选择记录'); return }
      const ids = selectedRowKeys as number[]
      try {
          const res = await bulkDeleteSignups(ids)
          message.success(`已批量删除：成功 ${res.deleted} 条`)
      } catch (e:any) {
          message.error(e?.response?.data?.detail || '批量删除失败')
      }
      setSelectedRowKeys([])
      await reloadSignups()
  }
  
  // 刷新报名列表
  async function reloadSignups() {
    if (!activityId) return
    setLoading(true)
    try {
          const [cnt, su] = await Promise.all([
            countSignups({ activity_id: activityId }).catch(() => ({ total: 0 })),
        listSignups({ activity_id: activityId, limit: pageSize, offset: (page - 1) * pageSize }).catch(() => []),
          ])
          setTotal((cnt as any)?.total || 0)
      setSignups(su || [])
    } finally {
      setLoading(false)
    }
  }
  
  // 批量审核
  async function handleBulkReview() {
    if (!selectedRowKeys.length) { message.info('请先选择记录'); return }
    setReviewLoading(true)
    try {
      const res = await bulkReviewSignups(
        selectedRowKeys as number[],
        reviewAction,
        reviewMessage || undefined
      )
      const actionText = reviewAction === 'approve' ? '通过' : '驳回'
      message.success(
        `批量审核完成：${actionText} ${res.approved_count + res.rejected_count} 条，跳过 ${res.skipped_count} 条`
      )
      setReviewModalVisible(false)
      setReviewMessage('')
      setSelectedRowKeys([])
      await reloadSignups()
    } catch (e: any) {
      message.error(e?.response?.data?.detail || '批量审核失败')
    } finally {
      setReviewLoading(false)
    }
  }
  
  // 签到核验
  async function handleCheckin(signupId: number, status: 'checked_in' | 'no_show') {
    setCheckinLoading(true)
    try {
      await checkinSignup(signupId, status)
      message.success(status === 'checked_in' ? '签到成功' : '已标记缺席')
      await reloadSignups()
    } catch (e: any) {
      message.error(e?.response?.data?.detail || '签到失败')
    } finally {
      setCheckinLoading(false)
    }
  }
  
  // 查看报名详情
  async function showSignupDetail(signupId: number) {
    setDetailLoading(true)
    setDetailDrawerVisible(true)
    try {
      const detail = await getSignup(signupId)
      setDetailSignup(detail)
    } catch (e: any) {
      message.error('加载详情失败')
    } finally {
      setDetailLoading(false)
      }
  }

  // 将搜索区域移至卡片上方，复用活动创建页的 FilterBar
  // 缩小搜索框宽度为 200，高度为 36，视觉更精致
  function SearchCapsule({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v:string)=>void }) {
    return (
      <div className="search-pill" style={{ width: 200 }}>
        <Input allowClear bordered={false} prefix={<SearchOutlined />} placeholder={placeholder} value={value}
          onChange={(e)=>onChange(e.target.value)} style={{ flex:1, height:36 }} />
        <Button type="primary" className="pill-btn" onClick={()=>{ /* no-op; 使用即输即搜 */ }}>搜索</Button>
      </div>
    )
  }

  // 统计数据
  const stats = useMemo(() => {
    const pending = signups.filter(s => s.status === 'pending').length
    const approved = signups.filter(s => s.status === 'approved').length
    const rejected = signups.filter(s => s.status === 'rejected').length
    const notCheckedIn = signups.filter(s => s.checkin_status === 'not_checked_in' && s.status === 'approved').length
    const checkedIn = signups.filter(s => s.checkin_status === 'checked_in').length
    return { pending, approved, rejected, notCheckedIn, checkedIn }
  }, [signups])

  return (
    <div>
      <PageHeader title="报名管理" extra={
        <Space>
          <Select
            placeholder="选择活动"
            style={{ width: 280 }}
            value={activityId}
            onChange={(v) => { setActivityId(v); setPage(1); setActiveTab('all') }}
            onDropdownVisibleChange={(open) => { if (open) reloadActivities() }}
            options={activities.map((a: any) => ({ label: a.title, value: a.id }))}
          />
        </Space>
      } />

      {/* 状态Tab切换 */}
      {activityId && (
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          style={{ marginBottom: 16 }}
          items={[
            { key: 'all', label: <Badge count={signups.length} offset={[10, 0]} size="small">全部</Badge> },
            { key: 'pending', label: <Badge count={stats.pending} offset={[10, 0]} size="small" color="orange">待审核</Badge> },
            { key: 'approved', label: <Badge count={stats.approved} offset={[10, 0]} size="small" color="green">已通过</Badge> },
            { key: 'rejected', label: <Badge count={stats.rejected} offset={[10, 0]} size="small" color="red">已驳回</Badge> },
            { key: 'not_checked_in', label: <Badge count={stats.notCheckedIn} offset={[10, 0]} size="small" color="blue">待签到</Badge> },
            { key: 'checked_in', label: <Badge count={stats.checkedIn} offset={[10, 0]} size="small" color="green">已签到</Badge> },
          ]}
        />
      )}

      {/* 顶部筛选条 */}
      <div style={{ marginBottom: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <SearchCapsule placeholder="姓名" value={nameKw} onChange={setNameKw} />
        <SearchCapsule placeholder="手机号" value={phoneKw} onChange={setPhoneKw} />
        <SearchCapsule placeholder="学校" value={schoolKw} onChange={setSchoolKw} />
        <Button className="pill-action" onClick={()=>{setNameKw('');setPhoneKw('');setSchoolKw('')}}>重置</Button>
      </div>

      <SectionCard>
        {/* 操作区 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
          <Space>
            <span style={{ color: '#666' }}>已选 <strong>{selectedRowKeys.length}</strong> 项</span>
          </Space>
          <Space wrap>
            {/* 批量审核按钮 */}
            <Button 
              type="primary"
              icon={<CheckCircleOutlined />}
              disabled={!selectedRowKeys.length}
              onClick={() => { setReviewAction('approve'); setReviewModalVisible(true) }}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              批量通过
            </Button>
            <Button 
              danger
              icon={<CloseCircleOutlined />}
              disabled={!selectedRowKeys.length}
              onClick={() => { setReviewAction('reject'); setReviewModalVisible(true) }}
            >
              批量驳回
            </Button>
            <Button className="pill-action" onClick={exportSelectedExcel} disabled={!selectedRowKeys.length}>
              批量导出Excel
            </Button>
            <Popconfirm title="确认批量删除？" okText="删除" cancelText="取消" okButtonProps={{ danger: true }} onConfirm={bulkDelete}>
              <Button className="pill-action pill-delete" disabled={!selectedRowKeys.length}>批量删除</Button>
            </Popconfirm>
            {activityId && (
              <Button
                className="pill-action"
                onClick={async () => {
                  const blob = await exportSignups(activityId, 'csv')
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `signups_${activityId}.csv`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
              >
                导出全部CSV
              </Button>
            )}
          </Space>
        </div>

        <Table 
          rowKey="id" 
          columns={columns} 
          loading={loading} 
          dataSource={data}
          rowSelection={{ 
            selectedRowKeys, 
            onChange: (keys) => setSelectedRowKeys(keys as (string|number)[]),
            getCheckboxProps: (record: any) => ({
              disabled: activeTab === 'pending' ? record.status !== 'pending' : false,
            }),
          }} 
          scroll={{ x: 2200 }}
          pagination={{
            current: page,
            pageSize,
            total: (nameKw || phoneKw || schoolKw || activeTab !== 'all') ? data.length : total,
            onChange: async (p, ps) => {
              setPage(p); setPageSize(ps)
              if (!activityId || (nameKw || phoneKw || schoolKw) || activeTab !== 'all') return
              setLoading(true)
              const su = await listSignups({ activity_id: activityId, limit: ps, offset: (p - 1) * ps }).catch(() => [])
              setSignups(su || [])
              setLoading(false)
            },
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
          }}
        />
      </SectionCard>

      {/* 批量审核弹窗 */}
      <Modal
        title={reviewAction === 'approve' ? '批量通过报名' : '批量驳回报名'}
        open={reviewModalVisible}
        onCancel={() => { setReviewModalVisible(false); setReviewMessage('') }}
        onOk={handleBulkReview}
        confirmLoading={reviewLoading}
        okText={reviewAction === 'approve' ? '确认通过' : '确认驳回'}
        okButtonProps={{ 
          danger: reviewAction === 'reject',
          style: reviewAction === 'approve' ? { background: '#52c41a', borderColor: '#52c41a' } : {}
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <p>即将{reviewAction === 'approve' ? '通过' : '驳回'} <strong>{selectedRowKeys.length}</strong> 条报名记录</p>
        </div>
        <Input.TextArea
          placeholder={reviewAction === 'approve' ? '通过备注（选填）' : '驳回原因（选填）'}
          value={reviewMessage}
          onChange={(e) => setReviewMessage(e.target.value)}
          rows={3}
        />
      </Modal>

      {/* 报名详情抽屉 */}
      <Drawer
        title="报名详情"
        open={detailDrawerVisible}
        onClose={() => { setDetailDrawerVisible(false); setDetailSignup(null) }}
        width={520}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : detailSignup ? (
          <div>
            {/* 状态信息 */}
            <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
              <Tag color={STATUS_COLOR[detailSignup.status]} style={{ fontSize: 14, padding: '4px 12px' }}>
                {SIGNUP_STATUS_LABEL[detailSignup.status]}
              </Tag>
              <Tag color={CHECKIN_COLOR[detailSignup.checkin_status]} style={{ fontSize: 14, padding: '4px 12px' }}>
                {CHECKIN_STATUS_LABEL[detailSignup.checkin_status]}
              </Tag>
            </div>

            {/* 基本信息 */}
            <Descriptions title="报名信息" column={1} bordered size="small">
              {(detailSignup.answers || []).map((ans: any) => {
                const field = (activity?.form_fields || []).find((f: any) => f.id === ans.field_id)
                const label = field?.label || `字段${ans.field_id}`
                const value = ans.value_text ?? (Array.isArray(ans.value_json) ? ans.value_json.join(', ') : (ans.value_json ? JSON.stringify(ans.value_json) : '-'))
                return (
                  <Descriptions.Item key={ans.field_id} label={label}>
                    {value || '-'}
                  </Descriptions.Item>
                )
              })}
            </Descriptions>

            {/* 同行人员 */}
            {detailSignup.companions && detailSignup.companions.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4>同行人员</h4>
                {detailSignup.companions.map((c: any, idx: number) => (
                  <Descriptions key={c.id} title={`同行人 ${idx + 1}`} column={1} bordered size="small" style={{ marginBottom: 12 }}>
                    <Descriptions.Item label="姓名">{c.name}</Descriptions.Item>
                    {c.mobile && <Descriptions.Item label="手机">{c.mobile}</Descriptions.Item>}
                    {c.organization && <Descriptions.Item label="单位">{c.organization}</Descriptions.Item>}
                  </Descriptions>
                ))}
              </div>
            )}

            {/* 时间线 */}
            <div style={{ marginTop: 24 }}>
              <h4>时间线</h4>
              <Timeline
                items={[
                  { children: `报名时间：${detailSignup.created_at ? new Date(detailSignup.created_at).toLocaleString() : '-'}` },
                  ...(detailSignup.reviewed_at ? [{
                    children: `审核时间：${new Date(detailSignup.reviewed_at).toLocaleString()}`,
                    color: detailSignup.status === 'approved' ? 'green' : 'red',
                  }] : []),
                  ...(detailSignup.checkin_status === 'checked_in' ? [{
                    children: `签到时间：${detailSignup.updated_at ? new Date(detailSignup.updated_at).toLocaleString() : '-'}`,
                    color: 'green',
                  }] : []),
                ]}
              />
            </div>

            {/* 操作按钮 */}
            {detailSignup.status === 'approved' && detailSignup.checkin_status === 'not_checked_in' && (
              <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <Button 
                  type="primary" 
                  icon={<ScanOutlined />}
                  onClick={() => handleCheckin(detailSignup.id, 'checked_in')}
                  loading={checkinLoading}
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                >
                  确认签到
                </Button>
                <Button 
                  danger
                  onClick={() => handleCheckin(detailSignup.id, 'no_show')}
                  loading={checkinLoading}
                >
                  标记缺席
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Empty description="暂无数据" />
        )}
      </Drawer>
    </div>
  )
}
