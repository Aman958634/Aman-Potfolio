# Backend Setup Guide

## Installation

1. **Install dependencies**
```bash
cd Backend
npm install
```

2. **Create .env file**
```bash
cp .env.example .env
```

Edit the `.env` file with your database credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=portfolio_db
```

3. **Create MySQL Database**

First, create the database and tables using the SQL schema provided in `database.sql`

4. **Start development server**
```bash
npm run dev
```

Or for production:
```bash
npm start
```

The backend will run on `http://localhost:5000`

## API Endpoints

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project (auth required)
- `PUT /api/projects/:id` - Update project (auth required)
- `DELETE /api/projects/:id` - Delete project (auth required)

### Skills
- `GET /api/skills` - Get all skills
- `POST /api/skills` - Create skill (auth required)
- `PUT /api/skills/:id` - Update skill (auth required)
- `DELETE /api/skills/:id` - Delete skill (auth required)

### Experience
- `GET /api/experience` - Get all experience
- `POST /api/experience` - Create experience (auth required)
- `PUT /api/experience/:id` - Update experience (auth required)
- `DELETE /api/experience/:id` - Delete experience (auth required)

### Contact
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contacts (auth required)
- `DELETE /api/contact/:id` - Delete contact (auth required)

## Project Structure

```
Backend/
├── src/
│   ├── controllers/     # Route controllers
│   ├── routes/          # API routes
│   ├── middleware/      # Auth & error handlers
│   ├── config/          # Database config
│   └── server.js        # Main server file
└── package.json         # Dependencies
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `DB_HOST` - MySQL host
- `DB_USER` - MySQL user
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - Database name
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)
