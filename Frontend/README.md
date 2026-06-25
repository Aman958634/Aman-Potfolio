# Frontend Setup Guide

## Installation

1. **Install dependencies**
```bash
cd Frontend
npm install
```

2. **Create .env file**
```bash
cp .env.example .env
```

3. **Start development server**
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Features

- ⚛️ **React 18** with Vite
- 🎨 **Tailwind CSS** for styling
- ✨ **GSAP** animations with ScrollTrigger
- 📱 **Fully Responsive** design
- 🌑 **Dark Theme** with glassmorphism
- 🎯 **Multiple Animated Sections**

## Project Structure

```
Frontend/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── utils/          # API and animation utilities
│   ├── styles/         # Global CSS
│   ├── App.jsx         # Main App component
│   └── main.jsx        # Entry point
├── public/             # Static files
└── package.json        # Dependencies
```

## Components

- **Hero**: Welcome section with typewriter effect
- **About**: About me section with parallax
- **Skills**: Skills showcase with animated progress bars
- **Projects**: Dynamic projects from API
- **Experience**: Timeline of work experience
- **Contact**: Contact form with validation
- **Footer**: Social links and credits

## Build for Production

```bash
npm run build
```

This creates optimized build in `dist/` folder.
