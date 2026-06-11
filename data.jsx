// data.jsx — palettes, Latvian word data, levels, shared decorations
const { useState, useEffect, useRef } = React;

// ─────────────────────────────────────────────────────────────
// Color themes (warm cozy pastels). Applied as CSS vars on the screen root.
// ─────────────────────────────────────────────────────────────
const PALETTES = {
  'Saulriets': { // sunset peach + rose (default, warmest)
    bg1: 'oklch(0.95 0.045 45)', bg2: 'oklch(0.91 0.05 345)',
    surface: 'oklch(0.995 0.008 80)', surface2: 'oklch(0.97 0.02 60)',
    ink: 'oklch(0.37 0.06 350)', inkSoft: 'oklch(0.55 0.045 350)',
    primary: 'oklch(0.71 0.16 355)', primaryDark: 'oklch(0.60 0.16 355)',
  },
  'Konfekte': { // candy bright sky + bubblegum
    bg1: 'oklch(0.93 0.06 215)', bg2: 'oklch(0.90 0.075 335)',
    surface: 'oklch(0.995 0.008 80)', surface2: 'oklch(0.96 0.025 215)',
    ink: 'oklch(0.36 0.07 300)', inkSoft: 'oklch(0.54 0.05 300)',
    primary: 'oklch(0.70 0.18 25)', primaryDark: 'oklch(0.59 0.18 25)',
  },
  'Lavanda': { // soft lavender + lilac
    bg1: 'oklch(0.93 0.05 300)', bg2: 'oklch(0.91 0.045 270)',
    surface: 'oklch(0.995 0.006 300)', surface2: 'oklch(0.96 0.02 300)',
    ink: 'oklch(0.36 0.06 300)', inkSoft: 'oklch(0.54 0.045 300)',
    primary: 'oklch(0.64 0.15 300)', primaryDark: 'oklch(0.54 0.15 300)',
  },
};

// node accent colors (constant rainbow across themes) — [fill, deep]
const HUES = {
  rose:  ['oklch(0.82 0.12 12)',  'oklch(0.70 0.13 12)'],
  peach: ['oklch(0.85 0.11 60)',  'oklch(0.74 0.13 55)'],
  gold:  ['oklch(0.87 0.12 92)',  'oklch(0.77 0.13 88)'],
  mint:  ['oklch(0.84 0.10 160)', 'oklch(0.72 0.12 160)'],
  sky:   ['oklch(0.83 0.10 230)', 'oklch(0.71 0.12 230)'],
  lilac: ['oklch(0.82 0.12 300)', 'oklch(0.70 0.13 300)'],
};
const GOLD = 'oklch(0.84 0.15 88)';
const GOLD_DARK = 'oklch(0.73 0.15 80)';

