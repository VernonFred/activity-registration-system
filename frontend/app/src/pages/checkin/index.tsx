import { useEffect, useMemo, useState, useCallback } from 'react'
import { View, Text, Input, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useTheme } from '../../context/ThemeContext'
import { fetchSignupDetail } from '../../services/user'
import { fetchActivityDetail } from '../../services/activities'
import { checkinSignup, getMockCheckinOverrides } from '../../services/checkins'
import { CONFIG } from '../../config'
import './index.scss'
import iconCalendar from '../../assets/icons/calendar.png'
import iconMapPin from '../../assets/icons/map-pin.png'

export default function CheckinPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const signupId = Number(router.params.signupId || router.params.signup_id || 0)
  const activityId = Number(router.params.activityId || router.params.activity_id || 0)

  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState<'idle' | 'pressing' | 'stamping' | 'done'>('idle')
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkinTime, setCheckinTime] = useState('')
  const [title, setTitle] = useState('暑期培训会议')
  const [dateRange, setDateRange] = useState('')
  const [location, setLocation] = useState('')
  const [seatInfo] = useState('A区 12排 5座')
  const [token, setToken] = useState('')
  const [showTokenInput, setShowTokenInput] = useState(false)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        if (signupId) {
          const signup: any = await fetchSignupDetail(signupId)
          if (!active) return
          if (signup?.checkin_status === 'checked_in') {
            setCheckedIn(true)
            setPhase('done')
          }
          if (signup?.checkin_time) setCheckinTime(signup.checkin_time)
          if (signup?.activity?.title) setTitle(signup.activity.title)
          if (signup?.activity?.location_name || signup?.activity?.location_city) {
            setLocation([signup.activity.location_city, signup.activity.location_name].filter(Boolean).join(' | '))
          }
          if (signup?.activity?.start_time && signup?.activity?.end_time) {
            setDateRange(`${String(signup.activity.start_time).slice(0, 10)}-${String(signup.activity.end_time).slice(5, 10)}`)
          }
        }

        const mockOverride = getMockCheckinOverrides()[String(signupId)]
        if (mockOverride && active) {
          setCheckedIn(true)
          setPhase('done')
          setCheckinTime(mockOverride.checkin_time)
        }

        if (activityId) {
          const detail: any = await fetchActivityDetail(activityId)
          if (!active) return
          setTitle(detail?.title || title)
          const start = String(detail?.start_time || '')
          const end = String(detail?.end_time || '')
          if (start && end) setDateRange(`${start.slice(0, 10)}-${end.slice(5, 10)}`)
          setLocation(detail?.location_name || detail?.location || location)
        }
      } catch (error) {
        console.error('加载签到页面数据失败:', error)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [activityId, signupId])

  const displayTime = useMemo(() => {
    if (!checkinTime) return ''
    const d = new Date(checkinTime)
    if (Number.isNaN(d.getTime())) return checkinTime
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }, [checkinTime])

  const handleCheckin = useCallback(async () => {
    if (phase !== 'idle') return
    if (!signupId) {
      Taro.showToast({ title: '报名记录不存在', icon: 'none' })
      return
    }
    if (!CONFIG.USE_MOCK && !token.trim()) {
      Taro.showToast({ title: '请输入签到码', icon: 'none' })
      setShowTokenInput(true)
      return
    }

    setPhase('pressing')

    try {
      const result: any = await checkinSignup(signupId, { token: token.trim() || 'mock-checkin-token' })
      setCheckedIn(true)
      setCheckinTime(result?.checkin_time || new Date().toISOString())
      setPhase('stamping')
      setTimeout(() => setPhase('done'), 1800)
    } catch (error: any) {
      console.error('签到失败:', error)
      Taro.showToast({ title: error?.response?.data?.detail || '签到失败', icon: 'none' })
      setPhase('idle')
    }
  }, [phase, signupId, token])

  const goBack = () => {
    Taro.navigateBack({ delta: 1 }).catch(() => {
      Taro.reLaunch({ url: '/pages/profile/index' })
    })
  }

  return (
    <View className={`checkin-page theme-${theme} phase-${phase}`}>
      {/* 沉浸式背景层 */}
      <View className="bg-layer" />
      <View className="bg-aurora aurora-1" />
      <View className="bg-aurora aurora-2" />
      <View className="bg-aurora aurora-3" />

      {/* 浮动粒子 */}
      <View className="particles">
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={i} className={`dot dot-${i}`} />
        ))}
      </View>

      {phase !== 'done' ? (
        <View className="checkin-stage">
          {/* 活动信息 */}
          <View className="event-info">
            <Text className="event-title">{title}</Text>
            <Text className="event-date">{dateRange || '2025.07.21-07.25'}</Text>
          </View>

          {/* 核心交互区 */}
          <View className="orb-wrap" onClick={handleCheckin}>
            {/* 外圈呼吸光环 */}
            <View className="aura aura-1" />
            <View className="aura aura-2" />

            {/* 旋转边框 */}
            <View className="orb-border" />

            {/* 内核 */}
            <View className="orb-core">
              <View className="orb-glass" />
              <Text className="orb-text">
                {phase === 'pressing' ? '签到中' : '签到'}
              </Text>
            </View>
          </View>

          <Text className="checkin-hint">
            {phase === 'pressing' ? '正在签到...' : '点击签到'}
          </Text>

          {/* 印章落下动画 */}
          {phase === 'stamping' && (
            <View className="stamp-impact">
              <View className="stamp-ring stamp-r1" />
              <View className="stamp-ring stamp-r2" />
              <View className="stamp-ring stamp-r3" />
              <View className="stamp-mark">
                <Text>✓</Text>
              </View>
            </View>
          )}

          {!CONFIG.USE_MOCK && (
            <View className="token-area">
              <Text className="token-toggle" onClick={() => setShowTokenInput((v) => !v)}>
                {showTokenInput ? '收起' : '签到码'}
              </Text>
              {showTokenInput && (
                <Input
                  className="token-input"
                  value={token}
                  onInput={(e) => setToken(e.detail.value)}
                  placeholder="请输入签到码"
                />
              )}
            </View>
          )}
        </View>
      ) : (
        <View className="success-stage">
          {/* 光芒放射 */}
          <View className="rays">
            {Array.from({ length: 8 }).map((_, i) => (
              <View key={i} className={`ray ray-${i}`} />
            ))}
          </View>

          {/* 中心徽章 */}
          <View className="badge-wrap">
            <View className="badge-glow" />
            <View className="badge-body">
              <View className="badge-check">
                <Text>✓</Text>
              </View>
              <Text className="badge-label">签到成功</Text>
            </View>
          </View>

          {/* 信息卡 */}
          <View className="info-card">
            <Text className="info-card-title">{title}</Text>
            <View className="info-divider" />
            <View className="info-row">
              <View className="info-icon-wrap">
                <Image src={iconCalendar} className="info-icon" mode="aspectFit" />
              </View>
              <View className="info-col">
                <Text className="info-label">签到时间</Text>
                <Text className="info-val">{displayTime || '--'}</Text>
              </View>
            </View>
            <View className="info-row">
              <View className="info-icon-wrap">
                <Image src={iconMapPin} className="info-icon" mode="aspectFit" />
              </View>
              <View className="info-col">
                <Text className="info-label">签到地点</Text>
                <Text className="info-val">{location || '--'}</Text>
              </View>
            </View>
            <View className="info-row">
              <View className="info-icon-wrap seat-icon">
                <Text className="seat-char">座</Text>
              </View>
              <View className="info-col">
                <Text className="info-label">座位信息</Text>
                <Text className="info-val">{seatInfo}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 关闭按钮 */}
      <View className="close-btn" onClick={goBack}>
        <Text>×</Text>
      </View>
    </View>
  )
}
