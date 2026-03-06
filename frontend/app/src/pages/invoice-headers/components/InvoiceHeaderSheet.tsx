import { ScrollView, View, Text, Input } from '@tarojs/components'
import { useTranslation } from 'react-i18next'

interface InvoiceHeaderSheetProps {
  addType: 'personal' | 'company'
  form: Record<string, string>
  onChangeType: (value: 'personal' | 'company') => void
  onClose: () => void
  onSave: () => void
  onUpdateField: (key: string, value: string) => void
  saving: boolean
  sheetMode: 'add' | 'edit'
  visible: boolean
}

const InvoiceHeaderSheet = ({ addType, form, onChangeType, onClose, onSave, onUpdateField, saving, sheetMode, visible }: InvoiceHeaderSheetProps) => {
  const { t } = useTranslation()
  if (!visible) return null

  return (
    <View className="ih-sheet-mask" onClick={() => { if (!saving) onClose() }}>
      <View className="ih-sheet" onClick={(e) => e.stopPropagation()}>
        <View className="ih-sheet-handle" />
        <Text className="ih-sheet-title">{sheetMode === 'add' ? t('invoiceHeaders.addTitle') : t('invoiceHeaders.editTitle')}</Text>

        {sheetMode === 'add' && (
          <View className="ih-seg-control">
            <View className={`ih-seg-item ${addType === 'personal' ? 'active' : ''}`} onClick={() => onChangeType('personal')}><Text>{t('invoiceHeaders.personal')}</Text></View>
            <View className={`ih-seg-item ${addType === 'company' ? 'active' : ''}`} onClick={() => onChangeType('company')}><Text>{t('invoiceHeaders.company')}</Text></View>
          </View>
        )}

        <ScrollView scrollY className="ih-form-scroll">
          <View className="ih-field">
            <Text className="ih-field-label">{t('invoiceHeaders.nameLabel')}</Text>
            <Input className="ih-field-input" value={form.name} onInput={(e) => onUpdateField('name', e.detail.value)} placeholder={addType === 'personal' ? t('invoiceHeaders.namePlaceholderPersonal') : t('invoiceHeaders.namePlaceholderCompany')} placeholderClass="ih-placeholder" />
          </View>

          {addType === 'company' && (
            <>
              <View className="ih-field"><Text className="ih-field-label">{t('invoiceHeaders.taxNo')}</Text><Input className="ih-field-input" value={form.tax_number} onInput={(e) => onUpdateField('tax_number', e.detail.value)} placeholder={t('invoiceHeaders.taxNoPlaceholder')} placeholderClass="ih-placeholder" /></View>
              <View className="ih-field"><Text className="ih-field-label">{t('invoiceHeaders.companyAddress')}</Text><Input className="ih-field-input" value={form.address} onInput={(e) => onUpdateField('address', e.detail.value)} placeholder={t('invoiceHeaders.addressPlaceholder')} placeholderClass="ih-placeholder" /></View>
              <View className="ih-field"><Text className="ih-field-label">{t('invoiceHeaders.phoneLabel')}</Text><Input className="ih-field-input" value={form.phone} onInput={(e) => onUpdateField('phone', e.detail.value)} placeholder={t('invoiceHeaders.phonePlaceholder')} placeholderClass="ih-placeholder" /></View>
              <View className="ih-field"><Text className="ih-field-label">{t('invoiceHeaders.bankName')}</Text><Input className="ih-field-input" value={form.bank_name} onInput={(e) => onUpdateField('bank_name', e.detail.value)} placeholder={t('invoiceHeaders.bankNamePlaceholder')} placeholderClass="ih-placeholder" /></View>
              <View className="ih-field"><Text className="ih-field-label">{t('invoiceHeaders.bankAccount')}</Text><Input className="ih-field-input" value={form.bank_account} onInput={(e) => onUpdateField('bank_account', e.detail.value)} placeholder={t('invoiceHeaders.bankAccountPlaceholder')} placeholderClass="ih-placeholder" /></View>
            </>
          )}
        </ScrollView>

        <View className="ih-sheet-footer">
          <View className={`ih-save-btn ${form.name.trim() ? 'active' : ''}`} onClick={onSave}><Text>{t('common.save')}</Text></View>
        </View>

        {saving && (
          <View className="ih-loading-overlay">
            <View className="ih-loading-box">
              <View className="ih-loading-spinner" />
              <Text className="ih-loading-text">{t('common.loading')}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

export default InvoiceHeaderSheet
