import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Calendar from './components/Calendar';
import Notes, { type PageData, type SavedNote } from './components/Notes';
import MyNotes from './components/MyNotes';
import TodoList, { newTodoList, type TodoListData } from './components/TodoList';
import Calculator from './components/Calculator';
import BrowseNotes from './components/BrowseNotes';
import Formulae from './components/Formulae';
import Dashboard from './components/Dashboard';
import YouTubePanel from './components/YouTubePanel';
import { themes, modes, type Mode } from './themes';

const calendarIds = new Set(['study-calendar', 'work-calendar', 'universal-calendar']);
const notesIds = new Set(['study-notes', 'work-notes', 'universal-notes']);
const myNotesIds = new Set(['study-my-notes', 'work-my-notes', 'universal-my-notes']);
const todoRootIds = new Set(['study-todo', 'work-todo', 'universal-todo']);
const calcIds = new Set(['study-calculator']);
const browseNotesIds = new Set(['community-browse-notes']);
const formulaeIds = new Set(['study-formulae']);
const dashboardIds = new Set(['dashboard']);

const externalAppIds = new Set([
  'ext-youtube', 'ext-docs', 'ext-drive', 'ext-notion',
]);

const ROOT_TO_MODE: Record<string, Mode> = {
  'study-todo': 'Study',
  'work-todo': 'Work',
  'universal-todo': 'Universal',
};

const SEED_LISTS: Record<Mode, TodoListData[]> = {
  Study: [newTodoList('Assignments'), newTodoList('Revision')],
  Work: [newTodoList('Projects')],
  Universal: [newTodoList('Personal')],
};

function uid(): string {
  return `n${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
}

function Content({
  active,
  theme,
  todoLists,
  onSelectTodoList,
  onTodoListChange,
  onDeleteTodoList,
  savedNotes,
  onOpenNote,
  onDeleteNote,
  onRenameNote,
  onSaveNote,
  noteInitialPages,
  onNoteExit,
  onOpenYouTube,
}: {
  active: string;
  theme: typeof themes[Mode];
  todoLists: TodoListData[] | null;
  onSelectTodoList: (id: string) => void;
  onTodoListChange: (list: TodoListData) => void;
  onDeleteTodoList: () => void;
  savedNotes: SavedNote[];
  onOpenNote: (note: SavedNote) => void;
  onDeleteNote: (id: string) => void;
  onRenameNote: (id: string, title: string) => void;
  onSaveNote: (title: string, pages: PageData[]) => void;
  noteInitialPages: PageData[] | null;
  onNoteExit: () => void;
  onOpenYouTube: () => void;
}) {
  if (calendarIds.has(active)) return <Calendar theme={theme} />;
  if (calcIds.has(active)) return <Calculator theme={theme} />;
  if (browseNotesIds.has(active)) return <BrowseNotes theme={theme} />;
  if (formulaeIds.has(active)) return <Formulae theme={theme} />;
  if (dashboardIds.has(active)) {
    return <Dashboard theme={theme} onNavigate={onSelectTodoList} onOpenYouTube={onOpenYouTube} />;
  }

  if (myNotesIds.has(active)) {
    return (
      <MyNotes
        theme={theme}
        notes={savedNotes}
        onOpen={onOpenNote}
        onDelete={onDeleteNote}
        onRename={onRenameNote}
      />
    );
  }

  // A specific note being edited (id matches a saved note)
  const editingNote = savedNotes.find((n) => n.id === active) ?? null;
  if (editingNote || (noteInitialPages && notesIds.has(active))) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={onNoteExit}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            ← Back to My Notes
          </button>
        </div>
        <Notes
          theme={theme}
          initialPages={editingNote?.pages ?? noteInitialPages ?? undefined}
          onSave={onSaveNote}
        />
      </div>
    );
  }

  if (notesIds.has(active)) return <Notes theme={theme} onSave={onSaveNote} />;

  const isTodoActive = todoRootIds.has(active) || (todoLists?.some((l) => l.id === active) ?? false);
  if (isTodoActive) {
    const current = todoLists?.find((l) => l.id === active) ?? null;
    if (current) {
      return (
        <TodoList
          theme={theme}
          list={current}
          onChange={onTodoListChange}
          onDelete={onDeleteTodoList}
        />
      );
    }
    if (todoLists && todoLists.length > 0) {
      const first = todoLists[0];
      if (first.id !== active) onSelectTodoList(first.id);
      return null;
    }
    return (
      <div className={`rounded-xl border ${theme.cardBorder} ${theme.cardTint} p-8 sm:p-12 text-center transition-colors duration-300`}>
        <p className={`text-sm ${theme.cardAccent}`}>No to-do lists yet. Click the + icon next to "To Do List" in the sidebar to create one.</p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border ${theme.cardBorder} ${theme.cardTint} p-8 sm:p-12 text-center transition-colors duration-300`}>
      <h2 className="text-xl font-semibold text-gray-900">Welcome to Com<span className="font-sans">π</span>le</h2>
      <p className={`mt-2 text-sm ${theme.cardAccent} max-w-md mx-auto`}>
        Your unified workspace for studying and working. Select a mode above and a section from the sidebar to get started.
      </p>
    </div>
  );
}

