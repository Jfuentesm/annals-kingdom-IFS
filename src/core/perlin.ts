import { lerp } from './math';
export function makePerlin(rng){
  const perm = new Uint8Array(512);
  const p = []; for(let i=0;i<256;i++) p.push(i);
  for(let i=255;i>0;i--){ const j=(rng()*(i+1))|0; const t=p[i]; p[i]=p[j]; p[j]=t; }
  for(let i=0;i<512;i++) perm[i]=p[i&255];
  const GX=[1,-1,0,0,0.7071,-0.7071,0.7071,-0.7071], GZ=[0,0,1,-1,0.7071,0.7071,-0.7071,-0.7071];
  function fade(t){ return t*t*t*(t*(t*6-15)+10); }
  function n2(x,y){
    const X=Math.floor(x), Y=Math.floor(y);
    const xf=x-X, yf=y-Y, xi=X&255, yi=Y&255;
    const aa=perm[perm[xi]+yi]&7, ba=perm[perm[xi+1]+yi]&7, ab=perm[perm[xi]+yi+1]&7, bb=perm[perm[xi+1]+yi+1]&7;
    const u=fade(xf), v=fade(yf);
    const n00=GX[aa]*xf+GZ[aa]*yf, n10=GX[ba]*(xf-1)+GZ[ba]*yf;
    const n01=GX[ab]*xf+GZ[ab]*(yf-1), n11=GX[bb]*(xf-1)+GZ[bb]*(yf-1);
    return lerp(lerp(n00,n10,u), lerp(n01,n11,u), v); // ~[-0.71,0.71]
  }
  function fbm(x,y,oct,lac,gain){
    lac=lac||2; gain=gain||0.5;
    let a=0, amp=1, f=1, norm=0;
    for(let i=0;i<oct;i++){ a += n2(x*f,y*f)*amp; norm+=amp; amp*=gain; f*=lac; }
    return a/norm*1.4; // ~[-1,1]
  }
  return {n2, fbm};
}