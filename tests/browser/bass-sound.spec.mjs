import {test,expect} from '@playwright/test';
test('instrument selection controls the real bass sound without a separate picker',async({page})=>{
 await page.goto('/appbass.html#practicar');await expect(page.locator('#bass-sound-panel')).toHaveCount(0);
 const instrument=page.locator('#practice-instrument');await expect(instrument).toHaveValue('electricBass');
 await expect(page.locator('#practice-sound-status')).toHaveText('Sonido real · bajo con dedos');
 await instrument.selectOption('doubleBass');await expect(page.locator('#practice-sound-status')).toHaveText('Sonido real · contrabajo pizzicato');
 await instrument.selectOption('electricBass');await expect(page.locator('#practice-sound-status')).toHaveText('Sonido real · bajo con dedos');
});
test('missing real samples are visibly labelled synthesized fallback',async({page})=>{
 await page.route('**/samples/bass/**',r=>r.abort());await page.goto('/appbass.html#practicar');
 await expect(page.locator('#practice-play')).toBeEnabled();await page.locator('#practice-play').click();await expect(page.locator('#practice-sound-status')).toContainText('Respaldo sintetizado');
});

test('real Web Audio rendering produces bounded bass with no tail after the note',async({page})=>{
 await page.goto('/appbass.html');
 const rows=await page.evaluate(async()=>{
  const {PracticeEngine}=await import('/practice-engine.mjs');const rows=[];
  for(const sound of ['finger','upright']){
   const engine=new PracticeEngine();engine.context=new OfflineAudioContext(1,44100,44100);engine.sound=sound;engine.volume=1;
   await engine.prepareBass();engine.tone(36,.02,.35,.2);
   const buffer=await engine.context.startRendering(),data=buffer.getChannelData(0);let peak=0,energy=0,tail=0;
   for(let i=0;i<data.length;i++){peak=Math.max(peak,Math.abs(data[i]));energy+=data[i]**2;if(i>16400)tail=Math.max(tail,Math.abs(data[i]));}
   rows.push({sound,count:engine.bassBank.length,peak,rms:Math.sqrt(energy/data.length),tail});
  }return rows;
 });
 for(const row of rows){expect(row.count).toBe(3);expect(row.peak).toBeLessThan(.201);expect(row.rms).toBeGreaterThan(.005);expect(row.tail).toBeLessThan(.000001);}
});
