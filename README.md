# Project Frontend + Backend 

Website quản lý học tập hỗ trợ giảng viên và sinh viên tích hợp nhắn tin nhóm. Website phát triển với ReactJS (frontend), ExpressJS (backend) và MySQL (database), tích hợp JWT để xác thực và phân quyền (Admin, Giảng viên, Sinh viên). Cung cấp tính năng thi trắc nghiệm, quản lý tài liệu học tập và giao bài tập giữa giảng viên và sinh viên.

## Cấu trúc thư mục

  
/client # Frontend React + Vite  
/server # Backend Express  
package.json # Script tổng chạy FE và BE  
README.md

---

## 1. Cài đặt

Tại thư mục gốc, bạn làm theo các bước sau:

1. Cài đặt các package chung (nếu có):

```bash
npm install
```

2. Cài đặt dependencies cho frontend:

```bash
cd fe
npm install
cd ..
```

3. Cài đặt dependencies cho backend:

```bash
cd be
npm install
cd ..
```

---

## 2. Cách chạy

Bạn có thể chạy FE hoặc BE trực tiếp từ thư mục gốc mà không cần chuyển thư mục.

### 2.1. Chạy frontend trong môi trường phát triển (dev server)

```bash
npm run fe:dev
```
Frontend sẽ chạy trên port do bạn cấu hình trong vite.config.js (mặc định thường là 3000 hoặc 5173).

### 2.2. Build frontend để deploy

```bash
npm run fe:build
```
File build sẽ được tạo ra theo cấu hình trong thư mục fe.

### 2.3. Preview bản build frontend

```bash
npm run fe:preview
```

### 2.4. Chạy backend trong môi trường phát triển

```bash
npm run be:dev
```
Backend sẽ chạy với nodemon theo script trong be/package.json.

### 2.5. Chạy backend trong môi trường production

```bash
npm run be:start
```

### 2.6. Chạy test backend

```bash
npm run be:test
```

---

## 3. Giải thích các script trong root package.json

| Script      | Mục đích                        |
|-------------|---------------------------------|
| fe:dev      | Chạy frontend ở chế độ dev      |
| fe:build    | Build frontend                  |
| fe:preview  | Preview frontend bản build      |
| fe:lint     | Chạy eslint cho frontend        |
| be:dev      | Chạy backend dev (nodemon)      |
| be:start    | Chạy backend production         |
| be:test     | Chạy test backend               |

---

## 4. Cách mở project

Bạn có thể mở 2 terminal:

**Terminal 1 chạy frontend:**
```bash
npm run fe:dev
```

**Terminal 2 chạy backend:**
```bash
npm run be:dev
```

---

## 5. Lưu ý

- Đảm bảo Node.js và npm đã được cài đặt trên máy.
- Nếu dùng yarn thì tương tự thay npm bằng yarn và npm run thành yarn.
- Nếu cần thêm script mới, hãy cập nhật vào fe/package.json, be/package.json và root package.json nếu muốn gọi từ ngoài.

Chúc bạn coding vui vẻ! 🚀
