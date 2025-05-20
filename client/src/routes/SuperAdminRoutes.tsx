import { Route } from "react-router-dom";
import SuperAdminLayout from "@/components/layouts/SuperAdminLayout";
import DashboardPage from "@/pages/super-admin/DashboardPage";
import { ROUTES } from "@/constants/routes";

const SuperAdminRoutes = () => (
  <>
    <Route path={ROUTES.SUPER_ADMIN_DASHBOARD} element={<SuperAdminLayout />}>
      <Route index element={<DashboardPage />} />
      {/* <Route path="users" element={<ManageUsers />} /> */}
      {/* <Route path="tournaments" element={<ManageTournaments />} /> */}
    </Route>
  </>
);

export default SuperAdminRoutes;
