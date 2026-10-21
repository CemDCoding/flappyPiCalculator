<!--
MASTER-BUILD-PLAN – VORLAGE (MultiAgent-System)

setup-project.ps1 kopiert diese Vorlage nach docs/masterBuildPlan.md im Projekt.
Der Planner-Agent (ma-planner) füllt sie im Interview mit dem Nutzer und pflegt sie danach.
Er ist der einzige Agent, der diese Datei ändert. Der Lead (ma-lead) steuert den Bau danach.
Grundlage der Regeln: MultiAgent/entscheidungen.md
-->

# Master-Build-Plan mAtaschenRechnerFlappybird

**Stand:** 2026-10-21 · **Planversion:** 0.1 · **Gepflegt von:** ma-planner · **Gesteuert von:** ma-lead · **Nutzer:** Cem Dogan

Ein Taschenrechner mit eingebautem Flappy-Bird-Spiel. Das Spiel führt eine lokale Bestenliste. Meilensteine und Pakete folgen nach G1.

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
| {{PROJEKTDOKU, z. B. CLAUDE.md}} | Fachliche und technische Projektbeschreibung. Widerspricht sie diesem Plan, wird nachgefragt. |

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
| 1 | Projektkontext und Ziel | in Klärung | Termin, Abnahmekriterien | G1 |
| 2 | Umfang | in Klärung | Q-05, Q-06, Q-07 | G1 |
| 3 | Tech-Stack | angenommen | PE-08 bestätigen | G1 |
| 4 | Architektur, Datenmodell, Verträge | leer | – | G1 |
| 5 | Sicherheit, Datenschutz, Recht, Limits | leer | – | G1 |
| 6 | Umgebungen, Branches, Deployment | leer | – | G1 |
| 7 | Team-Steuerung | fertig | – | G1 |
| 8 | Lanes und Dateieigentum | leer | – | G2 |
| 9 | Meilensteine und Wellen | leer | – | G2 |
| 10 | Statusübersicht | leer | – | G2 |
| 11 | Abhängigkeitsgraph | leer | – | G2 |
| 12 | Arbeitspakete | leer | – | G2 (je Meilenstein) |
| 13 | Menschliche Schritte | leer | – | G2 |
| 14 | Budget und Kürzungen | leer | – | G2 |
| 15 | Risiken | leer | – | G2 |
| 16 | Planungsentscheidungen und offene Fragen | leer | – | laufend |
| 17 | Abdeckungsmatrix | leer | – | G2 |
| 18 | Änderungsprotokoll | leer | – | laufend |

| Gate | Bedingung | Wer prüft | Folge |
|---|---|---|---|
| **G1** Bereit zur Paketierung | §1–§7 `fertig` oder `angenommen`, keine `[K]`-Frage offen | Planner | Der Planner schneidet Pakete (§8–§17). |
| **G2(Mx)** Bereit für Meilenstein Mx | G1 erfüllt; alle Pakete von Mx vollständig; [Mensch]-Schritte stehen; Abdeckungsmatrix deckt Mx ab | Lead | Der Lead startet die erste Welle von Mx. Sonst beauftragt er den Planner mit „Verfeinerung Mx“. |
| **G3** Fertig | alle Pflicht-Meilensteine live, Abnahmekriterien aus §1 erfüllt | Nutzer | Plan wird eingefroren. |

---

## 1. Projektkontext und Ziel

<!-- LEITFRAGEN
[K] Was ist das Projekt in einem Satz, und welches Problem löst es für wen?
[K] Was wird ausgeliefert (Repository, Live-Deployment, App …), und gibt es einen Termin?
[W] Ist eine Kommerzialisierung denkbar? (beeinflusst Recht, Lizenzen, Datenschutz-Tiefe)
[W] Welche Leitprinzipien gelten bei Zielkonflikten (z. B. Sicherheit vor Funktionsumfang)?
[O] Gibt es eine bestehende Projektdokumentation, auf die verwiesen werden soll?
-->

| Feld | Wert |
|---|---|
| Einzeiler | Taschenrechner mit integriertem Flappy-Bird-Spiel und lokaler Bestenliste. |
| Zielgruppe | Der Nutzer selbst, privat |
| Lieferumfang | Repository; Web-App, die lokal auf dem PC des Nutzers unter `localhost` läuft. Keine Veröffentlichung (PE-02) |
| Termin | {{JJJJ-MM-TT oder „keiner“}} |
| Kommerzialisierung | {{nein / später möglich / geplant}} |
| Projektdokumentation | {{Verweis oder „keine“}} |

