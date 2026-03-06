import { View, Text } from '@tarojs/components'

interface NotificationsPaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export default function NotificationsPagination({ page, totalPages, onChange }: NotificationsPaginationProps) {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 3) return [1, 2, 3, 4, -1, totalPages]
    if (page >= totalPages - 2) return [1, -1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    return [1, -1, page - 1, page, page + 1, -2, totalPages]
  }

  return (
    <View className="nt-pagination">
      <View className={`nt-page-arrow ${page <= 1 ? 'disabled' : ''}`} onClick={() => page > 1 && onChange(page - 1)}>
        <View className="nt-arrow-left" />
      </View>
      <View className="nt-page-track">
        {getVisiblePages().map((item, index) => item < 0 ? (
          <View key={`dot-${index}`} className="nt-page-ellipsis"><Text>···</Text></View>
        ) : (
          <View key={item} className={`nt-page-num ${page === item ? 'active' : ''}`} onClick={() => onChange(item)}>
            <Text>{item}</Text>
          </View>
        ))}
      </View>
      <View className={`nt-page-arrow ${page >= totalPages ? 'disabled' : ''}`} onClick={() => page < totalPages && onChange(page + 1)}>
        <View className="nt-arrow-right" />
      </View>
      <Text className="nt-page-info">{page}/{totalPages}</Text>
    </View>
  )
}
