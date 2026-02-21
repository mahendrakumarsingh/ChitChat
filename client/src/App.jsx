import { useState, useEffect, useRef } from 'react';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Sidebar } from '@/components/chat/Sidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { EmptyState } from '@/components/chat/EmptyState';
import { ConnectionStatus } from '@/components/common/ConnectionStatus';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import { CallModal } from '@/components/chat/CallModal';
import './App.css';

function App() {
  const { isAuthenticated, user, login, register, logout, updateProfile } = useAuth();
  const currentUserId = user?.id || user?._id || null;
  console.log('[App] Render. Auth:', isAuthenticated, 'User:', currentUserId);
  const [isConnected, setIsConnected] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const webRTCHandlersRef = useRef({}); const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const {
    conversations,
    messages,
    activeConversation,
    typingIndicators,
    selectConversation,
    sendMessage: sendMessageBase,
    receiveMessage,
    addReaction: addReactionBase,
    contacts,
    addContact,
    createConversation,
    deleteMessage,
  } = useChat(currentUserId);

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
  const { socket: socketRef, isConnected: socketConnected } = useSocket(currentUserId, {
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
      setOnlineUsers(prev => [...new Set([...prev, userId])]);
    },
    onUserOffline: (userId) => {
      console.log('User offline:', userId);
      setOnlineUsers(prev => prev.filter(id => id !== userId));
    },
    onCallIncoming: (data) => webRTCHandlersRef.current.onCallIncoming?.(data),
    onCallAccepted: (data) => webRTCHandlersRef.current.onCallAccepted?.(data),
    onCallRejected: (data) => webRTCHandlersRef.current.onCallRejected?.(data),
    onCallEnded: (data) => webRTCHandlersRef.current.onCallEnded?.(data),
    onWebRTCOffer: (data) => webRTCHandlersRef.current.onWebRTCOffer?.(data),
    onWebRTCAnswer: (data) => webRTCHandlersRef.current.onWebRTCAnswer?.(data),
    onWebRTCIceCandidate: (data) => webRTCHandlersRef.current.onWebRTCIceCandidate?.(data),
  });

  const webRTC = useWebRTC(socketRef, currentUserId, user?.name || user?.username);

  useEffect(() => {
    webRTCHandlersRef.current = webRTC.socketHandlers;
  }, [webRTC.socketHandlers]);

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

  const handleAudioCall = () => {
    if (!activeConvData) return;

    let otherUserId = activeConvData.otherMemberId;
    if (!otherUserId) {
      const p = activeConvData.participants?.find(p => (p._id || p.id) !== currentUserId);
      otherUserId = p?._id || p?.id;
    }

    if (!onlineUsers.includes(otherUserId)) {
      alert('User is offline');
      return;
    }

    console.log('[App] Init Audio Call to:', otherUserId);
    if (otherUserId) {
      webRTC.initMediaAndCall(otherUserId, false);
    } else {
      alert('Cannot determine the user to call.');
    }
  };

  const handleVideoCall = () => {
    if (!activeConvData) return;

    let otherUserId = activeConvData.otherMemberId;
    if (!otherUserId) {
      const p = activeConvData.participants?.find(p => (p._id || p.id) !== currentUserId);
      otherUserId = p?._id || p?.id;
    }

    if (!onlineUsers.includes(otherUserId)) {
      alert('User is offline');
      return;
    }

    console.log('[App] Init Video Call to:', otherUserId);
    if (otherUserId) {
      webRTC.initMediaAndCall(otherUserId, true);
    } else {
      alert('Cannot determine the user to call.');
    }
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
    <div className="fixed inset-0 flex bg-[var(--void)] overflow-hidden text-[var(--text-primary)]">
      <ConnectionStatus isConnected={isConnected} />

      {/* Sidebar */}
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

      {/* Chat Window Container */}
      <div className={`flex-1 min-w-0 h-full flex-col bg-[var(--void)] ${activeConversation ? 'flex' : 'hidden md:flex'}`}>
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
            onAudioCall={handleAudioCall}
            onVideoCall={handleVideoCall}
          />
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Call Modal */}
      <CallModal
        callState={webRTC.callState}
        caller={webRTC.caller}
        receiverItem={webRTC.receiverItem}
        isVideoCall={webRTC.isVideoCall}
        localStream={webRTC.localStream}
        remoteStream={webRTC.remoteStream}
        onAccept={webRTC.answerCall}
        onReject={webRTC.rejectCall}
        onEnd={webRTC.endCall}
        onFlipCamera={webRTC.flipCamera}
      />
    </div>
  );
}

export default App;