export default function App() {
  const [todoListsByMode, setTodoListsByMode] = useState<Record<Mode, TodoListData[]>>({
    Study: SEED_LISTS.Study,
    Work: SEED_LISTS.Work,
    Universal: SEED_LISTS.Universal,
  });

  const [savedNotesByMode, setSavedNotesByMode] = useState<Record<Mode, SavedNote[]>>({
    Study: [],
    Work: [],
    Universal: [],
  });

  const [activeByMode, setActiveByMode] = useState<Record<Mode, string>>({
    Study: 'dashboard',
    Work: 'dashboard',
    Universal: 'dashboard',
  });
  const [mode, setMode] = useState<Mode>('Study');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [noteInitialPages, setNoteInitialPages] = useState<PageData[] | null>(null);
  const [youTubeOpen, setYouTubeOpen] = useState(false);

  const theme = themes[mode];
  const active = activeByMode[mode];

  function handleSelect(id: string) {
    setNoteInitialPages(null);
    if (externalAppIds.has(id)) {
      // External apps open in a new tab; don't navigate away
      const urls: Record<string, string> = {
        'ext-youtube': 'https://www.youtube.com',
        'ext-docs': 'https://docs.google.com',
        'ext-drive': 'https://drive.google.com',
        'ext-notion': 'https://www.notion.so',
      };
      if (id === 'ext-youtube') {
        setYouTubeOpen(true);
      } else {
        window.open(urls[id], '_blank', 'noopener,noreferrer');
      }
      return;
    }
    setActiveByMode((prev) => ({ ...prev, [mode]: id }));
  }

  function addTodoList(m: Mode) {
    setTodoListsByMode((prev) => {
      const existing = prev[m];
      const newList = newTodoList(`List ${existing.length + 1}`);
      setActiveByMode((p) => ({ ...p, [m]: newList.id }));
      return { ...prev, [m]: [...existing, newList] };
    });
  }

  function deleteTodoList(id: string) {
    setTodoListsByMode((prev) => {
      const m = mode;
      const remaining = prev[m].filter((l) => l.id !== id);
      const fallback = remaining.length > 0 ? remaining[0].id : ROOT_TO_MODE[`${m.toLowerCase()}-todo`] ?? 'dashboard';
      setActiveByMode((p) => ({ ...p, [m]: p[m] === id ? fallback : p[m] }));
      return { ...prev, [m]: remaining };
    });
  }

  function renameTodoList(id: string, name: string) {
    setTodoListsByMode((prev) => ({
      ...prev,
      [mode]: prev[mode].map((l) => (l.id === id ? { ...l, name } : l)),
    }));
  }

  function saveNote(title: string, pages: PageData[]) {
    setSavedNotesByMode((prev) => {
      const note: SavedNote = { id: uid(), title, pages, createdAt: Date.now() };
      return { ...prev, [mode]: [note, ...prev[mode]] };
    });
  }

  function deleteNote(id: string) {
    setSavedNotesByMode((prev) => ({
      ...prev,
      [mode]: prev[mode].filter((n) => n.id !== id),
    }));
  }

  function renameNote(id: string, title: string) {
    setSavedNotesByMode((prev) => ({
      ...prev,
      [mode]: prev[mode].map((n) => (n.id === id ? { ...n, title } : n)),
    }));
  }


  return (
    <div className={`min-h-screen ${theme.pageBg} transition-colors duration-300`}>
      <Sidebar
        active={active}
        onSelect={handleSelect}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        theme={theme}
        todoLists={todoListsByMode[mode]}
        onAddTodoList={() => addTodoList(mode)}
        onRenameTodoList={(id, name) => renameTodoList(id, name)}
      />

      <div className="lg:pl-64">
        <Header
          mode={mode}
          onModeChange={setMode}
          onMenuClick={() => setMobileOpen(true)}
          theme={theme}
          onOpenYouTube={() => setYouTubeOpen(true)}
        />

        {youTubeOpen && (
          <YouTubePanel theme={theme} onClose={() => setYouTubeOpen(false)} />
        )}

        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-5xl mx-auto">
            {modes.map((m) => {
              const mTheme = themes[m];
              const mActive = activeByMode[m];
              const mLists = todoListsByMode[m];
              const mNotes = savedNotesByMode[m];
              const visible = m === mode;
              const myNotesId = `${m.toLowerCase()}-my-notes`;
              return (
                <div key={m} className={visible ? '' : 'hidden'}>
                  <Content
                    active={mActive}
                    theme={mTheme}
                    todoLists={mLists}
                    onSelectTodoList={(id) => setActiveByMode((p) => ({ ...p, [m]: id }))}
                    onTodoListChange={(list) =>
                      setTodoListsByMode((prev) => ({
                        ...prev,
                        [m]: prev[m].map((l) => (l.id === list.id ? list : l)),
                      }))
                    }
                    onDeleteTodoList={() => deleteTodoList(mActive)}
                    savedNotes={mNotes}
                    onOpenNote={(note) => {
                      setNoteInitialPages(note.pages);
                      setActiveByMode((p) => ({ ...p, [m]: note.id }));
                    }}
                    onDeleteNote={deleteNote}
                    onRenameNote={renameNote}
                    onSaveNote={saveNote}
                    noteInitialPages={visible ? noteInitialPages : null}
                    onNoteExit={() => {
                      setNoteInitialPages(null);
                      setActiveByMode((p) => ({ ...p, [m]: myNotesId }));
                    }}
                    onOpenYouTube={() => setYouTubeOpen(true)}
                  />
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
