# 📘 HƯỚNG DẪN TEST API AUTHENTICATION BẰNG POSTMAN

## 🎯 Mục tiêu
Hướng dẫn chi tiết cách test tất cả các API endpoint của module Authentication trên Postman.

---

## 📋 CHUẨN BỊ

### 1️⃣ Cài đặt Postman
- Tải từ: https://www.postman.com/downloads/
- Hoặc dùng web version: https://web.postman.co/

### 2️⃣ Khởi động Backend
```bash
cd backend
npm install
npm start
```

Backend sẽ chạy ở: `http://localhost:3000`

### 3️⃣ Tạo Postman Collection
- Mở Postman
- Click **"Collections"** → **"Create new collection"**
- Đặt tên: "Coffee Shop - Auth API"
- Tạo folder con: "Authentication"

---

## 🚀 HƯỚNG DẪN TEST TỪNG API

### ✅ API 1: ĐĂNG KÝ TÀI KHOẢN (REGISTER)

#### Thông tin básic
```
Method: POST
URL: http://localhost:3000/auth/register
Content-Type: application/json
```

#### Bước 1: Cấu hình Request

1. Mở Postman, tạo request mới
2. Chọn method: **POST**
3. Nhập URL: `http://localhost:3000/auth/register`

#### Bước 2: Cấu hình Body

```json
{
  "name": "Nguyen Van A",
  "email": "user1@example.com",
  "password": "password123",
  "passwordConfirm": "password123"
}
```

**Cách thêm body:**
- Click tab **"Body"**
- Chọn **"raw"**
- Chọn **"JSON"** ở dropdown bên phải
- Paste JSON phía trên

#### Bước 3: Gửi Request

- Click **"Send"** button
- Chờ response

#### ✔️ Response Kỳ vọng (201 Created)

