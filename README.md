# Portfolio Builder

A full-stack MERN application for students to build professional portfolios and resumes.

## Features

- User authentication (Register/Login)
- Resume builder with multiple templates
- Portfolio management and publishing
- Public portfolio sharing
- Admin dashboard for template management
- Resume parsing from PDF/DOCX files

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **Authentication**: JWT

## Prerequisites

- Node.js (v18+)
- MongoDB (local or cloud instance)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/portfolio-builder.git
cd portfolio-builder
```

### 2. Install Dependencies

Run the following command to install all dependencies:

```bash
npm run install:all
```

Or install separately:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Environment Variables Setup

#### Backend (.env)

Create a `.env` file in the `backend` directory:

```env
# MongoDB Connection String
# Use MongoDB Atlas for cloud or local MongoDB
MONGO_URI=mongodb://localhost:27017/portfolio-builder

# JWT Secret (generate a secure random string for production)
JWT_SECRET=your-super-secret-key-change-in-production

# JWT Expiration
JWT_EXPIRE=7d

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development
```

**For MongoDB Atlas:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Create a free cluster
3. Get your connection string
4. Replace `MONGO_URI` with your Atlas connection string

#### Frontend (.env)

Create a `.env` file in the `frontend` directory:

```env
# Backend API URL (for production)
VITE_API_URL=http://localhost:5000/api
```

### 4. Run the Application

**Development Mode (both frontend and backend):**

```bash
npm run dev
```

**Run separately:**

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run client
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Project Structure

```
portfolio-builder/
├── backend/              # Express.js API
│   ├── config/         # Database configuration
│   ├── controllers/    # Route controllers
│   ├── middleware/    # Auth & upload middleware
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   ├── utils/         # Utility functions
│   └── server.js      # Entry point
├── frontend/          # React application
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── context/   # React contexts
│   │   ├── pages/     # Page components
│   │   └── services/  # API services
│   └── package.json
└── package.json       # Root package.json
```

## Default Admin Account

After seeding, an admin account is created:
- **Email**: admin@example.com
- **Password**: admin123

## Pushing to GitHub

### Step 1: Create a New Repository

1. Go to [GitHub](https://github.com)
2. Click the **+** icon → **New repository**
3. Name your repository (e.g., `portfolio-builder`)
4. Choose Public or Private
5. Click **Create repository**

### Step 2: Initialize Git (if not already initialized)

```bash
git init
```

### Step 3: Configure Git

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Step 4: Create .gitignore

Create a `.gitignore` file in the root directory:

```gitignore
# Dependencies
node_modules/

# Environment files (keep .env.example, remove .env)
.env
.env.local
.env.*.local

# Build outputs
dist/
build/

# Logs
logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# Uploads (backend)
backend/uploads/*.pdf

# IDE
.vscode/
.idea/
*.swp
*.swo
```

### Step 5: Add and Commit Files

```bash
git add .
git commit -m "Initial commit"
```

### Step 6: Link to GitHub Repository

```bash
git remote add origin https://github.com/YOUR_USERNAME/portfolio-builder.git
```

### Step 7: Push to GitHub

```bash
git branch -M main
git push -u origin main
```

### Important: Don't Push Sensitive Data!

Never commit your `.env` file to GitHub. It contains:
- Database credentials
- JWT secrets
- API keys

The `.env.example` file should be committed instead as a template.

## Deployment

For free deployment options, see [DEPLOY.md](./DEPLOY.md).

## License

ISC
