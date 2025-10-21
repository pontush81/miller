# 🚀 Deploya WizWealth90 till Vercel

Detta är en snabbguide för att få din WizWealth90-app live på internet via Vercel.

## Metod 1: Via Vercel Dashboard (Enklast! ⭐)

### Steg 1: Skapa Vercel-konto
1. Gå till [vercel.com](https://vercel.com)
2. Klicka på "Sign Up" (eller logga in om du redan har ett konto)
3. Använd GitHub, GitLab eller email

### Steg 2: Deploya projektet
1. På Vercel dashboard, klicka "Add New..." → "Project"
2. Välj "Browse" eller dra och släpp mappen `wizwealth90`
3. Vercel hittar automatiskt `vercel.json` och konfigurerar allt
4. Klicka "Deploy"
5. Vänta 30-60 sekunder... 🎉
6. Din app är live! Du får en URL typ: `wizwealth90-xxx.vercel.app`

### Steg 3: (Valfritt) Anpassa domän
1. På projekt-sidan, gå till "Settings" → "Domains"
2. Lägg till din egen domän (t.ex. `wizwealth90.se`)
3. Följ Vercels DNS-instruktioner

---

## Metod 2: Via Vercel CLI

### Steg 1: Installera Vercel CLI
```bash
npm install -g vercel
```

### Steg 2: Logga in
```bash
vercel login
```

### Steg 3: Deploya
```bash
cd /Users/pontus.horberg-Local/Downloads/wizwealth90
vercel
```

Första gången frågar Vercel:
- **Set up and deploy?** → Y (Ja)
- **Which scope?** → Välj ditt konto
- **Link to existing project?** → N (Nej)
- **What's your project's name?** → wizwealth90 (eller eget namn)
- **In which directory is your code located?** → ./

Vercel deployar nu! Du får en URL när det är klart.

### Steg 4: Production deploy
```bash
vercel --prod
```

---

## Metod 3: Via GitHub (För kontinuerlig deployment)

### Steg 1: Skapa GitHub repository
```bash
cd /Users/pontus.horberg-Local/Downloads/wizwealth90
git init
git add .
git commit -m "Initial commit: WizWealth90"
```

### Steg 2: Pusha till GitHub
1. Skapa ett nytt repository på [github.com](https://github.com/new)
2. Namnge det `wizwealth90`
3. Kör i terminalen:
```bash
git remote add origin https://github.com/DITT-ANVÄNDARNAMN/wizwealth90.git
git branch -M main
git push -u origin main
```

### Steg 3: Koppla till Vercel
1. På [vercel.com](https://vercel.com), klicka "Add New..." → "Project"
2. Välj "Import Git Repository"
3. Välj ditt `wizwealth90` repository
4. Klicka "Deploy"

**Bonus:** Nu deployar Vercel automatiskt varje gång du pushar till GitHub! 🚀

---

## ✅ Efter deployment

Din app är nu live! Testa att:
1. Besöka din Vercel URL
2. Skapa en profil
3. Testa ljus/mörkt tema
4. Navigera mellan dagar
5. Lägg till anteckningar och veckans mål
6. Exportera data (för backup)

## 🔗 Dela med andra

Ge din Vercel-URL till andra som ska använda programmet:
- De kan skapa egna profiler
- All data lagras lokalt i deras webbläsare
- Ingen konflikt mellan användare

## 📱 Lägg till på hemskärmen (mobil)

**iOS Safari:**
1. Besök din Vercel-URL
2. Tryck på "Dela"-knappen
3. Välj "Lägg till på hemskärmen"
4. Nu fungerar det som en app!

**Android Chrome:**
1. Besök din Vercel-URL
2. Tryck på ⋮ (meny)
3. Välj "Lägg till på hemskärmen"
4. Nu fungerar det som en app!

---

## 🆘 Felsökning

**Problem: Vercel hittar inte min app**
- Se till att `index.html` finns i projekt-roten

**Problem: Sidan är blank**
- Öppna Developer Console (F12) och kolla efter JavaScript-fel
- Se till att webbläsaren stödjer moderna JavaScript-features

**Problem: Data försvinner**
- Data sparas i localStorage - se till att du inte rensar webbläsarens data
- Använd Export-funktionen regelbundet för backup

**Problem: Stilen ser konstig ut**
- Hårduppdatera sidan: Ctrl+Shift+R (Windows) eller Cmd+Shift+R (Mac)
- Rensa cache och ladda om

---

## 🎉 Grattis!

Din WizWealth90 app är nu live på internet! Dela länken med vänner och familj.

**Din URL:** `https://wizwealth90-xxx.vercel.app` (eller din egen domän)

Lycka till med ditt 90-dagars program! 💪

