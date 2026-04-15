# Student Management Full Stack App

## Tech Stack
- Frontend: React + Vite + React Bootstrap
- Backend: Node.js + Express
- Database: JSON file (`backend/data/students.json`)

## Features
- Add students (Name, Email, Course, Marks)
- View student list
- Update student details
- Delete student
- Form validation on frontend and backend

## Project Structure
- `frontend/` React app
- `backend/` Express API

## Run the Backend
```bash
cd backend
npm install
npm run dev
```
Backend URL: `http://localhost:5000`

## Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend URL: `http://localhost:5173`

## API Endpoints
- `GET /api/students` - list students
- `POST /api/students` - create student
- `PUT /api/students/:id` - update student
- `DELETE /api/students/:id` - delete student
