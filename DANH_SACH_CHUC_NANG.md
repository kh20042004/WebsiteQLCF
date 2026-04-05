# 📋 DANH SÁCH CHỨC NĂNG - QUẢN LÝ QUÁN CÀ PHÊ

**Thời gian báo cáo:** 7/4/2024  
**Yêu cầu:** 8 Models + CRUD + Authentication + Authorization + Upload

---

## 📊 TỔNG QUAN HỆ THỐNG

### ✅ **8 MODELS (MongoDB Collections)**

1. **User** - Quản lý người dùng (Staff/Admin)
2. **Category** - Danh mục món ăn
3. **Item** - Món ăn/đồ uống
4. **Table** - Quản lý bàn
5. **Order** - Đơn hàng
6. **Image** - Upload ảnh
7. **Notification** - Thông báo
8. **Payment** - Thanh toán

### ✅ **CÔNG NGHỆ SỬ DỤNG**

- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (JSON Web Token)
- **Authorization:** Role-based (Admin/Staff)
- **Upload:** Cloudinary
- **Frontend:** React.js + Tailwind CSS

---

## 🔐 MODULE 1: AUTHENTICATION (Xác thực)

### **Model:** User

| STT | Chức năng | Method | Endpoint | Quyền | Mô tả |
|-----|-----------|--------|----------|-------|-------|
| 1.1 | Đăng ký tài khoản | POST | `/api/auth/register` | Public | Tạo tài khoản mới (Staff) |
| 1.2 | Đăng nhập | POST | `/api/auth/login` | Public | Đăng nhập lấy JWT token |
| 1.3 | Lấy thông tin user | GET | `/api/auth/me` | Staff+ | Xem thông tin user hiện tại |

**📸 Cần chụp ảnh Postman:**
- ✅ Đăng ký thành công → Response có user + token
- ✅ Đăng nhập thành công → Response có token
- ✅ Đăng nhập sai mật khẩu → Lỗi 401
- ✅ Lấy thông tin user (có token) → Response user data

---

## 👥 MODULE 2: QUẢN LÝ NGƯỜI DÙNG

### **Model:** User

| STT | Chức năng | Method | Endpoint | Quyền | Mô tả |
|-----|-----------|--------|----------|-------|-------|
| 2.1 | Xem danh sách user | GET | `/api/auth/users` | Admin | Xem tất cả user |
| 2.2 | Xem chi tiết 1 user | GET | `/api/auth/users/:id` | Admin | Xem thông tin user |
| 2.3 | Cập nhật user | PUT | `/api/auth/users/:id` | Admin | Sửa thông tin user |
| 2.4 | Xóa user | DELETE | `/api/auth/users/:id` | Admin | Xóa user |

**📸 Cần chụp ảnh Postman:**
- ✅ Admin xem danh sách user → List users
- ✅ Admin xem chi tiết user → User detail
- ✅ Admin cập nhật user → Update success
- ✅ Staff không có quyền xem user → Lỗi 403

---

## 📂 MODULE 3: DANH MỤC MÓN ĂN

### **Model:** Category

| STT | Chức năng | Method | Endpoint | Quyền | Mô tả |
|-----|-----------|--------|----------|-------|-------|
| 3.1 | Xem danh sách danh mục | GET | `/api/categories` | Staff+ | Xem tất cả category |
| 3.2 | Xem chi tiết danh mục | GET | `/api/categories/:id` | Staff+ | Xem 1 category |
| 3.3 | Tạo danh mục mới | POST | `/api/categories` | Admin | Tạo category mới |
| 3.4 | Cập nhật danh mục | PUT | `/api/categories/:id` | Admin | Sửa category |
| 3.5 | Xóa danh mục | DELETE | `/api/categories/:id` | Admin | Xóa category |

**📸 Cần chụp ảnh Postman:**
- ✅ Xem danh sách danh mục → List categories
- ✅ Admin tạo danh mục → Create success
- ✅ Admin cập nhật danh mục → Update success
- ✅ Admin xóa danh mục → Delete success

---

## ☕ MODULE 4: MÓN ĂN/ĐỒ UỐNG

### **Model:** Item

