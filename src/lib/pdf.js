import { formatBDT } from "./money";
import { fmtDate, fmtDateTime } from "./format";
import { contractHash, sha256 } from "./sha256";

async function newDoc(title) {
  const { jsPDF } = await import("jspdf"); // lazy: keeps the initial bundle small
  const d = new jsPDF();
  d.setFontSize(18).text("AgroFund", 14, 18);
  d.setFontSize(11).setTextColor(90).text(title, 14, 26);
  d.setDrawColor(200).line(14, 30, 196, 30).setTextColor(0);
  return d;
}
const rows = (d, items, y = 42) => items.forEach(([k, v], i) => { d.setFontSize(10).setFont(undefined, "bold").text(k, 14, y + i * 8); d.setFont(undefined, "normal").text(String(v), 70, y + i * 8); });
const mask = (nid = "") => `${"•".repeat(Math.max(0, nid.length - 4))}${nid.slice(-4)}`;
// BDT only: the default PDF fonts lack the ৳ glyph.
const money = (m) => formatBDT(m).replace("৳", "BDT ");

export async function downloadContract({ inv, project, user }) {
  const d = await newDoc("Digital Investment Deed");
  rows(d, [
    ["Contract ID", inv.id], ["Investor", user.name], ["NID", mask(user.kyc.nid)], ["Project", project.title],
    ["Location", project.location], ["Units purchased", inv.units], ["Unit price", money(project.unitPrice)],
    ["Total invested", money(inv.amount)], ["Expected ROI", `${project.roi}% over ${project.cycleMonths} months`],
    ["Signed at", fmtDateTime(inv.createdAt)],
  ]);
  d.setFontSize(9).text(d.splitTextToSize("The investor acquires the stated units in the project above. Profit is distributed pro-rata to units held after deduction of operating costs and platform commission. Returns are projections, not guarantees; agricultural projects carry production, price and weather risk.", 180), 14, 130);
  d.setFont("courier").setFontSize(8).text(`SHA-256: ${contractHash(inv)}`, 14, 160);
  d.save(`contract-${inv.id}.pdf`);
}

export async function downloadReceipt({ tx, user }) {
  const d = await newDoc(tx.type === "DEPOSIT" ? "Deposit Receipt" : "Transaction Receipt");
  rows(d, [["Reference", tx.id], ["Account holder", user.name], ["Type", tx.type], ["Amount", money(Math.abs(tx.amount))],
    ["Channel", tx.channel ?? "-"], ["Transaction ID", tx.trxId ?? "-"], ["Status", tx.status], ["Date", fmtDateTime(tx.date)]]);
  d.save(`receipt-${tx.id}.pdf`);
}

export async function downloadTaxStatement({ user, year, dividends, invested }) {
  const d = await newDoc(`Annual Dividend & Investment Statement — ${year}`);
  const body = dividends.map((t) => `${fmtDate(t.date)}   ${money(t.amount)}`);
  rows(d, [["Investor", user.name], ["NID", mask(user.kyc.nid)], ["TIN", user.kyc.tin || "Not provided"], ["Total invested in year", money(invested)], ["Total dividends in year", money(dividends.reduce((a, t) => a + t.amount, 0))]]);
  d.setFontSize(10).text("Dividend credits", 14, 96); d.setFontSize(9).text(body.length ? body : ["None"], 14, 104);
  d.setFontSize(8).setTextColor(120).text(`Document digest: ${sha256(`${user.id}|${year}|${body.join(",")}`).slice(0, 32)}`, 14, 280);
  d.save(`statement-${year}.pdf`);
}
