# 🚀 Hướng Dẫn Nâng Cấp API Dành Cho Đội Frontend (FE Integration Guide)
**Nội dung:** Tách luồng Tạo Xe (Bicycle) gốc ra khỏi luồng Đăng Bài Bán Xe (BicycleListing).

---

## 1. Tóm Tắt Thay Đổi (Changelog)
Hành vi truyền thống: Seller đăng bài + tự điền luôn thông số cấu hình xe -> Backend tạo 1 thể (1 Form).
**Vấn đề xảy ra:** Trùng lặp thông số rác, thiết kế DB thiếu chặt chẽ.
**Giải pháp hiện tại:** 
- Rời quyền tạo Xe (Hardware Specs) sang cho **Admin**.
- **Seller** chỉ tạo Bài đăng (Title, Price, Images...) và chọn liên kết với một chiếc Xe lấy từ CSDL thông qua `BikeId`.

---

## 2. Việc Cần Làm Ở Phía Giao Diện Seller (Trang Đăng Bài Bán Xe)

### ❌ LUỒNG CŨ (Đã Bị Hủy Bỏ)
FE gọi API `POST /api/bikes` với payload cực kỳ lớn chứa mớ bòng bong thông số kỹ thuật (ModelName, BrandId, BrakeType, Color,...).

### ✅ LUỒNG MỚI (Yêu cầu FE cập nhật)
**Bước 2.1 - Chỉnh sửa UI (Giao diện):** 
Giao diện Tạo Bài Đăng cần có một bước cho phép người bán **chọn Xe có sẵn** từ hệ thống (Dạng thẻ Select, Dropdown tích hợp Search).
FE gọi API lấy danh sách Bikes (GET) -> Đổ ra Dropdown -> Seller chọn mẫu xe tương ứng -> Lưu lại `BikeId`.

**Bước 2.2 - Payload Mới API Đăng Bán (`POST /api/bikes`):**
Cắt vứt toàn bộ thông số phần cứng của xe (BrandId, WheelSize...). **Chỉ truyền bổ sung đúng 1 field duy nhất là `BikeId` (kiểu Int).**

```json
// Yêu cầu DTO mới (Gửi dạng multipart/form-data do có file Images)

{
  "BikeId": 15,  // <--- THÊM MỚI (Bắt buộc): Lấy từ selected dropdown
  
  "Title": "Cần bán Giant Escape 2 lướt",
  "Description": "Xe còn mới nguyên, xước dăm",
  "Price": 5000000,
  "Quantity": 1,
  "Address": "Quận 1, HCM",
  
  // (Bỏ) "Condition": "New", 
  // (Bỏ) "BrandId": 1, 
  // (Bỏ) "ModelName": "Escape 2",
  // (Bỏ) "FrameMaterial": "Alloy",
  // ...còn lại xóa sạch...
}
```

---

## 3. Việc Cần Thêm Mới Ở Phía Giao Diện Admin (Trang Quản Trị)

**Admin cần có 1 Trang Quản lý Mẫu Xe Đạp (Bicycle Catalog).** Tại form thêm mới xe của Admin, FE chỉ cần submit JSON payload chứa thông số kỹ thuật về endpoint của Admin.

### 🌐 API: `POST /api/adminbicycles`
- **Method:** POST
- **Authorization:** Yêu cầu JWT token chứa Role = [Admin](file:///d:/GitHub/SecondBike_BE/src/SecondBike.Application/Services/BicycleAdminService.cs#19-32)
- **Content-Type:** `application/json`
- **Payload DTO:**

```json
{
  "BrandId": 1,           // Required
  "TypeId": 3,            // Required
  "ModelName": "Giant TCR 2024", // Required
  "SerialNumber": "SN-987123",
  "Color": "Matte Black",
  "FrameSize": "M",
  "FrameMaterial": "Carbon",
  "WheelSize": "700c",
  "BrakeType": "Disc Brake",
  "Weight": 7.5,
  "Transmission": "Shimano 105"
}
```
*API này sẽ tạo cứng một dòng xe mới vào danh mục hệ thống và trả về `BikeId`. Sau đó các Seller (ở Bước 2) hoàn toàn có thể tự bềnh kéo cái xe thông qua list lấy về FE để đăng bán nó.*

---

## 4. Troubleshooting (Lỗi Hay Gặp Nếu FE Quên Sửa)
- **400 Bad Request: "BikeId must be valid"** -> Xảy ra khi Seller gửi thiếu giá trị BikeId về server.
- **400 Bad Request: "Selected Bicycle does not exist in the catalog"** -> FE truyền sai BikeId hoặc chiếc xe này đã bị xóa ở CSDL gốc.
- Nếu gửi dư các field cấu hình cũ (BrandId, FrameSize) thì Backend sẽ bỏ qua (Ignore) sinh ra lượng payload dưa thừa khiến App chạy chậm!
