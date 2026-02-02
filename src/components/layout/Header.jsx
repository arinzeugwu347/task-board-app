import { useNavigate } from 'react-router-dom';
import { Plus, Moon, Sun, Menu } from 'lucide-react';

export default function Header({ toggleDarkMode, darkMode, toggleSidebar }) {

    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-10 backdrop-blur-lg bg-surface-300/95 dark:bg-surface-900/80 border-b border-surface-200/50 dark:border-surface-800/50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
                {/* Left: Hamburger (mobile only) + Title */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleSidebar}
                        className="md:hidden p-2 rounded-full hover:bg-surface-200/50 dark:hover:bg-surface-800/50 transition-colors"
                        aria-label="Open sidebar"
                    >
                        <Menu size={24} className="text-surface-900 dark:text-gray-100" />
                    </button>

                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">
                        Task Board
                    </h1>
                </div>

                {/* Right: Theme toggle + New Board */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-full bg-surface-200/50 dark:bg-surface-800/50 hover:bg-surface-300/50 dark:hover:bg-surface-700/50 transition-colors"
                        aria-label="Toggle dark mode"
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    
                        <button
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r
                     from-primary-600 to-indigo-600 dark:from-primary-700
                     dark:to-indigo-700 hover:from-primary-500 hover:to-indigo-500 
                     rounded-lg font-medium transition-all shadow-lg shadow-primary-500/20
                      dark:shadow-primary-600/30 text-white"
                      onClick={handleClick}
                        >
                            {/* <Plus size={18} /> */}
                            New Board
                        </button>
                 
                </div>
            </div>
        </header>
    );
}