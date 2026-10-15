import {test,expect} from '@playwright/test';
test('reading section presents a bass-clef note exercise with progressive levels',async({page})=>{
 await page.goto('/appbass.html#lectura');
 await expect(page.locator('#reading-workspace')).toBeVisible();
 await expect(page.locator('.reading-clef')).toHaveCount(1);
 await expect(page.locator('[data-reading-answer]')).toHaveCount(7);
 await page.locator('[data-reading-level="3"]').click();
 await page.locator('.reading-answers button').first().click();
 await expect(page.locator('[data-reading-next]')).toBeEnabled();
 await expect(page.locator('[data-reading-total]')).toHaveText('1');
 await page.locator('[data-reading-next]').click();
 await expect(page.locator('[data-reading-total]')).toHaveText('1');
});