**Leitprinzipien (in Rangfolge):**

1. Sicherheit und Datenschutz werden nie gekürzt.
2. {{…}}

**Abnahmekriterien (G3):** {{prüfbare Liste}}

---

## 2. Umfang

<!-- LEITFRAGEN
[K] Welche Funktionen sind Pflicht? Pro Funktion: Was muss der Nutzer tun können?
[K] Was ist ausdrücklich NICHT im Umfang?
[W] Was ist optional und wird nur gebaut, wenn Budget bleibt?
[W] Welcher Kernfluss muss als Erstes vollständig live sein?
-->

### Pflicht

| ID | Funktion | Beschreibung aus Nutzersicht | Kernfluss |
|---|---|---|---|
| F-01 | Taschenrechner | Rechnen mit + − × ÷, Klammern, Prozent, Vorzeichenwechsel (±), Löschen (C) und Rückschritt; Bedienung per Maus und Tastatur (PE-03) | ja |
| F-02 | Flappy-Bird-Spiel | Über einen sichtbaren Button/Modus-Umschalter im Rechner das Spiel starten, spielen und zum Rechner zurückkehren (PE-04). Das Spiel läuft im Display des Taschenrechners; alle Bedienelemente sind Tasten des Rechners (PE-07, Tastenbelegung ⟦offen: Q-05⟧) | ja |
| F-03 | Lokale Bestenliste | Die 3 besten Ergebnisse mit Kürzel (max. 6 Zeichen), Punkten und Datum sehen; nach einem Top-3-Ergebnis Kürzel eingeben; Liste per Button löschen. Speicherung nur im Browser (`localStorage`) (PE-05) | ja |

### Optional

| ID | Funktion | Bedingung |
|---|---|---|
| O-01 | {{…}} | {{nur wenn alle Pflicht-Meilensteine live sind}} |

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

<!-- LEITFRAGEN
[K] Sprache(n), Frontend, Backend, Datenbank, Auth, Hosting?
[W] Monorepo oder getrennte Repositories? Paketmanager?
[W] Test-Werkzeuge und Code-Qualität (Lint, Format, Typecheck)?
[W] Externe Dienste und ihre Kostenobergrenzen? (Konten legt nur der Nutzer an)
[O] Freigegebene Abhängigkeiten: welche Pakete dürfen Coder ohne Rückfrage installieren?
-->

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

**Freigegebene Abhängigkeiten (PE-08, angenommen):** nur als devDependencies: `vite`, `typescript`, `vitest`, `jsdom`, `eslint`, `@eslint/js`, `typescript-eslint`, `prettier`, `eslint-config-prettier`. Keine Laufzeit-Abhängigkeiten. Coder installieren nur diese, und nur wenn ihnen die betroffene `package.json` gehört. Alles andere geht über Lead und Nutzer.

---

## 4. Architektur, Datenmodell und Verträge

<!-- LEITFRAGEN
[K] Welche Bausteine gibt es, und wer spricht mit wem?
[K] Welche Kernentitäten und Beziehungen? Wem gehören die Daten?
[W] Wo liegen die gemeinsamen Verträge (Schemas, API-Typen), damit parallel gebaut werden kann?
-->

**Bausteine:** {{Diagramm (Mermaid oder ASCII) und je Baustein ein Satz}}

**Grundregeln:** {{z. B. „Nur die API spricht mit der Datenbank“}}

| Entität | Wichtige Felder | Gehört zu | Löschverhalten |
|---|---|---|---|
| {{…}} | {{…}} | {{…}} | {{…}} |

**Verträge:** {{Ort und Format}}. Regel: Jeder Vertrag entsteht in einem eigenen Paket mindestens eine Welle vor seinen Nutzern.

---

## 5. Sicherheit, Datenschutz, Recht und Limits

