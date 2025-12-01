
import { GoogleGenAI, Type } from "@google/genai";
import { Drug } from '../types';

export const getDiagnosisSuggestion = async (symptoms: string): Promise<string> => {
  if (!symptoms.trim()) {
    return "Vui lòng nhập triệu chứng lâm sàng.";
  }
  
  if (!process.env.API_KEY) {
    return "Lỗi: API Key chưa được cấu hình. Vui lòng kiểm tra lại.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      Bạn là một trợ lý y khoa AI chuyên nghiệp, được đào tạo từ các tài liệu y khoa chính thống. 
      Dựa trên các triệu chứng lâm sàng sau đây, hãy đưa ra một số chẩn đoán phân biệt có khả năng xảy ra nhất. 
      Trình bày câu trả lời một cách có cấu trúc, mỗi chẩn đoán kèm theo một giải thích ngắn gọn tại sao nó phù hợp với các triệu chứng được cung cấp.

      Lưu ý quan trọng: Phân tích của bạn chỉ mang tính chất tham khảo, không thay thế cho chẩn đoán chuyên môn của bác sĩ.

      Triệu chứng của bệnh nhân:
      ---
      ${symptoms}
      ---

      Hãy bắt đầu phân tích của bạn.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error fetching diagnosis from Gemini API:", error);
    if (error instanceof Error) {
        return `Đã xảy ra lỗi khi kết nối đến AI: ${error.message}`;
    }
    return "Đã xảy ra lỗi không xác định khi kết nối đến AI.";
  }
};

export const extractDrugsFromFileContent = async (text: string): Promise<Drug[]> => {
    if (!text.trim()) {
        return [];
    }

    if (!process.env.API_KEY) {
        throw new Error("Lỗi: API Key chưa được cấu hình. Vui lòng kiểm tra lại.");
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `
            Phân tích văn bản sau đây, được trích xuất từ một tài liệu y tế hoặc danh sách thuốc. 
            Nhiệm vụ của bạn là xác định tất cả các tên thuốc, đơn giá, cách dùng, và đơn vị tính của chúng.
            - Tên thuốc (name): bao gồm cả hàm lượng hoặc nồng độ (ví dụ: 'Paracetamol 500mg').
            - Đơn giá (price): là giá cho một đơn vị. Đây phải là một con số. Nếu không tìm thấy, mặc định là 0.
            - Cách dùng (usage): hướng dẫn sử dụng cơ bản (ví dụ: 'uống', 'thoa'). Nếu không tìm thấy, mặc định là 'uống'.
            - Đơn vị (unit): là đơn vị của thuốc (ví dụ: 'viên', 'gói', 'chai', 'ống'). Nếu không tìm thấy, mặc định là 'viên'.
            
            Bỏ qua tất cả các văn bản khác không liên quan.
            Chỉ trả về kết quả dưới dạng một mảng JSON của các đối tượng. Mỗi đối tượng phải có các thuộc tính: "name", "price", "usage", và "unit".
            Ví dụ về đầu ra mong muốn: 
            [
              {"name": "Paracetamol 500mg", "price": 500, "usage": "uống", "unit": "viên"},
              {"name": "Oresol", "price": 1500, "usage": "uống", "unit": "gói"},
              {"name": "Berberin 100mg", "price": 20000, "usage": "uống", "unit": "chai"}
            ]
            Nếu không tìm thấy tên thuốc nào, hãy trả về một mảng rỗng [].

            Văn bản cần phân tích:
            ---
            ${text}
            ---
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: {
                                type: Type.STRING,
                                description: "Tên thuốc đầy đủ bao gồm cả hàm lượng.",
                            },
                            price: {
                                type: Type.NUMBER,
                                description: "Đơn giá của thuốc.",
                            },
                            usage: {
                                type: Type.STRING,
                                description: "Cách dùng thuốc (uống, thoa, etc.).",
                            },
                            unit: {
                                type: Type.STRING,
                                description: "Đơn vị tính của thuốc (viên, gói, ống, etc.).",
                            },
                        },
                        required: ["name", "price", "usage", "unit"],
                    },
                },
            },
        });
        
        const jsonText = response.text.trim();
        const cleanedJson = jsonText.replace(/^```json\s*|```\s*$/g, '');

        const result = JSON.parse(cleanedJson);
        if (Array.isArray(result) && result.every(item => 
            typeof item === 'object' &&
            item !== null &&
            'name' in item && typeof item.name === 'string' &&
            'price' in item && typeof item.price === 'number' &&
            'usage' in item && typeof item.usage === 'string' &&
            'unit' in item && typeof item.unit === 'string'
        )) {
            return result as Drug[];
        }
        throw new Error("AI đã trả về dữ liệu không đúng định dạng mảng đối tượng thuốc.");

    } catch (error) {
        console.error("Error extracting drugs from text via Gemini API:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Không thể phân tích phản hồi JSON từ AI. Phản hồi có thể không hợp lệ.");
        }
        throw error; // Ném lại lỗi ban đầu nếu không phải là lỗi cú pháp
    }
};