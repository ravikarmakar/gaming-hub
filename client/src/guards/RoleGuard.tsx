import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAccess } from "@/features/auth/hooks/useAccess";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import type { AccessRule } from "@/features/auth/lib/types";

interface RoleGuardProps {
    access: AccessRule;
    redirectTo?: string;
}

const RoleGuard = ({ access, redirectTo = "/" }: RoleGuardProps) => {
    const { can } = useAccess();
    const { user, checkingAuth } = useAuthStore();
    const location = useLocation();

    if (checkingAuth) {
        return null; // Or a loading spinner if preferred, but usually handled by parent
    }

    if (!user) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    if (!can(access)) {
        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
};

export default RoleGuard;
