import { Suspense } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import LoadingSpinner from "@/components/LoadingSpinner";
import Dashboard from "@/pages/organiser/Dashboard";
import DashboardLayout from "@/components/layouts/DashboardLayout";

// const validRoles = [
//   "owner",
//   "user",
//   "admin",
//   "staff",
//   "moderator",
//   "maxAdmin",
//   "team",
// ];

const OrganizerRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route
          element={
            <DashboardLayout>
              <Outlet />
            </DashboardLayout>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/users"
            element={<div className="text-white">Users</div>}
          />
          <Route path="/events" element={<div>Events</div>} />
          <Route path="/tournaments" element={<div>tournaments</div>} />
          <Route path="/analytics" element={<div>analytics</div>} />
          <Route path="/games" element={<div>games</div>} />
          <Route path="/manage-staff" element={<div>manage-staff</div>} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default OrganizerRoutes;

{
  /* <Route
path="/dashboard/users"
element={
  <ProtectedRoute requiredRoles={["admin", "owner", "moderator"]}>
    <ManageUsers />
  </ProtectedRoute>
}
/> */
}
