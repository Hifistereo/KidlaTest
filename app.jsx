// app.jsx — root: state machine, device scaling, theming, tweaks
const { useState: useS, useEffect: useE, useRef: useR } = React;
const { Welcome, GamesHub, ChapterSelect, CardGallery, FairyMap, RewardScreen, MilestonePopup } = window;
const { TiredToast, GoodnightScreen, SleepScreen, CardPeek, ParentDashboard } = window;
const { SyllableGame, ReadFindGame, FirstLetterGame, BlendGame, MixedWordsGame } = window;

// number of milestone character images in images/milestones/ (01.png … NN.png)
const MILESTONE_IMAGES = 16;
const STREAK_STEP = 10; // pop a celebration every N words in a row

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "Saulriets",
  "lessonMode": "Pieskaries (tap)",
  "mascot": true,
  "playMinutes": "15 min",
  "restMinutes": "45 min"
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

// ── session history (parent dashboard) ──
const HISTORY_KEY = 'burtu-feja-history';
const HISTORY_MAX = 90;
function loadHistory() {
  try { const r = localStorage.getItem(HISTORY_KEY); if (r) return JSON.parse(r); } catch (e) {}
  return [];
}
function saveHistory(entries) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(entries)); } catch (e) {}
}
function mergeSessionIntoHistory(history, log, durationMs, levelAtEnd) {
  const date = new Date().toISOString().slice(0, 10);
  const sessionStars = log.reduce((s, w) => s + w.stars, 0);
  const existing = history.find(e => e.date === date);
  if (existing) {
    existing.durationMs += durationMs;
    existing.words = existing.words.concat(log);
    existing.sessionStars += sessionStars;
    existing.levelAtEnd = levelAtEnd;
  } else {
    history.push({ date, durationMs, words: log, sessionStars, levelAtEnd });
  }
  if (history.length > HISTORY_MAX) history.splice(0, history.length - HISTORY_MAX);
  return history;
}

// ── background-music preference (on by default, survives reloads) ──
const MUSIC_KEY = 'burtu-feja-music';
function loadMusicOn() {
  try { return localStorage.getItem(MUSIC_KEY) !== 'off'; } catch (e) { return true; }
}

// ── companion card (the collectible the child picked as a buddy) ──
// Stores the chapter id; the image is derived so card-art reshuffles
// can't break it, and it only shows while that chapter stays unlocked.
const COMPANION_KEY = 'burtu-feja-companion';
function loadCompanion() {
  try {
    const v = parseInt(localStorage.getItem(COMPANION_KEY), 10);
    return Number.isFinite(v) ? v : null;
  } catch (e) { return null; }
}

