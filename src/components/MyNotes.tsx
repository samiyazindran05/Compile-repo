import { useState } from 'react';
import { NotebookPen, Trash2, Pencil, Check, X, FileText } from 'lucide-react';
import type { Theme } from '../themes';
import type { SavedNote } from './Notes';

type MyNotesProps = {
  theme: Theme;
  notes: SavedNote[];
  onOpen: (note: SavedNote) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
};

export default function MyNotes({ theme, notes, onOpen, onDelete, onRename }: MyNotesProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  function startEdit(note: SavedNote) {
    setEditingId(note.id);
    setDraft(note.title);
  }

  function commitEdit() {
    if (!editingId) return;
    const trimmed = draft.trim();
    if (trimmed) onRename(editingId, trimmed);
    setEditingId(null);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <NotebookPen size={24} className={theme.cardAccent} /> My Notes
        </h1>
        <p className={`mt-1 text-sm ${theme.cardAccent}`}>All your saved notes. Click one to open and continue editing.</p>
      </div>

      {notes.length === 0 ? (
        <div className={`rounded-xl border ${theme.cardBorder} ${theme.cardTint} p-8 sm:p-12 text-center`}>
          <FileText size={32} className="text-gray-300 mx-auto mb-3" />
          <p className={`text-sm ${theme.cardAccent}`}>
            No saved notes yet. Go to Notes, create something, and hit Save to see it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`group rounded-xl border ${theme.cardBorder} bg-white overflow-hidden hover:shadow-md transition-all duration-200`}
            >
              {/* Thumbnail */}
              <button
                onClick={() => onOpen(note)}
                className="block w-full aspect-[3/4] bg-gray-50 overflow-hidden relative"
              >
                {note.pages[0]?.imageData ? (
                  <img
                    src={note.pages[0].imageData}
                    alt={note.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText size={28} className="text-gray-200" />
                  </div>
                )}
              </button>

              {/* Footer */}
              <div className="px-3 py-2.5 flex items-center gap-2">
                {editingId === note.id ? (
                  <>
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingId(null); }}
                      className="flex-1 min-w-0 text-sm bg-transparent border-b border-gray-300 focus:border-gray-700 focus:outline-none px-0.5 py-0.5 text-gray-800"
                    />
                    <button
                      onClick={commitEdit}
                      className="shrink-0 p-1 text-gray-400 hover:text-gray-900 transition-colors"
                      aria-label="Save name"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="shrink-0 p-1 text-gray-400 hover:text-gray-900 transition-colors"
                      aria-label="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onOpen(note)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <p className="text-sm font-medium text-gray-800 truncate">{note.title}</p>
                      <p className="text-xs text-gray-400">
                        {note.pages.length} page{note.pages.length !== 1 ? 's' : ''} · {new Date(note.createdAt).toLocaleDateString()}
                      </p>
                    </button>
                    <button
                      onClick={() => startEdit(note)}
                      className="shrink-0 p-1 rounded text-gray-300 hover:text-gray-700 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                      title="Rename"
                      aria-label="Rename note"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => onDelete(note.id)}
                      className="shrink-0 p-1 rounded text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete"
                      aria-label="Delete note"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
