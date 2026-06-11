// screens.jsx — Welcome, FairyMap (level select), RewardScreen
const { useState: useSt, useEffect: useEf, useRef: useRf } = React;

// ── soft sky gradient backdrop used on every screen ──
function Sky({ children }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: 'linear-gradient(180deg, var(--bg1) 0%, var(--bg2) 100%)',
    }}>
      {/* soft clouds */}
      {[[ -20, 90, 150], [240, 150, 120], [60, 320, 110], [260, 470, 140]].map((c, i) => (
        <div key={i} style={{
          position: 'absolute', left: c[0], top: c[1], width: c[2], height: c[2] * 0.5,
          background: 'rgba(255,255,255,.45)', borderRadius: 999, filter: 'blur(2px)',
          animation: `floaty-slow ${6 + i}s ease-in-out ${i * 0.6}s infinite`,
        }} />
      ))}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MILESTONE POP-UP — brief celebration when the child hits a word streak
// (10, 20, …). Shows a character card + streak count, then the parent
// (App) removes it after a short timer. Non-blocking (pointer-events off).
// ─────────────────────────────────────────────────────────────
function MilestonePopup({ n, src, exiting }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200, pointerEvents: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: 0, background: 'rgba(45,22,55,.34)',
        animation: exiting ? 'fade-out .5s ease forwards' : 'pop-in .25s ease both',
      }} />
      {/* star burst */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: exiting ? 'fade-out .35s ease forwards' : 'none',
      }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute', fontSize: 28,
            animation: `star-pop .6s ease ${i * 0.04}s both`,
            transform: `rotate(${i * 30}deg) translateY(-150px)`,
          }}>{['⭐', '✨', '🌟'][i % 3]}</div>
        ))}
      </div>
      <div style={{
        position: 'relative', textAlign: 'center',
        animation: exiting
          ? 'milestone-out .55s cubic-bezier(.5,-0.3,.7,1) forwards'
          : 'pop-in .5s cubic-bezier(.34,1.56,.64,1) both',
      }}>
        <div style={{
          width: 214, height: 340, borderRadius: 30, margin: '0 auto',
          background: 'var(--surface)', overflow: 'hidden',
          boxShadow: '0 18px 50px rgba(120,60,110,.4), 0 0 0 5px rgba(255,255,255,.85)',
          animation: exiting ? 'none' : 'bob 1.6s ease-in-out infinite',
        }}>
          <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
        <div className="display" style={{
          marginTop: 18, display: 'inline-block', padding: '10px 22px', borderRadius: 999,
          background: 'var(--primary)', color: '#fff', fontSize: 24, fontWeight: 700,
          boxShadow: '0 6px 0 var(--primary-dark)',
        }}>🔥 {n} pēc kārtas!</div>
      </div>
    </div>
  );
}

