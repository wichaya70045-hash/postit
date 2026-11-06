import { test, expect } from '@playwright/test';

test.describe('Free Movement & Placement of Post-it Notes (ขยับอิสระ & วางตรงไหนก็ได้ในกระดาน)', () => {
  test('สามารถเลือกจุดแปะบนกระดานดำได้อย่างอิสระผ่านปุ่มเลือกจุดบนกระดาน', async ({ page, isMobile }) => {
    await page.goto('/');

    // Open composer
    if (isMobile) {
      await page.locator('button[aria-label="เขียนโพสต์อิทใหม่"]:visible').click();
    } else {
      await page.locator('button', { hasText: 'แปะโพสต์อิท' }).click();
    }

    // Verify option to pick placement on board exists
    const pickBtn = page.locator('button', { hasText: 'เลือกจุดบนกระดาน' });
    await expect(pickBtn).toBeVisible();
    await pickBtn.click();

    // Mode banner should be visible
    await expect(page.locator('text=แตะจุดไหนบนกระดานดำก็ได้เพื่อวางโพสต์อิท')).toBeVisible();

    // Tap on the chalkboard
    const board = page.locator('.chalkboard-frame');
    await board.click({ position: { x: 100, y: 150 }, force: true });

    // Composer re-opens with selected coordinates
    await expect(page.locator('text=เลือกตำแหน่งแปะ: X')).toBeVisible();

    // Fill note and submit
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    const uniqueText = `แปะจุดที่เลือกอิสระ ${Date.now()}`;
    await textarea.fill(uniqueText);

    await page.locator('button', { hasText: 'แปะบนกระดาน' }).click({ force: true });

    // Verify note is created on board
    await expect(page.locator(`text=${uniqueText}`)).toBeVisible({ timeout: 10000 });
  });

  test('สามารถลากขยับโพสต์อิทบนกระดานได้อย่างอิสระไปยังตำแหน่งใหม่ (Drag freely with Pointer Events)', async ({ page, isMobile }) => {
    await page.goto('/');

    const firstNote = page.locator('.chalkboard-frame .postit-shadow').first();
    await expect(firstNote).toBeVisible();

    const initialBox = await firstNote.boundingBox();
    expect(initialBox).not.toBeNull();

    if (initialBox) {
      const startX = initialBox.x + initialBox.width / 2;
      const startY = initialBox.y + initialBox.height / 2;
      const targetX = startX > 180 ? startX - 50 : startX + 50;
      const targetY = startY > 250 ? startY - 50 : startY + 50;

      if (isMobile) {
        // Dispatch touch / pointer events on mobile
        await firstNote.dispatchEvent('pointerdown', { clientX: startX, clientY: startY, pointerId: 1, button: 0 });
        await firstNote.dispatchEvent('pointermove', { clientX: targetX, clientY: targetY, pointerId: 1 });
        await firstNote.dispatchEvent('pointerup', { clientX: targetX, clientY: targetY, pointerId: 1 });
      } else {
        // Desktop smooth mouse drag
        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(targetX, targetY, { steps: 8 });
        await page.mouse.up();
      }

      // Wait a moment for position update
      await page.waitForTimeout(600);

      const newBox = await firstNote.boundingBox();
      expect(newBox).not.toBeNull();
      if (newBox) {
        // The note should have moved significantly from its initial position
        const movedDistance = Math.hypot(newBox.x - initialBox.x, newBox.y - initialBox.y);
        expect(movedDistance).toBeGreaterThan(15);
      }
    }
  });

  test('คลิกธรรมดาโดยไม่ลาก จะยังเปิดหน้าต่างรายละเอียดโพสต์อิท (NoteDetailModal) ได้ตามปกติ', async ({ page }) => {
    await page.goto('/');

    const firstNote = page.locator('.chalkboard-frame .postit-shadow').first();
    await expect(firstNote).toBeVisible();

    // Simple single click (no movement)
    await firstNote.click({ force: true });

    // Detail modal should open
    await expect(page.locator('text=รายละเอียดโพสต์อิท')).toBeVisible();

    // Close detail modal
    await page.locator('button[aria-label="ปิด"]').click();
    await expect(page.locator('text=รายละเอียดโพสต์อิท')).not.toBeVisible();
  });
});
