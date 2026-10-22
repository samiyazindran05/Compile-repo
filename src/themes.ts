export type Mode = 'Study' | 'Work' | 'Universal';

export type Theme = {
  mode: Mode;
  // accent = primary action / active state color
  accent: string;
  accentHover: string;
  accentSoft: string;
  accentText: string;
  // page background tint
  pageBg: string;
  // sidebar logo tile
  logoBg: string;
  // nav active item
  navActiveBg: string;
  navActiveText: string;
  // mode switcher active pill
  pillActiveBg: string;
  pillActiveText: string;
  pillTrackBg: string;
  pillTrackBorder: string;
  // notification dot
  dotBg: string;
  // welcome card border + tint
  cardBorder: string;
  cardTint: string;
  cardAccent: string;
};

export const themes: Record<Mode, Theme> = {
  Study: {
    mode: 'Study',
    accent: 'bg-emerald-600',
    accentHover: 'hover:bg-emerald-700',
    accentSoft: 'bg-emerald-50',
    accentText: 'text-emerald-700',
    pageBg: 'bg-emerald-50/40',
    logoBg: 'bg-emerald-600',
    navActiveBg: 'bg-emerald-600',
    navActiveText: 'text-white',
    pillActiveBg: 'bg-emerald-600',
    pillActiveText: 'text-white',
    pillTrackBg: 'bg-emerald-100',
    pillTrackBorder: 'border-emerald-200',
    dotBg: 'bg-emerald-600',
    cardBorder: 'border-emerald-200',
    cardTint: 'bg-white',
    cardAccent: 'text-emerald-700',
  },
  Work: {
    mode: 'Work',
    accent: 'bg-blue-600',
    accentHover: 'hover:bg-blue-700',
    accentSoft: 'bg-blue-50',
    accentText: 'text-blue-700',
    pageBg: 'bg-blue-50/40',
    logoBg: 'bg-blue-600',
    navActiveBg: 'bg-blue-600',
    navActiveText: 'text-white',
    pillActiveBg: 'bg-blue-600',
    pillActiveText: 'text-white',
    pillTrackBg: 'bg-blue-100',
    pillTrackBorder: 'border-blue-200',
    dotBg: 'bg-blue-600',
    cardBorder: 'border-blue-200',
    cardTint: 'bg-white',
    cardAccent: 'text-blue-700',
  },
  Universal: {
    mode: 'Universal',
    accent: 'bg-orange-500',
    accentHover: 'hover:bg-orange-600',
    accentSoft: 'bg-orange-50',
    accentText: 'text-orange-700',
    pageBg: 'bg-orange-50/40',
    logoBg: 'bg-orange-500',
    navActiveBg: 'bg-orange-500',
    navActiveText: 'text-white',
    pillActiveBg: 'bg-orange-500',
    pillActiveText: 'text-white',
    pillTrackBg: 'bg-orange-100',
    pillTrackBorder: 'border-orange-200',
    dotBg: 'bg-orange-500',
    cardBorder: 'border-orange-200',
    cardTint: 'bg-white',
    cardAccent: 'text-orange-700',
  },
};

export const modes: Mode[] = ['Study', 'Work', 'Universal'];
