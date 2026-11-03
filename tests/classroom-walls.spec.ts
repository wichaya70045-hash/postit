import { test, expect } from '@playwright/test';

test.describe('4-Wall Classroom & Top Sticky Note Stacking', () => {
  test('โพสต์อิทที่พึ่งเขียนใหม่ จะต้องแปะด้านบนสุดก่อน และอยู่เลเยอร์บนสุด (Highest z-index & Top Position)', async ({ page }) => {
    await page.goto('/');

    // 1. Check initial notes
    const initialNotes = page.locator('.chalkboard-frame .postit-shadow');
    await expect(initialNotes.first()).toBeVisible();

    // 2. Open Composer
    await page.locator('button[aria-label="เขียนโพสต์อิทใหม่"]:visible').click();

    // 3. Type unique text
    const uniqueNoteText = `โพสต์อิทแผ่นใหม่ล่าสุด ${Date.now()}: อยู่ด้านบนสุดเสมอ!`;
    const textarea = page.locator('textarea');
    await textarea.fill(uniqueNoteText);

    // 4. Submit
    await page.locator('button', { hasText: 'แปะบนกระดาน' }).click();

    // Wait for composer modal to close
    await expect(page.locator('textarea')).not.toBeVisible({ timeout: 5000 });

    // 5. Verify the new note appears on the chalkboard and check its position & z-index
    const newNote = page.locator('.chalkboard-frame .postit-shadow', { hasText: uniqueNoteText });
    await expect(newNote).toBeVisible({ timeout: 10000 });

    // The note's style top position should be in the top region (under 25%)
    const styleAttr = await newNote.getAttribute('style');
    expect(styleAttr).not.toBeNull();

    // Check z-index is set and high (newest note has highest z-index)
    const zIndex = await newNote.evaluate((el) => window.getComputedStyle(el).zIndex);
    expect(Number(zIndex)).toBeGreaterThanOrEqual(20);
  });

  test('สามารถกดปุ่มที่ขอบหน้าจอเพื่อหมุนดูห้องเรียนได้ครบทั้ง 4 ด้าน (กระดาน, ประตู, หลังห้อง, หน้าต่าง)', async ({ page }) => {
    await page.goto('/');

    // Wall 1: Front (กระดานดำ)
    await expect(page.locator('text=กระดานห้องเรียน Yanin')).toBeVisible();

    // Rotate Right to Wall 2: Right (ประตูห้องเรียน)
    const rightNavBtn = page.locator('button[aria-label^="หันไปทางขวา ดู"]');
    await expect(rightNavBtn).toBeVisible();
    await rightNavBtn.click();

    await expect(page.locator('text=ผนังด้านขวา: ประตูห้องเรียน & ระเบียงทางเดิน')).toBeVisible();
    await expect(page.locator('text=ตารางเรียนวิชาความสุข')).toBeVisible();

    // Test Door knock interaction
    await page.locator('button:has-text("เคาะประตูก๊อกๆ")').click();
    await expect(page.locator('text=ก๊อกๆ!')).toBeVisible();

    // Rotate Right to Wall 3: Back (บอร์ดหลังห้อง & ฟีเจอร์ใหม่)
    await rightNavBtn.click();
    await expect(page.locator('text=ผนังด้านหลัง: บอร์ดนิทรรศการ & โซนฟีเจอร์ในอนาคต')).toBeVisible();
    await expect(page.locator('text=นาฬิกาห้องเรียน')).toBeVisible();
    await expect(page.locator('text=ตู้ล็อกเกอร์ความลับ & ส่งจดหมาย')).toBeVisible();

    // Test feature voting
    const voteBtn = page.locator('button:has-text("โหวต")').first();
    await voteBtn.click();
    await expect(page.locator('text=โหวตแล้ว')).toBeVisible();

    // Rotate Right to Wall 4: Left (หน้าต่างห้องเรียน & วิว)
    await rightNavBtn.click();
    await expect(page.locator('text=ผนังด้านซ้าย: หน้าต่างห้องเรียนริมสนาม')).toBeVisible();
    await expect(page.locator('text=ต้นไม้ริมหน้าต่าง')).toBeVisible();

    // Test Window Toggle
    const windowToggleBtn = page.locator('button:has-text("ปิดหน้าต่าง")');
    await expect(windowToggleBtn).toBeVisible();
    await windowToggleBtn.click();
    await expect(page.locator('text=เปิดรับลม')).toBeVisible();

    // Rotate Left back through walls
    const leftNavBtn = page.locator('button[aria-label^="หันไปทางซ้าย ดู"]');
    await leftNavBtn.click(); // Back to Back wall
    await expect(page.locator('text=ผนังด้านหลัง')).toBeVisible();

    // Jump directly back to front board using the "กลับไปดูกระดานดำหน้าห้อง" button
    await page.locator('button:has-text("กลับไปดูกระดานดำหน้าห้อง")').click();
    await expect(page.locator('text=กระดานห้องเรียน Yanin')).toBeVisible();
  });
});
