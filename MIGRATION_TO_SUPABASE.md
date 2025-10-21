# 🔄 Migration från localStorage till Supabase

Detta är en guide för att migrera WizWealth90 från localStorage till Supabase cloud-databas.

## 🎯 Varför migrera?

**localStorage (nuvarande):**
❌ Data finns bara på EN enhet  
❌ Försvinner om användaren rensar cache  
❌ Ingen backup  
❌ Kan inte synka mellan enheter  

**Supabase (efter migration):**
✅ Cloud-lagring - säkert i databasen  
✅ Synk mellan alla enheter (mobil, desktop)  
✅ Automatisk backup  
✅ Kan dela progress med coach  
✅ Gratis upp till 500MB & 50,000 användare/månad  

## 📋 Migration Overview

Jag har förberett:
1. ✅ **Databas-schema** (`supabase/schema.sql`)
2. ✅ **Setup-guide** (`SUPABASE_SETUP.md`)
3. 🔄 **Kod-ändringar** (nedan)

## 🛠️ Steg-för-steg migration

### Steg 1: Sätt upp Supabase (15 min)

Följ `SUPABASE_SETUP.md`:
1. Skapa Supabase-projekt
2. Kör `supabase/schema.sql`
3. Aktivera Email Auth
4. Kopiera API-nycklar till `.env.local`

### Steg 2: Lägg till Supabase Client i HTML

Lägg till i `<head>` (efter line 8):

```html
<!-- Supabase JS Client -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### Steg 3: Initiera Supabase (i `<script>` section)

Ersätt början av `<script>` section (ca line 186) med:

```javascript
<script>
  // ===== SUPABASE INIT =====
  const SUPABASE_URL = 'YOUR_SUPABASE_URL';  // Från .env.local
  const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY'; // Från .env.local
  
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  let currentUser = null;
  
  // Check auth state
  supabase.auth.onAuthStateChange((event, session) => {
    currentUser = session?.user ?? null;
    if (currentUser) {
      hideAuthModal();
      initApp();
    } else {
      showAuthModal();
    }
  });
  
  // ===== AUTH FUNCTIONS =====
  async function signUp(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    if (error) {
      alert('Registrering misslyckades: ' + error.message);
      return false;
    }
    alert('✅ Konto skapat! Logga in.');
    return true;
  }
  
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      alert('Inloggning misslyckades: ' + error.message);
      return false;
    }
    return true;
  }
  
  async function signOut() {
    await supabase.auth.signOut();
    location.reload();
  }
  
  // ===== DATABASE FUNCTIONS (replaces localStorage) =====
  
  // Get user profile
  async function getProfile() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();
    return data;
  }
  
  // Update current day
  async function updateCurrentDay(day) {
    await supabase
      .from('profiles')
      .update({ current_day: day })
      .eq('id', currentUser.id);
  }
  
  // Get current day
  async function getCurrentDay() {
    const profile = await getProfile();
    return profile?.current_day || 1;
  }
  
  // Save daily note
  async function saveNote(day, content) {
    await supabase
      .from('daily_notes')
      .upsert({
        user_id: currentUser.id,
        day,
        content
      }, {
        onConflict: 'user_id,day'
      });
  }
  
  // Load daily note
  async function loadNote(day) {
    const { data } = await supabase
      .from('daily_notes')
      .select('content')
      .eq('user_id', currentUser.id)
      .eq('day', day)
      .single();
    return data?.content || '';
  }
  
  // Save weekly goal
  async function addGoal(week, goalText) {
    await supabase
      .from('weekly_goals')
      .insert({
        user_id: currentUser.id,
        week,
        goal_text: goalText,
        completed: false
      });
  }
  
  // Load weekly goals
  async function loadGoals(week) {
    const { data } = await supabase
      .from('weekly_goals')
      .select('*')
      .eq('user_id', currentUser.id)
      .eq('week', week)
      .order('created_at');
    return data || [];
  }
  
  // Toggle goal completion
  async function toggleGoal(goalId, completed) {
    await supabase
      .from('weekly_goals')
      .update({ completed })
      .eq('id', goalId);
  }
  
  // Delete goal
  async function deleteGoal(goalId) {
    await supabase
      .from('weekly_goals')
      .delete()
      .eq('id', goalId);
  }
  
  // Save theme
  async function saveTheme(theme) {
    await supabase
      .from('profiles')
      .update({ theme })
      .eq('id', currentUser.id);
  }
  
  // Load theme
  async function loadTheme() {
    const profile = await getProfile();
    return profile?.theme || 'dark';
  }
