import { useMemo } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { useDb } from "@/services/mock/store";
import { availableOf, balanceOf } from "@/services/ledger";

// One place that derives an investor's portfolio from the store.
export function usePortfolio() {
  const { user: authUser } = useAuth();
  const users = useDb((s) => s.users);
  const projects = useDb((s) => s.projects);
  const investments = useDb((s) => s.investments);
  const txs = useDb((s) => s.transactions);
  return useMemo(() => {
    const user = users.find((u) => u.id === authUser.id);
    const projectOf = (id) => projects.find((p) => p.id === id);
    const mine = investments.filter((i) => i.investorId === user.id).map((i) => ({ ...i, project: projectOf(i.projectId) }));
    const myTx = txs.filter((t) => t.userId === user.id);
    const active = mine.filter((i) => i.status === "ACTIVE");
    return {
      user, projects, mine, myTx, projectOf,
      balance: balanceOf(txs, user.id), available: availableOf(txs, user.id),
      invested: active.reduce((a, i) => a + i.amount, 0),
      units: active.reduce((a, i) => a + i.units, 0),
      expected: active.reduce((a, i) => a + i.amount * (1 + i.project.roi / 100), 0),
      dividends: myTx.filter((t) => t.type === "DIVIDEND" && t.status === "COMPLETED").reduce((a, t) => a + t.amount, 0),
    };
  }, [authUser.id, users, projects, investments, txs]);
}
