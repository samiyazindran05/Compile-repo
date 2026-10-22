import { useState, useEffect, useCallback } from 'react';
import {
  FunctionSquare, Search, Bookmark, Trash2, Loader2, X, ChevronRight,
  BookOpen, Plus, Check,
} from 'lucide-react';
import type { Theme } from '../themes';
import { supabase } from '../lib/supabase';
import { FORMULAE_DATABASE, type Formula, type Topic } from './formulaeData';

type BrowseNotesProps = { theme: Theme };

type SavedTopic = {
  id: string;
  topic: string;
  formulae: Formula[];
};

export default function Formulae({ theme }: BrowseNotesProps) {
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [savedTopics, setSavedTopics] = useState<SavedTopic[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const fetchSaved = useCallback(async () => {
    setLoadingSaved(true);
    const { data, error } = await supabase
      .from('saved_formulae')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setSavedTopics(
        (data as { id: string; topic: string; formulae: Formula[] }[]).map((r) => ({
          id: r.id,
          topic: r.topic,
          formulae: r.formulae,
        })),
      );
    }
    setLoadingSaved(false);
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const searchResults = search.trim()
    ? FORMULAE_DATABASE.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.category.toLowerCase().includes(search.toLowerCase()) ||
          t.formulae.some(
            (f) =>
              f.name.toLowerCase().includes(search.toLowerCase()) ||
              f.expression.toLowerCase().includes(search.toLowerCase()),
          ),
      )
    : [];

  const isSaved = (topicName: string) => savedTopics.some((s) => s.topic === topicName);

  async function saveTopic(topic: Topic) {
    setSaving(true);
    const { error } = await supabase.from('saved_formulae').insert({
      topic: topic.name,
      formulae: topic.formulae,
    });
    setSaving(false);
    if (!error) {
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1800);
      fetchSaved();
    }
  }

  async function deleteSavedTopic(id: string) {
    await supabase.from('saved_formulae').delete().eq('id', id);
    setSavedTopics((prev) => prev.filter((s) => s.id !== id));
  }

  function openSavedTopic(saved: SavedTopic) {
    setSelectedTopic({
      name: saved.topic,
      category: 'Saved',
      formulae: saved.formulae,
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <FunctionSquare size={24} className={theme.cardAccent} /> Formulae
        </h1>
        <p className={`mt-1 text-sm ${theme.cardAccent}`}>
          Search any topic to find its key formulae, or jump to your saved topics below.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search a topic, e.g. Thermodynamics, Calculus, Stoichiometry..."
          className="w-full rounded-xl border border-gray-200 pl-11 pr-10 py-3.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white shadow-sm"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-900 transition-colors"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Saved topics */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
          <Bookmark size={15} className={theme.cardAccent} /> Your Saved Topics
        </h2>
        {loadingSaved ? (
          <div className="flex items-center gap-2 py-3">
            <Loader2 size={16} className={`animate-spin ${theme.cardAccent}`} />
            <span className="text-sm text-gray-400">Loading...</span>
          </div>
        ) : savedTopics.length === 0 ? (
          <div className={`rounded-xl border ${theme.cardBorder} ${theme.cardTint} px-4 py-4 text-center`}>
            <p className={`text-sm ${theme.cardAccent}`}>
              No saved topics yet. Search for a topic and click Save to pin it here.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {savedTopics.map((saved) => (
              <div
                key={saved.id}
                className="group inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white pl-3 pr-1.5 py-2 hover:shadow-sm transition-all"
              >
                <button
                  onClick={() => openSavedTopic(saved)}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors inline-flex items-center gap-1.5"
                >
                  <BookOpen size={14} className={theme.cardAccent} />
                  {saved.topic}
                  <span className="text-xs text-gray-400 font-normal">
                    ({saved.formulae.length})
                  </span>
                </button>
                <button
                  onClick={() => deleteSavedTopic(saved.id)}
                  className="p-1 rounded text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Remove saved topic"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search results */}
      {search.trim() && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Search Results {searchResults.length > 0 && `(${searchResults.length})`}
          </h2>
          {searchResults.length === 0 ? (
            <div className={`rounded-xl border ${theme.cardBorder} ${theme.cardTint} px-4 py-6 text-center`}>
              <p className={`text-sm ${theme.cardAccent}`}>
                No topics found for "{search}". Try a different term.
              </p>
              <p className="text-xs text-gray-400 mt-1.5">
                Available: {FORMULAE_DATABASE.map((t) => t.name).join(', ')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {searchResults.map((topic) => (
                <button
                  key={topic.name}
                  onClick={() => setSelectedTopic(topic)}
                  className={`group text-left rounded-xl border ${theme.cardBorder} bg-white p-4 hover:shadow-md transition-all duration-200`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{topic.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{topic.category}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-600 transition-colors shrink-0 mt-0.5" />
                  </div>
                  <p className={`text-xs ${theme.cardAccent} mt-2`}>
                    {topic.formulae.length} formula{topic.formulae.length !== 1 ? 'e' : ''}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state when no search */}
      {!search.trim() && savedTopics.length === 0 && (
        <div className={`rounded-xl border ${theme.cardBorder} ${theme.cardTint} p-8 sm:p-12 text-center`}>
          <Search size={32} className="text-gray-300 mx-auto mb-3" />
          <p className={`text-sm ${theme.cardAccent} mb-3`}>
            Start by searching for a topic above.
          </p>
          <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
            {['Thermodynamics', 'Calculus', 'Kinematics', 'Stoichiometry'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setSearch(suggestion)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Topic detail modal */}
      {selectedTopic && (
        <div
          className="fixed z-50 inset-0 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4 overflow-y-auto"
          onClick={() => setSelectedTopic(null)}
        >
          <div
            className="w-full max-w-2xl my-8 rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{selectedTopic.name}</h3>
                <p className={`text-xs ${theme.cardAccent} mt-0.5`}>{selectedTopic.category} · {selectedTopic.formulae.length} formulae</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {selectedTopic.category !== 'Saved' && (
                  <button
                    onClick={() => saveTopic(selectedTopic)}
                    disabled={saving || isSaved(selectedTopic.name)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isSaved(selectedTopic.name)
                        ? 'bg-gray-100 text-gray-400'
                        : `${theme.accent} text-white ${theme.accentHover}`
                    } disabled:opacity-60`}
                  >
                    {isSaved(selectedTopic.name) ? (
                      <><Check size={14} /> Saved</>
                    ) : saving ? (
                      <><Loader2 size={14} className="animate-spin" /> Saving...</>
                    ) : (
                      <><Plus size={14} /> Save Topic</>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Formulae list */}
            <div className="max-h-[65vh] overflow-y-auto p-5 space-y-3">
              {selectedTopic.formulae.map((formula, i) => (
                <div
                  key={i}
                  className={`rounded-xl border ${theme.cardBorder} ${theme.cardTint} p-4`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-900">{formula.name}</p>
                    <span className={`text-[10px] font-medium ${theme.accentText} ${theme.accentSoft} px-2 py-0.5 rounded-full shrink-0`}>
                      {i + 1}
                    </span>
                  </div>
                  <div className="mt-2.5 rounded-lg bg-white border border-gray-100 px-4 py-3">
                    <p className="text-base font-mono text-gray-900 text-center">{formula.expression}</p>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 leading-relaxed">{formula.description}</p>
                </div>
              ))}
            </div>

            {savedFlash && (
              <div className="px-5 py-2.5 bg-emerald-50 border-t border-emerald-100 text-center">
                <p className="text-xs font-medium text-emerald-600 inline-flex items-center gap-1.5">
                  <Check size={13} /> Topic saved! Find it below the search bar.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
