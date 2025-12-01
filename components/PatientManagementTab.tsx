
import React, { useState, useMemo, useCallback } from 'react';
import { Patient, PrescriptionItem, RevenueRecord, Language, DateFormat } from '../types';
import PatientDetailModal from './PatientDetailModal';
import ConfirmationModal from './ConfirmationModal';
import { Search, UserPlus, FileUp, FileDown, Loader2, Edit, Trash2, UploadCloud, Stethoscope } from 'lucide-react';
import { toast } from 'react-hot-toast';


interface PatientManagementTabProps {
  patients: Patient[];
  revenueData: RevenueRecord[];
  onEditPatient: (patient: Patient) => void;
  onRevisitPatient: (patient: Patient) => void;
  onDeletePatient: (patientId: string) => void;
  onNewPatient: () => void;
  dataRetentionPeriod: string;
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  setRevenueData: React.Dispatch<React.SetStateAction<RevenueRecord[]>>;
  globalSearchTerm: string;
  userName: string;
  language: Language;
  dateFormat: DateFormat;
  webAppUrl: string;
}

const tableHeaders = {
    name: { vi: 'Họ tên', en: 'Name' },
    age: { vi: 'Tuổi', en: 'Age' },
    gender: { vi: 'Giới tính', en: 'Gender' },
    diagnosis: { vi: 'Chẩn đoán', en: 'Diagnosis' },
    date: { vi: 'Ngày khám', en: 'Consultation Date' },
    revenue: { vi: 'Doanh thu', en: 'Revenue' },
};

