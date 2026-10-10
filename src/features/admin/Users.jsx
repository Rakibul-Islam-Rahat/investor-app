import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import { SelectInput } from "@/components/common/form";
import { useAuth } from "@/features/auth/AuthContext";
import { useAction } from "@/hooks/useAction";
import { useDb } from "@/services/mock/store";
import { api } from "@/services/api";
import { ROLES } from "@/config/roles";

function RoleSelect({ u }) {
  const { user } = useAuth();
  const [run] = useAction((role) => api.setRole(user.id, u.id, role), "Role updated");
  return <SelectInput aria-label={`Role for ${u.name}`} disabled={u.id === user.id} value={u.role} onChange={(e) => run(e.target.value)} options={Object.values(ROLES)} />;
}
export default function Users() {
  const users = useDb((s) => s.users);
  return (
    <>
      <PageHeader title="Users & roles" description="Role changes are recorded in the audit log." />
      <DataTable rows={users} columns={[
        { key: "n", header: "Name", render: (u) => <b>{u.name}</b> }, { key: "e", header: "Email" }, { key: "p", header: "Phone" },
        { key: "r", header: "Role", className: "w-48", render: (u) => <RoleSelect u={u} /> },
      ]} />
    </>
  );
}
