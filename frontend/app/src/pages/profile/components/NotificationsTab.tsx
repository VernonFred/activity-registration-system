/**
 * 通知Tab组件
 * 创建时间: 2025年12月9日
 */
import { View, Text } from '@tarojs/components'
import type { Notification, NotifyTab } from '../types'

interface NotificationsTabProps {
  notifications: Notification[]
  notifyTab: NotifyTab
  onNotifyTabChange: (tab: NotifyTab) => void
  onDeleteNotification: (id: number) => void
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({
  notifications,
  notifyTab,
  onNotifyTabChange,
  onDeleteNotification,
}) => {
  return (
    <View className="tab-content notifications-content animate-fade-in">
      {/* 通知子Tab */}
      <View className="notify-tabs">
        <View
          className={`notify-tab ${notifyTab === 'system' ? 'active' : ''}`}
          onClick={() => onNotifyTabChange('system')}
        >
          系统通知
        </View>
        <View
          className={`notify-tab ${notifyTab === 'mentions' ? 'active' : ''}`}
          onClick={() => onNotifyTabChange('mentions')}
        >
          @ 我的
        </View>
        <View
          className={`notify-tab ${notifyTab === 'comments' ? 'active' : ''}`}
          onClick={() => onNotifyTabChange('comments')}
        >
          我的评论
        </View>
      </View>

      {/* 批量操作 */}
      <View className="notify-actions">
        <View className="action-btn">
          <Text>🔘</Text>
        </View>
        <View className="action-btn">
          <Text>批量删除</Text>
        </View>
      </View>

      {/* 通知列表 */}
      <View className="notify-list">
        {notifications.map((notify) => (
          <View key={notify.id} className={`notify-item ${notify.type}`}>
            <View className="notify-icon">
              {notify.type === 'success' && <Text>✅</Text>}
              {notify.type === 'warning' && <Text>⚠️</Text>}
              {notify.type === 'info' && <Text>ℹ️</Text>}
              {notify.type === 'badge' && <Text>🏅</Text>}
            </View>
            <View className="notify-content">
              <View className="notify-header">
                <Text className="notify-title">{notify.title}</Text>
                {notify.is_new && <View className="new-tag">新</View>}
              </View>
              <Text className="notify-text">{notify.content}</Text>
              {notify.action_url && (
                <View className="notify-action">
                  <Text className="action-text">→ {notify.action_text}</Text>
                </View>
              )}
              <Text className="notify-time">{notify.time}</Text>
            </View>
            <View className="notify-delete" onClick={() => onDeleteNotification(notify.id)}>
              <Text>🗑️</Text>
            </View>
          </View>
        ))}
      </View>

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

export default NotificationsTab

