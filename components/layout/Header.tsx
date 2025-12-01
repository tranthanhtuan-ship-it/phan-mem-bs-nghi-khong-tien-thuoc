import React from 'react';
import { Search, Bell, User, Menu } from 'lucide-react';
import { Tab } from '../../App';

interface HeaderProps {
    userName: string;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}

const Header: React.FC<HeaderProps> = ({ userName, searchTerm, setSearchTerm, activeTab, setActiveTab }) => {
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTerm = e.target.value;
        setSearchTerm(newTerm);

        // If user starts typing and is not on a searchable tab, move them to the patients tab.
        if (newTerm && !['management', 'drugs'].includes(activeTab)) {
            setActiveTab('management');
        }
    };

    return (
        <header className="h-20 bg-[var(--card)] border-b border-[var(--border)] flex-shrink-0 transition-colors">
            <div className="flex items-center justify-between h-full px-4 md:px-6 lg:px-8">
                {/* Mobile Menu Button - can be implemented later */}
                <button className="md:hidden text-[var(--text-secondary)]">
                    <Menu />
                </button>

                {/* Search Bar */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm bệnh nhân, thuốc..."
                        className="w-full max-w-xs pl-10 pr-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
                
                {/* User Actions */}
                <div className="flex items-center space-x-4">
                    <button className="relative text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                        <Bell className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    </button>
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--background)] flex items-center justify-center border-2 border-[var(--card)] shadow-sm">
                            <User className="w-6 h-6 text-[var(--text-secondary)]" />
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{userName}</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
