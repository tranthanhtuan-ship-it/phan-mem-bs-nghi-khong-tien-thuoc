import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Patient, RevenueRecord, Drug } from '../types';
import { DollarSign, Users, Pill, FileDown, Calendar, BarChart2, TrendingUp, Search, TrendingDown, ChevronsUp } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { toast } from 'react-hot-toast';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string; color: string }> = ({ icon: Icon, title, value, color }) => (
    <motion.div variants={itemVariants} className="bg-[var(--card)] p-5 rounded-2xl shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="mt-4">
            <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
            <p className="text-sm text-[var(--text-secondary)] font-medium">{title}</p>
        </div>
    </motion.div>
);

const formatDateForInput = (date: Date) => date.toISOString().split('T')[0];

const parseFraction = (fraction: string | number): number => {
    if (typeof fraction === 'number') return fraction;
    if (typeof fraction !== 'string') return 0;

    fraction = fraction.trim();
    if (fraction.includes('/')) {
        const parts = fraction.split('/');
        if (parts.length === 2) {
            const numerator = parseFloat(parts[0]);
            const denominator = parseFloat(parts[1]);
            if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
                return numerator / denominator;
            }
        }
    }
    const num = parseFloat(fraction);
    return isNaN(num) ? 0 : num;
};

interface ReportsTabProps {
    patients: Patient[];
    revenueData: RevenueRecord[];
    drugMasterList: Drug[];
}

