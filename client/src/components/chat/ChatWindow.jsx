import { useRef, useEffect, useState } from 'react';

import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';

export const ChatWindow = ({
  conversation,
  messages,
  currentUser,
  onlineUsers,
  typingIndicators,
  onSendMessage,
  onTypingStart,
  onTypingStop,
  onReaction,
  onDelete,
  onBack,
  isMobile,
  onAudioCall,
  onVideoCall,
}) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Auto-scroll to bottom on new messages
  // Auto-scroll to bottom on update
  useEffect(() => {
    if (messagesEndRef.current) {
      // If we just loaded messages or received a new one, scroll to bottom
      // We checking if we are ALREADY at the bottom or if it's a new load
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]); // Scroll when message count changes



  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setHasScrolled(!isAtBottom);
    }
  };

  const getTypingUsers = () => {
    if (!conversation) return [];
    return typingIndicators
      .filter(t => t.conversationId === conversation.id)
      .map(t => t.userName);
  };

  const formatDate = (date) => {
    const today = new Date();
    const messageDate = new Date(date);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return messageDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    let dateObj = new Date(message.timestamp || message.createdAt);
    if (isNaN(dateObj.getTime())) {
      // Fallback for invalid date
      dateObj = new Date();
    }
    const date = dateObj.toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--void)]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[var(--electric-blue)]/20 to-[#8a2be2]/20 flex items-center justify-center animate-float">
            <svg
              className="w-10 h-10 text-[var(--electric-blue)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            Select a conversation
          </h3>
          <p className="text-[var(--text-muted)] max-w-sm">
            Choose a conversation from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  console.log('Grouped keys:', Object.keys(groupedMessages));
  const lastDate = Object.keys(groupedMessages).pop();
  if (lastDate) {
    console.log('Last group messages count:', groupedMessages[lastDate].length);
    const lastMsg = groupedMessages[lastDate][groupedMessages[lastDate].length - 1];
    console.log('Last message content:', lastMsg?.content, 'Timestamp:', lastMsg?.timestamp || lastMsg?.createdAt);
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--void)]">
      <ChatHeader
        conversation={conversation}
        onlineUsers={onlineUsers}
        typingUsers={getTypingUsers()}
        onBack={onBack}
        isMobile={isMobile}
        onAudioCall={onAudioCall}
        onVideoCall={onVideoCall}
      />

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar"
      >
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date} className="space-y-4">
            {/* Date Divider */}
            <div className="flex items-center justify-center">
              <div className="px-4 py-1 rounded-full bg-[var(--surface)] text-xs text-[var(--text-muted)]">
                {formatDate(dateMessages[0]?.timestamp || dateMessages[0]?.createdAt)}
              </div>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message, index) => {
              const senderId = message.senderId?._id || message.senderId?.id || message.senderId;
              const currentUserId = currentUser?.id || currentUser?._id;
              const isSelf = senderId?.toString() === currentUserId;
              const prevSenderId = dateMessages[index - 1] ? (dateMessages[index - 1].senderId?._id || dateMessages[index - 1].senderId?.id || dateMessages[index - 1].senderId) : null;
              const showAvatar = index === 0 || prevSenderId?.toString() !== senderId?.toString();

              return (
                <MessageBubble
                  key={message._id || message.id}
                  message={message}
                  isSelf={isSelf}
                  showAvatar={showAvatar}
                  onReaction={onReaction}
                  onDelete={onDelete}
                />
              );
            })}
          </div>
        ))}

        {/* Typing Indicator */}
        {getTypingUsers().length > 0 && (
          <TypingIndicator userNames={getTypingUsers()} />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {hasScrolled && (
        <button
          onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-24 right-6 p-2 rounded-full bg-[var(--electric-blue)] text-white shadow-lg hover:bg-[var(--electric-blue)]/80 transition-colors animate-fade-in-up"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      )}

      {/* Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
      />
    </div>
  );
};