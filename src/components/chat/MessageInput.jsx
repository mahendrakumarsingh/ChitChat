import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Send, Paperclip, Image, Mic, Smile, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const MessageInput = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  disabled,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Entrance animation
    gsap.fromTo(
      containerRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power4.out', delay: 0.4 }
    );
  }, []);

  const handleInputChange = (e) => {
    setMessage(e.target.value);

    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      onTypingStart();
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTypingStop();
    }, 2000);
  };

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
      onTypingStop();
      
      // Animate send
      gsap.fromTo(
        inputRef.current,
        { scale: 0.95 },
        { scale: 1, duration: 0.2, ease: 'power2.out' }
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  return (
    <div
      ref={containerRef}
      className="p-4 glass-strong border-t border-[var(--surface-light)]"
    >
      {/* Attachment Menu */}
      {showAttachments && (
        <div className="flex gap-2 mb-3 animate-fade-in-up">
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-light)] transition-colors text-sm text-[var(--text-muted)]">
            <Image className="w-4 h-4" />
            <span>Image</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-light)] transition-colors text-sm text-[var(--text-muted)]">
            <Paperclip className="w-4 h-4" />
            <span>File</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-light)] transition-colors text-sm text-[var(--text-muted)]">
            <Mic className="w-4 h-4" />
            <span>Voice</span>
          </button>
          <button
            onClick={() => setShowAttachments(false)}
            className="p-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-light)] transition-colors"
          >
            <X className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Attachment Button */}
        <button
          onClick={() => setShowAttachments(!showAttachments)}
          className="p-3 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-light)] transition-colors duration-200 group flex-shrink-0"
        >
          <Paperclip className={`w-5 h-5 transition-colors ${showAttachments ? 'text-[var(--electric-blue)]' : 'text-[var(--text-muted)] group-hover:text-[var(--electric-blue)]'}`} />
        </button>

        {/* Emoji Button */}
        <button className="p-3 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-light)] transition-colors duration-200 group flex-shrink-0">
          <Smile className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--electric-blue)] transition-colors" />
        </button>

        {/* Input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-3 bg-[var(--surface)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border border-[var(--surface-light)] focus:border-[var(--electric-blue)] focus:outline-none resize-none min-h-[44px] max-h-[120px] custom-scrollbar input-glow transition-all duration-300"
          />
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="p-3 rounded-xl bg-[var(--electric-blue)] hover:bg-[var(--electric-blue)]/80 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 h-[44px] w-[44px] flex items-center justify-center"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};