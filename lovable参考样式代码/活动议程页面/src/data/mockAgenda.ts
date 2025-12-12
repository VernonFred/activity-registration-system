import { ConferenceData } from '@/types/agenda';

export const conferenceData: ConferenceData = {
  title: "2024 全球人工智能大会",
  days: [
    {
      id: "day1",
      date: "2024-03-15",
      displayText: "3月15日 · 周五",
      groups: [
        {
          id: "g1-1",
          title: "开幕仪式",
          timeStart: "09:00",
          timeEnd: "10:30",
          moderator: { name: "李明远", title: "大会组委会主席" },
          items: [
            {
              id: "i1-1-1",
              timeStart: "09:00",
              timeEnd: "09:20",
              type: "speech",
              title: "开幕致辞：AI 时代的机遇与挑战",
              speaker: { name: "张华", title: "科技部副部长", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=zhang" },
              location: "主会场 A厅"
            },
            {
              id: "i1-1-2",
              timeStart: "09:20",
              timeEnd: "09:50",
              type: "speech",
              title: "人工智能发展报告发布",
              speaker: { name: "王芳", title: "中国科学院院士", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=wang" },
              location: "主会场 A厅"
            },
            {
              id: "i1-1-3",
              timeStart: "09:50",
              timeEnd: "10:30",
              type: "activity",
              title: "开幕式启动仪式",
              location: "主会场 A厅"
            }
          ]
        },
        {
          id: "g1-2",
          title: "主旨报告",
          timeStart: "10:45",
          timeEnd: "12:30",
          moderator: { name: "陈思远", title: "清华大学教授" },
          items: [
            {
              id: "i1-2-1",
              timeStart: "10:45",
              timeEnd: "10:50",
              type: "break",
              title: "☕ 茶歇"
            },
            {
              id: "i1-2-2",
              timeStart: "10:50",
              timeEnd: "11:30",
              type: "speech",
              title: "大语言模型的未来发展方向",
              speaker: { name: "刘伟", title: "OpenAI 首席科学家", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=liu" },
              location: "主会场 A厅"
            },
            {
              id: "i1-2-3",
              timeStart: "11:30",
              timeEnd: "12:10",
              type: "speech",
              title: "AI 在医疗健康领域的革命性应用",
              speaker: { name: "孙丽", title: "北京协和医院主任医师", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=sun" },
              location: "主会场 A厅"
            },
            {
              id: "i1-2-4",
              timeStart: "12:10",
              timeEnd: "12:30",
              type: "discussion",
              title: "圆桌讨论：AI 伦理与安全",
              speaker: { name: "多位专家", title: "圆桌嘉宾" },
              location: "主会场 A厅"
            }
          ]
        },
        {
          id: "g1-3",
          title: "午餐休息",
          timeStart: "12:30",
          timeEnd: "14:00",
          items: [
            {
              id: "i1-3-1",
              timeStart: "12:30",
              timeEnd: "14:00",
              type: "break",
              title: "🍽️ 午餐 & 展区参观"
            }
          ]
        },
        {
          id: "g1-4",
          title: "专题论坛：大模型技术",
          timeStart: "14:00",
          timeEnd: "17:30",
          moderator: { name: "赵强", title: "百度研究院院长" },
          items: [
            {
              id: "i1-4-1",
              timeStart: "14:00",
              timeEnd: "14:40",
              type: "speech",
              title: "多模态大模型的技术突破",
              speaker: { name: "周明", title: "微软亚洲研究院副院长", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=zhou" },
              location: "分会场 B厅"
            },
            {
              id: "i1-4-2",
              timeStart: "14:40",
              timeEnd: "15:20",
              type: "speech",
              title: "大模型训练优化实践",
              speaker: { name: "吴恩达", title: "斯坦福大学教授", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=wu" },
              location: "分会场 B厅"
            },
            {
              id: "i1-4-3",
              timeStart: "15:20",
              timeEnd: "15:40",
              type: "break",
              title: "☕ 茶歇"
            },
            {
              id: "i1-4-4",
              timeStart: "15:40",
              timeEnd: "16:20",
              type: "speech",
              title: "国产大模型的发展之路",
              speaker: { name: "黄铁军", title: "北京大学教授", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=huang" },
              location: "分会场 B厅"
            },
            {
              id: "i1-4-5",
              timeStart: "16:20",
              timeEnd: "17:30",
              type: "discussion",
              title: "Panel 讨论：大模型商业化路径",
              speaker: { name: "产业专家团", title: "多位行业领袖" },
              location: "分会场 B厅"
            }
          ]
        }
      ]
    },
    {
      id: "day2",
      date: "2024-03-16",
      displayText: "3月16日 · 周六",
      groups: [
        {
          id: "g2-1",
          title: "专题论坛：AI + 教育",
          timeStart: "09:00",
          timeEnd: "12:00",
          moderator: { name: "林小红", title: "教育部信息化专家" },
          items: [
            {
              id: "i2-1-1",
              timeStart: "09:00",
              timeEnd: "09:40",
              type: "speech",
              title: "AI 如何重塑教育生态",
              speaker: { name: "郑国强", title: "新东方 CTO", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=zheng" },
              location: "分会场 C厅"
            },
            {
              id: "i2-1-2",
              timeStart: "09:40",
              timeEnd: "10:20",
              type: "speech",
              title: "个性化学习的智能解决方案",
              speaker: { name: "马云飞", title: "作业帮 CEO", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=ma" },
              location: "分会场 C厅"
            },
            {
              id: "i2-1-3",
              timeStart: "10:20",
              timeEnd: "10:40",
              type: "break",
              title: "☕ 茶歇"
            },
            {
              id: "i2-1-4",
              timeStart: "10:40",
              timeEnd: "11:20",
              type: "speech",
              title: "AI 辅助教学的实践案例",
              speaker: { name: "杨柳", title: "北师大附中校长", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=yang" },
              location: "分会场 C厅"
            },
            {
              id: "i2-1-5",
              timeStart: "11:20",
              timeEnd: "12:00",
              type: "discussion",
              title: "对话：教育公平与 AI 技术",
              speaker: { name: "教育界专家", title: "圆桌嘉宾" },
              location: "分会场 C厅"
            }
          ]
        },
        {
          id: "g2-2",
          title: "专题论坛：AI + 金融",
          timeStart: "09:00",
          timeEnd: "12:00",
          moderator: { name: "钱进", title: "蚂蚁集团首席架构师" },
          items: [
            {
              id: "i2-2-1",
              timeStart: "09:00",
              timeEnd: "09:40",
              type: "speech",
              title: "智能风控体系建设",
              speaker: { name: "李建华", title: "工商银行科技部总经理", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=lijh" },
              location: "分会场 D厅"
            },
            {
              id: "i2-2-2",
              timeStart: "09:40",
              timeEnd: "10:20",
              type: "speech",
              title: "大模型在金融场景的应用",
              speaker: { name: "陈婷", title: "招商银行 AI Lab 负责人", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=chent" },
              location: "分会场 D厅"
            },
            {
              id: "i2-2-3",
              timeStart: "10:20",
              timeEnd: "10:40",
              type: "break",
              title: "☕ 茶歇"
            },
            {
              id: "i2-2-4",
              timeStart: "10:40",
              timeEnd: "11:20",
              type: "speech",
              title: "量化投资的 AI 革命",
              speaker: { name: "徐磊", title: "幻方量化创始人", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=xul" },
              location: "分会场 D厅"
            },
            {
              id: "i2-2-5",
              timeStart: "11:20",
              timeEnd: "12:00",
              type: "discussion",
              title: "圆桌：金融科技的下一个十年",
              speaker: { name: "金融科技专家", title: "圆桌嘉宾" },
              location: "分会场 D厅"
            }
          ]
        },
        {
          id: "g2-3",
          title: "午餐休息",
          timeStart: "12:00",
          timeEnd: "14:00",
          items: [
            {
              id: "i2-3-1",
              timeStart: "12:00",
              timeEnd: "14:00",
              type: "break",
              title: "🍽️ 午餐 & 社交活动"
            }
          ]
        },
        {
          id: "g2-4",
          title: "闭幕式",
          timeStart: "16:00",
          timeEnd: "17:30",
          moderator: { name: "李明远", title: "大会组委会主席" },
          items: [
            {
              id: "i2-4-1",
              timeStart: "16:00",
              timeEnd: "16:30",
              type: "speech",
              title: "大会总结与展望",
              speaker: { name: "张华", title: "科技部副部长", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=zhang" },
              location: "主会场 A厅"
            },
            {
              id: "i2-4-2",
              timeStart: "16:30",
              timeEnd: "17:00",
              type: "activity",
              title: "优秀论文颁奖典礼",
              location: "主会场 A厅"
            },
            {
              id: "i2-4-3",
              timeStart: "17:00",
              timeEnd: "17:30",
              type: "activity",
              title: "闭幕式 & 合影留念",
              location: "主会场 A厅"
            }
          ]
        }
      ]
    },
    {
      id: "day3",
      date: "2024-03-17",
      displayText: "3月17日 · 周日",
      groups: [
        {
          id: "g3-1",
          title: "工作坊：Prompt 工程实战",
          timeStart: "09:00",
          timeEnd: "12:00",
          moderator: { name: "何小鹏", title: "Prompt 工程专家" },
          items: [
            {
              id: "i3-1-1",
              timeStart: "09:00",
              timeEnd: "10:30",
              type: "activity",
              title: "Prompt 设计原理与技巧",
              speaker: { name: "何小鹏", title: "Prompt 工程专家", avatar: "https://api.dicebear.com/7.x/personas/svg?seed=hexb" },
              location: "工作坊教室 1"
            },
            {
              id: "i3-1-2",
              timeStart: "10:30",
              timeEnd: "10:45",
              type: "break",
              title: "☕ 茶歇"
            },
            {
              id: "i3-1-3",
              timeStart: "10:45",
              timeEnd: "12:00",
              type: "activity",
              title: "动手实践：构建智能助手",
              speaker: { name: "助教团队", title: "技术导师" },
              location: "工作坊教室 1"
            }
          ]
        },
        {
          id: "g3-2",
          title: "参观交流",
          timeStart: "14:00",
          timeEnd: "17:00",
          items: [
            {
              id: "i3-2-1",
              timeStart: "14:00",
              timeEnd: "17:00",
              type: "activity",
              title: "🏢 参观合作企业 AI 实验室",
              location: "百度/阿里/腾讯 AI Lab"
            }
          ]
        }
      ]
    }
  ]
};
