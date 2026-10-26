'use strict';
const $=s=>document.querySelector(s),V=$('#view'),KEY='littlestars.v1';
//const AV=['🐻','🐰','🦊','🐼','🐯','🦁','🐸','🐵','🦄','🐙','🐧','🐶','🐱','🦖','🐳','🦋','🚀','⭐'];
const DEF={families:[],kids:[],visits:[],settings:{rates:[{from:'2000-01-03',weekly:150,cap:600,friday:40,dueDay:2,perFamily:true}],theme:'pro',name:'Little Stars'},weeks:{}};
let D=structuredClone(DEF);const ready=Store.load().then(o=>{if(o)D=Object.assign(structuredClone(DEF),o);migrate();if(o)return save()});
let saving=Promise.resolve();function save(){saving=Store.save(D);return saving}
const uid=()=>Math.random().toString(36).slice(2,10),esc=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const money=n=>'$'+n.toFixed(2),pad=n=>String(n).padStart(2,'0');
function dur(ms){const s=Math.floor(ms/1000);return pad(Math.floor(s/3600))+':'+pad(Math.floor(s/60)%60)+':'+pad(s%60)}
function hm(ms){const m=Math.round(ms/60000);return Math.floor(m/60)+'h '+(m%60)+'m'}
const dkey=t=>{const d=new Date(t);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
function monday(t){const d=new Date(t);d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d}
const fam=id=>D.families.find(f=>f.id===id)||{},kid=id=>D.kids.find(k=>k.id===id);
const ini=n=>String(n||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
const avHtml=k=>`<div class="mono">${esc(ini(k.name))}</div>`;
const openVisit=k=>D.visits.find(v=>v.kid===k&&!v.out);
const locOf=v=>v&&v.loc?.length?v.loc[v.loc.length-1].at:'home';
function schoolMs(v,from=-Infinity,to=Infinity){let ms=0,st=null;const end=v.out||Date.now();(v.loc||[]).forEach(e=>{if(e.at==='school'&&st==null)st=e.t;else if(e.at==='home'&&st!=null){ms+=Math.max(0,Math.min(e.t,to)-Math.max(st,from));st=null}});if(st!=null)ms+=Math.max(0,Math.min(end,to)-Math.max(st,from));return ms}
const totMs=v=>(v.out||Date.now())-v.in;
function schIv(v){const r=[],end=v.out||Date.now();let st=null;(v.loc||[]).forEach(e=>{if(e.at==='school'&&st==null)st=e.t;else if(e.at==='home'&&st!=null){if(e.t>st)r.push([st,e.t]);st=null}});if(st!=null&&end>st)r.push([st,end]);return r}
function sitIv(v){const end=v.out||Date.now(),r=[];let c=v.in;schIv(v).sort((a,b)=>a[0]-b[0]).forEach(([a,b])=>{if(a>c)r.push([c,Math.min(a,end)]);c=Math.max(c,b)});if(end>c)r.push([c,end]);return r}
// per-kid hours by day; family day total = longest kid that day (never sum of siblings)
function dayMs(vs){const sd={},cd={};vs.forEach(v=>{const d=dkey(new Date(v.in)),c=schoolMs(v);sd[d]=(sd[d]||0)+totMs(v)-c;cd[d]=(cd[d]||0)+c});return{sd,cd}}
function famMax(list,key){const m={};list.forEach(k=>Object.entries(k[key]||{}).forEach(([d,ms])=>{m[d]=Math.max(m[d]||0,ms)}));return Object.values(m).reduce((a,b)=>a+b,0)}
// union length of intervals: family time counts once even when siblings overlap
function unionMs(iv){let t=0,ce=-Infinity;[...iv].sort((a,b)=>a[0]-b[0]).forEach(([a,b])=>{if(b<=ce)return;t+=b-Math.max(a,ce);ce=b});return t}
function setLoc(id,at){const v=openVisit(id);if(!v||locOf(v)===at)return;(v.loc??=[]).push({t:Date.now(),at});save();toast(at==='school'?`🏫 ${kid(id).name} is at school`:`🏠 ${kid(id).name} is back home`);render()}
window.toast=toast;function toast(m,act,fn){document.querySelectorAll('.toast').forEach(x=>x.remove());const t=document.createElement('div');t.className='toast';t.textContent=m;if(act){const b=document.createElement('button');b.className='undo';b.textContent=act;b.onclick=()=>{t.remove();fn()};t.append(' ',b)}document.body.append(t);setTimeout(()=>t.remove(),act?6000:2200)}
// ---------- FX ----------
const cv=$('#fx'),cx=cv.getContext('2d');let parts=[];
function burst(x,y,stars){const pro=D.settings.theme==='pro';cv.width=innerWidth;cv.height=innerHeight;const cols=['#ff6fb5','#ffd23f','#7ad7f0','#7a5cff','#5be37d','#ff8a00'];
 const n=pro?18:70,pc=['#5b6fa8','#8a6fa8','#c9b37e','#9fb2d9'];for(let i=0;i<n;i++)parts.push({x,y,vx:(Math.random()-.5)*(pro?5:12),vy:Math.random()*(pro?-5:-12)-2,r:Math.random()*(pro?3:6)+(pro?2:4),c:(pro?pc:cols)[i%(pro?4:6)],a:1,s:stars&&!pro,dot:pro,rot:Math.random()*6});
 if(parts.length===n)requestAnimationFrame(tick)}
function tick(){cx.clearRect(0,0,cv.width,cv.height);parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=p.dot?.12:.4;p.a-=p.dot?.02:.012;p.rot+=.1;cx.globalAlpha=Math.max(p.a,0);cx.fillStyle=p.c;cx.save();cx.translate(p.x,p.y);cx.rotate(p.rot);
 if(p.dot){cx.beginPath();cx.arc(0,0,p.r,0,7);cx.fill()}else if(p.s){cx.font=p.r*3+'px serif';cx.fillText('⭐',0,0)}else cx.fillRect(-p.r/2,-p.r/2,p.r,p.r*1.6);cx.restore()});
 parts=parts.filter(p=>p.a>0);if(parts.length)requestAnimationFrame(tick);else cx.clearRect(0,0,cv.width,cv.height)}
// ---------- check in/out ----------
function toggle(id,ev){const o=openVisit(id),r=ev?.currentTarget?.getBoundingClientRect?.()||{left:innerWidth/2,top:innerHeight/2,width:0};
 if(o){o.out=Date.now();toast(`👋 ${kid(id).name} checked out · ${hm(o.out-o.in)}`,'Undo',()=>{o.out=null;save();render();toast('Check-out undone')})}else{const nv={id:uid(),kid:id,in:Date.now(),out:null};D.visits.push(nv);toast(`🎉 ${kid(id).name} is here!`,'Undo',()=>{D.visits=D.visits.filter(v=>v!==nv);save();render();toast('Check-in undone')})}
 save();burst(r.left+r.width/2,r.top+20,!o);render()}
// ---------- billing ----------
// All amounts come from D.settings.rates (history, defaults in DEF) or family overrides – nothing hardcoded here.
const DAY=864e5,addD=(t,n)=>{const d=new Date(t);d.setDate(d.getDate()+n);return +d},hrs=ms=>Math.round(ms/36e5*10)/10;
const fmtD=d=>new Date(d).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
const DOW=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const RKEYS=['weekly','cap','friday','dueDay','perFamily'];
function migrate(){const S=D.settings;if(!S.rates?.length){const d=DEF.settings.rates[0];S.rates=[{...d,weekly:S.weekly??d.weekly,friday:S.friday??d.friday,perFamily:S.perFamily??d.perFamily}]}
 D.families.forEach(f=>{if(!f.rates){f.rates=[];const o={from:S.rates[0].from};let any=0;['weekly','friday','perFamily'].forEach(k=>{if(f[k]!=null){o[k]=f[k];any=1}});if(any)f.rates.push(o)}});D.weeks??={}}
