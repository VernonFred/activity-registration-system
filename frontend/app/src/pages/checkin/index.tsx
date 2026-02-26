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
  const [phase, setPhase] = useState<'idle' | 'pressing' | 'flash' | 'done'>('idle')
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkinTime, setCheckinTime] = useState('')
  const [title, setTitle] = useState('暑期培训会议')
  const [dateRange, setDateRange] = useState('')
  const [location, setLocation] = useState('')
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
      setPhase('flash')
      setTimeout(() => setPhase('done'), 1200)
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
      <View className="bg-base" />
      <View className="bg-glow g1" />
      <View className="bg-glow g2" />
      <View className="bg-noise" />

      {/* 浮动微粒 */}
      <View className="motes">
        {Array.from({ length: 16 }).map((_, i) => (
          <View key={i} className={`mote m${i}`} />
        ))}
      </View>

      {/* 闪白过渡 */}
      {phase === 'flash' && <View className="flash-overlay" />}

      {phase !== 'done' ? (
        <View className="pre-stage">
          <Text className="pre-title">{title}</Text>
          <Text className="pre-date">{dateRange || '2025.07.21-07.25'}</Text>

          <View className="orb-area" onClick={handleCheckin}>
            <View className="ripple r1" />
            <View className="ripple r2" />
            <View className="ripple r3" />

            <View className="ring-outer" />
            <View className="ring-inner" />

            <View className="core">
              <View className="core-shine" />
              <Text className="core-label">
                {phase === 'pressing' ? '··' : '签到'}
              </Text>
            </View>
          </View>

          <Text className="pre-hint">
            {phase === 'pressing' ? '正在验证' : '轻触签到'}
          </Text>

          {!CONFIG.USE_MOCK && (
            <View className="token-area">
              <Text className="token-link" onClick={() => setShowTokenInput((v) => !v)}>
                {showTokenInput ? '收起' : '签到码'}
              </Text>
              {showTokenInput && (
                <Input
                  className="token-input"
                  value={token}
                  onInput={(e) => setToken(e.detail.value)}
                  placeholder="输入签到码"
                />
              )}
            </View>
          )}
        </View>
      ) : (
        <View className="done-stage">
          {/* 光线扫过 */}
          <View className="light-sweep" />

          <View className="done-hero">
            <Text className="done-label">CHECKED IN</Text>
            <View className="done-line" />
            <Text className="done-title">签到成功</Text>
            <Text className="done-sub">祝您参会愉快</Text>
          </View>

          <View className="done-card">
            <Text className="card-event">{title}</Text>
            <View className="card-sep" />
            <View className="card-row">
              <View className="card-icon">
                <Image src={iconCalendar} className="card-img" mode="aspectFit" />
              </View>
              <View className="card-col">
                <Text className="card-key">签到时间</Text>
                <Text className="card-val">{displayTime || '--'}</Text>
              </View>
            </View>
            <View className="card-row">
              <View className="card-icon">
                <Image src={iconMapPin} className="card-img" mode="aspectFit" />
              </View>
              <View className="card-col">
                <Text className="card-key">签到地点</Text>
                <Text className="card-val">{location || '--'}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <View className="close-float" onClick={goBack}>
        <Text>×</Text>
      </View>
    </View>
  )
}
