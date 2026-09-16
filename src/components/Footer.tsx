import React from 'react';
import { Film, MessageSquareText, Shield } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
  onOpenAiDiscovery: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAiDiscovery }) => {
  return (
    <footer className="border-t border-white/5 bg-[#06070b] text-zinc-400 text-xs py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-200 flex items-center justify-center font-serif font-black text-black text-sm">
                V
              </div>
              <span className="font-serif tracking-[0.22em] text-lg font-extrabold text-white">
                VEYRAH
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-amber-400 border border-white/5">
                4K Ultra Cinema
              </span>
            </div>
            <p className="text-zinc-500 text-xs max-w-sm">
              An original cinematic discovery platform designed for pure storytelling, architectural elegance, and grounded Gemini AI curation.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-6 text-xs font-medium">
            <button
              onClick={() => onNavigate('/')}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('/movies')}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Movies
            </button>
            <button
              onClick={() => onNavigate('/tv')}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              TV Series
            </button>
            <button
              onClick={() => onNavigate('/discover')}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Discover
            </button>
            <button
              onClick={() => onNavigate('/my-list')}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              My List
            </button>
            <button
              onClick={onOpenAiDiscovery}
              className="text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center gap-1.5"
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>Ask Veyrah</span>
            </button>
          </div>
        </div>

        {/* Legal & Attribution Disclaimer */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-zinc-500">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-zinc-400" />
            <span>
              Content policy: VEYRAH does not host, download, or scrape copyrighted video files. Video playback utilizes authorized studio YouTube trailer feeds and modular licensed DRM distribution channels.
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span>Powered by TMDB & Google Gemini</span>
            <span>© {new Date().getFullYear()} VEYRAH. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
