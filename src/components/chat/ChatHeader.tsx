import { Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const ChatHeader = ({
  conversation,
  onlineUsers,
  typingUsers,
  onBack,
  isMobile,
}) => {
  if (!conversation) return null;

  const isOnline = conversation.isGroup
    ? false
    : onlineUsers.includes(conversation.participants[0]?.id || '');

  const isTyping = typingUsers.length > 0;

  return (
    <div className="h-16 px-4 flex items-center justify-between glass-strong border-b border-[var(--surface-light)]">
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg hover:bg-[var(--surface-light)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
        )}

        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarImage src={conversation.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-[var(--electric-blue)] to-[#8a2be2] text-white">
              {conversation.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {!conversation.isGroup && isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[var(--neon-green)] rounded-full border-2 border-[var(--surface)] online-pulse" />
          )}
        </div>

        <div>
          <h3 className="font-semibold text-[var(--text-primary)] text-sm">
            {conversation.name}
          </h3>
          <p className="text-xs text-[var(--neon-green)]">
            {isTyping ? (
              <span className="flex items-center gap-1">
                typing
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 bg-[var(--neon-green)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 bg-[var(--neon-green)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 bg-[var(--neon-green)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </span>
            ) : isOnline ? (
              'Online'
            ) : (
              'Offline'
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button className="p-2.5 rounded-xl hover:bg-[var(--surface-light)] transition-colors duration-200 group">
          <Phone className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--electric-blue)] transition-colors" />
        </button>
        <button className="p-2.5 rounded-xl hover:bg-[var(--surface-light)] transition-colors duration-200 group">
          <Video className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--electric-blue)] transition-colors" />
        </button>
        <button className="p-2.5 rounded-xl hover:bg-[var(--surface-light)] transition-colors duration-200 group">
          <MoreVertical className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--electric-blue)] transition-colors" />
        </button>
      </div>
    </div>
  );
};
