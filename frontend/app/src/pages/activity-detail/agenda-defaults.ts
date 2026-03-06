// 默认议程数据（分组结构 - 参考纸质版会议手册）
export const DEFAULT_AGENDA = [
  {
    id: 1,
    title: '开幕仪式',
    time_start: '09:00',
    time_end: '09:30',
    moderator: {
      name: '张志东',
      title: '职业技术教育分会副理事长\n山东商业职业技术学院党委书记，教授',
    },
    items: [
      {
        id: 11,
        time_start: '09:00',
        time_end: '09:10',
        type: 'speech' as const,
        title: '致辞',
        speaker: {
          name: '李 炯',
          title: '长沙民政职业技术学院党委书记，教授',
        },
      },
      {
        id: 12,
        time_start: '09:10',
        time_end: '09:20',
        type: 'speech' as const,
        title: '讲话',
        speaker: {
          name: '王仁祥',
          title: '湖南省教育厅副厅长',
        },
      },
      {
        id: 13,
        time_start: '09:20',
        time_end: '09:30',
        type: 'speech' as const,
        title: '讲话',
        speaker: {
          name: '周建松',
          title: '中国高等教育学会职业技术教育分会理事长，教授',
        },
      },
    ],
  },
  {
    id: 2,
    title: '主旨报告',
    moderator: {
      name: '刘建湘',
      title: '职业技术教育分会副理事长\n湖南工业职业技术学院党委书记，教授',
    },
    items: [
      {
        id: 21,
        time_start: '09:30',
        time_end: '10:00',
        type: 'speech' as const,
        title: '以智慧平台支撑行业产教融合共同体走深走实',
        speaker: {
          name: '潘海生',
          title: '天津大学教育学院教授\n国家职业教育产教融合智库主任',
        },
        location: '主会场',
      },
      {
        id: 22,
        time_start: '10:00',
        time_end: '10:30',
        type: 'speech' as const,
        title: '推进高职院校高水平建设高质量发展',
        speaker: {
          name: '丁金昌',
          title: '中国职业技术教育学会副会长，二级教授',
        },
        location: '主会场',
      },
      {
        id: 23,
        time_start: '10:30',
        time_end: '10:45',
        type: 'break' as const,
        title: '茶歇',
      },
    ],
  },
  {
    id: 3,
    title: '职业教育高质量发展',
    moderator: {
      name: '陈静彬',
      title: '长沙民政职业技术学院党委副书记、校长',
    },
    items: [
      {
        id: 31,
        time_start: '10:45',
        time_end: '11:30',
        type: 'speech' as const,
        title: '职业教育教学成果奖培育与凝练',
        speaker: {
          name: '马晓明',
          title: '深圳职业技术大学原副校长\n职业教育国家教学成果奖特等奖主持人，教授',
        },
      },
      {
        id: 32,
        time_start: '11:30',
        time_end: '12:00',
        type: 'speech' as const,
        title: '数据为基 应用为王——数据赋能职业教育教学数字化转型',
        speaker: {
          name: '何勇波',
          title: '湖南强智科技发展有限公司总经理',
        },
      },
    ],
  },
]
