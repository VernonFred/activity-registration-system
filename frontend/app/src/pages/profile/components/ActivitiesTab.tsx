/**
 * 活动列表Tab组件
 * 创建时间: 2025年12月9日
 */
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text } from '@tarojs/components'
import type { SignupRecord, UserInfo } from '../types'
import { formatDate } from '../utils'
import SignupDetailPanel from './activities/SignupDetailPanel'
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

const METRIC_CONFIG: Array<{ key: 'likes' | 'comments' | 'favorites' | 'shares'; icon: string }> = [
  { key: 'likes', icon: '♥' },
  { key: 'comments', icon: '◌' },
  { key: 'favorites', icon: '★' },
  { key: 'shares', icon: '↗' },
]

function getSignupStatusLabel(status: SignupRecord['status'], t: (key: string) => string) {
  if (status === 'approved') return t('profile.statusRegistered')
  if (status === 'pending') return t('profile.statusPending')
  return t('profile.statusRejected')
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
  const { t } = useTranslation()
  const [menuSignupId, setMenuSignupId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 2

  const totalPages = Math.max(1, Math.ceil(signups.length / pageSize))
  const pagedSignups = useMemo(() => signups.slice((page - 1) * pageSize, page * pageSize), [page, signups])

  useEffect(() => {
    setPage((prev) => Math.min(prev, Math.max(1, Math.ceil(signups.length / pageSize))))
  }, [signups.length])

  const closeMenu = () => setMenuSignupId(null)
  const toggleMenu = (signupId: number) => setMenuSignupId((prev) => (prev === signupId ? null : signupId))
  const handleMetricClick = (metricKey: 'likes' | 'comments' | 'favorites' | 'shares', signup: SignupRecord) => {
    if (metricKey === 'likes') onLikeActivity(signup)
    if (metricKey === 'comments') onCommentActivity(signup)
    if (metricKey === 'favorites') onFavoriteActivity(signup)
    if (metricKey === 'shares') onShareActivity(signup)
  }

  return (
    <View className="tab-content activities-content-v2 animate-fade-in" onClick={closeMenu}>
      {pagedSignups.map((signup) => (
        <View key={signup.id} className={`signup-record-wrapper ${expandedSignup === signup.id ? 'is-expanded' : ''}`}>
          <View className="signup-record-card">
            <View className="record-summary" onClick={() => onViewActivity(signup.activity_id)}>
              <View className="record-title-row">
                <Text className="record-title">{signup.activity_title}</Text>
                <View className={`record-status-tag is-${signup.status}`}>
                  <Text>{getSignupStatusLabel(signup.status, t)}</Text>
                </View>
              </View>
              {!!signup.activity_desc && <Text className="record-desc">{signup.activity_desc}</Text>}
              <Text className="record-date">{formatDate(signup.activity_date)}</Text>
              <View className="record-footer-bar">
                <View className="record-metrics">
                  {METRIC_CONFIG.map((metric) => {
                    const active = (metric.key === 'likes' && signup.is_liked) || (metric.key === 'favorites' && signup.is_favorited) || (metric.key === 'comments' && signup.is_commented)
                    return (
                      <View
                        key={metric.key}
                        className={`record-metric-item is-${active ? 'danger' : 'muted'} ${active ? 'is-active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); handleMetricClick(metric.key, signup) }}
                      >
                        <Text className="metric-icon">
                          {metric.key === 'likes' ? (signup.is_liked ? '♥' : '♡') : metric.key === 'comments' ? (signup.is_commented ? '●' : '◌') : metric.key === 'favorites' ? (signup.is_favorited ? '★' : '☆') : metric.icon}
                        </Text>
                        <Text className="metric-value">{signup[metric.key]}</Text>
                      </View>
                    )
                  })}
                </View>
                <View className="record-expand-trigger" onClick={(e) => { e.stopPropagation(); closeMenu(); onToggleExpand(signup.id) }}>
                  <Text className={`expand-arrow ${expandedSignup === signup.id ? 'is-expanded' : ''}`}>⌄</Text>
                </View>
              </View>
            </View>
          </View>

          {expandedSignup === signup.id && (
            <SignupDetailPanel
              signup={signup}
              userName={user?.name}
              menuSignupId={menuSignupId}
              onToggleMenu={toggleMenu}
              onCloseMenu={closeMenu}
              onEditSignup={onEditSignup}
              onEditTransport={onEditTransport}
              onCancelSignup={onCancelSignup}
              onAddCompanion={onAddCompanion}
              onViewCredential={onViewCredential}
              onCheckin={onCheckin}
              onPayment={onPayment}
            />
          )}
        </View>
      ))}

      {totalPages > 1 && (
        <View className="pagination-v2">
          <Text className={`page-nav ${page <= 1 ? 'is-disabled' : ''}`} onClick={() => page > 1 && setPage(page - 1)}>‹</Text>
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNo = index + 1
            return (
              <Text key={pageNo} className={`page-index ${pageNo === page ? 'is-active' : ''}`} onClick={() => setPage(pageNo)}>
                {pageNo}
              </Text>
            )
          })}
          <Text className={`page-nav ${page >= totalPages ? 'is-disabled' : ''}`} onClick={() => page < totalPages && setPage(page + 1)}>›</Text>
        </View>
      )}
    </View>
  )
}

export default ActivitiesTab
