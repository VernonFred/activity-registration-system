/**
 * 独立议程页面 - 参考 Lovable 设计
 * 创建时间: 2025年12月12日
 * 
 * 功能：
 * - 多天会议切换
 * - 分组折叠/展开
 * - 完整议程展示
 * - 浅色/暗黑主题适配
 */
import { View, Text, ScrollView } from '@tarojs/components'
import { useState, useEffect, useCallback } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { useTheme } from '../../context/ThemeContext'
import type { AgendaDay } from '../../pages/activity-detail/types'
import { DateTabs } from './components/DateTabs'
import { AgendaGroupSection } from './components/AgendaGroupSection'
import './index.scss'

// 图标
import iconArrowLeft from '../../assets/icons/arrow-left.png'
import iconChevronDown from '../../assets/icons/chevron-down.png'
import iconChevronUp from '../../assets/icons/chevron-up.png'

const STORAGE_KEY = 'agenda-expanded-groups'

export default function AgendaPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const activityId = Number(router.params.activity_id)
  
  // 从详情页传递过来的议程数据（实际应用中需要从API获取）
  // 这里先使用 localStorage 临时存储
  const [agendaData, setAgendaData] = useState<AgendaDay[]>([])
  const [activeDay, setActiveDay] = useState<string>('')
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [statusBarHeight, setStatusBarHeight] = useState(44)

  // 初始化
  useEffect(() => {
    const sysInfo = Taro.getSystemInfoSync()
    setStatusBarHeight(sysInfo.statusBarHeight || 44)

    // 从 localStorage 获取议程数据
    try {
      const stored = Taro.getStorageSync('current_agenda_data')
      if (stored) {
        const data: AgendaDay[] = JSON.parse(stored)
        setAgendaData(data)
        if (data.length > 0) {
          setActiveDay(data[0].id.toString())
          initializeDefaultExpanded(data)
        }
      }
    } catch (e) {
      console.error('加载议程数据失败', e)
    }
  }, [])

  // 初始化默认展开第一个分组
  const initializeDefaultExpanded = (data: AgendaDay[]) => {
    const stored = Taro.getStorageSync(STORAGE_KEY)
    if (stored) {
      try {
        setExpandedGroups(JSON.parse(stored))
        return
      } catch (e) {
        // 忽略解析错误
      }
    }

    // 默认展开每天的第一个分组
    const defaults: Record<string, boolean> = {}
    data.forEach(day => {
      if (day.groups && day.groups[0]) {
        defaults[day.groups[0].id.toString()] = true
      }
    })
    setExpandedGroups(defaults)
  }

  // 保存展开状态到 localStorage
  useEffect(() => {
    if (Object.keys(expandedGroups).length > 0) {
      Taro.setStorageSync(STORAGE_KEY, JSON.stringify(expandedGroups))
    }
  }, [expandedGroups])

  // 获取当前天的议程
  const currentDay = agendaData.find(d => d.id.toString() === activeDay)

  // 切换分组展开/折叠
  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }))
  }, [])

  // 展开全部
  const expandAll = useCallback(() => {
    if (!currentDay || !currentDay.groups) return
    const allExpanded: Record<string, boolean> = { ...expandedGroups }
    currentDay.groups.forEach(g => {
      allExpanded[g.id.toString()] = true
    })
    setExpandedGroups(allExpanded)
  }, [currentDay, expandedGroups])

  // 折叠全部
  const collapseAll = useCallback(() => {
    if (!currentDay || !currentDay.groups) return
    const allCollapsed: Record<string, boolean> = { ...expandedGroups }
    currentDay.groups.forEach(g => {
      allCollapsed[g.id.toString()] = false
    })
    setExpandedGroups(allCollapsed)
  }, [currentDay, expandedGroups])

  // 判断是否全部展开
  const allExpanded = currentDay?.groups?.every(g => expandedGroups[g.id.toString()]) ?? false

  // 返回上一页
  const handleBack = useCallback(() => {
    Taro.navigateBack()
  }, [])

  // 切换日期
  const handleDayChange = useCallback((dayId: string) => {
    setActiveDay(dayId)
  }, [])

  if (!agendaData || agendaData.length === 0) {
    return (
      <View className={`agenda-page theme-${theme} empty`}>
        <View className="status-bar" style={{ height: `${statusBarHeight}px` }} />
        <Text className="empty-text">暂无议程数据</Text>
      </View>
    )
  }

  return (
    <View className={`agenda-page theme-${theme}`}>
      {/* 状态栏占位 */}
      <View className="status-bar" style={{ height: `${statusBarHeight}px` }} />

      {/* 顶部导航 */}
      <View className="page-header">
        <View className="header-content">
          <View className="header-left">
            <View className="back-button" onClick={handleBack}>
              <image src={iconArrowLeft} className="back-icon" mode="aspectFit" />
            </View>
            <View className="header-title-wrapper">
              <Text className="header-title">活动议程</Text>
              <Text className="header-subtitle">Conference Agenda</Text>
            </View>
          </View>
        </View>

        {/* 日期切换 Tab */}
        <DateTabs
          days={agendaData}
          activeDay={activeDay}
          onDayChange={handleDayChange}
          theme={theme}
        />
      </View>

      {/* 主内容区域 */}
      <ScrollView 
        className="page-content" 
        scrollY 
        enhanced 
        showScrollbar={false}
      >
        {/* 展开/折叠全部按钮 */}
        <View className="toolbar">
          <View 
            className="expand-all-btn" 
            onClick={allExpanded ? collapseAll : expandAll}
          >
            <image 
              src={allExpanded ? iconChevronUp : iconChevronDown} 
              className="expand-icon" 
              mode="aspectFit" 
            />
            <Text className="expand-text">
              {allExpanded ? '收起全部' : '展开全部'}
            </Text>
          </View>
        </View>

        {/* 议程分组列表 */}
        <View className="groups-container">
          {currentDay?.groups?.map((group, index) => (
            <AgendaGroupSection
              key={group.id}
              group={group}
              isExpanded={expandedGroups[group.id.toString()] ?? false}
              onToggle={() => toggleGroup(group.id.toString())}
              index={index}
              theme={theme}
            />
          ))}
        </View>

        {/* 页脚 */}
        <View className="page-footer">
          <Text className="footer-text">
            © 2025 强智科技 · 精心设计
          </Text>
        </View>

        {/* 底部安全区 */}
        <View className="bottom-spacer" />
      </ScrollView>
    </View>
  )
}

