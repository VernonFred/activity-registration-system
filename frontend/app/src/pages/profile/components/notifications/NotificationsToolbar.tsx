import { View, Text } from '@tarojs/components'
import { useTranslation } from 'react-i18next'

interface NotificationsToolbarProps {
  batchMode: boolean
  selectedCount: number
  onCancelBatch: () => void
  onBatchDelete: () => void
  onMarkAllRead: () => void
  onToggleBatchMode: () => void
  onClearAll: () => void
}

export default function NotificationsToolbar(props: NotificationsToolbarProps) {
  const { t } = useTranslation()
  const { batchMode, selectedCount, onCancelBatch, onBatchDelete, onMarkAllRead, onToggleBatchMode, onClearAll } = props

  return (
    <View className="nt-toolbar">
      <View className="nt-toolbar-right">
        {batchMode ? (
          <>
            <View className="nt-batch-cancel" onClick={onCancelBatch}><Text>{t('common.cancel')}</Text></View>
            <Text className="nt-batch-count">{t('common.selected', { count: selectedCount })}</Text>
            <View className={`nt-batch-delete-btn ${selectedCount === 0 ? 'disabled' : ''}`} onClick={onBatchDelete}>
              <Text>{t('common.delete')}</Text>
            </View>
          </>
        ) : (
          <>
            <View className="nt-toolbar-icon-btn" onClick={onMarkAllRead}><Text className="nt-icon-read">⊘</Text></View>
            <View className="nt-toolbar-icon-btn" onClick={onToggleBatchMode}><Text className="nt-icon-batch">☰</Text></View>
            <View className="nt-toolbar-icon-btn" onClick={onClearAll}><Text className="nt-icon-clear">⌫</Text></View>
          </>
        )}
      </View>
    </View>
  )
}
