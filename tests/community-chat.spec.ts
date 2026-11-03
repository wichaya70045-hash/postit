import { test, expect } from '@playwright/test';

test.describe('Classroom Community Chat Wall (ด้านซ้าย - บอร์ดคุยกันนิรนาม & ปลอดภัย)', () => {
  test('สามารถสลับไปผนังด้านซ้าย เลือกอาวตาร์ ใส่ชื่อปลอม และส่งข้อความคุยกันได้โดยไม่ต้องล็อกอิน', async ({ page }) => {
    await page.goto('/');

    // 1. Navigate to Left Wall (ด้านซ้าย)
    const leftWallBtn = page.locator('button:has-text("ด้านซ้าย")').first();
    await leftWallBtn.click();

    // 2. Verify wall header and anonymous badge
    await expect(page.locator('text=ผนังด้านซ้าย: บอร์ดคุยกันนิรนาม (Community Chat)')).toBeVisible();
    await expect(page.locator('text=ไม่ต้องล็อกอิน').first()).toBeVisible();

    // 3. Test Random Pseudonym button
    const shuffleBtn = page.locator('button[aria-label="สุ่มชื่อปลอม"]');
    await expect(shuffleBtn).toBeVisible();
    await shuffleBtn.click();

    // 4. Test typing custom pseudonym
    const nameInput = page.locator('input[placeholder*="ชื่อปลอม"]');
    await nameInput.fill('กระต่ายทดสอบ e2e');

    // 5. Test Avatar Picker modal
    const avatarBtn = page.locator('button[title*="คลิกเพื่อเปลี่ยนอาวตาร์"]');
    await avatarBtn.click();
    await expect(page.locator('text=เลือกอาวตาร์ & สีนิรนาม')).toBeVisible();
    // Pick panda avatar inside the modal picker grid
    await page.locator('.grid button:has-text("🐼")').click();
    await page.locator('button:has-text("เสร็จสิ้น")').click();

    // 6. Send a new chat message
    const uniqueMessage = `สวัสดีเพื่อนๆ ในห้องเรียน! ${Date.now()}`;
    const chatInput = page.locator('input[placeholder*="พิมพ์ข้อความคุยกันได้เลย"]');
    await chatInput.fill(uniqueMessage);
    await page.locator('button[aria-label="ส่งข้อความ"]').click();

    // 7. Verify message appears in stream with pseudonym and avatar
    const messageLocator = page.locator(`text=${uniqueMessage}`);
    await expect(messageLocator).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=กระต่ายทดสอบ e2e').last()).toBeVisible();

    // 8. Test Liking the message
    const heartBtn = page.locator('button:has-text("ใจ")').last();
    if (await heartBtn.isVisible()) {
      await heartBtn.click();
    }

    // 9. Test safety check: Trying to post a phone number should be blocked to protect the user
    await chatInput.fill('โทรหาเราได้ที่ 081-234-5678 นะ');
    await page.locator('button[aria-label="ส่งข้อความ"]').click();
    await expect(page.locator('text=เพื่อความปลอดภัยและความเป็นส่วนตัวของคุณ')).toBeVisible();

    // 10. Click safety policy modal to verify safe space info
    await page.locator('button:has-text("ความปลอดภัย")').click();
    await expect(page.locator('text=นโยบายความปลอดภัยของคนเขียน')).toBeVisible();
    await page.locator('button:has-text("เข้าใจแล้ว")').click();
  });
});
