// src/services/aiArchitectEngine.ts
// Bộ Não Trợ Lý Kiến Trúc Sư AI Tự Động Phân Tích Ý Định & Triển Khai Bản Vẽ (AI Architect Copilot Engine)

import { 
  Board, 
  BoardItem, 
  WallItem, 
  DoorWindowItem, 
  GardenFurnitureItem, 
  DimensionItem, 
  AIAuthConfig, 
  AICanvasCommand 
} from '../types';
import { getSymbolDef } from '../data/architecturalSymbols';
import { createLandPlotBoard, createTropicalVillaBoard, createModernTownhouseBoard, createEcoRetreatBoard } from '../data/houseTemplates';

// Hệ thống prompt xử lý ngôn ngữ tự nhiên
export async function processUserPrompt(
  prompt: string, 
  currentBoard: Board, 
  aiConfig: AIAuthConfig
): Promise<AICanvasCommand> {
  const normalized = prompt.toLowerCase().trim();

  // 1. KIỂM TRA NẾU CÓ CẤU HÌNH API NGOÀI (OpenAI / Gemini / Claude / DeepSeek)
  if (aiConfig.provider === 'openai' && aiConfig.apiKey) {
    try {
      return await callOpenAIArchitect(prompt, currentBoard, aiConfig);
    } catch (e) {
      console.warn('OpenAI API lỗi, tự động chuyển về Bộ não AI Tích hợp:', e);
    }
  } else if (aiConfig.provider === 'gemini' && aiConfig.apiKey) {
    try {
      return await callGeminiArchitect(prompt, currentBoard, aiConfig);
    } catch (e) {
      console.warn('Gemini API lỗi, tự động chuyển về Bộ não AI Tích hợp:', e);
    }
  }

  // 2. BỘ NÃO XỬ LÝ KIẾN TRÚC TÍCH HỢP SẴN (NATIVE ARCHITECT ENGINE)
  return processNativeArchitectPrompt(normalized, currentBoard);
}

