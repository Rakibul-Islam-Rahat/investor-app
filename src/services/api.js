// Domain API. In mock mode it mutates the in-browser store; when the real backend exists, replace
// each function body with an http call (the signatures are the contract the UI depends on).
import { commit, getState } from "./mock/store.js";
import { availableOf } from "./ledger.js";
import { contractHash } from "../lib/sha256.js";
import { sum } from "../lib/money.js";

const now = () => new Date().toISOString();
const uid = (p) => `${p}${Math.random().toString(36).slice(2, 8)}`;
const actorOf = (s, id) => s.users.find((u) => u.id === id);
const withAudit = (s, actorId, action, entity, detail) => ({
  ...s, audit: [{ id: uid("a"), actorId, actorName: actorOf(s, actorId)?.name ?? "System", action, entity, detail, date: now() }, ...s.audit],
});
const withNote = (s, userId, type, text) => ({ ...s, notifications: [{ id: uid("n"), userId, type, text, date: now(), read: false }, ...s.notifications] });
const patch = (arr, id, f) => arr.map((x) => (x.id === id ? { ...x, ...f(x) } : x));

function investInto(s, userId, projectId, units) {
  const p = s.projects.find((x) => x.id === projectId);
  const user = actorOf(s, userId);
  if (!p || p.status !== "OPEN") throw new Error("This project is not open for investment");
  if (!Number.isInteger(units) || units < 1) throw new Error("Enter a valid number of units");
  if (units > p.availableUnits) throw new Error(`Only ${p.availableUnits} units are available`);
  if (user.kyc.status !== "VERIFIED") throw new Error("Complete KYC verification before investing");
  const amount = units * p.unitPrice;
  if (availableOf(s.transactions, userId) < amount) throw new Error("Insufficient wallet balance");
  const base = { id: uid("inv"), investorId: userId, projectId, units, amount, status: "ACTIVE", createdAt: now() };
  const inv = { ...base, contractHash: contractHash(base) };
  const left = p.availableUnits - units;
  let next = {
    ...s,
    investments: [inv, ...s.investments],
    transactions: [...s.transactions, { id: uid("t"), userId, type: "INVEST", amount: -amount, date: inv.createdAt, channel: null, trxId: null, status: "COMPLETED", ref: projectId }],
    projects: patch(s.projects, projectId, () => ({ availableUnits: left, status: left === 0 ? "FUNDED" : p.status })),
  };
  next = withNote(next, userId, "PAYMENT", `Investment confirmed: ${units} unit(s) in ${p.title}. Your contract is ready.`);
  if (left === 0) next = withNote(next, userId, "LOCKIN", `${p.title} reached full funding.`);
  return withAudit(next, userId, "INVEST", projectId, `${units} units`);
}

