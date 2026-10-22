import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Pen, Pencil, Eraser, Type, Save, Plus, Check, Paintbrush, X,
  Square, Circle, Minus, ArrowRight, Image as ImageIcon,
  File as FileIcon, Upload,
} from 'lucide-react';
import type { Theme } from '../themes';

type Tool = 'pen' | 'pencil' | 'eraser' | 'insert';
type InsertTab = 'text' | 'shapes' | 'images' | 'file';
type ShapeType = 'rect' | 'circle' | 'line' | 'arrow';
type MenuKind = 'tools' | 'insert' | null;

const PAGE_WIDTH = 820;
const PAGE_HEIGHT = 1100;

export type PageData = {
  id: string;
  imageData: string | null;
};

export type SavedNote = {
  id: string;
  title: string;
  pages: PageData[];
  createdAt: number;
};

type NotesProps = {
  theme: Theme;
  initialPages?: PageData[];
  onSave?: (title: string, pages: PageData[]) => void;
};

const INK_COLORS = ['#1f2937', themeAccentHex('emerald'), themeAccentHex('blue'), themeAccentHex('orange'), '#dc2626', '#7c3aed'];
const PAGE_COLORS = ['#ffffff', '#fff8e1', '#e3f2fd', '#e8f5e9', '#fce4ec', '#f3e5f5', '#1f2937'];

function themeAccentHex(name: 'emerald' | 'blue' | 'orange'): string {
  if (name === 'emerald') return '#059669';
  if (name === 'blue') return '#2563eb';
  return '#f97316';
}

function newPage(): PageData {
  return { id: `p${Date.now()}${Math.random().toString(36).slice(2, 7)}`, imageData: null };
}

