import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export const TypingIndicator = ({ userNames }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Entrance animation
    gsap.fromTo(
      containerRef.current,
      { scale: 0.8, opacity: 0, y: 10 },
      { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' }
    );
  }, []);

  const getTypingText = () => {
    if (userNames.length === 1) {
      return `${userNames[0]} is typing`;
    } else if (userNames.length === 2) {
      return `${userNames[0]} and ${userNames[1]} are typing`;
    } else {
      return `${userNames.length} people are typing`;
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-3"
    >
      <div className="w-8" /> {/* Spacer for alignment */}
      
      <div className="message-other rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-3">
        {/* Animated Dots */}
        <div className="flex gap-1">
          <span 
            className="w-2 h-2 bg-[var(--text-muted)] rounded-full typing-dot"
          />
          <span 
            className="w-2 h-2 bg-[var(--text-muted)] rounded-full typing-dot"
            style={{ animationDelay: '0.2s' }}
          />
          <span 
            className="w-2 h-2 bg-[var(--text-muted)] rounded-full typing-dot"
            style={{ animationDelay: '0.4s' }}
          />
        </div>

        <span className="text-xs text-[var(--text-muted)]">
          {getTypingText()}
        </span>
      </div>
    </div>
  );
};