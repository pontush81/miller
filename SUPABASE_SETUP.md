# 🚀 Supabase Setup Guide för WizWealth90

Detta är en steg-för-steg guide för att sätta upp Supabase backend för WizWealth90.

## 🎯 Varför Supabase?

✅ **Fördelar:**
- ☁️ Cloud-synk mellan alla enheter (mobil, desktop, tablet)
- 🔐 Säker autentisering med email/password
- 💾 Automatisk backup i databasen
- 🔄 Realtids-synk (optionellt)
- 🆓 Gratis upp till 500MB + 50,000 månatliga användare
- 🔒 Row Level Security - varje användare ser bara sin data

## 📋 Steg 1: Skapa Supabase-projekt

### 1.1 Registrera konto
1. Gå till [https://supabase.com](https://supabase.com)
2. Klicka "Start your project"
3. Logga in med GitHub (rekommenderat)

### 1.2 Skapa nytt projekt
1. Klicka "New Project"
2. Välj din organisation
3. Fyll i:
   - **Name:** wizwealth90
   - **Database Password:** (generera ett starkt lösenord - **SPARA DETTA!**)
   - **Region:** Välj närmaste (t.ex. `eu-north-1` för Sverige)
4. Klicka "Create new project"
5. Vänta 2-3 minuter medan projektet sätts upp ☕

## 📋 Steg 2: Kör databas-migrations

### 2.1 Öppna SQL Editor
1. I Supabase Dashboard, gå till **SQL Editor** (vänster meny)
2. Klicka "New query"

### 2.2 Kör schema
1. Öppna filen `supabase/schema.sql` från projektet
2. Kopiera **hela** SQL-koden
3. Klistra in i SQL Editor
4. Klicka "Run" (eller Cmd+Enter)
5. Du ska se meddelande: "Success. No rows returned"

✅ **Databasen är nu klar!** Du har:
- `profiles` - användarprofiler
- `daily_notes` - dagliga anteckningar
- `weekly_goals` - veckans mål

## 📋 Steg 3: Aktivera Email Authentication

### 3.1 Konfigurera Auth
1. Gå till **Authentication** → **Providers** (vänster meny)
2. **Email** ska redan vara aktiverad
3. Under **Email** settings:
   - ✅ Enable Email provider
   - ✅ Confirm email (rekommenderat för produktion)
   - 📧 Customize email templates (valfritt)

### 3.2 Konfigurera URL Settings
1. Gå till **Authentication** → **URL Configuration**
2. Lägg till dina URLs:
   - **Site URL:** `http://localhost:3000` (för dev)
   - **Redirect URLs:** 
     - `http://localhost:3000`
     - `https://din-app.vercel.app` (när du deployat)

## 📋 Steg 4: Hämta API-nycklar

### 4.1 Project API keys
1. Gå till **Settings** → **API** (längst ner i vänster meny)
2. Du behöver två nycklar:

```bash
# Project URL
https://xxxxx.supabase.co

# anon public (detta är säkert att dela!)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **VIKTIGT:** Service Role key behövs **INTE** - den är för backend endast!

### 4.2 Skapa .env.local
1. I projekt-roten, kopiera `.env.example`:
```bash
cp .env.example .env.local
```

2. Fyll i dina nycklar i `.env.local`:
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📋 Steg 5: Testa lokalt

### 5.1 Öppna index.html
1. Dubbelklicka på `index.html`
2. Du ska se inloggnings-formulär
3. Skapa ett testkonto:
   - Email: `test@example.com`
   - Password: `Test1234!`
4. Klicka "Registrera"

### 5.2 Verifiera i Supabase
1. Gå till **Table Editor** i Supabase Dashboard
2. Öppna `profiles` table
3. Du ska se din användare! 🎉

## 📋 Steg 6: Deploya till Vercel

### 6.1 Lägg till Environment Variables
1. Gå till [vercel.com](https://vercel.com) → ditt projekt
2. Gå till **Settings** → **Environment Variables**
3. Lägg till:
   - `SUPABASE_URL` = `https://xxxxx.supabase.co`
   - `SUPABASE_ANON_KEY` = `eyJ...`
4. Välj **Production**, **Preview**, och **Development**

### 6.2 Uppdatera Supabase Auth URLs
1. I Supabase: **Authentication** → **URL Configuration**
2. Lägg till din Vercel URL:
   - **Site URL:** `https://wizwealth90.vercel.app`
   - **Redirect URLs:** `https://wizwealth90.vercel.app`

### 6.3 Redeploya
```bash
git add .
git commit -m "Add Supabase integration"
git push origin main
```

Vercel deployar automatiskt! 🚀

## 🔒 Steg 7: Säkerhet (Viktigt!)

### 7.1 Row Level Security (RLS)
✅ Redan aktiverat i schema! Varje användare kan endast:
- Se sin egen data
- Redigera sin egen data
- Inte se andras data

### 7.2 Email verifiering
För produktion, aktivera email-verifiering:
1. **Authentication** → **Email** → **Confirm email** (✅)
2. Konfigurera SMTP (valfritt) för branded emails

### 7.3 Rate limiting
Supabase har automatisk rate limiting, men överväg:
- Max 3 signup-försök per IP/timme
- Max 5 login-försök per email/timme

## 📊 Steg 8: Databas-backup (Rekommenderat)

### Manuell backup
1. **Database** → **Backups**
2. Klicka "Manual Backup"
3. Spara med beskrivning (t.ex. "Before launch")

### Automatisk backup
- Gratis plan: Dagliga backups (7 dagars historik)
- Pro plan: Point-in-time recovery

## 🎉 Klart!

Nu har du:
- ✅ Cloud-databas med Supabase
- ✅ Säker autentisering
- ✅ Synk mellan alla enheter
- ✅ Automatisk backup
- ✅ Row Level Security

## 🆘 Felsökning

### Problem: "Invalid API key"
- Kontrollera att `.env.local` har rätt nycklar
- Se till att du använder **anon** key, inte **service_role**

### Problem: "User already registered"
- Gå till **Authentication** → **Users** i Supabase
- Ta bort testkontot
- Prova igen

### Problem: "Failed to fetch"
- Kontrollera att `SUPABASE_URL` är korrekt
- Se till att du har internet
- Kolla browser console (F12) för detaljer

### Problem: Kan inte se data
- Verifiera att RLS policies kördes (steg 2.2)
- Kolla att du är inloggad med rätt användare
- Öppna **Table Editor** och kolla manuellt

## 📚 Nästa steg

- [ ] Testa skapa konto och logga in
- [ ] Testa på mobil och desktop samtidigt (synk!)
- [ ] Bjud in testanvändare
- [ ] Övervaka användning i Supabase Dashboard
- [ ] Sätt upp email-notifieringar för errors

## 💡 Tips

- **Gratis plan:** 500MB databas, 2GB dataöverföring/månad
- **Upgrade när:** >1000 aktiva användare eller >500MB data
- **Alternativ:** Supabase är open source - du kan self-hosta!

---

**Lycka till med din WizWealth90 app med cloud-power!** ☁️💪