| STT | Chức năng | Method | Endpoint | Quyền | Mô tả |
|-----|-----------|--------|----------|-------|-------|
| 4.1 | Xem danh sách món | GET | `/api/items` | Staff+ | Xem tất cả món (có filter) |
| 4.2 | Xem chi tiết món | GET | `/api/items/:id` | Staff+ | Xem 1 món |
| 4.3 | Tạo món mới | POST | `/api/items` | Admin | Tạo món + upload ảnh |
| 4.4 | Cập nhật món | PUT | `/api/items/:id` | Admin | Sửa món + upload ảnh mới |
| 4.5 | Xóa món | DELETE | `/api/items/:id` | Admin | Xóa món |

**📸 Cần chụp ảnh Postman:**
- ✅ Xem danh sách món → List items
- ✅ Lọc món theo danh mục → Filtered items
- ✅ Admin tạo món + upload ảnh → Create success với imageUrl
- ✅ Admin cập nhật món + ảnh mới → Update success
- ✅ Xóa món → Delete success

---

## 🪑 MODULE 5: QUẢN LÝ BÀN

### **Model:** Table

| STT | Chức năng | Method | Endpoint | Quyền | Mô tả |
|-----|-----------|--------|----------|-------|-------|
| 5.1 | Xem danh sách bàn | GET | `/api/tables` | Staff+ | Xem tất cả bàn |
| 5.2 | Xem chi tiết bàn | GET | `/api/tables/:id` | Staff+ | Xem thông tin bàn |
| 5.3 | Tạo bàn mới | POST | `/api/tables` | Admin | Tạo bàn mới |
| 5.4 | Cập nhật bàn | PUT | `/api/tables/:id` | Admin | Sửa thông tin bàn |
| 5.5 | Xóa bàn | DELETE | `/api/tables/:id` | Admin | Xóa bàn |
| 5.6 | Cập nhật trạng thái bàn | PATCH | `/api/tables/:id/status` | Staff+ | Đổi trạng thái (available/occupied) |

**📸 Cần chụp ảnh Postman:**
- ✅ Xem danh sách bàn → List tables
- ✅ Admin tạo bàn mới → Create success
- ✅ Staff đổi trạng thái bàn → Status updated
- ✅ Xóa bàn → Delete success

---

## 🛒 MODULE 6: QUẢN LÝ ĐƠN HÀNG

### **Model:** Order

| STT | Chức năng | Method | Endpoint | Quyền | Mô tả |
|-----|-----------|--------|----------|-------|-------|
| 6.1 | Xem danh sách đơn hàng | GET | `/api/orders` | Staff+ | Xem tất cả đơn |
| 6.2 | Xem chi tiết đơn | GET | `/api/orders/:id` | Staff+ | Xem 1 đơn |
| 6.3 | Tạo đơn hàng mới | POST | `/api/orders` | Staff+ | Tạo đơn cho bàn |
| 6.4 | Thêm món vào đơn | POST | `/api/orders/:id/items` | Staff+ | Thêm món |
| 6.5 | Xóa món khỏi đơn | DELETE | `/api/orders/:id/items/:itemId` | Staff+ | Xóa món |
| 6.6 | Cập nhật trạng thái đơn | PATCH | `/api/orders/:id/status` | Staff+ | Đổi status |
| 6.7 | Thanh toán đơn hàng | POST | `/api/orders/:id/checkout` | Staff+ | Checkout |
| 6.8 | Xóa đơn hàng | DELETE | `/api/orders/:id` | Admin | Xóa toàn bộ đơn |

**📸 Cần chụp ảnh Postman:**
- ✅ Xem danh sách đơn hàng → List orders
- ✅ Tạo đơn hàng mới → Create success
- ✅ Thêm món vào đơn → Add item success
- ✅ Xóa món khỏi đơn → Remove item success
- ✅ Cập nhật trạng thái → Status updated
- ✅ Thanh toán đơn → Checkout success

---

## 📤 MODULE 7: UPLOAD ẢNH

### **Model:** Image (Cloudinary)