const SHAPES: { id: ShapeType; icon: typeof Square; label: string }[] = [
  { id: 'rect', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
];

export default function Notes({ theme, initialPages, onSave }: NotesProps) {
  const [pages, setPages] = useState<PageData[]>(initialPages ?? [newPage(), newPage()]);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState<string>('#1f2937');
  const [pageColor, setPageColor] = useState<string>('#ffffff');
  const [size, setSize] = useState<number>(3);
  const [saved, setSaved] = useState(false);
  const [menu, setMenu] = useState<MenuKind>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');

  // Insert panel state
  const [insertTab, setInsertTab] = useState<InsertTab>('text');
  const [textInput, setTextInput] = useState('');
  const [textFontSize, setTextFontSize] = useState(24);
  const [shapeType, setShapeType] = useState<ShapeType>('rect');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const inserting = useRef(false);

  // Shape drawing refs
  const shapeStart = useRef<{ x: number; y: number } | null>(null);
  const savedImageData = useRef<ImageData | null>(null);

  // Pending image/file to place
  const pendingImage = useRef<HTMLImageElement | null>(null);
  const pendingFile = useRef<{ img: HTMLImageElement | null; name: string; isImage: boolean } | null>(null);

  // File input refs (hidden)
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function getCtx(id: string): CanvasRenderingContext2D | null {
    const canvas = canvasRefs.current[id];
    return canvas ? canvas.getContext('2d') : null;
  }

  function initCanvas(id: string) {
    const ctx = getCtx(id);
    if (!ctx) return;
    ctx.clearRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  function restorePage(page: PageData) {
    const canvas = canvasRefs.current[page.id];
    if (!canvas || !page.imageData) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = page.imageData;
  }

  useEffect(() => {
    pages.forEach((p) => {
      const canvas = canvasRefs.current[p.id];
      if (!canvas) return;
      if (p.imageData) restorePage(p);
      else initCanvas(p.id);
    });
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function applyStrokeStyle(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(1, size);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawShape(ctx: CanvasRenderingContext2D, type: ShapeType, x0: number, y0: number, x1: number, y1: number) {
    applyStrokeStyle(ctx);
    ctx.beginPath();
    if (type === 'rect') {
      ctx.strokeRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0));
    } else if (type === 'circle') {
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      const rx = Math.max(1, Math.abs(x1 - x0) / 2);
      const ry = Math.max(1, Math.abs(y1 - y0) / 2);
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (type === 'line') {
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    } else if (type === 'arrow') {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const len = Math.hypot(dx, dy);
      if (len < 1) return;
      const angle = Math.atan2(dy, dx);
      const headLen = Math.min(20, len * 0.3);
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 - headLen * Math.cos(angle - Math.PI / 6), y1 - headLen * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1 - headLen * Math.cos(angle + Math.PI / 6), y1 - headLen * Math.sin(angle + Math.PI / 6));
      ctx.stroke();
    }
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const id = e.currentTarget.dataset.pageId!;
    const p = pos(e);

    if (tool === 'insert') {
      inserting.current = true;

      if (insertTab === 'text') {
        if (!textInput.trim()) return;
        const ctx = getCtx(id);
        if (ctx) {
          applyStrokeStyle(ctx);
          ctx.font = `${textFontSize}px ui-sans-serif, system-ui, sans-serif`;
          ctx.textBaseline = 'top';
          ctx.fillStyle = color;
          ctx.fillText(textInput, p.x, p.y);
          persist(id);
        }
        return;
      }

      if (insertTab === 'images') {
        const img = pendingImage.current;
        if (!img) return;
        const ctx = getCtx(id);
        if (ctx) {
          const maxW = 300;
          const scale = Math.min(1, maxW / img.width);
          const w = img.width * scale;
          const h = img.height * scale;
          ctx.drawImage(img, p.x - w / 2, p.y - h / 2, w, h);
          persist(id);
        }
        return;
      }

      if (insertTab === 'file') {
        const pf = pendingFile.current;
        if (!pf) return;
        const ctx = getCtx(id);
        if (ctx) {
          if (pf.isImage && pf.img) {
            const maxW = 300;
            const scale = Math.min(1, maxW / pf.img.width);
            const w = pf.img.width * scale;
            const h = pf.img.height * scale;
            ctx.drawImage(pf.img, p.x - w / 2, p.y - h / 2, w, h);
          } else {
            // Draw a file placeholder card
            const cardW = 200;
            const cardH = 60;
            const cx = p.x - cardW / 2;
            const cy = p.y - cardH / 2;
            applyStrokeStyle(ctx);
            ctx.fillStyle = '#f9fafb';
            ctx.strokeStyle = '#d1d5db';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(cx, cy, cardW, cardH, 8);
            ctx.fill();
            ctx.stroke();
            // File icon
            ctx.fillStyle = '#6b7280';
            ctx.font = '14px ui-sans-serif, system-ui, sans-serif';
            ctx.textBaseline = 'middle';
            ctx.fillText('📄', cx + 12, cy + cardH / 2);
            // Filename
            ctx.fillStyle = '#374151';
            const displayName = pf.name.length > 18 ? pf.name.slice(0, 16) + '…' : pf.name;
            ctx.fillText(displayName, cx + 36, cy + cardH / 2);
          }
          persist(id);
        }
        return;
      }

      if (insertTab === 'shapes') {
        const ctx = getCtx(id);
        if (ctx) {
          savedImageData.current = ctx.getImageData(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
        }
        shapeStart.current = p;
        drawing.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        return;
      }
      return;
    }

    drawing.current = true;
    lastPoint.current = p;
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = getCtx(id);
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    }
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const id = e.currentTarget.dataset.pageId!;
    const ctx = getCtx(id);
    if (!ctx) return;
    const p = pos(e);

    if (tool === 'insert' && insertTab === 'shapes' && shapeStart.current && savedImageData.current) {
      // Restore saved state then draw preview shape
      ctx.putImageData(savedImageData.current, 0, 0);
      drawShape(ctx, shapeType, shapeStart.current.x, shapeStart.current.y, p.x, p.y);
      return;
    }

    if (!lastPoint.current) return;
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = size * 4;
      ctx.globalAlpha = 1;
    } else if (tool === 'pencil') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = size;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
    }
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPoint.current = p;
  }

  function onPointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const id = e.currentTarget.dataset.pageId!;

    if (tool === 'insert' && insertTab === 'shapes' && shapeStart.current) {
      const ctx = getCtx(id);
      if (ctx && savedImageData.current) {
        ctx.putImageData(savedImageData.current, 0, 0);
        const p = pos(e);
        drawShape(ctx, shapeType, shapeStart.current.x, shapeStart.current.y, p.x, p.y);
      }
      shapeStart.current = null;
      savedImageData.current = null;
      drawing.current = false;
      if (ctx) { ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
      persist(id);
      return;
    }

    drawing.current = false;
    lastPoint.current = null;
    const ctx = getCtx(id);
    if (ctx) { ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
    persist(id);
  }

  function persist(id: string) {
    const canvas = canvasRefs.current[id];
    if (!canvas) return;
    const data = canvas.toDataURL('image/png');
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, imageData: data } : p)));
  }

  function addPage() {
    setPages((prev) => [...prev, newPage()]);
  }

  const save = useCallback(() => {
    if (onSave) {
      setNoteTitle('');
      setShowSaveModal(true);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    }
  }, [onSave]);

  function confirmSave() {
    const title = noteTitle.trim() || `Note ${new Date().toLocaleDateString()}`;
    onSave?.(title, pages);
    setShowSaveModal(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  function handleSelectTool(t: Tool) {
    setTool(t);
    if (t === 'insert') {
      setMenu('insert');
    } else {
      setMenu('tools');
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        pendingImage.current = img;
        setImagePreview(src);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setFilePreview(src);
      if (isImage) {
        const img = new Image();
        img.onload = () => {
          pendingFile.current = { img, name: file.name, isImage: true };
        };
        img.src = src;
      } else {
        pendingFile.current = { img: null, name: file.name, isImage: false };
      }
    };
    reader.readAsDataURL(file);
  }

  const tools: { id: Tool; icon: typeof Pen; label: string }[] = [
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'pencil', icon: Pencil, label: 'Pencil' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'insert', icon: Type, label: 'Insert' },
  ];

  const insertTabs: { id: InsertTab; icon: typeof Type; label: string }[] = [
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'shapes', icon: Square, label: 'Shapes' },
    { id: 'images', icon: ImageIcon, label: 'Images' },
    { id: 'file', icon: FileIcon, label: 'File' },
  ];

  return (
    <div className="flex gap-4 items-start">
      {/* Pages column */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Notes</h1>
            <p className={`mt-1 text-sm ${theme.cardAccent}`}>Write, sketch, and organize across as many pages as you need.</p>
          </div>
          <button
            onClick={save}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white transition-all ${theme.accent} ${theme.accentHover} shadow-sm`}
          >
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>

        {/* Placement hint banner when in insert mode */}
        {tool === 'insert' && menu === 'insert' && (
          <div className={`mb-4 rounded-lg border ${theme.cardBorder} ${theme.cardTint} px-4 py-2.5 text-sm ${theme.cardAccent} flex items-center gap-2`}>
            {insertTab === 'text' && <><Type size={15} /> Type your text below, then click on the page to place it.</>}
            {insertTab === 'shapes' && <><Square size={15} /> Pick a shape, then click and drag on the page to draw it.</>}
            {insertTab === 'images' && <><ImageIcon size={15} /> Upload an image, then click on the page to place it.</>}
            {insertTab === 'file' && <><FileIcon size={15} /> Upload a file, then click on the page to place it.</>}
          </div>
        )}

        <div className="space-y-8 pb-16">
          {pages.map((page, i) => (
            <div key={page.id} className="relative">
              <div className="absolute -left-10 top-2 hidden sm:flex flex-col items-center">
                <span className="text-xs font-medium text-gray-400">{i + 1}</span>
              </div>
              <div className={`rounded-lg shadow-sm border ${theme.cardBorder} overflow-hidden`}>
                <canvas
                  ref={(el) => { canvasRefs.current[page.id] = el; }}
                  data-page-id={page.id}
                  width={PAGE_WIDTH}
                  height={PAGE_HEIGHT}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerLeave={(e) => { if (drawing.current) onPointerUp(e); }}
                  className="block w-full h-auto touch-none transition-colors duration-200"
                  style={{
                    aspectRatio: `${PAGE_WIDTH} / ${PAGE_HEIGHT}`,
                    backgroundColor: pageColor,
                    cursor: tool === 'insert' ? 'copy' : 'crosshair',
                  }}
                />
              </div>
              <p className="mt-1.5 text-center text-xs text-gray-400">Page {i + 1} of {pages.length}</p>
            </div>
          ))}

          <button
            onClick={addPage}
            className="w-full py-4 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors text-sm font-medium inline-flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add page
          </button>
        </div>
      </div>

      {/* Right pill toolbar */}
      <div className="sticky top-20 z-20 hidden sm:block">
        <div className="flex flex-col items-center gap-1 p-2 rounded-full bg-white shadow-md border border-gray-100">
          {tools.map((t) => {
            const Icon = t.icon;
            const activeTool = tool === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectTool(t.id)}
                title={t.label}
                className={[
                  'w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200',
                  activeTool
                    ? `${theme.accent} text-white shadow-sm`
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
                ].join(' ')}
              >
                <Icon size={18} />
              </button>
            );
          })}

          <div className="w-7 h-px bg-gray-100 my-1" />

          {/* Page color swatches */}
          <Paintbrush size={14} className="text-gray-400 mb-0.5" />
          {PAGE_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setPageColor(c)}
              title={`Page ${c}`}
              className={[
                'w-8 h-8 rounded-full transition-all duration-200 border-2',
                pageColor === c ? 'border-gray-800 scale-110' : 'border-gray-200',
              ].join(' ')}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Save title modal */}
      {showSaveModal && (
        <div className="fixed z-50 inset-0 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4" onClick={() => setShowSaveModal(false)}>
          <div
            className="w-full max-w-sm rounded-2xl bg-white shadow-xl border border-gray-100 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Save size={18} className={theme.cardAccent} /> Save note
            </h3>
            <input
              autoFocus
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') confirmSave(); if (e.key === 'Escape') setShowSaveModal(false); }}
              placeholder="Note title..."
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all ${theme.accent} ${theme.accentHover}`}
              >
                <Save size={15} /> Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />

      {/* Contextual tool sub-menu (width + ink color for pen/pencil/eraser) */}
      {menu === 'tools' && (
        <div className="fixed z-50 inset-0" onClick={() => setMenu(null)}>
          <div
            className="absolute right-20 top-1/2 -translate-y-1/2 w-64 rounded-2xl bg-white shadow-xl border border-gray-100 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 capitalize flex items-center gap-2">
                {tool === 'pen' && <Pen size={15} className={theme.cardAccent} />}
                {tool === 'pencil' && <Pencil size={15} className={theme.cardAccent} />}
                {tool === 'eraser' && <Eraser size={15} className={theme.cardAccent} />}
                {tool} options
              </h3>
              <button
                onClick={() => setMenu(null)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                aria-label="Close options"
              >
                <X size={16} />
              </button>
            </div>

            {/* Width */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-500">Width</label>
                <span className="text-xs font-mono text-gray-700">{size}px</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-gray-700"
              />
              <div className="mt-2 h-6 flex items-center">
                <div
                  className="rounded-full"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: tool === 'eraser' ? '#d1d5db' : color,
                    opacity: tool === 'pencil' ? 0.5 : 1,
                  }}
                />
              </div>
            </div>

            {/* Color (hidden for eraser) */}
            {tool !== 'eraser' && (
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Colour</label>
                <div className="grid grid-cols-6 gap-2">
                  {INK_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      title={c}
                      className={[
                        'w-7 h-7 rounded-full transition-all duration-200 border-2',
                        color === c ? 'border-gray-800 scale-110' : 'border-gray-100',
                      ].join(' ')}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Insert panel */}
      {menu === 'insert' && (
        <div className="fixed z-50 inset-0" onClick={() => setMenu(null)}>
          <div
            className="absolute right-20 top-1/2 -translate-y-1/2 w-72 rounded-2xl bg-white shadow-xl border border-gray-100 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Type size={15} className={theme.cardAccent} /> Insert
              </h3>
              <button
                onClick={() => setMenu(null)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                aria-label="Close insert panel"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tab buttons */}
            <div className="grid grid-cols-4 gap-1.5 mb-4">
              {insertTabs.map((tab) => {
                const Icon = tab.icon;
                const active = insertTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setInsertTab(tab.id)}
                    className={[
                      'flex flex-col items-center gap-1 py-2 rounded-lg text-xs font-medium transition-all duration-200',
                      active
                        ? `${theme.accent} text-white`
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
                    ].join(' ')}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Text tab */}
            {insertTab === 'text' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Text</label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type your text here..."
                    rows={3}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-gray-500">Font size</label>
                    <span className="text-xs font-mono text-gray-700">{textFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={72}
                    value={textFontSize}
                    onChange={(e) => setTextFontSize(Number(e.target.value))}
                    className="w-full accent-gray-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Colour</label>
                  <div className="grid grid-cols-6 gap-2">
                    {INK_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        title={c}
                        className={[
                          'w-7 h-7 rounded-full transition-all duration-200 border-2',
                          color === c ? 'border-gray-800 scale-110' : 'border-gray-100',
                        ].join(' ')}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-400 pt-1">Click on the page to place your text.</p>
              </div>
            )}

            {/* Shapes tab */}
            {insertTab === 'shapes' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Shape</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {SHAPES.map((s) => {
                      const Icon = s.icon;
                      const active = shapeType === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setShapeType(s.id)}
                          title={s.label}
                          className={[
                            'flex flex-col items-center gap-1 py-2.5 rounded-lg transition-all duration-200',
                            active
                              ? `${theme.accent} text-white`
                              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900',
                          ].join(' ')}
                        >
                          <Icon size={16} />
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-gray-500">Line width</label>
                    <span className="text-xs font-mono text-gray-700">{size}px</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="w-full accent-gray-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Colour</label>
                  <div className="grid grid-cols-6 gap-2">
                    {INK_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        title={c}
                        className={[
                          'w-7 h-7 rounded-full transition-all duration-200 border-2',
                          color === c ? 'border-gray-800 scale-110' : 'border-gray-100',
                        ].join(' ')}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-400 pt-1">Click and drag on the page to draw the shape.</p>
              </div>
            )}

            {/* Images tab */}
            {insertTab === 'images' && (
              <div className="space-y-3">
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full py-3 rounded-lg border-2 border-dashed border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors text-sm font-medium inline-flex items-center justify-center gap-2"
                >
                  <Upload size={15} /> Upload image
                </button>
                {imagePreview && (
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full max-h-40 object-contain bg-gray-50" />
                    <p className="px-3 py-2 text-xs text-gray-500">Ready — click on the page to place it.</p>
                  </div>
                )}
                {!imagePreview && (
                  <p className="text-xs text-gray-400">Choose an image file, then click on the page to place it.</p>
                )}
              </div>
            )}

            {/* File tab */}
            {insertTab === 'file' && (
              <div className="space-y-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 rounded-lg border-2 border-dashed border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors text-sm font-medium inline-flex items-center justify-center gap-2"
                >
                  <Upload size={15} /> Upload file
                </button>
                {filePreview && fileName && (
                  <div className="rounded-lg border border-gray-200 p-3 flex items-center gap-2">
                    {filePreview && pendingFile.current?.isImage ? (
                      <img src={filePreview} alt="Preview" className="w-10 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                        <FileIcon size={18} className="text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{fileName}</p>
                      <p className="text-xs text-gray-400">Ready — click on the page to place it.</p>
                    </div>
                  </div>
                )}
                {!filePreview && (
                  <p className="text-xs text-gray-400">Choose any file, then click on the page to place it. Images are embedded; other files appear as a label card.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
