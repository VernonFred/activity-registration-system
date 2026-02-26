import { useEffect, useMemo, useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useTheme } from '../../context/ThemeContext'
import { fetchSignupDetail } from '../../services/user'
import { fetchActivityDetail } from '../../services/activities'
import './index.scss'

export default function CredentialPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const signupId = Number(router.params.signupId || router.params.signup_id || 0)
  const activityId = Number(router.params.activityId || router.params.activity_id || 0)

  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('2025暑期老客户培训会议')
  const [participant, setParticipant] = useState('王小利')
  const [location, setLocation] = useState('长沙 | 喜来登大酒店')
  const [locationCity, setLocationCity] = useState('CS')
  const [dateRange, setDateRange] = useState('2025.07.30-2025.08.02')
  const [stampDate, setStampDate] = useState('2025.07')

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        if (signupId) {
          const signup: any = await fetchSignupDetail(signupId)
          if (!active) return
          setParticipant(signup?.personal?.name || participant)
          if (signup?.activity?.title) setTitle(signup.activity.title)
          if (signup?.activity?.start_time && signup?.activity?.end_time) {
            const s = String(signup.activity.start_time).slice(0, 10)
            const e = String(signup.activity.end_time).slice(0, 10)
            setDateRange(`${s} — ${e}`)
            setStampDate(s.slice(0, 7))
          }
          const city = signup?.activity?.location_city || ''
          const name = signup?.activity?.location_name || ''
          if (city || name) setLocation([city, name].filter(Boolean).join(' | '))
          if (city) setLocationCity(getCityCode(city))
        }
        if (activityId) {
          const detail: any = await fetchActivityDetail(activityId)
          if (!active) return
          setTitle(detail?.title || title)
          if (detail?.start_time && detail?.end_time) {
            const s = String(detail.start_time).slice(0, 10)
            const e = String(detail.end_time).slice(0, 10)
            setDateRange(`${s} — ${e}`)
            setStampDate(s.slice(0, 7))
          }
          const loc = detail?.location_name || detail?.location || location
          setLocation(loc)
          if (detail?.location_city) setLocationCity(getCityCode(detail.location_city))
        }
      } catch (error) {
        console.error('加载参会凭证失败:', error)
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [activityId, signupId])

  const displayTitle = useMemo(() => (loading ? '加载中...' : title), [loading, title])

  const mrzLine = useMemo(() => {
    const base = `P<CHN${participant.replace(/\s/g, '<')}<<${title.replace(/\s/g, '<').slice(0, 20)}`
    return base.padEnd(44, '<').slice(0, 44)
  }, [participant, title])

  return (
    <View className={`credential-page theme-${theme}`}>
      <View className="passport-bg" />
      <View className="passport-texture" />

      <View className="passport-book">
        {/* 护照顶部装饰线 */}
        <View className="book-edge" />

        {/* 印章区 */}
        <View className="stamp-zone">
          <View className="stamp">
            <View className="stamp-outer" />
            <View className="stamp-inner">
              <Text className="stamp-city">{locationCity}</Text>
              <View className="stamp-divider" />
              <Text className="stamp-date">{stampDate}</Text>
            </View>
            <View className="stamp-ring" />
          </View>
          <View className="ink-splash s1" />
          <View className="ink-splash s2" />
          <View className="ink-splash s3" />
        </View>

        {/* 信息区 */}
        <View className="info-zone">
          <Text className="info-type">CONFERENCE CREDENTIAL</Text>
          <Text className="info-title">{displayTitle}</Text>

          <View className="info-field">
            <Text className="field-label">ATTENDEE / 参会人员</Text>
            <Text className="field-value">{participant}</Text>
          </View>

          <View className="info-field">
            <Text className="field-label">VENUE / 地点</Text>
            <Text className="field-value field-small">{location}</Text>
          </View>

          <View className="info-field">
            <Text className="field-label">DATE / 日期</Text>
            <Text className="field-value field-small">{dateRange}</Text>
          </View>
        </View>

        {/* 底部机读码 */}
        <View className="mrz-zone">
          <View className="mrz-line-deco" />
          <Text className="mrz-text">{mrzLine}</Text>
          <Text className="mrz-text">{mrzLine.split('').reverse().join('')}</Text>
        </View>

        {/* VERIFIED 标记 */}
        <View className="verified-badge">
          <Text className="verified-text">VERIFIED</Text>
        </View>
      </View>

      <View
        className="passport-close"
        onClick={() => {
          Taro.navigateBack({ delta: 1 }).catch(() => {
            Taro.reLaunch({ url: '/pages/profile/index' })
          })
        }}
      >
        <Text>×</Text>
      </View>
    </View>
  )
}

function getCityCode(city: string): string {
  const map: Record<string, string> = {
    '北京': 'BJ', '上海': 'SH', '广州': 'GZ', '深圳': 'SZ',
    '长沙': 'CS', '杭州': 'HZ', '南京': 'NJ', '成都': 'CD',
    '武汉': 'WH', '西安': 'XA', '重庆': 'CQ', '天津': 'TJ',
    '苏州': 'SU', '厦门': 'XM', '青岛': 'QD', '大连': 'DL',
  }
  for (const [k, v] of Object.entries(map)) {
    if (city.includes(k)) return v
  }
  return city.slice(0, 2).toUpperCase()
}
