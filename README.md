# 🖥️ CompuRoom — ระบบบันทึกข้อมูลเครื่องคอมพิวเตอร์ประจำห้อง

**ผู้จัดทำ:** นายวิโรจน์ นามวงษา
**รหัสนักศึกษา:** 68319010030
**รายวิชา:** DevOps 30901-2008 · วิทยาลัยเทคนิคเลย
**โจทย์:** compuroom

![CI](https://github.com/<username>/midterm-devops-compuroom-68319010030/actions/workflows/ci.yml/badge.svg)

ระบบ CRUD สำหรับบันทึกข้อมูลเครื่องคอมพิวเตอร์ในห้องปฏิบัติการของแผนก
สร้างด้วย Express.js + PostgreSQL + Vue 3, containerize ด้วย Docker, และมี CI Pipeline ด้วย GitHub Actions

## Tech Stack
- **Backend:** Node.js + Express.js + PostgreSQL
- **Frontend:** Vue 3 + Vite
- **Container:** Docker + Docker Compose
- **CI/CD:** GitHub Actions

## วิธีรัน (Dev — build เอง)
```bash
git clone https://github.com/<username>/midterm-devops-compuroom-68319010030.git
cd midterm-devops-compuroom-68319010030
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up --build
```
เข้า http://localhost

## วิธีรัน (Prod — pull จาก Docker Hub)
```bash
docker compose -f docker-compose.prod.yml up -d
```
Docker Hub: https://hub.docker.com/r/wirot/compuroom-api · https://hub.docker.com/r/wirot/compuroom-web

## API Endpoints
| Method | Path | คำอธิบาย |
|--------|------|----------|
| GET | /health | Health check |
| GET | /api/computers | ดึงรายการเครื่องคอมทั้งหมด |
| GET | /api/computers/:id | ดึงข้อมูลเครื่องตาม ID |
| POST | /api/computers | เพิ่มเครื่องใหม่ |
| PUT | /api/computers/:id | แก้ไขข้อมูลเครื่อง |
| DELETE | /api/computers/:id | ลบข้อมูลเครื่อง |