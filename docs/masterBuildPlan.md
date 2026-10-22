<!--
MASTER-BUILD-PLAN (MultiAgent-System)
Der Planner-Agent (ma-planner) füllt diesen Plan im Interview mit dem Nutzer und pflegt ihn danach.
Er ist der einzige Agent, der diese Datei ändert. Der Lead (ma-lead) steuert den Bau danach.
Grundlage der Regeln: MultiAgent/entscheidungen.md
-->

# Master-Build-Plan mAtaschenRechnerFlappybird

**Stand:** 2026-10-22 · **Planversion:** 1.1 · **Gepflegt von:** ma-planner · **Gesteuert von:** ma-lead · **Nutzer:** Cem Dogan

Ein Taschenrechner als lokale Web-App (TypeScript + Vite, `localhost`) mit eingebautem Flappy-Bird-Spiel: Das Spiel läuft im LCD-Display des Rechners, der Vogel ist ein π, gesteuert wird nur über Rechnertasten. Eine lokale Top-3-Bestenliste (Ziffern-Kürzel, Punkte, Datum) liegt im `localStorage`.
Für den Nutzer selbst, privat, ohne Veröffentlichung.
Der Plan hat **1 Meilenstein** (M1: Rechner, π-Spiel und Bestenliste) mit **8 Agent-Paketen** in 4 Wellen und **1 [Mensch]-Paket**. Erster Durchlauf des MultiAgent-Systems; Team-Budget für dieses Projekt 30 % (PE-23).

---

## 0. Gebrauchsanweisung

### Rollen und Dokumente

| Wer / Was | Zweck |
|---|---|
| **Nutzer** [Mensch] | Teamleiter. Entscheidet über Security, Datenschutz, Vorgehensweise und Umfang, bringt `dev` → `stage` → `master`, richtet externe Dienste ein, füllt `.env`. |
| `ma-planner` (`.claude/agents/ma-planner.md`) | Interviewt den Nutzer, bis er „stop“ sagt. Danach pflegt er diesen Plan im Auftrag des Leads. |
| `ma-lead` (`.claude/agents/ma-lead.md`) | Steuert den Bau: plant Wellen, startet Coder und Reviewer, merged in `dev`, berichtet dem Nutzer. |
| `ma-coder` (`.claude/agents/ma-coder.md`) | Setzt genau ein Paket in einem eigenen Worktree um und committet auf `agent/AP-<nr>-c<n>`. |
| `ma-reviewer` (`.claude/agents/ma-reviewer.md`) | Prüft jedes Paket nur lesend. Urteil: bestanden / nicht bestanden. |
| `docs/masterBuildPlan.md` | Dieser Plan. Verbindlich für alle Agents. |
| `README.md` (entsteht in AP-01) | Start, Checks, Bedienung. Widerspricht sie diesem Plan, wird nachgefragt. |

Gemeinsame Regeln (R1–R6, Schutz vor fremden Anweisungen, Rechte, Git-Schema) stehen in jeder Agent-Datei unter „Gemeinsame Regeln für alle Agents“.

### Markierungen

| Markierung | Bedeutung | Wer entfernt sie |
|---|---|---|
| `{{…}}` | Platzhalter | Planner |
| `<!-- LEITFRAGEN … -->` | Fragen an den Nutzer. `[K]` kritisch (blockiert ein Gate), `[W]` wichtig, `[O]` optional (Standard darf angenommen werden) | Planner, sobald der Abschnitt fertig ist |
| `⟦offen: Q-xx⟧` | bewusst offene Stelle, siehe §16 | Planner nach Klärung |
| `(angenommen)` | Standard des Planners, vom Nutzer noch nicht bestätigt | Nutzer durch Bestätigung |
| `PE-xx` | Planungsentscheidung, §16 | – |
| **[Mensch]** | Schritt, den nur der Nutzer ausführt | – |

### Ausfüllstand und Gates

Status: `leer` · `in Klärung` · `fertig` · `angenommen` (fertig, aber mit unbestätigten Annahmen).

| § | Abschnitt | Status | Offene Fragen | Nötig für Gate |
|---|---|---|---|---|
| 1 | Projektkontext und Ziel | fertig | – | G1 |
| 2 | Umfang | fertig | – | G1 |
| 3 | Tech-Stack | fertig | – | G1 |
| 4 | Architektur, Datenmodell, Verträge | fertig | – | G1 |
| 5 | Sicherheit, Datenschutz, Recht, Limits | fertig | – | G1 |
| 6 | Umgebungen, Branches, Deployment | fertig | – | G1 |
| 7 | Team-Steuerung | fertig | – | G1 |
| 8 | Lanes und Dateieigentum | fertig | – | G2 |
| 9 | Meilensteine und Wellen | fertig | – | G2 |
| 10 | Statusübersicht | fertig | – | G2 |
| 11 | Abhängigkeitsgraph | fertig | – | G2 |
| 12 | Arbeitspakete | fertig | – | G2 (je Meilenstein) |
| 13 | Menschliche Schritte | fertig | – | G2 |
| 14 | Budget und Kürzungen | fertig | – | G2 |
| 15 | Risiken | fertig | – | G2 |
| 16 | Planungsentscheidungen und offene Fragen | laufend | – | laufend |
| 17 | Abdeckungsmatrix | fertig | – | G2 |
| 18 | Änderungsprotokoll | laufend | – | laufend |

**Gate-Stand:** G1 **erfüllt** (2026-10-21). G2(M1) **erfüllt aus Plannersicht** (Prüfung durch den Lead): alle Pakete vollständig, Schnitt vom Nutzer bestätigt (PE-21); Spielablauf in AP-08 bestätigt (PE-25). Keine offenen Annahmen. Interview am 2026-10-21 mit „stop“ beendet.

| Gate | Bedingung | Wer prüft | Folge |
|---|---|---|---|
| **G1** Bereit zur Paketierung | §1–§7 `fertig` oder `angenommen`, keine `[K]`-Frage offen | Planner | Der Planner schneidet Pakete (§8–§17). |
| **G2(Mx)** Bereit für Meilenstein Mx | G1 erfüllt; alle Pakete von Mx vollständig; [Mensch]-Schritte stehen; Abdeckungsmatrix deckt Mx ab | Lead | Der Lead startet die erste Welle von Mx. Sonst beauftragt er den Planner mit „Verfeinerung Mx“. |
| **G3** Fertig | alle Pflicht-Meilensteine live, Abnahmekriterien aus §1 erfüllt | Nutzer | Plan wird eingefroren. |

---

## 1. Projektkontext und Ziel

| Feld | Wert |
|---|---|
| Einzeiler | Taschenrechner mit integriertem Flappy-Bird-Spiel und lokaler Bestenliste. |
| Zielgruppe | Der Nutzer selbst, privat |
| Lieferumfang | Repository; Web-App, die lokal auf dem PC des Nutzers unter `localhost` läuft. Keine Veröffentlichung (PE-02) |
| Termin | keiner (PE-17) |
| Kommerzialisierung | nein (PE-17) |
| Projektdokumentation | keine; README entsteht in AP-01 |

**Leitprinzipien (in Rangfolge, PE-17):**

1. Sicherheit und Datenschutz werden nie gekürzt.
2. Korrekt rechnender Taschenrechner vor Spiel-Feinschliff.
3. Einfach und spielbar vor grafisch aufwendig.

**Abnahmekriterien (G3, PE-18):**
- [ ] `npm ci && npm run dev` startet die App unter `localhost`; alle Checks aus §3 grün.
- [ ] Rechner: `2+3*4=` → 14, `(2+3)*4=` → 20, `50%=` → 0,5 (Postfix-%, wirkt bei `=`), `±` wechselt Vorzeichen, Division durch 0 zeigt „Error“ statt abzustürzen; Bedienung per Maus und Tastatur.
- [ ] „🐦“ startet das Spiel im Display (LCD-Stil, π als Vogel); Ziffern flattern; „C“ führt zurück zum Rechner.
- [ ] Nach einem Top-3-Ergebnis Kürzel (1–6 Ziffern) eingeben, „=“ speichert; Eintrag bleibt nach Neuladen erhalten.
- [ ] „%“ zeigt im Spielmodus die Top 3; Doppel-„AC“ löscht sie nur bei angezeigter Liste.

---

## 2. Umfang

### Pflicht

| ID | Funktion | Beschreibung aus Nutzersicht | Kernfluss |
|---|---|---|---|
| F-01 | Taschenrechner | Rechnen mit + − × ÷, Klammern, Prozent, Vorzeichenwechsel (±); „AC“ löscht alles, „C“ löscht die aktuelle Eingabe, „⌫“ löscht das letzte Zeichen; Bedienung per Maus und Tastatur (PE-03, PE-19) | ja |
| F-02 | Flappy-Bird-Spiel | Eine eigene Rechnertaste „🐦“ schaltet zwischen Rechner und Spiel um (PE-04). Das Spiel läuft im Display des Rechners im LCD-Stil (grau-schwarz, Pixel-Optik); der Vogel ist ein **π-Zeichen**, Röhren als Pixelbalken. Jede Zifferntaste (0–9, auch per PC-Tastatur) lässt π flattern; „C“ beendet das Spiel und führt zum Rechner zurück. 1 Punkt pro durchflogenem Röhrenpaar. Konstante Schwierigkeit, kein Ton (PE-07, PE-10, PE-12, PE-13) | ja |
| F-03 | Lokale Bestenliste | Top 3 mit Kürzel, Punkten und Datum. Kürzel = 1–6 **Ziffern**, eingegeben über die Rechnertasten, bestätigt mit „=“ (nach einem Top-3-Ergebnis). Nach jedem Spiel erscheint die Top 3 im Display; im Spielmodus zeigt „%“ sie jederzeit. Löschen: zweimal „AC“ hintereinander, **nur während die Bestenliste angezeigt wird**. Speicherung nur im Browser (`localStorage`) (PE-05, PE-11) | ja |

**Kernfluss zuerst:** F-01 (kritischer Pfad), F-02 und F-03 parallel dazu; alles in M1.

### Optional

Keine optionalen Funktionen vereinbart.

### Bewusst nicht im Umfang

| Ausgeschlossen | Begründung |
|---|---|
| Online-Bestenliste, Server, Benutzerkonten | Bestenliste ist lokal (PE-05) |
| Veröffentlichung im Internet | Nur `localhost` (PE-02) |
| Mobile- oder Desktop-App | Web-App genügt (PE-02) |
| Mehrsprachigkeit | Privatnutzung, Oberfläche Deutsch |
| Wissenschaftlicher Rechner | Umfang PE-03 |
| Originalgrafiken/-töne von Flappy Bird | Urheberrecht (R1); eigene einfache Grafik |

---

## 3. Tech-Stack

| Bereich | Technologie | Begründung |
|---|---|---|
| Sprache | TypeScript (strict) | Typen fangen Fehler im Rechenkern früh ab (PE-06) |
| Frontend | Vite, Vanilla-TS, HTML/CSS, Canvas 2D für das Spiel; kein Framework | Kleiner Umfang, kein Framework nötig (PE-06) |
| Backend | keines | Rein lokal (PE-02) |
| Datenbank / ORM | keine; `localStorage` im Browser für die Bestenliste | PE-05 |
| Auth | keine | Einzelnutzer, lokal |
| Tests | Vitest (+ jsdom für DOM-/Storage-Tests) | Passt zu Vite (PE-06) |
| Code-Qualität | ESLint (typescript-eslint), Prettier, `tsc --noEmit` | PE-06 |
| Hosting | lokal: `npm run dev` → `http://localhost:5173` | PE-02 |
| Paketmanager | npm (Node 24 vorhanden), ein Repository | vorhanden |

