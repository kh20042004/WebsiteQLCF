# Frontend README

## 📱 Frontend Coffee Shop Management

Frontend React cho hệ thống quản lý quán cà phê

## 🚀 Setup

### 1. Cài đặt dependencies

```bash
cd frontend
npm install
```

### 2. Tạo file .env

```bash
# Copy từ .env.example
cp .env.example .env

# Cập nhật giá trị
REACT_APP_API_BASE_URL=http://localhost:3000
```

### 3. Chạy ứng dụng

```bash
npm start
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## 📁 Cấu trúc thư mục dùng chung

```
frontend/src/
├── components/
│   ├── Layout/
│   │   ├── Header.jsx        ← Thanh tiêu đề chính
│   │   ├── Footer.jsx        ← Chân trang
│   │   ├── Sidebar.jsx       ← Menu bên trái
│   │   └── MainLayout.jsx    ← Layout chính
│   ├── Loading/
│   │   └── Loading.jsx       ← Spinner loading
│   ├── Alert/
│   │   └── Alert.jsx         ← Thông báo
│   └── ... (component khác của từng member)
│
├── pages/
│   ├── NotFound.jsx          ← Trang 404
│   └── ... (page của từng module)
│
├── services/
│   ├── api.js               ← Cấu hình Axios
│   ├── authService.js       ← Auth API calls
│   └── ... (service khác)
│
├── utils/
│   ├── constants.js         ← Hằng số chung
│   └── helpers.js           ← Hàm tiện ích
│
├── hooks/
│   └── useFetch.js          ← Custom hook fetch
│
├── context/
│   └── AuthContext.js       ← Context xác thực
│
├── styles/
│   ├── variables.css        ← CSS variables
│   ├── globals.css          ← Global styles
│   ├── Header.css           ← Header styling
│   ├── Footer.css           ← Footer styling
│   ├── Sidebar.css          ← Sidebar styling
│   ├── MainLayout.css       ← Layout styling
│   ├── Alert.css            ← Alert styling
│   ├── Loading.css          ← Loading styling
│   └── NotFound.css         ← 404 styling
│
├── App.js                   ← Entry point
└── index.js                 ← React root
```

## 🛠️ Công nghệ

- React 18.2.0
- React Router v6
- Axios
- CSS3 (Flexbox, Grid, Variables)

## 📚 Cách sử dụng các component/service chung

### 1. Layout chính

```jsx
// App.js đã setup sẵn MainLayout
// Các page con sẽ được render qua <Outlet />
<Route element={<MainLayout />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>
```

### 2. Gọi API

```jsx
import { apiGet, apiPost } from '../services/api';

// GET request
const response = await apiGet('/categories');

// POST request
const response = await apiPost('/orders', { items: [...] });
```

### 3. Auth Service

```jsx
import { authLogin, authGetProfile } from '../services/authService';

// Login
const result = await authLogin({ email, password });
// result = { token, user }

// Get profile
const user = await authGetProfile();
```

### 4. Constants

```jsx
import { 
  API_ENDPOINTS, 
  TABLE_STATUS, 
  ORDER_STATUS,
  formatCurrency 
} from '../utils/constants';
import { formatCurrency, formatDate } from '../utils/helpers';

// Sử dụng constants
const endpoint = API_ENDPOINTS.ITEMS.LIST;
const status = TABLE_STATUS.AVAILABLE;

// Format data
const price = formatCurrency(150000); // 150.000₫
const date = formatDate(new Date(), 'DD/MM/YYYY'); // 20/03/2026
```

### 5. Auth Context

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  return (
    <>
      {isAuthenticated && <p>Hello {user.name}</p>}
    </>
  );
}

// Wrap App với AuthProvider
<AuthProvider>
  <App />
</AuthProvider>
```

### 6. Custom Hook useFetch

```jsx
import { useFetch } from '../hooks/useFetch';
import { apiGet } from '../services/api';

function ItemsList() {
  const { data, loading, error, refetch } = useFetch(
    () => apiGet('/items')
  );

  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <>
      {data?.map(item => <ItemCard key={item.id} item={item} />)}
      <button onClick={refetch}>Refresh</button>
    </>
  );
}
```

### 7. Helper Functions

```jsx
import { 
  formatCurrency,
  formatDate, 
  validateEmail,
  truncateText,
  getErrorMessage 
} from '../utils/helpers';

// Format tiền
const price = formatCurrency(100000); // 100.000₫

// Format ngày
const date = formatDate(new Date(), 'DD/MM/YYYY HH:mm:ss');

// Validate email
if (validateEmail(email)) { /* ... */ }

// Cắt ngắn text
const shortText = truncateText(longText, 50);

// Lấy error message từ axios error
const msg = getErrorMessage(error);
```

## 📋 Phân công công việc

| # | Thành viên | Chức năng | Folder |
|---|-----------|----------|--------|
| 1 | - | Auth pages (Login, Register) | `/pages/Auth/` |
| 2 | - | Categories CRUD | `/pages/Categories/`, `/components/Categories/` |
| 3 | - | Menu Items | `/pages/Items/`, `/components/Items/` |
| 4 | - | Tables Management | `/pages/Tables/`, `/components/Tables/` |
| 5 | - | Orders | `/pages/Orders/`, `/components/Orders/` |
| 6 | - | Reports | `/pages/Reports/`, `/components/Reports/` |

## 🎨 CSS Styling

Dùng CSS Variables để quản lý màu sắc:

```css
/* Trong variables.css */
--primary-color: #8B4513; /* Nâu cà phê */
--success-color: #10B981;  /* Xanh */
--danger-color: #EF4444;   /* Đỏ */

/* Sử dụng trong component */
background-color: var(--primary-color);
```

Các utility classes sẵn:

```jsx
<div className="text-center text-primary">
  <button className="btn btn-primary">Lưu</button>
  <button className="btn btn-danger">Xóa</button>
</div>
```

## 🔒 Bảo mật

- Token được lưu trong localStorage
- Tự động thêm token vào header Authorization
- Tự động redirect về login nếu token hết hạn (401)

## 📝 Conventions

1. **Component**: PascalCase (.jsx)
   ```jsx
   // MyComponent.jsx
   function MyComponent() { ... }
   ```

2. **Hàm**: camelCase
   ```js
   const handleButtonClick = () => { ... }
   const formatDate = (date) => { ... }
   ```

3. **CSS Class**: kebab-case
   ```css
   .btn-primary { ... }
   .nav-item { ... }
   ```

4. **Constants**: UPPER_SNAKE_CASE
   ```js
   const API_BASE_URL = '...';
   const MAX_ITEMS = 10;
   ```

## 💬 Ghi chú quan trọng

- Luôn comment code bằng tiếng Việt
- Reuse component `Header`, `Footer`, `Sidebar`
- Sử dụng `constants.js` để tập trung API endpoints
- Lưu error handling logic trong `useFetch` hoặc service
- Test responsive design (mobile, tablet, desktop)

---

**Happy Coding! ☕**
