import { Menu, Search, Bell, Play } from 'lucide-react';
import ModeSwitcher from './ModeSwitcher';
import type { Theme, Mode } from '../themes';

type HeaderProps = {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onMenuClick: () => void;
  theme: Theme;
  onOpenYouTube: () => void;
};

export default function Header({ mode, onModeChange, onMenuClick, theme, onOpenYouTube }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 transition-colors duration-300">
      <div className="h-full flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: mobile menu + page title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">Dashboard</h1>
        </div>

        {/* Center: mode switcher */}
        <div className="flex-1 flex justify-center">
          <ModeSwitcher mode={mode} onChange={onModeChange} theme={theme} />
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onOpenYouTube}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 h-9 rounded-full text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
            aria-label="Open YouTube"
          >
            <Play size={14} className="fill-white" />
            <span className="hidden sm:inline">YouTube</span>
          </button>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
          <button
            className="relative w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${theme.dotBg} transition-colors duration-300`} />
          </button>
        </div>
      </div>
    </header>
  );
}
