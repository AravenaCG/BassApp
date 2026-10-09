import {test,expect} from '@playwright/test';
test('real learning endpoint rejects unauthenticated reads and writes without SQL access',async({request})=>{
 const get=await request.get('/api/learning');expect(get.status()).toBe(401);expect(get.headers()['cache-control']).toContain('no-store');
 const post=await request.post('/api/learning',{data:{kind:'preference',section:'practice',version:0,value:{tempo:72}}});expect(post.status()).toBe(401);
});
test('cloud reviews and preferences survive empty local storage; failures do not claim a save',async({page})=>{
 const user={id:'cloud-person',displayName:'Cloud',email:'cloud@example.test',level:'basic',instrument:'electricBass',weeklyStudyMinutes:60,reminderDay:1},cloud={preferences:{},reviews:{},units:{},daily:[]};let fail=false;
 await page.addInitScript(()=>localStorage.setItem('appbass-tour-v1-cloud-person','seen'));
 await page.route('**/api/**',async r=>{const path=new URL(r.request().url()).pathname;let body={ok:true};
  if(path==='/api/auth/me')body={user,plan:{total:15,warmup:3,concept:5,play:7},reminder:false};
  if(path==='/api/progress')body={completed:[],totalPoints:0,states:{}};
  if(path==='/api/learning'){if(r.request().method()==='POST'){if(fail)return r.fulfill({status:503,json:{error:'Falla de prueba'}});const b=r.request().postDataJSON();if(b.kind==='preference'){cloud.preferences[b.section]={value:b.value,version:b.version+1};body={ok:true,version:b.version+1};}if(b.kind==='review'){cloud.reviews[b.lessonId]={due:new Date(Date.now()+86400000).toISOString(),history:[{tempo:b.tempo,rating:b.rating,at:new Date().toISOString()}]};body={ok:true};}}else body=cloud;}
  await r.fulfill({json:body});
 });
 await page.goto('/appbass.html#practicar');await expect(page.locator('#review-status')).toContainText('cargados desde tu cuenta');
 await page.locator('#practice-instrument').selectOption('electricBass5');await expect(page.locator('#practice-status')).toContainText('guardadas en tu cuenta');
 await page.getByText('Repasos personalizados · cómo te fue',{exact:true}).click();await page.locator('#review-tempo').fill('78');await page.locator('#review-save').click();await expect(page.locator('#review-status')).toContainText('guardada en tu cuenta');
 await page.evaluate(()=>localStorage.clear());await page.reload();await expect(page.locator('#practice-instrument')).toHaveValue('electricBass5');await page.getByText('Repasos personalizados · cómo te fue',{exact:true}).click();await expect(page.locator('#review-list')).toContainText('78');
 fail=true;await page.locator('#review-tempo').fill('90');await page.locator('#review-save').click();await expect(page.locator('#review-status')).toContainText('No se guardó en la nube');await expect(page.locator('#review-list')).not.toContainText('90');
});
test('local account import requires preview and confirmation and does not upload guest data',async({page})=>{
 let writes=0;const cloud={preferences:{},reviews:{},units:{},daily:[]};
 await page.addInitScript(()=>{localStorage.setItem('appbass-tour-v1-import-person','seen');localStorage.setItem('appbass-practice-import-person',JSON.stringify({id:'open-strings',tempo:78,instrument:'electricBass5',difficulty:'roots'}));localStorage.setItem('appbass-practice-guest',JSON.stringify({tempo:199}));});
 await page.route('**/api/**',async r=>{const path=new URL(r.request().url()).pathname;let body={ok:true};if(path==='/api/auth/me')body={user:{id:'import-person',displayName:'Import',level:'basic',instrument:'electricBass',weeklyStudyMinutes:60},plan:{total:15,warmup:3,concept:5,play:7},reminder:false};if(path==='/api/progress')body={completed:[],states:{},totalPoints:0};if(path==='/api/learning'){if(r.request().method()==='POST'){writes++;const b=r.request().postDataJSON();cloud.preferences[b.section]={value:b.value,version:1};body={ok:true,version:1};}else body=cloud;}await r.fulfill({json:body});});
 await page.goto('/appbass.html#practicar');await expect(page.locator('#review-status')).toContainText('cargados desde tu cuenta');expect(writes).toBe(0);await page.getByText('Sincronización entre dispositivos · importar datos locales',{exact:true}).click();await page.locator('[data-import-preview]').click();await expect(page.locator('[data-import-status]')).toContainText('practice');expect(writes).toBe(0);await page.locator('[data-import-confirm]').click();await expect(page.locator('[data-import-status]')).toContainText('Importados 1');expect(writes).toBe(1);expect(cloud.preferences.practice.value.tempo).toBe(78);
});
