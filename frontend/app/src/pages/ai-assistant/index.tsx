import { useState, useRef, useEffect } from 'react'
import { View, Text, Input, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTranslation } from 'react-i18next'
import './index.scss'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const AIAssistantPage = () => {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: t('aiAssistant.welcomeMessage'),
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
        '报名': t('aiAssistant.answerSignup'),
        '签到': t('aiAssistant.answerCheckin'),
        '酒店': t('aiAssistant.answerHotel'),
        '缴费': t('aiAssistant.answerPayment'),
        '徽章': t('aiAssistant.answerBadge')
      }

      let response = t('aiAssistant.answerDefault')

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
    t('aiAssistant.quickQ1'),
    t('aiAssistant.quickQ2'),
    t('aiAssistant.quickQ3'),
    t('aiAssistant.quickQ4')
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
          <Text className="title">{t('aiAssistant.pageTitle')}</Text>
          <Text className="subtitle">{t('aiAssistant.subtitle')}</Text>
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
            placeholder={t('aiAssistant.inputPlaceholder')}
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
        <Text className="input-hint">{t('aiAssistant.comingSoon')}</Text>
      </View>
    </View>
  )
}

export default AIAssistantPage
