// game.jsx — the syllable-building mini-game, with 3 lesson variants
const { useState: useStateG, useEffect: useEffectG, useRef: useRefG } = React;

// Recorded-audio player. Plays audio/<slug>.mp3 (human voice). If a clip is
// missing it simply stays silent — no robotic text-to-speech fallback.
const _audioCache = {};
function playWord(wordKey) {
  const w = WORDS[wordKey];
  if (!w || !w.slug) return;
  try {
    let a = _audioCache[w.slug];
    if (!a) { a = new Audio(`audio/${w.slug}.mp3`); _audioCache[w.slug] = a; }
    a.currentTime = 0;
    const p = a.play();
    if (p && p.catch) p.catch(() => {}); // missing clip → no-op
  } catch (e) {}
}

// Letter phoneme player. Plays audio/letters/<slug>.mp3 for a single letter
// (human recording, the sound not the name). Missing clip → silent no-op, so
// the blending game stays playable before the clips are recorded.
function playSound(letter) {
  const slug = (window.LETTER_SOUNDS || {})[letter];
  if (!slug) return;
  try {
    const key = '_ltr_' + slug;
    let a = _audioCache[key];
    if (!a) { a = new Audio(`audio/letters/${slug}.mp3`); _audioCache[key] = a; }
    a.currentTime = 0;
    const p = a.play();
    if (p && p.catch) p.catch(() => {}); // missing clip → no-op
  } catch (e) {}
}

// Short sound effect (e.g. audio/win.mp3). Cached, missing file → no-op.
function playSfx(name, vol = 0.6) {
  try {
    const key = '_sfx_' + name;
    let a = _audioCache[key];
    if (!a) { a = new Audio(`audio/${name}.mp3`); _audioCache[key] = a; }
    a.currentTime = 0;
    a.volume = vol;
    const p = a.play();
    if (p && p.catch) p.catch(() => {});
  } catch (e) {}
}

// A single syllable tile / slot face
function Face({ children, big, faded, color, ghost }) {
  return (
    <span className="display" style={{
      fontSize: big, fontWeight: 600, letterSpacing: 1,
      color: ghost ? 'transparent' : color,
      opacity: faded ? 0.28 : 1,
    }}>{children}</span>
  );
}

function starsForMistakes(m) {
  return m === 0 ? 3 : m === 1 ? 2 : 1;
}

function useTimeoutBag() {
  const timers = React.useRef([]);
  const clearTimers = React.useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  const setSafeTimeout = React.useCallback((fn, delay) => {
    const id = setTimeout(() => {
      timers.current = timers.current.filter(t => t !== id);
      fn();
    }, delay);
    timers.current.push(id);
    return id;
  }, []);
  React.useEffect(() => clearTimers, [clearTimers]);
  return { setSafeTimeout, clearTimers };
}

function WinBurst() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30 }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute', fontSize: 26,
          animation: `star-pop .6s ease ${i * 0.04}s both`,
          transform: `rotate(${i * 36}deg) translateY(-90px)`,
        }}>{['⭐', '✨', '💖'][i % 3]}</div>
      ))}
    </div>
  );
}

function ProgressDots({ index, total }) {
  return (
    <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        i < index
          ? <span key={i} style={{ fontSize: 15, lineHeight: '12px', filter: 'drop-shadow(0 1px 1px rgba(180,130,40,.4))' }}>⭐</span>
          : <div key={i} style={{
              width: i === index ? 30 : 12, height: 12, borderRadius: 999,
              background: i === index ? 'var(--primary)' : 'rgba(150,110,150,.28)',
              transition: 'all .3s',
            }} />
      ))}
    </div>
  );
}

// Shared shell: top bar, sparkles, and win overlay for lesson and hub games.
function GameFrame({ onExit, index, total, won, musicOn, onToggleMusic, onShowCards, children }) {
  return (
    <div className="screen">
      <SparkleField count={7} />
      <TopBar game
        left={<>
          <IconBtn onClick={onExit} label="Iziet" fontSize={22}>‹</IconBtn>
          <ProgressDots index={index} total={total} />
        </>}
        right={<>
          {onShowCards && <IconBtn onClick={onShowCards} label="Manas kartiņas" fontSize={19}>🎴</IconBtn>}
          {onToggleMusic && <MusicButton on={musicOn} onToggle={onToggleMusic} />}
        </>}
      />
      <div className="game-col">{children}</div>
      {won && <WinBurst />}
    </div>
  );
}

