import { useSyncExternalStore } from "react";
import { seed } from "./seed.js";

const KEY = "agrofund.mock.db.v1";
const hasLS = typeof localStorage !== "undefined";
const load = () => { try { const raw = hasLS ? localStorage.getItem(KEY) : null; return raw ? JSON.parse(raw) : null; } catch { return null; } };

let state = load() ?? seed();
const subs = new Set();

export const getState = () => state;
export const subscribe = (cb) => { subs.add(cb); return () => subs.delete(cb); };
// fn receives the current state and returns the next one; throwing aborts the commit.
export const commit = (fn) => {
  state = fn(state);
  if (hasLS) localStorage.setItem(KEY, JSON.stringify(state));
  subs.forEach((s) => s());
};
export const resetDb = () => { state = seed(); if (hasLS) localStorage.removeItem(KEY); subs.forEach((s) => s()); };
// Selectors must return existing references (not freshly-built arrays); derive with useMemo in components.
export const useDb = (selector) => useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
