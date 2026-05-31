import { useState, useEffect, useRef, type MouseEvent, type JSX } from "react";

/* ── Types ─────────────────────────────────────────────────────────────────── */

type Screen = "settings" | "memorize" | "recall" | "results";

type Phase = "memorize" | "recall";

interface ColorPalette {
  bg: string;
  grad: string;
  surface: string;
  border: string;
  accent: string;
  red: string;
  redDim: string;
  green: string;
  text: string;
  soft: string;
  muted: string;
  dim: string;
}

/* ── Constants ─────────────────────────────────────────────────────────────── */

const WORDS: readonly string[] = [
  "Яблоко","Корабль","Фонарь","Замок","Облако","Дракон","Зеркало","Башня","Якорь","Пламя",
  "Мост","Ключ","Звезда","Лес","Часы","Книга","Письмо","Гора","Река","Птица",
  "Камень","Свеча","Нить","Колесо","Окно","Чаша","Щит","Меч","Перо","Луна",
  "Лестница","Маяк","Сад","Туман","Скала","Зонт","Шляпа","Тень","Огонь","Волна",
  "Цепь","Карта","Бочка","Флаг","Кольцо","Корень","Гром","Лампа","Парус","Дверь",
  "Кубок","Дерево","Дорога","Небо","Земля","Ветер","Вода","Лёд","Снег","Дождь",
  "Факел","Кинжал","Арфа","Колодец","Маска","Верёвка","Статуя","Ладья","Печать","Нож",
];

