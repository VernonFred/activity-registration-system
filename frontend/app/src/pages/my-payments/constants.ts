export type SortField = 'default' | 'amount_asc' | 'amount_desc'
export type CategoryFilter = 'all' | '论坛' | '峰会' | '研讨会' | '培训'
export type TimeFilter = 'all' | 'recent' | 'month' | 'year'

export const CATEGORIES: CategoryFilter[] = ['all', '论坛', '峰会', '研讨会', '培训']
export const SORT_FIELDS: SortField[] = ['default', 'amount_asc', 'amount_desc']
export const TIME_OPTIONS: { value: TimeFilter; key: string }[] = [
  { value: 'all', key: 'payments.allTime' },
  { value: 'recent', key: 'payments.last7Days' },
  { value: 'month', key: 'payments.lastMonth' },
  { value: 'year', key: 'payments.lastYear' },
]
export const SORT_LABEL_KEYS: Record<SortField, string> = {
  default: 'payments.defaultSort',
  amount_asc: 'payments.amountAsc',
  amount_desc: 'payments.amountDesc',
}
export const CATEGORY_LABEL_KEYS: Record<CategoryFilter, string> = {
  all: 'payments.allTypes',
  '论坛': 'payments.forum',
  '峰会': 'payments.summit',
  '研讨会': 'payments.seminar',
  '培训': 'payments.training',
}
export const PAGE_SIZE = 5
