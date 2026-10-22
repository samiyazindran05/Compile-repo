import { useState } from 'react';
import {
  ListChecks, Plus, Trash2, Check, CircleDot, Table2,
  ArrowLeft, X, ChevronDown, ChevronRight, Pencil,
} from 'lucide-react';
import type { Theme } from '../themes';

export type TodoItem = {
  id: string;
  text: string;
  done: boolean;
};

export type TableData = {
  id: string;
  title: string;
  columns: string[];
  rows: string[][];
};

export type TodoListData = {
  id: string;
  name: string;
  todos: TodoItem[];
  tables: TableData[];
};

type Priority = 'low' | 'medium' | 'high';

type TodoListProps = {
  theme: Theme;
  list: TodoListData;
  onChange: (list: TodoListData) => void;
  onDelete: () => void;
};

export function uid(): string {
  return `t${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
}

export function newTodoList(name = 'New list'): TodoListData {
  return { id: uid(), name, todos: [], tables: [] };
}

const PRIORITY_STYLES: Record<Priority, { label: string; classes: string }> = {
  low: { label: 'Low', classes: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium', classes: 'bg-amber-100 text-amber-700' },
  high: { label: 'High', classes: 'bg-rose-100 text-rose-700' },
};

export default function TodoList({ theme, list, onChange, onDelete }: TodoListProps) {
  const [newTodo, setNewTodo] = useState('');
  const [showTableModal, setShowTableModal] = useState(false);
  const [expandedTable, setExpandedTable] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(list.name);

  // Table creation form state
  const [tableTitle, setTableTitle] = useState('');
  const [colCount, setColCount] = useState(3);
  const [rowCount, setRowCount] = useState(3);

  const todos = list.todos;
  const tables = list.tables;

  function addTodo() {
    if (!newTodo.trim()) return;
    onChange({ ...list, todos: [...todos, { id: uid(), text: newTodo.trim(), done: false }] });
    setNewTodo('');
  }

  function toggleTodo(id: string) {
    onChange({ ...list, todos: todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) });
  }

  function deleteTodo(id: string) {
    onChange({ ...list, todos: todos.filter((t) => t.id !== id) });
  }

  function clearCompleted() {
    onChange({ ...list, todos: todos.filter((t) => !t.done) });
  }

  function commitName() {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== list.name) {
      onChange({ ...list, name: trimmed });
    } else {
      setNameDraft(list.name);
    }
    setEditingName(false);
  }

  const completed = todos.filter((t) => t.done).length;
  const total = todos.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  function createTable() {
    const title = tableTitle.trim() || 'Untitled table';
    const columns = Array.from({ length: colCount }, (_, i) => `Column ${i + 1}`);
    const rows = Array.from({ length: rowCount }, () => Array.from({ length: colCount }, () => ''));
    onChange({ ...list, tables: [...tables, { id: uid(), title, columns, rows }] });
    setTableTitle('');
    setColCount(3);
    setRowCount(3);
    setShowTableModal(false);
  }

  function deleteTable(id: string) {
    onChange({ ...list, tables: tables.filter((t) => t.id !== id) });
    if (expandedTable === id) setExpandedTable(null);
  }

  function updateCell(tableId: string, rowIdx: number, colIdx: number, value: string) {
    onChange({
      ...list,
      tables: tables.map((t) =>
        t.id === tableId
          ? { ...t, rows: t.rows.map((row, ri) => (ri === rowIdx ? row.map((cell, ci) => (ci === colIdx ? value : cell)) : row)) }
          : t,
      ),
    });
  }

  function updateColumnName(tableId: string, colIdx: number, value: string) {
    onChange({
      ...list,
      tables: tables.map((t) =>
        t.id === tableId ? { ...t, columns: t.columns.map((c, ci) => (ci === colIdx ? value : c)) } : t,
      ),
    });
  }

  function addTableRow(tableId: string) {
    onChange({
      ...list,
      tables: tables.map((t) =>
        t.id === tableId ? { ...t, rows: [...t.rows, Array.from({ length: t.columns.length }, () => '')] } : t,
      ),
    });
  }

  function addTableColumn(tableId: string) {
    onChange({
      ...list,
      tables: tables.map((t) =>
        t.id === tableId
          ? { ...t, columns: [...t.columns, `Column ${t.columns.length + 1}`], rows: t.rows.map((r) => [...r, '']) }
          : t,
      ),
    });
  }

  function removeTableRow(tableId: string, rowIdx: number) {
    onChange({
      ...list,
      tables: tables.map((t) => (t.id === tableId ? { ...t, rows: t.rows.filter((_, ri) => ri !== rowIdx) } : t)),
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ListChecks size={24} className={theme.cardAccent} />
            {editingName ? (
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => { if (e.key === 'Enter') commitName(); if (e.key === 'Escape') { setNameDraft(list.name); setEditingName(false); } }}
                className="text-2xl font-semibold text-gray-900 bg-transparent border-b-2 border-gray-300 focus:border-gray-700 focus:outline-none px-1"
              />
            ) : (
              <button
                onClick={() => { setNameDraft(list.name); setEditingName(true); }}
                className="group inline-flex items-center gap-1.5 text-2xl font-semibold text-gray-900"
                title="Rename list"
              >
                <span className="truncate">{list.name}</span>
                <Pencil size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </button>
            )}
          </div>
          <p className={`mt-1 text-sm ${theme.cardAccent}`}>Track your tasks and organise data with tables.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-gray-500 bg-gray-100 hover:bg-rose-50 hover:text-rose-600 transition-all"
            title="Delete this list"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => setShowTableModal(true)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white transition-all ${theme.accent} ${theme.accentHover} shadow-sm`}
          >
            <Table2 size={16} /> Insert table
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className={`rounded-xl border ${theme.cardBorder} bg-white p-4 mb-6`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">{completed} of {total} done</span>
        </div>
        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full ${theme.accent} transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1.5 text-right text-xs font-mono text-gray-400">{progress}%</p>
      </div>

      {/* Add todo input */}
      <div className={`rounded-xl border ${theme.cardBorder} bg-white p-4 mb-4`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addTodo(); }}
            placeholder="Add a new task..."
            className="flex-1 rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
          <button
            onClick={addTodo}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all ${theme.accent} ${theme.accentHover}`}
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Todo list */}
      <div className={`rounded-xl border ${theme.cardBorder} bg-white overflow-hidden mb-8`}>
        {todos.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400">No tasks yet. Add one above to get started.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {todos.map((todo) => (
              <li key={todo.id} className="flex items-center gap-3 px-4 py-3 group hover:bg-gray-50/50 transition-colors">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`shrink-0 transition-colors ${todo.done ? theme.cardAccent : 'text-gray-300 hover:text-gray-400'}`}
                  aria-label={todo.done ? 'Mark as not done' : 'Mark as done'}
                >
                  {todo.done ? <Check size={20} /> : <CircleDot size={20} />}
                </button>
                <span
                  className={[
                    'flex-1 text-sm transition-all',
                    todo.done ? 'line-through text-gray-400' : 'text-gray-800',
                  ].join(' ')}
                >
                  {todo.text}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_STYLES.medium.classes}`}>
                  {PRIORITY_STYLES.medium.label}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="shrink-0 p-1 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Delete task"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
        {completed > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
            <button
              onClick={clearCompleted}
              className="text-xs font-medium text-gray-500 hover:text-rose-600 transition-colors"
            >
              Clear completed ({completed})
            </button>
          </div>
        )}
      </div>

      {/* Tables section */}
      {tables.length > 0 && (
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Table2 size={18} className={theme.cardAccent} /> Tables
          </h2>
          {tables.map((table) => {
            const isExpanded = expandedTable === table.id;
            return (
              <div key={table.id} className={`rounded-xl border ${theme.cardBorder} bg-white overflow-hidden`}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <button
                    onClick={() => setExpandedTable(isExpanded ? null : table.id)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-700 transition-colors"
                  >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    {table.title}
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{table.rows.length} rows · {table.columns.length} cols</span>
                    <button
                      onClick={() => deleteTable(table.id)}
                      className="p-1 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                      aria-label="Delete table"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="w-10 px-3 py-2 text-left text-xs font-medium text-gray-400">#</th>
                          {table.columns.map((col, ci) => (
                            <th key={ci} className="px-3 py-2 text-left border-l border-gray-50">
                              <input
                                type="text"
                                value={col}
                                onChange={(e) => updateColumnName(table.id, ci, e.target.value)}
                                className="w-full bg-transparent text-xs font-semibold text-gray-700 focus:outline-none focus:bg-gray-50 rounded px-1 py-0.5"
                              />
                            </th>
                          ))}
                          <th className="w-10 px-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {table.rows.map((row, ri) => (
                          <tr key={ri} className="border-b border-gray-50 group hover:bg-gray-50/30 transition-colors">
                            <td className="px-3 py-2 text-xs text-gray-400 font-mono">{ri + 1}</td>
                            {row.map((cell, ci) => (
                              <td key={ci} className="px-1 py-1 border-l border-gray-50">
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={(e) => updateCell(table.id, ri, ci, e.target.value)}
                                  placeholder="—"
                                  className="w-full bg-transparent text-sm text-gray-800 focus:outline-none focus:bg-gray-50 rounded px-2 py-1"
                                />
                              </td>
                            ))}
                            <td className="px-2">
                              <button
                                onClick={() => removeTableRow(table.id, ri)}
                                className="p-1 rounded text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                                aria-label="Remove row"
                              >
                                <X size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="flex gap-2 px-3 py-2.5 border-t border-gray-50 bg-gray-50/30">
                      <button
                        onClick={() => addTableRow(table.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        <Plus size={13} /> Add row
                      </button>
                      <span className="text-gray-200">|</span>
                      <button
                        onClick={() => addTableColumn(table.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        <Plus size={13} /> Add column
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Insert table modal */}
      {showTableModal && (
        <div className="fixed z-50 inset-0 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4" onClick={() => setShowTableModal(false)}>
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-100 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Table2 size={18} className={theme.cardAccent} /> Insert table
              </h3>
              <button
                onClick={() => setShowTableModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Table title</label>
                <input
                  type="text"
                  value={tableTitle}
                  onChange={(e) => setTableTitle(e.target.value)}
                  placeholder="e.g. Study schedule"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-gray-500">Columns</label>
                    <span className="text-xs font-mono text-gray-700">{colCount}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={colCount}
                    onChange={(e) => setColCount(Number(e.target.value))}
                    className="w-full accent-gray-700"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-gray-500">Rows</label>
                    <span className="text-xs font-mono text-gray-700">{rowCount}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={rowCount}
                    onChange={(e) => setRowCount(Number(e.target.value))}
                    className="w-full accent-gray-700"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500">
                  Preview
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {Array.from({ length: colCount }, (_, i) => (
                        <th key={i} className="px-2 py-1.5 text-left font-medium text-gray-400 border-l border-gray-50 first:border-l-0">
                          C{i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: Math.min(rowCount, 5) }, (_, ri) => (
                      <tr key={ri} className="border-b border-gray-50 last:border-b-0">
                        {Array.from({ length: colCount }, (_, ci) => (
                          <td key={ci} className="px-2 py-1.5 text-gray-300 border-l border-gray-50 first:border-l-0">—</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rowCount > 5 && (
                  <p className="px-3 py-1.5 text-center text-xs text-gray-400 bg-gray-50/50">+{rowCount - 5} more rows</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowTableModal(false)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft size={15} /> Cancel
                </button>
                <button
                  onClick={createTable}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all ${theme.accent} ${theme.accentHover}`}
                >
                  <Table2 size={15} /> Create table
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
