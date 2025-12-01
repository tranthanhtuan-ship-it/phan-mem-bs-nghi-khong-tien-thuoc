
import React, { useState } from 'react';
import { Patient, PrescriptionItem } from '../types';
import { X, Printer, Share2, Loader2, FileText } from 'lucide-react';
import PrintablePrescription from './PrintablePrescription';
import { toast } from 'react-hot-toast';

interface PatientDetailModalProps {
  patient: Patient;
  onClose: () => void;
}

const DetailItem: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
  <div>
    <dt className="text-sm font-medium text-[var(--text-secondary)]">{label}</dt>
    <dd className="mt-1 text-sm text-[var(--text-primary)] font-semibold">{value || 'N/A'}</dd>
  </div>
);

const DetailSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--border)]">
        <h4 className="font-bold text-md text-[var(--text-primary)] mb-3">{title}</h4>
        {children}
    </div>
);

const PatientDetailModal: React.FC<PatientDetailModalProps> = ({ patient, onClose }) => {
    const prescriptionRef = React.useRef<HTMLDivElement>(null);
    const [isSharing, setIsSharing] = useState(false);

    const handlePrint = () => {
        const content = prescriptionRef.current?.innerHTML;
        if (!content) return;

        const printWindow = window.open('', '_blank', 'height=800,width=600');
        if (printWindow) {
            printWindow.document.write(`<html><head><title>toa thuốc-${patient.name}</title>`);
            printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>'); // For styling
            printWindow.document.write('</head><body>');
            printWindow.document.write(content);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            };
        }
    };

    const handleShare = async () => {
        if (typeof (window as any).html2pdf === 'undefined') {
            toast.error("Thư viện tạo PDF chưa sẵn sàng, vui lòng thử lại sau giây lát.");
            return;
        }
        if (!prescriptionRef.current) {
            toast.error("Không thể tạo file PDF.");
            return;
        }

        if (!navigator.share) {
            toast.error("Trình duyệt của bạn không hỗ trợ chức năng chia sẻ.");
            return;
        }

        setIsSharing(true);
        try {
            const element = prescriptionRef.current;
            const filename = `toa-thuoc-${patient.name.replace(/\s/g, '_')}.pdf`;
            const opt = {
                margin: 10,
                filename: filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
            };

            const pdfBlob = await (window as any).html2pdf().from(element).set(opt).output('blob');
            
            const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

            if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
                await navigator.share({
                    files: [pdfFile],
                    title: `Toa thuốc cho ${patient.name}`,
                    text: `Đây là toa thuốc cho bệnh nhân ${patient.name} khám ngày ${new Date(patient.consultationDate).toLocaleString('vi-VN')}.`,
                });
            } else {
                console.warn("Sharing not supported for these files.");
                toast.error('Không thể chia sẻ file PDF trên trình duyệt này.');
            }
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') { // AbortError means user cancelled share dialog
                 console.error('Lỗi khi chia sẻ:', error);
                 toast.error(`Không thể chia sẻ: ${error.message}`);
            }
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <>
            <div className="hidden">
                <PrintablePrescription ref={prescriptionRef} patient={patient} />
            </div>
            <div 
                className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-80 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <div 
                    className="relative w-full max-w-3xl rounded-2xl bg-[var(--card)] shadow-2xl flex flex-col max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center p-5 border-b border-[var(--border)] flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg leading-6 font-bold text-[var(--text-primary)]">Chi tiết bệnh nhân: {patient.name}</h3>
                            <div className="flex space-x-2">
                                <button onClick={handlePrint} className="flex items-center space-x-1 text-xs bg-[var(--primary)] text-white px-2 py-1 rounded hover:bg-[var(--primary-dark)] transition-colors" title="In toa thuốc">
                                    <Printer size={14} /> <span>In toa</span>
                                </button>
                                 <button onClick={handleShare} disabled={isSharing} className="flex items-center space-x-1 text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors disabled:opacity-50" title="Chia sẻ PDF">
                                    {isSharing ? <Loader2 size={14} className="animate-spin"/> : <Share2 size={14} />} <span>{isSharing ? '...' : 'Chia sẻ'}</span>
                                </button>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-[var(--text-secondary)] bg-transparent hover:bg-[var(--background)] hover:text-[var(--text-primary)] rounded-lg text-sm p-1.5 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6 text-left overflow-y-auto">
                        <DetailSection title="Thông tin chung">
                            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4">
                                <DetailItem label="Họ tên" value={patient.name} />
                                <DetailItem label="Tuổi" value={patient.age} />
                                <DetailItem label="Giới tính" value={patient.gender} />
                                <DetailItem label="Ngày khám" value={new Date(patient.consultationDate).toLocaleString('vi-VN')} />
                                {patient.address && (
                                    <div className="col-span-2 sm:col-span-4">
                                        <DetailItem label="Địa chỉ" value={patient.address} />
                                    </div>
                                )}
                            </dl>
                        </DetailSection>

                        <DetailSection title="Dấu hiệu sinh tồn">
                             <dl className="grid grid-cols-1 sm:grid-cols-4 gap-x-4 gap-y-4">
                                <DetailItem label="Cân nặng (kg)" value={patient.vitals.weight} />
                            </dl>
                        </DetailSection>

                        <DetailSection title="Triệu chứng & Chẩn đoán">
                            <div className="space-y-4">
                                <div>
                                    <h5 className="text-sm font-medium text-[var(--text-secondary)]">Triệu chứng lâm sàng</h5>
                                    <p className="mt-1 text-sm text-[var(--text-primary)] whitespace-pre-line">{patient.symptoms || 'Không ghi nhận'}</p>
                                </div>
                                <div>
                                    <h5 className="text-sm font-medium text-[var(--text-secondary)]">Chẩn đoán</h5>
                                    <p className="mt-1 text-sm font-bold text-[var(--primary)]">{patient.diagnosis || 'Chưa có chẩn đoán'}</p>
                                </div>
                            </div>
                        </DetailSection>

                        <DetailSection title="Chi tiết đơn thuốc">
                            {patient.prescription.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-[var(--border)]">
                                        <thead>
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">#</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Tên thuốc</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Sáng</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Trưa</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Chiều</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Tối</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Tổng</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border)]">
                                            {patient.prescription.map((item, index) => (
                                                <tr key={index}>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-[var(--text-secondary)]">{index + 1}</td>
                                                    <td className="px-3 py-2 text-sm font-medium text-[var(--text-primary)]">
                                                        {item.drugName}
                                                        <div className="text-xs text-[var(--text-secondary)] font-normal">{item.usage}</div>
                                                    </td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-[var(--text-secondary)]">{item.morning}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-[var(--text-secondary)]">{item.noon}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-[var(--text-secondary)]">{item.afternoon}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm text-[var(--text-secondary)]">{item.evening}</td>
                                                    <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-[var(--text-primary)]">{item.totalQuantity} {item.unit}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-[var(--text-secondary)] italic">Không có thuốc được kê.</p>
                            )}
                            
                            {patient.prescriptionNote && (
                                <div className="mt-4 pt-4 border-t border-[var(--border)] bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-lg">
                                    <h5 className="flex items-center text-sm font-bold text-yellow-700 dark:text-yellow-500 mb-1">
                                        <FileText size={14} className="mr-1.5" />
                                        Ghi chú đơn thuốc (Nội bộ):
                                    </h5>
                                    <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap italic">
                                        {patient.prescriptionNote}
                                    </p>
                                </div>
                            )}
                        </DetailSection>
                    </div>
                    
                    <div className="p-5 border-t border-[var(--border)] flex justify-end">
                        <button onClick={onClose} className="px-4 py-2 bg-[var(--card)] border border-[var(--border)] text-sm font-semibold rounded-lg hover:bg-[var(--background)] transition-colors">
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PatientDetailModal;
