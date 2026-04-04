# 📊 HƯỚNG DẪN TEST BÁO CÁO - POSTMAN

## 🎯 TỔNG QUAN

Hệ thống có **2 API báo cáo chính**:
1. **Doanh thu theo ngày** (Daily Revenue)
2. **Top món bán chạy** (Best Selling Items)

**⚠️ LƯU Ý:** Tất cả API báo cáo **CHỈ ADMIN** mới được truy cập!

---

## 🔐 CHUẨN BỊ

### Bước 1: Đăng nhập Admin để lấy token

```http
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "name": "Admin",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

**→ Copy token để dùng cho các request sau!**

---

## 📊 1. BÁO CÁO DOANH THU THEO NGÀY

### **API Endpoint:**
```
GET {{base_url}}/reports/daily
GET {{base_url}}/reports/daily?date=2026-04-04
```

### **Headers:**
```
Authorization: Bearer {{admin_token}}
```

### **Query Parameters:**
- `date` (optional): Ngày cần xem (YYYY-MM-DD)
  - Nếu không truyền → Lấy ngày hôm nay

---

### **Test Case 1.1: Xem doanh thu ngày hôm nay**

```http
GET {{base_url}}/reports/daily
Authorization: Bearer {{admin_token}}
```

**Expected Response 200:**
```json
{
  "status": true,
  "message": "Lấy báo cáo doanh thu thành công",
  "data": {
    "date": "2024-04-04",
    "totalRevenue": 2500000,
    "totalOrders": 15,
    "completedOrders": 12,
    "cancelledOrders": 1,
    "averageOrderValue": 208333,
    "orders": [
      {
        "_id": "65f123...",
        "table": { "name": "Bàn 5" },
        "totalPrice": 500000,
        "status": "done",
        "createdAt": "2024-04-04T10:30:00.000Z"
      }
    ]
  }
}
```

**📸 Chụp ảnh:**
- ✅ Request URL + Headers
- ✅ Response đầy đủ với dữ liệu báo cáo

---

### **Test Case 1.2: Xem doanh thu ngày cụ thể**

```http
GET {{base_url}}/reports/daily?date=2026-04-01
Authorization: Bearer {{admin_token}}
```

**Expected Response 200:**
```json
{
  "status": true,
  "message": "Lấy báo cáo doanh thu thành công",
  "data": {
    "date": "2024-04-01",
    "totalRevenue": 1800000,
    "totalOrders": 10,
    "completedOrders": 9,
    "cancelledOrders": 1,
    "averageOrderValue": 200000
  }
}
```

**📸 Chụp ảnh:**
- ✅ Request với query parameter `?date=2026-04-01`
- ✅ Response dữ liệu ngày 01/04

---

### **Test Case 1.3: Staff KHÔNG có quyền xem báo cáo → Lỗi 403**

```http
GET {{base_url}}/reports/daily
Authorization: Bearer {{staff_token}}
```

**Expected Response 403:**
```json
{
  "status": false,
  "message": "Chỉ admin mới có quyền truy cập"
}
```

**📸 Chụp ảnh:**
- ✅ Request với Staff token
- ✅ Response lỗi 403 Forbidden

---

## 🏆 2. BÁO CÁO TOP MÓN BÁN CHẠY

### **API Endpoint:**
```
GET {{base_url}}/reports/top-items
GET {{base_url}}/reports/top-items?date=2026-04-04
```

### **Headers:**
```
Authorization: Bearer {{admin_token}}
```

### **Query Parameters:**
- `date` (optional): Ngày cần xem (YYYY-MM-DD)
  - Nếu không truyền → Lấy ngày hôm nay

---

### **Test Case 2.1: Xem top món bán chạy hôm nay**

```http
GET {{base_url}}/reports/top-items
Authorization: Bearer {{admin_token}}
```

**Expected Response 200:**
```json
{
  "status": true,
  "message": "Lấy top món bán chạy thành công",
  "data": {
    "date": "2024-04-04",
    "topItems": [
      {
        "_id": "65f456...",
        "name": "Cà phê sữa",
        "category": "Cà phê",
        "totalQuantity": 45,
        "totalRevenue": 1350000,
        "averagePrice": 30000,
        "orderCount": 25
      },
      {
        "_id": "65f789...",
        "name": "Trà sữa trân châu",
        "category": "Trà sữa",
        "totalQuantity": 30,
        "totalRevenue": 900000,
        "averagePrice": 30000,
        "orderCount": 18
      }
    ]
  }
}
```

**📸 Chụp ảnh:**
- ✅ Request URL
- ✅ Response với top items

---

### **Test Case 2.2: Xem top món theo ngày cụ thể**

```http
GET {{base_url}}/reports/top-items?date=2026-03-15
Authorization: Bearer {{admin_token}}
```

**Expected Response 200:**
```json
{
  "status": true,
  "message": "Lấy top món bán chạy thành công",
  "data": {
    "date": "2024-03-15",
    "topItems": [...]
  }
}
```

**📸 Chụp ảnh:**
- ✅ Request với date parameter
- ✅ Response dữ liệu ngày cụ thể

---

### **Test Case 2.3: Staff KHÔNG có quyền → Lỗi 403**

```http
GET {{base_url}}/reports/top-items
Authorization: Bearer {{staff_token}}
```

**Expected Response 403:**
```json
{
  "status": false,
  "message": "Chỉ admin mới có quyền truy cập"
}
```

**📸 Chụp ảnh:**
- ✅ Staff token bị từ chối
- ✅ Lỗi 403

---

## 💰 3. BÁO CÁO DOANH THU THEO PHƯƠNG THỨC THANH TOÁN

### **API Endpoint:**
```
GET {{base_url}}/payments/report/by-method
GET {{base_url}}/payments/report/by-method?startDate=2026-04-01&endDate=2026-04-30
```

### **Headers:**
```
Authorization: Bearer {{admin_token}}
```

### **Query Parameters:**
- `startDate` (optional): Ngày bắt đầu (YYYY-MM-DD)
- `endDate` (optional): Ngày kết thúc (YYYY-MM-DD)
- Nếu không truyền → Lấy tất cả dữ liệu

---

### **Test Case 3.1: Báo cáo tất cả thời gian**

```http
GET {{base_url}}/payments/report/by-method
Authorization: Bearer {{admin_token}}
```

**Expected Response 200:**
```json
{
  "status": true,
  "message": "Lấy báo cáo doanh thu thành công",
  "data": {
    "byMethod": {
      "cash": {
        "total": 50000000,
        "count": 120,
        "avgAmount": 416667
      },
      "transfer": {
        "total": 30000000,
        "count": 80,
        "avgAmount": 375000
      },
      "card": {
        "total": 15000000,
        "count": 40,
        "avgAmount": 375000
      },
      "ewallet": {
        "total": 5000000,
        "count": 20,
        "avgAmount": 250000
      }
    },
    "summary": {
      "totalRevenue": 100000000,
      "totalTransactions": 260,
      "avgPerTransaction": 384615
    }
  }
}
```

**📸 Chụp ảnh:**
- ✅ Request URL
- ✅ Response với breakdown theo phương thức

---

### **Test Case 3.2: Báo cáo theo khoảng thời gian**

```http
GET {{base_url}}/payments/report/by-method?startDate=2026-04-01&endDate=2026-04-30
Authorization: Bearer {{admin_token}}
```

**Expected Response 200:**
```json
{
  "status": true,
  "message": "Lấy báo cáo doanh thu thành công",
  "data": {
    "byMethod": {
      "cash": { "total": 12000000, "count": 30, "avgAmount": 400000 },
      "transfer": { "total": 8000000, "count": 20, "avgAmount": 400000 }
    },
    "summary": {
      "totalRevenue": 20000000,
      "totalTransactions": 50,
      "avgPerTransaction": 400000
    }
  }
}
```

**📸 Chụp ảnh:**
- ✅ Request với startDate & endDate
- ✅ Response filtered data

---

## ✅ CHECKLIST CHỤP ẢNH

### **Báo cáo cần chụp (Tối thiểu 6 ảnh):**

#### **1. Doanh thu theo ngày (2 ảnh)**
- [ ] Admin xem doanh thu hôm nay
- [ ] Admin xem doanh thu ngày cụ thể

#### **2. Top món bán chạy (2 ảnh)**
- [ ] Admin xem top món hôm nay
- [ ] Admin xem top món ngày cụ thể

#### **3. Doanh thu theo phương thức (2 ảnh)**
- [ ] Báo cáo tất cả thời gian
- [ ] Báo cáo theo khoảng thời gian

#### **4. Phân quyền (1 ảnh)**
- [ ] Staff bị từ chối xem báo cáo (403)

---

## 📝 GỢI Ý ĐẶT TÊN FILE ẢNH

```
25_report_daily_today.png           (Doanh thu hôm nay)
26_report_daily_specific_date.png   (Doanh thu ngày cụ thể)
27_report_top_items_today.png       (Top món hôm nay)
28_report_top_items_date.png        (Top món theo ngày)
29_report_payment_all_time.png      (Doanh thu tất cả)
30_report_payment_date_range.png    (Doanh thu khoảng thời gian)
31_report_staff_forbidden_403.png   (Staff bị chặn)
```

---

## 🎯 TIPS

### **Để có dữ liệu báo cáo:**

1. **Tạo đơn hàng trước:**
   ```http
   POST {{base_url}}/orders
   Body: { "tableId": "...", "note": "Test" }
   ```

2. **Thêm món vào đơn:**
   ```http
   POST {{base_url}}/orders/:orderId/items
   Body: { "itemId": "...", "quantity": 2 }
   ```

3. **Cập nhật trạng thái đơn → done:**
   ```http
   PATCH {{base_url}}/orders/:orderId/status
   Body: { "status": "done" }
   ```

4. **Tạo thanh toán:**
   ```http
   POST {{base_url}}/payments
   Body: { 
     "orderId": "...", 
     "method": "cash",
     "amount": 500000
   }
   ```

5. **Sau đó mới test báo cáo!**

---

## 🚨 LƯU Ý

- ✅ **Phải có dữ liệu:** Tạo ít nhất 3-5 đơn hàng với thanh toán trước
- ✅ **Chỉ Admin:** Staff test sẽ bị lỗi 403
- ✅ **Format date:** Luôn dùng `YYYY-MM-DD` (VD: `2024-04-04`)
- ✅ **Token Admin:** Nhớ dùng admin token, không phải staff token!

---

🎉 **CHÚC BẠN TEST THÀNH CÔNG!**
