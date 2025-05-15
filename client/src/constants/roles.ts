// roles.ts
export const ROLES = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
};

export const permissions = {
  user: ["viewer"],
  admin: ["viewer", "write"],
  super_admin: ["viewer", "write", "delete"],
};

//------------------->

// accessUtils.ts
// import { permissions } from '../auth/permissions';

// export const hasPermission = (role: string, action: string): boolean => {
//   return permissions[role]?.includes(action);
// };

//------------------->

//  RoleContext.tsx
// import { createContext, useContext } from 'react';

// const RoleContext = createContext({ role: 'user' });

// export const useRole = () => useContext(RoleContext);

// export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
//   const userRole = 'editor'; // you get this from JWT/token/backend

//   return (
//     <RoleContext.Provider value={{ role: userRole }}>
//       {children}
//     </RoleContext.Provider>
//   );
// };

// ---------------------------->

// import { Navigate } from 'react-router-dom';
// import { useRole } from '../auth/RoleContext';
// import { hasPermission } from '../utils/accessUtils';

// const ProtectedRoute = ({
//   action,
//   children,
// }: {
//   action: string;
//   children: JSX.Element;
// }) => {
//   const { role } = useRole();

//   if (!hasPermission(role, action)) {
//     return <Navigate to="/unauthorized" />;
//   }

//   return children;
// };

// export default ProtectedRoute;

// ----------------------->

// <Route
//   path="/dashboard"
//   element={
//     <ProtectedRoute action="write">
//       <Dashboard />
//     </ProtectedRoute>
//   }
// />

// --------------------->

// const { role } = useRole();

// {hasPermission(role, 'delete') && (
//   <button>Delete Post</button>
// )}
