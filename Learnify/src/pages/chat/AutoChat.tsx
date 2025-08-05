import React, { useState, useRef, useEffect } from 'react'
import { chatAPI } from '../../utils/chatApi'
import type { ChatMessage } from '../../utils/chatApi'
import styles from './AutoChat.module.css'

export default function AutoChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [inputError, setInputError] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [sessionId, setSessionId] = useState<string>(() => {
    return sessionStorage.getItem('sessionId') || ''
  })
  const [userId] = useState<string>(()=>{
    return localStorage.getItem('userId') || ''
  }) // 使用固定用户ID
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 初始化聊天会话
  useEffect(() => {
    const initializeChat = async () => {
      try {
        console.log('初始化聊天，sessionId:', sessionId)
        console.log('useId',localStorage.getItem('userId'))
        
        if (sessionId && sessionId !== '') {
          // 使用保存的会话ID
          console.log('使用现有会话:', sessionId)
          console.log('用户ID:', userId)
          
          try {
            const historyResponse = await chatAPI.getChatHistory(sessionId, userId, 1, 10)
            console.log('历史记录响应:', historyResponse)
            console.log('历史记录数据:', historyResponse.data)
            console.log('消息数组:', historyResponse.data.messages)
            
            if (historyResponse.data.messages && historyResponse.data.messages.length > 0) {
              console.log('设置历史消息到状态:', historyResponse.data.messages)
              setMessages(historyResponse.data.messages)
              setHasMore(historyResponse.data.hasMore)
              setCurrentPage(historyResponse.data.currentPage)
            } else {
              // 历史记录为空，添加欢迎消息
              console.log('历史记录为空，添加欢迎消息')
              const welcomeMessage: ChatMessage = {
                content: '您好！我是智能客服小助手，有什么可以帮助您的吗？',
                isUser: false,
                timestamp: new Date(),
                sessionId: sessionId
              }
              setMessages([welcomeMessage])
            }
          } catch (historyError) {
            console.error('获取历史记录失败:', historyError)
            // 如果获取历史记录失败，添加欢迎消息
            const welcomeMessage: ChatMessage = {
              content: '您好！我是智能客服小助手，有什么可以帮助您的吗？',
              isUser: false,
              timestamp: new Date(),
              sessionId: sessionId
            }
            setMessages([welcomeMessage])
          }
        } else {
          // 没有现有会话，创建新会话
          console.log('创建新会话')
          const sessionResponse = await chatAPI.createSession(userId)
          const newSessionId = sessionResponse.data.sessionId
          setSessionId(newSessionId)
          sessionStorage.setItem('sessionId', newSessionId)
          
          // 添加欢迎消息
          const welcomeMessage: ChatMessage = {
            content: '您好！我是智能客服小助手，有什么可以帮助您的吗？',
            isUser: false,
            timestamp: new Date(),
            sessionId: newSessionId
          }
          setMessages([welcomeMessage])
        }
      } catch (error) {
        console.error('初始化聊天失败:', error)
        // 添加错误消息
        const errorMessage: ChatMessage = {
          content: '抱歉，连接服务器失败，请稍后重试。',
          isUser: false,
          timestamp: new Date(),
          sessionId: 'error'
        }
        setMessages([errorMessage])
      }
    }

    initializeChat()
  }, [userId]) // 移除 sessionId 依赖

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !sessionId) return

    // 清除之前的错误提示
    setInputError('')

    const messageToSend = inputValue // 保存当前输入值
    setInputValue('') // 立即清空输入框
    setIsTyping(true) // 显示正在输入指示器

    try {
      // 发送消息到服务器进行内容审核和AI回复
      const response = await chatAPI.sendMessage({
        sessionId: sessionId,
        userId: userId,
        message: messageToSend // 使用保存的输入值
      })

      // 检查是否审核失败
      if (!response.success) {
        // 如果后端返回失败（如内容不安全）
        setInputError(response.message || '消息包含不当内容，请文明发言')
        // 不添加用户消息到聊天历史
        return // 停止进一步处理
      }

      // 只有在API调用成功（内容安全）时才添加用户消息到状态
      const userMessage: ChatMessage = {
        content: messageToSend,
        isUser: true,
        timestamp: new Date(),
        sessionId: sessionId
      }
      setMessages(prev => [...prev, userMessage])

      // 如果成功且有AI回复，添加AI回复
      if (response.data?.aiMessage) {
        setMessages(prev => [...prev, response.data!.aiMessage])
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      // 如果API调用本身失败，添加通用错误消息到聊天
      const errorMessage: ChatMessage = {
        content: '抱歉，发送消息失败，请稍后重试。',
        isUser: false,
        timestamp: new Date(),
        sessionId: sessionId
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false) // 隐藏正在输入指示器
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  // 加载更多历史消息
  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore || !sessionId) return

    setIsLoadingMore(true)
    try {
      const nextPage = currentPage + 1
      const historyResponse = await chatAPI.getChatHistory(sessionId, userId, nextPage, 10)
      
      if (historyResponse.data.messages && historyResponse.data.messages.length > 0) {
        // 记录当前滚动位置
        const messagesContainer = document.querySelector(`.${styles.messagesContainer}`)
        const scrollTop = messagesContainer?.scrollTop || 0
        const scrollHeight = messagesContainer?.scrollHeight || 0
        
        // 将新消息添加到现有消息的前面（因为是最旧的消息）
        setMessages(prev => [...historyResponse.data.messages, ...prev])
        setHasMore(historyResponse.data.hasMore)
        setCurrentPage(nextPage)
        
        // 在下一个渲染周期中恢复滚动位置
        setTimeout(() => {
          if (messagesContainer) {
            const newScrollHeight = messagesContainer.scrollHeight
            const heightDifference = newScrollHeight - scrollHeight
            messagesContainer.scrollTop = scrollTop + heightDifference
          }
        }, 0)
      }
    } catch (error) {
      console.error('加载更多消息失败:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  return (
    <div className={styles.chatContainer}>
      {/* 头部 */}
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => window.history.back()}>
          ←
        </button>
        <div className={styles.headerTitle}>
          <h2>智能客服</h2>
          <span className={styles.status}>在线</span>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.actionButton}>⋮</button>
        </div>
      </div>

      {/* 消息列表 */}
      <div className={styles.messagesContainer}>
        {/* 加载更多按钮 */}
        {hasMore && (
          <div className={styles.loadMoreContainer}>
            <button 
              onClick={loadMoreMessages}
              disabled={isLoadingMore}
              className={styles.loadMoreButton}
            >
              {isLoadingMore ? '加载中...' : '加载更多历史消息'}
            </button>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${styles.messageWrapper} ${
              message.isUser ? styles.userMessage : styles.botMessage
            }`}
          >
            <div className={styles.messageContent}>
              <div className={styles.messageText}>{message.content}</div>
              <div className={styles.messageTime}>{formatTime(message.timestamp)}</div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className={`${styles.messageWrapper} ${styles.botMessage}`}>
            <div className={styles.messageContent}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              // 清除错误提示
              if (inputError) setInputError('')
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="请输入您的问题..."
            className={`${styles.messageInput} ${inputError ? styles.inputError : ''}`}
            disabled={!sessionId}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !sessionId}
            className={styles.sendButton}
          >
            发送
          </button>
        </div>
        {inputError && (
          <div className={styles.errorMessage}>
            {inputError}
          </div>
        )}
      </div>
    </div>
  )
}