// Bộ não xử lý ngôn ngữ tự nhiên & hình học kiến trúc tích hợp sẵn (Native NLP & Geometry)
function processNativeArchitectPrompt(prompt: string, currentBoard: Board): AICanvasCommand {
  // === A. ĐIỀU KHIỂN HỆ THỐNG (3D, NẮNG, DỰ TOÁN) ===
  if (prompt.includes('3d') || prompt.includes('phối cảnh') || prompt.includes('ba chiều')) {
    // Trích xuất giờ nắng nếu có (ví dụ: "lúc 15h", "lúc 4h chiều", "9 giờ")
    const hourMatch = prompt.match(/(\d{1,2})\s*(h|giờ)/);
    const sunHour = hourMatch ? parseInt(hourMatch[1]) : undefined;

    return {
      type: 'switch_view_3d',
      payload: { sunHour },
      explanation: sunHour 
        ? `Dạ, tôi đã chuyển sang chế độ Xem Phối Cảnh 3D với mô phỏng ánh nắng và bóng đổ lúc ${sunHour}:00!`
        : 'Dạ, tôi đã chuyển sang chế độ Xem Phối Cảnh 3D trực quan cho bạn!',
      suggestedChips: [
        { label: '🌅 Xem nắng sáng 08:00', prompt: 'Xem 3D lúc 8h sáng' },
        { label: '☀️ Xem nắng trưa 12:00', prompt: 'Xem 3D lúc 12h trưa' },
        { label: '🌇 Xem hoàng hôn 17:00', prompt: 'Xem 3D lúc 17h' },
        { label: '📐 Về Mặt Bằng 2D', prompt: 'Về mặt bằng 2d' }
      ]
    };
  }

  if (prompt.includes('2d') || prompt.includes('mặt bằng') || prompt.includes('bản vẽ')) {
    return {
      type: 'switch_view_2d',
      explanation: 'Dạ, tôi đã đưa bạn trở lại Chế độ Bản Vẽ Mặt Bằng 2D chi tiết.',
      suggestedChips: [
        { label: '🏠 Thêm phòng ngủ', prompt: 'Thêm 1 phòng ngủ' },
        { label: '🐟 Thêm hồ cá Koi', prompt: 'Thêm hồ cá Koi phía trước' },
        { label: '💰 Dự toán chi phí', prompt: 'Tính dự toán chi phí' }
      ]
    };
  }

  if (prompt.includes('dự toán') || prompt.includes('chi phí') || prompt.includes('giá') || prompt.includes('tiền') || prompt.includes('báo giá')) {
    return {
      type: 'open_cost_estimator',
      explanation: 'Dạ, tôi đã mở Bảng Dự Toán Chi Phí & Thống Kê Khối Lượng Vật Tư tự động cho công trình này!',
      suggestedChips: [
        { label: '📄 Xuất file Excel', prompt: 'Xuất file excel dự toán' },
        { label: '🖨️ In báo cáo', prompt: 'In báo cáo' }
      ]
    };
  }

  // === B. TẠO KHU ĐẤT / LÔ ĐẤT THEO KÍCH THƯỚC (Ví dụ: "lô đất 10x20m", "đất 8x15m") ===
  const plotMatch = prompt.match(/(\d{1,3})\s*(x|m\s*x|\*|nhân)\s*(\d{1,3})\s*(m|mét)?/);
  const hasLandKeyword = prompt.includes('đất') || prompt.includes('khu đất') || prompt.includes('lô đất') || prompt.includes('mảnh đất') || prompt.includes('khung đất');

  if (plotMatch && (hasLandKeyword || prompt.includes('kích thước'))) {
    const width = parseInt(plotMatch[1]);
    const length = parseInt(plotMatch[3]);
    const newBoard = createLandPlotBoard(width, length, `Lô Đất ${width}m x ${length}m`);

    return {
      type: 'create_land_plot',
      payload: { board: newBoard },
      explanation: `Dạ, tôi đã tự động vẽ khuôn viên lô đất kích thước chuẩn ${width}m x ${length}m (${width * length} m²) kèm hệ thống ranh mốc và thước đo khoảng cách!`,
      suggestedChips: [
        { label: '🏡 Dựng nhà vườn tại đây', prompt: `Thiết kế nhà vườn trên lô đất ${width}x${length}m có hồ cá Koi` },
        { label: '🏊 Thêm hồ bơi', prompt: 'Thêm hồ bơi ngoài trời' },
        { label: '🧊 Xem 3D lô đất', prompt: 'Xem 3d' }
      ]
    };
  }

  // === C. THIẾT KẾ NHÀ VƯỜN / BIỆT THỰ HOÀN CHỈNH ===
  if (prompt.includes('biệt thự') || prompt.includes('nhà vườn') || (prompt.includes('thiết kế') && prompt.includes('nhà'))) {
    // Trích xuất diện tích nếu có
    const width = plotMatch ? parseInt(plotMatch[1]) : 12;
    const length = plotMatch ? parseInt(plotMatch[3]) : 20;

    let targetBoard: Board;
    let desc = '';

    if (prompt.includes('phố') || prompt.includes('ống') || width <= 6) {
      targetBoard = createModernTownhouseBoard();
      desc = 'Mẫu Nhà Phố Hiện Đại kèm Giếng Trời và Sân Vườn thư giãn';
    } else if (prompt.includes('nghỉ dưỡng') || prompt.includes('resort') || prompt.includes('sinh thái') || prompt.includes('hồ bơi')) {
      targetBoard = createEcoRetreatBoard();
      desc = 'Khu Nghỉ Dưỡng Sinh Thái kèm Hồ Bơi Vô Cực và Chòi Gỗ';
    } else {
      targetBoard = createTropicalVillaBoard();
      desc = `Biệt Thự Vườn Nhiệt Đới chuẩn ${width}m x ${length}m có Hồ Cá Koi, Phòng Khách, 2 Phòng Ngủ, Bếp và Cây Cổ Thụ`;
    }

    return {
      type: 'create_house_garden',
      payload: { board: targetBoard },
      explanation: `Dạ, tôi đã lập tức triển khai hoàn chỉnh ${desc}! Bạn có thể xem mặt bằng 2D hoặc bấm nút 3D để chiêm ngưỡng phối cảnh.`,
      suggestedChips: [
        { label: '🧊 Xem phối cảnh 3D', prompt: 'Xem 3D lúc 15h' },
        { label: '💰 Tính dự toán kinh phí', prompt: 'Tính dự toán chi phí' },
        { label: '🌳 Thêm cây bóng mát', prompt: 'Thêm cây bóng mát' },
        { label: '🔥 Thêm bếp BBQ ngoài trời', prompt: 'Thêm bếp BBQ ngoài trời' }
      ]
    };
  }

  // === D. THÊM TỪNG VẬT THỂ CỤ THỂ (Hồ bơi, Hồ cá Koi, Cây xanh, Sofa, Giường, Chòi nghỉ...) ===
  // 1. Hồ cá Koi
  if (prompt.includes('hồ cá') || prompt.includes('koi')) {
    return {
      type: 'add_item',
      payload: { symbolId: 'koi_pond', label: 'Hồ Cá Koi Nghệ Thuật' },
      explanation: 'Dạ, tôi đã thêm một Hồ Cá Koi uốn lượn phong thủy vào bản vẽ cho bạn!',
      suggestedChips: [
        { label: '🌴 Thêm cây bóng mát bên hồ', prompt: 'Thêm cây bóng mát' },
        { label: '🛖 Thêm chòi nghỉ ngắm cá', prompt: 'Thêm chòi nghỉ ngắm cảnh' },
        { label: '🧊 Xem 3D hồ cá', prompt: 'Xem 3d' }
      ]
    };
  }

  // 2. Hồ bơi
  if (prompt.includes('hồ bơi') || prompt.includes('bể bơi')) {
    return {
      type: 'add_item',
      payload: { symbolId: 'swimming_pool', label: 'Hồ Bơi Gia Đình' },
      explanation: 'Dạ, tôi đã bố trí một Hồ Bơi ngoài trời mặt nước trong xanh vào khu đất!',
      suggestedChips: [
        { label: '⛱️ Thêm bàn cafe & dù che', prompt: 'Thêm bàn cafe sân vườn' },
        { label: '🪵 Lát sàn gỗ decking quanh hồ', prompt: 'Thêm sàn gỗ decking' },
        { label: '🧊 Xem 3D hồ bơi', prompt: 'Xem 3d' }
      ]
    };
  }

  // 3. Cây bóng mát / Cây tùng
  if (prompt.includes('cây') || prompt.includes('hoa') || prompt.includes('vườn')) {
    const symbolId = prompt.includes('tùng') ? 'tree_pine' : prompt.includes('hoa') ? 'flower_bed' : 'tree_large';
    const symDef = getSymbolDef(symbolId);
    return {
      type: 'add_item',
      payload: { symbolId, label: symDef?.name || 'Cây Xanh Cảnh Quan' },
      explanation: `Dạ, tôi đã thêm ${symDef?.name || 'Cây Xanh Cảnh Quan'} vào sân vườn để tăng mảng xanh và bóng mát sinh thái!`,
      suggestedChips: [
        { label: '🌿 Thêm thảm cỏ tự nhiên', prompt: 'Thêm thảm cỏ xanh' },
        { label: '🪨 Thêm lối đi đá sỏi', prompt: 'Thêm lối đi đá sỏi' }
      ]
    };
  }

  // 4. Chòi nghỉ / Bàn cafe / Bếp BBQ
  if (prompt.includes('chòi') || prompt.includes('vọng cảnh') || prompt.includes('uống trà')) {
    return {
      type: 'add_item',
      payload: { symbolId: 'gazebo', label: 'Chòi Nghỉ Vọng Cảnh' },
      explanation: 'Dạ, tôi đã dựng một Chòi Nghỉ Vọng Cảnh mái gỗ ấm cúng giữa khu vườn!',
      suggestedChips: [
        { label: '☕ Thêm bàn cafe ngoài trời', prompt: 'Thêm bàn cafe sân vườn' },
        { label: '🧊 Xem 3D chòi gỗ', prompt: 'Xem 3d' }
      ]
    };
  }

  if (prompt.includes('sofa') || prompt.includes('phòng khách')) {
    return {
      type: 'add_item',
      payload: { symbolId: 'living_sofa', label: 'Sofa Phòng Khách Chữ L' },
      explanation: 'Dạ, tôi đã thêm Bộ Sofa Phòng Khách Chữ L cao cấp kèm bàn trà vào bản vẽ.',
      suggestedChips: [
        { label: '🛏️ Thêm phòng ngủ Master', prompt: 'Thêm giường ngủ Master' },
        { label: '🍳 Thêm tủ bếp & bàn ăn', prompt: 'Thêm tủ bếp hiện đại' }
      ]
    };
  }

  // === E. TRƯỜNG HỢP CÂU LỆNH CHƯA ĐỦ THÔNG TIN HOẶC CẦN TƯ VẤN KIẾN TRÚC ===
  return {
    type: 'consultation',
    explanation: `Dạ, tôi đã lắng nghe yêu cầu của bạn: "${prompt}".\n\nĐể tôi có thể triển khai bản vẽ chuẩn xác và đẹp nhất, bạn vui lòng chọn hoặc nói rõ thêm về mong muốn của mình nhé:`,
    suggestedChips: [
      { label: '🌴 Biệt thự vườn 10x20m', prompt: 'Thiết kế biệt thự vườn 10x20m có hồ cá Koi và 2 phòng ngủ' },
      { label: '🏡 Nhà phố hiện đại 5x20m', prompt: 'Thiết kế nhà phố 5x20m có giếng trời' },
      { label: '🌊 Khu nghỉ dưỡng hồ bơi', prompt: 'Thiết kế khu nghỉ dưỡng sinh thái có hồ bơi' },
      { label: '📐 Tạo khung đất 8x15m', prompt: 'Lô đất 8x15m' },
      { label: '💰 Tính dự toán kinh phí', prompt: 'Tính dự toán chi phí' }
    ]
  };
}

