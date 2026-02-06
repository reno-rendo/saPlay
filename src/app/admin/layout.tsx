
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession, logoutAdmin } from "@/lib/auth";
import { LayoutDashboard, Settings, MonitorPlay, MessageSquare, LogOut, Code } from "lucide-react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Check auth
    const session = await getSession();
    const headersList = await headers();
    const pathname = headersList.get("x-invoke-path") || "";

    // If not logged in and not on login page, redirect
    // Note: Middleware is better for this, but this works for now within the layout/page logic
    // actually, we can't easily get pathname in server component layout without middleware or headers hack
    // For simplicity, we'll let the individual pages check, or just check here if possible.
    // BUT: Layout wraps the login page too if it's in the same directory structure. 
    // We should move login OUT of this layout or handle it conditionally.
    // Best practice: internal admin layout vs root admin layout.
    // Since we put layout in src/app/admin/layout.tsx, it wraps EVERYTHING in /admin.

    // We will assume the Login page handles its own layout or we check session here.
    // If no session, we should render the login page OR redirect.
    // But if we are ON the login page, we shouldn't redirect.

    // To avoid complexity, we'll just render the sidebar ONLY if session exists.
    // If no session, we render children (which should be the login page).

    // Wait, if I am on /admin/login, I don't want the sidebar.
    // I will check if session exists. If not, I'll assume we are navigating to login.
    // Ideally we use a Route Group (authenticated) but I don't want to refactor folders too much.

    // Let's implement a simple check: if no session, just return children (Assuming middleware or page logic handles protection).
    // Actually, I'll use a Client Component wrapper for the sidebar to handle active states, 
    // but for the layout structure:

    if (!session) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-zinc-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-zinc-800 border-r border-gray-200 dark:border-zinc-700 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
                    <h1 className="text-xl font-bold text-primary">SekaiAdmin</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <NavItem href="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" currentPath={pathname} />
                    <NavItem href="/admin/settings" icon={<Settings size={20} />} label="General Settings" currentPath={pathname} />
                    <NavItem href="/admin/ads" icon={<MonitorPlay size={20} />} label="Ad System" currentPath={pathname} />
                    <NavItem href="/admin/popups" icon={<MessageSquare size={20} />} label="Popups" currentPath={pathname} />
                    <NavItem href="/admin/scripts" icon={<Code size={20} />} label="Script & Ads" currentPath={pathname} />
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-zinc-700">
                    <form action={async () => {
                        "use server";
                        await logoutAdmin();
                        redirect("/admin/login");
                    }}>
                        <button type="submit" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md w-full transition-colors">
                            <LogOut size={20} />
                            Logout
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

// Helper component for Nav Items
function NavItem({ href, icon, label, currentPath }: { href: string; icon: React.ReactNode; label: string; currentPath: string }) {
    // Check if active. Note: Logic ensures exact match or sub-path match for nested routes
    const isActive = href === "/admin"
        ? currentPath === "/admin"
        : currentPath.startsWith(href);

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-foreground"
                }`}
        >
            <div className={`p-1 rounded-md transition-colors ${isActive ? "bg-white/20" : "bg-transparent group-hover:bg-gray-200 dark:group-hover:bg-zinc-700"}`}>
                {icon}
            </div>
            <span className="text-sm font-semibold tracking-wide">{label}</span>
        </Link>
    );
}