// ─────────────────────────────────────────────────────────────
// Latvian words — syllable splits, picture, meaning, audio slug.
// Fairy / animal / nature world. `slug` = ASCII filename for audio/<slug>.mp3
// (diacritics folded, unique). Ordered easy → hard (2-syllable then 3-syllable).
// ─────────────────────────────────────────────────────────────
const WORDS = {
  // ── 2-syllable ──
  'ROZE':       { syll: ['RO', 'ZE'],          pic: '🌹', en: 'rose',      slug: 'roze' },
  'SAULE':      { syll: ['SAU', 'LE'],         pic: '☀️', en: 'sun',       slug: 'saule' },
  'MĀJA':       { syll: ['MĀ', 'JA'],          pic: '🏠', en: 'house',     slug: 'maja' },
  'FEJA':       { syll: ['FE', 'JA'],          pic: '🧚', en: 'fairy',     slug: 'feja' },
  'KAĶIS':      { syll: ['KA', 'ĶIS'],         pic: '🐱', en: 'cat',       slug: 'kakis' },
  'ZAĶIS':      { syll: ['ZA', 'ĶIS'],         pic: '🐰', en: 'hare',      slug: 'zakis' },
  'PUĶE':       { syll: ['PU', 'ĶE'],          pic: '🌸', en: 'flower',    slug: 'puke' },
  'LĀCIS':      { syll: ['LĀ', 'CIS'],         pic: '🐻', en: 'bear',      slug: 'lacis' },
  'MĒNESS':     { syll: ['MĒ', 'NESS'],        pic: '🌙', en: 'moon',      slug: 'meness' },
  'CŪKA':       { syll: ['CŪ', 'KA'],          pic: '🐷', en: 'pig',       slug: 'cuka' },
  'AITA':       { syll: ['AI', 'TA'],          pic: '🐑', en: 'sheep',     slug: 'aita' },
  'VISTA':      { syll: ['VIS', 'TA'],         pic: '🐔', en: 'hen',       slug: 'vista' },
  'PĪLE':       { syll: ['PĪ', 'LE'],          pic: '🦆', en: 'duck',      slug: 'pile' },
  'KAZA':       { syll: ['KA', 'ZA'],          pic: '🐐', en: 'goat',      slug: 'kaza' },
  'LAPSA':      { syll: ['LAP', 'SA'],         pic: '🦊', en: 'fox',       slug: 'lapsa' },
  'PELE':       { syll: ['PE', 'LE'],          pic: '🐭', en: 'mouse',     slug: 'pele' },
  'BITE':       { syll: ['BI', 'TE'],          pic: '🐝', en: 'bee',       slug: 'bite' },
  'VARDE':      { syll: ['VAR', 'DE'],         pic: '🐸', en: 'frog',      slug: 'varde' },
  'LAUVA':      { syll: ['LAU', 'VA'],         pic: '🦁', en: 'lion',      slug: 'lauva' },
  'VALIS':      { syll: ['VA', 'LIS'],         pic: '🐳', en: 'whale',     slug: 'valis' },
  'KRABIS':     { syll: ['KRA', 'BIS'],        pic: '🦀', en: 'crab',      slug: 'krabis' },
  'EZIS':       { syll: ['E', 'ZIS'],          pic: '🦔', en: 'hedgehog',  slug: 'ezis' },
  'GAILIS':     { syll: ['GAI', 'LIS'],        pic: '🐓', en: 'rooster',   slug: 'gailis' },
  'BRIEDIS':    { syll: ['BRIE', 'DIS'],       pic: '🦌', en: 'deer',      slug: 'briedis' },
  'MAIZE':      { syll: ['MAI', 'ZE'],         pic: '🍞', en: 'bread',     slug: 'maize' },
  'TĒJA':       { syll: ['TĒ', 'JA'],          pic: '🍵', en: 'tea',       slug: 'teja' },
  'TORTE':      { syll: ['TOR', 'TE'],         pic: '🎂', en: 'cake',      slug: 'torte' },
  'KŪKA':       { syll: ['KŪ', 'KA'],          pic: '🧁', en: 'cupcake',   slug: 'kuka' },
  'LAPA':       { syll: ['LA', 'PA'],          pic: '🍃', en: 'leaf',      slug: 'lapa' },
  'ZĀLE':       { syll: ['ZĀ', 'LE'],          pic: '🌿', en: 'grass',     slug: 'zale' },
  'SĒNE':       { syll: ['SĒ', 'NE'],          pic: '🍄', en: 'mushroom',  slug: 'sene' },
  'ĶIRSIS':     { syll: ['ĶIR', 'SIS'],        pic: '🍒', en: 'cherry',    slug: 'kirsis' },
  'BUMBA':      { syll: ['BUM', 'BA'],         pic: '⚽', en: 'ball',      slug: 'bumba' },
  'LAIVA':      { syll: ['LAI', 'VA'],         pic: '⛵', en: 'boat',      slug: 'laiva' },
  'LAMPA':      { syll: ['LAM', 'PA'],         pic: '💡', en: 'lamp',      slug: 'lampa' },
  'PŪĶIS':      { syll: ['PŪ', 'ĶIS'],         pic: '🐉', en: 'dragon',    slug: 'pukis' },
  // ── more 2-syllable (animals & bugs) ──
  'PŪCE':       { syll: ['PŪ', 'CE'],          pic: '🦉', en: 'owl',       slug: 'puce' },
  'MUŠA':       { syll: ['MU', 'ŠA'],          pic: '🪰', en: 'fly',       slug: 'musa' },
  // ── 2-syllable (body) ──
  'ROKA':       { syll: ['RO', 'KA'],          pic: '✋', en: 'hand',      slug: 'roka' },
  'KĀJA':       { syll: ['KĀ', 'JA'],          pic: '🦵', en: 'leg',       slug: 'kaja' },
  'MUTE':       { syll: ['MU', 'TE'],          pic: '👄', en: 'mouth',     slug: 'mute' },
  'ZOBI':       { syll: ['ZO', 'BI'],          pic: '🦷', en: 'teeth',     slug: 'zobi' },
  // ── 2-syllable (nature) ──
  'LIETUS':     { syll: ['LIE', 'TUS'],        pic: '🌧️', en: 'rain',      slug: 'lietus' },
  'JŪRA':       { syll: ['JŪ', 'RA'],          pic: '🌊', en: 'sea',       slug: 'jura' },
  'ZEME':       { syll: ['ZE', 'ME'],          pic: '🌍', en: 'earth',     slug: 'zeme' },
  'KALNI':      { syll: ['KAL', 'NI'],         pic: '⛰️', en: 'mountains', slug: 'kalni' },
  // ── 2-syllable (food) ──
  'GURĶIS':     { syll: ['GUR', 'ĶIS'],        pic: '🥒', en: 'cucumber',  slug: 'gurkis' },
  'ĀBOLS':      { syll: ['Ā', 'BOLS'],         pic: '🍎', en: 'apple',     slug: 'abols' },
  'BANĀNS':     { syll: ['BA', 'NĀNS'],        pic: '🍌', en: 'banana',    slug: 'banans' },
  'BURKĀNS':    { syll: ['BUR', 'KĀNS'],       pic: '🥕', en: 'carrot',    slug: 'burkans' },
  'TOMĀTS':     { syll: ['TO', 'MĀTS'],        pic: '🍅', en: 'tomato',    slug: 'tomats' },
  'ĶIRBIS':     { syll: ['ĶIR', 'BIS'],        pic: '🎃', en: 'pumpkin',   slug: 'kirbis' },
  'OLA':        { syll: ['O', 'LA'],           pic: '🥚', en: 'egg',       slug: 'ola' },
  'ZUPA':       { syll: ['ZU', 'PA'],          pic: '🍲', en: 'soup',      slug: 'zupa' },
  'SULA':       { syll: ['SU', 'LA'],          pic: '🧃', en: 'juice',     slug: 'sula' },
  'MEDUS':      { syll: ['ME', 'DUS'],         pic: '🍯', en: 'honey',     slug: 'medus' },
  // ── 2-syllable (objects) ──
  'SOMA':       { syll: ['SO', 'MA'],          pic: '👜', en: 'bag',       slug: 'soma' },
  'KASTE':      { syll: ['KAS', 'TE'],         pic: '📦', en: 'box',       slug: 'kaste' },
  'ŠĶĪVIS':     { syll: ['ŠĶĪ', 'VIS'],        pic: '🍽️', en: 'plate',     slug: 'skivis' },
  'GULTA':      { syll: ['GUL', 'TA'],         pic: '🛏️', en: 'bed',       slug: 'gulta' },
  // ── 2-syllable (clothes) ──
  'KURPE':      { syll: ['KUR', 'PE'],         pic: '👟', en: 'shoe',      slug: 'kurpe' },
  'ZEĶE':       { syll: ['ZE', 'ĶE'],          pic: '🧦', en: 'sock',      slug: 'zeke' },
  'CIMDI':      { syll: ['CIM', 'DI'],         pic: '🧤', en: 'gloves',    slug: 'cimdi' },
  'JAKA':       { syll: ['JA', 'KA'],          pic: '🧥', en: 'jacket',    slug: 'jaka' },
  'BIKSES':     { syll: ['BIK', 'SES'],        pic: '👖', en: 'pants',     slug: 'bikses' },
  'KLEITA':     { syll: ['KLEI', 'TA'],        pic: '👗', en: 'dress',     slug: 'kleita' },
  // ── 2-syllable (school & things) ──
  'SKOLA':      { syll: ['SKO', 'LA'],         pic: '🏫', en: 'school',    slug: 'skola' },
  'VILCIENS':   { syll: ['VIL', 'CIENS'],      pic: '🚂', en: 'train',     slug: 'vilciens' },
  'TRAMVAJS':   { syll: ['TRAM', 'VAJS'],      pic: '🚊', en: 'tram',      slug: 'tramvajs' },
  // ── 3-syllable ──
  'PRINCESE':   { syll: ['PRIN', 'CE', 'SE'],  pic: '👑', en: 'princess',  slug: 'princese' },
  'TAURENIS':   { syll: ['TAU', 'RE', 'NIS'],  pic: '🦋', en: 'butterfly', slug: 'taurenis' },
  'ZILONIS':    { syll: ['ZI', 'LO', 'NIS'],   pic: '🐘', en: 'elephant',  slug: 'zilonis' },
  'TĪĢERIS':    { syll: ['TĪ', 'ĢE', 'RIS'],   pic: '🐯', en: 'tiger',     slug: 'tigeris' },
  'GLIEMEZIS':  { syll: ['GLIE', 'ME', 'ZIS'], pic: '🐌', en: 'snail',     slug: 'gliemezis' },
  'ZIRNEKLIS':  { syll: ['ZIR', 'NEK', 'LIS'], pic: '🕷️', en: 'spider',    slug: 'zirneklis' },
  'MĀKONIS':    { syll: ['MĀ', 'KO', 'NIS'],   pic: '☁️', en: 'cloud',     slug: 'makonis' },
  'VĪNOGA':     { syll: ['VĪ', 'NO', 'GA'],    pic: '🍇', en: 'grape',     slug: 'vinoga' },
  'ZEMENE':     { syll: ['ZE', 'ME', 'NE'],    pic: '🍓', en: 'strawberry',slug: 'zemene' },
  'KONFEKTE':   { syll: ['KON', 'FEK', 'TE'],  pic: '🍬', en: 'candy',     slug: 'konfekte' },
  'GRĀMATA':    { syll: ['GRĀ', 'MA', 'TA'],   pic: '📖', en: 'book',      slug: 'gramata' },
  'ZĪMULIS':    { syll: ['ZĪ', 'MU', 'LIS'],   pic: '✏️', en: 'pencil',    slug: 'zimulis' },
  'DĀVANA':     { syll: ['DĀ', 'VA', 'NA'],    pic: '🎁', en: 'gift',      slug: 'davana' },
  'VIENRADZIS': { syll: ['VIEN', 'RA', 'DZIS'],pic: '🦄', en: 'unicorn',   slug: 'vienradzis' },
  // ── more 3-syllable (objects & vehicles) ──
  'MAŠĪNA':     { syll: ['MA', 'ŠĪ', 'NA'],    pic: '🚗', en: 'car',       slug: 'masina' },
  'KAROTE':     { syll: ['KA', 'RO', 'TE'],    pic: '🥄', en: 'spoon',     slug: 'karote' },
  'CEPURE':     { syll: ['CE', 'PU', 'RE'],    pic: '🧢', en: 'cap',       slug: 'cepure' },
  'AVĪZE':      { syll: ['A', 'VĪ', 'ZE'],     pic: '📰', en: 'newspaper', slug: 'avize' },
  'RAKETE':     { syll: ['RA', 'KE', 'TE'],    pic: '🚀', en: 'rocket',    slug: 'rakete' },
  'PLANĒTA':    { syll: ['PLA', 'NĒ', 'TA'],   pic: '🪐', en: 'planet',    slug: 'planeta' },
  'TELEFONS':   { syll: ['TE', 'LE', 'FONS'],  pic: '📱', en: 'phone',     slug: 'telefons' },
  'PULKSTENIS': { syll: ['PULK', 'STE', 'NIS'],pic: '⏰', en: 'clock',     slug: 'pulkstenis' },
  'SPOGULIS':   { syll: ['SPO', 'GU', 'LIS'],  pic: '🪞', en: 'mirror',    slug: 'spogulis' },
  'AUTOBUSS':   { syll: ['AU', 'TO', 'BUSS'],  pic: '🚌', en: 'bus',       slug: 'autobuss' },
  'RAGAVAS':    { syll: ['RA', 'GA', 'VAS'],   pic: '🛷', en: 'sled',      slug: 'ragavas' },
  // ── 3-syllable (food) ──
  'APELSĪNS':   { syll: ['A', 'PEL', 'SĪNS'],  pic: '🍊', en: 'orange',    slug: 'apelsins' },
  'PAPRIKA':    { syll: ['PAP', 'RI', 'KA'],   pic: '🫑', en: 'pepper',    slug: 'paprika' },
  'BAKLAŽĀNS':  { syll: ['BAK', 'LA', 'ŽĀNS'], pic: '🍆', en: 'eggplant',  slug: 'baklazans' },
  'BROKOLIS':   { syll: ['BRO', 'KO', 'LIS'],  pic: '🥦', en: 'broccoli',  slug: 'brokolis' },
  'SALĀTI':     { syll: ['SA', 'LĀ', 'TI'],    pic: '🥗', en: 'salad',     slug: 'salati' },
  'SALDĒJUMS':  { syll: ['SAL', 'DĒ', 'JUMS'], pic: '🍦', en: 'ice cream', slug: 'saldejums' },
  // ── 3-syllable (animals) ──
  'VĀVERE':     { syll: ['VĀ', 'VE', 'RE'],    pic: '🐿️', en: 'squirrel',  slug: 'vavere' },
  'ŽIRAFE':     { syll: ['ŽI', 'RA', 'FE'],    pic: '🦒', en: 'giraffe',   slug: 'zirafe' },
  'KAMIELIS':   { syll: ['KA', 'MIE', 'LIS'],  pic: '🐪', en: 'camel',     slug: 'kamielis' },
  'ĶIRZAKA':    { syll: ['ĶIR', 'ZA', 'KA'],   pic: '🦎', en: 'lizard',    slug: 'kirzaka' },
  // ── newly added (appended at end to keep existing level IDs / saved progress) ──
  'CEPUMI':     { syll: ['CE', 'PU', 'MI'],    pic: '🍪', en: 'cookies',   slug: 'cepumi' },
  'DAKŠIŅA':    { syll: ['DAK', 'ŠI', 'ŅA'],   pic: '🍴', en: 'fork',      slug: 'daksina' },
};

