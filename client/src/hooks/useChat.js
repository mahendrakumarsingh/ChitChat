import { useState, useCallback, useEffect } from 'react';

const API_URL = 'http://localhost:4000/api';

export const useChat = (currentUser) => { // Expecting currentUser object or null
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({}); // { conversationId: [messages] }
  const [contacts, setContacts] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [typingIndicators, setTypingIndicators] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const token = localStorage.getItem('token');

  const fetchContacts = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (err) {
      console.error('Failed to fetch contacts', err);
    }
  }, [token]);

  const fetchConversations = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map(c => {
          // Find the other participant by filtering out the current user (by ID)
          const other = c.members.find(m => m._id !== currentUser);

          return {
            id: c._id,
            name: c.isGroup ? c.name : (other ? (other.name || other.username) : 'Chat'),
            avatar: c.isGroup ? c.avatar : other?.avatar,
            isGroup: c.isGroup,
            lastMessage: c.lastMessage,
            updatedAt: c.updatedAt,
            unreadCount: 0,
            participants: c.members,
            otherMemberId: other?._id
          };
        });
        setConversations(formatted);
      }
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  }, [token, currentUser]);

  const fetchMessages = useCallback(async (conversationId) => {
    if (!token || !conversationId) return;
    try {
      const res = await fetch(`${API_URL}/messages/${conversationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => ({ ...prev, [conversationId]: data }));
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchContacts();
      fetchConversations();
    }
  }, [token, fetchContacts, fetchConversations]);

  const selectConversation = useCallback((conversationId) => {
    setActiveConversation(conversationId);
    fetchMessages(conversationId);
  }, [fetchMessages]);

  const sendMessage = useCallback(async (conversationId, content, type = 'text', file = null) => {
    if (!token) return;
    try {
      let body;
      let headers = {
        'Authorization': `Bearer ${token}`
      };

      if (file) {
        const formData = new FormData();
        formData.append('conversationId', conversationId);
        formData.append('type', type);
        if (content) formData.append('content', content);
        formData.append('file', file);
        body = formData;
        // Don't set Content-Type for FormData
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({ content, conversationId, type });
      }

      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers,
        body,
      });

      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), msg],
        }));
        fetchConversations(); // Update last message in list
      }
    } catch (err) {
      console.error('Failed to send message', err);
    }
  }, [token, fetchConversations]);

  const addContact = useCallback(async (username) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/contacts/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (res.ok) {
        fetchContacts();
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error };
      }
    } catch {
      return { success: false, error: 'Network error' };
    }
  }, [token, fetchContacts]);

  const deleteMessage = useCallback(async (messageId, mode) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/messages/${messageId}?mode=${mode}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setMessages(prev => {
          const newMessages = { ...prev };
          Object.keys(newMessages).forEach(key => {
            newMessages[key] = newMessages[key].map(msg => {
              if (msg._id === messageId || msg.id === messageId) {
                if (mode === 'everyone') {
                  return { ...msg, isDeleted: true, content: 'This message was deleted', type: 'text', fileUrl: undefined };
                } else {
                  return null; // Will be filtered out
                }
              }
              return msg;
            }).filter(Boolean);
          });
          return newMessages;
        });
        fetchConversations(); // Update last message preview
        return { success: true };
      }
    } catch (err) {
      console.error('Failed to delete message', err);
      return { success: false, error: 'Network error' };
    }
  }, [token, fetchConversations]);

  const createConversation = useCallback(async (contactId) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId: contactId })
      });
      if (res.ok) {
        const conv = await res.json();
        await fetchConversations();
        selectConversation(conv._id);
      }
    } catch (err) {
      console.error('Failed to create conversation', err);
    }
  }, [token, fetchConversations, selectConversation]);

  // Placeholder functions for compatibility with existing components
  const receiveMessage = () => { };
  const addTypingIndicator = (data) => setTypingIndicators(prev => [...prev, data]);
  const removeTypingIndicator = () => setTypingIndicators([]);
  const markMessageAsRead = () => { };
  const addReaction = () => { };
  const setUserOnline = (userId) => setOnlineUsers(prev => [...prev, userId]);
  const setUserOffline = () => setOnlineUsers([]);

  return {
    conversations,
    messages,
    contacts,
    activeConversation,
    typingIndicators,
    onlineUsers,
    selectConversation,
    sendMessage,
    addContact,
    createConversation,
    deleteMessage,
    receiveMessage,
    addTypingIndicator,
    removeTypingIndicator,
    markMessageAsRead,
    addReaction,
    setUserOnline,
    setUserOffline,
  };
};