# TeamFlow Project Management

TeamFlow is a full-stack task management application designed for streamlined team collaboration and project tracking. It provides a centralized platform for managing complex workflows with a focus on simplicity and efficiency.

## Core Features

### Project Management
Users can create and manage multiple projects, providing a structured environment for different workstreams.

### Kanban Workflow
Tasks are managed through a standard Kanban interface, featuring To-Do, In Progress, and Done states for real-time progress visualization.

### Advanced Task Controls
The application supports detailed task configuration, including priority levels, due dates, and dynamic assignment to team members. Tasks can be edited or reassigned at any stage of the lifecycle.

### Notification System
A personal notification center provides real-time alerts for task assignments and status updates, ensuring team members remain informed of critical changes.

### Activity Tracking
Each project maintains a dedicated activity log, providing a chronological history of all actions performed by team members.

### Role-Based Access Control
The system implements secure authentication with distinct Admin and Member roles, ensuring appropriate permissions for project creation and user management.

## Technical Stack

* **Frontend**: React.js with Tailwind CSS for responsive and modern UI development.
* **Backend**: Node.js and Express.js for scalable API architecture.
* **Database**: PostgreSQL with Prisma ORM for robust data management and integrity.
* **Security**: JSON Web Tokens (JWT) and secure cookie-based session management.

## Getting Started

### Demo Credentials
To explore the application features, use the following administrator account:

* **Email**: admin@teamflow.com
* **Password**: admin123

### Local Setup
1. Clone the repository.
2. Install dependencies for both the frontend and backend using `npm install`.
3. Configure environment variables in the `.env` files.
4. Run `npx prisma db push` to synchronize the database schema.
5. Start the development servers using `npm run dev`.

---
*Developed for professional team collaboration and efficient project delivery.*
