import {test,expect} from '@playwright/test';
const plan={total:30,warmup:6,concept:9,play:15};
async function guest(page){await page.route('**/api/**',r=>r.fulfill({json:{user:null,plan,reminder:false}}));}
async function measureAudio(page){await page.addInitScript(()=>{
 const Original=window.AudioContext||window.webkitAudioContext;
 window.AudioContext=class extends Original{
  createDynamicsCompressor(){const node=super.createDynamicsCompressor(),analyser=this.createAnalyser(),connect=node.connect.bind(node);analyser.fftSize=2048;
   node.connect=(destination,...args)=>{const result=connect(destination,...args);if(destination===this.destination){connect(analyser);window.__audioMeter=analyser;}return result;};return node;
  }
 };
 window.__rms=()=>{if(!window.__audioMeter)return 0;const data=new Float32Array(window.__audioMeter.fftSize);window.__audioMeter.getFloatTimeDomainData(data);return Math.sqrt(data.reduce((sum,n)=>sum+n*n,0)/data.length);};
});}
test('both repertoire listen buttons start actual nonzero piano audio, separate from loading bass practice',async({page})=>{
 await guest(page);await measureAudio(page);await page.goto('/appbass.html#practicar');
 await expect(page.locator('#practice-play')).toBeEnabled();await page.locator('#repertoire-library summary').click();
 for(const id of ['entertainer','maple']){
  await page.locator(`[data-listen-repertoire="${id}"]`).click();
  await expect(page.locator('#practice-mix')).toHaveValue('original');
  await expect(page.locator('#practice-play')).toHaveText('Pausar');
  await expect.poll(()=>page.evaluate(()=>window.__rms()),{timeout:10000}).toBeGreaterThan(.0001);
  await expect(page.locator(`[data-repertoire-status="${id}"]`)).toContainText('Sonando');
  await page.locator('#practice-stop').click();
 }
 await page.locator('[data-play-repertoire="entertainer"]').click();
 await expect(page.locator('#practice-mix')).toHaveValue('full');await expect(page.locator('#practice-play')).toHaveText('Reproducir');
});
test('Bb pentatonic search transposes actual notes, staff, maps and audio on mobile',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await guest(page);await measureAudio(page);
 await page.setViewportSize({width:390,height:844});await page.goto('/appbass.html#escalas');
 await page.locator('#atlas-search').fill('Sib pentatónica');
 await expect(page.locator('#atlas-list button')).toHaveCount(2);
 await page.locator('[data-atlas-family="pent-minor"]').click();
 await expect(page.locator('#atlas-notes')).toContainText('Si bemol – Re bemol – Mi bemol – Fa – La bemol – Si bemol');
 await expect(page.locator('#atlas-dialog [data-atlas-midi="46"]')).toHaveCount(1);
 expect((await page.locator('#atlas-dialog .atlas-scroll svg').first().boundingBox()).height).toBeGreaterThan(150);
 await page.locator('#atlas-play').click();await expect(page.locator('#atlas-play')).toHaveText('Pausar');
 await expect.poll(()=>page.evaluate(()=>window.__rms())).toBeGreaterThan(.0001);
 expect(await page.locator('#atlas-dialog').evaluate(d=>d.scrollWidth<=d.clientWidth+1)).toBe(true);
 await page.screenshot({path:'outputs/atlas-bb-mobile.png'});
 await page.locator('#atlas-close').click();await page.locator('#atlas-tonic').selectOption('F#');
 await page.locator('[data-atlas-family="major"]').click();await expect(page.locator('#atlas-notes')).toContainText('Mi sostenido');
 await page.locator('#atlas-close').click();await page.locator('#atlas-kind').selectOption('arpeggio');
 await page.locator('#atlas-search').fill('Cmaj7');await page.locator('[data-atlas-family="maj7"]').click();
 await expect(page.locator('#atlas-dialog h2')).toHaveText('Cmaj7 / Do · mayor séptima');expect(errors).toEqual([]);
});
test('scale theory follows the selected family and tonic without overflowing on mobile',async({page})=>{
 await guest(page);await page.setViewportSize({width:390,height:844});await page.goto('/appbass.html#escalas');
 await page.locator('#atlas-search').fill('Sib pentatónica');await page.locator('[data-atlas-family="pent-minor"]').click();
 const theory=page.locator('.atlas-theory');
 await expect(theory).toContainText('Selecciona 1, b3, 4, 5 y b7');
 await expect(theory).toContainText('3S – T – T – 3S – T');
 await expect(theory.locator('.atlas-theory-example')).toContainText('b3 = Re bemol (Db)');
 await theory.getByText('Grado por grado · Bb',{exact:true}).click();
 await expect(theory.locator('tbody tr').filter({has:page.locator('th',{hasText:/^b3$/})})).toContainText('Re → Re bemol (Db)');
 expect(await page.locator('#atlas-dialog').evaluate(d=>d.scrollWidth<=d.clientWidth+1)).toBe(true);
 await theory.scrollIntoViewIfNeeded();await page.screenshot({path:'outputs/atlas-theory-mobile.png'});
 await page.locator('#atlas-close').click();await page.locator('#atlas-search').fill('');await page.locator('#atlas-tonic').selectOption('F#');
 await page.locator('[data-atlas-family="major"]').click();await expect(theory).toContainText('semitonos entre 3–4 y 7–8');
 await expect(theory.locator('.atlas-theory-example')).toContainText('7 = Mi sostenido (E#)');
 await page.locator('#atlas-close').click();await page.locator('[data-atlas-family="melodic-minor"]').click();
 await expect(theory).toContainText('versión de jazz');await page.locator('#atlas-close').click();
 await page.locator('[data-atlas-family="altered"]').click();await expect(theory).toContainText('grados de una dominante');
 await theory.getByText('Llevarla al bajo o contrabajo',{exact:true}).click();await expect(theory).toContainText('una sola tensión alterada');
});

