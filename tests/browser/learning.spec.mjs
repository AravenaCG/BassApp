import {test,expect} from '@playwright/test';
async function guest(page){await page.route('**/api/**',r=>r.fulfill({json:{user:null,plan:{total:30,warmup:6,concept:9,play:15},reminder:false}}));}
test('guided atlas separates route from inventory, supports five strings and printing on mobile',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await guest(page);await page.setViewportSize({width:390,height:844});await page.goto('/appbass.html#escalas');
 await page.locator('#atlas-instrument').selectOption('electricBass5');await page.locator('[data-atlas-family="major"]').click();
 const route=page.locator('.atlas-route');await expect(route.locator('[data-route-step]')).toHaveCount(8);
 await expect(route.locator('.route-svg')).toContainText('INICIO 1');await expect(route.locator('.route-svg')).toContainText('FIN 8');
 await route.locator('[data-route-start]').selectOption('1');await route.locator('[data-route-label]').selectOption('degrees');await route.locator('[data-route-next]').click();await expect(route.locator('[data-route-step="1"]')).toHaveClass(/route-active/);
 const explore=page.locator('#atlas-dialog details').filter({has:page.getByText('Explorar todas las ubicaciones · no es un recorrido',{exact:true})});await expect(explore).not.toHaveAttribute('open');
 await page.evaluate(()=>{window.print=()=>{window.__printed=true;};});await route.locator('[data-route-print]').click();expect(await page.evaluate(()=>window.__printed)).toBe(true);await expect(page.locator('#bass-print-sheet')).toContainText('FIN 8');
 expect(await page.locator('#atlas-dialog').evaluate(d=>d.scrollWidth<=d.clientWidth+1)).toBe(true);await route.scrollIntoViewIfNeeded();await page.screenshot({path:'outputs/guided-route-mobile.png'});expect(errors).toEqual([]);
});
test('workshop tasks, genre practice, low B, ear answers and review persistence work',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await guest(page);await page.goto('/appbass.html#practicar');
 await expect(page.locator('#study-plan li')).toHaveCount(3);await page.locator('#study-minutes').selectOption('5');await page.locator('#study-timer').click();await expect(page.locator('#study-clock')).toContainText('restantes');await page.locator('#study-pause').click();
 await page.getByText('Practicar por géneros · ocho estudios originales',{exact:true}).click();await expect(page.locator('[data-genre]')).toHaveCount(8);await page.locator('[data-genre="funk"]').click();await expect(page.locator('#exercise-title')).toHaveText('Funk · estudio original');
 await page.locator('#exercise-select').selectOption('open-strings');await page.locator('#practice-instrument').selectOption('electricBass5');await expect(page.locator('#practice-note')).toContainText('Si');await expect(page.locator('#practice-note')).toContainText('cuerda B');
 await page.getByText('Oído · escuchar antes de mirar',{exact:true}).click();await page.locator('[data-ear-answer]').first().click();await expect(page.locator('#ear-feedback')).toContainText('Escuchá el ejemplo');await page.locator('#ear-listen').click();await page.locator('[data-ear-answer]').first().click();await expect(page.locator('#ear-feedback')).not.toContainText('Escuchá el ejemplo antes');await page.locator('#ear-kind').selectOption('note');await expect(page.locator('[data-ear-answer]')).toHaveCount(12);
 await page.getByText('Repasos personalizados · cómo te fue',{exact:true}).click();await expect(page.locator('#review-lesson option')).toHaveCount(40);await page.locator('#review-lesson').selectOption('B01');await page.locator('#review-tempo').fill('72');await page.locator('#review-save').click();await expect(page.locator('#review-list')).toContainText('72');await page.reload();await page.getByText('Repasos personalizados · cómo te fue',{exact:true}).click();await expect(page.locator('#review-list')).toContainText('72');expect(errors).toEqual([]);
});
