# 🐛 WizWealth90 - Fullständig Buggrapport & Analys

## 🚨 KRITISKA BUGGAR (Hindrar app från att funka)

### BUG #1: NULL REFERENCE ERROR i key-funktioner ⭐⭐⭐⭐⭐
**Svårighetsgrad:** KRITISK  
**Plats:** Rad 520-535  
**Problem:**
```javascript
function goalsKey(week){ 
  const profile = getCurrentProfile();
  return profileKey(profile.id, STORAGE_GOALS_PREFIX + week);  // ← KRASCHAR om profile = null
}
```

Alla key-funktioner (`goalsKey`, `notesKey`, `dayKey`, `themeKey`) anropar `getCurrentProfile()` utan att checka om det returnerar `null`. När ingen profil finns försöker koden läsa `null.id` → **TypeError: Cannot read property 'id' of null**

**Impact:** Hela appen kraschar vid första laddning.

**Fix:**
```javascript
function goalsKey(week){ 
  const profile = getCurrentProfile();
  if (!profile) return null; // Handle no profile
  return profileKey(profile.id, STORAGE_GOALS_PREFIX + week);
}
// Samma för notesKey(), dayKey(), themeKey()
```

---

### BUG #2: initTheme() kraschar vid första laddning ⭐⭐⭐⭐⭐
**Svårighetsgrad:** KRITISK  
**Plats:** Rad 537-541  
**Problem:**
```javascript
function initTheme(){
  const saved = localStorage.getItem(themeKey()) || 'dark';  // ← themeKey() returnerar null!
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}
```

`themeKey()` anropar `getCurrentProfile()` som returnerar null → localStorage.getItem(null) → Error

**Impact:** Temat initieras aldrig, och kan krascha vissa event handlers.

**Fix:**
```javascript
function initTheme(){
  const key = themeKey();
  const saved = key ? localStorage.getItem(key) || 'dark' : 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}
```

---

### BUG #3: getCurrentDay() kraschar vid första laddning ⭐⭐⭐⭐⭐
**Svårighetsgrad:** KRITISK  
**Plats:** Rad 606-609  
**Problem:**
```javascript
function getCurrentDay(){
  const v = parseInt(localStorage.getItem(dayKey()) || '1', 10);  // ← dayKey() = null!
  return isNaN(v)?1:Math.max(1, Math.min(90, v));
}
```

**Impact:** `renderDay(getCurrentDay())` kraschar → ingen content visas!

**Fix:**
```javascript
function getCurrentDay(){
  const key = dayKey();
  const v = parseInt(key ? localStorage.getItem(key) || '1' : '1', 10);
  return isNaN(v)?1:Math.max(1, Math.min(90, v));
}
```

---

### BUG #4: handleProfileCreate() anropar funktioner som kraschar ⭐⭐⭐⭐
**Svårighetsgrad:** KRITISK  
**Plats:** Rad 336-340  
**Problem:**
```javascript
function handleProfileCreate(){
  // ...
  createProfile(name);
  hideProfileModal();
  
  // Initialize app after profile creation
  updateProfileDisplay();
  initTheme();  // ← Kan krascha
  if (!localStorage.getItem(dayKey())) localStorage.setItem(dayKey(), '1');  // ← Kan krascha
  renderDay(getCurrentDay());  // ← Kan krascha
}
```

Efter `createProfile()` existerar profilen i localStorage, MEN funktionerna `initTheme()`, `dayKey()`, `getCurrentDay()` anropar alla `getCurrentProfile()` → potentiella race conditions eller null-errors.

**Fix:** Se BUG #1-3 fixes, eller lägg till guards:
```javascript
function handleProfileCreate(){
  const name = document.getElementById('profileNameInput').value.trim();
  if (!name){
    alert('Ange ett namn för profilen.');
    return;
  }
  
  const profile = createProfile(name);
  hideProfileModal();
  
  // Ensure profile is set before initialization
  if (!getCurrentProfile()) {
    console.error('Profile creation failed!');
    return;
  }
  
  updateProfileDisplay();
  initTheme();
  
  const key = dayKey();
  if (key && !localStorage.getItem(key)) {
    localStorage.setItem(key, '1');
  }
  
  renderDay(getCurrentDay());
}
```

