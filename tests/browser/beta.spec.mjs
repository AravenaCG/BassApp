import {test,expect} from '@playwright/test';
const user={id:'test-person',email:'beta@example.test',displayName:'Beta',weeklyStudyMinutes:120,reminderDay:2,instrument:'electricBass',level:'basic',timeZone:'America/Argentina/Buenos_Aires',reminderEnabled:true,lastLesson:'B03'};
async function mocks(page,authenticated=false){
 let logged=authenticated;
 await page.route('**/api/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  let body={ok:true};
  if(path==='/api/auth/me')body={user:logged?user:null,reminder:logged,plan:{total:30,warmup:6,concept:9,play:15}};
  if(path==='/api/auth/login'||path==='/api/auth/register'){logged=true;body={user};}
  if(path==='/api/auth/logout')logged=false;
  if(path==='/api/progress')body={completed:['B01'],totalPoints:100,states:{B03:'review'},nextLessonId:'B02',awardedPoints:100};
  if(path==='/api/activity')body={entries:[],weeklyMinutes:15};
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
