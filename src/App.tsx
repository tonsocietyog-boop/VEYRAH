import React, { useEffect, useState } from 'react';
import { AskVeyraModal } from './components/AskVeyraModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { MobileNav } from './components/MobileNav';
import { Navbar } from './components/Navbar';
import { SearchOverlay } from './components/SearchOverlay';
import { TrailerModal } from './components/TrailerModal';
import { UserProvider } from './context/UserContext';
import { CATALOG_ITEMS } from './data/catalog';
import { DetailPage } from './pages/DetailPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { MyListPage } from './pages/MyListPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { TVShowsPage } from './pages/TVShowsPage';
import { WatchPage } from './pages/WatchPage';
import { MediaItem } from './types';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [watchTarget, setWatchTarget] = useState<{
    media: MediaItem;
    season?: number;
    episode?: number;
  } | null>(null);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiDiscoveryOpen, setIsAiDiscoveryOpen] = useState(false);
  const [trailerModal, setTrailerModal] = useState<{
    isOpen: boolean;
    trailerKey: string | null;
    title: string;
  }>({
    isOpen: false,
    trailerKey: null,
    title: '',
  });

  // Search Results Query
  const [activeSearchQuery, setActiveSearchQuery] = useState('');

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMedia = (item: MediaItem) => {
    setSelectedMedia(item);
    setCurrentPath(`/detail/${item.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWatchMedia = (item: MediaItem, season?: number, episode?: number) => {
    setWatchTarget({ media: item, season, episode });
    setCurrentPath(`/watch/${item.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTrailer = (trailerKey: string, title: string) => {
    setTrailerModal({
      isOpen: true,
      trailerKey,
      title,
    });
  };

  const handleCloseTrailer = () => {
    setTrailerModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleViewAllSearchResults = (query: string) => {
    setActiveSearchQuery(query);
    setCurrentPath('/search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <UserProvider>
      <div className="min-h-screen bg-[#08090d] text-zinc-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
        {/* Top Sticky Navigation */}
        <Navbar
          currentPath={currentPath}
          onNavigate={handleNavigate}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAiDiscovery={() => setIsAiDiscoveryOpen(true)}
        />

        {/* Main Content Router */}
        <main className="flex-1">
          {currentPath === '/' && (
            <HomePage
              onSelectMedia={handleSelectMedia}
              onWatchMedia={handleWatchMedia}
              onOpenTrailer={handleOpenTrailer}
              onOpenAiDiscovery={() => setIsAiDiscoveryOpen(true)}
            />
          )}

          {currentPath === '/movies' && (
            <MoviesPage
              onSelectMedia={handleSelectMedia}
              onWatchMedia={handleWatchMedia}
            />
          )}

          {currentPath === '/tv' && (
            <TVShowsPage
              onSelectMedia={handleSelectMedia}
              onWatchMedia={handleWatchMedia}
            />
          )}

          {currentPath === '/discover' && (
            <DiscoverPage
              onSelectMedia={handleSelectMedia}
              onWatchMedia={handleWatchMedia}
              onOpenAiDiscovery={() => setIsAiDiscoveryOpen(true)}
            />
          )}

          {currentPath === '/my-list' && (
            <MyListPage
              onSelectMedia={handleSelectMedia}
              onWatchMedia={handleWatchMedia}
              onExploreCatalog={() => handleNavigate('/discover')}
            />
          )}

          {currentPath === '/search' && (
            <SearchResultsPage
              initialQuery={activeSearchQuery}
              onSelectMedia={handleSelectMedia}
              onWatchMedia={handleWatchMedia}
            />
          )}

          {currentPath.startsWith('/detail') && (
            <DetailPage
              media={selectedMedia || CATALOG_ITEMS[0]}
              onWatch={handleWatchMedia}
              onOpenTrailer={handleOpenTrailer}
              onSelectSimilar={handleSelectMedia}
            />
          )}

          {currentPath.startsWith('/watch') && (
            <WatchPage
              media={watchTarget?.media || selectedMedia || CATALOG_ITEMS[0]}
              initialSeason={watchTarget?.season}
              initialEpisode={watchTarget?.episode}
              onBack={() => {
                if (watchTarget?.media) {
                  handleSelectMedia(watchTarget.media);
                } else {
                  handleNavigate('/');
                }
              }}
              onSelectSimilar={handleSelectMedia}
              onOpenTrailer={handleOpenTrailer}
            />
          )}
        </main>

        {/* Global Footer */}
        <Footer
          onNavigate={handleNavigate}
          onOpenAiDiscovery={() => setIsAiDiscoveryOpen(true)}
        />

        {/* Mobile Bottom Navigation */}
        <MobileNav
          currentPath={currentPath}
          onNavigate={handleNavigate}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Overlays & Modals */}
        <SearchOverlay
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onSelectMedia={handleSelectMedia}
          onViewAllResults={handleViewAllSearchResults}
        />

        <AskVeyraModal
          isOpen={isAiDiscoveryOpen}
          onClose={() => setIsAiDiscoveryOpen(false)}
          onSelectMedia={handleSelectMedia}
          onWatchMedia={handleWatchMedia}
        />

        <TrailerModal
          trailerKey={trailerModal.trailerKey}
          title={trailerModal.title}
          onClose={handleCloseTrailer}
        />

        <AuthModal />
      </div>
    </UserProvider>
  );
}
