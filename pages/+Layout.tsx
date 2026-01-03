import "./Layout.css";
import "./tailwind.css";
import logoUrl from "../assets/logo.svg";
import { usePageContext } from "vike-react/usePageContext";
import { LayoutDashboard, Store, Users, Network, Activity, LogOut, Search, Bell, User } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
    const pageContext = usePageContext();
    console.log({serverUrl:pageContext.serverUrl,serverApiUrl:pageContext.serverApiUrl });
    
    const isLoginPage = pageContext.urlPathname === "/login";

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="app-layout">
            <Sidebar currentPath={pageContext.urlPathname} />
            <div className="main-content">
                <Topbar />
                <div className="page-container">
                    <div id="page-content">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Sidebar({ currentPath }: { currentPath: string }) {
    return (
        <div className="sidebar">
            <div className="p-6 mb-4 flex items-center gap-3">
                <img src={logoUrl} height={32} width={32} alt="logo" />
                <span className="font-bold text-xl text-gray-800">Sublymus</span>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</div>
                <SidebarLink href="/" icon={<LayoutDashboard size={20} />} label="Tableau de bord" active={currentPath === '/'} />
                <SidebarLink href="/stores" icon={<Store size={20} />} label="Boutiques" active={currentPath.startsWith('/stores')} />
                <SidebarLink href="/users" icon={<Users size={20} />} label="Utilisateurs" active={currentPath.startsWith('/users')} />
                <SidebarLink href="/affiliations" icon={<Network size={20} />} label="Affiliations" active={currentPath.startsWith('/affiliations')} />
                <SidebarLink href="/monitoring" icon={<Activity size={20} />} label="Monitoring" active={currentPath.startsWith('/monitoring')} />
                <SidebarLink href="/profile" icon={<User size={20} />} label="Profil" active={currentPath.startsWith('/profile')} />
            </div>

            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={() => {
                        localStorage.removeItem('s_admin_token');
                        window.location.href = '/login';
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                    <LogOut size={20} className="mr-3" />
                    Déconnexion
                </button>
            </div>
        </div>
    );
}

function SidebarLink({ href, icon, label, active }: { href: string, icon: React.ReactNode, label: string, active: boolean }) {
    return (
        <a href={href} className={`nav-item ${active ? 'active' : ''}`}>
            <span className="nav-icon">{icon}</span>
            {label}
        </a>
    );
}

function Topbar() {
    return (
        <div className="topbar">
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-96">
                <Search size={18} className="text-gray-400 mr-2" />
                <input
                    type="text"
                    placeholder="Rechercher..."
                    className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                />
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <a href="/profile" className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-gray-50 transition-colors rounded-r-lg p-1">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-semibold text-gray-800">Admin User</div>
                        <div className="text-xs text-gray-500">Super Admin</div>
                    </div>
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                        <User size={20} />
                    </div>
                </a>
            </div>
        </div>
    );
}
