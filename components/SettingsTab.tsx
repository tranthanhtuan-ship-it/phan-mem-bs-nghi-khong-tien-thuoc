
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Palette, Database, Settings as SettingsIcon, Lock, Save, Undo, Upload, Sun, Moon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Language, DateFormat } from '../types';

interface SettingsTabProps {
  userName: string;
  setUserName: (name: string) => void;
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  dataRetentionPeriod: string;
  setDataRetentionPeriod: (period: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  dateFormat: DateFormat;
  setDateFormat: (format: DateFormat) => void;
  autoLogoutDuration: string;
  setAutoLogoutDuration: (duration: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const textContent = {
    title: { vi: 'Cài đặt', en: 'Settings' },
    description: { vi: 'Quản lý tài khoản, giao diện và các cài đặt hệ thống.', en: 'Manage account, interface, and system settings.' },
    reset: { vi: 'Đặt lại', en: 'Reset' },
    save: { vi: 'Lưu thay đổi', en: 'Save Changes' },
    account: { vi: 'Tài khoản', en: 'Account' },
    appearance: { vi: 'Giao diện', en: 'Appearance' },
    data: { vi: 'Dữ liệu', en: 'Data' },
    system: { vi: 'Hệ thống', en: 'System' },
    language: { vi: 'Ngôn ngữ', en: 'Language' },
    dateFormat: { vi: 'Định dạng ngày', en: 'Date Format' },
    autoLogout: { vi: 'Tự động đăng xuất sau', en: 'Auto-logout after' },
};

const SettingsCard: React.FC<{ icon: React.ElementType; title: string; children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
  <motion.div variants={itemVariants} className="bg-[var(--card)] p-6 rounded-2xl shadow-lg">
    <div className="flex items-center border-b border-[var(--border)] pb-4 mb-6">
      <Icon className="w-6 h-6 text-[var(--primary)]" />
      <h3 className="text-lg font-bold text-[var(--text-primary)] ml-3">{title}</h3>
    </div>
    <div className="space-y-4">{children}</div>
  </motion.div>
);

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, name, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
        <input id={name} name={name} {...props} className="block w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all" />
    </div>
);

const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: React.ReactNode }> = ({ label, name, children, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
        <select id={name} name={name} {...props} className="block w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all">
            {children}
        </select>
    </div>
);

const ToggleSwitch: React.FC<{ label: string; enabled: boolean; setEnabled: (enabled: boolean) => void; }> = ({ label, enabled, setEnabled }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
        <button onClick={() => setEnabled(!enabled)} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);


const SettingsTab: React.FC<SettingsTabProps> = ({ 
    userName, setUserName,
    themeMode, setThemeMode,
    primaryColor, setPrimaryColor,
    fontSize, setFontSize,
    dataRetentionPeriod, setDataRetentionPeriod,
    language, setLanguage,
    dateFormat, setDateFormat,
    autoLogoutDuration, setAutoLogoutDuration
}) => {
    const [currentName, setCurrentName] = useState(userName);
    const [autoSave, setAutoSave] = useState(true);

    useEffect(() => {
        setCurrentName(userName);
    }, [userName]);

    const handleSave = () => {
        setUserName(currentName);
        toast.success(language === 'vi' ? 'Cài đặt đã được lưu thành công!' : 'Settings saved successfully!');
    };

    const handleReset = () => {
        const defaultName = "PK BS Nghi";
        setUserName(defaultName);
        setCurrentName(defaultName);
        setThemeMode('light');
        setPrimaryColor('blue');
        setFontSize('md');
        setDataRetentionPeriod('12m');
        setLanguage('vi');
        setDateFormat('dd/mm/yyyy');
        setAutoLogoutDuration('1h');
        toast.error(language === 'vi' ? 'Đã đặt lại cài đặt về mặc định.' : 'Settings have been reset to default.');
    };
    
    const colors = [
        { name: 'blue', class: 'bg-blue-500' },
        { name: 'green', class: 'bg-green-500' },
        { name: 'purple', class: 'bg-purple-500' },
        { name: 'red', class: 'bg-red-500' },
        { name: 'orange', class: 'bg-orange-500' },
    ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">{textContent.title[language]}</h2>
            <p className="mt-1 text-[var(--text-secondary)]">{textContent.description[language]}</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0 flex-shrink-0">
             <button onClick={handleReset} className="inline-flex items-center px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--background)] transition-colors">
                <Undo size={16} className="mr-2" />
                {textContent.reset[language]}
            </button>
            <button onClick={handleSave} className="inline-flex items-center px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--primary-dark)] transition-colors shadow-sm">
                <Save size={16} className="mr-2" />
                {textContent.save[language]}
            </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Settings */}
        <SettingsCard icon={User} title={textContent.account[language]}>
            <div className="flex items-center space-x-4">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Avatar" className="w-16 h-16 rounded-full"/>
                <div>
                    <button className="text-sm font-semibold text-[var(--primary)] hover:underline">Thay đổi ảnh</button>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">JPG, GIF or PNG. 1MB max.</p>
                </div>
            </div>
            <InputField label="Họ tên" value={currentName} onChange={(e) => setCurrentName(e.target.value)} />
            <InputField label="Email" type="email" defaultValue="bacsi.a@clinicai.pro" />
            <div className="border-t border-[var(--border)] pt-4">
                 <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Đổi mật khẩu</h4>
                 <InputField label="Mật khẩu hiện tại" type="password" placeholder="••••••••" />
                 <InputField label="Mật khẩu mới" type="password" placeholder="••••••••" />
                 <InputField label="Xác nhận mật khẩu mới" type="password" placeholder="••••••••" />
            </div>
        </SettingsCard>
        
        {/* Appearance Settings */}
        <SettingsCard icon={Palette} title={textContent.appearance[language]}>
            <div>
                 <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Chế độ hiển thị</label>
                 <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setThemeMode('light')} className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${themeMode === 'light' ? 'border-[var(--primary)] bg-[var(--primary-light)]' : 'border-[var(--border)] bg-transparent'}`}>
                        <Sun className="w-6 h-6 text-[var(--text-primary)] mb-1"/> <span className="text-sm font-medium">Sáng</span>
                    </button>
                     <button onClick={() => setThemeMode('dark')} className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${themeMode === 'dark' ? 'border-[var(--primary)] bg-slate-800' : 'border-[var(--border)] bg-transparent'}`}>
                        <Moon className="w-6 h-6 text-[var(--text-primary)] mb-1"/> <span className="text-sm font-medium">Tối</span>
                    </button>
                 </div>
            </div>
            <div>
                 <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Màu chủ đạo</label>
                 <div className="flex space-x-2">
                    {colors.map(color => (
                        <button key={color.name} onClick={() => setPrimaryColor(color.name)} className={`w-8 h-8 rounded-full ${color.class} transition-all ${primaryColor === color.name ? 'ring-2 ring-offset-2 ring-[var(--primary)] ring-offset-[var(--background)]' : ''}`}></button>
                    ))}
                 </div>
            </div>
            <SelectField label="Cỡ chữ" value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
                <option value="sm">Nhỏ</option>
                <option value="md">Vừa</option>
                <option value="lg">Lớn</option>
            </SelectField>
        </SettingsCard>

