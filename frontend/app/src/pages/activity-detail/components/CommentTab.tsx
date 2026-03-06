import { Image, Text, View } from '@tarojs/components'
import { useTranslation } from 'react-i18next'
import type { CommentTabProps } from './comment-tab/types'
import type { Rating } from '../types'
import { useCommentTabState } from './comment-tab/useCommentTabState'
import RatingDialog from './comment-tab/RatingDialog'
import CommentComposer from './comment-tab/CommentComposer'
import CommentList from './comment-tab/CommentList'
import './CommentTab.scss'

import iconStar from '../../../assets/icons/star.png'
import iconMessage from '../../../assets/icons/message-circle.png'
import iconTrash from '../../../assets/icons/inbox.png'

function renderStars(count: number, size: 'large' | 'small' = 'small', interactive = false, onSelect?: (value: number) => void) {
  const stars = []
  const starSize = size === 'large' ? 'star-large' : 'star-small'

  for (let i = 1; i <= 5; i += 1) {
    stars.push(
      <Image
        key={i}
        src={iconStar}
        className={`star-icon ${starSize} ${i <= count ? 'filled' : 'empty'} ${interactive ? 'interactive' : ''}`}
        mode="aspectFit"
        onClick={interactive && onSelect ? () => onSelect(i) : undefined}
      />,
    )
  }
  return stars
}

function RatingSummary({ rating }: { rating: Rating }) {
  const { t } = useTranslation()
  return (
    <View className="rating-summary">
      <View className="rating-score-section">
        {rating.average > 0 && <Text className="rating-score">{rating.average.toFixed(1)}</Text>}
        <View className="rating-stars-large">{renderStars(Math.round(rating.average), 'large')}</View>
        <Text className="rating-count">{t('comments.ratingCount', { count: rating.total_count })}</Text>
      </View>
      <View className="rating-distribution">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = rating.distribution[star as keyof Rating['distribution']]
          const percentage = rating.total_count > 0 ? (count / rating.total_count) * 100 : 0
          return (
            <View key={star} className="distribution-row">
              <Text className="distribution-star">{t('comments.starCount', { count: star })}</Text>
              <View className="distribution-bar-bg">
                <View className="distribution-bar-fill" style={{ width: `${percentage}%` }} />
              </View>
              <Text className="distribution-count">{count}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

const CommentTab = ({ activityId, theme }: CommentTabProps) => {
  const { t } = useTranslation()
  const {
    activeCommentMenu,
    closeCommentMenu,
    commentText,
    currentUser,
    rating,
    replyToComment,
    setCommentText,
    setShowCommentInput,
    setShowRatingDialog,
    setSortType,
    setTempRating,
    showCommentInput,
    showRatingDialog,
    sortedComments,
    sortType,
    submitCommentDraft,
    submitUserRating,
    tempRating,
    toggleCommentLike,
    toggleCommentMenu,
    openCommentInput,
    openRatingDialog,
  } = useCommentTabState(activityId, t)

  return (
    <View className={`comment-tab theme-${theme}`}>
      <View className="rating-overview-card">
        <View className="rating-header">
          <Text className="rating-title">{t('comments.starRating')}</Text>
          <View className="rating-action" onClick={openRatingDialog}>
            <Image src={iconStar} className="rating-action-icon" mode="aspectFit" />
            <Text className="rating-action-text">{t('comments.rating')}</Text>
          </View>
        </View>
        <RatingSummary rating={rating} />
      </View>

      <View className="my-rating-card">
        <Text className="my-rating-label">{t('comments.myRating')}</Text>
        <View className="my-rating-content">
          {rating.user_rating && rating.user_rating > 0 ? (
            <>
              <View className="my-rating-stars">{renderStars(rating.user_rating, 'small')}</View>
              <Text className="my-rating-date">2025.12.10</Text>
            </>
          ) : (
            <Text className="my-rating-empty">{t('comments.notRated')}</Text>
          )}
        </View>
      </View>

      <CommentList
        activeCommentMenu={activeCommentMenu}
        comments={sortedComments}
        iconMessage={iconMessage}
        iconTrash={iconTrash}
        onCloseMenu={closeCommentMenu}
        onLike={toggleCommentLike}
        onMenu={toggleCommentMenu}
        onReply={replyToComment}
        onSortChange={setSortType}
        sortType={sortType}
      />

      <RatingDialog
        visible={showRatingDialog}
        tempRating={tempRating}
        onClose={() => setShowRatingDialog(false)}
        onConfirm={() => void submitUserRating()}
        onChange={setTempRating}
      />

      <CommentComposer
        avatar={currentUser.avatar}
        userName={currentUser.name}
        organization={currentUser.organization}
        value={commentText}
        visible={showCommentInput}
        onOpen={openCommentInput}
        onClose={() => setShowCommentInput(false)}
        onChange={setCommentText}
        onSubmit={() => void submitCommentDraft()}
      />
    </View>
  )
}

export default CommentTab
