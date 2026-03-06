import { View, Text } from '@tarojs/components'
import { useTranslation } from 'react-i18next'
import type { SignupRecord } from '../../types'

interface SignupDetailPanelProps {
  signup: SignupRecord
  userName?: string
  menuSignupId: number | null
  onToggleMenu: (signupId: number) => void
  onCloseMenu: () => void
  onEditSignup: (signupId: number) => void
  onEditTransport: (signupId: number) => void
  onCancelSignup: (signupId: number) => void
  onAddCompanion: (signupId: number) => void
  onViewCredential: (signupId: number) => void
  onCheckin: (signupId: number) => void
  onPayment: (signupId: number) => void
}

function getCheckinStatusLabel(status: SignupRecord['checkin_status'], t: (key: string) => string) {
  if (status === 'checked_in') return t('profile.statusCheckedIn')
  if (status === 'no_show') return t('profile.statusNotCheckedIn')
  return t('profile.statusPendingCheckin')
}

export default function SignupDetailPanel({
  signup,
  userName,
  menuSignupId,
  onToggleMenu,
  onCloseMenu,
  onEditSignup,
  onEditTransport,
  onCancelSignup,
  onAddCompanion,
  onViewCredential,
  onCheckin,
  onPayment,
}: SignupDetailPanelProps) {
  const { t } = useTranslation()
  const hasTransport = signup.checkin_status === 'not_checked_in' && !signup.transport_completed
  const actionCount = 2 + (signup.checkin_status === 'checked_in' ? 1 : (signup.payment_status !== 'paid' ? 2 : 1))
  const wrapTags = hasTransport && actionCount >= 4

  return (
    <View className="record-detail-panel animate-slide-down">
      <View className="participant-list-v2">
        <View className={`participant-row is-primary ${wrapTags ? 'is-wrap' : ''}`}>
          <View className="participant-left">
            <Text className="participant-name">{userName || t('profile.primaryRegistrant')}</Text>
            {hasTransport && (
              <Text className="participant-inline-link" onClick={(e) => { e.stopPropagation(); onEditTransport(signup.id) }}>
                {t('profile.completeTransport')}
              </Text>
            )}
          </View>
          <View className={`participant-right ${wrapTags ? 'is-full' : ''}`}>
            <Text className={`participant-badge ${signup.payment_status === 'paid' ? 'is-success' : 'is-warning'}`}>
              {signup.payment_status === 'paid' ? t('profile.statusPaid') : t('profile.statusUnpaid')}
            </Text>
            <Text className={`participant-badge ${signup.checkin_status === 'checked_in' ? 'is-success' : 'is-muted'}`}>
              {getCheckinStatusLabel(signup.checkin_status, t)}
            </Text>
            {signup.checkin_status === 'checked_in' ? (
              <Text className="participant-action-link" onClick={(e) => { e.stopPropagation(); onViewCredential(signup.id) }}>
                {t('profile.viewCredential')}
              </Text>
            ) : (
              <>
                {signup.payment_status !== 'paid' && (
                  <Text className="participant-action-link is-danger" onClick={(e) => { e.stopPropagation(); onPayment(signup.id) }}>
                    {t('profile.goPay')}
                  </Text>
                )}
                <Text className="participant-action-link is-danger" onClick={(e) => { e.stopPropagation(); onCheckin(signup.id) }}>
                  {t('profile.goCheckin')}
                </Text>
              </>
            )}
          </View>
          <View className="row-menu" onClick={(e) => { e.stopPropagation() }}>
            <Text className="row-menu-trigger" onClick={() => onToggleMenu(signup.id)}>⋮</Text>
            {menuSignupId === signup.id && (
              <View className="row-menu-panel">
                <View className="row-menu-item" onClick={() => { onCloseMenu(); onEditSignup(signup.id) }}>
                  <Text>{t('profile.editSignup')}</Text>
                </View>
                <View className="row-menu-item is-danger" onClick={() => { onCloseMenu(); onCancelSignup(signup.id) }}>
                  <Text>{t('profile.cancelSignup')}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {signup.companions?.map((companion) => (
          <View key={companion.id} className="participant-row">
            <View className="participant-left">
              <Text className="participant-name">{companion.name}</Text>
            </View>
            <View className="participant-right">
              {signup.checkin_status === 'checked_in' ? (
                <Text className="participant-action-link" onClick={(e) => { e.stopPropagation(); onViewCredential(signup.id) }}>
                  {t('profile.viewCredential')}
                </Text>
              ) : (
                <>
                  {signup.payment_status !== 'paid' && (
                    <Text className="participant-action-link is-danger" onClick={(e) => { e.stopPropagation(); onPayment(signup.id) }}>
                      {t('profile.goPay')}
                    </Text>
                  )}
                  <Text className="participant-action-link is-danger" onClick={(e) => { e.stopPropagation(); onCheckin(signup.id) }}>
                    {t('profile.goCheckin')}
                  </Text>
                </>
              )}
            </View>
          </View>
        ))}
      </View>

      {signup.status === 'approved' && signup.checkin_status === 'not_checked_in' && (
        <View className="add-companion-btn-v2" onClick={(e) => { e.stopPropagation(); onCloseMenu(); onAddCompanion(signup.id) }}>
          <Text>{t('profile.addCompanion')}</Text>
        </View>
      )}
    </View>
  )
}
