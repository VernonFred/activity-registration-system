/**
 * 图片直播组件 - 大背景图+按钮/二维码
 * 创建时间: 2025年12月9日
 * 更新时间: 2025年12月12日
 */
import { View, Text, Image } from '@tarojs/components'
import { useState } from 'react'

interface LiveTabProps {
  coverUrl?: string
  onViewLive: () => void
  theme: string
}

const LiveTab: React.FC<LiveTabProps> = ({ coverUrl, onViewLive, theme }) => {
  const [showQRCode, setShowQRCode] = useState(false)

  const handleViewLive = () => {
    // 显示二维码弹窗（微信小程序不允许外部链接）
    setShowQRCode(true)
  }

  const handleCloseQRCode = () => {
    setShowQRCode(false)
  }

  return (
    <View className={`live-section theme-${theme}`}>
      {/* 大背景图 */}
      <View className="live-hero">
        <Image
          className="live-background"
          src={coverUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200'}
          mode="aspectFill"
        />
        {/* 渐变遮罩 */}
        <View className="live-gradient" />
        
        {/* 内容层 */}
        <View className="live-content">
          <View className="live-badge">
            <Text className="badge-icon">📸</Text>
            <Text className="badge-text">LIVE</Text>
          </View>
          <Text className="live-title">图片直播</Text>
          <Text className="live-subtitle">查看活动精彩瞬间</Text>
          
          {/* 进入直播按钮 */}
          <View className="live-enter-btn" onClick={handleViewLive}>
            <Text className="btn-text">进入直播</Text>
            <Text className="btn-icon">→</Text>
          </View>
        </View>
      </View>

      {/* 二维码弹窗 */}
      {showQRCode && (
        <View className="qrcode-modal" onClick={handleCloseQRCode}>
          <View className="modal-content" onClick={(e) => e.stopPropagation()}>
            <Text className="modal-title">扫码查看图片直播</Text>
            <View className="qrcode-container">
              {/* 占位二维码图片 */}
              <Image
                className="qrcode-image"
                src="https://via.placeholder.com/400x400/FF8A1A/FFFFFF?text=QR+CODE"
                mode="aspectFit"
              />
            </View>
            <Text className="modal-hint">使用微信扫描二维码</Text>
            <View className="modal-close-btn" onClick={handleCloseQRCode}>
              <Text className="close-text">关闭</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default LiveTab
