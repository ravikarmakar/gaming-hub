import React from "react";

import { AccessCheck } from "../../lib/permissions";
import { useHasAccess } from "../../hooks/useHasAccess";

interface AccessControlProps {
    check: AccessCheck;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Declarative component for role-based access control.
 */
export const AccessControl: React.FC<AccessControlProps> = ({
    check,
    children,
    fallback = null
}) => {
    const isAllowed = useHasAccess(check);

    if (!isAllowed) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
