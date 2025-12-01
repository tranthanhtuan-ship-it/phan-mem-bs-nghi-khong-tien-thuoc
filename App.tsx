import React, { useState, useCallback, useEffect } from 'react';
import { Patient, Drug, RevenueRecord, ReceptionPatient, Language, DateFormat, ReceptionDraft } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import ConsultationTab from './components/ConsultationTab';
import PatientManagementTab from './components/PatientManagementTab';
import DrugManagementTab from './components/DrugManagementTab';
import DashboardTab from './components/DashboardTab';
import ReportsTab from './components/ReportsTab';
import SettingsTab from './components/SettingsTab';
import ReceptionTab from './components/ReceptionTab';
import HistoryModal from './components/HistoryModal';
import { INITIAL_DRUG_MASTER_LIST, INITIAL_DIAGNOSIS_LIST } from './constants';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { Toaster, toast } from 'react-hot-toast';
import SyncTab from './components/SyncTab';
import DiagnosisManagementTab from './components/DiagnosisManagementTab';

export type Tab = 'dashboard' | 'reception' | 'consultation' | 'management' | 'drugs' | 'diagnosis' | 'reports' | 'settings' | 'sync';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [patients, setPatients] = useLocalStorage<Patient[]>('clinic-patients', []);
  const [drugMasterList, setDrugMasterList] = useLocalStorage<Drug[]>('clinic-drugs', INITIAL_DRUG_MASTER_LIST);
  const [diagnosisMasterList, setDiagnosisMasterList] = useLocalStorage<string[]>('clinic-diagnoses', INITIAL_DIAGNOSIS_LIST);
  const [revenueData, setRevenueData] = useLocalStorage<RevenueRecord[]>('clinic-revenue', []);
  const [receptionList, setReceptionList] = useLocalStorage<ReceptionPatient[]>('clinic-reception-list', []);
  const [userName, setUserName] = useLocalStorage<string>('clinic-userName', "PK BS Nghi");
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [patientFromReception, setPatientFromReception] = useState<ReceptionPatient | null>(null);
  const [webAppUrl, setWebAppUrl] = useLocalStorage<string>('clinic-google-sheet-sync-url', '');


  const [themeMode, setThemeMode] = useLocalStorage<'light' | 'dark'>('clinic-themeMode', 'light');
  const [primaryColor, setPrimaryColor] = useLocalStorage<string>('clinic-primaryColor', 'blue');
  const [fontSize, setFontSize] = useLocalStorage<string>('clinic-fontSize', 'md');
  const [dataRetentionPeriod, setDataRetentionPeriod] = useLocalStorage<string>('clinic-dataRetentionPeriod', '12m');
  const [historyModalData, setHistoryModalData] = useState<{
    targetPatient: ReceptionPatient | null;
    phase: 'select_person' | 'view_history';
    uniquePatients: Patient[];
    historyForSelected: Patient[];
  }>({
    targetPatient: null,
    phase: 'select_person',
    uniquePatients: [],
    historyForSelected: [],
  });


  // New system settings state
  const [language, setLanguage] = useLocalStorage<Language>('clinic-language', 'vi');
  const [dateFormat, setDateFormat] = useLocalStorage<DateFormat>('clinic-dateFormat', 'dd/mm/yyyy');
  const [autoLogoutDuration, setAutoLogoutDuration] = useLocalStorage<string>('clinic-autoLogoutDuration', '1h');

  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  // --- PERSISTENCE STATE (DRAFTS) ---
  // Store the state of the Reception Tab (modal open status and form data)
  const [receptionDraft, setReceptionDraft] = useState<ReceptionDraft>({
      isOpen: false,
      formData: { name: '', age: '', gender: 'Nam', weight: '', address: '' }
  });

  // Store the state of the Consultation Tab
  const [consultationDraft, setConsultationDraft] = useState<any>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(themeMode);

    const colorMap: { [key: string]: string } = { blue: '217', green: '142', purple: '262', red: '0', orange: '25' };
    root.style.setProperty('--primary-hue', colorMap[primaryColor] || '217');

    const sizeMap: { [key: string]: string } = { sm: '14px', md: '16px', lg: '18px' };
    root.style.fontSize = sizeMap[fontSize] || '16px';
  }, [themeMode, primaryColor, fontSize]);

  // Inactivity logout effect
  useEffect(() => {
    if (autoLogoutDuration === 'never') return;

    let logoutTimer: number;

    const durations: { [key: string]: number } = {
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
    };
    const logoutTime = durations[autoLogoutDuration];
    if (!logoutTime) return;

    const logoutMessage = language === 'vi' 
      ? 'Bạn đã tự động đăng xuất do không hoạt động.'
      : 'You have been automatically logged out due to inactivity.';

    const resetTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = window.setTimeout(() => {
        toast(logoutMessage, { icon: '🔒' });
      }, logoutTime);
    };

    const activityEvents: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(logoutTimer);
      activityEvents.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [autoLogoutDuration, language]);


  const handleSavePatient = useCallback((patient: Patient, paymentInfo: Pick<RevenueRecord, 'consultationFee' | 'otherServicesCost' | 'drugCost' | 'paymentStatus'>) => {
    const trimmedDiagnosis = patient.diagnosis.trim();
    if (trimmedDiagnosis && !diagnosisMasterList.some(d => d.toLowerCase() === trimmedDiagnosis.toLowerCase())) {
        setDiagnosisMasterList(prev => [...prev, trimmedDiagnosis].sort((a, b) => a.localeCompare(b)));
        toast.success(`Đã thêm chẩn đoán mới: "${trimmedDiagnosis}"`);
    }

    setPatients(prevPatients => {
        const existingPatientIndex = prevPatients.findIndex(p => p.id === patient.id);
        let updatedPatients;
        if (existingPatientIndex > -1) {
            updatedPatients = [...prevPatients];
            updatedPatients[existingPatientIndex] = patient;
            toast.success(language === 'vi' ? `Đã cập nhật hồ sơ bệnh nhân ${patient.name}` : `Updated patient profile for ${patient.name}`);
        } else {
            updatedPatients = [...prevPatients, patient];
            toast.success(language === 'vi' ? `Đã tạo hồ sơ mới cho bệnh nhân ${patient.name}` : `Created new profile for patient ${patient.name}`);
        }
        return updatedPatients.sort((a, b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime());
    });
    
    const total = paymentInfo.consultationFee + paymentInfo.drugCost + paymentInfo.otherServicesCost;

    setRevenueData(prevRevenue => {
        const existingRecordIndex = prevRevenue.findIndex(r => r.patientId === patient.id);
        
        if (existingRecordIndex > -1) {
            const updatedRevenue = [...prevRevenue];
            const oldRecord = updatedRevenue[existingRecordIndex];
            updatedRevenue[existingRecordIndex] = {
                ...oldRecord,
                patientName: patient.name,
                consultationFee: paymentInfo.consultationFee,
                drugCost: paymentInfo.drugCost,
                otherServicesCost: paymentInfo.otherServicesCost,
                total: total,
                paymentStatus: paymentInfo.paymentStatus,
                date: patient.consultationDate,
                prescription: patient.prescription,
            };
            toast.success(language === 'vi' ? `Đã cập nhật hóa đơn ${total.toLocaleString('vi-VN')} VNĐ` : `Updated invoice to ${total.toLocaleString('en-US')} VND`);
            return updatedRevenue.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else {
            const newRecord: RevenueRecord = {
                id: `rev-${patient.id}-${Date.now()}`,
                patientId: patient.id,
                patientName: patient.name,
                consultationFee: paymentInfo.consultationFee,
                drugCost: paymentInfo.drugCost,
                otherServicesCost: paymentInfo.otherServicesCost,
                total: total,
                paymentStatus: paymentInfo.paymentStatus,
                date: patient.consultationDate,
                prescription: patient.prescription,
            };
            toast.success(language === 'vi' ? `Đã lưu hóa đơn ${newRecord.total.toLocaleString('vi-VN')} VNĐ` : `Saved invoice of ${newRecord.total.toLocaleString('en-US')} VND`);
            return [...prevRevenue, newRecord].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
    });
    
    if (patientFromReception) {
        setReceptionList(prev => prev.filter(p => p.id !== patientFromReception.id));
        toast.success(language === 'vi' ? `Đã hoàn tất khám cho bệnh nhân "${patientFromReception.name}"` : `Finished consultation for patient "${patientFromReception.name}"`);
        setPatientFromReception(null);
    }
    
    // Clear the consultation draft after saving
    setConsultationDraft(null);
    setActiveTab('management');
  }, [setPatients, setRevenueData, patientFromReception, setReceptionList, language, diagnosisMasterList, setDiagnosisMasterList]);
  
  const handleDeletePatient = useCallback((patientId: string) => {
    const patientToDelete = patients.find(p => p.id === patientId);
    if (!patientToDelete) return;
    
    setPatients(prev => prev.filter(p => p.id !== patientId));
    setRevenueData(prev => prev.filter(r => r.patientId !== patientId));
    toast.success(language === 'vi' ? `Đã xóa bệnh nhân "${patientToDelete.name}" và các dữ liệu liên quan.` : `Deleted patient "${patientToDelete.name}" and related data.`);
  }, [patients, setPatients, setRevenueData, language]);


  const handleEditPatient = (patient: Patient) => {
    setCurrentPatient(patient);
    setPatientFromReception(null);
    // Clear draft when explicitly editing an existing patient
    setConsultationDraft(null);
    setActiveTab('consultation');
  };

  const handleRevisitPatient = (patient: Patient) => {
    // Treat revisiting as a new consultation with data from the old one
    // We act as if this patient came from reception with their current details
    const receptionDummy: ReceptionPatient = {
        id: `revisit-${Date.now()}`,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        address: patient.address || '',
        weight: patient.vitals.weight || '',
        receptionDate: new Date().toISOString()
    };

    setCurrentPatient(patient); // Load historical data into fields
    setPatientFromReception(receptionDummy); // Trigger "New Visit" logic (resets ID, sets date to Now)
    setConsultationDraft(null);
    setActiveTab('consultation');
  };
  
  const handleCreateNewPatient = () => {
    setCurrentPatient(null);
    setPatientFromReception(null);
    // Clear draft when explicitly starting a new patient
    setConsultationDraft(null);
    setActiveTab('consultation');
  };
  
  const handleStartConsultation = useCallback((patient: ReceptionPatient) => {
    setCurrentPatient(null);
    setPatientFromReception(patient);
    // Clear draft when starting consultation from reception
    setConsultationDraft(null);
    setActiveTab('consultation');
  }, []);

  const handleSearchHistory = useCallback((receptionPatient: ReceptionPatient) => {
    const allPatientsWithName = patients.filter(p =>
      p.name.toLowerCase() === receptionPatient.name.toLowerCase()
    );

    if (allPatientsWithName.length === 0) {
      toast('Không tìm thấy lịch sử khám cho bệnh nhân này.', { icon: 'ℹ️' });
      handleStartConsultation(receptionPatient);
      return;
    }

    const uniquePatientsMap = new Map<string, Patient>();
    allPatientsWithName.forEach(p => {
        const key = `${p.name.toLowerCase()}-${p.age}-${p.gender}`;
        if (!uniquePatientsMap.has(key)) {
            uniquePatientsMap.set(key, p);
        }
    });
    const uniquePatients = Array.from(uniquePatientsMap.values()).sort((a,b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime());

    setHistoryModalData({
        targetPatient: receptionPatient,
        phase: 'select_person',
        uniquePatients: uniquePatients,
        historyForSelected: [],
    });
  }, [patients, handleStartConsultation]);
  
  const handlePersonSelectForHistory = useCallback((selectedPerson: Patient) => {
    const history = patients.filter(p => 
        p.name.toLowerCase() === selectedPerson.name.toLowerCase() &&
        p.age === selectedPerson.age &&
        p.gender === selectedPerson.gender
    ).sort((a, b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime());
    
    setHistoryModalData(prev => ({
        ...prev,
        phase: 'view_history',
        historyForSelected: history,
    }));
  }, [patients]);
  
  const handleBackInHistoryModal = () => {
    setHistoryModalData(prev => ({
        ...prev,
        phase: 'select_person',
        historyForSelected: [],
    }));
  };

  const handleSelectHistoryRecord = (historicalPatient: Patient) => {
      const target = historyModalData.targetPatient;
      if (!target) return;

      setCurrentPatient(historicalPatient);
      setPatientFromReception(target);
      // Clear draft when loading history
      setConsultationDraft(null); 
      setActiveTab('consultation');
      
      setHistoryModalData({ targetPatient: null, phase: 'select_person', uniquePatients: [], historyForSelected: [] });
  };


  const renderContent = () => {
    switch (activeTab) {
        case 'dashboard':
            return <DashboardTab 
                        patients={patients} 
                        setActiveTab={setActiveTab}
                        onNewPatient={handleCreateNewPatient}
                    />;
        case 'reception':
            return <ReceptionTab
                        receptionList={receptionList}
                        setReceptionList={setReceptionList}
                        onStartConsultation={handleStartConsultation}
                        onSearchHistory={handleSearchHistory}
                        draftState={receptionDraft}
                        setDraftState={setReceptionDraft}
                    />;
        case 'consultation':
            return <ConsultationTab 
                        onSavePatient={handleSavePatient} 
                        existingPatient={currentPatient}
                        patientFromReception={patientFromReception}
                        onNewPatient={() => {
                            setCurrentPatient(null);
                            setPatientFromReception(null);
                            setConsultationDraft(null); // Clear draft on local reset
                        }}
                        drugMasterList={drugMasterList}
                        diagnosisMasterList={diagnosisMasterList}
                        patients={patients}
                        draftData={consultationDraft}
                        setDraftData={setConsultationDraft}
                    />;
        case 'management':
            return <PatientManagementTab 
                        patients={patients}
                        revenueData={revenueData}
                        onEditPatient={handleEditPatient}
                        onRevisitPatient={handleRevisitPatient}
                        onDeletePatient={handleDeletePatient}
                        onNewPatient={handleCreateNewPatient}
                        dataRetentionPeriod={dataRetentionPeriod}
                        setPatients={setPatients}
                        setRevenueData={setRevenueData}
                        globalSearchTerm={globalSearchTerm}
                        language={language}
                        dateFormat={dateFormat}
                        userName={userName}
                        webAppUrl={webAppUrl}
                    />;
        case 'drugs':
             return <DrugManagementTab
                    drugMasterList={drugMasterList}
                    setDrugMasterList={setDrugMasterList}
                    globalSearchTerm={globalSearchTerm}
                />;
        case 'diagnosis':
            return <DiagnosisManagementTab
                        diagnosisMasterList={diagnosisMasterList}
                        setDiagnosisMasterList={setDiagnosisMasterList}
                        globalSearchTerm={globalSearchTerm}
                    />;
        case 'reports':
            return <ReportsTab patients={patients} revenueData={revenueData} drugMasterList={drugMasterList} />;
        case 'sync':
            return <SyncTab 
                        patients={patients} 
                        revenueData={revenueData}
                        language={language}
                        setPatients={setPatients}
                        setRevenueData={setRevenueData}
                        webAppUrl={webAppUrl}
                        setWebAppUrl={setWebAppUrl}
                    />;
        case 'settings':
            return <SettingsTab 
                      userName={userName} setUserName={setUserName}
                      themeMode={themeMode} setThemeMode={setThemeMode}
                      primaryColor={primaryColor} setPrimaryColor={setPrimaryColor}
                      fontSize={fontSize} setFontSize={setFontSize}
                      dataRetentionPeriod={dataRetentionPeriod} setDataRetentionPeriod={setDataRetentionPeriod}
                      language={language} setLanguage={setLanguage}
                      dateFormat={dateFormat} setDateFormat={setDateFormat}
                      autoLogoutDuration={autoLogoutDuration} setAutoLogoutDuration={autoLogoutDuration}
                    />;
        default:
            return (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8 bg-[var(--card)] rounded-2xl shadow-lg animate-fade-in">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">Chào mừng đến với Quản lý phòng khám 1.0</h2>
                    <p className="mt-2 text-[var(--text-secondary)]">Tính năng này đang được phát triển. Vui lòng quay lại sau.</p>
                </div>
              </div>
            );
    }
  }

  return (
    <div className="flex h-screen bg-[var(--background)] text-[var(--text-primary)] text-base">
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          className: 'text-sm',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }} 
      />
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} language={language} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
            userName={userName} 
            searchTerm={globalSearchTerm}
            setSearchTerm={setGlobalSearchTerm}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
            {renderContent()}
        </main>
      </div>
      <HistoryModal 
        isOpen={!!historyModalData.targetPatient}
        onClose={() => setHistoryModalData({ targetPatient: null, phase: 'select_person', uniquePatients: [], historyForSelected: [] })}
        data={historyModalData}
        onSelectPerson={handlePersonSelectForHistory}
        onSelectHistory={handleSelectHistoryRecord}
        onBack={handleBackInHistoryModal}
      />
    </div>
  );
};

export default App;