import crypto from 'node:crypto';

function canonicalValue(value){
  if(Array.isArray(value))return value.map(canonicalValue);
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonicalValue(value[key])]));
  return value;
}

export function canonicalManifest(manifest){
  const unsigned=Object.fromEntries(Object.entries(manifest||{}).filter(([key])=>key!=='$schema'&&key!=='signature'));
  return JSON.stringify(canonicalValue(unsigned));
}

export function signManifest(manifest,privateKey){
  return crypto.sign(null,Buffer.from(canonicalManifest(manifest),'utf8'),privateKey).toString('base64');
}

export function verifyManifest(manifest,publicKey){
  if(typeof manifest?.signature!=='string')return false;
  try{return crypto.verify(null,Buffer.from(canonicalManifest(manifest),'utf8'),publicKey,Buffer.from(manifest.signature,'base64'))}
  catch{return false}
}
