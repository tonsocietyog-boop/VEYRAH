import React from 'react';
import { tmdbImages } from '../services/tmdbService';
import { CastMember, CrewMember } from '../types';

interface CastCarouselProps {
  cast?: CastMember[];
  crew?: CrewMember[];
}

export const CastCarousel: React.FC<CastCarouselProps> = ({ cast, crew }) => {
  if (!cast || cast.length === 0) return null;

  return (
    <div className="space-y-6">
      {/* Cast Section */}
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>Top Cast</span>
          <span className="text-xs text-zinc-500 font-normal">({cast.length} actors)</span>
        </h3>

        <div className="flex gap-3.5 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1 -mx-2 px-2">
          {cast.map((actor) => {
            const photoUrl = tmdbImages.profile(actor.profile_path, 'w185');

            return (
              <div
                key={actor.id}
                className="flex-none w-28 sm:w-32 bg-[#10121a] rounded-xl overflow-hidden border border-white/5 group hover:border-amber-400/30 transition-all"
              >
                <div className="aspect-[3/4] w-full bg-zinc-800 overflow-hidden relative">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={actor.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-semibold">
                      {actor.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                  )}
                </div>

                <div className="p-2.5">
                  <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                    {actor.name}
                  </h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                    {actor.character}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Crew Section if available */}
      {crew && crew.length > 0 && (
        <div className="pt-4 border-t border-white/5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
            Featured Crew
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {crew.slice(0, 4).map((member, i) => (
              <div key={i} className="text-xs">
                <p className="font-bold text-white">{member.name}</p>
                <p className="text-zinc-400">{member.job}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
