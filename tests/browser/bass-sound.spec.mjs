import {test,expect} from '@playwright/test';
test('real finger, pick and upright samples play; A/B uses the labelled clean synth',async({page})=>{
 await page.goto('/appbass.html#practicar');await page.locator('#bass-sound-panel summary').click();
 for(const [value,label] of [['finger','Bajo real · dedos'],['pick','Bajo real · púa'],['upright','Contrabajo real · pizzicato']]){
  await page.locator('#bass-sound').selectOption(value);await page.locator('#bass-compare-a').click();
  await expect(page.locator('#bass-sound-status')).toContainText('A · '+label);await page.locator('#bass-compare-stop').click();
 }
 await page.locator('#bass-compare-b').click();await expect(page.locator('#bass-sound-status')).toContainText('B · Sintetizado · limpio');
 await page.locator('#bass-compare-stop').click();await page.reload();await page.locator('#bass-sound-panel summary').click();await expect(page.locator('#bass-sound')).toHaveValue('upright');
});
test('missing real samples are visibly labelled synthesized fallback',async({page})=>{
 await page.route('**/samples/bass/**',r=>r.abort());await page.goto('/appbass.html#practicar');
 await page.locator('#bass-sound-panel summary').click();await page.locator('#bass-compare-a').click();
 await expect(page.locator('#bass-sound-status')).toContainText('A · Respaldo sintetizado');
 await page.locator('#bass-compare-stop').click();
});

test('real Web Audio rendering produces bounded bass with no tail after the note',async({page})=>{
 await page.goto('/appbass.html');
 const rows=await page.evaluate(async()=>{
  const {PracticeEngine}=await import('/practice-engine.mjs');const rows=[];
  for(const sound of ['finger','pick','upright','synth']){
   const engine=new PracticeEngine();engine.context=new OfflineAudioContext(1,44100,44100);engine.sound=sound;engine.volume=1;
   await engine.prepareBass();engine.tone(36,.02,.35,.2);
   const buffer=await engine.context.startRendering(),data=buffer.getChannelData(0);let peak=0,energy=0,tail=0;
   for(let i=0;i<data.length;i++){peak=Math.max(peak,Math.abs(data[i]));energy+=data[i]**2;if(i>16400)tail=Math.max(tail,Math.abs(data[i]));}
   rows.push({sound,count:engine.bassBank.length,peak,rms:Math.sqrt(energy/data.length),tail});
  }return rows;
 });
 for(const row of rows){expect(row.count).toBe(row.sound==='synth'?0:3);expect(row.peak).toBeLessThan(.201);expect(row.rms).toBeGreaterThan(.005);expect(row.tail).toBeLessThan(.000001);}
});