// distractor syllable pool for tiles / choices
const SYLL_POOL = ['MA','LE','SU','TE','RO','PI','NE','LĪ','ZE','MI','TĀ','SI','LA','RE','CE','JA','ĶE','SIS','LIS','DA','GO','NU','BE','KO','TA','SA','VA','BA','PA','DE','ME','NO','MU','RU','TO','LO','DI','VE','PO','TI'];

function pickDistractors(answer, n) {
  const pool = SYLL_POOL.filter(s => !answer.includes(s));
  const out = [];
  while (out.length < n && pool.length) {
    const i = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}
function shuffle(a) { const x = a.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; }

// ─────────────────────────────────────────────────────────────
// Letters & sounds — for the phonics games (first-letter, blending).
// LETTER_SOUNDS maps each Latvian letter to an ASCII slug for a recorded
// PHONEME clip at audio/letters/<slug>.mp3 (the sound, not the letter name).
// Diacritics fold uniquely: macron → doubled (Ā→aa), háček/soft → "x" (Č→cx).
// Missing clips fail silently (see playSound in game.jsx) — no TTS.
// ─────────────────────────────────────────────────────────────
const LETTER_SOUNDS = {
  'A':'a','Ā':'aa','B':'b','C':'c','Č':'cx','D':'d','E':'e','Ē':'ee','F':'f',
  'G':'g','Ģ':'gx','H':'h','I':'i','Ī':'ii','J':'j','K':'k','Ķ':'kx','L':'l',
  'Ļ':'lx','M':'m','N':'n','Ņ':'nx','O':'o','P':'p','R':'r','S':'s','Š':'sx',
  'T':'t','U':'u','Ū':'uu','V':'v','Z':'z','Ž':'zx',
};
const LV_ALPHABET = Object.keys(LETTER_SOUNDS);

// Curated subset for the sound-blending game: simple words whose letters map
// 1:1 to sounds (no diphthongs AU/AI/IE, no DZ/DŽ digraphs), each with an
// explicit sound-unit array so blending stays clean. Grows over time.
const BLEND_WORDS = {
  'ROZE':  ['R','O','Z','E'],
  'PELE':  ['P','E','L','E'],
  'KAZA':  ['K','A','Z','A'],
  'BITE':  ['B','I','T','E'],
  'LAPA':  ['L','A','P','A'],
  'MĀJA':  ['M','Ā','J','A'],
  'FEJA':  ['F','E','J','A'],
  'SĒNE':  ['S','Ē','N','E'],
  'ZĀLE':  ['Z','Ā','L','E'],
  'TĒJA':  ['T','Ē','J','A'],
  'CŪKA':  ['C','Ū','K','A'],
  'KŪKA':  ['K','Ū','K','A'],
  'TORTE': ['T','O','R','T','E'],
  'VARDE': ['V','A','R','D','E'],
  'LAMPA': ['L','A','M','P','A'],
  'VISTA': ['V','I','S','T','A'],
  // added with the bigger word list (all 1:1 letter→sound, ≤5 sounds)
  'ROKA':  ['R','O','K','A'],
  'KĀJA':  ['K','Ā','J','A'],
  'MUTE':  ['M','U','T','E'],
  'ZOBI':  ['Z','O','B','I'],
  'ZEME':  ['Z','E','M','E'],
  'OLA':   ['O','L','A'],
  'ZUPA':  ['Z','U','P','A'],
  'SULA':  ['S','U','L','A'],
  'MEDUS': ['M','E','D','U','S'],
  'SOMA':  ['S','O','M','A'],
  'KASTE': ['K','A','S','T','E'],
  'GULTA': ['G','U','L','T','A'],
  'JAKA':  ['J','A','K','A'],
  'SKOLA': ['S','K','O','L','A'],
  'PŪCE':  ['P','Ū','C','E'],
  'MUŠA':  ['M','U','Š','A'],
  'ZEĶE':  ['Z','E','Ķ','E'],
  'CIMDI': ['C','I','M','D','I'],
  'JŪRA':  ['J','Ū','R','A'],
};

// pick n other word keys (for picture-choice games), excluding the answer
function pickWordDistractors(answerKey, n) {
  const pool = shuffle(Object.keys(WORDS).filter(k => k !== answerKey));
  return pool.slice(0, n);
}
// pick n letters from the alphabet, excluding the answer letter
function pickLetterDistractors(answerLetter, n) {
  const pool = shuffle(LV_ALPHABET.filter(l => l !== answerLetter));
  return pool.slice(0, n);
}

// ─────────────────────────────────────────────────────────────
// Levels — winding path through the fairy land (bottom → castle).
// One word per level; generated 1:1 from the word order, cycling hues
// and alternating sides so the trail zig-zags.
// ─────────────────────────────────────────────────────────────
const LEVEL_WORDS = Object.keys(WORDS); // already in easy → hard order
const HUE_CYCLE = ['mint', 'sky', 'gold', 'peach', 'rose', 'lilac'];
const LEVELS = LEVEL_WORDS.map((word, i) => ({
  id: i + 1,
  word,
  hue: HUE_CYCLE[i % HUE_CYCLE.length],
  side: i % 2 ? 'r' : 'l',
}));

// ─────────────────────────────────────────────────────────────
// Chapters — the journey split into bite-size books of CHAPTER_SIZE words
// each, so the child can actually *finish* one. Derived 1:1 from LEVELS;
// a chapter/card is unlocked once its last level is completed (endId <
// currentId), so nothing new needs persisting — currentId stays the
// single source of truth. Each chapter awards one collectible card.
// ─────────────────────────────────────────────────────────────
const CHAPTER_SIZE = 10;
const MILESTONE_CARD_IMAGES = 10; // images/milestones/01..10.png exist today
const CHAPTERS = [];
for (let i = 0; i < LEVELS.length; i += CHAPTER_SIZE) {
  const levels = LEVELS.slice(i, i + CHAPTER_SIZE);
  const id = CHAPTERS.length + 1;                          // 1..N
  const img = ((id - 1) % MILESTONE_CARD_IMAGES) + 1;      // cards beyond 10 reuse art
  CHAPTERS.push({
    id,
    levels,
    startId: levels[0].id,
    endId: levels[levels.length - 1].id,
    card: `images/milestones/${String(img).padStart(2, '0')}.png`,
  });
}

// rewards unlocked at star milestones (ceiling ≈ 109 levels × 3⭐ ≈ 327)
const TREASURES = [
  { at: 5,   icon: '🎀', name: 'Lentīte' },
  { at: 12,  icon: '🌟', name: 'Zvaigznīte' },
  { at: 20,  icon: '🦄', name: 'Vienradzis' },
  { at: 30,  icon: '🍭', name: 'Konfekte' },
  { at: 42,  icon: '👑', name: 'Kronis' },
  { at: 55,  icon: '🧚', name: 'Spārni' },
  { at: 70,  icon: '🌈', name: 'Varavīksne' },
  { at: 88,  icon: '🎁', name: 'Dāvana' },
  { at: 105, icon: '💎', name: 'Dārgakmens' },
  { at: 125, icon: '🏰', name: 'Pils' },
  { at: 150, icon: '🏆', name: 'Kauss' },
  { at: 180, icon: '🎈', name: 'Balons' },
  { at: 215, icon: '🪁', name: 'Gaisa pūķis' },
  { at: 255, icon: '🌻', name: 'Saulespuķe' },
  { at: 295, icon: '🚀', name: 'Rakete' },
  { at: 335, icon: '🏅', name: 'Medaļa' },
];

// ─────────────────────────────────────────────────────────────
// Shared decorations
// ─────────────────────────────────────────────────────────────
function Sparkle({ left, top, size = 14, delay = 0, color = '#fff' }) {
  return (
    <div style={{
      position: 'absolute', left, top, width: size, height: size,
      animation: `sparkle ${2.4 + (delay % 1.3)}s ease-in-out ${delay}s infinite`,
      pointerEvents: 'none', zIndex: 1,
    }}>
      <svg viewBox="0 0 24 24" width={size} height={size}>
        <path d="M12 0c.6 5.6 5.8 10.8 11.4 11.4C17.8 12 12.6 17.2 12 22.8 11.4 17.2 6.2 12 0.6 11.4 6.2 10.8 11.4 5.6 12 0z" fill={color} />
      </svg>
    </div>
  );
}

function SparkleField({ count = 8, colors = ['#fff', '#ffe9b0', '#ffd1ec'] }) {
  const items = useRef(null);
  if (!items.current) {
    items.current = Array.from({ length: count }, (_, i) => ({
      left: `${Math.round((i * 53 + 11) % 92) + 3}%`,
      top: `${Math.round((i * 37 + 7) % 88) + 4}%`,
      size: 9 + (i % 4) * 5,
      delay: (i % 5) * 0.4,
      color: colors[i % colors.length],
    }));
  }
  return <>{items.current.map((s, i) => <Sparkle key={i} {...s} />)}</>;
}

// Fairy mascot — friendly guide. (Emoji stand-in for custom illustration.)
function Fairy({ size = 92, mood = 'happy', float = true }) {
  const faces = { happy: '🧚‍♀️', cheer: '🧚‍♀️', think: '🧚‍♀️' };
  return (
    <div style={{
      position: 'relative', width: size, height: size, flexShrink: 0,
      animation: float ? 'floaty 3.4s ease-in-out infinite' : 'none',
    }}>
      <div style={{
        position: 'absolute', inset: '-8%', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,229,170,.85) 0%, rgba(255,209,236,.45) 45%, transparent 72%)',
        animation: 'glow 3s ease-in-out infinite',
      }} />
      <div style={{
        position: 'relative', width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.74, lineHeight: 1,
        filter: 'drop-shadow(0 6px 8px rgba(150,90,140,.28))',
      }}>{faces[mood] || faces.happy}</div>
    </div>
  );
}