**Checks, die jedes Paket bestehen muss:** `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`

**Freigegebene Abhängigkeiten (PE-08):** nur als devDependencies: `vite`, `typescript`, `vitest`, `jsdom`, `eslint`, `@eslint/js`, `typescript-eslint`, `prettier`, `eslint-config-prettier`. Keine Laufzeit-Abhängigkeiten. Coder installieren nur diese, und nur wenn ihnen die betroffene `package.json` gehört (nur AP-01). Alles andere geht über Lead und Nutzer.

---

## 4. Architektur, Datenmodell und Verträge

**Bausteine (PE-14):**

```mermaid
flowchart LR
  KP["ui/keypad<br/>Rechnertasten + PC-Tastatur"] --> APP["app/controller<br/>Modus-Zustandsmaschine"]
  APP --> CALC["calc/<br/>Rechenkern (reine Funktionen)"]
  APP --> GAME["game/engine<br/>Spiellogik (reine Funktionen)"]
  APP --> LB["leaderboard/<br/>Top-3 + localStorage"]
  APP --> DISP["ui/display<br/>Text- und Canvas-Display (LCD)"]
  APP --> REND["game/render<br/>π + Röhren auf Canvas"]
  REND --> DISP
```

- `src/contracts/` – gemeinsame Typen und Konstanten (Details AP-01).
- `src/calc/` – Eingabelogik (Reducer) + Tokenizer + Parser für Ausdrücke (Klammern, Punkt vor Strich, %, ±), **kein `eval`/`Function`**.
- `src/game/` – `engine`: `step(state, dtMs, flap, config, rng)` als reine Funktion (Physik, Röhren, Kollision, Punkte); `render`: zeichnet im LCD-Stil.
- `src/leaderboard/` – `load()`, `qualifies(score)`, `add(initials, score)`, `clear()`; validiert Daten aus `localStorage`.
- `src/ui/` – Tastenfeld, Tastatur-Zuordnung und Display (DOM).
- `src/app/` – Modi `calc` → `game` → `initials` → `leaderboard` und Tastenbelegung (PE-10, PE-11); `src/main.ts` verdrahtet alles.

**Grundregeln:** Nur `leaderboard/` greift auf Storage zu (Storage wird injiziert). `calc/` und `game/engine` kennen kein DOM. Bausteine sprechen nur über die Typen aus `src/contracts/`. Keine Netzwerkzugriffe. Kein `innerHTML` mit Daten.

| Entität | Wichtige Felder | Gehört zu | Löschverhalten |
|---|---|---|---|
| ScoreEntry | `initials` (1–6 Ziffern), `score` (Ganzzahl 0–999999), `date` (`JJJJ-MM-TT`, lokales Datum) | Browser des Nutzers, `localStorage`-Schlüssel `mataschen.leaderboard.v1`, max. 3 Einträge | Doppel-„AC“ bei angezeigter Liste löscht alles; ungültige gespeicherte Daten werden verworfen |

**Verträge:** `src/contracts/*.ts`, alle angelegt in AP-01 (M1 W1). Regel: Jeder Vertrag entsteht mindestens eine Welle vor seinen Nutzern. Änderungen an Verträgen nur über ein eigenes Paket (Lead → Planner).

---

## 5. Sicherheit, Datenschutz, Recht und Limits

Es gelten immer R1–R6 (siehe Agent-Dateien). Dieser Abschnitt konkretisiert sie für das Projekt (PE-15). Keine Konten, kein Server, keine Auth nötig. Personenbezogene Daten: praktisch keine (Kürzel nur Ziffern, nur lokal).

| Regel | Umsetzung (grob) | Testart | Paket |
|---|---|---|---|
| Kein Code-Ausführen aus Eingaben (R6, OWASP Injection) | Eigener Parser, kein `eval`/`new Function`; ESLint-Regeln `no-eval`, `no-implied-eval`, `no-new-func` | Unit-Tests + Lint + Review | AP-01, AP-02 |
| Kein HTML aus Daten (R6, XSS) | Nur `textContent`; ESLint verbietet `innerHTML`/`outerHTML`/`insertAdjacentHTML` | Lint + Review | AP-01, AP-03, AP-08 |
| Gespeicherte Daten validieren (R6) | `load()` prüft Struktur, Typen, Längen; bei Fehler leere Liste; Storage-Ausnahmen abgefangen | Unit-Tests mit kaputten Daten | AP-07 |
| Datensparsamkeit, Löschbarkeit (R2) | Nur Ziffern-Kürzel, Punkte, Datum; Löschen per Doppel-„AC“ | Unit + Handtest | AP-07, AP-08 |
| Keine externen Inhalte/Tracking | Keine CDNs, Fonts oder Requests nach außen; alles lokal gebündelt | Review | alle |
| Urheberrecht (R1) | Keine Originalgrafiken/-töne/-namen-Logos von Flappy Bird; π und Balken selbst gezeichnet | Review | AP-06 |
| Impressum und Datenschutzerklärung (R3) | **entfällt**, solange nur lokal (PE-02). Bei Veröffentlichung neues Paket nötig | – | – |
| Secrets nur in `.env`, `.env.example` gepflegt (R4) | Projekt braucht keine Secrets; `.env.example` bleibt ohne Werte | Review | alle |
| Dev-Server nur lokal | `server.host: 'localhost'` in `vite.config.ts`, kein `--host` | Review | AP-01 |

| Limit | Standard | Ebene |
|---|---|---|
| Kürzel-Länge | 1–6 Ziffern | Eingabe |
| Bestenliste | 3 Einträge | Browser |
| Rechner-Ausdruck | max. 64 Zeichen | Eingabe |
| Spiel-Zeitschritt | max. 50 ms pro `step` (gegen Sprünge nach Tab-Wechsel) | Spiel |

**Nie kürzbar:** kein `eval`, kein `innerHTML` mit Daten, Validierung der `localStorage`-Daten, Lösch-Funktion.

**Vom Nutzer rechtlich zu prüfen:** nur falls die App später veröffentlicht wird (Impressum, Datenschutzerklärung).

---

## 6. Umgebungen, Branches und Deployment

| Umgebung | Frontend | Backend | Datenbank | Auslöser |
|---|---|---|---|---|
| lokal / dev | `npm run dev` im Hauptcheckout (`localhost:5173`) | – | `localStorage` des Browsers | – |
| stage | Checkout von `stage`, `npm ci && npm run dev` lokal | – | `localStorage` | Merge dev → stage durch den Nutzer |
| Produktion | Checkout von `master`, `npm ci && npm run build && npm run preview` lokal | – | `localStorage` | Merge stage → master durch den Nutzer |

Es gibt kein Hosting; „stage“ und „Produktion“ sind Stände, die der Nutzer lokal startet (PE-16).

**Remote (PE-24):** Kein Remote, rein lokal. Der Lead überspringt `push origin dev`. Bis der Meilenstein vollständig fertig ist, wird **nur auf `dev`** gearbeitet; erst danach merged der Nutzer `dev` → `stage` → `master` lokal mit `git merge`.

| Branch | Zweck | Wer schreibt darauf |
|---|---|---|
| `master` | Produktion | **[Mensch]**, lokaler Merge von `stage` nach Meilenstein-Ende |
| `stage` | Abnahme | **[Mensch]**, lokaler Merge von `dev` nach Meilenstein-Ende |
| `dev` | Integration, Default-Branch | ma-lead (`merge --no-ff`, kein Push), ma-planner (nur Plan-Commits) |
| `agent/AP-<nr>-c<n>` | ein Arbeitspaket | ma-coder (`commit`), nur lokal, wird nach dem Merge gelöscht |

**Worktrees (PE-20):** unter `D:\Private Projekte\mAtaschenRechnerFlappybird_worktree\<name>` (wie in den Agent-Regeln). Der Lead legt sie an und entfernt sie nach dem Merge.

**Parallele Coder und lokale Ressourcen:** Tests (Vitest/jsdom) brauchen keinen Port. Startet ein Coder den Dev-Server, nutzt er `npm run dev -- --port 51<coderNr>0` (c1 → 5110, c2 → 5120, c3 → 5130). Jeder Worktree führt selbst `npm ci` aus.

**Env-Dateien:** Das Projekt braucht keine Umgebungsvariablen und keine Secrets. `.env.example` bleibt ohne Einträge.

**Deployment-Anleitung:** `README.md` (AP-01): `npm ci`, `npm run dev`, `npm run build`, `npm run preview`.

---

## 7. Team-Steuerung

### 7.1 Ablauf

```mermaid
flowchart TD
  N["Nutzer"] <-->|"Interview bis „stop“"| P["ma-planner"]
  P -->|"schreibt"| PLAN[("docs/masterBuildPlan.md")]
  N <-->|"Status, Entscheidungen"| L["ma-lead"]
  PLAN --> L
  L -->|"Auftrag AP-a"| C1["ma-coder c1<br/>agent/AP-a-c1"]
  L -->|"Auftrag AP-b"| C2["ma-coder c2<br/>agent/AP-b-c2"]
  C1 & C2 -->|"Bericht"| L
  L -->|"Paket prüfen"| R["ma-reviewer"]
  R -->|"Urteil"| L
  L -.->|"Nachbesserung (max. 2 Review-Runden)"| C1
  L -->|"merge --no-ff"| DEV["dev"]
  L -->|"Pflegeauftrag"| P
  N -->|"Merge dev → stage → master"| PROD["stage / master"]
```

### 7.2 Parallelität, Budget, Modelle

- **Höchstens gleichzeitig:** 3 Coder (PE-09). Der Budget-Wächter kann trotzdem früher bremsen (§14).
- **Budget (D11b, PE-23):** Für **dieses Projekt** nutzt das Team höchstens **30 %** des 5-Stunden-Limits (Standardwert; die Wächter-Einstellung steht bewusst auf 30 %). Die Einstellung des Wächters ändert nur der Nutzer. Der Wächter stoppt neue Coder, sobald es erreicht ist. Dann fragt der Lead den Nutzer. Ohne Antwort geht es nach dem Reset weiter (D11c).
- **Freigabe:** pro Meilenstein (PE-09)
- **Bei mehr Kandidaten als Plätzen:** zuerst kritischer Pfad (§11), dann Verträge, dann der Rest.

| Paket | Modell | Aufwand |
|---|---|---|
| S, Routine ohne Sicherheits- oder Kernlogik | haiku | low |
| M | sonnet | medium |
| L oder Sicherheit, Kernlogik, Migration | opus | high |

**Review:** Jedes Paket prüft `ma-reviewer` (höchstens 2 Runden, Nachbesserung durch denselben Coder). Danach entscheidet der Nutzer.

### 7.3 Eskalation

