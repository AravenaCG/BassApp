import {test,expect} from '@playwright/test';
const user={id:'tour-person',email:'tour@example.test',displayName:'Gira',weeklyStudyMinutes:60,reminderDay:1,instrument:'doubleBass',level:'basic',timeZone:'America/Argentina/Buenos_Aires',reminderEnabled:true};
async function setup(page){
 await page.addInitScript(()=>{localStorage.setItem('appbass-tour-v1-tour-person','seen');localStorage.setItem('appbass-tour-v1-other-tour','seen');window.__tourMoves=0;const animate=Element.prototype.animate;Element.prototype.animate=function(...args){if(this.classList.contains('journey-traveler'))window.__tourMoves++;return animate.apply(this,args);};});
 let current=user,done=['B01'],fail=false,writes=0;
 await page.route('**/api/**',async r=>{
  const path=new URL(r.request().url()).pathname;
  if(path==='/api/auth/logout'){current=null;return r.fulfill({json:{ok:true}});}
  if(path==='/api/progress'){
   if(r.request().method()==='POST'){writes++;if(fail)return r.fulfill({status:503,json:{error:'Guardado pendiente'}});done=['B01','B02'];}
   return r.fulfill({json:{completed:current?done:[],totalPoints:done.length*100,states:{},nextLessonId:done.includes('B02')?'B03':'B02',awardedPoints:100}});
  }
  return r.fulfill({json:{user:current,plan:{total:30,warmup:6,concept:9,play:15},reminder:false}});
 });
 return {setUser:u=>current=u,setFailure:b=>fail=b,writes:()=>writes};
}
test('tour has 40 venues, keeps musical lessons and marks future concerts and rewards honestly',async({page})=>{
 const state=await setup(page);await page.setViewportSize({width:390,height:844});await page.goto('/appbass.html#curso');
 await expect(page.locator('#profile-button')).toBeVisible();await expect(page.locator('#course-map [data-lesson=B01]')).toContainText('Tocar en tu cuarto');
 await expect(page.locator('.tour-coming')).toContainText('PRÓXIMAMENTE');await expect(page.locator('.tour-coming')).toContainText('Todavía no están disponibles');
 await page.locator('.tour-look summary').click();await page.locator('#tour-controls [data-tour-character=pulse]').click();
 await page.locator('#tour-controls [data-tour-color]').selectOption('coral');
 await expect(page.locator('#tour-controls [data-tour-character=pulse]')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#course-map')).toHaveCSS('--tour-accent','#ff9d9d');
 await page.locator('#profile-button').click();await expect(page.locator('#profile-dialog [data-tour-character=pulse]')).toHaveAttribute('aria-pressed','true');
 await page.locator('#profile-dialog [data-tour-color]').selectOption('gold');await page.locator('#profile-dialog [data-close]').click();
 await expect(page.locator('#tour-controls [data-tour-color]')).toHaveValue('gold');
 await page.reload();await page.locator('.tour-look summary').click();await expect(page.locator('#tour-controls [data-tour-character=pulse]')).toHaveAttribute('aria-pressed','true');
 await page.setViewportSize({width:390,height:844});expect(state.writes()).toBe(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.locator('#tour-controls').screenshot({path:'outputs/tour-avatar-mobile.png'});await page.locator('.journey-station.current').screenshot({path:'outputs/tour-stop-mobile.png'});
 await page.locator('[data-level=advanced]').click();await expect(page.locator('#course-map [data-lesson=A12]')).toContainText('Show en River Plate');
 await page.locator('#journey-layout').click();await expect(page.locator('#course-list [data-lesson=A12] .list-venue')).toHaveText('Show en River Plate');
 state.setUser({...user,id:'other-tour'});await page.reload();await page.locator('.tour-look summary').click();await expect(page.locator('#tour-controls [data-tour-character=groove]')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#tour-controls [data-tour-color]')).toHaveValue('cyan');
});
test('avatar travels only after successful save; reduced motion and unavailable storage stay usable',async({page})=>{
 const state=await setup(page);await page.goto('/appbass.html#curso');await expect(page.locator('.journey-station.current button')).toHaveAttribute('data-lesson','B02');
 state.setFailure(true);await page.locator('#course-map [data-lesson=B02]').click();await page.locator('#complete-lesson').click();await expect(page.locator('#toast')).toContainText('Guardado pendiente');
 await page.locator('#close-detail').click();await expect(page.locator('.journey-station.current button')).toHaveAttribute('data-lesson','B02');expect(await page.evaluate(()=>window.__tourMoves)).toBe(0);
 state.setFailure(false);await page.locator('#course-map [data-lesson=B02]').click();await page.locator('#complete-lesson').click();await expect(page.locator('#detail-label')).toHaveText('LECCIÓN B03');await page.locator('#close-detail').click();
 await page.locator('#course-map [data-lesson=B03]').scrollIntoViewIfNeeded();await expect.poll(()=>page.evaluate(()=>window.__tourMoves)).toBe(1);
 await expect(page.locator('.journey-traveler')).toHaveCount(0);await page.reload();await expect(page.locator('.journey-station.current button')).toHaveAttribute('data-lesson','B03');expect(await page.evaluate(()=>window.__tourMoves)).toBe(0);
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.tour-look summary').click();await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw Error('blocked');};});
 await page.locator('#tour-controls [data-tour-character=pulse]').click();await expect(page.locator('#tour-controls [data-tour-status]')).toContainText('No se pudo guardar');
 await page.locator('#tour-controls [data-tour-motion]').uncheck();await expect(page.locator('.journey-traveler')).toHaveCount(0);
 await page.locator('#profile-button').click();await page.locator('#logout').click();await expect(page.locator('.journey-station.current button')).toHaveAttribute('data-lesson','B01');expect(await page.evaluate(()=>window.__tourMoves)).toBe(0);
});
