/**
 * 活动详情页面 - Lovable 精致风格
 * 重构时间: 2025年12月9日 13:30
 * 
 * 优化内容：
 * - 重新设计顶部导航，增加呼吸感
 * - 底部改为胶囊浮岛风格
 * - 卡片排版更精致
 */
import { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useTheme } from '../../context/ThemeContext'
import { fetchActivityDetail } from '../../services/activities'
import { addRecentView } from '../../utils/storage'
import { OverviewTab, AgendaTab, HotelTab, LiveTab, BottomBar } from './components'
import AgendaPreviewCard from './components/AgendaPreviewCard'
import type { TabKey, Activity } from './types'
import { formatDate, formatTime } from './utils'
import './index.scss'

// PNG 图标
import iconArrowLeft from '../../assets/icons/arrow-left.png'

// 移除Tab配置（改为滚动式布局）

// 默认议程数据（分组结构 - 参考纸质版会议手册）
const DEFAULT_AGENDA = [
  {
    id: 1,
    title: '开幕仪式',
    time_start: '09:00',
    time_end: '09:30',
    moderator: {
      name: '张志东',
      title: '职业技术教育分会副理事长\n山东商业职业技术学院党委书记，教授',
    },
    items: [
      {
        id: 11,
        time_start: '09:00',
        time_end: '09:10',
        type: 'speech' as const,
        title: '致辞',
        speaker: {
          name: '李 炯',
          title: '长沙民政职业技术学院党委书记，教授',
        },
      },
      {
        id: 12,
        time_start: '09:10',
        time_end: '09:20',
        type: 'speech' as const,
        title: '讲话',
        speaker: {
          name: '王仁祥',
          title: '湖南省教育厅副厅长',
        },
      },
      {
        id: 13,
        time_start: '09:20',
        time_end: '09:30',
        type: 'speech' as const,
        title: '讲话',
        speaker: {
          name: '周建松',
          title: '中国高等教育学会职业技术教育分会理事长，教授',
        },
      },
    ],
  },
  {
    id: 2,
    title: '主旨报告',
    moderator: {
      name: '刘建湘',
      title: '职业技术教育分会副理事长\n湖南工业职业技术学院党委书记，教授',
    },
    items: [
      {
        id: 21,
        time_start: '09:30',
        time_end: '10:00',
        type: 'speech' as const,
        title: '以智慧平台支撑行业产教融合共同体走深走实',
        speaker: {
          name: '潘海生',
          title: '天津大学教育学院教授\n国家职业教育产教融合智库主任',
        },
        location: '主会场',
      },
      {
        id: 22,
        time_start: '10:00',
        time_end: '10:30',
        type: 'speech' as const,
        title: '推进高职院校高水平建设高质量发展',
        speaker: {
          name: '丁金昌',
          title: '中国职业技术教育学会副会长，二级教授',
        },
        location: '主会场',
      },
      {
        id: 23,
        time_start: '10:30',
        time_end: '10:45',
        type: 'break' as const,
        title: '茶歇',
      },
    ],
  },
  {
    id: 3,
    title: '职业教育高质量发展',
    moderator: {
      name: '陈静彬',
      title: '长沙民政职业技术学院党委副书记、校长',
    },
    items: [
      {
        id: 31,
        time_start: '10:45',
        time_end: '11:30',
        type: 'speech' as const,
        title: '职业教育教学成果奖培育与凝练',
        speaker: {
          name: '马晓明',
          title: '深圳职业技术大学原副校长\n职业教育国家教学成果奖特等奖主持人，教授',
        },
      },
      {
        id: 32,
        time_start: '11:30',
        time_end: '12:00',
        type: 'speech' as const,
        title: '数据为基 应用为王——数据赋能职业教育教学数字化转型',
        speaker: {
          name: '何勇波',
          title: '湖南强智科技发展有限公司总经理',
        },
      },
    ],
  },
]

