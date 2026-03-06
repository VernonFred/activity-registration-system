export type Signup = any

export const SIGNUP_STATUS_LABEL: Record<string, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回',
  waitlisted: '候补',
  cancelled: '已取消',
}

export const CHECKIN_STATUS_LABEL: Record<string, string> = {
  not_checked_in: '未签到',
  checked_in: '已签到',
  no_show: '缺席',
}

export const STATUS_COLOR: Record<string, string> = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
  waitlisted: 'blue',
  cancelled: 'default',
}

export const CHECKIN_COLOR: Record<string, string> = {
  not_checked_in: 'default',
  checked_in: 'green',
  no_show: 'red',
}

export const FIELD_MAP: { key: string; title: string; labels: string[] }[] = [
  { key: 'name', title: '姓名', labels: ['姓名', '名字'] },
  { key: 'school', title: '学校', labels: ['学校', '单位', '机构'] },
  { key: 'dept', title: '部门/职位', labels: ['部门', '职位', '岗位'] },
  { key: 'phone', title: '手机号码', labels: ['手机', '电话', '手机号'] },
  { key: 'email', title: '邮箱', labels: ['邮箱', 'Email', '电子邮箱'] },
  { key: 'stay_arrange', title: '住宿安排', labels: ['住宿安排'] },
  { key: 'hotel', title: '入住酒店', labels: ['入住酒店', '酒店', '宾馆'] },
  { key: 'stay_pref', title: '住宿意向', labels: ['住宿意向'] },
  { key: 'room_type', title: '住宿户型', labels: ['户型', '房型'] },
  { key: 'invoice', title: '发票信息', labels: ['发票', '发票信息'] },
  { key: 'pickup', title: '接站点', labels: ['接站点', '接站', '接机'] },
  { key: 'arrive_no', title: '到会车次/航班', labels: ['到会车次/航班', '到达车次', '到达航班', '航班号', '列车号'] },
  { key: 'arrive_time', title: '到会时间', labels: ['到会时间', '到达时间', '到达日期', '到达'] },
  { key: 'drop', title: '送站点', labels: ['送站点', '送站', '送机'] },
  { key: 'return_no', title: '返程车次/航班', labels: ['返程车次/航班', '返程车次', '返程航班'] },
  { key: 'return_time', title: '返程时间', labels: ['返程时间', '返回时间', '离开时间'] },
]
