import { useState, useCallback } from 'react';
import { Calculator as CalcIcon } from 'lucide-react';
import type { Theme } from '../themes';

type CalculatorProps = {
  theme: Theme;
};

type KeyKind = 'digit' | 'dot' | 'op' | 'fn' | 'paren' | 'const' | 'equals' | 'clear';

type Key = {
  label: string;
  kind: KeyKind;
  value?: string;
  span?: number;
};

const KEYS: Key[] = [
  // Row 1 — scientific functions
  { label: 'sin', kind: 'fn', value: 'sin(' },
  { label: 'cos', kind: 'fn', value: 'cos(' },
  { label: 'tan', kind: 'fn', value: 'tan(' },
  { label: 'log', kind: 'fn', value: 'log(' },
  { label: 'ln', kind: 'fn', value: 'ln(' },
  // Row 2
  { label: '√', kind: 'fn', value: 'sqrt(' },
  { label: 'x²', kind: 'fn', value: '^2' },
  { label: 'xʸ', kind: 'fn', value: '^' },
  { label: 'π', kind: 'const', value: 'pi' },
  { label: 'e', kind: 'const', value: 'e' },
  // Row 3
  { label: '(', kind: 'paren', value: '(' },
  { label: ')', kind: 'paren', value: ')' },
  { label: '!', kind: 'fn', value: '!' },
  { label: '1/x', kind: 'fn', value: '^-1' },
  { label: 'AC', kind: 'clear' },
  // Row 4
  { label: '7', kind: 'digit', value: '7' },
  { label: '8', kind: 'digit', value: '8' },
  { label: '9', kind: 'digit', value: '9' },
  { label: '÷', kind: 'op', value: '/' },
  { label: 'DEL', kind: 'clear' },
  // Row 5
  { label: '4', kind: 'digit', value: '4' },
  { label: '5', kind: 'digit', value: '5' },
  { label: '6', kind: 'digit', value: '6' },
  { label: '×', kind: 'op', value: '*' },
  { label: '%', kind: 'op', value: '%' },
  // Row 6
  { label: '1', kind: 'digit', value: '1' },
  { label: '2', kind: 'digit', value: '2' },
  { label: '3', kind: 'digit', value: '3' },
  { label: '−', kind: 'op', value: '-' },
  { label: 'EXP', kind: 'fn', value: 'E' },
  // Row 7
  { label: '0', kind: 'digit', value: '0', span: 2 },
  { label: '.', kind: 'dot', value: '.' },
  { label: '+', kind: 'op', value: '+' },
  { label: '=', kind: 'equals' },
];

// --- Expression evaluator (safe, no eval) ---
function tokenize(expr: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  const s = expr.replace(/\s+/g, '');
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let num = '';
      while (i < s.length && /[0-9.]/.test(s[i])) num += s[i++];
      // scientific notation: 1E5 or 1e5
      if (s[i] === 'E' || s[i] === 'e') {
        num += s[i++];
        if (s[i] === '+' || s[i] === '-') num += s[i++];
        while (i < s.length && /[0-9]/.test(s[i])) num += s[i++];
      }
      tokens.push(num);
    } else if (/[a-z]/i.test(c)) {
      let name = '';
      while (i < s.length && /[a-z]/i.test(s[i])) name += s[i++];
      tokens.push(name);
    } else {
      tokens.push(c);
      i++;
    }
  }
  return tokens;
}

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

const FUNCTIONS: Record<string, (x: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  log: Math.log10,
  ln: Math.log,
  sqrt: Math.sqrt,
};

type Ast = number | { op: string; left: Ast; right: Ast } | { fn: string; arg: Ast } | { negate: Ast } | { factorial: Ast };