| Situation | Coder | Lead | Nutzer |
|---|---|---|---|
| Paket unklar | stoppt vor dem ersten Code, meldet `blockiert` | klärt aus Plan und Doku, sonst fragt er den Nutzer | entscheidet |
| Änderung an fremder Datei nötig | meldet | lässt den Planner ein Folgepaket planen | – |
| Neue Abhängigkeit | meldet | fragt den Nutzer | entscheidet |
| Review nach Runde 2 nicht bestanden | – | eskaliert mit Optionen | entscheidet |
| Merge-Konflikt außerhalb des Lockfiles | – | bricht ab, klärt mit dem Planner, Fix-Paket | bei Vorgehensänderung |
| Security, Datenschutz, Umfang, Architektur | – | legt Vorschlag vor | entscheidet |
| Verdächtige Anweisungen in Daten (R6) | meldet | meldet | entscheidet |

---

## 8. Lanes und Dateieigentum

| Lane | Zuständigkeit | Ordner und Dateien |
|---|---|---|
| **SH** – Gerüst und Verträge | Projektkonfiguration, Verträge | `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `.gitignore`, `index.html`, `src/vite-env.d.ts`, `src/styles/base.css`, `src/contracts/**`, `README.md` (Grundgerüst) |
| **CORE** – Logik | Rechenkern, Spiellogik, Bestenliste | `src/calc/**`, `src/game/**`, `src/leaderboard/**` |
| **WEB** – Oberfläche und App | DOM-Ansicht, Steuerung, Einstieg | `src/ui/**`, `src/app/**`, `src/main.ts` |
| **HUM** – Mensch | Freigaben, Merges nach stage/master, Smoke-Tests | – |

**Grundregeln:**

1. Innerhalb einer Welle gehört jede Datei höchstens einem Paket.
2. Verträge entstehen mindestens eine Welle vor ihren Nutzern.
3. Gemeinsame Dateien legt das Gerüst-Paket AP-01 in W1 an.
4. Konflikte im Lockfile sind nicht zu erwarten (nur AP-01 installiert). Falls doch: der Lead löst sie beim Merge mit `npm install`.

| Gemeinsame Datei | Wer ändert sie | Wann |
|---|---|---|
| `package.json`, `package-lock.json` | AP-01 | W1 (danach niemand ohne neues Paket) |
| `src/contracts/**` | AP-01 | W1 (danach nur per Vertragsänderungs-Paket) |
| `src/main.ts` | AP-01 (Platzhalter) → AP-04 → AP-08 | W1 → W3 → W4 |
| `src/app/controller.ts` | AP-04 → AP-08 | W3 → W4 |
| `README.md` | AP-01 → AP-08 (Abschnitt „Bedienung“) | W1 → W4 |

---

## 9. Meilensteine und Wellen

| # | Meilenstein | Inhalt | Live-Zustand |
|---|---|---|---|
| M1 | π-Rechner komplett | Gerüst, Verträge, Rechenkern, Oberfläche, Spiellogik, LCD-Renderer, Bestenliste, Modus-Steuerung (PE-21) | Alle Abnahmekriterien §1 prüfbar (F-01, F-02, F-03) |

### 9.1 Ablauf einer Welle

| Schritt | Inhalt | Wer |
|---|---|---|
| 0 Lagebild | `dev` sauber, Abhängigkeiten `fertig`, Eigentum ohne Überschneidung, Budget | Lead |
| 1 Wellenplan | Pakete, Coder-Nr., Modell; Freigabe pro Meilenstein (§7.2) | Lead → Nutzer |
| 2 Delegieren | Coder im Hintergrund starten, je eigener Worktree | Lead |
| 3 Umsetzen | Code, Tests, Commits auf `agent/AP-<nr>-c<n>`, Bericht | Coder |
| 4 Review | Urteil; bei „nicht bestanden“ Nachbesserung durch denselben Coder, max. 2 Runden | Reviewer, Lead, Coder |
| 5 Mergen | `merge --no-ff` in `dev`, Reihenfolge SH → CORE → WEB | Lead |
| 6 Integrationspunkt | `npm ci`, Checks, Handtest-Checkliste; rot → Fix-Paket | Lead (+ Nutzer für Handtest) |
| 7 Abschluss | kein Push (PE-24), Worktrees und Branches aufräumen, Plan pflegen | Lead, Planner |

### 9.2 Meilensteine im Detail

#### M1 – π-Rechner komplett

| Welle | Pakete (parallel, max. 3 Coder) |
|---|---|
| W1 | AP-01 Gerüst und Verträge |
| W2 | AP-02 Rechenkern · AP-03 Rechner-Oberfläche · AP-07 Bestenliste |
| W3 | AP-04 App-Steuerung Rechnermodus · AP-05 Spiellogik · AP-06 LCD-Renderer |
| W4 | AP-08 App-Steuerung Spiel und Bestenliste |
| W5 | M1-DEP [Mensch] |

Bei Budgetengpass startet der Lead zuerst den kritischen Pfad (AP-02 in W2, AP-04 in W3).

**Integration:**
- nach W1: `npm ci` + alle Checks grün, `npm run dev` zeigt Platzhalterseite.
- nach W3: `npm ci` + alle Checks grün; kein Handtest (H-02 ist ans Meilensteinende verlegt). Erfüllt am 2026-10-22 (195/195 Tests, Checks grün); Rechner-Booten im Browser noch unbelegt, prüft H-02.
- nach W4: Handtest Rechner (H-02) und vollständiger Handtest (H-03) gemeinsam im Dev-Checkout inkl. Spielbarkeit. Checks erfüllt am 2026-10-22 (253/253 Tests, Checks grün); Handtest offen (erster echter Bootnachweis im Browser).

##### M1-DEP – Deployment [Mensch]

Erst wenn M1 vollständig auf `dev` fertig ist (PE-24):

- `dev` → `stage` lokal mergen, `npm ci && npm run dev`, Smoke-Test
- `stage` → `master` lokal mergen, `npm ci && npm run build && npm run preview`, Smoke-Test
- **Smoke-Test:**
  - [ ] Seite öffnet unter `localhost`, Rechner mit LCD-Display und allen Tasten sichtbar (inkl. „🐦“)
  - [ ] `2+3*4=` → 14 · `(2+3)*4=` → 20 · `50%=` → 0,5 (Postfix-%, wirkt erst bei `=`; `200+10%=` ergibt 200,1, nicht 220 – im Handtest erklären) · `0,1+0,2=` → 0,3
  - [ ] `7±` → −7 · `5÷0=` → „Error“, danach „AC“ → 0
  - [ ] „⌫“, „C“, „AC“ verhalten sich wie in F-01 beschrieben
  - [ ] Eingabe über PC-Tastatur (Ziffern, `+-*/`, `Enter`/`=`, `Backspace` = „⌫“, `Esc` = „AC“, `Entf` = „C“, `F9` = „±“, `b` = „🐦“) funktioniert
  - [ ] „🐦“ startet das Spiel im Display; π ist sichtbar, LCD-Optik
  - [ ] Ziffern (Maus und Tastatur) lassen π flattern; Spiel ist spielbar, Punkte zählen
  - [ ] „C“ beendet das Spiel → Rechner, alter Rechnerstand ist weg (AC-Zustand)
  - [ ] Nach Game Over mit Top-3-Ergebnis: Kürzel `1234` eingeben, „=“ → Liste zeigt Eintrag mit Datum
  - [ ] Seite neu laden → Eintrag ist noch da
  - [ ] Im Spiel „%“ → Liste erscheint; „%“ erneut → zurück zum Spiel
  - [ ] Bei angezeigter Liste zweimal „AC“ → Liste leer; „AC“ im Rechnermodus löscht keine Liste
  - [ ] Alle Abnahmekriterien §1 erfüllt → G3

---

## 10. Statusübersicht

Gepflegt von ma-planner (im Auftrag des Leads). Aufwand: S ≈ 0,75 h · M ≈ 1,5 h · L ≈ 2,5 h Agent-Zeit, H = Mensch.

Status: `offen` · `bereit` · `in Arbeit` · `Review` · `fertig` (gemergt in dev) · `blockiert`

| ID | Titel | M | Lane | Welle | Abhängigkeiten | Aufwand | Modell | Coder / Branch | Status |
|---|---|---|---|---|---|---|---|---|---|
| AP-01 | Gerüst und Verträge | M1 | SH | W1 | H-01 | M | sonnet / high | c1 / agent/AP-01-c1 | fertig |
| AP-02 | Rechenkern | M1 | CORE | W2 | AP-01 | L | opus / high | c2 / agent/AP-02-c2 | fertig |
| AP-03 | Rechner-Oberfläche | M1 | WEB | W2 | AP-01 | M | sonnet / medium | c3 / agent/AP-03-c3 | fertig |
| AP-07 | Bestenliste | M1 | CORE | W2 | AP-01 | M | sonnet / high | c4 / agent/AP-07-c4 | fertig |
| AP-04 | App-Steuerung Rechnermodus | M1 | WEB | W3 | AP-02, AP-03 | S | sonnet / medium | c7 / agent/AP-04-c7 | fertig |
| AP-05 | Spiellogik | M1 | CORE | W2 (vorgezogen aus W3) | AP-01 | M | sonnet / high | c5 / agent/AP-05-c5 | fertig |
| AP-06 | LCD-Renderer | M1 | CORE | W3 | AP-01 | M | sonnet / medium | c8 / agent/AP-06-c8 | fertig |
| AP-08 | App-Steuerung Spiel und Bestenliste | M1 | WEB | W4 | AP-04, AP-05, AP-06, AP-07 | L | opus / high | c9 / agent/AP-08-c9 | fertig |
| M1-DEP | Deployment M1 | M1 | HUM | W5 | AP-08, H-02, H-03 | H | – | Nutzer | offen |

---

## 11. Abhängigkeitsgraph

```mermaid
flowchart LR
  subgraph M1["M1 π-Rechner komplett"]
    AP01["AP-01 Gerüst+Verträge (W1)"] --> AP02["AP-02 Rechenkern (W2)"]
    AP01 --> AP03["AP-03 Oberfläche (W2)"]
    AP01 --> AP07["AP-07 Bestenliste (W2)"]
    AP01 --> AP05["AP-05 Spiellogik (W3)"]
    AP01 --> AP06["AP-06 Renderer (W3)"]
    AP02 --> AP04["AP-04 Steuerung Rechner (W3)"]
    AP03 --> AP04
    AP04 --> AP08["AP-08 Steuerung Spiel (W4)"]
    AP05 --> AP08
    AP06 --> AP08
    AP07 --> AP08
    AP08 --> M1DEP["M1-DEP [Mensch] (W5)"]
  end
