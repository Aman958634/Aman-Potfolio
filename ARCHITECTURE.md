# Architecture & Development Guide

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│              CLIENT LAYER (Browser)                  │
│  React + Vite + Tailwind + GSAP Animations          │
│  http://localhost:5173                               │
└────────────────┬────────────────────────────────────┘
                 │
                 │ HTTP/REST (CORS)
                 │
┌────────────────▼────────────────────────────────────┐
│          API LAYER (Node.js + Express)               │
│  RESTful API with JWT Authentication                 │
│  http://localhost:5000                               │
└────────────────┬────────────────────────────────────┘
                 │
                 │ SQL Queries
                 │
┌────────────────▼────────────────────────────────────┐
│          DATA LAYER (MySQL Database)                 │
│  - projects                                          │
│  - skills                                            │
│  - experience                                        │
│  - contacts                                          │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Component Hierarchy

### Frontend Components Tree
```
App
├── Hero
│   ├── TypewriterEffect
│   └── GSAP Animations
├── About
│   ├── Text Reveal
│   └── Image Parallax
├── Skills
│   ├── Progress Bars (Animated)
│   └── Tech Stack Grid
├── Projects
│   ├── ProjectCard (x multiple)
│   └── ProjectModal
├── Experience
│   ├── TimelineItem (x multiple)
│   └── Scroll Animations
├── Contact
│   └── ContactForm
└── Footer
    └── Social Links
```

---

## 🔄 Data Flow

### Get Projects Example
```
User clicks → React Component → Axios → API Request
     ↓
Backend Route Handler → Controller → Database Query
     ↓
SQL Result → JSON Response → Frontend State → Render
```

### Submit Contact Form Example
```
User submits form → Validation → Axios POST
     ↓
Backend Route Handler → Controller → Database Insert
     ↓
Success Response → Update UI → Show Message
```

---

## 📁 Code Organization

### Frontend Structure
```
src/
├── components/           # Reusable React components
│   ├── Hero.jsx         # Hero section
│   ├── About.jsx        # About section
│   ├── Skills.jsx       # Skills section
│   ├── Projects.jsx     # Projects grid
│   ├── ProjectModal.jsx # Project details modal
│   ├── Experience.jsx   # Experience timeline
│   ├── Contact.jsx      # Contact form
│   ├── Footer.jsx       # Footer
│   └── TypewriterEffect.jsx  # Typing animation
│
├── utils/               # Utility functions
│   ├── api.js          # API calls (axios)
│   └── animations.js    # GSAP animations
│
├── styles/
│   └── index.css        # Global styles & Tailwind
│
├── App.jsx             # Main component
└── main.jsx            # Entry point
```

### Backend Structure
```
src/
├── routes/
│   ├── projectRoutes.js
│   ├── skillRoutes.js
│   ├── experienceRoutes.js
│   └── contactRoutes.js
│
├── controllers/
│   ├── projectController.js
│   ├── skillController.js
│   ├── experienceController.js
│   └── contactController.js
│
├── middleware/
│   └── auth.js          # JWT verification & error handling
│
├── config/
│   └── database.js      # MySQL connection pool
│
└── server.js            # Express app setup
```

---

## 🔐 Authentication & Authorization

### JWT Flow
```
1. User authenticates
2. Backend issues JWT token
3. Frontend stores token in localStorage
4. Frontend includes token in Authorization header
5. Backend verifies token on protected routes
6. Grant/Deny access based on validity
```

### Protected Routes
```
POST   /api/projects      - Create project
PUT    /api/projects/:id  - Update project
DELETE /api/projects/:id  - Delete project
(Same pattern for skills, experience)
```

### Implementation
```javascript
// Frontend: Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Backend: Verify token
export const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  // ... verification logic
};
```

---

## 🎨 Animation Architecture

### GSAP Implementation Pattern
```javascript
// 1. Initialize on component mount
useEffect(() => {
  if (element) {
    animateElement(element);
  }
}, []);

// 2. Define animation
const animateElement = (el) => {
  gsap.from(el, {
    duration: 0.6,
    opacity: 0,
    y: 30,
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
    },
  });
};
```

### Animation Types
1. **Page Load**: Timeline with stagger
2. **Scroll Trigger**: Animations on scroll
3. **Hover Effects**: Interactive elements
4. **Parallax**: Image scroll effects
5. **Text Reveal**: Progressive text appearance

---

## 📡 API Request Patterns

