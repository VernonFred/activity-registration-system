import { useState, useRef, useEffect } from 'react'
import { View, Text, Input, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const AIAssistantPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是会议助手，可以帮你解答关于活动报名、日程安排、酒店交通等问题。有什么我可以帮助你的吗？',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // 模拟AI回复（后续接入真实API）
  const simulateAIResponse = (userMessage: string) => {
    setIsTyping(true)
    
    setTimeout(() => {
      const responses: Record<string, string> = {
        '报名': '报名流程很简单：\n1. 在首页或活动列表找到感兴趣的活动\n2. 点击进入活动详情\n3. 点击"立即报名"按钮\n4. 填写个人信息、缴费信息、住宿和交通信息\n5. 提交即可完成报名',
        '签到': '签到方式：\n1. 活动当天，进入"我的"页面\n2. 找到已报名的活动\n3. 点击"去签到"按钮\n4. 扫描现场二维码或由工作人员核验',
        '酒店': '酒店信息可以在活动详情页的"酒店信息"标签中查看，包括：\n• 推荐酒店列表\n• 房型和价格\n• 位置地图\n• 交通指南\n• 当地天气',
        '缴费': '缴费说明：\n1. 在报名表单的"缴费信息"步骤\n2. 扫描二维码完成支付\n3. 上传缴费截图\n4. 填写发票抬头信息（如需要）',
        '徽章': '徽章系统包含四个系列：\n• 启程成就：首次报名、成功入选等\n• 互动成就：首次评论、金句制造机等\n• 荣誉成就：徽章收藏家、活动之星等\n• 隐藏彩蛋：闪电报名王、午夜打卡者等\n\n完成特定条件即可解锁对应徽章！'
      }

      let response = '感谢你的提问！这个功能即将上线，届时我将接入智能大模型，为你提供更专业的解答。\n\n目前你可以：\n• 浏览活动列表了解最新活动\n• 查看活动详情获取完整信息\n• 在"我的"页面管理报名记录'

      for (const [keyword, reply] of Object.entries(responses)) {
        if (userMessage.includes(keyword)) {
          response = reply
          break
        }
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, newMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const handleSend = () => {
    if (!inputValue.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    
    simulateAIResponse(inputValue.trim())
  }

  const quickQuestions = [
    '如何报名活动？',
    '怎么签到？',
    '酒店信息在哪看？',
    '如何获得徽章？'
  ]

  const handleQuickQuestion = (question: string) => {
    setInputValue(question)
  }

  return (
    <View className="ai-assistant-page">
      {/* 头部信息区 - 不包含返回按钮，使用系统自带的 */}
      <View className="header-info">
        <View className="avatar-wrapper">
          <View className="avatar">
            <Text className="avatar-icon">🤖</Text>
          </View>
          <View className="status-dot" />
        </View>
        <View className="info-text">
          <Text className="title">AI 会议助手</Text>
          <Text className="subtitle">智能问答 · 随时在线</Text>
        </View>
      </View>

      {/* 消息列表 */}
      <ScrollView 
        className="message-list" 
        scrollY 
        scrollWithAnimation
        scrollIntoView={`msg-${messages[messages.length - 1]?.id}`}
      >
        {messages.map((msg) => (
          <View 
            key={msg.id} 
            id={`msg-${msg.id}`}
            className={`message-item ${msg.role}`}
          >
            {msg.role === 'assistant' && (
              <View className="message-avatar">
                <Text>🤖</Text>
              </View>
            )}
            <View className={`message-bubble ${msg.role}`}>
              <Text className="message-content">{msg.content}</Text>
            </View>
            {msg.role === 'user' && (
              <View className="message-avatar user">
                <Text>👤</Text>
              </View>
            )}
          </View>
        ))}
        
        {isTyping && (
          <View className="message-item assistant">
            <View className="message-avatar">
              <Text>🤖</Text>
            </View>
            <View className="message-bubble assistant typing">
              <View className="typing-indicator">
                <View className="dot" />
                <View className="dot" />
                <View className="dot" />
              </View>
            </View>
          </View>
        )}
        
        {/* 底部占位 */}
        <View style={{ height: '200rpx' }} />
      </ScrollView>

      {/* 快捷问题 */}
      <View className="quick-questions">
        <ScrollView scrollX className="quick-scroll" showScrollbar={false}>
          {quickQuestions.map((q, i) => (
            <View 
              key={i} 
              className="quick-item"
              onClick={() => handleQuickQuestion(q)}
            >
              <Text>{q}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 输入区域 */}
      <View className="input-area">
        <View className="input-wrapper">
          <Input
            className="input"
            placeholder="输入你的问题..."
            placeholderClass="input-placeholder"
            value={inputValue}
            onInput={(e) => setInputValue(e.detail.value)}
            onConfirm={handleSend}
            confirmType="send"
          />
          <View 
            className={`send-btn ${inputValue.trim() ? 'active' : ''}`}
            onClick={handleSend}
          >
            <Text className="send-icon">➤</Text>
          </View>
        </View>
        <Text className="input-hint">AI助手即将接入大模型，敬请期待</Text>
      </View>
    </View>
  )
}

export default AIAssistantPage
