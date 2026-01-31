import { useEffect, useRef, useCallback, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (userId, events) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    try {
      socketRef.current = io('http://localhost:5000', {
        transports: ['websocket'],
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

      socket.on('connect_error', () => {
        console.log('Socket connection failed - running in demo mode');
        setIsConnected(true); // Demo mode - pretend connected
      });

      // Message events
      socket.on('message:new', (message) => {
        events.onMessage?.(message);
      });

      // Typing events
      socket.on('typing:start', (data) => {
        events.onTyping?.(data);
      });

      socket.on('typing:stop', (data) => {
        events.onStopTyping?.(data);
      });

      // User presence events
      socket.on('user:online', (data) => {
        events.onUserOnline?.(data.userId);
      });

      socket.on('user:offline', (data) => {
        events.onUserOffline?.(data.userId);
      });

      // Message read receipts
      socket.on('message:read', (data) => {
        events.onMessageRead?.(data);
      });

      // Reactions
      socket.on('message:reaction', (data) => {
        events.onReaction?.(data);
      });

      return () => {
        socket.disconnect();
      };
    } catch {
      // Demo mode - no actual server
      console.log('Running in demo mode - no socket server');
      // Avoid synchronous setState during render/effect body — defer to next tick
      setTimeout(() => setIsConnected(true), 0);
    }
  }, [userId, events]);

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
    // return the ref object instead of current to avoid accessing refs during render
    socket: socketRef,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    addReaction,
  };
};