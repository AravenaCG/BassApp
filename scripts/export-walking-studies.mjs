import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium} from '@playwright/test';
import {walkingCatalog,walkingScore,studyDocument} from '../public/walking-studies.mjs';
const directory=resolve('public/practice-studies');await mkdir(directory,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try{const page=await browser.newPage();for(const item of walkingCatalog){const score=walkingScore(item.study,item.mode),html=studyDocument(score);await page.setContent(html);await page.pdf({path:resolve(directory,item.id+'.pdf'),format:'A4',printBackground:true});await writeFile(resolve(directory,item.id+'.html'),html);console.log(item.id+'.pdf · '+score.bars.length+' compases');}}finally{await browser.close();}
