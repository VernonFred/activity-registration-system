import http from './http'

export type AuditAction =
  | 'activity_created'
  | 'activity_updated'
  | 'checkin_token_generated'
  | 'signup_reviewed'
  | 'notification_sent'
  | 'badge_awarded'
  | 'export_signups'
  | 'badge_rule_changed'
  | 'badge_rule_triggered'
  | 'task_run'

export async function listAuditLogs(params: { action?: AuditAction; limit?: number; offset?: number } = {}) {
  const resp = await http.get('/audit-logs', { params })
  return resp.data
}