</script>
```

### Steg 4: Lägg till Auth UI (i `<body>`)

Lägg till direkt efter `<header>` (ca line 120):

```html
<!-- Auth Modal -->
<div id="authModal" class="modal-overlay hidden">
  <div class="modal">
    <h2 id="authTitle">Välkommen till WizWealth90! 👋</h2>
    <p id="authDesc">Logga in eller skapa konto för att börja ditt 90-dagars program.</p>
    
    <input type="email" id="authEmail" placeholder="Email" autocomplete="email">
    <input type="password" id="authPassword" placeholder="Lösenord (min 6 tecken)" autocomplete="current-password">
    <input type="text" id="authName" placeholder="Ditt namn" class="hidden" autocomplete="name">
    
    <div class="modal-buttons">
      <button id="btnToggleAuth" class="muted">Registrera istället</button>
      <button id="btnAuth" class="ok">Logga in</button>
    </div>
    
    <div class="footer" style="margin-top:12px">
      <small>Din data synkas säkert i molnet 🔒</small>
    </div>
  </div>
</div>
```

### Steg 5: Lägg till logout-knapp

I headern, lägg till (efter theme-toggle, ca line 104):

```html
<button id="btnLogout" class="hidden" title="Logga ut">🚪 Logga ut</button>
```

### Steg 6: JavaScript - Event handlers

Lägg till (i `<script>`, efter funktionerna ovan):

```javascript
// Auth UI handlers
let isSignUpMode = false;

document.getElementById('btnToggleAuth').addEventListener('click', () => {
  isSignUpMode = !isSignUpMode;
  if (isSignUpMode) {
    document.getElementById('authTitle').textContent = 'Skapa konto 🎉';
    document.getElementById('authDesc').textContent = 'Registrera dig för att börja programmet.';
    document.getElementById('authName').classList.remove('hidden');
    document.getElementById('btnAuth').textContent = 'Registrera';
    document.getElementById('btnToggleAuth').textContent = 'Logga in istället';
  } else {
    document.getElementById('authTitle').textContent = 'Välkommen tillbaka! 👋';
    document.getElementById('authDesc').textContent = 'Logga in för att fortsätta ditt program.';
    document.getElementById('authName').classList.add('hidden');
    document.getElementById('btnAuth').textContent = 'Logga in';
    document.getElementById('btnToggleAuth').textContent = 'Registrera istället';
  }
});

document.getElementById('btnAuth').addEventListener('click', async () => {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  const name = document.getElementById('authName').value;
  
  if (!email || !password) {
    alert('Fyll i email och lösenord');
    return;
  }
  
  if (isSignUpMode) {
    if (!name) {
      alert('Fyll i ditt namn');
      return;
    }
    await signUp(email, password, name);
  } else {
    await signIn(email, password);
  }
});

document.getElementById('btnLogout').addEventListener('click', async () => {
  if (confirm('Vill du logga ut?')) {
    await signOut();
  }
});

function showAuthModal() {
  document.getElementById('authModal').classList.remove('hidden');
  document.getElementById('btnLogout').classList.add('hidden');
  document.querySelector('main').style.display = 'none';
}

