
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Pill, Database, ArrowRight, UserPlus, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Patient } from '../types';
import { Tab } from '../App';

interface DashboardTabProps {
  patients: Patient[];
  setActiveTab: (tab: Tab) => void;
  onNewPatient: () => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
        },
    },
};

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string | number; color: string }> = ({ icon: Icon, title, value, color }) => (
    <motion.div variants={itemVariants} className="bg-[var(--card)] p-6 rounded-2xl shadow-lg flex items-center space-x-4 transition-all hover:shadow-xl hover:-translate-y-1">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-[var(--text-secondary)] font-medium">{title}</p>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
        </div>
    </motion.div>
);

const PIE_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)'];


const DashboardTab: React.FC<DashboardTabProps> = ({ patients, setActiveTab, onNewPatient }) => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    const patientsToday = patients.filter(p => p.consultationDate.startsWith(todayString)).length;
    const prescriptionsToday = patients
        .filter(p => p.consultationDate.startsWith(todayString))
        .reduce((sum, p) => sum + p.prescription.length, 0);

    const recentPatients = patients.slice(0, 5);
    
    const barChartData = useMemo(() => {
        const data = [];
        const today = new Date();
        // Sắp xếp thứ tự cho đúng: T2, T3, T4, T5, T6, T7, CN
        const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            
            // Lấy tên ngày trong tuần từ mảng
            const dayName = weekdays[date.getDay()];
            // Chuyển đổi thành chuỗi YYYY-MM-DD để so sánh
            const dateString = date.toISOString().split('T')[0];

            // Đếm số bệnh nhân cho ngày hiện tại
            const patientCount = patients.filter(p => p.consultationDate.startsWith(dateString)).length;

            data.push({
                name: dayName,
                'Số ca': patientCount,
            });
        }
        return data;
    }, [patients]);

    const genderDistributionData = useMemo(() => {
        if (!patients || patients.length === 0) {
            return [];
        }
        
        const counts = patients.reduce((acc, patient) => {
            const gender = patient.gender || 'Khác';
            if (!acc[gender]) {
                acc[gender] = 0;
            }
            acc[gender]++;
            return acc;
        }, {} as Record<string, number>);

        const result = [
            { name: 'Nam', value: counts['Nam'] || 0 },
            { name: 'Nữ', value: counts['Nữ'] || 0 },
            { name: 'Khác', value: counts['Khác'] || 0 },
        ];
        
        return result.filter(item => item.value > 0);
    }, [patients]);

    const diseaseStats = useMemo(() => {
        const counts: Record<string, number> = {};
        patients.forEach(patient => {
            if (patient.diagnosis && patient.diagnosis.trim() !== '') {
                // Extract the first line as the primary diagnosis
                let primaryDiagnosis = patient.diagnosis.split('\n')[0].trim();

                // Basic cleaning: remove trailing punctuation, "theo dõi", etc.
                primaryDiagnosis = primaryDiagnosis
                    .replace(/theo dõi/i, '')
                    .replace(/[:.]?$/,'') // remove trailing colon or period
                    .trim();

                // Capitalize for consistency
                if (primaryDiagnosis) {
                    primaryDiagnosis = primaryDiagnosis.charAt(0).toUpperCase() + primaryDiagnosis.slice(1).toLowerCase();
                    counts[primaryDiagnosis] = (counts[primaryDiagnosis] || 0) + 1;
                }
            }
        });

        // Convert to array, sort, and take top 7
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 7);
    }, [patients]);


    return (
        <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--text-primary)]">Chào mừng trở lại, Bác sĩ!</h2>
                    <p className="mt-1 text-[var(--text-secondary)]">
                        Hôm nay là {today.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
                    </p>
                </div>
                <button 
                  onClick={onNewPatient}
                  className="mt-4 md:mt-0 inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] hover:from-[var(--primary-dark)] hover:to-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] transition-all transform hover:scale-105"
                >
                    <UserPlus size={18} className="mr-2"/>
                    Thêm bệnh nhân mới
                </button>
            </motion.div>

            {/* Stat Cards */}
            <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={Users} title="Bệnh nhân hôm nay" value={patientsToday} color="bg-blue-500" />
                <StatCard icon={Pill} title="Toa thuốc đã kê" value={prescriptionsToday} color="bg-green-500" />
                <StatCard icon={Database} title="Tổng số bệnh nhân" value={patients.length} color="bg-orange-500" />
            </motion.div>

            {/* Charts & Recent Patients */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="lg:col-span-2 bg-[var(--card)] p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Thống kê 7 ngày qua</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={barChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: '0.75rem' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: '0.75rem' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: 'rgba(127, 127, 127, 0.1)'}} contentStyle={{ borderRadius: '0.75rem', borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--text-primary)' }}/>
                                <Bar dataKey="Số ca" fill="var(--primary)" barSize={30} radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-[var(--card)] p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Phân loại giới tính</h3>
                     <div style={{ width: '100%', height: 300 }}>
                        {genderDistributionData.length > 0 ? (
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={genderDistributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} fill="var(--text-primary)">
                                        {genderDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '0.75rem', borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--text-primary)' }}/>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm text-[var(--text-secondary)]">
                                Không có dữ liệu bệnh nhân để hiển thị.
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Recent Patients and Disease Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <motion.div variants={itemVariants} className="lg:col-span-2 bg-[var(--card)] p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">Bệnh nhân gần đây</h3>
                        <button onClick={() => setActiveTab('management')} className="text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-dark)] flex items-center">
                            Xem tất cả <ArrowRight size={16} className="ml-1" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="border-b border-[var(--border)]">
                                <tr>
                                    <th className="py-3 pr-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Họ Tên</th>
                                    <th className="py-3 px-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase hidden sm:table-cell">Tuổi</th>
                                    <th className="py-3 pl-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase">Ngày Khám</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPatients.map(p => (
                                    <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--background)]">
                                        <td className="py-3 pr-3 text-sm font-medium text-[var(--text-primary)]">{p.name}</td>
                                        <td className="py-3 px-3 text-sm text-[var(--text-secondary)] hidden sm:table-cell">{p.age}</td>
                                        <td className="py-3 pl-3 text-sm text-[var(--text-secondary)]">{new Date(p.consultationDate).toLocaleDateString('vi-VN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-[var(--card)] p-6 rounded-2xl shadow-lg">
                     <div className="flex items-center mb-4">
                        <Activity className="w-5 h-5 text-[var(--primary)] mr-2" />
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">Bệnh lý phổ biến</h3>
                    </div>
                     <div className="space-y-4">
                        {diseaseStats.length > 0 ? (
                            diseaseStats.map((stat, index) => {
                                const maxCount = diseaseStats[0]?.count || 1;
                                return (
                                    <div key={index}>
                                        <div className="flex justify-between items-center text-sm mb-1">
                                            <p className="font-medium text-[var(--text-primary)] truncate" title={stat.name}>{stat.name}</p>
                                            <p className="font-semibold text-[var(--text-secondary)]">{stat.count} ca</p>
                                        </div>
                                        <div className="w-full bg-[var(--background)] rounded-full h-1.5">
                                            <div
                                                className="bg-[var(--primary)] h-1.5 rounded-full"
                                                style={{ width: `${(stat.count / maxCount) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center py-8">
                                <Activity className="w-10 h-10 text-[var(--text-secondary)]/50 mb-2" />
                                <p className="text-sm text-[var(--text-secondary)]">Chưa có dữ liệu chẩn đoán để thống kê.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
            
            {/* Footer */}
            <motion.footer variants={itemVariants} className="text-center pt-4">
                <p className="text-sm text-[var(--text-secondary)]/70">
                    Quản lý phòng khám 1.0 – Giải pháp quản lý phòng khám thông minh ©2025
                </p>
            </motion.footer>
        </motion.div>
    );
};

export default DashboardTab;