---

### BUG #5: Event handlers anropar funktioner som förväntar profil ⭐⭐⭐⭐
**Svårighetsgrad:** HÖG  
**Plats:** Rad 701-741  
**Problem:**
```javascript
document.getElementById('themeToggle').addEventListener('click', toggleTheme);  // ← themeKey() kraschar
document.getElementById('btnNext').addEventListener('click', nextDay);  // ← getCurrentDay() kraschar
document.getElementById('btnPrev').addEventListener('click', prevDay);  // ← getCurrentDay() kraschar
document.getElementById('notes').addEventListener('input', ()=>saveNotes(getCurrentDay()));  // ← kraschar
```

Om användaren på något sätt kan trigga dessa handlers innan profil skapas → kraschar.

**Fix:** Lägg till guards i alla handlers:
```javascript
document.getElementById('themeToggle').addEventListener('click', () => {
  if (!getCurrentProfile()) return;
  toggleTheme();
});
```

---

## ⚠️ LOGISKA PROBLEM (Fungerar delvis men är fel)

### PROBLEM #6: Veckonummer-buggen ⭐⭐⭐
**Svårighetsgrad:** MEDEL  
**Plats:** Rad 519, 472  
**Problem:**
```javascript
function getWeekNumber(day){ return Math.floor((d-1)/7)+1; }  // ← använder 'd' istället för 'day'!

// I generateProgram():
const weekIndex = Math.floor((d-1)/7);  // ← Detta ger 13 veckor för 90 dagar (0-12)
const wk = weeks[weekIndex];  // ← Dag 85-90 får weeks[12] som inte finns (bara 12 element 0-11)!
```

**Impact:** Dag 85-90 kraschar pga `weeks[12]` är undefined!

**Fix:**
```javascript
// Rad 519:
function getWeekNumber(day){ return Math.floor((day-1)/7)+1; }  // ← Fix variabelnamn

// Rad 344-357: Lägg till vecka 13:
const weeks = [
  // ... 12 veckor ...
  {phase:'Integration', theme:'Fira, förankra, förfina'},
  {phase:'Integration', theme:'Leva den nya standarden'}  // ← Lägg till vecka 13!
];
```

---

### PROBLEM #7: renderProfileList() lägger till delete-option för VARJE profil ⭐⭐
**Svårighetsgrad:** LÅGREPEATING  
**Plats:** Rad 284-298  
**Problem:**
```javascript
profiles.forEach(profile => {
  // ... lägg till profil ...
  
  // Add delete option (if more than 1 profile)
  if (profiles.length > 1){
    const delDiv = document.createElement('div');
    delDiv.textContent = '🗑️ Ta bort ' + profile.name;
    list.appendChild(delDiv);  // ← Lägger till delete för VARJE profil i loopen!
  }
});
```

**Impact:** Om 3 profiler finns, läggs 3 delete-alternativ till för FÖRSTA profilen, 3 för andra, 3 för tredje = 9 delete-knappar!

