# Burtu Feja

Latviešu lasīšanas spēle bērniem (5–6 gadi). Mācāmies lasīt ar zilbēm.

Statiska lapa, kas darbojas bezsaistē (PWA). Nav servera, reklāmu, izsekošanas
un konta — viss progress paliek pārlūkprogrammas atmiņā uz ierīces.

**Publicēts:** <https://www.kidmindpath.com/KidlaTest/>

## Kā palaist

Nav būvēšanas soļa. `.jsx` faili tiek tulkoti pārlūkā ar `vendor/babel.min.js`,
tāpēc lapa jāatver caur HTTP serveri, nevis no diska:

```sh
python3 -m http.server 8000
# atver http://localhost:8000/
```

## Uzbūve

```
index.html      ielādē vendor/, shared/, styles.css un visus .jsx
app.jsx         saknes komponente, maršrutēšana, tēmas, vecāku vārti
screens.jsx     pilnekrāna skati: Welcome, GamesHub, karte, kolekcija
games.jsx       spēļu ekrāni
game.jsx        zilbju spēles dzinējs
data.jsx        paletes, latviešu vārdi, līmeņi
styles.css      izkārtojums, marķieri, animācijas
sw.js           bezsaistes kešatmiņa (PWA)
vendor/         React, ReactDOM, Babel un fonti — nekas netiek ielādēts no tīkla
shared/         KidMindPath dizaina sistēma — kopija, skat. zemāk
```

## Versiju numuri

`APP_VERSION` (`app.jsx`) un `CACHE_NAME` (`sw.js`) **jāmaina kopā**. Ekrāna
apakšā redzamais numurs ir tas pats, kas kešatmiņas nosaukumā, tāpēc uzreiz var
pateikt, kura versija planšetē tiešām darbojas. Ja tie atšķiras, versijas
numurs melo.

Numura pieskaršanās piecas reizes pēc kārtas atver vecāku sadaļu.

## `shared/` — KidMindPath dizaina sistēma

`shared/` ir **kopija, nevis šī repozitorija kods**. Tajā ir kopīgie krāsu,
tipogrāfijas, atstarpju un noapaļojumu marķieri, ar kuriem visas sešas
kidmindpath.com lapas izskatās kā viena ģimene.

Oriģināls: `Hifistereo/Hifistereo.github.io`, mape `shared/`. Labo tur, nevis
šeit — vietēja izmaiņa tiek klusi pārrakstīta nākamajā sinhronizācijā.

Šī lietotne **patur savus fontus mapē `vendor/fonts/`**. Tie ir tie paši Fredoka
un Nunito faili; tie šeit bija jau pirms dizaina sistēmas, un visi astoņpadsmit
jau ir `sw.js` kešatmiņas sarakstā. Pārvietošana neko nedotu, tāpēc no `shared/`
šeit nāk tikai marķieri un `.kmp-home` poga.

`shared/` jāielādē **pirms** `styles.css`, citādi katrs `var(--kmp-*)` atrisinās
uz neko.

Fredoka ir pieejama svaros 400/500/600/700 un ne smagākos.

## Krājumi katram bērnam atsevišķi

Visas sešas atmiņas atslēgas (`app.jsx`) tiek nosauktas pēc bērna, kurš izvēlēts
kidmindpath.com sākumlapā: `burtu-feja-progress:<bērna-id>` un tā tālāk. Divi
bērni uz vienas planšetes vairs nepārraksta viens otra ceļojumu.

`kmpKey()` to nokārto vienā vietā: tā izsauc `KMP.migrateKey()`, kas vienreiz
pārvieto datus no vecās atslēgas uz jauno, un pēc tam `KMP.key()`. Bez
migrācijas ikviens, kurš jau ir spēlējis, izskatītos pēc tāda, kas zaudējis visu
ceļojumu — dati joprojām būtu vecajā atslēgā, tikai vairs netiktu nolasīti.

Ja kopīgā profila nav (piemēram, atverot no `hifistereo.github.io/KidlaTest/`),
`kmpKey()` atgriež to pašu veco atslēgu un nekas nemainās.

## Josla atpakaļ uz sākumlapu

`.kmp-bar` ir katrā ekrānā. `#root` augstums ir `--app-h` mīnus `--kmp-bar-h`,
jo `--app-h` seko `visualViewport` un par joslu neko nezina.

## Drošība

Lapai ir `Content-Security-Policy`, bet ir godīgi jāsaka, ko tā dod un ko ne.

`script-src` ir spiests atļaut gan `'unsafe-eval'`, gan `'unsafe-inline'`, jo
Babel tulko `.jsx` pārlūkā un rezultātu ievieto kā iekļautus `<script>`
elementus. Ar abiem atslēgvārdiem `script-src` praktiski neko neaptur — tas ir
izcelsmes ierobežojums, nevis aizsardzība pret XSS. Lai to mainītu, lietotne
būtu jāpārceļ uz īstu būvēšanas soli; tas ir atsevišķs darbs.

Pārējā politika strādā pa īstam: `connect-src`, `img-src`, `font-src` un
`media-src` ir piesaistīti `'self'`, tāpēc ievadītam kodam nav, kurp sūtīt
datus, un `object-src` / `base-uri` / `form-action` aizver parastās sānu durvis.

`frame-ancestors` apzināti nav — pārlūki to `<meta>` politikā ignorē un izvada
kļūdu, un GitHub Pages neļauj uzstādīt atbildes galvenes.
