'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import styles from './StackSection.module.css';

const ALL_LANGUAGES = [
  // Row 1 — slides from left
  { name: 'Python',     icon: 'https://cdn.simpleicons.org/python/3776AB' },
  { name: 'Node.js',    icon: 'https://cdn.simpleicons.org/nodedotjs/339933' },
  { name: 'TypeScript', icon: 'https://cdn.simpleicons.org/typescript/3178C6' },
  { name: 'Go',         icon: 'https://cdn.simpleicons.org/go/00ADD8' },
  { name: 'Rust',       icon: 'https://cdn.simpleicons.org/rust/CE422B' },
  { name: 'Ruby',       icon: 'https://cdn.simpleicons.org/ruby/CC342D' },
  { name: 'C++',        icon: 'https://cdn.simpleicons.org/cplusplus/00599C' },
  { name: 'Zig',        icon: 'https://cdn.simpleicons.org/zig/F7A41D' },

  // Row 2 — slides from right
  { name: 'PHP',        icon: 'https://cdn.simpleicons.org/php/777BB4' },
  { name: 'Java',       icon: 'https://cdn.simpleicons.org/openjdk/ED8B00' },
  { name: 'C#',         icon: 'https://cdn.simpleicons.org/csharp/239120' },
  { name: 'Swift',      icon: 'https://cdn.simpleicons.org/swift/F05138' },
  { name: 'Kotlin',     icon: 'https://cdn.simpleicons.org/kotlin/7F52FF' },
  { name: 'Dart',       icon: 'https://cdn.simpleicons.org/dart/0175C2' },
  { name: 'Scala',      icon: 'https://cdn.simpleicons.org/scala/DC322F' },
  { name: 'Elixir',     icon: 'https://cdn.simpleicons.org/elixir/6E4FA5' },

  // Row 3 — slides from left
  { name: 'R',          icon: 'https://cdn.simpleicons.org/r/276DC3' },
  { name: 'Lua',        icon: 'https://cdn.simpleicons.org/lua/2C2D72' },
  { name: 'Haskell',    icon: 'https://cdn.simpleicons.org/haskell/5D4F85' },
  { name: 'Shell',      icon: 'https://cdn.simpleicons.org/gnubash/4EAA25' },
  { name: 'Perl',       icon: 'https://cdn.simpleicons.org/perl/39457E' },
  { name: 'Julia',      icon: 'https://cdn.simpleicons.org/julia/9558B2' },
  { name: 'Clojure',    icon: 'https://cdn.simpleicons.org/clojure/5881D8' },
  { name: 'Erlang',     icon: 'https://cdn.simpleicons.org/erlang/A90533' },
];

const ROWS: [number, number][] = [
  [0,  8],   // row 1
  [8,  16],  // row 2
  [16, 24],  // row 3
];

const MORE_ITEMS = [
  'LangChain', 'LlamaIndex', 'Vercel AI SDK', 'Deno', 'Bun',
  'Next.js', 'FastAPI', 'Django', 'Flask', 'Spring Boot',
  'Express', 'NestJS', 'Axum', 'Actix', 'Gin', 'Echo',
  'Rails', 'Laravel', 'Symfony', 'Phoenix',
  'LangGraph', 'AutoGen', 'CrewAI', 'Haystack',
];

// Base frequencies for a pentatonic-ish scale — one per chip (8 chips × 3 rows = 24)
const CHIP_FREQS = [
  220, 246, 277, 311, 330, 370, 415, 440, // row 1
  494, 523, 554, 587, 622, 659, 698, 740, // row 2
  784, 831, 880, 932, 988,1047,1109,1175, // row 3
];

export default function StackSection() {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visible, setVisible] = useState([false, false, false]);
  const [showMore, setShowMore] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  /** Play a short, soft synth tick at a given frequency */
  const playTick = useCallback((freq: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.85, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.10, ctx.currentTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } catch (_) {
      // silently ignore if audio is blocked
    }
  }, []);

  /** Schedule tick sounds for all chips in a row, matching the CSS stagger */
  const scheduleRowSounds = useCallback((rowIdx: number, rowDelay: number) => {
    const [start, end] = ROWS[rowIdx];
    const chipCount = end - start;
    for (let i = 0; i < chipCount; i++) {
      const chipGlobalIdx = start + i;
      const delay = rowDelay + i * 80; // matches CSS --chip-delay: i * 80ms
      const t = setTimeout(() => {
        playTick(CHIP_FREQS[chipGlobalIdx] ?? 440);
      }, delay);
      soundTimeoutsRef.current.push(t);
    }
  }, [playTick]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const timeouts = new Map<number, ReturnType<typeof setTimeout>>();

    ROWS.forEach((_, idx) => {
      const el = rowRefs.current[idx];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            const rowDelay = idx * 150;
            const t = setTimeout(() => {
              setVisible(v => { const next = [...v]; next[idx] = true; return next; });
              scheduleRowSounds(idx, 0);
            }, rowDelay);
            timeouts.set(idx, t);
          } else {
            if (timeouts.has(idx)) {
              clearTimeout(timeouts.get(idx)!);
              timeouts.delete(idx);
            }
            // cancel any pending sounds for this row
            soundTimeoutsRef.current.forEach(t => clearTimeout(t));
            soundTimeoutsRef.current = [];
            setVisible(v => { const next = [...v]; next[idx] = false; return next; });
          }
        },
        { threshold: 0.1 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => {
      observers.forEach(o => o.disconnect());
      timeouts.forEach(t => clearTimeout(t));
      soundTimeoutsRef.current.forEach(t => clearTimeout(t));
    };
  }, [scheduleRowSounds]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.rowsWrap}>
        {ROWS.map(([start, end], rowIdx) => {
          const isVisible = visible[rowIdx];

          return (
            <div
              key={rowIdx}
              ref={el => { rowRefs.current[rowIdx] = el; }}
              className={styles.row}
            >
              {ALL_LANGUAGES.slice(start, end).map((lang, i) => (
                <div
                  key={lang.name}
                  className={[
                    styles.chip,
                    isVisible ? styles.chipVisible : '',
                  ].join(' ')}
                  style={{
                    '--chip-index': i,
                    '--chip-delay': isVisible ? i * 80 : 0,
                  } as React.CSSProperties}
                >
                  <img
                    src={lang.icon}
                    width={26}
                    height={26}
                    alt={lang.name}
                    className={styles.chipIcon}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <span className={styles.chipName}>{lang.name}</span>
                  <span className={styles.shimmer} aria-hidden="true" />
                </div>
              ))}

              {/* "+ more" on last row only */}
              {rowIdx === ROWS.length - 1 && (
                <>
                  <button
                    className={styles.moreBtn}
                    onClick={() => setShowMore(true)}
                    aria-label="Show more integrations"
                  >
                    <span className={styles.morePlus}>+</span>
                    <span>more</span>
                  </button>
                  <div className={styles.integrationText}>
                    Integrations with your any stack
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showMore && (
        <div className={styles.modalOverlay} onClick={() => setShowMore(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowMore(false)}>✕</button>
            <h3 className={styles.modalTitle}>All Integrations</h3>
            <p className={styles.modalSub}>If it speaks OpenAI, it speaks CheapAgents.</p>
            <div className={styles.modalGrid}>
              {MORE_ITEMS.map(item => (
                <div key={item} className={styles.modalChip}>{item}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