const PatientManagementTab: React.FC<PatientManagementTabProps> = ({ patients, revenueData, onEditPatient, onRevisitPatient, onDeletePatient, onNewPatient, dataRetentionPeriod, setPatients, setRevenueData, globalSearchTerm, language, dateFormat, userName, webAppUrl }) => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isPushing, setIsPushing] = useState(false);


  const formatDate = useCallback((isoDate: string) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    if (dateFormat === 'dd/mm/yyyy') {
      return `${day}/${month}/${year}`;
    } else { // mm/dd/yyyy
      return `${month}/${day}/${year}`;
    }
  }, [dateFormat]);

  const patientRevenueMap = useMemo(() => {
    const revenueMap = new Map<string, number>();
    revenueData.forEach(record => {
        const currentTotal = revenueMap.get(record.patientId) || 0;
        revenueMap.set(record.patientId, currentTotal + record.total);
    });
    return revenueMap;
  }, [revenueData]);

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient);
  };
  
  const handleCloseModal = () => {
    setSelectedPatient(null);
  };
  
  const requestDelete = (patient: Patient) => {
    setPatientToDelete(patient);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    if (patientToDelete) {
      onDeletePatient(patientToDelete.id);
    }
    setIsConfirmModalOpen(false);
    setPatientToDelete(null);
  };
  
  const timeFilteredPatients = useMemo(() => {
    const getCutoffDate = (period: string): Date | null => {
        const now = new Date();
        switch (period) {
            case '6m':
                return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
            case '12m':
                return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            case '24m':
                return new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());
            case 'all':
            default:
                return null;
        }
    };

    const cutoffDate = getCutoffDate(dataRetentionPeriod);
    if (!cutoffDate) {
        return patients;
    }
    cutoffDate.setHours(0, 0, 0, 0);
    
    return patients.filter(patient => {
        const patientDate = new Date(patient.consultationDate);
        return patientDate >= cutoffDate;
    });
  }, [patients, dataRetentionPeriod]);


  const filteredPatients = timeFilteredPatients.filter(patient => 
    patient.name.toLowerCase().includes(globalSearchTerm.toLowerCase())
  );

  const getPeriodDescription = (period: string): string => {
      switch (period) {
          case '6m': return language === 'vi' ? '6 tháng qua' : 'last 6 months';
          case '12m': return language === 'vi' ? '12 tháng qua' : 'last 12 months';
          case '24m': return language === 'vi' ? '24 tháng qua' : 'last 24 months';
          case 'all': return language === 'vi' ? 'tất cả thời gian' : 'all time';
          default: return language === 'vi' ? '12 tháng qua' : 'last 12 months';
      }
  };
  
  const escapeCsvCell = (cell: any): string => {
    if (cell == null) return '';
    const str = String(cell);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const handleExportToCSV = () => {
    if (patients.length === 0) {
      toast.error(language === 'vi' ? 'Không có dữ liệu bệnh nhân để xuất.' : 'No patient data to export.');
      return;
    }
    const toastId = toast.loading(language === 'vi' ? 'Đang chuẩn bị file...' : 'Preparing file...');

    const headers = [
      'id', 'name', 'age', 'gender', 'address', 'consultationDate',
      'pulse', 'bloodPressure', 'temperature', 'respiratoryRate',
      'symptoms', 'diagnosis', 'prescription', 'tongDoanhThu'
    ];

    const patientRows = patients.map(p => {
      const prescriptionString = JSON.stringify(p.prescription);
      const totalRevenue = patientRevenueMap.get(p.id) || 0;
      const row = [
        p.id, p.name, p.age, p.gender, p.address || '', p.consultationDate,
        p.vitals.pulse, p.vitals.bloodPressure, p.vitals.temperature, p.vitals.respiratoryRate,
        p.symptoms, p.diagnosis, prescriptionString, totalRevenue
      ];
      return row.map(escapeCsvCell).join(',');
    });

    const csvContent = [headers.join(','), ...patientRows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const today = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `danh-sach-benh-nhan_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(language === 'vi' ? 'Xuất file thành công!' : 'File exported successfully!', { id: toastId });
  };

  const parseCsvRow = (row: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result.map(val => val.trim());
  };

  const handleImportFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const toastId = toast.loading(language === 'vi' ? 'Đang nhập dữ liệu...' : 'Importing data...');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        
        if (lines.length <= 1) throw new Error(language === 'vi' ? 'File trống hoặc không có dữ liệu.' : 'File is empty or has no data.');

        const headers = parseCsvRow(lines[0].trim());
        const headerMap: { [key: string]: number } = {};
        headers.forEach((header, index) => {
            headerMap[header] = index;
        });

        if (headerMap['id'] === undefined || headerMap['name'] === undefined) {
            throw new Error(language === 'vi' ? 'Định dạng file không hợp lệ. Các cột bắt buộc: id, name.' : 'Invalid file format. Required columns: id, name.');
        }

        const existingPatientIds = new Set(patients.map(p => p.id));
        let importedCount = 0;
        let skippedCount = 0;
        const newPatients: Patient[] = [];
        const newRevenueRecords: RevenueRecord[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = parseCsvRow(lines[i].trim());
          
          const patientDataId = values[headerMap['id']];
          if (!patientDataId || existingPatientIds.has(patientDataId)) {
            skippedCount++;
            continue;
          }

          let prescription: PrescriptionItem[] = [];
          try {
            prescription = JSON.parse(values[headerMap['prescription']] || '[]');
            if (!Array.isArray(prescription)) prescription = [];
          } catch {
            prescription = [];
          }
          
          const newPatient: Patient = {
            id: patientDataId,
            name: values[headerMap['name']] || '',
            age: values[headerMap['age']] || '',
            gender: values[headerMap['gender']] || 'Nam',
            address: values[headerMap['address']] || '',
            consultationDate: values[headerMap['consultationDate']] || new Date().toISOString(),
            vitals: {
              pulse: values[headerMap['pulse']] || '',
              bloodPressure: values[headerMap['bloodPressure']] || '',
              temperature: values[headerMap['temperature']] || '',
              respiratoryRate: values[headerMap['respiratoryRate']] || '',
            },
            symptoms: values[headerMap['symptoms']] || '',
            diagnosis: values[headerMap['diagnosis']] || '',
            prescription: prescription,
          };
          newPatients.push(newPatient);

          const totalRevenue = parseFloat(values[headerMap['tongDoanhThu']]);
          if (!isNaN(totalRevenue) && totalRevenue > 0) {
              const newRecord: RevenueRecord = {
                  id: `rev-${newPatient.id}-${Date.now()}`,
                  patientId: newPatient.id,
                  patientName: newPatient.name,
                  consultationFee: 0,
                  drugCost: 0,
                  otherServicesCost: totalRevenue,
                  total: totalRevenue,
                  paymentStatus: 'paid',
                  date: newPatient.consultationDate,
                  prescription: prescription,
              };
              newRevenueRecords.push(newRecord);
          }

          importedCount++;
        }
        
        if (importedCount > 0) {
          setPatients(prev => 
            [...prev, ...newPatients].sort((a, b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime())
          );
           if (newRevenueRecords.length > 0) {
              setRevenueData(prev =>
                  [...prev, ...newRevenueRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              );
          }
        }
        
        toast.success(language === 'vi' ? `Nhập thành công ${importedCount} BN mới. Bỏ qua ${skippedCount} BN trùng lặp.` : `Imported ${importedCount} new patients. Skipped ${skippedCount} duplicates.`, { id: toastId, duration: 5000 });
      } catch (error) {
        console.error("Import error:", error);
        toast.error(language === 'vi' ? `Lỗi khi nhập file: ${error instanceof Error ? error.message : 'Định dạng không đúng.'}` : `Import error: ${error instanceof Error ? error.message : 'Invalid format.'}`, { id: toastId });
      } finally {
        setIsImporting(false);
        if (event.target) event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

    const handlePushData = async () => {
        if (!webAppUrl || !webAppUrl.startsWith('https://script.google.com/macros/s/')) {
            toast.error('Vui lòng vào tab "Đồng bộ hóa" để cấu hình URL Google Sheet hợp lệ.');
            return;
        }
        
        setIsPushing(true);
        const toastId = toast.loading('Đang chuẩn bị dữ liệu...');
        
        try {
            const dataToSync = patients.map(p => {
                const totalRevenue = patientRevenueMap.get(p.id) || 0;

                const prescriptionVietnamese = p.prescription.map((item, index) => {
                    const { usage = 'uống', morning, noon, afternoon, evening, unit = 'viên' } = item;
                    const parts = [];
                    const isCountable = ['uống', 'ngậm dưới lưỡi', 'nhai'].includes(usage);
                    const suffix = isCountable ? ` ${unit}` : ' lần';

                    if (morning) parts.push(`sáng ${morning}${suffix}`);
                    if (noon) parts.push(`trưa ${noon}${suffix}`);
                    if (afternoon) parts.push(`chiều ${afternoon}${suffix}`);
                    if (evening) parts.push(`tối ${evening}${suffix}`);

                    let instructions = parts.length > 0 ? `${usage} ${parts.join(', ')}` : usage;
                    
                    return `${index + 1}. ${item.drugName}: ${instructions}. (Tổng SL: ${item.totalQuantity || 'N/A'})`;
                }).join('\n');


                return [
                    p.id, p.name, p.age, p.gender, p.address || '', p.consultationDate,
                    p.vitals.pulse, p.vitals.bloodPressure, p.vitals.temperature, p.vitals.respiratoryRate,
                    p.symptoms, p.diagnosis, JSON.stringify(p.prescription), prescriptionVietnamese, totalRevenue
                ];
            });
            
            toast.loading(`Đang đẩy ${dataToSync.length} hồ sơ...`, { id: toastId });

            const response = await fetch(webAppUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ data: dataToSync }),
                mode: 'cors',
            });
            
            if (response.status !== 200) {
                 throw new Error(`Lỗi máy chủ: ${response.statusText} (${response.status})`);
            }

            const result = await response.json();

            if (result.status === 'success') {
                const message = `Đẩy dữ liệu thành công! ${result.rowsAdded || 0} hồ sơ mới, ${result.rowsUpdated || 0} hồ sơ được cập nhật. Tổng cộng: ${result.totalRows || 0} hồ sơ.`;
                toast.success(message, { id: toastId, duration: 5000 });
            } else {
                throw new Error(result.message || 'Lỗi không xác định từ Apps Script.');
            }
        } catch (error) {
            console.error('Push failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
            toast.error(`Đẩy dữ liệu thất bại: ${errorMessage}`, { id: toastId, duration: 6000 });
        } finally {
            setIsPushing(false);
        }
    };


  if (patients.length === 0) {
    return (
      <div className="text-center py-20 bg-[var(--card)] rounded-2xl shadow-lg">
        <h3 className="text-xl font-semibold text-[var(--text-primary)]">Chưa có bệnh nhân nào</h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Chuyển qua tab "Khám bệnh" để thêm bệnh nhân mới hoặc nhập từ file.
        </p>
        <div className="flex justify-center items-center gap-4 mt-6">
            <button onClick={onNewPatient} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]">
                <UserPlus size={18} className="mr-2" />
                Thêm bệnh nhân mới
            </button>
            <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-dashed border-[var(--border)] text-sm font-medium rounded-lg text-[var(--primary)] bg-transparent hover:bg-[var(--primary-light)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]">
                <FileUp size={16} className="mr-2" />
                <span>Nhập từ file</span>
                <input type="file" className="hidden" accept=".csv" onChange={handleImportFromCSV} disabled={isImporting} />
            </label>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] p-4 sm:p-6 rounded-2xl shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center border-b border-[var(--border)] pb-4 mb-4 gap-4">
            <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{language === 'vi' ? 'Danh sách bệnh nhân' : 'Patient List'} ({filteredPatients.length})</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {language === 'vi' ? 'Hiển thị dữ liệu từ' : 'Showing data from'} {getPeriodDescription(dataRetentionPeriod)}.
                </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                 <label className="cursor-pointer inline-flex items-center justify-center px-3 py-2 border border-[var(--border)] text-sm font-medium rounded-lg text-[var(--text-secondary)] bg-transparent hover:bg-[var(--background)] hover:border-[var(--primary)] transition-colors">
                    {isImporting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <FileUp size={16} className="mr-2" />}
                    <span>{language === 'vi' ? 'Nhập' : 'Import'}</span>
                    <input type="file" className="hidden" accept=".csv" onChange={handleImportFromCSV} disabled={isImporting} />
                </label>
                <button onClick={handleExportToCSV} className="inline-flex items-center justify-center px-3 py-2 border border-[var(--border)] text-sm font-medium rounded-lg text-[var(--text-secondary)] bg-transparent hover:bg-[var(--background)] hover:border-[var(--primary)] transition-colors">
                    <FileDown size={16} className="mr-2" />
                    <span>{language === 'vi' ? 'Xuất Excel' : 'Export'}</span>
                </button>
                <button onClick={handlePushData} disabled={isPushing || isImporting} className="inline-flex items-center justify-center px-3 py-2 border border-[var(--border)] text-sm font-medium rounded-lg text-[var(--text-secondary)] bg-transparent hover:bg-[var(--background)] hover:border-[var(--primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isPushing ? <Loader2 size={16} className="mr-2 animate-spin" /> : <UploadCloud size={16} className="mr-2" />}
                    <span>{language === 'vi' ? 'Đẩy lên Sheets' : 'Push to Sheets'}</span>
                </button>
            </div>
        </div>

        {filteredPatients.length > 0 ? (
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--border)]">
                  <thead className="bg-[var(--background)]">
                      <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{tableHeaders.name[language]}</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider hidden sm:table-cell">{tableHeaders.age[language]}</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider hidden md:table-cell">{tableHeaders.gender[language]}</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{tableHeaders.diagnosis[language]}</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider hidden md:table-cell">{tableHeaders.date[language]}</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider hidden md:table-cell">{tableHeaders.revenue[language]}</th>
                          <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                      </tr>
                  </thead>
                  <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
                      {filteredPatients.map((patient) => (
                          <tr key={patient.id} className="hover:bg-[var(--background)] transition-colors duration-200">
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <button onClick={() => handleViewDetails(patient)} className="text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-dark)]">{patient.name}</button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)] hidden sm:table-cell">{patient.age}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)] hidden md:table-cell">{patient.gender}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)] truncate max-w-xs">{patient.diagnosis.split('\n')[0]}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary)] hidden md:table-cell">{formatDate(patient.consultationDate)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400 hidden md:table-cell">
                                {(patientRevenueMap.get(patient.id) || 0).toLocaleString('vi-VN')} VNĐ
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-2">
                                  <button onClick={() => onRevisitPatient(patient)} className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30" aria-label={`Tái khám cho ${patient.name}`}>
                                     <Stethoscope size={14} /> <span>{language === 'vi' ? 'Tái khám' : 'Revisit'}</span>
                                  </button>
                                  <button onClick={() => onEditPatient(patient)} className="flex items-center space-x-1 text-sm text-[var(--primary)] hover:text-[var(--primary-dark)] font-semibold transition-colors px-2 py-1 rounded-md hover:bg-[var(--primary-light)]" aria-label={`Sửa hồ sơ ${patient.name}`}>
                                    <Edit size={14} /> <span>{language === 'vi' ? 'Sửa' : 'Edit'}</span>
                                  </button>
                                  <button onClick={() => requestDelete(patient)} className="flex items-center space-x-1 text-sm text-red-500 hover:text-red-700 font-semibold transition-colors px-2 py-1 rounded-md hover:bg-red-500/10" aria-label={`Xóa bệnh nhân ${patient.name}`}>
                                    <Trash2 size={14} /> <span>{language === 'vi' ? 'Xóa' : 'Delete'}</span>
                                  </button>
                                </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
        ) : (
          <div className="text-center py-10 bg-[var(--background)] rounded-lg">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">Không tìm thấy kết quả</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Không có bệnh nhân nào khớp với tiêu chí tìm kiếm trong khoảng thời gian đã chọn.
            </p>
          </div>
        )}

        {selectedPatient && (
            <PatientDetailModal
                patient={selectedPatient}
                onClose={handleCloseModal}
            />
        )}
        
        <ConfirmationModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={confirmDelete}
            title="Xác nhận xóa bệnh nhân"
            message={
                <p>
                    Bạn có chắc muốn xóa bệnh nhân <strong className="font-semibold text-[var(--text-primary)]">{patientToDelete?.name}</strong>?
                    <br />
                    Toàn bộ lịch sử khám và hóa đơn của bệnh nhân này cũng sẽ bị xóa vĩnh viễn.
                </p>
            }
            confirmText="Xóa bệnh nhân"
        />
    </div>
  );
};

export default PatientManagementTab;
