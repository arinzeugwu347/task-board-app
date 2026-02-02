import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, ListTodo, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Sidebar({ isSidebarCollapsed, toggleCollapse }) {
  const { logout } = useAuth();
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-surface-300/95 dark:bg-surface-900/95 backdrop-blur-lg border-r border-surface-200/50 dark:border-surface-800/50 transition-all duration-300 ease-in-out md:relative md:top-0 md:h-screen ${isSidebarCollapsed ? 'w-64 -translate-x-full md:w-20 md:translate-x-0' : 'w-64 translate-x-0'
        }`}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 md:p-6 border-b border-surface-200/50 dark:border-surface-800/50 flex items-center justify-between">
        {!isSidebarCollapsed && (
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">
            Kanban Pro
          </h1>
        )}
        <button
          onClick={toggleCollapse}
          className="hidden md:flex p-2 rounded-full hover:bg-surface-200/50 dark:hover:bg-surface-800/50 transition-colors items-center justify-center"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation - aligned at the top */}
      <nav className="flex-1 p-4 md:p-5 space-y-2 md:space-y-3 overflow-hidden">
        <NavLink
          to="/"
          className={({ isActive }) => `
            flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} gap-3 p-3 md:p-4 rounded-lg transition-all relative group
            ${isActive
              ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium'
              : 'text-surface-700 dark:text-gray-400 hover:bg-surface-200/70 dark:hover:bg-surface-800/60 hover:text-surface-900 dark:hover:text-gray-200'}
          `}
        >
          {({ isActive }) => (
            <>
              <LayoutDashboard
                size={20}
                className={`flex-shrink-0 transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-surface-600 dark:text-gray-500'}`}
              />
              {!isSidebarCollapsed && <span>Boards</span>}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full" />
              )}
            </>
          )}
        </NavLink>

        <NavLink
          to="/my-tasks"
          className={({ isActive }) => `
            flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} gap-3 p-3 md:p-4 rounded-lg transition-all relative group
            ${isActive
              ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium'
              : 'text-surface-700 dark:text-gray-400 hover:bg-surface-200/70 dark:hover:bg-surface-800/60 hover:text-surface-900 dark:hover:text-gray-200'}
          `}
        >
          {({ isActive }) => (
            <>
              <ListTodo
                size={20}
                className={`flex-shrink-0 transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-surface-600 dark:text-gray-500'}`}
              />
              {!isSidebarCollapsed && <span>My Tasks</span>}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full" />
              )}
            </>
          )}
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => `
            flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} gap-3 p-3 md:p-4 rounded-lg transition-all relative group
            ${isActive
              ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium'
              : 'text-surface-700 dark:text-gray-400 hover:bg-surface-200/70 dark:hover:bg-surface-800/60 hover:text-surface-900 dark:hover:text-gray-200'}
          `}
        >
          {({ isActive }) => (
            <>
              <Settings
                size={20}
                className={`flex-shrink-0 transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-surface-600 dark:text-gray-500'}`}
              />
              {!isSidebarCollapsed && <span>Settings</span>}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full" />
              )}
            </>
          )}
        </NavLink>
      </nav>

      {/* Logout - always at bottom */}

      <div className="flex-shrink-0 p-4 border-t border-surface-200/50 dark:border-surface-800/50">
        <button
          className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start'} gap-3 p-3 rounded-lg text-red-500 dark:text-red-400 hover:bg-surface-200/50 dark:hover:bg-surface-800/50 transition-colors w-full text-base`}
          onClick={logout}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!isSidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}