import React, { useState } from 'react';
import {
  Bookmark,
  Compass,
  Film,
  Menu,
  MessageSquareText,
  Search,
  Tv,
  User,
  X,
} from 'lucide-react';
import { useUser } from '../context/UserContext';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
  onOpenAiDiscovery: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  onOpenSearch,
  onOpenAiDiscovery,
}) => {
  const { myList, user, openAuthModal } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Movies', path: '/movies' },
    { label: 'TV Shows', path: '/tv' },
    { label: 'Discover', path: '/discover' },
  ];

  const handleNav = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        id="veyra-navbar"
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-gradient-to-b from-[#08090d]/95 via-[#08090d]/80 to-transparent backdrop-blur-md border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <button
              id="veyra-brand-logo"
              onClick={() => handleNav('/')}
              className="group flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-200 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <span className="font-serif font-black text-black text-lg leading-none tracking-tighter">V</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif tracking-[0.22em] text-xl font-extrabold text-white group-hover:text-amber-300 transition-colors">
                  VEYRAH
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive =
                  link.path === '/'
                    ? currentPath === '/'
                    : currentPath.startsWith(link.path);
                return (
                  <button
                    key={link.path}
                    id={`nav-link-${link.label.toLowerCase().replace(' ', '-')}`}
                    onClick={() => handleNav(link.path)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? 'text-white bg-white/10 font-semibold shadow-inner'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Ask Veyrah AI Pill */}
            <button
              id="btn-ask-veyra-ai"
              onClick={onOpenAiDiscovery}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-yellow-500/15 hover:from-amber-500/30 hover:to-yellow-500/25 border border-amber-400/30 text-amber-200 hover:text-amber-100 text-xs sm:text-sm font-medium transition-all shadow-sm shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-95"
              title="Ask Veyrah for natural language recommendations"
            >
              <MessageSquareText className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold tracking-wide">Ask Veyrah</span>
            </button>

            {/* Global Search Button */}
            <button
              id="btn-nav-search"
              onClick={onOpenSearch}
              className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 transition-colors flex items-center gap-2 text-sm"
              aria-label="Search movies, TV shows, cast"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline text-xs text-zinc-400">Search</span>
              <kbd className="hidden lg:inline text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 border border-white/5">
                ⌘K
              </kbd>
            </button>

            {/* My List Desktop */}
            <button
              id="btn-nav-my-list"
              onClick={() => handleNav('/my-list')}
              className={`relative p-2 rounded-full border transition-colors ${
                currentPath === '/my-list'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-zinc-900/80 border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title="My Saved List"
              aria-label="My List"
            >
              <Bookmark className="w-4 h-4" />
              {myList.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black font-bold text-[10px] flex items-center justify-center">
                  {myList.length > 9 ? '9+' : myList.length}
                </span>
              )}
            </button>

            {/* Profile / Auth */}
            <button
              id="btn-nav-profile"
              onClick={openAuthModal}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 transition-colors text-xs text-zinc-300"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-500 flex items-center justify-center text-white text-[11px] font-bold">
                {user?.name ? user.name[0].toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <span className="hidden sm:inline font-medium text-zinc-200">
                {user?.isGuest ? 'Guest' : user?.name}
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-6 bg-[#0c0e14]/95 backdrop-blur-xl border-b border-white/10 space-y-2">
            <div className="grid grid-cols-2 gap-2 pt-2">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => handleNav(link.path)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
                    currentPath === link.path
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-zinc-900/80 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {link.label === 'Home' && <Film className="w-4 h-4" />}
                  {link.label === 'Movies' && <Film className="w-4 h-4" />}
                  {link.label === 'TV Shows' && <Tv className="w-4 h-4" />}
                  {link.label === 'Discover' && <Compass className="w-4 h-4" />}
                  {link.label}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
              <span>VEYRAH Cinema 4K</span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal();
                }}
                className="text-amber-400 hover:underline"
              >
                {user?.isGuest ? 'Sign In' : 'Account Details'}
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
