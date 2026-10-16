import {test,expect} from '@playwright/test';
test('reading statistics are restored from the signed-in account',async({page})=>{
 const user={id:'reader-cloud',displayName:'Reader',email:'reader@example.test',level:'basic',instrument:'electricBass',weeklyStudyMinutes:60,reminderDay:1};
 const cloud={preferences:{},reviews:{},units:{},daily:[]};
 await page.addInitScript(()=>localStorage.setItem('appbass-tour-v1-reader-cloud','seen'));
 await page.route('**/api/**',async route=>{const path=new URL(route.request().url()).pathname;let body={ok:true};
  if(path==='/api/auth/me')body={user,plan:{total:15,warmup:3,concept:5,play:7},reminder:false};
  if(path==='/api/progress')body={completed:[],states:{},totalPoints:0};
  if(path==='/api/learning'){if(route.request().method()==='POST'){const b=route.request().postDataJSON();cloud.preferences[b.section]={value:b.value,version:b.version+1};body={ok:true,version:b.version+1};}else body=cloud;}
  await route.fulfill({json:body});
 });
 await page.goto('/appbass.html#lectura');await expect(page.locator('[data-reading-save]')).toContainText('cargado desde tu cuenta');
 await page.locator('[data-reading-answer="2"]').click();await expect(page.locator('[data-reading-save]')).toContainText('guardado en tu cuenta');
 expect(cloud.preferences.reading.value).toMatchObject({solved:1,firstTry:1,bestStreak:1});
 await page.evaluate(()=>localStorage.clear());await page.reload();
 await expect(page.locator('[data-reading-total]')).toHaveText('1');await expect(page.locator('[data-reading-score]')).toHaveText('1');await expect(page.locator('[data-reading-best]')).toHaveText('1');
});
test('flat spelling is shown and answered by its written name',async({page})=>{
 await page.addInitScript(()=>{Math.random=()=>.1;});
 await page.goto('/appbass.html#lectura');await page.locator('[data-reading-level="3"]').click();
 await expect(page.locator('[data-reading-staff] svg')).toHaveAttribute('data-reading-name','Sol♭');
 await expect(page.locator('[data-reading-staff] .reading-accidental')).toHaveText('♭');
 await page.locator('[data-reading-answer="Sol♭"]').click();await expect(page.locator('[data-reading-feedback]')).toContainText('Sol♭');
});
test('minor lesson recommends its scale, reading bars and actual practice',async({page})=>{
 await page.route('**/api/**',r=>r.fulfill({json:{user:null}}));
 await page.goto('/appbass.html#curso');
 await page.locator('[data-lesson="B06"]').first().click();
 await expect(page.locator('[data-lesson-scale]')).toHaveValue('natural-minor');
 await expect(page.locator('[data-lesson-tonic]')).toHaveValue('C');
 await page.locator('[data-lesson-reading]').click();
 await expect(page.locator('.reading-bars')).toBeVisible();
 await page.locator('[data-reading-return]').click();
 await page.locator('#lesson-to-player').click();
 await expect(page.locator('#exercise-select')).toHaveValue('minor-cadence');
 await expect(page.locator('#detail-dialog')).not.toBeVisible();
});
test('bar audio schedules notes but not rests, and stops on leaving reading',async({page})=>{
 await page.addInitScript(()=>{
  window.barAudio=[];
  const start=AudioBufferSourceNode.prototype.start,stop=AudioBufferSourceNode.prototype.stop;
  AudioBufferSourceNode.prototype.start=function(at){window.barAudio.push(['start',at]);return start.call(this,at);};
  AudioBufferSourceNode.prototype.stop=function(at){window.barAudio.push(['stop',at]);return stop.call(this,at);};
 });
 await page.goto('/appbass.html#lectura');await page.locator('[data-reading-level="5"]').click();
 await page.locator('[data-bar-play]').click();
 await expect.poll(()=>page.evaluate(()=>window.barAudio.filter(e=>e[0]==='start').length)).toBe(3);
 const times=await page.evaluate(()=>window.barAudio.filter(e=>e[0]==='start').map(e=>e[1]));
 expect(times[1]-times[0]).toBeCloseTo(1);expect(times[2]-times[1]).toBeCloseTo(1);
 await page.locator('[data-reading-level="1"]').click();
 await expect.poll(()=>page.evaluate(()=>window.barAudio.filter(e=>e[0]==='stop'&&e[1]===undefined).length)).toBeGreaterThan(0);
});
test('complete bars validate pitch and duration including rests',async({page})=>{
 await page.goto('/appbass.html#lectura');
 await page.locator('[data-reading-level="5"]').click();
 await expect(page.locator('.reading-bars')).toBeVisible();
 await page.locator('[data-bar-check]').click();
 await expect(page.locator('[data-bar-feedback]')).toContainText('Elegí la nota');
 await page.locator('[data-bar-pitch]').selectOption('2');
 await page.locator('[data-bar-duration]').selectOption('2');
 await page.locator('[data-bar-check]').click();
 await expect(page.locator('[data-bar-feedback]')).toContainText('Revisá');
 for(const [i,pitch] of ['2','4','5','rest'].entries()){
  await expect(page.locator('[data-bar-position]')).toHaveText(`Figura ${i+1} de 4`);
  await page.locator('[data-bar-pitch]').selectOption(pitch);
  await page.locator('[data-bar-duration]').selectOption('1');
  await page.locator('[data-bar-check]').click();
 }
 await expect(page.locator('[data-bar-feedback]')).toContainText('¡Compás completo!');
 await expect(page.locator('[data-bar-stats]')).toContainText('1');
 await page.locator('[data-bar-next]').click();
 await expect(page.locator('[data-bar-position]')).toHaveText('Figura 1 de 3');
 await page.locator('[data-bar-reveal]').click();
 await expect(page.locator('[data-bar-feedback]')).toContainText('Do · blanca');
 await expect(page.locator('[data-bar-check]')).toBeDisabled();
 await page.locator('[data-reading-level="1"]').click();
 await expect(page.locator('.reading-bars')).toBeHidden();
});
test('correct reading answers play a real sample and advance automatically',async({page})=>{
 await page.addInitScript(()=>{
  window.readingAudioStarts=0;
  const original=AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start=function(...args){window.readingAudioStarts++;return original.apply(this,args);};
 });
 await page.goto('/appbass.html#lectura');
 await expect(page.locator('[data-reading-midi]')).toHaveAttribute('data-reading-midi','50');
 await page.locator('[data-reading-answer="2"]').click();
 await expect(page.locator('[data-reading-score]')).toHaveText('1');
 await expect.poll(()=>page.evaluate(()=>window.readingAudioStarts)).toBeGreaterThan(0);
 await expect(page.locator('[data-reading-midi]')).not.toHaveAttribute('data-reading-midi','50');
 await expect(page.locator('[data-reading-next]')).toBeDisabled();
 await expect(page.locator('[data-reading-answer]:disabled')).toHaveCount(0);
});
test('reading section presents a bass-clef note exercise with progressive levels',async({page})=>{
 await page.goto('/appbass.html#lectura');
 await expect(page.locator('#reading-workspace')).toBeVisible();
 await expect(page.locator('.reading-theory')).toContainText('Fa de la cuarta línea');
 await expect(page.locator('.reading-theory')).toContainText('Registro de estudio');
 await expect(page.locator('.reading-clef:visible')).toHaveCount(1);
 await expect(page.locator('[data-reading-answer]')).toHaveCount(3);
 await page.locator('[data-reading-answer="4"]').click();
 await expect(page.locator('[data-reading-next]')).toBeDisabled();
 await expect(page.locator('[data-reading-feedback]')).toContainText('línea 3');
 await page.locator('[data-reading-answer="2"]').click();
 await expect(page.locator('[data-reading-total]')).toHaveText('1');
 await expect(page.locator('[data-reading-score]')).toHaveText('0');
 await page.locator('[data-reading-level="3"]').click();
 await page.locator('[data-reading-reveal]').click();
 await expect(page.locator('[data-reading-next]')).toBeEnabled();
 await expect(page.locator('[data-reading-total]')).toHaveText('2');
 await page.locator('[data-reading-next]').click();
 await expect(page.locator('[data-reading-total]')).toHaveText('2');
 await page.locator('[data-reading-level="4"]').click();
 await page.locator('[data-reading-answer="4"]').click();
 await expect(page.locator('[data-reading-feedback]')).toContainText('Redonda: 4');
});
test('home actions connect course, reading, atlas and a ten minute session',async({page})=>{
 await page.route('**/api/**',r=>r.fulfill({json:{user:null,plan:{total:30,warmup:6,concept:9,play:15},reminder:false}}));
 await page.goto('/appbass.html');
 await expect(page.locator('.brand')).toContainText('BassApp');
 await expect(page.locator('#practice-play')).toBeHidden();
 await page.locator('#home-continue').click();
 await expect(page.locator('#detail-dialog')).toBeVisible();
 await expect(page.locator('.lesson-recommendation')).toContainText('Recomendado para esta lección');
 await expect(page.locator('[data-lesson-scale]')).toHaveValue('major');
 await page.locator('[data-lesson-reading]').click();
 await expect(page.locator('[data-reading-context]')).toContainText('B01');
 await page.locator('[data-reading-return]').click();
 await page.locator('[data-lesson-scale]').selectOption('pent-minor');
 await page.locator('[data-lesson-tonic]').selectOption('Bb');
 await page.locator('[data-lesson-atlas]').click();
 await expect(page.locator('#atlas-notes')).toContainText('Si bemol');
 await page.locator('#atlas-close').click();
 await page.locator('[data-page="inicio"]').click();
 await page.locator('#home-ten-minutes').click();
 await expect(page.locator('#study-minutes')).toHaveValue('10');
 await expect(page.locator('#study-plan')).toContainText('2 min');
});
