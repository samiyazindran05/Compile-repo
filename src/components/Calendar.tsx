import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock, CalendarDays, Tag, StickyNote, PartyPopper, Trash2 } from 'lucide-react';
import type { Theme } from '../themes';

type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  time: string;
  category: 'Study' | 'Work' | 'Personal';
};

type DayNote = {
  id: string;
  date: string;
  text: string;
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function pad(n: number) { return n < 10 ? `0${n}` : String(n); }
function toISO(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function julianDayNumber(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const a = Math.floor((14 - m) / 12);
  const y2 = y + 4800 - a;
  const m2 = m + 12 * a - 3;
  return d + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
}

function easter(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

type Festival = { name: string; type: string };

function fixedFestivals(month: number, day: number): Festival[] {
  const f: Record<number, Record<number, Festival[]>> = {
    0: { 1: [{ name: "New Year's Day", type: 'Public' }], 14: [{ name: 'Makar Sankranti', type: 'Hindu' }], 26: [{ name: 'Republic Day (India)', type: 'Public' }] },
    1: { 14: [{ name: "Valentine's Day", type: 'Cultural' }] },
    2: { 8: [{ name: 'International Women\u2019s Day', type: 'Cultural' }], 17: [{ name: "St. Patrick's Day", type: 'Cultural' }] },
    3: { 1: [{ name: 'April Fools\u2019 Day', type: 'Cultural' }], 22: [{ name: 'Earth Day', type: 'Cultural' }] },
    4: { 1: [{ name: 'International Workers\u2019 Day', type: 'Public' }] },
    5: { 21: [{ name: 'International Yoga Day', type: 'Cultural' }] },
    6: { 4: [{ name: 'US Independence Day', type: 'Public' }] },
    7: { 15: [{ name: 'India Independence Day', type: 'Public' }] },
    8: { 5: [{ name: 'Teachers\u2019 Day (India)', type: 'Cultural' }] },
    9: { 2: [{ name: 'Gandhi Jayanti', type: 'Public' }], 31: [{ name: 'Halloween', type: 'Cultural' }] },
    10: { 1: [{ name: 'All Saints\u2019 Day', type: 'Religious' }] },
    11: { 25: [{ name: 'Christmas Day', type: 'Public' }], 26: [{ name: 'Boxing Day', type: 'Public' }] },
  };
  return f[month]?.[day] ?? [];
}

function getFestivals(date: Date): Festival[] {
  const list = [...fixedFestivals(date.getMonth(), date.getDate())];
  const e = easter(date.getFullYear());
  if (e.getMonth() === date.getMonth() && e.getDate() === date.getDate()) {
    list.push({ name: 'Easter Sunday', type: 'Religious' });
  }
  const goodFriday = new Date(e);
  goodFriday.setDate(e.getDate() - 2);
  if (goodFriday.getMonth() === date.getMonth() && goodFriday.getDate() === date.getDate()) {
    list.push({ name: 'Good Friday', type: 'Religious' });
  }
  return list;
}

const festivalTypeColor: Record<string, string> = {
  Public: 'bg-rose-100 text-rose-700',
  Religious: 'bg-violet-100 text-violet-700',
  Cultural: 'bg-amber-100 text-amber-700',
  Hindu: 'bg-orange-100 text-orange-700',
};

type CalendarProps = {
  theme: Theme;
};

const seedEvents: CalendarEvent[] = [
  { id: 's1', date: toISO(new Date()), title: 'Review session', time: '18:00', category: 'Study' },
  { id: 's2', date: toISO(new Date()), title: 'Team standup', time: '09:30', category: 'Work' },
];

export default function Calendar({ theme }: CalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>(seedEvents);
  const [notes, setNotes] = useState<DayNote[]>([]);
  const [draft, setDraft] = useState({ title: '', time: '12:00', category: 'Study' as CalendarEvent['category'] });
  const [noteDraft, setNoteDraft] = useState('');

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const totalDays = daysInMonth(viewYear, viewMonth);
  const monthDays = Array.from({ length: totalDays }, (_, i) => i + 1);
  const leadingBlanks = Array.from({ length: startOffset }, () => null);

  const selectedDateObj = selectedDate ? new Date(`${selectedDate}T00:00:00`) : null;
  const selectedWeek = selectedDateObj ? getWeekNumber(selectedDateObj) : 0;
  const selectedJDN = selectedDateObj ? julianDayNumber(selectedDateObj) : 0;
  const selectedDayOfYear = selectedDateObj
    ? Math.floor((selectedDateObj.getTime() - new Date(selectedDateObj.getFullYear(), 0, 0).getTime()) / 86400000)
    : 0;
  const isLeap = selectedDateObj ? isLeapYear(selectedDateObj.getFullYear()) : false;
  const festivals = selectedDateObj ? getFestivals(selectedDateObj) : [];

  const eventsForSelected = selectedDate
    ? events.filter((e) => e.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time))
    : [];
  const notesForSelected = selectedDate
    ? notes.filter((n) => n.date === selectedDate)
    : [];

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }
  function goToday() {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    openDate(toISO(today));
  }
  function openDate(iso: string) {
    setSelectedDate(iso);
    setDraft({ title: '', time: '12:00', category: 'Study' });
    setNoteDraft('');
  }
  function closeDrawer() {
    setSelectedDate(null);
  }

  function addEvent() {
    if (!draft.title.trim() || !selectedDate) return;
    const id = `e${Date.now()}`;
    setEvents((prev) => [...prev, { id, date: selectedDate, ...draft }]);
    setDraft({ title: '', time: '12:00', category: 'Study' });
  }
  function removeEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }
  function addNote() {
    if (!noteDraft.trim() || !selectedDate) return;
    const id = `n${Date.now()}`;
    setNotes((prev) => [...prev, { id, date: selectedDate, text: noteDraft.trim() }]);
    setNoteDraft('');
  }
  function removeNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  const categoryDot: Record<CalendarEvent['category'], string> = {
    Study: 'bg-emerald-500',
    Work: 'bg-blue-500',
    Personal: 'bg-orange-500',
  };
  const categoryPill: Record<CalendarEvent['category'], string> = {
    Study: 'bg-emerald-100 text-emerald-700',
    Work: 'bg-blue-100 text-blue-700',
    Personal: 'bg-orange-100 text-orange-700',
  };

  const drawerOpen = selectedDate !== null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
        <p className={`mt-1 text-sm ${theme.cardAccent}`}>Click any date to book time slots, add events, jot notes, and see festivals.</p>
      </div>

      <div className={`rounded-xl border ${theme.cardBorder} ${theme.cardTint} p-5 transition-colors duration-300`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays size={20} className={theme.cardAccent} />
            <h2 className="text-lg font-semibold text-gray-900">{MONTHS[viewMonth]} {viewYear}</h2>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={prevMonth} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors" aria-label="Previous month">
              <ChevronLeft size={18} />
            </button>
            <button onClick={goToday} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
              Today
            </button>
            <button onClick={nextMonth} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors" aria-label="Next month">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {leadingBlanks.map((_, i) => (
            <div key={`blank-${i}`} className="aspect-square" />
          ))}
          {monthDays.map((day) => {
            const dateObj = new Date(viewYear, viewMonth, day);
            const iso = toISO(dateObj);
            const isToday = iso === toISO(today);
            const isSelected = iso === selectedDate;
            const dayEvents = events.filter((e) => e.date === iso);
            const dayFestivals = getFestivals(dateObj);
            return (
              <button
                key={day}
                onClick={() => openDate(iso)}
                className={[
                  'aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all duration-200 relative group',
                  isSelected
                    ? `${theme.accent} text-white font-semibold shadow-sm`
                    : isToday
                      ? `${theme.accentSoft} ${theme.cardAccent} font-semibold ring-1 ring-current`
                      : 'text-gray-700 hover:bg-gray-100',
                ].join(' ')}
              >
                <span>{day}</span>
                {dayFestivals.length > 0 && (
                  <PartyPopper
                    size={10}
                    className={`absolute top-1 right-1 ${isSelected ? 'text-white/80' : 'text-rose-400'}`}
                  />
                )}
                {dayEvents.length > 0 && (
                  <span className="flex gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map((e) => (
                      <span
                        key={e.id}
                        className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/80' : categoryDot[e.category]}`}
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />Study</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" />Work</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500" />Personal</span>
          <span className="inline-flex items-center gap-1.5"><PartyPopper size={12} className="text-rose-400" />Festival</span>
        </div>
      </div>

      {/* Right-side drawer */}
      {drawerOpen && selectedDateObj && (
        <>
          <div
            className="fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-sm"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <aside
            className="fixed z-50 inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300"
            role="dialog"
            aria-label="Date details"
          >
            {/* Header */}
            <div className={`px-5 py-4 border-b border-gray-200 ${theme.accentSoft}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Selected date</p>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedDateObj.toLocaleDateString(undefined, { weekday: 'long' })}
                  </h2>
                  <p className={`text-sm ${theme.cardAccent}`}>
                    {selectedDateObj.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={closeDrawer}
                  className="p-2 rounded-lg text-gray-500 hover:bg-white/60 hover:text-gray-900 transition-colors"
                  aria-label="Close panel"
                >
                  <X size={20} />
                </button>
              </div>

              {festivals.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {festivals.map((f) => (
                    <span key={f.name} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${festivalTypeColor[f.type] ?? 'bg-gray-100 text-gray-700'}`}>
                      <PartyPopper size={12} />
                      {f.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
              {/* Book a time slot */}
              <section>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                  <Plus size={16} className={theme.cardAccent} /> Book a Time Slot
                </h3>
                <div className="space-y-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                    placeholder="What is this for? (e.g. Calculus revision)"
                    className="w-full px-3 py-2 rounded-lg text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      value={draft.time}
                      onChange={(e) => setDraft((d) => ({ ...d, time: e.target.value }))}
                      className="px-3 py-2 rounded-lg text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white"
                    />
                    <select
                      value={draft.category}
                      onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as CalendarEvent['category'] }))}
                      className="px-3 py-2 rounded-lg text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white"
                    >
                      <option value="Study">Study</option>
                      <option value="Work">Work</option>
                      <option value="Personal">Personal</option>
                    </select>
                  </div>
                  <button
                    onClick={addEvent}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors ${theme.accent} ${theme.accentHover}`}
                  >
                    Add Slot
                  </button>
                </div>
              </section>

              {/* Scheduled slots */}
              <section>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                  <Clock size={16} className={theme.cardAccent} /> Scheduled ({eventsForSelected.length})
                </h3>
                <div className="space-y-2">
                  {eventsForSelected.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-3">No time slots booked yet</p>
                  ) : (
                    eventsForSelected.map((e) => (
                      <div key={e.id} className="group flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                        <span className={`w-2 h-2 rounded-full ${categoryDot[e.category]}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{e.title}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} /> {e.time}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${categoryPill[e.category]}`}>{e.category}</span>
                        <button
                          onClick={() => removeEvent(e.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                          aria-label="Remove slot"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Notes */}
              <section>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                  <StickyNote size={16} className={theme.cardAccent} /> Notes ({notesForSelected.length})
                </h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addNote(); }}
                    placeholder="Quick note for this day..."
                    className="flex-1 px-3 py-2 rounded-lg text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white"
                  />
                  <button
                    onClick={addNote}
                    className={`px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors ${theme.accent} ${theme.accentHover}`}
                    aria-label="Add note"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  {notesForSelected.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-3">No notes for this day</p>
                  ) : (
                    notesForSelected.map((n) => (
                      <div key={n.id} className="group flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                        <StickyNote size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="flex-1 text-sm text-gray-700 break-words">{n.text}</p>
                        <button
                          onClick={() => removeNote(n.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                          aria-label="Remove note"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Scientific reference */}
              <section>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                  <Tag size={16} className={theme.cardAccent} /> Scientific Reference
                </h3>
                <dl className="space-y-2 text-xs p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">ISO date</dt>
                    <dd className="font-mono text-gray-900">{selectedDate}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">ISO week number</dt>
                    <dd className="font-mono text-gray-900">W{selectedWeek}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Day of year</dt>
                    <dd className="font-mono text-gray-900">{selectedDayOfYear} / {isLeap ? 366 : 365}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Julian Day Number</dt>
                    <dd className="font-mono text-gray-900">{selectedJDN.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Leap year</dt>
                    <dd className="font-mono text-gray-900">{isLeap ? 'Yes' : 'No'}</dd>
                  </div>
                </dl>
              </section>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
