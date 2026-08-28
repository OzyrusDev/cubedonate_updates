import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {verifyManifest} from './manifest-crypto.mjs';

const root=path.resolve(import.meta.dirname,'..');
const semver=/^\d+\.\d+\.\d+$/;
const sha256=/^[a-f0-9]{64}$/;
const failures=[];
const cmsPublicKey=fs.readFileSync(path.join(root,'keys','updates-ed25519-public.pem'),'utf8');

function readJson(relative){
  try{return JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'))}
  catch(error){failures.push(`${relative}: invalid JSON (${error.message})`);return null}
}
function expect(condition,message){if(!condition)failures.push(message)}
function https(value,label){expect(typeof value==='string'&&value.startsWith('https://'),`${label}: HTTPS URL required`)}

const cms=readJson('cms/latest.json');
if(cms){
  expect(cms.schemaVersion===2,'cms/latest.json: unsupported schemaVersion');
  expect(cms.product==='cubedonate-cms','cms/latest.json: invalid product');
  expect(semver.test(cms.version),'cms/latest.json: invalid version');
  expect(cms.tag===`v${cms.version}`,'cms/latest.json: tag/version mismatch');
  expect(!Number.isNaN(Date.parse(cms.publishedAt)),'cms/latest.json: invalid publishedAt');
  expect(semver.test(cms.minimumVersion),'cms/latest.json: invalid minimumVersion');
  https(cms.releaseUrl,'cms/latest.json releaseUrl');
  https(cms.releaseNotes?.ru,'cms/latest.json Russian release notes');
  https(cms.releaseNotes?.en,'cms/latest.json English release notes');
  expect(cms.download?.repository==='OzyrusDev/cubedonate','cms/latest.json: commercial CMS repository mismatch');
  expect(cms.download?.access==='private','cms/latest.json: CMS download must remain private');
  expect(cms.download?.assetName===null,'cms/latest.json: Git source releases must not declare an asset');
  expect(/^[a-f0-9]{40}$/.test(cms.sourceCommit),'cms/latest.json: invalid source commit');
  expect(sha256.test(cms.sha256),'cms/latest.json: invalid SHA-256');
  expect(typeof cms.signature==='string'&&/^[A-Za-z0-9+/]{86}==$/.test(cms.signature),'cms/latest.json: invalid Ed25519 signature encoding');
  expect(verifyManifest(cms,cmsPublicKey),'cms/latest.json: Ed25519 signature verification failed');
  const immutable=readJson(`cms/releases/${cms.version}.json`);
  if(immutable)expect(JSON.stringify({...cms,$schema:undefined})===JSON.stringify({...immutable,$schema:undefined}),'CMS latest manifest differs from immutable release record');
}

const launcher=readJson('launcher/latest.json');
if(launcher){
  expect(launcher.schemaVersion===1,'launcher/latest.json: unsupported schemaVersion');
  expect(launcher.product==='cubedonate-launcher','launcher/latest.json: invalid product');
  expect(['not-released','released'].includes(launcher.status),'launcher/latest.json: invalid status');
  expect(semver.test(launcher.minimumCmsVersion),'launcher/latest.json: invalid minimumCmsVersion');
  https(launcher.releaseUrl,'launcher/latest.json releaseUrl');
  if(launcher.status==='not-released'){
    expect(launcher.version===null&&launcher.tag===null&&launcher.publishedAt===null,'Unreleased launcher must not advertise a version');
    expect(Object.keys(launcher.artifacts||{}).length===0,'Unreleased launcher must not advertise artifacts');
  }else{
    expect(semver.test(launcher.version),'launcher/latest.json: invalid released version');
    expect(launcher.tag===`v${launcher.version}`||launcher.tag===`launcher-v${launcher.version}`,'launcher/latest.json: tag/version mismatch');
    expect(!Number.isNaN(Date.parse(launcher.publishedAt)),'launcher/latest.json: invalid publishedAt');
    expect(Object.keys(launcher.artifacts||{}).length>0,'Released launcher requires artifacts');
    expect(typeof launcher.signature==='string'&&launcher.signature.length>=64,'Released launcher requires a signature');
  }
}

function walk(directory){
  for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
    if(['.git','node_modules'].includes(entry.name))continue;
    const file=path.join(directory,entry.name);
    if(entry.isDirectory())walk(file);
    else{
      const source=fs.readFileSync(file,'utf8');
      expect(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(source),`${path.relative(root,file)}: private key detected`);
      expect(!/(?:github_pat_|ghp_)[A-Za-z0-9_]{20,}/.test(source),`${path.relative(root,file)}: GitHub token detected`);
    }
  }
}
walk(root);

if(failures.length){for(const failure of failures)console.error(`ERROR: ${failure}`);process.exit(1)}
console.log('CubeDonate update metadata is valid.');
