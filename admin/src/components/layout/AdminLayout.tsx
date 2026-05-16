import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useMedia } from "../../hooks/use-media";
import { useUiStore } from "../../store/uiStore";

export function AdminLayout() {
  const isDesktop = useMedia("(min-width: 1024px)");
  const { sidebarOpen, setSidebarOpen } = useUiStore();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72">
        <Topbar />
        <main className="px-4 pb-10 pt-6 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            {isDesktop ? <Outlet /> : <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
