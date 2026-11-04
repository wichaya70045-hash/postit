import { test, expect } from '@playwright/test';

test.describe('Permanent Note Deletion (ลบโพสต์อิทแล้วหายไปถาวร ไม่กลับมาอีก)', () => {
  test.describe.configure({ mode: 'serial' });

  test('ผู้เขียนโพสต์สามารถลบโพสต์ของตัวเอง และโพสต์อิทหายไปถาวร ไม่กลับมาเมื่อโพลล์หรือรีเฟรช', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());
    await page.goto('/');

    // 1. Create a note with unique random ID
    const uniqueText = `โน้ตทดสอบลบถาวร-ผู้เขียน ${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const composeBtn = page.locator('button:has-text("แปะโพสต์อิท"):visible, button[aria-label="เขียนโพสต์อิทใหม่"]:visible').first();
    await composeBtn.click();
    await page.fill('textarea', uniqueText);
    await page.click('button:has-text("แปะบนกระดาน")');

    // Verify it appeared on the chalkboard
    const noteCard = page.locator('.chalkboard-frame .postit-shadow', { hasText: uniqueText }).first();
    await expect(noteCard).toBeVisible({ timeout: 8000 });

    // 2. Open Note Detail Modal
    await noteCard.click({ force: true });
    await expect(page.locator('text=รายละเอียดโพสต์อิท')).toBeVisible();

    // 3. Open options menu and click delete
    const menuBtn = page.locator('button[aria-label="ตัวเลือกเพิ่มเติม"]');
    await menuBtn.click();
    const deleteBtn = page.locator('button:has-text("ลบโพสต์ของฉัน")');
    await expect(deleteBtn).toBeVisible();
    await deleteBtn.click();

    // 4. Verify note is immediately gone from the chalkboard
    await expect(page.locator('.chalkboard-frame .postit-shadow', { hasText: uniqueText })).not.toBeVisible();

    // 5. Wait through polling cycles (4 seconds)
    await page.waitForTimeout(4000);
    await expect(page.locator('.chalkboard-frame .postit-shadow', { hasText: uniqueText })).not.toBeVisible();

    // 6. Reload the page completely
    await page.reload();
    await expect(page.locator('h1')).toContainText('Yanin Board');
    await page.waitForTimeout(3500);

    // 7. Verify the note NEVER returns
    await expect(page.locator('.chalkboard-frame .postit-shadow', { hasText: uniqueText })).not.toBeVisible();
  });

  test('แอดมินลบโพสต์อิทผ่านปุ่มถังขยะด่วนบนกระดาน แล้วโพสต์อิทหายไปถาวร ไม่กลับมาอีก', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());
    await page.goto('/');

    // 1. Post a note with unique random ID
    const uniqueText = `โน้ตทดสอบแอดมินลบด่วน ${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const composeBtn = page.locator('button:has-text("แปะโพสต์อิท"):visible, button[aria-label="เขียนโพสต์อิทใหม่"]:visible').first();
    await composeBtn.click();
    await page.fill('textarea', uniqueText);
    await page.click('button:has-text("แปะบนกระดาน")');

    const noteCard = page.locator('.chalkboard-frame .postit-shadow', { hasText: uniqueText }).first();
    await expect(noteCard).toBeVisible({ timeout: 8000 });

    // 2. Login as Admin
    const adminBtn = page.locator('button[aria-label="เข้าสู่ระบบครูเวร"]');
    await adminBtn.click();
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin1234');
    await page.click('button:has-text("เข้าสู่ระบบ Admin")');
    await page.click('button[aria-label="ปิดแผงควบคุม"]');

    // 3. Quick delete button on chalkboard note
    const quickDeleteBtn = noteCard.locator('button[aria-label="ลบโพสต์แผ่นนี้"]');
    await expect(quickDeleteBtn).toBeVisible();
    await quickDeleteBtn.click();

    // 4. Verify note disappears immediately
    await expect(page.locator('.chalkboard-frame .postit-shadow', { hasText: uniqueText })).not.toBeVisible();

    // 5. Wait through multiple polling cycles (4.5 seconds)
    await page.waitForTimeout(4500);
    await expect(page.locator('.chalkboard-frame .postit-shadow', { hasText: uniqueText })).not.toBeVisible();

    // 6. Hard reload
    await page.reload();
    await page.waitForTimeout(3500);

    // 7. Note must NOT return
    await expect(page.locator('.chalkboard-frame .postit-shadow', { hasText: uniqueText })).not.toBeVisible();
  });
});
