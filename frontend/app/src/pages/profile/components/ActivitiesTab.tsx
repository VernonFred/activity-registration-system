/**
 * 活动列表Tab组件
 * 创建时间: 2025年12月9日
 */
import { useEffect, useMemo, useState } from 'react'
import { View, Text } from '@tarojs/components'
import type { SignupRecord, UserInfo } from '../types'
import { formatDate } from '../utils'
import './ActivitiesTab.scss'

interface ActivitiesTabProps {
  signups: SignupRecord[]
  user: UserInfo | null
  expandedSignup: number | null
  onToggleExpand: (id: number) => void
  onViewActivity: (activityId: number) => void
  onEditSignup: (signupId: number) => void
  onEditTransport: (signupId: number) => void
  onCancelSignup: (signupId: number) => void
  onAddCompanion: (signupId: number) => void
  onViewCredential: (signupId: number) => void
  onCheckin: (signupId: number) => void
  onPayment: (signupId: number) => void
  onLikeActivity: (signup: SignupRecord) => void
  onCommentActivity: (signup: SignupRecord) => void
  onFavoriteActivity: (signup: SignupRecord) => void
  onShareActivity: (signup: SignupRecord) => void
}

const METRIC_CONFIG: Array<{
  key: 'likes' | 'comments' | 'favorites' | 'shares'
  label: string
  icon: string
  tone: 'danger' | 'muted'
}> = [
  { key: 'likes', label: '点赞', icon: '♥', tone: 'danger' },
  { key: 'comments', label: '评论', icon: '◌', tone: 'muted' },
  { key: 'favorites', label: '收藏', icon: '★', tone: 'danger' },
  { key: 'shares', label: '分享', icon: '↗', tone: 'muted' },
]

function getSignupStatusLabel(status: SignupRecord['status']) {
  if (status === 'approved') return '已报名'
  if (status === 'pending') return '待审核'
  return '已驳回'
}

function getCheckinStatusLabel(status: SignupRecord['checkin_status']) {
  if (status === 'checked_in') return '已签到'
  if (status === 'no_show') return '未签到'
  return '待签到'
}

