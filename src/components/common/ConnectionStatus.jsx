import { WifiOff } from 'lucide-react';

export const ConnectionStatus = ({ isConnected }) => {
  if (isConnected) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--crimson)]/10 border border-[var(--crimson)]/30 text-[var(--crimson)] text-sm">
        <WifiOff className="w-4 h-4" />
        <span>Reconnecting...</span>
      </div>
    </div>
  );
};