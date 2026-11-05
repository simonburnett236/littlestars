const {chromium}=require('/usr/local/lib/pnpm/5/.pnpm/playwright@1.63.0-alpha-2026-08-31/node_modules/playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/usr/bin/google-chrome'});
  const c=await b.newContext({viewport:{width:432,height:960},deviceScaleFactor:2.5});
  const p=await c.newPage();
  const n={0:'0-today-problem',1:'1-not-due-yet',2:'2-past-due',3:'3-split-past-and-coming'};
  const out='/workspace/babysit-app/mockups/pastdue/';
  for(const k in n){
    await p.goto('file://'+__dirname+'/'+k+'.html');
    await p.waitForTimeout(400);
    await p.screenshot({path:out+n[k]+'.png',fullPage:true});
  }
  await b.close();
})();
