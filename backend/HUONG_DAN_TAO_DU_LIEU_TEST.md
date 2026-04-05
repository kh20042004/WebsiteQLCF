# 🧪 HƯỚNG DẪN TẠO DỮ LIỆU TEST - POSTMAN

**Vấn đề:** API báo cáo trả về `"data": []` (rỗng) vì chưa có dữ liệu!

**Giải pháp:** Tạo đơn hàng + thanh toán TRƯỚC KHI test báo cáo!

---

## 📋 QUY TRÌNH TẠO DỮ LIỆU (5 BƯỚC)

### **BƯỚC 1: Đăng nhập lấy token**

```http
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**→ Copy token từ response!**

---

### **BƯỚC 2: Tạo đơn hàng mới**

```http
POST {{base_url}}/orders
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "tableId": "65f1234567890abcdef12345",
  "note": "Test đơn hàng 1"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Tạo đơn hàng thành công",
  "data": {
    "_id": "65f9876543210fedcba09876",
    "table": "65f1234567890abcdef12345",
    "items": [],
    "totalPrice": 0,
    "status": "pending"
  }
}
```

**→ Copy `_id` của đơn hàng!**

---

### **BƯỚC 3: Thêm món vào đơn hàng**

```http
POST {{base_url}}/orders/65f9876543210fedcba09876/items
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "itemId": "65f456789abcdef123456789",
  "quantity": 2
}
```

**Response:**
```json
{
  "status": true,
  "message": "Thêm món vào đơn hàng thành công",
  "data": {
    "_id": "65f9876543210fedcba09876",
    "items": [
      {
        "item": "65f456789abcdef123456789",
        "name": "Cà phê sữa",
        "price": 30000,
        "quantity": 2
      }
    ],
    "totalPrice": 60000
  }
}
```

**Lặp lại bước này 3-5 lần với món khác nhau!**

---

### **BƯỚC 4: Cập nhật trạng thái đơn hàng → done**

```http
PATCH {{base_url}}/orders/65f9876543210fedcba09876/status
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "status": "done"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Cập nhật trạng thái đơn hàng thành công",
  "data": {
    "_id": "65f9876543210fedcba09876",
    "status": "done",
    "totalPrice": 150000
  }
}
```

---

### **BƯỚC 5: Tạo thanh toán**

```http
POST {{base_url}}/payments
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "orderId": "65f9876543210fedcba09876",
  "method": "cash",
  "amount": 150000,
  "receivedAmount": 200000,
  "note": "Thanh toán đơn test 1"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Tạo giao dịch thanh toán thành công",
  "data": {
    "payment": {
      "_id": "65fab...",
      "orderId": "65f987...",
      "method": "cash",
      "amount": 150000,
      "receivedAmount": 200000,
      "changeAmount": 50000,
      "status": "completed"
    },
    "orderStatus": {
      "isPaidFull": true
    }
  }
}
```

---

## 🔄 LẶP LẠI QUY TRÌNH

**Tạo ít nhất 3-5 đơn hàng với:**
- Bàn khác nhau
- Món khác nhau
- Số lượng khác nhau
- Phương thức thanh toán khác nhau (cash/transfer/card)

---

## 📊 SAU ĐÓ TEST BÁO CÁO

### **Test 1: Doanh thu theo ngày**

```http
GET {{base_url}}/reports/daily
Authorization: Bearer {{admin_token}}
```

**Expected Response:**
```json
{
  "status": true,
  "data": {
    "date": "2024-04-04",
    "totalRevenue": 500000,
    "totalOrders": 5,
    "completedOrders": 5,
    "averageOrderValue": 100000
  }
}
```

---

### **Test 2: Top món bán chạy**

```http
GET {{base_url}}/reports/top-items
Authorization: Bearer {{admin_token}}
```

**Expected Response:**
```json
{
  "status": true,
  "data": [
    {
      "_id": "65f456...",
      "name": "Cà phê sữa",
      "category": "Cà phê",
      "totalQuantity": 15,
      "totalRevenue": 450000,
      "averagePrice": 30000,
      "orderCount": 8
    },
    {
      "_id": "65f789...",
      "name": "Trà sữa trân châu",
      "category": "Trà sữa",
      "totalQuantity": 10,
      "totalRevenue": 300000,
      "averagePrice": 30000,
      "orderCount": 5
    }
  ]
}
```

---

### **Test 3: Doanh thu theo phương thức**

```http
GET {{base_url}}/payments/report/by-method
Authorization: Bearer {{admin_token}}
```

**Expected Response:**
```json
{
  "status": true,
  "data": {
    "byMethod": {
      "cash": {
        "total": 300000,
        "count": 3,
        "avgAmount": 100000
      },
      "transfer": {
        "total": 200000,
        "count": 2,
        "avgAmount": 100000
      }
    },
    "summary": {
      "totalRevenue": 500000,
      "totalTransactions": 5
    }
  }
}
```

---

## ⚡ SCRIPT TẠO DỮ LIỆU NHANH (COPY-PASTE)

### **Tạo 5 đơn hàng nhanh:**

```javascript
// 1. Login admin
POST {{base_url}}/auth/login
Body: { "email": "admin@example.com", "password": "admin123" }
→ Copy token

