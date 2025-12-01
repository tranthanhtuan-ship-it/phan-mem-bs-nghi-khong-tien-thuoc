import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, HelpCircle, UploadCloud, DownloadCloud, Loader2, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Patient, RevenueRecord, Language, PrescriptionItem, Vitals } from '../types';
import ConfirmationModal from './ConfirmationModal';


interface SyncTabProps {
  patients: Patient[];
  revenueData: RevenueRecord[];
  language: Language;
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  setRevenueData: React.Dispatch<React.SetStateAction<RevenueRecord[]>>;
  webAppUrl: string;
  setWebAppUrl: React.Dispatch<React.SetStateAction<string>>;
}

const APPS_SCRIPT_CODE = `// This script enables two-way synchronization.
// doGet fetches data from the sheet including headers for dynamic mapping.
// doPost handles data merging: updates existing rows in place and inserts new rows at the top. This avoids clearing the sheet.

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheets()[0];
    const lastRow = sheet.getLastRow();
    
    // If the sheet is completely empty, return success with empty arrays.
    if (lastRow < 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'success', headers: [], data: [] }))
        .setMimeType(ContentService.MimeType.JSON)
        .addHeader("Access-Control-Allow-Origin", "*");
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    let data = [];
    
    // Check if there's any data beyond the header row
    if (lastRow > 1) {
      const dataRange = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
      data = dataRange.getValues();
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', headers: headers, data: data }))
      .setMimeType(ContentService.MimeType.JSON)
      .addHeader("Access-Control-Allow-Origin", "*");
      
  } catch (error) {
    console.error("GET Error: " + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .addHeader("Access-Control-Allow-Origin", "*");
  }
}

function doPost(e) {
  // Lock to prevent race conditions from simultaneous requests.
  const lock = LockService.getScriptLock();
  lock.waitLock(30000); // Wait up to 30 seconds.

  try {
    const request = JSON.parse(e.postData.contents);
    const incomingData = request.data;

    // Exit if there's no data to process.
    if (!incomingData || !Array.isArray(incomingData) || incomingData.length === 0) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'success', message: 'No data to push.', rowsUpdated: 0, rowsAdded: 0 }))
        .setMimeType(ContentService.MimeType.JSON)
        .addHeader("Access-Control-Allow-Origin", "*");
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheets()[0];
    const lastRow = sheet.getLastRow();

    if (lastRow < 1) {
      throw new Error("Sheet is empty or has no header row. Please set up headers first.");
    }
    
    // Determine number of columns from the data being sent.
    const numCols = incomingData[0].length;

    // 1. Create a map of existing patient IDs to their row number for quick lookups.
    const idToRowIndexMap = new Map();
    if (lastRow > 1) {
      const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      ids.forEach((id, index) => {
        if (id[0]) {
          // Row numbers are 1-based. Data starts at row 2.
          idToRowIndexMap.set(id[0].toString(), index + 2);
        }
      });
    }

    const rowsToUpdate = [];
    const rowsToAdd = [];
    
    // 2. Separate incoming data into records that need updating and records that are new.
    incomingData.forEach(newRow => {
      const id = newRow[0];
      if (id && idToRowIndexMap.has(id.toString())) {
        const rowIndex = idToRowIndexMap.get(id.toString());
        rowsToUpdate.push({ rowIndex: rowIndex, data: newRow });
      } else {
        rowsToAdd.push(newRow);
      }
    });

    // 3. Update existing rows in place. This is slow if there are many updates but avoids a full rewrite.
    rowsToUpdate.forEach(item => {
      sheet.getRange(item.rowIndex, 1, 1, numCols).setValues([item.data]);
    });
    
    // 4. Insert new rows at the top of the sheet, just below the header.
    if (rowsToAdd.length > 0) {
      sheet.insertRowsBefore(2, rowsToAdd.length);
      sheet.getRange(2, 1, rowsToAdd.length, numCols).setValues(rowsToAdd);
    }
    
    // Return a success response with statistics.
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: 'success', 
        message: 'Push successful. New records added to the top, existing records updated.',
        rowsUpdated: rowsToUpdate.length,
        rowsAdded: rowsToAdd.length,
        totalRows: sheet.getLastRow() - 1
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .addHeader("Access-Control-Allow-Origin", "*");

  } catch (error) {
    console.error("POST Error: " + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ 
        status: 'error', 
        message: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .addHeader("Access-Control-Allow-Origin", "*");
  } finally {
    // Always release the lock.
    lock.releaseLock();
  }
}`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
};