        {/* Data Settings */}
        <SettingsCard icon={Database} title={textContent.data[language]}>
             <SelectField 
                label="Phạm vi hiển thị dữ liệu bệnh nhân" 
                value={dataRetentionPeriod} 
                onChange={(e) => setDataRetentionPeriod(e.target.value)}
            >
                <option value="6m">6 tháng qua</option>
                <option value="12m">12 tháng qua</option>
                <option value="24m">24 tháng qua</option>
                <option value="all">Tất cả thời gian</option>
            </SelectField>
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-[var(--background)] rounded-lg">
                <p className="text-sm text-[var(--text-secondary)] mb-2 sm:mb-0">Sao lưu lần cuối: <span className="font-semibold text-[var(--text-primary)]">20/07/2024</span></p>
                <button className="text-sm font-semibold text-[var(--primary)] hover:underline">Sao lưu ngay</button>
            </div>
             <button className="w-full inline-flex items-center justify-center px-4 py-2 border-2 border-dashed border-[var(--border)] text-sm font-medium rounded-lg text-[var(--text-secondary)] bg-[var(--background)] hover:bg-[var(--primary-light)] hover:border-[var(--primary)] transition-all">
                <Upload size={16} className="mr-2"/> Khôi phục từ file
            </button>
            <div className="border-t border-[var(--border)] pt-4 space-y-3">
                 <ToggleSwitch label="Tự động sao lưu định kỳ" enabled={autoSave} setEnabled={setAutoSave}/>
                 <SelectField label="Tần suất sao lưu" disabled={!autoSave}>
                     <option>Hàng ngày</option>
                     <option selected>Hàng tuần</option>
                     <option>Hàng tháng</option>
                 </SelectField>
            </div>
        </SettingsCard>

        {/* System Settings */}
        <SettingsCard icon={SettingsIcon} title={textContent.system[language]}>
            <SelectField label={textContent.language[language]} value={language} onChange={e => setLanguage(e.target.value as Language)}>
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
            </SelectField>
            <SelectField label={textContent.dateFormat[language]} value={dateFormat} onChange={e => setDateFormat(e.target.value as DateFormat)}>
                <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                <option value="mm/dd/yyyy">MM/DD/YYYY</option>
            </SelectField>
            <SelectField label={textContent.autoLogout[language]} value={autoLogoutDuration} onChange={e => setAutoLogoutDuration(e.target.value)}>
                 <option value="15m">15 phút</option>
                 <option value="30m">30 phút</option>
                 <option value="1h">1 giờ</option>
                 <option value="never">Không bao giờ</option>
            </SelectField>
        </SettingsCard>

         {/* Access Control - Premium Feature */}
        <motion.div variants={itemVariants} className="bg-[var(--card)] p-6 rounded-2xl shadow-lg lg:col-span-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-[var(--background)]/70 backdrop-blur-sm z-10"></div>
            <div className="relative z-0 opacity-50">
                <div className="flex items-center border-b border-[var(--border)] pb-4 mb-6">
                    <Lock className="w-6 h-6 text-[var(--primary)]" />
                    <h3 className="text-lg font-bold text-[var(--text-primary)] ml-3">Quản lý quyền truy cập</h3>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-4">Phân quyền chi tiết cho y tá, lễ tân và các bác sĩ khác. Đây là tính năng cao cấp.</p>
                <button disabled className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold cursor-not-allowed">Nâng cấp để sử dụng</button>
            </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default SettingsTab;