// 2. Lấy danh sách món để biết itemId
GET {{base_url}}/items
→ Copy 3-5 itemId

// 3. Lấy danh sách bàn để biết tableId
GET {{base_url}}/tables
→ Copy 3-5 tableId

// 4. Tạo đơn hàng 1
POST {{base_url}}/orders
Body: { "tableId": "{{tableId_1}}" }
→ Copy orderId_1

POST {{base_url}}/orders/{{orderId_1}}/items
Body: { "itemId": "{{itemId_1}}", "quantity": 2 }

POST {{base_url}}/orders/{{orderId_1}}/items
Body: { "itemId": "{{itemId_2}}", "quantity": 1 }

PATCH {{base_url}}/orders/{{orderId_1}}/status
Body: { "status": "done" }

POST {{base_url}}/payments
Body: { 
  "orderId": "{{orderId_1}}", 
  "method": "cash",
  "amount": 120000
}

// 5. Lặp lại bước 4 cho đơn 2, 3, 4, 5...
```

---

## 🎯 CHECKLIST TẠO DỮ LIỆU

- [ ] Đăng nhập Admin lấy token
- [ ] Lấy danh sách Items (GET /items)
- [ ] Lấy danh sách Tables (GET /tables)
- [ ] Tạo đơn hàng 1 + Thêm món + Done + Payment
- [ ] Tạo đơn hàng 2 + Thêm món + Done + Payment
- [ ] Tạo đơn hàng 3 + Thêm món + Done + Payment
- [ ] Tạo đơn hàng 4 + Thêm món + Done + Payment
- [ ] Tạo đơn hàng 5 + Thêm món + Done + Payment
- [ ] Test lại báo cáo → Có data!

---

## ⚠️ LƯU Ý

1. **Trạng thái đơn hàng:** Phải là `"done"` thì mới tính vào báo cáo
2. **Thanh toán:** Phải tạo payment với `status: "completed"`
3. **Ngày tạo:** Đơn hàng phải cùng ngày với query parameter `?date=`
4. **Món ăn:** Phải có món trong database trước (GET /items để kiểm tra)
5. **Bàn:** Phải có bàn trong database trước (GET /tables để kiểm tra)

---

## 🚨 TROUBLESHOOTING

### **Vấn đề 1: `"data": []` (rỗng)**
→ Chưa có đơn hàng nào hoặc đơn hàng chưa `done`

### **Vấn đề 2: `404 Not Found`**
→ ItemId hoặc TableId không tồn tại

### **Vấn đề 3: `403 Forbidden`**
→ Dùng Staff token thay vì Admin token

### **Vấn đề 4: Báo cáo ngày hôm nay rỗng**
→ Đơn hàng được tạo ngày khác, dùng `?date=YYYY-MM-DD`

---

🎉 **SAU KHI CÓ DỮ LIỆU, BÁO CÁO SẼ HIỂN THỊ ĐẦY ĐỦ!**
