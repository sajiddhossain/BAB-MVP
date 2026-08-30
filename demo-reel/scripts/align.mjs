#!/usr/bin/env node
/**
 * Cerca lo scostamento (dx,dy) che minimizza il diff.
 *
 * Serve a distinguere "e' tutto spostato" da "e' tutto sbagliato": se (0,0) non
 * e' l'ottimo, il problema e' un offset e non il contenuto. E' cosi' che ho
 * scoperto che su checkout-6 stavo contando due volte lo stesso 3px.
 *
 *   node scripts/align.mjs <id>     (richiede un diff gia' girato)
 */
import {readFileSync} from 'node:fs'
import {PNG} from 'pngjs'
import pixelmatch from 'pixelmatch'
const id=process.argv[2]
const L=f=>{const p=PNG.sync.read(readFileSync(`out/diff/${id}.${f}.png`));
for(let i=0;i<p.data.length;i+=4){const a=p.data[i+3]/255;if(a<1){for(let c=0;c<3;c++)p.data[i+c]=Math.round(p.data[i+c]*a+255*(1-a));p.data[i+3]=255}}return p}
const A=L('mine'),B=L('ref');const W=Math.min(A.width,B.width),H=Math.min(A.height,B.height)
const sc=(dx,dy)=>{const w=W-Math.abs(dx),h=H-Math.abs(dy)
const a=new PNG({width:w,height:h}),b=new PNG({width:w,height:h})
for(let y=0;y<h;y++)for(let x=0;x<w;x++){const sa=((y+Math.max(0,-dy))*A.width+x+Math.max(0,-dx))*4,sb=((y+Math.max(0,dy))*B.width+x+Math.max(0,dx))*4,d=(y*w+x)*4
for(let c=0;c<4;c++){a.data[d+c]=A.data[sa+c];b.data[d+c]=B.data[sb+c]}}
const o=new PNG({width:w,height:h});return pixelmatch(a.data,b.data,o.data,w,h,{threshold:.12,includeAA:false})/(w*h)*100}
const r=[];for(let dx=-3;dx<=3;dx++)for(let dy=-6;dy<=6;dy++)r.push([dx,dy,sc(dx,dy)])
r.sort((p,q)=>p[2]-q[2])
for(const x of r.slice(0,4))console.log(`dx=${x[0]} dy=${x[1]}  ${x[2].toFixed(2)}%`)
console.log('attuale (0,0):',r.find(v=>!v[0]&&!v[1])[2].toFixed(2)+'%')
