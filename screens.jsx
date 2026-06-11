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
// REST TIMER — "Kikija nogurst". The fairy (not the child) gets tired:
// a gentle yawn warning first, later a calm goodnight scene, then a
// sleeping-fairy cooldown screen until she is rested again.
// ─────────────────────────────────────────────────────────────

// non-blocking corner toast shown a few minutes before the session ends
function TiredToast() {
  return (
    <div style={{
      position: 'absolute', left: 14, right: 14, bottom: 28, zIndex: 180, pointerEvents: 'none',
      display: 'flex', alignItems: 'flex-end', gap: 4, animation: 'slide-up .5s ease both',
    }}>
      <Fairy size={62} />
      <SpeechBubble style={{ fontSize: 15, maxWidth: 250 }}>
        Kikija sāk nogurst… 🥱 Vēl mazliet — un viņa ies gulēt!
      </SpeechBubble>
    </div>
  );
}

// dark starry backdrop for the goodnight / sleep screens (theme-independent)
function NightSky({ children }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: 'linear-gradient(180deg, #2b2452 0%, #46376b 55%, #6b5290 100%)',
    }}>
      {[[30, 90, 4], [120, 50, 3], [210, 110, 5], [300, 70, 3], [70, 200, 3], [330, 180, 4], [160, 160, 3], [250, 230, 4], [40, 300, 3], [350, 330, 3]].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', left: s[0], top: s[1], width: s[2], height: s[2], borderRadius: '50%',
          background: '#fff', opacity: .8, animation: `sparkle ${2 + (i % 3)}s ease-in-out ${i * 0.3}s infinite`,
        }} />
      ))}
      {children}
    </div>
  );
}

// floating 💤 cluster above a sleeping fairy
function Zzz() {
  return (
    <>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: 'absolute', top: -6, right: -12 - i * 4, fontSize: 20 + i * 5,
          animation: `zzz-float 2.8s ease-out ${i * 0.9}s infinite`,
        }}>💤</div>
      ))}
    </>
  );
}

// calm session ending: positive recap + the child "tucks the fairy in"
function GoodnightScreen({ sessionWords, sessionStars, onGoodnight }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightSky />
      <div style={{ position: 'absolute', top: 64, right: 34, fontSize: 64, filter: 'drop-shadow(0 0 18px rgba(255,240,180,.55))', animation: 'floaty-slow 6s ease-in-out infinite' }}>🌙</div>
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 30px', textAlign: 'center' }}>
        <div style={{ position: 'relative', animation: 'pop-in .6s ease both' }}>
          <Fairy size={130} />
          <Zzz />
        </div>
        <div className="display" style={{ marginTop: 14, fontSize: 33, fontWeight: 700, color: '#fff', animation: 'slide-up .6s ease .15s both' }}>Kikija ir nogurusi 🥱</div>
        <div className="display" style={{ marginTop: 8, fontSize: 17, fontWeight: 500, color: '#fff', opacity: .85, animation: 'slide-up .6s ease .25s both' }}>Tu šodien biji malacis!</div>

        <div style={{ marginTop: 18, background: 'rgba(255,255,255,.14)', borderRadius: 24, padding: '14px 26px', animation: 'slide-up .6s ease .35s both' }}>
          <div className="display" style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>Šodien: {sessionWords} vārdi · ⭐ {sessionStars}</div>
        </div>

        <div style={{ marginTop: 22, animation: 'star-pop .7s ease .6s both' }}>
          <div style={{ fontSize: 62, filter: 'drop-shadow(0 0 16px rgba(255,220,120,.8))' }}>🌟</div>
          <div className="display" style={{ fontSize: 15, fontWeight: 600, color: '#ffe9b0', marginTop: 4 }}>Tava labunakts zvaigznīte!</div>
        </div>

        <button onClick={onGoodnight} className="kid-btn" style={{ marginTop: 30, padding: '16px 44px', fontSize: 23, fontWeight: 600, animation: 'slide-up .6s ease .8s both' }}>Ar labu nakti! 🌙</button>
      </div>
    </div>
  );
}

