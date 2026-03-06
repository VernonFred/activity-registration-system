import { Button, Descriptions, Drawer, Empty, Spin, Tag, Timeline } from 'antd'
import { ScanOutlined } from '@ant-design/icons'
import { CHECKIN_COLOR, CHECKIN_STATUS_LABEL, SIGNUP_STATUS_LABEL, STATUS_COLOR } from './config'
import { getAnswerValue } from './utils'

export default function SignupDetailDrawer({
  open,
  loading,
  signup,
  activity,
  checkinLoading,
  onClose,
  onCheckin,
}: {
  open: boolean
  loading: boolean
  signup: any
  activity: any
  checkinLoading: boolean
  onClose: () => void
  onCheckin: (signupId: number, status: 'checked_in' | 'no_show') => void
}) {
  return (
    <Drawer title="报名详情" open={open} onClose={onClose} width={520}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : signup ? (
        <div>
          <div style={{ marginBottom: 24, display: 'flex', gap: 12 }}>
            <Tag color={STATUS_COLOR[signup.status]} style={{ fontSize: 14, padding: '4px 12px' }}>
              {SIGNUP_STATUS_LABEL[signup.status]}
            </Tag>
            <Tag color={CHECKIN_COLOR[signup.checkin_status]} style={{ fontSize: 14, padding: '4px 12px' }}>
              {CHECKIN_STATUS_LABEL[signup.checkin_status]}
            </Tag>
          </div>

          <Descriptions title="报名信息" column={1} bordered size="small">
            {(signup.answers || []).map((answer: any) => {
              const field = (activity?.form_fields || []).find((item: any) => item.id === answer.field_id)
              const label = field?.label || `字段${answer.field_id}`
              const value = getAnswerValue(answer)
              return (
                <Descriptions.Item key={answer.field_id} label={label}>
                  {value || '-'}
                </Descriptions.Item>
              )
            })}
          </Descriptions>

          {signup.companions && signup.companions.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h4>同行人员</h4>
              {signup.companions.map((companion: any, index: number) => (
                <Descriptions key={companion.id} title={`同行人 ${index + 1}`} column={1} bordered size="small" style={{ marginBottom: 12 }}>
                  <Descriptions.Item label="姓名">{companion.name}</Descriptions.Item>
                  {companion.mobile && <Descriptions.Item label="手机">{companion.mobile}</Descriptions.Item>}
                  {companion.organization && <Descriptions.Item label="单位">{companion.organization}</Descriptions.Item>}
                </Descriptions>
              ))}
            </div>
          )}

          <div style={{ marginTop: 24 }}>
            <h4>时间线</h4>
            <Timeline
              items={[
                { children: `报名时间：${signup.created_at ? new Date(signup.created_at).toLocaleString() : '-'}` },
                ...(signup.reviewed_at
                  ? [{
                      children: `审核时间：${new Date(signup.reviewed_at).toLocaleString()}`,
                      color: signup.status === 'approved' ? 'green' : 'red',
                    }]
                  : []),
                ...(signup.checkin_status === 'checked_in'
                  ? [{
                      children: `签到时间：${signup.updated_at ? new Date(signup.updated_at).toLocaleString() : '-'}`,
                      color: 'green',
                    }]
                  : []),
              ]}
            />
          </div>

          {signup.status === 'approved' && signup.checkin_status === 'not_checked_in' && (
            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              <Button
                type="primary"
                icon={<ScanOutlined />}
                onClick={() => onCheckin(signup.id, 'checked_in')}
                loading={checkinLoading}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                确认签到
              </Button>
              <Button danger onClick={() => onCheckin(signup.id, 'no_show')} loading={checkinLoading}>
                标记缺席
              </Button>
            </div>
          )}
        </div>
      ) : (
        <Empty description="暂无数据" />
      )}
    </Drawer>
  )
}
