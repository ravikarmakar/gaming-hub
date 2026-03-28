import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAccess } from "@/features/auth/hooks/use-access";
import { useAuthQuery } from "@/features/auth";
import { AUTH_ROUTES } from "@/features/auth/lib/routes";
import type { AccessRule } from "@/features/auth";

interface RoleGuardProps {
    access: AccessRule;
    redirectTo?: string;
}

const RoleGuard = ({ access, redirectTo = "/" }: RoleGuardProps) => {
    const { can } = useAccess();
    const { data: user, isLoading: checkingAuth } = useAuthQuery();
    const location = useLocation();

    if (checkingAuth) {
        return null; // Or a loading spinner if preferred, but usually handled by parent
    }

    if (!user) {
        return <Navigate to={AUTH_ROUTES.LOGIN} state={{ from: location }} replace />;
    }

    if (!can(access)) {
        return <Navigate to={redirectTo} replace />;
    }

    return <Outlet />;
};

export default RoleGuard;