// ── round music on/off button (🎵 / 🔇) ──
function MusicButton({ on, onToggle, style = {} }) {
  return (
    <button onClick={onToggle} className="kid-btn ghost"
      aria-label={on ? 'Izslēgt mūziku' : 'Ieslēgt mūziku'} title="Mūzika"
      style={{ width: 46, height: 46, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, ...style }}>
      {on ? '🎵' : '🔇'}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// WELCOME
// ─────────────────────────────────────────────────────────────
function Welcome({ onStart, musicOn, onToggleMusic }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sky />
      <SparkleField count={10} />
      {onToggleMusic && (
        <div style={{ position: 'absolute', top: 56, right: 18, zIndex: 20 }}>
          <MusicButton on={musicOn} onToggle={onToggleMusic} />
        </div>
      )}
      <div style={{
        position: 'relative', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '0 30px', textAlign: 'center',
      }}>
        <div style={{ animation: 'pop-in .6s ease both' }}>
          <Fairy size={150} />
        </div>

        <div style={{ marginTop: 18, animation: 'slide-up .6s ease .15s both' }}>
          <div className="display" style={{ fontSize: 48, fontWeight: 700, color: 'var(--primary)', lineHeight: 1, letterSpacing: 0.5, whiteSpace: 'nowrap', filter: 'drop-shadow(0 3px 0 rgba(255,255,255,.6))' }}>Burtu Feja</div>
          <div className="display" style={{ marginTop: 8, fontSize: 19, fontWeight: 500, color: 'var(--ink)' }}>Mācāmies lasīt ar zilbēm ✨</div>
        </div>

        <div style={{ marginTop: 30, maxWidth: 290, animation: 'slide-up .6s ease .3s both' }}>
          <div style={{ position: 'relative' }}>
            <SpeechBubble style={{ textAlign: 'left' }}>
              Sveika! Es esmu <b style={{ color: 'var(--primary)' }}>Kikija</b>. Nāc, kopā saliksim vārdus no zilbēm!
            </SpeechBubble>
          </div>
        </div>

        <button onClick={onStart} className="kid-btn" style={{ marginTop: 38, padding: '18px 56px', fontSize: 26, fontWeight: 600, animation: 'slide-up .6s ease .45s both' }}>
          Sākt!
        </button>
        <div className="display" style={{ marginTop: 20, fontSize: 14, color: 'var(--ink)', opacity: .6, animation: 'slide-up .6s ease .55s both' }}>5–6 gadi · Latviešu valoda</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// GAMES HUB — pick a game. The journey (map) is one card; the rest are
// phonics/reading practice rounds drawn from the child's unlocked words.
// ─────────────────────────────────────────────────────────────
function GamesHub({ totalStars, onPick, onRandom, musicOn, onToggleMusic }) {
  const CARDS = [
    { key: 'map',         icon: '🗺️', hue: 'lilac', title: 'Ceļojums',      sub: 'Saliec vārdus no zilbēm' },
    { key: 'readfind',    icon: '🔎', hue: 'sky',   title: 'Atrodi attēlu',  sub: 'Izlasi vārdu, atrodi bildi' },
    { key: 'firstletter', icon: '🔤', hue: 'mint',  title: 'Pirmais burts',  sub: 'Ar kuru burtu sākas?' },
    { key: 'blend',       icon: '🔊', hue: 'peach', title: 'Skaņas',         sub: 'Klausies un saliec vārdu' },
    { key: 'random',      icon: '🎲', hue: 'gold',  title: 'Jaukti vārdi',   sub: 'Brīva atkārtošana' },
  ];
  const handle = (k) => (k === 'random' ? onRandom() : onPick(k));

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <Sky />
      <SparkleField count={7} />

      {/* top bar */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '60px 18px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Fairy size={52} float={false} />
          <div className="display" style={{ fontSize: 20, fontWeight: 600, color: 'var(--primary)' }}>Spēles</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onToggleMusic && <MusicButton on={musicOn} onToggle={onToggleMusic} />}
          <StarCount value={totalStars} />
        </div>
      </div>

      {/* card list */}
      <div style={{ position: 'relative', zIndex: 5, flex: 1, overflow: 'auto', padding: '10px 18px 30px' }}>
        {CARDS.map((c, i) => {
          const accent = HUES[c.hue];
          return (
            <button key={c.key} onClick={() => handle(c.key)} className="tile" style={{
              width: '100%', border: 'none', textAlign: 'left', marginBottom: 14,
              display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', borderRadius: 26,
              background: 'var(--surface)', boxShadow: `0 7px 0 ${accent[1]}, 0 11px 20px rgba(140,90,130,.14)`,
              animation: `slide-up .5s ease ${i * 0.06}s both`,
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20, flexShrink: 0, background: accent[0],
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34,
                boxShadow: `0 4px 0 ${accent[1]}`,
              }}>{c.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="display" style={{ fontSize: 22, fontWeight: 600, color: 'var(--ink)' }}>{c.title}</div>
                <div className="display" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', opacity: .6 }}>{c.sub}</div>
              </div>
              <span style={{ fontSize: 26, color: 'var(--primary)', flexShrink: 0 }}>▸</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FAIRY MAP (level select)
// ─────────────────────────────────────────────────────────────
function FairyMap({ currentId, levelStars, totalStars, onPlay, onStartOver, onRandom, onBack }) {
  const [askReset, setAskReset] = useSt(false);
  // Keep the map parked on the current level so returning after a win lands
  // where the player left off (no scrolling down from the top each time).
  const scrollerRef = useRf(null);
  useEf(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const idx = Math.max(0, currentId - 1);
    const nodeTop = 110 + idx * 132;      // matches node layout below
    el.scrollTop = Math.max(0, nodeTop - el.clientHeight / 2 + 46);
  }, [currentId]);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <Sky />
      <SparkleField count={6} />

      {/* sticky top bar */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '60px 18px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {onBack && (
            <button onClick={onBack} className="kid-btn ghost" aria-label="Atpakaļ uz spēlēm" title="Spēles"
              style={{ width: 46, height: 46, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>‹</button>
          )}
          <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 4px 12px rgba(140,90,130,.16)' }}>🐰</div>
          <div className="display" style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>Zaķausis</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onRandom} className="kid-btn ghost" aria-label="Jaukti vārdi" title="Jaukti vārdi"
            style={{ width: 44, height: 44, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>🎲</button>
          <button onClick={() => setAskReset(true)} className="kid-btn ghost" aria-label="Sākt no jauna" title="Sākt no jauna"
            style={{ width: 44, height: 44, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>🔄</button>
          <StarCount value={totalStars} />
        </div>
      </div>

      {/* scrollable trail */}
      <div ref={scrollerRef} style={{ position: 'relative', zIndex: 5, flex: 1, overflow: 'auto' }}>
        <div style={{ position: 'relative', height: LEVELS.length * 132 + 150, padding: '8px 0 40px' }}>
          {/* castle goal at top */}
          <div style={{ position: 'absolute', top: 6, left: 0, right: 0, textAlign: 'center' }}>
            <div style={{ fontSize: 56, filter: 'drop-shadow(0 6px 8px rgba(140,90,130,.2))', animation: 'floaty-slow 5s ease-in-out infinite' }}>🏰</div>
            <div className="display" style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', opacity: .7 }}>Feju pils</div>
          </div>

          {/* dashed center trail */}
          <div style={{ position: 'absolute', top: 96, bottom: 30, left: '50%', width: 0, borderLeft: '5px dashed rgba(255,255,255,.6)', transform: 'translateX(-50%)' }} />

          {LEVELS.map((lv, idx) => {
            const top = 110 + idx * 132;
            const offset = lv.side === 'l' ? -64 : 64;
            const state = lv.id < currentId ? 'done' : lv.id === currentId ? 'current' : 'locked';
            const accent = HUES[lv.hue];
            const stars = levelStars[lv.id] || 0;
            const data = WORDS[lv.word];
            return (
              <div key={lv.id} style={{ position: 'absolute', top, left: `calc(50% + ${offset}px)`, transform: 'translateX(-50%)', textAlign: 'center' }}>
                {state === 'current' && (
                  <>
                    <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', border: `4px solid ${accent[0]}`, animation: 'pulse-ring 1.6s ease-out infinite' }} />
                    <div style={{ position: 'absolute', bottom: 102, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', animation: 'floaty 2.2s ease-in-out infinite' }}>
                      <div className="kid-btn" style={{ padding: '8px 18px', fontSize: 15, fontWeight: 600, boxShadow: '0 4px 0 var(--primary-dark)' }}>Sākt ▸</div>
                    </div>
                  </>
                )}
                <button
                  onClick={() => state !== 'locked' && onPlay(lv)}
                  className="tile"
                  style={{
                    width: 92, height: 92, borderRadius: '50%', border: 'none', position: 'relative',
                    background: state === 'locked' ? 'rgba(255,255,255,.55)' : accent[0],
                    boxShadow: state === 'locked'
                      ? 'inset 0 2px 8px rgba(140,90,130,.12)'
                      : `0 8px 0 ${accent[1]}, 0 12px 20px rgba(140,90,130,.2)`,
                    cursor: state === 'locked' ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 44, opacity: state === 'locked' ? 1 : 1,
                  }}>
                  {state === 'locked'
                    ? <span style={{ fontSize: 30, opacity: .5 }}>🔒</span>
                    : <span style={{ filter: 'drop-shadow(0 2px 3px rgba(140,90,130,.25))' }}>{data.pic}</span>}
                  {state === 'done' && (
                    <div style={{ position: 'absolute', top: -6, right: -6, width: 30, height: 30, borderRadius: '50%', background: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: `0 3px 0 ${GOLD_DARK}` }}>✓</div>
                  )}
                </button>
                {/* mini stars under completed */}
                {state === 'done' && (
                  <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 6 }}>
                    {[0, 1, 2].map(s => <span key={s} style={{ fontSize: 14, filter: s < stars ? 'none' : 'grayscale(1)', opacity: s < stars ? 1 : .35 }}>⭐</span>)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* start-over confirm */}
      {askReset && (
        <div onClick={() => setAskReset(false)} style={{
          position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(80,40,70,.28)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--surface)', borderRadius: 28, padding: '26px 24px', width: 280, textAlign: 'center',
            boxShadow: '0 20px 50px rgba(140,90,130,.3)', animation: 'pop-in .3s ease both',
          }}>
            <div style={{ fontSize: 46 }}>🔄</div>
            <div className="display" style={{ fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginTop: 6 }}>Sākt no jauna?</div>
            <div className="display" style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)', opacity: .65, marginTop: 6 }}>Viss progress tiks dzēsts.</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={() => setAskReset(false)} className="kid-btn ghost" style={{ flex: 1, padding: '12px', fontSize: 18, fontWeight: 600 }}>Nē</button>
              <button onClick={() => { setAskReset(false); onStartOver(); }} className="kid-btn" style={{ flex: 1, padding: '12px', fontSize: 18, fontWeight: 600 }}>Jā</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// RANDOM WORDS (free review of unlocked words)
// ─────────────────────────────────────────────────────────────
function RandomWords({ words, onExit }) {
  const list = words && words.length ? words : Object.keys(WORDS).slice(0, 1);
  const randomWord = (avoid) => {
    if (list.length <= 1) return list[0];
    let w = list[Math.floor(Math.random() * list.length)], g = 0;
    while (w === avoid && g++ < 12) w = list[Math.floor(Math.random() * list.length)];
    return w;
  };
  const [word, setWord] = useSt(() => randomWord(null));

  // speak the word whenever a new one is shown
  useEf(() => { playWord(word); }, [word]);

  const next = () => setWord(randomWord(word));

  const data = WORDS[word] || {};
  const hueKeys = Object.keys(HUES);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <Sky />
      <SparkleField count={6} />

      {/* top bar with exit */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '60px 18px 0' }}>
        <button onClick={onExit} className="kid-btn ghost" style={{ padding: '10px 20px', fontSize: 17, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>‹ Iziet</button>
        <div className="display" style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>Jaukti vārdi 🎲</div>
        <div style={{ width: 92 }} />
      </div>

      {/* center: picture + word + syllables */}
      <div style={{ position: 'relative', zIndex: 5, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px' }}>
        <div onClick={() => playWord(word)} style={{
          width: 184, height: 184, borderRadius: 46, background: 'var(--surface)',
          boxShadow: '0 14px 30px rgba(140,90,130,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', cursor: 'pointer', animation: 'floaty-slow 4s ease-in-out infinite',
        }}>
          <div style={{ fontSize: 104, lineHeight: 1, position: 'relative', filter: 'drop-shadow(0 4px 6px rgba(140,90,130,.25))' }}>{data.pic}</div>
          <div style={{ position: 'absolute', bottom: 12, right: 12, width: 38, height: 38, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, boxShadow: '0 3px 8px rgba(140,90,130,.3)' }}>🔊</div>
        </div>

        <div className="display" style={{ marginTop: 26, fontSize: 40, fontWeight: 600, color: 'var(--primary)', letterSpacing: 1 }}>{word}</div>

        <div style={{ display: 'flex', gap: 9, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {(data.syll || []).map((s, i) => {
            const c = HUES[hueKeys[i % hueKeys.length]];
            return (
              <div key={i} className="display" style={{
                background: c[0], color: '#fff', padding: '10px 18px', borderRadius: 18,
                fontSize: 28, fontWeight: 600, boxShadow: `0 5px 0 ${c[1]}`,
              }}>{s}</div>
            );
          })}
        </div>
      </div>

      {/* next button */}
      <div style={{ position: 'relative', zIndex: 5, padding: '0 22px 40px' }}>
        <button onClick={next} className="kid-btn" style={{ width: '100%', padding: '18px', fontSize: 24, fontWeight: 600 }}>Nākamais ▸</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// REWARD / CELEBRATION
// ─────────────────────────────────────────────────────────────
function RewardScreen({ starsEarned, totalStars, newTreasure, onContinue }) {
  const confetti = useRf(null);
  if (!confetti.current) {
    const cols = ['#ffd1ec', '#ffe5aa', '#c9e8ff', '#d8c9ff', '#c9f3df', '#ffc9c9'];
    confetti.current = Array.from({ length: 38 }, (_, i) => ({
      left: `${(i * 53 + 7) % 100}%`,
      size: 8 + (i % 4) * 4,
      delay: (i % 10) * 0.18,
      dur: 2.4 + (i % 5) * 0.4,
      color: cols[i % cols.length],
      round: i % 3 === 0,
    }));
  }

  // reward meter math — always target the next not-yet-earned treasure
  const next = TREASURES.find(t => t.at > totalStars) || TREASURES[TREASURES.length - 1];
  const nIdx = TREASURES.indexOf(next);
  const prevAt = nIdx > 0 ? TREASURES[nIdx - 1].at : 0;
  const pct = Math.min(100, Math.max(4, Math.round(((totalStars - prevAt) / (next.at - prevAt)) * 100)));
  const praise = starsEarned >= 3 ? 'Lieliski!' : starsEarned === 2 ? 'Malacis!' : 'Tu to spēji!';

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <Sky />
      {/* confetti */}
      {confetti.current.map((c, i) => (
        <div key={i} style={{
          position: 'absolute', top: -20, left: c.left, width: c.size, height: c.size,
          background: c.color, borderRadius: c.round ? '50%' : 3,
          animation: `confetti-fall ${c.dur}s linear ${c.delay}s infinite`,
        }} />
      ))}

      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 30px', textAlign: 'center' }}>
        <div style={{ animation: 'pop-in .5s ease both' }}>
          <Fairy size={120} mood="cheer" />
        </div>
        <div className="display" style={{ marginTop: 8, fontSize: 46, fontWeight: 700, color: 'var(--primary)', filter: 'drop-shadow(0 3px 0 rgba(255,255,255,.6))', animation: 'pop-in .5s ease .1s both' }}>{praise}</div>

        {/* earned stars */}
        <div style={{ display: 'flex', gap: 14, marginTop: 16 }}>
          {[0, 1, 2].map(s => (
            <div key={s} style={{
              fontSize: 50, filter: s < starsEarned ? 'drop-shadow(0 4px 6px rgba(200,150,40,.4))' : 'grayscale(1)',
              opacity: s < starsEarned ? 1 : .3,
              animation: s < starsEarned ? `star-pop .5s ease ${0.3 + s * 0.18}s both` : 'none',
            }}>⭐</div>
          ))}
        </div>

        {/* reward meter */}
        <div style={{ width: '100%', maxWidth: 300, marginTop: 30, animation: 'slide-up .5s ease .6s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span className="display" style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap' }}>Līdz balvai</span>
            <span className="display" style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{totalStars} / {next.at} ⭐</span>
          </div>
          <div style={{ position: 'relative', height: 24, borderRadius: 999, background: 'rgba(255,255,255,.55)', boxShadow: 'inset 0 2px 6px rgba(140,90,130,.15)', overflow: 'visible' }}>
            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: `linear-gradient(90deg, ${GOLD}, var(--primary))`, transition: 'width .8s ease', boxShadow: `0 2px 6px rgba(200,150,40,.4)` }} />
            <div style={{ position: 'absolute', right: -14, top: -10, width: 44, height: 44, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 4px 10px rgba(140,90,130,.2)' }}>{next.icon}</div>
          </div>
        </div>

        {/* new treasure reveal */}
        {newTreasure && (
          <div style={{ marginTop: 26, background: 'var(--surface)', borderRadius: 26, padding: '16px 26px', boxShadow: '0 12px 26px rgba(140,90,130,.18)', animation: 'pop-in .6s ease .9s both' }}>
            <div className="display" style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', opacity: .7 }}>Jauna balva!</div>
            <div style={{ fontSize: 54, margin: '4px 0', animation: 'bob 1.2s ease-in-out infinite' }}>{newTreasure.icon}</div>
            <div className="display" style={{ fontSize: 20, fontWeight: 600, color: 'var(--primary)' }}>{newTreasure.name}</div>
          </div>
        )}

        <button onClick={onContinue} className="kid-btn" style={{ marginTop: 34, padding: '16px 50px', fontSize: 24, fontWeight: 600, animation: 'slide-up .5s ease 1s both' }}>Turpināt</button>
      </div>
    </div>
  );
}

Object.assign(window, { Sky, MusicButton, MilestonePopup, Welcome, GamesHub, FairyMap, RewardScreen, RandomWords });
