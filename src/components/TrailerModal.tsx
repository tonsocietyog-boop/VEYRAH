import React, { useEffect } from 'react';
import { Clapperboard, X } from 'lucide-react';

interface TrailerModalProps {
  trailerKey: string | null;
  title: string;
  onClose: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  trailerKey,
  title,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!trailerKey) return null;

  return (
    <div
      id="trailer-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        id="trailer-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-[#0b0c12] border border-white/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header Bar */}
        <div className="px-4 py-3 bg-[#11131a] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Clapperboard className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-sm truncate max-w-xs sm:max-w-md">
              {title} — Official Trailer
            </span>
          </div>

          <button
            id="btn-close-trailer"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
            title={`${title} Official Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>

        {/* Footer Note */}
        <div className="px-4 py-2 bg-[#0d0e14] border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Official Studio Trailer Feed (4K/1080p)</span>
          <span className="text-zinc-500">Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
