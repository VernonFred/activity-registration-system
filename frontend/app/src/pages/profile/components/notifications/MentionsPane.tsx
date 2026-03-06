import { View, Text, Image } from '@tarojs/components'
import { useTranslation } from 'react-i18next'
import type { MentionItem } from '../../types'
import NotificationsPagination from './NotificationsPagination'

interface MentionsPaneProps {
  items: MentionItem[]
  loading: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onReply: (mention: MentionItem) => void
}

export default function MentionsPane({ items, loading, page, totalPages, onPageChange, onReply }: MentionsPaneProps) {
  const { t } = useTranslation()

  return (
    <View className="nt-mentions">
      {items.map((mention) => (
        <View key={mention.id} className="nt-mention-card">
          <View className="nt-mention-header">
            <Image className="nt-mention-avatar" src={mention.user_avatar} mode="aspectFill" />
            <View className="nt-mention-user">
              <View className="nt-mention-name-row">
                <Text className="nt-mention-name">{mention.user_name}</Text>
                <Text className="nt-mention-time">{mention.time}</Text>
              </View>
              <Text className="nt-mention-org">{mention.user_org}</Text>
            </View>
          </View>
          <Text className="nt-mention-text">{mention.comment_text}</Text>
          <View className="nt-mention-original"><Text className="nt-mention-original-text">{t('notification.mePrefix')}{mention.my_original_text}</Text></View>
          <View className="nt-mention-actions">
            <View className="nt-reply-btn" onClick={() => onReply(mention)}>
              <Text className="nt-reply-icon">↩</Text>
              <Text className="nt-reply-text">{t('common.reply')}</Text>
            </View>
          </View>
        </View>
      ))}
      {items.length === 0 && !loading && <View className="nt-empty"><Text>{t('profile.noMentions')}</Text></View>}
      <NotificationsPagination page={page} totalPages={totalPages} onChange={onPageChange} />
    </View>
  )
}
