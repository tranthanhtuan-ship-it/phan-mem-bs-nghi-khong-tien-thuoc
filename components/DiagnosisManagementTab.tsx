import React, { useState, useMemo } from 'react';
import ConfirmationModal from './ConfirmationModal';
import { Trash2, Plus, Edit, X, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DiagnosisManagementTabProps {
  diagnosisMasterList: string[];
  setDiagnosisMasterList: React.Dispatch<React.SetStateAction<string[]>>;
  globalSearchTerm: string;
}

const DiagnosisManagementTab: React.FC<DiagnosisManagementTabProps> = ({ diagnosisMasterList, setDiagnosisMasterList, globalSearchTerm }) => {
    const [newDiagnosis, setNewDiagnosis] = useState('');
    const [editingDiagnosis, setEditingDiagnosis] = useState<{ original: string, current: string } | null>(null);
    const [diagnosisToDelete, setDiagnosisToDelete] = useState<string | null>(null);

    const filteredDiagnoses = useMemo(() => {
        if (!globalSearchTerm) {
            return diagnosisMasterList;
        }
        return diagnosisMasterList.filter(d => 
            d.toLowerCase().includes(globalSearchTerm.toLowerCase())
        );
    }, [diagnosisMasterList, globalSearchTerm]);

    const handleAddDiagnosis = () => {
        const trimmed = newDiagnosis.trim();
        if (!trimmed) {
            toast.error('Tên chẩn đoán không được để trống.');
            return;
        }
        if (diagnosisMasterList.some(d => d.toLowerCase() === trimmed.toLowerCase())) {
            toast.error('Chẩn đoán này đã có trong danh sách.');
            return;
        }
        setDiagnosisMasterList(prev => [...prev, trimmed].sort((a, b) => a.localeCompare(b)));
        setNewDiagnosis('');
        toast.success(`Đã thêm chẩn đoán "${trimmed}"`);
    };
    
    const handleUpdateDiagnosis = () => {
        if (!editingDiagnosis) return;
        const trimmed = editingDiagnosis.current.trim();
        if (!trimmed) {
            toast.error('Tên chẩn đoán không được để trống.');
            return;
        }
        // Check if new name already exists (and is not the original name)
        if (trimmed.toLowerCase() !== editingDiagnosis.original.toLowerCase() && diagnosisMasterList.some(d => d.toLowerCase() === trimmed.toLowerCase())) {
            toast.error('Tên chẩn đoán này đã tồn tại.');
            return;
        }
        setDiagnosisMasterList(prev => 
            prev.map(d => d === editingDiagnosis.original ? trimmed : d).sort((a, b) => a.localeCompare(b))
        );
        toast.success(`Đã cập nhật chẩn đoán.`);
        setEditingDiagnosis(null);
    };

    const requestDeleteDiagnosis = (diagnosis: string) => {
        setDiagnosisToDelete(diagnosis);
    };

    const confirmDeleteDiagnosis = () => {
        if (diagnosisToDelete) {
            setDiagnosisMasterList(prev => prev.filter(d => d !== diagnosisToDelete));
            toast.success(`Đã xóa chẩn đoán "${diagnosisToDelete}"`);
        }
        setDiagnosisToDelete(null);
    };

    const handleDeleteAll = () => {
        setDiagnosisMasterList([]);
        toast.success('Đã xóa tất cả chẩn đoán.');
        setDiagnosisToDelete(null); // Close the modal
    };

    const inputClass = "block w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)]";
    
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-[var(--card)] p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-3 mb-4">Thêm chẩn đoán mới</h3>
                        <div className="space-y-4">
                            <input
                                type="text"
                                value={newDiagnosis}
                                onChange={(e) => setNewDiagnosis(e.target.value)}
                                placeholder="Tên chẩn đoán, VD: Viêm da cơ địa"
                                className={inputClass}
                            />
                        </div>
                        <button onClick={handleAddDiagnosis} className="w-full mt-4 inline-flex items-center justify-center p-2.5 border border-transparent rounded-lg shadow-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)]">
                           <Plus className="h-5 w-5 mr-2" /> Thêm chẩn đoán
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-[var(--card)] p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-center border-b border-[var(--border)] pb-3 mb-4">
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">Danh sách chẩn đoán ({filteredDiagnoses.length})</h3>
                        {diagnosisMasterList.length > 0 && (
                            <button
                                onClick={() => setDiagnosisToDelete('__ALL__')}
                                className="text-sm font-semibold text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors flex items-center"
                            >
                                <Trash2 className="h-4 w-4 mr-1.5" />
                                Xóa tất cả
                            </button>
                        )}
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto pr-2">
                        {filteredDiagnoses.length > 0 ? (
                            <ul className="divide-y divide-[var(--border)]">
                                {filteredDiagnoses.map(d => (
                                    <li key={d} className="py-3 flex items-center justify-between group">
                                        {editingDiagnosis?.original === d ? (
                                            <div className="flex-grow flex items-center gap-2">
                                                <input 
                                                    type="text"
                                                    value={editingDiagnosis.current}
                                                    onChange={(e) => setEditingDiagnosis({ ...editingDiagnosis, current: e.target.value })}
                                                    className={`${inputClass} text-sm`}
                                                    autoFocus
                                                />
                                                <button onClick={handleUpdateDiagnosis} className="text-[var(--text-secondary)] hover:text-green-500 p-1"><Check className="h-4 w-4" /></button>
                                                <button onClick={() => setEditingDiagnosis(null)} className="text-[var(--text-secondary)] hover:text-red-500 p-1"><X className="h-4 w-4" /></button>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-sm font-medium text-[var(--text-primary)]">{d}</p>
                                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setEditingDiagnosis({ original: d, current: d })} className="text-[var(--text-secondary)] hover:text-[var(--primary)]"><Edit className="h-4 w-4" /></button>
                                                    <button onClick={() => requestDeleteDiagnosis(d)} className="text-[var(--text-secondary)] hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <p className="text-center text-[var(--text-secondary)] py-4">
                                {globalSearchTerm ? 'Không tìm thấy chẩn đoán phù hợp.' : 'Chưa có chẩn đoán nào trong danh sách.'}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            
            <ConfirmationModal
                isOpen={!!diagnosisToDelete}
                onClose={() => setDiagnosisToDelete(null)}
                onConfirm={diagnosisToDelete === '__ALL__' ? handleDeleteAll : confirmDeleteDiagnosis}
                title={diagnosisToDelete === '__ALL__' ? "Xác nhận xóa TẤT CẢ chẩn đoán" : "Xác nhận xóa chẩn đoán"}
                message={
                    diagnosisToDelete === '__ALL__' ? 
                    <p>Bạn có chắc chắn muốn xóa <strong className="font-semibold text-red-500">toàn bộ</strong> danh sách chẩn đoán không? Hành động này không thể hoàn tác.</p> :
                    <p>Bạn có chắc muốn xóa <strong className="font-semibold text-[var(--text-primary)]">{diagnosisToDelete}</strong>?</p>
                }
                confirmText={diagnosisToDelete === '__ALL__' ? "Vẫn xóa" : "Xóa"}
            />
        </>
    );
};

export default DiagnosisManagementTab;
