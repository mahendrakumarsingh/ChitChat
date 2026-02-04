import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (userId, events) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(true);

  // Keep latest events in a ref to avoid re-connecting when they change
  const eventsRef = useRef(events);
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    console.log('[useSocket] Effect triggered. UserId:', userId);
    if (!userId) return;

    try {
      const socketUrl = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace('/api', '')
        : 'http://localhost:4000';
      socketRef.current = io(socketUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        setIsConnected(true);
        socket.emit('user:online', { userId });
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socket.on('connect_error', (err) => {
        console.log('Socket connection failed:', err);
        // Do not fake connection on error
      });

      // Message events
      socket.on('message:new', (message) => {
        console.log('[Client Socket] Received message:', message);
        eventsRef.current.onMessage?.(message);
      });

      // Typing events
      socket.on('typing:start', (data) => {
        eventsRef.current.onTyping?.(data);
      });

      socket.on('typing:stop', (data) => {
        eventsRef.current.onStopTyping?.(data);
      });

      // User presence events
      socket.on('user:online', (data) => {
        eventsRef.current.onUserOnline?.(data.userId);
      });

      socket.on('user:offline', (data) => {
        eventsRef.current.onUserOffline?.(data.userId);
      });

      // Message read receipts
      socket.on('message:read', (data) => {
        eventsRef.current.onMessageRead?.(data);
      });

      // Reactions
      socket.on('message:reaction', (data) => {
        eventsRef.current.onReaction?.(data);
      });

      return () => {
        socket.disconnect();
      };
    } catch {
      console.log('Socket initialization error');
    }
  }, [userId]); // Only re-connect if userId changes

  const sendMessage = useCallback((conversationId, content, type = 'text') => {
    socketRef.current?.emit('message:send', {
      conversationId,
      content,
      type,
      timestamp: new Date(),
    });
  }, []);

  const startTyping = useCallback((conversationId) => {
    socketRef.current?.emit('typing:start', { conversationId });
  }, []);

  const stopTyping = useCallback((conversationId) => {
    socketRef.current?.emit('typing:stop', { conversationId });
  }, []);

  const markAsRead = useCallback((messageId, conversationId) => {
    socketRef.current?.emit('message:read', { messageId, conversationId });
  }, []);

  const addReaction = useCallback((messageId, emoji, conversationId) => {
    socketRef.current?.emit('message:reaction', { messageId, emoji, conversationId });
  }, []);

  return {
    socket: socketRef,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    addReaction,
  };
};