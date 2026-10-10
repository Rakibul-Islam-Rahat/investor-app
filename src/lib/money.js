// All money is stored as integer minor units (paisa) to avoid floating-point drift.
export const toMinor = (taka) => Math.round(Number(taka) * 100);
const nf = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
export const formatBDT = (minor) => `${minor < 0 ? "-" : ""}৳${nf.format(Math.abs(minor) / 100)}`;
export const sum = (arr, f = (x) => x) => arr.reduce((a, x) => a + f(x), 0);
