import { View, Text } from '@tarojs/components'
import { useTranslation } from 'react-i18next'

interface RatingDialogProps {
  tempRating: number
  visible: boolean
  onClose: () => void
  onConfirm: () => void
  onChange: (value: number) => void
}

const RatingDialog = ({ tempRating, visible, onClose, onConfirm, onChange }: RatingDialogProps) => {
  const { t } = useTranslation()
  if (!visible) return null

  return (
    <View className="rating-dialog-overlay" onClick={onClose}>
      <View className="rating-dialog" onClick={(e) => e.stopPropagation()}>
        <Text className="dialog-title">{t('comments.ratingDialogTitle')}</Text>
        <View className="dialog-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <View key={star} className="star-item" onClick={() => onChange(star)}>
              <Text className={`star-icon ${tempRating >= star ? 'filled' : ''}`}>{tempRating >= star ? '★' : '☆'}</Text>
            </View>
          ))}
        </View>
        <View className="dialog-actions">
          <View className="dialog-confirm" onClick={onConfirm}>
            <Text className="confirm-text">{t('common.confirm')}</Text>
          </View>
        </View>
        <View className="dialog-close" onClick={onClose}>
          <Text className="close-icon">✕</Text>
        </View>
      </View>
    </View>
  )
}

export default RatingDialog
