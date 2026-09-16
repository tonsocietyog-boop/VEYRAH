import React from 'react';
import { MOODS } from '../data/catalog';
import { Mood } from '../types';
import { MoodIcon } from './MoodIcon';

interface MoodSelectorProps {
  selectedMood: Mood | null;
  onSelectMood: (mood: Mood | null) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onSelectMood,
}) => {
  return (
    <section id="veyra-mood-selector" className="py-6 sm:py-8 border-y border-white/5 bg-[#090b10]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-amber-400">
              Atmosphere & Tone
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5 font-serif">
              What are you in the mood for?
            </h2>
          </div>

          {selectedMood && (
            <button
              onClick={() => onSelectMood(null)}
              className="text-xs text-zinc-400 hover:text-amber-300 underline self-start md:self-auto cursor-pointer"
            >
              Reset to all moods
            </button>
          )}
        </div>

        {/* Mood Pills Grid / Flex */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {MOODS.map((mood) => {
            const isSelected = selectedMood === mood.id;
            return (
              <button
                key={mood.id}
                id={`mood-btn-${mood.id.toLowerCase()}`}
                onClick={() => onSelectMood(isSelected ? null : mood.id)}
                title={mood.description}
                className={`flex items-center sm:flex-col sm:items-center justify-start sm:justify-center p-3 rounded-xl border text-left sm:text-center transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-amber-400 text-black border-amber-300 font-bold shadow-lg shadow-amber-400/20 scale-[1.02]'
                    : 'bg-[#12141c] hover:bg-[#181b26] border-white/5 hover:border-amber-400/30 text-zinc-300 hover:text-white'
                }`}
              >
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center sm:mb-2 mr-2.5 sm:mr-0 transition-all ${
                    isSelected
                      ? 'bg-black/15 text-black'
                      : 'bg-white/5 text-amber-400 group-hover:bg-amber-400/15 group-hover:text-amber-300'
                  }`}
                >
                  <MoodIcon
                    mood={mood.id}
                    className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2] group-hover:scale-110 transition-transform"
                  />
                </div>
                <span className="text-xs sm:text-sm font-semibold tracking-tight whitespace-nowrap">
                  {mood.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