const pick=(list,day)=>[...(list||[])].sort((a,b)=>a.from<b.from?-1:1).filter(r=>r.from<=day).pop();
function rateAt(famId,mon){const day=dkey(mon),S=D.settings,g={...(pick(S.rates,day)||[...S.rates].sort((a,b)=>a.from<b.from?-1:1)[0])},fo=pick(fam(famId).rates,day)||{};
 RKEYS.forEach(k=>{if(fo[k]!==undefined&&fo[k]!==null&&fo[k]!=='')g[k]=fo[k]});return g}
function weekCalc(famId,mon){const r=rateAt(famId,mon),end=addD(mon,7),kids=D.kids.filter(k=>k.family===famId);
 const kl=kids.map(k=>{const vs=D.visits.filter(v=>v.kid===k.id&&v.in>=+mon&&v.in<end);
  return{name:k.name,...dayMs(vs),ms:vs.reduce((s,v)=>s+totMs(v)-schoolMs(v),0),sms:vs.reduce((s,v)=>s+schoolMs(v),0),mt:vs.some(v=>{const d=new Date(v.in).getDay();return d>=1&&d<=4}),fr:vs.some(v=>new Date(v.in).getDay()===5)}});
 const mt=r.perFamily?(kl.some(k=>k.mt)?1:0):kl.filter(k=>k.mt).length,fr=r.perFamily?(kl.some(k=>k.fr)?1:0):kl.filter(k=>k.fr).length;
 return{mon:+mon,mt,fr,r,kl,nk:Math.max(1,kids.length)}}
const dueOf=(mon,r)=>addD(mon,7+((+r.dueDay+6)%7));
function mondaysOf(y,m){const out=[];for(let d=new Date(y,m,1);d.getMonth()===m;d.setDate(d.getDate()+1))if(d.getDay()===1)out.push(new Date(d));return out}
function monthWeeksRaw(famId,y,m){let used=0;return mondaysOf(y,m).map(mon=>{const w=weekCalc(famId,mon),r=w.r,full=w.mt*+r.weekly;
 const capLeft=+r.cap>0?Math.max(0,+r.cap*(r.perFamily?1:w.nk)-used):Infinity,wk=Math.min(full,capLeft);used+=wk;
 const it=[];if(w.mt)it.push({label:`Weekly care Mon–Thu${r.perFamily?'':' ('+w.mt+' kid'+(w.mt>1?'s':'')+')'} ${w.mt}×${money(+r.weekly)}${wk<full?' – capped at '+money(+r.cap)+'/mo':''}`,amt:wk});
 if(w.fr)it.push({label:`Friday fee ${fmtD(addD(w.mon,4))}${r.perFamily?'':' ('+w.fr+' kid'+(w.fr>1?'s':'')+')'} ${w.fr}×${money(+r.friday)}`,amt:w.fr*+r.friday});
 const key=famId+'|'+dkey(mon),X=D.weeks?.[key]||{},adj=(X.adj||[]).map(a=>({label:a.desc||(a.amt<0?'Credit':'Extra charge'),amt:+a.amt}));
 const sub=it.reduce((s,i)=>s+i.amt,0)+adj.reduce((s,i)=>s+i.amt,0),charges=X.override!=null&&X.override!==''?+X.override:sub;
 return{...w,key,due:dueOf(mon,r),items:it,adj,override:X.override!=null&&X.override!==''?+X.override:null,sub,charges,pays:(X.pay||[]).map(p=>({...p,amt:+p.amt}))}})}
// Ledger over all time with FIFO payment allocation (oldest balance first); unpaid amounts carry into later weeks.
function ledger(famId){const ks=D.kids.filter(k=>k.family===famId).map(k=>k.id),times=D.visits.filter(v=>ks.includes(v.kid)).map(v=>v.in);
 Object.keys(D.weeks||{}).filter(k=>k.startsWith(famId+'|')).forEach(k=>times.push(+new Date(k.split('|')[1]+'T12:00')));
 const now=Date.now();if(!times.length)times.push(now);let d=new Date(Math.min(...times));d=new Date(d.getFullYear(),d.getMonth(),1);
 const last=new Date(Math.max(now,...times)),out=[],open=[];
 for(;d<=last||(d.getFullYear()===last.getFullYear()&&d.getMonth()===last.getMonth());d=new Date(d.getFullYear(),d.getMonth()+1,1)){
  for(const w of monthWeeksRaw(famId,d.getFullYear(),d.getMonth())){w.prevLines=open.filter(o=>o.rem>0.004).map(o=>({label:`Previous balance (week of ${fmtD(o.mon)}, ${o.rem<o.charges?'partly paid':'unpaid'})`,amt:o.rem,mon:o.mon}));
   w.prev=w.prevLines.reduce((s,l)=>s+l.amt,0);const me={key:w.key,mon:w.mon,charges:w.charges,rem:w.charges};open.push(me);
   let extra=0;for(const p of w.pays){let a=p.amt;for(const o of open){if(a<=0)break;const t=Math.min(o.rem,a);o.rem-=t;a-=t}extra+=a}
   if(extra>0)open.push({key:w.key+'#credit',mon:w.mon,charges:-extra,rem:-extra});// overpayment -> credit
   // net credits against later charges
   const cr=open.filter(o=>o.rem<0);for(const c of cr){for(const o of open){if(c.rem>=0)break;if(o.rem>0){const t=Math.min(o.rem,-c.rem);o.rem-=t;c.rem+=t}}}
   w.totalDue=w.prev+w.charges;w.paid=w.pays.reduce((s,p)=>s+p.amt,0);w.balance=open.reduce((s,o)=>s+o.rem,0);w._me=me;out.push(w)}}
 out.forEach(w=>{w.weekRem=w._me.rem;w.status=w.totalDue<=0.004&&w.paid===0?'none':w.balance<=0.004?'paid':w.paid>0?'partial':Date.now()>w.due+DAY?'overdue':'unpaid'});return out}
function kidsHrs(lists){const m={},sc={};const all=lists.flat();all.forEach(k=>{m[k.name]=(m[k.name]||0)+k.ms;sc[k.name]=(sc[k.name]||0)+(k.sms||0)});const kids=Object.entries(m).map(([name,ms])=>({name,hrs:hrs(ms),school:hrs(sc[name])}));return{kids,totalHrs:hrs(famMax(all,'sd')),schoolHrs:hrs(famMax(all,'cd'))}}
const monthWeeks=(famId,y,m)=>ledger(famId).filter(w=>{const d=new Date(w.mon);return d.getFullYear()===y&&d.getMonth()===m});
const head=famId=>{const f=fam(famId);return{biz:D.settings.name,family:f.name,parent:f.parent}};
function weekBill(famId,w){if(typeof w==='string')w=ledger(famId).find(x=>x.key===w);
 return{kind:'week',...head(famId),period:`Week of ${fmtD(w.mon)} – ${fmtD(addD(w.mon,4))}`,due:w.due,dueDay:DOW[new Date(w.due).getDay()],prevLines:w.prevLines,items:w.items,adj:w.adj,override:w.override,sub:w.sub,charges:w.charges,
  totalDue:w.totalDue,pays:w.pays,paid:w.paid,balance:w.balance,status:w.status,...kidsHrs([w.kl])}}
function statement(famId,y,m){const all=ledger(famId),ws=all.filter(w=>{const d=new Date(w.mon);return d.getFullYear()===y&&d.getMonth()===m});
 const first=ws[0],prev=first?first.prev:0,charges=ws.reduce((s,w)=>s+w.charges,0),paid=ws.reduce((s,w)=>s+w.paid,0),last=ws[ws.length-1];
 return{kind:'statement',...head(famId),period:new Date(y,m,1).toLocaleString('en-US',{month:'long',year:'numeric'})+' statement',
  from:+new Date(y,m,1),to:+new Date(y,m+1,0),prev,prevLines:first?first.prevLines:[],charges,paid,balance:last?last.balance:prev,due:last?last.due:null,
  weeks:ws.map(w=>({period:`Week of ${fmtD(w.mon)}`,due:w.due,items:w.items,adj:w.adj,override:w.override,sub:w.sub,charges:w.charges,status:w.status})),
  pays:ws.flatMap(w=>w.pays.map(p=>({...p,week:fmtD(w.mon)}))).sort((a,b)=>a.t-b.t),...kidsHrs(ws.map(w=>w.kl))}}
