# Complete Setup Instructions

## 📋 Prerequisites

Before starting, ensure you have installed:

- **Node.js** (v14+): [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MySQL Server**: [Download](https://dev.mysql.com/downloads/)
- **Git** (optional): [Download](https://git-scm.com/)
- **Code Editor**: VS Code recommended

### Verify Installation

```bash
node --version
npm --version
mysql --version
```

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Setup Frontend

```bash
cd Frontend
npm install
npm run dev
```

**Result**: Frontend running at `http://localhost:5173`

### Step 2: Setup Backend (New Terminal)

```bash
cd Backend
npm install
npm run dev
```

**Result**: Backend running at `http://localhost:5000`

### Step 3: Setup Database (MySQL Terminal)

```bash
mysql -u root -p
source Backend/database.sql;
exit
```

**Result**: Database created with sample data

---

## 📖 Detailed Setup Guide

### Frontend Setup

#### 1. Navigate to Frontend Directory
```bash
cd Frontend
```

#### 2. Install Dependencies
```bash
npm install
```

This installs:
- React
- Tailwind CSS
- GSAP
- Axios
- Vite

#### 3. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` file:
```
VITE_API_URL=http://localhost:5000/api
```

#### 4. Start Development Server
```bash
npm run dev
```

**Output**:
```
VITE v5.0.0  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

#### 5. Access Application
Open browser and go to: `http://localhost:5173`

---

### Backend Setup

#### 1. Navigate to Backend Directory
```bash
cd Backend
```

#### 2. Install Dependencies
```bash
npm install
```

This installs:
- Express.js
- MySQL2
- JWT
- CORS
- Body Parser
- Dotenv

#### 3. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` file:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=portfolio_db
JWT_SECRET=your-secret-key-change-this
NODE_ENV=development
```

#### 4. Start Development Server
```bash
npm run dev
```

**Output**:
```
✅ Server running on http://localhost:5000
📚 API Documentation:
   GET  /api/projects         - Get all projects
   GET  /api/skills           - Get all skills
   GET  /api/experience       - Get all experience
   POST /api/contact          - Submit contact form
```

#### 5. Verify Backend
```bash
curl http://localhost:5000/health
```

Should return: `{"status":"Backend is running"}`

---

### Database Setup

#### Option A: Command Line

```bash
# Connect to MySQL
mysql -u root -p

# Enter your password when prompted

# Import schema
source /path/to/Backend/database.sql;

# Verify tables created
USE portfolio_db;
SHOW TABLES;

# Exit
exit
```

#### Option B: MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. Go to File → Open SQL Script
4. Select `Backend/database.sql`
5. Click Execute
6. Refresh schema view to verify

#### Option C: GUI Tools

Use tools like:
- DBeaver
- HeidiSQL
- PhpMyAdmin

All support importing SQL files.

#### Verify Database

Connect to database and check:
```sql
USE portfolio_db;
SELECT * FROM projects;
SELECT * FROM skills;
SELECT * FROM experience;
```

---

## 🧪 Testing the Application

### Test Frontend Load
1. Go to `http://localhost:5173`
2. Scroll through all sections
3. Verify animations play
4. Test responsive design (F12 → Device Toolbar)

### Test Backend API

#### Get All Projects
```bash
curl http://localhost:5000/api/projects
```

#### Get All Skills
```bash
curl http://localhost:5000/api/skills
```

#### Get All Experience
```bash
curl http://localhost:5000/api/experience
```

#### Submit Contact Form
```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello, this is a test message"
  }'
```

### Test Contact Form
1. Scroll to Contact section on portfolio
2. Fill in the form
3. Click "Send Message"
4. Verify success message appears
5. Check database: `SELECT * FROM contacts;`

---

## 📁 File Structure

### Frontend
```
Frontend/
├── src/
│   ├── components/
│   │   ├── Hero.jsx              # Hero section
│   │   ├── About.jsx             # About section
│   │   ├── Skills.jsx            # Skills section
│   │   ├── Projects.jsx          # Projects grid
│   │   ├── ProjectModal.jsx      # Project details modal
│   │   ├── Experience.jsx        # Experience timeline
│   │   ├── Contact.jsx           # Contact form
│   │   ├── Footer.jsx            # Footer
│   │   └── TypewriterEffect.jsx  # Typewriter effect
│   ├── utils/
│   │   ├── api.js                # API calls
│   │   └── animations.js         # GSAP animations
│   ├── styles/
│   │   └── index.css             # Global styles
│   ├── App.jsx                   # Main component
│   └── main.jsx                  # Entry point
├── public/                       # Static assets
├── index.html                    # HTML template
├── vite.config.js               # Vite config
├── tailwind.config.js           # Tailwind config
├── postcss.config.js            # PostCSS config
├── package.json                 # Dependencies
└── .env.example                 # Environment template
```

### Backend
```
Backend/
├── src/
│   ├── controllers/
│   │   ├── projectController.js      # Project handlers
│   │   ├── skillController.js        # Skill handlers
│   │   ├── experienceController.js   # Experience handlers
│   │   └── contactController.js      # Contact handlers
│   ├── routes/
│   │   ├── projectRoutes.js          # Project routes
│   │   ├── skillRoutes.js            # Skill routes
│   │   ├── experienceRoutes.js       # Experience routes
│   │   └── contactRoutes.js          # Contact routes
│   ├── middleware/
│   │   └── auth.js                   # JWT & error handling
│   ├── config/
│   │   └── database.js               # MySQL connection
│   └── server.js                     # Express app
├── database.sql                 # Database schema
├── package.json                 # Dependencies
├── .env.example                 # Environment template
└── README.md                    # Backend docs
```

---

## 🔧 Common Tasks

### Add a New Project

#### 1. Via API (Recommended)

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "New Project",
    "description": "Project description",
    "image": "https://image-url.com/image.jpg",
    "link": "https://github.com/project",
    "tech_stack": "React, Node.js, MySQL"
  }'
```

#### 2. Via MySQL

```sql
INSERT INTO projects (title, description, image, link, tech_stack)
VALUES (
  'Project Name',
  'Description here',
  'https://image-url.jpg',
  'https://github.com/project',
  'React, Node.js'
);
```

### Add Skills

```sql
INSERT INTO skills (name, level)
VALUES ('New Skill', 85);
```

### Add Experience

```sql
INSERT INTO experience (role, company, duration, description)
VALUES (
  'Job Title',
  'Company Name',
  '2024 - Present',
  'Job description'
);
```

### Update Personal Information

Edit files:
- `Frontend/src/components/Hero.jsx` - Name/role
- `Frontend/src/components/About.jsx` - Bio
- `Frontend/src/components/Footer.jsx` - Social links

### Change Theme Colors

Edit `Frontend/tailwind.config.js`:
```javascript
colors: {
  'neon-blue': '#00f0ff',      // Change these
  'neon-purple': '#b744d9',
  'neon-pink': '#ff006e',
}
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Frontend port 5173 in use:**
```bash
# Kill process on port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :5173
kill -9 <PID>
```

**Backend port 5000 in use:**
```bash
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :5000
kill -9 <PID>
```

Or change port in `.env`:
```
PORT=5001  # Change to different port
```

### MySQL Connection Error

**Check if MySQL is running:**

Windows:
```
services.msc  # Search for MySQL service
```

Mac:
```bash
brew services list
```

Linux:
```bash
sudo systemctl status mysql
```

**Verify credentials in .env:**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=correct_password
```

### Cannot find module errors

**Clear and reinstall:**
```bash
rm -rf node_modules
npm cache clean --force
npm install
```

### API returns 404

**Verify backend is running:**
```bash
curl http://localhost:5000/health
```

**Check API URL in frontend .env:**
```
VITE_API_URL=http://localhost:5000/api
```

### CORS errors

**Update in Backend/src/server.js:**
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
```

---

## 📦 Production Deployment

### Frontend Deployment (Vercel)

1. Build project:
```bash
npm run build
```

2. Deploy `dist` folder to Vercel

3. Set environment variables in Vercel dashboard

### Backend Deployment (Railway/Render)

1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy

### Database Deployment

Use AWS RDS or managed MySQL service, then update `.env` with new credentials.

---

## 📚 Additional Resources

- [React Docs](https://react.dev)
- [GSAP Docs](https://greensock.com/docs/)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Express Docs](https://expressjs.com/)
- [MySQL Docs](https://dev.mysql.com/doc/)

---

## ✅ Checklist

- [ ] Node.js installed
- [ ] MySQL installed and running
- [ ] Frontend dependencies installed
- [ ] Backend dependencies installed
- [ ] .env files created and configured
- [ ] Database schema imported
- [ ] Frontend running on port 5173
- [ ] Backend running on port 5000
- [ ] API endpoints responding
- [ ] Contact form submitting
- [ ] Animations working smoothly
- [ ] Responsive design working

---

**You're all set! 🎉 Your portfolio is ready to customize and deploy!**
