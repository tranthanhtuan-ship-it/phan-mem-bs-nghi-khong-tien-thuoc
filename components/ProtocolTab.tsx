import React from 'react';
import { motion } from 'framer-motion';

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => <h2 className="text-2xl font-bold text-[var(--primary)] mt-8 mb-4 border-b-2 border-[var(--primary)] pb-2">{children}</h2>;
const GroupTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => <h3 className="text-xl font-semibold text-[var(--text-primary)] mt-6 mb-3">{children}</h3>;
const ConditionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => <h4 className="text-lg font-medium text-[var(--text-secondary)] mt-4 mb-2">{children}</h4>;
const TreatmentList: React.FC<{ items: string[] }> = ({ items }) => (
    <ol className="list-decimal list-inside space-y-2 text-sm text-[var(--text-primary)] pl-2">
        {items.map((item, index) => <li key={index} dangerouslySetInnerHTML={{ __html: item }}></li>)}
    </ol>
);

const protocols = {
    "HÔ HẤP": {
        "TRẺ EM": [
            {
                condition: "Viêm tai giữa:",
                treatments: [
                    "Klamentin 100mg/kg/ngày, ngày 3 lần",
                    "Azithromycin 15mg/kg/ngày, ngày 1 lần",
                    "Prednisolon 1mg/kg/ngày, ngày 2 lần",
                    "Paracetamol 20mg/kg/lần, ngày 3 lần",
                    "Loratadin 10mg ( &lt; 6 tuổi: 2.5mg x 2 lần; &gt; 6 tuổi-12 tuổi : 5mg x 2 lần; &gt; 12tuổi: 10mg x 2 lần).",
                    "Nhỏ tai polydeson. ngày 2 lần"
                ]
            },
            {
                condition: "Viêm xoang:",
                treatments: [
                    "Klamentin 100mg/kg/ngày, ngày 3 lần",
                    "Azithromycin 15mg/kg/ngày, ngày 1 lần",
                    "Predni 1mg/kg/ngày, para 20mg/kg/lần, ngày 1 lần",
                    "Theralen 0,25 mg/kg/lần ( nếu &lt; 3 tuổi ) hoặc Terpin + dextro ½ x 3 (nếu &gt;3 tuổi – 6 tuổi); Terpin + dextro 1v x 3 ( nếu &gt; 6 tuổi), ngày 3 lần",
                    "Loratadin 10mg ( &lt; 6 tuổi: 2.5mg x 2 lần; &gt; 6 tuổi-12 tuổi : 5mg x 2 lần; &gt; 12tuổi: 10mg x 2 lần), ngày 2 lần"
                ]
            },
            {
                condition: "Viêm phế quản, viêm họng:",
                treatments: [
                    "Klamentin 100mg/kg/ngày, ngày 3 lần",
                    "Azithromycin 15mg/kg/ngày, ngày 1 lần",
                    "Predni 1mg/kg/ngày, para 20mg/kg/lần, ngày 1 lần",
                    "Theralen 0,25 mg/kg/lần ( nếu &lt; 3 tuổi ) hoặc Terpin + dextro ½ x 3 (nếu &gt;3 tuổi – 6 tuổi); Terpin + dextro 1v x 3 ( nếu &gt; 6 tuổi ), ngày 3 lần",
                    "Loratadin 10mg ( &lt; 6 tuổi: 5mg/ngày; &gt; 6 tuổi-12 tuổi : 5mg x 2 lần; &gt; 12tuổi: 10mg x 2 lần), ngày 2 lần"
                ]
            }
        ],
        "NGƯỜI LỚN": [
            {
                condition: "Viêm tai giữa:",
                treatments: [
                    "Klamentin 1g 1v x 3, ngày 3 lần",
                    "Azithromycin 500mg 1v / ngày, ngày 1 lần",
                    "Medrol 4mg 1v x 2, ngày 2 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Cetirizin 10mg 1v x 2, ngày 2 lần",
                    "nhỏ polydeson, ngày 2 lần"
                ]
            },
            {
                condition: "Viêm xoang:",
                treatments: [
                    "Klamentin 1g 1v x 3, ngày 3 lần",
                    "Metronidazole 250mg 1v x 2, ngày 2 lần",
                    "Medrol 4mg 1v x 2, ngày 2 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần"
                ]
            },
            {
                condition: "Viêm phế quản, viêm họng:",
                treatments: [
                    "Klamentin 1g 1v x 3, ngày 3 lần",
                    "Azithromycin 500mg 1v / ngày, ngày 1 lần",
                    "Medrol 4mg 1v x 2, ngày 2 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Cetirizin 10mg 1v x 2, ngày 2 lần"
                ]
            },
        ],
        "Phụ nữ có thai": [
             {
                condition: "",
                treatments: [
                    "Klamentin 1g 1v x 3, ngày 3 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Cetirizin 10mg 1v x 2, ngày 2 lần",
                    "Vitamin 3B 1v x 3, ngày 3 lần"
                ]
            }
        ],
        "COPD ( BỆNH PHỔI TẮC NGHẼN MÃN TÍNH ), HEN PHẾ QUẢN": [
             {
                condition: "Không bội nhiễm ( không sốt ):",
                treatments: [
                    "Medrol 4mg 2v x 2, ngày 2 lần",
                    "Theophyline 100mg 1v x 2, ngày 2 lần",
                    "Salbutamol 4mg 1v x 2, ngày 2 lần",
                    "Terpin 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần"
                ]
            },
             {
                condition: "Có bội nhiễm ( có sốt ):",
                treatments: [
                    "Klamentin 1g 1v x 3, ngày 3 lần",
                    "Medrol 4mg 2v x 2,",
                    "Theophyline 100mg 1v x 2, ngày 2 lần",
                    "Salbutamol 4mg 1v x 2, ngày 2 lần",
                    "Terpin 1v x 3, ngày 3 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần"
                ]
            }
        ]
    },
    "TIÊU HOÁ": {
       "TIÊU CHẢY: Trẻ em": [
            {
                condition: "",
                treatments: [
                    "Cefixim 20mg/kg/ngày, ngày 2 lần",
                    "Metronidazole 8mg/ kg/lần, ngày 2 lần",
                    "Biolac 1v x 2, ngày 2 lần",
                    "Trimebutin 10mg/kg/ngày, ngày 2 lần",
                    "Paracetamol 20mg/kg/lần, ngày 3lần",
                    "Calci d ½v x 2, ngày 2 lần"
                ]
            }
        ],
       "TIÊU CHẢY: Người lớn": [
            {
                condition: "",
                treatments: [
                    "Ciprofloxacin 500mg 1v x 2, ngày 2 lần",
                    "Metronidazole 250 1v x 3, ngày 3 lần",
                    "Biolac 1v x 2, ngày 2 lần",
                    "Trimebutin 100mg 1v x 2, ngày 2 lần",
                    "Paracetamol 650 1v x 3, ngày 3 lần",
                    "Spasmaverin 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần"
                ]
            }
        ],
       "TIÊU CHẢY: Phụ nữ có thai": [
             {
                condition: "",
                treatments: [
                    "Cefixim 200mg 1v x 2, ngày 2 lần",
                    "Azithromycin 500mg 1v / ngày, ngày 1 lần",
                    "Biolac 1v x 2, ngày 2 lần",
                    "Paracetamol 650 1v x 3, ngày 3 lần",
                    "Spasmaverin 1v x 3, ngày 3 lần"
                ]
            }
        ],
        "VIÊM ĐẠI TRÀNG": [
            {
                condition: "Không tiêu chảy:",
                treatments: [
                    "Meloxicam 7.5mg 1v x 2, ngày 2 lần",
                    "Paracetamol 650 1v x 3, ngày 3 lần",
                    "Spasmaverin 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Vitamin 3B 1v x 3, ngày 3 lần"
                ]
            },
            {
                condition: "Có tiêu chảy:",
                treatments: [
                     "Ciprofloxacin 500mg 1v x 2, ngày 2 lần",
                    "Metronidazole 250 1v x 3, ngày 3 lần",
                    "Biolac 1v x 2, ngày 2 lần",
                    "Trimebutin 100mg 1v x 2, ngày 2 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Spasmaverin 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần"
                ]
            }
        ],
        "VIÊM DẠ DÀY": [
             {
                condition: "",
                treatments: [
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Spasmaverin 1v x 3, ngày 3 lần",
                    "Esomeprazole 40mg 1v x 2, ngày 2 lần",
                    "Motilium 1v x2, ngày 2 lần",
                    "Biolac 1v x 2, ngày 2 lần",
                    "Magie B6, 1v x 2, ngày 2 lần",
                    "Bổ gan 1v x 2, ngày 2 lần"
                ]
            }
        ],
        "TRÀO NGƯỢC DẠ DÀY TRẺ EM": [
            {
                condition: "",
                treatments: [
                    "Esomeprazole 10mg/10kg, ngày 2 lần",
                    "Domperidone 0,5 mg/kg/ngày, ngày 2 lần",
                    "Biolac 1v x2, ngày 2 lần",
                    "Antacid ½ v x 2 ( nhai ), ngày 2 lần",
                    "Calci D 1/2v x 2, ngày 2 lần"
                ]
            }
        ],
        "TÁO BÓN": [
            {
                condition: "",
                treatments: [
                    "Bisacodyl: 2-10 tuổi 5 mg 1 lần/ngày; > 10 tuổi 5-10 mg 1 lần/ngày."
                ]
            }
        ],
        "NHIỆT MIỆNG": [
            {
                condition: "",
                treatments: [
                    "Amoxcilin 500mg 1v x 2, ngày 2 lần",
                    "Prednisolone 5mg 1v x2, ngày 2 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Magie B6 1v x 2, ngày 2 lần",
                    "Vitamin C 500mg 1v x 2, ngày 2 lần"
                ]
            }
        ],
        "VIÊM DẠ DÀY DO HP": [
            {
                condition: "Tuần 1-2:",
                treatments: [
                    "Amox 500mg 2v x 2, ngày 2 lần",
                    "Clarithromycin 500mg 1v x 2, ngày 2 lần",
                    "Lansoprazole 30mg 1v x 2, ngày 2 lần",
                    "Antacid 1v x 2, ngày 2 lần"
                ]
            },
            {
                condition: "Tuần 3-6:",
                treatments: [
                    "Lansoprazole 30mg 1v x 2, ngày 2 lần",
                    "Motilium 1v x2, ngày 2 lần",
                    "Magie B6 1v x 2, ngày 2 lần",
                    "Antacid 1v x 2, ngày 2 lần"
                ]
            }
        ],
        "NẤC CỤT": [
            {
                condition: "",
                treatments: [
                    "Esomeprazole 10mg/10kg, ngày 2 lần",
                    "Domperidone 0,5 mg/kg/ngày, ngày 2 lần",
                    "Biolac 1v x2, ngày 2 lần",
                    "Antacid ½ v x 2 ( nhai ), ngày 2 lần",
                    "Calci D 1/2v x 2, ngày 2 lần"
                ]
            }
        ],
    },
    "TIẾT NIỆU": {
        "NHIỄM TRÙNG TIỂU": [
            {
                condition: "",
                treatments: [
                    "Cefixim 200mg 1v x 2, ngày 2 lần",
                    "Ciprofloxacin 500mg 1v x 2, ngày 2 lần",
                    "Medrol 4mg 1v x 2, ngày 2 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Spasmaverin 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Vitamin C 500mg 1v x 2, ngày 2 lần"
                ]
            }
        ]
    },
    "THẦN KINH": {
        "CHÓNG MẶT DO THIẾU MÁU NÃO": [
            {
                condition: "Chóng mặt nhiều:",
                treatments: [
                    "Betaserc 16mg 1v x 3, ngày 3 lần",
                    "Cinnarizin 1v x 3, ngày 3 lần",
                    "Tanganyl 1v x 2, ngày 2 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Magie B6 1v x 2, ngày 2 lần"
                ]
            },
            {
                condition: "Chóng mặt ít:",
                treatments: [
                    "Betaserc 16mg 1v x 3, ngày 3 lần",
                    "Piracetam 800mg 1v x 3, ngày 3 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Magie B6 1v x 2, ngày 2 lần"
                ]
            }
        ],
        "ĐAU ĐẦU": [
            {
                condition: "",
                treatments: [
                    "Piracetam 800mg 1v x 3, ngày 3 lần",
                    "Paracodein 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Magie B6 1v x 2, ngày 2 lần",
                    "Vitamin 3B 1v x 3, ngày 3 lần"
                ]
            }
        ],
        "SAY TÀU XE": [
            {
                condition: "",
                treatments: [
                    "Motilium 1v x 2, ngày 2 lần",
                    "Cinnarizin 1v x 3, ngày 3 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Magie B6 1v x 2, ngày 2 lần"
                ]
            }
        ]
    },
    "CƠ-XƯƠNG-KHỚP": {
        "ĐAU LƯNG, ĐAU CƠ": [
            {
                condition: "",
                treatments: [
                    "Celecoxib 200mg 1v x 2, ngày 2 lần",
                    "Medrol 4mg 1v x 2, ngày 2 lần",
                    "Paracodein 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Calci D 1v x 2, ngày 2 lần"
                ]
            }
        ],
        "ĐAU RĂNG, NHIỄM TRÙNG RĂNG MIỆNG, SÂU RĂNG": [
            {
                condition: "",
                treatments: [
                    "Cefixim 200mg 1v x 2, ngày 2 lần",
                    "Metronidazole 250mg 1v x 2, ngày 2 lần",
                    "Medrol 4mg 1v x 2, ngày 2 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Vitamin C 500mg 1v x 2, ngày 2 lần"
                ]
            }
        ],
        "TÊ TAY, TÊ CHÂN": [
            {
                condition: "",
                treatments: [
                    "Meloxicam 7.5mg 1v x 2, ngày 2 lần",
                    "Leolen 1v x 2, ngày 2 lần",
                    "Paracodein 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Vitamin 3B 1v x 3, ngày 3 lần",
                    "Calci D 1v x 2, ngày 2 lần"
                ]
            }
        ],
        "ĐAU DO VIÊM KHỚP- THOÁI HÓA CỘT SỐNG": [
            {
                condition: "",
                treatments: [
                    "Mobic 7.5mg 1v x 2, ngày 2 lần",
                    "Medrol 4mg 1v x 2, ngày 2 lần",
                    "Paracodein 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Vitamin 3B 1v x 3, ngày 3 lần",
                    "Calci D 1v x 2, ngày 2 lần"
                ]
            }
        ]
    },
    "TIM MẠCH": {
        "HUYẾT ÁP": [
            {
                condition: "HA: 14/9 đến 16/9:",
                treatments: [
                    "Losartan 50mg hoặc Amlodipin 5mg, ngày 1 lần",
                    "Cinnarizin 1v x 3, ngày 3 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Magie B6 1v x 2, ngày 2 lần"
                ]
            },
            {
                condition: "HA: 17/9",
                treatments: [
                    "Captopril 25mg 1v ngậm dưới lưỡi",
                    "Losartan 50mg, ngày 1 lần",
                    "Amlodipin 5mg, ngày 1 lần",
                    "Cinnarizin 1v x 3, ngày 3 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Magie B6 1v x 2, ngày 2 lần"
                ]
            },
            {
                condition: "HA: 18/10",
                treatments: [
                    "Captopril 25mg 1v ngậm dưới lưỡi",
                    "Hydrochlorothiazide 25mg ½ v ( sáng )",
                    "Losartan 50mg, ngày 1 lần",
                    "Amlodipin 5mg, ngày 1 lần",
                    "Bisoprolol 5mg 1/2v, ngày 1 lần",
                    "Cinnarizin 1v x 3, ngày 3 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần"
                ]
            },
            {
                condition: "HA: 19/10",
                treatments: [
                    "Captopril 25mg 2v ngậm dưới lưỡi",
                    "Nifedipin 20mg 1v x 2, ngày 2 lần",
                    "Cinnarizin 1v x 3, ngày 3 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Magie B6 1v x 2, ngày 2 lần"
                ]
            },
            {
                condition: "HA: 20/12",
                treatments: [
                    "Captopril 25mg 2v ngậm dưới lưỡi",
                    "Nifedipin 20mg 1v x 2, ngày 2 lần",
                    "Bisoprolol 5mg 1/2v, ngày 1 lần",
                    "Cinnarizin 1v x 3, ngày 3 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Magie B6 1v x 2, ngày 2 lần"
                ]
            },
            {
                condition: "HA: 21/12",
                treatments: [
                    "Captopril 25mg 2v ngậm dưới lưỡi",
                    "Nifedipin 20mg 1v x 2, ngày 2 lần",
                    "Losartan 50mg 1v, ngày 1 lần",
                    "Bisoprolol 5mg 1/2v, ngày 1 lần",
                    "Cinnarizin 1v x 3, ngày 3 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Magie B6 1v x 2, ngày 2 lần"
                ]
            },
            {
                condition: "HA: 22/12",
                treatments: [
                    "Captopril 25mg 2v ngậm dưới lưỡi",
                    "Nifedipin 20mg 1v x 2, ngày 2 lần",
                    "Hydrochlorothiazide 25mg 1/2 v (sáng)",
                    "Losartan 50mg 1v, ngày 1 lần",
                    "Bisoprolol 5mg 1/2v, ngày 1 lần",
                    "Cinnarizin 1v x 3, ngày 3 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Magie B6 1v x 2, ngày 2 lần"
                ]
            },
            {
                condition: "HA > 23/12:",
                treatments: ["Nhập viện"]
            }
        ],
        "TIỂU ĐƯỜNG": [
            {
                condition: "Đường huyết : 140-150",
                treatments: ["Metformin 500mg 1v sáng"]
            },
            {
                condition: "Đường huyết : 160-170",
                treatments: ["Metformin 500mg 1v x 2, ngày 2 lần hoặc Glicalzide 30MR 1v sáng, ngày 1 lần"]
            },
            {
                condition: "Đường huyết : 180-190",
                treatments: ["Metformin 850mg 1v x 2, ngày 2 lần"]
            },
            {
                condition: "Đường huyết : 200-210",
                treatments: ["Glicalzide 30MR 1v sáng, ngày 1 lần", "Metformin 500mg 1v x 2, ngày 2 lần"]
            },
            {
                condition: "Đường huyết : 220-230",
                treatments: ["Glicalzide 30MR 2v sáng, ngày 1 lần", "Metformin 500mg 1v chiều, ngày 1 lần"]
            },
            {
                condition: "Đường huyết : 240-250",
                treatments: ["Glicalzide 30MR 2v sáng, ngày 1 lần", "Metformin 500mg 1v x 2, ngày 2 lần"]
            },
            {
                condition: "Đường huyết : 260-270",
                treatments: ["Glicalzide 30MR 2v sáng, ngày 1 lần", "Metformin 850mg 1v x 2, ngày 2 lần"]
            },
            {
                condition: "Đường huyết : > 280",
                treatments: ["Glicalzide 30MR 2v sáng, ngày 1 lần", "Metformin 850mg 1v x 2, ngày 2 lần"]
            }
        ],
        "SUY TIM": [
            {
                condition: "Nhẹ:",
                treatments: [
                    "Captopril 25mg 1/2 v x 2, ngày 2 lần",
                    "Bisoprolol 5mg 1/2v, ngày 1 lần",
                    "Clopidogrel 75mg 1v sáng, ngày 1 lần",
                    "Spironolacton 25mg 1v sáng, ngày 1 lần",
                    "Kèm thuốc trị triệu chứng"
                ]
            },
            {
                condition: "Có phù:",
                treatments: [
                    "Furosemid 40mg 1/2v sáng, ngày 1 lần",
                    "Spironolacton 25mg 1v sáng, ngày 1 lần",
                    "Captopril 25mg 1/2 v x 2, ngày 2 lần",
                    "Bisoprolol 5mg 1/2v chiều, ngày 1 lần",
                    "Clopidogrel 75mg 1v sáng, ngày 1 lần",
                    "kèm thuốc trị triệu chứng"
                ]
            }
        ],
        "HỞ VAN 2 LÁ, 3 LÁ": [
            {
                condition: "",
                treatments: [
                    "Captopril 25mg 1/2 v x 2, ngày 2 lần",
                    "Bisoprolol 5mg 1/2v, ngày 1 lần",
                    "Clopidogrel 75mg 1v sáng, ngày 1 lần",
                    "Kèm thuốc trị triệu chứng"
                ]
            }
        ],
        "HẸP VAN": [
            {
                condition: "",
                treatments: [
                    "Bisoprolol 5mg 1/2v, ngày 1 lần",
                    "Clopidogrel 75mg 1v sáng, ngày 1 lần",
                    "Kèm thuốc trị triệu chứng"
                ]
            }
        ],
        "NHỒI MÁU CƠ TIM CŨ": [
            {
                condition: "Không tăng huyết áp:",
                treatments: [
                    "Captopril 25mg 1/2 v x 2, ngày 2 lần",
                    "Bisoprolol 5mg 1/2v, ngày 1 lần",
                    "Clopidogrel 75mg 1v sáng, ngày 1 lần",
                    "Kèm thuốc trị triệu chứng"
                ]
            },
            {
                condition: "Có tăng huyết áp:",
                treatments: [
                    "Sử dụng thuốc huyết áp theo phác đồ tăng huyết áp",
                    "Bisoprolol 5mg 1/2v, ngày 1 lần",
                    "Clopidogrel 75mg 1v sáng, ngày 1 lần",
                    "Kèm thuốc trị triệu chứng"
                ]
            }
        ]
    },
     "NGOẠI KHOA": {
        "TRĨ": [
            {
                condition: "",
                treatments: [
                    "Dafflon 2v x 2, ngày 2 lần",
                    "Rutin C 1v x 2, ngày 2 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Magie B6, 1v x 2, ngày 2 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "nếu có nhiễm trùng thì cho Klamentin 1g 1v x 3, ngày 3 lần"
                ]
            }
        ],
        "BỎNG": [
            {
                condition: "",
                treatments: [
                    "Cefuroxim 500mg 1v x 2, ngày 2 lần",
                    "Celecoxib 200mg 1v x 2, ngày 2 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Vitamin C 500mg 1v x 2, ngày 2 lần",
                    "Bôi silvirin, ngày 2 lần"
                ]
            }
        ]
    },
    "DA LIỄU, MẮT": {
        "NGỨA DA KHÔNG RÕ NGUYÊN NHÂN": [
            {
                condition: "",
                treatments: [
                    "Stadexmin 1v x 3, ngày 3 lần",
                    "Cetirizin 1v x 2, ngày 2 lần",
                    "Vitamin C 500mg 1v x 2, ngày 2 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Bổ gan 1v x 2, ngày 2 lần",
                    "Vitamin 3B 1v x 3, ngày 3 lần"
                ]
            }
        ],
        "CHỐC": [
            {
                condition: "",
                treatments: [
                    "Klamentin 1g 1v x 3, ngày 3 lần",
                    "Stadexmin 1v x 3, ngày 3 lần",
                    "Vitamin C 500mg 1v x 2, ngày 2 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "bôi xanh methylen, ngày 2 lần"
                ]
            }
        ],
        "ECZEMA (CHÀM)": [
            {
                condition: "",
                treatments: [
                    "Klamentin 1g 1v x 3, ngày 3 lần",
                    "Stadexmin 1v x 3, ngày 3 lần",
                    "Cetirizin 1v x 2, ngày 2 lần",
                    "Vitamin C 500mg 1v x 2, ngày 2 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Bôi Dibetalic, ngày 2 lần"
                ]
            }
        ],
        "VIÊM DA CƠ ĐỊA": [
            {
                condition: "",
                treatments: [
                    "Stadexmin 1v x 3, ngày 3 lần",
                    "Cetirizin 1v x 2, ngày 2 lần",
                    "Vitamin C 500mg 1v x 2, ngày 2 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Vitamin 3B 1v x 3, ngày 3 lần",
                    "bôi Eumovate, ngày 2 lần"
                ]
            }
        ],
        "SUY GIÃN TĨNH MẠCH": [
            {
                condition: "",
                treatments: [
                    "Dafflon 2v x 2, ngày 2 lần",
                    "Rutin C 1v x 2, ngày 2 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Magie B6, 1v x 2, ngày 2 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần"
                ]
            }
        ],
        "NHỌT": [
            {
                condition: "",
                treatments: [
                    "Klamentin 1g 1v x 3, ngày 3 lần",
                    "Metronidazole 250 1v x 3, ngày 3 lần",
                    "Medrol 4mg 1v x 2, ngày 2 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần"
                ]
            }
        ],
        "HẮC LÀO": [
            {
                condition: "",
                treatments: ["bôi ketoconazole"]
            }
        ],
        "GHẺ": [
            {
                condition: "",
                treatments: [
                    "Stadexmin 1v x 3, ngày 3 lần",
                    "Cetirizin 1v x 2, ngày 2 lần",
                    "Vitamin C 500mg 1v x 2, ngày 2 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Vitamin 3B 1v x 3, ngày 3 lần",
                    "bôi DEP, ngày 2 lần"
                ]
            }
        ],
        "THUỶ ĐẬU, ZONA": [
            {
                condition: "",
                treatments: [
                    "Acyclovir 800mg 1v x 5, cách nhau 4 giờ",
                    "Cefixim 200mg 1v x 2, ngày 2 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Cetirizin 10mg 1v x 2, ngày 2 lần",
                    "Vitamin C 500mg 1v x 2, ngày 2 lần"
                ]
            }
        ],
        "VIÊM DA DO KIẾN BA KHOANG": [
            {
                condition: "",
                treatments: [
                    "Cefuroxim 500mg 1v x 2, ngày 2 lần",
                    "Medrol 4mg 1v x 2, ngày 2 lần",
                    "Paracodein 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Cetirizin 10mg 1v x 2, ngày 2 lần",
                    "Bôi xanh methylen, ngày 2 lần"
                ]
            }
        ],
        "MỤN TRỨNG CÁ": [
            {
                condition: "",
                treatments: [
                    "Levofloxacin 500mg 1v, ngày 1 lần hoặc doxycilin 100mg 1v x 2 (2 tuần )",
                    "L-cystin 1v x 2, ngày 2 lần",
                    "Vitamin C 500mg 1v x 2, ngày 2 lần",
                    "Vitamin b6 1v x 2, ngày 2 lần",
                    "klenzit ( bôi ). ngày 1 lần"
                ]
            }
        ],
        "ĐAU MẮT ĐỎ (VIÊM KẾT MẠC)": [
            {
                condition: "",
                treatments: [
                    "Klamentin 1g 1v x 3, ngày 3 lần",
                    "Azithromycin 500mg 1v / ngày, ngày 1 lần",
                    "Medrol 4mg 1v x 2, ngày 2 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Cetirizin 10mg 1v x 2, ngày 2 lần"
                ]
            }
        ],
        "CHẮP LẸO": [
            {
                condition: "",
                treatments: [
                    "Klamentin 1g 1v x 3, ngày 3 lần",
                    "Azithromycin 500mg 1v / ngày, ngày 1 lần",
                    "Medrol 4mg 1v x 2, ngày 2 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Cetirizin 10mg 1v x 2, ngày 2 lần",
                    "nhỏ ofloxacin, ngày 2 lần"
                ]
            }
        ]
    },
    "TRUYỀN NHIỄM": {
        "LẬU": [
            {
                condition: "",
                treatments: [
                    "Cefixim 200mg 2v, ngày 1 lần",
                    "Azithromycin 500mg 2v, ngày 1 lần"
                ]
            }
        ],
        "SÁN CHÓ": [
            {
                condition: "",
                treatments: [
                    "Albendazol 400 mg x 2 /ngày x 7 ngày",
                    "Ivermectin 200 µg/kg/ngày 1 liều duy nhất"
                ]
            }
        ],
        "TAY CHÂN MIỆNG": [
            {
                condition: "",
                treatments: [
                    "Cefixim 20mg/kg/ngày, ngày 2 lần",
                    "Acyclovir (Dưới 2 tuổi: 200 mg/lần, 4 lần mỗi ngày, 2 - 5 tuổi: 400 mg/lần, 4 lần/ngày)",
                    "Paracetamol 20mg/kg/lần, ngày 3 lần",
                    "Loratadin 10mg ( < 6 tuổi: 2.5mg x 2 lần; > 6 tuổi-12 tuổi : 5mg x 2 lần; > 12tuổi: 10mg x 2 lần), ngày 2 lần",
                    "Calci d 1/2 v x 2, ngày 2 lần",
                    "Vitamin C 250mg 1v x 2, ngày 2 lần",
                    "bôi xanh methylen, ngày 2 lần"
                ]
            }
        ],
        "QUAI BỊ (SƯNG HÀM)": [
            {
                condition: "",
                treatments: [
                    "Acyclovir 800mg 1v x 5, ngày 5 lần",
                    "Medrol 4mg 2v x 2, ngày 2 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Vitamin C 500mg 1v x 2, ngày 2 lần"
                ]
            }
        ]
    },
    "PHỤ KHOA": {
        "ĐAU BỤNG KINH": [
            {
                condition: "",
                treatments: [
                    "Diclofenac 75mg 1v x 2, ngày 2 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần",
                    "spasmaverin 2v x 2, ngày 2 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Vitamin 3B 1v x 3, ngày 3 lần"
                ]
            }
        ]
    },
    "BỆNH KHÁC": {
        "CHẢY MÁU CAM": [
            {
                condition: "",
                treatments: [
                    "Dafflon 2v x 2, ngày 2 lần ( người lớn )",
                    "Rutin C 1v x 2, ngày 2 lần",
                    "Paracetamol 20mg/kg/lần, ngày 3 lần"
                ]
            }
        ],
        "GIẢI RƯỢU": [
            {
                condition: "",
                treatments: [
                    "Cinnarizin 25mg 1v x 3, ngày 3 lần",
                    "Motilium 1v x 2, ngày 2 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Bổ gan 1v x 3, ngày 3 lần",
                    "Vitami C 500mg 1v x 2, ngày 2 lần"
                ]
            }
        ],
        "ONG ĐỐT": [
            {
                condition: "1-9 mũi",
                treatments: [
                    "Aspirin giã nát đắp vào vết ong đốt",
                    "Bổ gan 1v x 3, ngày 3 lần",
                    "Medrol 4mg 2v x 2, ngày 2 lần",
                    "Omeprazole 20mg 1v x 2, ngày 2 lần",
                    "Cetirizin 10mg 1v x2, ngày 2 lần",
                    "Paracetamol 650mg 1v x 3, ngày 3 lần"
                ]
            }
        ]
    }
};


const ProtocolTab = () => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
            <div className="bg-[var(--card)] p-6 sm:p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-center mb-8 text-[var(--text-primary)]">PHÁC ĐỒ PHÒNG KHÁM</h1>

                {Object.entries(protocols).map(([section, groups]) => (
                    <div key={section}>
                        <SectionTitle>{section}</SectionTitle>
                        {Object.entries(groups).map(([group, conditions]) => (
                            <div key={group}>
                                <GroupTitle>{group}</GroupTitle>
                                {conditions.map((c, index) => (
                                    <div key={index} className="mb-4">
                                        {c.condition && <ConditionTitle>{c.condition}</ConditionTitle>}
                                        <TreatmentList items={c.treatments} />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default ProtocolTab;