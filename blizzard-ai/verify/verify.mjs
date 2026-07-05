// End-to-end verification: drives the landing page scroll animations and the
// portal CRM/admin flows, capturing screenshots along the way.
import { chromium } from 'playwright';

const BASE = 'http://localhost:5180';
const SHOT = (n) => `verify/shots/${n}.png`;
const results = [];
const ok = (name, pass, detail = '') => {
  results.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} — ${name}${detail ? ` (${detail})` : ''}`);
};

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// Hash of canvas pixels so we can prove the scrub actually changes frames.
async function canvasHash(testid) {
  return page.evaluate((tid) => {
    const c = document.querySelector(`[data-testid="${tid}"]`);
    if (!c) return null;
    const ctx = c.getContext('2d');
    const d = ctx.getImageData(0, 0, Math.min(c.width, 400), Math.min(c.height, 300)).data;
    let h = 0;
    for (let i = 0; i < d.length; i += 97) h = (h * 31 + d[i]) >>> 0;
    return h;
  }, testid);
}

async function scrollTo(y) {
  // Instant jump + settle time for Lenis/ScrollTrigger scrub to catch up.
  await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'auto' }), y);
  await page.waitForTimeout(1400);
}

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

// 1. Hero renders: brand letters visible, canvas painted with frames.
const brandVisible = await page.locator('.brand-track span').first().isVisible();
ok('Hero brand letters tracked in', brandVisible);
const heroH0 = await canvasHash('hero-canvas');
ok('Hero canvas painted', heroH0 !== null && heroH0 !== 0, `hash=${heroH0}`);
await page.screenshot({ path: SHOT('01-hero-top') });

// 2. Scroll scrubs the orbit — canvas content must change with scroll.
const heroScene = page.locator('[data-testid="hero-scene"]');
const heroBox = await heroScene.evaluate((el) => ({ top: el.offsetTop, height: el.offsetHeight }));
await scrollTo(heroBox.top + heroBox.height * 0.45);
const heroH1 = await canvasHash('hero-canvas');
await scrollTo(heroBox.top + heroBox.height * 0.85);
const heroH2 = await canvasHash('hero-canvas');
ok('Scroll scrubs hero orbit (frame changes)', heroH0 !== heroH1 && heroH1 !== heroH2, `${heroH0} → ${heroH1} → ${heroH2}`);
await page.screenshot({ path: SHOT('02-hero-mid-orbit') });

// Hero copy fades out as orbit begins.
const heroCopyOpacity = await page.locator('.hero-copy').evaluate((el) => getComputedStyle(el).opacity);
ok('Hero copy recedes on scroll', parseFloat(heroCopyOpacity) < 0.15, `opacity=${heroCopyOpacity}`);

// 3. Story section reveals.
await page.locator('#story').scrollIntoViewIfNeeded();
await page.waitForTimeout(1600);
const storyOpacity = await page.locator('#story .display').evaluate((el) => getComputedStyle(el).opacity);
ok('Story "Crafted in Darkness" reveals', parseFloat(storyOpacity) > 0.9, `opacity=${storyOpacity}`);
await page.screenshot({ path: SHOT('03-story') });

// 4. Lock scene scrubs + pointer nudge.
const lockScene = page.locator('[data-testid="lock-scene"]');
const lockBox = await lockScene.evaluate((el) => ({ top: el.offsetTop, height: el.offsetHeight }));
await scrollTo(lockBox.top + lockBox.height * 0.2);
const lockH0 = await canvasHash('lock-canvas');
await scrollTo(lockBox.top + lockBox.height * 0.7);
const lockH1 = await canvasHash('lock-canvas');
ok('Lock mechanism scrubs with scroll', lockH0 !== lockH1, `${lockH0} → ${lockH1}`);
await page.mouse.move(200, 450);
await page.waitForTimeout(700);
const lockH2 = await canvasHash('lock-canvas');
await page.mouse.move(1240, 450);
await page.waitForTimeout(700);
const lockH3 = await canvasHash('lock-canvas');
ok('Lock answers mouse movement', lockH2 !== lockH3, `${lockH2} → ${lockH3}`);
await page.screenshot({ path: SHOT('04-lock') });

// 5. Macro scene scrubs.
const macroScene = page.locator('[data-testid="macro-scene"]');
const macroBox = await macroScene.evaluate((el) => ({ top: el.offsetTop, height: el.offsetHeight }));
await scrollTo(macroBox.top + macroBox.height * 0.25);
const macroH0 = await canvasHash('macro-canvas');
await scrollTo(macroBox.top + macroBox.height * 0.75);
const macroH1 = await canvasHash('macro-canvas');
ok('Macro detail scene scrubs with scroll', macroH0 !== macroH1, `${macroH0} → ${macroH1}`);
await page.screenshot({ path: SHOT('05-macro') });

// 6. Exploded scene: spec callouts appear on scrub.
const expScene = page.locator('[data-testid="exploded-scene"]');
const expBox = await expScene.evaluate((el) => ({ top: el.offsetTop, height: el.offsetHeight }));
await scrollTo(expBox.top + expBox.height * 0.9);
await page.waitForTimeout(1200);
const calloutOpacities = await page.$$eval('[data-testid="spec-callout"]', (els) =>
  els.map((el) => parseFloat(getComputedStyle(el).opacity)),
);
ok('Exploded spec callouts revealed', calloutOpacities.every((o) => o > 0.85), calloutOpacities.join(', '));
await page.screenshot({ path: SHOT('06-exploded') });

// 7. Edition of 88.
await page.locator('#edition').scrollIntoViewIfNeeded();
await page.waitForTimeout(1800);
const edVisible = await page.locator('.edition-number').evaluate((el) => parseFloat(getComputedStyle(el).opacity));
ok('Edition of 88 reveals', edVisible > 0.9, `opacity=${edVisible}`);
await page.screenshot({ path: SHOT('07-edition') });

// 8. Waitlist form → lead lands in CRM.
await page.locator('#waitlist').scrollIntoViewIfNeeded();
await page.waitForTimeout(1400);
await page.fill('#wl-name', 'Ada Verification');
await page.fill('#wl-company', 'Playwright & Co');
await page.fill('#wl-email', 'ada@example.com');
await page.fill('#wl-note', 'Intake automation.');
await page.click('.waitlist .btn-gold');
await page.waitForSelector('[data-testid="waitlist-confirm"]');
ok('Waitlist submission confirmed', true);
await page.screenshot({ path: SHOT('08-waitlist') });

// 9. Portal: login gate, wrong then right code.
await page.goto(`${BASE}/#/portal`, { waitUntil: 'networkidle' });
await page.fill('#pl-name', 'Verifier');
await page.fill('#pl-code', 'WRONG');
await page.click('.portal-login .btn-gold');
await page.waitForSelector('[data-testid="login-error"]');
ok('Portal rejects bad access code', true);
await page.fill('#pl-code', 'ELOHIM88');
await page.click('.portal-login .btn-gold');
await page.waitForSelector('[data-testid="portal"]');
ok('Portal accepts access code', true);

// 10. Lead from the site is in the pipeline.
const leadRow = await page.locator('table.leads td.lead-name', { hasText: 'Ada Verification' }).count();
ok('Waitlist lead appears in CRM pipeline', leadRow === 1);
await page.selectOption('table.leads select', 'qualified');
await page.waitForTimeout(300);
const pill = await page.locator('.status-pill.qualified').count();
ok('Lead status updates to qualified', pill >= 1);
await page.screenshot({ path: SHOT('09-portal-pipeline') });

// 11. Training tab shows modules; admin edits appear there.
await page.click('[data-testid="tab-training"]');
const modCount = await page.locator('[data-testid="module-card"]').count();
ok('Training area shows modules', modCount >= 3, `${modCount} modules`);
await page.click('[data-testid="tab-admin"]');
await page.fill('#ad-title', 'Verification Module');
await page.fill('#ad-body', 'Added by automated check.');
await page.click('[data-testid="admin-save"]');
await page.waitForTimeout(300);
await page.click('[data-testid="tab-training"]');
const hasNew = await page.locator('[data-testid="module-card"] h3', { hasText: 'Verification Module' }).count();
ok('Admin-published module appears in training', hasNew === 1);
await page.screenshot({ path: SHOT('10-portal-training') });

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