const ST={paid:'✅ Paid',partial:'◐ Partly paid',overdue:'⏰ Overdue',unpaid:'🕒 Unpaid',none:'Nothing owed'};
const sgn=a=>a<0?'−'+money(-a):money(a);
function invText(b){const L=[];L.push(`⭐ ${b.biz} – ${b.kind==='statement'?'Monthly Statement':'Weekly Invoice'}`,`${b.family} family · ${b.period}`);
 if(b.kind==='statement'){L.push(`${fmtD(b.from)} – ${fmtD(b.to)}`,'',`Previous balance: ${sgn(b.prev)}`,`New charges: ${sgn(b.charges)}`,`Payments: −${money(b.paid)}`,`NEW BALANCE: ${sgn(b.balance)}${b.due&&b.balance>0?' – due '+fmtD(b.due):''}`,'');
  b.prevLines.forEach(l=>L.push(`${l.label}: ${sgn(l.amt)}`));
  b.weeks.forEach(w=>{L.push(`${w.period} (due ${fmtD(w.due)}) – ${ST[w.status]}`);w.items.concat(w.adj).forEach(i=>L.push(`  ${i.label}: ${sgn(i.amt)}`));if(w.override!=null)L.push(`  Week total set to ${money(w.override)} (was ${money(w.sub)})`);L.push(`  Week charges: ${sgn(w.charges)}`)});
  if(b.pays.length){L.push('','Payments received:');b.pays.forEach(p=>L.push(`  ${fmtD(p.t)}: ${money(p.amt)}${p.note?' – '+p.note:''}`))}}
 else{L.push(`Due: ${fmtD(b.due)} – ${ST[b.status]}`,'');b.prevLines.forEach(l=>L.push(`${l.label}: ${sgn(l.amt)}`));
  b.items.concat(b.adj).forEach(i=>L.push(`${i.label}: ${sgn(i.amt)}`));if(b.override!=null)L.push(`This week's total set to ${money(b.override)} (was ${money(b.sub)})`);
  L.push(`This week's charges: ${sgn(b.charges)}`,`TOTAL DUE by ${fmtD(b.due)}: ${sgn(b.totalDue)}`);b.pays.forEach(p=>L.push(`Payment ${fmtD(p.t)}${p.note?' ('+p.note+')':''}: −${money(p.amt)}`));if(b.pays.length)L.push(`Balance: ${sgn(b.balance)}`)}
 L.push('','Hours watched (sitter time):');b.kids.forEach(k=>L.push(`• ${k.name}: ${k.hrs} hrs`));L.push(`Family total (longest kid each day): ${b.totalHrs} hrs`,'','School vs Sitter time:');
 b.kids.forEach(k=>L.push(`• ${k.name}: sitter ${k.hrs} hrs · school ${k.school||0} hrs`));L.push(`Family totals (longest kid each day): sitter ${b.totalHrs} hrs · school ${b.schoolHrs||0} hrs`,'','Thank you! 💖');return L.join('\n')}
const b64e=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const b64d=s=>JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/')))));
const invLink=b=>location.origin+location.pathname+'#invoice='+b64e(b);
async function share(o){if(NATIVE){NATIVE.shareText(o.title||'Little Stars',o.url?o.text+' '+o.url:o.text);return}if(navigator.share){try{await navigator.share(o);return}catch(e){if(e.name==='AbortError')return}}
 await navigator.clipboard?.writeText(o.url?o.text+' '+o.url:o.text).catch(()=>{});toast('📋 Copied!')}
const isMobile=/Android|iPhone|iPad/i.test(navigator.userAgent);
function sms(f,body){if(NATIVE&&f.phone){NATIVE.openUrl(`sms:${f.phone.replace(/[^\d+]/g,'')}?body=${encodeURIComponent(body)}`);return}if(isMobile&&f.phone){location.href=`sms:${f.phone.replace(/[^\d+]/g,'')}?&body=${encodeURIComponent(body)}`}else share({title:'Invoice',text:body})}
const rowsH=(list,cls='')=>list.map(i=>`<tr class="${cls}${i.amt<0?' credit':''}"><td>${esc(i.label)}</td><td class="r">${sgn(i.amt)}</td></tr>`).join('');
function hoursH(b){return `<div class="sscard"><b>⏱️ Hours · 🏠 Sitter vs 🏫 School</b><table data-ss><tr><th>Kid</th><th class="r">🏠 Sitter</th><th class="r">🏫 School</th></tr>${b.kids.map(k=>`<tr><td>${esc(k.name)}</td><td class="r">${k.hrs} hrs</td><td class="r">${k.school||0} hrs</td></tr>`).join('')}<tr><th>Family total (longest kid each day)</th><th class="r" data-hrs>${b.totalHrs} hrs</th><th class="r" data-school>${b.schoolHrs||0} hrs</th></tr></table><small>Hours watched = sitter time only. Family total = the longest any one kid stayed each day, added up; siblings are not added together.</small></div>`}
const headH=(b,sub)=>`<div class="row inv-head"><svg style="flex:0 0 52px;height:52px"><use href="#star"/></svg><div style="flex:4"><h2 style="margin:0">${esc(b.biz)}</h2><div>${sub}</div></div></div><p><b>${esc(b.family)} family</b>${b.parent?' · '+esc(b.parent):''}</p>`;
function invHtml(b){if(b.kind==='statement')return stmtHtml(b);const over=b.status==='overdue';
 return `<div class="card invoice ${over?'overdue':''}">${headH(b,'Weekly invoice · '+esc(b.period))}
 <p><span class="pill st-${b.status}" data-status>${ST[b.status]}</span> Due <b data-due>${fmtD(b.due)}</b></p>
 <table>${rowsH(b.prevLines,'prev')}${b.prevLines.length?`<tr class="sep"><td colspan=2><small>This week</small></td></tr>`:''}${rowsH(b.items)||'<tr><td>No billable days</td><td class="r">$0.00</td></tr>'}${rowsH(b.adj,'adj')}
 ${b.override!=null?`<tr class="adj"><td>Week total set to (was ${money(b.sub)})</td><td class="r">${money(b.override)}</td></tr>`:''}
 <tr><td><b>This week's charges</b></td><td class="r" data-charges><b>${sgn(b.charges)}</b></td></tr>
 <tr class="tot"><th>Total due by ${fmtD(b.due)}</th><th class="r" data-total>${sgn(b.totalDue)}</th></tr>
 ${b.pays.map(p=>`<tr class="pay"><td>Payment ${fmtD(p.t)}${p.note?' · '+esc(p.note):''}</td><td class="r">−${money(p.amt)}</td></tr>`).join('')}
 ${b.pays.length?`<tr class="tot"><th>Balance</th><th class="r" data-balance>${sgn(b.balance)}</th></tr>`:''}</table>
 ${hoursH(b)}<p style="text-align:center">Thank you! 💖</p></div>`}
function stmtHtml(b){return `<div class="card invoice statement">${headH(b,'Monthly statement · '+fmtD(b.from)+' – '+fmtD(b.to))}
 <div class="sumgrid"><div><small>Previous balance</small><b data-prev>${sgn(b.prev)}</b></div><div><small>New charges</small><b data-newch>${sgn(b.charges)}</b></div><div><small>Payments</small><b data-pays>−${money(b.paid)}</b></div><div class="hl"><small>${b.balance>0?'Amount due':'Balance'}</small><b data-total>${sgn(b.balance)}</b>${b.due&&b.balance>0?`<small>by ${fmtD(b.due)}</small>`:''}</div></div>
 ${b.prevLines.length?`<h3>Carried in</h3><table>${rowsH(b.prevLines,'prev')}</table>`:''}
 <h3>Weekly charges</h3>${b.weeks.map(w=>`<table class="wk"><tr class="sep"><th>${esc(w.period)} <small>· due ${fmtD(w.due)} · ${ST[w.status]}</small></th><th></th></tr>${rowsH(w.items)}${rowsH(w.adj,'adj')}${w.override!=null?`<tr class="adj"><td>Week total set to (was ${money(w.sub)})</td><td class="r">${money(w.override)}</td></tr>`:''}<tr><td><b>Week charges</b></td><td class="r"><b>${sgn(w.charges)}</b></td></tr></table>`).join('')}
 <h3>Payments received</h3><table>${b.pays.map(p=>`<tr class="pay"><td>${fmtD(p.t)}${p.note?' · '+esc(p.note):''} <small>(week of ${esc(p.week)})</small></td><td class="r">−${money(p.amt)}</td></tr>`).join('')||'<tr><td>None this period</td><td></td></tr>'}</table>
 <table><tr class="tot"><th>New balance</th><th class="r">${sgn(b.balance)}</th></tr></table>${hoursH(b)}<p style="text-align:center">Thank you! 💖</p></div>`}
