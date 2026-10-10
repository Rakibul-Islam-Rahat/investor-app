import { MOCK_USERS } from "./users.js";
import { contractHash } from "../../lib/sha256.js";

const DAY = 864e5;
const ago = (d) => new Date(Date.now() - d * DAY).toISOString();
const T = (taka) => taka * 100;
const bank = (n) => ({ accName: n, accNum: "1234567890", bankName: "Sonali Bank" });

export function seed() {
  // eslint-disable-next-line no-unused-vars
  const base = MOCK_USERS.map(({ password, kycStatus, ...u }) => ({ ...u, phone: "01700000000", autoReinvest: false,
    kyc: { status: kycStatus ?? "NONE", nid: "1990123456789", tin: "" }, bank: bank(u.name)  }));
  const extra = [
    { id: "u5", name: "Sadia Akter", email: "sadia@agrofund.test", role: "INVESTOR", kyc: { status: "VERIFIED", nid: "1988765432100", tin: "" } },
    { id: "u6", name: "Tanvir Ahmed", email: "tanvir@agrofund.test", role: "INVESTOR", kyc: { status: "VERIFIED", nid: "1992345678901", tin: "" } },
    { id: "u7", name: "Mehedi Hasan", email: "mehedi@agrofund.test", role: "INVESTOR", kyc: { status: "PENDING", nid: "1995111222333", tin: "123456789012" } },
  ].map((u) => ({ phone: "01800000000", autoReinvest: false, bank: bank(u.name), ...u }));

  const P = (o) => ({ risk: "MEDIUM", protocols: ["Vet inspection every 14 days", "Quarterly third-party audit"], ...o });
  const projects = [
    P({ id: "p1", title: "Cattle Fattening — Batch #4", category: "CATTLE", location: "Rangpur Sadar", unitPrice: T(25000), totalUnits: 200, availableUnits: 0, cycleMonths: 6, roi: 18, status: "IN_PROGRESS", startDate: ago(150), harvestDate: ago(-30), risk: "MEDIUM",
      description: "Six-month fattening cycle for 80 Brahman-cross steers with scheduled vaccination and a balanced feed programme.", protocols: ["FMD & anthrax vaccination", "Weight check every 30 days", "Insured against mortality"] }),
    P({ id: "p2", title: "Katimon Mango Orchard — Phase 2", category: "ORCHARD", location: "Chapainawabganj", unitPrice: T(10000), totalUnits: 400, availableUnits: 140, cycleMonths: 10, roi: 24, status: "OPEN", startDate: ago(20), harvestDate: ago(-280), risk: "LOW",
      description: "Expansion of a mature Katimon orchard. Returns come from the seasonal harvest sold through contracted wholesalers.", protocols: ["Integrated pest management", "Drip irrigation", "Harvest sold under pre-agreed offtake"] }),
    P({ id: "p3", title: "Hybrid Maize — Boro Season", category: "CROP", location: "Dinajpur", unitPrice: T(5000), totalUnits: 800, availableUnits: 610, cycleMonths: 5, roi: 15, status: "OPEN", startDate: ago(10), harvestDate: ago(-140), risk: "HIGH",
      description: "Five-month hybrid maize cycle. Weather-sensitive, so risk is rated high with a correspondingly lower ROI target." }),
    P({ id: "p4", title: "Dairy Heifer Programme", category: "CATTLE", location: "Sirajganj", unitPrice: T(40000), totalUnits: 150, availableUnits: 150, cycleMonths: 12, roi: 20, status: "UPCOMING", startDate: ago(-30), harvestDate: ago(-395), risk: "MEDIUM",
      description: "Twelve-month heifer raising programme with milk-yield option on maturity." }),
    P({ id: "p5", title: "Cattle Fattening — Batch #3", category: "CATTLE", location: "Rangpur Sadar", unitPrice: T(25000), totalUnits: 100, availableUnits: 0, cycleMonths: 6, roi: 17, status: "LIQUIDATED", startDate: ago(260), harvestDate: ago(80), risk: "MEDIUM",
      description: "Completed batch. Sold and fully distributed to investors." }),
    P({ id: "p6", title: "Guava Orchard Pilot", category: "ORCHARD", location: "Pirojpur", unitPrice: T(8000), totalUnits: 250, availableUnits: 250, cycleMonths: 9, roi: 22, status: "DRAFT", startDate: ago(-60), harvestDate: ago(-330), risk: "LOW", description: "Draft campaign, not yet public." }),
  ];

  const mk = (id, investorId, projectId, units, createdAt, status = "ACTIVE", payout) => {
    const p = projects.find((x) => x.id === projectId);
    const inv = { id, investorId, projectId, units, amount: units * p.unitPrice, status, createdAt, payout };
    return { ...inv, contractHash: contractHash(inv) };
  };
  const investments = [
    mk("i1", "u1", "p1", 40, ago(150)), mk("i2", "u5", "p1", 90, ago(149)), mk("i3", "u6", "p1", 70, ago(148)),
    mk("i4", "u1", "p2", 60, ago(18)), mk("i5", "u5", "p2", 100, ago(17)), mk("i6", "u6", "p2", 100, ago(15)),
    mk("i7", "u1", "p3", 100, ago(9)), mk("i8", "u6", "p3", 90, ago(8)),
    mk("i9", "u1", "p5", 30, ago(260), "COMPLETED", T(792000)), mk("i10", "u5", "p5", 70, ago(259), "COMPLETED", T(1848000)),
  ];

  let n = 0;
  const tx = (userId, type, amount, date, o = {}) => ({ id: `t${++n}`, userId, type, amount, date, channel: null, trxId: null, status: "COMPLETED", ...o });
  const transactions = [
    tx("u1", "DEPOSIT", T(3500000), ago(270), { channel: "BANK", trxId: "BNK-88121" }),
    tx("u5", "DEPOSIT", T(6000000), ago(270), { channel: "BANK", trxId: "BNK-88122" }),
    tx("u6", "DEPOSIT", T(3500000), ago(160), { channel: "BKASH", trxId: "BK7Q2LM91" }),
    ...investments.map((i) => tx(i.investorId, "INVEST", -i.amount, i.createdAt, { ref: i.projectId })),
    tx("u1", "DIVIDEND", T(792000), ago(75), { ref: "p5" }),
    tx("u5", "DIVIDEND", T(1848000), ago(75), { ref: "p5" }),
    tx("u1", "DEPOSIT", T(50000), ago(1), { channel: "BKASH", trxId: "BK9X1AA42", status: "PENDING" }),
    tx("u5", "WITHDRAW", -T(200000), ago(2), { channel: "BANK", trxId: "Sonali Bank • 1234567890", status: "PENDING" }),
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  let l = 0;
  const log = (projectId, type, o) => ({ id: `l${++l}`, projectId, type, tag: null, value: null, unit: null, note: "", media: [], loggedBy: "u2", ...o });
  const weights = { "C-402": [285, 310, 338, 362, 391], "C-415": [270, 296, 321, 349, 374], "C-430": [292, 318, 341, 370, 399] };
  const fieldLogs = [
    ...Object.entries(weights).flatMap(([tag, ws]) => ws.map((v, i) => log("p1", "WEIGHT", { tag, value: v, unit: "kg", date: ago(150 - i * 30), media: i % 2 ? [{ caption: `Tag #${tag} weigh-in` }] : [] }))),
    ...[0, 1, 2, 3, 4].map((i) => log("p1", "FEED", { value: 9 + i * 0.6, unit: "kg/head/day", date: ago(150 - i * 30), note: "Green fodder + concentrate mix" })),
    log("p1", "HEALTH", { date: ago(120), note: "FMD vaccination completed for all 80 head." }),
    log("p1", "HEALTH", { date: ago(45), note: "Routine deworming. No illness reported.", media: [{ caption: "Vet inspection" }] }),
    log("p2", "STAGE", { value: null, note: "Flowering started across Block A and B.", date: ago(12), media: [{ caption: "Block A flowering" }] }),
    log("p2", "STAGE", { note: "Fruit set observed; irrigation schedule updated.", date: ago(4) }),
    log("p3", "STAGE", { note: "Sowing complete; germination at 94%.", date: ago(6), media: [{ caption: "Plot 3 germination" }] }),
  ];

  const notifications = [
    { id: "n1", userId: "u1", type: "PAYMENT", text: "Dividend of ৳7,92,000 credited from Cattle Fattening — Batch #3.", date: ago(75), read: true },
    { id: "n2", userId: "u1", type: "FIELD", text: "New field log posted: Katimon Mango Orchard — flowering started.", date: ago(12), read: false },
    { id: "n3", userId: "u1", type: "LOCKIN", text: "Cattle Fattening — Batch #4 reached full funding and is now in progress.", date: ago(147), read: true },
  ];
  const audit = [{ id: "a1", actorId: "u4", actorName: "Admin User", action: "PROJECT_CREATE", entity: "p2", detail: "Campaign created", date: ago(25) }];

  return { users: [...base, ...extra], projects, investments, transactions, fieldLogs, notifications, audit };
}
