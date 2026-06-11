// games.jsx — three phonics/reading games for the hub:
//   ReadFindGame  (Atrodi attēlu)  — decodable reading: read word → pick picture
//   FirstLetterGame (Pirmais burts) — phonemic awareness: pick the starting letter
//   BlendGame     (Skaņas)         — sound blending: hear sounds → pick the word
// Each runs a 6-word round over the child's unlocked words, then calls onDone(rating).
// Reuses window globals: WORDS, HUES, BLEND_WORDS, shuffle, pickWordDistractors,
// pickLetterDistractors, SparkleField, playWord, playSound, playSfx.
const { useState: useStateP, useEffect: useEffectP, useRef: useRefP } = React;

const ROUND_SIZE = 6;
const starsForMistakes = (m) => (m === 0 ? 3 : m === 1 ? 2 : 1);

// build a shuffled round of up to `size` words from `pool` (with fallback)
function buildRound(pool, size) {
  const base = (pool && pool.length) ? pool : Object.keys(WORDS);
  const list = shuffle(base).slice(0, Math.min(size, base.length));
  return list.length ? list : [Object.keys(WORDS)[0]];
}

// celebratory star burst, same as SyllableGame's win overlay
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

// shared shell: top bar (back + progress dots), sparkles, win burst
function GameFrame({ onExit, index, total, won, children }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <SparkleField count={7} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '64px 20px 0' }}>
        <button onClick={onExit} className="kid-btn ghost" style={{ width: 46, height: 46, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>‹</button>
        <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              width: i === index ? 30 : 12, height: 12, borderRadius: 999,
              background: i < index ? GOLD : i === index ? 'var(--primary)' : 'rgba(150,110,150,.28)',
              transition: 'all .3s',
            }} />
          ))}
        </div>
        <div style={{ width: 46 }} />
      </div>
      {children}
      {won && <WinBurst />}
    </div>
  );
}

