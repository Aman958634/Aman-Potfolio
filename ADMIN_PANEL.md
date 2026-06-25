# Admin Panel Guide

## Current Status

This project does not yet include a dedicated frontend admin dashboard UI. The site content is controlled using backend admin APIs.

## How to open the admin panel

Since no admin frontend is implemented yet, use a REST client such as Postman or a browser extension to access the backend admin APIs.

## Backend admin endpoints

The backend exposes the following section management endpoints:

- `GET /api/sections` - List all admin-managed sections
- `GET /api/sections/:slug` - Fetch a specific section by slug
- `POST /api/sections` - Create a new section
- `PUT /api/sections/:slug` - Update an existing section
- `DELETE /api/sections/:slug` - Delete a section

### Example section slugs

- `about`
- `contact`
- `footer`

## Authentication

Protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

The backend middleware is implemented in `Backend/src/middleware/auth.js`.

## Example API usage

### Get the About section

```http
GET http://localhost:5000/api/sections/about
```

### Update the Footer section

```http
PUT http://localhost:5000/api/sections/footer
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Your Brand Name",
  "subtitle": "Premium digital experiences for your brand.",
  "content": "I build modern web apps using React, Node.js and clean UI design.",
  "metadata": {
    "socialLinks": [
      { "name": "GitHub", "icon": "💻", "url": "https://github.com" },
      { "name": "LinkedIn", "icon": "🔗", "url": "https://linkedin.com" }
    ]
  }
}
```

## How to open the backend

1. Open a terminal in `Backend`.
2. Run:
   ```bash
   npm install
   npm start
   ```
3. The API will run at `http://localhost:5000` by default.

## How to use the current frontend admin-like data

The current site loads admin-managed content from these sections:

- `about` for the About section
- `contact` for the contact area headline and subtitle
- `footer` for footer copy and social links

## Next step

To make a proper admin panel UI, add a new frontend route such as `/admin` and build a dashboard that consumes the admin API endpoints.

For now, use the admin API routes directly with a REST client.
