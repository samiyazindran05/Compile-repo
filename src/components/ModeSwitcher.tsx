import type { Theme, Mode } from '../themes';
import { modes } from '../themes';

type ModeSwitcherProps = {
  mode: Mode;
  onChange: (mode: Mode) => void;
  theme: Theme;
};

export default function ModeSwitcher({ mode, onChange, theme }: ModeSwitcherProps) {
  return (
    <div className={`inline-flex items-center gap-1 p-1 rounded-full ${theme.pillTrackBg} border ${theme.pillTrackBorder} transition-colors duration-300`}>
      {modes.map((m) => {
        const isActive = mode === m;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={[
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
              isActive
                ? `${theme.pillActiveBg} ${theme.pillActiveText} shadow-sm`
                : 'text-gray-500 hover:text-gray-800',
            ].join(' ')}
          >
            {m}
          </button>
        );
      })}
    </div>
  );
}
