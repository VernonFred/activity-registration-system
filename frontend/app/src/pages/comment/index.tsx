/**
 * 评论页面 - 按设计稿风格
 * 创建时间: 2026年1月8日
 * 更新时间: 2026年1月28日 - 添加回复功能、拆分组件
 */
import { View, Image, Text } from '@tarojs/components'
import { useTranslation } from 'react-i18next'
import Taro, { useRouter } from '@tarojs/taro'
import ReplyPanel from './components/ReplyPanel'
import CommentList from './components/CommentList'
import CommentInputPanel from './components/CommentInputPanel'
import ConfirmModal from './components/ConfirmModal'
import RatingDialog from './components/RatingDialog'
import RatingSection from './components/RatingSection'
import { useCommentPageState } from './hooks/useCommentPageState'
import './index.scss'

export default function CommentPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const coverUrl = router.params.cover || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
  const activityId = Number(router.params.id || router.params.activityId || router.params.activity_id || 0)
  const { state, actions } = useCommentPageState(activityId)

  return (
    <View className="comment-page" onClick={actions.handlePageClick}>
      <View className="header-cover">
        <Image src={coverUrl} className="cover-image" mode="aspectFill" />
        <View className="cover-overlay" />
        <View className="cover-back-btn" onClick={() => Taro.navigateBack()}>
          <Text className="cover-back-arrow">‹</Text>
        </View>
      </View>

      <RatingSection
        rating={state.rating}
        onRateClick={actions.handleRateClick}
        onEditRating={actions.handleRateClick}
      />

      <CommentList
        comments={state.sortedComments}
        sortType={state.sortType}
        activeCommentMenu={state.activeCommentMenu}
        currentUserName={state.currentUser.name}
        onSortChange={actions.setSortType}
        onLike={actions.handleLikeComment}
        onViewReplies={actions.handleViewReplies}
        onQuickReply={actions.handleQuickReply}
        onDelete={actions.handleDeleteComment}
        onEdit={actions.handleEditComment}
        onMenuClick={actions.handleCommentMenuClick}
      />

      <View className="comment-input-trigger" onClick={actions.openCommentInput}>
        <Image
          src={state.userAvatar}
          className="trigger-avatar"
          mode="aspectFill"
          onError={() => actions.setAvatarFailed(true)}
        />
        <View className="trigger-placeholder">
          <Text>{t('comments.addCommentPlaceholder')}</Text>
        </View>
      </View>

      <RatingDialog
        visible={state.showRatingDialog}
        tempRating={state.tempRating}
        isEditingRating={state.isEditingRating}
        onSelectRating={actions.setTempRating}
        onSubmit={actions.handleSubmitRating}
        onCancelRating={actions.handleCancelRating}
        onClose={actions.handleCloseRatingDialog}
      />

      <CommentInputPanel
        visible={state.showCommentInput}
        userAvatar={state.userAvatar}
        userName={state.currentUser.name}
        userOrganization={state.currentUser.organization}
        replyToUser={state.replyToUser}
        editingCommentId={state.editingCommentId}
        editingContent={state.editingContent}
        commentText={state.commentText}
        panelTranslateY={state.panelTranslateY}
        isDragging={state.isDragging}
        onClose={actions.closeCommentInput}
        onCancelEdit={actions.closeCommentInput}
        onDragStart={actions.handleDragStart}
        onDragMove={actions.handleDragMove}
        onDragEnd={actions.handleDragEnd}
        onEditingContentChange={actions.setEditingContent}
        onCommentTextChange={actions.setCommentText}
        onSubmitEdit={actions.handleSubmitEdit}
        onSubmitComment={actions.handleSubmitComment}
        onAvatarError={() => actions.setAvatarFailed(true)}
      />

      {state.showReplyPanel && state.selectedComment && (
        <ReplyPanel
          comment={state.selectedComment}
          currentUser={state.currentUser}
          onClose={() => {
            actions.setShowReplyPanel(false)
            actions.setSelectedComment(null)
          }}
          onSubmitReply={actions.handleSubmitReply}
          onUpdateComment={actions.handleUpdateComment}
        />
      )}

      <ConfirmModal
        visible={state.deleteModal.visible}
        title={t('comments.deleteConfirm')}
        onConfirm={actions.handleConfirmDelete}
        onCancel={() => actions.setDeleteModal({ visible: false, commentId: 0 })}
      />
    </View>
  )
}