function WordPictureCard({ wordKey, data, accent, won, paddingTop = 14 }) {
  const wordData = data || WORDS[wordKey] || {};
  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop }}>
      <div onClick={() => playWord(wordKey)} style={{
        '--pic': 'min(156px, calc(var(--app-h, 100dvh) * 0.22))',
        width: 'var(--pic)', height: 'var(--pic)', borderRadius: 40, background: 'var(--surface)',
        boxShadow: '0 14px 30px rgba(140,90,130,.18)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer',
        animation: won ? 'bob .6s ease-in-out infinite' : 'floaty-slow 4s ease-in-out infinite',
      }}>
        <div style={{
          position: 'absolute', inset: 14, borderRadius: 30,
          background: `radial-gradient(circle at 50% 40%, ${accent[0]} 0%, transparent 72%)`, opacity: .5,
        }} />
        <div style={{ fontSize: 'calc(var(--pic) * 0.55)', lineHeight: 1, position: 'relative', filter: 'drop-shadow(0 4px 6px rgba(140,90,130,.25))' }}>{wordData.pic}</div>
        <div style={{ position: 'absolute', bottom: 10, right: 10, width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: '0 3px 8px rgba(140,90,130,.3)' }}>🔊</div>
      </div>
    </div>
  );
}

function SyllableGame({ wordKey, mode, accent, progress, onWin, onExit, onWordDone, musicOn, onToggleMusic, onShowCards }) {
  const data = WORDS[wordKey];
  const answer = data.syll;
  const n = answer.length;
  const slotFs = n >= 3 ? 28 : 40;
  const { setSafeTimeout, clearTimers } = useTimeoutBag();

  // ── tiles for tap / drag ──
  const tiles = useRefG(null);
  if (!tiles.current || tiles.current._w !== wordKey) {
    const dis = pickDistractors(answer, 1);
    const list = shuffle([...answer, ...dis]).map((s, i) => ({ id: i, syll: s }));
    list._w = wordKey;
    tiles.current = list;
  }
  const tileSyll = (id) => (tiles.current.find(t => t.id === id) || {}).syll;

  // ── choose-mode options ──
  const opts = useRefG(null);
  const blankIdx = n - 1;
  if (!opts.current || opts.current._w !== wordKey) {
    const o = shuffle([answer[blankIdx], ...pickDistractors([answer[blankIdx]], 2)]);
    o._w = wordKey;
    opts.current = o;
  }

  const [slots, setSlots] = useStateG(Array(n).fill(null)); // tile ids (tap/drag) / syllable (choose)
  const [resolving, setResolving] = useStateG(false);
  const [won, setWon] = useStateG(false);
  const [mistakes, setMistakes] = useStateG(0);
  const [feedback, setFeedback] = useStateG(null); // 'right' | 'wrong'
  const [shakeWrong, setShakeWrong] = useStateG(false);
  const [drag, setDrag] = useStateG(null);
  const [wrongOpt, setWrongOpt] = useStateG(null);
  const slotRefs = useRefG([]);

  // reset when word changes
  useEffectG(() => {
    clearTimers();
    setSlots(Array(n).fill(null)); setResolving(false); setWon(false);
    setMistakes(0); setFeedback(null); setShakeWrong(false); setDrag(null); setWrongOpt(null);
  }, [wordKey]);

  function winNow() {
    setFeedback('right'); setWon(true);
    playSfx('win');     // celebration sound on every correct answer
    playWord(wordKey);  // then hear the word
    if (onWordDone) onWordDone(mistakes === 0); // streak: was this word first-try?
    setSafeTimeout(() => onWin(starsForMistakes(mistakes)), 1150);
  }

  // ── tap / drag placement ──
  function placeNextEmpty(tileId) {
    if (resolving || won) return;
    setSlots(s => { const i = s.indexOf(null); if (i < 0 || s.includes(tileId)) return s; const c = s.slice(); c[i] = tileId; return c; });
  }
  function placeInSlot(tileId, idx) {
    if (resolving || won) return;
    setSlots(s => { if (s[idx] !== null || s.includes(tileId)) return s; const c = s.slice(); c[idx] = tileId; return c; });
  }
  function removeSlot(idx) {
    if (resolving || won) return;
    setSlots(s => { const c = s.slice(); c[idx] = null; return c; });
  }

  // auto-check tap/drag when all slots filled
  useEffectG(() => {
    if (mode === 'choose' || won || resolving) return;
    if (slots.every(s => s !== null)) {
      setResolving(true);
      const ok = slots.every((id, i) => tileSyll(id) === answer[i]);
      const t = setSafeTimeout(() => {
        if (ok) { winNow(); }
        else {
          setMistakes(m => m + 1); setShakeWrong(true); setFeedback('wrong');
          setSafeTimeout(() => { setSlots(Array(n).fill(null)); setShakeWrong(false); setResolving(false); setFeedback(null); }, 750);
        }
      }, 420);
      return () => clearTimeout(t);
    }
  }, [slots]);

  // drag listeners
  useEffectG(() => {
    if (!drag) return;
    const move = (e) => setDrag(d => d ? { ...d, x: e.clientX, y: e.clientY, moved: d.moved || Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 6 } : d);
    const up = (e) => {
      setDrag(d => {
        if (!d) return null;
        if (d.moved) {
          let target = -1;
          slotRefs.current.forEach((el, i) => {
            if (!el) return; const r = el.getBoundingClientRect();
            if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) target = i;
          });
          if (target >= 0) placeInSlot(d.tileId, target);
        } else { placeNextEmpty(d.tileId); }
        return null;
      });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [drag && drag.tileId]);

  // choose-mode pick
  function pickOption(syll) {
    if (won) return;
    if (syll === answer[blankIdx]) { setSlots(answer.slice()); setSafeTimeout(winNow, 120); }
    else { setMistakes(m => m + 1); setWrongOpt(syll); setFeedback('wrong'); setSafeTimeout(() => { setWrongOpt(null); setFeedback(null); }, 700); }
  }

  // ── prompt text ──
  const prompts = {
    idle: { tap: 'Pieskaries zilbēm pareizā secībā!', drag: 'Aizvelc zilbes uz vietām!', choose: 'Kura zilbe pazuda?' },
  };
  const promptText = feedback === 'right' ? 'Lieliski! 🎉' : feedback === 'wrong' ? 'Vai, pamēģini vēlreiz!' : prompts.idle[mode];

  const usedIds = slots.filter(s => s !== null);

  // ── render a slot ──
  const renderSlot = (i) => {
    const filled = slots[i];
    const isChoose = mode === 'choose';
    const choosePrefill = isChoose && i !== blankIdx;
    const choosabBlank = isChoose && i === blankIdx;
    const syllText = choosePrefill ? answer[i] : (filled !== null ? (isChoose ? filled : tileSyll(filled)) : '');
    const hasContent = choosePrefill || (filled !== null);
    return (
      <div
        key={i}
        ref={el => slotRefs.current[i] = el}
        onClick={() => { if (!isChoose && filled !== null) removeSlot(i); }}
        style={{
          flex: '1 1 0', minWidth: 0,
          maxWidth: n >= 3 ? 'clamp(86px, 24vw, 120px)' : 'clamp(110px, 30vw, 160px)',
          height: n >= 3 ? 'min(86px, calc(var(--app-h, 100dvh) * 0.17))' : 'min(100px, calc(var(--app-h, 100dvh) * 0.19))',
          borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: hasContent ? accent[0] : 'rgba(255,255,255,.5)',
          border: hasContent ? 'none' : '3px dashed rgba(150,110,150,.4)',
          boxShadow: hasContent ? `0 6px 0 ${accent[1]}, 0 10px 16px rgba(140,90,130,.18)` : 'inset 0 2px 8px rgba(140,90,130,.08)',
          cursor: (!isChoose && filled !== null) ? 'pointer' : 'default',
          animation: shakeWrong ? 'shake .5s' : (hasContent ? 'pop-in .35s' : 'none'),
          transition: 'background .2s, box-shadow .2s',
        }}>
        {choosabBlank && filled === null
          ? <span className="display" style={{ fontSize: slotFs, fontWeight: 600, color: 'rgba(150,110,150,.5)' }}>?</span>
          : <Face big={slotFs} color={hasContent ? '#fff' : 'var(--ink)'}>{syllText}</Face>}
      </div>
    );
  };

  // ── tile (tap/drag tray) ──
  const renderTile = (t) => {
    const used = usedIds.includes(t.id);
    const isDragging = drag && drag.tileId === t.id;
    const common = {
      className: 'tile',
      style: {
        minWidth: 'clamp(64px, 16vw, 84px)', height: 74, padding: '0 16px', borderRadius: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--surface)',
        boxShadow: '0 6px 0 rgba(150,110,150,.22), 0 9px 16px rgba(140,90,130,.14)',
        opacity: used ? 0.25 : (isDragging ? 0.35 : 1),
        pointerEvents: used ? 'none' : 'auto',
        touchAction: 'none',
      },
    };
    if (mode === 'drag') {
      return (
        <div key={t.id} {...common}
          onPointerDown={(e) => { if (used || resolving || won) return; e.preventDefault(); setDrag({ tileId: t.id, syll: t.syll, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: false }); }}>
          <Face big={32} color="var(--primary)">{t.syll}</Face>
        </div>
      );
    }
    return (
      <div key={t.id} {...common} onClick={() => { if (!used) placeNextEmpty(t.id); }}>
        <Face big={32} color="var(--primary)">{t.syll}</Face>
      </div>
    );
  };

  return (
    <GameFrame onExit={onExit} index={progress.index} total={progress.total} won={won} musicOn={musicOn} onToggleMusic={onToggleMusic} onShowCards={onShowCards}>
      <WordPictureCard wordKey={wordKey} data={data} accent={accent} won={won} paddingTop={14} />

      {/* prompt */}
      <div style={{ textAlign: 'center', padding: '16px 28px 0' }}>
        <span className="display" style={{ fontSize: 19, fontWeight: 500, color: feedback === 'right' ? GOLD_DARK : 'var(--ink)' }}>{promptText}</span>
      </div>

      {/* slots */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', padding: '20px 22px 0' }}>
        {slots.map((_, i) => renderSlot(i))}
      </div>

      {/* spacer pushes tray to bottom */}
      <div style={{ flex: 1 }} />

      {/* tray / options */}
      <div style={{ padding: '0 22px calc(min(30px, var(--app-h, 100dvh) * 0.035) + var(--safe-bottom, 0px))' }}>
        {mode === 'choose' ? (
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {opts.current.map((s, i) => (
              <div key={i} className="tile" onClick={() => pickOption(s)} style={{
                minWidth: 96, height: 78, padding: '0 18px', borderRadius: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--surface)',
                boxShadow: '0 6px 0 rgba(150,110,150,.22), 0 9px 16px rgba(140,90,130,.14)',
                animation: wrongOpt === s ? 'shake .5s' : 'none',
              }}>
                <Face big={34} color="var(--primary)">{s}</Face>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            background: 'rgba(255,255,255,.4)', borderRadius: 28, padding: 'min(18px, calc(var(--app-h, 100dvh) * 0.02)) 16px',
            display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', minHeight: 'min(92px, calc(var(--app-h, 100dvh) * 0.2))',
            boxShadow: 'inset 0 2px 10px rgba(140,90,130,.06)',
          }}>
            {tiles.current.map(renderTile)}
          </div>
        )}
      </div>

      {/* floating drag clone */}
      {drag && drag.moved && (
        <div style={{
          position: 'fixed', left: drag.x, top: drag.y, zIndex: 9999, pointerEvents: 'none',
          transform: 'translate(-50%,-50%)',
        }}>
          <div style={{
            minWidth: 74, height: 74, padding: '0 16px', borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--surface)', boxShadow: '0 12px 22px rgba(140,90,130,.32)',
          }}>
            <Face big={32} color="var(--primary)">{drag.syll}</Face>
          </div>
        </div>
      )}

    </GameFrame>
  );
}

Object.assign(window, { SyllableGame, playWord, playSound, playSfx, starsForMistakes, useTimeoutBag, WinBurst, GameFrame, WordPictureCard });
