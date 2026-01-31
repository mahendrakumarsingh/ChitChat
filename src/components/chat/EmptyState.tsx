import React from 'react';
import { MessageSquare, Users, Zap, Shield } from 'lucide-react';

export const EmptyState: React.FC = () => {
  const features = [
    {
      icon: Zap,
      title: 'Real-time Messaging',
      description: 'Instant message delivery with live typing indicators',
    },
    {
      icon: Users,
      title: 'Group Chats',
      description: 'Create groups and collaborate with your team',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'End-to-end encryption for all your conversations',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[var(--void)]">
      <div className="text-center max-w-md">
        {/* Logo Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-[var(--electric-blue)] to-[#8a2be2] flex items-center justify-center glow-blue animate-float">
            <MessageSquare className="w-12 h-12 text-white" />
          </div>
          
          {/* Orbiting particles */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '10s' }}>
            <div className="absolute top-0 left-1/2 w-2 h-2 bg-[var(--neon-green)] rounded-full -translate-x-1/2 -translate-y-4" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
            <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-[var(--amber)] rounded-full -translate-x-1/2 translate-y-4" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Welcome to Real-Time Chat
        </h2>
        <p className="text-[var(--text-muted)] mb-8">
          Select a conversation from the sidebar to start messaging, or explore our features below.
        </p>

        {/* Feature Cards */}
        <div className="grid gap-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 rounded-xl bg-[var(--surface)]/50 border border-[var(--surface-light)] hover:border-[var(--electric-blue)]/30 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--surface-light)] flex items-center justify-center group-hover:bg-[var(--electric-blue)]/10 transition-colors">
                <feature.icon className="w-5 h-5 text-[var(--electric-blue)]" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-[var(--text-primary)] text-sm">
                  {feature.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
