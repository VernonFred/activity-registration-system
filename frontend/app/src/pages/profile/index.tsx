/**
 * 个人中心页面
 * 重构时间: 2025年12月9日
 */
import { useTranslation } from 'react-i18next'
import { View, ScrollView, Text } from '@tarojs/components'
import CustomTabBar from '../../components/CustomTabBar'
import { useTheme } from '../../context/ThemeContext'
import { ProfileHeader, ActivitiesTab, BadgesTab, NotificationsTab, SettingsTab } from './components'
import { getBadgeVisual } from './components/BadgesTab'
import { useProfilePage } from './hooks/useProfilePage'
import type { ProfileTab } from './types'
import './index.scss'

const TABS: { key: ProfileTab; icon: string; activeIcon: string }[] = [
  { key: 'activities', icon: '📅', activeIcon: '📅' },
  { key: 'badges', icon: '🏆', activeIcon: '🏆' },
  { key: 'notifications', icon: '🔔', activeIcon: '🔔' },
  { key: 'settings', icon: '⚙️', activeIcon: '⚙️' },
]

export default function Profile() {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const { state, actions } = useProfilePage(t)

  if (state.loading) {
    return (
      <View className={`profile-page theme-${theme} loading`}>
        <View className="profile-nav-safe-space" style={{ height: `${state.navSafeHeight}px` }} />
        <View className="skeleton-header" />
        <View className="skeleton-tabs" />
        <View className="skeleton-content" />
      </View>
    )
  }

  return (
    <View className={`profile-page theme-${theme}`}>
      <View className="profile-nav-safe-space" style={{ height: `${state.navSafeHeight}px` }} />
      <ProfileHeader
        user={state.user}
        activeTab={state.activeTab}
        tabs={TABS}
        onTabChange={actions.setActiveTab}
        onLogout={actions.handleLogout}
        onEditProfile={() => actions.handleSettingClick('profile')}
      />

      <ScrollView className="content-area profile-content-scroll" scrollY>
        {state.activeTab === 'activities' && (
          <ActivitiesTab
            signups={state.signups}
            user={state.user}
            expandedSignup={state.expandedSignup}
            onToggleExpand={actions.setExpandedSignup}
            onViewActivity={actions.handleViewActivity}
            onEditSignup={actions.handleEditSignup}
            onEditTransport={actions.handleEditTransport}
            onCancelSignup={actions.handleCancelSignup}
            onAddCompanion={actions.handleAddCompanion}
            onViewCredential={actions.handleViewCredential}
            onCheckin={actions.handleCheckin}
            onPayment={actions.handlePayment}
            onLikeActivity={actions.handleLikeActivity}
            onCommentActivity={actions.handleCommentActivity}
            onFavoriteActivity={actions.handleFavoriteActivity}
            onShareActivity={actions.handleShareActivity}
          />
        )}
        {state.activeTab === 'badges' && <BadgesTab badges={state.badges} user={state.user} onBadgeSelect={actions.setSelectedBadge} />}
        {state.activeTab === 'notifications' && (
          <NotificationsTab
            notifications={state.notifications}
            notifyTab={state.notifyTab}
            onNotifyTabChange={actions.setNotifyTab}
            onDeleteNotification={actions.handleDeleteNotification}
            onRequestSheet={actions.setSheetConfig}
          />
        )}
        {state.activeTab === 'settings' && <SettingsTab onSettingClick={actions.handleSettingClick} />}
      </ScrollView>

      {!state.selectedBadge && !state.sheetConfig && <CustomTabBar current={2} />}

      {state.sheetConfig && (
        <View className="nt-bottom-sheet-mask" onClick={() => actions.setSheetConfig(null)}>
          <View className="nt-bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <Text className="nt-bs-title">{state.sheetConfig.title}</Text>
            <Text className="nt-bs-desc">{state.sheetConfig.desc}</Text>
            <View className="nt-bs-actions">
              <View className="nt-bs-btn nt-bs-cancel" onClick={() => actions.setSheetConfig(null)}>
                <Text>{t('common.cancel')}</Text>
              </View>
              <View className="nt-bs-btn nt-bs-confirm" onClick={state.sheetConfig.onConfirm}>
                <Text>{t('common.confirm')}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {state.selectedBadge && (() => {
        const visual = getBadgeVisual(state.selectedBadge.name)
        return (
          <View className="badge-modal-mask" onClick={() => actions.setSelectedBadge(null)}>
            <View className="badge-modal-content" onClick={(e) => e.stopPropagation()}>
              <View className="badge-modal-badge-wrap">
                <View className="badge-modal-glow" style={{ background: visual.glow }} />
                <View className="css-badge css-badge--lg" style={{ background: visual.gradient, boxShadow: `0 8px 40px ${visual.glow}` }}>
                  <View className="css-badge__ring" />
                  <View className="css-badge__inner-ring" />
                  <View className="css-badge__shine" />
                  <Text className="css-badge__symbol">{visual.symbol}</Text>
                </View>
              </View>
              <Text className="badge-modal-name">{state.selectedBadge.name}</Text>
              {state.selectedBadge.slogan && <Text className="badge-modal-slogan">「{state.selectedBadge.slogan}」</Text>}
              {state.selectedBadge.earned_at && <Text className="badge-modal-date">{state.selectedBadge.earned_at}{t('profile.earned')}</Text>}
            </View>
            <View className="badge-modal-close" onClick={() => actions.setSelectedBadge(null)}>
              <Text>×</Text>
            </View>
          </View>
        )
      })()}
    </View>
  )
}