```

**Kritischer Pfad:** AP-01 → AP-02 → AP-04 → AP-08 → M1-DEP (≈ 8 h Agent-Zeit + Reviews).

AP-05 und AP-06 hängen nur an AP-01; der Lead darf sie bei freien Plätzen und Budget schon in W2 vorziehen (Dateieigentum bleibt disjunkt).

---

## 12. Arbeitspakete

<!-- Regeln:
- Ein Paket passt in eine Agent-Sitzung (1–3 h) und ergibt einen einzeln committbaren, getesteten Stand.
- Ein Coder muss es allein mit Paket und Pflichtlektüre umsetzen können, ohne Rückfrage.
- Knappe, konkrete Schritte, keine fertigen Code-Blöcke.
-->

#### AP-01 – Gerüst und Verträge

- **Meilenstein, Lane, Welle:** M1 · SH · W1
- **Ziel:** Lauffähiges Vite-TypeScript-Projekt mit allen Checks und sämtlichen Verträgen (Rechner, Spiel, Bestenliste, App), damit danach parallel gebaut werden kann.
- **Pflichtlektüre:** §3, §4, §5, §8; PE-06, PE-08, PE-10, PE-11, PE-14, PE-15
- **Abhängigkeiten:** H-01
- **Parallel möglich mit:** –
- **Dateien (Eigentum):** `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `.gitignore`, `index.html`, `src/main.ts`, `src/vite-env.d.ts`, `src/styles/base.css`, `src/contracts/keys.ts`, `src/contracts/calc.ts`, `src/contracts/ui.ts`, `src/contracts/game.ts`, `src/contracts/leaderboard.ts`, `src/contracts/app.ts`, `src/contracts/index.ts`, `src/contracts/contracts.test.ts`, `README.md`
- **Nicht anfassen:** `.claude/`, `.env*` (außer lesen von `.env.example`), `docs/`
- **Freigegebene Abhängigkeiten:** alle aus §3 (nur devDependencies)
- **Umsetzung:**
  1. `package.json` (`"type": "module"`, `"private": true`), devDependencies aus §3 installieren. Scripts: `dev` (`vite`), `build` (`tsc --noEmit && vite build`), `preview` (`vite preview`), `test` (`vitest run`), `lint` (`eslint .`), `typecheck` (`tsc --noEmit`), `format` (`prettier --write .`).
  2. `tsconfig.json` strict (inkl. `noUncheckedIndexedAccess`), `moduleResolution: "bundler"`, `lib` mit DOM. `vite.config.ts`: `server.host: 'localhost'`, Vitest-Block mit `environment: 'jsdom'`.
  3. `eslint.config.js` (flat config, `@eslint/js` + `typescript-eslint` + `eslint-config-prettier`), zusätzlich: `no-eval`, `no-implied-eval`, `no-new-func` als Fehler; `no-restricted-properties` für `innerHTML`, `outerHTML`; `no-restricted-syntax` bzw. `no-restricted-properties` für `insertAdjacentHTML`, `document.write`. `dist/`, `coverage/` ignorieren.
  4. `.gitignore` ergänzen (bestehende Zeilen behalten): `node_modules/`, `dist/`, `coverage/`.
  5. `index.html` (lang `de`, Titel „π-Rechner“, `<div id="app">`, lädt `/src/main.ts`), `src/styles/base.css` (Reset, Seitenhintergrund, zentriert), `src/main.ts` als Platzhalter (importiert `base.css`, schreibt per `textContent` „π-Rechner lädt…“ in `#app`). Keine externen Fonts/CDNs.
  6. Verträge anlegen (nur Typen, Konstanten und triviale Typ-Guards, keine Logik):
     - `keys.ts`: `KEYS` als `const`-Array: `'0'…'9'`, `'.'`, `'+'`, `'-'`, `'*'`, `'/'`, `'('`, `')'`, `'%'`, `'±'`, `'='`, `'AC'`, `'C'`, `'BACK'`, `'BIRD'`; `type Key`; `type DigitKey`; `isDigitKey(k)`; `type CalcKey = Exclude<Key, 'BIRD'>`.
     - `calc.ts`: `interface CalcState { expression: string; display: string; error: boolean; justEvaluated: boolean }` (`expression` intern ASCII mit `.` als Dezimaltrenner, `display` fertig formatiert für die Anzeige); `type CalcResult = { ok: true; value: number } | { ok: false; error: 'Error' }`; `interface CalcEngine { initialState(): CalcState; press(state: CalcState, key: CalcKey): CalcState; evaluate(expression: string): CalcResult; format(value: number): string }`; Konstante `MAX_EXPRESSION_LENGTH = 64`.
     - `ui.ts`: `DISPLAY_CANVAS = { width: 120, height: 48 }` (logische Pixel); `interface DisplayView { showText(main: string, sub?: string): void; showLines(lines: string[]): void; showCanvas(): CanvasRenderingContext2D | null; hideCanvas(): void }`; `interface KeypadView { onKey(handler: (key: Key) => void): () => void }`; `interface CalculatorView { display: DisplayView; keypad: KeypadView }`; `type CreateCalculatorView = (root: HTMLElement) => CalculatorView`.
     - `game.ts`: `interface GameConfig { width; height; gravity /* px/s² */; flapVelocity /* px/s, negativ = hoch */; pipeSpeed /* px/s */; pipeGap; pipeWidth; pipeSpacing; birdX; birdSize; groundHeight }` (alle `number`); `interface Pipe { x: number; gapY: number /* Oberkante Lücke */; passed: boolean }`; `type GameStatus = 'ready' | 'running' | 'over'`; `interface GameState { status: GameStatus; birdY: number; birdVy: number; pipes: Pipe[]; score: number }`; `type Rng = () => number /* [0,1) */`; `interface GameEngine { create(config: GameConfig): GameState; step(state: GameState, dtMs: number, flap: boolean, config: GameConfig, rng: Rng): GameState }`; `type GameRenderer = (ctx: CanvasRenderingContext2D, state: GameState, config: GameConfig) => void`; `MAX_STEP_MS = 50`.
     - `leaderboard.ts`: `interface ScoreEntry { initials: string; score: number; date: string }`; `type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>`; `interface LeaderboardStore { load(): ScoreEntry[]; qualifies(score: number): boolean; add(initials: string, score: number): ScoreEntry[]; clear(): void }`; `type CreateLeaderboard = (storage: StorageLike, today?: () => string) => LeaderboardStore`; Konstanten `LEADERBOARD_KEY = 'mataschen.leaderboard.v1'`, `MAX_ENTRIES = 3`, `MAX_INITIALS = 6`, `MAX_SCORE = 999999`, `INITIALS_PATTERN = /^\d{1,6}$/`.
     - `app.ts`: `type Mode = 'calc' | 'game' | 'initials' | 'leaderboard'`; `interface Scheduler { request(cb: (timeMs: number) => void): number; cancel(id: number): void }`.
     - `index.ts` exportiert alles.
  7. `contracts.test.ts`: prüft z. B. `KEYS` enthält 24 eindeutige Einträge, `isDigitKey`, `INITIALS_PATTERN` (gültig/ungültig), damit `npm test` grün ist.
  8. `README.md`: Zweck, Voraussetzungen (Node 24), `npm ci`, `npm run dev`, Checks, `build`/`preview`; Platzhalter-Abschnitt „Bedienung“ (füllt AP-08).
  9. Alle Checks aus §3 lokal grün; `npm run dev` startet unter `localhost`.
- **Schnittstellen:** stellt alle Verträge bereit (AP-02 bis AP-08).
- **Akzeptanzkriterien:**
  - `npm ci && npm run lint && npm run typecheck && npm test && npm run build` grün.
  - ESLint meldet Fehler bei `eval(...)` und `el.innerHTML = ...` (Coder prüft kurz mit Wegwerf-Datei, committet sie nicht).
  - Verträge exakt wie oben benannt; keine Laufzeit-Abhängigkeiten in `package.json`.
- **Tests:** `src/contracts/contracts.test.ts`.
- **Review-Schwerpunkte:** nur freigegebene Abhängigkeiten, Lint-Sicherheitsregeln, `server.host`, keine externen Ressourcen, Verträge vollständig für alle späteren Pakete.
- **Doku-Pflichten:** `README.md`; `.env.example` unverändert lassen.
- **Aufwand:** M · **Modell:** sonnet · **Effort:** high
- **Kürzbar bei Budgetnot:** nein (Fundament)
- **Commit-Typ:** `chore(AP-01): scaffold vite project and add contracts`

#### AP-02 – Rechenkern

- **Meilenstein, Lane, Welle:** M1 · CORE · W2
- **Ziel:** Vollständige, DOM-freie Rechner-Logik als `CalcEngine`: Tasteneingabe → Zustand, sicherer Parser ohne `eval`, deutsche Zahlenformatierung.
- **Pflichtlektüre:** §2 F-01, §5, `src/contracts/calc.ts`, `src/contracts/keys.ts`; PE-03, PE-19
- **Abhängigkeiten:** AP-01
- **Parallel möglich mit:** AP-03, AP-07 (ggf. vorgezogene AP-05, AP-06)
- **Dateien (Eigentum):** `src/calc/**` (z. B. `tokenizer.ts`, `parser.ts`, `format.ts`, `engine.ts`, `index.ts`, `*.test.ts`)
- **Nicht anfassen:** `src/ui/**`, `src/leaderboard/**`, `src/game/**`, `src/contracts/**`, `src/main.ts`, `package.json`
- **Freigegebene Abhängigkeiten:** keine
- **Umsetzung:**
  1. Tokenizer: Zahlen (mit `.`), `+ - * / ( ) %`; unbekannte Zeichen → Fehler.
  2. Parser (rekursiver Abstieg oder Shunting-Yard): Punkt vor Strich, Klammern, unäres Minus (am Anfang, nach Operator, nach `(`), Postfix `%` = Wert ÷ 100. Fehlende schließende Klammern werden bei `=` automatisch ergänzt. Ergebnis nicht endlich (z. B. ÷ 0) → `{ ok: false, error: 'Error' }`.
  3. `format(value)`: auf 12 signifikante Stellen runden (damit `0.1+0.2` → `0,3`), Dezimalkomma, kein Tausendertrenner; ab |x| ≥ 1e12 oder 0 < |x| < 1e-9 Exponentialschreibweise (z. B. `1,5e+15`); `-0` → `0`.
  4. `press(state, key)`:
     - Ziffern, `.`, Operatoren, Klammern anhängen; max. `MAX_EXPRESSION_LENGTH`, darüber ignorieren.
     - `.` nur einmal pro Zahl; `.` am Zahlanfang → `0.`.
     - Operator nach Operator ersetzt den vorigen (Ausnahme: `-` als unäres Minus nach `*`, `/`, `(` oder am Anfang).
     - `(` direkt nach Zahl, `)` oder `%` fügt implizit `*` ein.
     - `±` schaltet das Vorzeichen der letzten Zahl um (unäres Minus davor einfügen/entfernen); ohne Zahl ignorieren.
     - `=` wertet aus: Erfolg → `expression` = Ergebnis (ASCII), `justEvaluated: true`; Fehler → `error: true`, `display: 'Error'`.
     - Nach `justEvaluated`: Ziffer/`.` startet neuen Ausdruck, Operator rechnet mit dem Ergebnis weiter.
     - `BACK` löscht das letzte Zeichen; `C` löscht die letzte Zahl (Clear Entry); `AC` → `initialState()`.
     - Im Fehlerzustand: `AC`/`C` → Anfangszustand; Ziffer/`(` startet neu; andere Tasten ignorieren.
     - `display`: Ausdruck mit `×`, `÷`, `−`, Dezimalkomma; leer → `0`.
  5. `index.ts` exportiert `calcEngine: CalcEngine`.
- **Schnittstellen:** implementiert `CalcEngine` aus `src/contracts/calc.ts`.
- **Akzeptanzkriterien:**
  - Alle Rechenbeispiele aus §1 und M1-Smoke-Test als Tests grün; dazu `-3+5`, `2*-3`, `((2))`, `(1+2`→3, `10/4`→`2,5`, `1/3`→`0,333333333333`, `5/0`→Error.
  - Kein `eval`, `Function`, `with`, keine dynamischen Imports; keine DOM-Zugriffe.
  - Zustände werden nicht mutiert (neues Objekt pro `press`).