```json
{
  "status": "success",
  "message": "Đăng ký thành công",
  "data": {
    "id": "65a1234567890abcdef12345",
    "name": "Nguyen Van A",
    "email": "user1@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### ❌ Test Case Lỗi

**Test 1: Thiếu field**
```json
{
  "name": "Test",
  "email": "test@example.com"
  // Thiếu password
}
```
**Response:** ❌ 400 Bad Request
```json
{
  "status": "fail",
  "message": "Vui lòng điền đầy đủ thông tin"
}
```

**Test 2: Mật khẩu không khớp**
```json
{
  "name": "Test",
  "email": "test2@example.com",
  "password": "password123",
  "passwordConfirm": "password456"
}
```
**Response:** ❌ 400 Bad Request
```json
{
  "status": "fail",
  "message": "Mật khẩu không khớp"
}
```

**Test 3: Email đã tồn tại**
```json
{
  "name": "Another Name",
  "email": "user1@example.com",  // Đã đăng ký ở test trên
  "password": "password123",
  "passwordConfirm": "password123"
}
```
**Response:** ❌ 400 Bad Request
```json
{
  "status": "fail",
  "message": "Email đã được đăng ký"
}
```

---

### ✅ API 2: ĐĂNG NHẬP (LOGIN)

#### Thông tin básic
```
Method: POST
URL: http://localhost:3000/auth/login
Content-Type: application/json
```

#### Request Body

```json
{
  "email": "user1@example.com",
  "password": "password123"
}
```

#### ✔️ Response Kỳ vọng (200 OK)

```json
{
  "status": "success",
  "message": "Đăng nhập thành công",
  "data": {
    "id": "65a1234567890abcdef12345",
    "name": "Nguyen Van A",
    "email": "user1@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 💾 Lưu Token để Test Protected Routes

**Cách 1: Sử dụng Environment Variable**

1. Click **"Environments"** → **"Create"**
2. Đặt tên: "Auth Test"
3. Thêm variable:
   - **Variable name:** `token`
   - **Initial value:** (để trống)
   - **Current value:** (để trống)
4. Click **"Save"**

**Cách 2: Tự động Lưu Token từ Response**

1. Click tab **"Tests"** trong request
2. Thêm script:

```javascript
// Lưu token từ response vào environment variable
if (pm.response.code === 200) {
  const response = pm.response.json();
  pm.environment.set("token", response.data.token);
  pm.environment.set("userId", response.data.id);
  console.log("✅ Token lưu thành công");
}
```

3. Click **"Send"** → Token sẽ tự động lưu

#### ❌ Test Case Lỗi

**Test 1: Email không tồn tại**
```json
{
  "email": "notexist@example.com",
  "password": "password123"
}
```
**Response:** ❌ 401 Unauthorized

**Test 2: Password sai**
```json
{
  "email": "user1@example.com",
  "password": "wrongpassword"
}
```
**Response:** ❌ 401 Unauthorized

---

### ✅ API 3: LẤY THÔNG TIN NGƯỜI DÙNG (PROFILE) - PROTECTED

#### Thông tin básic
```
Method: GET
URL: http://localhost:3000/auth/profile
Header: Authorization: Bearer <token>
```

#### Bước 1: Cấu hình Header

1. Click tab **"Headers"**
2. Thêm một row mới:
   - **Key:** `Authorization`
   - **Value:** `Bearer {{token}}`
   
   (Nếu đã lưu token vào environment, dùng `{{token}}`)

#### Bước 2: Gửi Request

- Click **"Send"**

#### ✔️ Response Kỳ vọng (200 OK)

```json
{
  "status": "success",
  "data": {
    "id": "65a1234567890abcdef12345",
    "name": "Nguyen Van A",
    "email": "user1@example.com"
  }
}
```

#### ❌ Test Case Lỗi

**Test 1: Không có token**
- Xóa Authorization header
- Click **"Send"**
- **Response:** ❌ 401 Unauthorized
```json
{
  "status": "fail",
  "message": "Vui lòng cung cấp token"
}
```

**Test 2: Token sai**
```
Authorization: Bearer invalid_token_here
```
**Response:** ❌ 401 Unauthorized
```json
{
  "status": "fail",
  "message": "Token không hợp lệ hoặc đã hết hạn"
}
```

**Test 3: Token hết hạn**
- Chờ token hết (hoặc thay TOKEN_EXPIRES_IN = "1s" test)
- Click **"Send"**
- **Response:** ❌ 401 Unauthorized

---

### ✅ API 4: REFRESH TOKEN

#### Thông tin básic
```
Method: POST
URL: http://localhost:3000/auth/refresh
Content-Type: application/json
```

#### Request Body

```json
{
  "refreshToken": "{{token}}"
}
```

#### ✔️ Response Kỳ vọng (200 OK)

```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### ✅ API 5: ĐĂNG XUẤT (LOGOUT)

#### Thông tin básic
```
Method: POST
URL: http://localhost:3000/auth/logout
Header: Authorization: Bearer <token>
```

#### Bước 1: Cấu hình Header
- Key: `Authorization`
- Value: `Bearer {{token}}`

#### Bước 2: Gửi Request
- Click **"Send"**

#### ✔️ Response Kỳ vọng (200 OK)

```json
{
  "status": "success",
  "message": "Đăng xuất thành công"
}
```

#### 📝 Ghi chú
- Backend không "revoke" token (để đơn giản)
- Frontend sẽ xóa token khỏi localStorage
- Nếu muốn implement blacklist token, thêm ở lần sau

---

## 📊 BẢNG TÓM TẮT API

| # | Method | URL | Body | Auth | Status | Ghi chú |
|---|--------|-----|------|------|--------|---------|
| 1 | POST | /auth/register | name, email, password, passwordConfirm | ❌ | 201 | Tạo tài khoản |
| 2 | POST | /auth/login | email, password | ❌ | 200 | Đăng nhập, lấy token |
| 3 | GET | /auth/profile | - | ✅ | 200 | Lấy info cá nhân |
| 4 | POST | /auth/refresh | refreshToken | ❌ | 200 | Cấp token mới |
| 5 | POST | /auth/logout | - | ✅ | 200 | Đăng xuất |

---

## 🔑 VARIABLE ENVIRONMENT

Tạo file environment trong Postman:
```
token          = {{Token từ login}}
userId         = {{User ID từ login}}
baseUrl        = http://localhost:3000
```

Sử dụng: `{{baseUrl}}/auth/login` thay cho full URL

---

## 📱 TEST FLOW HOÀN CHỈNH

```
1. REGISTER
   ↓
2. LOGIN (bỏ qua nếu đã Register)
   ↓
3. GET PROFILE (sử dụng token từ LOGIN)
   ↓
4. LOGOUT
   ↓
5. GET PROFILE (lỗi - token không còn valid theo logic app)
```

---

## 🐛 TROUBLESHOOTING

**Q: Lỗi "Cannot GET /"**
- A: Chắc chắn backend đang chạy (`npm start`)

**Q: Lỗi "CORS error"**
- A: Frontend phải có `cors()` middleware. Check `app.js`

**Q: Token không lưu được**
- A: Kiểm tra script ở tab "Tests", hoặc copy token manually

**Q: Lỗi "500 Server Error"**
- A: Check MongoDB connection, xem terminal backend có error không

---

## 💡 TIPS & TRICKS

1. **Tạo Request Quick Copy:**
   - Tạo xong 1 request, click **"..."** → **"Duplicate"**
   - Sửa method/URL cho request khác

2. **Kích hoạt Proxy Preview:**
   - Xem request/response chi tiết: **View** → **Show Postman Console**

3. **Export Collection:**
   - Click collection → **"..."** → **"Export"**
   - Chia sẻ với team qua file JSON

---

## 📚 TÀI LIỆU THÊM

- Postman Docs: https://learning.postman.com
- JWT Decoder: https://jwt.io (decode token để xem payload)
- REST API Design: https://restfulapi.net

---

🎉 **Hoàn tất test API Authentication!**

Tiếp theo:
- Test trên Frontend (React)
- Implement module Categories
- Implement module Products
