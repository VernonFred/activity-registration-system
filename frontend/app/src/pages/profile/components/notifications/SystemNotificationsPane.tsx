import { View, Text } from '@tarojs/components'
import { useTranslation } from 'react-i18next'
import type { Notification } from '../../types'
import NotificationsPagination from './NotificationsPagination'

interface SystemNotificationsPaneProps {
  items: Notification[]
  loading: boolean
  batchMode: boolean
  selectedIds: Set<number>
  swipedId: number | null
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onTouchStart: (e: any) => void
  onTouchMove: (e: any, id: number) => void
  onToggleSelect: (id: number) => void
  onOpenAction: (url: string) => void
  onDelete: (id: number) => void
}

export default function SystemNotificationsPane(props: SystemNotificationsPaneProps) {
  const { t } = useTranslation()
  const { items, loading, batchMode, selectedIds, swipedId, page, totalPages, onPageChange, onTouchStart, onTouchMove, onToggleSelect, onOpenAction, onDelete } = props

  return (
    <View className="nt-system">
      {items.map((notify) => (
        <View key={notify.id} className={`nt-card ${swipedId === notify.id ? 'swiped' : ''}`} onTouchStart={onTouchStart} onTouchMove={(e) => onTouchMove(e, notify.id)}>
          <View className="nt-card-body">
            {batchMode && (
              <View className={`nt-checkbox ${selectedIds.has(notify.id) ? 'checked' : ''}`} onClick={(e) => { e.stopPropagation(); onToggleSelect(notify.id) }}>
                {selectedIds.has(notify.id) && <Text className="nt-check-mark">✓</Text>}
              </View>
            )}
            <View className="nt-dot-wrap"><View className="nt-dot" /></View>
            <View className="nt-card-content">
              <View className="nt-card-header">
                <Text className="nt-card-title">{notify.title}</Text>
                {notify.is_new && <View className="nt-new-tag"><Text>{t('common.new')}</Text></View>}
              </View>
              <Text className="nt-card-text">{notify.content}</Text>
              {notify.action_url && (
                <View className="nt-action-btn" onClick={() => onOpenAction(notify.action_url!)}>
                  <Text>{notify.action_text ? `→ ${notify.action_text}` : t('common.view')}</Text>
                </View>
              )}
              <Text className="nt-card-time">{notify.time}</Text>
            </View>
          </View>
          <View className="nt-delete-area" onClick={() => onDelete(notify.id)}>
            <View className="nt-delete-icon-wrap"><View className="nt-trash-lid" /><View className="nt-trash-body" /></View>
          </View>
        </View>
      ))}
      {items.length === 0 && !loading && <View className="nt-empty"><Text>{t('profile.noNotifications')}</Text></View>}
      <NotificationsPagination page={page} totalPages={totalPages} onChange={onPageChange} />
    </View>
  )
}