- **Tests:** `tokenizer.test.ts`, `parser.test.ts`, `format.test.ts`, `engine.test.ts` (Tastenfolgen → `display`).
- **Review-Schwerpunkte:** kein `eval` (R6), Rundung, Randfälle (leere Eingabe, nur Operator, mehrfache Klammern), Längenlimit.
- **Doku-Pflichten:** JSDoc an den exportierten Funktionen.
- **Aufwand:** L · **Modell:** opus · **Effort:** high
- **Kürzbar bei Budgetnot:** nein (Kernlogik, Sicherheit); Modell ggf. sonnet/high (K2)
- **Commit-Typ:** `feat(AP-02): add safe calculator engine`

#### AP-03 – Rechner-Oberfläche

- **Meilenstein, Lane, Welle:** M1 · WEB · W2
- **Ziel:** DOM-Ansicht des Rechners: LCD-Display (Text + Canvas-Ebene) und Tastenfeld mit allen Tasten inkl. „🐦“, Tastatur-Zuordnung.
- **Pflichtlektüre:** §2 F-01/F-02/F-03, §5, `src/contracts/ui.ts`, `src/contracts/keys.ts`; PE-07, PE-10, PE-12, PE-19
- **Abhängigkeiten:** AP-01
- **Parallel möglich mit:** AP-02, AP-07 (ggf. vorgezogene AP-05, AP-06)
- **Dateien (Eigentum):** `src/ui/**` (z. B. `view.ts`, `display.ts`, `keypad.ts`, `keyboard.ts`, `ui.css`, `index.ts`, `*.test.ts`)
- **Nicht anfassen:** `src/calc/**`, `src/leaderboard/**`, `src/game/**`, `src/contracts/**`, `src/main.ts`, `index.html`, `package.json`
- **Freigegebene Abhängigkeiten:** keine
- **Umsetzung:**
  1. `createCalculatorView(root)` (Typ `CreateCalculatorView`) baut per `document.createElement` Rechnergehäuse, Display und Tastenfeld; importiert `./ui.css` selbst.
  2. Display im LCD-Stil (grau-grünlicher Hintergrund, fast schwarze „Pixel“, Monospace aus Systemschriften): Zeile `sub` (klein, Ausdruck) und `main` (groß, rechtsbündig). `showLines` zeigt bis zu 4 Zeilen linksbündig (für die Bestenliste). Ein `<canvas>` mit `DISPLAY_CANVAS` als logischer Größe liegt im Display, per CSS auf Displaygröße skaliert (`image-rendering: pixelated`); `showCanvas()` blendet Text aus und Canvas ein, liefert den 2D-Kontext (`imageSmoothingEnabled = false`); `hideCanvas()` umgekehrt. Nur `textContent`.
  3. Tastenfeld (4 Spalten × 6 Reihen): `AC C ⌫ 🐦` / `( ) % ÷` / `7 8 9 ×` / `4 5 6 −` / `1 2 3 +` / `± 0 , =`. `<button type="button" data-key="…">`, `aria-label` je Taste (z. B. „Spiel“ für 🐦). Beschriftung `,` sendet `'.'`, `×` → `'*'`, `÷` → `'/'`, `−` → `'-'`, `⌫` → `'BACK'`, `🐦` → `'BIRD'`.
  4. Tastatur (`keydown` auf `window`): `0–9`, `.` und `,` → `'.'`, `+ - * /`, `( )`, `%`, `Enter`/`=` → `'='`, `Backspace` → `'BACK'`, `Escape` → `'AC'`, `Delete` → `'C'`, `F9` → `'±'`, `b` → `'BIRD'`; `preventDefault` nur für zugeordnete Tasten; gedrückte Taste kurz optisch hervorheben.
  5. `onKey(handler)` registriert Handler und liefert eine Abmeldefunktion (entfernt auch den Tastatur-Listener).
- **Schnittstellen:** implementiert `CreateCalculatorView`, `DisplayView`, `KeypadView`.
- **Akzeptanzkriterien:**
  - Alle 24 Tasten sichtbar, jede löst genau den richtigen `Key` aus (Klick und Tastatur).
  - `showText`, `showLines`, `showCanvas`/`hideCanvas` wechseln die Anzeige korrekt.
  - Kein `innerHTML`; keine externen Ressourcen; responsive bis 360 px Breite.
- **Tests:** jsdom: Klick je Taste → Handler-Key; Tastaturereignisse → Key; Abmelden entfernt Listener; Display-Methoden setzen `textContent`/Sichtbarkeit. (Canvas-Kontext in jsdom ggf. `null` – Test darauf auslegen.)
- **Review-Schwerpunkte:** XSS (nur `textContent`), Barrierefreiheit (Labels), Tastenzuordnung vollständig.
- **Doku-Pflichten:** Tastaturbelegung als Kommentar in `keyboard.ts`.
- **Aufwand:** M · **Modell:** sonnet · **Effort:** medium
- **Kürzbar bei Budgetnot:** nein; Feinschliff der Optik ja (K1)
- **Commit-Typ:** `feat(AP-03): add calculator view with lcd display and keypad`

#### AP-04 – App-Steuerung Rechnermodus

- **Meilenstein, Lane, Welle:** M1 · WEB · W3
- **Ziel:** Rechner verdrahten: Tasten → `calcEngine.press` → Display. Damit ist M1 live.
- **Pflichtlektüre:** §2 F-01, §4, `src/contracts/*`, `src/calc/index.ts`, `src/ui/index.ts`
- **Abhängigkeiten:** AP-02, AP-03
- **Parallel möglich mit:** AP-05, AP-06
- **Dateien (Eigentum):** `src/app/controller.ts`, `src/app/controller.test.ts`, `src/main.ts`
- **Nicht anfassen:** `src/calc/**`, `src/ui/**`, `src/game/**`, `src/leaderboard/**`, `src/contracts/**`
- **Freigegebene Abhängigkeiten:** keine
- **Umsetzung:**
  1. `createApp({ view, calc })` hält `CalcState`; bei jedem Key außer `'BIRD'`: `calc.press`, dann `display.showText(state.display, state.justEvaluated ? '=' : '')`. `'BIRD'` wird in M1 ignoriert (Kommentar: Spielmodus folgt in AP-08).
  2. `src/main.ts`: `base.css` importieren, `#app` suchen, `createCalculatorView`, `createApp` starten; Platzhaltertext entfernen.
- **Schnittstellen:** nutzt `CalcEngine`, `CalculatorView`.
- **Akzeptanzkriterien:** Tastenfolge `2 + 3 * 4 =` über Fake-View → Display zeigt `14`; `BIRD` ändert nichts; M1-Smoke-Test im Browser bestanden.
- **Tests:** `controller.test.ts` mit Fake-`CalculatorView` (zeichnet Aufrufe auf) und echtem `calcEngine`.
- **Review-Schwerpunkte:** saubere Trennung (keine Rechenlogik im Controller).
- **Doku-Pflichten:** keine
- **Aufwand:** S · **Modell:** sonnet · **Effort:** medium
- **Kürzbar bei Budgetnot:** nein
- **Commit-Typ:** `feat(AP-04): wire calculator mode`

#### AP-05 – Spiellogik

- **Meilenstein, Lane, Welle:** M1 · CORE · W3 (vorziehbar nach W2)
- **Ziel:** Deterministische, DOM-freie Flappy-Logik als `GameEngine` mit gut spielbarer Standard-Konfiguration für das kleine Display.
- **Pflichtlektüre:** §2 F-02, `src/contracts/game.ts`, `src/contracts/ui.ts` (`DISPLAY_CANVAS`); PE-10, PE-13
- **Abhängigkeiten:** AP-01
- **Parallel möglich mit:** AP-04, AP-06 (vorgezogen auch AP-02, AP-03, AP-07)
- **Dateien (Eigentum):** `src/game/config.ts`, `src/game/engine.ts`, `src/game/engine.test.ts`, `src/game/index.ts`
- **Nicht anfassen:** `src/game/render.ts`, `src/game/render.test.ts`, `src/leaderboard/**`, `src/app/**`, `src/main.ts`, `src/contracts/**`
- **Freigegebene Abhängigkeiten:** keine
- **Umsetzung:**
  1. `config.ts`: `DEFAULT_GAME_CONFIG: GameConfig` mit `width/height` aus `DISPLAY_CANVAS`; Startwerte z. B. gravity ≈ 360, flapVelocity ≈ −110, pipeSpeed ≈ 40, pipeGap ≈ 18, pipeWidth ≈ 8, pipeSpacing ≈ 50, birdX ≈ 24, birdSize ≈ 8, groundHeight ≈ 2 (Coder justiert für Spielbarkeit).
  2. `create(config)`: `status: 'ready'`, π in der Mitte, keine Röhren, `score: 0`.
  3. `step(...)`: `dtMs` auf `MAX_STEP_MS` begrenzen. `ready`: π schwebt still; `flap` → `running` + Flattern. `running`: `flap` setzt `birdVy = flapVelocity`; Schwerkraft; Röhren mit `pipeSpeed` nach links; neue Röhre, wenn Abstand ≥ `pipeSpacing`; `gapY` per `rng` mit Rand ≥ 4 px; Röhren links außerhalb entfernen; `score+1` und `passed = true`, wenn Röhre `birdX` passiert; Kollision (Box `birdSize`) mit Röhre, Decke oder Boden → `over`. `over`: Zustand bleibt unverändert.
  4. Reine Funktionen, Zustand nie mutieren. `index.ts` exportiert `gameEngine`, `DEFAULT_GAME_CONFIG`.
- **Schnittstellen:** implementiert `GameEngine`.
- **Akzeptanzkriterien:** deterministisch mit fester `rng`; Tests decken Start, Schwerkraft, Flattern, Röhren-Spawn/-Entfernen, Punkte, Kollision Röhre/Boden/Decke, dt-Begrenzung ab.
- **Tests:** `engine.test.ts`.
- **Review-Schwerpunkte:** Reinheit, Randfälle, keine DOM-/Zeitabhängigkeit.
- **Doku-Pflichten:** Kommentar zu den Konfigurationswerten.
- **Aufwand:** M · **Modell:** sonnet · **Effort:** high
- **Kürzbar bei Budgetnot:** nein
- **Commit-Typ:** `feat(AP-05): add flappy pi game engine`

#### AP-06 – LCD-Renderer

