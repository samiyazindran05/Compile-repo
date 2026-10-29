import { useState, useEffect, useCallback } from 'react';
import {
  Compass, Upload, Trash2, FileText, Loader2, X, Search, User,
} from 'lucide-react';
import type { Theme } from '../themes';
import { supabase, isSupabaseConfigured, type SharedNote } from '../lib/supabase';
import type { PageData } from './Notes';

type BrowseNotesProps = {
  theme: Theme;
};

const SUBJECTS = ['General', 'Math', 'Physics', 'Chemistry', 'Biology', 'History', 'Computer Science', 'English', 'Other'];

export default function BrowseNotes({ theme }: BrowseNotesProps) {
  const [notes, setNotes] = useState<SharedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [showUpload, setShowUpload] = useState(false);
  const [viewing, setViewing] = useState<SharedNote | null>(null);

  // Upload form state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAuthor, setUploadAuthor] = useState('');
  const [uploadSubject, setUploadSubject] = useState('General');
  const [uploadPages, setUploadPages] = useState<PageData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError('Database is not configured. Community notes are unavailable in this deployment.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('shared_notes')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) {
      setError('Could not load notes. Please try again.');
    } else {
      setNotes((data ?? []) as SharedNote[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const filtered = notes.filter((n) => {
    const matchesSearch =
      !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.author.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === 'All' || n.subject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  async function handleUpload() {
    if (!uploadTitle.trim()) {
      setUploadError('Please enter a title.');
      return;
    }
    if (!uploadAuthor.trim()) {
      setUploadError('Please enter your name.');
      return;
    }
    if (uploadPages.length === 0 || uploadPages.every((p) => !p.imageData)) {
      setUploadError('Please add at least one page with content.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const { error: err } = await supabase.from('shared_notes').insert({
      title: uploadTitle.trim(),
      author: uploadAuthor.trim(),
      subject: uploadSubject,
      pages: uploadPages,
    });

    setUploading(false);

    if (err) {
      setUploadError('Could not upload your note. Please try again.');
      return;
    }

    // Reset form
    setUploadTitle('');
    setUploadAuthor('');
    setUploadSubject('General');
    setUploadPages([]);
    setShowUpload(false);
    fetchNotes();
  }

  async function handleDelete(id: string) {
    await supabase.from('shared_notes').delete().eq('id', id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  function addUploadPage() {
    setUploadPages((prev) => [
      ...prev,
      { id: `p${Date.now()}${Math.random().toString(36).slice(2, 7)}`, imageData: null },
    ]);
  }

  function handlePageImageUpload(pageId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setUploadPages((prev) =>
        prev.map((p) => (p.id === pageId ? { ...p, imageData: src } : p)),
      );
    };
    reader.readAsDataURL(file);
  }

  function removeUploadPage(pageId: string) {
    setUploadPages((prev) => prev.filter((p) => p.id !== pageId));
  }

  const subjectsWithAll = ['All', ...SUBJECTS];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Compass size={24} className={theme.cardAccent} /> Browse Notes
          </h1>
          <p className={`mt-1 text-sm ${theme.cardAccent}`}>
            Explore notes shared by the community, or upload your own.
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white transition-all ${theme.accent} ${theme.accentHover} shadow-sm`}
        >
          <Upload size={16} /> Upload Note
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or author..."
            className="w-full rounded-lg border border-gray-200 pl-9 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {subjectsWithAll.map((s) => (
            <button
              key={s}
              onClick={() => setSubjectFilter(s)}
              className={[
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                subjectFilter === s
                  ? `${theme.accent} text-white`
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50',
              ].join(' ')}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className={`animate-spin ${theme.cardAccent}`} />
        </div>
      ) : error ? (
        <div className={`rounded-xl border ${theme.cardBorder} ${theme.cardTint} p-8 text-center`}>
          <p className={`text-sm ${theme.cardAccent}`}>{error}</p>
          <button
            onClick={fetchNotes}
            className="mt-3 text-sm font-medium text-gray-700 underline hover:text-gray-900"
          >
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className={`rounded-xl border ${theme.cardBorder} ${theme.cardTint} p-8 sm:p-12 text-center`}>
          <FileText size={32} className="text-gray-300 mx-auto mb-3" />
          <p className={`text-sm ${theme.cardAccent}`}>
            {notes.length === 0
              ? 'No notes have been shared yet. Be the first to upload!'
              : 'No notes match your search. Try a different filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((note) => (
            <div
              key={note.id}
              className={`group rounded-xl border ${theme.cardBorder} bg-white overflow-hidden hover:shadow-md transition-all duration-200`}
            >
              {/* Thumbnail */}
              <button
                onClick={() => setViewing(note)}
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
              <div className="px-3 py-2.5">
                <button onClick={() => setViewing(note)} className="block w-full text-left">
                  <p className="text-sm font-medium text-gray-800 truncate">{note.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <User size={11} className="text-gray-400" />
                    <p className="text-xs text-gray-400 truncate">{note.author}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${theme.accentSoft} ${theme.accentText} font-medium`}>
                      {note.subject}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {note.pages.length} page{note.pages.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <div
          className="fixed z-50 inset-0 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4 overflow-y-auto"
          onClick={() => setShowUpload(false)}
        >
          <div
            className="w-full max-w-lg my-8 rounded-2xl bg-white shadow-xl border border-gray-100 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Upload size={18} className={theme.cardAccent} /> Upload Your Note
              </h3>
              <button
                onClick={() => setShowUpload(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {uploadError && (
              <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-600">
                {uploadError}
              </div>
            )}

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Note title</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Calculus Derivatives Cheat Sheet"
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>

              {/* Author */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Your name</label>
                <input
                  type="text"
                  value={uploadAuthor}
                  onChange={(e) => setUploadAuthor(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Subject</label>
                <select
                  value={uploadSubject}
                  onChange={(e) => setUploadSubject(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Pages — upload images */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  Pages (upload an image per page)
                </label>
                <div className="space-y-2">
                  {uploadPages.map((page, i) => (
                    <div key={page.id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-2">
                      <span className="text-xs font-medium text-gray-400 w-6">{i + 1}</span>
                      {page.imageData ? (
                        <img
                          src={page.imageData}
                          alt={`Page ${i + 1}`}
                          className="w-12 h-16 object-cover rounded border border-gray-100"
                        />
                      ) : (
                        <div className="w-12 h-16 rounded border border-dashed border-gray-200 flex items-center justify-center">
                          <FileText size={14} className="text-gray-300" />
                        </div>
                      )}
                      <label className={`flex-1 cursor-pointer text-xs font-medium ${theme.cardAccent} hover:underline`}>
                        {page.imageData ? 'Replace image' : 'Choose image'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePageImageUpload(page.id, e)}
                        />
                      </label>
                      <button
                        onClick={() => removeUploadPage(page.id)}
                        className="p-1 text-gray-300 hover:text-rose-500 transition-colors"
                        aria-label="Remove page"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addUploadPage}
                    className="w-full py-2.5 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors text-xs font-medium inline-flex items-center justify-center gap-1.5"
                  >
                    + Add page
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowUpload(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all ${theme.accent} ${theme.accentHover} disabled:opacity-60`}
                >
                  {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                  {uploading ? 'Uploading...' : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note viewer modal */}
      {viewing && (
        <div
          className="fixed z-50 inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm px-4 overflow-y-auto"
          onClick={() => setViewing(null)}
        >
          <div
            className="w-full max-w-2xl my-8 rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Viewer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-gray-900 truncate">{viewing.title}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${theme.accentSoft} ${theme.accentText} font-medium`}>
                    {viewing.subject}
                  </span>
                  <span className="text-xs text-gray-400">by {viewing.author}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDelete(viewing.id)}
                  className="p-2 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                  title="Delete this note"
                  aria-label="Delete note"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => setViewing(null)}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Pages */}
            <div className="max-h-[70vh] overflow-y-auto p-5 space-y-4">
              {viewing.pages.map((page, i) => (
                <div key={page.id}>
                  {page.imageData ? (
                    <img
                      src={page.imageData}
                      alt={`Page ${i + 1}`}
                      className="w-full rounded-lg border border-gray-100"
                    />
                  ) : (
                    <div className="w-full aspect-[3/4] rounded-lg border border-dashed border-gray-200 flex items-center justify-center">
                      <FileText size={24} className="text-gray-200" />
                    </div>
                  )}
                  <p className="mt-1.5 text-center text-xs text-gray-400">Page {i + 1} of {viewing.pages.length}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
