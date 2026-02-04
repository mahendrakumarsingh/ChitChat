import { useState, useEffect } from 'react';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Sidebar } from '@/components/chat/Sidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { EmptyState } from '@/components/chat/EmptyState';
import { ConnectionStatus } from '@/components/common/ConnectionStatus';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useSocket } from '@/hooks/useSocket';
import './App.css';

function App() {
  const { isAuthenticated, user, login, register, logout, updateProfile } = useAuth();
  console.log('[App] Render. Auth:', isAuthenticated, 'User:', user?.id);
  const [isConnected, setIsConnected] = useState(true);



  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const {
    conversations,
    messages,
    activeConversation,
    typingIndicators,
    onlineUsers,
    selectConversation,
    sendMessage: sendMessageBase,
    receiveMessage,
    addReaction: addReactionBase,
    contacts,
    addContact,
    createConversation,
    deleteMessage,
  } = useChat(user?.id || null);

  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setShowSidebar(!activeConversation);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [activeConversation]);

  // Socket connection (mock for demo)
  const { isConnected: socketConnected } = useSocket(user?.id || null, {
    onMessage: (message) => {
      receiveMessage(message);
    },
    onTyping: (data) => {
      console.log('Typing:', data);
    },
    onStopTyping: (data) => {
      console.log('Stop typing:', data);
    },
    onUserOnline: (userId) => {
      console.log('User online:', userId);
    },
    onUserOffline: (userId) => {
      console.log('User offline:', userId);
    },
  });

  useEffect(() => {
    setIsConnected(socketConnected);
  }, [socketConnected]);

  // Simulate receiving messages
  useEffect(() => {
    if (!isAuthenticated || !activeConversation) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.92) {
        const mockReplies = [
          'That sounds great! 🎉',
          'I agree with you.',
          'Can you explain more?',
          'Thanks for the update!',
          'Let me check and get back to you.',
          '👍 Absolutely!',
          'Interesting point!',
          'When can we discuss this further?',
        ];

        const conversation = conversations.find(c => c.id === activeConversation);
        if (!conversation) return;

        const randomReply = mockReplies[Math.floor(Math.random() * mockReplies.length)];
        const sender = conversation.participants[0] || {
          id: '2',
          name: 'Sarah Miller',
          email: '',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
          status: 'online',
        };

        const newMessage = {
          id: `msg-${Date.now()}`,
          content: randomReply,
          senderId: sender.id,
          sender,
          timestamp: new Date(),
          type: 'text',
          readBy: [],
        };

        receiveMessage(newMessage, activeConversation);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isAuthenticated, activeConversation, conversations, receiveMessage]);

  const handleSendMessage = (content, type, file) => {
    if (activeConversation) {
      sendMessageBase(activeConversation, content, type, file);
    }
  };

  const handleAddReaction = (messageId, emoji) => {
    if (activeConversation) {
      addReactionBase(messageId, emoji, activeConversation);
    }
  };

  const handleDeleteMessage = (messageId, mode) => {
    if (activeConversation) {
      deleteMessage(messageId, mode);
    }
  };

  const handleSelectConversation = (id) => {
    selectConversation(id);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleBackToSidebar = () => {
    setShowSidebar(true);
    selectConversation('');
  };

  // Get active conversation data
  const activeConvData = activeConversation
    ? conversations.find(c => c.id === activeConversation) || null
    : null;

  const activeMessages = activeConversation
    ? messages[activeConversation] || []
    : [];

  if (!isAuthenticated) {
    return <AuthScreen onLogin={login} onRegister={register} />;
  }

  return (
    <div className="h-screen w-full flex bg-[var(--void)] overflow-hidden">
      <ConnectionStatus isConnected={isConnected} />

      {/* Sidebar */}
      {(!isMobile || showSidebar) && (
        <Sidebar
          conversations={conversations}
          activeConversation={activeConversation}
          currentUser={user}
          onlineUsers={onlineUsers}
          onSelectConversation={handleSelectConversation}
          onLogout={logout}
          contacts={contacts}
          onAddContact={addContact}
          onCreateConversation={createConversation}
          onUpdateProfile={updateProfile}
        />
      )}

      {/* Chat Window */}
      {(!isMobile || !showSidebar) && (
        <>
          {activeConvData ? (
            <ChatWindow
              conversation={activeConvData}
              messages={activeMessages}
              currentUser={user}
              onlineUsers={onlineUsers}
              typingIndicators={typingIndicators}
              onSendMessage={handleSendMessage}
              onTypingStart={() => { }}
              onTypingStop={() => { }}
              onReaction={handleAddReaction}
              onDelete={handleDeleteMessage}
              onBack={isMobile ? handleBackToSidebar : undefined}
              isMobile={isMobile}
            />
          ) : (
            <EmptyState />
          )}
        </>
      )}
    </div>
  );
}

export default App;
