import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Play, Search } from 'lucide-react';
import type { Theme } from '../themes';

type YouTubePanelProps = {
  theme: Theme;
  onClose: () => void;
};

function extractVideoId(input: string): string | null {
  const trimmed = input.trim();
  // Direct video ID (11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  // Standard watch URL
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  // youtu.be short URL
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  // embed URL
  const embedMatch = trimmed.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  return null;
}

export default function YouTubePanel({ theme, onClose }: YouTubePanelProps) {
  const [input, setInput] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  function handleLoad() {
    const trimmed = input.trim();
    if (!trimmed) return;
    const id = extractVideoId(trimmed);
    if (id) {
      setVideoId(id);
      setSearchQuery(null);
    } else {
      // Treat as search query
      setSearchQuery(trimmed);
      setVideoId(null);
    }
  }

  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    : searchQuery
      ? `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(searchQuery)}&autoplay=1`
      : null;

  return (
    <div className="border-b border-gray-200 bg-white shadow-sm">
      {/* Bar */}
      <div className="flex items-center gap-2 px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center">
            <Play size={14} className="text-white fill-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900 hidden sm:inline">YouTube</span>
        </div>

        {/* Search / URL input */}
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-xl">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLoad(); }}
              placeholder="Paste a YouTube link or search a topic..."
              className="w-full rounded-lg border border-gray-200 pl-8 pr-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
          <button
            onClick={handleLoad}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors ${theme.accent} ${theme.accentHover}`}
          >
            Load
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label="Close YouTube"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Player */}
      {!collapsed && (
        <div className="px-4 sm:px-6 lg:px-8 pb-3">
          {embedUrl ? (
            <div className="relative w-full max-w-2xl mx-auto" style={{ aspectRatio: '16 / 9' }}>
              <iframe
                src={embedUrl}
                title="YouTube video player"
                className="absolute inset-0 w-full h-full rounded-lg border border-gray-200"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="max-w-2xl mx-auto rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center py-8 px-4" style={{ aspectRatio: '16 / 9' }}>
              <Play size={28} className="text-gray-300 mb-2" />
              <p className="text-xs text-gray-400 text-center max-w-xs">
                Paste a YouTube link above and hit Load, or type a topic to search.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
                {['Thermodynamics lecture', 'Calculus explained', 'Organic chemistry basics'].map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); setSearchQuery(s); setVideoId(null); }}
                    className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
