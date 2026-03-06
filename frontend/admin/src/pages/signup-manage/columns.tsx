import { Button, Space, Tag, Tooltip } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, ScanOutlined } from '@ant-design/icons'
import { CHECKIN_COLOR, CHECKIN_STATUS_LABEL, FIELD_MAP, SIGNUP_STATUS_LABEL, STATUS_COLOR } from './config'
import { getAnswerByLabels, getAnswerValue } from './utils'

export function buildSignupColumns({
  activity,
  checkinLoading,
  onShowDetail,
  onCheckin,
  onApprove,
  onReject,
}: {
  activity: any
  checkinLoading: boolean
  onShowDetail: (signupId: number) => void
  onCheckin: (signupId: number, status: 'checked_in' | 'no_show') => void
  onApprove: (signupId: number) => Promise<void>
  onReject: (signupId: number) => Promise<void>
}) {
  const baseColumns: any[] = [
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      fixed: 'left',
      render: (status: string) => (
        <Tag color={STATUS_COLOR[status] || 'default'}>{SIGNUP_STATUS_LABEL[status] || status}</Tag>
      ),
    },
    {
      title: '签到',
      dataIndex: 'checkin_status',
      width: 90,
      fixed: 'left',
      render: (status: string) => (
        <Tag color={CHECKIN_COLOR[status] || 'default'}>{CHECKIN_STATUS_LABEL[status] || status}</Tag>
      ),
    },
  ]

  const mappedColumns = FIELD_MAP.map((field) => ({
    title: field.title,
    dataIndex: field.key,
    width: 160,
    render: (_: any, signup: any) => getAnswerByLabels(signup, activity, field.labels) || '-',
  }))

  const usedLabels = new Set(FIELD_MAP.flatMap((field) => field.labels))
  const extraColumns = (activity?.form_fields || [])
    .filter((field: any) => !Array.from(usedLabels).some((label) => (field.label || '').includes(label)))
    .map((field: any) => ({
      title: field.label,
      dataIndex: `field_${field.id}`,
      width: 160,
      render: (_: any, signup: any) => {
        const answer = (signup.answers || []).find((item: any) => item.field_id === field.id)
        const value = getAnswerValue(answer)
        return value || '-'
      },
    }))

  const actionColumn = {
    title: '操作',
    key: 'action',
    width: 180,
    fixed: 'right' as const,
    render: (_: any, signup: any) => (
      <Space size="small">
        <Tooltip title="查看详情">
          <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => onShowDetail(signup.id)} />
        </Tooltip>
        {signup.status === 'approved' && signup.checkin_status === 'not_checked_in' && (
          <Tooltip title="签到">
            <Button
              type="text"
              size="small"
              icon={<ScanOutlined style={{ color: '#52c41a' }} />}
              onClick={() => onCheckin(signup.id, 'checked_in')}
              loading={checkinLoading}
            />
          </Tooltip>
        )}
        {signup.status === 'pending' && (
          <>
            <Tooltip title="通过">
              <Button
                type="text"
                size="small"
                icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                onClick={() => void onApprove(signup.id)}
              />
            </Tooltip>
            <Tooltip title="驳回">
              <Button
                type="text"
                size="small"
                icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                onClick={() => void onReject(signup.id)}
              />
            </Tooltip>
          </>
        )}
      </Space>
    ),
  }

  return [...baseColumns, ...mappedColumns, ...extraColumns, actionColumn]
}
