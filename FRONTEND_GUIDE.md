/**
 * File: FRONTEND_GUIDE.md - Hướng dẫn chi tiết cho Frontend Team
 * 
 * Đây là guide bổ sung chi tiết cho từng thành viên team
 */

# 📱 Hướng Dẫn Chi Tiết Frontend React

## 🎯 Overview

Frontend được chia thành 6 module chính, mỗi member sẽ phụ trách 1 module:

1. **Auth Module** - Đăng nhập, Đăng ký
2. **Categories Module** - Quản lý danh mục
3. **Items Module** - Quản lý menu
4. **Tables Module** - Quản lý bàn
5. **Orders Module** - Quản lý đơn hàng
6. **Reports Module** - Thống kê doanh thu

## 📂 Cấu trúc thư mục cho mỗi module

```
Ví dụ: Module Categories

frontend/src/
├── pages/
│   ├── Categories/
│   │   ├── CategoryList.jsx      ← Danh sách categories
│   │   ├── CategoryCreate.jsx    ← Tạo category mới
│   │   ├── CategoryEdit.jsx      ← Chỉnh sửa category
│   │   └── CategoryDetail.jsx    ← Chi tiết category
│   └── ...
│
├── components/
│   ├── Categories/
│   │   ├── CategoryTable.jsx     ← Bảng danh sách
│   │   ├── CategoryForm.jsx      ← Form tạo/sửa
│   │   ├── CategoryCard.jsx      ← Card hiển thị
│   │   └── CategorySearch.jsx    ← Component tìm kiếm
│   └── ...
│
├── services/
│   ├── categoryService.js        ← API calls
│   └── ...
│
└── styles/
    ├── CategoryList.css
    ├── CategoryForm.css
    └── ...
```

## 🔧 Cách setup module

### Bước 1: Tạo Service API

```jsx
// src/services/categoryService.js

import { apiGet, apiPost, apiPut, apiDelete } from './api';

/**
 * Lấy danh sách categories
 */
export const getCategoryList = (page = 1, limit = 10) => {
  return apiGet(`/categories?page=${page}&limit=${limit}`);
};

/**
 * Lấy chi tiết category
 */
export const getCategoryDetail = (id) => {
  return apiGet(`/categories/${id}`);
};

/**
 * Tạo category mới
 */
export const createCategory = (data) => {
  return apiPost('/categories', data);
};

/**
 * Cập nhật category
 */
export const updateCategory = (id, data) => {
  return apiPut(`/categories/${id}`, data);
};

/**
 * Xóa category
 */
export const deleteCategory = (id) => {
  return apiDelete(`/categories/${id}`);
};
```

### Bước 2: Tạo Component List

```jsx
// src/pages/Categories/CategoryList.jsx

import React, { useState } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getCategoryList, deleteCategory } from '../../services/categoryService';
import Loading from '../../components/Loading/Loading';
import Alert from '../../components/Alert/Alert';
import CategoryTable from '../../components/Categories/CategoryTable';
import '../../styles/CategoryList.css';

function CategoryList() {
  const [alert, setAlert] = useState(null);
  const { data: categories, loading, refetch } = useFetch(
    () => getCategoryList()
  );

  /**
   * Hàm xóa category
   */
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa?')) return;

    try {
      await deleteCategory(id);
      setAlert({ type: 'success', message: 'Xóa thành công' });
      refetch(); // Refresh danh sách
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="category-list">
      {/* Alert */}
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          autoClose={3000}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Header */}
      <div className="list-header">
        <h1>Quản Lý Danh Mục</h1>
        <a href="/categories/create" className="btn btn-primary">
          + Thêm Danh Mục
        </a>
      </div>

      {/* Table */}
      <CategoryTable
        categories={categories}
        onEdit={(id) => window.location.href = `/categories/${id}/edit`}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default CategoryList;
```

### Bước 3: Tạo Component Form

