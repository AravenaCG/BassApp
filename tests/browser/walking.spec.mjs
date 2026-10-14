import {test,expect} from '@playwright/test';
import {walkingCatalog} from '../../public/walking-studies.mjs';
test('walking studies load notation, guidance and downloadable PDFs',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/**',r=>r.fulfill({json:{user:null,plan:{total:30,warmup:6,concept:9,play:15},reminder:false}}));
 await page.goto('/appbass.html#practicar');
 await page.locator('#walking-library summary').click();
 for(const item of walkingCatalog){
  await page.locator(`[data-walking-study="${item.id}"]`).click();
  await expect(page.locator('#walking-guide')).toBeVisible();
  expect(await page.locator('#practice-score [data-beat]').count()).toBeGreaterThan(20);
  const response=await page.request.get(item.pdf);expect(response.ok()).toBe(true);
  expect((await response.body()).subarray(0,4).toString()).toBe('%PDF');
 }
 await page.locator('#practice-play').click();await expect(page.locator('#practice-play')).toHaveText('Pausar');
 await page.locator('#practice-stop').click();expect(errors).toEqual([]);
});
