import { ScrollView, View, Text, Image } from '@tarojs/components'
import { useTranslation } from 'react-i18next'
import type { PaymentItem } from '../../../services/payments'

interface PaymentDetailSheetProps {
  item: PaymentItem | null
  onClose: () => void
  topPad: number
}

const PaymentDetailSheet = ({ item, onClose, topPad }: PaymentDetailSheetProps) => {
  const { t } = useTranslation()
  if (!item) return null

  return (
    <View className="mp-detail-mask" onClick={onClose}>
      <View className="mp-detail-sheet" style={{ paddingTop: `${topPad + 56}px` }} onClick={(e) => e.stopPropagation()}>
        <ScrollView scrollY className="mp-detail-scroll">
          <View className="mp-detail-header-card">
            <View className="mp-detail-header">
              <Image className="mp-detail-cover" src={item.cover_url || 'https://placehold.co/120x120/e8e8e8/999?text=A'} mode="aspectFill" />
              <View className="mp-detail-header-info">
                <Text className="mp-detail-title">{item.activity_title}</Text>
                <View className="mp-detail-meta-row">
                  <View className="mp-detail-icon-calendar" />
                  <Text className="mp-detail-meta">{item.date_range || '—'}</Text>
                </View>
                <View className="mp-detail-meta-row">
                  <View className="mp-detail-icon-clock" />
                  <Text className="mp-detail-meta">{item.time_range || '—'}</Text>
                </View>
              </View>
            </View>
          </View>

          <Text className="mp-detail-section-title">{t('payments.detailInfo')}</Text>
          <View className="mp-detail-row">
            <View className="mp-detail-row-left">
              <View className="mp-detail-icon-person" />
              <Text className="mp-detail-row-label">{t('payments.payer')}</Text>
            </View>
            <Text className="mp-detail-row-value">{item.payer || '—'}</Text>
          </View>
          <View className="mp-detail-row">
            <View className="mp-detail-row-left">
              <View className="mp-detail-icon-date" />
              <Text className="mp-detail-row-label">{t('payments.payTime')}</Text>
            </View>
            <Text className="mp-detail-row-value">{item.pay_date ? `${item.pay_date} 9:00 AM` : '—'}</Text>
          </View>

          <View className="mp-detail-divider" />
          <Text className="mp-detail-section-title">{t('payments.amount')}</Text>
          <View className="mp-detail-row">
            <Text className="mp-detail-row-label-bold">{t('payments.fee')}</Text>
            <Text className="mp-detail-row-value-bold">¥ {item.amount.toFixed(2)}</Text>
          </View>
          <View className="mp-detail-row">
            <Text className="mp-detail-row-label-bold">{t('payments.orderNo')}</Text>
            <Text className="mp-detail-row-value-small">{item.order_no || '—'}</Text>
          </View>
          <View className="mp-detail-row">
            <Text className="mp-detail-row-label-bold">{t('payments.transactionNo')}</Text>
            <Text className="mp-detail-row-value-small">{item.transaction_no || '—'}</Text>
          </View>

          <Text className="mp-detail-section-title-green">{t('payments.payScreenshot')}</Text>
          <View className="mp-detail-upload-area">
            <View className="mp-detail-upload-icon" />
            <Text className="mp-detail-upload-text">{t('payments.payReceipt')}</Text>
          </View>

          <View className="mp-detail-footer">
            <View className="mp-detail-confirm-btn" onClick={onClose}>
              <Text>{t('common.confirm')}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  )
}

export default PaymentDetailSheet
