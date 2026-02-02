import { useContext } from 'react'
import { ChatContext } from './chat-context-core'

export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}