const ActivitiesTab: React.FC<ActivitiesTabProps> = ({
  signups,
  user,
  expandedSignup,
  onToggleExpand,
  onViewActivity,
  onEditSignup,
  onEditTransport,
  onCancelSignup,
  onAddCompanion,
  onViewCredential,
  onCheckin,
  onPayment,
  onLikeActivity,
  onCommentActivity,
  onFavoriteActivity,
  onShareActivity,
}) => {
  const [menuSignupId, setMenuSignupId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 2

  const totalPages = Math.max(1, Math.ceil(signups.length / pageSize))
  const pagedSignups = useMemo(() => {
    const start = (page - 1) * pageSize
    return signups.slice(start, start + pageSize)
  }, [page, signups])

  useEffect(() => {
    setPage((prev) => Math.min(prev, Math.max(1, Math.ceil(signups.length / pageSize))))
  }, [signups.length])

  const closeMenu = () => {
    setMenuSignupId(null)
  }

  const toggleMenu = (signupId: number) => {
    setMenuSignupId((prev) => (prev === signupId ? null : signupId))
  }

  const handleMetricClick = (
    metricKey: 'likes' | 'comments' | 'favorites' | 'shares',
    signup: SignupRecord
  ) => {
    if (metricKey === 'likes') onLikeActivity(signup)
    if (metricKey === 'comments') onCommentActivity(signup)
    if (metricKey === 'favorites') onFavoriteActivity(signup)
    if (metricKey === 'shares') onShareActivity(signup)
  }

  return (
    <View className="tab-content activities-content-v2 animate-fade-in" onClick={closeMenu}>
      {pagedSignups.map((signup) => (
        <View
          key={signup.id}
          className={`signup-record-wrapper ${expandedSignup === signup.id ? 'is-expanded' : ''}`}
        >
          <View className="signup-record-card">
            <View className="record-summary" onClick={() => onViewActivity(signup.activity_id)}>
              <View className="record-title-row">
                <Text className="record-title">{signup.activity_title}</Text>
                <View className={`record-status-tag is-${signup.status}`}>
                  <Text>{getSignupStatusLabel(signup.status)}</Text>
                </View>
              </View>

              {!!signup.activity_desc && <Text className="record-desc">{signup.activity_desc}</Text>}
              <Text className="record-date">{formatDate(signup.activity_date)}</Text>

              <View className="record-footer-bar">
                <View className="record-metrics">
                  {METRIC_CONFIG.map((metric) => (
                    <View
                      key={metric.key}
                      className={`record-metric-item is-${(
                        (metric.key === 'likes' && signup.is_liked) ||
                        (metric.key === 'favorites' && signup.is_favorited) ||
                        (metric.key === 'comments' && signup.is_commented)
                      )
                        ? 'danger'
                        : 'muted'} ${(
                          (metric.key === 'likes' && signup.is_liked) ||
                          (metric.key === 'favorites' && signup.is_favorited) ||
                          (metric.key === 'comments' && signup.is_commented)
                        ) ? 'is-active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMetricClick(metric.key, signup)
                      }}
                    >
                      <Text className="metric-icon">
                        {metric.key === 'likes'
                          ? (signup.is_liked ? '♥' : '♡')
                          : metric.key === 'comments'
                            ? (signup.is_commented ? '●' : '◌')
                          : metric.key === 'favorites'
                            ? (signup.is_favorited ? '★' : '☆')
                            : metric.icon}
                      </Text>
                      <Text className="metric-value">{signup[metric.key]}</Text>
                    </View>
                  ))}
                </View>

                <View
                  className="record-expand-trigger"
                  onClick={(e) => {
                    e.stopPropagation()
                    closeMenu()
                    onToggleExpand(signup.id)
                  }}
                >
                  <Text className={`expand-arrow ${expandedSignup === signup.id ? 'is-expanded' : ''}`}>⌄</Text>
                </View>
              </View>
            </View>
          </View>

          {expandedSignup === signup.id && (
            <View className="record-detail-panel animate-slide-down">
              <View className="participant-list-v2">
                {(() => {
                  const hasTransport = signup.checkin_status === 'not_checked_in' && !signup.transport_completed
                  const actionCount = 2 + (signup.checkin_status === 'checked_in' ? 1 : (signup.payment_status !== 'paid' ? 2 : 1))
                  const wrapTags = hasTransport && actionCount >= 4

                  const tagsContent = (
                    <>
                      <Text className={`participant-badge ${signup.payment_status === 'paid' ? 'is-success' : 'is-warning'}`}>
                        {signup.payment_status === 'paid' ? '已缴费' : '待缴费'}
                      </Text>
                      <Text className={`participant-badge ${signup.checkin_status === 'checked_in' ? 'is-success' : 'is-muted'}`}>
                        {getCheckinStatusLabel(signup.checkin_status)}
                      </Text>
                      {signup.checkin_status === 'checked_in' ? (
                        <Text
                          className="participant-action-link"
                          onClick={(e) => { e.stopPropagation(); onViewCredential(signup.id) }}
                        >
                          查看参会凭证
                        </Text>
                      ) : (
                        <>
                          {signup.payment_status !== 'paid' && (
                            <Text
                              className="participant-action-link is-danger"
                              onClick={(e) => { e.stopPropagation(); onPayment(signup.id) }}
                            >
                              去缴费
                            </Text>
                          )}
                          <Text
                            className="participant-action-link is-danger"
                            onClick={(e) => { e.stopPropagation(); onCheckin(signup.id) }}
                          >
                            去签到
                          </Text>
                        </>
                      )}
                    </>
                  )

                  return (
                    <View className={`participant-row is-primary ${wrapTags ? 'is-wrap' : ''}`}>
                      <View className="participant-left">
                        <Text className="participant-name">{user?.name || '主报名人'}</Text>
                        {hasTransport && (
                          <Text
                            className="participant-inline-link"
                            onClick={(e) => { e.stopPropagation(); onEditTransport(signup.id) }}
                          >
                            完善交通信息
                          </Text>
                        )}
                      </View>
                      <View className={`participant-right ${wrapTags ? 'is-full' : ''}`}>
                        {tagsContent}
                      </View>
                      <View className="row-menu" onClick={(e) => { e.stopPropagation() }}>
                        <Text className="row-menu-trigger" onClick={() => toggleMenu(signup.id)}>⋮</Text>
                        {menuSignupId === signup.id && (
                          <View className="row-menu-panel">
                            <View className="row-menu-item" onClick={() => { closeMenu(); onEditSignup(signup.id) }}>
                              <Text>修改报名信息</Text>
                            </View>
                            <View className="row-menu-item is-danger" onClick={() => { closeMenu(); onCancelSignup(signup.id) }}>
                              <Text>取消报名</Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  )
                })()}

                {signup.companions?.map((companion) => (
                  <View key={companion.id} className="participant-row">
                    <View className="participant-left">
                      <Text className="participant-name">{companion.name}</Text>
                    </View>
                    <View className="participant-right">
                      {signup.checkin_status === 'checked_in' ? (
                        <Text
                          className="participant-action-link"
                          onClick={(e) => { e.stopPropagation(); onViewCredential(signup.id) }}
                        >
                          查看参会凭证
                        </Text>
                      ) : (
                        <>
                          {signup.payment_status !== 'paid' && (
                            <Text
                              className="participant-action-link is-danger"
                              onClick={(e) => { e.stopPropagation(); onPayment(signup.id) }}
                            >
                              去缴费
                            </Text>
                          )}
                          <Text
                            className="participant-action-link is-danger"
                            onClick={(e) => { e.stopPropagation(); onCheckin(signup.id) }}
                          >
                            去签到
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              {signup.status === 'approved' && signup.checkin_status === 'not_checked_in' && (
                <View
                  className="add-companion-btn-v2"
                  onClick={(e) => {
                    e.stopPropagation()
                    closeMenu()
                    onAddCompanion(signup.id)
                  }}
                >
                  <Text>添加同行人员</Text>
                </View>
              )}
            </View>
          )}
        </View>
      ))}

      {totalPages > 1 && (
        <View className="pagination-v2">
          <Text
            className={`page-nav ${page <= 1 ? 'is-disabled' : ''}`}
            onClick={() => page > 1 && setPage(page - 1)}
          >
            ‹
          </Text>
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNo = index + 1
            return (
              <Text
                key={pageNo}
                className={`page-index ${pageNo === page ? 'is-active' : ''}`}
                onClick={() => setPage(pageNo)}
              >
                {pageNo}
              </Text>
            )
          })}
          <Text
            className={`page-nav ${page >= totalPages ? 'is-disabled' : ''}`}
            onClick={() => page < totalPages && setPage(page + 1)}
          >
            ›
          </Text>
        </View>
      )}
    </View>
  )
}

export default ActivitiesTab
