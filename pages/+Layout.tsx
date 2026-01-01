import React, { useState } from 'react';
import { LayoutDashboard, Users, Store, Network, Activity, LogOut, Search, Bell, User, Menu, X } from 'lucide-react';
import './Layout.css';

export { Layout };

function Layout({ children, pageContext }: { children: React.ReactNode; pageContext: any }) {
  const currentPath = pageContext.urlPathname;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="layout">
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />

      <Sidebar currentPath={currentPath} isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="main-content">
        <Topbar onMenuClick={toggleSidebar} />
        <div className="page-container">
          <div id="page-content">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ currentPath, isOpen, onClose }: { currentPath: string, isOpen: boolean, onClose: () => void }) {
  const logoUrl = "https://raw.githubusercontent.com/Sublymus/sublymus/main/logo.png"; // Placeholder

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="flex items-center justify-between p-6 mb-4">
        <div className="flex items-center gap-3">
          <img src={logoUrl} height={32} width={32} alt="logo" className="rounded-md" />
          <span className="font-bold text-xl text-gray-800">Sublymus</span>
        </div>
        <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Menu</div>
        <SidebarLink href="/" icon={<LayoutDashboard size={20} />} label="Tableau de bord" active={currentPath === '/'} onClick={onClose} />
        <SidebarLink href="/stores" icon={<Store size={20} />} label="Boutiques" active={currentPath.startsWith('/stores')} onClick={onClose} />
        <SidebarLink href="/users" icon={<Users size={20} />} label="Utilisateurs" active={currentPath.startsWith('/users')} onClick={onClose} />
        <SidebarLink href="/affiliations" icon={<Network size={20} />} label="Affiliations" active={currentPath.startsWith('/affiliations')} onClick={onClose} />
        <SidebarLink href="/monitoring" icon={<Activity size={20} />} label="Monitoring" active={currentPath.startsWith('/monitoring')} onClick={onClose} />
        <SidebarLink href="/profile" icon={<User size={20} />} label="Profil" active={currentPath.startsWith('/profile')} onClick={onClose} />
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

function SidebarLink({ href, icon, label, active, onClick }: { href: string; icon: React.ReactNode; label: string; active: boolean, onClick?: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`flex items-center px-4 py-3 mx-2 mb-1 rounded-lg transition-all duration-200 group ${active
          ? 'bg-emerald-50 text-emerald-600 font-medium'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
      <span className={`${active ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
        {icon}
      </span>
      <span className="ml-3 text-sm">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
    </a>
  );
}

function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="topbar">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Menu size={24} />
        </button>

        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-full md:w-96">
          <Search size={18} className="text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400 min-w-0"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 ml-auto">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative shrink-0">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="pl-2 md:pl-4 border-l border-gray-200">
          <a href="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-gray-800">Admin User</div>
              <div className="text-xs text-gray-500">Super Admin</div>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
              <User size={20} />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
