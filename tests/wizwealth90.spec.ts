import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Helper: Extract day number from kicker text
 */
async function getDayFromKicker(page: Page): Promise<number> {
  const text = await page.locator('#kicker').innerText();
  const match = text.match(/DAG (\d+)/i); // Case insensitive match
  if (!match) throw new Error(`Could not parse day from kicker: ${text}`);
  return parseInt(match[1], 10);
}

/**
 * Helper: Get localStorage value
 */
async function getLocalStorage(page: Page, key: string): Promise<string | null> {
  return await page.evaluate((k) => localStorage.getItem(k), key);
}

/**
 * Helper: Clear all localStorage
 */
async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.clear());
}

test.describe('WizWealth90 App Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await clearLocalStorage(page);
    await page.reload();
    
    // Create profile to get past modal
    await page.locator('#profileNameInput').fill('Test User');
    await page.locator('#modalConfirm').click();
    
    // Wait for app to initialize
    await page.locator('#kicker').waitFor({ state: 'visible' });
  });

  test('1. Render: första laddning visar dag 1', async ({ page }) => {
    await test.step('Verify kicker shows Day 1', async () => {
      const day = await getDayFromKicker(page);
      expect(day).toBe(1);
    });

    await test.step('Verify title, pep, and mantra have content', async () => {
      const title = await page.locator('#title').innerText();
      expect(title.length).toBeGreaterThan(0);

      const pep = await page.locator('#pep').innerText();
      expect(pep.length).toBeGreaterThan(0);

      const mantra = await page.locator('#mantra').innerText();
      expect(mantra.length).toBeGreaterThan(0);
    });

    await test.step('Verify routine and domino lists exist', async () => {
      const routineItems = await page.locator('#routine li').count();
      expect(routineItems).toBeGreaterThanOrEqual(1);

      const dominoItems = await page.locator('#domino li').count();
      expect(dominoItems).toBeGreaterThanOrEqual(1);
    });

    await test.step('Verify weekTheme has content', async () => {
      const weekTheme = await page.locator('#weekTheme').innerText();
      expect(weekTheme.length).toBeGreaterThan(0);
    });
  });

  test('2. Navigering: Next/Prev och gränser (1..90)', async ({ page }) => {
    await test.step('Click Next 5 times → shows Day 6', async () => {
      for (let i = 0; i < 5; i++) {
        await page.locator('#btnNext').click();
        await page.waitForTimeout(100); // Small delay for rendering
      }
      const day = await getDayFromKicker(page);
      expect(day).toBe(6);
    });

    await test.step('Click Prev 10 times → clamps at Day 1', async () => {
      for (let i = 0; i < 10; i++) {
        await page.locator('#btnPrev').click();
        await page.waitForTimeout(100);
      }
      const day = await getDayFromKicker(page);
      expect(day).toBe(1);
    });

    await test.step('Goto Day 90', async () => {
      await page.locator('#gotoDay').fill('90');
      await page.locator('#btnGoto').click();
      await page.waitForTimeout(100);
      const day = await getDayFromKicker(page);
      expect(day).toBe(90);
    });

    await test.step('Click Next from Day 90 → stays at Day 90', async () => {
      await page.locator('#btnNext').click();
      await page.waitForTimeout(100);
      const day = await getDayFromKicker(page);
      expect(day).toBe(90);
    });
  });

  test('3. Persistens: dag sparas i localStorage och över sidladdning', async ({ page }) => {
    await test.step('Navigate to Day 17', async () => {
      await page.locator('#gotoDay').fill('17');
      await page.locator('#btnGoto').click();
      await page.waitForTimeout(100);
      const day = await getDayFromKicker(page);
      expect(day).toBe(17);
    });

    await test.step('Verify localStorage contains day 17', async () => {
      const storedDays = await page.evaluate(() => {
        const keys = Object.keys(localStorage);
        return keys.filter(k => k.includes('.wizwealth90.day')).map(k => localStorage.getItem(k));
      });
      expect(storedDays.some(d => d === '17')).toBe(true);
    });

    await test.step('Reload page → still shows Day 17', async () => {
      await page.reload();
      await page.waitForSelector('#kicker', { state: 'visible' });
      const day = await getDayFromKicker(page);
      expect(day).toBe(17);
    });
  });

  test('4. Anteckningar sparas per dag', async ({ page }) => {
    await test.step('Go to Day 3 and write note', async () => {
      await page.locator('#gotoDay').fill('3');
      await page.locator('#btnGoto').click();
      await page.waitForTimeout(100);
      await page.locator('#notes').fill('Hej dag 3');
      await page.waitForTimeout(200); // Wait for autosave
    });

    await test.step('Go to Day 4 and write different note', async () => {
      await page.locator('#gotoDay').fill('4');
      await page.locator('#btnGoto').click();
      await page.waitForTimeout(100);
      await page.locator('#notes').fill('Hej dag 4');
      await page.waitForTimeout(200);
    });

    await test.step('Return to Day 3 → shows correct note', async () => {
      await page.locator('#gotoDay').fill('3');
      await page.locator('#btnGoto').click();
      await page.waitForTimeout(100);
      const notesValue = await page.locator('#notes').inputValue();
      expect(notesValue).toBe('Hej dag 3');
    });

    await test.step('Verify localStorage contains note for day 3', async () => {
      const storedNotes = await page.evaluate(() => {
        const keys = Object.keys(localStorage);
        const noteKeys = keys.filter(k => k.includes('.wizwealth90.notes.3'));
        return noteKeys.map(k => localStorage.getItem(k));
      });
      expect(storedNotes.some(n => n?.includes('Hej dag 3'))).toBe(true);
    });
  });

  test('5. Rensa anteckning för aktuell dag', async ({ page }) => {
    await test.step('Write note on Day 4', async () => {
      await page.locator('#gotoDay').fill('4');
      await page.locator('#btnGoto').click();
      await page.waitForTimeout(100);
      await page.locator('#notes').fill('Test note to clear');
      await page.waitForTimeout(200);
    });

    await test.step('Clear note and accept dialog', async () => {
      page.on('dialog', dialog => dialog.accept());
      await page.locator('#btnClearNotes').click();
      await page.waitForTimeout(200);
    });

    await test.step('Verify notes textarea is empty', async () => {
      const notesValue = await page.locator('#notes').inputValue();
      expect(notesValue).toBe('');
    });

    await test.step('Verify localStorage key is cleared', async () => {
      const storedNotes = await page.evaluate(() => {
        const keys = Object.keys(localStorage);
        const noteKeys = keys.filter(k => k.includes('.wizwealth90.notes.4'));
        return noteKeys.map(k => localStorage.getItem(k));
      });
      expect(storedNotes.every(n => !n || n === '')).toBe(true);
    });
  });

  test('6. Reset nollställer allt', async ({ page }) => {
    await test.step('Write notes for day 1 and 2, go to day 20', async () => {
      await page.locator('#notes').fill('Note day 1');
      await page.waitForTimeout(200);
      
      await page.locator('#btnNext').click();
      await page.waitForTimeout(100);
      await page.locator('#notes').fill('Note day 2');
      await page.waitForTimeout(200);
      
      await page.locator('#gotoDay').fill('20');
      await page.locator('#btnGoto').click();
      await page.waitForTimeout(100);
    });

    await test.step('Reset and accept confirm', async () => {
      page.on('dialog', dialog => dialog.accept());
      await page.locator('#btnReset').click();
      await page.waitForTimeout(300);
    });

    await test.step('Verify back to Day 1', async () => {
      const day = await getDayFromKicker(page);
      expect(day).toBe(1);
    });

    await test.step('Verify notes are cleared in localStorage', async () => {
      const hasNotes = await page.evaluate(() => {
        const keys = Object.keys(localStorage);
        const noteKeys = keys.filter(k => k.includes('.wizwealth90.notes.'));
        return noteKeys.some(k => {
          const val = localStorage.getItem(k);
          return val && val.trim().length > 0;
        });
      });
      expect(hasNotes).toBe(false);
    });

    await test.step('Verify day is reset to 1 in localStorage', async () => {
      const storedDays = await page.evaluate(() => {
        const keys = Object.keys(localStorage);
        return keys.filter(k => k.includes('.wizwealth90.day')).map(k => localStorage.getItem(k));
      });
      expect(storedDays.some(d => d === '1')).toBe(true);
    });
  });

  test('7. Export genererar JSON med korrekt payload', async ({ page }) => {
    await test.step('Go to Day 7 and write note', async () => {
      await page.locator('#gotoDay').fill('7');
      await page.locator('#btnGoto').click();
      await page.waitForTimeout(100);
      await page.locator('#notes').fill('Export test');
      await page.waitForTimeout(200);
    });

    await test.step('Export and verify JSON content', async () => {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.locator('#btnExport').click()
      ]);

      const downloadPath = await download.path();
      expect(downloadPath).toBeTruthy();
      
      if (downloadPath) {
        const content = await fs.readFile(downloadPath, 'utf-8');
        const json = JSON.parse(content);
        
        expect(json.day).toBe(7);
        expect(json.notes['7']).toBe('Export test');
        expect(json.profileName).toBeTruthy();
      }
    });
  });

  test('8. Import återställer state', async ({ page }) => {
    const testData = {
      day: 12,
      notes: {
        '12': 'Importerad anteckning'
      },
      theme: 'dark'
    };

    await test.step('Create temporary import file', async () => {
      const tempPath = path.join(__dirname, 'temp-import.json');
      await fs.writeFile(tempPath, JSON.stringify(testData));

      // Set up alert handler
      page.on('dialog', dialog => dialog.accept());

      // Trigger import
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        page.locator('#btnImport').click()
      ]);

      await fileChooser.setFiles(tempPath);
      await page.waitForTimeout(500);

      // Clean up
      await fs.unlink(tempPath);
    });

    await test.step('Verify Day 12 is shown', async () => {
      const day = await getDayFromKicker(page);
      expect(day).toBe(12);
    });

    await test.step('Verify note is imported', async () => {
      const notesValue = await page.locator('#notes').inputValue();
      expect(notesValue).toBe('Importerad anteckning');
    });

    await test.step('Verify localStorage updated', async () => {
      const storedDays = await page.evaluate(() => {
        const keys = Object.keys(localStorage);
        return keys.filter(k => k.includes('.wizwealth90.day')).map(k => localStorage.getItem(k));
      });
      expect(storedDays.some(d => d === '12')).toBe(true);
    });
  });

  test('9. Felaktig import visar fel-alert och ändrar inte state', async ({ page }) => {
    await test.step('Navigate to Day 12 first', async () => {
      await page.locator('#gotoDay').fill('12');
      await page.locator('#btnGoto').click();
      await page.waitForTimeout(100);
    });

    await test.step('Try to import invalid JSON', async () => {
      const tempPath = path.join(__dirname, 'temp-bad-import.json');
      await fs.writeFile(tempPath, '{bad json');

      let alertMessage = '';
      page.on('dialog', dialog => {
        alertMessage = dialog.message();
        dialog.accept();
      });

      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser'),
        page.locator('#btnImport').click()
      ]);

      await fileChooser.setFiles(tempPath);
      await page.waitForTimeout(500);

      expect(alertMessage).toContain('Ogiltig');

      // Clean up
      await fs.unlink(tempPath);
    });

    await test.step('Verify state unchanged (still Day 12)', async () => {
      const day = await getDayFromKicker(page);
      expect(day).toBe(12);
    });
  });

  test('10. Innehåll ändras mellan dagar', async ({ page }) => {
    let day5Data: { title: string; pep: string; mantra: string };

    await test.step('Read content from Day 5', async () => {
      await page.locator('#gotoDay').fill('5');
      await page.locator('#btnGoto').click();
      await page.waitForTimeout(100);

      day5Data = {
        title: await page.locator('#title').innerText(),
        pep: await page.locator('#pep').innerText(),
        mantra: await page.locator('#mantra').innerText()
      };
    });

    await test.step('Go to Day 6 and verify content changed', async () => {
      await page.locator('#gotoDay').fill('6');
      await page.locator('#btnGoto').click();
      await page.waitForTimeout(100);

      const day6Title = await page.locator('#title').innerText();
      const day6Pep = await page.locator('#pep').innerText();
      const day6Mantra = await page.locator('#mantra').innerText();

      const changed = 
        day6Title !== day5Data.title ||
        day6Pep !== day5Data.pep ||
        day6Mantra !== day5Data.mantra;

      expect(changed).toBe(true);
    });
  });

  test('11. Veckotema uppdateras korrekt', async ({ page }) => {
    await test.step('Day 1 → shows correct week theme', async () => {
      await page.locator('#gotoDay').fill('1');
      await page.locator('#btnGoto').click();
      await page.waitForTimeout(100);
      
      const weekTheme = await page.locator('#weekTheme').innerText();
      expect(weekTheme).toContain('Jag är källan – inte siffrorna');
    });

    await test.step('Day 50 → shows different week theme', async () => {
      await page.locator('#gotoDay').fill('50');
      await page.locator('#btnGoto').click();
      await page.waitForTimeout(100);
      
      const weekTheme = await page.locator('#weekTheme').innerText();
      expect(weekTheme.length).toBeGreaterThan(0);
      expect(weekTheme).not.toContain('Jag är källan – inte siffrorna');
    });

    await test.step('Day 83 → shows Integration phase theme', async () => {
      await page.locator('#gotoDay').fill('83');
      await page.locator('#btnGoto').click();
      await page.waitForTimeout(100);
      
      const weekTheme = await page.locator('#weekTheme').innerText();
      expect(weekTheme).toContain('Fira, förankra, förfina');
    });
  });
});

