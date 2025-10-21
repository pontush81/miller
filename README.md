<<<<<<< HEAD
# WizWealth90 – Wealth Identity Program

Ett 90-dagars personligt utvecklingsprogram skapat av Chris "The Wiz" Miller för att transformera din ekonomiska identitet.

## 🚀 Funktioner

- **90-dagars program** uppdelat i 4 faser
- **Dagliga rutiner** (10-15 min) med morgonpepp, övningar och mantran
- **Profilhantering** - Flera personer kan använda samma installation
- **Progress tracking** - Spara anteckningar och veckans mål
- **Ljus/mörkt tema** - Välj det tema som passar dig
- **Export/Import** - Säkerhetskopiera din progress
- **Helt lokalt** - All data sparas i webbläsarens localStorage

## 📦 Deployment till Vercel

### Steg 1: Installera Vercel CLI (valfritt)
```bash
npm install -g vercel
```

### Steg 2: Deploya projektet

**Alternativ A: Via Vercel Dashboard**
1. Gå till [vercel.com](https://vercel.com)
2. Klicka på "Add New Project"
3. Dra och släpp mappen `wizwealth90` eller välj den från din dator
4. Klicka på "Deploy"
5. Klar! 🎉

**Alternativ B: Via CLI**
```bash
cd /Users/pontus.horberg-Local/Downloads/wizwealth90
vercel
```

Följ instruktionerna i terminalen och välj standardinställningar.

## 🏗️ Struktur

```
wizwealth90/
├── index.html       # Hela applikationen (single-page)
├── vercel.json      # Vercel konfiguration
└── README.md        # Den här filen
```

## 💡 Användning

### Skapa profil
Vid första besöket skapas en profilmodal där du anger ditt namn. Varje profil har egen progress.

### Navigering
- **Nästa/Föregående** - Navigera mellan dagar
- **Gå till dag** - Hoppa direkt till en specifik dag
- **Idag** - Gå tillbaka till sparad dag

### Profilhantering
- Klicka på profilknappen (👤) i headern
- **Skapa ny profil** - Lägg till fler användare
- **Byt profil** - Växla mellan användare
- **Ta bort profil** - Radera en användare och deras data

### Export/Import
- **Exportera** - Spara din progress som JSON-fil
- **Importera** - Återställ progress från tidigare export

### Teman
- Klicka på tema-knappen (🌙/☀️) för att växla mellan mörkt och ljust tema

## 🔒 Säkerhet & Data

- All data lagras lokalt i webbläsarens localStorage
- Ingen data skickas till servrar
- Varje profil har isolerad data
- Använd Export-funktionen för säkerhetskopiering

## 🛠️ Anpassning

Programmet är designat för att fungera "out of the box". Vill du anpassa innehållet, redigera `generateProgram()` funktionen i `index.html`.

## 📱 Responsiv Design

Applikationen fungerar på:
- 💻 Desktop
- 📱 Mobil
- 📱 Tablet

## 🎨 Teman

**Mörkt tema** (standard):
- Bakgrund: `#0b0f16`
- Text: `#e8eef7`
- Accent: `#7bd88f`

**Ljust tema**:
- Bakgrund: `#f6f8fb`
- Text: `#111827`
- Accent: `#10b981`

## 📄 Licens

Detta projekt är för personligt bruk.

## 🆘 Support

Vid problem:
1. Kontrollera att JavaScript är aktiverat
2. Använd en modern webbläsare (Chrome, Firefox, Safari, Edge)
3. Rensa cache om något inte fungerar
4. Exportera data regelbundet som backup

---

Skapad med ❤️ för personlig utveckling och ekonomisk transformation

=======
# miller
>>>>>>> 0ded3a9a60044d98f623f050186041a7d5872e8a