**Fix:**
```javascript
profiles.forEach(profile => {
  const div = document.createElement('div');
  div.className = 'profile-item' + (profile.id === current?.id ? ' active' : '');
  div.textContent = profile.name;
  div.addEventListener('click', () => {
    setCurrentProfile(profile.id);
    renderDay(getCurrentDay());
    toggleProfileDropdown();
  });
  list.appendChild(div);
});

// Add delete options AFTER the loop
if (profiles.length > 1) {
  profiles.forEach(profile => {
    const delDiv = document.createElement('div');
    delDiv.className = 'profile-item delete';
    delDiv.textContent = '🗑️ Ta bort ' + profile.name;
    delDiv.style.fontSize = '11px';
    delDiv.style.paddingLeft = '24px';
    delDiv.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Ta bort profil "${profile.name}"? All data kommer raderas.`)){
        deleteProfile(profile.id);
      }
    });
    list.appendChild(delDiv);
  });
}
```

---

### PROBLEM #8: Export/Import antar att profil alltid finns ⭐⭐
**Svårighetsgrad:** MEDEL  
**Plats:** Rad 645-668  
**Problem:**
```javascript
function exportState(){
  const profile = getCurrentProfile();  // ← Ingen null-check!
  // ...
  profileName: profile.name,  // ← Kraschar om profile = null
}
```

**Impact:** Export kraschar om ingen profil finns (borde inte hända, men defensiv programmering).

**Fix:**
```javascript
function exportState(){
  const profile = getCurrentProfile();
  if (!profile) {
    alert('Ingen profil vald. Skapa en profil först.');
    return;
  }
  // ... rest of code
}
```

---

## 🔧 MINDRE PROBLEM (Kan förbättras)

### PROBLEM #9: Ingen error handling för localStorage ⭐
**Plats:** Överallt  
**Problem:** Om localStorage är fullt eller blockerat (private browsing), kraschar appen.

**Fix:** Wrap localStorage calls i try-catch:
```javascript
function safeLocalStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.error('localStorage read error:', e);
    return null;
  }
}
```

---

### PROBLEM #10: Ingen loading state eller feedback ⭐
**Plats:** UI  
**Problem:** När användaren klickar "Nästa dag" finns ingen visuell feedback.

**Fix:** Lägg till loading spinner eller disable buttons under operations.

---

### PROBLEM #11: Notes autosave triggas vid varje keystroke ⭐
**Plats:** Rad 735  
**Problem:** 
```javascript
document.getElementById('notes').addEventListener('input', ()=>saveNotes(getCurrentDay()));
```
Varje tecken → localStorage write. Kan vara ineffektivt.

**Fix:** Debounce:
```javascript
let saveTimeout;
document.getElementById('notes').addEventListener('input', ()=>{
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => saveNotes(getCurrentDay()), 500);
});
```

---

### PROBLEM #12: Ingen validering av importerad data ⭐
**Plats:** Rad 670-698  
**Problem:** Importerad JSON valideras inte ordentligt.

**Fix:**
```javascript
function importState(file){
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      
      // Validate structure
      if (typeof data !== 'object' || !data.day) {
        throw new Error('Invalid file format');
      }
      
      if (data.day < 1 || data.day > 90) {
        throw new Error('Invalid day number');
      }
      
      // ... rest
    } catch(e){ 
      alert('Ogiltig fil: ' + e.message); 
    }
  };
  reader.readAsText(file);
}
```

---

## 📊 SAMMANFATTNING

### Kritiska buggar som MÅSTE fixas:
1. ✅ **BUG #1-5:** Null-reference errors (hindrar hela appen)
2. ✅ **PROBLEM #6:** Veckonummer-bugg (kraschar dag 85-90)

### Buggar som borde fixas:
3. ⚠️ **PROBLEM #7:** Duplicerade delete-knappar
4. ⚠️ **PROBLEM #8:** Ingen null-check i export

### Nice-to-have fixes:
5. 💡 **PROBLEM #9-12:** Error handling, UX improvements

---

## 🎯 PRIORITERAD FIX-ORDNING

1. **FIX BUG #1-3** (key-funktioner) - 5 min
2. **FIX BUG #4** (handleProfileCreate) - 2 min
3. **FIX BUG #5** (event handlers) - 5 min
4. **FIX PROBLEM #6** (veckonummer) - 2 min
5. **FIX PROBLEM #7** (profile list) - 3 min
6. **TEST** hela flödet - 10 min

**Total fix-tid:** ~30 minuter

Vill du att jag fixar dessa buggar nu? 🔧