// cooldown: the fairy sleeps while a moon travels an arc toward the sun.
// Cards stay browsable (calm activity). Parents wake her early by holding
// the moon for 3 seconds.
function SleepScreen({ sleepUntil, cooldownMs, onWake, onShowCards }) {
  const [now, setNow] = useSt(() => Date.now());
  useEf(() => {
    const id = setInterval(() => setNow(Date.now()), 20000);
    return () => clearInterval(id);
  }, []);
  const remaining = Math.max(0, (sleepUntil || 0) - now);
  const awake = remaining <= 0;
  const p = cooldownMs > 0 ? Math.min(1, Math.max(0, 1 - remaining / cooldownMs)) : 1;

  // parent escape hatch: press-and-hold the moon
  const holdT = useRf(null);
  const [holding, setHolding] = useSt(false);
  const startHold = () => {
    setHolding(true);
    holdT.current = setTimeout(() => { setHolding(false); onWake(); }, 3000);
  };
  const endHold = () => {
    setHolding(false);
    if (holdT.current) { clearTimeout(holdT.current); holdT.current = null; }
  };
  useEf(() => endHold, []);

  // moon position along the arc: left horizon → top → the sun on the right
  const W = 320, H = 150, R = 128, CX = W / 2, CY = H - 6;
  const a = Math.PI * (1 - p);
  const mx = CX + R * Math.cos(a), my = CY - R * Math.sin(a);

  if (awake) return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sky />
      <SparkleField count={8} />
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 30px', textAlign: 'center' }}>
        <div style={{ fontSize: 84, animation: 'pop-in .6s ease both', filter: 'drop-shadow(0 0 22px rgba(255,210,90,.7))' }}>☀️</div>
        <div style={{ marginTop: 10, animation: 'pop-in .6s ease .1s both' }}><Fairy size={120} mood="cheer" /></div>
        <div className="display" style={{ marginTop: 12, fontSize: 32, fontWeight: 700, color: 'var(--primary)', animation: 'slide-up .6s ease .2s both' }}>Kikija ir atpūtusies! ☀️</div>
        <button onClick={onWake} className="kid-btn" style={{ marginTop: 30, padding: '18px 56px', fontSize: 25, fontWeight: 600, animation: 'slide-up .6s ease .4s both' }}>Spēlēt!</button>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightSky />
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 26px', textAlign: 'center' }}>
        <div style={{ position: 'relative', animation: 'pop-in .6s ease both' }}>
          <Fairy size={120} float={false} />
          <Zzz />
        </div>
        <div className="display" style={{ marginTop: 10, fontSize: 30, fontWeight: 700, color: '#fff' }}>Kikija guļ… 💤</div>
        <div className="display" style={{ marginTop: 6, fontSize: 16, fontWeight: 500, color: '#fff', opacity: .8 }}>Kad mēness aizies līdz saulei, viņa pamodīsies!</div>

        {/* moon→sun arc (kid-friendly remaining-time visual, no countdown) */}
        <div style={{ position: 'relative', width: W, height: H, marginTop: 26 }}>
          <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
            <path d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`} fill="none"
              stroke="rgba(255,255,255,.35)" strokeWidth="4" strokeDasharray="2 10" strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', left: CX + R - 16, top: CY - 16, fontSize: 30, opacity: .95 }}>☀️</div>
          <div
            onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
            style={{
              position: 'absolute', left: mx - 22, top: my - 22, width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34,
              cursor: 'pointer', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none',
              filter: 'drop-shadow(0 0 12px rgba(255,240,180,.7))',
              transform: holding ? 'scale(1.3)' : 'scale(1)', transition: 'transform 2.9s ease',
            }}>🌙</div>
        </div>

        <button onClick={onShowCards} className="kid-btn ghost" style={{ marginTop: 30, padding: '14px 34px', fontSize: 20, fontWeight: 600 }}>🎴 Manas kartiņas</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CARD PEEK — overlay with the collected cards, openable from inside any
// game (🎴 in the top bar). The game underneath keeps running untouched.
// ─────────────────────────────────────────────────────────────
function CardPeek({ chapters, currentId, onClose }) {
  const unlocked = chapters.filter(c => c.endId < currentId).length;
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(80,40,70,.32)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 364, background: 'var(--surface)', borderRadius: 30, padding: '16px 0 18px',
        boxShadow: '0 20px 50px rgba(140,90,130,.35)', animation: 'pop-in .3s ease both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 6px' }}>
          <div className="display" style={{ fontSize: 20, fontWeight: 600, color: 'var(--primary)' }}>🎴 Manas kartiņas</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', opacity: .7 }}>{unlocked} / {chapters.length}</div>
            <button onClick={onClose} className="kid-btn ghost" aria-label="Aizvērt"
              style={{ width: 40, height: 40, fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
          </div>
        </div>

        {unlocked === 0 ? (
          <div style={{ padding: '18px 24px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 44 }}>📖</div>
            <div className="display" style={{ marginTop: 8, fontSize: 17, fontWeight: 600, color: 'var(--ink)', opacity: .75 }}>Vēl nav kartiņu — pabeidz nodaļu Ceļojumā!</div>
          </div>
        ) : (
          <div style={{
            display: 'flex', gap: 14, overflowX: 'auto', padding: '10px 20px 8px',
            scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
          }}>
            {chapters.map(ch => {
              const isUnlocked = ch.endId < currentId;
              return (
                <div key={ch.id} style={{
                  width: 180, height: 240, flexShrink: 0, borderRadius: 20, overflow: 'hidden', position: 'relative',
                  scrollSnapAlign: 'center',
                  background: isUnlocked ? 'var(--surface2)' : 'rgba(140,90,130,.10)',
                  boxShadow: isUnlocked
                    ? '0 8px 20px rgba(120,60,110,.25), 0 0 0 3px rgba(255,255,255,.85)'
                    : 'inset 0 2px 10px rgba(140,90,130,.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isUnlocked
                    ? <img src={ch.card} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
                    : <span style={{ fontSize: 48, fontWeight: 700, color: 'rgba(140,90,130,.45)' }}>?</span>}
                  <div style={{
                    position: 'absolute', bottom: 6, left: 6, minWidth: 24, height: 24, padding: '0 7px',
                    borderRadius: 999, background: isUnlocked ? 'var(--primary)' : 'rgba(140,90,130,.35)',
                    color: '#fff', fontSize: 13, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{ch.id}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
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
// CHAPTER SELECT — the journey, split into short books of ~10 words.
// Each chapter the child can actually finish; completing one unlocks the
// next plus a collectible card. State is derived from the global currentId.
// ─────────────────────────────────────────────────────────────
function ChapterSelect({ chapters, currentId, levelStars, totalStars, onPick, onBack, musicOn, onToggleMusic }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <Sky />
      <SparkleField count={6} />

      {/* top bar */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '60px 18px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} className="kid-btn ghost" aria-label="Atpakaļ uz spēlēm" title="Spēles"
            style={{ width: 46, height: 46, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>‹</button>
          <div className="display" style={{ fontSize: 20, fontWeight: 600, color: 'var(--primary)' }}>Ceļojums</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onToggleMusic && <MusicButton on={musicOn} onToggle={onToggleMusic} />}
          <StarCount value={totalStars} />
        </div>
      </div>

      {/* chapter list */}
      <div style={{ position: 'relative', zIndex: 5, flex: 1, overflow: 'auto', padding: '10px 18px 30px' }}>
        {chapters.map((ch, i) => {
          const state = ch.startId > currentId ? 'locked' : ch.endId < currentId ? 'done' : 'current';
          const accent = HUES[ch.levels[0].hue];
          const done = Math.min(ch.levels.length, Math.max(0, currentId - ch.startId));
          const sub = state === 'locked' ? 'Vēl aizvērts'
            : state === 'done' ? 'Pabeigts ✓'
            : `${done} / ${ch.levels.length} vārdi`;
          return (
            <button key={ch.id} onClick={() => state !== 'locked' && onPick(ch)} className="tile" style={{
              width: '100%', border: 'none', textAlign: 'left', marginBottom: 14,
              display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', borderRadius: 26,
              background: 'var(--surface)', boxShadow: `0 7px 0 ${accent[1]}, 0 11px 20px rgba(140,90,130,.14)`,
              opacity: state === 'locked' ? .6 : 1, cursor: state === 'locked' ? 'default' : 'pointer',
              animation: `slide-up .5s ease ${i * 0.04}s both`,
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20, flexShrink: 0, overflow: 'hidden',
                background: state === 'locked' ? 'rgba(140,90,130,.12)' : accent[0],
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
                boxShadow: state === 'locked' ? 'none' : `0 4px 0 ${accent[1]}`,
              }}>
                {state === 'done'
                  ? <img src={ch.card} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  : state === 'locked' ? <span style={{ opacity: .5 }}>🔒</span>
                  : <span>📖</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="display" style={{ fontSize: 22, fontWeight: 600, color: 'var(--ink)' }}>{ch.id}. nodaļa</div>
                <div className="display" style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', opacity: .6 }}>{sub}</div>
              </div>
              <span style={{ fontSize: 26, color: 'var(--primary)', flexShrink: 0 }}>
                {state === 'locked' ? '🔒' : state === 'done' ? '✓' : '▸'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CARD GALLERY — "Manas kartiņas". One collectible card per chapter:
// unlocked cards show the picture, the rest are grey "?" placeholders so
// the child can see how many of the total remain. Derived from currentId.
// ─────────────────────────────────────────────────────────────
function CardGallery({ chapters, currentId, onBack, musicOn, onToggleMusic }) {
  const unlocked = chapters.filter(c => c.endId < currentId).length;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <Sky />
      <SparkleField count={6} />

      {/* top bar */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '60px 18px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} className="kid-btn ghost" aria-label="Atpakaļ uz spēlēm" title="Spēles"
            style={{ width: 46, height: 46, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>‹</button>
          <div className="display" style={{ fontSize: 20, fontWeight: 600, color: 'var(--primary)' }}>Manas kartiņas</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onToggleMusic && <MusicButton on={musicOn} onToggle={onToggleMusic} />}
          <div className="display" style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 999,
            background: 'var(--surface)', fontSize: 16, fontWeight: 700, color: 'var(--primary)',
            boxShadow: '0 4px 12px rgba(140,90,130,.16)',
          }}>🎴 {unlocked} / {chapters.length}</div>
        </div>
      </div>

      {/* card grid */}
      <div style={{ position: 'relative', zIndex: 5, flex: 1, overflow: 'auto', padding: '12px 18px 30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {chapters.map((ch, i) => {
            const isUnlocked = ch.endId < currentId;
            return (
              <div key={ch.id} style={{
                aspectRatio: '3 / 4', borderRadius: 18, overflow: 'hidden', position: 'relative',
                background: isUnlocked ? 'var(--surface)' : 'rgba(140,90,130,.10)',
                boxShadow: isUnlocked
                  ? '0 6px 16px rgba(120,60,110,.22), 0 0 0 3px rgba(255,255,255,.85)'
                  : 'inset 0 2px 10px rgba(140,90,130,.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: `slide-up .45s ease ${i * 0.03}s both`,
              }}>
                {isUnlocked
                  ? <img src={ch.card} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  : <span style={{ fontSize: 40, fontWeight: 700, color: 'rgba(140,90,130,.45)' }}>?</span>}
                <div style={{
                  position: 'absolute', bottom: 4, left: 4, minWidth: 22, height: 22, padding: '0 6px',
                  borderRadius: 999, background: isUnlocked ? 'var(--primary)' : 'rgba(140,90,130,.35)',
                  color: '#fff', fontSize: 12, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{ch.id}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FAIRY MAP (level select)
// ─────────────────────────────────────────────────────────────
function FairyMap({ chapter, currentId, levelStars, totalStars, onPlay, onStartOver, onRandom, onBack, onShowCards, musicOn, onToggleMusic }) {
  const [askReset, setAskReset] = useSt(false);
  const levels = chapter.levels;
  const curIdx = Math.min(levels.length - 1, Math.max(0, currentId - chapter.startId));
  const chapterAllDone = currentId > chapter.endId;
  // travelled-trail end: the current node's center (whole trail when done)
  const doneEndY = 110 + curIdx * 132 + 46;
  // On open, glide from the castle down to the current level so the motion
  // itself shows where to continue; afterwards keep the map parked there.
  const scrollerRef = useRf(null);
  const didIntro = useRf(false);
  const [arriveBurst, setArriveBurst] = useSt(false);
  const burstT = useRf(null);
  useEf(() => () => { if (burstT.current) clearTimeout(burstT.current); }, []);
  useEf(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const nodeTop = 110 + curIdx * 132;   // matches node layout below
    const target = Math.max(0, nodeTop - el.clientHeight / 2 + 46);
    const burst = () => {
      setArriveBurst(true);
      if (burstT.current) clearTimeout(burstT.current);
      burstT.current = setTimeout(() => setArriveBurst(false), 1500);
    };
    if (didIntro.current) { el.scrollTo({ top: target, behavior: 'smooth' }); return; }
    didIntro.current = true;
    if (target < 60) { el.scrollTop = target; burst(); return; }
    el.scrollTop = 0;
    const t0 = performance.now(), dur = 850;
    let raf;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.scrollTop = target * (1 - Math.pow(1 - p, 3)); // ease-out
      if (p < 1) raf = requestAnimationFrame(step); else burst();
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [currentId, chapter.id]);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <Sky />
      <SparkleField count={6} />

      {/* sticky top bar */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '60px 18px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {onBack && (
            <button onClick={onBack} className="kid-btn ghost" aria-label="Atpakaļ uz nodaļām" title="Nodaļas"
              style={{ width: 46, height: 46, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>‹</button>
          )}
          {onShowCards && (
            <button onClick={onShowCards} className="kid-btn ghost" aria-label="Manas kartiņas" title="Manas kartiņas"
              style={{ width: 46, height: 46, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>🎴</button>
          )}
          <div className="display" style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)' }}>{chapter.id}. nodaļa</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onRandom} className="kid-btn ghost" aria-label="Jaukti vārdi" title="Jaukti vārdi"
            style={{ width: 44, height: 44, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>🎲</button>
          <button onClick={() => setAskReset(true)} className="kid-btn ghost" aria-label="Sākt no jauna" title="Sākt no jauna"
            style={{ width: 44, height: 44, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>🔄</button>
          {onToggleMusic && <MusicButton on={musicOn} onToggle={onToggleMusic} style={{ width: 44, height: 44, fontSize: 19 }} />}
          <StarCount value={totalStars} />
        </div>
      </div>

      {/* scrollable trail */}
      <div ref={scrollerRef} style={{ position: 'relative', zIndex: 5, flex: 1, overflow: 'auto' }}>
        <div style={{ position: 'relative', height: levels.length * 132 + 150, padding: '8px 0 40px' }}>
          {/* castle goal at top */}
          <div style={{ position: 'absolute', top: 6, left: 0, right: 0, textAlign: 'center' }}>
            <div style={{ fontSize: 56, filter: 'drop-shadow(0 6px 8px rgba(140,90,130,.2))', animation: 'floaty-slow 5s ease-in-out infinite' }}>🏰</div>
            <div className="display" style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', opacity: .7 }}>Feju pils</div>
          </div>

          {/* fairy-dust trail: colored up to the current level, faded dashed beyond */}
          <div style={{
            position: 'absolute', top: 96, left: '50%', width: 6, transform: 'translateX(-50%)', borderRadius: 3,
            ...(chapterAllDone ? { bottom: 30 } : { height: doneEndY - 96 }),
            background: `linear-gradient(180deg, var(--primary) 0%, ${GOLD} 100%)`,
            boxShadow: '0 0 12px 2px rgba(255,215,130,.55)',
          }} />
          {!chapterAllDone && (
            <div style={{ position: 'absolute', top: doneEndY, bottom: 30, left: '50%', width: 0, borderLeft: '5px dashed rgba(255,255,255,.6)', transform: 'translateX(-50%)' }} />
          )}
          {/* little sparkles along the travelled path */}
          {Array.from({ length: Math.max(0, Math.floor(((chapterAllDone ? levels.length * 132 + 120 : doneEndY) - 140) / 110)) }).map((_, i) => (
            <div key={'tw' + i} style={{
              position: 'absolute', top: 150 + i * 110, left: 'calc(50% + 9px)', fontSize: 13, pointerEvents: 'none',
              animation: `sparkle ${2.2 + (i % 3) * 0.5}s ease-in-out ${i * 0.4}s infinite`,
            }}>✨</div>
          ))}

          {levels.map((lv, idx) => {
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
                    <div style={{ position: 'absolute', bottom: 150, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', animation: 'floaty 2.2s ease-in-out infinite', pointerEvents: 'none' }}>
                      <div className="kid-btn" style={{ padding: '8px 18px', fontSize: 15, fontWeight: 600, boxShadow: '0 4px 0 var(--primary-dark)' }}>Sākt ▸</div>
                    </div>
                    {/* the fairy stands right where the journey continues */}
                    <div style={{ position: 'absolute', bottom: 92, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
                      <Fairy size={54} />
                    </div>
                    {arriveBurst && (
                      <div style={{ position: 'absolute', inset: -40, pointerEvents: 'none', animation: 'fade-out .4s ease 1s forwards' }}>
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} style={{ position: 'absolute', left: '50%', top: '50%', transform: `rotate(${i * 45}deg) translateY(-68px)` }}>
                            <div style={{ fontSize: 20, animation: `star-pop .5s ease ${i * 0.05}s both` }}>{['⭐', '✨', '🌟'][i % 3]}</div>
                          </div>
                        ))}
                      </div>
                    )}
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
function RandomWords({ words, onExit, musicOn, onToggleMusic, onShowCards, restPending, onWordSeen }) {
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

  // when the rest limit hit, finish the current word, then exit instead of
  // dealing a new one (App turns the exit into the goodnight scene)
  const next = () => {
    if (restPending) { onExit(); return; }
    if (onWordSeen) onWordSeen();
    setWord(randomWord(word));
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
          {onShowCards && (
            <button onClick={onShowCards} className="kid-btn ghost" aria-label="Manas kartiņas" title="Manas kartiņas"
              style={{ width: 44, height: 44, fontSize: 19, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>🎴</button>
          )}
          {onToggleMusic && <MusicButton on={musicOn} onToggle={onToggleMusic} />}
        </div>
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
function RewardScreen({ starsEarned, totalStars, newTreasure, newCard, onContinue }) {
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
  const praise = newCard ? 'Nodaļa pabeigta!' : starsEarned >= 3 ? 'Lieliski!' : starsEarned === 2 ? 'Malacis!' : 'Tu to spēji!';

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
        <div className="display" style={{ marginTop: 8, fontSize: newCard ? 38 : 46, fontWeight: 700, color: 'var(--primary)', filter: 'drop-shadow(0 3px 0 rgba(255,255,255,.6))', animation: 'pop-in .5s ease .1s both' }}>{praise}</div>

        {/* new collectible card reveal (chapter complete) */}
        {newCard && (
          <div style={{ marginTop: 14, animation: 'pop-in .6s cubic-bezier(.34,1.56,.64,1) .25s both' }}>
            <div className="display" style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', opacity: .75 }}>🎴 Jauna kartiņa!</div>
            <div style={{
              width: 150, height: 200, borderRadius: 22, margin: '10px auto 0',
              background: 'var(--surface)', overflow: 'hidden',
              boxShadow: '0 16px 40px rgba(120,60,110,.4), 0 0 0 5px rgba(255,255,255,.85)',
              animation: 'bob 1.8s ease-in-out infinite',
            }}>
              <img src={newCard} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
          </div>
        )}

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

Object.assign(window, {
  Sky, MusicButton, MilestonePopup, Welcome, GamesHub, ChapterSelect, CardGallery, FairyMap, RewardScreen, RandomWords,
  TiredToast, NightSky, GoodnightScreen, SleepScreen, CardPeek,
});