function ssCard(rows,title){const fams=rows.fams||[],ts=fams.reduce((a,f)=>a+f.sitter,0),tc=fams.reduce((a,f)=>a+f.school,0);
 const body=fams.map(f=>f.kids.map(r=>`<tr><td>${esc(r.name)}</td><td class="r">${r.sitter} hrs</td><td class="r">${r.school} hrs</td></tr>`).join('')+`<tr data-ss-fam><th>${esc(f.name)} family total (longest kid each day)</th><th class="r">${f.sitter} hrs</th><th class="r">${f.school} hrs</th></tr>`).join('');
 return `<div class="card sscard" data-ss><b>🏠 vs 🏫 School vs Sitter Time${title?' · '+esc(title):''}</b><table><tr><th>Kid</th><th class="r">🏠 Sitter</th><th class="r">🏫 School</th></tr>
 ${body||'<tr><td colspan=3>No visits</td></tr>'}
 ${fams.length>1?`<tr><th>All families (sum of family totals)</th><th class="r" data-ss-sitter>${hrs(ts*36e5)} hrs</th><th class="r" data-ss-school>${hrs(tc*36e5)} hrs</th></tr>`:`<tr hidden><th></th><th data-ss-sitter>${hrs(ts*36e5)} hrs</th><th data-ss-school>${hrs(tc*36e5)} hrs</th></tr>`}</table><small>Sitter time = hours watched. School time is not counted. Family totals = longest kid each day; siblings are not added together.</small></div>`}
function ssRows(from,to){const m={},F={};D.visits.filter(v=>v.in>=from&&v.in<to).forEach(v=>{const k=kid(v.kid),sm=schoolMs(v),r=m[v.kid]??={name:k?.name||'?',s:0,c:0,fam:k?.family};r.s+=totMs(v)-sm;r.c+=sm;const g=F[k?.family]??={};const kk=g[v.kid]??={sd:{},cd:{}},dd=dkey(new Date(v.in));kk.sd[dd]=(kk.sd[dd]||0)+totMs(v)-sm;kk.cd[dd]=(kk.cd[dd]||0)+sm});
 const rows=Object.values(m).map(r=>({name:r.name,fam:r.fam,sitter:hrs(r.s),school:hrs(r.c)}));
 rows.fams=Object.entries(F).map(([id,g])=>({name:(D.families.find(f=>f.id===id)?.name)||'?',kids:rows.filter(r=>String(r.fam)===id),sitter:hrs(famMax(Object.values(g),'sd')),school:hrs(famMax(Object.values(g),'cd'))}));return rows}
const mkey=(y,m)=>y+'-'+pad(m+1),mname=(y,m)=>new Date(y,m,1).toLocaleString('en-US',{month:'long',year:'numeric'});
function lastMonth(){const n=new Date();return{y:n.getMonth()?n.getFullYear():n.getFullYear()-1,m:(n.getMonth()+11)%12}}
const monthDone=(y,m)=>Date.now()>=+new Date(y,m+1,1);
function genStatements(y,m){if(!monthDone(y,m)){toast(mname(y,m)+' is not finished yet');return 0}D.statements??={};let n=0;
 D.families.forEach(f=>{const k=f.id+'|'+mkey(y,m),old=D.statements[k];D.statements[k]={fam:f.id,month:mkey(y,m),at:Date.now(),version:(old?.version||0)+1,b:statement(f.id,y,m)};n++});save();return n}
function stmtBanner(){const {y,m}=lastMonth();if(!D.families.length)return '';const missing=D.families.filter(f=>!D.statements?.[f.id+'|'+mkey(y,m)]);if(!missing.length)return '';
 return `<div class="card banner-ready noprint" data-ready><b>📄 ${new Date(y,m,1).toLocaleString('en-US',{month:'long'})} statements ready</b><div><small>${missing.length} famil${missing.length>1?'ies':'y'} not generated yet</small></div><button class="btn" id="genst">Generate statements</button></div>`}
