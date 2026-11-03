import { test, expect } from '@playwright/test';

test.describe('การแสดงความรู้สึกต่อโพสต์อิท (Reactions & Detail)', () => {
  test('สามารถคลิกเปิดอ่านโพสต์อิทขนาดใหญ่และกดแสดงความรู้สึกได้', async ({ page }) => {
    await page.goto('/');

    // Click on the first post-it on the board
    const firstNote = page.locator('.postit-shadow').first();
    await expect(firstNote).toBeVisible();
    await firstNote.click({ force: true });

    // Verify detail modal opens
    await expect(page.locator('text=รายละเอียดโพสต์อิท')).toBeVisible();

    // Verify reaction buttons exist (heart, hug, sparkle, cheer, idea)
    const heartBtn = page.locator('[data-testid="reaction-heart"]');
    await expect(heartBtn).toBeVisible();

    // Click heart reaction
    await heartBtn.click();

    // Verify button becomes disabled after reacting
    await expect(heartBtn).toBeDisabled({ timeout: 5000 });
  });

  test('หน้าของฉัน แสดงโพสต์ที่เคยเขียนและสลับโหมดมืดได้', async ({ page, isMobile }) => {
    await page.goto('/');

    if (isMobile) {
      await page.locator('button[aria-label="โพสต์ของฉัน"]').click();
    } else {
      await page.locator('button', { hasText: 'โพสต์ของฉัน' }).click();
    }

    await expect(page.locator('h2')).toContainText('โพสต์อิทของฉัน');
    await expect(page.locator('text=ต้องการคนรับฟังหรือกำลังใจ?')).toBeVisible();

    // Toggle dark mode
    const darkModeBtn = page.locator('button[aria-label="เปลี่ยนเป็นโหมดมืด"]');
    if (await darkModeBtn.isVisible()) {
      await darkModeBtn.click();
      const hasDarkClass = await page.evaluate(() =>
        document.documentElement.classList.contains('dark')
      );
      expect(hasDarkClass).toBe(true);
    }
  });
});