| STT | Chức năng | Method | Endpoint | Quyền | Mô tả |
|-----|-----------|--------|----------|-------|-------|
| 7.1 | Upload 1 ảnh | POST | `/api/upload/single` | Staff+ | Upload 1 file |
| 7.2 | Upload nhiều ảnh | POST | `/api/upload/multiple` | Staff+ | Upload nhiều file |
| 7.3 | Xóa ảnh | DELETE | `/api/upload/:publicId` | Admin | Xóa ảnh trên Cloudinary |

**📸 Cần chụp ảnh Postman:**
- ✅ Upload 1 ảnh → Response có imageUrl từ Cloudinary
- ✅ Upload nhiều ảnh → Response có array imageUrls
- ✅ Upload file không phải ảnh → Lỗi validation
- ✅ Xóa ảnh thành công → Delete success

---

## 🔔 MODULE 8: HỆ THỐNG THÔNG BÁO

### **Model:** Notification

| STT | Chức năng | Method | Endpoint | Quyền | Mô tả |
|-----|-----------|--------|----------|-------|-------|
| 8.1 | Xem thông báo của user | GET | `/api/notifications` | Staff+ | Lấy thông báo (phân trang) |
| 8.2 | Đếm thông báo chưa đọc | GET | `/api/notifications/count` | Staff+ | Lấy số lượng chưa đọc |
| 8.3 | Xem chi tiết thông báo | GET | `/api/notifications/:id` | Staff+ | Xem 1 thông báo |
| 8.4 | Đánh dấu đã đọc | PUT | `/api/notifications/:id/read` | Staff+ | Mark as read |
| 8.5 | Đánh dấu tất cả đã đọc | PUT | `/api/notifications/read-all` | Staff+ | Mark all read |
| 8.6 | Xóa thông báo | DELETE | `/api/notifications/:id` | Staff+ | Xóa 1 thông báo |
| 8.7 | Tạo thông báo | POST | `/api/notifications` | Admin | Tạo thông báo mới |
| 8.8 | Broadcast thông báo | POST | `/api/notifications/broadcast` | Admin | Gửi cho tất cả user |

**📸 Cần chụp ảnh Postman:**
- ✅ Xem danh sách thông báo → List notifications
- ✅ Đếm thông báo chưa đọc → Count response
- ✅ Đánh dấu đã đọc → Read success
- ✅ Admin tạo thông báo → Create success
- ✅ Admin broadcast → Broadcast success

---

## 💰 MODULE 9: THANH TOÁN

### **Model:** Payment

| STT | Chức năng | Method | Endpoint | Quyền | Mô tả |
|-----|-----------|--------|----------|-------|-------|
| 9.1 | Tạo giao dịch thanh toán | POST | `/api/payments` | Staff+ | Tạo payment |
| 9.2 | Xem danh sách thanh toán | GET | `/api/payments` | Staff+ | List payments (filter) |
| 9.3 | Xem chi tiết thanh toán | GET | `/api/payments/:id` | Staff+ | Payment detail |
| 9.4 | Cập nhật trạng thái | PUT | `/api/payments/:id/status` | Admin | Confirm payment |
| 9.5 | Báo cáo doanh thu | GET | `/api/payments/report/by-method` | Admin | Revenue report |
| 9.6 | Xóa thanh toán | DELETE | `/api/payments/:id` | Admin | Delete payment |

**📸 Cần chụp ảnh Postman:**
- ✅ Tạo thanh toán tiền mặt → Create success
- ✅ Tạo thanh toán chuyển khoản → Create pending
- ✅ Admin xác nhận chuyển khoản → Status updated
- ✅ Báo cáo doanh thu theo phương thức → Revenue report
- ✅ Lọc thanh toán theo ngày → Filtered list

---

## 📊 MODULE 10: BÁO CÁO

### **Model:** Nhiều models (aggregate)

| STT | Chức năng | Method | Endpoint | Quyền | Mô tả |
|-----|-----------|--------|----------|-------|-------|
| 10.1 | Doanh thu theo ngày | GET | `/api/reports/revenue/daily` | Admin | Daily revenue |
| 10.2 | Doanh thu theo tháng | GET | `/api/reports/revenue/monthly` | Admin | Monthly revenue |
| 10.3 | Món bán chạy | GET | `/api/reports/top-items` | Admin | Best selling items |
| 10.4 | Thống kê tổng quan | GET | `/api/reports/overview` | Admin | Dashboard stats |

