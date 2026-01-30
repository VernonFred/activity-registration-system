/**
 * 评分区域组件 - 按设计稿
 * 2026年1月29日 - 重写
 */
import { View, Text, Image } from '@tarojs/components'
import type { Rating } from '../types'
import iconStar from '../../../assets/icons/star.png'

interface RatingSectionProps {
  rating: Rating
  onRateClick: () => void
  onEditRating?: () => void  // 修改评分
}

export default function RatingSection({ rating, onRateClick, onEditRating }: RatingSectionProps) {
  const hasRated = rating.user_rating && rating.user_rating > 0

  // 格式化日期
  const formatRatingDate = () => {
    if (rating.user_rating_date) {
      const date = new Date(rating.user_rating_date)
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
    }
    return '2025.12.10'  // 默认日期
  }

  return (
    <View className="rating-section">
      <Text className="rating-title">星级评分</Text>

      <View className="rating-main-row">
        {/* 左侧：评分数字和星星 */}
        <View className="rating-left">
          {/* 暂未评分时不显示任何东西 */}
          {rating.average > 0 && <Text className="rating-score">{rating.average.toFixed(1)}</Text>}
          <View className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => {
              const stars = rating.average / 2
              if (star <= Math.floor(stars)) {
                return <Text key={star} className="star-icon">★</Text>
              } else if (star === Math.floor(stars) + 1 && stars % 1 >= 0.25) {
                return <Text key={star} className="star-icon half-star">⚝</Text>
              } else {
                return <Text key={star} className="star-icon">☆</Text>
              }
            })}
          </View>
        </View>

        {/* 右侧：评分按钮 */}
        <View className="rating-button" onClick={onRateClick}>
          <Image src={iconStar} className="rating-button-icon" mode="aspectFit" />
          <Text className="rating-button-text">评分</Text>
        </View>
      </View>

      <Text className="rating-count">{rating.total_count} 人评价</Text>

      {/* 我的评分 - 按设计稿布局 */}
      <View className="my-rating-row" onClick={hasRated ? onEditRating : onRateClick}>
        <View className="my-rating-left">
          <Text className="my-rating-label">我的评分</Text>
          {hasRated && (
            <>
              <View className="my-rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Text key={star} className="star-icon">
                    {star <= rating.user_rating! ? '★' : '☆'}
                  </Text>
                ))}
              </View>
              {/* 修改图标（小笔） */}
              <Text className="edit-icon">✎</Text>
            </>
          )}
        </View>
        <View className="my-rating-right">
          {hasRated ? (
            <Text className="my-rating-date">{formatRatingDate()}</Text>
          ) : (
            <Text className="my-rating-empty">暂未评分</Text>
          )}
        </View>
      </View>
    </View>
  )
}
