import {
  Play, FileText, StickyNote, Calculator, FunctionSquare,
  CalendarDays, ListChecks, Compass, ArrowUpRight,
} from 'lucide-react';
import type { Theme } from '../themes';

type DashboardProps = {
  theme: Theme;
  onNavigate: (id: string) => void;
  onOpenYouTube: () => void;
};

type AppCard = {
  id: string;
  label: string;
  desc: string;
  icon: typeof Play;
  external?: boolean;
  action: () => void;
};

type QuickLink = {
  label: string;
  url: string;
  icon: typeof Play;
  color: string;
};

const QUICK_LINKS: QuickLink[] = [
  { label: 'YouTube', url: 'https://www.youtube.com', icon: Play, color: 'bg-red-600' },
  { label: 'Google Docs', url: 'https://docs.google.com', icon: FileText, color: 'bg-blue-600' },
  { label: 'Google Drive', url: 'https://drive.google.com', icon: ArrowUpRight, color: 'bg-emerald-600' },
  { label: 'Notion', url: 'https://www.notion.so', icon: FileText, color: 'bg-gray-800' },
];

export default function Dashboard({ theme, onNavigate, onOpenYouTube }: DashboardProps) {
  const inAppApps: AppCard[] = [
    { id: 'notes', label: 'Notes', desc: 'Take handwritten or image notes', icon: StickyNote, action: () => onNavigate(`${theme.mode.toLowerCase()}-notes`) },
    { id: 'calculator', label: 'Calculator', desc: 'Scientific calculator', icon: Calculator, action: () => onNavigate('study-calculator') },
    { id: 'formulae', label: 'Formulae', desc: 'Look up topic formulae', icon: FunctionSquare, action: () => onNavigate('study-formulae') },
    { id: 'calendar', label: 'Calendar', desc: 'View your schedule', icon: CalendarDays, action: () => onNavigate(`${theme.mode.toLowerCase()}-calendar`) },
    { id: 'todo', label: 'To Do List', desc: 'Track your tasks', icon: ListChecks, action: () => onNavigate(`${theme.mode.toLowerCase()}-todo`) },
    { id: 'browse', label: 'Browse Notes', desc: 'Community shared notes', icon: Compass, action: () => onNavigate('community-browse-notes') },
  ];

  return (
    <div>
      {/* Hero */}
      <div className={`rounded-2xl border ${theme.cardBorder} ${theme.cardTint} p-6 sm:p-8 mb-6 overflow-hidden relative`}>
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome to Com<span className="font-sans">π</span>le
          </h1>
          <p className={`mt-2 text-sm ${theme.cardAccent} max-w-lg`}>
            Your all-in-one study workspace. Watch lectures, take notes, look up formulae, and manage tasks — all without leaving the app.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={onOpenYouTube}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium text-white transition-all ${theme.accent} ${theme.accentHover} shadow-sm`}
            >
              <Play size={16} className="fill-white" /> Watch a Lecture
            </button>
            <button
              onClick={() => onNavigate(`${theme.mode.toLowerCase()}-notes`)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-all"
            >
              <StickyNote size={16} /> Take Notes
            </button>
          </div>
        </div>
        {/* Decorative blob */}
        <div className={`absolute -top-8 -right-8 w-48 h-48 rounded-full ${theme.accentSoft} opacity-60`} />
        <div className={`absolute top-12 right-20 w-20 h-20 rounded-full ${theme.accentSoft} opacity-40`} />
      </div>

      {/* Quick external apps */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Quick Launch</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 hover:shadow-md transition-all duration-200"
            >
              <div className={`w-9 h-9 rounded-lg ${link.color} flex items-center justify-center shrink-0`}>
                <link.icon size={17} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{link.label}</p>
                <p className="text-[10px] text-gray-400 flex items-center gap-0.5">
                  Open <ArrowUpRight size={9} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* In-app tools */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Study Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {inAppApps.map((app) => (
            <button
              key={app.id}
              onClick={app.action}
              className={`group text-left rounded-xl border ${theme.cardBorder} bg-white p-4 hover:shadow-md transition-all duration-200`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${theme.accentSoft} flex items-center justify-center shrink-0`}>
                  <app.icon size={19} className={theme.accentText} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{app.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{app.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
