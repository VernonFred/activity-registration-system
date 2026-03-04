/**
 * 底部胶囊浮岛 - 参照设计稿布局 + 首页胶囊样式
 * 
 * 布局结构（参照设计稿）：
 * ┌─────────────────────────────────────────────┐
 * │  ⭐收藏  💬评论  ❤️点赞  ↗️分享  │ 立即报名 │
 * └─────────────────────────────────────────────┘
 * 
 * 整体是一个胶囊浮岛，内部左边4个操作按钮，右边报名按钮
 */
import { View, Text, Image } from '@tarojs/components'
import { useTranslation } from 'react-i18next'

// 图标
import iconBookmark from '../../../assets/icons/bookmark.png'
import iconMessageCircle from '../../../assets/icons/message-circle.png'
import iconHeart from '../../../assets/icons/heart.png'
import iconShare from '../../../assets/icons/share-2.png'

interface BottomBarProps {
  isFavorited: boolean
  isLiked: boolean
  onFavorite: () => void
  onComment: () => void
  onLike: () => void
  onShare: () => void
  onSignup: () => void
  ctaText: string
  theme: string
}

const BottomBar: React.FC<BottomBarProps> = ({
  isFavorited,
  isLiked,
  onFavorite,
  onComment,
  onLike,
  onShare,
  onSignup,
  ctaText,
  theme,
}) => {
  const { t } = useTranslation()
  return (
    <View className={`bottom-island theme-${theme}`}>
      {/* 整体胶囊容器 */}
      <View className="island-capsule">
        {/* 左侧操作按钮区 */}
        <View className="action-group">
        <View className={`action-item ${isFavorited ? 'active' : ''}`} onClick={onFavorite}>
            <Image src={iconBookmark} className="action-icon" mode="aspectFit" />
          <Text className="action-text">{t('activityDetail.favorite')}</Text>
        </View>
          
        <View className="action-item" onClick={onComment}>
            <Image src={iconMessageCircle} className="action-icon" mode="aspectFit" />
          <Text className="action-text">{t('activityDetail.commentAction')}</Text>
        </View>
          
        <View className={`action-item ${isLiked ? 'active' : ''}`} onClick={onLike}>
            <Image src={iconHeart} className="action-icon" mode="aspectFit" />
          <Text className="action-text">{t('activityDetail.like')}</Text>
        </View>
          
        <View className="action-item" onClick={onShare}>
            <Image src={iconShare} className="action-icon" mode="aspectFit" />
          <Text className="action-text">{t('activityDetail.share')}</Text>
        </View>
      </View>

        {/* 右侧报名按钮 */}
        <View className="signup-btn" onClick={onSignup}>
          <Text className="signup-text">{ctaText || t('activityDetail.signupNow')}</Text>
        </View>
      </View>
    </View>
  )
}

export default BottomBar
