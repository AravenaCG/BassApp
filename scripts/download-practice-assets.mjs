// Reproducible, explicit allowlist: no scraping or third-party song packs.
import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const revision='c1ea7bcc3c7309650ab0da9d15c9cd1fbc4a4c7e';
const vcsl=`https://raw.githubusercontent.com/sgossner/VCSL/${revision}/`;
const assets=[
 ...['entertainer','maple'].flatMap(id=>[
  {path:`repertoire/${id}.mid`,url:`https://www.mutopiaproject.org/ftp/JoplinS/${id}/${id}.mid`,license:'Public Domain',creator:'Scott Joplin / Mutopia Project'},
  {path:`repertoire/${id}.pdf`,url:`https://www.mutopiaproject.org/ftp/JoplinS/${id}/${id}-a4.pdf`,license:'Public Domain',creator:'Scott Joplin / Mutopia Project'},
  {path:`repertoire/${id}.ly`,url:`https://www.mutopiaproject.org/ftp/JoplinS/${id}/${id}.ly`,license:'Public Domain',creator:'Scott Joplin / Mutopia Project'}]),
 {path:'samples/piano-c3.wav',url:vcsl+'Chordophones/Zithers/Grand Piano, Kawai - Legacy/Sustains/GrandPno_Main_Sus_C3_v1_rr1.wav',license:'CC0-1.0',creator:'Versilian Studios LLC'},
 {path:'samples/hihat.wav',url:vcsl+'Idiophones/Struck Idiophones/Hi-Hat Cymbal/HiHat_HitC_v1_rr1_Mid.wav',license:'CC0-1.0',creator:'Versilian Studios LLC'},
 {path:'samples/VCSL-README.md',url:vcsl+'README.md',license:'License evidence',creator:'Versilian Studios LLC'}
];
for(const asset of assets){
 const response=await fetch(asset.url);if(!response.ok)throw Error(`${response.status}: ${asset.url}`);
 const bytes=Buffer.from(await response.arrayBuffer());
 if(asset.path.endsWith('.mid')&&bytes.toString('ascii',0,4)!=='MThd')throw Error('Invalid MIDI');
 if(asset.path.endsWith('.pdf')&&bytes.toString('ascii',0,4)!=='%PDF')throw Error('Invalid PDF');
 if(asset.path.endsWith('.wav')&&bytes.toString('ascii',0,4)!=='RIFF')throw Error('Invalid WAV');
 await mkdir(new URL('../public/'+asset.path.split('/')[0]+'/',import.meta.url),{recursive:true});
 await writeFile(new URL('../public/'+asset.path,import.meta.url),bytes);
 asset.sha256=createHash('sha256').update(bytes).digest('hex');asset.bytes=bytes.length;
 console.log(asset.path,bytes.length);
}
await writeFile(new URL('../public/repertoire/asset-manifest.json',import.meta.url),JSON.stringify({revision,licenseURL:'https://creativecommons.org/publicdomain/zero/1.0/',assets},null,2)+'\n');