function SpeechBubble({ children, style = {} }) {
  return (
    <div style={{
      position: 'relative', background: 'var(--surface)', borderRadius: 22,
      padding: '13px 18px', boxShadow: '0 8px 22px rgba(140,90,130,.16)',
      fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 16,
      color: 'var(--ink)', lineHeight: 1.3, ...style,
    }}>
      {children}
      <div style={{
        position: 'absolute', left: -8, bottom: 16, width: 18, height: 18,
        background: 'var(--surface)', borderRadius: 4, transform: 'rotate(45deg)',
      }} />
    </div>
  );
}

// little star pill used for currency
function StarCount({ value }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      background: 'var(--surface)', borderRadius: 999, padding: '7px 14px 7px 10px',
      boxShadow: '0 4px 12px rgba(140,90,130,.14)', fontFamily: "'Fredoka', sans-serif",
      fontWeight: 600, fontSize: 18, color: 'var(--ink)',
    }}>
      <span style={{ fontSize: 20, filter: 'drop-shadow(0 1px 1px rgba(180,130,40,.4))' }}>⭐</span>
      {value}
    </div>
  );
}

Object.assign(window, {
  PALETTES, HUES, GOLD, GOLD_DARK, WORDS, LEVELS, CHAPTERS, CHAPTER_SIZE, TREASURES,
  LETTER_SOUNDS, LV_ALPHABET, BLEND_WORDS,
  pickDistractors, pickWordDistractors, pickLetterDistractors, shuffle,
  Sparkle, SparkleField, Fairy, SpeechBubble, StarCount,
});