// a single picture-choice tile
function PicTile({ wordKey, accent, wrong, dim, onPick }) {
  const data = WORDS[wordKey] || {};
  return (
    <div className="tile" onClick={onPick} style={{
      aspectRatio: '1 / 1', borderRadius: 28, background: 'var(--surface)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 8px 0 ${accent[1]}, 0 12px 20px rgba(140,90,130,.16)`,
      animation: wrong ? 'shake .5s' : 'pop-in .35s',
      opacity: dim ? 0.4 : 1, transition: 'opacity .2s',
    }}>
      <span style={{ fontSize: 64, lineHeight: 1, filter: 'drop-shadow(0 3px 4px rgba(140,90,130,.22))' }}>{data.pic}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// shared round controller — handles word progression + star tally
// ─────────────────────────────────────────────────────────────
function useRound(pool, onDone) {
  const round = useRefP(null);
  if (!round.current) round.current = buildRound(pool, ROUND_SIZE);
  const list = round.current;
  const [idx, setIdx] = useStateP(0);
  const ratings = useRefP([]);
  const advance = (stars) => {
    ratings.current = [...ratings.current, stars];
    if (idx < list.length - 1) setIdx(idx + 1);
    else {
      const rs = ratings.current;
      onDone(Math.max(1, Math.round(rs.reduce((a, b) => a + b, 0) / rs.length)));
    }
  };
  return { word: list[idx], idx, total: list.length, advance };
}

// ─────────────────────────────────────────────────────────────
// ATRODI ATTĒLU — read the written word, then tap the matching picture.
// Picture options revealed only as choices; audio plays AFTER the pick.
// ─────────────────────────────────────────────────────────────
function ReadFindGame({ words, accent, onDone, onExit, onWordDone }) {
  const { word, idx, total, advance } = useRound(words, onDone);

  const opts = useRefP(null);
  if (!opts.current || opts.current._w !== word) {
    const o = shuffle([word, ...pickWordDistractors(word, 3)]);
    o._w = word;
    opts.current = o;
  }

  const [won, setWon] = useStateP(false);
  const [mistakes, setMistakes] = useStateP(0);
  const [wrongKey, setWrongKey] = useStateP(null);
  useEffectP(() => { setWon(false); setMistakes(0); setWrongKey(null); }, [word]);

  function pick(key) {
    if (won) return;
    if (key === word) {
      setWon(true);
      playSfx('win');
      playWord(word);
      const m = mistakes;
      if (onWordDone) onWordDone(m === 0);
      setTimeout(() => advance(starsForMistakes(m)), 1150);
    } else {
      setMistakes(m => m + 1);
      setWrongKey(key);
      setTimeout(() => setWrongKey(null), 600);
    }
  }

  return (
    <GameFrame onExit={onExit} index={idx} total={total} won={won}>
      <div style={{ textAlign: 'center', padding: '18px 28px 0' }}>
        <span className="display" style={{ fontSize: 18, fontWeight: 500, color: 'var(--ink)' }}>
          {won ? 'Lieliski! 🎉' : 'Izlasi vārdu un atrodi attēlu!'}
        </span>
      </div>

      {/* the written word — read first, no picture, no pre-audio */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '18px 22px 0' }}>
        <div style={{
          background: 'var(--surface)', borderRadius: 28, padding: '18px 34px',
          boxShadow: '0 12px 26px rgba(140,90,130,.16)',
        }}>
          <span className="display" style={{ fontSize: 48, fontWeight: 600, letterSpacing: 2, color: 'var(--primary)' }}>{word}</span>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* picture choices */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: '0 26px 36px' }}>
        {opts.current.map((k, i) => (
          <PicTile key={i} wordKey={k} accent={accent}
            wrong={wrongKey === k} dim={won && k !== word} onPick={() => pick(k)} />
        ))}
      </div>
    </GameFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// PIRMAIS BURTS — picture shown (and spoken); pick the starting letter.
// ─────────────────────────────────────────────────────────────
function FirstLetterGame({ words, accent, onDone, onExit, onWordDone }) {
  const { word, idx, total, advance } = useRound(words, onDone);
  const data = WORDS[word] || {};
  const first = Array.from(word)[0];

  const opts = useRefP(null);
  if (!opts.current || opts.current._w !== word) {
    const o = shuffle([first, ...pickLetterDistractors(first, 2)]);
    o._w = word;
    opts.current = o;
  }

  const [won, setWon] = useStateP(false);
  const [mistakes, setMistakes] = useStateP(0);
  const [wrong, setWrong] = useStateP(null);
  useEffectP(() => { setWon(false); setMistakes(0); setWrong(null); playWord(word); }, [word]);

  function pick(letter) {
    if (won) return;
    if (letter === first) {
      setWon(true);
      playSfx('win');
      playSound(first);
      setTimeout(() => playWord(word), 500);
      const m = mistakes;
      if (onWordDone) onWordDone(m === 0);
      setTimeout(() => advance(starsForMistakes(m)), 1150);
    } else {
      setMistakes(m => m + 1);
      setWrong(letter);
      setTimeout(() => setWrong(null), 600);
    }
  }

  return (
    <GameFrame onExit={onExit} index={idx} total={total} won={won}>
      {/* picture card (tap to hear) */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 18 }}>
        <div onClick={() => playWord(word)} style={{
          width: 156, height: 156, borderRadius: 40, background: 'var(--surface)',
          boxShadow: '0 14px 30px rgba(140,90,130,.18)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer',
          animation: won ? 'bob .6s ease-in-out infinite' : 'floaty-slow 4s ease-in-out infinite',
        }}>
          <div style={{ position: 'absolute', inset: 14, borderRadius: 30, background: `radial-gradient(circle at 50% 40%, ${accent[0]} 0%, transparent 72%)`, opacity: .5 }} />
          <div style={{ fontSize: 86, lineHeight: 1, position: 'relative', filter: 'drop-shadow(0 4px 6px rgba(140,90,130,.25))' }}>{data.pic}</div>
          <div style={{ position: 'absolute', bottom: 10, right: 10, width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: '0 3px 8px rgba(140,90,130,.3)' }}>🔊</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '16px 28px 0' }}>
        <span className="display" style={{ fontSize: 19, fontWeight: 500, color: 'var(--ink)' }}>
          {won ? 'Lieliski! 🎉' : 'Ar kuru burtu sākas vārds?'}
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* letter choices */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', padding: '0 22px 40px' }}>
        {opts.current.map((l, i) => (
          <div key={i} className="tile" onClick={() => pick(l)} style={{
            width: 92, height: 92, borderRadius: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: (won && l === first) ? accent[0] : 'var(--surface)',
            boxShadow: (won && l === first) ? `0 6px 0 ${accent[1]}` : '0 6px 0 rgba(150,110,150,.22), 0 9px 16px rgba(140,90,130,.14)',
            animation: wrong === l ? 'shake .5s' : 'none',
            opacity: (won && l !== first) ? 0.4 : 1, transition: 'opacity .2s, background .2s',
          }}>
            <span className="display" style={{ fontSize: 46, fontWeight: 600, color: (won && l === first) ? '#fff' : 'var(--primary)' }}>{l}</span>
          </div>
        ))}
      </div>
    </GameFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// SKAŅAS — hear each sound (tap to replay), then pick the matching picture.