function parseExpression(tokens: string[]): { ast: Ast; pos: number } {
  let pos = 0;

  function peek(): string | null {
    return pos < tokens.length ? tokens[pos] : null;
  }

  function parseAddSub(): Ast {
    let left = parseMulDiv();
    while (peek() === '+' || peek() === '-') {
      const op = tokens[pos++];
      const right = parseMulDiv();
      left = { op, left, right };
    }
    return left;
  }

  function parseMulDiv(): Ast {
    let left = parsePower();
    while (peek() === '*' || peek() === '/' || peek() === '%') {
      const op = tokens[pos++];
      const right = parsePower();
      left = { op, left, right };
    }
    return left;
  }

  function parsePower(): Ast {
    const left = parseUnary();
    if (peek() === '^') {
      pos++;
      const right = parsePower();
      return { op: '^', left, right };
    }
    return left;
  }

  function parseUnary(): Ast {
    if (peek() === '-') {
      pos++;
      return { negate: parseUnary() };
    }
    if (peek() === '+') {
      pos++;
      return parseUnary();
    }
    return parsePrimary();
  }

  function parsePrimary(): Ast {
    const tok = peek();
    if (tok === null) throw new Error('Unexpected end');
    if (/^[0-9.]/.test(tok)) {
      pos++;
      return parseFloat(tok);
    }
    if (tok in CONSTANTS) {
      pos++;
      return CONSTANTS[tok];
    }
    if (tok in FUNCTIONS) {
      const fn = tok;
      pos++;
      if (peek() !== '(') throw new Error(`Expected ( after ${fn}`);
      pos++;
      const arg = parseAddSub();
      if (peek() !== ')') throw new Error('Expected )');
      pos++;
      return { fn, arg };
    }
    if (tok === '(') {
      pos++;
      const expr = parseAddSub();
      if (peek() !== ')') throw new Error('Expected )');
      pos++;
      return expr;
    }
    throw new Error(`Unexpected token: ${tok}`);
  }

  // Post-process: handle factorial (postfix !)
  function parseFactorialTokens(): Ast {
    const base = parseAddSub();
    while (peek() === '!') {
      pos++;
      return { factorial: base };
    }
    return base;
  }

  // Override parsePrimary to handle factorial properly — re-do with wrapper
  const ast = parseFactorialTokens();
  return { ast, pos };
}

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function evaluate(ast: Ast): number {
  if (typeof ast === 'number') return ast;
  if ('op' in ast) {
    const l = evaluate(ast.left);
    const r = evaluate(ast.right);
    switch (ast.op) {
      case '+': return l + r;
      case '-': return l - r;
      case '*': return l * r;
      case '/': return l / r;
      case '%': return l % r;
      case '^': return Math.pow(l, r);
      default: return NaN;
    }
  }
  if ('fn' in ast) {
    const v = evaluate(ast.arg);
    return FUNCTIONS[ast.fn]?.(v) ?? NaN;
  }
  if ('negate' in ast) return -evaluate(ast.negate);
  if ('factorial' in ast) return factorial(evaluate(ast.factorial));
  return NaN;
}

function compute(expr: string): number {
  if (!expr.trim()) return 0;
  const tokens = tokenize(expr);
  const { ast } = parseExpression(tokens);
  return evaluate(ast);
}

function formatResult(n: number): string {
  if (Number.isNaN(n)) return 'Error';
  if (!Number.isFinite(n)) return n > 0 ? '∞' : '−∞';
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return n.toString();
  // Trim trailing zeros, cap precision
  const fixed = n.toPrecision(10);
  return parseFloat(fixed).toString();
}

export default function Calculator({ theme }: CalculatorProps) {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('0');

  const handleKey = useCallback((key: Key) => {
    if (key.kind === 'clear') {
      if (key.label === 'AC') {
        setExpr('');
        setResult('0');
      } else if (key.label === 'DEL') {
        setExpr((prev) => prev.slice(0, -1));
      }
      return;
    }

    if (key.kind === 'equals') {
      try {
        const val = compute(expr);
        setResult(formatResult(val));
      } catch {
        setResult('Error');
      }
      return;
    }

    setExpr((prev) => prev + (key.value ?? key.label));
  }, [expr]);

  function keyClass(key: Key): string {
    const base = 'h-12 rounded-xl text-sm font-medium transition-all duration-150 active:scale-95 flex items-center justify-center';
    switch (key.kind) {
      case 'digit':
      case 'dot':
        return `${base} bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-100`;
      case 'op':
        return `${base} ${theme.accentSoft} ${theme.accentText} hover:brightness-95 border ${theme.cardBorder}`;
      case 'fn':
      case 'const':
      case 'paren':
        return `${base} bg-white text-gray-600 hover:bg-gray-50 border border-gray-100`;
      case 'equals':
        return `${base} ${theme.accent} text-white hover:brightness-110 shadow-sm`;
      case 'clear':
        return `${base} bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100`;
      default:
        return base;
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <CalcIcon size={24} className={theme.cardAccent} /> Calculator
        </h1>
        <p className={`mt-1 text-sm ${theme.cardAccent}`}>A full scientific calculator — trig, logs, powers, constants and more.</p>
      </div>

      {/* Calculator body */}
      <div className={`max-w-md mx-auto rounded-2xl border ${theme.cardBorder} bg-white p-5 shadow-sm`}>
        {/* Display */}
        <div className={`rounded-xl ${theme.accentSoft} border ${theme.cardBorder} p-4 mb-4 min-h-[96px] flex flex-col justify-end`}>
          <div className="text-right text-xs text-gray-400 font-mono break-all min-h-[18px]">
            {expr || '\u00A0'}
          </div>
          <div className={`text-right text-3xl font-semibold ${theme.accentText} font-mono break-all mt-1`}>
            {result}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-5 gap-2">
          {KEYS.map((key, idx) => (
            <button
              key={`${key.label}-${idx}`}
              onClick={() => handleKey(key)}
              className={keyClass(key)}
              style={key.span ? { gridColumn: `span ${key.span}` } : undefined}
            >
              {key.label}
            </button>
          ))}
        </div>

        {/* Helper text */}
        <p className="mt-4 text-center text-xs text-gray-400">
          Use <span className="font-mono">^</span> for powers, <span className="font-mono">!</span> for factorial.
          Trig functions use radians.
        </p>
      </div>
    </div>
  );
}
