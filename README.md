<h1 align="center">
  ⚡ SportNova
</h1>

<p align="center">
  <strong>AI-powered sports performance management platform for players, coaches, scouts, and admins.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</p>

---

## 📖 Overview

**SportNova** is a full-stack, role-based sports performance management web application. It enables athletes to log and visualize their performance data, coaches and scouts to monitor players and compare statistics, and admins to manage the entire user base. The platform integrates **Google Gemini AI** (with **OpenAI GPT-4o-mini** as fallback) to generate personalized sports recommendations, coaching strategies, and scouting insights in real time.

**Who it's for:**
- 🏃 **Players** — track personal performance metrics and receive AI training recommendations
- 🧑‍🏫 **Coaches** — monitor all players, compare athlete stats, and get coaching strategies
- 🔍 **Scouts** — browse players, view performance data, and get talent scouting insights
- 🛡️ **Admins** — manage all users, roles, and performance records across the platform

---

## ✨ Features

- **Role-Based Access Control** — four distinct user roles (`player`, `coach`, `scout`, `admin`), each with a dedicated dashboard and protected routes
- **JWT Authentication** — secure registration and login with bcrypt-hashed passwords and 7-day JWT tokens
- **Performance Logging** — players submit sport, speed, stamina, and strength metrics; video file upload (up to 50 MB) and external video URL both supported
- **Interactive Performance Charts** — paginated performance history visualized with Recharts
- **AI-Powered Recommendations** — generates role-specific training tips, coaching strategies, and scouting insights using Gemini AI (falls back to OpenAI, then local demo data)
- **AI Sports Search** — free-text sports question answering powered by Gemini/OpenAI, returning structured JSON insight cards
- **Coach Dashboard** — view all registered players, inspect any player's full performance history, and compare two players side-by-side
- **Scout Dashboard** — browse players, filter by sport, and receive AI scouting recommendations
- **Admin Panel** — list all users, change user roles, and delete users (cascading to their performance records) or individual performance entries
- **PDF Export** — generate and download performance reports via jsPDF
- **In-Memory Rate Limiting** — 100 requests / 15 minutes applied separately to auth and API routes
- **Request Logging** — server-side event and request logging utility
- **Graceful Shutdown** — SIGTERM handler for clean server shutdown
- **Framer Motion Animations** — smooth page and component transitions throughout the UI
- **Fully Responsive UI** — built with Tailwind CSS and Lucide React icons

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | React 19 + Vite 7 |
| **Frontend Routing** | React Router DOM v7 |
| **Styling** | Tailwind CSS v3 |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **HTTP Client** | Axios |
| **PDF Generation** | jsPDF |
| **Backend Framework** | Express.js 4 |
| **Runtime** | Node.js |
| **Database** | MongoDB Atlas (via Mongoose 7) |
| **Authentication** | JSON Web Tokens (JWT) + bcryptjs |
| **File Uploads** | Multer |
| **AI — Primary** | Google Gemini AI (`gemini-1.5-flash`, `gemini-pro`, `gemini-2.0-flash`) |
| **AI — Fallback** | OpenAI GPT-4o-mini |
| **Dev Server (Backend)** | Nodemon |

---

## 📁 Folder Structure

```
SportNova/
├── backend/                    # Express.js REST API
│   ├── config/
│   │   └── db.js               # MongoDB connection setup
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification middleware
│   │   ├── rateLimiter.js      # In-memory request rate limiter
│   │   └── roleMiddleware.js   # Role-based access helper
│   ├── models/
│   │   ├── User.js             # Mongoose User schema (player/coach/admin/scout)
│   │   └── Performance.js      # Mongoose Performance schema (speed/stamina/strength + video)
│   ├── routes/
│   │   ├── authRoutes.js            # Register, login, get current user
│   │   ├── performanceRoutes.js     # Log and retrieve performance records
│   │   ├── coachRoutes.js           # Player listing and comparison for coaches/scouts
│   │   ├── adminRoutes.js           # User management for admins
│   │   └── recommendationsRoutes.js # AI recommendation generation (Gemini + OpenAI)
│   ├── utils/
│   │   ├── errorHandler.js     # Global async error handler & AppError class
│   │   ├── logger.js           # Request and event logger
│   │   └── validators.js       # Input validation helpers
│   ├── logs/                   # Server log output (git-ignored)
│   ├── .env                    # Environment variables (git-ignored)
│   ├── server.js               # Entry point — Express app bootstrap
│   └── package.json
│
├── frontend/                   # React + Vite SPA
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js          # Axios instance with JWT interceptor
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global auth state (token + user via localStorage)
│   │   ├── components/
│   │   │   ├── PerformanceChart.jsx      # Recharts performance visualizer
│   │   │   ├── ProtectedRoute.jsx        # Auth guard component
│   │   │   └── SportsRecommendations.jsx # AI recommendation card UI
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Landing page
│   │   │   ├── About.jsx          # About page
│   │   │   ├── Features.jsx       # Features showcase page
│   │   │   ├── Contact.jsx        # Contact page
│   │   │   ├── Login.jsx          # Login form
│   │   │   ├── Register.jsx       # Registration form (with role selection)
│   │   │   ├── Dashboard.jsx      # Player dashboard
│   │   │   ├── CoachDashboard.jsx # Coach dashboard
│   │   │   ├── ScoutDashboard.jsx # Scout dashboard
│   │   │   └── AdminPanel.jsx     # Admin management panel
│   │   ├── App.jsx             # Route definitions & role-based routing
│   │   ├── main.jsx            # React DOM entry point
│   │   ├── App.css             # Global app styles
│   │   └── index.css           # Base CSS / Tailwind directives
│   ├── index.html              # HTML shell
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── eslint.config.js
│   └── package.json
│
├── .gitignore
└── package.json                # Root-level dependency reference
```

