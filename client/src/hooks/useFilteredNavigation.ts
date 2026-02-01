import { useMemo } from "react";
import type { LucideIcon } from "lucide-react";

import { useAccess } from "@/features/auth/hooks/useAccess";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import type { AccessRule } from "@/features/auth/lib/types";

export interface NavigationLink {
    label: string;
    icon: LucideIcon;
    href: string;
    access?: AccessRule;
    matches?: string[];
}

export function useFilteredNavigation(links: NavigationLink[]) {
    const { can } = useAccess();
    const { user } = useAuthStore();

    const filteredLinks = useMemo(() => {
        return links.filter((link) => {
            if (!link.access) return true;
            return can(link.access);
        });
    }, [links, can, user]); // Depend on user to re-evaluate when auth/roles change

    return filteredLinks;
}
