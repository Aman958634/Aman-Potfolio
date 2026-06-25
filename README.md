# Full-Stack Developer Portfolio Application

A modern, professional developer portfolio web application built with React, Node.js, and MySQL. Features dark futuristic design with glassmorphism, smooth GSAP animations, and fully functional backend API.

## 🚀 Features

### Frontend
- ⚛️ **React 18** with Vite for fast development
- 🎨 **Tailwind CSS** for modern styling
- ✨ **GSAP & ScrollTrigger** for cinematic animations
- 📱 **Fully Responsive** - Mobile, tablet, desktop
- 🌑 **Dark Futuristic Theme** with glassmorphism effects
- 🎯 **Animated Sections** - Hero, About, Skills, Projects, Experience, Contact
- 💫 **Custom Cursor** and interactive elements
- 📝 **Typewriter Effect** for dynamic text

### Backend
- 🟢 **Node.js with Express.js** for robust API
- 🏗️ **MVC Architecture** for clean code organization
- 🗄️ **MySQL Database** for data persistence
- 🔐 **JWT Authentication** for admin operations
- ✅ **Input Validation** and error handling
- 📡 **RESTful API** endpoints

### Database
- 📊 **Projects Table** - Showcase your work
- 🎓 **Skills Table** - Display your expertise
- 💼 **Experience Table** - Career timeline
- 💌 **Contacts Table** - Store inquiries

## 📁 Project Structure

```
PORTFOLIO/
├── Frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── utils/             # API & animation utilities
│   │   ├── styles/            # Global CSS
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── public/                # Static assets
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind configuration
│   ├── package.json           # Dependencies
│   └── README.md              # Frontend docs
│
├── Backend/
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth & error handlers
│   │   ├── config/            # Database config
│   │   └── server.js          # Server setup
│   ├── package.json           # Dependencies
│   ├── database.sql           # Database schema
│   └── README.md              # Backend docs
│
└── README.md                  # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MySQL Server
- Git

### 1. Clone/Setup Repository
```bash
cd PORTFOLIO
```

### 2. Setup Frontend

```bash
cd Frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`

### 3. Setup Backend

```bash
cd ../Backend
npm install
cp .env.example .env
```

Edit `.env` with your MySQL credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=portfolio_db
```

```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### 4. Setup Database

```bash
# Open MySQL client
mysql -u root -p

# Import the schema
source Backend/database.sql;
```

Or use MySQL Workbench to import `Backend/database.sql`

## 🎨 Frontend Sections

### 1. **Hero Section**
- Name and role display
- Typewriter animation effect
- GSAP fade/scale/stagger animations
- Call-to-action buttons
- Floating background elements

### 2. **About Section**
- Personal bio with text reveal animation
- Profile image with parallax
- Key information cards
- Smooth scroll trigger animations

### 3. **Skills Section**
- Animated progress bars with GSAP
- Skill level display (0-100%)
- Tech stack grid with hover effects
- Responsive layout

### 4. **Projects Section**
- Dynamic projects fetched from API
- Card hover animations
- Modal popup for detailed view
- Technology tags
- Project links

### 5. **Experience Timeline**
- Vertical timeline layout
- Scroll trigger animations
- Alternating left/right design
- Company, role, and duration info
- Experience descriptions

### 6. **Contact Section**
- Animated form with validation
- Real-time submission to backend
- Success message display
- Email field validation

### 7. **Footer**
- Social media links with hover effects
- Copyright information
- "Back to top" button
- Responsive design

## 🔌 API Endpoints

### Projects
```
GET    /api/projects           # Get all projects
GET    /api/projects/:id       # Get single project
POST   /api/projects           # Create project (auth required)
PUT    /api/projects/:id       # Update project (auth required)
DELETE /api/projects/:id       # Delete project (auth required)
```

### Skills
```
GET    /api/skills             # Get all skills
POST   /api/skills             # Create skill (auth required)
PUT    /api/skills/:id         # Update skill (auth required)
DELETE /api/skills/:id         # Delete skill (auth required)
```

### Experience
```
GET    /api/experience         # Get all experience
POST   /api/experience         # Create experience (auth required)
PUT    /api/experience/:id     # Update experience (auth required)
DELETE /api/experience/:id     # Delete experience (auth required)
```

### Contact
```
POST   /api/contact            # Submit contact form
GET    /api/contact            # Get all contacts (auth required)
DELETE /api/contact/:id        # Delete contact (auth required)
```

## ✨ GSAP Animation Features

- **Page Load Animation**: Timeline with staggered elements
- **ScrollTrigger**: Section animations on scroll
- **Parallax Effects**: Image parallax on scroll
- **Magnetic Buttons**: Button follows cursor on hover
- **Card Hover**: Lift effect with shadow glow
- **Text Reveal**: Animated text appearance
- **Custom Cursor**: Interactive cursor feedback
- **Smooth Transitions**: All interactions have smooth animations

## 🔐 Security Features

- **JWT Authentication**: Secure admin operations
- **Input Validation**: Server-side validation
- **CORS Configuration**: Protected API endpoints
- **Environment Variables**: Sensitive data in .env files
- **Error Handling**: Comprehensive error messages

## 📦 Dependencies

### Frontend
- React 18.2.0
- Tailwind CSS 3.4.0
- GSAP 3.12.2
- Axios 1.6.0
- Vite 5.0.0

### Backend
- Express.js 4.18.2
- MySQL2 3.6.1
- JWT 9.1.0
- bcryptjs 2.4.3
- CORS 2.8.5

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the 'dist' folder
```

### Backend (Heroku/Railway/Render)
```bash
npm start
# Deploy with environment variables
```

### Database (AWS RDS/Heroku)
- Use managed MySQL service
- Update DB credentials in .env

## 📝 Customization

### Update Personal Info
1. Edit `Frontend/src/components/Hero.jsx` - Name and role
2. Edit `Frontend/src/components/About.jsx` - Bio and info
3. Edit `Frontend/src/components/Footer.jsx` - Social links

### Add Projects
1. Go to backend admin panel or database
2. Add project data via POST `/api/projects`
3. Projects appear on portfolio automatically

### Modify Theme Colors
1. Edit `Frontend/tailwind.config.js`
2. Change color values in `neon-*` variables
3. Update `Frontend/src/styles/index.css` as needed

### Add More Sections
1. Create new component in `Frontend/src/components/`
2. Import in `Frontend/src/App.jsx`
3. Style with Tailwind CSS
4. Add GSAP animations as needed

## 🐛 Troubleshooting

### Frontend won't load
- Check Node.js version: `node -v`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Vite config and environment variables

### Backend API errors
- Verify MySQL is running
- Check database credentials in .env
- Review console for SQL errors
- Ensure database schema is imported

### CORS errors
- Update CORS origin in `Backend/src/server.js`
- Match your frontend URL exactly

### Animations not working
- Ensure GSAP is installed: `npm install gsap`
- Check browser console for JavaScript errors
- Verify DOM elements exist before animation

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [GSAP Documentation](https://greensock.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Express.js Guide](https://expressjs.com)
- [MySQL Tutorial](https://dev.mysql.com/doc)

## 🤝 Contributing

Feel free to fork, modify, and use this as a template for your own portfolio!

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 👨‍💻 Author

Your Name - [Your Portfolio]

---

**Happy coding! 🎉 Make it yours and showcase your amazing projects!**
