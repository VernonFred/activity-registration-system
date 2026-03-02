/**
 * 通知服务 — 前后端连接层
 * 创建时间: 2026年2月27日
 */
import { http } from './http'
import { CONFIG } from '../config'
import i18n from '../i18n'
import type { Notification, MentionItem, MyCommentItem } from '../pages/profile/types'
import { mockNotifications, mockMentions, mockMyComments } from '../pages/profile/mockData'

const EVENT_TYPE_MAP: Record<string, Notification['type']> = {
  SIGNUP_SUBMITTED: 'success',
  SIGNUP_APPROVED: 'success',
  SIGNUP_REJECTED: 'warning',
  SIGNUP_REMINDER: 'info',
  CHECKIN_REMINDER: 'info',
}

const EVENT_I18N_MAP: Record<string, { titleKey: string; bodyKey: string }> = {
  SIGNUP_SUBMITTED: { titleKey: 'notification.signupSubmittedTitle', bodyKey: 'notification.signupSubmittedBody' },
  SIGNUP_APPROVED: { titleKey: 'notification.signupApprovedTitle', bodyKey: 'notification.signupApprovedBody' },
  SIGNUP_REJECTED: { titleKey: 'notification.signupRejectedTitle', bodyKey: 'notification.signupRejectedBody' },
  SIGNUP_REMINDER: { titleKey: 'notification.activityReminderTitle', bodyKey: 'notification.activityReminderBody' },
  CHECKIN_REMINDER: { titleKey: 'notification.checkinReminderTitle', bodyKey: 'notification.checkinReminderBody' },
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return i18n.t('time.justNow')
  if (minutes < 60) return i18n.t('time.minutesAgo', { minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return i18n.t('time.hoursAgo', { hours })
  const days = Math.floor(hours / 24)
  if (days < 30) return i18n.t('time.daysAgo', { days })
  return new Date(dateStr).toLocaleDateString()
}

function mapApiLogToNotification(log: any): Notification {
  const event = log.event || ''
  const i18nKeys = EVENT_I18N_MAP[event]
  const type = EVENT_TYPE_MAP[event] || 'info'
  const activityTitle = log.payload?.activity_title || i18n.t('profile.unnamedActivity')
  const title = i18nKeys ? i18n.t(i18nKeys.titleKey) : event
  const content = i18nKeys ? i18n.t(i18nKeys.bodyKey, { activity: activityTitle }) : ''

  return {
    id: log.id,
    type,
    title,
    content: content || log.payload?.message || '',
    time: formatTimeAgo(log.created_at || log.sent_at || new Date().toISOString()),
    is_new: log.status === 'PENDING' || log.status === 'SENT',
  }
}

/** Mock 通知的 i18n key 映射（按 mock id） */
const MOCK_NOTIF_I18N: Record<number, { titleKey: string; bodyKey: string; bodyParams?: Record<string, string> }> = {
  1: { titleKey: 'notification.signupSubmittedTitle', bodyKey: 'notification.signupSubmittedBody', bodyParams: { activity: '暑期培训会议' } },
  2: { titleKey: 'notification.surveyTitle', bodyKey: 'notification.surveyBody', bodyParams: { activity: '暑期培训会议' } },
  3: { titleKey: 'notification.unpaidTitle', bodyKey: 'notification.unpaidBody', bodyParams: { activity: '暑期培训会议' } },
  4: { titleKey: 'notification.badgeEarnedTitle', bodyKey: 'notification.badgeEarnedBody', bodyParams: { badge: '一周年' } },
}

function translateMockNotifications(): Notification[] {
  return mockNotifications.map(n => {
    const mapping = MOCK_NOTIF_I18N[n.id]
    if (!mapping) return n
    return {
      ...n,
      title: i18n.t(mapping.titleKey),
      content: i18n.t(mapping.bodyKey, mapping.bodyParams),
      time: n.time, // mock time 保持原样（静态展示数据）
      action_text: n.action_text ? i18n.t(`notification.action_${n.id}`, { defaultValue: n.action_text }) : undefined,
    }
  })
}

function translateMockMentions(): MentionItem[] {
  return mockMentions.map(m => ({
    ...m,
    time: m.time, // 用户内容保持原样
  }))
}

export async function fetchMyNotifications(limit = 50): Promise<Notification[]> {
  if (CONFIG.USE_MOCK) return translateMockNotifications()

  try {
    const { data } = await http.get('/notifications/me', { params: { limit } })
    return (data || []).map(mapApiLogToNotification)
  } catch (error) {
    console.error('获取通知失败，使用本地数据:', error)
    return translateMockNotifications()
  }
}

export async function fetchMyMentions(): Promise<MentionItem[]> {
  if (CONFIG.USE_MOCK) return translateMockMentions()

  try {
    const { data } = await http.get('/comments/mentions/me')
    return data || []
  } catch (error) {
    console.error('获取@我的数据失败，使用本地数据:', error)
    return translateMockMentions()
  }
}

export async function fetchMyCommentsList(): Promise<MyCommentItem[]> {
  if (CONFIG.USE_MOCK) return mockMyComments

  try {
    const { data } = await http.get('/comments/mine')
    return data || []
  } catch (error) {
    console.error('获取我的评论失败，使用本地数据:', error)
    return mockMyComments
  }
}

export async function clearAllNotifications(): Promise<void> {
  if (CONFIG.USE_MOCK) return

  try {
    await http.delete('/notifications/me')
  } catch (error) {
    console.error('清空通知失败:', error)
    throw error
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  if (CONFIG.USE_MOCK) return

  try {
    await http.put('/notifications/me/read-all')
  } catch (error) {
    console.error('标记已读失败:', error)
    throw error
  }
}

export async function deleteNotification(id: number): Promise<void> {
  if (CONFIG.USE_MOCK) return

  try {
    await http.delete(`/notifications/${id}`)
  } catch (error) {
    console.error('删除通知失败:', error)
    throw error
  }
}

export async function batchDeleteNotifications(ids: number[]): Promise<void> {
  if (CONFIG.USE_MOCK) return

  try {
    await http.post('/notifications/me/batch-delete', { ids })
  } catch (error) {
    console.error('批量删除失败:', error)
    throw error
  }
}