**📸 Cần chụp ảnh Postman:**
- ✅ Báo cáo doanh thu theo ngày → Daily report
- ✅ Báo cáo doanh thu theo tháng → Monthly report
- ✅ Top món bán chạy → Top items list
- ✅ Thống kê tổng quan → Overview stats

---

## ✅ CHECKLIST CHỤP ẢNH POSTMAN

### 📸 **BẮT BUỘC PHẢI CÓ (Core Features):**

#### **1. Authentication & Authorization (5 ảnh)**
- [ ] Đăng ký thành công
- [ ] Đăng nhập thành công
- [ ] Đăng nhập sai → Lỗi 401
- [ ] Staff không có quyền Admin → Lỗi 403
- [ ] Không có token → Lỗi 401

#### **2. CRUD Category (4 ảnh)**
- [ ] GET - Xem danh sách
- [ ] POST - Tạo mới (Admin)
- [ ] PUT - Cập nhật (Admin)
- [ ] DELETE - Xóa (Admin)

#### **3. CRUD Item + Upload (5 ảnh)**
- [ ] GET - Xem danh sách món
- [ ] POST - Tạo món + upload ảnh
- [ ] PUT - Cập nhật món + ảnh mới
- [ ] DELETE - Xóa món
- [ ] GET - Lọc món theo category

#### **4. CRUD Table (4 ảnh)**
- [ ] GET - Xem danh sách bàn
- [ ] POST - Tạo bàn mới
- [ ] PATCH - Cập nhật trạng thái bàn
- [ ] DELETE - Xóa bàn

#### **5. CRUD Order (6 ảnh)**
- [ ] GET - Xem danh sách đơn
- [ ] POST - Tạo đơn hàng mới
- [ ] POST - Thêm món vào đơn
- [ ] DELETE - Xóa món khỏi đơn
- [ ] PATCH - Cập nhật trạng thái
- [ ] POST - Checkout/Thanh toán

#### **6. Upload Cloudinary (3 ảnh)**
- [ ] Upload 1 ảnh thành công
- [ ] Upload nhiều ảnh
- [ ] Xóa ảnh từ Cloudinary

#### **7. Notification System (4 ảnh)**
- [ ] Xem danh sách thông báo
- [ ] Đếm thông báo chưa đọc
- [ ] Đánh dấu đã đọc
- [ ] Admin tạo thông báo

#### **8. Payment System (5 ảnh)**
- [ ] Tạo thanh toán tiền mặt
- [ ] Tạo thanh toán chuyển khoản
- [ ] Admin xác nhận chuyển khoản
- [ ] Báo cáo doanh thu theo phương thức
- [ ] Lọc thanh toán theo ngày

#### **9. Reports (3 ảnh)**
- [ ] Báo cáo doanh thu theo ngày
- [ ] Top món bán chạy
- [ ] Thống kê tổng quan

---

## 📝 GỢI Ý CÁCH CHỤP ẢNH POSTMAN

### **1. Setup Collection:**
```
Coffee Shop Management
├── 01. Authentication
│   ├── Register
│   ├── Login
│   └── Get Me
├── 02. Users (Admin)
├── 03. Categories
├── 04. Items
├── 05. Tables
├── 06. Orders
├── 07. Upload
├── 08. Notifications
├── 09. Payments
└── 10. Reports
```

### **2. Mỗi ảnh nên có:**
- ✅ Request URL rõ ràng
- ✅ Method (GET/POST/PUT/DELETE)
- ✅ Headers (Authorization: Bearer token)
- ✅ Body (nếu có)
- ✅ Response đầy đủ
- ✅ Status code (200/201/400/403/404/500)

### **3. Đặt tên file ảnh:**
```
01_auth_register_success.png
02_auth_login_success.png
03_auth_login_fail_401.png
04_category_list.png
05_category_create_admin.png
...
```

---

## 🎯 TỔNG KẾT

**Tổng số chức năng:** ~50 endpoints  
**Tổng số ảnh tối thiểu:** 40 ảnh  
**Thời gian ước tính:** 2-3 giờ để chụp và sắp xếp

**✨ HỆ THỐNG ĐÃ HOÀN THIỆN ĐẦY ĐỦ!**
