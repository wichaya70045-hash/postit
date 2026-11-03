import { test, expect } from '@playwright/test';

test.describe('ระบบความปลอดภัยและภาวะวิกฤติ (Safety & Crisis)', () => {
  test('ตรวจจับเบอร์โทรศัพท์หรือ PII และแจ้งเตือนไม่ให้แปะ', async ({ page }) => {
    await page.goto('/');

    await page.locator('button[aria-label="เขียนโพสต์อิทใหม่"]:visible').click();
    await page.locator('textarea').fill('โทรมาคุยกันได้นะที่ 081-999-8888');

    // Click submit
    await page.locator('button', { hasText: 'แปะบนกระดาน' }).click();

    // Verify PII alert message is shown
    await expect(page.locator('text=โปรดนำข้อมูลติดต่อออกก่อนแปะ')).toBeVisible();
    await expect(page.locator('text=พบหมายเลขโทรศัพท์')).toBeVisible();
  });

  test('เมื่อพบคำเสี่ยงทำร้ายตัวเอง ต้องแสดงหน้าต่างอ่อนโยนพร้อมปุ่มโทร 1323', async ({ page }) => {
    await page.goto('/');

    await page.locator('button[aria-label="เขียนโพสต์อิทใหม่"]:visible').click();
    await page.locator('textarea').fill('เหนื่อยมาก ไม่อยากอยู่แล้ว อยากตาย');

    // Click submit
    await page.locator('button', { hasText: 'แปะบนกระดาน' }).click();

    // Verify Gentle Crisis Dialog
    await expect(page.locator('text=เราได้ยินคุณนะ...')).toBeVisible();
    await expect(page.locator('text=หากตอนนี้รู้สึกว่าเรื่องราวในใจมันหนักเกินจะแบกไว้คนเดียว')).toBeVisible();

    // Verify hotline 1323 direct call link
    const hotlineBtn = page.locator('a[href="tel:1323"]');
    await expect(hotlineBtn).toBeVisible();
    await expect(hotlineBtn).toContainText('1323');
  });

  test('หน้าความช่วยเหลือ (/help) แสดงข้อมูลสายด่วนครบถ้วน', async ({ page }) => {
    await page.goto('/help');

    await expect(page.locator('h1')).toContainText('แหล่งความช่วยเหลือทางใจ');
    await expect(page.locator('a[href="tel:1323"]')).toBeVisible();
    await expect(page.locator('a[href="tel:1669"]')).toBeVisible();
    await expect(page.locator('text=/กติกา/')).toBeVisible();
  });
});