- **Meilenstein, Lane, Welle:** M1 · CORE · W3 (vorziehbar nach W2)
- **Ziel:** `GameRenderer`, der den Spielzustand im LCD-Stil auf den Display-Canvas zeichnet, mit π als Vogel.
- **Pflichtlektüre:** §2 F-02, §5 (R1), `src/contracts/game.ts`, `src/contracts/ui.ts`; PE-12
- **Abhängigkeiten:** AP-01
- **Parallel möglich mit:** AP-04, AP-05 (vorgezogen auch AP-02, AP-03, AP-07)
- **Dateien (Eigentum):** `src/game/render.ts`, `src/game/render.test.ts`
- **Nicht anfassen:** `src/game/engine.ts`, `src/game/config.ts`, `src/game/index.ts`, `src/app/**`, `src/main.ts`, `src/contracts/**`
- **Freigegebene Abhängigkeiten:** keine
- **Umsetzung:**
  1. `renderGame(ctx, state, config)`: Hintergrund LCD-Grau (gleiche Farbwerte wie AP-03-Display, als Konstanten in `render.ts`), Zeichenfarbe fast schwarz; alle Koordinaten mit `Math.round` (Pixel-Optik).
  2. π per `fillText('π', …)` in Monospace-Systemschrift, Größe ≈ `birdSize`, an `(birdX, birdY)`; leicht geneigt je nach `birdVy` (optional).
  3. Röhren als gefüllte Rechtecke oben/unten mit 1-px-Kante; Boden als Linie (`groundHeight`).
  4. Punktzahl oben rechts. `ready`: Hinweis „0-9 drücken“; `over`: „GAME OVER“ mittig.
  5. Optional: schwaches LCD-Raster (jede 2. Zeile leicht aufgehellt) – kürzbar (K1).
  6. Exportiert `renderGame` (Name fix, AP-08 importiert aus `src/game/render.ts`).
- **Schnittstellen:** implementiert `GameRenderer`.
- **Akzeptanzkriterien:** zeichnet ohne Fehler für `ready`/`running`/`over`; `fillText` mit `'π'` wird aufgerufen; Anzahl Röhren-Rechtecke = 2 × Röhren; keine Bilder/Fonts von außen.
- **Tests:** `render.test.ts` mit selbstgebautem Mock-Kontext (zeichnet Aufrufe auf).
- **Review-Schwerpunkte:** R1 (keine Fremdgrafiken), keine externen Ressourcen.
- **Doku-Pflichten:** keine
- **Aufwand:** M · **Modell:** sonnet · **Effort:** medium
- **Kürzbar bei Budgetnot:** teilweise (LCD-Raster, Neigung – K1)
- **Commit-Typ:** `feat(AP-06): add lcd style pi renderer`

#### AP-07 – Bestenliste

- **Meilenstein, Lane, Welle:** M1 · CORE · W2
- **Ziel:** Robuste Top-3-Bestenliste mit Validierung und Löschfunktion über injizierten Storage.
- **Pflichtlektüre:** §2 F-03, §4 Entität ScoreEntry, §5, `src/contracts/leaderboard.ts`; PE-05, PE-11
- **Abhängigkeiten:** AP-01
- **Parallel möglich mit:** AP-02, AP-03 (ggf. vorgezogene AP-05, AP-06)
- **Dateien (Eigentum):** `src/leaderboard/**` (z. B. `store.ts`, `validate.ts`, `format.ts`, `index.ts`, `*.test.ts`)
- **Nicht anfassen:** `src/calc/**`, `src/ui/**`, `src/game/**`, `src/contracts/**`, `src/main.ts`
- **Freigegebene Abhängigkeiten:** keine
- **Umsetzung:**
  1. `createLeaderboard(storage, today?)` (Typ `CreateLeaderboard`); `today` liefert lokales Datum `JJJJ-MM-TT` (Standard aus `new Date()`).
  2. `load()`: `getItem(LEADERBOARD_KEY)` in `try/catch`; `JSON.parse` in `try/catch`; nur Array; jeden Eintrag prüfen (`initials` passt `INITIALS_PATTERN`, `score` Ganzzahl 0…`MAX_SCORE`, `date` `^\d{4}-\d{2}-\d{2}$`), ungültige verwerfen; sortieren (Punkte absteigend, bei Gleichstand älteres Datum zuerst bzw. stabile Reihenfolge); auf `MAX_ENTRIES` kürzen.
  3. `qualifies(score)`: `score > 0` und (weniger als 3 Einträge oder `score >` kleinste Punktzahl).
  4. `add(initials, score)`: ungültige Eingaben → Liste unverändert zurückgeben; sonst einfügen, sortieren, kürzen, speichern (`setItem` in `try/catch`, bei Fehler weiter im Speicher).
  5. `clear()`: `removeItem` in `try/catch`.
  6. `formatEntry(entry, rank)` → z. B. `1. 123456   42  21.10.26` (Datum `TT.MM.JJ`), Hilfsfunktion für AP-08.
  7. `index.ts` exportiert `createLeaderboard`, `formatEntry`.
- **Schnittstellen:** implementiert `LeaderboardStore`/`CreateLeaderboard`; stellt `formatEntry` bereit.
- **Akzeptanzkriterien:** max. 3 Einträge; kaputte/manipulierte Daten (kein JSON, Objekt statt Array, zu lange Kürzel, Buchstaben, negative/riesige Punkte, Skript-Strings) führen nie zu Absturz oder Anzeige ungültiger Werte; Storage, der Ausnahmen wirft, führt nicht zum Absturz.
- **Tests:** Fake-Storage (Map-basiert) und werfender Storage; alle Kriterien oben.
- **Review-Schwerpunkte:** Validierung (R6), Datensparsamkeit/Löschbarkeit (R2).
- **Doku-Pflichten:** Kommentar zum Storage-Format (Schlüssel, Version).
- **Aufwand:** M · **Modell:** sonnet · **Effort:** high
- **Kürzbar bei Budgetnot:** nein (Sicherheit/Datenschutz)
- **Commit-Typ:** `feat(AP-07): add local top-3 leaderboard`

#### AP-08 – App-Steuerung Spiel und Bestenliste

- **Meilenstein, Lane, Welle:** M1 · WEB · W4
- **Ziel:** Modus-Zustandsmaschine und Spielschleife: Rechner ↔ Spiel ↔ Kürzeleingabe ↔ Bestenliste mit exakt der vereinbarten Tastenbelegung.
- **Pflichtlektüre:** §2 F-02/F-03, §5, `src/contracts/*`, `src/app/controller.ts`, `src/game/index.ts`, `src/game/render.ts`, `src/leaderboard/index.ts`; PE-10, PE-11
- **Abhängigkeiten:** AP-04, AP-05, AP-06, AP-07
- **Parallel möglich mit:** –
- **Dateien (Eigentum):** `src/app/**` (u. a. `controller.ts`, `modes.ts`, `gameLoop.ts`, Tests), `src/main.ts`, `README.md`
- **Nicht anfassen:** `src/calc/**`, `src/ui/**`, `src/game/**`, `src/leaderboard/**`, `src/contracts/**`
- **Freigegebene Abhängigkeiten:** keine
- **Umsetzung:**
  1. Reine Übergangsfunktion in `modes.ts` (App-Zustand + Ereignis → neuer Zustand + Effekte); Controller führt Effekte aus (Display, Storage, Schleife). Zeitquelle und `Scheduler` injizierbar (Tests mit Fake).
  2. **calc:** wie AP-04; `BIRD` → `game` (neues Spiel `ready`, Canvas einblenden, Schleife starten). Rechnerzustand wird beim Wechsel ins Spiel auf `initialState` gesetzt.
  3. **game:** Ziffer → `flap` beim nächsten `step` (erste Ziffer startet); `C` oder `BIRD` → Spiel verwerfen, Schleife stoppen, Canvas ausblenden, `calc`; `%` → Spiel pausieren (Zustand merken, Schleife stoppen) → `leaderboard`; andere Tasten ignorieren. Schleife: pro Frame `step` + `renderGame`.
  4. **Game Over:** 800 ms Eingabesperre (verhindert, dass Flatter-Ziffern als Kürzel zählen); danach `qualifies(score)` → `initials`, sonst → `leaderboard`.
  5. **initials:** Anzeige `NEUER REKORD <score>` / `Kürzel: <ziffern>_`; Ziffern anhängen (max. 6), `BACK` löscht, `=` speichert (nur mit ≥ 1 Ziffer) → `leaderboard`; `C` verwirft → `leaderboard`.
  6. **leaderboard:** `showLines` mit Überschrift `BESTENLISTE` + bis zu 3 `formatEntry`-Zeilen bzw. `– leer –`. `AC` einmal → Hinweis „AC nochmal = löschen“; zweites `AC` innerhalb von 2 s → `clear()`, Anzeige aktualisieren; jede andere Taste setzt die AC-Folge zurück. `%` → zurück zum pausierten Spiel (falls vorhanden, Fortsetzen mit nächster Ziffer), sonst neues Spiel; Ziffer oder `=` → neues Spiel; `C` oder `BIRD` → `calc`.
  7. `AC` außerhalb der Bestenliste löscht nie die Liste.
  8. `main.ts`: `createLeaderboard(window.localStorage)` injizieren (Zugriff in `try/catch`; ohne Storage → In-Memory-Fallback).
  9. `README.md`: Abschnitt „Bedienung“ (Tastenbelegung Rechner, Spiel, Bestenliste).
- **Schnittstellen:** nutzt `CalcEngine`, `CalculatorView`, `GameEngine`, `renderGame`, `LeaderboardStore`, `formatEntry`, `Scheduler`.
- **Akzeptanzkriterien:** alle Übergänge oben als Tests; Spiel- und Bestenlisten-Punkte des M1-Smoke-Tests im Browser bestanden; Rechnermodus unverändert (AP-04-Tests grün).
- **Tests:** `modes.test.ts` (alle Übergänge, Doppel-AC mit Fake-Zeit, Eingabesperre), `controller.test.ts` erweitert (Fake-View, Fake-Scheduler, Fake-Storage).
- **Review-Schwerpunkte:** Löschen nur in Bestenliste (PE-11), kein `innerHTML`, keine Speicherlecks der Schleife, Tastenbelegung exakt laut PE-10/PE-11.
- **Doku-Pflichten:** README „Bedienung“.
- **Aufwand:** L · **Modell:** opus · **Effort:** high
- **Kürzbar bei Budgetnot:** nein; Pause-Fortsetzen bei `%` kürzbar (K3: `%` beendet stattdessen das Spiel)
- **Commit-Typ:** `feat(AP-08): add game and leaderboard modes`

---

## 13. Menschliche Schritte

| ID | Schritt | Ab wann nötig | Blockiert | Erledigt |
|---|---|---|---|---|
| H-01 | M1 freigeben (beim Lead) | sofort | AP-01 | ☐ |
| H-02 | Handtest Rechner im Dev-Checkout (Rechner-Punkte des Smoke-Tests) – zusammen mit H-03 am Meilensteinende | nach AP-08 (mit H-03) | M1-DEP | ☐ |
| H-03 | Vollständiger Handtest im Dev-Checkout inkl. Spielbarkeit (Schwierigkeit ok?) | nach AP-08 | M1-DEP | ☐ |
| H-04 | M1-DEP: `dev` → `stage` → `master` lokal mergen, Smoke-Tests, G3 bestätigen | nach H-03 | – | ☐ |
| H-05 | ~~Budget-Grenze des Wächters für dieses Projekt auf 50 % stellen~~ – entfallen: Plan auf 30 % angepasst, Wächter steht bewusst auf 30 % (PE-23, Nutzer am 2026-10-22) | – | – | entfallen |

Keine Konten, Käufe oder Secrets nötig. Kein Remote (PE-24).

---

## 14. Budget und Kürzungen

**Annahme für die Rechnung:** 30 % eines 5-h-Fensters (PE-23) ≈ 1,5 Agent-Stunden (Coder + Reviewer + Lead-Anteil). Reviews und Nachbesserungen schlagen mit ≈ +25 % zu Buche. Diese Umrechnung ist eine grobe Schätzung; der Lead misst den echten Verbrauch über `.claude/ma-usage.json` und meldet Abweichungen. Erster Durchlauf: Die Messwerte sollen in §18 festgehalten werden, um künftige Pläne zu kalibrieren.

