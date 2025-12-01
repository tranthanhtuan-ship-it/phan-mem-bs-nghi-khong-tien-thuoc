

import React from 'react';
import { Stethoscope, Users, Pill, LayoutDashboard, BarChart3, Settings, Syringe, ClipboardPlus, RefreshCw, ClipboardList } from 'lucide-react';
import { Tab } from '../../App';
import { Language } from '../../types';

interface SidebarProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
    language: Language;
}

const menuItems = [
    { id: 'dashboard', label_vi: 'Trang chủ', label_en: 'Dashboard', icon: LayoutDashboard, enabled: true },
    { id: 'reception', label_vi: 'Nhận bệnh', label_en: 'Reception', icon: ClipboardPlus, enabled: true },
    { id: 'consultation', label_vi: 'Khám bệnh', label_en: 'Consultation', icon: Stethoscope, enabled: true },
    { id: 'management', label_vi: 'Quản lý bệnh nhân', label_en: 'Patient Management', icon: Users, enabled: true },
    { id: 'drugs', label_vi: 'Quản lý thuốc', label_en: 'Drug Management', icon: Pill, enabled: true },
    { id: 'diagnosis', label_vi: 'Quản lý chẩn đoán', label_en: 'Diagnosis Mngmt', icon: ClipboardList, enabled: true },
    { id: 'reports', label_vi: 'Báo cáo', label_en: 'Reports', icon: BarChart3, enabled: true },
    { id: 'sync', label_vi: 'Đồng bộ hóa', label_en: 'Sync', icon: RefreshCw, enabled: true },
    { id: 'settings', label_vi: 'Cài đặt', label_en: 'Settings', icon: Settings, enabled: true },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, language }) => {
    return (
        <aside className="w-64 bg-[var(--card)] flex-shrink-0 border-r border-[var(--border)] flex flex-col transition-all duration-300">
            <div className="h-20 flex items-center justify-center px-4 border-b border-[var(--border)]">
                 <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)]">
                    <Syringe className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-xl font-bold ml-3 text-[var(--text-primary)]">Quản lý phòng khám 1.0</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const label = language === 'vi' ? item.label_vi : item.label_en;
                    return (
                        <button
                            key={item.id}
                            disabled={!item.enabled}
                            onClick={() => setActiveTab(item.id as Tab)}
                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] ${
                                isActive 
                                ? 'bg-[var(--primary)] text-white shadow-lg shadow-blue-500/30' 
                                : item.enabled 
                                ? 'text-[var(--text-secondary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)]'
                                : 'text-slate-400 dark:text-slate-600 cursor-not-allowed bg-slate-100 dark:bg-slate-800'
                            }`}
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            <span>{label}</span>
                        </button>
                    )
                })}
            </nav>
            <div className="p-4 border-t border-[var(--border)]">
                <p className="text-xs text-center text-[var(--text-secondary)]/50">Trần Thanh Tuấn</p>
            </div>
        </aside>
    );
};

export default Sidebar;