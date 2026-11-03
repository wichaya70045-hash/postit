import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('แคปเจอร์ภาพหน้าจอ Universal Design (Desktop & Mobile)', async ({ page }, testInfo) => {
  const screenshotDir = path.join(process.cwd(), 'tests', 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const prefix = testInfo.project.name.toLowerCase().includes('desktop')
    ? 'desktop'
    : testInfo.project.name.toLowerCase().includes('iphone')
    ? 'iphone-se'
    : 'pixel-7';

  // 1. Board View
  await page.goto('/');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(screenshotDir, `${prefix}-1-board.png`) });

  // 2. Composer View
  const postBtn = page.locator('button[aria-label="เขียนโพสต์อิทใหม่"]:visible').first();
  await postBtn.click();
  await page.locator('textarea').fill('ยินดีต้อนรับสู่ Yanin Board 📌 เขียน วาด หรือลากโพสต์อิทมาแปะบนกระดานได้เลย!');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, `${prefix}-2-composer.png`) });

  // 3. Crisis Dialog View
  await page.locator('textarea').fill('เหนื่อยมาก ไม่อยากอยู่แล้ว อยากตาย');
  await page.locator('button', { hasText: 'แปะบนกระดาน' }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, `${prefix}-3-crisis-dialog.png`) });

  // 4. Help Page View
  await page.goto('/help');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, `${prefix}-4-help.png`) });
});
