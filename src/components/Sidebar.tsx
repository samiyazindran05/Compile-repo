import { useState } from 'react';
import {
  LayoutDashboard, BookOpen, Briefcase, Layers, Users, X, StickyNote,
  CalendarDays, ListChecks, Calculator, NotebookPen, Compass, FunctionSquare,
  LineChart, Clock, Scale, HelpCircle, GitFork, FileCheck, Plus, Pencil, Check,
  Play, FileText, ArrowUpRight,
} from 'lucide-react';
import type { Theme, Mode } from '../themes';
import type { TodoListData } from './TodoList';

type NavItem = {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  subItems?: NavItem[];
};

const modeIcon: Record<Mode, typeof LayoutDashboard> = {
  Study: BookOpen,
  Work: Briefcase,
  Universal: Layers,
};

const modeSubItems: Record<Mode, NavItem[]> = {
  Study: [
    { id: 'study-notes', label: 'Notes', icon: StickyNote },
    { id: 'study-calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'study-todo', label: 'To Do List', icon: ListChecks },
    { id: 'study-calculator', label: 'Calculator', icon: Calculator },
  ],
  Work: [
    { id: 'work-notes', label: 'Notes', icon: StickyNote },
    { id: 'work-calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'work-todo', label: 'To Do List', icon: ListChecks },
  ],
  Universal: [
    { id: 'universal-notes', label: 'Notes', icon: StickyNote },
    { id: 'universal-calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'universal-todo', label: 'To Do List', icon: ListChecks },
  ],
};

const communitySubItems: Record<Mode, NavItem[]> = {
  Study: [
    { id: 'community-browse-notes', label: 'Browse Notes', icon: Compass },
    { id: 'community-doubts', label: 'Doubts', icon: HelpCircle },
    { id: 'community-diagrams', label: 'Diagrams', icon: GitFork },
    { id: 'community-mock-tests', label: 'Mock Tests', icon: FileCheck },
  ],
  Work: [],
  Universal: [],
};

const trackerSubItems: NavItem[] = [
  { id: 'tracker-time-spent', label: 'Time Spent', icon: Clock },
  { id: 'tracker-strengths', label: 'Strengths & Weaknesses', icon: Scale },
];

const quickAppsItems: NavItem[] = [
  { id: 'ext-youtube', label: 'YouTube', icon: Play },
  { id: 'ext-docs', label: 'Google Docs', icon: FileText },
  { id: 'ext-drive', label: 'Google Drive', icon: ArrowUpRight },
  { id: 'ext-notion', label: 'Notion', icon: FileText },
];

const modeExtraItems: Record<Mode, NavItem[]> = {
  Study: [
    { id: 'study-my-notes', label: 'My Notes', icon: NotebookPen },
    { id: 'study-formulae', label: 'Formulae', icon: FunctionSquare },
    { id: 'study-tracker', label: 'Tracker', icon: LineChart, subItems: trackerSubItems },
  ],
  Work: [
    { id: 'work-my-notes', label: 'My Notes', icon: NotebookPen },
    { id: 'work-tracker', label: 'Tracker', icon: LineChart, subItems: trackerSubItems },
  ],
  Universal: [
    { id: 'universal-my-notes', label: 'My Notes', icon: NotebookPen },
    { id: 'universal-tracker', label: 'Tracker', icon: LineChart, subItems: trackerSubItems },
  ],
};

type SidebarProps = {
  active: string;
  onSelect: (id: string) => void;
  mobileOpen: boolean;
  onClose: () => void;
  theme: Theme;
  todoLists: TodoListData[];
  onAddTodoList: () => void;
  onRenameTodoList: (id: string, name: string) => void;
};

export default function Sidebar({
  active, onSelect, mobileOpen, onClose, theme, todoLists, onAddTodoList, onRenameTodoList,
}: SidebarProps) {
  const modeIconForCurrent = modeIcon[theme.mode];
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mode', label: `${theme.mode} Mode`, icon: modeIconForCurrent },
    { id: 'community', label: 'Community Notes', icon: Users, subItems: (communitySubItems[theme.mode] ?? []) },
  ];
  const subItems = modeSubItems[theme.mode] ?? [];
  const extraItems = modeExtraItems[theme.mode] ?? [];

  // Determine if a todo root is active (to expand the list)
  const todoRootId = subItems.find((s) => s.label === 'To Do List')?.id ?? null;
  const isTodoActive = todoRootId !== null && (active === todoRootId || todoLists.some((l) => l.id === active));

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          'fixed z-40 inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg ${theme.logoBg} flex items-center justify-center transition-colors duration-300`}>
              <span className="text-white font-bold text-sm tracking-tight">C</span>
            </div>
            <span className="font-semibold text-gray-900 text-lg tracking-tight">Com<span className="font-sans">π</span>le</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-900 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 pb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive = active === item.id;
            const Icon = item.icon;
            return (
              <div key={item.id}>
                <button
                  onClick={() => { onSelect(item.id); onClose(); }}
                  className={[
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? `${theme.navActiveBg} ${theme.navActiveText}`
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  ].join(' ')}
                >
                  <Icon size={18} strokeWidth={2} />
                  {item.label}
                </button>
                {item.id === 'mode' && subItems.length > 0 && (
                  <div className="mt-1 ml-5 pl-3 border-l border-gray-200 space-y-0.5">
                    {subItems.map((sub) => {
                      const isSubActive = active === sub.id;
                      const SubIcon = sub.icon;
                      const isTodoSub = sub.id === todoRootId;
                      return (
                        <div key={sub.id}>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => { onSelect(sub.id); onClose(); }}
                              className={[
                                'flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                                isSubActive
                                  ? `${theme.accentSoft} ${theme.accentText} font-medium`
                                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
                              ].join(' ')}
                            >
                              <SubIcon size={16} strokeWidth={2} />
                              {sub.label}
                            </button>
                            {isTodoSub && (
                              <button
                                onClick={(e) => { e.stopPropagation(); onAddTodoList(); }}
                                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                title="Add new to-do list"
                                aria-label="Add new to-do list"
                              >
                                <Plus size={15} />
                              </button>
                            )}
                          </div>

                          {/* Individual todo lists nested under To Do List */}
                          {isTodoSub && isTodoActive && todoLists.length > 0 && (
                            <div className="mt-0.5 ml-5 pl-3 border-l border-gray-100 space-y-0.5">
                              {todoLists.map((tl) => (
                                <TodoListNavItem
                                  key={tl.id}
                                  list={tl}
                                  active={active === tl.id}
                                  onSelect={() => { onSelect(tl.id); onClose(); }}
                                  onRename={(name) => onRenameTodoList(tl.id, name)}
                                  theme={theme}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {item.id === 'community' && item.subItems && item.subItems.length > 0 && (
                  <div className="mt-1 ml-5 pl-3 border-l border-gray-200 space-y-0.5">
                    {item.subItems.map((sub) => {
                      const isSubActive = active === sub.id;
                      const SubIcon = sub.icon;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => { onSelect(sub.id); onClose(); }}
                          className={[
                            'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                            isSubActive
                              ? `${theme.accentSoft} ${theme.accentText} font-medium`
                              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
                          ].join(' ')}
                        >
                          <SubIcon size={16} strokeWidth={2} />
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {extraItems.length > 0 && (
            <div className="pt-2 space-y-1">
              {extraItems.map((item) => {
                const isActive = active === item.id;
                const Icon = item.icon;
                return (
                  <div key={item.id}>
                    <button
                      onClick={() => { onSelect(item.id); onClose(); }}
                      className={[
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                        isActive
                          ? `${theme.navActiveBg} ${theme.navActiveText}`
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                      ].join(' ')}
                    >
                      <Icon size={18} strokeWidth={2} />
                      {item.label}
                    </button>
                    {item.subItems && item.subItems.length > 0 && (
                      <div className="mt-1 ml-5 pl-3 border-l border-gray-200 space-y-0.5">
                        {item.subItems.map((sub) => {
                          const isSubActive = active === sub.id;
                          const SubIcon = sub.icon;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => { onSelect(sub.id); onClose(); }}
                              className={[
                                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                                isSubActive
                                  ? `${theme.accentSoft} ${theme.accentText} font-medium`
                                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
                              ].join(' ')}
                            >
                              <SubIcon size={16} strokeWidth={2} />
                              {sub.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Apps */}
          <div className="pt-4">
            <p className="px-3 pb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Quick Apps
            </p>
            <div className="space-y-0.5">
              {quickAppsItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onSelect(item.id); onClose(); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                  >
                    <Icon size={16} strokeWidth={2} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 text-xs font-semibold">ST</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Student</p>
              <p className="text-xs text-gray-500 truncate">Free plan</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function TodoListNavItem({
  list,
  active,
  onSelect,
  onRename,
  theme,
}: {
  list: TodoListData;
  active: boolean;
  onSelect: () => void;
  onRename: (name: string) => void;
  theme: Theme;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(list.name);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== list.name) onRename(trimmed);
    else setDraft(list.name);
    setEditing(false);
  }

  return (
    <div className="flex items-center group">
      {editing ? (
        <div className="flex-1 flex items-center gap-1 px-2 py-1.5">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(list.name); setEditing(false); } }}
            className="flex-1 min-w-0 text-sm bg-transparent border-b border-gray-300 focus:border-gray-700 focus:outline-none px-1 py-0.5 text-gray-700"
          />
          <button
            onClick={commit}
            className="shrink-0 p-0.5 text-gray-400 hover:text-gray-900 transition-colors"
            aria-label="Save name"
          >
            <Check size={13} />
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={onSelect}
            className={[
              'flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 truncate',
              active
                ? `${theme.accentSoft} ${theme.accentText} font-medium`
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
            ].join(' ')}
          >
            <ListChecks size={14} strokeWidth={2} className="shrink-0" />
            <span className="truncate">{list.name}</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDraft(list.name); setEditing(true); }}
            className="shrink-0 w-6 h-6 flex items-center justify-center rounded text-gray-300 hover:text-gray-700 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
            title="Rename list"
            aria-label="Rename list"
          >
            <Pencil size={12} />
          </button>
        </>
      )}
    </div>
  );
}
