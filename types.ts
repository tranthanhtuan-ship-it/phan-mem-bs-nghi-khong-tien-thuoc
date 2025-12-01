
export interface Vitals {
  pulse: string;
  bloodPressure: string;
  temperature: string;
  respiratoryRate: string;
  weight?: string;
}

export interface Drug {
  name: string;
  price: number;
  usage?: string; // e.g., uống, thoa, rửa, nhỏ mắt
  unit?: 'viên' | 'gói' | 'ống' | 'chai' | 'tuýp' | 'lọ';
}

export interface PrescriptionItem {
  id: string;
  drugName: string; // Tên thuốc
  morning: string; // Sáng
  noon: string; // Trưa
  afternoon: string; // Chiều
  evening: string; // Tối
  duration?: number; // Số ngày
  totalQuantity?: number; // Tổng số lượng
  usage?: string; // Cách dùng
  unit?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: string;
  gender: string;
  address?: string;
  vitals: Vitals;
  symptoms: string;
  diagnosis: string;
  prescription: PrescriptionItem[];
  prescriptionNote?: string; // Ghi chú đơn thuốc (không in ra toa)
  consultationDate: string;
}

export interface RevenueRecord {
    id: string;
    patientId: string;
    patientName: string;
    consultationFee: number;
    drugCost: number;
    otherServicesCost: number;
    total: number;
    paymentStatus: 'paid' | 'unpaid';
    date: string;
    prescription?: PrescriptionItem[];
}

export interface ReceptionPatient {
  id: string;
  name: string;
  age: string;
  gender: string;
  address?: string;
  weight: string;
  receptionDate: string;
}

export interface ReceptionDraft {
    isOpen: boolean;
    formData: {
        name: string;
        age: string;
        gender: string;
        weight: string;
        address: string;
    }
}

export type Language = 'vi' | 'en';
export type DateFormat = 'dd/mm/yyyy' | 'mm/dd/yyyy';