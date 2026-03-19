# 🎨 Graph Plagiarism Detector — Frontend

A visually stunning, interactive frontend designed to work with the Graph Plagiarism Detector backend. Built with React 19 and Vite 6, it emphasizes a modern, dynamic UI with complex 3D data visualization capabilities.

---

## ✨ Core Features

- **Modern Glassmorphism UI**: Beautifully designed using Tailwind CSS 4, following modern UX standards for premium software.
- **Dark/Light Mode Persistence**: Built-in theme switcher preserving user choices via local storage.
- **Dashboard Analytics**: High-level overview metrics showing user activity, algorithm popularity, and top recent documents via Chart.js.
- **Graph Visualization**: High-performance 3D/2D node-link graph rendering using `react-force-graph` and `Three.js`.
- **Side-by-Side Comparison**: Intuitive document overlap visualization with highlighted matches.
- **Micro-Animations**: Fluid transitions and interactive elements via Framer Motion and GSAP.
- **Secure Authentication**: JWT-based login/register flow with protected route handling.
- **Document History**: Comprehensive list of past comparisons with easy access to results and reports.

---

## 🛠️ Technology Stack

| Role | Technology | Version |
|---|---|---|
| **Framework** | React 19 + Vite 6 | 19.0 / 6.0 |
| **Routing** | React Router | 7.13 |
| **State Management** | Zustand (Global) | 5.0.12 |
| **Data Fetching** | React Query / Axios | 5.90 / 1.13 |
| **Styling** | Tailwind CSS 4 + Framer Motion | 4.2 / 12.3 |
| **Animations** | GSAP 3 + Lucide React Icons | 3.14 |
| **Visualization** | Three.js / React-Force-Graph-3D / Chart.js | 0.183 / 1.29 |
| **Notifications** | React Hot Toast | 2.6 |

---

## 🚀 Quick Setup

### 1. Requirements
Ensure **Node.js** (v18+) and **npm/yarn** are installed on your machine.

### 2. Installation
```bash
cd frontend
npm install
# Note: Use npm install --legacy-peer-deps if dependency resolution conflicts arise.
```

### 3. Environment Variables
Create a `.env` file in the `frontend` folder to point the application to the FastAPI server:
```properties
VITE_API_URL=http://localhost:8000/api/v1
```

### 4. Running the Dev Server
```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## 📂 Frontend Project Structure

- `/src/`: Core application source.
  - `/components/`: Reusable UI components (Buttons, Modals, GraphViewers).
  - `/pages/`: Main application pages (Dashboard, Upload, Compare, History).
  - `/store/`: Global state management with Zustand.
  - `/hooks/`: Custom React hooks for API calls via React Query.
  - `/assets/`: Static assets and style tokens.
  - `/utils/`: Helper functions for animations and data formatting.
- `/public/`: Public static assets like logos and icons.
- `tailwind.config.js`: Custom Tailwind configuration for theme tokens.
- `vite.config.js`: Vite build and server configuration.
