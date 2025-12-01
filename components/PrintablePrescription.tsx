
import React from 'react';
import { Patient, PrescriptionItem } from '../types';

interface PrintablePrescriptionProps {
    patient: Patient;
}

const PrintablePrescription = React.forwardRef<HTMLDivElement, PrintablePrescriptionProps>(({ patient }, ref) => {
    
    const formatPrescriptionInstructions = (item: PrescriptionItem): string => {
        const { usage = 'uống', morning, noon, afternoon, evening, unit = 'viên' } = item;
        const parts = [];
        
        const countableUsages = ['uống', 'ngậm dưới lưỡi', 'nhai'];
        const isCountable = countableUsages.includes(usage);
        const suffix = isCountable ? ` ${unit}` : ' lần';
        
        if (morning) parts.push(`sáng ${morning}${suffix}`);
        if (noon) parts.push(`trưa ${noon}${suffix}`);
        if (afternoon) parts.push(`chiều ${afternoon}${suffix}`);
        if (evening) parts.push(`tối ${evening}${suffix}`);

        if (parts.length === 0) return `Dùng theo chỉ dẫn của bác sĩ.`;
        
        const capitalizedUsage = usage.charAt(0).toUpperCase() + usage.slice(1);
        return `${capitalizedUsage} ${parts.join(', ')}.`;
    };

    const today = new Date().toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const maxDuration = Math.max(0, ...patient.prescription.map(item => item.duration || 0));
    let formattedReExamDate = '';
    if (maxDuration > 0 && patient.consultationDate) {
        const consultationDate = new Date(patient.consultationDate);
        const reExamDate = new Date(consultationDate);
        reExamDate.setDate(consultationDate.getDate() + maxDuration);
        formattedReExamDate = reExamDate.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // Adjust layout for longer prescriptions to fit on one page
    const isCompact = patient.prescription.length > 8;

    return (
        <div ref={ref} className={`${isCompact ? 'p-4' : 'p-8'} text-black bg-white`}>
            <style type="text/css" media="print">
                {`
                    @page { 
                        size: A5; 
                        margin: 10mm; 
                    }
                    body { 
                        -webkit-print-color-adjust: exact; 
                        font-family: 'Times New Roman', Times, serif;
                        font-size: ${isCompact ? '10pt' : '12pt'};
                    }
                `}
            </style>
            <header className={`text-center ${isCompact ? 'mb-4' : 'mb-8'}`}>
                <div className={`${isCompact ? 'text-xs' : 'text-sm'}`}>
                    <p className="text-base font-bold uppercase">Phòng khám Da liễu BS Trương Trung Nghi</p>
                    <p>Địa chỉ: 1372- Đường Trần Hưng Đạo-Phường Long Xuyên- An Giang</p>
                    <p>Số điện thoại: 0913835656</p>
                </div>
                <h1 className={`text-2xl font-bold uppercase ${isCompact ? 'mt-4' : 'mt-6'}`}>TOA THUỐC</h1>
            </header>
            
            <main>
                <div className={`grid grid-cols-2 gap-x-8 gap-y-2 mb-2 ${isCompact ? 'text-xs' : 'text-sm'}`}>
                    <p><span className="font-bold">Họ tên:</span> {patient.name}</p>
                    <p><span className="font-bold">Tuổi:</span> {patient.age}</p>
                    <p><span className="font-bold">Giới tính:</span> {patient.gender}</p>
                </div>
                 {patient.address && (
                    <div className={`${isCompact ? 'mb-3 text-xs' : 'mb-6 text-sm'}`}>
                        <p><span className="font-bold">Địa chỉ:</span> {patient.address}</p>
                    </div>
                )}
                 <div className={`${isCompact ? 'mb-4 text-xs' : 'mb-6 text-sm'}`}>
                    <p><span className="font-bold">Chẩn đoán:</span> {patient.diagnosis.split('\n')[0]}</p>
                </div>

                {patient.prescription.length > 0 && (
                    <table className={`w-full border-collapse ${isCompact ? 'text-xs' : 'text-sm'}`}>
                        <thead>
                            <tr className="border-b-2 border-black">
                                <th className="p-2 text-left font-bold" style={{ width: '10%' }}>STT</th>
                                <th className="p-2 text-left font-bold" style={{ width: '40%' }}>Tên thuốc</th>
                                <th className="p-2 text-left font-bold" style={{ width: '40%' }}>Cách dùng</th>
                                <th className="p-2 text-center font-bold" style={{ width: '10%' }}>SL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patient.prescription.map((item, index) => (
                                <tr key={item.id} className="border-b border-gray-400">
                                    <td className={`${isCompact ? 'py-1 px-2' : 'p-2'} text-center`}>{index + 1}.</td>
                                    <td className={`${isCompact ? 'py-1 px-2' : 'p-2'} font-semibold`}>{item.drugName}</td>
                                    <td className={`${isCompact ? 'py-1 px-2' : 'p-2'}`}>{formatPrescriptionInstructions(item)}</td>
                                    <td className={`${isCompact ? 'py-1 px-2' : 'p-2'} text-center`}>{item.totalQuantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </main>

            <footer className={`${isCompact ? 'mt-8' : 'mt-16'} flex justify-between items-end`}>
                <div className={`text-left ${isCompact ? 'text-xs' : 'text-sm'}`}>
                    {formattedReExamDate && (
                        <p className="font-bold mb-2">Hẹn tái khám ngày: {formattedReExamDate}</p>
                    )}
                    <p className="italic">Khám lại xin mang theo đơn này.</p>
                </div>
                <div className={`text-center ${isCompact ? 'text-xs' : 'text-sm'}`}>
                    <p>Ngày {today}</p>
                    <p className="font-bold mt-2">Bác sĩ điều trị</p>
                    <div className="h-16"></div> 
                    <p className="font-bold mt-1">BS CKI Trương Trung Nghi</p>
                </div>
            </footer>
        </div>
    );
});

export default PrintablePrescription;