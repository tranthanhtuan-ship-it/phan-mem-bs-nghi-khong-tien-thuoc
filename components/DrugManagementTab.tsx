
import React, { useState, useMemo } from 'react';
import ConfirmationModal from './ConfirmationModal';
import { extractDrugsFromFileContent } from '../services/geminiService';
import { Trash2, Plus, Upload, Loader2, Edit, FileDown, FileSpreadsheet } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Drug } from '../types';

declare const pdfjsLib: any;
declare global {
    interface Window {
        XLSX: any;
    }
}

interface DrugManagementTabProps {
  drugMasterList: Drug[];
  setDrugMasterList: React.Dispatch<React.SetStateAction<Drug[]>>;
  globalSearchTerm: string;
}

const DrugManagementTab: React.FC<DrugManagementTabProps> = ({ drugMasterList, setDrugMasterList, globalSearchTerm }) => {
    const [newDrug, setNewDrug] = useState<Drug>({ name: '', price: 0, usage: 'uống', unit: 'viên' });
    const [editingDrug, setEditingDrug] = useState<Drug | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isDeleteAllConfirmOpen, setIsDeleteAllConfirmOpen] = useState(false);
    const [drugToDelete, setDrugToDelete] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const filteredDrugs = useMemo(() => {
        if (!globalSearchTerm) {
            return drugMasterList;
        }
        return drugMasterList.filter(drug => 
            drug.name.toLowerCase().includes(globalSearchTerm.toLowerCase())
        );
    }, [drugMasterList, globalSearchTerm]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isPrice = name === 'price';
        
        if (editingDrug) {
            setEditingDrug(prev => prev ? { ...prev, [name]: isPrice ? parseFloat(value) || 0 : value } : null);
        } else {
            setNewDrug(prev => ({ ...prev, [name]: isPrice ? parseFloat(value) || 0 : value }));
        }
    };

    const handleSaveDrug = () => {
        if (editingDrug) { // Update existing drug
            if (!editingDrug.name.trim()) {
                toast.error('Tên thuốc không được để trống.');
                return;
            }
            setDrugMasterList(prev => prev.map(d => d.name === editingDrug.name ? editingDrug : d));
            toast.success(`Đã cập nhật thuốc "${editingDrug.name}"`);
            setEditingDrug(null);
        } else { // Add new drug
             const trimmedName = newDrug.name.trim();
            if (!trimmedName) {
                toast.error('Tên thuốc không được để trống.');
                return;
            }
            if (drugMasterList.some(d => d.name.toLowerCase() === trimmedName.toLowerCase())) {
                toast.error('Thuốc này đã có trong danh sách.');
                return;
            }
            setDrugMasterList(prev => [...prev, { name: trimmedName, price: newDrug.price, usage: newDrug.usage || 'uống', unit: newDrug.unit || 'viên' }].sort((a, b) => a.name.localeCompare(b.name)));
            setNewDrug({ name: '', price: 0, usage: 'uống', unit: 'viên' });
            toast.success(`Đã thêm thuốc "${trimmedName}"`);
        }
    };
    
    const requestDeleteDrug = (drugName: string) => {
        setDrugToDelete(drugName);
        setIsConfirmModalOpen(true);
    };

    const confirmDeleteDrug = () => {
        if (drugToDelete) {
            setDrugMasterList(prev => prev.filter(drug => drug.name !== drugToDelete));
            toast.success(`Đã xóa thuốc "${drugToDelete}"`);
        }
        setIsConfirmModalOpen(false);
        setDrugToDelete(null);
    };

    const handleDeleteAllDrugs = () => {
        setDrugMasterList([]);
        toast.success('Đã xóa tất cả thuốc khỏi danh sách.');
        setIsDeleteAllConfirmOpen(false);
    };

    const processNewDrugs = (newDrugs: Drug[]) => {
        setDrugMasterList(prevList => {
            const lowercasedPrevList = new Set(prevList.map(d => d.name.toLowerCase()));
            const uniqueNewDrugs = newDrugs
                .filter(drug => drug.name && !lowercasedPrevList.has(drug.name.toLowerCase()));
            
            if (uniqueNewDrugs.length === 0) {
                 toast('Không có thuốc mới nào được tìm thấy hoặc tất cả đã có trong danh sách.', { icon: 'ℹ️' });
                 return prevList;
            }
            
            toast.success(`${uniqueNewDrugs.length} loại thuốc mới đã được thêm vào danh sách.`);
            const combined = [...prevList, ...uniqueNewDrugs];
            return combined.sort((a, b) => a.name.localeCompare(b.name));
        });
    }

    const handleDownloadTemplate = () => {
        if (typeof window.XLSX === 'undefined') {
            toast.error('Thư viện Excel chưa tải xong. Vui lòng thử lại sau vài giây.');
            return;
        }

        const wb = window.XLSX.utils.book_new();
        // Header and sample data
        const ws_data = [
            ["Tên thuốc", "Đơn giá", "Cách dùng", "Đơn vị"],
            ["Paracetamol 500mg", 500, "uống", "viên"],
            ["Vitamin C 500mg", 1000, "uống", "viên"],
            ["Berberin", 500, "uống", "lọ"],
            ["Oresol", 2000, "uống", "gói"]
        ];
        
        const ws = window.XLSX.utils.aoa_to_sheet(ws_data);
        
        // Auto-width for columns
        const wscols = [
            {wch: 30}, // Tên thuốc
            {wch: 15}, // Đơn giá
            {wch: 15}, // Cách dùng
            {wch: 10}  // Đơn vị
        ];
        ws['!cols'] = wscols;

        window.XLSX.utils.book_append_sheet(wb, ws, "Mau_Nhap_Thuoc");
        window.XLSX.writeFile(wb, "mau-danh-sach-thuoc.xlsx");
        toast.success('Đã tải xuống file mẫu Excel.');
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        const toastId = toast.loading('Đang xử lý file...');

        try {
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                 if (typeof window.XLSX === 'undefined') {
                    throw new Error("Thư viện Excel chưa được tải. Vui lòng làm mới trang.");
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = new Uint8Array(e.target?.result as ArrayBuffer);
                        const workbook = window.XLSX.read(data, { type: 'array' });
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        
                        // Convert to JSON (array of arrays to handle headers easily)
                        const jsonData: any[][] = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                        
                        if (jsonData.length < 2) {
                             throw new Error("File Excel không có dữ liệu hoặc định dạng không đúng.");
                        }

                        // Skip header row (index 0), process data rows
                        const newDrugsFromFile: Drug[] = jsonData.slice(1).map((row): Drug | null => {
                            // Assuming order: Name, Price, Usage, Unit based on template
                            const name = row[0]?.toString().trim();
                            const price = parseFloat(row[1]);
                            const usage = row[2]?.toString().trim() || 'uống';
                            const unit = row[3]?.toString().trim() || 'viên';

                            if (name && !isNaN(price)) {
                                return { 
                                    name, 
                                    price, 
                                    usage, 
                                    unit: unit as Drug['unit'] 
                                };
                            }
                            return null;
                        }).filter((d): d is Drug => d !== null);

                        processNewDrugs(newDrugsFromFile);
                    } catch (error) {
                        console.error("Excel processing error:", error);
                        toast.error(`Lỗi khi đọc file Excel: ${error instanceof Error ? error.message : String(error)}`, { id: toastId });
                    } finally {
                        setIsProcessing(false);
                        toast.dismiss(toastId);
                    }
                };
                reader.readAsArrayBuffer(file);

            } else if (file.type === 'application/pdf') {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
                        const pdf = await pdfjsLib.getDocument(typedarray).promise;
                        let fullText = '';
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const textContent = await page.getTextContent();
                            fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
                        }
                        const extractedDrugs = await extractDrugsFromFileContent(fullText);
                        processNewDrugs(extractedDrugs);
                    } catch (error) {
                        console.error("Error processing PDF or calling AI:", error);
                        toast.error(`Đã xảy ra lỗi: ${error instanceof Error ? error.message : String(error)}`, { id: toastId });
                    } finally {
                        setIsProcessing(false);
                        toast.dismiss(toastId);
                    }
                };
                reader.onerror = () => {
                    toast.error('Không thể đọc file PDF. Vui lòng thử lại.', { id: toastId });
                    setIsProcessing(false);
                };
                reader.readAsArrayBuffer(file);

            } else { // Handle txt/csv
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const text = e.target?.result as string;
                        if (text) {
                            const newDrugsFromFile: Drug[] = text.split(/\r?\n/)
                                .map(line => line.trim())
                                .filter(Boolean)
                                .map((line): Drug | null => {
                                    const parts = line.split(',').map(s => s.trim());
                                    if (parts.length >= 2) {
                                        const name = parts[0];
                                        const price = parseFloat(parts[1]);
                                        const usage = parts[2] || 'uống';
                                        const unit = (parts[3] || 'viên') as Drug['unit'];
                                        if (name && !isNaN(price)) {
                                            return { name, price, usage, unit };
                                        }
                                    }
                                    return null;
                                })
                                .filter((d): d is Drug => d !== null);

                            if (newDrugsFromFile.length > 0) {
                                processNewDrugs(newDrugsFromFile);
                            } else {
                                toast.error('Không tìm thấy dữ liệu thuốc hợp lệ. Định dạng yêu cầu: Tên thuốc,Giá,Cách dùng,Đơn vị', { duration: 5000 });
                            }
                        }
                    } catch (error) {
                         toast.error('Đã xảy ra lỗi khi đọc file.', { id: toastId });
                    } finally {
                         setIsProcessing(false);
                         toast.dismiss(toastId);
                    }
                };
                reader.readAsText(file);
            }
        } catch (error) {
            console.error("File upload error:", error);
            toast.error(`Đã xảy ra lỗi khi tải file: ${error instanceof Error ? error.message : String(error)}`, { id: toastId });
            setIsProcessing(false);
        } finally {
            event.target.value = '';
        }
    };
    
    const inputClass = "block w-full px-3 py-2 text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--text-primary)]";


    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[var(--card)] p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border)] pb-3 mb-4">{editingDrug ? 'Chỉnh sửa thuốc' : 'Thêm thuốc mới'}</h3>
                        <div className="space-y-4">
                            <input
                                name="name"
                                type="text"
                                value={editingDrug ? editingDrug.name : newDrug.name}
                                onChange={handleInputChange}
                                placeholder="Tên thuốc, VD: Paracetamol 500mg"
                                className={inputClass}
                                disabled={!!editingDrug}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    name="price"
                                    type="number"
                                    value={editingDrug ? editingDrug.price : newDrug.price}
                                    onChange={handleInputChange}
                                    placeholder="Đơn giá (VNĐ)"
                                    className={inputClass}
                                />
                                <select
                                    name="unit"
                                    value={editingDrug ? editingDrug.unit || 'viên' : newDrug.unit || 'viên'}
                                    onChange={handleInputChange}
                                    className={inputClass}
                                >
                                    <option value="viên">Viên</option>
                                    <option value="gói">Gói</option>
                                    <option value="ống">Ống</option>
                                    <option value="chai">Chai</option>
                                    <option value="tuýp">Tuýp</option>
                                    <option value="lọ">Lọ</option>
                                </select>
                            </div>
                             <select
                                name="usage"
                                value={editingDrug ? editingDrug.usage || 'uống' : newDrug.usage || 'uống'}
                                onChange={handleInputChange}
                                className={inputClass}
                            >
                                <option value="uống">Uống</option>
                                <option value="ngậm dưới lưỡi">Ngậm dưới lưỡi</option>
                                <option value="nhai">Nhai</option>
                                <option value="thoa">Thoa</option>
                                <option value="rửa">Rửa</option>
                                <option value="tắm">Tắm</option>
                                <option value="gội">Gội</option>
                                <option value="ngâm">Ngâm</option>
                                <option value="nhỏ mắt">Nhỏ mắt</option>
                                <option value="nhỏ tai">Nhỏ tai</option>
                                <option value="nhỏ mũi">Nhỏ mũi</option>
                                <option value="xịt">Xịt</option>
                            </select>
                        </div>
                        <div className="flex space-x-2 mt-4">
                             <button onClick={handleSaveDrug} className="w-full inline-flex items-center justify-center p-2.5 border border-transparent rounded-lg shadow-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)]">
                               <Plus className="h-5 w-5 mr-2" /> {editingDrug ? 'Lưu thay đổi' : 'Thêm thuốc'}
                            </button>
                            {editingDrug && (
                                <button onClick={() => setEditingDrug(null)} className="w-full inline-flex items-center justify-center p-2.5 border border-[var(--border)] rounded-lg text-[var(--text-primary)] bg-[var(--card)] hover:bg-[var(--background)]">
                                    Hủy
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-[var(--card)] p-6 rounded-2xl shadow-lg">
                        <div className="flex justify-between items-center border-b border-[var(--border)] pb-3 mb-4">
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">Tải lên từ file</h3>
                             <button 
                                onClick={handleDownloadTemplate}
                                className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center"
                                title="Tải file Excel mẫu"
                            >
                                <FileDown className="w-4 h-4 mr-1" />
                                Tải file mẫu
                            </button>
                        </div>
                        
                         <label className={`w-full inline-flex items-center justify-center px-4 py-3 border-2 border-dashed border-[var(--border)] rounded-lg text-[var(--text-secondary)] transition-colors ${isProcessing ? 'bg-[var(--background)] cursor-not-allowed' : 'bg-[var(--background)] hover:bg-[var(--primary-light)] hover:border-[var(--primary)] cursor-pointer'}`}>
                            {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FileSpreadsheet className="mr-2 h-5 w-5" />}
                            <div className="text-center">
                                <span className="block font-medium">{isProcessing ? 'Đang xử lý...' : 'Chọn file Excel (.xlsx)'}</span>
                                <span className="text-xs text-[var(--text-secondary)]/70">hoặc .pdf, .txt, .csv</span>
                            </div>
                            <input type="file" className="hidden" accept=".xlsx,.xls,.txt,.csv,.pdf" onChange={handleFileUpload} disabled={isProcessing} />
                        </label>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-[var(--card)] p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-center border-b border-[var(--border)] pb-3 mb-4">
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">Danh sách thuốc hiện có ({filteredDrugs.length})</h3>
                        {drugMasterList.length > 0 && (
                            <button
                                onClick={() => setIsDeleteAllConfirmOpen(true)}
                                className="text-sm font-semibold text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors flex items-center"
                            >
                                <Trash2 className="h-4 w-4 mr-1.5" />
                                Xóa tất cả
                            </button>
                        )}
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto pr-2">
                        {filteredDrugs.length > 0 ? (
                            <ul className="divide-y divide-[var(--border)]">
                                {filteredDrugs.map(drug => (
                                    <li key={drug.name} className="py-3 flex items-center justify-between group">
                                        <div>
                                            <p className="text-sm font-medium text-[var(--text-primary)]">{drug.name}</p>
                                            <p className="text-sm text-[var(--text-secondary)] capitalize">
                                                {drug.price.toLocaleString('vi-VN')} VNĐ / {drug.unit || 'viên'}
                                                {drug.usage && <span> - {drug.usage}</span>}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setEditingDrug(drug)} className="text-[var(--text-secondary)] hover:text-[var(--primary)]"><Edit className="h-4 w-4" /></button>
                                            <button onClick={() => requestDeleteDrug(drug.name)} className="text-[var(--text-secondary)] hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <p className="text-center text-[var(--text-secondary)] py-4">
                                {globalSearchTerm ? 'Không tìm thấy thuốc phù hợp.' : 'Chưa có thuốc nào trong danh sách.'}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDeleteDrug}
                title="Xác nhận xóa thuốc"
                message={<p>Bạn có chắc muốn xóa <strong className="font-semibold text-[var(--text-primary)]">{drugToDelete}</strong>?</p>}
            />
             <ConfirmationModal
                isOpen={isDeleteAllConfirmOpen}
                onClose={() => setIsDeleteAllConfirmOpen(false)}
                onConfirm={handleDeleteAllDrugs}
                title="Xác nhận xóa TẤT CẢ thuốc"
                message={
                    <p>
                        Bạn có chắc chắn muốn xóa <strong className="font-semibold text-red-500">toàn bộ</strong> danh sách thuốc không?
                        <br />
                        Hành động này không thể hoàn tác.
                    </p>
                }
                confirmText="Vẫn xóa"
            />
        </>
    );
};

export default DrugManagementTab;
