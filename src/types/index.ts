export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'typing';
  lastSeen?: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: User;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  readBy: string[];
  reactions?: Reaction[];
}

export interface Reaction {
  emoji: string;
  userId: string;
}

export interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isGroup: boolean;
  updatedAt: Date;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface ChatState {
  conversations: Conversation[];
  activeConversation: string | null;
  messages: Record<string, Message[]>;
  typingIndicators: TypingIndicator[];
  onlineUsers: string[];
}
