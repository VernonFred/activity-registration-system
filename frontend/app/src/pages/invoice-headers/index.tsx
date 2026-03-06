import { ScrollView, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import InvoiceHeaderSheet from './components/InvoiceHeaderSheet'
import { useInvoiceHeadersPage } from './hooks/useInvoiceHeadersPage'
import './index.scss'

export default function InvoiceHeaders() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const {
    addType,
    currentPage,
    form,
    handleCopy,
    handleDelete,
    handleSave,
    handleTouchMove,
    handleTouchStart,
    headers,
    openAdd,
    openEdit,
    saving,
    setAddType,
    setCurrentPage,
    setShowSheet,
    sheetMode,
    showSheet,
    swipedId,
    topPad,
    totalPages,
    updateField,
  } = useInvoiceHeadersPage(t)

  return (
    <View className={`ih-page theme-${theme}`}>
      <View className="ih-back" style={{ paddingTop: `${topPad}px` }} onClick={() => Taro.navigateBack()}>
        <View className="ih-back-circle"><View className="ih-back-arrow" /></View>
      </View>

      <View className="ih-add-btn" onClick={openAdd}>
        <View className="ih-add-icon" />
        <Text className="ih-add-text">{t('invoiceHeaders.addTitle')}</Text>
      </View>

      <ScrollView scrollY className="ih-scroll">
        <View className="ih-list">
          {headers.map((item) => (
            <View key={item.id} className={`ih-card ${swipedId === item.id ? 'swiped' : ''}`} onTouchStart={handleTouchStart} onTouchMove={(e) => handleTouchMove(e, item.id)}>
              <View className="ih-card-body">
                <View className="ih-card-top">
                  <View className="ih-card-left">
                    <View className="ih-card-avatar"><Text>{item.name[0]}</Text></View>
                    <View className="ih-card-info">
                      <Text className="ih-card-name">{item.name}</Text>
                      <Text className="ih-card-type">{item.type === 'personal' ? t('invoiceHeaders.personal') : t('invoiceHeaders.company')}</Text>
                    </View>
                  </View>
                  <View className="ih-qr-icon" />
                </View>
                <View className="ih-card-divider" />
                <View className="ih-card-actions">
                  <View className="ih-action ih-action-edit" onClick={() => openEdit(item)}><Text>{t('common.edit')}</Text></View>
                  <View className="ih-action ih-action-copy" onClick={() => handleCopy(item)}><Text>{t('common.copy')}</Text></View>
                </View>
              </View>
              <View className="ih-delete-area" onClick={() => handleDelete(item.id)}>
                <View className="ih-trash-icon"><View className="ih-trash-lid" /><View className="ih-trash-body" /></View>
              </View>
            </View>
          ))}
          {headers.length === 0 && <View className="ih-empty"><Text>{t('invoiceHeaders.noHeaders')}</Text></View>}
        </View>

        {totalPages > 1 && (
          <View className="ih-pagination">
            {Array.from({ length: totalPages }, (_, i) => <View key={i} className={`ih-page-dot ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)} />)}
            <Text className="ih-page-info">{currentPage}/{totalPages}</Text>
          </View>
        )}
      </ScrollView>

      <InvoiceHeaderSheet
        addType={addType}
        form={form}
        onChangeType={setAddType}
        onClose={() => setShowSheet(false)}
        onSave={() => void handleSave()}
        onUpdateField={updateField}
        saving={saving}
        sheetMode={sheetMode}
        visible={showSheet}
      />
    </View>
  )
}
