import { View, Text, Image, Textarea } from '@tarojs/components'
import { useTranslation } from 'react-i18next'

interface CommentComposerProps {
  avatar: string
  userName: string
  organization: string
  value: string
  visible: boolean
  onOpen: () => void
  onClose: () => void
  onChange: (value: string) => void
  onSubmit: () => void
}

const CommentComposer = ({
  avatar,
  userName,
  organization,
  value,
  visible,
  onOpen,
  onClose,
  onChange,
  onSubmit,
}: CommentComposerProps) => {
  const { t } = useTranslation()

  return (
    <>
      <View className="comment-input-trigger" onClick={onOpen}>
        <Image src={avatar} className="trigger-avatar" mode="aspectFill" />
        <View className="trigger-input-placeholder">
          <Text className="placeholder-text">{t('comments.addCommentPlaceholder')}</Text>
        </View>
      </View>

      {visible && (
        <View className="comment-input-overlay" onClick={onClose}>
          <View className="comment-input-panel" onClick={(e) => e.stopPropagation()}>
            <View className="panel-drag-bar" />
            <View className="panel-header">
              <Text className="panel-title">{t('comments.commentAsIdentity')}</Text>
            </View>
            <View className="panel-user-info">
              <Image src={avatar} className="panel-user-avatar" mode="aspectFill" />
              <View className="panel-user-detail">
                <Text className="panel-user-name">{userName}</Text>
                <Text className="panel-user-org">{organization}</Text>
              </View>
            </View>
            <View className="panel-input-wrapper">
              <Textarea
                className="panel-textarea"
                placeholder={t('comments.addCommentPlaceholder')}
                value={value}
                onInput={(e) => onChange(e.detail.value)}
                autoFocus
                maxlength={500}
              />
              <View className="input-footer">
                <Text className="char-count">{value.length}/500</Text>
              </View>
            </View>
            <View className="panel-submit-wrapper">
              <View className={`panel-submit-button ${value.trim() ? 'active' : ''}`} onClick={onSubmit}>
                <Text className="submit-button-text">{t('common.send')}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </>
  )
}

export default CommentComposer
