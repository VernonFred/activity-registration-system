/**
 * 通知服务 — 前后端连接层
 * 创建时间: 2026年2月27日
 */
import { http } from './http'
import { CONFIG } from '../config'
import type { Notification, MentionItem, MyCommentItem } from '../pages/profile/types'
import { mockNotifications, mockMentions, mockMyComments } from '../pages/profile/mockData'

const EVENT_DISPLAY: Record<string, { type: Notification['type']; title: string; template: string }> = {
  SIGNUP_SUBMITTED: { type: 'success', title: '报名成功', template: '您的「{activity}」已经报名成功，请准时参加。' },
  SIGNUP_APPROVED: { type: 'success', title: '报名审批通过', template: '您的「{activity}」报名已通过审批。' },
  SIGNUP_REJECTED: { type: 'warning', title: '报名被拒绝', template: '您的「{activity}」报名未通过审批。' },
  SIGNUP_REMINDER: { type: 'info', title: '活动提醒', template: '「{activity}」即将开始，请做好准备。' },
  CHECKIN_REMINDER: { type: 'info', title: '签到提醒', template: '「{activity}」签到已开放，请及时签到。' },
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}天前`
  return new Date(dateStr).toLocaleDateString()
}

function mapApiLogToNotification(log: any): Notification {
  const event = log.event || ''
  const display = EVENT_DISPLAY[event] || { type: 'info' as const, title: event, template: '' }
  const activityTitle = log.payload?.activity_title || '活动'
  const content = display.template.replace('{activity}', activityTitle)

  return {
    id: log.id,
    type: display.type,
    title: display.title,
    content: content || log.payload?.message || '',
    time: formatTimeAgo(log.created_at || log.sent_at || new Date().toISOString()),
    is_new: log.status === 'PENDING' || log.status === 'SENT',
  }
}

export async function fetchMyNotifications(limit = 50): Promise<Notification[]> {
  if (CONFIG.USE_MOCK) return mockNotifications

  try {
    const { data } = await http.get('/notifications/me', { params: { limit } })
    return (data || []).map(mapApiLogToNotification)
  } catch (error) {
    console.error('获取通知失败，使用本地数据:', error)
    return mockNotifications
  }
}

export async function fetchMyMentions(): Promise<MentionItem[]> {
  if (CONFIG.USE_MOCK) return mockMentions

  try {
    const { data } = await http.get('/comments/mentions/me')
    return data || []
  } catch (error) {
    console.error('获取@我的数据失败，使用本地数据:', error)
    return mockMentions
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
