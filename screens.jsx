// screens.jsx — all full-screen views: Welcome, GamesHub, ChapterSelect,
// CardGallery, FairyMap (level select), RewardScreen, the rest-timer screens
// (TiredToast / GoodnightScreen / SleepScreen), card overlays, MilestonePopup,
// MusicButton, and the ParentDashboard.
const { useState: useSt, useEffect: useEf, useRef: useRf } = React;

// ── soft sky gradient backdrop used on every screen ──
function Sky({ children }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: 'linear-gradient(180deg, var(--bg1) 0%, var(--bg2) 100%)',
    }}>
      {/* soft clouds (percentage positions so they spread on any width) */}
      {[['-5%', '10%', 150], ['62%', '17%', 120], ['14%', '37%', 110], ['68%', '54%', 140]].map((c, i) => (
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
          width: 'min(214px, 44vw, calc(var(--app-h, 100dvh) * 0.42))', aspectRatio: '214 / 340',
          borderRadius: 30, margin: '0 auto',
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
    <button onClick={onToggle} className="kid-btn ghost icon-btn"
      aria-label={on ? 'Izslēgt mūziku' : 'Ieslēgt mūziku'} title="Mūzika"
      style={{ fontSize: 20, ...style }}>
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
      position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: 'min(92%, 480px)',
      bottom: 'calc(28px + var(--safe-bottom, 0px))', zIndex: 180, pointerEvents: 'none',
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
      {[['7%', '10%', 4], ['30%', '6%', 3], ['52%', '13%', 5], ['75%', '8%', 3], ['17%', '23%', 3], ['82%', '21%', 4], ['40%', '18%', 3], ['62%', '26%', 4], ['10%', '34%', 3], ['87%', '38%', 3]].map((s, i) => (
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
      <div style={{ position: 'absolute', top: 'calc(var(--safe-top, 0px) + 40px)', right: '8%', fontSize: 64, filter: 'drop-shadow(0 0 18px rgba(255,240,180,.55))', animation: 'floaty-slow 6s ease-in-out infinite' }}>🌙</div>
      <div style={{ position: 'relative', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ margin: 'auto', width: '100%', maxWidth: 520, padding: '24px 30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
      <div style={{ position: 'relative', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ margin: 'auto', width: '100%', maxWidth: 520, padding: '24px 30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 84, animation: 'pop-in .6s ease both', filter: 'drop-shadow(0 0 22px rgba(255,210,90,.7))' }}>☀️</div>
          <div style={{ marginTop: 10, animation: 'pop-in .6s ease .1s both' }}><Fairy size={120} mood="cheer" /></div>
          <div className="display" style={{ marginTop: 12, fontSize: 32, fontWeight: 700, color: 'var(--primary)', animation: 'slide-up .6s ease .2s both' }}>Kikija ir atpūtusies! ☀️</div>
          <button onClick={onWake} className="kid-btn" style={{ marginTop: 30, padding: '18px 56px', fontSize: 25, fontWeight: 600, animation: 'slide-up .6s ease .4s both' }}>Spēlēt!</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <NightSky />
      <div style={{ position: 'relative', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ margin: 'auto', width: '100%', maxWidth: 520, padding: '24px 26px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CARD TILE — one collectible card in a grid (gallery or peek).
// Unlocked cards are tappable; locked ones show a grey "?".
// ─────────────────────────────────────────────────────────────
function CardTile({ ch, isUnlocked, isCompanion, delay = 0, onOpen }) {
  return (
    <button
      onClick={() => isUnlocked && onOpen && onOpen(ch)}
      className={isUnlocked ? 'tile' : undefined}
      style={{
        aspectRatio: '3 / 4', border: 'none', padding: 0, borderRadius: 18,
        overflow: 'hidden', position: 'relative',
        background: isUnlocked ? 'var(--surface2)' : 'rgba(140,90,130,.10)',
        boxShadow: isCompanion
          ? `0 0 0 4px ${GOLD}, 0 8px 18px rgba(120,60,110,.28)`
          : isUnlocked
            ? '0 6px 16px rgba(120,60,110,.22), 0 0 0 3px rgba(255,255,255,.85)'
            : 'inset 0 2px 10px rgba(140,90,130,.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: isUnlocked && onOpen ? 'pointer' : 'default',
        animation: `slide-up .45s ease ${delay}s both`,
      }}>
      {isUnlocked
        ? <img src={ch.card} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.style.display = 'none'; }} />
        : <span className="display" style={{ fontSize: 40, fontWeight: 700, color: 'rgba(140,90,130,.45)' }}>?</span>}
      <div style={{
        position: 'absolute', bottom: 4, left: 4, minWidth: 22, height: 22, padding: '0 6px',
        borderRadius: 999, background: isUnlocked ? 'var(--primary)' : 'rgba(140,90,130,.35)',
        color: '#fff', fontSize: 12, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{ch.id}</div>
      {isCompanion && (
        <div style={{
          position: 'absolute', bottom: 4, right: 4, width: 24, height: 24, borderRadius: '50%',
          background: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, boxShadow: `0 2px 0 ${GOLD_DARK}`,
        }}>💛</div>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// CARD DETAIL — one card up close. With `onChoose` the child can pick it
// as the companion ("Mans draugs!"); without it the view is read-only.
// ─────────────────────────────────────────────────────────────
function CardDetail({ chapter, isCompanion, onChoose, onClose }) {
  return (
    <div onClick={(e) => { e.stopPropagation(); onClose(); }} style={{
      position: 'absolute', inset: 0, zIndex: 260, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(60,28,55,.45)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{ textAlign: 'center', padding: 16, animation: 'pop-in .35s cubic-bezier(.34,1.56,.64,1) both' }}>
        <div style={{
          width: 'min(70vw, 300px, calc(var(--app-h, 100dvh) * 0.45))', aspectRatio: '3 / 4',
          borderRadius: 26, margin: '0 auto', position: 'relative',
          background: 'var(--surface)', overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(50,20,50,.5), 0 0 0 6px rgba(255,255,255,.9)',
          animation: 'bob 2.2s ease-in-out infinite',
        }}>
          <img src={chapter.card} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { e.target.style.display = 'none'; }} />
          <div style={{
            position: 'absolute', bottom: 8, left: 8, minWidth: 28, height: 28, padding: '0 9px',
            borderRadius: 999, background: 'var(--primary)', color: '#fff', fontSize: 15, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{chapter.id}</div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', marginTop: 22, flexWrap: 'wrap' }}>
          {onChoose && (isCompanion ? (
            <div className="display" style={{
              padding: '13px 26px', borderRadius: 999, background: GOLD, color: '#fff',
              fontSize: 19, fontWeight: 600, boxShadow: `0 5px 0 ${GOLD_DARK}`,
            }}>💛 Tavs draugs!</div>
          ) : (
            <button onClick={() => { if (window.playSfx) playSfx('win', 0.5); onChoose(chapter.id); onClose(); }}
              className="kid-btn" style={{ padding: '14px 28px', fontSize: 20, fontWeight: 600 }}>
              💛 Mans draugs!
            </button>
          ))}
          <IconBtn onClick={onClose} label="Aizvērt" fontSize={18}>✕</IconBtn>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CARD PEEK — overlay with the collected cards, openable from inside any
// game (🎴 in the top bar). The game underneath keeps running untouched.
// A scrollable grid (view-only); tap a card to see it big.
// ─────────────────────────────────────────────────────────────
function CardPeek({ chapters, currentId, onClose }) {
  const unlocked = chapters.filter(c => c.endId < currentId).length;
  const [detail, setDetail] = useSt(null);
  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(80,40,70,.32)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          width: 'min(92vw, 620px)', maxHeight: 'calc(var(--app-h, 100dvh) * 0.82)',
          display: 'flex', flexDirection: 'column',
          background: 'var(--surface)', borderRadius: 30, padding: '16px 0 14px',
          boxShadow: '0 20px 50px rgba(140,90,130,.35)', animation: 'pop-in .3s ease both',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexShrink: 0, padding: '0 16px 6px' }}>
            <div className="display" style={{ fontSize: 20, fontWeight: 600, color: 'var(--primary)', minWidth: 0 }}>🎴 Manas kartiņas</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
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
            <div style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '8px 16px 8px' }}>
              <div className="card-grid card-grid--peek">
                {chapters.map((ch, i) => (
                  <CardTile key={ch.id} ch={ch} isUnlocked={ch.endId < currentId}
                    delay={i * 0.02} onOpen={setDetail} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {detail && <CardDetail chapter={detail} onClose={() => setDetail(null)} />}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// WELCOME
// ─────────────────────────────────────────────────────────────
function Welcome({ onStart, musicOn, onToggleMusic, companion }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Sky />
      <SparkleField count={10} />
      <Rainbow width={340} style={{ top: 96, left: '50%', transform: 'translateX(-50%)' }} />
      <Meadow />
      <Butterflies count={2} />
      {onToggleMusic && (
        <div style={{ position: 'absolute', top: 'calc(var(--safe-top, 0px) + 14px)', right: 'calc(var(--safe-right, 0px) + 18px)', zIndex: 20 }}>
          <MusicButton on={musicOn} onToggle={onToggleMusic} />
        </div>
      )}
      <div style={{ position: 'relative', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          margin: 'auto', width: '100%', maxWidth: 520, padding: '24px 30px', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
        <div style={{ animation: 'pop-in .6s ease both' }}>
          <Fairy size={150} buddy={companion} />
        </div>

        <div style={{ marginTop: 18, animation: 'slide-up .6s ease .15s both' }}>
          <div className="display" style={{ fontSize: 'var(--fs-title)', fontWeight: 700, color: 'var(--primary)', lineHeight: 1, letterSpacing: 0.5, whiteSpace: 'nowrap', filter: 'drop-shadow(0 3px 0 rgba(255,255,255,.6))' }}>Burtu Feja</div>
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// GAMES HUB — pick a game. The journey (map) is one card; the rest are
// phonics/reading practice rounds drawn from the child's unlocked words.
// ─────────────────────────────────────────────────────────────
function GamesHub({ totalStars, onPick, musicOn, onToggleMusic, companion }) {
  const CARDS = [
    { key: 'map',         icon: '🗺️', hue: 'lilac', title: 'Ceļojums',      sub: 'Saliec vārdus no zilbēm' },
    { key: 'readfind',    icon: '🔎', hue: 'sky',   title: 'Atrodi attēlu',  sub: 'Izlasi vārdu, atrodi bildi' },
    { key: 'firstletter', icon: '🔤', hue: 'mint',  title: 'Pirmais burts',  sub: 'Ar kuru burtu sākas?' },
    { key: 'blend',       icon: '🔊', hue: 'peach', title: 'Skaņas',         sub: 'Klausies un saliec vārdu' },
    { key: 'mixed',       icon: '🎲', hue: 'gold',  title: 'Jaukti vārdi',   sub: 'Saliec sajauktus vārdus' },
    { key: 'cards',       icon: '🎴', hue: 'rose',  title: 'Manas kartiņas', sub: 'Kolekcija un tavs draugs' },
  ];

  return (
    <div className="screen">
      <Sky />
      <SparkleField count={7} />
      <Meadow />
      <Butterflies count={2} zIndex={8} />

      <TopBar
        left={<div style={{ marginRight: companion ? 12 : 0 }}><Fairy size={52} float={false} buddy={companion} /></div>}
        title="Spēles"
        right={<>
          {onToggleMusic && <MusicButton on={musicOn} onToggle={onToggleMusic} />}
          <StarCount value={totalStars} />
        </>}
      />

      {/* card list */}
      <div className="content">
        <div className="col menu-grid">
        {CARDS.map((c, i) => {
          const accent = HUES[c.hue];
          return (
            <button key={c.key} onClick={() => onPick(c.key)} className="tile" style={{
              width: '100%', border: 'none', textAlign: 'left', position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', borderRadius: 26,
              background: 'var(--surface)', boxShadow: `0 7px 0 ${accent[1]}, 0 11px 20px rgba(140,90,130,.14)`,
              animation: `slide-up .5s ease ${i * 0.06}s both`,
            }}>
              {/* soft accent wash in the corner */}
              <div style={{ position: 'absolute', right: -32, top: -32, width: 120, height: 120, borderRadius: '50%', background: accent[0], opacity: .18, filter: 'blur(2px)', pointerEvents: 'none' }} />
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
    <div className="screen">
      <Sky />
      <SparkleField count={6} />
      <Meadow />
      <Butterflies count={2} />

      <TopBar
        left={<IconBtn onClick={onBack} label="Atpakaļ uz spēlēm" fontSize={22}>‹</IconBtn>}
        title="Ceļojums"
        right={<>
          {onToggleMusic && <MusicButton on={musicOn} onToggle={onToggleMusic} />}
          <StarCount value={totalStars} />
        </>}
      />

      {/* chapter list */}
      <div className="content">
        <div className="col menu-grid">
        {chapters.map((ch, i) => {
          const state = ch.startId > currentId ? 'locked' : ch.endId < currentId ? 'done' : 'current';
          const accent = HUES[ch.levels[0].hue];
          const done = Math.min(ch.levels.length, Math.max(0, currentId - ch.startId));
          const sub = state === 'locked' ? 'Vēl aizvērts'
            : state === 'done' ? 'Pabeigts ✓'
            : `${done} / ${ch.levels.length} vārdi`;
          return (
            <button key={ch.id} onClick={() => state !== 'locked' && onPick(ch)} className="tile" style={{
              width: '100%', border: 'none', textAlign: 'left',
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CARD GALLERY — "Manas kartiņas". One collectible card per chapter:
// unlocked cards show the picture, the rest are grey "?" placeholders so
// the child can see how many of the total remain. Derived from currentId.
// ─────────────────────────────────────────────────────────────
function CardGallery({ chapters, currentId, onBack, musicOn, onToggleMusic, companionId, onChooseCompanion }) {
  const unlocked = chapters.filter(c => c.endId < currentId).length;
  const [detail, setDetail] = useSt(null);
  return (
    <div className="screen">
      <Sky />
      <SparkleField count={6} />

      <TopBar
        left={<IconBtn onClick={onBack} label="Atpakaļ uz spēlēm" fontSize={22}>‹</IconBtn>}
        title="Manas kartiņas"
        right={<>
          {onToggleMusic && <MusicButton on={musicOn} onToggle={onToggleMusic} />}
          <div className="display" style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 999,
            background: 'var(--surface)', fontSize: 16, fontWeight: 700, color: 'var(--primary)',
            boxShadow: '0 4px 12px rgba(140,90,130,.16)', whiteSpace: 'nowrap',
          }}>🎴 {unlocked} / {chapters.length}</div>
        </>}
      />

      {/* card grid */}
      <div className="content">
        <div className="col">
          {unlocked > 0 && (
            <div className="display" style={{
              textAlign: 'center', fontSize: 15, fontWeight: 600, color: 'var(--ink)', opacity: .65,
              margin: '2px 0 12px',
            }}>Pieskaries kartiņai un izvēlies savu draugu! 💛</div>
          )}
          <div className="card-grid">
            {chapters.map((ch, i) => (
              <CardTile key={ch.id} ch={ch} isUnlocked={ch.endId < currentId}
                isCompanion={ch.id === companionId && ch.endId < currentId}
                delay={i * 0.03} onOpen={setDetail} />
            ))}
          </div>
        </div>
      </div>

      {detail && (
        <CardDetail chapter={detail} isCompanion={detail.id === companionId}
          onChoose={onChooseCompanion} onClose={() => setDetail(null)} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FAIRY MAP (level select)
// ─────────────────────────────────────────────────────────────
function FairyMap({ chapter, currentId, levelStars, totalStars, onPlay, onStartOver, onRandom, onBack, onShowCards, musicOn, onToggleMusic, companion }) {
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
    <div className="screen">
      <Sky />
      <SparkleField count={6} />
      <Butterflies count={2} zIndex={8} />

      <TopBar
        left={<>
          {onBack && <IconBtn onClick={onBack} label="Atpakaļ uz nodaļām" fontSize={22}>‹</IconBtn>}
          {onShowCards && <IconBtn onClick={onShowCards} label="Manas kartiņas" fontSize={20}>🎴</IconBtn>}
        </>}
        title={`${chapter.id}. nodaļa`} titleStyle={{ color: 'var(--ink)' }}
        right={<>
          <IconBtn onClick={onRandom} label="Jaukti vārdi" fontSize={20}>🎲</IconBtn>
          <IconBtn onClick={() => setAskReset(true)} label="Sākt no jauna" fontSize={20}>🔄</IconBtn>
          {onToggleMusic && <MusicButton on={musicOn} onToggle={onToggleMusic} />}
          <StarCount value={totalStars} />
        </>}
      />

      {/* scrollable trail (kept narrow + centered so the zig-zag stays cozy) */}
      <div ref={scrollerRef} className="content">
        <div style={{ position: 'relative', width: 'min(100%, 480px)', margin: '0 auto', height: levels.length * 132 + 150, padding: '8px 0 40px' }}>
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

          {/* roadside scenery: one plant per level, opposite the node */}
          {levels.map((lv, idx) => {
            const flora = ['🌳', '🌸', '🍄', '🌷', '🌲', '🌼', '⛰️', '🌻'];
            const dx = lv.side === 'l' ? 128 : -128;
            return (
              <div key={'sc' + lv.id} style={{ position: 'absolute', top: 110 + idx * 132 + 44, left: `calc(50% + ${dx}px)`, marginLeft: -16, pointerEvents: 'none' }}>
                <div style={{
                  fontSize: 26 + (idx % 3) * 5, transformOrigin: 'bottom center',
                  animation: `sway ${3 + (idx % 3)}s ease-in-out ${idx * 0.4}s infinite`,
                  filter: 'drop-shadow(0 3px 4px rgba(140,90,130,.18))',
                }}>{flora[idx % flora.length]}</div>
              </div>
            );
          })}

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
                      <Fairy size={54} buddy={companion} />
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
                    fontSize: 44,
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
            background: 'var(--surface)', borderRadius: 28, padding: '26px 24px', width: 'min(320px, 88vw)', textAlign: 'center',
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

// RandomWords (the old passive free-review) was removed: "Jaukti vārdi" is now
// a real syllable-building round (MixedWordsGame in games.jsx) over a shuffled
// easy+hard word mix.

// ─────────────────────────────────────────────────────────────
// REWARD / CELEBRATION
// ─────────────────────────────────────────────────────────────
function RewardScreen({ starsEarned, totalStars, newTreasure, newCard, onContinue, companion }) {
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

      <Rainbow width={340} style={{ top: 110, left: '50%', transform: 'translateX(-50%)' }} />

      <div style={{ position: 'relative', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ margin: 'auto', width: '100%', maxWidth: 480, padding: '24px 30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ animation: 'pop-in .5s ease both' }}>
          <Fairy size={120} mood="cheer" buddy={companion} />
        </div>
        <div className="display" style={{ marginTop: 8, fontSize: newCard ? 'clamp(30px, 6vw, 38px)' : 'clamp(34px, 8vw, 46px)', fontWeight: 700, color: 'var(--primary)', filter: 'drop-shadow(0 3px 0 rgba(255,255,255,.6))', animation: 'pop-in .5s ease .1s both' }}>{praise}</div>

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
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VECĀKU PANELIS — parent progress dashboard
// Reads from burtu-feja-history (array of daily session summaries).
// Accessed via Tweaks Panel → Vecāku panelis.
// ─────────────────────────────────────────────────────────────

function getLast7Days(history) {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return history.find(e => e.date === key) || null;
  });
}

function getAccuracyTrend(history) {
  const recent = history.slice(-6);
  if (recent.length < 2) return 'stable';
  const half = Math.floor(recent.length / 2);
  const avg = arr => arr.length ? arr.reduce((s, w) => s + w.stars, 0) / arr.length : 0;
  const diff = avg(recent.slice(half).flatMap(e => e.words)) -
               avg(recent.slice(0, half).flatMap(e => e.words));
  return diff > 0.2 ? 'up' : diff < -0.2 ? 'down' : 'stable';
}

function getStrugglingWords(history) {
  const map = {};
  history.flatMap(e => e.words).forEach(w => {
    if (!map[w.word]) map[w.word] = { total: 0, count: 0 };
    map[w.word].total += w.stars;
    map[w.word].count++;
  });
  return Object.entries(map)
    .filter(([, v]) => v.count >= 2)
    .map(([word, v]) => ({ word, avgStars: v.total / v.count, count: v.count }))
    .sort((a, b) => a.avgStars - b.avgStars)
    .slice(0, 6);
}

const LV_MONTHS = ['jan.', 'feb.', 'mar.', 'apr.', 'maijs', 'jūn.', 'jūl.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'];
const LV_DAYS = ['Sv', 'P', 'O', 'T', 'C', 'Pk', 'S'];

function formatLvDate(isoDate) {
  const [, m, d] = isoDate.split('-');
  return `${parseInt(d)}. ${LV_MONTHS[parseInt(m) - 1]}`;
}

function KpiCard({ label, value, sub, accent }) {
  return (
    <div style={{
      flex: '1 1 0', minWidth: 0, background: 'var(--surface)', borderRadius: 20,
      padding: '14px 12px', textAlign: 'center',
      boxShadow: '0 4px 12px rgba(140,90,130,.12)',
    }}>
      <div className="display" style={{ fontSize: 28, fontWeight: 700, color: accent || 'var(--primary)', lineHeight: 1.1 }}>{value}</div>
      <div className="display" style={{ fontSize: 11, fontWeight: 600, color: 'var(--inkSoft)', marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      {sub && <div className="display" style={{ fontSize: 11, color: 'var(--inkSoft)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function ParentDashboard({ history, currentId, levelStars, onBack }) {
  if (history.length === 0) {
    return (
      <div className="screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🧚</div>
        <div className="display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)', marginBottom: 10 }}>Vecāku panelis</div>
        <div className="display" style={{ fontSize: 16, color: 'var(--inkSoft)', lineHeight: 1.5, maxWidth: 320 }}>
          Vēl nav datu — nospēlē pirmo nodarbību un fejas miedziņu, lai šeit parādītos progress!
        </div>
        <button onClick={onBack} className="kid-btn" style={{ marginTop: 32, padding: '14px 40px', fontSize: 19 }}>← Atpakaļ</button>
      </div>
    );
  }

  const allWords = history.flatMap(e => e.words);
  const totalLevels = (window.LEVELS || []).length || 109;
  const pctProgress = Math.min(100, Math.round((currentId - 1) / totalLevels * 100));
  const wordsMastered = Object.values(levelStars || {}).filter(s => s >= 2).length;
  const last7 = getLast7Days(history);
  const minutesThisWeek = Math.round(last7.reduce((s, d) => s + (d ? d.durationMs : 0), 0) / 60000);
  const avgAccuracyPct = allWords.length > 0
    ? Math.round(allWords.reduce((s, w) => s + w.stars, 0) / allWords.length / 3 * 100)
    : 0;

  const trend = getAccuracyTrend(history);
  const trendLabel = trend === 'up' ? 'Uzlabojas ↑' : trend === 'down' ? 'Krītas ↓' : 'Stabils —';
  const trendColor = trend === 'up' ? '#22a060' : trend === 'down' ? '#d07020' : 'var(--inkSoft)';

  const maxMins = Math.max(1, ...last7.map(d => d ? d.durationMs / 60000 : 0));

  const recentSessions = history.slice().reverse().slice(0, 7);
  const struggling = getStrugglingWords(history);
  const hasSpeed = allWords.some(w => w.ms > 0);

  const GAME_LABELS = { syllable: 'Zilbes', readfind: 'Atrodi', firstletter: '1. burts', blend: 'Skaņas', mixed: 'Jaukti' };

  return (
    <div className="screen" style={{ overflowY: 'auto' }}>
      {/* top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: 'calc(var(--safe-top, 0px) + 14px) 18px 10px',
        background: 'var(--surface)', borderBottom: '1px solid rgba(150,110,150,.12)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button onClick={onBack} className="kid-btn ghost icon-btn" style={{ fontSize: 22 }}>‹</button>
        <span className="display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', flex: 1 }}>Vecāku panelis</span>
        <span style={{ fontSize: 22 }}>🧚</span>
      </div>

      <div style={{ padding: '18px 16px', maxWidth: 540, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* KPI row */}
        <div style={{ display: 'flex', gap: 8 }}>
          <KpiCard label="Gaita" value={`${pctProgress}%`} sub={`${currentId - 1}/${totalLevels} līm.`} />
          <KpiCard label="Apgūti" value={wordsMastered} sub="vārdi (2⭐+)" />
          <KpiCard label="Šonedēļ" value={`${minutesThisWeek}`} sub="minūtes" />
          <KpiCard label="Precizitāte" value={`${avgAccuracyPct}%`} />
        </div>

        {/* daily minutes chart */}
        <div style={{ background: 'var(--surface)', borderRadius: 20, padding: '16px 16px 12px', boxShadow: '0 4px 12px rgba(140,90,130,.10)' }}>
          <div className="display" style={{ fontSize: 13, fontWeight: 700, color: 'var(--inkSoft)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Laiks pa dienām</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 100 }}>
            {last7.map((day, i) => {
              const mins = day ? Math.round(day.durationMs / 60000) : 0;
              const heightPct = mins > 0 ? Math.max(8, (mins / maxMins) * 100) : 4;
              const isToday = i === 6;
              const d = new Date(); d.setDate(d.getDate() - (6 - i));
              const dayLabel = LV_DAYS[d.getDay()];
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                  {mins > 0 && (
                    <span className="display" style={{ fontSize: 9, color: isToday ? 'var(--primary)' : 'var(--inkSoft)', fontWeight: 600 }}>{mins}'</span>
                  )}
                  <div style={{
                    width: '100%', height: `${heightPct}%`, borderRadius: '4px 4px 0 0',
                    background: 'var(--primary)',
                    opacity: mins > 0 ? (isToday ? 1 : 0.55) : 0.18,
                    transition: 'height .3s',
                  }} />
                  <span className="display" style={{ fontSize: 10, color: isToday ? 'var(--primary)' : 'var(--inkSoft)', fontWeight: isToday ? 700 : 400 }}>{dayLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* accuracy trend */}
        <div style={{ background: 'var(--surface)', borderRadius: 20, padding: '14px 18px', boxShadow: '0 4px 12px rgba(140,90,130,.10)', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div className="display" style={{ fontSize: 13, fontWeight: 700, color: 'var(--inkSoft)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Precizitātes tendence</div>
            <div className="display" style={{ fontSize: 22, fontWeight: 700, color: trendColor, marginTop: 4 }}>{trendLabel}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="display" style={{ fontSize: 13, color: 'var(--inkSoft)' }}>Kopā vārdi</div>
            <div className="display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>{allWords.length}</div>
          </div>
        </div>

        {/* session history */}
        <div style={{ background: 'var(--surface)', borderRadius: 20, padding: '14px 16px', boxShadow: '0 4px 12px rgba(140,90,130,.10)' }}>
          <div className="display" style={{ fontSize: 13, fontWeight: 700, color: 'var(--inkSoft)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Pēdējās nodarbības</div>
          {recentSessions.map((entry, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 0',
              borderBottom: i < recentSessions.length - 1 ? '1px solid rgba(150,110,150,.1)' : 'none',
            }}>
              <span style={{ fontSize: 16 }}>📅</span>
              <span className="display" style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600, minWidth: 68 }}>{formatLvDate(entry.date)}</span>
              <span className="display" style={{ fontSize: 13, color: 'var(--inkSoft)' }}>⏱ {Math.round(entry.durationMs / 60000)}min</span>
              <span className="display" style={{ fontSize: 13, color: 'var(--inkSoft)' }}>📝 {entry.words.length}</span>
              <span className="display" style={{ fontSize: 13, color: 'var(--inkSoft)', marginLeft: 'auto' }}>⭐ {entry.sessionStars}</span>
            </div>
          ))}
        </div>

        {/* struggling words */}
        {struggling.length > 0 && (
          <div style={{ background: 'var(--surface)', borderRadius: 20, padding: '14px 16px', boxShadow: '0 4px 12px rgba(140,90,130,.10)' }}>
            <div className="display" style={{ fontSize: 13, fontWeight: 700, color: 'var(--inkSoft)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Grūtākie vārdi</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {struggling.map(({ word, avgStars, count }) => (
                <div key={word} style={{
                  background: 'rgba(150,110,150,.1)', borderRadius: 12, padding: '6px 12px',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span className="display" style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>{word}</span>
                  <span className="display" style={{ fontSize: 12, color: 'var(--inkSoft)' }}>⭐{avgStars.toFixed(1)} · {count}×</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* speed by game type */}
        {hasSpeed && (() => {
          const byGame = {};
          allWords.filter(w => w.ms > 0).forEach(w => {
            if (!byGame[w.game]) byGame[w.game] = { total: 0, count: 0 };
            byGame[w.game].total += w.ms;
            byGame[w.game].count++;
          });
          const entries = Object.entries(byGame).map(([game, v]) => ({ game, avgSec: (v.total / v.count / 1000).toFixed(1) }));
          return (
            <div style={{ background: 'var(--surface)', borderRadius: 20, padding: '14px 16px', boxShadow: '0 4px 12px rgba(140,90,130,.10)' }}>
              <div className="display" style={{ fontSize: 13, fontWeight: 700, color: 'var(--inkSoft)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Vidējais atbildes laiks</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {entries.map(({ game, avgSec }) => (
                  <div key={game} style={{ background: 'rgba(150,110,150,.1)', borderRadius: 12, padding: '6px 12px' }}>
                    <span className="display" style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>{GAME_LABELS[game] || game}</span>
                    <span className="display" style={{ fontSize: 12, color: 'var(--inkSoft)', marginLeft: 6 }}>{avgSec}s</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        <div style={{ height: 'calc(20px + var(--safe-bottom, 0px))' }} />
      </div>
    </div>
  );
}

Object.assign(window, {
  Sky, MusicButton, MilestonePopup, Welcome, GamesHub, ChapterSelect, CardGallery, FairyMap, RewardScreen,
  TiredToast, NightSky, GoodnightScreen, SleepScreen, CardPeek, CardDetail, CardTile, ParentDashboard,
});