const SyncTab: React.FC<SyncTabProps> = ({ patients, revenueData, language, setPatients, setRevenueData, webAppUrl, setWebAppUrl }) => {
    const [isPulling, setIsPulling] = useState(false);
    const [isPullConfirmOpen, setIsPullConfirmOpen] = useState(false);
    const [pulledData, setPulledData] = useState<{ patients: Patient[]; revenueData: RevenueRecord[] } | null>(null);
    
    const handleCopyCode = () => {
        navigator.clipboard.writeText(APPS_SCRIPT_CODE);
        toast.success('Đã sao chép mã Apps Script!');
    };

    const handlePullData = async () => {
        if (!webAppUrl || !webAppUrl.startsWith('https://script.google.com/macros/s/')) {
            toast.error('Vui lòng nhập một URL Google Apps Script Web App hợp lệ.');
            return;
        }
        
        setIsPulling(true);
        const toastId = toast.loading('Đang kéo dữ liệu từ Google Sheet...');

        try {
            const response = await fetch(webAppUrl, { mode: 'cors' });
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const result = await response.json();

            if (result.status !== 'success') {
                throw new Error(result.message || 'Lỗi không xác định từ Apps Script.');
            }

            if (!result.headers || !Array.isArray(result.headers) || result.headers.length === 0) {
                 throw new Error('Không tìm thấy tiêu đề cột trong Google Sheet. Vui lòng kiểm tra lại file hoặc cập nhật Apps Script.');
            }
            
            const headerMap: { [key: string]: number } = {};
            result.headers.forEach((header: string, index: number) => {
              headerMap[header.trim()] = index;
            });

            // Check for essential columns
            const requiredHeaders = ['id', 'name', 'consultationDate', 'symptoms', 'diagnosis', 'prescription'];
            for (const header of requiredHeaders) {
                if (headerMap[header] === undefined) {
                    throw new Error(`Thiếu cột bắt buộc trong Google Sheet: "${header}". Vui lòng kiểm tra lại hàng tiêu đề.`);
                }
            }
            
            const newPatients: Patient[] = [];
            const newRevenueData: RevenueRecord[] = [];

            for (const row of result.data) {
                try {
                    const id = row[headerMap.id];
                    const name = row[headerMap.name];
                    const consultationDate = row[headerMap.consultationDate];
                    
                    if (!id || !name || !consultationDate) {
                        console.warn('Bỏ qua hàng do thiếu dữ liệu thiết yếu (id, name, consultationDate)', row);
                        continue;
                    }

                    const prescription: PrescriptionItem[] = JSON.parse(row[headerMap.prescription] || '[]');
                    const totalRevenue = parseFloat(row[headerMap.tongDoanhThu] || '0');

                    const patient: Patient = {
                        id,
                        name,
                        consultationDate,
                        age: row[headerMap.age] || '',
                        gender: row[headerMap.gender] || 'Nam',
                        address: row[headerMap.address] || '',
                        vitals: {
                            pulse: row[headerMap.pulse] || '',
                            bloodPressure: row[headerMap.bloodPressure] || '',
                            temperature: row[headerMap.temperature] || '',
                            respiratoryRate: row[headerMap.respiratoryRate] || '',
                        },
                        symptoms: row[headerMap.symptoms],
                        diagnosis: row[headerMap.diagnosis],
                        prescription: prescription,
                    };
                    newPatients.push(patient);
                    
                    if (!isNaN(totalRevenue) && totalRevenue > 0) {
                        const revenue: RevenueRecord = {
                            id: `rev-sync-${patient.id}-${new Date(patient.consultationDate).getTime()}`,
                            patientId: patient.id,
                            patientName: patient.name,
                            consultationFee: 0,
                            drugCost: 0,
                            otherServicesCost: totalRevenue,
                            total: totalRevenue,
                            paymentStatus: 'paid',
                            date: patient.consultationDate,
                            prescription: prescription,
                        };
                         newRevenueData.push(revenue);
                    }
                } catch (parseError) {
                    console.warn(`Bỏ qua hàng do lỗi phân tích cú pháp: ${parseError}`, row);
                }
            }
            
            setPulledData({ patients: newPatients, revenueData: newRevenueData });
            setIsPullConfirmOpen(true);
            toast.dismiss(toastId);
        } catch (error) {
            console.error('Pull failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Lỗi không xác định';
            toast.error(`Kéo dữ liệu thất bại: ${errorMessage}`, { id: toastId, duration: 6000 });
        } finally {
            setIsPulling(false);
        }
    };

    const confirmPull = () => {
        if (pulledData) {
            setPatients(pulledData.patients.sort((a, b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime()));
            setRevenueData(pulledData.revenueData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            toast.success('Dữ liệu cục bộ đã được cập nhật từ Google Sheet!');
        }
        setIsPullConfirmOpen(false);
        setPulledData(null);
    };


    const headers = 'id, name, age, gender, address, consultationDate, pulse, bloodPressure, temperature, respiratoryRate, symptoms, diagnosis, prescription, prescription_vietnamese, tongDoanhThu';

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6 max-w-4xl mx-auto">
            <motion.div variants={itemVariants}>
                <h2 className="text-3xl font-bold text-[var(--text-primary)]">Đồng bộ hóa với Google Sheets</h2>
                <p className="mt-1 text-[var(--text-secondary)]">
                    Sao lưu và truy cập dữ liệu bệnh nhân của bạn một cách an toàn trên Google Sheets.
                </p>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-r-lg dark:bg-yellow-900/20 dark:text-yellow-300">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium">
                           Tính năng này gửi dữ liệu đến máy chủ của Google. Bằng cách sử dụng, bạn đồng ý tuân thủ các chính sách bảo mật và điều khoản dịch vụ của Google.
                        </p>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-[var(--card)] p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center">
                    <LinkIcon className="w-5 h-5 mr-3 text-[var(--primary)]" />
                    Bước 1: Cấu hình và Đồng bộ
                </h3>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="webAppUrl" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                            URL Web App của Google Apps Script
                        </label>
                        <input
                            id="webAppUrl"
                            type="text"
                            value={webAppUrl}
                            onChange={(e) => setWebAppUrl(e.target.value)}
                            placeholder="https://script.google.com/macros/s/..."
                            className="block w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
                        />
                    </div>
                    <div className="flex">
                         <button 
                            onClick={handlePullData} 
                            disabled={isPulling || !webAppUrl}
                            className="w-full inline-flex items-center justify-center px-6 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-[var(--primary)] bg-[var(--primary-light)] hover:bg-blue-200/60 dark:bg-blue-900/40 dark:hover:bg-blue-900/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isPulling ? <Loader2 className="w-5 h-5 mr-2 animate-spin"/> : <DownloadCloud className="w-5 h-5 mr-2"/>}
                            {isPulling ? 'Đang kéo về...' : 'Kéo dữ liệu về (Ghi đè dữ liệu hiện tại)'}
                        </button>
                    </div>
                </div>
            </motion.div>

             <motion.div variants={itemVariants} className="bg-[var(--card)] p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center">
                    <HelpCircle className="w-5 h-5 mr-3 text-[var(--primary)]" />
                    Bước 2: Hướng dẫn thiết lập
                </h3>
                <ol className="list-decimal list-inside space-y-4 text-sm text-[var(--text-secondary)]">
                    <li>
                        <strong>Tạo Google Sheet:</strong> Truy cập <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] font-semibold underline">sheets.new</a> để tạo một trang tính mới. Đặt tên cho nó (ví dụ: "Dữ liệu Phòng khám").
                    </li>
                    <li>
                        <strong>Thêm tiêu đề cột:</strong> Ở hàng đầu tiên (hàng 1), dán chính xác các tiêu đề sau vào các ô từ A1, B1, C1,...
                        <div className="mt-2 p-2 bg-[var(--background)] rounded-md text-xs font-mono text-[var(--text-primary)] break-words">{headers}</div>
                    </li>
                    <li>
                        <strong>Mở Apps Script:</strong> Trong Google Sheet, vào menu <code className="bg-[var(--background)] p-1 rounded">Extensions</code> &rarr; <code className="bg-[var(--background)] p-1 rounded">Apps Script</code>.
                    </li>
                    <li>
                        <strong>Dán mã Script:</strong> Xóa toàn bộ mã mặc định và dán đoạn mã bên dưới vào.
                        <div className="relative my-2">
                             <pre className="bg-[var(--background)] p-4 rounded-lg text-xs text-[var(--text-primary)] overflow-x-auto max-h-60 font-mono">{APPS_SCRIPT_CODE}</pre>
                            <button onClick={handleCopyCode} className="absolute top-2 right-2 p-1.5 bg-[var(--card)]/50 backdrop-blur-sm rounded-md hover:bg-[var(--card)]">
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                    </li>
                     <li>
                        <strong>Triển khai (Deploy) Script:</strong>
                        <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
                            <li>Nhấn nút màu xanh <strong className="text-[var(--text-primary)]">Deploy</strong> &rarr; <strong className="text-[var(--text-primary)]">New deployment</strong>.</li>
                            <li>Nhấp vào biểu tượng bánh răng ⚙️, chọn loại là <strong className="text-[var(--text-primary)]">Web app</strong>.</li>
                            <li>Trong mục "Who has access" (Ai có quyền truy cập), <strong className="text-red-500">bắt buộc</strong> phải chọn <strong className="text-[var(--text-primary)]">Anyone</strong>. Lựa chọn này cho phép ứng dụng truy cập dữ liệu. Nếu chọn sai, bạn sẽ gặp lỗi "Failed to fetch".</li>
                            <li>Nhấn <strong className="text-[var(--text-primary)]">Deploy</strong>.</li>
                            <li><strong className="text-red-500">Lưu ý quan trọng:</strong> Nếu bạn cập nhật mã script, bạn phải tạo một phiên bản triển khai mới (<code className="bg-[var(--background)] p-1 rounded">Deploy</code> &rarr; <code className="bg-[var(--background)] p-1 rounded">Manage deployments</code> &rarr; Chọn deployment của bạn &rarr; <code className="bg-[var(--background)] p-1 rounded">Edit ✏️</code> &rarr; <code className="bg-[var(--background)] p-1 rounded">New version</code> &rarr; <code className="bg-[var(--background)] p-1 rounded">Deploy</code>).</li>
                        </ul>
                    </li>
                     <li>
                        <strong>Ủy quyền và sao chép URL:</strong>
                         <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
                             <li>Làm theo các bước để cấp quyền cho script. Bạn có thể cần nhấp vào "Advanced" và "Go to (unsafe)".</li>
                             <li>Sau khi hoàn tất, sao chép <strong className="text-[var(--text-primary)]">Web app URL</strong> được cung cấp.</li>
                             <li>Dán URL này vào ô "Cấu hình URL" ở trên và bắt đầu đồng bộ.</li>
                         </ul>
                    </li>
                </ol>
            </motion.div>
            
            <ConfirmationModal
                isOpen={isPullConfirmOpen}
                onClose={() => setIsPullConfirmOpen(false)}
                onConfirm={confirmPull}
                title="Xác nhận Kéo Dữ liệu"
                message={
                    <>
                        <p>
                           Bạn có chắc muốn thay thế dữ liệu <strong className="font-semibold text-[var(--text-primary)]">hiện tại</strong> trong phần mềm bằng dữ liệu từ Google Sheet không?
                        </p>
                         <p className="mt-2 text-red-600 dark:text-red-400">
                           Thao tác này <strong className="font-semibold">không thể hoàn tác</strong> và sẽ xóa mọi thay đổi chưa được đẩy lên.
                        </p>
                    </>
                }
                confirmText="Xác nhận"
                cancelText="Hủy"
            />
        </motion.div>
    );
};

export default SyncTab;