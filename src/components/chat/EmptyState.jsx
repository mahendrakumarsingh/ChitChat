export const EmptyState = () => {
  return (
    <div className="flex-1 flex items-center justify-center bg-[var(--void)]">
      <div className="text-center">
        <div className="w-36 h-36 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[var(--electric-blue)]/10 to-[#8a2be2]/10 flex items-center justify-center animate-float">
          <svg className="w-12 h-12 text-[var(--electric-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No Conversation Selected</h3>
        <p className="text-[var(--text-muted)] max-w-sm">Start by choosing a conversation from the left or create a new message to begin.</p>
      </div>
    </div>
  );
};