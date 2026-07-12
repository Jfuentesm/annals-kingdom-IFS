export const clamp = (x,a,b)=> x<a?a:(x>b?b:x);
export const clamp01 = x=> x<0?0:(x>1?1:x);
export const lerp = (a,b,t)=> a+(b-a)*t;
export const smooth = t=>{ t=clamp01(t); return t*t*(3-2*t); };
export const dist2d = (ax,az,bx,bz)=> Math.hypot(ax-bx, az-bz);
export function lerpHex(h1,h2,t,out){ // hex ints -> {r,g,b} 0..1
  const r1=(h1>>16&255)/255, g1=(h1>>8&255)/255, b1=(h1&255)/255;
  const r2=(h2>>16&255)/255, g2=(h2>>8&255)/255, b2=(h2&255)/255;
  out.r=lerp(r1,r2,t); out.g=lerp(g1,g2,t); out.b=lerp(b1,b2,t); return out;
}
export function hexRGB(h){ return [ (h>>16&255)/255, (h>>8&255)/255, (h&255)/255 ]; }
export function ord(n){ const s=['th','st','nd','rd'], v=n%100; return n + (s[(v-20)%10] || s[v] || s[0]); }