| Welle | Pakete | Agent-Aufwand (+25 % Review) | Geschätzte 5-h-Fenster bei 30 % |
|---|---|---|---|
| W1 | AP-01 (M) | ≈ 1,9 h | ≈ 1–2 |
| W2 | AP-02 (L), AP-03 (M), AP-07 (M) | ≈ 6,9 h | ≈ 4–5 |
| W3 | AP-04 (S), AP-05 (M), AP-06 (M) | ≈ 4,7 h | ≈ 3 |
| W4 | AP-08 (L) | ≈ 3,1 h | ≈ 2 |
| **Gesamt M1** | 8 | **≈ 16,6 h** | **≈ 11 Fenster** |

**Zeit des Nutzers:** Freigabe, Antworten auf Rückfragen, 1–2 Handtests, 1 Deployment mit Smoke-Test ≈ 1–1,5 h.

**Ehrliche Einschätzung:** Das Budget, nicht die Zahl der Coder, begrenzt das Tempo. 3 parallele Coder verbrauchen das Fenster-Budget entsprechend schneller; der Wächter wird in W2 vermutlich bremsen. Bei durchgehendem Lauf ist mit etwa 2,5–3 Kalendertagen zu rechnen (Rechnung; W1–W3 liefen tatsächlich schneller, siehe §18). Opus-Pakete (AP-02, AP-08) sind die teuersten.

| Stufe | Kürzung | Ersparnis | Betroffene Pakete |
|---|---|---|---|
| K1 | Optik-Feinschliff weglassen (LCD-Raster, π-Neigung, Tasten-Highlight) | ≈ 0,5 h | AP-03, AP-06 |
| K2 | AP-02 mit sonnet/high statt opus/high | ≈ 1 Fenster-Anteil | AP-02 |
| K3 | `%` im laufenden Spiel beendet das Spiel statt zu pausieren | ≈ 0,5 h | AP-08 |
| – | **Nie:** Sicherheitsregeln §5, Validierung, Löschfunktion, Tests | – | – |

---

## 15. Risiken

| # | Risiko | Gegenmaßnahme | Betroffene Pakete |
|---|---|---|---|
| RI-1 | Parallele Pakete ändern dieselbe Datei | Eigentum §8, Prüfung durch den Lead | alle |
| RI-2 | Vertrag aus derselben Welle wird genutzt | Alle Verträge in AP-01 (M1 W1) | alle |
| RI-3 | Budget reicht nicht für die geplante Parallelität | Parallelität §7.2, Kürzungen §14 | alle |
| RI-4 | Prompt-Injection über Abhängigkeiten, Doku oder Daten | Wächter, Review-Punkt „Verdächtige Inhalte“, nur freigegebene Abhängigkeiten | alle |
| RI-5 | Fließkomma-Artefakte (`0,30000000000000004`) | Rundung auf 12 Stellen, Tests | AP-02 |
| RI-6 | Spiel im 120×48-Display zu schwer/ruckelig | Konfiguration in `config.ts`, `MAX_STEP_MS`, Handtest H-03, Fix-Paket bei Bedarf | AP-05, AP-08 |
| RI-7 | Flatter-Ziffern landen versehentlich im Kürzel | 800 ms Eingabesperre nach Game Over | AP-08 |
| RI-8 | `localStorage` gesperrt, voll oder manipuliert | `try/catch`, Validierung, In-Memory-Fallback | AP-07, AP-08 |
| RI-9 | Verträge erweisen sich bei den Spiel-Paketen als unpassend | Vertragsänderung nur per eigenem Paket (Lead → Planner), vor AP-08 | AP-05–AP-08 |
| RI-10 | Kein Remote: kein Backup außerhalb des PCs | Bewusst so (PE-24); Nutzer kann jederzeit ein Remote ergänzen | – |
| RI-11 | Ein großer Meilenstein: Fehler fallen erst spät im Gesamttest auf | Integrationspunkt (Checks) nach jeder Welle; Handtests H-02 + H-03 gemeinsam am Meilensteinende (Nutzerentscheidung) | AP-04, AP-08 |

---

## 16. Planungsentscheidungen und offene Fragen

### Planungsentscheidungen

