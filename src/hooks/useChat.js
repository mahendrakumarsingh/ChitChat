import { useState, useCallback } from 'react';

// Mock data for demo
const MOCK_CONVERSATIONS = [
  {
    id: 'conv-1',
    name: 'Sarah Miller',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    participants: [],
    lastMessage: {
      id: 'msg-1',
      content: 'Hey! How is the project coming along?',
      senderId: '2',
      sender: {
        id: '2',
        name: 'Sarah Miller',
        email: 'sarah@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        status: 'online',
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      type: 'text',
      readBy: [],
    },
    unreadCount: 2,
    isGroup: false,
    updatedAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: 'conv-2',
    name: 'Design Team',
    avatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=design',
    participants: [],
    lastMessage: {
      id: 'msg-2',
      content: 'The new mockups look great! 🎨',
      senderId: '3',
      sender: {
        id: '3',
        name: 'Jordan Park',
        email: 'jordan@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
        status: 'online',
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      type: 'text',
      readBy: [],
    },
    unreadCount: 0,
    isGroup: true,
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'conv-3',
    name: 'Alex Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    participants: [],
    lastMessage: {
      id: 'msg-3',
      content: 'Can we schedule a call tomorrow?',
      senderId: '1',
      sender: {
        id: '1',
        name: 'Alex Chen',
        email: 'alex@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
        status: 'online',
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      type: 'text',
      readBy: [],
    },
    unreadCount: 1,
    isGroup: false,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
];

const MOCK_MESSAGES = {
  'conv-1': [
    {
      id: 'msg-0',
      content: 'Hi Sarah! 👋',
      senderId: 'me',
      sender: {
        id: 'me',
        name: 'You',
        email: 'you@example.com',
        status: 'online',
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      type: 'text',
      readBy: ['2'],
    },
    {
      id: 'msg-1',
      content: 'Hey! How is the project coming along?',
      senderId: '2',
      sender: {
        id: '2',
        name: 'Sarah Miller',
        email: 'sarah@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        status: 'online',
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      type: 'text',
      readBy: [],
    },
  ],
  'conv-2': [
    {
      id: 'msg-4',
      content: 'Team, please review the latest designs',
      senderId: '3',
      sender: {
        id: '3',
        name: 'Jordan Park',
        email: 'jordan@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan',
        status: 'online',
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      type: 'text',
      readBy: ['me'],
    },
    {
      id: 'msg-2',
      content: 'The new mockups look great! 🎨',
      senderId: 'me',
      sender: {
        id: 'me',
        name: 'You',
        email: 'you@example.com',
        status: 'online',
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      type: 'text',
      readBy: [],
    },
  ],
};

export const useChat = (currentUserId) => {
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [activeConversation, setActiveConversation] = useState(null);
  const [typingIndicators, setTypingIndicators] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(['1', '2', '3']);

  const selectConversation = useCallback((conversationId) => {
    setActiveConversation(conversationId);
    // Mark as read when selecting
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );
  }, []);

  const sendMessage = useCallback((conversationId, content, type = 'text') => {
    if (!currentUserId) return;

    const newMessage = {
      id: `msg-${Date.now()}`,
      content,
      senderId: currentUserId,
      sender: {
        id: currentUserId,
        name: 'You',
        email: 'you@example.com',
        status: 'online',
      },
      timestamp: new Date(),
      type,
      readBy: [],
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage],
    }));

    // Update conversation's last message
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, lastMessage: newMessage, updatedAt: new Date() }
          : conv
      )
    );
  }, [currentUserId]);

  const receiveMessage = useCallback((message, conversationId) => {
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), message],
    }));

    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { 
              ...conv, 
              lastMessage: message, 
              updatedAt: new Date(),
              unreadCount: activeConversation === conversationId ? 0 : conv.unreadCount + 1,
            }
          : conv
      )
    );
  }, [activeConversation]);

  const addTypingIndicator = useCallback((data) => {
    setTypingIndicators(prev => {
      const exists = prev.find(t => t.userId === data.userId && t.conversationId === data.conversationId);
      if (exists) return prev;
      return [...prev, data];
    });
  }, []);

  const removeTypingIndicator = useCallback((data) => {
    setTypingIndicators(prev =>
      prev.filter(t => !(t.userId === data.userId && t.conversationId === data.conversationId))
    );
  }, []);

  const markMessageAsRead = useCallback((messageId, conversationId) => {
    setMessages(prev => ({
      ...prev,
      [conversationId]: prev[conversationId]?.map(msg =>
        msg.id === messageId ? { ...msg, readBy: [...msg.readBy, 'me'] } : msg
      ) || [],
    }));
  }, []);

  const addReaction = useCallback((messageId, emoji, conversationId) => {
    setMessages(prev => ({
      ...prev,
      [conversationId]: prev[conversationId]?.map(msg =>
        msg.id === messageId
          ? { 
              ...msg, 
              reactions: [...(msg.reactions || []), { emoji, userId: 'me' }] 
            }
          : msg
      ) || [],
    }));
  }, []);

  const setUserOnline = useCallback((userId) => {
    setOnlineUsers(prev => [...new Set([...prev, userId])]);
  }, []);

  const setUserOffline = useCallback((userId) => {
    setOnlineUsers(prev => prev.filter(id => id !== userId));
  }, []);

  return {
    conversations,
    messages,
    activeConversation,
    typingIndicators,
    onlineUsers,
    selectConversation,
    sendMessage,
    receiveMessage,
    addTypingIndicator,
    removeTypingIndicator,
    markMessageAsRead,
    addReaction,
    setUserOnline,
    setUserOffline,
  };
};