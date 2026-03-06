import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import type { TFunction } from 'i18next'
import { fetchFeaturedActivities, fetchHistoricalActivities } from '../../../services/activities'
import type { MockActivity } from '../../../mock/activities'

export function useHomePage(t: TFunction) {
  const [featuredActivities, setFeaturedActivities] = useState<MockActivity[]>([])
  const [historyActivities, setHistoryActivities] = useState<MockActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [statusBarHeight, setStatusBarHeight] = useState(44)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const sysInfo = Taro.getSystemInfoSync()
    setStatusBarHeight(sysInfo.statusBarHeight || 44)
    void loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [featured, history] = await Promise.all([
        fetchFeaturedActivities() as Promise<MockActivity[]>,
        fetchHistoricalActivities() as Promise<MockActivity[]>,
      ])
      setFeaturedActivities(featured)
      setHistoryActivities(history)
    } catch (error) {
      console.error('加载数据失败:', error)
      Taro.showToast({ title: t('common.loadFailed'), icon: 'none', duration: 2000 })
      setFeaturedActivities([])
      setHistoryActivities([])
    } finally {
      setLoading(false)
    }
  }

  return {
    currentIndex,
    featuredActivities,
    historyActivities,
    loading,
    setCurrentIndex,
    statusBarHeight,
  }
}
