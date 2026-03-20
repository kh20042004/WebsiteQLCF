# ☕ Coffee Shop Management System

Hệ thống quản lý quán cà phê với RESTful API (Node.js + Express) và Frontend (React)

## 📋 Mô tả dự án

Xây dựng hệ thống backend hỗ trợ quản lý hoạt động quán cà phê thông qua RESTful API, bao gồm:
- Quản lý menu (món, danh mục)
- Quản lý bàn
- Quản lý đơn hàng
- Thanh toán
- Thống kê doanh thu
- Xác thực người dùng (JWT)

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js + Express** - REST API
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **Validation** - Express Validator
- **Environment** - dotenv

### Frontend
- **React** - UI Framework
- **Axios** - API Client
- **React Router** - Navigation

## 📁 Cấu trúc thư mục

```
coffee-shop-management/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Database schemas
│   │   ├── middlewares/     # Auth, validation, error handling
│   │   ├── utils/           # Helper functions
│   │   └── config/          # Configuration
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    ├── public/
    ├── package.json
    └── .env.example
```

## 👨‍💻 Phân công công việc

| Thành viên | Chức năng |
|-----------|----------|
| **Member 1** | Auth + Core (Login, Register, JWT, Middleware, Validate) |
| **Member 2** | Menu (Category API, Item API, Search) |
| **Member 3** | Table (CRUD, Status Management) |
| **Member 4** | Order (Create, Add Items, Checkout, Payments) |
| **Member 5** | Reports + Frontend |

## 🚀 Cách chạy

### Backend Setup
```bash
cd backend
npm install
# Tạo file .env với MongoDB Atlas connection string
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 📝 Lịch sử commit

- Mỗi thành viên commit rõ ràng với message có ý nghĩa
- Format: `feat: message` hoặc `fix: message`

## ✅ Chức năng chính

### 1. Authentication
- [x] POST /auth/register
- [x] POST /auth/login
- [x] GET /auth/me

### 2. Categories
- [x] GET /categories
- [x] POST /categories
- [x] PUT /categories/:id
- [x] DELETE /categories/:id

### 3. Menu Items
- [x] GET /items
- [x] GET /items/:id
- [x] POST /items
- [x] PUT /items/:id
- [x] DELETE /items/:id

### 4. Tables
- [x] GET /tables
- [x] POST /tables
- [x] PUT /tables/:id
- [x] DELETE /tables/:id
- [x] PATCH /tables/:id/status

### 5. Orders
- [x] POST /orders
- [x] GET /orders
- [x] GET /orders/:id
- [x] POST /orders/:id/items
- [x] PUT /orders/:id/items/:itemId
- [x] DELETE /orders/:id/items/:itemId
- [x] PATCH /orders/:id/status

### 6. Payments
- [x] POST /orders/:id/checkout

### 7. Reports
- [x] GET /reports/daily?date=YYYY-MM-DD
- [x] GET /reports/top-items?date=YYYY-MM-DD

## 📞 Liên hệ

Tất cả thành viên trong team
