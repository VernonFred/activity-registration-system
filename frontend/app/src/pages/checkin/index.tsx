import { useEffect, useMemo, useState } from 'react'
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
  const [submitting, setSubmitting] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
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
            setShowSuccess(true)
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
          setShowSuccess(true)
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

  const handleCheckin = async () => {
    if (!signupId) {
      Taro.showToast({ title: '报名记录不存在', icon: 'none' })
      return
    }
    if (!CONFIG.USE_MOCK && !token.trim()) {
      Taro.showToast({ title: '请输入签到码', icon: 'none' })
      setShowTokenInput(true)
      return
    }
    try {
      setSubmitting(true)
      const result: any = await checkinSignup(signupId, { token: token.trim() || 'mock-checkin-token' })
      setCheckedIn(true)
      setCheckinTime(result?.checkin_time || new Date().toISOString())
      setTimeout(() => setShowSuccess(true), 400)
    } catch (error: any) {
      console.error('签到失败:', error)
      Taro.showToast({ title: error?.response?.data?.detail || '签到失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const goBack = () => {
    Taro.navigateBack({ delta: 1 }).catch(() => {
      Taro.reLaunch({ url: '/pages/profile/index' })
    })
  }

  return (
    <View className={`checkin-page theme-${theme}`}>
      <View className="checkin-bg-glow" />

      {!showSuccess ? (
        <View className={`checkin-card ${checkedIn ? 'is-leaving' : ''}`}>
          <Text className="checkin-title">{title}</Text>
          <Text className="checkin-date">{dateRange || '2025.07.21-07.25'}</Text>

          <View className="checkin-btn-wrap" onClick={handleCheckin}>
            <View className="pulse-ring pulse-1" />
            <View className="pulse-ring pulse-2" />
            <View className="pulse-ring pulse-3" />

            <View className="gradient-orbit" />

            <View className={`checkin-btn-core ${submitting ? 'is-loading' : ''}`}>
              <Text className="btn-text">{submitting ? '签到中...' : '立即签到'}</Text>
            </View>
          </View>

          <Text className="checkin-hint">点击按钮完成签到</Text>

          {!CONFIG.USE_MOCK && (
            <View className="token-block">
              <Text className="token-toggle" onClick={() => setShowTokenInput((v) => !v)}>
                {showTokenInput ? '收起签到码输入' : '填写签到码（联调用）'}
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

          <View className="checkin-close" onClick={goBack}>
            <Text>×</Text>
          </View>
        </View>
      ) : (
        <View className="success-card animate-pop-in">
          <View className="success-close" onClick={goBack}>
            <Text>×</Text>
          </View>

          <View className="success-top">
            <Text className="success-title">签到成功</Text>
            <Text className="success-sub">祝您参会愉快</Text>
          </View>

          <View className="success-visual">
            <View className="burst-ring burst-1" />
            <View className="burst-ring burst-2" />
            <View className="burst-ring burst-3" />

            <View className="orbit-ring orbit-1" />
            <View className="orbit-ring orbit-2" />
            <View className="orbit-ring orbit-3" />

            <View className="success-check">
              <Text>✓</Text>
            </View>
          </View>

          <View className="success-info">
            <View className="info-row">
              <View className="info-icon-wrap">
                <Image src={iconCalendar} className="info-icon" mode="aspectFit" />
              </View>
              <View className="info-text-col">
                <Text className="info-label">签到时间</Text>
                <Text className="info-value">{displayTime || '--'}</Text>
              </View>
            </View>
            <View className="info-row">
              <View className="info-icon-wrap">
                <Image src={iconMapPin} className="info-icon" mode="aspectFit" />
              </View>
              <View className="info-text-col">
                <Text className="info-label">签到地点</Text>
                <Text className="info-value">{location || '--'}</Text>
              </View>
            </View>
            <View className="info-row">
              <View className="info-icon-wrap seat-wrap">
                <Text className="seat-text">座</Text>
              </View>
              <View className="info-text-col">
                <Text className="info-label">座位信息</Text>
                <Text className="info-value">{seatInfo}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
