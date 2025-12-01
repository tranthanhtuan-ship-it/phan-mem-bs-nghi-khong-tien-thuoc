
import React, { useState, useEffect, useMemo } from 'react';
import { Patient, PrescriptionItem, Drug, RevenueRecord, ReceptionPatient } from '../types';
import { getDiagnosisSuggestion } from '../services/geminiService';
import { Plus, Trash2, Wand2, Save, UserPlus, DollarSign, History, Calendar, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ConsultationTabProps {
  onSavePatient: (patient: Patient, paymentInfo: Pick<RevenueRecord, 'consultationFee' | 'otherServicesCost' | 'drugCost' | 'paymentStatus'>) => void;
  existingPatient: Patient | null;
  patientFromReception: ReceptionPatient | null;
  onNewPatient: () => void;
  drugMasterList: Drug[];
  diagnosisMasterList: string[];
  patients: Patient[];
  draftData: any;
  setDraftData: (data: any) => void;
}

const generateUniqueId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 9);

// Helper to format Date object to "YYYY-MM-DDTHH:mm" string for datetime-local input
const formatDateForInput = (dateString?: string) => {
    const date = dateString ? new Date(dateString) : new Date();
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
    return localISOTime;
};

const createNewPatient = (): Omit<Patient, 'id'> => ({
    name: '',
    age: '',
    gender: 'Nam',
    address: '',
    vitals: { pulse: '', bloodPressure: '', temperature: '', respiratoryRate: '', weight: '' },
    symptoms: '',
    diagnosis: '',
    prescription: [],
    prescriptionNote: '',
    consultationDate: new Date().toISOString(),
});

const initialPaymentInfo = {
    consultationFee: 0,
    otherServicesCost: 0,
    drugCost: 0,
    paymentStatus: 'unpaid' as 'paid' | 'unpaid',
};

const Card: React.FC<{ title: string; children: React.ReactNode; className?: string; icon?: React.ElementType }> = ({ title, children, className, icon: Icon }) => (
    <div className={`bg-[var(--card)] p-6 rounded-2xl shadow-lg transition-colors ${className}`}>
        <h3 className="flex items-center text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-3 mb-6">
            {Icon && <Icon className="w-5 h-5 mr-3 text-[var(--primary)]" />}
            {title}
        </h3>
        {children}
    </div>
);


