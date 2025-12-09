/**
 * 活动列表Tab组件
 * 创建时间: 2025年12月9日
 */
import { View, Text } from '@tarojs/components'
import type { SignupRecord, UserInfo } from '../types'
import { formatDate } from '../utils'

interface ActivitiesTabProps {
  signups: SignupRecord[]
  user: UserInfo | null
  expandedSignup: number | null
  onToggleExpand: (id: number) => void
  onViewActivity: (activityId: number) => void
  onEditSignup: (signupId: number) => void
  onCancelSignup: (signupId: number) => void
  onAddCompanion: (signupId: number) => void
  onViewCredential: (signupId: number) => void
  onPayment: () => void
}

const ActivitiesTab: React.FC<ActivitiesTabProps> = ({
  signups,
  user,
  expandedSignup,
  onToggleExpand,
  onViewActivity,
  onEditSignup,
  onCancelSignup,
  onAddCompanion,
  onViewCredential,
  onPayment,
}) => {
  return (
    <View className="tab-content activities-content animate-fade-in">
      {signups.map((signup) => (
        <View key={signup.id} className="signup-card glass-card">
          {/* 活动信息 */}
          <View className="signup-header" onClick={() => onViewActivity(signup.activity_id)}>
            <View className="activity-info">
              <Text className="activity-title">{signup.activity_title}</Text>
              <View className={`status-tag ${signup.status}`}>
                {signup.status === 'approved' ? '已报名' : signup.status === 'pending' ? '待审核' : '已驳回'}
              </View>
            </View>
            <Text className="activity-desc">{signup.activity_desc}</Text>
            <Text className="activity-date">{formatDate(signup.activity_date)}</Text>
            <View className="activity-stats">
              <View className="stat-item">
                <Text className="stat-icon">❤️</Text>
                <Text className="stat-value">{signup.likes} 点赞</Text>
              </View>
              <View className="stat-item">
                <Text className="stat-icon">💬</Text>
                <Text className="stat-value">{signup.comments} 评论</Text>
              </View>
              <View className="stat-item">
                <Text className="stat-icon">⭐</Text>
                <Text className="stat-value">{signup.favorites} 收藏</Text>
              </View>
              <View className="stat-item">
                <Text className="stat-icon">↗️</Text>
                <Text className="stat-value">{signup.shares} 分享</Text>
              </View>
            </View>
          </View>

          {/* 展开/收起按钮 */}
          <View className="expand-btn" onClick={() => onToggleExpand(signup.id)}>
            <Text className={`expand-icon ${expandedSignup === signup.id ? 'expanded' : ''}`}>▼</Text>
          </View>

          {/* 展开内容 */}
          {expandedSignup === signup.id && (
            <View className="signup-detail animate-slide-down">
              {/* 参与人员列表 */}
              <View className="participant-list">
                {/* 主报名人 */}
                <View className="participant-item main">
                  <Text className="participant-name">{user?.name}</Text>
                  <View className="participant-actions">
                    {signup.checkin_status === 'not_checked_in' && (
                      <>
                        <Text className="action-link" onClick={onPayment}>
                          {signup.payment_status === 'paid' ? '已缴费' : '去缴费'}
                        </Text>
                        <Text className="action-link" onClick={() => onViewCredential(signup.id)}>
                          去签到
                        </Text>
                      </>
                    )}
                    {signup.checkin_status === 'checked_in' && (
                      <Text className="action-link" onClick={() => onViewCredential(signup.id)}>查看参会凭证</Text>
                    )}
                    <View className="more-actions" onClick={(e) => { e.stopPropagation() }}>
                      <Text className="more-icon">•••</Text>
                      <View className="dropdown-menu">
                        <View className="menu-item" onClick={() => onEditSignup(signup.id)}>
                          <Text>✏️ 修改信息</Text>
                        </View>
                        <View className="menu-item danger" onClick={() => onCancelSignup(signup.id)}>
                          <Text>🗑️ 取消报名</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                {/* 同行人员 */}
                {signup.companions?.map((companion) => (
                  <View key={companion.id} className="participant-item">
                    <Text className="participant-name">{companion.name}</Text>
                    <View className="participant-actions">
                      {signup.checkin_status === 'checked_in' && (
                        <Text className="action-link" onClick={() => onViewCredential(signup.id)}>查看参会凭证</Text>
                      )}
                      {signup.checkin_status !== 'checked_in' && (
                        <>
                          <Text className="action-link warning">去缴费</Text>
                          <Text className="action-link warning">去签到</Text>
                        </>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              {/* 添加同行人员按钮 */}
              {signup.status === 'approved' && signup.checkin_status === 'not_checked_in' && (
                <View className="add-companion-btn" onClick={() => onAddCompanion(signup.id)}>
                  <Text>添加同行人员</Text>
                </View>
              )}
            </View>
          )}
        </View>
      ))}

      {/* 分页 */}
      <View className="pagination">
        <Text className="page-btn disabled">‹</Text>
        <Text className="page-num active">1</Text>
        <Text className="page-num">2</Text>
        <Text className="page-num">3</Text>
        <Text className="page-num">4</Text>
        <Text className="page-btn">›</Text>
      </View>
    </View>
  )
}

export default ActivitiesTab

