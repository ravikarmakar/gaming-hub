import { Route } from "react-router-dom";
import Dashboard from "@/pages/organiser/Dashboard";
import OrganizerLayout from "@/components/layouts/OrganiserLayout";
import { ROUTES } from "@/constants/routes";

const OrganizerRoutes = () => {
  return (
    <>
      <Route path={ROUTES.ORGANISER_DASHBOARD} element={<OrganizerLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<div className="text-white">Users</div>} />
        <Route path="events" element={<div>Events</div>} />
        <Route path="tournaments" element={<div>tournaments</div>} />
        <Route path="analytics" element={<div>analytics</div>} />
        <Route path="games" element={<div>games</div>} />
        <Route path="manage-staff" element={<div>manage-staff</div>} />
      </Route>
    </>
  );
};

export default OrganizerRoutes;
