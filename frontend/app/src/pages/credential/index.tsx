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
  const [dateRange, setDateRange] = useState('2025.07.30-2025.08.02')

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
            setDateRange(
              `${String(signup.activity.start_time).slice(0, 10)}-${String(signup.activity.end_time).slice(0, 10)}`
            )
          }
          const loc = [signup?.activity?.location_city, signup?.activity?.location_name].filter(Boolean).join(' | ')
          if (loc) setLocation(loc)
        }
        if (activityId) {
          const detail: any = await fetchActivityDetail(activityId)
          if (!active) return
          setTitle(detail?.title || title)
          if (detail?.start_time && detail?.end_time) {
            setDateRange(`${String(detail.start_time).slice(0, 10)}-${String(detail.end_time).slice(0, 10)}`)
          }
          setLocation(detail?.location_name || detail?.location || location)
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

  return (
    <View className={`credential-page theme-${theme}`}>
      <View className="credential-mask" />
      <View className="credential-modal">
        <View className="credential-cup">🏆</View>
        <Text className="credential-caption">☆ 参会纪念 ☆</Text>
        <Text className="credential-title">{displayTitle}</Text>

        <View className="credential-divider">
          <View className="line" />
          <View className="dot" />
          <View className="line" />
        </View>

        <Text className="credential-label">参会人员</Text>
        <Text className="credential-name">{participant}</Text>
        <Text className="credential-thanks">感谢您的参与，期待下次再会</Text>

        <View className="credential-perforation">
          <View className="cut left" />
          <View className="dash" />
          <View className="cut right" />
        </View>

        <View className="credential-footer">
          <Text className="credential-meta">{location}</Text>
          <Text className="credential-meta">{dateRange}</Text>
        </View>
      </View>

      <View
        className="credential-close"
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