```jsx
// src/components/Categories/CategoryForm.jsx

import React, { useState } from 'react';
import { createCategory, updateCategory } from '../../services/categoryService';

function CategoryForm({ category = null, onSuccess }) {
  const [formData, setFormData] = useState(
    category || { name: '', description: '' }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Hàm xử lý thay đổi input
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Hàm submit form
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (category?.id) {
        // Update
        await updateCategory(category.id, formData);
      } else {
        // Create
        await createCategory(formData);
      }

      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="category-form">
      {/* Lỗi */}
      {error && <div className="error-message">{error}</div>}

      {/* Name Input */}
      <div className="form-group">
        <label htmlFor="name">Tên Danh Mục *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nhập tên danh mục"
          required
        />
      </div>

      {/* Description Input */}
      <div className="form-group">
        <label htmlFor="description">Mô Tả</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Nhập mô tả"
          rows="4"
        />
      </div>

      {/* Buttons */}
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu'}
        </button>
        <a href="/categories" className="btn btn-secondary">
          Hủy
        </a>
      </div>
    </form>
  );
}

export default CategoryForm;
```

### Bước 4: Setup Routes

```jsx
// src/App.js - Thêm routes vào

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';

// Import Categories pages
import CategoryList from './pages/Categories/CategoryList';
import CategoryCreate from './pages/Categories/CategoryCreate';
import CategoryEdit from './pages/Categories/CategoryEdit';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Categories Routes */}
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/categories/create" element={<CategoryCreate />} />
          <Route path="/categories/:id/edit" element={<CategoryEdit />} />

          {/* Other routes... */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
```

## 📋 Checklist các file cần tạo

### Cho mỗi module, cần tạo:

- [ ] Service file
  - [ ] `src/services/[module]Service.js`

- [ ] Pages
  - [ ] `src/pages/[Module]/[Module]List.jsx`
  - [ ] `src/pages/[Module]/[Module]Create.jsx`
  - [ ] `src/pages/[Module]/[Module]Edit.jsx` (nếu cần)
  - [ ] `src/pages/[Module]/[Module]Detail.jsx` (nếu cần)

- [ ] Components
  - [ ] `src/components/[Module]/[Module]Table.jsx`
  - [ ] `src/components/[Module]/[Module]Form.jsx`
  - [ ] `src/components/[Module]/[Module]Card.jsx` (nếu cần)
  - [ ] `src/components/[Module]/[Module]Search.jsx` (nếu cần)

- [ ] Styles
  - [ ] `src/styles/[Module]List.css`
  - [ ] `src/styles/[Module]Form.css`

## 💡 Best Practices

### 1. Nhất luôn comment code bằng tiếng Việt

```jsx
// ❌ Sai
const handleClick = () => {
  // toggle visibility
  setVisible(!visible);
};

// ✅ Đúng
const handleClick = () => {
  // Ẩn/Hiện phần tử
  setVisible(!visible);
};
```

### 2. Sử dụng lại component dùng chung

```jsx
// ✅ Tốt - Sử dụng Alert component chung
import Alert from '../../components/Alert/Alert';

<Alert type="success" message="Thành công" autoClose={3000} />

// ❌ Tệ - Tạo alert riêng
<div style={{ color: 'green' }}>Thành công</div>
```

### 3. Không hardcode API endpoints

```jsx
// ❌ Tệ
const response = await fetch('http://localhost:3000/categories');

// ✅ Tốt
import { API_ENDPOINTS } from '../../utils/constants';
import { apiGet } from '../../services/api';

const response = await apiGet(API_ENDPOINTS.CATEGORIES.LIST);
```

### 4. Xử lý error một cách tốt

```jsx
// ✅ Tốt
import { getErrorMessage } from '../../utils/helpers';

try {
  await deleteItem(id);
  setAlert({ type: 'success', message: 'Xóa thành công' });
} catch (error) {
  const errorMsg = getErrorMessage(error);
  setAlert({ type: 'error', message: errorMsg });
}
```

### 5. Responsive Design - Mobile First

```css
/* ✅ Tốt - Mobile first */

.item-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .item-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .item-list {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## 🧪 Testing Components

### Cách kiểm tra local

```bash
# 1. Start backend server
cd backend
npm start

# 2. Start frontend dev server (terminal mới)
cd frontend
npm start

# 3. Mở browser: http://localhost:3000
```

## 🚀 Deployment

Khi code xong, build production:

```bash
npm run build
```

Output sẽ trong thư mục `build/` - sẵn sàng để deploy~

## 📞 Liên hệ & Support

Nếu có vấn đề:
1. Check console (F12) xem có error không
2. Check Network tab xem API call có response không
3. Hỏi group hoặc leader

---

**Good luck team! ☕👨‍💻**
