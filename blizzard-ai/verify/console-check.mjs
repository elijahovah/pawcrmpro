import { chromium } from 'playwright';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage();
page.on('console', (m) => console.log('[console]', m.type(), m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto('http://localhost:5180', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
console.log('BODY:', (await page.locator('body').innerHTML()).slice(0, 400));
await browser.close();