const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string, required?: boolean }> = ({ label, name, required, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            id={name}
            name={name}
            {...props}
            className={`mt-1 block w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-sm placeholder-slate-400 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all ${props.readOnly ? 'bg-slate-100 dark:bg-slate-800 opacity-70 cursor-not-allowed' : ''}`}
        />
    </div>
);

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

const ConsultationTab: React.FC<ConsultationTabProps> = ({ onSavePatient, existingPatient, patientFromReception, onNewPatient, drugMasterList, diagnosisMasterList, patients, draftData, setDraftData }) => {
    const [patientData, setPatientData] = useState(createNewPatient());
    const [paymentInfo, setPaymentInfo] = useState(initialPaymentInfo);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [patientId, setPatientId] = useState<string | null>(null);
    const [consultationHistory, setConsultationHistory] = useState<Patient[]>([]);

    const { grandTotal } = useMemo(() => {
        const total = (paymentInfo.consultationFee || 0) + (paymentInfo.drugCost || 0) + (paymentInfo.otherServicesCost || 0);
        return { grandTotal: total };
    }, [paymentInfo.consultationFee, paymentInfo.drugCost, paymentInfo.otherServicesCost]);

    // Sync state to parent draft whenever it changes
    useEffect(() => {
        setDraftData({
            patientData,
            paymentInfo,
            patientId
        });
    }, [patientData, paymentInfo, patientId, setDraftData]);

    useEffect(() => {
        if (drugMasterList.length === 0) {
            return;
        }

        const drugPriceMap = new Map(drugMasterList.map(drug => [drug.name.toLowerCase().trim(), drug.price]));

        const totalCost = patientData.prescription.reduce((total, item) => {
            const price = drugPriceMap.get(item.drugName.toLowerCase().trim());
            if (typeof price === 'number' && item.totalQuantity && item.totalQuantity > 0) {
                return total + (price * item.totalQuantity);
            }
            return total;
        }, 0);

        setPaymentInfo(prev => {
            if (prev.drugCost !== totalCost) {
                return { ...prev, drugCost: totalCost };
            }
            return prev;
        });
    }, [patientData.prescription, drugMasterList]);
    
    useEffect(() => {
      if (draftData) {
          setPatientData(draftData.patientData);
          setPaymentInfo(draftData.paymentInfo);
          setPatientId(draftData.patientId);
          return;
      }

      if (existingPatient) {
          const loadedPrescription = existingPatient.prescription.map(p => {
              const anyP = p as any;
              return {
                  id: `${Date.now()}-${p.id}`,
                  drugName: anyP.drugName || '',
                  morning: anyP.morning || '',
                  noon: anyP.noon || '',
                  afternoon: anyP.afternoon || '',
                  evening: anyP.evening || '',
                  duration: anyP.duration,
                  totalQuantity: anyP.totalQuantity,
                  usage: anyP.usage || 'uống',
                  unit: anyP.unit || 'viên',
              }
          });

          const loadedData = {
              name: existingPatient.name,
              age: existingPatient.age,
              gender: existingPatient.gender,
              address: existingPatient.address || '',
              vitals: { ...createNewPatient().vitals, ...existingPatient.vitals },
              symptoms: existingPatient.symptoms,
              diagnosis: existingPatient.diagnosis,
              prescription: loadedPrescription,
              prescriptionNote: existingPatient.prescriptionNote || '',
              consultationDate: existingPatient.consultationDate,
          };

          if (patientFromReception) {
              loadedData.name = patientFromReception.name;
              loadedData.age = patientFromReception.age;
              loadedData.gender = patientFromReception.gender;
              loadedData.address = patientFromReception.address || loadedData.address;
              loadedData.vitals.weight = patientFromReception.weight;
              loadedData.consultationDate = new Date().toISOString(); // Reset date for new consultation based on reception
              
              setPatientData(loadedData);
              setPatientId(null); 
              toast.success(`Đã tải dữ liệu cũ của bệnh nhân ${patientFromReception.name}.`, { icon: '🔄' });
          } else {
              setPatientData(loadedData);
              setPatientId(existingPatient.id);
          }
          setPaymentInfo(initialPaymentInfo);

      } else if (patientFromReception) {
          setPatientData({
              ...createNewPatient(),
              name: patientFromReception.name,
              age: patientFromReception.age,
              gender: patientFromReception.gender,
              address: patientFromReception.address || '',
              vitals: {
                  ...createNewPatient().vitals,
                  weight: patientFromReception.weight,
              }
          });
          setPatientId(null);
          setPaymentInfo(initialPaymentInfo);
      } else {
          // New patient, reset everything
          setPatientData(createNewPatient());
          setPaymentInfo(initialPaymentInfo);
          setPatientId(null);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [existingPatient, patientFromReception]); 

    useEffect(() => {
        const currentPatientName = patientData.name;
        if (currentPatientName) {
            const history = patients
                .filter(p => p.name.toLowerCase() === currentPatientName.toLowerCase())
                .sort((a, b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime());
            setConsultationHistory(history);
        } else {
            setConsultationHistory([]);
        }
    }, [patientData.name, patients]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'consultationDate') {
            // Value comes in as YYYY-MM-DDTHH:mm, we need to store it as full ISO string
            setPatientData(prev => ({ ...prev, consultationDate: new Date(value).toISOString() }));
        } else {
            setPatientData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handlePaymentInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['consultationFee', 'otherServicesCost', 'drugCost'].includes(name);
        setPaymentInfo(prev => ({ ...prev, [name]: isNumeric ? parseFloat(value) || 0 : value }));
    }

    const handleVitalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPatientData(prev => ({ ...prev, vitals: { ...prev.vitals, [name]: value } }));
    };

    const handlePrescriptionChange = (id: string, field: keyof Omit<PrescriptionItem, 'id'>, value: string | number) => {
        setPatientData(prev => {
            const newPrescription = prev.prescription.map(item => {
                if (item.id === id) {
                    const updatedItem = { ...item, [field]: value };
                    
                    if (field === 'drugName' && typeof value === 'string') {
                        const drugInfo = drugMasterList.find(d => d.name.toLowerCase() === value.toLowerCase());
                        updatedItem.usage = drugInfo?.usage || 'uống';
                        updatedItem.unit = drugInfo?.unit || 'viên';
                    }

                    const countableUsages = ['uống', 'ngậm dưới lưỡi', 'nhai'];
                    const isCountable = countableUsages.includes(updatedItem.usage || 'uống');

                    if (field === 'totalQuantity') {
                        const numericValue = Number(value);
                        updatedItem.totalQuantity = Number.isNaN(numericValue) ? undefined : Math.round(numericValue);
                        return updatedItem;
                    }

                    const fieldsThatAffectTotalQuantity = ['morning', 'noon', 'afternoon', 'evening', 'duration', 'usage', 'drugName'];
                    if (fieldsThatAffectTotalQuantity.includes(field)) {
                        if (isCountable) {
                            const m = parseFraction(updatedItem.morning || '0');
                            const n = parseFraction(updatedItem.noon || '0');
                            const a = parseFraction(updatedItem.afternoon || '0');
                            const e = parseFraction(updatedItem.evening || '0');
                            const dur = updatedItem.duration || 0;
                            updatedItem.totalQuantity = Math.ceil((m + n + a + e) * dur);
                        } else {
                           if (field === 'usage' || field === 'drugName') {
                                updatedItem.totalQuantity = 1;
                           }
                        }
                    }

                    if (field === 'duration') {
                         const numericValue = Number(value);
                         updatedItem.duration = Number.isNaN(numericValue) ? undefined : numericValue;
                    }
                    if (['morning', 'noon', 'afternoon', 'evening'].includes(field)) {
                         updatedItem[field as 'morning'] = String(value);
                    }
                    return updatedItem;
                }
                return item;
            });
            return { ...prev, prescription: newPrescription };
        });
    };

    const addPrescriptionRow = () => {
        setPatientData(prev => ({
            ...prev,
            prescription: [
                ...prev.prescription,
                { id: Date.now().toString(), drugName: '', morning: '1', noon: '', afternoon: '1', evening: '', duration: 7, usage: 'uống', totalQuantity: 14, unit: 'viên' },
            ],
        }));
    };

    const removePrescriptionRow = (id: string) => {
        setPatientData(prev => ({
            ...prev,
            prescription: prev.prescription.filter(item => item.id !== id),
        }));
    };

    const handleSuggestDiagnosis = async () => {
        setIsAiLoading(true);
        const suggestion = await getDiagnosisSuggestion(patientData.symptoms);
        setPatientData(prev => ({ ...prev, diagnosis: suggestion }));
        setIsAiLoading(false);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if(!patientData.name) {
            toast.error('Vui lòng nhập họ tên bệnh nhân.');
            return;
        }
        setIsSubmitting(true);
        const finalPatient: Patient = {
            id: patientId || generateUniqueId(),
            ...patientData,
            // We rely on the consultationDate that is already in patientData (either default or edited)
        };
        onSavePatient(finalPatient, paymentInfo);
        setIsSubmitting(false);
    };

    const handleNewPatient = () => {
        setPatientData(createNewPatient());
        setPaymentInfo(initialPaymentInfo);
        setPatientId(null);
        onNewPatient();
    };
    
    const applyHistory = (historicalPatient: Patient) => {
        setPatientData(prev => ({
            ...prev,
            symptoms: historicalPatient.symptoms,
            diagnosis: historicalPatient.diagnosis,
            prescription: historicalPatient.prescription.map(item => ({ ...item, id: `${Date.now()}-${(item as any).id || Math.random()}` })),
            // CRITICAL CHANGE: Reset consultationDate to NOW so it creates a new record for today
            consultationDate: new Date().toISOString(),
        }));
        setPatientId(null); // Clear ID to ensure creation of new record
        toast.success(`Đã áp dụng thông tin khám cũ (Ngày khám mới đã được đặt là hôm nay)`);
    };
    
    const inputClass = "mt-1 block w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-sm placeholder-slate-400 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all";
    const labelClass = "block text-sm font-medium text-[var(--text-secondary)] mb-1";
    
    const prescriptionInputClass = "bg-transparent text-[var(--text-primary)] focus:outline-none text-sm p-1 rounded-md focus:bg-[var(--card)] focus:ring-1 focus:ring-[var(--primary)]";
    const prescriptionLabelClass = "text-xs text-[var(--text-secondary)] whitespace-nowrap";

    return (
        <form onSubmit={handleSave} className="space-y-6">
            {patientFromReception && !existingPatient && (
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg mb-6 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400">
                    <p className="font-bold">👉 Đang khám cho bệnh nhân: {patientFromReception.name}</p>
                </div>
            )}
            {patientFromReception && existingPatient && (
                 <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6 dark:bg-green-900/30 dark:text-green-300 dark:border-green-400">
                    <p className="font-bold">🔄 Đang tải lại dữ liệu cũ cho bệnh nhân: {patientFromReception.name}</p>
                    <p className="text-sm">Đây sẽ là lần khám mới (Ngày khám đã được đặt là hôm nay).</p>
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Thông tin bệnh nhân">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <InputField label="Họ tên bệnh nhân" name="name" value={patientData.name} onChange={handleInputChange} required />
                            </div>
                            <InputField label="Tuổi" name="age" value={patientData.age} onChange={handleInputChange} />
                            <div>
                                <label htmlFor="gender" className={labelClass}>Giới tính</label>
                                <select id="gender" name="gender" value={patientData.gender} onChange={handleInputChange} className={inputClass}>
                                    <option>Nam</option>
                                    <option>Nữ</option>
                                    <option>Khác</option>
                                </select>
                            </div>
                            <div className="md:col-span-1">
                                <InputField 
                                    label="Ngày khám" 
                                    name="consultationDate" 
                                    type="datetime-local" 
                                    value={formatDateForInput(patientData.consultationDate)} 
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="md:col-span-2">
                                <InputField label="Địa chỉ" name="address" value={patientData.address || ''} onChange={handleInputChange} />
                            </div>
                        </div>
                    </Card>
                    <Card title="Khám và chẩn đoán">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="symptoms" className={labelClass}>Triệu chứng lâm sàng</label>
                                <textarea id="symptoms" name="symptoms" value={patientData.symptoms} onChange={handleInputChange} rows={4} className={inputClass} placeholder="Mô tả các triệu chứng của bệnh nhân..."></textarea>
                            </div>
                             <div>
                                <label htmlFor="diagnosis" className={labelClass}>Chẩn đoán</label>
                                <div className="relative">
                                    <input
                                        id="diagnosis"
                                        name="diagnosis"
                                        list="diagnosis-list"
                                        value={patientData.diagnosis}
                                        onChange={handleInputChange}
                                        className={inputClass}
                                        placeholder="Chọn hoặc nhập chẩn đoán mới..."
                                        autoComplete="off"
                                    />
                                    <datalist id="diagnosis-list">
                                        {diagnosisMasterList.map(d => <option key={d} value={d} />)}
                                    </datalist>
                                    <button type="button" onClick={handleSuggestDiagnosis} disabled={isAiLoading || !patientData.symptoms} className="absolute bottom-2 right-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed transition-all">
                                        <Wand2 className="w-4 h-4 mr-1"/>
                                        {isAiLoading ? 'Đang phân tích...' : 'Gợi ý chẩn đoán'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card title="Dấu hiệu sinh tồn">
                        <div className="grid grid-cols-1 gap-4">
                            <InputField label="Cân nặng (kg)" name="weight" value={patientData.vitals.weight || ''} onChange={handleVitalsChange} placeholder="VD: 65" />
                        </div>
                    </Card>
                    
                    {consultationHistory.length > 0 && (
                        <Card title="Lịch sử khám" icon={History}>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {consultationHistory.map(hist => (
                                    <button
                                        key={hist.id}
                                        type="button"
                                        onClick={() => applyHistory(hist)}
                                        className="w-full text-left p-2 rounded-lg hover:bg-[var(--background)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                    >
                                        <p className="font-semibold text-sm text-[var(--text-primary)]">
                                            {new Date(hist.consultationDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </p>
                                        <p className="text-xs text-[var(--text-secondary)] truncate" title={hist.diagnosis}>
                                            {hist.diagnosis.split('\n')[0] || 'Chưa có chẩn đoán'}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            <Card title="Kê đơn thuốc">
                <div className="space-y-3">
                    {patientData.prescription.map((item, index) => {
                         const countableUsages = ['uống', 'ngậm dưới lưỡi', 'nhai'];
                         const isCountable = countableUsages.includes(item.usage || 'uống');
                         const suffix = isCountable ? (item.unit || 'viên') : 'lần';

                        return (
                        <div key={item.id} className="flex flex-col sm:flex-row sm:items-start sm:gap-2 p-3 rounded-lg bg-[var(--background)] border border-transparent hover:border-[var(--border)] relative group transition-all">
                           <span className="text-sm font-semibold text-[var(--text-secondary)] sm:pt-2">{index + 1}.</span>
                           <div className="flex-grow space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                     <input
                                        list="drug-list"
                                        value={item.drugName}
                                        onChange={e => handlePrescriptionChange(item.id, 'drugName', e.target.value)}
                                        className={`${prescriptionInputClass} sm:w-40 md:w-56 font-medium`}
                                        placeholder="Tên thuốc"
                                    />
                                    <select
                                        value={item.usage || 'uống'}
                                        onChange={e => handlePrescriptionChange(item.id, 'usage', e.target.value)}
                                        className={`${prescriptionInputClass} w-28 text-center capitalize`}
                                    >
                                        <option value="uống">uống</option>
                                        <option value="ngậm dưới lưỡi">ngậm dưới lưỡi</option>
                                        <option value="nhai">nhai</option>
                                        <option value="thoa">thoa</option>
                                        <option value="rửa">rửa</option>
                                        <option value="tắm">tắm</option>
                                        <option value="gội">gội</option>
                                        <option value="ngâm">ngâm</option>
                                        <option value="nhỏ mắt">nhỏ mắt</option>
                                        <option value="nhỏ tai">nhỏ tai</option>
                                        <option value="nhỏ mũi">nhỏ mũi</option>
                                        <option value="xịt">xịt</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-x-3 gap-y-2 flex-wrap">
                                    <div className="flex items-center gap-1">
                                        <label className={prescriptionLabelClass}>Sáng</label>
                                        <input type="text" value={item.morning} onChange={e => handlePrescriptionChange(item.id, 'morning', e.target.value)} className={`${prescriptionInputClass} w-10 text-center`} />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <label className={prescriptionLabelClass}>Trưa</label>
                                        <input type="text" value={item.noon} onChange={e => handlePrescriptionChange(item.id, 'noon', e.target.value)} className={`${prescriptionInputClass} w-10 text-center`} />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <label className={prescriptionLabelClass}>Chiều</label>
                                        <input type="text" value={item.afternoon} onChange={e => handlePrescriptionChange(item.id, 'afternoon', e.target.value)} className={`${prescriptionInputClass} w-10 text-center`} />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <label className={prescriptionLabelClass}>Tối</label>
                                        <input type="text" value={item.evening} onChange={e => handlePrescriptionChange(item.id, 'evening', e.target.value)} className={`${prescriptionInputClass} w-10 text-center`} />
                                    </div>
                                    <span className={`${prescriptionLabelClass} capitalize self-center`}>{suffix}</span>
                                    
                                    {isCountable && (
                                        <div className="flex items-center gap-1">
                                            <span className={prescriptionLabelClass}>trong</span>
                                            <input type="number" value={item.duration || ''} onChange={e => handlePrescriptionChange(item.id, 'duration', e.target.value)} className={`${prescriptionInputClass} w-12 text-center`} />
                                            <span className={prescriptionLabelClass}>ngày</span>
                                        </div>
                                    )}
                                </div>
                           </div>
                           <div className="flex items-center gap-1 mt-2 sm:mt-0 sm:pt-2 sm:pl-2 sm:border-l sm:border-[var(--border)] flex-shrink-0">
                                <span className="text-sm font-semibold text-[var(--primary)] whitespace-nowrap">Tổng SL:</span>
                                <input
                                    type="number" step="1"
                                    value={item.totalQuantity || ''}
                                    onChange={e => handlePrescriptionChange(item.id, 'totalQuantity', e.target.value)}
                                    className={`${prescriptionInputClass} w-16 text-center font-bold`}
                                    placeholder="SL"
                                    readOnly={isCountable}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removePrescriptionRow(item.id)}
                                className="absolute top-2 right-2 sm:relative sm:top-auto sm:right-auto sm:self-start sm:pt-2 text-[var(--text-secondary)]/60 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )})}
                    <datalist id="drug-list">
                        {drugMasterList.map(drug => <option key={drug.name} value={drug.name} />)}
                    </datalist>
                </div>
                <div className="mt-4 flex flex-col gap-4">
                    <div>
                        <button
                            type="button"
                            onClick={addPrescriptionRow}
                            className="inline-flex items-center px-4 py-2 border border-dashed border-[var(--border)] text-sm font-medium rounded-lg text-[var(--primary)] bg-transparent hover:bg-[var(--primary-light)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] transition-all"
                        >
                            <Plus size={16} className="mr-2" />
                            Thêm thuốc
                        </button>
                    </div>

                    <div className="pt-4 border-t border-[var(--border)]">
                         <label htmlFor="prescriptionNote" className="flex items-center text-sm font-medium text-[var(--text-secondary)] mb-1">
                             <FileText size={16} className="mr-2" />
                             Ghi chú đơn thuốc (Nội bộ - Không in)
                         </label>
                        <textarea
                            id="prescriptionNote"
                            name="prescriptionNote"
                            value={patientData.prescriptionNote || ''}
                            onChange={handleInputChange}
                            rows={2}
                            className={inputClass}
                            placeholder="Nhập ghi chú hoặc lời dặn dò riêng cho đơn thuốc này..."
                        />
                    </div>
                </div>
            </Card>
            
            <Card title="Chi phí & Thanh toán" icon={DollarSign}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                      <InputField label="Phí khám (VNĐ)" name="consultationFee" type="number" value={paymentInfo.consultationFee} onChange={handlePaymentInfoChange} placeholder="Nhập phí khám" />
                    </div>
                    <div className="lg:col-span-1">
                      <InputField label="Dịch vụ khác (VNĐ)" name="otherServicesCost" type="number" value={paymentInfo.otherServicesCost} onChange={handlePaymentInfoChange} placeholder="Chi phí khác" />
                    </div>
                    <div className="lg:col-span-1">
                        <label htmlFor="paymentStatus" className={labelClass}>Trạng thái</label>
                        <select id="paymentStatus" name="paymentStatus" value={paymentInfo.paymentStatus} onChange={handlePaymentInfoChange} className={inputClass}>
                            <option value="unpaid">Chưa thu</option>
                            <option value="paid">Đã thu</option>
                        </select>
                    </div>
                    <div className="bg-[var(--primary-light)] p-4 rounded-lg flex flex-col justify-center dark:bg-blue-900/30 lg:col-span-1">
                        <label className="text-sm font-medium text-blue-800 dark:text-blue-200">TỔNG CỘNG</label>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{grandTotal.toLocaleString('vi-VN')} VNĐ</p>
                    </div>
                </div>
            </Card>

            <div className="sticky bottom-0 bg-[var(--card)]/80 backdrop-blur-sm py-4 px-6 -mx-8 -mb-8 mt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                <button type="button" onClick={handleNewPatient} className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 border border-[var(--border)] text-sm font-semibold rounded-lg text-[var(--text-primary)] bg-[var(--card)] hover:bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] transition-all">
                    <UserPlus size={16} className="mr-2"/>
                    Tạo bệnh nhân mới
                </button>
                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] disabled:bg-blue-300 dark:disabled:bg-blue-800 transition-all">
                    <Save size={16} className="mr-2"/>
                    {isSubmitting ? 'Đang lưu...' : (patientId ? 'Cập nhật & Lưu hóa đơn' : 'Lưu hồ sơ & Hóa đơn')}
                </button>
            </div>
        </form>
    );
};

export default ConsultationTab;