const C: ColorPalette = {
  bg:      "#060610",
  grad:    "radial-gradient(ellipse 110% 55% at 50% -5%, #1c1050 0%, #060610 62%)",
  surface: "#0d0d1c",
  border:  "#181830",
  accent:  "#f0b429",
  red:     "#e05454",
  redDim:  "rgba(224,84,84,.1)",
  green:   "#3ecf8e",
  text:    "#e2e2ef",
  soft:    "#7878a8",
  muted:   "#48488a",
  dim:     "#1a1a38",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
  :root {
    --serif: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
    --ui: 'DM Sans', system-ui, -apple-system, sans-serif;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; overflow: hidden; }
  body { background: #060610; -webkit-tap-highlight-color: transparent; }
  button { cursor: pointer; border: none; outline: none; touch-action: manipulation; font-family: var(--ui); }
  @keyframes wi {
    from { opacity: 0; transform: translateY(22px) scale(.94); filter: blur(5px); }
    to   { opacity: 1; transform: none; filter: none; }
  }
  @keyframes fi { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fu { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
  @keyframes pulse { 0%,100% { opacity:.3 } 50% { opacity:.7 } }
  .wi { animation: wi .45s cubic-bezier(.16,1,.3,1) both; }
  .fi { animation: fi .4s ease both; }
  .fu { animation: fu .3s cubic-bezier(.16,1,.3,1) both; }
  .pulse { animation: pulse 1.6s ease-in-out infinite; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: #1c1c38; border-radius: 2px; }
`;

/* ── Helpers ───────────────────────────────────────────────────────────────── */

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── Components ────────────────────────────────────────────────────────────── */

interface OptProps {
  val: number;
  active: boolean;
  onClick: () => void;
}

function Opt({ val, active, onClick }: OptProps): JSX.Element {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: "13px 0", borderRadius: 10,
      fontSize: 16, fontWeight: 600, fontFamily: "var(--ui)",
      background: active ? C.accent : C.surface,
      color: active ? "#000" : C.soft,
      border: `1px solid ${active ? C.accent : C.border}`,
      transition: "all .15s ease",
    }}>
      {val}
    </button>
  );
}

/* ── Settings ──────────────────────────────────────────────────────────────── */

interface SettingsProps {
  onStart: (wc: number, spw: number) => void;
}

function Settings({ onStart }: SettingsProps): JSX.Element {
  const [wc,  setWc]  = useState<number>(10);
  const [spw, setSpw] = useState<number>(5);

  return (
    <div className="fi" style={{
      maxWidth: 390, margin: "0 auto", minHeight: "100dvh",
      display: "flex", flexDirection: "column",
      justifyContent: "center", padding: "40px 24px", gap: 44,
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 10, letterSpacing: ".28em", textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>
          тренажёр памяти
        </div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 64, fontWeight: 700, color: C.text, lineHeight: .92, letterSpacing: "-.02em" }}>
          Мнемо
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 18 }}>
          <div style={{ width: 6,  height: 2, borderRadius: 1, background: C.dim }} />
          <div style={{ width: 28, height: 2, borderRadius: 1, background: C.accent }} />
          <div style={{ width: 6,  height: 2, borderRadius: 1, background: C.dim }} />
        </div>
      </div>
      <div>
        <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: C.muted, marginBottom: 14 }}>
          Количество слов
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[5, 8, 10, 15, 20].map((n: number) => (
            <Opt key={n} val={n} active={wc === n} onClick={() => setWc(n)} />
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: C.muted, marginBottom: 14 }}>
          Секунд на слово
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[2, 3, 5, 8, 10].map((s: number) => (
            <Opt key={s} val={s} active={spw === s} onClick={() => setSpw(s)} />
          ))}
        </div>
      </div>
      <button
        onClick={() => onStart(wc, spw)}
        style={{
          width: "100%", padding: 19, borderRadius: 14,
          background: C.accent, color: "#000",
          fontSize: 16, fontWeight: 600, letterSpacing: ".07em",
          textTransform: "uppercase",
          boxShadow: "0 0 48px rgba(240,180,41,.2)",
        }}
      >
        Начать
      </button>
    </div>
  );
}

/* ── Progress bar ──────────────────────────────────────────────────────────── */

interface BarProps {
  p: number;
}

function Bar({ p }: BarProps): JSX.Element {
  const hue  = Math.round(43 * p);
  const clr  = `hsl(${hue},87%,55%)`;
  const glow = `hsla(${hue},87%,55%,.45)`;
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: C.dim }}>
      <div style={{
        height: "100%", width: `${p * 100}%`,
        background: clr, boxShadow: `0 0 12px ${glow}`,
        transition: "width .1s linear, background .25s, box-shadow .25s",
        borderRadius: "0 2px 2px 0",
      }} />
    </div>
  );
}

/* ── Phase card (memorize + recall) ────────────────────────────────────────── */

interface PhaseCardProps {
  phase: Phase;
  word: string | null;
  displayKey: number;
  counter: string;
  hint: string;
  p: number;
  spw: number;
  btnEnabled: boolean;
  onTap: () => void;
  onForgot: () => void;
}

function PhaseCard({
  phase,
  word,
  displayKey,
  counter,
  hint,
  p,
  spw,
  btnEnabled,
  onTap,
  onForgot,
}: PhaseCardProps): JSX.Element {
  const [ak, setAk] = useState<number>(0);

  useEffect(() => { setAk((k: number) => k + 1); }, [displayKey]);

  const isBlank  = word == null;
  const isRecall = phase === "recall";
  const fs = word ? (word.length > 9 ? 42 : word.length > 6 ? 52 : 62) : 62;
  const hue  = Math.round(43 * p);
  const secs = Math.ceil(p * spw);

  return (
    <div
      onClick={onTap}
      style={{
        maxWidth: 390, margin: "0 auto", minHeight: "100dvh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "80px 32px 96px", position: "relative",
        userSelect: "none", cursor: "pointer",
      }}
    >
      {/* phase label */}
      <div style={{
        position: "absolute", top: 28, left: 0, right: 0, textAlign: "center",
        fontSize: 9, letterSpacing: ".32em", textTransform: "uppercase",
        color: C.muted, fontFamily: "var(--ui)",
      }}>
        {isRecall ? "вспомни" : "запомни"}
      </div>

      {/* seconds */}
      <div style={{
        position: "absolute", top: 22, left: 24,
        fontSize: 13, fontWeight: 600, fontFamily: "var(--ui)",
        fontVariantNumeric: "tabular-nums",
        color: `hsl(${hue},87%,55%)`, transition: "color .25s",
      }}>
        {secs}
      </div>

      {/* counter */}
      <div style={{
        position: "absolute", top: 22, right: 24,
        fontSize: 13, color: C.soft, fontFamily: "var(--ui)",
        fontVariantNumeric: "tabular-nums",
      }}>
        {counter}
      </div>

      {/* word or blank placeholder */}
      {isBlank ? (
        <div
          key={ak}
          className="pulse"
          style={{
            fontFamily: "var(--serif)", fontSize: 80, fontWeight: 700,
            color: C.dim, lineHeight: 1,
          }}
        >
          ?
        </div>
      ) : (
        <div
          key={ak}
          className="wi"
          style={{
            fontFamily: "var(--serif)",
            fontSize: fs, fontWeight: 700,
            color: C.text, textAlign: "center",
            lineHeight: 1.15, letterSpacing: "-.01em",
          }}
        >
          {word}
        </div>
      )}

      {/* hint */}
      <div style={{
        position: "absolute",
        bottom: (isRecall) ? 96 : 40,
        fontSize: 10, color: C.dim, letterSpacing: ".12em", fontFamily: "var(--ui)",
      }}>
        {hint}
      </div>

      {/* "Не вспомнил" button — recall only, disabled when blank */}
      {isRecall && (
        <button
          key={`f${ak}`}
          className={btnEnabled ? "fu" : ""}
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            if (btnEnabled) onForgot();
          }}
          style={{
            position: "absolute", bottom: 24,
            padding: "14px 40px", borderRadius: 12,
            background: btnEnabled ? C.redDim : "transparent",
            border: `1px solid ${btnEnabled ? C.red + "66" : C.dim}`,
            color: btnEnabled ? C.red : C.dim,
            fontSize: 14, fontWeight: 500, letterSpacing: ".05em",
            opacity: btnEnabled ? 1 : 0.4,
            pointerEvents: btnEnabled ? "auto" : "none",
            transition: "opacity .2s, border-color .2s, color .2s, background .2s",
          }}
        >
          Не вспомнил
        </button>
      )}

      <Bar p={p} />
    </div>
  );
}

/* ── Results ───────────────────────────────────────────────────────────────── */

interface ResultsProps {
  words: string[];
  results: boolean[];
  wc: number;
  spw: number;
  onRestart: () => void;
}

interface StatItem {
  l: string;
  v: number;
  bad: boolean;
}

function Results({ words, results, wc, spw, onRestart }: ResultsProps): JSX.Element {
  const errors = results.filter((r: boolean) => !r).length;
  const score  = wc - errors;

  const stats: StatItem[] = [
    { l: "Слов",      v: wc,     bad: false },
    { l: "Сек/слово", v: spw,    bad: false },
    { l: "Ошибок",    v: errors, bad: errors > 0 },
  ];

  return (
    <div className="fi" style={{
      maxWidth: 390, margin: "0 auto", height: "100dvh",
      display: "flex", flexDirection: "column",
      padding: "36px 24px 24px", fontFamily: "var(--ui)",
    }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 10, letterSpacing: ".25em", textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>
          Итог
        </div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 44, fontWeight: 700, color: C.text, lineHeight: 1 }}>
          Результаты
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
        {stats.map(({ l, v, bad }: StatItem) => (
          <div key={l} style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: "14px 8px", textAlign: "center",
          }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: bad ? C.red : C.text, fontVariantNumeric: "tabular-nums" }}>{v}</div>
            <div style={{ fontSize: 9, color: C.muted, marginTop: 4, letterSpacing: ".1em", textTransform: "uppercase" }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.soft, marginBottom: 8 }}>
          <span>Правильно</span>
          <span style={{ color: C.text, fontWeight: 600 }}>{score} / {wc}</span>
        </div>
        <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${(score / wc) * 100}%`,
            background: errors === 0 ? C.green : C.accent, borderRadius: 2,
            transition: "width .9s cubic-bezier(.16,1,.3,1)",
          }} />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", marginBottom: 14 }}>
        {words.map((word: string, i: number) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 2px", borderBottom: `1px solid ${C.border}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 11, color: C.dim, width: 18, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {i + 1}
              </span>
              <span style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 700, color: results[i] ? C.text : C.red }}>
                {word}
              </span>
            </div>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
              background: results[i] ? `${C.green}18` : `${C.red}18`,
              border: `1px solid ${results[i] ? C.green + "55" : C.red + "55"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, color: results[i] ? C.green : C.red,
            }}>
              {results[i] ? "✓" : "✗"}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onRestart}
        style={{
          width: "100%", padding: 17, borderRadius: 14,
          background: C.surface, color: C.text,
          fontSize: 15, fontWeight: 500,
          border: `1px solid ${C.border}`, letterSpacing: ".04em",
        }}
      >
        Начать заново
      </button>
    </div>
  );
}

/* ── App ───────────────────────────────────────────────────────────────────── */

export default function App(): JSX.Element {
  const [screen,  setScreen]  = useState<Screen>("settings");
  const [words,   setWords]   = useState<string[]>([]);
  const [wc,      setWc]      = useState<number>(10);
  const [spw,     setSpw]     = useState<number>(5);

  // Memorize state
  const [mIdx,    setMIdx]    = useState<number>(0);

  // Recall state
  const [rShown,  setRShown]  = useState<number>(-1);
  const [results, setResults] = useState<boolean[]>([]);

  const [p,       setP]       = useState<number>(1);

  const toR = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ivR = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = (): void => {
    if (toR.current) clearTimeout(toR.current);
    if (ivR.current) clearInterval(ivR.current);
  };

  /* inject global CSS */
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => { document.head.removeChild(el); };
  }, []);

  /* ── Memorize timer ──────────────────────────────────────────────────────── */
  useEffect(() => {
    if (screen !== "memorize") return;
    const ms   = spw * 1000;
    const wlen = words.length;
    const t0   = Date.now();
    setP(1);

    ivR.current = setInterval(() => {
      setP(Math.max(0, 1 - (Date.now() - t0) / ms));
    }, 50);

    toR.current = setTimeout(() => {
      if (ivR.current) clearInterval(ivR.current);
      const next = mIdx + 1;
      if (next >= wlen) {
        setRShown(-1);
        setResults(Array(wlen).fill(true));
        setScreen("recall");
      } else {
        setP(1);
        setMIdx(next);
      }
    }, ms);

    return clear;
  }, [screen, mIdx, spw, words.length]);

  /* ── Recall timer ────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (screen !== "recall") return;
    const ms     = spw * 1000;
    const wlen   = words.length;
    const isLast = rShown === wlen - 1;
    const t0     = Date.now();
    setP(1);

    ivR.current = setInterval(() => {
      setP(Math.max(0, 1 - (Date.now() - t0) / ms));
    }, 50);

    toR.current = setTimeout(() => {
      if (ivR.current) clearInterval(ivR.current);
      if (isLast) {
        setScreen("results");
      } else {
        const nextIdx = rShown + 1;
        setResults((r: boolean[]) => { const n = [...r]; n[nextIdx] = false; return n; });
        setP(1);
        setRShown(nextIdx);
      }
    }, ms);

    return clear;
  }, [screen, rShown, spw, words.length]);

  /* ── Memorize: user taps ─────────────────────────────────────────────────── */
  const handleMTap = (): void => {
    clear(); setP(1);
    const next = mIdx + 1;
    if (next >= words.length) {
      setRShown(-1);
      setResults(Array(words.length).fill(true));
      setScreen("recall");
    } else {
      setMIdx(next);
    }
  };

  /* ── Recall: user taps ───────────────────────────────────────────────────── */
  const handleRTap = (): void => {
    clear(); setP(1);
    if (rShown === words.length - 1) {
      setScreen("results");
    } else {
      setRShown((s: number) => s + 1);
    }
  };

  /* ── Recall: "Не вспомнил" ───────────────────────────────────────────────── */
  const handleForgot = (): void => {
    if (rShown < 0) return;
    clear();
    setResults((r: boolean[]) => { const n = [...r]; n[rShown] = false; return n; });
    if (rShown === words.length - 1) {
      setScreen("results");
    } else {
      setP(1);
      setRShown((s: number) => s + 1);
    }
  };

  /* ── Start ───────────────────────────────────────────────────────────────── */
  const handleStart = (newWc: number, newSpw: number): void => {
    setWords(shuffle(WORDS).slice(0, newWc));
    setWc(newWc); setSpw(newSpw);
    setMIdx(0); setP(1);
    setScreen("memorize");
  };

  /* ── Derive display props for PhaseCard ──────────────────────────────────── */
  const isBlank    = rShown < 0;
  const isLast     = rShown === words.length - 1;
  const btnEnabled = !isBlank;

  const recallWord    = isBlank ? null : words[rShown];
  const recallCounter = isBlank
    ? `?/${words.length}`
    : `${rShown + 1}/${words.length}`;
  const recallHint = isBlank
    ? "нажмите — первое слово вспомнил"
    : isLast
      ? "нажмите — всё верно"
      : "нажмите — следующее вспомнил";

  return (
    <div style={{ minHeight: "100dvh", background: C.grad, color: C.text, overflow: "hidden" }}>
      {screen === "settings" && (
        <Settings onStart={handleStart} />
      )}

      {screen === "memorize" && (
        <PhaseCard
          phase="memorize"
          word={words[mIdx]}
          displayKey={mIdx}
          counter={`${mIdx + 1}/${words.length}`}
          hint="нажмите — далее"
          p={p}
          spw={spw}
          btnEnabled={false}
          onTap={handleMTap}
          onForgot={() => {}}
        />
      )}

      {screen === "recall" && (
        <PhaseCard
          phase="recall"
          word={recallWord}
          displayKey={rShown}
          counter={recallCounter}
          hint={recallHint}
          p={p}
          spw={spw}
          btnEnabled={btnEnabled}
          onTap={handleRTap}
          onForgot={handleForgot}
        />
      )}

      {screen === "results" && (
        <Results
          words={words}
          results={results}
          wc={wc}
          spw={spw}
          onRestart={() => { clear(); setScreen("settings"); }}
        />
      )}
    </div>
  );
}