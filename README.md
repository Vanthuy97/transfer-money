# Ứng dụng Quản Lý Đổi Tiền

Ứng dụng React.js với TypeScript quản lý giao dịch đổi tiền với đăng nhập và dashboard.

## Tính năng

- Đăng nhập với 2 tài khoản:
  - `huynhthithiet` / `huynhthithiet2025`
  - `huynhvanthuy` / `huynhvanthuy2025`
- Dashboard quản lý giao dịch đổi tiền
- Đọc dữ liệu từ file JSON
- Thêm giao dịch mới
- Hiển thị danh sách giao dịch

## Cài đặt

```bash
npm install
```

## Chạy ứng dụng

```bash
npm start
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## Cấu trúc dự án

```
transfer-money/
├── public/
│   ├── data/
│   │   └── exchange-data.json    # Dữ liệu giao dịch
│   └── index.html
├── src/
│   ├── components/               # Components
│   │   ├── CurrencyTable.tsx
│   │   ├── CurrencyTable.css
│   │   ├── ExchangeForm.tsx
│   │   └── ExchangeForm.css
│   ├── pages/                    # Pages
│   │   ├── Login.tsx
│   │   ├── Login.css
│   │   ├── Dashboard.tsx
│   │   └── Dashboard.css
│   ├── context/                  # Context API
│   │   └── AuthContext.tsx
│   ├── types/                    # TypeScript types
│   │   └── index.ts
│   ├── App.tsx
│   ├── App.css
│   ├── index.tsx
│   └── index.css
├── tsconfig.json                 # TypeScript configuration
├── package.json
└── README.md
```

## Tài khoản đăng nhập

- Tên đăng nhập: `huynhthithiet`, Mật khẩu: `huynhthithiet2025`
- Tên đăng nhập: `huynhvanthuy`, Mật khẩu: `huynhvanthuy2025`

