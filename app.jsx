// app.jsx — root: state machine, device scaling, theming, tweaks
const { useState: useS, useEffect: useE, useRef: useR } = React;
const { Welcome, GamesHub, ChapterSelect, CardGallery, FairyMap, RewardScreen, RandomWords, MilestonePopup } = window;
const { SyllableGame, ReadFindGame, FirstLetterGame, BlendGame } = window;

// number of milestone character images in images/milestones/ (01.png … NN.png)
const MILESTONE_IMAGES = 10;
const STREAK_STEP = 10; // pop a celebration every N words in a row

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "Saulriets",
  "lessonMode": "Pieskaries (tap)",
  "mascot": true
}/*EDITMODE-END*/;

const MODE_MAP = { 'Pieskaries (tap)': 'tap', 'Aizvelc (drag)': 'drag', 'Izvēlies (choose)': 'choose' };

// ── progress persistence (survives reloads) ──
const PROGRESS_KEY = 'burtu-feja-progress';
function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}
const SAVED = loadProgress();

// ── background-music preference (on by default, survives reloads) ──
const MUSIC_KEY = 'burtu-feja-music';
function loadMusicOn() {
  try { return localStorage.getItem(MUSIC_KEY) !== 'off'; } catch (e) { return true; }
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const pal = PALETTES[t.theme] || PALETTES['Saulriets'];
  const mode = MODE_MAP[t.lessonMode] || 'tap';

  // ── looping background music (low volume, whole session) ──
  // Toggleable + persisted. Browsers block autoplay until a user gesture, so we
  // kick it off on the first tap (if music is on) and then let the musicOn
  // effect below start/stop it on demand.
  const [musicOn, setMusicOn] = useS(loadMusicOn);
  const musicOnRef = useR(musicOn);
  musicOnRef.current = musicOn;
  const bgRef = useR(null);

  useE(() => {
    const bg = new Audio('audio/background5min.mp3');
    bg.loop = true;
    bg.volume = 0.03; // quiet under the spoken words (was 0.12)
    bgRef.current = bg;
    const start = () => {
      window.removeEventListener('pointerdown', start);
      if (musicOnRef.current) { const p = bg.play(); if (p && p.catch) p.catch(() => {}); }
    };
    window.addEventListener('pointerdown', start);
    return () => {
      window.removeEventListener('pointerdown', start);
      bg.pause();
    };
  }, []);

  // react to the on/off choice: persist it and play/pause accordingly.
  useE(() => {
    try { localStorage.setItem(MUSIC_KEY, musicOn ? 'on' : 'off'); } catch (e) {}
    const bg = bgRef.current;
    if (!bg) return;
    if (musicOn) { const p = bg.play(); if (p && p.catch) p.catch(() => {}); }
    else bg.pause();
  }, [musicOn]);

  const toggleMusic = () => setMusicOn(v => !v);

  // ── word-streak milestones ──
  // Each game reports every word via onWordDone(perfect). A "streak" is the
  // run of first-try-correct words; every STREAK_STEP we flash a character
  // card for a moment, then it disappears. A mistake resets the run.
  const streakRef = useR(0);
  const [milestone, setMilestone] = useS(null); // { n, src, exiting }
  const milestoneTimers = useR([]);
  const clearMilestoneTimers = () => { milestoneTimers.current.forEach(clearTimeout); milestoneTimers.current = []; };
  useE(() => () => clearMilestoneTimers(), []);

  function handleWordDone(perfect) {
    if (!perfect) { streakRef.current = 0; return; }
    const s = streakRef.current + 1;
    streakRef.current = s;
    if (s % STREAK_STEP === 0) {
      const idx = ((s / STREAK_STEP - 1) % MILESTONE_IMAGES) + 1; // 1..N, cycles
      const src = `images/milestones/${String(idx).padStart(2, '0')}.png`;
      setMilestone({ n: s, src, exiting: false });
      if (window.playSfx) window.playSfx('win', 0.7);
      clearMilestoneTimers();
      // hold ~4.2s, then play the fly-away exit (~0.55s), then remove
      milestoneTimers.current.push(setTimeout(() => setMilestone(m => (m ? { ...m, exiting: true } : m)), 4200));
      milestoneTimers.current.push(setTimeout(() => setMilestone(null), 4800));
    }
  }

  const [scale, setScale] = useS(1);
  const [vpH, setVpH] = useS('100vh');
  useE(() => {
    // Scale the 402×874 canvas to fit the *visible* viewport (no frame).
    // On mobile the browser toolbar makes the visual viewport shorter than
    // window.innerHeight; sizing to innerHeight pushed the bottom row (answer
    // choices) below the visible area. Using visualViewport.height — and
    // matching the canvas container height to it — keeps everything on screen.
    const f = () => {
      const vv = window.visualViewport;
      const h = vv ? vv.height : window.innerHeight;
      const w = vv ? vv.width : window.innerWidth;
      setScale(Math.min(h / 874, w / 402));
      setVpH(h + 'px');
    };
    f();
    window.addEventListener('resize', f);
    window.addEventListener('orientationchange', f);
    const vv = window.visualViewport;
    if (vv) { vv.addEventListener('resize', f); vv.addEventListener('scroll', f); }
    return () => {
      window.removeEventListener('resize', f);
      window.removeEventListener('orientationchange', f);
      if (vv) { vv.removeEventListener('resize', f); vv.removeEventListener('scroll', f); }
    };
  }, []);

  // ── progress state (seeded from localStorage, else fresh start) ──
  const [screen, setScreen] = useS('welcome');
  const [currentId, setCurrentId] = useS(SAVED ? SAVED.currentId : 1);
  const [levelStars, setLevelStars] = useS(SAVED ? SAVED.levelStars : {});
  const [totalStars, setTotalStars] = useS(SAVED ? SAVED.totalStars : 0);

  // persist whenever progress changes
  useE(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify({ currentId, levelStars, totalStars }));
    } catch (e) {}
  }, [currentId, levelStars, totalStars]);

  // ── active lesson ──
  const [activeLevel, setActiveLevel] = useS(LEVELS[0]);
  const [activeChapter, setActiveChapter] = useS(() =>
    CHAPTERS.find(c => (SAVED ? SAVED.currentId : 1) <= c.endId) || CHAPTERS[CHAPTERS.length - 1]);
  const [qPos, setQPos] = useS(0);
  const ratingsRef = useR([]);
  const [earned, setEarned] = useS(3);
  const [newTreasure, setNewTreasure] = useS(null);
  const [newCard, setNewCard] = useS(null); // collectible card unlocked on chapter completion
  const [rewardReturn, setRewardReturn] = useS('map'); // where "Turpināt" goes after a reward

  // one word per level
  const queue = [activeLevel.word];

  function startLevel(lv) {
    setActiveLevel(lv); setQPos(0); ratingsRef.current = []; setScreen('game');
  }

  function onWordWin(stars) {
    ratingsRef.current = [...ratingsRef.current, stars];
    if (qPos < queue.length - 1) { setQPos(qPos + 1); }
    else { finishLesson(); }
  }

  function finishLesson() {
    const rs = ratingsRef.current;
    const rating = Math.max(1, Math.round(rs.reduce((a, b) => a + b, 0) / rs.length));
    const prevBest = levelStars[activeLevel.id] || 0;
    const firstTime = activeLevel.id >= currentId; // only award currency for new progress
    const old = totalStars;
    const nt = firstTime ? old + rating : old;
    const crossed = TREASURES.filter(tr => tr.at > old && tr.at <= nt);
    // completing a chapter's last level (as new progress) unlocks its card
    const ch = CHAPTERS.find(c => activeLevel.id >= c.startId && activeLevel.id <= c.endId);
    const chapterDone = ch && activeLevel.id === ch.endId && firstTime;
    setEarned(rating);
    setNewTreasure(crossed.length ? crossed[crossed.length - 1] : null);
    setNewCard(chapterDone ? ch.card : null);
    setLevelStars(p => ({ ...p, [activeLevel.id]: Math.max(prevBest, rating) }));
    setTotalStars(nt);
    setRewardReturn('map');
    setScreen('reward');
  }

  // hub games: award currency + treasures, but never touch the journey's
  // currentId / levelStars. "Turpināt" returns to the hub.
  function onGameRoundDone(rating) {
    const old = totalStars;
    const nt = old + rating;
    const crossed = TREASURES.filter(tr => tr.at > old && tr.at <= nt);
    setEarned(rating);
    setNewTreasure(crossed.length ? crossed[crossed.length - 1] : null);
    setNewCard(null); // hub games never unlock journey cards
    setTotalStars(nt);
    setRewardReturn('hub');
    setScreen('reward');
  }

  function onRewardContinue() {
    if (rewardReturn === 'hub') { setScreen('hub'); return; }
    if (activeLevel.id === currentId && currentId < LEVELS.length) setCurrentId(currentId + 1);
    // finishing a chapter sends the child back to the chapter list (next one unlocked)
    if (newCard) { setNewCard(null); setScreen('chapters'); return; }
    setScreen('map');
  }

  // wipe all progress and begin again from level 1
  function startOver() {
    setCurrentId(1); setLevelStars({}); setTotalStars(0);
    setActiveLevel(LEVELS[0]); setActiveChapter(CHAPTERS[0]);
    try { localStorage.removeItem(PROGRESS_KEY); } catch (e) {}
  }

  // words the player has already unlocked (current + completed), for free review
  const unlockedWords = LEVELS.filter(lv => lv.id <= currentId).map(lv => lv.word);

  // ── hub navigation ──
  const [randomReturn, setRandomReturn] = useS('hub');
  const [gameNonce, setGameNonce] = useS(0); // forces a fresh round on each launch
  function launchGame(target) {
    if (target === 'map') { setScreen('chapters'); return; }
    if (target === 'cards') { setScreen('cards'); return; }
    setGameNonce(n => n + 1);
    setScreen(target);
  }
  function pickChapter(ch) { setActiveChapter(ch); setScreen('map'); }
  function launchRandom(from) { setRandomReturn(from); setScreen('random'); }

  // accent colors for the hub games (match the GamesHub card hues)
  const GAME_ACCENT = { readfind: HUES.sky, firstletter: HUES.mint, blend: HUES.peach };

  // tweak screen-preview helpers
  function preview(target) {
    if (target === 'game') { setActiveLevel(LEVELS[0]); setQPos(0); ratingsRef.current = []; }
    if (target === 'reward') { setEarned(3); setNewTreasure(TREASURES[1]); setRewardReturn('hub'); }
    setScreen(target);
  }

  const accent = HUES[activeLevel.hue];

  let body = null;
  if (screen === 'welcome') body = <Welcome onStart={() => setScreen('hub')} musicOn={musicOn} onToggleMusic={toggleMusic} />;
  else if (screen === 'hub') body = <GamesHub totalStars={totalStars} onPick={launchGame} onRandom={() => launchRandom('hub')} musicOn={musicOn} onToggleMusic={toggleMusic} />;
  else if (screen === 'chapters') body = <ChapterSelect chapters={CHAPTERS} currentId={currentId} levelStars={levelStars} totalStars={totalStars} onPick={pickChapter} onBack={() => setScreen('hub')} musicOn={musicOn} onToggleMusic={toggleMusic} />;
  else if (screen === 'cards') body = <CardGallery chapters={CHAPTERS} currentId={currentId} onBack={() => setScreen('hub')} musicOn={musicOn} onToggleMusic={toggleMusic} />;
  else if (screen === 'map') body = <FairyMap chapter={activeChapter} currentId={currentId} levelStars={levelStars} totalStars={totalStars} onPlay={startLevel} onStartOver={startOver} onRandom={() => launchRandom('map')} onBack={() => setScreen('chapters')} musicOn={musicOn} onToggleMusic={toggleMusic} />;
  else if (screen === 'random') body = <RandomWords words={unlockedWords} onExit={() => setScreen(randomReturn)} musicOn={musicOn} onToggleMusic={toggleMusic} />;
  else if (screen === 'game') body = (
    <SyllableGame
      key={activeLevel.id + '-' + qPos + '-' + mode}
      wordKey={queue[qPos]} mode={mode} scale={scale} accent={accent}
      progress={{ index: qPos, total: queue.length }}
      onWin={onWordWin} onExit={() => setScreen('map')}
      musicOn={musicOn} onToggleMusic={toggleMusic} />
  );
  else if (screen === 'readfind') body = (
    <ReadFindGame key={'rf' + gameNonce} words={unlockedWords} accent={GAME_ACCENT.readfind}
      onDone={onGameRoundDone} onExit={() => setScreen('hub')} onWordDone={handleWordDone}
      musicOn={musicOn} onToggleMusic={toggleMusic} />
  );
  else if (screen === 'firstletter') body = (
    <FirstLetterGame key={'fl' + gameNonce} words={unlockedWords} accent={GAME_ACCENT.firstletter}
      onDone={onGameRoundDone} onExit={() => setScreen('hub')} onWordDone={handleWordDone}
      musicOn={musicOn} onToggleMusic={toggleMusic} />
  );
  else if (screen === 'blend') body = (
    <BlendGame key={'bl' + gameNonce} words={unlockedWords} accent={GAME_ACCENT.blend}
      onDone={onGameRoundDone} onExit={() => setScreen('hub')} onWordDone={handleWordDone}
      musicOn={musicOn} onToggleMusic={toggleMusic} />
  );
  else if (screen === 'reward') body = <RewardScreen starsEarned={earned} totalStars={totalStars} newTreasure={newTreasure} newCard={newCard} onContinue={onRewardContinue} />;

  const cssVars = {
    '--bg1': pal.bg1, '--bg2': pal.bg2, '--surface': pal.surface, '--surface2': pal.surface2,
    '--ink': pal.ink, '--inkSoft': pal.inkSoft, '--primary': pal.primary, '--primary-dark': pal.primaryDark,
  };

  return (
    <div style={{
      ...cssVars, width: '100vw', height: vpH, overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(180deg, var(--bg1) 0%, var(--bg2) 100%)',
    }}>
      {/* Full-bleed app canvas — the 402×874 design scaled up to fill the
          screen edge-to-edge (no device frame). */}
      <div style={{
        width: 402, height: 874, position: 'relative', overflow: 'hidden',
        transform: `scale(${scale})`, transformOrigin: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0 }}>{body}</div>
        {milestone && <MilestonePopup n={milestone.n} src={milestone.src} exiting={milestone.exiting} />}
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Nodarbības veids" />
        <TweakRadio label="Spēles stils" value={t.lessonMode}
          options={['Pieskaries (tap)', 'Aizvelc (drag)', 'Izvēlies (choose)']}
          onChange={(v) => setTweak('lessonMode', v)} />

        <TweakSection label="Noskaņa" />
        <TweakRadio label="Krāsas" value={t.theme}
          options={['Saulriets', 'Konfekte', 'Lavanda']}
          onChange={(v) => setTweak('theme', v)} />

        <TweakSection label="Priekšskatīt ekrānu" />
        <TweakButton label="Sākums" onClick={() => preview('welcome')} />
        <TweakButton label="Spēles (izvēlne)" onClick={() => preview('hub')} />
        <TweakButton label="Karte" onClick={() => preview('map')} />
        <TweakButton label="Spēle (zilbes)" onClick={() => preview('game')} />
        <TweakButton label="Atrodi attēlu" onClick={() => { setGameNonce(n => n + 1); preview('readfind'); }} />
        <TweakButton label="Pirmais burts" onClick={() => { setGameNonce(n => n + 1); preview('firstletter'); }} />
        <TweakButton label="Skaņas" onClick={() => { setGameNonce(n => n + 1); preview('blend'); }} />
        <TweakButton label="Balva" onClick={() => preview('reward')} />
        <TweakButton label="Sērijas balva" onClick={() => { streakRef.current = STREAK_STEP - 1; handleWordDone(true); }} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
