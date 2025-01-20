import { AdminLayout } from "./layout/AdminLayout";
import { AdminManagement } from "./super-admin/admin-management";

export default function ManageAdminsPage() {
  return (
    <AdminLayout requiredRole="super-admin">
      <AdminManagement />
    </AdminLayout>
  );
}
