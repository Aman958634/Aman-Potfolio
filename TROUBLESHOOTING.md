# Troubleshooting Guide

## 🔍 Common Issues & Solutions

---

## Frontend Issues

### ❌ "Command not found: npm"
**Cause**: Node.js not installed

**Solution**:
1. Download Node.js from [nodejs.org](https://nodejs.org)
2. Install and restart terminal
3. Verify: `node --version`

---

### ❌ Port 5173 already in use
**Cause**: Another application using the port

**Solution**:
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5173
kill -9 <PID>
```

Or change port in `vite.config.js`:
```javascript
server: {
  port: 5174,  // Change port
}
```

---

### ❌ "Cannot find module" errors
**Cause**: Dependencies not installed

**Solution**:
```bash
cd Frontend
rm -rf node_modules
npm cache clean --force
npm install
npm run dev
```

---

### ❌ Blank page on localhost:5173
**Cause**: Build failed or CSS not loading

**Solution**:
1. Check browser console (F12)
2. Check terminal output for errors
3. Clear browser cache (Ctrl+Shift+Delete)
4. Rebuild: `npm run dev`

---

### ❌ Animations not playing
**Cause**: GSAP not installed or elements not found

**Solution**:
```bash
npm install gsap
```

Or verify element exists:
```javascript
console.log(document.querySelector('.your-element'));
```

---

### ❌ Tailwind CSS not working
**Cause**: Styles not compiled

**Solution**:
1. Verify `tailwind.config.js` has correct paths
2. Check `postcss.config.js` exists
3. Rebuild: `npm run dev`
4. Clear browser cache

---

### ❌ API returning 404
**Cause**: Wrong API URL or backend not running

**Solution**:
1. Check backend running: `curl http://localhost:5000/health`
2. Verify `.env`: `VITE_API_URL=http://localhost:5000/api`
3. Check console for exact error
4. Verify route exists in backend

---

## Backend Issues

### ❌ "Cannot find module 'express'"
**Cause**: Dependencies not installed

**Solution**:
```bash
cd Backend
npm install
npm run dev
```

---

### ❌ Port 5000 already in use
**Cause**: Another app using port

**Solution**:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

Or change in `.env`:
```
PORT=5001
```

---

### ❌ Database connection error
**Cause**: MySQL not running or wrong credentials

**Solution**:

**Check MySQL is running**:
```bash
# Windows
tasklist | findstr mysql

# Mac
brew services list

# Linux
sudo systemctl status mysql
```

**Verify credentials in .env**:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
```

**Test connection**:
```bash
mysql -u root -p
```

---

### ❌ "getConnection is not a function"
**Cause**: Database pool not initialized

**Solution**:
1. Check `src/config/database.js` exists
2. Verify MySQL2 installed: `npm install mysql2`
3. Check `.env` has DB credentials
4. Restart server: `npm run dev`

---

### ❌ CORS errors
**Cause**: Frontend and backend URLs mismatch

**Solution**:

Update `Backend/src/server.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',  // Change if needed
  credentials: true,
}));
```

Or check frontend `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

---

### ❌ Routes returning undefined
**Cause**: Controllers not exporting functions correctly

**Solution**:
```bash
# Verify exports in controllers
export const functionName = (req, res) => { ... }
```

Not:
```bash
module.exports = { functionName }  // Wrong in ES modules
```

---

## Database Issues

### ❌ "Unknown database 'portfolio_db'"
**Cause**: Database not created

**Solution**:
```bash
mysql -u root -p
```

Then:
```sql
source /path/to/Backend/database.sql;
```

Or:
```sql
CREATE DATABASE portfolio_db;
USE portfolio_db;
-- Then import schema
```

---

### ❌ "Table 'portfolio_db.projects' doesn't exist"
**Cause**: Tables not created

**Solution**:
```bash
mysql -u root -p portfolio_db < Backend/database.sql
```

Verify tables:
```sql
USE portfolio_db;
SHOW TABLES;
```

---

### ❌ No data in tables
**Cause**: Sample data not inserted

**Solution**:
1. Re-import `database.sql`: `source Backend/database.sql;`
2. Or manually insert:
```sql
INSERT INTO projects (title, description, image, link, tech_stack)
VALUES ('Test', 'Test desc', 'url', 'url', 'React');
```

---

### ❌ "Access denied for user 'root'@'localhost'"
**Cause**: Wrong password

