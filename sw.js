// sw.js — offline engine for Burtu Feja (PWA).
//
// Bump CACHE_NAME whenever any cached file changes, so tablets pick up the
// new version on their next online launch (the old cache is deleted in
// `activate`). Strategy is cache-first: the app is fully static, so once the
// precache below is populated the game runs instantly and 100% offline.

const CACHE_NAME = 'burtu-feja-v15';

// Complete, explicit list of every asset the app needs at runtime.
// NOTE: cache.addAll() is atomic — if ANY entry 404s, the whole install
// fails. Keep this list in sync with the files actually present.
const PRECACHE = [
  '.',
  'index.html',
  'manifest.json',
  'styles.css',

  // app icons
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-512-maskable.png',

  // vendored libraries
  'vendor/react.production.min.js',
  'vendor/react-dom.production.min.js',
  'vendor/babel.min.js',

  // fonts (css + every woff2 it lazily references)
  'vendor/fonts/fonts.css',
  'vendor/fonts/fredoka-400-normal-latin-ext.woff2',
  'vendor/fonts/fredoka-400-normal-latin.woff2',
  'vendor/fonts/fredoka-500-normal-latin-ext.woff2',
  'vendor/fonts/fredoka-500-normal-latin.woff2',
  'vendor/fonts/fredoka-600-normal-latin-ext.woff2',
  'vendor/fonts/fredoka-600-normal-latin.woff2',
  'vendor/fonts/fredoka-700-normal-latin-ext.woff2',
  'vendor/fonts/fredoka-700-normal-latin.woff2',
  'vendor/fonts/nunito-400-normal-latin-ext.woff2',
  'vendor/fonts/nunito-400-normal-latin.woff2',
  'vendor/fonts/nunito-600-normal-latin-ext.woff2',
  'vendor/fonts/nunito-600-normal-latin.woff2',
  'vendor/fonts/nunito-700-normal-latin-ext.woff2',
  'vendor/fonts/nunito-700-normal-latin.woff2',
  'vendor/fonts/nunito-700-italic-latin-ext.woff2',
  'vendor/fonts/nunito-700-italic-latin.woff2',
  'vendor/fonts/nunito-800-normal-latin-ext.woff2',
  'vendor/fonts/nunito-800-normal-latin.woff2',

  // app source (transpiled in-browser by babel)
  'tweaks-panel.jsx',
  'data.jsx',
  'game.jsx',
  'games.jsx',
  'screens.jsx',
  'app.jsx',

  // milestone reward images
  'images/milestones/01.png',
  'images/milestones/02.png',
  'images/milestones/03.png',
  'images/milestones/04.png',
  'images/milestones/05.png',
  'images/milestones/06.png',
  'images/milestones/07.png',
  'images/milestones/08.png',
  'images/milestones/09.png',
  'images/milestones/10.png',
  'images/milestones/11.png',
  'images/milestones/12.png',
  'images/milestones/13.png',
  'images/milestones/14.png',
  'images/milestones/15.png',
  'images/milestones/16.png',

  // session sounds
  'audio/background5min.mp3',
  'audio/win.mp3',

  // word clips
  'audio/roze.mp3', 'audio/saule.mp3', 'audio/maja.mp3', 'audio/feja.mp3',
  'audio/kakis.mp3', 'audio/zakis.mp3', 'audio/puke.mp3', 'audio/lacis.mp3',
  'audio/meness.mp3', 'audio/cuka.mp3', 'audio/aita.mp3', 'audio/vista.mp3',
  'audio/pile.mp3', 'audio/kaza.mp3', 'audio/lapsa.mp3', 'audio/pele.mp3',
  'audio/bite.mp3', 'audio/varde.mp3', 'audio/lauva.mp3', 'audio/valis.mp3',
  'audio/krabis.mp3', 'audio/ezis.mp3', 'audio/gailis.mp3', 'audio/briedis.mp3',
  'audio/maize.mp3', 'audio/teja.mp3', 'audio/torte.mp3', 'audio/kuka.mp3',
  'audio/lapa.mp3', 'audio/zale.mp3', 'audio/sene.mp3', 'audio/kirsis.mp3',
  'audio/bumba.mp3', 'audio/laiva.mp3', 'audio/lampa.mp3', 'audio/pukis.mp3',
  'audio/princese.mp3', 'audio/taurenis.mp3', 'audio/zilonis.mp3', 'audio/tigeris.mp3',
  'audio/gliemezis.mp3', 'audio/zirneklis.mp3', 'audio/makonis.mp3', 'audio/vinoga.mp3',
  'audio/zemene.mp3', 'audio/konfekte.mp3', 'audio/gramata.mp3', 'audio/zimulis.mp3',
  'audio/davana.mp3', 'audio/vienradzis.mp3', 'audio/gurkis.mp3', 'audio/puce.mp3',
  'audio/musa.mp3', 'audio/roka.mp3', 'audio/kaja.mp3', 'audio/mute.mp3',
  'audio/zobi.mp3', 'audio/lietus.mp3', 'audio/jura.mp3', 'audio/zeme.mp3',
  'audio/kalni.mp3', 'audio/abols.mp3', 'audio/banans.mp3', 'audio/burkans.mp3',
  'audio/tomats.mp3', 'audio/skola.mp3', 'audio/tramvajs.mp3',
  'audio/ola.mp3', 'audio/zupa.mp3', 'audio/sula.mp3', 'audio/medus.mp3',
  'audio/soma.mp3', 'audio/kaste.mp3', 'audio/skivis.mp3', 'audio/gulta.mp3',
  'audio/kurpe.mp3', 'audio/zeke.mp3', 'audio/cimdi.mp3', 'audio/jaka.mp3',
  'audio/bikses.mp3', 'audio/kleita.mp3', 'audio/vilciens.mp3', 'audio/masina.mp3',
  'audio/karote.mp3', 'audio/cepure.mp3', 'audio/avize.mp3', 'audio/rakete.mp3',
  'audio/planeta.mp3', 'audio/telefons.mp3', 'audio/pulkstenis.mp3', 'audio/spogulis.mp3',
  'audio/autobuss.mp3', 'audio/ragavas.mp3', 'audio/apelsins.mp3', 'audio/paprika.mp3',
  'audio/baklazans.mp3', 'audio/brokolis.mp3', 'audio/salati.mp3', 'audio/saldejums.mp3',
  'audio/vavere.mp3', 'audio/zirafe.mp3', 'audio/kamielis.mp3', 'audio/kirzaka.mp3',
  'audio/kirbis.mp3', 'audio/cepumi.mp3', 'audio/daksina.mp3',

  // letter phoneme clips
  'audio/letters/a.mp3', 'audio/letters/aa.mp3', 'audio/letters/b.mp3',
  'audio/letters/c.mp3', 'audio/letters/cx.mp3', 'audio/letters/d.mp3',
  'audio/letters/e.mp3', 'audio/letters/ee.mp3', 'audio/letters/f.mp3',
  'audio/letters/g.mp3', 'audio/letters/gx.mp3', 'audio/letters/h.mp3',
  'audio/letters/i.mp3', 'audio/letters/ii.mp3', 'audio/letters/j.mp3',
  'audio/letters/k.mp3', 'audio/letters/kx.mp3', 'audio/letters/l.mp3',
  'audio/letters/lx.mp3', 'audio/letters/m.mp3', 'audio/letters/n.mp3',
  'audio/letters/nx.mp3', 'audio/letters/o.mp3', 'audio/letters/p.mp3',
  'audio/letters/r.mp3', 'audio/letters/s.mp3', 'audio/letters/sx.mp3',
  'audio/letters/t.mp3', 'audio/letters/u.mp3', 'audio/letters/uu.mp3',
  'audio/letters/v.mp3', 'audio/letters/z.mp3', 'audio/letters/zx.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      // Fetch every asset with cache:'reload' so the precache bypasses the
      // browser's HTTP cache. Without this, a CACHE_NAME bump can re-store a
      // stale file the browser still had cached, and the update never lands.
      .then((cache) => cache.addAll(PRECACHE.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).catch(() => {
        // Offline navigation that wasn't matched → fall back to the app shell.
        if (req.mode === 'navigate') return caches.match('index.html');
        return Response.error();
      });
    })
  );
});
