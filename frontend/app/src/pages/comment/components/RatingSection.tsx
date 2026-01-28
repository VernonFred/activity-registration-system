/**
 * 评分区域组件
 * 创建时间: 2026年1月28日
 */
import { View, Text, Image } from '@tarojs/components'
import type { Rating } from '../types'
import iconStar from '../../../assets/icons/star.png'

interface RatingSectionProps {
  rating: Rating
  onRateClick: () => void
}

export default function RatingSection({ rating, onRateClick }: RatingSectionProps) {
  return (
    <View className="rating-section">
      <Text className="rating-title">星级评分</Text>

      <View className="rating-main-row">
        {/* 左侧：评分数字和星星 */}
        <View className="rating-left">
          <Text className="rating-score">{rating.average.toFixed(1)}</Text>
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

      {/* 我的评分 */}
      <View className="my-rating-row">
        <Text className="my-rating-label">我的评分</Text>
        <View className="my-rating-value">
          {rating.user_rating && rating.user_rating > 0 ? (
            <>
              <View className="my-rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Text key={star} className="star-icon">
                    {star <= rating.user_rating! ? '★' : '☆'}
                  </Text>
                ))}
              </View>
              <Text className="my-rating-date">2025.12.10</Text>
            </>
          ) : (
            <Text className="my-rating-empty">暂未评分</Text>
          )}
        </View>
      </View>
    </View>
  )
}
