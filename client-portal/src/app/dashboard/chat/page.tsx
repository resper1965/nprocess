'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatStats {
  messagesUsed: number
  messagesLimit: number
}

export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatStats, setChatStats] = useState<ChatStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadChatData = async () => {
      try {
        setLoadingStats(true)
        // TODO: Replace with actual API endpoint
        // const response = await fetch('/api/chat/stats')
        // const data = await response.json()

        setChatStats({
          messagesUsed: 0,
          messagesLimit: 100
        })

        // Load chat history
        // const historyResponse = await fetch('/api/chat/history')
        // const history = await historyResponse.json()
        // setMessages(history)

        // For now, start with welcome message
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content: 'Hello! I\'m your n.process AI assistant powered by Gemini. I can help you with compliance questions, analyze documents, and guide you through regulatory requirements. How can I assist you today?',
            timestamp: new Date(),
          },
        ])
      } catch (err) {
        console.error('Failed to load chat data:', err)
      } finally {
        setLoadingStats(false)
      }
    }

    if (user) {
      loadChatData()
    }
  }, [user])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setIsLoading(true)

    try {
      // TODO: Replace with actual API call to Gemini
      // const response = await fetch('/api/chat/send', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message: currentInput })
      // })
      // const data = await response.json()

      // Temporary: Show message that API needs to be connected
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Chat API integration pending. Connect the Gemini API endpoint at /api/chat/send to enable AI responses.',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])

      // Update stats
      if (chatStats) {
        setChatStats({
          ...chatStats,
          messagesUsed: chatStats.messagesUsed + 1
        })
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const suggestedQuestions = [
    'What are the key requirements of LGPD?',
    'How do I ensure HIPAA compliance?',
    'Explain ISO 27001 certification process',
    'What is required for FDA 510(k) clearance?',
  ]

  if (loadingStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Chat Assistant
            </h1>
            <Badge variant="glass" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Powered by Gemini
            </Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Get instant answers to your compliance questions
          </p>
        </div>
        {chatStats && (
          <Badge variant="glass" className="text-sm px-4 py-2">
            {chatStats.messagesUsed} / {chatStats.messagesLimit} messages used
          </Badge>
        )}
      </div>

      {/* Chat Container */}
      <Card glass className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-white'
                    : 'glass dark:glass-dark'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="glass dark:glass-dark rounded-lg px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Suggested Questions (show when chat is empty) */}
        {messages.length === 1 && (
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Suggested questions:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInput(question)}
                  className="text-left text-sm px-4 py-2 rounded-lg glass dark:glass-dark hover:bg-white/15 dark:hover:bg-gray-900/50 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-white/10 dark:border-gray-800/30 p-4">
          <div className="flex gap-2">
            <Input
              glass
              placeholder="Ask me anything about compliance..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Powered by Gemini 1.5 Flash • Messages are processed securely
          </p>
        </div>
      </Card>
    </div>
  )
}
