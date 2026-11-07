// 모든 점프를 시뮬레이션해서 바닥부터 탈출 발판까지 갈 수 있는지 확인: node tools/sim.js
const W=180,WH=4320,FLOOR=WH-20,PW=11,PH=9,GRAV=0.27,MAXC=38;
const src=require('fs').readFileSync(__dirname+'/../index.html','utf8');
const lv=src.slice(src.indexOf('const ZL={'),src.indexOf('updateSwings(0,true);')+'updateSwings(0,true);'.length);
eval(lv+';global.PL=PL;global.SWINGS=SWINGS;global.updateSwings=updateSwings;');
function hit(ax,ay,aw,ah){for(const p of PL){if(p.y>ay+ah+2||p.y+p.h<ay-2)continue;for(const s of[-W,0,W]){const px=p.x+s;if(ax<px+p.w&&ax+aw>px&&ay<p.y+p.h&&ay+ah>p.y)return{p,px};}}return null;}
function setT(t){updateSwings(t-1,true);updateSwings(t);}
function sim(x,y,vx,vy,t0){let T=t0;setT(T);let air=true,gvx=0,gp=null;
  for(let f=0;f<420;f++){T++;updateSwings(T);
    if(!air){if(gp.tag==='moss'){gvx*=0.955;const nx=x+gvx;if(hit(nx,y,PW,PH))gvx=-gvx*0.3;else x=((nx%W)+W)%W;if(!hit(x,y+PH,PW,1)){air=true;vx=gvx;vy=0;continue;}if(Math.abs(gvx)<0.03)return gp;continue;}return gp;}
    const gm=Math.abs(vy)<1?0.5:(vy>0?1.25:1);vy=Math.min(6.8,vy+GRAV*gm);x+=vx;let h=hit(x,y,PW,PH);if(h){x=vx>0?h.px-PW-0.01:h.px+h.p.w+0.01;vx=-vx*0.55;}x=((x%W)+W)%W;y+=vy;h=hit(x,y,PW,PH);
    if(h){if(vy>0){y=h.p.y-PH;if(h.p.sw)return h.p;if(h.p.tag==='moss'){air=false;gp=h.p;gvx=vx*0.55;continue;}return h.p;}y=h.p.y+h.p.h;vy=0.4;}}
  return null;}
const idx=p=>PL.indexOf(p);const seen=new Set([0]),q=[0];
const near=p=>SWINGS.some(s=>Math.abs(s.sw.ay+s.sw.len-p.y)<180);
while(q.length){const i=q.shift(),p=PL[i];
  const times=p.sw?[...Array(36)].map((_,k)=>k*12):(near(p)?[...Array(28)].map((_,k)=>k*15):[0]);
  const cs=times.length>1?[...Array(19)].map((_,k)=>2+k*2):[...Array(MAXC)].map((_,k)=>k+1);
  for(const t of times){setT(t);const bx=p.x,by=p.y,dcx=p.dcx||0,dcy=p.dcy||0;
    for(let rel=-PW+2;rel<p.w-1;rel+=(times.length>1?3:1)){const xs=((bx+rel)%W+W)%W;
      for(const d of[-1,0,1])for(const c of cs){const tt=Math.min(1,c/MAXC);const r=sim(xs,by-PH,d*2.05+dcx,-(2.1+5.3*tt)+Math.min(0,dcy),t);
        if(r){const j=idx(r);if(!seen.has(j)){seen.add(j);q.push(j);}}}}}}
const exit=PL.findIndex(p=>p.tag==='exit');
console.log('reachable',seen.size,'/',PL.length,'exit',seen.has(exit));
console.log('unreached',PL.map((p,i)=>seen.has(i)?null:i+':'+(p.sw?'swing@'+p.sw.ax+','+p.sw.ay:p.x+','+p.y)).filter(Boolean).join(' '));
