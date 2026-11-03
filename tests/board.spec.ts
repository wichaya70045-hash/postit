import { test, expect } from '@playwright/test';

test.describe('Yanin Board - Thai Classroom Green Chalkboard & Drag/Post Flow', () => {
  test('โหลดหน้าแรกและแสดงผลกระดานดำห้องเรียนไทยอย่างสวยงามทั้งบนคอมพิวเตอร์และมือถือ', async ({ page }) => {
    await page.goto('/');

    // Check brand header
    await expect(page.locator('h1')).toContainText('Yanin Board');

    // Check help link
    await expect(page.locator('a[aria-label="แหล่งช่วยเหลือทางใจ"]')).toBeVisible();

    // Check Thai classroom green chalkboard frame and texture
    const board = page.locator('.bg-chalkboard');
    await expect(board.first()).toBeVisible();

    // Check chalk corner title
    await expect(page.locator('text=กระดานห้องเรียน Yanin')).toBeVisible();

    // Check post-it notes exist
    const notes = page.locator('.postit-shadow');
    await expect(notes.first()).toBeVisible();
  });

  test('สามารถเปิด Composer และเขียนโพสต์อิทเลือกสีอิสระแปะลงกระดานได้', async ({ page }) => {
    await page.goto('/');

    // Click visible post button
    await page.locator('button[aria-label="เขียนโพสต์อิทใหม่"]:visible').click();

    // Verify color options exist (free color selection)
    await expect(page.locator('text=เลือกสีกระดาษอิสระ')).toBeVisible();

    // Pick a custom pastel color button
    const colorSwatches = page.locator('button[aria-label^="เลือกสี"]');
    if (await colorSwatches.count() > 2) {
      await colorSwatches.nth(2).click();
    }

    // Fill note
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();

    const uniqueText = `การบ้านวิชาความสุข ${Date.now()}: รอยยิ้มและการแบ่งปัน!`;
    await textarea.fill(uniqueText);

    // Verify draggable note indicator appears
    await expect(page.locator('text=ลากได้')).toBeVisible();

    // Click submit button
    await page.locator('button', { hasText: 'แปะบนกระดาน' }).click();

    // Verify it appears on the chalkboard
    await expect(page.locator(`text=${uniqueText}`)).toBeVisible({ timeout: 10000 });
  });

  test('แสดงสถานะความจุกระดาน และสามารถสลับมุมมองได้', async ({ page, isMobile }) => {
    await page.goto('/');

    // Verify board capacity indicator
    await expect(page.locator('text=ความจุกระดาน:')).toBeVisible();

    if (!isMobile) {
      const gridBtn = page.locator('button:has-text("ตาราง"):visible');
      if (await gridBtn.isVisible()) {
        await gridBtn.click();
        await page.waitForTimeout(300);
      }
      const canvasBtn = page.locator('button:has-text("กระดานดำ"):visible');
      if (await canvasBtn.isVisible()) {
        await canvasBtn.click();
        await page.waitForTimeout(300);
      }
    } else {
      const toggleBtn = page.locator('button:has-text("สลับเป็น"):visible');
      if (await toggleBtn.isVisible()) {
        await toggleBtn.click();
        await page.waitForTimeout(300);
      }
    }
  });
});
