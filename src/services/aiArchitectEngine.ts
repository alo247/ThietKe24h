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

  // 5. Sofa phòng khách
  if (prompt.includes('sofa') || prompt.includes('phòng khách')) {
    return {
      type: 'add_item',
      payload: { symbolId: 'living_sofa', label: 'Sofa Phòng Khách Chữ L' },
      explanation: 'Dạ, tôi đã thêm Bộ Sofa Phòng Khách Chữ L bọc nỉ cao cấp kèm bàn trà vào bản vẽ.',
      suggestedChips: [
        { label: '📺 Thêm kệ TV & Tủ sách', prompt: 'Thêm kệ tivi treo tường' },
        { label: '🧶 Thêm thảm trải sàn', prompt: 'Thêm thảm trải sàn phòng khách' },
        { label: '🛏️ Thêm phòng ngủ Master', prompt: 'Thêm giường ngủ Master' }
      ]
    };
  }

  // 6. Giường ngủ Master King Size
  if (prompt.includes('giường') || prompt.includes('phòng ngủ') || prompt.includes('ngủ')) {
    return {
      type: 'add_item',
      payload: { symbolId: 'bed_double', label: 'Giường Ngủ Master King Size' },
      explanation: 'Dạ, tôi đã bố trí Giường Ngủ Đôi King Size kèm nệm êm ái, ga gối và 2 tab đầu giường vào phòng!',
      suggestedChips: [
        { label: '👔 Thêm tủ áo âm tường', prompt: 'Thêm tủ quần áo âm tường' },
        { label: '💻 Thêm bàn làm việc', prompt: 'Thêm bàn làm việc phòng ngủ' },
        { label: '🛁 Thêm phòng tắm Master', prompt: 'Thêm phòng tắm có bồn tắm nằm' }
      ]
    };
  }

  // 7. Tủ quần áo âm tường & Phòng thay đồ (Walk-in Closet)
  if (prompt.includes('tủ áo') || prompt.includes('quần áo') || prompt.includes('closet') || prompt.includes('thay đồ')) {
    return {
      type: 'add_item',
      payload: { symbolId: 'walk_in_closet', label: 'Tủ Quần Áo Âm Tường (Walk-in Closet)' },
      explanation: 'Dạ, tôi đã gắn thêm Hệ Tủ Quần Áo Âm Tường chia ngăn treo vest, đầm và kệ trang trí!',
      suggestedChips: [
        { label: '💄 Thêm bàn trang điểm', prompt: 'Thêm bàn trang điểm' },
        { label: '🧊 Xem 3D phòng ngủ', prompt: 'Xem 3d' }
      ]
    };
  }

  // 8. Kệ TV & Tủ sách trang trí
  if (prompt.includes('tivi') || prompt.includes('tv') || prompt.includes('kệ sách')) {
    return {
      type: 'add_item',
      payload: { symbolId: 'tv_unit', label: 'Kệ TV & Tủ Sách Trang Trí' },
      explanation: 'Dạ, tôi đã lắp Kệ TV gỗ sồi ốp tường kèm màn hình TV siêu mỏng và tủ sách vào phòng khách!',
      suggestedChips: [
        { label: '🛋️ Thêm sofa phòng khách', prompt: 'Thêm sofa phòng khách' },
        { label: '🪴 Thêm chậu cây cảnh', prompt: 'Thêm chậu cây cảnh' }
      ]
    };
  }

  // 9. Bàn làm việc / Bàn trang điểm / Bàn học
  if (prompt.includes('làm việc') || prompt.includes('trang điểm') || prompt.includes('bàn học')) {
    return {
      type: 'add_item',
      payload: { symbolId: 'work_desk', label: 'Bàn Làm Việc & Ghế Tựa' },
      explanation: 'Dạ, tôi đã bố trí Bàn Làm Việc gỗ sồi kèm ghế tựa êm ái và laptop vào không gian phòng!',
      suggestedChips: [
        { label: '🛏️ Thêm giường ngủ', prompt: 'Thêm giường ngủ Master' },
        { label: '🪴 Thêm chậu cây xanh', prompt: 'Thêm chậu cây cảnh' }
      ]
    };
  }

  // 10. Phòng tắm Master / Bồn tắm nằm / Lavabo đôi
  if (prompt.includes('tắm') || prompt.includes('bồn tắm') || prompt.includes('lavabo') || prompt.includes('vệ sinh') || prompt.includes('wc')) {
    const isShower = prompt.includes('đứng') || prompt.includes('vòi sen') || prompt.includes('cabin');
    const symbolId = isShower ? 'glass_shower' : prompt.includes('đôi') ? 'double_vanity' : 'bathroom_set';
    return {
      type: 'add_item',
      payload: { symbolId, label: 'Khu Vực Vệ Sinh & Tắm Cao Cấp' },
      explanation: 'Dạ, tôi đã thiết kế Khu Vệ Sinh & Phòng Tắm Master mặt đá Marble sang trọng vào bản vẽ!',
      suggestedChips: [
        { label: '🚿 Thêm cabin tắm kính', prompt: 'Thêm cabin tắm đứng kính' },
        { label: '🛁 Thêm bồn tắm nằm', prompt: 'Thêm bồn tắm nằm' }
      ]
    };
  }

  // 11. Cầu thang gỗ nội thất
  if (prompt.includes('cầu thang') || prompt.includes('lên tầng') || prompt.includes('lên lầu')) {
    return {
      type: 'add_item',
      payload: { symbolId: 'interior_stairs', label: 'Cầu Thang Gỗ Tay Vịn Kính' },
      explanation: 'Dạ, tôi đã đặt Cầu Thang bậc gỗ sồi kèm lan can kính sang trọng để kết nối các tầng!',
      suggestedChips: [
        { label: '🧊 Xem 3D cầu thang', prompt: 'Xem 3d' },
        { label: '📐 Về mặt bằng 2D', prompt: 'Về mặt bằng 2d' }
      ]
    };
  }

  // 12. Giường tắm nắng ban công / Ghế ngoài trời
  if (prompt.includes('tắm nắng') || prompt.includes('sunbed') || prompt.includes('ban công') || prompt.includes('ghế nằm')) {
    return {
      type: 'add_item',
      payload: { symbolId: 'lounge_sunbed', label: 'Giường Tắm Nắng Ban Công' },
      explanation: 'Dạ, tôi đã đặt Giường Nằm Tắm Nắng ngoài trời bọc nệm trắng thư giãn ra khu vực ban công!',
      suggestedChips: [
        { label: '☂️ Thêm dù che nắng', prompt: 'Thêm bàn cafe sân vườn' },
        { label: '🪴 Thêm chậu cây cọ', prompt: 'Thêm chậu cây cảnh' }
      ]
    };
  }

  // 13. Giàn Pergola che nắng sân thượng
  if (prompt.includes('pergola') || prompt.includes('giàn lam') || prompt.includes('sân thượng')) {
    return {
      type: 'add_item',
      payload: { symbolId: 'terrace_pergola', label: 'Giàn Pergola Che Nắng' },
      explanation: 'Dạ, tôi đã dựng Giàn Lam Gỗ Pergola che nắng thoáng đãng cho khu vực sân thượng!',
      suggestedChips: [
        { label: '☕ Thêm bàn cafe', prompt: 'Thêm bàn cafe sân vườn' },
        { label: '🧊 Xem 3D sân thượng', prompt: 'Xem 3d' }
      ]
    };
  }

  // 14. Bếp & Bàn ăn gia đình
  if (prompt.includes('bếp') || prompt.includes('bàn ăn') || prompt.includes('nấu')) {
    const symbolId = prompt.includes('ăn') ? 'dining_table' : 'kitchen_counter';
    return {
      type: 'add_item',
      payload: { symbolId, label: prompt.includes('ăn') ? 'Bàn Ăn Gia Đình' : 'Tủ Bếp & Đảo Bếp Marble' },
      explanation: 'Dạ, tôi đã bố trí Khu Vực Bếp Nấu & Bàn Ăn gia đình hiện đại vào không gian mở!',
      suggestedChips: [
        { label: '🛋️ Thêm sofa phòng khách', prompt: 'Thêm sofa phòng khách' },
        { label: '🧊 Xem 3D bếp', prompt: 'Xem 3d' }
      ]
    };
  }

  // === E. TRƯỜNG HỢP CÂU LỆNH CẦN TƯ VẤN KIẾN TRÚC ===
  return {
    type: 'consultation',
    explanation: `Dạ, tôi đã lắng nghe yêu cầu của bạn: "${prompt}".\n\nTôi có thể triển khai ngay bất kỳ chi tiết nào (Phòng khách, Phòng ngủ Master, Bếp, Ban công, Cầu thang, Bồn tắm, Hồ cá...). Bạn muốn tôi thêm gì tiếp theo?`,
    suggestedChips: [
      { label: '🛏️ Thêm phòng ngủ Master', prompt: 'Thêm giường ngủ Master' },
      { label: '🛋️ Thêm sofa phòng khách', prompt: 'Thêm sofa phòng khách' },
      { label: '🛁 Thêm bồn tắm nằm', prompt: 'Thêm bồn tắm nằm' },
      { label: '🏖️ Thêm ghế tắm nắng ban công', prompt: 'Thêm ghế tắm nắng ngoài trời' },
      { label: '🧊 Xem 3D ngay', prompt: 'Xem 3d' }
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
