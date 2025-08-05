# Claude Code Configuration - Hivemind Backend-Optimierung

## 🚨 PROJEKT-SPEZIFISCHE REGELN

**ABSOLUTE REGELN**:
1. NIEMALS lokale Server starten oder lokale Entwicklungsumgebung nutzen
2. IMMER nach Code-Änderungen zu GitHub pushen für automatisches Deployment
3. Backend-Code MUSS mit Supabase, Render.com/Railway kompatibel sein
4. Frontend auf Vercel darf NICHT modifiziert werden (ist perfekt wie es ist)
5. Fokus auf ANPASSUNG des bestehenden Backends, nicht Neuentwicklung

## 🎯 HIVEMIND-MISSION

**Hauptauftrag**: "Analysiere das gesamte Projekt (Frontend + Backend + Configs), verstehe alle Frontend-Funktionen und passe das bestehende Backend so an, dass ALLE Funktionen vollständig funktionsfähig sind."

## Projekt-Struktur

```
/
├── backend/          # Bestehendes Backend (teilweise funktionsfähig)
├── frontend/         # Frontend (PERFEKT - NICHT ÄNDERN)
├── package.json      # Root-Konfiguration
└── *.json           # Weitere Konfigurationsdateien
```

### Deployment-Pipeline
- **Datenbank**: Supabase (PostgreSQL)
- **Backend**: Render.com / Railway (Auto-Deploy via GitHub)
- **Frontend**: Vercel (läuft perfekt)
- **Repository**: GitHub (Push löst Auto-Deployment aus)

## 🧠 HIVEMIND START-BEFEHL

```bash
# Komplette Projekt-Analyse und Backend-Optimierung in einem Befehl:
npx claude-flow hivemind start "Analysiere das gesamte Projekt-Root mit Frontend, Backend und allen Configs. Das Frontend ist perfekt. Das Backend existiert bereits und ist teilweise funktionsfähig. Identifiziere alle Frontend-Features und API-Calls, dann passe das bestehende Backend an, damit ALLE Funktionen vollständig funktionieren. Behalte die bestehende Backend-Struktur bei und ergänze/fixe nur was fehlt. Alle benötigten Zugangsdaten und API-Keys findest du in der .env Datei."
```

## 📋 HIVEMIND-ARBEITSWEISE

Der Hivemind wird:

1. **Vollständige Projekt-Analyse**
   - Scannt alle Dateien im Root-Verzeichnis
   - Versteht Frontend-Funktionen und UI-Komponenten
   - Analysiert bestehende Backend-Implementierung
   - Identifiziert Lücken zwischen Frontend-Erwartungen und Backend-Reality

2. **Backend-Anpassung (NICHT Neuentwicklung)**
   - Behält bestehende, funktionierende Backend-Teile
   - Ergänzt fehlende Endpoints
   - Fixt nicht-funktionierende Endpoints
   - Passt Supabase-Queries an
   - Stellt Auth-Funktionalität sicher

3. **Automatisches Deployment**
   - Committet alle Änderungen
   - Pusht zu GitHub
   - Deployment läuft automatisch

## 🔄 Workflow nach Hivemind-Start

```bash
# 1. Hivemind starten (einmaliger Befehl)
npx claude-flow hivemind start "[Mission wie oben]"

# 2. Hivemind arbeitet autonom:
# - Analysiert alles
# - Passt Backend an
# - Testet Funktionalität
# - Pushed zu GitHub

# 3. Optional: Status checken
npx claude-flow hivemind status

# 4. Optional: Spezifische Features nachbessern
npx claude-flow hivemind task "Fixe [spezifisches Feature] im Backend"
```

## ⚠️ WICHTIGE HIVEMIND-REGELN

1. **Frontend = Heilig**: Kein einziges Zeichen im Frontend ändern
2. **Backend = Anpassen, nicht neu schreiben**: Bestehende Struktur respektieren
3. **Deployment = Automatisch**: Nach jeder Änderung Git push
4. **Secrets = Cloud only**: Keine .env Dateien committen
5. **Testing = Pragmatisch**: Funktionalität vor Perfektion
6. **Environment Variables**: Alle Zugangsdaten, API-Keys und Konfigurationsvariablen befinden sich in der .env Datei im backend ordner.

## 🚀 Quick-Commands

```bash
# Projekt-Analyse und Backend-Fix in einem:
npx claude-flow hivemind start "Fix Backend für vollständige Web-App Funktionalität"

# Spezifisches Feature fixen:
npx claude-flow hivemind task "User-Login funktioniert nicht - fix Backend Auth"

# Status prüfen:
npx claude-flow hivemind status

# Logs ansehen:
npx claude-flow hivemind logs
```

## 📊 Hivemind-Prioritäten

1. **Authentication/Authorization** - Basis für alles
2. **CRUD Operations** - Kern-Funktionalität
3. **API-Endpoints** - Frontend-Backend Kommunikation
4. **Error Handling** - Robustheit
5. **Performance** - Optimierung

## 🔧 Backend-Checkliste für Hivemind

Für jede Frontend-Funktion prüfen:
- [ ] Existiert der API-Endpoint?
- [ ] Funktioniert er mit den Frontend-Erwartungen?
- [ ] Ist Supabase-Integration korrekt?
- [ ] Läuft Authentication/Authorization?
- [ ] Werden Errors richtig behandelt?
- [ ] Ist der Code deployment-ready?

## 🎯 Beispiel-Hivemind-Befehle

```bash
# Initiale komplette Analyse und Fix:
npx claude-flow hivemind start "Mache das Backend vollständig funktionsfähig basierend auf Frontend-Analyse"

# Nach erstem Durchlauf - spezifische Fixes:
npx claude-flow hivemind task "Dashboard zeigt keine Daten - fix API endpoints"
npx claude-flow hivemind task "User-Registrierung schlägt fehl - fix Supabase integration"
npx claude-flow hivemind task "File-Upload funktioniert nicht - implementiere Storage-Endpoints"
```

## Support & Debugging

- **Render Logs**: https://dashboard.render.com
- **Railway Logs**: https://railway.app
- **Supabase Dashboard**: https://app.supabase.com
- **GitHub Actions**: Check deployment status

---

**Remember**: Hivemind analysiert → versteht → passt an → deployed automatisch!