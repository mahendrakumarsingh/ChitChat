import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import {
  Settings,
  User,
  LogOut,
  Search,
  Check,
  CheckCheck,
  Users,
  UserPlus,
  MessageSquare
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SettingsDialog } from './SettingsDialog';

export const Sidebar = ({
  conversations,
  activeConversation,
  currentUser,
  onlineUsers,
  onSelectConversation,
  onLogout,
  contacts = [],
  onAddContact,
  onCreateConversation,
  onUpdateProfile,
}) => {
  const sidebarRef = useRef(null);
  const itemsRef = useRef(null);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  useEffect(() => {
    // Entrance animation
    gsap.fromTo(
      sidebarRef.current,
      { x: -100, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: 'power4.out' }
    );

    gsap.fromTo(
      itemsRef.current?.children || [],
      { x: -30, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power4.out', delay: 0.3 }
    );
  }, []);

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isUserOnline = (userId) => onlineUsers.includes(userId);

  const handleAddContact = async () => {
    if (!newContactName.trim()) return;
    setAddError('');
    setAddSuccess('');

    const res = await onAddContact(newContactName);
    if (res.success) {
      setAddSuccess(res.message);
      setNewContactName('');
    } else {
      setAddError(res.error);
    }
  };

  const handleContactClick = (contactId) => {
    onCreateConversation(contactId);
    setIsContactsOpen(false);
  };

  return (
    <div
      ref={sidebarRef}
      className="w-80 h-full glass-strong flex flex-col border-r border-[var(--surface-light)]"
    >
      {/* Header */}
      <div className="p-4 border-b border-[var(--surface-light)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-10 h-10 ring-2 ring-[var(--electric-blue)]/30">
                <AvatarImage src={currentUser?.avatar} />
                <AvatarFallback className="bg-[var(--surface-light)] text-[var(--text-primary)]">
                  {currentUser?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[var(--neon-green)] rounded-full border-2 border-[var(--surface)] online-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] text-sm">
                {currentUser?.name || currentUser?.username || 'User'}
              </h3>
              <p className="text-xs text-[var(--neon-green)]">Online</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg hover:bg-[var(--surface-light)] transition-colors duration-200"
            >
              <Settings className="w-5 h-5 text-[var(--text-muted)]" />
            </button>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-[var(--surface-light)] transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 text-[var(--text-muted)]" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] border border-[var(--surface-light)] focus:border-[var(--electric-blue)] focus:outline-none transition-all duration-300"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div ref={itemsRef} className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-2">
          <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-3 py-2">
            Messages
          </h4>

          {conversations.map((conversation) => {
            const isActive = activeConversation === conversation.id;
            const lastMessage = conversation.lastMessage;
            const isOnline = conversation.isGroup
              ? false
              : isUserOnline(conversation.participants.find(p => p._id !== currentUser?.id)?._id || '');

            return (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-300 group ${isActive
                  ? 'bg-[var(--electric-blue)]/10 border border-[var(--electric-blue)]/30'
                  : 'hover:bg-[var(--surface-light)] border border-transparent'
                  }`}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conversation.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-[var(--electric-blue)] to-[#8a2be2] text-white">
                      {conversation.isGroup ? (
                        <Users className="w-5 h-5" />
                      ) : (
                        conversation.name?.charAt(0) || 'C'
                      )}
                    </AvatarFallback>
                  </Avatar>
                  {!conversation.isGroup && isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[var(--neon-green)] rounded-full border-2 border-[var(--surface)] online-pulse" />
                  )}
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className={`font-medium text-sm truncate ${isActive ? 'text-[var(--electric-blue)]' : 'text-[var(--text-primary)]'
                      }`}>
                      {conversation.name}
                    </h5>
                    {lastMessage && (
                      <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                        {formatTime(lastMessage.timestamp || lastMessage.createdAt)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 mt-0.5">
                    {lastMessage ? (
                      <>
                        {lastMessage.senderId === currentUser?.id && (
                          <span className="text-[var(--electric-blue)]">
                            {lastMessage.readBy && lastMessage.readBy.length > 0 ? (
                              <CheckCheck className="w-3.5 h-3.5" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </span>
                        )}
                        <p className={`text-sm truncate ${conversation.unreadCount > 0
                          ? 'text-[var(--text-primary)] font-medium'
                          : 'text-[var(--text-muted)]'
                          }`}>
                          {lastMessage.content}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-[var(--text-muted)] italic">No messages yet</p>
                    )}
                  </div>
                </div>

                {conversation.unreadCount > 0 && (
                  <Badge className="bg-[var(--electric-blue)] text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--surface-light)]">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>{onlineUsers.length} users online</span>

          <Dialog open={isContactsOpen} onOpenChange={setIsContactsOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-1 hover:text-[var(--electric-blue)] transition-colors">
                <User className="w-4 h-4" />
                Contacts
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[var(--surface)] border-[var(--surface-light)] text-[var(--text-primary)]">
              <DialogHeader>
                <DialogTitle>Contacts</DialogTitle>
                <DialogDescription className="text-[var(--text-muted)]">
                  Manage your contacts and start conversations.
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center space-x-2 my-4">
                <div className="grid flex-1 gap-2">
                  <Input
                    placeholder="Add by username or email..."
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    className="bg-[var(--surface-light)] border-none text-[var(--text-primary)]"
                  />
                </div>
                <Button type="submit" size="sm" onClick={handleAddContact} className="bg-[var(--electric-blue)] hover:bg-[var(--electric-blue)]/80">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
              {addError && <p className="text-red-500 text-sm mb-2">{addError}</p>}
              {addSuccess && <p className="text-green-500 text-sm mb-2">{addSuccess}</p>}

              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2 text-[var(--text-muted)]">Your Contacts</h4>
                <ScrollArea className="h-[200px] w-full rounded-md border border-[var(--surface-light)] p-4">
                  {contacts.length === 0 ? (
                    <p className="text-sm text-[var(--text-muted)] text-center py-4">No contacts yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {contacts.map(contact => (
                        <div key={contact._id} className="flex items-center justify-between p-2 hover:bg-[var(--surface-light)] rounded-lg transition-colors">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-[var(--surface-light)] text-xs">
                                {contact.username.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{contact.username}</span>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleContactClick(contact._id)}>
                            <MessageSquare className="w-4 h-4 text-[var(--electric-blue)]" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Settings Dialog */}
      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        currentUser={currentUser}
        onUpdateProfile={onUpdateProfile}
      />
    </div>
  );
};