import { createContext, useContext, useCallback } from 'react';
import { useChat as useChatHook } from '@/hooks/useChat';

const ChatContext = createContext(null);

export const ChatProvider = ({ children, currentUser }) => {
  const {
    conversations,
    contacts,
    messages,
    activeConversation,
    typingIndicators,
    onlineUsers,
    selectConversation,
    sendMessage: sendMessageBase,
    addReaction: addReactionBase,
    addContact,
    createConversation,
  } = useChatHook(currentUser?.id || null);

  const sendMessage = useCallback((content) => {
    if (activeConversation) {
      sendMessageBase(activeConversation, content);
    }
  }, [activeConversation, sendMessageBase]);

  const addReaction = useCallback((messageId, emoji) => {
    if (activeConversation) {
      addReactionBase(messageId, emoji, activeConversation);
    }
  }, [activeConversation, addReactionBase]);

  const startTyping = useCallback(() => {
    if (activeConversation) {
      console.log('Typing started in', activeConversation);
    }
  }, [activeConversation]);

  const stopTyping = useCallback(() => {
    if (activeConversation) {
      console.log('Typing stopped in', activeConversation);
    }
  }, [activeConversation]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        messages,
        contacts,
        activeConversation,
        typingIndicators,
        onlineUsers,
        selectConversation,
        sendMessage,
        addReaction,
        startTyping,
        stopTyping,
        addContact,
        createConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};