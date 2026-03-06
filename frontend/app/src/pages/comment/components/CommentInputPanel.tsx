import { View, Text, Image, Input } from '@tarojs/components'
import { useTranslation } from 'react-i18next'

interface CommentInputPanelProps {
  visible: boolean
  userAvatar: string
  userName: string
  userOrganization: string
  replyToUser: string | null
  editingCommentId: number | null
  editingContent: string
  commentText: string
  panelTranslateY: number
  isDragging: boolean
  onClose: () => void
  onCancelEdit: () => void
  onDragStart: (e: any) => void
  onDragMove: (e: any) => void
  onDragEnd: (e: any) => void
  onEditingContentChange: (value: string) => void
  onCommentTextChange: (value: string) => void
  onSubmitEdit: () => void
  onSubmitComment: () => void
  onAvatarError: () => void
}

export default function CommentInputPanel({
  visible,
  userAvatar,
  userName,
  userOrganization,
  replyToUser,
  editingCommentId,
  editingContent,
  commentText,
  panelTranslateY,
  isDragging,
  onClose,
  onCancelEdit,
  onDragStart,
  onDragMove,
  onDragEnd,
  onEditingContentChange,
  onCommentTextChange,
  onSubmitEdit,
  onSubmitComment,
  onAvatarError,
}: CommentInputPanelProps) {
  const { t } = useTranslation()
  if (!visible) return null

  const placeholder = editingCommentId !== null
    ? t('comments.editPlaceholder')
    : replyToUser
      ? t('comments.replyPlaceholder', { name: replyToUser })
      : t('comments.addCommentPlaceholder')

  const currentValue = editingCommentId !== null ? editingContent : commentText
  const handleSubmit = editingCommentId !== null ? onSubmitEdit : onSubmitComment

  return (
    <View className="comment-input-overlay" onClick={onClose}>
      <View
        className={`comment-input-panel ${isDragging ? 'dragging' : ''}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: `translateY(${panelTranslateY}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
      >
        <View
          className="panel-drag-bar"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          onTouchStart={onDragStart}
          onTouchMove={onDragMove}
          onTouchEnd={onDragEnd}
          catchMove
        />
        <Text className="panel-title">
          {editingCommentId !== null ? t('comments.editComment') : t('comments.commentAsIdentity')}
        </Text>
        <View className="panel-user">
          <Image
            src={userAvatar}
            className="panel-avatar"
            mode="aspectFill"
            onError={onAvatarError}
          />
          <View className="panel-user-info">
            <Text className="panel-user-name">{userName}</Text>
            <Text className="panel-user-org">{userOrganization}</Text>
          </View>
          {editingCommentId !== null && (
            <View className="cancel-edit-btn" onClick={onCancelEdit}>
              <Text className="cancel-text">{t('common.cancel')}</Text>
            </View>
          )}
        </View>
        <View className="panel-input-row">
          <Input
            className="panel-input-field"
            placeholder={placeholder}
            placeholderClass="input-placeholder"
            value={currentValue}
            onInput={(e) => {
              const value = e.detail.value
              if (editingCommentId !== null) {
                onEditingContentChange(value)
              } else {
                onCommentTextChange(value)
              }
            }}
            focus={visible}
            maxlength={500}
            confirmType="send"
            onConfirm={handleSubmit}
            adjustPosition
            cursorSpacing={16}
          />
          <View
            className={`panel-send-btn ${currentValue.trim() ? 'active' : ''}`}
            onClick={handleSubmit}
          >
            <Text className="send-icon">➤</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
