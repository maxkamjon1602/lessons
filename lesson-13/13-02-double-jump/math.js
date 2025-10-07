// math.js - lesson 13 step 1

// Minimal helpers kept local per-step (no shared core)
export const clamp = (v, lo, hi)=>Math.max(lo, Math.min(hi, v));
export const sign = (v)=> (v<0?-1:(v>0?1:0));
