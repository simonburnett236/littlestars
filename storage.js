// Layered on-phone storage modeled on RootLedger's persist():
// every save writes the whole state to (1) a JSON "mirror" file (OPFS, like RootLedger's files/ mirror),
// (2) IndexedDB, (3) localStorage; load picks the newest valid copy (falling back to backups);
// a debounced auto-backup keeps the last 5 snapshots (RootLedger keeps 5); storage.persist() asks the browser never to evict.
const NATIVE=window.LittleStarsAndroid&&typeof LittleStarsAndroid.readMirror==='function'?LittleStarsAndroid:null;
const Store=(()=>{const LS='littlestars.v1',FILE='littlestars-data.json',BK=5;let dbp,bkTimer,status={native:!!NATIVE,file:false,persisted:null,opfs:false,idb:false,ls:false,lastSave:null};
 const db=()=>dbp||(dbp=new Promise((res,rej)=>{let r;try{r=indexedDB.open('littlestars',1)}catch(e){return rej(e)}r.onupgradeneeded=()=>{r.result.createObjectStore('kv');r.result.createObjectStore('backups')};r.onsuccess=()=>res(r.result);r.onerror=()=>{dbp=null;rej(r.error)}}));
 const tx=(s,m,f)=>db().then(d=>new Promise((res,rej)=>{const t=d.transaction(s,m),q=f(t.objectStore(s));t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error)}));
 async function opfsWrite(json){const root=await navigator.storage.getDirectory();const h=await root.getFileHandle(FILE,{create:true});const w=await h.createWritable();await w.write(json);await w.close()}
 async function opfsRead(){try{const root=await navigator.storage.getDirectory();return await (await (await root.getFileHandle(FILE)).getFile()).text()}catch(e){return null}}
 const parse=s=>{try{const o=JSON.parse(s);return o&&Array.isArray(o.kids)?o:null}catch(e){return null}};
 async function load(){let cands=[];if(NATIVE){try{cands.push(parse(NATIVE.readMirror()))}catch(e){}}try{cands.push(parse(localStorage.getItem(LS)))}catch(e){}
  try{cands.push(parse(await tx('kv','readonly',s=>s.get('state'))))}catch(e){}
  if(navigator.storage?.getDirectory)cands.push(parse(await opfsRead()));
  cands=cands.filter(Boolean).sort((a,b)=>(b._savedAt||0)-(a._savedAt||0));
  if(!cands.length){const b=(await listBackups())[0];if(b)cands.push(parse(b.json))}
  persist();return cands[0]||null}
 async function save(state){state._savedAt=Date.now();const json=JSON.stringify(state);
  if(NATIVE){try{status.file=NATIVE.mirror(json)!==false}catch(e){status.file=false}}
  try{localStorage.setItem(LS,json);status.ls=true}catch(e){status.ls=false}
  const jobs=[tx('kv','readwrite',s=>s.put(json,'state')).then(()=>status.idb=true,()=>status.idb=false)];
  if(navigator.storage?.getDirectory)jobs.push(opfsWrite(json).then(()=>status.opfs=true,()=>status.opfs=false));
  await Promise.all(jobs);status.lastSave=state._savedAt;
  if(!status.ls&&!status.idb&&!status.opfs&&!status.file)window.toast?.('⚠️ Saving failed – export a backup now!');
  clearTimeout(bkTimer);bkTimer=setTimeout(()=>autoBackup(json),3000);return true}
 async function autoBackup(json){if(NATIVE){try{status.nativeBackup=JSON.parse(NATIVE.autoBackup(json)||'{}')}catch(e){}}try{const id='bk-'+new Date().toISOString();await tx('backups','readwrite',s=>s.put(json,id));
  const keys=(await tx('backups','readonly',s=>s.getAllKeys())).sort();if(keys.length>BK)await tx('backups','readwrite',s=>{keys.slice(0,keys.length-BK).forEach(k=>s.delete(k))});status.lastBackup=id}catch(e){console.error('auto backup failed',e)}}
 async function listBackups(){try{const keys=(await tx('backups','readonly',s=>s.getAllKeys())).sort().reverse();return Promise.all(keys.map(async k=>({id:k,json:await tx('backups','readonly',s=>s.get(k))})))}catch(e){return[]}}
 async function persist(){try{if(navigator.storage?.persist){status.persisted=await navigator.storage.persisted()||await navigator.storage.persist()}}catch(e){}return status.persisted}
 const flush=()=>{};return{load,save,listBackups,persist,status,autoBackup}})();
