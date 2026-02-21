import { Wifi, WifiOff } from 'lucide-react';

export const ConnectionStatus = ({ isConnected }) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
        isConnected 
          ? 'bg-[var(--neon-green)]/10 border border-[var(--neon-green)]/30 text-[var(--neon-green)]' 
          : 'bg-[var(--crimson)]/10 border border-[var(--crimson)]/30 text-[var(--crimson)]'
      }`}>
        {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
        <span>{isConnected ? 'Connected' : 'Reconnecting...'}</span>
      </div>
    </div>
  );
};