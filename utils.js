/* utils.js - Các hàm tiện ích toán học và thuật toán xử lý đồ họa */

const Utils = {
    // Tạo ID ngẫu nhiên duy nhất cho các vật thể
    generateId() {
        return 'elem_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    },

    // Tính khoảng cách giữa hai điểm
    distance(p1, p2) {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    },

    // Tính khoảng cách từ điểm p đến đường thẳng xác định bởi lineStart và lineEnd
    perpendicularDistance(p, lineStart, lineEnd) {
        const dx = lineEnd.x - lineStart.x;
        const dy = lineEnd.y - lineStart.y;
        
        // Nếu điểm đầu và điểm cuối trùng nhau, tính khoảng cách tới điểm đó
        if (dx === 0 && dy === 0) {
            return this.distance(p, lineStart);
        }
        
        // Công thức tính khoảng cách từ điểm tới đường thẳng: |Ax + By + C| / sqrt(A^2 + B^2)
        const numerator = Math.abs(dy * p.x - dx * p.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x);
        const denominator = Math.sqrt(dx * dx + dy * dy);
        return numerator / denominator;
    },

    // Thuật toán Ramer-Douglas-Peucker (RDP) để đơn giản hóa đường cong thành các đoạn thẳng
    ramerDouglasPeucker(points, epsilon) {
        if (points.length <= 2) {
            return points;
        }

        let dmax = 0;
        let index = 0;
        const end = points.length - 1;

        for (let i = 1; i < end; i++) {
            const d = this.perpendicularDistance(points[i], points[0], points[end]);
            if (d > dmax) {
                index = i;
                dmax = d;
            }
        }

        // Nếu khoảng cách lớn nhất lớn hơn epsilon, chia đôi và đệ quy
        if (dmax > epsilon) {
            const results1 = this.ramerDouglasPeucker(points.slice(0, index + 1), epsilon);
            const results2 = this.ramerDouglasPeucker(points.slice(index), epsilon);

            // Nối kết quả (loại bỏ điểm trùng ở giữa)
            return results1.slice(0, results1.length - 1).concat(results2);
        } else {
            // Ngược lại, chỉ giữ lại điểm đầu và điểm cuối
            return [points[0], points[end]];
        }
    },

    // Thuật toán làm thẳng nét vẽ tự do thông minh
    straightenPath(points) {
        if (points.length <= 2) return points;

        // Tính tổng chiều dài đường đi thực tế của nét vẽ
        let pathLength = 0;
        for (let i = 1; i < points.length; i++) {
            pathLength += this.distance(points[i - 1], points[i]);
        }

        // Khoảng cách đường chim bay từ đầu đến cuối
        const directDist = this.distance(points[0], points[points.length - 1]);

        // Nếu nét vẽ tương đối thẳng (độ cong nhỏ) hoặc khoảng cách trực tiếp ngắn,
        // chúng ta sẽ biến nó thành một đường thẳng duy nhất nối điểm đầu và cuối.
        // Tỷ lệ pathLength / directDist gần 1 nghĩa là đường vẽ rất thẳng.
        if (directDist > 0 && (pathLength / directDist < 1.3)) {
            return [points[0], points[points.length - 1]];
        }

        // Ngược lại, nếu người dùng vẽ hình ziczac hoặc đa giác (độ cong uốn lượn rõ rệt),
        // sử dụng thuật toán RDP để giữ lại các điểm góc cua chính và làm thẳng các phân đoạn ở giữa.
        // Ngưỡng epsilon = 18px hoạt động rất tốt để lọc nhiễu nét vẽ tay.
        const straightened = this.ramerDouglasPeucker(points, 18);
        return straightened;
    },

    // Tìm điểm gần nhất trên viền hình chữ nhật (Dùng để định vị chân đường kết nối Connector)
    getClosestPointOnRect(point, rect) {
        const x = rect.x;
        const y = rect.y;
        const w = rect.width;
        const h = rect.height;

        // Giới hạn điểm nằm trong vùng bao hình chữ nhật để tìm hình chiếu trên 4 cạnh
        const clampX = Math.max(x, Math.min(point.x, x + w));
        const clampY = Math.max(y, Math.min(point.y, y + h));

        // Tính khoảng cách tới 4 cạnh
        const dl = Math.abs(point.x - x);
        const dr = Math.abs(point.x - (x + w));
        const dt = Math.abs(point.y - y);
        const db = Math.abs(point.y - (y + h));

        const min = Math.min(dl, dr, dt, db);

        if (min === dl) return { x: x, y: clampY, side: 'left' };
        if (min === dr) return { x: x + w, y: clampY, side: 'right' };
        if (min === dt) return { x: clampX, y: y, side: 'top' };
        return { x: clampX, y: y + h, side: 'bottom' };
    },

    // [TÍNH NĂNG THIẾT KẾ NHÀ]: Quy đổi từ pixel sang mét (1m = 40px)
    pxToMeter(px) {
        return Math.round((px / 40) * 100) / 100; // Làm tròn tới 2 chữ số thập phân
    },

    // Quy đổi từ mét sang pixel (1m = 40px)
    meterToPx(m) {
        return m * 40;
    },

    // Làm tròn giá trị tọa độ theo kích cỡ Grid Snap (hít lưới)
    snapValue(val, snapSize) {
        if (!snapSize || snapSize <= 0) return val;
        return Math.round(val / snapSize) * snapSize;
    },

    // Tìm trung điểm của một đoạn thẳng (dùng để vẽ nhãn khoảng cách Connector)
    getLineMiddlePoint(p1, p2) {
        return {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2
        };
    },

    // Kiểm tra xem một điểm có nằm bên trong hình chữ nhật xoay hay không
    isPointInRotatedRect(p, rect) {
        // Tạm thời bỏ qua xoay phức tạp, kiểm tra hình hộp giới hạn cơ bản AABB
        return p.x >= rect.x && p.x <= rect.x + rect.width &&
               p.y >= rect.y && p.y <= rect.y + rect.height;
    },

    // Kiểm tra xem một điểm có nằm gần đoạn thẳng hay không (đối với nét vẽ tự do)
    isPointNearLine(p, p1, p2, threshold = 8) {
        const dist = this.perpendicularDistance(p, p1, p2);
        if (dist > threshold) return false;

        // Kiểm tra xem hình chiếu của p có nằm trong đoạn thẳng p1-p2 không
        const dotProduct = (p.x - p1.x) * (p2.x - p1.x) + (p.y - p1.y) * (p2.y - p1.y);
        const lineLenSq = (p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2;
        
        if (lineLenSq === 0) return false;
        
        const projection = dotProduct / lineLenSq;
        return projection >= 0 && projection <= 1;
    },

    // Kiểm tra xem một điểm có nằm gần bất kỳ đoạn nào trong nét vẽ tự do
    isPointNearPath(p, pathPoints, threshold = 8) {
        for (let i = 1; i < pathPoints.length; i++) {
            if (this.isPointNearLine(p, pathPoints[i - 1], pathPoints[i], threshold)) {
                return true;
            }
        }
        return false;
    }
};
