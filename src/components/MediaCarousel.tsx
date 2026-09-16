import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaCard } from './MediaCard';
import { MediaItem } from '../types';

interface MediaCarouselProps {
  id: string;
  title: string;
  subtitle?: string;
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
  onWatch: (item: MediaItem) => void;
  aspect?: 'portrait' | 'landscape';
}

export const MediaCarousel: React.FC<MediaCarouselProps> = ({
  id,
  title,
  subtitle,
  items,
  onSelect,
  onWatch,
  aspect = 'portrait',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (!items || items.length === 0) return null;

  return (
    <section id={`carousel-section-${id}`} className="relative py-6 sm:py-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{title}</span>
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 font-normal">
              {subtitle}
            </p>
          )}
        </div>

        {/* Desktop Controls */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            aria-label="Previous items"
            className="p-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            aria-label="Next items"
            className="p-2 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1 -mx-2 px-2"
        >
          {items.map((item) => (
            <div
              key={`${id}-${item.id}`}
              className={`flex-none ${
                aspect === 'landscape'
                  ? 'w-[260px] sm:w-[320px] md:w-[360px]'
                  : 'w-[150px] sm:w-[190px] md:w-[210px] lg:w-[220px]'
              }`}
            >
              <MediaCard
                item={item}
                onSelect={onSelect}
                onWatch={onWatch}
                aspect={aspect}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
