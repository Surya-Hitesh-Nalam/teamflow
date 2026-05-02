# TeamFlow — Team Task Manager

A professional, full-stack task management application designed for teams to collaborate effectively. Features a Kanban-style board, real-time activity logging, and role-based access control.

## 🚀 Features

- **Authentication**: Secure JWT-based authentication stored in HTTP-only cookies.
- **Dashboard**: High-level overview of project stats, personal tasks, and recent activity.
- **Project Management**: Create and manage projects, invite team members, and track progress.
- **Kanban Board**: Visualize task workflows with TODO, IN_PROGRESS, and DONE columns.
- **Task Details**: Detailed task descriptions, priority levels, due dates, and discussion threads (comments).
- **Activity Feed**: Detailed audit log of all actions taken within a project.
- **RBAC**: Role-based access control (Admin vs Member) for sensitive actions like deleting tasks or adding members.

## 🛠️ Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Axios, React Router.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL with Prisma ORM.
- **Security**: Helmet, CORS, Rate Limiting, Bcrypt.

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- PostgreSQL database

### 1. Backend Setup
1. Navigate to `backend/`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/teamflow"
   JWT_SECRET="your-secret-key"
   FRONTEND_URL="http://localhost:5173"
   PORT=5000
   ```
4. Run migrations: `npx prisma migrate dev`
5. Seed data (optional): `npm run seed`
6. Start the server: `npm run dev`

### 2. Frontend Setup
1. Navigate to `frontend/`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## 👨‍💻 Contributing

This project is built to demonstrate solid full-stack fundamentals. Code is structured for readability and maintainability, avoiding over-engineering while following industry best practices.

---

Built with ❤️ by [Your Name]
