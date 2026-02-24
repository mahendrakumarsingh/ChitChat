import { useState, useRef, useEffect } from 'react';
// Removed GSAP animation for debugging visibility
import { Check, CheckCheck, FileText, Download, Play, Pause, MoreVertical, Trash2, Globe, Phone, Video } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

export const MessageBubble = ({
  message,
  isSelf,
  showAvatar,
  onReaction,
  onDelete,
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const bubbleRef = useRef(null);



  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const sender = message.sender || message.senderId || { name: message.senderName || 'User' };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (message.isDeleted) {
    return (
      <div className={`flex gap-3 ${isSelf ? 'flex-row-reverse' : 'flex-row'} group opacity-60`}>
        <div className="flex-shrink-0 w-8" />
        <div className={`px-4 py-2 rounded-2xl bg-[var(--surface-light)] border border-[var(--surface)] text-[var(--text-muted)] italic text-sm flex items-center gap-2`}>
          <Trash2 className="w-4 h-4" />
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div
      ref={bubbleRef}
      className={`flex gap-3 ${isSelf ? 'flex-row-reverse' : 'flex-row'} group items-start`}
    >
      {/* Avatar */}
      {showAvatar && !isSelf ? (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[var(--electric-blue)] to-[#8a2be2] flex items-center justify-center text-white text-xs font-medium">
          {sender.avatar ? (
            <img src={sender.avatar} alt={sender.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            (sender.name || 'U').charAt(0)
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
            {sender.name}
          </span>
        )}

        {/* Bubble */}
        <div className="relative group/bubble">
          <div
            className={`relative px-4 py-2.5 rounded-2xl transition-all duration-300 ${isSelf
              ? 'message-self rounded-br-md'
              : 'message-other rounded-bl-md'
              }`}
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
          >
            {/* Content Based on Type */}
            {message.type === 'call' && (
              <div className={`flex items-center gap-3 p-3 rounded-lg ${isSelf ? 'bg-black/20' : 'bg-[var(--surface-light)]/50'} border border-[var(--surface-light)]`}>
                <div className={`p-2 rounded-full ${message.content.includes('Missed') ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                  {message.content.toLowerCase().includes('video') ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-sm font-medium">{message.content}</p>
                  <p className="text-xs opacity-70 mt-0.5">
                    {message.callDuration || 'No answer'}
                  </p>
                </div>
              </div>
            )}

            {message.type === 'text' && (
              <p className="text-[var(--text-primary)] text-sm leading-relaxed">
                {message.content}
              </p>
            )}

            {message.type === 'image' && (
              <div className="rounded-lg overflow-hidden mb-1">
                <img
                  src={message.fileUrl}
                  alt="attachment"
                  className="max-w-[250px] max-h-[300px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(message.fileUrl, '_blank')}
                />
                {message.content && (<p className="mt-2 text-sm">{message.content}</p>)}
              </div>
            )}

            {message.type === 'file' && (
              <div className={`flex items-center gap-3 p-3 rounded-lg ${isSelf ? 'bg-black/20' : 'bg-[var(--surface-light)]/50'} border border-[var(--surface-light)] group/file`}>
                <div className="p-2 rounded-lg bg-[var(--surface-light)] text-[var(--electric-blue)]">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-medium truncate max-w-[150px]">{message.fileName}</p>
                  <p className="text-xs opacity-70">{(message.fileSize / 1024).toFixed(1)} KB</p>
                </div>
                <a href={message.fileUrl} download target="_blank" className="p-2 rounded-full hover:bg-[var(--surface-light)] transition-colors">
                  <Download className="w-5 h-5 opacity-70 hover:opacity-100" />
                </a>
              </div>
            )}

            {message.type === 'audio' && (
              <div className="flex items-center gap-3 p-2 min-w-[200px]">
                <button
                  onClick={toggleAudio}
                  className="p-2 rounded-full bg-[var(--electric-blue)] text-white hover:bg-[var(--electric-blue)]/80 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <div className="flex-1 h-1 bg-[var(--surface-light)] rounded-full overflow-hidden">
                  <div className={`h-full bg-[var(--electric-blue)] ${isPlaying ? 'animate-pulse' : 'w-0'}`} style={{ width: isPlaying ? '100%' : '0%' }} />
                </div>
                <audio
                  ref={audioRef}
                  src={message.fileUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              </div>
            )}

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
                    onClick={() => onReaction(message.id || message._id, emoji)}
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
                {formatTime(message.timestamp || message.createdAt)}
              </span>
              {isSelf && (
                <span className="text-[var(--electric-blue)]">
                  {message.readBy?.length > 0 ? (
                    <CheckCheck className="w-3.5 h-3.5" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Delete Menu Trigger */}
          <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/bubble:opacity-100 transition-opacity ${isSelf ? '-left-8' : '-right-8'}`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-full hover:bg-[var(--surface-light)] text-[var(--text-muted)]">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[var(--surface)] border-[var(--surface-light)] text-[var(--text-primary)]">
                {isSelf && (
                  <DropdownMenuItem onClick={() => onDelete(message._id || message.id, 'everyone')} className="text-red-500 focus:text-red-400 focus:bg-red-500/10 cursor-pointer">
                    <Globe className="w-4 h-4 mr-2" />
                    Delete for everyone
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onDelete(message._id || message.id, 'me')} className="text-[var(--text-primary)] focus:bg-[var(--surface-light)] cursor-pointer">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete for me
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </div>
      </div>
    </div>
  );
};