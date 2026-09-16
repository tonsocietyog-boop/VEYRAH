import React from 'react';
import { Bookmark, Compass, Film, Home, Search, Tv } from 'lucide-react';
import { useUser } from '../context/UserContext';

interface MobileNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentPath,
  onNavigate,
  onOpenSearch,
}) => {
  const { myList } = useUser();

  const items = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Movies', path: '/movies', icon: Film },
    { label: 'TV', path: '/tv', icon: Tv },
    { label: 'Discover', path: '/discover', icon: Compass },
    { label: 'Search', action: onOpenSearch, icon: Search },
    { label: 'My List', path: '/my-list', icon: Bookmark, badge: myList.length },
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0b10]/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 safe-area-bottom"
    >
      <div className="grid grid-cols-6 items-center justify-items-center">
        {items.map((item, idx) => {
          const isActive = item.path
            ? item.path === '/'
              ? currentPath === '/'
              : currentPath.startsWith(item.path)
            : false;
          const Icon = item.icon;

          return (
            <button
              key={idx}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else if (item.path) {
                  onNavigate(item.path);
                }
              }}
              className={`flex flex-col items-center justify-center w-full py-1 relative transition-colors ${
                isActive ? 'text-amber-400 font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-black text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] tracking-tight mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
