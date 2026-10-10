import { ReviewQueue } from "./queue";
export default function Payouts() {
  return <ReviewQueue type="WITHDRAW" title="Withdrawal queue" description="Approve after the funds have been dispatched to the investor." />;
}