function invFile(b){let css='';for(const sh of document.styleSheets){try{for(const r of sh.cssRules)css+=r.cssText+'\n'}catch(e){}}
 const star=document.querySelector('svg defs').outerHTML;return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(b.biz)} – ${esc(b.period)}</title><style>${css}</style></head><body class="theme-pro" style="padding:14px"><svg width="0" height="0" style="position:absolute">${star}</svg>${invHtml(b)}</body></html>`}
function shareLink(b,f,text){if(NATIVE){NATIVE.shareFile(`${(b.family||'invoice').replace(/\W+/g,'')}-${b.kind==='statement'?'statement':'invoice'}-${dkey(b.due||Date.now())}.html`,'text/html',invFile(b),text);return}share({title:`${b.biz} ${b.kind==='statement'?'statement':'invoice'}`,text,url:invLink(b)})}
function doPrint(){if(NATIVE)NATIVE.printPage(D.settings.name+' invoice');else print()}
window.__lsFlush=()=>save();window.__lsReload=()=>Store.load().then(o=>{if(o&&(o._savedAt||0)>(D._savedAt||0)){D=Object.assign(structuredClone(DEF),o);migrate();render();toast('🔄 Updated from widget')}});window.__lsBack=()=>{if(!$('#modal').hidden){$('#modal').hidden=true;return true}return false};
// ---------- views ----------
let lastTab=null,tab='here',bview='week',hmode='week',bm=new Date();
function render(){document.body.className='theme-'+D.settings.theme;$('#title').textContent=D.settings.name;
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.tab===tab));(VIEWS[tab]||VIEWS.here)();if(lastTab!==tab){V.classList.remove('enter');void V.offsetWidth;V.classList.add('enter');lastTab=tab}countUp()}
const VIEWS={
here(){const inN=D.kids.filter(k=>openVisit(k.id)).length,schN=D.kids.filter(k=>locOf(openVisit(k.id))==='school'&&openVisit(k.id)).length;
 V.innerHTML=stmtBanner()+`<div class="banner"><div class="card"><big>${inN}</big>here now</div><div class="card"><big>${schN}</big>at school</div><div class="card"><big>${D.kids.length}</big>kids</div></div>`+
 (D.kids.length?`<div class="grid">${D.kids.map(k=>{const o=openVisit(k.id);return `<div class="kid ${o?'in':''}" data-kid="${k.id}">${avHtml(k)}<b>${esc(k.name)}</b>${o?`<span class="loc ${locOf(o)}" data-loc>${locOf(o)==='school'?'🏫 At School':'🏠 At Home'}</span>`:''}
 <div class="timer" data-start="${o?o.in:''}">${o?dur(Date.now()-o.in):'—'}</div><button class="btn ${o?'out':''}" data-toggle="${k.id}">${o?'Check out 👋':'Check in ✨'}</button>${o?`<button class="btn ghost sm editv" data-editv="${o.id}">✏️ Edit visit</button>`:''}${o?`<div class="seg locseg"><button data-setloc="home" data-k="${k.id}" class="${locOf(o)==='home'?'on':''}">🏠 Home</button><button data-setloc="school" data-k="${k.id}" class="${locOf(o)==='school'?'on':''}">🏫 School</button></div>`:''}</div>`}).join('')}</div>`
 :`<div class="empty card"><svg viewBox="0 0 200 120"><use href="#empty"/></svg><p>No kids yet! Add your first little star.</p><button class="btn" onclick="tab='kids';render();editKid()">➕ Add a kid</button></div>`);
 if(D.kids.length){const d0=new Date();d0.setHours(0,0,0,0);V.insertAdjacentHTML('beforeend',ssCard(ssRows(+d0,+d0+864e5),'Today'))}
 V.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=e=>toggle(b.dataset.toggle,e));V.querySelectorAll('[data-setloc]').forEach(b=>b.onclick=()=>setLoc(b.dataset.k,b.dataset.setloc));V.querySelectorAll('[data-editv]').forEach(b=>b.onclick=()=>editVisit(b.dataset.editv))},
kids(){V.innerHTML=`<div class="row"><button class="btn" id="ak">➕ Add kid</button><button class="btn ghost" id="af">👪 Add family</button></div><br>`+
 D.families.map(f=>`<div class="card"><div class="row"><h2 style="flex:3">👪 ${esc(f.name)}</h2><button class="btn ghost" data-ef="${f.id}">Edit</button></div>
 <div>${esc(f.parent||'')} ${f.phone?'· 📞 '+esc(f.phone):''}</div><div class="grid" style="margin-top:10px">${D.kids.filter(k=>k.family===f.id).map(k=>`<div class="kid" data-ek="${k.id}">${avHtml(k)}<b>${esc(k.name)}</b>${openVisit(k.id)?`<span class="loc ${locOf(openVisit(k.id))}">${locOf(openVisit(k.id))==='school'?'🏫 At School':'🏠 At Home'}</span>`:'<span class="loc off">Not here</span>'}${k.notes?`<small>⚠️ ${esc(k.notes)}</small>`:''}</div>`).join('')}</div></div>`).join('');
 $('#ak').onclick=()=>editKid();$('#af').onclick=()=>editFam();V.querySelectorAll('[data-ef]').forEach(b=>b.onclick=()=>editFam(b.dataset.ef));V.querySelectorAll('[data-ek]').forEach(b=>b.onclick=()=>editKid(b.dataset.ek))},
history(){const now=new Date();let from,to;if(hmode==='day'){from=new Date(now);from.setHours(0,0,0,0);to=+from+864e5}else if(hmode==='week'){from=monday(now);to=+from+7*864e5}else{from=new Date(now.getFullYear(),now.getMonth(),1);to=+new Date(now.getFullYear(),now.getMonth()+1,1)}
 const vs=D.visits.filter(v=>v.in>=+from&&v.in<to).sort((a,b)=>b.in-a.in),days={};vs.forEach(v=>(days[dkey(v.in)]??=[]).push(v));
 const tot={};const sch={};vs.forEach(v=>{const sm=schoolMs(v);tot[v.kid]=(tot[v.kid]||0)+totMs(v)-sm;sch[v.kid]=(sch[v.kid]||0)+sm});
 V.innerHTML=`<div class="seg">${['day','week','month'].map(m=>`<button data-m="${m}" class="${hmode===m?'on':''}">${m[0].toUpperCase()+m.slice(1)}</button>`).join('')}</div>
 <div class="card" hidden><b>Totals</b><br>${Object.keys(tot).map(k=>`<span class="pill" hidden>${esc(kid(k)?.name||'?')}: ${hm(tot[k])} watched${sch[k]?' · 🏫 '+hm(sch[k]):''}</span>`).join('')||'No visits yet'}</div>`+ssCard(ssRows(+from,to),hmode==='day'?'Today':hmode==='week'?'This week':'This month')+
 Object.entries(days).map(([d,l])=>`<div class="card"><b>${new Date(d+'T12:00').toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}</b><table>${l.map(v=>`<tr class="vrow" data-ev="${v.id}"><td>${esc(kid(v.kid)?.name||'?')} <small class="noprint">✏️</small></td><td>${new Date(v.in).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}–${v.out?new Date(v.out).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}):'now'}</td><td class="r">${hm(totMs(v)-schoolMs(v))}${schoolMs(v)?`<br><small>🏫 ${hm(schoolMs(v))}</small>`:''}</td></tr>${(v.loc||[]).map(e=>`<tr class="locrow"><td colspan="3"><small>${new Date(e.t).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})} · ${e.at==='school'?'🏫 Went to school':'🏠 Back at home'}</small></td></tr>`).join('')}`).join('')}</table></div>`).join('');
 V.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{hmode=b.dataset.m;render()});V.querySelectorAll('[data-ev]').forEach(r=>r.onclick=()=>editVisit(r.dataset.ev))},
bills(){const y=bm.getFullYear(),m=bm.getMonth();
 V.innerHTML=stmtBanner()+`<div class="seg noprint">${['week','month'].map(x=>`<button data-bv="${x}" class="${bview===x?'on':''}">${x==='week'?'Weekly bills':'Monthly statement'}</button>`).join('')}</div>
 <div class="row noprint"><button class="btn ghost" id="pm">◀</button><h2 style="flex:3;text-align:center">${bm.toLocaleString('en-US',{month:'long',year:'numeric'})}</h2><button class="btn ghost" id="nm">▶</button></div>`+
 D.families.map(f=>{const btns=(k,extra='')=>`<div class="row noprint" data-key="${k}" style="margin:-4px 0 16px">${extra}<button class="btn" data-a="text">💬 Text invoice</button><button class="btn" data-a="link">🔗 Share link</button><button class="btn ghost" data-a="smslink">📱 Text link</button><button class="btn ghost" data-a="print">🖨️ Print / PDF</button></div>`;
  if(bview==='month'){const sk=f.id+'|'+mkey(y,m),saved=D.statements?.[sk],past=Object.values(D.statements||{}).filter(x=>x.fam===f.id).sort((a,b)=>a.month<b.month?1:-1);
   return `<div data-fam="${f.id}">${saved?`<p class="noprint"><span class="pill st-paid">🔒 Saved statement v${saved.version} · ${new Date(saved.at).toLocaleString()}</span></p>`:`<p class="noprint"><span class="pill">${monthDone(y,m)?'Preview – not generated':'Month in progress – preview only'}</span></p>`}${invHtml(saved?saved.b:statement(f.id,y,m))}${btns(saved?'saved:'+sk:'month')}
   ${monthDone(y,m)?`<button class="btn ${saved?'ghost':''} noprint" data-gen="${y},${m}">${saved?'🔄 Regenerate (correct) statement':'📄 Generate statement'}</button>`:''}
   <div class="card noprint" data-past><b>🗂️ Past statements</b>${past.map(x=>`<div class="row"><span style="flex:3">${mname(+x.month.slice(0,4),+x.month.slice(5)-1)} <small>v${x.version} · ${sgn(x.b.balance)}</small></span><button class="btn ghost sm" data-open="${f.id}|${x.month}">Open</button></div>`).join('')||'<small>None yet</small>'}</div></div>`}
  return `<div data-fam="${f.id}"><h2>👪 ${esc(f.name)}</h2>`+monthWeeks(f.id,y,m).map(w=>invHtml(weekBill(f.id,w))+btns(w.key,`<button class="btn primary" data-a="pay">💵 Add Payment</button>${w.balance>0.004?`<button class="btn ghost" data-a="paid">✅ Paid in full</button>`:''}<button class="btn ghost" data-a="adj">✏️ Adjust Bill</button>`)).join('')+'</div>'}).join('');
 V.querySelectorAll('[data-bv]').forEach(b=>b.onclick=()=>{bview=b.dataset.bv;render()});

 V.querySelectorAll('[data-gen]').forEach(b=>b.onclick=()=>{const [gy,gm]=b.dataset.gen.split(',').map(Number),had=D.statements?.[b.closest('[data-fam]').dataset.fam+'|'+mkey(gy,gm)];if(had&&!confirm('Regenerate? This replaces the saved statement with current numbers.'))return;genStatements(gy,gm);toast('Statement saved 🔒');render()});
 V.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{const [fid,mo]=b.dataset.open.split('|');bview='month';bm=new Date(+mo.slice(0,4),+mo.slice(5)-1,1);render()});
 $('#pm').onclick=()=>{bm=new Date(y,m-1,1);render()};$('#nm').onclick=()=>{bm=new Date(y,m+1,1);render()};
 V.querySelectorAll('[data-a]').forEach(btn=>btn.onclick=()=>{const fid=btn.closest('[data-fam]').dataset.fam,f=fam(fid),key=btn.parentNode.dataset.key,a=btn.dataset.a;
  const b=key.startsWith('saved:')?D.statements[key.slice(6)].b:key==='month'?statement(fid,y,m):weekBill(fid,key),amt=b.kind==='statement'?b.balance:b.totalDue,dueTxt=b.due?` (due ${fmtD(b.due)})`:'';
  if(a==='paid'){const X=D.weeks[key]??={};(X.pay??=[]).push({t:Date.now(),amt:Math.round(b.balance*100)/100,note:'Paid in full'});save();render();burst(innerWidth/2,innerHeight/2,true)}
  if(a==='pay')editWeek(key,'pay');if(a==='adj')editWeek(key,'adj');
  if(a==='text')sms(f,invText(b));
  if(a==='link')shareLink(b,f,`Your ${b.kind==='statement'?'statement':'invoice'}: ${sgn(amt)}${dueTxt}`);
  if(a==='smslink')sms(f,NATIVE?invText(b):`Hi! Your ${b.biz} ${b.kind==='statement'?'statement':'invoice'}: ${sgn(amt)}${dueTxt} ${invLink(b)}`);if(a==='print')printOne(btn.closest('[data-fam]'),btn.parentNode)})},
settings(){const S=D.settings,cur=pick(S.rates,dkey(Date.now()))||S.rates[0],today=dkey(monday(Date.now()));
 V.innerHTML=`<div class="card"><label>Business name</label><input id="sn" value="${esc(S.name)}">
 <label>Theme</label><div class="seg">${['pro','candy','ocean','night'].map(t=>`<button data-t="${t}" class="${S.theme===t?'on':''}">${{pro:'Professional',candy:'Candy',ocean:'Ocean',night:'Night'}[t]}</button>`).join('')}</div><button class="btn" id="ss">💾 Save name</button></div>
 <div class="card" id="ratecard"><h2>💲 Rates</h2>${rateForm(cur,false)}<label>📅 Schedule rate change – effective from</label><input id="r_from" type="date" value="${today}">
 <small>Pick today for now, or a future date to schedule it. Weeks before the date keep the rates they were billed at.</small><button class="btn" id="rsave">📅 Save / schedule rate change</button>
 <h3>Rate history</h3>${rateHist(S.rates,'g')}</div>
 <div class="card"><b>Backup</b><div class="row"><button class="btn ghost" id="ex">⬇️ Export</button><label class="btn ghost" style="text-align:center">⬆️ Import<input type="file" id="im" accept=".json" hidden></label></div></div>
 <div class="card" id="stcard"><b>📱 Saved on this phone</b><div id="stinfo">Checking…</div><div id="bklist"></div></div>
 <div class="card"><small>Each week is billed the weekly rate if any kid came Mon–Thu, plus the Friday fee if any kid came Friday, up to the monthly cap. A week belongs to the month its Monday is in and is due on the chosen day of the following week. Unpaid amounts carry into the next bill; payments go to the oldest balance first. Families can override any rate.</small></div>`;
 V.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{S.theme=b.dataset.t;save();render()});
 $('#ss').onclick=()=>{S.name=$('#sn').value||DEF.settings.name;save();toast('Saved ✅');render()};
 $('#rsave').onclick=()=>{const r=readRate(false);if(!r)return;r.from=$('#r_from').value||today;S.rates=S.rates.filter(x=>x.from!==r.from&&x.from!==window.__editFrom).concat(r);window.__editFrom=null;save();toast(r.from>dkey(Date.now())?'📅 Scheduled for '+fmtD(r.from+'T12:00'):'Rates saved ✅');render()};
 bindHist(S.rates,'g',()=>render());
 showStorage();$('#ex').onclick=()=>{if(NATIVE){NATIVE.shareFile('littlestars-backup-'+dkey(Date.now())+'.json','application/json',JSON.stringify(D,null,1),null);return}const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(D,null,1)],{type:'application/json'}));a.download='littlestars-backup-'+dkey(Date.now())+'.json';a.click()};
 $('#im').onchange=async e=>{try{const j=JSON.parse(await e.target.files[0].text());if(!j.kids)throw 0;if(confirm('Replace all data with this backup?')){D=Object.assign(structuredClone(DEF),j);migrate();save();render();toast('Restored ✅')}}catch(_){toast('Not a valid backup')}}}
};
// rate form shared by global settings and family overrides (inherit = blank)
function rateForm(r,inh){const ph=k=>inh?`placeholder="Default"`:'',v=k=>r&&r[k]!=null&&r[k]!==''?r[k]:'';
 return `<div class="rgrid"><div><label>Weekly rate (Mon–Thu)</label><input id="r_weekly" type="number" step="0.01" inputmode="decimal" ${ph()} value="${v('weekly')}"></div>
 <div><label>Friday fee</label><input id="r_friday" type="number" step="0.01" inputmode="decimal" ${ph()} value="${v('friday')}"></div>
 <div><label>Monthly cap ($, 0 = off)</label><input id="r_cap" type="number" step="0.01" inputmode="decimal" ${ph()} value="${v('cap')}"></div>
 <div><label>Due day (next week)</label><select id="r_dueDay">${inh?'<option value="">Default</option>':''}${DOW.map((d,i)=>`<option value="${i}" ${String(v('dueDay'))===String(i)?'selected':''}>${d}</option>`).join('')}</select></div></div>
 <label>Weekly billing</label><select id="r_perFamily">${inh?'<option value="">Default</option>':''}<option value="1" ${v('perFamily')===true?'selected':''}>Per family</option><option value="0" ${v('perFamily')===false?'selected':''}>Per kid</option></select>`}
function readRate(inh){const r={},num=k=>$('#r_'+k).value;for(const k of ['weekly','friday','cap']){const x=num(k);if(x===''){if(!inh){toast('Enter a '+k+' amount');return null}}else{if(isNaN(+x)||+x<0){toast('Check the '+k+' amount');return null}r[k]=+x}}
 const dd=$('#r_dueDay').value;if(dd!=='')r.dueDay=+dd;const pf=$('#r_perFamily').value;if(pf!=='')r.perFamily=pf==='1';return r}
function rateHist(list,tag){const L=[...(list||[])].sort((a,b)=>a.from<b.from?1:-1);if(!L.length)return '<small>No overrides – uses default rates.</small>';
 const td=dkey(Date.now()),up=L.filter(r=>r.from>td);return `${up.length?`<div class="upcoming" data-upcoming><b>📅 Upcoming rate changes (${up.length})</b></div>`:''}<table class="rh">${L.map(r=>`<tr class="${r.from>td?'up':''}"><td><b>${r.from>td?'<span class="pill st-partial">Upcoming</span> ':''}from ${fmtD(r.from+'T12:00')}</b><br><small>${RKEYS.filter(k=>r[k]!=null).map(k=>k==='dueDay'?'due '+DOW[r[k]]:k==='perFamily'?(r[k]?'per family':'per kid'):k==='cap'?(+r[k]?'cap '+money(+r[k]):'no cap'):k+' '+money(+r[k])).join(' · ')}</small></td><td class="r"><button class="btn ghost sm" data-ed${tag}="${r.from}">✏️</button>${list.length>1||tag!=='g'?`<button class="btn ghost sm" data-del${tag}="${r.from}">✕</button>`:''}</td></tr>`).join('')}</table>`}
function bindHist(list,tag,after){document.querySelectorAll(`[data-ed${tag}]`).forEach(b=>b.onclick=()=>{const r=list.find(x=>x.from===b.getAttribute('data-ed'+tag));['weekly','friday','cap'].forEach(k=>$('#r_'+k).value=r[k]??'');$('#r_dueDay').value=r.dueDay??'';$('#r_perFamily').value=r.perFamily==null?'':r.perFamily?'1':'0';$('#r_from').value=r.from;window.__editFrom=r.from;$('#r_from').scrollIntoView({block:'center'});toast('Editing change from '+fmtD(r.from+'T12:00'))});document.querySelectorAll(`[data-del${tag}]`).forEach(b=>b.onclick=()=>{if(!confirm('Remove this rate change?'))return;const i=list.findIndex(r=>r.from===b.getAttribute('data-del'+tag));list.splice(i,1);save();after()})}
function printOne(wrap,btns){document.body.classList.add('printing');const card=btns.previousElementSibling;card.classList.add('printme');setTimeout(()=>{doPrint();setTimeout(()=>{card.classList.remove('printme');document.body.classList.remove('printing')},NATIVE?3000:0)},50)}
// weekly adjustments, override, payments
function editWeek(key,mode='pay'){const fid=key.split('|')[0],X=D.weeks[key]??={adj:[],pay:[]};X.adj??=[];X.pay??=[];const w=weekBill(fid,key);
 modal(`<h2>${mode==='pay'?'💵 Add Payment':'✏️ Adjust Bill'}</h2><p><b>${esc(w.period)}</b></p><p>This week's charges: <b>${sgn(w.charges)}</b> · Total due: <b>${sgn(w.totalDue)}</b></p>
 <div ${mode==='pay'?'hidden':''}><h3>Adjustments</h3>${X.adj.map((a,i)=>`<div class="row"><span style="flex:3">${esc(a.desc)}</span><b>${sgn(+a.amt)}</b><button class="btn ghost sm" data-da="${i}">✕</button></div>`).join('')||'<small>None</small>'}
 <label>Description</label><input id="a_desc" placeholder="Extra Saturday / Sibling discount"><div class="row"><div><label>Amount</label><input id="a_amt" type="number" step="0.01" inputmode="decimal" placeholder="30"></div><div><label>Type</label><select id="a_type"><option value="1">+ Extra charge</option><option value="-1">− Credit / discount</option></select></div></div>
 <button class="btn ghost" id="a_add">➕ Add adjustment</button>
 <h3>Override week total</h3><input id="o_val" type="number" step="0.01" inputmode="decimal" placeholder="Leave blank to use calculated (${money(w.sub)})" value="${X.override??''}"><button class="btn ghost" id="o_save">Set total</button></div>
 <div ${mode==='adj'?'hidden':''}><h3>Payments</h3>${X.pay.map((p,i)=>`<div class="row"><span style="flex:3">${fmtD(p.t)} ${esc(p.note||'')}</span><b>${money(+p.amt)}</b><button class="btn ghost sm" data-dp="${i}">✕</button></div>`).join('')||'<small>None yet</small>'}
 <div class="row"><div><label>Amount paid</label><input id="p_amt" type="number" step="0.01" inputmode="decimal" placeholder="${Math.max(0,w.balance).toFixed(2)}"></div><div><label>Date</label><input id="p_date" type="date" value="${dkey(Date.now())}"></div></div>
 <label>Note</label><input id="p_note" placeholder="Cash / Venmo / Paid extra"><button class="btn" id="p_add">💵 Record payment</button></div><br><button class="btn ghost" id="w_done">Done</button>`);
 const re=()=>{save();editWeek(key,mode);render()};
 $('#a_add').onclick=()=>{const amt=+$('#a_amt').value;if(!amt)return toast('Enter an amount');X.adj.push({desc:$('#a_desc').value.trim()||($('#a_type').value==='1'?'Extra charge':'Credit'),amt:Math.abs(amt)*+$('#a_type').value});re()};
 $('#o_save').onclick=()=>{const v=$('#o_val').value;X.override=v===''?null:+v;re()};
 $('#p_add').onclick=()=>{const amt=+$('#p_amt').value;if(!(amt>0))return toast('Enter a payment amount');X.pay.push({t:+new Date($('#p_date').value+'T12:00'),amt,note:$('#p_note').value.trim()});re()};
 $('#sheet').querySelectorAll('[data-da]').forEach(b=>b.onclick=()=>{if(!confirm('Delete this adjustment?'))return;X.adj.splice(+b.dataset.da,1);re()});$('#sheet').querySelectorAll('[data-dp]').forEach(b=>b.onclick=()=>{if(!confirm('Delete this payment? The balance and carry-over will be recalculated.'))return;X.pay.splice(+b.dataset.dp,1);re()});
 $('#w_done').onclick=()=>{$('#modal').hidden=true}}
async function showStorage(){const st=Store.status;await Store.persist();const el=$('#stinfo');if(!el)return;
 let ni={};try{ni=NATIVE?JSON.parse(NATIVE.dataInfo()):{}}catch(e){}el.innerHTML=(NATIVE?`<span class="pill">${st.file?'✅':'—'} Phone data file (+ .old copy)</span><span class="pill">🗂️ ${ni.appBackups||0} app backups</span><span class="pill">📁 ${esc(ni.documentsDir||'')}</span>`:'')+`<span class="pill">${NATIVE?'🔒 Installed app storage':st.persisted?'🔒 Protected from clearing':'⚠️ Browser may clear – install the app'}</span><span class="pill">${st.opfs?'✅':'—'} Data file</span><span class="pill">${st.idb?'✅':'—'} Database</span><span class="pill">${st.ls?'✅':'—'} Quick copy</span><br><small>Last saved: ${D._savedAt?new Date(D._savedAt).toLocaleString():'not yet'}</small>`;
 const bks=await Store.listBackups();$('#bklist').innerHTML=`<p><b>Auto-backups (last ${bks.length} of 5)</b></p>`+bks.map(b=>`<div class="row"><small style="flex:3">${new Date(b.id.slice(3)).toLocaleString()}</small><button class="btn ghost" data-rb="${b.id}">Restore</button></div>`).join('');
 $('#bklist').querySelectorAll('[data-rb]').forEach(btn=>btn.onclick=()=>{const b=bks.find(x=>x.id===btn.dataset.rb);if(confirm('Restore this backup? Current data will be replaced.')){D=Object.assign(structuredClone(DEF),JSON.parse(b.json));migrate();save();render();toast('Restored ✅')}})}
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
function countUp(){if(RM)return;V.querySelectorAll('.banner big,[data-total]').forEach(el=>{const txt=el.textContent,m=txt.match(/[\d.]+/);if(!m)return;const end=parseFloat(m[0]),dec=(m[0].split('.')[1]||'').length,t0=performance.now();
 const step=t=>{const k=Math.min(1,(t-t0)/600),e=1-Math.pow(1-k,3);el.textContent=txt.replace(m[0],(end*e).toFixed(dec));if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)})}
// tilt + lift on touch
addEventListener('pointerdown',e=>{if(RM)return;const c=e.target.closest('.kid,.card');if(!c)return;const r=c.getBoundingClientRect();
 c.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*8+'deg');c.style.setProperty('--rx',-((e.clientY-r.top)/r.height-.5)*8+'deg');c.classList.add('lift');
 const up=()=>{c.classList.remove('lift');c.style.removeProperty('--rx');c.style.removeProperty('--ry');removeEventListener('pointerup',up);removeEventListener('pointercancel',up)};addEventListener('pointerup',up);addEventListener('pointercancel',up)},{passive:true});
addEventListener('scroll',()=>document.body.style.setProperty('--sy',scrollY),{passive:true});
document.addEventListener('click',e=>{if(e.target.id!=='genst')return;const L=lastMonth(),n=genStatements(L.y,L.m);if(n){tab='bills';bview='month';bm=new Date(L.y,L.m,1);toast(`📄 ${n} statement${n>1?'s':''} saved`);render()}});
const toLocal=t=>{const d=new Date(t);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes())};
const fromLocal=v=>v?+new Date(v):null;
function editVisit(vid,dr){const v=D.visits.find(x=>x.id===vid);if(!v)return;v.loc??=[];const k=kid(v.kid);
 modal(`<h2>🕒 Edit visit</h2><p><b>${esc(k?.name||'?')}</b></p><label>Checked in</label><input id="v_in" type="datetime-local" value="${dr?dr.i:toLocal(v.in)}">
 <label>Checked out <small>(blank = still here)</small></label><input id="v_out" type="datetime-local" value="${dr?dr.o:(v.out?toLocal(v.out):'')}">
 <h3>School / home changes</h3>${v.loc.map((e,i)=>`<div class="row" data-li="${i}"><select data-lat="${i}"><option value="school" ${e.at==='school'?'selected':''}>🏫 To school</option><option value="home" ${e.at==='home'?'selected':''}>🏠 Back home</option></select><input type="datetime-local" data-lt="${i}" value="${toLocal(e.t)}"><button class="btn ghost sm" data-ldel="${i}">✕</button></div>`).join('')||'<small>None</small>'}
 <button class="btn ghost" id="v_addloc">➕ Add school/home change</button><button class="btn" id="v_save">💾 Save changes</button><br><button class="btn out" id="v_del">🗑️ Delete this visit</button>`);
 const collect=()=>{v.loc.forEach((e,i)=>{e.at=$(`[data-lat="${i}"]`).value;e.t=fromLocal($(`[data-lt="${i}"]`).value)||e.t})};
 const draft=()=>({i:$('#v_in').value,o:$('#v_out').value});$('#v_addloc').onclick=()=>{collect();const d=draft(),last=v.loc[v.loc.length-1],st=fromLocal(d.i)||v.in;v.loc.push({t:Math.max(last?last.t:st,st),at:last?.at==='school'?'home':'school'});editVisit(vid,d)};
 $('#sheet').querySelectorAll('[data-ldel]').forEach(b=>b.onclick=()=>{if(!confirm('Delete this school/home change?'))return;const d=draft();collect();v.loc.splice(+b.dataset.ldel,1);save();editVisit(vid,d);render()});
 $('#v_save').onclick=()=>{const i=fromLocal($('#v_in').value),o=fromLocal($('#v_out').value);if(!i)return toast('Check-in time needed');if(o&&o<=i)return toast('Check-out must be after check-in');
  if(!o&&D.visits.some(x=>x!==v&&x.kid===v.kid&&!x.out))return toast('This kid already has an open visit');collect();if(v.loc.some(e=>e.t<i||(o&&e.t>o)))return toast('School/home times must be inside the visit');
  v.in=i;v.out=o;v.loc.sort((a,b)=>a.t-b.t);save();$('#modal').hidden=true;render();toast('Visit updated ✅')};
 $('#v_del').onclick=()=>{if(!confirm(`Delete this visit for ${k?.name||'this kid'}? Bills and hours will be recalculated. Saved statements stay as they are until you regenerate them.`))return;
  const idx=D.visits.indexOf(v);D.visits.splice(idx,1);save();$('#modal').hidden=true;render();toast('Visit deleted','Undo',()=>{D.visits.splice(idx,0,v);save();render()})}}
// ---------- editors ----------
function modal(html){$('#sheet').innerHTML=html;$('#modal').hidden=false}
$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').hidden=true};
function editFam(id,after){const f=fam(id),today=dkey(monday(Date.now())),cur=id?pick(f.rates,today):null;modal(`<h2>${id?'Edit':'New'} family</h2><label>Family name</label><input id="fn" value="${esc(f.name)}" placeholder="Smith">
 <label>Parent name</label><input id="fp" value="${esc(f.parent)}"><label>Parent phone</label><input id="fph" type="tel" value="${esc(f.phone)}">
 <h3>Rate overrides <small>(blank = default)</small></h3>${rateForm(cur||{},true)}<label>📅 Schedule rate change – effective from</label><input id="r_from" type="date" value="${today}">
 ${id?rateHist(f.rates,'f'):''}
 <button class="btn" id="fs">Save</button>${id?'<br><button class="btn out" id="fd">Delete family</button>':''}`);
 if(id)bindHist(f.rates,'f',()=>editFam(id));
 $('#fs').onclick=()=>{const n=$('#fn').value.trim();if(!n)return toast('Name needed');const r=readRate(true);if(!r)return;const o=id?f:{id:uid(),rates:[]};o.rates??=[];
  Object.assign(o,{name:n,parent:$('#fp').value,phone:$('#fph').value});const from=$('#r_from').value||today,prev=pick(o.rates,from)||{};
  const changed=RKEYS.some(k=>(r[k]??null)!==(prev[k]??null));if(changed||window.__editFrom){r.from=from;o.rates=o.rates.filter(x=>x.from!==from&&x.from!==window.__editFrom).concat(r)}window.__editFrom=null;
  delete o.weekly;delete o.friday;delete o.perFamily;if(!id)D.families.push(o);save();$('#modal').hidden=true;after?after(o.id):render()};
 if(id)$('#fd').onclick=()=>{if(confirm(`Delete the ${f.name} family? This also deletes ${D.kids.filter(k=>k.family===id).length} kid(s), all their visits and this family's bills. Saved statements are kept.`)){const ks=D.kids.filter(k=>k.family===id).map(k=>k.id);D.kids=D.kids.filter(k=>k.family!==id);D.visits=D.visits.filter(v=>!ks.includes(v.kid));D.families=D.families.filter(x=>x.id!==id);Object.keys(D.weeks||{}).forEach(w=>{if(w.startsWith(id+'|'))delete D.weeks[w]});save();$('#modal').hidden=true;render()}}}