| ID | Entscheidung | Begründung | Quelle |
|---|---|---|---|
| PE-01 | Pflichtumfang: Taschenrechner + Flappy Bird + lokale Bestenliste (F-01–F-03) | Projektauftrag | Nutzer am 2026-10-21 |
| PE-02 | Web-App, läuft nur lokal unter `localhost` auf dem PC des Nutzers; keine Veröffentlichung. Damit entfällt R3 (Impressum/Datenschutzerklärung), solange nicht veröffentlicht | Privatnutzung, kein Server, kein Hosting nötig | Nutzer am 2026-10-21 |
| PE-03 | Rechnerumfang: + − × ÷, Klammern, %, ±, Löschen, Rückschritt, Tastatureingabe | Wirkt wie ein echter Rechner bei mittlerem Aufwand | Nutzer am 2026-10-21 |
| PE-04 | Spielstart über sichtbaren Button/Modus-Umschalter, kein Easter Egg | Eindeutig und testbar | Nutzer am 2026-10-21 |
| PE-05 | Bestenliste: Top 3, Kürzel max. 6 Zeichen, Punkte, Datum, Lösch-Button; `localStorage` | Datensparsam, Löschbarkeit (R2) direkt erfüllt | Nutzer am 2026-10-21 |
| PE-06 | Tech-Stack: TypeScript + Vite (Vanilla), Vitest, ESLint, Prettier | Einfach, gut testbar, Node vorhanden | Nutzer am 2026-10-21 |
| PE-07 | Spiel läuft im Display des Taschenrechners; alle Bedienelemente (Flattern, Start, Beenden, Bestenliste) sind Rechnertasten | Wunsch des Nutzers | Nutzer am 2026-10-21 |
| PE-08 | Freigegebene devDependencies laut §3, keine Laufzeit-Abhängigkeiten | Standardwerkzeuge zu PE-06 | Nutzer am 2026-10-21 |
| PE-09 | Höchstens 3 Coder gleichzeitig; Freigabe pro Meilenstein; Ausschlüsse §2 bestätigt | Wunsch des Nutzers | Nutzer am 2026-10-21 |
| PE-10 | Spieltasten: „🐦“ Umschalten, Ziffern 0–9 flattern, „C“ beendet | Wunsch des Nutzers (Option 9b) | Nutzer am 2026-10-21 |
| PE-11 | Kürzel nur Ziffern (1–6) über Rechnertasten, „=“ bestätigt; „%“ zeigt Bestenliste; Doppel-„AC“ löscht nur bei angezeigter Bestenliste | Wunsch des Nutzers; Ziffern-Kürzel sind kaum personenbezogen (R2) | Nutzer am 2026-10-21 |
| PE-12 | Grafik im LCD-Stil, Vogel = π-Zeichen | Wunsch des Nutzers | Nutzer am 2026-10-21 |
| PE-13 | Konstante Schwierigkeit, kein Ton | Geringster Aufwand | Nutzer am 2026-10-21 |
| PE-14 | Architektur §4: Bausteine calc/game/leaderboard/ui/app, Verträge in `src/contracts/` | Ermöglicht parallele Pakete ohne Dateikonflikte | Nutzer am 2026-10-21 |
| PE-15 | Sicherheit §5: kein `eval`, kein `innerHTML`, Validierung der Speicherdaten, keine externen Inhalte, R3 entfällt lokal | R2, R3, R6 | Nutzer am 2026-10-21 |
| PE-16 | Umgebungen §6: kein Hosting, stage/master werden lokal gestartet; keine Env-Variablen | Folgt aus PE-02 | Nutzer am 2026-10-21 |
| PE-17 | Kein Termin, keine Kommerzialisierung; Leitprinzipien §1 | Privatprojekt | Nutzer am 2026-10-21 |
| PE-18 | Abnahmekriterien §1 | Prüfbare Liste | Nutzer am 2026-10-21 |
| PE-19 | Rechner-Löschtasten: „AC“ alles, „C“ aktuelle Eingabe (im Spiel: beenden), „⌫“ letztes Zeichen | Option 15a | Nutzer am 2026-10-21 |
| PE-20 | Worktrees unter `D:\Private Projekte\mAtaschenRechnerFlappybird_worktree\` | Agent-Regeln; Widerspruch zur Vorlage aufgelöst (Q-08) | Nutzer am 2026-10-21 |
| PE-21 | Ein Meilenstein M1 mit allen 8 Paketen in 4 Wellen; alle Verträge im Gerüst-Paket AP-01 | Erster Durchlauf, Limit soll erprobt werden; Spiel-Pakete parallel zum Rechner | Nutzer am 2026-10-21 |
| PE-22 | Modelle: opus/high für AP-02 (Parser, Sicherheit) und AP-08 (Zustandsmaschine); sonnet sonst | D11, Kernlogik | angenommen vom Planner |
| PE-23 | Team-Budget für dieses Projekt: 30 % des 5-Stunden-Limits (ursprünglich 50 % am 2026-10-21; zurückgesetzt, Wächter steht bewusst auf 30 %) | Erster Durchlauf; Nutzer belässt den Standardwert | Nutzer am 2026-10-22 |
| PE-24 | Rein lokal, kein Remote, kein Push. Gearbeitet wird nur auf `dev`, bis der Meilenstein fertig ist; danach merged der Nutzer lokal nach `stage` und `master` | Wunsch des Nutzers (Q-09) | Nutzer am 2026-10-21 |
| PE-25 | Spielablauf AP-08: „🐦“/„C“ beenden ohne Wertung; „%“ pausiert und zeigt Liste, „%“ erneut setzt fort; 800 ms Sperre nach Game Over; Kürzel mit „⌫“/„=“/„C“; in der Liste Ziffer/„=“ = neues Spiel, „C“ = Rechner, Doppel-„AC“ binnen 2 s löscht; 0 Punkte nie in der Liste | Folgt aus PE-10/PE-11; Frage 20a | Nutzer am 2026-10-21 |

### Offene Fragen

| ID | Frage | Priorität | Betrifft | Empfehlung | Status |
|---|---|---|---|---|---|
| Q-01 | Plattform und Lieferform | K | §1, §3, §5, §6 | Web-App, lokal | geklärt → PE-02 |
| Q-02 | Funktionsumfang des Taschenrechners | K | §2 F-01 | Grundrechenarten + Klammern, %, ±, Löschen | geklärt → PE-03 |
| Q-03 | Wie wird Flappy Bird aus dem Rechner gestartet? | K | §2 F-02 | sichtbarer Modus-Button | geklärt → PE-04 |
| Q-04 | Inhalt und Speicherort der Bestenliste | K | §2 F-03, §4, §5 | Top 10, localStorage | geklärt → PE-05 (Top 3, 6 Zeichen) |
| Q-05 | Tastenbelegung im Spielmodus | K | §2 F-02, F-03 | „=“ flattert | geklärt → PE-10 |
| Q-06 | Eingabe des Kürzels | K | §2 F-03 | PC-Tastatur | geklärt → PE-11 (nur Ziffern) |
| Q-07 | Spielgrafik und Schwierigkeit | W | §2 F-02 | einfache Formen | geklärt → PE-12, PE-13 |
| Q-08 | Worktree-Ort | W | §6 | `<projekt>_worktree/` | geklärt → PE-20 |
| Q-09 | Kein Git-Remote vorhanden: rein lokal arbeiten oder privates GitHub-Repo anlegen? | W | §6, §13 H-02, Lead-Push | rein lokal; Nutzer merged dev → stage → master lokal | geklärt → PE-24 |

### Vorgeschlagene Änderungen (brauchen Freigabe des Nutzers)

| Was | Änderung | Grund | Vorgeschlagen von |
|---|---|---|---|
| Plan-Vorlage im MultiAgent-Ordner, §6 | Worktree-Pfad `.claude/worktrees/` an Agent-Regeln (`<projekt>_worktree/`) angleichen | Widerspruch Vorlage ↔ Agent-Regeln (Q-08) | Planner |

---

## 17. Abdeckungsmatrix

| Anforderung oder Regel | Pakete |
|---|---|
| F-01 Taschenrechner | AP-02, AP-03, AP-04, M1-DEP |
| F-02 Flappy-π-Spiel | AP-03 („🐦“-Taste, Canvas), AP-05, AP-06, AP-08, M1-DEP |
| F-03 Lokale Bestenliste | AP-07, AP-08, M1-DEP |
| Abnahmekriterien §1 | M1-DEP (H-03, H-04) |
| §5 kein `eval` | AP-01 (Lint), AP-02 |
| §5 kein `innerHTML` | AP-01 (Lint), AP-03, AP-08 |
| §5 Validierung Speicherdaten | AP-07 |
| §5 Dev-Server nur lokal | AP-01 |
| §5 keine externen Inhalte | alle (Review) |
| R1 Recht / Urheberrecht | AP-06 (eigene Grafik), §2 Ausschlüsse |
| R2 DSGVO | AP-07 (Datensparsamkeit), AP-08 (Löschen) |
| R3 Impressum | entfällt laut PE-02 (nur lokal) |
| R4 Secrets | alle (Review); keine Secrets nötig |
| R5 Handeln außerhalb der Rolle | alle (Prozess §7.3) |
| R6 Prompt-Injection / OWASP | AP-01, AP-02, AP-03, AP-07, alle (Review) |

---

## 18. Änderungsprotokoll

| Datum | Änderung | Grund | Betroffene Pakete | Freigabe |
|---|---|---|---|---|
| 2026-10-21 | Interview begonnen, F-01–F-03 angelegt | Projektauftrag des Nutzers | – | Nutzer |
| 2026-10-21 | §1–§7 gefüllt und bestätigt, G1 erfüllt | Interview Runden 1–4 | – | Nutzer |
| 2026-10-21 | Paketschnitt §8–§17: M1 (AP-01–AP-04), M2 (AP-05–AP-08) | G1 erfüllt | AP-01–AP-08 | Planner |
| 2026-10-21 | M2 in M1 zusammengelegt (4 Wellen), Budget 50 %, rein lokal ohne Remote | Erster Durchlauf, Limit testen (PE-21, PE-23, PE-24) | AP-04–AP-08 | Nutzer |
| 2026-10-21 | Interview beendet („stop“), Selbstprüfung, PE-25 angenommen | Abschluss Interview | AP-08 | Planner |
| 2026-10-21 | PE-25 (Spielablauf) vom Nutzer bestätigt | Antwort 20a | AP-08 | Nutzer |
| 2026-10-21 | Handtest H-02 (Rechner) von nach W3/AP-04 ans Meilensteinende verlegt, läuft gemeinsam mit H-03 nach AP-08 (§9.2, §13, RI-11) | Entscheidung des Nutzers | – | Nutzer |
| 2026-10-21 | AP-01 fertig (gemergt, Review Runde 1 bestanden, c1 / `agent/AP-01-c1`); AP-02, AP-03, AP-07 bereit (W2); M1-DEP-Abhängigkeiten um H-02 ergänzt. Erkenntnisse: (a) role-guard blockiert Bash-Befehle mit dem Wort „format“ (auch in Dateiinhalten) – Coder nutzen dafür das Write-Tool; (b) `.gitignore` (node_modules, dist, coverage) hat der Lead wegen des Guards auf `dev` ergänzt; (c) Reviewer-Hinweis, niedrig, akzeptiert: `no-eval`/`no-implied-eval` greifen nicht bei `setTimeout('str')`/`window.eval`, weil in `eslint.config.js` keine Browser-Globals konfiguriert sind – Review achtet manuell darauf, keine Nutzerfrage nötig; (d) installierte Versionen: eslint 10, vite 8, vitest 5, typescript 6, jsdom 30 | Merge AP-01, Pflegeauftrag Lead | AP-01, AP-02, AP-03, AP-07, M1-DEP | Lead |
| 2026-10-21 | W2 fertig: AP-02 (c2), AP-03 (c3), AP-05 (c5, vorgezogen aus W3), AP-07 (c4) gemergt, Review Runde 1 bestanden, 183/183 Tests grün; AP-04, AP-06 bereit (W3). §9.2-Smoke-Test präzisiert: `50%=` → 0,5 (Postfix-%, wirkt erst bei `=`; `200+10%=` → 200,1). Erkenntnisse: (a) AP-05: Konfiguration weicht von den Richtwerten ab (gravity 300, flapVelocity -75, pipeGap 22); Spielbarkeit nur per Autopilot-Test belegt, Nachjustierung in `config.ts` nach H-03. `birdY` = Oberkante der Vogel-Box, `Pipe.x` = linke Kante, Boden bei `height - groundHeight` (AP-06/AP-08 beachten); (b) AP-03: Tastatur-Listener fängt zugeordnete Tasten global ab; Initialen-Eingabe in AP-08 läuft über Tasten, kein Textfeld nötig. UI-Struktur `.calc > .lcd + .keypad`, Ebenen `.lcd-text`, `.lcd-lines`, `canvas.lcd-canvas` per `hidden` umschalten; Import über `src/ui/index.ts`. Breite bis 360 px nur im CSS ausgelegt, im Handtest prüfen; (c) AP-02: `calcEngine` aus `src/calc/index.ts`; Anzeige immer aus `state.display` nehmen (Minus als U+2212), nicht die Formatierfunktion `format()` aufrufen; Zahlen mit Exponent gelten als abgeschlossen; (d) AP-07: `formatEntry` aus `src/leaderboard/index.ts`; Reviewer-Befunde niedrig: Zwischenspeicher geht verloren, wenn nur `setItem` fehlschlägt; Datum nur formgeprüft; Tests für Gleichstand fehlen; (e) AP-05, Reviewer niedrig: NaN-`dt` nicht abgefangen; (f) Guard: Reviewer/Coder können Commit-Texte mit dem Wort „format“ nicht per Datei schreiben; Budget-Wächter stand bei 30 % (H-05 offen, Nutzer muss auf 50 % stellen) | Merge W2, Pflegeauftrag Lead | AP-02, AP-03, AP-04, AP-05, AP-06, AP-07, AP-08, M1-DEP | Lead |
| 2026-10-22 | §1-Abnahmekriterium angeglichen: `50%` → 0,5 wird `50%=` → 0,5 (Postfix-%, wirkt bei `=`), passend zum Smoke-Test §9.2 | Widerspruch §1/§9.2, Pflegeauftrag Lead | AP-04, H-02 | Nutzer |
| 2026-10-22 | W3 fertig: AP-04 (c7) und AP-06 (c8) gemergt, Review Runde 1 bestanden, 195/195 Tests grün, Checks grün; AP-08 in Arbeit (c9, `agent/AP-08-c9`, opus). Erkenntnisse: (a) AP-04: `createApp` gibt `{ destroy }` zurück, `AppDeps` ist exportiert, Einhängestelle für `BIRD` im Controller markiert (AP-08); Controller-Tests decken nur `=` und den Anfangszustand, Fehler/„AC“/„C“ sind nur über die AP-02-Tests abgedeckt – AP-08 sollte diese Übergänge im Controller mittesten; (b) AP-06: `renderGame` sowie `LCD_BACKGROUND`/`LCD_INK` aus `src/game/render.ts` (Farben dupliziert aus `ui.css`, bei Farbänderung beide Stellen anpassen); keine 1-px-Röhrenkante (begründet: auf 120×48 nicht sichtbar); π-Neigung mit Antialiasing; Reviewer-Befund niedrig: kein Positionstest für die Röhrengeometrie; (c) beide Coder konnten keinen Browser-Smoketest machen – Rechner-Booten nur per Code und Build belegt, Handtest H-02/H-03 bleibt maßgeblich; (d) Budget: Wächter steht weiter bei 30 % statt 50 % (H-05/PE-23 vom Nutzer bewusst nicht umgesetzt, laut Lead); Team-Verbrauch nach Fensterreset bisher ca. 12 % | Merge W3, Pflegeauftrag Lead | AP-04, AP-06, AP-08, H-02, H-03 | Lead |
| 2026-10-22 | Team-Budgetgrenze von 50 % auf 30 % gesetzt (§0, §7.2, §14, PE-23); §14-Rechnung auf 1,5 Agent-Stunden pro Fenster umgestellt (≈ 11 statt 7–8 Fenster, keine Kürzungen); H-05 entfallen, Vorschlag zur Wächter-Konfiguration aus §16 entfernt (Wächter steht bewusst auf 30 %) | Wunsch des Nutzers („Plan auf 30 % anpassen“), Pflegeauftrag Lead | AP-08, H-05 | Nutzer |
| 2026-10-22 | W4 fertig: AP-08 (c9, opus) gemergt, Review Runde 1 bestanden, 253/253 Tests, alle Checks grün; alle Wellen W1–W4 abgeschlossen, offen nur H-02/H-03 (Handtest) und M1-DEP (Nutzer). Smoke-Test §9.2 um die Tastenzuordnung ergänzt (`Esc` = „AC“, `Entf` = „C“, `F9` = „±“, `b` = „🐦“, laut `src/ui/keyboard.ts`, README stimmt). Erkenntnisse: (a) AP-08: `src/app/modes.ts` ist eine reine Funktion `transition(state, event)`, die Effekte zurückgibt; der Controller führt die Effekte aus. Neue optionale `AppDeps` (leaderboard, game, gameConfig, render, scheduler, now, rng); `pickStorage` mit `memoryStorage.ts` als Fallback (RI-8); (b) Reviewer-Befunde niedrig, akzeptiert: Timer-Fallback im Scheduler nutzt `Date.now()` statt `performance.now()` (nur ohne rAF relevant); die 800-ms-Sperre nach Game Over blockiert auch „C“/„🐦“/„%“ (so geplant, PE-25); (c) `prettier --check .` meldet 42 nicht angefasste Dateien (kein Plan-Check, vermutlich gemischte Zeilenenden CRLF/LF) – nicht blockierend, optionales Folge-Paket (z. B. `.gitattributes`/`.prettierrc` `endOfLine` + einmal formatieren), nur nach Freigabe des Nutzers; (d) kein Coder konnte die App im Browser starten – H-02/H-03 sind der erste echte Bootnachweis | Merge W4, Pflegeauftrag Lead | AP-08, H-02, H-03, M1-DEP | Lead |
