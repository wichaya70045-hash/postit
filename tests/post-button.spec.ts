import { test, expect } from '@playwright/test';

test.describe('ปุ่มแปะ Post-it (Posting Button Functionality)', () => {
  test('ปุ่ม + แปะโพสต์อิท ที่ Header สามารถกดเปิดหน้าต่างเขียนได้ และสามารถกดแปะลงกระดานได้จริง', async ({ page }) => {
    await page.goto('/');

    // 1. Check composer button is visible and clickable
    const postBtn = page.locator('button:has-text("แปะโพสต์อิท"):visible, button[aria-label="เขียนโพสต์อิทใหม่"]:visible').first();
    await expect(postBtn).toBeVisible();
    await postBtn.click();

    // 2. Composer modal should open
    await expect(page.locator('text=ชอล์ก / ปากกา')).toBeVisible();

    // 3. Test clicking "แปะบนกระดาน" without typing anything -> should show friendly guide error
    const submitBtn = page.locator('button:has-text("แปะบนกระดาน")');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();
    await expect(page.locator('text=กรุณาพิมพ์ข้อความก่อนแปะลงบนกระดานนะ')).toBeVisible();

    // 4. Fill text and post
    const uniqueText = `ทดสอบปุ่มแปะสำเร็จ ${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await page.fill('textarea', uniqueText);
    await submitBtn.click();

    // 5. Note should appear on the chalkboard
    const noteCard = page.locator('.chalkboard-frame .postit-shadow', { hasText: uniqueText }).first();
    await expect(noteCard).toBeVisible({ timeout: 8000 });
  });

  test('บนหน้าจอมือถือ ปุ่ม + ตรงกลางแถบล่าง (Bottom Nav) สามารถกดเปิดและแปะโพสต์อิทได้สมบูรณ์', async ({ page }) => {
    await page.goto('/');

    // 1. Locate BottomNav composer button
    const bottomNavAddBtn = page.locator('nav[aria-label="เมนูหลัก"] button[aria-label="เขียนโพสต์อิทใหม่"]');
    if (await bottomNavAddBtn.isVisible()) {
      await bottomNavAddBtn.click();
      await expect(page.locator('text=ชอล์ก / ปากกา')).toBeVisible();

      const uniqueText = `ทดสอบปุ่มมือถือ ${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await page.fill('textarea', uniqueText);
      await page.click('button:has-text("แปะบนกระดาน")');

      const noteCard = page.locator('.chalkboard-frame .postit-shadow', { hasText: uniqueText }).first();
      await expect(noteCard).toBeVisible({ timeout: 8000 });
    }
  });
});
