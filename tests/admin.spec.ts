import { test, expect } from '@playwright/test';

test.describe('Admin System & Moderation', () => {
  test('ผู้ใช้งานทั่วไปสามารถใช้งาน อ่าน และเขียนโพสต์อิทได้โดยไม่ต้องเข้าสู่ระบบ (No login required for public)', async ({ page }) => {
    await page.goto('/');

    // Check header exists and admin button is present but optional
    await expect(page.locator('h1')).toContainText('Yanin Board');
    
    // Public user should see board capacity, notes, and compose button without login prompt
    await expect(page.locator('text=ความจุกระดาน')).toBeVisible();

    // Open composer directly without any authentication barrier
    const composeBtn = page.locator('button:has-text("แปะโพสต์อิท"):visible, button[aria-label="เขียนโพสต์อิทใหม่"]:visible').first();
    await composeBtn.click();
    await expect(page.locator('text=ชอล์ก / ปากกา')).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('สามารถเข้าสู่ระบบแอดมิน (ครูเวร) ด้วย admin / admin1234 และเปิดแดชบอร์ดจัดการได้', async ({ page }) => {
    await page.goto('/');

    // Click Admin button in header
    const adminBtn = page.locator('button[aria-label="เข้าสู่ระบบครูเวร"]');
    await expect(adminBtn).toBeVisible();
    await adminBtn.click();

    // Verify Admin Login modal appears
    await expect(page.locator('text=เข้าสู่ระบบผู้ดูแล (Admin)')).toBeVisible();
    await expect(page.locator('text=ไม่ต้องล็อกอิน').first()).toBeVisible();

    // Fill in credentials
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin1234');

    // Submit
    await page.click('button:has-text("เข้าสู่ระบบ Admin")');

    // Should now see admin dashboard
    await expect(page.locator('text=แผงควบคุมผู้ดูแล (Admin Panel)')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("โพสต์ทั้งหมด")')).toBeVisible();
    await expect(page.locator('button:has-text("ตั้งค่ากระดาน")')).toBeVisible();

    // Close admin dashboard
    await page.click('button[aria-label="ปิดแผงควบคุม"]');
    
    // Header should now show "ครูเวร (Admin)"
    await expect(page.locator('button[aria-label="แผงควบคุมครูเวร"]')).toBeVisible();
  });

  test('สามารถพิมพ์คำไม่สุภาพเพื่อระบายอารมณ์ได้ และแอดมินสามารถลบโพสต์อิทแผ่นนั้นได้สำเร็จ', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());
    await page.goto('/');

    // 1. Post a venting note with informal/impolite words
    const composeBtn = page.locator('button:has-text("แปะโพสต์อิท"):visible, button[aria-label="เขียนโพสต์อิทใหม่"]:visible').first();
    await composeBtn.click();

    const uniqueText = `วันนี้แม่งเหนื่อยสัสๆ ${Date.now()}`;
    await page.fill('textarea', uniqueText);
    await page.click('button:has-text("แปะบนกระดาน")');

    // 2. Verify note is successfully posted and visible on the chalkboard
    const postedNote = page.locator('.chalkboard-frame .postit-shadow', { hasText: uniqueText });
    await expect(postedNote).toBeVisible({ timeout: 8000 });

    // 3. Login as Admin
    const adminBtn = page.locator('button[aria-label="เข้าสู่ระบบครูเวร"]');
    await adminBtn.click();
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin1234');
    await page.click('button:has-text("เข้าสู่ระบบ Admin")');
    await page.click('button[aria-label="ปิดแผงควบคุม"]');
    await expect(page.locator('text=แผงควบคุมผู้ดูแล (Admin Panel)')).not.toBeVisible();

    // 4. Admin can delete directly via the note's quick delete button OR via detail modal
    const directDeleteBtn = postedNote.locator('button[aria-label="ลบโพสต์แผ่นนี้"]');
    if (await directDeleteBtn.isVisible()) {
      await directDeleteBtn.click();
    } else {
      await postedNote.locator('p').click();
      const deleteBtn = page.locator('button:has-text("ลบโพสต์นี้ (Admin)")');
      await expect(deleteBtn).toBeVisible({ timeout: 5000 });
      await deleteBtn.click();
    }

    // 5. Verify the note is deleted and removed from the chalkboard
    await expect(page.locator('.chalkboard-frame .postit-shadow', { hasText: uniqueText })).not.toBeVisible({ timeout: 5000 });
  });
});