function editKid(id){if(!D.families.length)return editFam(null,()=>editKid());const k=kid(id)||{family:D.families[0].id};
 modal(`<h2>${id?'Edit':'New'} kid</h2><label>Name</label><input id="kn" value="${esc(k.name)}">
 <label>Family</label><select id="kf">${D.families.map(f=>`<option value="${f.id}" ${f.id===k.family?'selected':''}>${esc(f.name)}</option>`).join('')}</select>
 <label>Allergies / notes</label><textarea id="kno">${esc(k.notes)}</textarea><button class="btn" id="ks">Save</button>${id?'<br><button class="btn out" id="kd">Delete kid</button>':''}`);
 $('#ks').onclick=()=>{const n=$('#kn').value.trim();if(!n)return toast('Name needed');const o=id?k:{id:uid()};Object.assign(o,{name:n,family:$('#kf').value,notes:$('#kno').value});delete o.avatar;delete o.photo;if(!id)D.kids.push(o);save();$('#modal').hidden=true;render()};
 if(id)$('#kd').onclick=()=>{if(confirm(`Delete ${k.name} and all of ${k.name}'s visits? Bills and hours will be recalculated.`)){D.kids=D.kids.filter(x=>x.id!==id);D.visits=D.visits.filter(v=>v.kid!==id);save();$('#modal').hidden=true;render()}}}