// ── rest-timer session (survives reloads so the budget can't be bypassed) ──
// One "sitting" of play: { playedMs, lastTickTs, sleepUntil }. The budget
// resets when the fairy has finished her rest or when the app sat unused
// long enough to count as a fresh sitting.
const SESSION_KEY = 'burtu-feja-session';
const IDLE_RESET_MS = 30 * 60 * 1000;
const SAVED_SESSION = (() => {
  let s = null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) s = JSON.parse(raw);
  } catch (e) {}
  s = { playedMs: 0, lastTickTs: 0, sleepUntil: 0, ...(s || {}) };
  const now = Date.now();
  if (s.sleepUntil && now >= s.sleepUntil) { s.playedMs = 0; s.sleepUntil = 0; }
  else if (!s.sleepUntil && now - s.lastTickTs > IDLE_RESET_MS) s.playedMs = 0;
  return s;
})();

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
    bg.volume = 0.04; // background music at 4%; voice and letter clips stay at full volume
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

  // ── progress state (seeded from localStorage, else fresh start) ──
  const [screen, setScreen] = useS(SAVED_SESSION.sleepUntil > Date.now() ? 'sleep' : 'welcome');
  const screenRef = useR(screen);
  screenRef.current = screen;

  // react to the on/off choice: persist it and play/pause accordingly.
  // Music also rests while the fairy sleeps (calm goodnight/sleep screens).
  const asleepScreen = screen === 'goodnight' || screen === 'sleep';
  useE(() => {
    try { localStorage.setItem(MUSIC_KEY, musicOn ? 'on' : 'off'); } catch (e) {}
    const bg = bgRef.current;
    if (!bg) return;
    if (musicOn && !asleepScreen) { const p = bg.play(); if (p && p.catch) p.catch(() => {}); }
    else bg.pause();
  }, [musicOn, asleepScreen]);

  const toggleMusic = () => setMusicOn(v => !v);

  // ── rest timer: "Kikija nogurst" ──
  // Counts visible play time in 5 s ticks. At WARN a yawn toast appears; at
  // the limit restPending is set and the goodnight scene starts at the next
  // natural boundary (a menu screen) so a word is never interrupted.
  const PLAY_LIMIT_MS = (parseInt(t.playMinutes) || 15) * 60000;
  const WARN_MS = Math.max(60000, PLAY_LIMIT_MS - 3 * 60000);
  const COOLDOWN_MS = (parseInt(t.restMinutes) || 45) * 60000;

  const [session, setSession] = useS(SAVED_SESSION);
  const [restPending, setRestPending] = useS(false);
  const [tiredToast, setTiredToast] = useS(false);
  const [sessionWords, setSessionWords] = useS(0);
  const [sessionStars, setSessionStars] = useS(0);
  const warnRef = useR(false);
  const toastT = useR(null);

  useE(() => {
    const id = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      const scr = screenRef.current;
      if (scr === 'welcome' || scr === 'goodnight' || scr === 'sleep') return;
      setSession(s => ({ ...s, playedMs: s.playedMs + 5000, lastTickTs: Date.now() }));
    }, 5000);
    return () => { clearInterval(id); if (toastT.current) clearTimeout(toastT.current); };
  }, []);

  useE(() => {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (e) {}
  }, [session]);

  useE(() => {
    if (session.sleepUntil) return;
    if (session.playedMs >= PLAY_LIMIT_MS) { setRestPending(true); return; }
    if (session.playedMs >= WARN_MS && !warnRef.current) {
      warnRef.current = true;
      setTiredToast(true);
      toastT.current = setTimeout(() => setTiredToast(false), 6500);
    }
  }, [session.playedMs, session.sleepUntil, PLAY_LIMIT_MS, WARN_MS]);

  // once rest is pending, any landing on a menu screen turns into goodnight
  useE(() => {
    if (!restPending) return;
    if (screen === 'hub' || screen === 'chapters' || screen === 'map' || screen === 'cards') setScreen('goodnight');
  }, [restPending, screen]);

  function onGoodnight() {
    const log = sessionLogRef.current;
    if (log.length > 0 || session.playedMs > 0) {
      const updated = mergeSessionIntoHistory(loadHistory(), log, session.playedMs, currentId);
      saveHistory(updated);
    }
    sessionLogRef.current = [];
    setSession(s => ({ ...s, sleepUntil: Date.now() + COOLDOWN_MS }));
    setRestPending(false);
    setScreen('sleep');
  }

  function onWake() {
    sessionLogRef.current = [];
    setSession({ playedMs: 0, lastTickTs: Date.now(), sleepUntil: 0 });
    warnRef.current = false;
    setTiredToast(false);
    setRestPending(false);
    setSessionWords(0);
    setSessionStars(0);
    setScreen('hub');
  }

  // collected-cards overlay, openable from inside any game (🎴 in top bar)
  const [cardsOpen, setCardsOpen] = useS(false);
  const openCards = () => setCardsOpen(true);

  // ── word-streak milestones ──
  // Each game reports every word via onWordDone(perfect). A "streak" is the
  // run of first-try-correct words; every STREAK_STEP we flash a character
  // card for a moment, then it disappears. A mistake resets the run.
  const streakRef = useR(0);
  const sessionLogRef = useR([]); // per-word records for parent dashboard history
  const [milestone, setMilestone] = useS(null); // { n, src, exiting }
  const milestoneTimers = useR([]);
  const clearMilestoneTimers = () => { milestoneTimers.current.forEach(clearTimeout); milestoneTimers.current = []; };
  useE(() => () => clearMilestoneTimers(), []);

  function handleWordRecord(record) {
    sessionLogRef.current = [...sessionLogRef.current, record];
  }

  function handleWordDone(perfect) {
    setSessionWords(w => w + 1); // session recap for the goodnight screen
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

  useE(() => {
    // Keep --app-h matched to the *visible* viewport. On mobile the browser
    // toolbar makes the visual viewport shorter than window.innerHeight;
    // sizing to innerHeight pushed the bottom row (answer choices) below the
    // visible area. Every screen derives its height from this CSS var
    // (fallback: 100dvh), so the layout always stays on screen.
    const f = () => {
      const vv = window.visualViewport;
      const h = vv ? vv.height : window.innerHeight;
      document.documentElement.style.setProperty('--app-h', h + 'px');
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

  const [currentId, setCurrentId] = useS(SAVED ? SAVED.currentId : 1);
  const [levelStars, setLevelStars] = useS(SAVED ? SAVED.levelStars : {});
  const [totalStars, setTotalStars] = useS(SAVED ? SAVED.totalStars : 0);

  // chosen companion card — only valid while its chapter is still unlocked
  const [companionId, setCompanionId] = useS(loadCompanion);
  useE(() => {
    try {
      if (companionId == null) localStorage.removeItem(COMPANION_KEY);
      else localStorage.setItem(COMPANION_KEY, String(companionId));
    } catch (e) {}
  }, [companionId]);
  const companionCh = CHAPTERS.find(c => c.id === companionId);
  const companionSrc = (companionCh && companionCh.endId < currentId) ? companionCh.card : null;

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

  function onWordWin(stars, ms = 0) {
    ratingsRef.current = [...ratingsRef.current, stars];
    sessionLogRef.current = [...sessionLogRef.current, { word: queue[qPos], game: 'syllable', stars, ms }];
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
    setSessionWords(w => w + 1);
    setSessionStars(s => s + rating);
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
    setSessionStars(s => s + rating);
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
    setCompanionId(null); // the buddy card is locked again
    setActiveLevel(LEVELS[0]); setActiveChapter(CHAPTERS[0]);
    try { localStorage.removeItem(PROGRESS_KEY); } catch (e) {}
  }

  // words the player has already unlocked (current + completed), for free review
  const unlockedWords = LEVELS.filter(lv => lv.id <= currentId).map(lv => lv.word);

  // ── hub navigation ──
  const [gameNonce, setGameNonce] = useS(0); // forces a fresh round on each launch
  function launchGame(target) {
    if (target === 'map') { setScreen('chapters'); return; }
    if (target === 'cards') { setScreen('cards'); return; }
    setGameNonce(n => n + 1);
    setScreen(target);
  }
  function pickChapter(ch) { setActiveChapter(ch); setScreen('map'); }

  // accent colors for the hub games (match the GamesHub card hues)
  const GAME_ACCENT = { readfind: HUES.sky, firstletter: HUES.mint, blend: HUES.peach };

  // tweak screen-preview helpers
  function preview(target) {
    if (target === 'game') { setActiveLevel(LEVELS[0]); setQPos(0); ratingsRef.current = []; }
    if (target === 'reward') { setEarned(3); setNewTreasure(TREASURES[1]); setRewardReturn('hub'); }
    if (target === 'sleep') setSession(s => (s.sleepUntil > Date.now() ? s : { ...s, sleepUntil: Date.now() + COOLDOWN_MS }));
    setScreen(target);
  }

  const accent = HUES[activeLevel.hue];

  let body = null;
  if (screen === 'welcome') body = <Welcome onStart={() => setScreen('hub')} musicOn={musicOn} onToggleMusic={toggleMusic} companion={companionSrc} />;
  else if (screen === 'hub') body = <GamesHub totalStars={totalStars} onPick={launchGame} musicOn={musicOn} onToggleMusic={toggleMusic} companion={companionSrc} />;
  else if (screen === 'chapters') body = <ChapterSelect chapters={CHAPTERS} currentId={currentId} levelStars={levelStars} totalStars={totalStars} onPick={pickChapter} onBack={() => setScreen('hub')} musicOn={musicOn} onToggleMusic={toggleMusic} />;
  else if (screen === 'cards') body = <CardGallery chapters={CHAPTERS} currentId={currentId} onBack={() => setScreen('hub')} musicOn={musicOn} onToggleMusic={toggleMusic} companionId={companionId} onChooseCompanion={setCompanionId} />;
  else if (screen === 'map') body = <FairyMap chapter={activeChapter} currentId={currentId} levelStars={levelStars} totalStars={totalStars} onPlay={startLevel} onStartOver={startOver} onRandom={() => launchGame('mixed')} onBack={() => setScreen('chapters')} onShowCards={openCards} musicOn={musicOn} onToggleMusic={toggleMusic} companion={companionSrc} />;
  else if (screen === 'mixed') body = (
    <MixedWordsGame key={'mx' + gameNonce} mode={mode}
      onDone={onGameRoundDone} onExit={() => setScreen('hub')} onWordDone={handleWordDone}
      onWordRecord={handleWordRecord}
      onShowCards={openCards} musicOn={musicOn} onToggleMusic={toggleMusic} />
  );
  else if (screen === 'game') body = (
    <SyllableGame
      key={activeLevel.id + '-' + qPos + '-' + mode}
      wordKey={queue[qPos]} mode={mode} accent={accent}
      progress={{ index: qPos, total: queue.length }}
      onWin={onWordWin} onExit={() => setScreen('map')} onShowCards={openCards}
      musicOn={musicOn} onToggleMusic={toggleMusic} />
  );
  else if (screen === 'readfind') body = (
    <ReadFindGame key={'rf' + gameNonce} words={unlockedWords} accent={GAME_ACCENT.readfind}
      onDone={onGameRoundDone} onExit={() => setScreen('hub')} onWordDone={handleWordDone}
      onWordRecord={handleWordRecord}
      onShowCards={openCards} musicOn={musicOn} onToggleMusic={toggleMusic} />
  );
  else if (screen === 'firstletter') body = (
    <FirstLetterGame key={'fl' + gameNonce} words={unlockedWords} accent={GAME_ACCENT.firstletter}
      onDone={onGameRoundDone} onExit={() => setScreen('hub')} onWordDone={handleWordDone}
      onWordRecord={handleWordRecord}
      onShowCards={openCards} musicOn={musicOn} onToggleMusic={toggleMusic} />
  );
  else if (screen === 'blend') body = (
    <BlendGame key={'bl' + gameNonce} words={unlockedWords} accent={GAME_ACCENT.blend}
      onDone={onGameRoundDone} onExit={() => setScreen('hub')} onWordDone={handleWordDone}
      onWordRecord={handleWordRecord}
      onShowCards={openCards} musicOn={musicOn} onToggleMusic={toggleMusic} />
  );
  else if (screen === 'reward') body = <RewardScreen starsEarned={earned} totalStars={totalStars} newTreasure={newTreasure} newCard={newCard} onContinue={onRewardContinue} companion={companionSrc} />;
  else if (screen === 'goodnight') body = <GoodnightScreen sessionWords={sessionWords} sessionStars={sessionStars} onGoodnight={onGoodnight} />;
  else if (screen === 'sleep') body = <SleepScreen sleepUntil={session.sleepUntil} cooldownMs={COOLDOWN_MS} onWake={onWake} onShowCards={openCards} />;
  else if (screen === 'parentDash') body = (
    <ParentDashboard
      history={loadHistory()}
      currentId={currentId}
      levelStars={levelStars}
      totalStars={totalStars}
      onBack={() => setScreen('hub')}
    />
  );

  const cssVars = {
    '--bg1': pal.bg1, '--bg2': pal.bg2, '--surface': pal.surface, '--surface2': pal.surface2,
    '--ink': pal.ink, '--inkSoft': pal.inkSoft, '--primary': pal.primary, '--primary-dark': pal.primaryDark,
  };

  return (
    <div style={{
      ...cssVars, width: '100%', height: 'var(--app-h, 100dvh)', position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, var(--bg1) 0%, var(--bg2) 100%)',
    }}>
      <div style={{ position: 'absolute', inset: 0 }}>{body}</div>
      {cardsOpen && <CardPeek chapters={CHAPTERS} currentId={currentId} onClose={() => setCardsOpen(false)} />}
      {tiredToast && <TiredToast />}
      {milestone && <MilestonePopup n={milestone.n} src={milestone.src} exiting={milestone.exiting} />}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Nodarbības veids" />
        <TweakRadio label="Spēles stils" value={t.lessonMode}
          options={['Pieskaries (tap)', 'Aizvelc (drag)', 'Izvēlies (choose)']}
          onChange={(v) => setTweak('lessonMode', v)} />

        <TweakSection label="Noskaņa" />
        <TweakRadio label="Krāsas" value={t.theme}
          options={['Saulriets', 'Konfekte', 'Lavanda']}
          onChange={(v) => setTweak('theme', v)} />

        <TweakSection label="Atpūtas taimeris" />
        <TweakRadio label="Spēles laiks" value={t.playMinutes}
          options={['10 min', '15 min', '20 min']}
          onChange={(v) => setTweak('playMinutes', v)} />
        <TweakRadio label="Atpūtas laiks" value={t.restMinutes}
          options={['15 min', '30 min', '45 min', '60 min']}
          onChange={(v) => setTweak('restMinutes', v)} />
        <TweakButton label="Tests: feja žāvājas" onClick={() => setSession(s => ({ ...s, playedMs: Math.max(s.playedMs, WARN_MS) }))} />
        <TweakButton label="Tests: fejai miegs" onClick={() => setSession(s => ({ ...s, playedMs: Math.max(s.playedMs, PLAY_LIMIT_MS) }))} />

        <TweakSection label="Priekšskatīt ekrānu" />
        <TweakButton label="Sākums" onClick={() => preview('welcome')} />
        <TweakButton label="Spēles (izvēlne)" onClick={() => preview('hub')} />
        <TweakButton label="Karte" onClick={() => preview('map')} />
        <TweakButton label="Spēle (zilbes)" onClick={() => preview('game')} />
        <TweakButton label="Atrodi attēlu" onClick={() => { setGameNonce(n => n + 1); preview('readfind'); }} />
        <TweakButton label="Pirmais burts" onClick={() => { setGameNonce(n => n + 1); preview('firstletter'); }} />
        <TweakButton label="Skaņas" onClick={() => { setGameNonce(n => n + 1); preview('blend'); }} />
        <TweakButton label="Jaukti vārdi" onClick={() => { setGameNonce(n => n + 1); preview('mixed'); }} />
        <TweakButton label="Balva" onClick={() => preview('reward')} />
        <TweakButton label="Sērijas balva" onClick={() => { streakRef.current = STREAK_STEP - 1; handleWordDone(true); }} />
        <TweakButton label="Labunakts ekrāns" onClick={() => preview('goodnight')} />
        <TweakButton label="Miega ekrāns" onClick={() => preview('sleep')} />

        <TweakSection label="Vecāku skats" />
        <TweakButton label="Vecāku panelis" onClick={() => setScreen('parentDash')} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
