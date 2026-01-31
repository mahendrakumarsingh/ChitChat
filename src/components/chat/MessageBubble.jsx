import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Check, CheckCheck } from 'lucide-react';


const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

export const MessageBubble = ({
  message,
  isSelf,
  showAvatar,
  onReaction,
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const bubbleRef = useRef(null);

  useEffect(() => {
    // Entrance animation
    gsap.fromTo(
      bubbleRef.current,
      { 
        scale: 0.8, 
        opacity: 0,
        x: isSelf ? 50 : -50,
      },
      { 
        scale: 1, 
        opacity: 1, 
        x: 0,
        duration: 0.4, 
        ease: 'back.out(1.7)',
      }
    );
  }, [isSelf]);

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      ref={bubbleRef}
      className={`flex gap-3 ${isSelf ? 'flex-row-reverse' : 'flex-row'} group`}
    >
      {/* Avatar */}
      {showAvatar && !isSelf ? (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[var(--electric-blue)] to-[#8a2be2] flex items-center justify-center text-white text-xs font-medium">
          {message.sender.avatar ? (
            <img src={message.sender.avatar} alt={message.sender.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            message.sender.name.charAt(0)
          )}
        </div>
      ) : (
        <div className="flex-shrink-0 w-8" />
      )}

      {/* Message Content */}
      <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {/* Sender Name (for groups) */}
        {!isSelf && showAvatar && (
          <span className="text-xs text-[var(--text-muted)] mb-1 ml-1">
            {message.sender.name}
          </span>
        )}

        {/* Bubble */}
        <div
          className={`relative px-4 py-2.5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 ${
            isSelf
              ? 'message-self rounded-br-md'
              : 'message-other rounded-bl-md'
          }`}
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          {/* Content */}
          <p className="text-[var(--text-primary)] text-sm leading-relaxed">
            {message.content}
          </p>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className={`flex gap-1 mt-1 ${isSelf ? 'justify-end' : 'justify-start'}`}>
              {message.reactions.map((reaction, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-[var(--surface-light)] px-1.5 py-0.5 rounded-full"
                >
                  {reaction.emoji}
                </span>
              ))}
            </div>
          )}

          {/* Reaction Picker */}
          {showReactions && (
            <div
              className={`absolute ${isSelf ? 'right-0' : 'left-0'} -top-10 flex gap-1 p-1.5 bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--surface-light)] animate-fade-in-up z-10`}
            >
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReaction(message.id, emoji)}
                  className="w-7 h-7 flex items-center justify-center hover:bg-[var(--surface-light)] rounded-lg transition-colors text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Timestamp & Read Status */}
          <div className={`flex items-center gap-1 mt-1 ${isSelf ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px] text-[var(--text-muted)]">
              {formatTime(message.timestamp)}
            </span>
            {isSelf && (
              <span className="text-[var(--electric-blue)]">
                {message.readBy.length > 0 ? (
                  <CheckCheck className="w-3.5 h-3.5" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};