<!-- LEITFRAGEN
[K] Wie werden Nutzer authentifiziert, und wie wird Zugriff auf fremde Daten verhindert?
[K] Welche personenbezogenen Daten werden verarbeitet? Welche DSGVO-Pflichten folgen daraus (Löschen, Export, EU-Hosting, Auftragsverarbeitung)?
[K] Gibt es eine öffentliche Webseite? Dann: Impressum und Datenschutzerklärung (R3), Einwilligung für Cookies/Tracking/externe Inhalte.
[W] Missbrauchs- und Kostenlimits (Raten, Größen, Tageslimits)?
[W] Härtung (Header, CORS, Validierung, XSS, CSRF)?
[O] Besondere Angriffsflächen (Uploads, KI-Eingaben/Prompt-Injection)?
-->

Es gelten immer R1–R6 (siehe Agent-Dateien). Dieser Abschnitt konkretisiert sie für das Projekt.

| Regel | Umsetzung (grob) | Testart | Paket |
|---|---|---|---|
| {{z. B. Jede Abfrage filtert nach user_id}} | {{…}} | {{…}} | {{AP-xx}} |
| Impressum und Datenschutzerklärung (R3) | {{…}} | {{Seite erreichbar}} | {{AP-xx}} |
| Secrets nur in `.env`, `.env.example` gepflegt (R4) | {{…}} | {{Review}} | alle |

| Limit | Standard | Ebene |
|---|---|---|
| {{…}} | {{…}} | {{pro Nutzer / global}} |

**Nie kürzbar:** {{Liste}}

**Vom Nutzer rechtlich zu prüfen (vor Kommerzialisierung):** {{z. B. Impressumsangaben, AGB, Auftragsverarbeitungsverträge}}

---

## 6. Umgebungen, Branches und Deployment

<!-- LEITFRAGEN
[K] Wo laufen stage und Produktion? Was löst ein Deployment aus?
[W] Welche Konten und Secrets muss der Nutzer anlegen, und bis wann?
[W] Datenbanken: welche Dev-Datenbank nutzen Agents? Eigene DB-Benutzer pro Rolle (agentDev / agentLead)?
[O] Wie sieht ein Smoke-Test nach dem Deployment aus?
-->

| Umgebung | Frontend | Backend | Datenbank | Auslöser |
|---|---|---|---|---|
| lokal / dev | {{…}} | {{…}} | {{Dev-DB, Agents schreiben}} | – |
| stage | {{…}} | {{…}} | {{Stage-DB, Agents höchstens lesen}} | {{Merge dev → stage durch den Nutzer}} |
| Produktion | {{…}} | {{…}} | {{Prod-DB, Agents höchstens lesen}} | {{Merge stage → master durch den Nutzer}} |

| Branch | Zweck | Wer schreibt darauf |
|---|---|---|
| `master` | Produktion | **[Mensch]**, per Pull Request von `stage` |
| `stage` | Abnahme | **[Mensch]**, per Pull Request von `dev` |
| `dev` | Integration, Default-Branch | ma-lead (`merge --no-ff`, `push`), ma-planner (nur Plan-Commits) |
| `agent/AP-<nr>-c<n>` | ein Arbeitspaket | ma-coder (`commit`), nur lokal, wird nach dem Merge gelöscht |

**Worktrees:** werden beim Start eines Coders automatisch unter `.claude/worktrees/` angelegt (gitignored) und vom Lead nach dem Merge entfernt.

**Parallele Coder und lokale Ressourcen:** {{z. B. jede Worktree-Instanz nutzt eigenen Port / eigenes DB-Schema, Variablen in .env.example: PORT, DB_SCHEMA}}

**Env-Dateien:** `.env` füllt nur der Nutzer. Agents sehen `.env.example`. {{Welche Variablen braucht ein Worktree, und wie kommt er an sie, ohne dass ein Agent sie liest? z. B. Anwendung lädt ../../.env des Hauptcheckouts}}

**Deployment-Anleitung:** {{Verweis}}

---

## 7. Team-Steuerung

<!-- LEITFRAGEN
[K] Wie viele Coder dürfen höchstens gleichzeitig laufen? (Engpass: Budget, nicht Technik)
[W] Freigabe: pro Welle oder pro Meilenstein?
[W] Welche Modelle und welcher Aufwand für welche Paketgröße / welches Risiko?
-->

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
  L -->|"merge --no-ff, push"| DEV["dev"]
  L -->|"Pflegeauftrag"| P
  N -->|"PR dev → stage → master"| PROD["stage / master"]
