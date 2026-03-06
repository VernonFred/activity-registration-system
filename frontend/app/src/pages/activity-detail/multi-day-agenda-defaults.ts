// 多天会议Mock数据（用于测试多天分页功能）
const DEFAULT_MULTI_DAY_AGENDA = [
  {
    id: 1,
    date: '2025-11-12',
    display_date: '2025年11月12日（第一天）',
    groups: [
      {
        id: 11,
        title: '开幕仪式',
        time_start: '09:00',
        time_end: '09:30',
        moderator: {
          name: '张志东',
          title: '职业技术教育分会副理事长\n山东商业职业技术学院党委书记，教授',
        },
        items: [
          {
            id: 111,
            time_start: '09:00',
            time_end: '09:10',
            type: 'speech' as const,
            title: '致辞',
            speaker: {
              name: '李 炯',
              title: '长沙民政职业技术学院党委书记，教授',
            },
            location: '主会场',
          },
          {
            id: 112,
            time_start: '09:10',
            time_end: '09:20',
            type: 'speech' as const,
            title: '讲话',
            speaker: {
              name: '王仁祥',
              title: '湖南省教育厅副厅长',
            },
            location: '主会场',
          },
        ],
      },
      {
        id: 12,
        title: '主旨报告',
        time_start: '09:30',
        time_end: '11:30',
        moderator: {
          name: '刘建湘',
          title: '职业技术教育分会副理事长\n湖南工业职业技术学院党委书记，教授',
        },
        items: [
          {
            id: 121,
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
            id: 122,
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
            id: 123,
            time_start: '10:30',
            time_end: '10:45',
            type: 'break' as const,
            title: '茶歇',
          },
          {
            id: 124,
            time_start: '10:45',
            time_end: '11:30',
            type: 'speech' as const,
            title: '职业教育教学成果奖培育与凝练',
            speaker: {
              name: '马晓明',
              title: '深圳职业技术大学原副校长\n职业教育国家教学成果奖特等奖主持人，教授',
            },
            location: '主会场',
          },
        ],
      },
    ],
  },
  {
    id: 2,
    date: '2025-11-13',
    display_date: '2025年11月13日（第二天）',
    groups: [
      {
        id: 21,
        title: '专题论坛一：产教融合',
        time_start: '09:00',
        time_end: '11:30',
        moderator: {
          name: '陈静彬',
          title: '长沙民政职业技术学院党委副书记、校长',
        },
        items: [
          {
            id: 211,
            time_start: '09:00',
            time_end: '09:45',
            type: 'speech' as const,
            title: '产教融合的实践与探索',
            speaker: {
              name: '李明',
              title: '教育部职业教育与成人教育司司长',
            },
            location: '分会场A',
          },
          {
            id: 212,
            time_start: '09:45',
            time_end: '10:30',
            type: 'discussion' as const,
            title: '圆桌讨论：产教融合路径创新',
            speaker: {
              name: '多位专家',
              title: '行业企业代表',
            },
            location: '分会场A',
          },
          {
            id: 213,
            time_start: '10:30',
            time_end: '10:45',
            type: 'break' as const,
            title: '茶歇',
          },
          {
            id: 214,
            time_start: '10:45',
            time_end: '11:30',
            type: 'speech' as const,
            title: '校企合作案例分享',
            speaker: {
              name: '王芳',
              title: '浙江工商职业技术学院副院长',
            },
            location: '分会场A',
          },
        ],
      },
      {
        id: 22,
        title: '专题论坛二：数字化转型',
        time_start: '14:00',
        time_end: '17:00',
        moderator: {
          name: '何勇波',
          title: '湖南强智科技发展有限公司总经理',
        },
        items: [
          {
            id: 221,
            time_start: '14:00',
            time_end: '14:45',
            type: 'speech' as const,
            title: '数据赋能职业教育教学数字化转型',
            speaker: {
              name: '何勇波',
              title: '湖南强智科技发展有限公司总经理',
            },
            location: '分会场B',
          },
          {
            id: 222,
            time_start: '14:45',
            time_end: '15:30',
            type: 'speech' as const,
            title: '智慧校园建设实践',
            speaker: {
              name: '张伟',
              title: '深圳信息职业技术学院信息中心主任',
            },
            location: '分会场B',
          },
          {
            id: 223,
            time_start: '15:30',
            time_end: '15:45',
            type: 'break' as const,
            title: '茶歇',
          },
          {
            id: 224,
            time_start: '15:45',
            time_end: '17:00',
            type: 'activity' as const,
            title: '数字化教学工具体验',
            speaker: {
              name: '技术团队',
              title: '强智科技',
            },
            location: '体验区',
          },
        ],
      },
    ],
  },
  {
    id: 3,
    date: '2025-11-14',
    display_date: '2025年11月14日（第三天）',
    groups: [
      {
        id: 31,
        title: '闭幕式',
        time_start: '09:00',
        time_end: '10:00',
        moderator: {
          name: '张志东',
          title: '职业技术教育分会副理事长',
        },
        items: [
          {
            id: 311,
            time_start: '09:00',
            time_end: '09:30',
            type: 'speech' as const,
            title: '会议总结',
            speaker: {
              name: '周建松',
              title: '中国高等教育学会职业技术教育分会理事长，教授',
            },
            location: '主会场',
          },
          {
            id: 312,
            time_start: '09:30',
            time_end: '10:00',
            type: 'speech' as const,
            title: '致闭幕辞',
            speaker: {
              name: '李 炯',
              title: '长沙民政职业技术学院党委书记，教授',
            },
            location: '主会场',
          },
        ],
      },
    ],
  },
]