---

## ⚙️ Setup & Installation

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A **MongoDB Atlas** cluster (or local MongoDB instance)
- A **Google Gemini API key** (free tier available at [aistudio.google.com](https://aistudio.google.com))
- *(Optional)* An **OpenAI API key** for AI fallback

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/SportNova.git
cd SportNova
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_secure_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
NODE_ENV=development
```

> **⚠️ Never commit your `.env` file.** It is already listed in `.gitignore`.

### 4. Install Frontend Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

---

## 🌍 Environment Variables

All variables are defined in `backend/.env`.

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string (Atlas or local) | ✅ Yes |
| `PORT` | Port the Express server listens on (default: `5000`) | ✅ Yes |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens | ✅ Yes |
| `GEMINI_API_KEY` | Google Gemini API key for AI recommendations | ✅ Yes |
| `OPENAI_API_KEY` | OpenAI API key — fallback when Gemini fails | ⚠️ Optional |
| `NODE_ENV` | Runtime environment (`development` / `production`) | ✅ Yes |

---

## 🚀 Running the Project

### Development Mode

Run the **backend** and **frontend** in separate terminals:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev        # starts server with nodemon (auto-reload)
```
Server runs at: `http://localhost:5000`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev        # starts Vite dev server
```
Frontend runs at: `http://localhost:5173`

---

### Production Mode

**Build the frontend:**
```bash
cd frontend
npm run build      # outputs to frontend/dist/
```

**Start the backend:**
```bash
cd backend
npm start          # runs node server.js
```

**Preview the frontend build locally:**
```bash
cd frontend
npm run preview
```

---

## 🔌 API Endpoints

Base URL: `http://localhost:5000`

All protected routes require the header: `Authorization: Bearer <token>`

### Health Check

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/health` | ❌ | Returns server status, timestamp, and uptime |

### Authentication — `/auth`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/auth/register` | ❌ | Register a new user (name, email, password, role, age, gender) |
| `POST` | `/auth/login` | ❌ | Login and receive a JWT token |
| `GET` | `/auth/me` | ✅ | Get the currently authenticated user's profile |

### Performance — `/performance`

| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| `POST` | `/performance/add` | ✅ | Any | Log a new performance entry (speed, stamina, strength, optional video file or URL) |
| `GET` | `/performance/my` | ✅ | Any | Get paginated performance history for the current user |
| `GET` | `/performance/all` | ✅ | coach, admin | Get all performance records across all users (filterable by sport) |

### Coach & Scout — `/coach`

| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| `GET` | `/coach/players` | ✅ | coach, admin, scout | List all registered players (paginated, filterable by sport) |
| `GET` | `/coach/player/:id/performance` | ✅ | coach, admin, scout | Get full performance history for a specific player by ID |
| `GET` | `/coach/compare?p1=:id&p2=:id` | ✅ | coach, admin, scout | Compare latest performance stats between two players |

### Admin — `/admin`

| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| `GET` | `/admin/users` | ✅ | admin | List all users (paginated, filterable by role) |
| `PATCH` | `/admin/users/:id/role` | ✅ | admin | Change a user's role |
| `DELETE` | `/admin/users/:id` | ✅ | admin | Delete a user and all their associated performance records |
| `DELETE` | `/admin/performance/:id` | ✅ | admin | Delete a specific performance record |

### AI Recommendations — `/recommendations`

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/recommendations/generate` | ✅ | Generate AI recommendations or answer a sports question. Body: `{ sport, count, type }`. Falls back Gemini → OpenAI → local demo data |

---

## 🖼️ Screenshots

> _Run the project locally to preview the UI._

| Page | Description |
|------|-------------|
| `/` | Landing page with hero section and feature highlights |
| `/dashboard` | Player performance logging form and Recharts history visualization |
| `/coach` | Player list, individual performance viewer, and side-by-side player comparison |
| `/scout` | Player browser with sport filter and AI scouting recommendations |
| `/admin` | Full user management table with role-change and delete actions |
| `/features` | Platform feature showcase |
| `/about` | About the platform |
| `/contact` | Contact information page |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** your changes with a clear message:
   ```bash
   git commit -m "feat: add your feature description"
   ```
4. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request** against the `main` branch

### Guidelines

- Keep backend and frontend changes in their respective directories
- Never commit `.env` files or API secrets
- Protect new API routes with `authMiddleware` where appropriate
- Test your changes locally before submitting a PR

---

## 📄 License

This project is licensed under the **ISC License** (as specified in `backend/package.json`).

---

<p align="center">Built with ❤️ using React, Express, MongoDB, and Google Gemini AI</p>
