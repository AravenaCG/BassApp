import {test,expect} from '@playwright/test';
import {harmonyUnits} from '../../public/harmony-curriculum.mjs';
test('harmony route verifies understanding, remembers local progress and isolates logout',async({page})=>{
 await mocks(page,true);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/appbass.html#curso?espacio=armonia');await expect(page.locator('#profile-button')).toBeVisible();
 await expect(page.locator('#harmony-title')).toHaveText(harmonyUnits[0].title);
 await expect(page.locator('#harmony-complete')).toBeDisabled();
 await page.locator('[data-harmony-question="0"] [data-harmony-answer="0"]').click();
 await expect(page.locator('[data-harmony-question="0"] [role=status]')).toContainText('Revisemos:');
 await page.locator('[data-harmony-question="0"] [data-harmony-answer="1"]').click();
 await page.locator('[data-harmony-question="1"] [data-harmony-answer="0"]').click();
 await expect(page.locator('#harmony-complete')).toBeDisabled();
 await page.locator('#harmony-played').check();await page.locator('#harmony-complete').click();
 await expect(page.locator('#harmony-progress')).toContainText('1 de 16');
 await page.reload();await expect(page.locator('#profile-button')).toBeVisible();await expect(page.locator('#harmony-progress')).toContainText('1 de 16');
 await page.locator('.harmony-course header [data-harmony-go]').click();
 await expect(page.locator('#harmony-title')).toHaveText(harmonyUnits[1].title);
 await page.locator('#harmony-listen').click();await expect(page.locator('#harmony-audio-status')).toContainText('Reproduciendo');
 await page.locator('#harmony-stop').click();await expect(page.locator('#harmony-audio-status')).toContainText('detenido');
 await page.locator('#harmony-practice').click();await expect(page).toHaveURL(/#practicar$/);
 await expect(page.locator('#exercise-title')).toHaveText('Tríadas mayores y menores');
 await page.locator('#profile-button').click();await page.locator('#logout').click();
 await page.locator('nav [data-page=curso]').click();await page.locator('[data-course-space=harmony]').click();await expect(page.locator('#harmony-progress')).toContainText('0 de 16');
 expect(errors).toEqual([]);
});
test('all harmony units are reachable on mobile and linked lesson theory is expanded',async({page})=>{
 await mocks(page,true);await page.setViewportSize({width:390,height:844});
 const ready=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/progress');
 await page.goto('/appbass.html#curso?unidad=H04');await ready;
 await expect(page.locator('#harmony-title')).toHaveText(harmonyUnits[3].title);
 for(const unit of harmonyUnits){
  await page.evaluate(id=>{location.hash='curso?unidad='+id;},unit.id);
  await expect(page.locator('#harmony-title')).toHaveText(unit.title);
  await expect(page.locator('[data-harmony-question]')).toHaveCount(2);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
 await page.evaluate(()=>{location.hash='curso?unidad=H04';});
 await page.locator('[data-harmony-lesson="B03"]').click();
 await expect(page.locator('.lesson-harmony')).toContainText('Intervalos: escuchar y medir una relación');
 await page.locator('.lesson-deeper > summary').click();
 await page.locator('[data-harmony-open="H04"]').click();await expect(page.locator('#detail-dialog')).toBeHidden();
 await expect(page.locator('#harmony-title')).toHaveText(harmonyUnits[3].title);
});
test('guest harmony malformed storage and blocked persistence do not prevent learning',async({page})=>{
 await mocks(page,false);await page.addInitScript(()=>{
  localStorage.setItem('appbass-harmony-v1-guest','{"version":1,"done":["unknown",null,"H01","H01"],"last":"bad"}');
 });
 await page.goto('/appbass.html#curso?espacio=armonia');await expect(page.locator('#open-login')).toBeVisible();
 await expect(page.locator('#harmony-progress')).toContainText('1 de 16');
 await expect(page.locator('#harmony-title')).toHaveText(harmonyUnits[1].title);
 await page.evaluate(()=>{Storage.prototype.setItem=function(){throw Error('storage unavailable');};});
 await page.locator('[data-harmony-question="0"] [data-harmony-answer="1"]').click();
 await page.locator('[data-harmony-question="1"] [data-harmony-answer="2"]').click();
 await page.locator('#harmony-played').check();await page.locator('#harmony-complete').click();
 await expect(page.locator('#harmony-progress')).toContainText('no permite guardar');
});
const user={id:'test-person',email:'beta@example.test',displayName:'Beta',weeklyStudyMinutes:120,reminderDay:2,instrument:'electricBass',level:'basic',timeZone:'America/Argentina/Buenos_Aires',reminderEnabled:true,lastLesson:'B03'};
test('course map separates lesson journey from harmony and shows the score beside reading prompts',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await mocks(page,true);
 await page.goto('/appbass.html#curso');
 await expect(page.locator('#course-journey')).toBeVisible();await expect(page.locator('#course-harmony')).toBeHidden();
 await expect(page.locator('.journey-station')).toHaveCount(14);
 await expect(page.locator('.journey-station.current button')).toHaveAttribute('data-lesson','B02');
 await expect(page.locator('.journey-links path')).toHaveCount(13);
 await page.screenshot({path:'outputs/course-map-desktop.png',fullPage:true});
 await page.locator('#course-map [data-lesson="B01"]').click();
 const block=page.locator('[data-reading-material="concepto"]');
 await expect(block.locator('img')).toBeVisible();
 await expect(block.locator('img')).toHaveAttribute('src',/B01\/assets\/renders\/concepto-p1.png$/);
 await expect(block.locator('.reading-question')).toHaveCount(3);
 expect(await block.locator('img').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
 await expect(page.locator('.lesson-deeper')).not.toHaveAttribute('open','');
 await block.locator('.reading-question').first().locator('summary').click();
 await expect(block.locator('.reading-question').first()).toContainText('Do · nota del acorde');
 await block.locator('img').scrollIntoViewIfNeeded();await page.screenshot({path:'outputs/lesson-reading-desktop.png'});
 await page.locator('#close-detail').click();await page.locator('[data-course-space=harmony]').click();
 await expect(page.locator('#course-journey')).toBeHidden();await expect(page.locator('#course-harmony')).toBeVisible();
 await expect(page.locator('.harmony-sources')).toHaveCount(0);
 await page.locator('#harmony-course-list').click();await page.locator('#journey-layout').click();
 await expect(page.locator('#course-list')).toBeVisible();await expect(page.locator('#course-map')).toBeHidden();
 expect(errors).toEqual([]);
});
test('course marker advances only after persisted completion and resets on logout',async({page})=>{
 await mocks(page,true);let done=['B01'];
 await page.route('**/api/progress',async route=>{
  if(route.request().method()==='POST')done=['B01','B02'];
  await route.fulfill({json:{completed:done,totalPoints:done.length*100,states:{},nextLessonId:done.length===1?'B02':'B03',awardedPoints:100}});
 });
 await page.goto('/appbass.html#curso');await expect(page.locator('.journey-station.current button')).toHaveAttribute('data-lesson','B02');
 await page.locator('#course-map [data-lesson="B02"]').click();
 await page.locator('#complete-lesson').click();await expect(page.locator('#detail-label')).toHaveText('LECCIÓN B03');
 await page.locator('#close-detail').click();await expect(page.locator('.journey-station.current button')).toHaveAttribute('data-lesson','B03');
 await page.reload();await expect(page.locator('.journey-station.current button')).toHaveAttribute('data-lesson','B03');
 await page.locator('#profile-button').click();await page.locator('#logout').click();
 await expect(page.locator('.journey-station.current button')).toHaveAttribute('data-lesson','B01');
});
test('mobile map, level changes and inline reading are readable without horizontal overflow',async({page})=>{
 await mocks(page);await page.setViewportSize({width:390,height:844});await page.goto('/appbass.html#curso');
 await expect(page.locator('.journey-station')).toHaveCount(14);
 await page.locator('[data-level=advanced]').click();await expect(page.locator('.journey-station')).toHaveCount(12);
 await expect(page.locator('.journey-station.current button')).toHaveAttribute('data-lesson','A01');
 await page.screenshot({path:'outputs/course-map-mobile.png',fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.locator('#course-map [data-lesson="A01"]').click();
 await expect(page.locator('.lesson-reading img').first()).toBeVisible();
 expect(await page.locator('#detail-dialog').evaluate(d=>d.scrollWidth<=d.clientWidth+1)).toBe(true);
 await page.locator('.lesson-reading img').first().scrollIntoViewIfNeeded();await page.screenshot({path:'outputs/lesson-reading-mobile.png'});
});
test('repertoire sources, MIDI reduction, CC0 playback and solo controls work on mobile',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await mocks(page,true);
 await page.setViewportSize({width:390,height:844});await page.goto('/appbass.html#practicar');
 await expect(page.locator('#practice-play')).toBeEnabled();
 await page.locator('#repertoire-library summary').click();
 await expect(page.locator('[data-collection="beta-standards-v1"]')).toHaveCount(6);
 await page.locator('[data-play-repertoire="entertainer"]').click();
 await expect(page.locator('#exercise-title')).toHaveText('The Entertainer');
 await expect(page.locator('#practice-bars button')).toHaveCount(152);
 await expect(page.locator('#practice-source')).toContainText('Reducción automática');
 await page.locator('#exercise-select').selectOption('swing-major');
 await expect(page.locator('#practice-bars button')).toHaveCount(8);
 await page.locator('#practice-play').click();await expect(page.locator('#practice-status')).toContainText('Samples CC0 activos');
 await page.locator('#practice-mix').selectOption('bass-only');
 await expect(page.locator('#practice-click')).not.toBeChecked();
 await expect(page.locator('#practice-guide')).toBeChecked();
 await page.locator('#practice-mix').selectOption('no-bass');
 await page.locator('#practice-stop').click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 expect(errors).toEqual([]);
});
async function mocks(page,authenticated=false,showTour=false){
 if(!showTour)await page.addInitScript(()=>localStorage.setItem('appbass-tour-v1-test-person','seen'));
 let logged=authenticated;const learning={preferences:{},reviews:{},units:{},daily:[]};
 await page.route('**/api/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  let body={ok:true};
  if(path==='/api/auth/me')body={user:logged?user:null,reminder:logged,plan:{total:30,warmup:6,concept:9,play:15}};
  if(path==='/api/auth/login'||path==='/api/auth/register'){logged=true;body={user};}
  if(path==='/api/auth/logout')logged=false;
  if(path==='/api/progress')body={completed:['B01'],totalPoints:100,states:{B03:'review'},nextLessonId:'B02',awardedPoints:100};
  if(path==='/api/activity')body={entries:[],weeklyMinutes:15};
  if(path==='/api/learning'){body=learning;if(route.request().method()==='POST'){const b=route.request().postDataJSON();if(b.kind==='unit')learning.units[b.unitId]={reviewed:b.reviewed,version:(learning.units[b.unitId]?.version||0)+1};if(b.kind==='preference')learning.preferences[b.section]={value:b.value,version:(learning.preferences[b.section]?.version||0)+1};body={ok:true,version:1};}}
  await route.fulfill({json:body});
 });
}
test('root leads to canonical page; login, profile, personalized home and logout work',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await mocks(page);
 await page.goto('/');
 await expect(page.locator('#open-login')).toBeVisible();
 await page.locator('#open-login').click();
 await page.locator('#account-form [name=email]').fill('beta@example.test');
 await page.locator('#account-form [name=password]').fill('testing-pass-123');
 await page.locator('#account-submit').click();
 await expect(page.locator('#open-auth')).toBeHidden();
 await expect(page.locator('.week-card strong')).toHaveText('120 min / semana');
 await page.locator('#profile-button').click();
 await expect(page.locator('#profile-form')).toBeVisible();
 await page.locator('#logout').click();
 await expect(page.locator('#open-login')).toBeVisible();
 expect(errors).toEqual([]);
});

test('first authenticated visit shows a skippable tour, remembers dismissal and supports replay',async({page})=>{
 await mocks(page,true,true);await page.goto('/appbass.html');
 const tour=page.locator('#welcome-tour');
 await expect(tour).toBeVisible();
 await expect(tour.locator('.tour-count')).toHaveText('Paso 1 de 5');
 await page.locator('#tour-next').click();
 await expect(tour.locator('.tour-count')).toHaveText('Paso 2 de 5');
 await page.locator('#tour-back').click();
 await expect(tour.locator('.tour-count')).toHaveText('Paso 1 de 5');
 await page.keyboard.press('Escape');await expect(tour).toBeHidden();
 await page.reload();await expect(page.locator('#profile-button')).toBeVisible();
 await expect(tour).toBeHidden();
 await page.locator('nav [data-page=ayuda]').click();await page.locator('#help-tour').click();
 for(let i=0;i<5;i++)await page.locator('#tour-next').click();
 await expect(tour).toBeHidden();await expect(page).toHaveURL(/#practicar$/);
});

test('tour starts only after successful login, not while entering credentials',async({page})=>{
 await mocks(page,false,true);await page.goto('/appbass.html');
 await expect(page.locator('#welcome-tour')).toBeHidden();
 await page.locator('#open-login').click();
 await page.locator('#account-form [name=email]').fill('beta@example.test');
 await page.locator('#account-form [name=password]').fill('testing-pass-123');
 await expect(page.locator('#welcome-tour')).toBeHidden();
 await page.locator('#account-submit').click();
 await expect(page.locator('#auth-dialog')).toBeHidden();
 await expect(page.locator('#welcome-tour')).toBeVisible();
 await page.locator('#tour-skip').click();
 await page.locator('#profile-button').click();await expect(page.locator('#profile-form')).toBeVisible();
});

test('guest help is accessible on mobile, FAQ expands and manual tour can be skipped',async({page})=>{
 await page.setViewportSize({width:390,height:844});await mocks(page);
 await page.goto('/appbass.html#ayuda');
 await expect(page.locator('#ayuda')).toBeVisible();
 await expect(page.locator('#welcome-tour')).toBeHidden();
 const faq=page.locator('.help-faq details').filter({hasText:'¿Qué se guarda y dónde?'});
 await faq.locator('summary').click();await expect(faq.locator('p')).toBeVisible();
 await page.locator('#help-tour').click();await expect(page.locator('#welcome-tour')).toBeVisible();
 await page.screenshot({path:'outputs/tour-mobile.png'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('#tour-skip').click();await expect(page.locator('#welcome-tour')).toBeHidden();
});
test('practice selection changes notes, difficulty, sound clock and loops',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await mocks(page);
 await page.goto('/appbass.html');
 await expect(page.locator('#practice-play')).toBeEnabled();
 await page.locator('#exercise-select').selectOption('blues');
 await expect(page.locator('#exercise-title')).toContainText('Blues');
 await expect(page.locator('#practice-bars button')).toHaveCount(12);
 await page.locator('#practice-difficulty').selectOption('walking');
 await expect(page.locator('#practice-score [data-beat]')).toHaveCount(48);
 await page.locator('#practice-play').click();
 await expect(page.locator('#practice-play')).toHaveText('Pausar');
 await page.waitForTimeout(1200);
 await expect(page.locator('#practice-fretboard rect')).not.toHaveCount(1);
 await page.locator('#practice-stop').click();
 await page.locator('.practice-settings').first().locator('summary').click();
 await page.locator('#loop-to').selectOption('0');
 await page.locator('#practice-loop').check();
 await page.locator('#practice-increment').selectOption('5');
 await page.locator('#practice-tempo').fill('190');
 await page.locator('#practice-tempo').press('Tab');
 await page.locator('#practice-play').click();
 await expect(page.locator('#practice-tempo')).toHaveValue('195',{timeout:4000});
 await page.locator('#practice-stop').click();
 for(const id of ['triads','pentatonic','two-feel','ii-v-i','walking','turnaround','first-groove','evening']){
  await page.locator('#exercise-select').selectOption(id);
  await expect(page.locator('#practice-play')).toBeEnabled();
  await expect(page.locator('#practice-status')).toContainText('Lista.');
 }
 expect(errors).toEqual([]);
 await page.screenshot({path:'outputs/practice-desktop.png',fullPage:true});
 await page.reload();
 await expect(page.locator('#exercise-title')).toHaveText('Paseo al atardecer');
 await expect(page.locator('#practice-difficulty')).toHaveValue('walking');
});
test('mobile registration fields do not overlap and pending reminders can be snoozed',async({page})=>{
 await page.setViewportSize({width:390,height:844});await mocks(page);
 await page.goto('/appbass.html');await page.locator('#open-auth').click();
 const day=page.locator('#account-form [name=reminderDay]'),submit=page.locator('#account-submit');
 await day.scrollIntoViewIfNeeded();
 const a=await day.boundingBox(),b=await submit.boundingBox();expect(b.y).toBeGreaterThan(a.y+a.height);
 await page.screenshot({path:'outputs/registration-mobile.png',fullPage:true});
});
test('lesson resume, steps, quiz and weekly reminder work',async({page})=>{
 await mocks(page,true);await page.goto('/appbass.html');
 await expect(page.locator('#weekly-reminder')).toBeVisible();
 await page.locator('[data-act=snooze]').click();await expect(page.locator('#weekly-reminder')).toBeHidden();
 await page.locator('#resume-lesson').click();
 await expect(page.locator('#detail-label')).toHaveText('LECCIÓN B03');
 await expect(page.locator('#detail-dialog')).toBeVisible();
 await expect(page.locator('.lesson-step')).toHaveCount(4);
 await page.locator('.lesson-step').last().locator('summary').first().click();
 await page.locator('#quick-quiz [data-answer="1"]').click();
 await expect(page.locator('#quick-quiz [role=status]')).toContainText('Correcto.');
});