**Solution**:
1. Update `.env` with correct password
2. Or reset MySQL password:
```bash
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

---

### ❌ Can't connect from backend
**Cause**: MySQL socket not found

**Solution**:

Windows (already on localhost):
```
DB_HOST=127.0.0.1
```

Mac (might need socket):
```
DB_HOST=/tmp/mysql.sock
```

Or use TCP:
```
DB_HOST=127.0.0.1
```

---

## Environment & Configuration

### ❌ ".env file not found"
**Cause**: Missing .env file

**Solution**:
```bash
cd Frontend
cp .env.example .env
```

```bash
cd Backend
cp .env.example .env
```

Edit values appropriately

---

### ❌ "ReferenceError: process is not defined"
**Cause**: Using Node.js syntax in frontend

**Solution**:
Use `import.meta.env` instead:
```javascript
// ❌ Wrong
process.env.API_URL

// ✅ Correct
import.meta.env.VITE_API_URL
```

---

### ❌ "NODE_ENV is undefined"
**Cause**: Not imported from process

**Solution**:
```javascript
import dotenv from 'dotenv';
dotenv.config();

console.log(process.env.NODE_ENV);
```

---

## Network & Connectivity

### ❌ "Network request failed"
**Cause**: Backend not accessible

**Solution**:
1. Verify backend running: `curl http://localhost:5000`
2. Check firewall (might block port)
3. Check API URL in frontend
4. Check CORS headers

---

### ❌ "Timeout waiting for response"
**Cause**: Database query too slow

**Solution**:
1. Add database indexes
2. Optimize queries
3. Increase timeout
4. Check MySQL performance

---

### ❌ "Connection refused"
**Cause**: Service not running

**Solution**:
Check what's running:
```bash
# Frontend
http://localhost:5173

# Backend
http://localhost:5000

# MySQL
mysql -u root -p
```

Start missing services

---

## Performance Issues

### ❌ Page loads slowly
**Cause**: Large images, heavy animations, unoptimized queries

**Solution**:
1. Compress images
2. Reduce animation complexity
3. Add database indexes
4. Enable caching

---

### ❌ Animations lag
**Cause**: Too many simultaneous animations

**Solution**:
1. Reduce animation count
2. Use `will-change` CSS
3. Optimize GSAP code
4. Reduce animation duration

---

### ❌ High CPU usage
**Cause**: Infinite loops, bad queries

**Solution**:
1. Review console for errors
2. Check database queries
3. Look for memory leaks
4. Profile with DevTools

---

## Git & Version Control

### ❌ ".env in git history"
**Cause**: Committed sensitive data

**Solution**:
```bash
# Remove file from git history
git rm --cached .env
echo ".env" >> .gitignore
git commit -m "Remove .env"
git push
```

---

### ❌ "Merge conflicts"
**Cause**: Changes on same files

**Solution**:
1. Resolve conflicts in editor
2. Keep changes you want
3. `git add .`
4. `git commit -m "Merge resolved"`

---

## Testing & Debugging

### ❌ "Console showing too many errors"
**Cause**: Missing dependencies or configuration

**Solution**:
1. Read error messages carefully
2. Search error message online
3. Check documentation
4. Add console.logs to debug

---

### ❌ "Contact form not submitting"
**Cause**: API error or validation failure

**Solution**:
1. Check browser console (F12)
2. Check network tab (failed requests)
3. Verify API endpoint
4. Check form validation

---

### ❌ "Projects not loading"
**Cause**: API not responding or wrong URL

**Solution**:
1. Test endpoint: `curl http://localhost:5000/api/projects`
2. Check network tab in DevTools
3. Verify database has projects
4. Check backend logs

---

## Getting Help

### If issue persists:

1. **Check logs**
   - Browser console (F12)
   - Terminal output
   - Database errors

2. **Isolate the problem**
   - Test frontend separately
   - Test backend separately
   - Test database separately

3. **Search for solutions**
   - Google error message
   - Check documentation
   - GitHub issues

4. **Debug systematically**
   - Add console.logs
   - Use browser DevTools
   - Test with curl/Postman

---

## Reporting Issues

When asking for help, provide:
- Error message (exact text)
- What you were doing when it failed
- Terminal/console output
- Steps to reproduce
- System info (OS, Node version, etc.)

---

**Still stuck? Double-check:**
- All services running (frontend, backend, MySQL)
- All .env files created and filled
- All dependencies installed
- Database schema imported
- No syntax errors in code
- Correct URLs and credentials

---

**Happy troubleshooting! 🔧**
