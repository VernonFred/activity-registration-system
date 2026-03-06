import { View, Text } from '@tarojs/components'
import { useTranslation } from 'react-i18next'

interface RatingDialogProps {
  visible: boolean
  tempRating: number
  isEditingRating: boolean
  onSelectRating: (rating: number) => void
  onSubmit: () => void
  onCancelRating: () => void
  onClose: () => void
}

export default function RatingDialog({
  visible,
  tempRating,
  isEditingRating,
  onSelectRating,
  onSubmit,
  onCancelRating,
  onClose,
}: RatingDialogProps) {
  const { t } = useTranslation()

  if (!visible) return null

  return (
    <View className="rating-dialog-overlay" onClick={onClose}>
      <View className="rating-dialog" onClick={(e) => e.stopPropagation()}>
        <Text className="dialog-title">{t('comments.ratingDialogTitle')}</Text>
        <View className="dialog-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <View key={star} className="star-item" onClick={() => onSelectRating(star)}>
              <Text className={`star-icon ${tempRating >= star ? 'filled' : ''}`}>
                {tempRating >= star ? '★' : '☆'}
              </Text>
            </View>
          ))}
        </View>
        <View className="dialog-actions">
          <View className="dialog-confirm" onClick={onSubmit}>
            <Text>{t('common.confirm')}</Text>
          </View>
          {isEditingRating && (
            <View className="dialog-cancel-rating" onClick={onCancelRating}>
              <Text>{t('comments.cancelRating')}</Text>
            </View>
          )}
        </View>
        <View className="dialog-close" onClick={onClose}>
          <Text>✕</Text>
        </View>
      </View>
    </View>
  )
}
