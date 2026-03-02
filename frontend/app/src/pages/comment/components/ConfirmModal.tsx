/**
 * 自定义确认弹窗组件 - 按设计稿
 * 2026年1月29日
 */
import { View, Text } from '@tarojs/components'
import { useTranslation } from 'react-i18next'
import './ConfirmModal.scss'

interface ConfirmModalProps {
  visible: boolean
  title: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ visible, title, onConfirm, onCancel }: ConfirmModalProps) {
  const { t } = useTranslation()
  if (!visible) return null

  return (
    <View className="confirm-modal-overlay" onClick={onCancel}>
      <View className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <Text className="modal-title">{title}</Text>
        <View className="modal-confirm-btn" onClick={onConfirm}>
          <Text className="confirm-text">{t('common.confirm')}</Text>
        </View>
        <View className="modal-cancel-btn" onClick={onCancel}>
          <Text className="cancel-text">{t('common.cancel')}</Text>
        </View>
      </View>
    </View>
  )
}