const ReportsTab: React.FC<ReportsTabProps> = ({ patients, revenueData, drugMasterList }) => {
    type FilterPreset = 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom';
    
    const [filterPreset, setFilterPreset] = useState<FilterPreset>('this_month');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [reportData, setReportData] = useState<{
        stats: {
            totalRevenue: number;
            consultationCount: number;
            avgRevenuePerDay: number;
            totalDrugCapital: number; // Cost price
            totalProfit: number;
        };
        chartData: { name: string; Doanh_thu: number }[];
    } | null>(null);

    useEffect(() => {
        const now = new Date();
        let start = new Date(now);
        let end = new Date(now);

        switch (filterPreset) {
            case 'today':
                break;
            case 'this_week':
                start.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); // Monday
                end.setDate(start.getDate() + 6); // Sunday
                break;
            case 'this_month':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case 'this_year':
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear(), 11, 31);
                break;
            case 'custom':
                return; // Do nothing, keep user's custom dates
        }
        setStartDate(formatDateForInput(start));
        setEndDate(formatDateForInput(end));
    }, [filterPreset]);

    const handleGenerateReport = () => {
        if (!startDate || !endDate) {
            toast.error('Vui lòng chọn ngày bắt đầu và kết thúc.');
            return;
        }

        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        const end = new Date(endDate);
        end.setHours(23,59,59,999);
        
        if (start > end) {
            toast.error('Ngày bắt đầu không được lớn hơn ngày kết thúc.');
            return;
        }

        const filteredRevenue = revenueData.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= start && recordDate <= end;
        });

        const filteredPatients = patients.filter(patient => {
            const patientDate = new Date(patient.consultationDate);
            return patientDate >= start && patientDate <= end;
        });

        const totalRevenue = filteredRevenue.reduce((sum, r) => sum + r.total, 0);
        const consultationCount = filteredPatients.length;

        const startForDayCount = new Date(startDate);
        const endForDayCount = new Date(endDate);
        const timeDiff = endForDayCount.getTime() - startForDayCount.getTime();
        const dayCount = Math.round(timeDiff / (1000 * 3600 * 24)) + 1;
        
        const avgRevenuePerDay = dayCount > 0 ? totalRevenue / dayCount : 0;
        
        const drugInfoMap: Map<string, Drug> = new Map(drugMasterList.map(d => [d.name.toLowerCase().trim(), d]));
        let totalDrugCapital = 0;

        for (const record of filteredRevenue) {
            if (record.prescription) {
                for (const item of record.prescription) {
                    const drugInfo = drugInfoMap.get(item.drugName.toLowerCase().trim());
                    if (!drugInfo || typeof drugInfo.price !== 'number') continue;
                    
                    const price = drugInfo.price;

                    if (typeof item.totalQuantity === 'number' && item.totalQuantity > 0) {
                        totalDrugCapital += item.totalQuantity * price;
                    } else { 
                        const anyItem = item as any; // To access potential old properties
                        let calculatedQuantity = 0;
                        const containerUnits = ['chai', 'tuýp', 'lọ'];
                        if (containerUnits.includes(drugInfo.unit || '')) {
                             calculatedQuantity = 1;
                        } else if (anyItem.morning !== undefined) { // New format
                            const m = parseFraction(anyItem.morning || '0');
                            const n = parseFraction(anyItem.noon || '0');
                            const a = parseFraction(anyItem.afternoon || '0');
                            const e = parseFraction(anyItem.evening || '0');
                            const duration = anyItem.duration || 0;
                            if (duration > 0 && (m+n+a+e) > 0) {
                                calculatedQuantity = (m + n + a + e) * duration;
                            }
                        } else if (anyItem.frequency && anyItem.quantity) { // Old format
                            const freq = parseInt(anyItem.frequency, 10) || 0;
                            const quantity = parseFraction(anyItem.quantity ?? '0');
                            const duration = anyItem.duration || 0;
                            if (freq > 0 && quantity > 0 && duration > 0) {
                                calculatedQuantity = freq * quantity * duration;
                            }
                        }
                        totalDrugCapital += Math.ceil(calculatedQuantity) * price;
                    }
                }
            }
        }
        
        const totalProfit = totalRevenue - totalDrugCapital;

        const dataByDate: { [key: string]: number } = {};
        const shouldGroupMonthly = dayCount > 31;
        
        filteredRevenue.forEach(record => {
            const recordDate = new Date(record.date);
            const key = shouldGroupMonthly
                ? `Tháng ${recordDate.getMonth() + 1}/${recordDate.getFullYear()}`
                : recordDate.toLocaleDateString('vi-VN');
            
            if (!dataByDate[key]) dataByDate[key] = 0;
            dataByDate[key] += record.total;
        });

        const chartData = Object.entries(dataByDate).map(([name, Doanh_thu]) => ({ name, Doanh_thu }));
        if(!shouldGroupMonthly) chartData.reverse();


        setReportData({
            stats: { totalRevenue, consultationCount, avgRevenuePerDay, totalDrugCapital, totalProfit },
            chartData,
        });
        
        toast.success(`Đã tạo báo cáo cho ${dayCount.toFixed(0)} ngày.`);
    };
    
    const handleExport = () => {
        toast('Chức năng xuất báo cáo đang được phát triển!', { icon: '🚧' });
    };

    return (
        <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
                <h2 className="text-3xl font-bold text-[var(--text-primary)]">Báo cáo Doanh thu</h2>
                <p className="mt-1 text-[var(--text-secondary)]">Phân tích và theo dõi tình hình tài chính của phòng khám.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-[var(--card)] p-6 rounded-2xl shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Loại thống kê</label>
                        <select value={filterPreset} onChange={e => setFilterPreset(e.target.value as FilterPreset)} className="w-full rounded-lg border-[var(--border)] px-3 py-2 text-sm bg-[var(--background)] text-[var(--text-primary)] focus:border-[var(--primary)] focus:ring-[var(--primary)]">
                            <option value="today">Hôm nay</option>
                            <option value="this_week">Tuần này</option>
                            <option value="this_month">Tháng này</option>
                            <option value="this_year">Năm này</option>
                            <option value="custom">Tùy chọn</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Từ ngày</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} disabled={filterPreset !== 'custom'} className="w-full rounded-lg border-[var(--border)] px-3 py-2 text-sm bg-[var(--background)] text-[var(--text-primary)] focus:border-[var(--primary)] focus:ring-[var(--primary)] disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-400" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Đến ngày</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} disabled={filterPreset !== 'custom'} className="w-full rounded-lg border-[var(--border)] px-3 py-2 text-sm bg-[var(--background)] text-[var(--text-primary)] focus:border-[var(--primary)] focus:ring-[var(--primary)] disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-400" />
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={handleGenerateReport} className="w-full inline-flex items-center justify-center px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-dark)] transition-colors shadow-sm">
                            <Search size={16} className="mr-2" />
                            Xem báo cáo
                        </button>
                         <button onClick={handleExport} className="inline-flex items-center justify-center px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--background)] transition-colors">
                            <FileDown size={16} />
                        </button>
                    </div>
                </div>
            </motion.div>

            {reportData ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard icon={DollarSign} title="Tổng doanh thu" value={`${reportData.stats.totalRevenue.toLocaleString('vi-VN')} VNĐ`} color="bg-green-500" />
                        <StatCard icon={Users} title="Số lượt khám" value={reportData.stats.consultationCount.toLocaleString('vi-VN')} color="bg-blue-500" />
                        <StatCard icon={TrendingUp} title="TB doanh thu/ngày" value={`${Math.round(reportData.stats.avgRevenuePerDay).toLocaleString('vi-VN')} VNĐ`} color="bg-orange-500" />
                        <StatCard icon={TrendingDown} title="Tổng vốn thuốc" value={`${reportData.stats.totalDrugCapital.toLocaleString('vi-VN')} VNĐ`} color="bg-red-500" />
                        <StatCard icon={ChevronsUp} title="Tổng lợi nhuận" value={`${reportData.stats.totalProfit.toLocaleString('vi-VN')} VNĐ`} color="bg-emerald-500" />
                    </div>

                    <motion.div variants={itemVariants} className="bg-[var(--card)] p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center"><BarChart2 className="mr-2 text-[var(--primary)]"/> Biểu đồ xu hướng doanh thu</h3>
                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={reportData.chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                    <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: '0.75rem' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: '0.75rem' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${Number(value) / 1000000}M`} />
                                    <Tooltip contentStyle={{ borderRadius: '0.75rem', borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--text-primary)' }} formatter={(value) => [`${(value as number).toLocaleString('vi-VN')} VNĐ`, 'Doanh thu']}/>
                                    <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}/>
                                    <Bar dataKey="Doanh_thu" fill="var(--primary)" barSize={30} radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </>
            ) : (
                <motion.div variants={itemVariants} className="text-center py-20 bg-[var(--card)] rounded-2xl shadow-lg">
                    <BarChart2 className="mx-auto h-12 w-12 text-[var(--text-secondary)]" />
                    <h3 className="mt-2 text-xl font-semibold text-[var(--text-primary)]">Sẵn sàng phân tích</h3>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        Chọn khoảng thời gian bạn muốn xem và nhấn "Xem báo cáo" để bắt đầu.
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
};

export default ReportsTab;