### Get Data
```javascript
async function fetchProjects() {
  try {
    const response = await api.get('/projects');
    setProjects(response.data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Post Data
```javascript
async function submitContact(data) {
  try {
    const response = await api.post('/contact', {
      name: data.name,
      email: data.email,
      message: data.message,
    });
    // Handle success
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Update Data
```javascript
async function updateProject(id, data) {
  try {
    const response = await api.put(`/projects/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Handle success
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## 🗄️ Database Schema

### Projects Table
```sql
id          INT PRIMARY KEY AUTO_INCREMENT
title       VARCHAR(255) NOT NULL
description TEXT NOT NULL
image       VARCHAR(500)
link        VARCHAR(500)
tech_stack  VARCHAR(500)
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### Skills Table
```sql
id          INT PRIMARY KEY AUTO_INCREMENT
name        VARCHAR(100) NOT NULL
level       INT (0-100)
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### Experience Table
```sql
id          INT PRIMARY KEY AUTO_INCREMENT
role        VARCHAR(200) NOT NULL
company     VARCHAR(200) NOT NULL
duration    VARCHAR(100)
description TEXT
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### Contacts Table
```sql
id          INT PRIMARY KEY AUTO_INCREMENT
name        VARCHAR(100) NOT NULL
email       VARCHAR(100) NOT NULL
message     TEXT NOT NULL
created_at  TIMESTAMP
```

---

## 🔄 Request/Response Examples

### GET /api/projects
**Response**:
```json
[
  {
    "id": 1,
    "title": "E-Commerce Platform",
    "description": "Full-stack e-commerce platform",
    "image": "https://...",
    "link": "https://...",
    "tech_stack": "React, Node.js, MySQL",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

### POST /api/contact
**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I'd like to discuss a project"
}
```

**Response**:
```json
{
  "message": "Message sent successfully. I will get back to you soon!"
}
```

---

## 🛡️ Error Handling

### Frontend Error Handling
```javascript
try {
  const response = await api.get('/projects');
  // Handle success
} catch (error) {
  if (error.response?.status === 404) {
    // Handle not found
  } else if (error.response?.status === 500) {
    // Handle server error
  } else {
    // Handle network error
  }
}
```

### Backend Error Handling
```javascript
// Custom error middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});
```

---

## 🚀 Development Workflow

### 1. Start Development
```bash
# Terminal 1: Frontend
cd Frontend && npm run dev

# Terminal 2: Backend
cd Backend && npm run dev

# Terminal 3: Database (if needed)
mysql -u root -p
```

### 2. Make Changes
- Frontend: Changes auto-reload via Vite
- Backend: Changes auto-reload via nodemon
- Database: Changes reflected immediately

### 3. Test Changes
- Frontend: Check in browser at localhost:5173
- Backend: Test endpoints with curl/Postman
- Database: Query with MySQL client

### 4. Commit Changes
```bash
git add .
git commit -m "Descriptive message"
git push
```

---

## 📈 Scaling Considerations

### When you need more:

**More Traffic**:
- Add caching layer (Redis)
- Use CDN for static assets
- Implement rate limiting

**More Data**:
- Add database replication
- Implement pagination
- Add indexes on frequently queried columns

**More Features**:
- Break frontend into smaller chunks
- Add API versioning
- Implement microservices

**Better Performance**:
- Add server-side compression
- Implement query optimization
- Use async/await properly
- Add background jobs (Bull, RabbitMQ)

---

## 🔍 Debugging Tips

### Frontend Debugging
```javascript
// Check API calls
console.log('Request:', endpoint);
console.log('Response:', data);

// Check GSAP animations
gsap.registerPlugin(ScrollTrigger);
gsap.config({ traceFlags: true });

// Check state
console.log('State:', { projects, loading, error });
```

### Backend Debugging
```javascript
// Log middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Log database queries
const [result] = await connection.query(sql);
console.log('Query result:', result);
```

### Database Debugging
```sql
-- Check query performance
EXPLAIN SELECT * FROM projects;

-- Find slow queries
SET GLOBAL slow_query_log = 'ON';
```

---

## 📚 Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Vite | UI Framework |
| Styling | Tailwind CSS | Utility CSS |
| Animations | GSAP | Interactive Effects |
| HTTP Client | Axios | API Communication |
| Backend | Node.js + Express | Server |
| Database | MySQL | Data Storage |
| Auth | JWT | Secure Access |
| Build | Vite | Module Bundler |

---

## 🎯 Best Practices

### Frontend
- Keep components small and reusable
- Use hooks for state management
- Separate business logic from UI
- Optimize images and assets
- Handle loading/error states

### Backend
- Use controllers for business logic
- Validate all inputs
- Use proper HTTP status codes
- Log important events
- Implement rate limiting

### Database
- Use indexes on frequently queried columns
- Normalize data structure
- Use transactions for complex operations
- Regular backups
- Monitor performance

---

**This architecture is production-ready and scalable! 🚀**
