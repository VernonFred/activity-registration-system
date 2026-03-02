const zhCN = {
  // ── 通用 ──
  common: {
    cancel: '取消',
    confirm: '确定',
    delete: '删除',
    save: '保存',
    saving: '保存中...',
    loading: '加载中...',
    retry: '重试',
    edit: '编辑',
    copy: '复制内容',
    back: '返回',
    more: '查看全部',
    close: '关闭',
    submit: '提交',
    search: '搜索',
    tip: '提示',
    success: '操作成功',
    failed: '操作失败',
    deleted: '已删除',
    networkError: '请求失败，请稍后重试',
    loadFailed: '加载失败，请稍后重试',
    loadFailedShort: '加载失败',
    noData: '暂无数据',
    person: '人',
    �: '元',
    �Prefix: '¥',
    collapse: '收起',
    expand: '展开',
    new: '新',
    view: '→ 查看',
    reply: '回复',
    modify: '修改',
    send: '发送',
    selected: '已选 {{count}} 项',
    batchDelete: '批量删除',
    confirmDeleteSelected: '确定要删除选中的 {{count}} 条记录吗？',
    prev: '上一步',
    next: '下一步',
    laterFill: '稍后填写',
    uploadingEllipsis: '上传中...'
  },

  // ── 底部导航栏 ──
  tabbar: {
    home: '主页',
    signup: '报名',
    profile: '我的',
    assistant: '助手'
  },

  // ── 首页 ──
  home: {
    greeting: '你好',
    searchPlaceholder: '搜索活动、会议、讲座...',
    hotPicks: '热门精选',
    historyEvents: '历史活动',
    statusRegistering: '报名中',
    statusUpcoming: '即将开始',
    statusOngoing: '进行中',
    statusEnded: '已结束',
    noHotEvents: '暂无热门活动',
    stayTuned: '敬请期待更多精彩活动',
    noHistoryEvents: '暂无历史活动',
    historyHint: '历史活动记录将在此展示',
    navTitle: '会议报名'
  },

  // ── 活动列表 ──
  activities: {
    sortByTime: '按时间排序',
    sortByRating: '按评分排序',
    sortByRegistration: '按报名人数排序',
    noActivities: '暂无相关活动',
    tryOtherFilter: '试试其他筛选条件吧'
  },

  // ── 活动详情 ──
  activityDetail: {
    activityNotExist: '活动不存在',
    tabOverview: '活动速览',
    tabAgenda: '活动议程',
    tabHotel: '酒店信息',
    tabLive: '图片直播',
    invalidActivity: '活动信息有误',
    uncollected: '已取消收藏',
    collected: '已收藏',
    shareHint: '请点击右上角 ··· 分享',
    liveNotStarted: '直播尚未开始',
    shareTitle: '精彩活动邀您参与',
    bookingHint: '预订时请报"强智科技"名称享受优惠价格',
    freeWifi: '免费WiFi',
    cafe: '咖啡厅',
    laundry: '洗衣房',
    freeParking: '免费停车',
    restaurant: '餐厅',
    meetingRoom: '会议厅',
    subway: '地铁',
    bus: '公交',
    driving: '自驾',
    cloudy: '多云',
    singleDoublePrice: '单双同价',
    withBreakfast: '含早餐',
    withDoubleBreakfast: '含双早'
  },

  // ── 报名流程 ──
  signup: {
    pageTitle: '活动报名',
    invalidActivityId: '活动ID无效',
    loadSignupFailed: '加载报名信息失败',
    enterName: '请输入姓名',
    enterSchool: '请输入学校',
    enterDepartment: '请输入学院/部门',
    invalidPhone: '请输入正确的手机号码',
    enterInvoiceTitle: '请输入发票抬头',
    invalidEmail: '请输入正确的邮箱地址',
    companionAdded: '已添加同行人员',
    saveSuccess: '保存成功',
    submitFailed: '提交失败，请重试',
    fillCompanionInfo: '请填写同行人员信息',
    submitSignup: '提交报名',
    exitConfirm: '您确定要退出报名填写的页面吗？'
  },

  // ── 搜索页面 ──
  search: {
    searchFailed: '搜索失败，请重试',
    enterKeyword: '请输入搜索关键词',
    uncollected: '已取消收藏',
    collectSuccess: '收藏成功',
    actionFailed: '操作失败，请重试',
    clearSearchHistory: '确定清除所有搜索记录吗？',
    clearBrowseHistory: '确定清除所有浏览记录吗？'
  },

  // ── 签到页面 ──
  checkin: {
    signIn: '签到',
    verifying: '正在验证',
    tapToSign: '轻触签到',
    checkinCode: '签到码',
    enterCode: '输入签到码',
    noRegistration: '报名记录不存在',
    enterCodeHint: '请输入签到码',
    checkinFailed: '签到失败',
    checkedIn: 'CHECKED IN',
    checkinSuccess: '签到成功',
    enjoyConference: '祝您参会愉快',
    checkinTime: '签到时间',
    checkinLocation: '签到地点'
  },

  // ── 参会凭证 ──
  credential: {
    title: 'CONFERENCE CREDENTIAL',
    attendeeLabel: 'ATTENDEE / 参会人员',
    venueLabel: 'VENUE / 地点',
    dateLabel: 'DATE / 日期',
    verified: 'VERIFIED'
  },

  // ── 议程页面 ──
  agenda: {
    pageTitle: '活动议程',
    pageTitleEn: 'Conference Agenda',
    collapseAll: '收起全部',
    expandAll: '展开全部',
    noAgendaData: '暂无议程数据',
    footer: '© 2025 强智科技 · Crafted with precision'
  },

  // ── AI 助手 ──
  aiAssistant: {
    pageTitle: 'AI 会议助手',
    subtitle: '智能问答 · 随时在线',
    welcomeMessage:
      '你好！我是会议助手，可以帮你解答关于活动报名、日程安排、酒店交通等问题。有什么我可以帮助你的吗？',
    quickQ1: '如何报名活动？',
    quickQ2: '怎么签到？',
    quickQ3: '酒店信息在哪看？',
    quickQ4: '如何获得徽章？',
    inputPlaceholder: '输入你的问题...',
    comingSoon: 'AI助手即将接入大模型，敬请期待',
    answerSignup:
      '报名流程很简单：\n1. 在首页或活动列表找到感兴趣的活动\n2. 点击进入活动详情\n3. 点击"立即报名"按钮\n4. 填写个人信息、缴费信息、住宿和交通信息\n5. 提交即可完成报名',
    answerCheckin:
      '签到方式：\n1. 活动当天，进入"我的"页面\n2. 找到已报名的活动\n3. 点击"去签到"按钮\n4. 扫描现场二维码或由工作人员核验',
    answerHotel:
      '酒店信息可以在活动详情页的"酒店信息"标签中查看，包括：\n• 推荐酒店列表\n• 房型和价格\n• 位置地图\n• 交通指南\n• 当地天气',
    answerPayment:
      '缴费说明：\n1. 在报名表单的"缴费信息"步骤\n2. 扫描二维码完成支付\n3. 上传缴费截图\n4. 填写发票抬头信息（如需要）',
    answerBadge:
      '徽章系统包含四个系列：\n• 启程成就：首次报名、成功入选等\n• 互动成就：首次评论、金句制造机等\n• 荣誉成就：徽章收藏家、活动之星等\n• 隐藏彩蛋：闪电报名王、午夜打卡者等\n\n完成特定条件即可解锁对应徽章！',
    answerDefault:
      '感谢你的提问！这个功能即将上线，届时我将接入智能大模型，为你提供更专业的解答。\n\n目前你可以：\n• 浏览活动列表了解最新活动\n• 查看活动详情获取完整信息\n• 在"我的"页面管理报名记录'
  },

  // ── 徽章墙 ──
  badgeWall: {
    wallTitle: '徽章墙',
    totalAchievements: '累积成就',
    countSuffix: '/{{total}}枚',
    surpass: '超越',
    users: '用户',
    unit: '枚'
  },

  // ── 个人中心 ──
  profile: {
    defaultBio: '这个用户很懒，还没填写个人简介',
    companionFallback: '同行人员{{index}}',
    unnamedActivity: '未命名活动',
    exitConfirmTitle: '确认退出',
    exitConfirmContent: '确定要退出登录吗？',
    activityNotExist: '活动信息不存在',
    cancelConfirmTitle: '确认取消',
    cancelConfirmContent: '确定要取消报名吗？',
    cancelledSignup: '已取消报名',
    cancelSignupFailed: '取消报名失败',
    checkinNotExist: '签到信息不存在',
    credentialNotExist: '凭证信息不存在',
    linkCopied: '链接已复制',
    shareFailed: '分享失败',
    earned: ' 获得',
    // 活动 Tab
    likes: '点赞',
    comments: '评论',
    favorites: '收藏',
    shares: '分享',
    statusRegistered: '已报名',
    statusPending: '待审核',
    statusRejected: '已驳回',
    statusCheckedIn: '已签到',
    statusNotCheckedIn: '未签到',
    statusPendingCheckin: '待签到',
    statusPaid: '已缴费',
    statusUnpaid: '待缴费',
    viewCredential: '查看参会凭证',
    goPay: '去缴费',
    goCheckin: '去签到',
    completeTransport: '完善交通信息',
    editSignup: '修改报名信息',
    cancelSignup: '取消报名',
    addCompanion: '添加同行人员',
    primaryRegistrant: '主报名人',
    // 通知 Tab
    tabSystemNotice: '系统通知',
    tabMentions: '@ 我的',
    tabMyComments: '我的评论',
    clearNotice: '清空消息提醒',
    clearNoticeConfirm: '确定要清空全部消息提醒吗？',
    cleared: '已清空',
    allRead: '已全部标为已读',
    deleteComment: '删除评论',
    deleteCommentConfirm: '确定要删除这条评论吗？',
    deletedCount: '已删除 {{count}} 条',
    shareSuccess: '分享成功',
    deleteFailed: '删除失败',
    noNotifications: '暂无通知',
    noMentions: '暂无@我的消息',
    noComments: '暂无评论',
    // 徽章 Tab
    badgeStart: '启程成就',
    badgeInteract: '互动成就',
    badgeHonor: '荣誉成就',
    badgeHidden: '隐藏彩蛋',
    newlyEarned: '新获得',
    badgeHiddenHint: '隐藏成就等待发现',
    badgeUnlockPrompt: '期待您的解锁'
  },

  // ── 编辑个人资料 ──
  profileEdit: {
    name: '姓名',
    school: '学校',
    department: '学院/部门',
    phone: '手机号码',
    email: '电子邮箱',
    namePlaceholder: '请输入姓名',
    schoolPlaceholder: '请输入学校',
    departmentPlaceholder: '请输入学院或部门',
    phonePlaceholder: '请输入手机号码',
    emailPlaceholder: '请输入电子邮箱',
    avatarUpdated: '头像已更新',
    avatarFailed: '头像更新失败',
    enterName: '请输入姓名',
    saveSuccess: '保存成功',
    saveFailed: '保存失败',
    useWechatAvatar: '用微信头像',
    fromAlbum: '从相册选择',
    takePhoto: '拍照',
    saveSettings: '保存设置'
  },

  // ── 设置 ──
  settings: {
    sectionProfile: '个人资料',
    sectionInterface: '界面与显示',
    sectionAbout: '关于',
    personalInfo: '个人简介',
    myPayments: '我的缴费',
    myInvoiceHeaders: '我的发票抬头',
    language: '多语言',
    darkMode: '暗黑模式',
    privacy: '隐私与政策',
    support: '支持与帮助'
  },

  // ── 暗黑模式 ──
  darkModeSettings: {
    pageTitle: '暗黑模式',
    followSystem: '跟随系统',
    followSystemHint: '开启后，将跟随系统打开或关闭暗黑模式',
    manualSelect: '手动选择',
    lightMode: '普通模式',
    darkMode: '暗黑模式'
  },

  // ── 多语言 ──
  languageSettings: {
    pageTitle: '多语言',
    currentLang: '当前语言',
    zhCN: '简体中文',
    en: 'English',
    switchSuccess: '语言切换成功'
  },

  // ── 我的缴费 ──
  payments: {
    allTypes: '全部类型',
    forum: '论坛',
    summit: '峰会',
    seminar: '研讨会',
    training: '培训',
    defaultSort: '默认排序',
    amountAsc: '金额从低到高',
    amountDesc: '金额从高到低',
    allTime: '全部',
    last7Days: '最近7天',
    lastMonth: '最近一个月',
    lastYear: '最近一年',
    sort: '排列',
    type: '类型',
    time: '时间',
    viewDetail: '查看详情',
    paid: '已缴费',
    unpaid: '待缴费',
    noRecords: '暂无缴费记录',
    detailInfo: '信息',
    payer: '缴费人',
    payTime: '缴费时间',
    amount: '金额',
    fee: '费用',
    orderNo: '订单号',
    transactionNo: '交易流水号',
    payScreenshot: '缴费截图',
    payReceipt: '缴费凭证',
    confirmDeleteTitle: '确认删除',
    confirmDeleteContent: '确定要删除此缴费记录吗？'
  },

  // ── 我的发票抬头 ──
  invoiceHeaders: {
    addTitle: '添加发票抬头',
    editTitle: '编辑发票抬头',
    personal: '个人',
    company: '单位',
    nameLabel: '名称',
    taxNo: '税号',
    companyAddress: '单位地址',
    phoneLabel: '电话',
    bankName: '开户银行',
    bankAccount: '银行账号',
    namePlaceholderPersonal: '姓名（必填）',
    namePlaceholderCompany: '单位名称（必填）',
    taxNoPlaceholder: '纳税人识别号',
    addressPlaceholder: '单位地址（选填）',
    phonePlaceholder: '电话（选填）',
    bankNamePlaceholder: '开户银行（选填）',
    bankAccountPlaceholder: '银行账号（选填）',
    deleteConfirmTitle: '删除发票抬头',
    deleteConfirmContent: '确定要删除该发票抬头吗？',
    enterNameHint: '请输入名称',
    addSuccess: '添加成功',
    saveSuccess: '保存成功',
    noHeaders: '暂无发票抬头'
  },

  // ── 评论 ──
  comments: {
    selectRating: '请选择评分',
    ratingFailed: '评分失败',
    ratingSuccess: '评分成功',
    modifySuccess: '修改成功',
    cancelledRating: '已取消评分',
    enterComment: '请输入评论内容',
    commentSuccess: '评论成功',
    commentFailed: '评论失败',
    commentFailedRetry: '评论失败，请重试',
    deleteSuccess: '删除成功',
    modifyFailed: '修改失败',
    enterContent: '请输入内容',
    ratingDialogTitle: '点击星星评分',
    deleteConfirm: '确定要删除这条评论吗？',
    deleteConfirmTitle: '确认删除',
    cancelRating: '取消评分',
    commentAsIdentity: '将以下面的身份进行评论',
    editComment: '编辑评论',
    addCommentPlaceholder: '添加评论......',
    replyPlaceholder: '@{{name}} 回复...',
    editPlaceholder: '编辑内容...',
    addReplyPlaceholder: '添加回复...',
    replyToPlaceholder: '回复 @{{name}}...',
    alreadyRated: '您已经评分过了',
    starRating: '星级评分',
    rating: '评分',
    myRating: '我的评分',
    comment: '评论',
    hottest: '最热门',
    byTime: '按时间',
    latest: '最新',
    notRated: '暂未评分',
    ratingCount: '{{count}} 人评价',
    starCount: '{{count}}星',
    replyCount: '{{count}}条回复',
    confirmDeleteReply: '确认删除此评论？',
    deleteFailedRetry: '删除失败，请重试',
    editMode: '编辑模式',
    hideReplies: '隐藏回复',
    showReplies: '显示{{count}}条回复',
    replySuccess: '回复成功',
    replyPanelTitle: '回复'
  },

  // ── 时间格式 ──
  time: {
    daysAgo: '{{days}}天前',
    hoursAgo: '{{hours}}小时前',
    minutesAgo: '{{minutes}}分钟前',
    justNow: '刚刚'
  }
}

export default zhCN