test('daily preference stays isolated by account and blocked storage is reported without breaking the atlas',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('appbass-tour-v1-another-person','seen'));
 let user=null;await page.route('**/api/**',r=>r.fulfill({json:new URL(r.request().url()).pathname==='/api/progress'?{completed:[],totalPoints:0,states:{},nextLessonId:'B01'}:{user,plan,reminder:false}}));
 await page.goto('/appbass.html#escalas');await expect(page.locator('#open-login')).toBeVisible();
 await page.locator('#atlas-daily-enabled').check();
 user={id:'another-person',displayName:'Otra cuenta',level:'basic',weeklyStudyMinutes:60};
 await page.reload();await expect(page.locator('#profile-button')).toBeVisible();
 await expect(page.locator('#atlas-daily-enabled')).not.toBeChecked();
 await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw Error('blocked');};});
 await page.locator('#atlas-daily-enabled').check();await expect(page.locator('.atlas-daily')).toContainText('no permite guardar');
 await page.locator('[data-daily-open]').first().click();await expect(page.locator('#atlas-dialog')).toBeVisible();
});
test('daily challenge is opt-in, can be self-assessed, disabled, and shared without login',async({page})=>{
 await guest(page);await page.goto('/appbass.html#escalas');
 await expect(page.locator('#atlas-daily-content')).toBeHidden();await page.locator('#atlas-daily-enabled').check();
 await expect(page.locator('[data-daily-open]')).toHaveCount(3);
 await page.locator('[data-daily-done]').first().check();await expect(page.locator('#daily-progress')).toContainText('1 de 3');
 await page.reload();await expect(page.locator('#atlas-daily-enabled')).toBeChecked();await expect(page.locator('#daily-progress')).toContainText('1 de 3');
 await page.locator('#daily-share').click();await expect(page.locator('#daily-link')).toHaveValue(/#escalas\?reto=modos&fecha=\d{4}-\d{2}-\d{2}$/);
 const link=await page.locator('#daily-link').inputValue();await page.locator('#atlas-daily-enabled').uncheck();await expect(page.locator('#atlas-daily-content')).toBeHidden();
 await page.goto(link);await expect(page.locator('#atlas-daily-content')).toBeVisible();await expect(page.locator('#atlas-daily-enabled')).not.toBeChecked();
 await page.goto('/appbass.html#escalas?reto=modos&fecha=bad');await expect(page.locator('#atlas-daily-content')).toBeHidden();
});
