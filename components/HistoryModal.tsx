
import React from 'react';
import { Patient, ReceptionPatient } from '../types';
import { X, CheckSquare, UserCheck, ArrowLeft } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPerson: (patient: Patient) => void;
  onSelectHistory: (patient: Patient) => void;
  onBack: () => void;
  data: {
    targetPatient: ReceptionPatient | null;
    phase: 'select_person' | 'view_history';
    uniquePatients: Patient[];
    historyForSelected: Patient[];
  };
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose, onSelectPerson, onSelectHistory, onBack, data }) => {
  if (!isOpen || !data.targetPatient) return null;

  const { phase, uniquePatients, historyForSelected, targetPatient } = data;

  const renderPersonSelection = () => (
    <>
      <div className="flex justify-between items-center p-5 border-b border-[var(--border)] flex-shrink-0">
        <h3 className="text-lg font-bold text-[var(--text-primary)]">
          Tìm thấy {uniquePatients.length} bệnh nhân tên "{targetPatient?.name}". Vui lòng chọn:
        </h3>
        <button type="button" onClick={onClose} className="text-[var(--text-secondary)] bg-transparent hover:bg-[var(--background)] hover:text-[var(--text-primary)] rounded-lg text-sm p-1.5 transition-colors">
          <X size={20} />
        </button>
      </div>
      <div className="p-6 space-y-3 overflow-y-auto">
        {uniquePatients.map(patient => (
          <div key={`${patient.name}-${patient.age}-${patient.gender}`} className="p-3 bg-[var(--background)] rounded-lg flex justify-between items-center transition-colors hover:border-[var(--primary)] border border-transparent">
            <div>
              <p className="font-semibold text-sm text-[var(--text-primary)]">
                {patient.name} - {patient.age} tuổi - {patient.gender}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Lần khám gần nhất: {new Date(patient.consultationDate).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <button onClick={() => onSelectPerson(patient)} className="flex items-center space-x-1.5 text-sm text-white bg-green-500 hover:bg-green-600 font-semibold transition-colors px-3 py-1.5 rounded-lg flex-shrink-0">
              <UserCheck size={16} />
              <span>Xem Lịch sử</span>
            </button>
          </div>
        ))}
      </div>
    </>
  );

  const renderHistoryView = () => (
    <>
      <div className="flex justify-between items-center p-5 border-b border-[var(--border)] flex-shrink-0">
        <div className="flex items-center">
            {uniquePatients.length > 1 && (
              <button onClick={onBack} className="mr-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1.5 rounded-md hover:bg-[var(--background)]">
                <ArrowLeft size={18} />
              </button>
            )}
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Lịch sử khám của: {historyForSelected[0]?.name || targetPatient?.name}
            </h3>
        </div>
        <button type="button" onClick={onClose} className="text-[var(--text-secondary)] bg-transparent hover:bg-[var(--background)] hover:text-[var(--text-primary)] rounded-lg text-sm p-1.5 transition-colors">
          <X size={20} />
        </button>
      </div>
      <div className="p-6 space-y-3 overflow-y-auto">
        {historyForSelected.length > 0 ? (
          historyForSelected.map(record => (
            <div key={record.id} className="p-3 bg-[var(--background)] rounded-lg flex justify-between items-center transition-colors hover:border-[var(--primary)] border border-transparent">
              <div>
                <p className="font-semibold text-sm text-[var(--text-primary)]">
                  Ngày khám: {new Date(record.consultationDate).toLocaleDateString('vi-VN')}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1 truncate max-w-md" title={record.diagnosis}>
                  Chẩn đoán: {record.diagnosis.split('\n')[0] || 'Chưa có chẩn đoán'}
                </p>
              </div>
              <button onClick={() => onSelectHistory(record)} className="flex items-center space-x-1.5 text-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)] font-semibold transition-colors px-3 py-1.5 rounded-lg flex-shrink-0">
                <CheckSquare size={16} />
                <span>Tải lại</span>
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-[var(--text-secondary)] py-8">Không tìm thấy bản ghi nào.</p>
        )}
      </div>
    </>
  );

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
    >
      <div 
        className="bg-[var(--card)] rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {phase === 'select_person' ? renderPersonSelection() : renderHistoryView()}
        <div className="flex-shrink-0 px-6 py-4 bg-[var(--background)] flex justify-end border-t border-[var(--border)]">
          <button type="button" onClick={onClose} className="px-5 py-2 bg-[var(--card)] border border-[var(--border)] text-sm font-semibold rounded-lg hover:bg-[var(--background)]">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