// 多天会议Mock数据（用于测试多天分页功能）
const DEFAULT_MULTI_DAY_AGENDA = [
  {
    id: 1,
    date: '2025-11-12',
    display_date: '2025年11月12日（第一天）',
    groups: [
      {
        id: 11,
        title: '开幕仪式',
        time_start: '09:00',
        time_end: '09:30',
        moderator: {
          name: '张志东',
          title: '职业技术教育分会副理事长\n山东商业职业技术学院党委书记，教授',
        },
        items: [
          {
            id: 111,
            time_start: '09:00',
            time_end: '09:10',
            type: 'speech' as const,
            title: '致辞',
            speaker: {
              name: '李 炯',
              title: '长沙民政职业技术学院党委书记，教授',
            },
            location: '主会场',
          },
          {
            id: 112,
            time_start: '09:10',
            time_end: '09:20',
            type: 'speech' as const,
            title: '讲话',
            speaker: {
              name: '王仁祥',
              title: '湖南省教育厅副厅长',
            },
            location: '主会场',
          },
        ],
      },
      {
        id: 12,
        title: '主旨报告',
        time_start: '09:30',
        time_end: '11:30',
        moderator: {
          name: '刘建湘',
          title: '职业技术教育分会副理事长\n湖南工业职业技术学院党委书记，教授',
        },
        items: [
          {
            id: 121,
            time_start: '09:30',
            time_end: '10:00',
            type: 'speech' as const,
            title: '以智慧平台支撑行业产教融合共同体走深走实',
            speaker: {
              name: '潘海生',
              title: '天津大学教育学院教授\n国家职业教育产教融合智库主任',
            },
            location: '主会场',
          },
          {
            id: 122,
            time_start: '10:00',
            time_end: '10:30',
            type: 'speech' as const,
            title: '推进高职院校高水平建设高质量发展',
            speaker: {
              name: '丁金昌',
              title: '中国职业技术教育学会副会长，二级教授',
            },
            location: '主会场',
          },
          {
            id: 123,
            time_start: '10:30',
            time_end: '10:45',
            type: 'break' as const,
            title: '茶歇',
          },
          {
            id: 124,
            time_start: '10:45',
            time_end: '11:30',
            type: 'speech' as const,
            title: '职业教育教学成果奖培育与凝练',
            speaker: {
              name: '马晓明',
              title: '深圳职业技术大学原副校长\n职业教育国家教学成果奖特等奖主持人，教授',
            },
            location: '主会场',
          },
        ],
      },
    ],
  },
  {
    id: 2,
    date: '2025-11-13',
    display_date: '2025年11月13日（第二天）',
    groups: [
      {
        id: 21,
        title: '专题论坛一：产教融合',
        time_start: '09:00',
        time_end: '11:30',
        moderator: {
          name: '陈静彬',
          title: '长沙民政职业技术学院党委副书记、校长',
        },
        items: [
          {
            id: 211,
            time_start: '09:00',
            time_end: '09:45',
            type: 'speech' as const,
            title: '产教融合的实践与探索',
            speaker: {
              name: '李明',
              title: '教育部职业教育与成人教育司司长',
            },
            location: '分会场A',
          },
          {
            id: 212,
            time_start: '09:45',
            time_end: '10:30',
            type: 'discussion' as const,
            title: '圆桌讨论：产教融合路径创新',
            speaker: {
              name: '多位专家',
              title: '行业企业代表',
            },
            location: '分会场A',
          },
          {
            id: 213,
            time_start: '10:30',
            time_end: '10:45',
            type: 'break' as const,
            title: '茶歇',
          },
          {
            id: 214,
            time_start: '10:45',
            time_end: '11:30',
            type: 'speech' as const,
            title: '校企合作案例分享',
            speaker: {
              name: '王芳',
              title: '浙江工商职业技术学院副院长',
            },
            location: '分会场A',
          },
        ],
      },
      {
        id: 22,
        title: '专题论坛二：数字化转型',
        time_start: '14:00',
        time_end: '17:00',
        moderator: {
          name: '何勇波',
          title: '湖南强智科技发展有限公司总经理',
        },
        items: [
          {
            id: 221,
            time_start: '14:00',
            time_end: '14:45',
            type: 'speech' as const,
            title: '数据赋能职业教育教学数字化转型',
            speaker: {
              name: '何勇波',
              title: '湖南强智科技发展有限公司总经理',
            },
            location: '分会场B',
          },
          {
            id: 222,
            time_start: '14:45',
            time_end: '15:30',
            type: 'speech' as const,
            title: '智慧校园建设实践',
            speaker: {
              name: '张伟',
              title: '深圳信息职业技术学院信息中心主任',
            },
            location: '分会场B',
          },
          {
            id: 223,
            time_start: '15:30',
            time_end: '15:45',
            type: 'break' as const,
            title: '茶歇',
          },
          {
            id: 224,
            time_start: '15:45',
            time_end: '17:00',
            type: 'activity' as const,
            title: '数字化教学工具体验',
            speaker: {
              name: '技术团队',
              title: '强智科技',
            },
            location: '体验区',
          },
        ],
      },
    ],
  },
  {
    id: 3,
    date: '2025-11-14',
    display_date: '2025年11月14日（第三天）',
    groups: [
      {
        id: 31,
        title: '闭幕式',
        time_start: '09:00',
        time_end: '10:00',
        moderator: {
          name: '张志东',
          title: '职业技术教育分会副理事长',
        },
        items: [
          {
            id: 311,
            time_start: '09:00',
            time_end: '09:30',
            type: 'speech' as const,
            title: '会议总结',
            speaker: {
              name: '周建松',
              title: '中国高等教育学会职业技术教育分会理事长，教授',
            },
            location: '主会场',
          },
          {
            id: 312,
            time_start: '09:30',
            time_end: '10:00',
            type: 'speech' as const,
            title: '致闭幕辞',
            speaker: {
              name: '李 炯',
              title: '长沙民政职业技术学院党委书记，教授',
            },
            location: '主会场',
          },
        ],
      },
    ],
  },
]

