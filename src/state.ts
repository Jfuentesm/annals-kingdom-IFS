// @ts-nocheck
// Shared mutable game state. `W` is the single world-state object, rebuilt each
// forgeWorld() call. It is an ES-module live binding: reassigning it via setW()
// is visible to every importer immediately, so other modules read `W.*` freely
// and only forgeWorld reassigns the whole object.
export let W = null;
export function setW(w) { W = w; }
