# Frontend React Shop (Vite + Tailwind)

Frontend เรียบง่ายสำหรับแสดงและแก้ไขข้อมูลสินค้า (ID, ชื่อ, ราคา, หมายเหตุ, รูปภาพ)  
เชื่อมต่อกับ Backend (Nest.js) ผ่าน REST API มาตรฐาน

## ฟีเจอร์
- หน้าแสดงรายการสินค้า (รูป, ID, ชื่อ, ราคา, หมายเหตุ)
- ปุ่มแก้ไข/ลบในแต่ละสินค้า
- หน้าเพิ่มสินค้าใหม่ และหน้าแก้ไขสินค้า (รวมเป็น component เดียว)
- ปรับ ENV ได้จาก `.env` (ตัวอย่างดู `.env.example`)
- Tailwind UI เรียบง่าย พร้อม utility classes

## โครงสร้างไฟล์
```
frontend-react-shop/
  src/
    api.ts
    types.ts
    App.tsx
    main.tsx
    index.css
    components/
      Navbar.tsx
    pages/
      ProductList.tsx
      ProductEdit.tsx
      NotFound.tsx
  index.html
  package.json
  tailwind.config.js
  postcss.config.js
  vite.config.ts
  tsconfig.json
  .env.example
```

## Endpoint ที่คาดหวัง (ตัวอย่าง Nest.js)
- `GET    /products`            -> คืน `{ _id, name, price, remark, imageUrl }[]`
- `GET    /products/:id`        -> คืน `{ _id, name, price, remark, imageUrl }`
- `POST   /products`            -> รับ JSON ตามด้านบน, คืน object ที่สร้าง
- `PUT    /products/:id`        -> รับ JSON, คืน object หลังอัปเดต
- `DELETE /products/:id`        -> คืน `{ deleted: true }` (หรือสถานะ 204)

> หาก field id ใน backend ไม่ใช่ `_id` ให้แก้ใน `types.ts` และการอ่านค่า id ในหน้า list

## วิธีเริ่มต้น
```bash
# 1) แตก zip และเข้าโฟลเดอร์
npm install
cp .env.example .env   # แล้วแก้ค่า VITE_API_BASE_URL ให้ตรงกับ backend
npm run dev
```

เปิดเบราว์เซอร์ที่ http://localhost:5173

## หมายเหตุ
- ตอนนี้ฟอร์มใช้ช่องกรอก `imageUrl` เป็นลิงก์รูปภาพ (ไม่ใช่ upload)
- ถ้าต้องการอัปโหลดรูปจริง ให้เพิ่ม endpoint สำหรับ `multipart/form-data` ใน backend แล้วเพิ่ม input type="file" + FormData ในฟอร์ม


## โหมดทดสอบ (Mock) + รูปภาพ 20 ชิ้น
- ผมแนบไฟล์รูปจาก `Image.zip` ไว้แล้วใน `public/images` และสร้าง `public/products.seed.json` (20 รายการ)
- ถ้าเชื่อมต่อ Backend ไม่ได้ ระบบจะ **fallback อัตโนมัติ** ไปใช้ localStorage และข้อมูลจากไฟล์ seed
- CRUD ทั้งหมด (เพิ่ม/แก้ไข/ลบ) ทำงานบน localStorage ได้ทันที

> ต้องการผูกกับ Backend จริงเมื่อไหร่ ให้เซ็ต `VITE_API_BASE_URL` แล้วระบบจะใช้ Backend ก่อนเสมอ ถ้าเรียกไม่สำเร็จจึงค่อย fallback
