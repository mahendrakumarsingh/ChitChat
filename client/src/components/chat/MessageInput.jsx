import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Send, Paperclip, Image, Mic, Smile, X, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmojiPicker from 'emoji-picker-react';

export const MessageInput = ({
  onSendMessage,
  onTypingStart,
  onTypingStop,
  disabled,
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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
      onSendMessage(message.trim(), 'text');
      setMessage('');
      setIsTyping(false);
      onTypingStop();
      setShowEmojiPicker(false);

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

  const handleEmojiClick = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
  };

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      onSendMessage('', type, file);
      setShowAttachments(false);
    }
    e.target.value = null; // Reset input
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' });
        onSendMessage('', 'audio', audioFile);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setShowAttachments(false);
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
      className="p-4 glass-strong border-t border-[var(--surface-light)] relative"
    >
      {/* Hidden inputs */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={(e) => handleFileSelect(e, 'image')}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileSelect(e, 'file')}
        className="hidden"
      />

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-full right-4 mb-2 z-50 shadow-2xl rounded-xl overflow-hidden animate-fade-in-up">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme="dark"
            width={300}
            height={400}
          />
        </div>
      )}

      {/* Attachment Menu */}
      {showAttachments && (
        <div className="flex gap-2 mb-3 animate-fade-in-up">
          <button
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-light)] transition-colors text-sm text-[var(--text-muted)]"
          >
            <Image className="w-4 h-4" />
            <span>Image</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-light)] transition-colors text-sm text-[var(--text-muted)]"
          >
            <Paperclip className="w-4 h-4" />
            <span>File</span>
          </button>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors text-sm ${isRecording
                ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                : 'bg-[var(--surface)] hover:bg-[var(--surface-light)] text-[var(--text-muted)]'
              }`}
          >
            {isRecording ? <StopCircle className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isRecording ? 'Stop' : 'Voice'}</span>
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
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-3 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-light)] transition-colors duration-200 group flex-shrink-0"
        >
          <Smile className={`w-5 h-5 transition-colors ${showEmojiPicker ? 'text-[var(--electric-blue)]' : 'text-[var(--text-muted)] group-hover:text-[var(--electric-blue)]'}`} />
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