```

### 7.2 Parallelität, Budget, Modelle

- **Höchstens gleichzeitig:** 3 Coder (PE-09). Der Budget-Wächter kann trotzdem früher bremsen (§14).
- **Budget (D11b):** Das Team nutzt höchstens **30 %** des 5-Stunden-Limits. Der Wächter stoppt neue Coder, sobald es erreicht ist. Dann fragt der Lead den Nutzer. Ohne Antwort geht es nach dem Reset weiter (D11c).
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

<!-- LEITFRAGEN
[W] Welche parallelen Arbeitsstränge ergeben sich aus der Architektur?
[W] Welche Dateien brauchen viele Pakete (Registrierung, Schema, package.json, Lockfile, Layouts)?
-->

| Lane | Zuständigkeit | Ordner und Dateien |
|---|---|---|
| **{{SH}}** – Verträge | {{…}} | `{{…}}` |
| **{{API}}** – Backend | {{…}} | `{{…}}` |
| **{{WEB}}** – Frontend | {{…}} | `{{…}}` |
| **{{OPS}}** – Infrastruktur und Doku | {{…}} | `{{…}}` (ohne `.github/workflows`, das macht der Nutzer) |
| **HUM** – Mensch | Konten, Secrets, Deployments, Smoke-Tests | – |

**Grundregeln:**

1. Innerhalb einer Welle gehört jede Datei höchstens einem Paket.
2. Verträge entstehen mindestens eine Welle vor ihren Nutzern.
3. Gemeinsame Dateien legt ein Gerüst-Paket in Welle 1 eines Meilensteins an.
4. Konflikte im Lockfile sind erwartet. Der Lead löst sie beim Merge mit `{{npm install}}`.

| Gemeinsame Datei | Wer ändert sie | Wann |
|---|---|---|
| `{{…}}` | {{…}} | {{…}} |

---

## 9. Meilensteine und Wellen

<!-- LEITFRAGEN
[K] In welche Meilensteine lässt sich der Umfang schneiden, sodass jeder für sich live geht?
[W] Was ist nach jedem Meilenstein live prüfbar?
-->

| # | Meilenstein | Inhalt | Live-Zustand |
|---|---|---|---|
| M0 | {{Fundament}} | {{…}} | {{…}} |

### 9.1 Ablauf einer Welle

| Schritt | Inhalt | Wer |
|---|---|---|
| 0 Lagebild | `dev` sauber, Abhängigkeiten `fertig`, Eigentum ohne Überschneidung, Budget | Lead |
| 1 Wellenplan | Pakete, Coder-Nr., Modell; Freigabe laut §7.2 | Lead → Nutzer |
| 2 Delegieren | Coder im Hintergrund starten, je eigener Worktree | Lead |
| 3 Umsetzen | Code, Tests, Commits auf `agent/AP-<nr>-c<n>`, Bericht | Coder |
| 4 Review | Urteil; bei „nicht bestanden“ Nachbesserung durch denselben Coder, max. 2 Runden | Reviewer, Lead, Coder |
| 5 Mergen | `merge --no-ff` in `dev`, Reihenfolge {{SH → API → WEB → OPS}} | Lead |
| 6 Integrationspunkt | Install, Checks, Handtest-Checkliste; rot → Fix-Paket | Lead (+ Nutzer für Handtest) |
| 7 Abschluss | `push origin dev`, Worktrees und Branches aufräumen, Plan pflegen | Lead, Planner |

### 9.2 Meilensteine im Detail

#### M{{x}} – {{Name}}

| Welle | Pakete (parallel) |
|---|---|
| W1 | {{Gerüst- und Vertragspakete}} |
| W{{n}} | M{{x}}-DEP [Mensch] |

**Integration:** {{was nach welcher Welle von Hand geprüft wird}}

##### M{{x}}-DEP – Deployment [Mensch]

- Pull Request `dev` → `stage`, mergen, Smoke-Test auf stage
- Pull Request `stage` → `master`, mergen, Smoke-Test in Produktion
- **Smoke-Test:**
  - [ ] {{prüfbarer Punkt}}

---

## 10. Statusübersicht

Gepflegt von ma-planner (im Auftrag des Leads). Aufwand: S ≈ {{0,75}} h · M ≈ {{1,5}} h · L ≈ {{2,5}} h Agent-Zeit, H = Mensch.

Status: `offen` · `bereit` · `in Arbeit` · `Review` · `fertig` (gemergt in dev) · `blockiert`

| ID | Titel | M | Lane | Welle | Abhängigkeiten | Aufwand | Modell | Coder / Branch | Status |
|---|---|---|---|---|---|---|---|---|---|
| AP-01 | {{…}} | M0 | {{SH}} | W1 | – | {{S}} | {{haiku}} | – | offen |

---

## 11. Abhängigkeitsgraph

```mermaid
flowchart LR
  subgraph M0["M0 {{Name}}"]
    AP01["AP-01"] --> AP02["AP-02"]
  end
