import { Route } from "react-router-dom";
import SuperAdminLayout from "@/components/layouts/SuperAdminLayout";
import DashboardPage from "@/pages/super-admin/DashboardPage";

const SuperAdminRoutes = () => (
  <>
    <Route path="/super-admin" element={<SuperAdminLayout />}>
      <Route index element={<DashboardPage />} />
      {/* <Route path="users" element={<ManageUsers />} /> */}
      {/* <Route path="tournaments" element={<ManageTournaments />} /> */}
    </Route>
  </>
);

export default SuperAdminRoutes;