function hideAuthModal() {
  document.getElementById('authModal').classList.add('hidden');
  document.getElementById('btnLogout').classList.remove('hidden');
  document.querySelector('main').style.display = 'block';
  const profile = getProfile();
  document.getElementById('currentProfile').textContent = profile?.name || 'Du';
}
```

### Steg 7: Uppdatera renderDay() för async

Ändra funktionen `renderDay()` till async (ca line 606):

```javascript
async function renderDay(n) {
  n = Math.max(1, Math.min(90, n));
  await updateCurrentDay(n);  // ← Changed from localStorage
  
  const d = PROGRAM[n-1];
  const week = getWeekNumber(d.day);
  // ... rest of function (unchanged)
  
  await loadNotes(n);  // ← Changed to await
  await renderGoals(week);  // ← Changed to await
}
```

### Steg 8: Uppdatera saveNotes() och loadNotes()

Ersätt (ca line 636):

```javascript
async function saveNotes(day) {
  const content = el('notes').value;
  await saveNote(day, content);
}

async function loadNotes(day) {
  const content = await loadNote(day);
  el('notes').value = content;
}
```

### Steg 9: Uppdatera renderGoals()

Ersätt (ca line 560):

```javascript
async function renderGoals(week) {
  const goals = await loadGoals(week);
  const list = document.getElementById('goalList');
  list.innerHTML = '';
  
  goals.forEach((goal) => {
    const li = document.createElement('li');
    li.className = 'goal-item';
    
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'goal-checkbox';
    cb.checked = goal.completed;
    cb.addEventListener('change', async () => {
      await toggleGoal(goal.id, cb.checked);
      await renderGoals(week);
    });
    
    const span = document.createElement('span');
    span.textContent = goal.goal_text;
    span.className = goal.completed ? 'goal-completed' : '';
    
    li.appendChild(cb);
    li.appendChild(span);
    list.appendChild(li);
  });
}
```

### Steg 10: Ta bort gamla localStorage-funktioner

**TA BORT** (ca line 187-336):
- `getAllProfiles()`
- `saveAllProfiles()`
- `getCurrentProfile()`
- `setCurrentProfile()`
- `createProfile()`
- `deleteProfile()`
- `profileKey()`
- Alla gamla localStorage-calls

**BEHÅLL:**
- `generateProgram()` - unchanged
- UI helpers - unchanged
- Event handlers - update to async where needed

## 🧪 Testa migrationen

1. **Öppna index.html**
2. **Ska se** inloggningsskärm
3. **Registrera** testkonto: `test@example.com` / `Test1234!`
4. **Verifiera** att dag 1 visas
5. **Skriv** anteckning → Spara
6. **Öppna** på en annan enhet → Ska synka! ✨

## 📊 Vercel Deployment

1. **Lägg till env vars** i Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

2. **Uppdatera Supabase config.js**:
   ```javascript
   const SUPABASE_URL = process.env.SUPABASE_URL || 'fallback';
   const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'fallback';
   ```

3. **Redeploya**:
   ```bash
   git add .
   git commit -m "Migrate to Supabase"
   git push
   ```

## ✅ Checklist

- [ ] Supabase projekt skapat
- [ ] Schema körts (`supabase/schema.sql`)
- [ ] API-nycklar kopierade
- [ ] Supabase client tillagd i HTML
- [ ] Auth UI tillagd
- [ ] Funktioner uppdaterade till async
- [ ] localStorage-kod borttagen
- [ ] Testat lokalt
- [ ] Deployat till Vercel
- [ ] Testat på produktion

## 🚨 VIKTIGT - Användardata

**Användare förlorar inte data** om du:
1. Behåller den gamla localStorage-versionen som backup
2. Instruerar användare att exportera sin data först
3. Erbjuder en "import från localStorage" funktion (optional)

## 🆘 Behöver hjälp?

Om du fastnar:
1. Kolla browser console (F12) för fel
2. Verifiera Supabase credentials
3. Testa i Supabase Table Editor manuellt
4. Se `SUPABASE_SETUP.md` för troubleshooting

---

**Nästa:** När detta fungerar kan vi lägga till:
- Realtime synk (se progress uppdateras live!)
- Dela progress med coach
- Progress-dashboard
- Email-notifieringar

Lycka till! 🚀

