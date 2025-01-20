import { AdminLayout } from "./admin/layout/AdminLayout";
import { SystemSettings } from "./admin/super-admin/system-settings";

export default function SystemPage() {
  return (
    <AdminLayout requiredRole="super-admin">
      <SystemSettings />
    </AdminLayout>
  );
}
