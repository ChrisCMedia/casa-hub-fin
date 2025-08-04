# 🚀 Casa Hub Deployment Guide

## Schritt 1: Lokaler Test (Optional aber empfohlen)

### Voraussetzungen installieren:
```bash
# PostgreSQL installieren (macOS)
brew install postgresql
brew services start postgresql

# Redis installieren (macOS)
brew install redis
brew services start redis

# Oder mit Docker:
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
docker run --name redis -p 6379:6379 -d redis
```

### Backend lokal starten:
```bash
cd backend
npm install
npm run db:push
npm run db:seed
npm run dev
```

### Frontend lokal starten:
```bash
cd frontend
npm install
npm run dev
```

**Test**: http://localhost:5173 aufrufen und mit `sarah@immobilien-weber.de` / `sarah123!` einloggen

---

## Schritt 2: Kostenlose Cloud-Services einrichten

### 2.1 Supabase Database (kostenlos)
1. Gehe zu https://supabase.com
2. "Start your project" → GitHub anmelden
3. "New project" erstellen
4. **Database Password** merken!
5. Settings → Database → Connection string kopieren

### 2.2 Upstash Redis (kostenlos)  
1. Gehe zu https://upstash.com
2. GitHub anmelden → "Create Database"
3. Region: `eu-west-1` wählen
4. **Redis URL** kopieren

### 2.3 Railway Backend (kostenlos)
1. Gehe zu https://railway.app
2. GitHub anmelden → "New Project"
3. "Deploy from GitHub repo" → Casa Hub Repository
4. Root Directory: `/backend` setzen

### 2.4 Vercel Frontend (kostenlos)
1. Gehe zu https://vercel.com
2. GitHub anmelden → "New Project"  
3. Casa Hub Repository → Build Settings:
   - Root Directory: `frontend`
   - Build Command: `npm run build`

---

## Schritt 3: Environment Variables konfigurieren

### Railway (Backend):
```bash
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
REDIS_URL=redis://:[password]@[host]:6379
JWT_SECRET=casa-hub-production-secret-2024-super-secure
JWT_REFRESH_SECRET=casa-hub-refresh-secret-2024-super-secure
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://[your-vercel-app].vercel.app
```

### Vercel (Frontend):
```bash
VITE_API_URL=https://[your-railway-app].railway.app/api
```

---

## Schritt 4: Deployment ausführen

### 4.1 Backend auf Railway:
1. Repository mit Railway verbinden
2. Environment Variables eingeben
3. Deploy starten
4. **Wichtig**: Nach erstem Deploy Datenbank initialisieren:
   ```bash
   # Railway CLI installieren
   npm install -g @railway/cli
   railway login
   railway run npm run db:push
   railway run npm run db:seed
   ```

### 4.2 Frontend auf Vercel:
1. Repository mit Vercel verbinden  
2. Environment Variables setzen
3. Deploy starten
4. Domain notieren und in Railway Backend FRONTEND_URL setzen

---

## Schritt 5: Testen und verwenden

### Test-Benutzer:
- **Admin**: `admin@casahub.com` / `admin123!`
- **Agent**: `sarah@immobilien-weber.de` / `sarah123!` 
- **Marketing**: `michael@marketing-pro.de` / `michael123!`

### Features testen:
1. **Dashboard**: Übersicht mit KPIs
2. **Properties**: Immobilien verwalten
3. **Todos**: Aufgaben mit Team
4. **Campaigns**: Marketing-Kampagnen  
5. **LinkedIn**: Social Media Posts
6. **Leads**: Interessenten verwalten
7. **Analytics**: Berichte und Statistiken

---

## 🆘 Troubleshooting

### Database Connection Error:
```bash
# Railway Terminal:
railway connect
npm run db:push
```

### CORS Error:
- FRONTEND_URL in Railway korrekt setzen
- Vercel Domain in Backend Environment eintragen

### Redis Connection Error:
- Upstash Redis URL Format prüfen: `redis://:[password]@[host]:6379`

---

## 🎯 Production Ready Features

✅ **Security**: JWT Auth, CORS, Rate Limiting
✅ **Performance**: Redis Caching, Database Optimization  
✅ **Monitoring**: Health Checks, Logging
✅ **Scalability**: Stateless Design, Socket.IO
✅ **User Experience**: Real-time Updates, Mobile Responsive

---

## 💰 Kostenlose Limits

- **Supabase**: 500MB Database, 2GB Transfer
- **Upstash**: 10k Commands/day  
- **Railway**: 500h/month, 1GB RAM
- **Vercel**: 100GB Bandwidth, Custom Domain

**Fazit**: Perfekt für Testing und kleine Teams! 🚀