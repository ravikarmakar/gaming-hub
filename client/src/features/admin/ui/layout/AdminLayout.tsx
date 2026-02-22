import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardNavbar } from "@/features/dashboard/ui/components/DashboardNavbar";
import { DashboardSidebar } from "@/features/dashboard/ui/components/DashboardSidebar";
import { useFilteredNavigation } from "@/hooks/useFilteredNavigation";
import { ADMIN_NAV_ITEMS } from "../../lib/routes";

const AdminLayout = () => {
    const filteredLinks = useFilteredNavigation(ADMIN_NAV_ITEMS.map(item => ({
        label: item.title,
        icon: item.icon,
        href: item.path,
        access: item.access
    })));

    return (
        <SidebarProvider>
            <DashboardSidebar sidebarItems={filteredLinks} />
            <main className="flex flex-col w-screen h-screen bg-[#02000a] overflow-hidden relative text-white">
                {/* Universal Background FX */}
                <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-purple-600/10 to-transparent pointer-events-none z-0" />

                <div className="relative z-10 flex flex-col h-full">
                    <DashboardNavbar />
                    <div className="flex-1 overflow-y-auto p-4 md:p-8">
                        <Suspense fallback={<LoadingSpinner />}>
                            <Outlet />
                        </Suspense>
                    </div>
                </div>
            </main>
        </SidebarProvider>
    );
};

export default AdminLayout;
