import { chromium } from 'playwright-core'
const S='/private/tmp/claude-501/-Users-sajid-Documents-BAB-MVP/88cb53ec-18f4-432f-b3de-ae1980054c09/scratchpad'
const clip=process.argv[2]||'checkin'
const times=process.argv.slice(3).map(Number)
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
const p=await b.newPage({viewport:{width:480,height:952},deviceScaleFactor:1})
const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push('PAGEERROR '+e.message))
await p.goto(`http://localhost:5199/?clip=${clip}&capture=1`,{waitUntil:'networkidle'})
await p.waitForFunction(()=>window.__ready===true,null,{timeout:20000})
console.log('duration',await p.evaluate(()=>window.__duration))
for(const t of times){await p.evaluate(ms=>window.__seek(ms),t);await p.screenshot({path:`${S}/chk_${clip}_${t}.png`})}
console.log('errors:',errs.slice(0,10))
await b.close()
