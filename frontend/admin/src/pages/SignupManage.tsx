import { useEffect, useMemo, useState } from 'react'
import { Input, Modal, Select, Space, Table, message } from 'antd'
import PageHeader from '../components/PageHeader'
import SectionCard from '../components/SectionCard'
import { exportSignups, getActivity, listActivities } from '../services/activities'
import { bulkDeleteSignups, bulkReviewSignups, checkinSignup, countSignups, getSignup, listSignups } from '../services/signups'
import SignupDetailDrawer from './signup-manage/SignupDetailDrawer'
import { buildSignupColumns } from './signup-manage/columns'
import type { Signup } from './signup-manage/config'
import { SignupBatchActions, SignupSearchBar, SignupStatusTabs } from './signup-manage/SignupControls'
import { getAnswerByLabels } from './signup-manage/utils'

export default function SignupManage() {
  const [activityId, setActivityId] = useState<number | undefined>(undefined)
  const [activity, setActivity] = useState<any | null>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [signups, setSignups] = useState<Signup[]>([])
  const [loading, setLoading] = useState(false)
  const [nameKw, setNameKw] = useState('')
  const [phoneKw, setPhoneKw] = useState('')
  const [schoolKw, setSchoolKw] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve')
  const [reviewMessage, setReviewMessage] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)
  const [checkinLoading, setCheckinLoading] = useState(false)
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false)
  const [detailSignup, setDetailSignup] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('all')

  async function reloadActivities() {
    try {
      setActivities((await listActivities({ limit: 100 })) || [])
    } catch (error: any) {
      message.error(error?.response?.data?.detail || '加载活动失败')
      setActivities([])
    }
  }

  async function reloadSignups(targetPage = page, targetPageSize = pageSize) {
    if (!activityId) return
    setLoading(true)
    try {
      const [countResult, rows] = await Promise.all([
        countSignups({ activity_id: activityId }).catch(() => ({ total: 0 })),
        listSignups({ activity_id: activityId, limit: targetPageSize, offset: (targetPage - 1) * targetPageSize }).catch(() => []),
      ])
      setTotal((countResult as any)?.total || 0)
      setSignups(rows || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void reloadActivities() }, [])
  useEffect(() => {
    if (!activityId) return
    setLoading(true)
    Promise.all([
      getActivity(activityId).catch(() => null),
      countSignups({ activity_id: activityId }).catch(() => ({ total: 0 })),
      listSignups({ activity_id: activityId, limit: pageSize, offset: (page - 1) * pageSize }).catch(() => []),
    ]).then(([act, countResult, rows]) => {
      setActivity(act)
      setTotal((countResult as any)?.total || 0)
      setSignups(rows || [])
    }).finally(() => setLoading(false))
  }, [activityId, page, pageSize])

  const filteredByTab = useMemo(() => {
    const tabFilters: Record<string, (signup: Signup) => boolean> = {
      all: () => true,
      pending: (signup) => signup.status === 'pending',
      approved: (signup) => signup.status === 'approved',
      rejected: (signup) => signup.status === 'rejected',
      not_checked_in: (signup) => signup.checkin_status === 'not_checked_in' && signup.status === 'approved',
      checked_in: (signup) => signup.checkin_status === 'checked_in',
    }
    return signups.filter(tabFilters[activeTab] || tabFilters.all)
  }, [signups, activeTab])

  const data = useMemo(() => filteredByTab.filter((signup) => {
    if (nameKw && !(getAnswerByLabels(signup, activity, ['姓名', '名字']) || '').includes(nameKw)) return false
    if (phoneKw && !(getAnswerByLabels(signup, activity, ['手机', '电话']) || '').includes(phoneKw)) return false
    if (schoolKw && !(getAnswerByLabels(signup, activity, ['学校', '单位']) || '').includes(schoolKw)) return false
    return true
  }), [activity, filteredByTab, nameKw, phoneKw, schoolKw])

  const stats = useMemo(() => ({
    pending: signups.filter((signup) => signup.status === 'pending').length,
    approved: signups.filter((signup) => signup.status === 'approved').length,
    rejected: signups.filter((signup) => signup.status === 'rejected').length,
    notCheckedIn: signups.filter((signup) => signup.checkin_status === 'not_checked_in' && signup.status === 'approved').length,
    checkedIn: signups.filter((signup) => signup.checkin_status === 'checked_in').length,
  }), [signups])

  const columns = useMemo(() => buildSignupColumns({
    activity,
    checkinLoading,
    onShowDetail: async (signupId) => {
      setDetailLoading(true)
      setDetailDrawerVisible(true)
      try {
        setDetailSignup(await getSignup(signupId))
      } catch {
        message.error('加载详情失败')
      } finally {
        setDetailLoading(false)
      }
    },
    onCheckin: async (signupId, status) => {
      setCheckinLoading(true)
      try {
        await checkinSignup(signupId, status)
        message.success(status === 'checked_in' ? '签到成功' : '已标记缺席')
        await reloadSignups()
      } catch (error: any) {
        message.error(error?.response?.data?.detail || '签到失败')
      } finally {
        setCheckinLoading(false)
      }
    },
    onApprove: async (signupId) => {
      try {
        await bulkReviewSignups([signupId], 'approve')
        message.success('已通过')
        await reloadSignups()
      } catch (error: any) {
        message.error(error?.response?.data?.detail || '操作失败')
      }
    },
    onReject: async (signupId) => {
      try {
        await bulkReviewSignups([signupId], 'reject')
        message.success('已驳回')
        await reloadSignups()
      } catch (error: any) {
        message.error(error?.response?.data?.detail || '操作失败')
      }
    },
  }), [activity, checkinLoading])

  return (
    <div>
      <PageHeader title="报名管理" extra={<Space><Select placeholder="选择活动" style={{ width: 280 }} value={activityId} onChange={(value) => { setActivityId(value); setPage(1); setActiveTab('all') }} onDropdownVisibleChange={(open) => { if (open) void reloadActivities() }} options={activities.map((item: any) => ({ label: item.title, value: item.id }))} /></Space>} />
      <SignupStatusTabs visible={Boolean(activityId)} activeTab={activeTab} onChange={setActiveTab} total={signups.length} stats={stats} />
      <SignupSearchBar nameKw={nameKw} phoneKw={phoneKw} schoolKw={schoolKw} onName={setNameKw} onPhone={setPhoneKw} onSchool={setSchoolKw} onReset={() => { setNameKw(''); setPhoneKw(''); setSchoolKw('') }} />

      <SectionCard>
        <SignupBatchActions
          selectedCount={selectedRowKeys.length}
          canOperate={Boolean(selectedRowKeys.length)}
          onApprove={() => { setReviewAction('approve'); setReviewModalVisible(true) }}
          onReject={() => { setReviewAction('reject'); setReviewModalVisible(true) }}
          onExportSelected={async () => {
            if (!activityId) return message.info('请先选择活动')
            const ids = (selectedRowKeys as number[]) || []
            const blob = await exportSignups(activityId, 'xlsx', ids.length ? ids : undefined)
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `signups_${activityId}${ids.length ? '_selected' : ''}.xlsx`
            link.click()
            URL.revokeObjectURL(url)
          }}
          onDelete={() => void (async () => {
            if (!selectedRowKeys.length) return message.info('请先选择记录')
            try {
              const response = await bulkDeleteSignups(selectedRowKeys as number[])
              message.success(`已批量删除：成功 ${response.deleted} 条`)
            } catch (error: any) {
              message.error(error?.response?.data?.detail || '批量删除失败')
            }
            setSelectedRowKeys([])
            await reloadSignups()
          })()}
          showExportAll={Boolean(activityId)}
          onExportAll={async () => {
            if (!activityId) return
            const blob = await exportSignups(activityId, 'csv')
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `signups_${activityId}.csv`
            link.click()
            URL.revokeObjectURL(url)
          }}
        />
        <Table
          rowKey="id"
          columns={columns}
          loading={loading}
          dataSource={data}
          rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys as (string | number)[]), getCheckboxProps: (record: any) => ({ disabled: activeTab === 'pending' ? record.status !== 'pending' : false }) }}
          scroll={{ x: 2200 }}
          pagination={{
            current: page,
            pageSize,
            total: nameKw || phoneKw || schoolKw || activeTab !== 'all' ? data.length : total,
            onChange: async (nextPage, nextPageSize) => {
              setPage(nextPage)
              setPageSize(nextPageSize)
              if (!activityId || nameKw || phoneKw || schoolKw || activeTab !== 'all') return
              await reloadSignups(nextPage, nextPageSize)
            },
            showSizeChanger: true,
            showTotal: (count) => `共 ${count} 条`,
          }}
        />
      </SectionCard>

      <Modal title={reviewAction === 'approve' ? '批量通过报名' : '批量驳回报名'} open={reviewModalVisible} onCancel={() => { setReviewModalVisible(false); setReviewMessage('') }} onOk={async () => {
        if (!selectedRowKeys.length) return message.info('请先选择记录')
        setReviewLoading(true)
        try {
          const response = await bulkReviewSignups(selectedRowKeys as number[], reviewAction, reviewMessage || undefined)
          const actionText = reviewAction === 'approve' ? '通过' : '驳回'
          message.success(`批量审核完成：${actionText} ${response.approved_count + response.rejected_count} 条，跳过 ${response.skipped_count} 条`)
          setReviewModalVisible(false)
          setReviewMessage('')
          setSelectedRowKeys([])
          await reloadSignups()
        } catch (error: any) {
          message.error(error?.response?.data?.detail || '批量审核失败')
        } finally {
          setReviewLoading(false)
        }
      }} confirmLoading={reviewLoading} okText={reviewAction === 'approve' ? '确认通过' : '确认驳回'} okButtonProps={{ danger: reviewAction === 'reject', style: reviewAction === 'approve' ? { background: '#52c41a', borderColor: '#52c41a' } : {} }}>
        <div style={{ marginBottom: 16 }}><p>即将{reviewAction === 'approve' ? '通过' : '驳回'} <strong>{selectedRowKeys.length}</strong> 条报名记录</p></div>
        <Input.TextArea placeholder={reviewAction === 'approve' ? '通过备注（选填）' : '驳回原因（选填）'} value={reviewMessage} onChange={(event) => setReviewMessage(event.target.value)} rows={3} />
      </Modal>

      <SignupDetailDrawer open={detailDrawerVisible} loading={detailLoading} signup={detailSignup} activity={activity} checkinLoading={checkinLoading} onClose={() => { setDetailDrawerVisible(false); setDetailSignup(null) }} onCheckin={async (signupId, status) => {
        setCheckinLoading(true)
        try {
          await checkinSignup(signupId, status)
          message.success(status === 'checked_in' ? '签到成功' : '已标记缺席')
          await reloadSignups()
        } catch (error: any) {
          message.error(error?.response?.data?.detail || '签到失败')
        } finally {
          setCheckinLoading(false)
        }
      }} />
    </div>
  )
}
