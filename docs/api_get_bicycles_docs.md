# 📖 Tài liệu API: Lấy Danh Sách Các Dòng Xe Đạp (Bicycle Catalog)
**Mục đích:** Backend vừa nung nấu thêm một API dùng chung rất xịn! API này sẽ bưng toàn bộ từ A-Z danh sách tất cả các mẫu Xe đang có trên hệ thống để phục vụ cho 2 màn hình quan trọng nhất của Frontend:
1. **Trang Giao diện Gửi Bài Bán Xe (Seller):** Dùng để đổ dữ liệu vào cái Thẻ `<select>` Dropdown/Combobox chọn cấu hình xe lúc đăng bài.
2. **Dashboard Quản Trị Hệ Thống (Admin):** Lên danh sách tổng để quản lý các mẫu xe có trên sàn.

---

## 🌐 Chi tiết Endpoint
- **URL Path:** `GET /api/adminbicycles`
- **Giao thức (Method):** `GET`
- **Ủy quyền (Authorization):** Bắt buộc truyền Header `Authorization: Bearer <Token>`. API đã được gỡ bỏ khóa Role, nghĩa là cả Admin hay người dùng bình thường mang cạo nón Seller đều gọi được.
- **Content-Type:** Không yêu cầu Body.

---

## 📦 Định dạng Dữ liệu Trả Về (Response Payload)
Khi FE gọi thành công (Status 200 OK), API sẽ trả về một Mảng Array chứa đối tượng [BicycleDto](file:///d:/GitHub/SecondBike_BE/src/SecondBike.Application/DTOs/Bikes/BicycleDto.cs#7-26) được Query gom nhóm sẵn (Inner Join) rất sạch sẽ từ Database. Tức là Frontend không cần gọi thêm API phụ để dịch `BrandId` ra `BrandName` nữa, Backend đã dịch sẵn tiếng Việt cho các bạn (VD: Brand Name = Giant).

**Cấu trúc JSON Schema Response (Mẫu):**

```json
[
  {
    "bikeId": 1,
    "brandId": 5,
    "brandName": "Giant",        // 👈 Tên hãng xe (Render lên View)
    "typeId": 3,
    "typeName": "Mountain Bike", // 👈 Loại xe (Render lên View)
    "modelName": "test20/3",
    "serialNumber": "10",
    "color": "black",
    
    // --- Các thông số siêu chi tiết đi kèm (BicycleDetail) ---
    "frameSize": "XS",
    "frameMaterial": "Steel",
    "wheelSize": "26",
    "brakeType": "Rim",
    "weight": 10.5,
    "transmission": "nice"
  },
  {
    "bikeId": 2,
    "brandId": 2,
    "brandName": "Trek",
    "typeId": 1,
    "typeName": "Road Bike",
    "modelName": "Domane SL 5",
    "serialNumber": "TRK-5511",
    "color": "Navy Blue",
    
    "frameSize": "M",
    "frameMaterial": "Carbon",
    "wheelSize": "700c",
    "brakeType": "Hydraulic Disc",
    "weight": 8.5,
    "transmission": "Shimano 105"
  }
]
```

---

## 🛠 Cách Ứng Dụng (Gợi Ý Cho Đội FE)
👉 **Bước 1 (Lúc Render View):** Giao diện Trang Đăng Bài gọi API `GET /api/adminbicycles`.
👉 **Bước 2 (Fill Dropdown):** Dùng biến các biến vừa nhận được cắm vào UI component Dropdown (VD như thẻ Select2 của React/Vue) - Khuyến khích Format tên thành dạng Chuỗi: `[BrandName] - [ModelName] ([Color] - Khung [FrameSize])`. 
-  *Ví dụ:* `Trek - Domane SL 5 (Navy Blue - Khung M)`
👉 **Bước 3 (Thu thập dữ liệu Submit):** Gán cái Value ngầm của Dropdown Option là cái trường `"bikeId"`.
👉 **Bước 4 (Tiến hành Gửi):** Khi bấm nút Lưu Bài, hốt cái thẻ Value `bikeId` đó (Ví dụ số `2`) rồi nhét dính vào payload [CreateBikePostDto](file:///d:/GitHub/SecondBike_BE/src/SecondBike.Application/DTOs/Bikes/CreateBikePostDto.cs#11-30) gọi POST `/api/bikes` là hoàn mỹ!
