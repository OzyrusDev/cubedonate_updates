import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {signManifest} from './manifest-crypto.mjs';

const root=path.resolve(import.meta.dirname,'..');
const input=process.argv[2],privateKeyPath=process.env.CUBEDONATE_UPDATE_PRIVATE_KEY;
if(!input||!privateKeyPath){
  console.error('Usage: CUBEDONATE_UPDATE_PRIVATE_KEY=/secure/key.pem node scripts/sign-manifest.mjs <manifest.json>');
  process.exit(2);
}
const target=path.resolve(root,input);
if(!target.startsWith(`${root}${path.sep}`)||!target.endsWith('.json'))throw new Error('Manifest must be a JSON file inside this repository');
const manifest=JSON.parse(fs.readFileSync(target,'utf8'));
manifest.signature=signManifest(manifest,fs.readFileSync(path.resolve(privateKeyPath),'utf8'));
fs.writeFileSync(target,`${JSON.stringify(manifest,null,2)}\n`,{encoding:'utf8',mode:0o644});
console.log(`Signed ${path.relative(root,target)}`);
