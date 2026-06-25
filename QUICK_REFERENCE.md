# Quick Reference Guide

## 🚀 Quick Commands

### Frontend
```bash
cd Frontend
npm install              # Install dependencies
npm run dev             # Start dev server (port 5173)
npm run build           # Build for production
npm run preview         # Preview production build
```

### Backend
```bash
cd Backend
npm install             # Install dependencies
npm run dev             # Start dev server (port 5000)
npm start               # Start production server
```

### Database
```bash
# Import schema
mysql -u root -p portfolio_db < Backend/database.sql

# Connect to database
mysql -u root -p

# In MySQL:
USE portfolio_db;
SHOW TABLES;
SELECT * FROM projects;
```

---

## 📁 File Locations

| Purpose | Location |
|---------|----------|
| Frontend components | `Frontend/src/components/` |
| Frontend styles | `Frontend/src/styles/index.css` |
| API utilities | `Frontend/src/utils/api.js` |
| GSAP animations | `Frontend/src/utils/animations.js` |
| Backend routes | `Backend/src/routes/` |
| Backend controllers | `Backend/src/controllers/` |
| Database config | `Backend/src/config/database.js` |
| Database schema | `Backend/database.sql` |
| Frontend config | `Frontend/vite.config.js` |
| Tailwind config | `Frontend/tailwind.config.js` |

---

## 🔧 Common Edits

### Change Theme Colors
**File**: `Frontend/tailwind.config.js`
```javascript
colors: {
  'neon-blue': '#00f0ff',
  'neon-purple': '#b744d9',
  'neon-pink': '#ff006e',
}
```

### Update Personal Info
**Files**:
- `Frontend/src/components/Hero.jsx` - Name/role
- `Frontend/src/components/About.jsx` - Bio
- `Frontend/src/components/Footer.jsx` - Social links

### Add New Section
1. Create `Frontend/src/components/NewSection.jsx`
2. Import in `Frontend/src/App.jsx`
3. Add to JSX: `<NewSection />`

### Add GSAP Animation
**File**: `Frontend/src/utils/animations.js`
```javascript
export const myAnimation = (element) => {
  gsap.to(element, {
    duration: 1,
    opacity: 1,
    y: 0,
  });
};
```

---

## 📊 API Reference

### GET Endpoints
```javascript
// Fetch all projects
GET /api/projects

// Fetch all skills
GET /api/skills

// Fetch all experience
GET /api/experience
```

### POST Endpoints
```javascript
// Submit contact form
POST /api/contact
{
  "name": "John",
  "email": "john@example.com",
  "message": "Hello"
}

// Create project (requires auth)
POST /api/projects
{
  "title": "Project",
  "description": "Desc",
  "image": "url",
  "link": "url",
  "tech_stack": "React, Node"
}
```

---

## 🔑 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=portfolio_db
JWT_SECRET=change-this
NODE_ENV=development
```

---

## 🧪 Testing

### Test Frontend
```bash
npm run dev
# Open http://localhost:5173
```

### Test Backend
```bash
curl http://localhost:5000/health
curl http://localhost:5000/api/projects
```

### Test Database
```bash
mysql -u root -p
USE portfolio_db;
SELECT * FROM projects;
```

---

## 🐛 Debug Tips

| Issue | Solution |
|-------|----------|
| Port in use | Kill process: `lsof -i :5173` |
| DB not found | Run `database.sql` in MySQL |
| API 404 | Check backend running on 5000 |
| CORS errors | Update CORS in `server.js` |
| Animations fail | Check GSAP installed |
| Styles not applied | Clear browser cache |

---

## 📦 Dependencies

### Frontend
- `react` - UI framework
- `gsap` - Animations
- `axios` - HTTP client
- `tailwindcss` - Styling
- `vite` - Build tool

### Backend
- `express` - Web server
- `mysql2` - Database driver
- `jwt` - Authentication
- `cors` - Cross-origin requests
- `dotenv` - Environment config

---

## 🎨 Customization Checklist

- [ ] Update name in Hero
- [ ] Update bio in About
- [ ] Update social links in Footer
- [ ] Add projects to database
- [ ] Add skills to database
- [ ] Change theme colors
- [ ] Update profile image
- [ ] Customize animations
- [ ] Add personal projects
- [ ] Deploy to production

---

## 📱 Responsive Breakpoints

```css
Mobile:  < 640px
Tablet:  640px - 1024px
Desktop: > 1024px
```

All components are fully responsive!

---

## 🚀 Deploy Quickly

### Frontend (Vercel)
```bash
npm run build
# Upload dist folder to Vercel
```

### Backend (Railway)
1. Push to GitHub
2. Connect repo on Railway
3. Set environment variables
4. Deploy!

### Database (PlanetScale)
1. Create free account
2. Import `database.sql`
3. Update DB credentials

---

## 📚 Resources

| Topic | Link |
|-------|------|
| React Docs | https://react.dev |
| GSAP Docs | https://greensock.com/docs |
| Tailwind Docs | https://tailwindcss.com |
| Express Docs | https://expressjs.com |
| MySQL Docs | https://dev.mysql.com/doc |

---

## ⚡ Performance Tips

- Optimize images (WebP format)
- Lazy load components
- Minimize animations
- Use CDN for assets
- Enable gzip compression
- Cache API responses

---

## 🔒 Security Best Practices

- Never commit `.env` files
- Use strong JWT secret
- Validate all inputs
- Use HTTPS in production
- Keep dependencies updated
- Use environment variables

---

## 🎯 Next Steps

1. **Customize**: Update personal info
2. **Add Content**: Add projects/skills
3. **Test**: Run locally
4. **Deploy**: Push to production
5. **Monitor**: Check logs/errors

---

**Happy coding! 🎉**
