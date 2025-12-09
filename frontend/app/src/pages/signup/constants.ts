/**
 * Signup 页面常量
 * 创建时间: 2025年12月9日
 */
import type { StepConfig } from './types'

// 步骤定义
export const STEPS: StepConfig[] = [
  { key: 'personal', title: '个人信息', keywords: ['姓名', '学校', '学院', '部门', '职位', '手机', '电话', '邮箱'] },
  { key: 'payment', title: '缴费信息', keywords: ['缴费', '发票', '抬头', '税号'] },
  { key: 'accommodation', title: '住宿信息', keywords: ['住宿', '酒店', '房型', '入住'] },
  { key: 'transport', title: '交通信息', keywords: ['接站', '送站', '车次', '航班', '到达', '返程', '交通'] },
]

