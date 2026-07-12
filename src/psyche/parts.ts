// @ts-nocheck
// IFS parts engine — burden genesis (step 1: data only, determinism-safe).
// All randomness draws from W.rng.psy ONLY, in stable order, so worlds replay
// identically at any sim speed. See ifs-kingdom-specs/parts-engine-design.md.
import { W } from '../state';
import { clamp } from '../core/math';

let BURDEN_ID = 1, PART_ID = 1;
export function resetPsycheIds(){ BURDEN_ID = 1; PART_ID = 1; }

// psyche struct attached to every notable (drawn from the psy stream; sole psy draw per notable).
export function newPsyche(){
  return {
    selfEnergy: W.rng && W.rng.psy ? (0.45 + W.rng.psy() * 0.4) : 0.7,
    blend: null,
    parts: [],
    burdenLoad: 0,
    lod: 'abstract',
    anniversaries: []
  };
}

// Burden potential by chronicle class. Grief/terror/betrayal-ish events high; flavor/harvest low/zero.
const BURDEN_POTENTIAL = { crown:0.5, war:0.6, fate:0.35, myth:0.2, reign:0.3 };
// Burden kind + exile archetype vocab (spec §1.2/§1.3) — deterministic maps, no RNG.
const BURDEN_KIND_BY_CLS = { crown:'grief', war:'terror', fate:'grief', myth:'terror', reign:'grief' };
const EXILE_ARCHETYPE = { grief:'the Left-Behind', shame:'the Unforgiven', terror:'the Small One',
  betrayal:'the Unforgiven', unworthiness:'the Left-Behind' };
function makeBurden(originEventId, kind, intensity){
  const b = { id: BURDEN_ID++, originEvent: originEventId, kind, intensity, legacy:false,
    lineage:[], witnessed:false, unburdened:false, element:null };
  W.burdens.push(b);
  return b;
}
function makePart(owner, role, archetype, burdenId, dayFormed){
  const p = { id: PART_ID++, ownerId: owner.id, role, archetype, burden: burdenId,
    protects:[], trust:0, activation:0, job:{},
    yearFormed: Math.floor(dayFormed/360)+1, formSeed: W.rng.psy(), state:'HIDDEN' };
  owner.psyche.parts.push(p);
  return p;
}
// Kin with high selfEnergy in the same settlement buffer trauma (spec §3.1).
// Minimal: same house (house>=0) is an approximation of kin; no RNG here.
function supportNearby(nb){
  if(nb.house < 0) return 0;            // crown (-1) and court (-2) have no house-kin pool here
  let sum = 0, n = 0;
  for(const k of W.notables){
    if(k === nb || !k.alive || k.house !== nb.house) continue;
    if(k.psyche && k.psyche.selfEnergy > 0.6){ sum += k.psyche.selfEnergy; n++; }
  }
  if(!n) return 0;
  return clamp(sum/n, 0, 0.6);          // capped so support never fully blocks genesis
}
function burdenKindFor(event, nb){ return BURDEN_KIND_BY_CLS[event.cls] || 'grief'; }
function exileArchetypeFor(kind){ return EXILE_ARCHETYPE[kind] || 'the Left-Behind'; }
// Genesis hook: for each living affected notable, consume exactly one `psy` roll (stable order),
// so stream position is identical across sim speeds. On success an exile + burden citing the event forms.
export function burdenGenesis(event, affected){
  if(!event || !affected || !affected.length) return;
  for(let i=0;i<affected.length;i++){
    const nb = affected[i];
    if(!nb || !nb.alive || !nb.psyche) continue;
    const pot = BURDEN_POTENTIAL[event.cls] || 0;
    if(pot <= 0) continue;               // class carries no trauma weight → no roll, no draw
    const support = supportNearby(nb);
    const p = pot * (1 - nb.psyche.selfEnergy) * (1 - support);
    if(W.rng.psy() < p){                 // the one psy draw per pot>0 affected notable
      const kind = burdenKindFor(event, nb);
      const b = makeBurden(event.id, kind, pot);
      makePart(nb, 'exile', exileArchetypeFor(kind), b.id, event.day);
    }
  }
}
export function findBurdenOwner(burdenId){
  for(const n of W.notables){
    if(n.psyche && n.psyche.parts){
      for(const p of n.psyche.parts){ if(p.burden === burdenId) return n.id; }
    }
  }
  return -1;
}