// Uses the curated BLEND_WORDS subset so blending is clean.
// ─────────────────────────────────────────────────────────────
function BlendGame({ words, accent, onDone, onExit, onWordDone }) {
  // restrict the pool to blend-friendly words the child has unlocked
  const pool = useRefP(null);
  if (!pool.current) {
    const unlocked = (words || []).filter(w => BLEND_WORDS[w]);
    pool.current = unlocked.length ? unlocked : Object.keys(BLEND_WORDS);
  }
  const { word, idx, total, advance } = useRound(pool.current, onDone);
  const sounds = BLEND_WORDS[word] || Array.from(word);

  const opts = useRefP(null);
  if (!opts.current || opts.current._w !== word) {
    const o = shuffle([word, ...pickWordDistractors(word, 2)]);
    o._w = word;
    opts.current = o;
  }

  const [won, setWon] = useStateP(false);
  const [mistakes, setMistakes] = useStateP(0);
  const [wrongKey, setWrongKey] = useStateP(null);
  const [lit, setLit] = useStateP(-1); // which sound button is highlighted during playback

  // auto-play the sound sequence whenever the word changes
  useEffectP(() => {
    setWon(false); setMistakes(0); setWrongKey(null); setLit(-1);
    const timers = [];
    sounds.forEach((s, i) => {
      timers.push(setTimeout(() => { setLit(i); playSound(s); }, 350 + i * 700));
    });
    timers.push(setTimeout(() => setLit(-1), 350 + sounds.length * 700));
    return () => timers.forEach(clearTimeout);
  }, [word]);

  function pick(key) {
    if (won) return;
    if (key === word) {
      setWon(true);
      playSfx('win');
      playWord(word);
      const m = mistakes;
      if (onWordDone) onWordDone(m === 0);
      setTimeout(() => advance(starsForMistakes(m)), 1150);
    } else {
      setMistakes(m => m + 1);
      setWrongKey(key);
      setTimeout(() => setWrongKey(null), 600);
    }
  }

  function replayAll() {
    if (won) return;
    sounds.forEach((s, i) => setTimeout(() => { setLit(i); playSound(s); }, i * 700));
    setTimeout(() => setLit(-1), sounds.length * 700);
  }

  return (
    <GameFrame onExit={onExit} index={idx} total={total} won={won}>
      <div style={{ textAlign: 'center', padding: '18px 28px 0' }}>
        <span className="display" style={{ fontSize: 19, fontWeight: 500, color: 'var(--ink)' }}>
          {won ? 'Lieliski! 🎉' : 'Klausies skaņas — kāds vārds sanāk?'}
        </span>
      </div>

      {/* sound buttons (tap any to replay that sound) */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', padding: '22px 22px 0' }}>
        {sounds.map((s, i) => (
          <div key={i} className="tile" onClick={() => { setLit(i); playSound(s); setTimeout(() => setLit(-1), 450); }} style={{
            minWidth: 60, height: 72, padding: '0 6px', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: lit === i ? accent[0] : 'var(--surface)',
            boxShadow: lit === i ? `0 6px 0 ${accent[1]}` : '0 6px 0 rgba(150,110,150,.22), 0 9px 16px rgba(140,90,130,.14)',
            transform: lit === i ? 'translateY(-3px)' : 'none', transition: 'all .15s',
          }}>
            <span className="display" style={{ fontSize: 34, fontWeight: 600, color: lit === i ? '#fff' : 'var(--primary)' }}>{s}</span>
          </div>
        ))}
      </div>

      {/* replay-all button */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 16 }}>
        <button onClick={replayAll} className="kid-btn ghost" style={{ padding: '10px 22px', fontSize: 17, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          🔊 Vēlreiz
        </button>
      </div>

      <div style={{ flex: 1 }} />

      {/* picture choices */}
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', padding: '0 22px 38px' }}>
        {opts.current.map((k, i) => (
          <div key={i} style={{ flex: '1 1 0', maxWidth: 130 }}>
            <PicTile wordKey={k} accent={accent} wrong={wrongKey === k} dim={won && k !== word} onPick={() => pick(k)} />
          </div>
        ))}
      </div>
    </GameFrame>
  );
}

Object.assign(window, { ReadFindGame, FirstLetterGame, BlendGame, GameFrame });
