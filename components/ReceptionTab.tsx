
import React, { useState, useMemo } from 'react';
import { ReceptionPatient, ReceptionDraft } from '../types';
import { UserPlus, Stethoscope, Trash2, X, History } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ConfirmationModal from './ConfirmationModal';

interface ReceptionTabProps {
  receptionList: ReceptionPatient[];
  setReceptionList: React.Dispatch<React.SetStateAction<ReceptionPatient[]>>;
  onStartConsultation: (patient: ReceptionPatient) => void;
  onSearchHistory: (patient: ReceptionPatient) => void;
  draftState: ReceptionDraft;
  setDraftState: React.Dispatch<React.SetStateAction<ReceptionDraft>>;
}

const generateUniqueId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

const initialFormData = {
    name: '',
    age: '',
    gender: 'Nam',
    weight: '',
    address: ''
};

const ReceptionTab: React.FC<ReceptionTabProps> = ({ receptionList, setReceptionList, onStartConsultation, onSearchHistory, draftState, setDraftState }) => {
    // Instead of local state, we use draftState from props
    const { isOpen, formData } = draftState;
    const [patientToDelete, setPatientToDelete] = useState<ReceptionPatient | null>(null);

    const oneYearAgo = useMemo(() => {
        const date = new Date();
        date.setFullYear(date.getFullYear() - 1);
        return date;
    }, []);

    const visiblePatients = useMemo(() => {
        return receptionList
            .filter(p => new Date(p.receptionDate) >= oneYearAgo)
            .sort((a, b) => new Date(a.receptionDate).getTime() - new Date(b.receptionDate).getTime());
    }, [receptionList, oneYearAgo]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDraftState(prev => ({
            ...prev,
            formData: { ...prev.formData, [name]: value }
        }));
    };
    
    const setModalOpen = (open: boolean) => {
        setDraftState(prev => ({ ...prev, isOpen: open }));
    };

    const handleAddPatient = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.age.trim()) {
            toast.error('Vui lòng điền họ tên và tuổi của bệnh nhân.');
            return;
        }

        const newPatient: ReceptionPatient = {
            id: `rec-${generateUniqueId()}`,
            ...formData,
            receptionDate: new Date().toISOString(),
        };

        setReceptionList(prev => [newPatient, ...prev]);
        toast.success(`Đã thêm bệnh nhân "${newPatient.name}" vào hàng chờ.`);
        
        // Reset form data in draft but close modal
        setDraftState({
            isOpen: false,
            formData: initialFormData
        });
    };
    
    const requestDelete = (patient: ReceptionPatient) => {
        setPatientToDelete(patient);
    };

    const confirmDelete = () => {
        if (patientToDelete) {
            setReceptionList(prev => prev.filter(p => p.id !== patientToDelete.id));
            toast.success(`Đã xóa bệnh nhân "${patientToDelete.name}" khỏi hàng chờ.`);
        }
        setPatientToDelete(null);
    };
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--text-primary)]">Nhận bệnh</h2>
                    <p className="mt-1 text-[var(--text-secondary)]">Quản lý danh sách bệnh nhân đang chờ khám.</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="mt-4 sm:mt-0 w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] transition-all"
                >
                    <UserPlus size={18} className="mr-2"/>
                    Nhận bệnh mới
                </button>
            </div>

            <div className="bg-[var(--card)] p-4 sm:p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-4 mb-4">
                    Danh sách chờ ({visiblePatients.length})
                </h3>
                {visiblePatients.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-[var(--border)]">
                            <thead className="bg-[var(--background)]">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">STT</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Họ tên</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Tuổi</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider hidden sm:table-cell">Giới tính</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider hidden sm:table-cell">Cân nặng (kg)</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
                                {visiblePatients.map((patient, index) => (
                                    <tr key={patient.id} className="hover:bg-[var(--background)] transition-colors duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-secondary)]">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-[var(--text-primary)]">{patient.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)]">{patient.age}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)] hidden sm:table-cell">{patient.gender}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)] hidden sm:table-cell">{patient.weight}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button onClick={() => onStartConsultation(patient)} className="flex items-center space-x-1 text-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)] font-semibold transition-colors px-3 py-1.5 rounded-lg" aria-label={`Khám bệnh cho ${patient.name}`}>
                                                    <Stethoscope size={14} /> <span>Khám bệnh</span>
                                                </button>
                                                 <button onClick={() => onSearchHistory(patient)} className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-800 font-semibold transition-colors px-3 py-1.5 rounded-lg hover:bg-green-500/10" aria-label={`Tìm lịch sử cho ${patient.name}`}>
                                                    <History size={14} /> <span>Tìm LS</span>
                                                </button>
                                                <button onClick={() => requestDelete(patient)} className="text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-500/10" aria-label={`Xóa ${patient.name} khỏi danh sách chờ`}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-sm text-[var(--text-secondary)]">Chưa có bệnh nhân nào trong hàng chờ.</p>
                    </div>
                )}
            </div>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--card)] rounded-2xl shadow-xl w-full max-w-md">
                        <form onSubmit={handleAddPatient}>
                            <div className="flex justify-between items-center p-5 border-b border-[var(--border)]">
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">Thông tin bệnh nhân mới</h3>
                                <button type="button" onClick={() => setModalOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Họ tên bệnh nhân</label>
                                    <input name="name" value={formData.name} onChange={handleInputChange} className="w-full rounded-lg border-[var(--border)] px-3 py-2 text-sm bg-[var(--background)] text-[var(--text-primary)]" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Địa chỉ</label>
                                    <input name="address" value={formData.address} onChange={handleInputChange} className="w-full rounded-lg border-[var(--border)] px-3 py-2 text-sm bg-[var(--background)] text-[var(--text-primary)]" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Tuổi</label>
                                        <input name="age" type="text" value={formData.age} onChange={handleInputChange} className="w-full rounded-lg border-[var(--border)] px-3 py-2 text-sm bg-[var(--background)] text-[var(--text-primary)]" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Cân nặng (kg)</label>
                                        <input name="weight" type="text" value={formData.weight} onChange={handleInputChange} className="w-full rounded-lg border-[var(--border)] px-3 py-2 text-sm bg-[var(--background)] text-[var(--text-primary)]" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Giới tính</label>
                                    <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full rounded-lg border-[var(--border)] px-3 py-2 text-sm bg-[var(--background)] text-[var(--text-primary)]">
                                        <option>Nam</option>
                                        <option>Nữ</option>
                                        <option>Khác</option>
                                    </select>
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-[var(--background)] flex justify-end">
                                <button type="submit" className="px-5 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--primary-dark)]">Lưu</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            <ConfirmationModal
                isOpen={!!patientToDelete}
                onClose={() => setPatientToDelete(null)}
                onConfirm={confirmDelete}
                title="Xác nhận xóa"
                message={<p>Bạn có chắc muốn xóa bệnh nhân <strong className="font-semibold text-[var(--text-primary)]">{patientToDelete?.name}</strong> khỏi hàng chờ?</p>}
                confirmText="Xóa"
            />
        </div>
    );
};

export default ReceptionTab;