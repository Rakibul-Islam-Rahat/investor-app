import { ReviewQueue } from "./queue";
export default function Deposits() {
  return <ReviewQueue type="DEPOSIT" title="Payment approvals" description="Match each transaction ID against the bank / MFS statement before approving." />;
}
