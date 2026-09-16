import React, { createContext, useContext, useEffect, useState } from 'react';
import { ContinueWatchingItem, MediaItem, MediaType, UserListItem, UserProfile } from '../types';

interface UserContextType {
  user: UserProfile | null;
  myList: UserListItem[];
  continueWatching: ContinueWatchingItem[];
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, name: string) => void;
  logout: () => void;
  addToMyList: (item: MediaItem) => void;
  removeFromMyList: (mediaId: number) => void;
  isInMyList: (mediaId: number) => boolean;
  updateWatchProgress: (item: {
    mediaId: number;
    mediaType: MediaType;
    title: string;
    posterPath: string | null;
    backdropPath: string | null;
    progressPercent: number;
    currentTimeSeconds: number;
    durationSeconds: number;
    season?: number;
    episode?: number;
    episodeTitle?: string;
  }) => void;
  clearWatchHistoryItem: (mediaId: number) => void;
  lastWatchedMedia: ContinueWatchingItem | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const MY_LIST_STORAGE_KEY = 'veyra_my_list';
const CONTINUE_WATCHING_STORAGE_KEY = 'veyra_continue_watching';
const USER_PROFILE_STORAGE_KEY = 'veyra_user_profile';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
      return saved
        ? JSON.parse(saved)
        : {
            id: 'guest-usr-01',
            email: 'guest@veyrah.stream',
            name: 'Cinema Guest',
            isGuest: true,
            avatarSeed: 'VeyrahViewer',
          };
    } catch {
      return null;
    }
  });

  const [myList, setMyList] = useState<UserListItem[]>(() => {
    try {
      const saved = localStorage.getItem(MY_LIST_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Default initial saved list for instant high-craft demo
    return [
      {
        mediaId: 693134,
        mediaType: 'movie',
        title: 'Dune: Part Two',
        posterPath: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
        backdropPath: '/xOMo8BRK7PfcJv9JCnx7s520Wio.jpg',
        voteAverage: 8.2,
        releaseYear: '2024',
        addedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        mediaId: 115036,
        mediaType: 'tv',
        title: 'Severance',
        posterPath: '/975b9k2C1J6e5iW3e7v1g5Y8oP.jpg',
        backdropPath: '/bS3Wz5g8p7n4L1C6f2h9k0q1.jpg',
        voteAverage: 8.4,
        releaseYear: '2022',
        addedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
    ];
  });

  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>(() => {
    try {
      const saved = localStorage.getItem(CONTINUE_WATCHING_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Default sample continue watching for rich first load experience
    return [
      {
        mediaId: 872585,
        mediaType: 'movie',
        title: 'Oppenheimer',
        posterPath: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        backdropPath: '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
        progressPercent: 72,
        currentTimeSeconds: 7776,
        durationSeconds: 10800,
        lastWatched: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        mediaId: 126308,
        mediaType: 'tv',
        title: 'Shōgun',
        posterPath: '/7O4iVfOMQmdCSxhOg1WNzG1AgYT.jpg',
        backdropPath: '/5zmiBoMzeV4Q5Ajq79o0iG0d19.jpg',
        progressPercent: 45,
        currentTimeSeconds: 1620,
        durationSeconds: 3600,
        season: 1,
        episode: 2,
        episodeTitle: 'Chapter Two: Servants of Two Masters',
        lastWatched: new Date(Date.now() - 3600000 * 18).toISOString(),
      },
    ];
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(MY_LIST_STORAGE_KEY, JSON.stringify(myList));
    } catch {
      // ignore
    }
  }, [myList]);

  useEffect(() => {
    try {
      localStorage.setItem(CONTINUE_WATCHING_STORAGE_KEY, JSON.stringify(continueWatching));
    } catch {
      // ignore
    }
  }, [continueWatching]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(user));
      }
    } catch {
      // ignore
    }
  }, [user]);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const login = (email: string, name: string) => {
    setUser({
      id: `usr-${Date.now()}`,
      email,
      name: name || email.split('@')[0],
      isGuest: false,
      avatarSeed: name || 'VeyrahUser',
    });
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser({
      id: `guest-${Date.now()}`,
      email: 'guest@veyrah.stream',
      name: 'Cinema Guest',
      isGuest: true,
      avatarSeed: 'Guest',
    });
  };

  const addToMyList = (item: MediaItem) => {
    setMyList((prev) => {
      if (prev.some((entry) => entry.mediaId === item.id)) {
        return prev;
      }
      const year = (item.release_date || item.first_air_date || '').slice(0, 4) || '2024';
      const newItem: UserListItem = {
        mediaId: item.id,
        mediaType: item.media_type,
        title: item.title || item.name || 'Untitled',
        posterPath: item.poster_path,
        backdropPath: item.backdrop_path,
        voteAverage: item.vote_average || 8.0,
        releaseYear: year,
        addedAt: new Date().toISOString(),
      };
      return [newItem, ...prev];
    });
  };

  const removeFromMyList = (mediaId: number) => {
    setMyList((prev) => prev.filter((entry) => entry.mediaId !== mediaId));
  };

  const isInMyList = (mediaId: number) => {
    return myList.some((entry) => entry.mediaId === mediaId);
  };

  const updateWatchProgress = (item: {
    mediaId: number;
    mediaType: MediaType;
    title: string;
    posterPath: string | null;
    backdropPath: string | null;
    progressPercent: number;
    currentTimeSeconds: number;
    durationSeconds: number;
    season?: number;
    episode?: number;
    episodeTitle?: string;
  }) => {
    setContinueWatching((prev) => {
      const filtered = prev.filter((c) => c.mediaId !== item.mediaId);
      const updated: ContinueWatchingItem = {
        ...item,
        lastWatched: new Date().toISOString(),
      };
      return [updated, ...filtered].slice(0, 15);
    });
  };

  const clearWatchHistoryItem = (mediaId: number) => {
    setContinueWatching((prev) => prev.filter((item) => item.mediaId !== mediaId));
  };

  const lastWatchedMedia = continueWatching[0] || null;

  return (
    <UserContext.Provider
      value={{
        user,
        myList,
        continueWatching,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        logout,
        addToMyList,
        removeFromMyList,
        isInMyList,
        updateWatchProgress,
        clearWatchHistoryItem,
        lastWatchedMedia,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