// ---------- boot ----------
function invoiceView(){const m=location.hash.match(/^#invoice=(.+)$/);if(!m)return false;try{const b=b64d(m[1]);document.body.classList.add('readonly');document.querySelector('nav').style.display='none';$('#title').textContent=b.biz;
 V.innerHTML=invHtml(b)+`<button class="btn noprint" onclick="print()">🖨️ Print / Save PDF</button>`}catch(e){V.innerHTML='<div class="card">Invalid invoice link.</div>'}return true}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render()});
setInterval(()=>{$('#clock').textContent=new Date().toLocaleTimeString([],{hour:'numeric',minute:'2-digit'});document.querySelectorAll('.timer[data-start]').forEach(t=>{if(t.dataset.start){const d=dur(Date.now()-t.dataset.start);t.innerHTML=RM?d:d.slice(0,-1)+'<span class="tick">'+d.slice(-1)+'</span>'}})},1000);
addEventListener('hashchange',()=>{if(!invoiceView())location.reload()});
ready.then(()=>{if(!invoiceView())render()});
addEventListener('visibilitychange',()=>{if(document.hidden)save()});
if(!NATIVE&&'serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js');
window.__ls={D:()=>D,ssRows,famMax,unionMs,sitIv,schIv,editVisit,genStatements,lastMonth,setLoc,schoolMs,weekCalc,monthWeeks,weekBill,ledger,statement,rateAt,editWeek,invText,invLink,b64d,save:()=>save(),Store,ready,render};