// 默认酒店数据
const DEFAULT_HOTELS = [
  {
    id: 1,
    name: '喜来登大酒店',
    room_type: '商务标准间',
    price: 328,
    booking_tip: '预订时请报"强智科技"名称享受优惠价格',
    contact_name: '邓经理',
    contact_phone: '18176792056',
    facilities: ['免费WiFi', '咖啡厅', '洗衣房', '免费停车', '餐厅', '会议厅'],
    address: '长沙市江发路12号园博园东门',
  },
]

export default function ActivityDetail() {
  const router = useRouter()
  const { theme } = useTheme()
  const activityId = Number(router.params.id)
  
  const [activity, setActivity] = useState<Activity | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [statusBarHeight, setStatusBarHeight] = useState(44)

  // 初始化
  useEffect(() => {
    const sysInfo = Taro.getSystemInfoSync()
    setStatusBarHeight(sysInfo.statusBarHeight || 44)
  }, [])

  // 加载活动数据
  useEffect(() => {
    if (!activityId) return
    setLoading(true)
    fetchActivityDetail(activityId)
      .then((data) => {
        // 补充默认数据
        // 使用多天会议数据进行测试（可切换为 DEFAULT_AGENDA 测试单天）
        if (!data.agenda) data.agenda = DEFAULT_MULTI_DAY_AGENDA
        if (!data.hotels) data.hotels = DEFAULT_HOTELS
        setActivity(data)
        
        // 记录到最近浏览
        addRecentView({
          id: data.id,
          title: data.title,
          cover_url: data.cover_url || 'https://via.placeholder.com/400',
          date: formatDate(data.start_time),
          time: formatTime(data.start_time),
          status: data.status,
          location: data.location_city || data.location_name || '待定'
        })
      })
      .catch((err) => {
        console.error('加载活动失败', err)
        Taro.showToast({ title: '加载失败', icon: 'none' })
      })
      .finally(() => setLoading(false))
  }, [activityId])

  // 事件处理
  const handleBack = useCallback(() => Taro.navigateBack(), [])
  const handleFavorite = useCallback(() => {
    setIsFavorited(!isFavorited)
    Taro.showToast({ title: isFavorited ? '已取消收藏' : '已收藏', icon: 'none' })
  }, [isFavorited])
  const handleLike = useCallback(() => setIsLiked(!isLiked), [isLiked])
  const handleComment = useCallback(() => Taro.showToast({ title: '评论功能开发中', icon: 'none' }), [])
  const handleShare = useCallback(() => Taro.showShareMenu({ withShareTicket: true }), [])
  const handleSignup = useCallback(() => {
    if (!activityId) return
    Taro.navigateTo({ url: `/pages/signup/index?activity_id=${activityId}` })
  }, [activityId])
  const handleCall = useCallback((phone: string) => Taro.makePhoneCall({ phoneNumber: phone }), [])
  const handleViewLive = useCallback(() => {
    if (activity?.live_url) {
      Taro.navigateTo({ url: activity.live_url })
    } else {
      Taro.showToast({ title: '直播尚未开始', icon: 'none' })
    }
  }, [activity])

  // 加载状态
  if (loading) {
    return (
      <View className={`activity-detail theme-${theme} loading`}>
        <View className="status-bar" style={{ height: `${statusBarHeight}px` }} />
        <View className="skeleton-header" />
        <View className="skeleton-tabs" />
        <View className="skeleton-content">
          <View className="skeleton-line" />
          <View className="skeleton-line short" />
          <View className="skeleton-line" />
        </View>
      </View>
    )
  }

  // 空状态
  if (!activity) {
    return (
      <View className={`activity-detail theme-${theme} empty`}>
        <Text className="empty-text">活动不存在</Text>
      </View>
    )
  }

  return (
    <View className={`activity-detail theme-${theme}`}>
      {/* Hero Banner 区域（Lovable 风格） */}
      <View className="hero-section">
        {/* Banner 图片 */}
        <View className="banner-container">
          <Image 
            src={activity.cover_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'} 
            className="banner-image" 
            mode="aspectFill" 
          />
          {/* 渐变遮罩 */}
          <View className="banner-gradient" />
        </View>

        {/* 浮动返回按钮 */}
        <View 
          className="floating-back-btn" 
          onClick={handleBack}
          style={{ top: `${statusBarHeight + 16}px` }}
        >
          <Image src={iconArrowLeft} className="back-icon" mode="aspectFit" />
        </View>

        {/* 标题 Overlay（显示副标题或分类） */}
        <View className="title-overlay">
          <Text className="subtitle">暑期培训会</Text>
        </View>
      </View>

      {/* 内容区域 - 滚动式布局 */}
      <ScrollView className="content-scroll-view" scrollY enhanced showScrollbar={false}>
        {/* 活动速览 */}
        <View className="module-section overview-section">
          <OverviewTab activity={activity} theme={theme} />
        </View>

        {/* 议程预览 */}
        <View className="module-section agenda-preview-section">
          <View className="section-header">
            <Text className="section-icon">📅</Text>
            <Text className="section-title">活动议程</Text>
          </View>
          <AgendaPreviewCard 
            agenda={activity.agenda || []} 
            theme={theme}
            activityId={activity.id}
          />
        </View>

        {/* 酒店信息 */}
        <View className="module-section hotel-section">
          <View className="section-header">
            <Text className="section-icon">🏨</Text>
            <Text className="section-title">酒店信息</Text>
          </View>
          <HotelTab hotels={activity.hotels || []} onCall={handleCall} theme={theme} />
        </View>

        {/* 图片直播 */}
        <View className="module-section live-section">
          <View className="section-header">
            <Text className="section-icon">📸</Text>
            <Text className="section-title">图片直播</Text>
          </View>
          <LiveTab coverUrl={activity.cover_url} onViewLive={handleViewLive} theme={theme} />
        </View>
        
        {/* 底部安全区 */}
        <View className="bottom-spacer" />
      </ScrollView>

      {/* 底部胶囊浮岛（保持不变） */}
      <BottomBar
        isFavorited={isFavorited}
        isLiked={isLiked}
        onFavorite={handleFavorite}
        onComment={handleComment}
        onLike={handleLike}
        onShare={handleShare}
        onSignup={handleSignup}
        theme={theme}
      />
    </View>
  )
}