export const api = {
  invest: async (userId, projectId, units) => commit((s) => investInto(s, userId, projectId, units)),

  requestDeposit: async (userId, { amount, channel, trxId }) => commit((s) => {
    if (amount <= 0) throw new Error("Enter a valid amount");
    if (!trxId?.trim()) throw new Error("Transaction ID is required");
    if (s.transactions.some((t) => t.trxId === trxId.trim())) throw new Error("This transaction ID was already submitted");
    return { ...s, transactions: [...s.transactions, { id: uid("t"), userId, type: "DEPOSIT", amount, date: now(), channel, trxId: trxId.trim(), status: "PENDING" }] };
  }),

  requestWithdraw: async (userId, { amount, channel, account }) => commit((s) => {
    if (amount <= 0) throw new Error("Enter a valid amount");
    if (!account?.trim()) throw new Error("Destination account is required");
    if (amount > availableOf(s.transactions, userId)) throw new Error("Amount exceeds your available balance");
    return { ...s, transactions: [...s.transactions, { id: uid("t"), userId, type: "WITHDRAW", amount: -amount, date: now(), channel, trxId: account.trim(), status: "PENDING" }] };
  }),

  reviewTx: async (actorId, txId, approve) => commit((s) => {
    const t = s.transactions.find((x) => x.id === txId);
    if (!t || t.status !== "PENDING") throw new Error("Transaction is not pending");
    let next = { ...s, transactions: patch(s.transactions, txId, () => ({ status: approve ? "COMPLETED" : "REJECTED", reviewedBy: actorId })) };
    const label = t.type === "DEPOSIT" ? "Deposit" : "Withdrawal";
    next = withNote(next, t.userId, "PAYMENT", `${label} of ${Math.abs(t.amount) / 100} BDT was ${approve ? "approved" : "rejected"}.`);
    return withAudit(next, actorId, approve ? "TX_APPROVE" : "TX_REJECT", txId, `${t.type} ${t.amount}`);
  }),

  submitKyc: async (userId, { nid, tin }) => commit((s) => {
    if (!/^\d{10,17}$/.test(nid)) throw new Error("NID must be 10–17 digits");
    return { ...s, users: patch(s.users, userId, (u) => ({ kyc: { ...u.kyc, nid, tin, status: "PENDING" } })) };
  }),
  reviewKyc: async (actorId, userId, approve) => commit((s) => {
    let next = { ...s, users: patch(s.users, userId, (u) => ({ kyc: { ...u.kyc, status: approve ? "VERIFIED" : "REJECTED" } })) };
    next = withNote(next, userId, "KYC", `Your identity verification was ${approve ? "approved" : "rejected. Please resubmit."}`);
    return withAudit(next, actorId, approve ? "KYC_APPROVE" : "KYC_REJECT", userId, "");
  }),
  updateProfile: async (userId, fields) => commit((s) => ({ ...s, users: patch(s.users, userId, (u) => ({ ...fields, bank: { ...u.bank, ...fields.bank } })) })),

  createProject: async (actorId, data) => commit((s) => {
    const p = { id: uid("p"), ...data, availableUnits: data.totalUnits, status: "DRAFT", protocols: ["Standard care protocol"] };
    return withAudit({ ...s, projects: [p, ...s.projects] }, actorId, "PROJECT_CREATE", p.id, p.title);
  }),
  setProjectStatus: async (actorId, projectId, status) => commit((s) =>
    withAudit({ ...s, projects: patch(s.projects, projectId, () => ({ status })) }, actorId, "PROJECT_STATUS", projectId, status)),

  addFieldLog: async (actorId, { projectId, type, tag, value, unit, note, media, notifyInvestors }) => commit((s) => {
    if (!projectId) throw new Error("Select a project");
    const log = { id: uid("l"), projectId, type, tag: tag || null, value: value === "" ? null : Number(value), unit: unit || null, note, media, date: now(), loggedBy: actorId };
    let next = { ...s, fieldLogs: [...s.fieldLogs, log] };
    if (notifyInvestors) {
      const title = s.projects.find((p) => p.id === projectId)?.title;
      const holders = [...new Set(s.investments.filter((i) => i.projectId === projectId).map((i) => i.investorId))];
      holders.forEach((h) => { next = withNote(next, h, "FIELD", `New field log posted for ${title}.`); });
    }
    return withAudit(next, actorId, "FIELD_LOG", projectId, type);
  }),

  setRole: async (actorId, userId, role) => commit((s) => {
    if (userId === actorId) throw new Error("You cannot change your own role");
    return withAudit({ ...s, users: patch(s.users, userId, () => ({ role })) }, actorId, "ROLE_CHANGE", userId, role);
  }),
  markRead: async (userId) => commit((s) => ({ ...s, notifications: s.notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n)) })),

  allocate: async (actorId, input) => commit((s) => {
    const prev = previewAllocation(s, input);
    if (prev.net < 0) throw new Error("Costs and commission exceed gross revenue");
    const p = s.projects.find((x) => x.id === input.projectId);
    if (p.status !== "IN_PROGRESS") throw new Error("Only projects in progress can be liquidated");
    let next = { ...s, projects: patch(s.projects, p.id, () => ({ status: "LIQUIDATED" })) };
    for (const r of prev.rows) {
      next = {
        ...next,
        investments: patch(next.investments, r.inv.id, () => ({ status: "COMPLETED", payout: r.payout })),
        transactions: [...next.transactions, { id: uid("t"), userId: r.inv.investorId, type: "DIVIDEND", amount: r.payout, date: now(), channel: null, trxId: null, status: "COMPLETED", ref: p.id }],
      };
      next = withNote(next, r.inv.investorId, "PAYMENT", `Dividend credited from ${p.title}.`);
    }
    next = withAudit(next, actorId, "ALLOCATE", p.id, `gross ${input.gross}, costs ${input.costs}, commission ${prev.commission}`);
    // Optional auto-reinvest of each investor's payout into the first open project
    for (const u of next.users.filter((x) => x.autoReinvest)) {
      const mine = sum(prev.rows.filter((r) => r.inv.investorId === u.id), (r) => r.payout);
      const target = next.projects.find((x) => x.status === "OPEN" && x.availableUnits > 0);
      const units = target ? Math.min(Math.floor(mine / target.unitPrice), target.availableUnits) : 0;
      if (units >= 1) { try { next = investInto(next, u.id, target.id, units); } catch { /* skip if ineligible */ } }
    }
    return next;
  }),
};

// Pure calculation: investor payout = units / totalUnits × (gross − costs − commission).
// Gross revenue already contains principal, so principal is NOT added again (see README).
export function previewAllocation(s, { projectId, gross, costs, commissionPct }) {
  const invs = s.investments.filter((i) => i.projectId === projectId && i.status === "ACTIVE");
  const totalUnits = sum(invs, (i) => i.units);
  const commission = Math.round((gross * commissionPct) / 100);
  const net = gross - costs - commission;
  const rows = invs.map((inv) => ({ inv, payout: totalUnits ? Math.floor((net * inv.units) / totalUnits) : 0 }));
  if (rows.length && net > 0) rows[0].payout += net - sum(rows, (r) => r.payout); // rounding remainder, so payouts sum exactly to net
  return { totalUnits, commission, net, rows, invested: sum(invs, (i) => i.amount) };
}
export const preview = (input) => previewAllocation(getState(), input);
