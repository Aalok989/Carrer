# Career Project - Job Portal

A modern job portal web application built with React and Vite.

## Features

- 🔍 Job search and filtering
- 📋 Job listings with detailed descriptions
- 👤 User authentication
- 💼 Job application system
- 📱 Responsive design
- 🎨 Modern UI with TailwindCSS

## Tech Stack

- **Frontend Framework:** React 19
- **Build Tool:** Vite 7
- **Styling:** TailwindCSS 3
- **Routing:** React Router DOM 7
- **HTTP Client:** Axios
- **Icons:** React Icons
- **Notifications:** React Toastify

## Prerequisites

Before you begin, ensure you have installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Carrer
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
VITE_API_BASE_URL=https://api.etribes.mittalservices.com
VITE_CLIENT_SERVICE=COHAPPRT
VITE_AUTH_KEY=your-auth-key
VITE_RURL=etribe.mittalservices.com
```

## Development

Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

Create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Linting

Run ESLint to check code quality:

```bash
npm run lint
```

## Project Structure

```
Carrer/
├── src/
│   ├── api/              # API configuration
│   ├── assets/           # Static assets (images, etc.)
│   ├── components/       # Reusable components
│   ├── pages/            # Page components
│   ├── utils/            # Utility functions
│   ├── App.jsx           # Main App component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Public assets
├── .env                  # Environment variables
├── index.html            # HTML template
├── package.json          # Project dependencies
├── vite.config.js        # Vite configuration
└── tailwind.config.js    # TailwindCSS configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For support, please contact the development team.