```

**Kritischer Pfad:** {{…}}

---

## 12. Arbeitspakete

<!-- Regeln:
- Ein Paket passt in eine Agent-Sitzung (1–3 h) und ergibt einen einzeln committbaren, getesteten Stand.
- Ein Coder muss es allein mit Paket und Pflichtlektüre umsetzen können, ohne Rückfrage.
- Knappe, konkrete Schritte, keine fertigen Code-Blöcke.
- IDs fortlaufend über alle Meilensteine: AP-01, AP-02 …
-->

#### AP-{{nn}} – {{Titel}}

- **Meilenstein, Lane, Welle:** M{{x}} · {{LANE}} · W{{n}}
- **Ziel:** {{ein bis zwei Sätze}}
- **Pflichtlektüre:** {{Datei und Abschnitt, PE-xx}}
- **Abhängigkeiten:** {{AP-IDs, H-xx}}
- **Parallel möglich mit:** {{AP-IDs}}
- **Dateien (Eigentum):** {{Pfade}}
- **Nicht anfassen:** {{Dateien paralleler Pakete}}
- **Freigegebene Abhängigkeiten:** {{Pakete oder „keine“}}
- **Umsetzung:**
  1. {{…}}
- **Schnittstellen:** {{genutzte oder bereitgestellte Verträge}}
- **Akzeptanzkriterien:**
  - {{prüfbar formuliert}}
- **Tests:** {{welche Tests das Paket schreibt}}
- **Review-Schwerpunkte:** {{z. B. Autorisierung, DSGVO, Impressum, Eingabevalidierung}}
- **Doku-Pflichten:** {{z. B. .env.example, README}}
- **Aufwand:** {{S / M / L}} · **Modell:** {{haiku / sonnet / opus}} · **Effort:** {{low / medium / high}}
- **Kürzbar bei Budgetnot:** {{ja / nein, mit Begründung}}
- **Commit-Typ:** `{{feat|fix|…}}(AP-{{nn}}): {{what}}`

---

## 13. Menschliche Schritte

| ID | Schritt | Ab wann nötig | Blockiert | Erledigt |
|---|---|---|---|---|
| H-01 | {{z. B. .env aus .env.example anlegen und füllen}} | {{sofort}} | {{…}} | ☐ |

---

## 14. Budget und Kürzungen

| Meilenstein | Pakete | Agent-Aufwand | Geschätzte 5-h-Fenster bei 30 % Team-Budget |
|---|---|---|---|
| M{{x}} | {{n}} | {{h}} | {{n}} |
| **Gesamt** | | | |

**Zeit des Nutzers:** {{Freigaben, Entscheidungen, Deployments, Smoke-Tests – geschätzt h}}

**Ehrliche Einschätzung:** {{…}}

| Stufe | Kürzung | Ersparnis | Betroffene Pakete |
|---|---|---|---|
| K1 | {{…}} | {{…}} | {{…}} |

---

## 15. Risiken

| # | Risiko | Gegenmaßnahme | Betroffene Pakete |
|---|---|---|---|
| RI-1 | Parallele Pakete ändern dieselbe Datei | Eigentum §8, Prüfung durch den Lead | alle |
| RI-2 | Vertrag aus derselben Welle wird genutzt | Verträge eine Welle früher | Vertragsnutzer |
| RI-3 | Budget reicht nicht für die geplante Parallelität | Parallelität §7.2, Kürzungen §14 | alle |
| RI-4 | Prompt-Injection über Abhängigkeiten, Doku oder Daten | Wächter, Review-Punkt „Verdächtige Inhalte“, nur freigegebene Abhängigkeiten | alle |
| RI-{{n}} | {{…}} | {{…}} | {{…}} |

---

## 16. Planungsentscheidungen und offene Fragen

### Planungsentscheidungen

| ID | Entscheidung | Begründung | Quelle |
|---|---|---|---|
| PE-01 | Pflichtumfang: Taschenrechner + Flappy Bird + lokale Bestenliste (F-01–F-03) | Projektauftrag | Nutzer am 2026-10-21 |
| PE-02 | Web-App, läuft nur lokal unter `localhost` auf dem PC des Nutzers; keine Veröffentlichung. Damit entfällt R3 (Impressum/Datenschutzerklärung), solange nicht veröffentlicht | Privatnutzung, kein Server, kein Hosting nötig | Nutzer am 2026-10-21 |
| PE-03 | Rechnerumfang: + − × ÷, Klammern, %, ±, C, Rückschritt, Tastatureingabe | Wirkt wie ein echter Rechner bei mittlerem Aufwand | Nutzer am 2026-10-21 |
| PE-04 | Spielstart über sichtbaren Button/Modus-Umschalter, kein Easter Egg | Eindeutig und testbar | Nutzer am 2026-10-21 |
| PE-05 | Bestenliste: Top 3, Kürzel max. 6 Zeichen, Punkte, Datum, Lösch-Button; `localStorage` | Datensparsam, Löschbarkeit (R2) direkt erfüllt | Nutzer am 2026-10-21 |
| PE-06 | Tech-Stack: TypeScript + Vite (Vanilla), Vitest, ESLint, Prettier | Einfach, gut testbar, Node vorhanden | Nutzer am 2026-10-21 |
| PE-07 | Spiel läuft im Display des Taschenrechners; alle Bedienelemente (Flattern, Start, Beenden, Bestenliste) sind Rechnertasten | Wunsch des Nutzers | Nutzer am 2026-10-21 |
| PE-08 | Freigegebene devDependencies laut §3, keine Laufzeit-Abhängigkeiten | Standardwerkzeuge zu PE-06 | angenommen vom Planner |
| PE-09 | Höchstens 3 Coder gleichzeitig; Freigabe pro Meilenstein; Ausschlüsse §2 bestätigt | Wunsch des Nutzers | Nutzer am 2026-10-21 |

### Offene Fragen

| ID | Frage | Priorität | Betrifft | Empfehlung | Status |
|---|---|---|---|---|---|
| Q-01 | Plattform und Lieferform (Web, Desktop, Mobile; nur lokal oder veröffentlicht) | K | §1, §3, §5, §6 | Web-App, statisch, zunächst nur lokal | geklärt → PE-02 |
| Q-02 | Funktionsumfang des Taschenrechners | K | §2 F-01 | Grundrechenarten + Klammern, %, ±, Löschen | geklärt → PE-03 |
| Q-03 | Wie wird Flappy Bird aus dem Rechner gestartet? | K | §2 F-02 | sichtbarer Modus-Button | geklärt → PE-04 |
| Q-04 | Inhalt und Speicherort der Bestenliste | K | §2 F-03, §4, §5 | Top 10, Kürzel + Punkte + Datum, localStorage | geklärt → PE-05 (Top 3, 6 Zeichen) |
| Q-05 | Tastenbelegung im Spielmodus (Flattern, Pause/Beenden, Bestenliste, Löschen) | K | §2 F-02, F-03 | Taste „=“ flattert, „C“ beendet, Leertaste zusätzlich | offen |
| Q-06 | Wie wird das Kürzel (6 Zeichen) eingegeben, wenn alle Tasten Rechnertasten sind? | K | §2 F-03 | PC-Tastatur, Bestätigung mit „=“ | offen |
| Q-07 | Spielgrafik und Schwierigkeit im Display | W | §2 F-02 | einfache Formen, konstante Schwierigkeit, kein Ton | offen |

### Vorgeschlagene Änderungen (brauchen Freigabe des Nutzers)

| Was | Änderung | Grund | Vorgeschlagen von |
|---|---|---|---|
| {{…}} | {{…}} | {{…}} | {{Lead / Reviewer / Planner}} |

---

## 17. Abdeckungsmatrix

| Anforderung oder Regel | Pakete |
|---|---|
| {{F-01 …}} | {{AP-xx}} |
| R2 DSGVO | {{…}} |
| R3 Impressum | {{…}} |
| R4 Secrets | alle (Review) |

---

## 18. Änderungsprotokoll

| Datum | Änderung | Grund | Betroffene Pakete | Freigabe |
|---|---|---|---|---|
| 2026-10-21 | Interview begonnen, F-01–F-03 angelegt | Projektauftrag des Nutzers | – | Nutzer |