// Gọi API OpenAI (Khi người dùng có tài khoản OpenAI)
async function callOpenAIArchitect(prompt: string, currentBoard: Board, config: AIAuthConfig): Promise<AICanvasCommand> {
  const systemPrompt = `Bạn là Trợ lý Kiến Trúc Sư AI Cao Cấp chuyên thiết kế nhà và sân vườn tại Việt Nam.
Hãy phân tích yêu cầu của người dùng và trả về phản hồi JSON theo định dạng:
{
  "type": "create_house_garden" | "create_land_plot" | "add_item" | "switch_view_3d" | "switch_view_2d" | "open_cost_estimator" | "consultation",
  "explanation": "Câu trả lời lịch thiệp, ân cần, giải thích rõ phương án kiến trúc",
  "suggestedChips": [{"label": "Tên nút gợi ý", "prompt": "Câu lệnh tiếp theo"}]
}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) throw new Error('OpenAI API request failed');
  const data = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed;
}

// Gọi API Gemini (Khi người dùng có tài khoản Google Gemini)
async function callGeminiArchitect(prompt: string, currentBoard: Board, config: AIAuthConfig): Promise<AICanvasCommand> {
  const modelName = config.model || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.apiKey}`;

  const systemInstruction = `Bạn là Trợ lý Kiến Trúc Sư AI Cao Cấp chuyên thiết kế nhà và sân vườn. Trả về JSON: {"type": "create_house_garden"|"add_item"|"switch_view_3d"|"open_cost_estimator"|"consultation", "explanation": "Lời giải thích", "suggestedChips": [{"label": "nút", "prompt": "lệnh"}]}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\nYêu cầu: ${prompt}` }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  });

  if (!res.ok) throw new Error('Gemini API request failed');
  const data = await res.json();
  const textContent = data.candidates[0].content.parts[0].text;
  return JSON.parse(textContent);
}
