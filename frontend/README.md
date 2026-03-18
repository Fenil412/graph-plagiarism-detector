# 🎨 Graph Plagiarism Detector — Frontend

A visually stunning, interactive frontend designed to work with the Graph Plagiarism Detector backend. Built with React and Vite, it emphasizes a modern, dynamic UI with complex data visualization capabilities.

---

## ✨ Features

- **Modern Glassmorphism UI**: Beautifully designed following modern UX standards.
- **Dark/Light Mode Persistence**: Built-in theme switcher preserving user choices.
- **Dashboard Analytics**: Overview metrics showing user activity, recent algorithms, and top documents.
- **Graph Visualization**: High-performance 3D/2D node-link graph rendering.
- **Side-by-Side Comparison**: Intuitive document overlap visualization with highlighting.
- **Secure Authentication**: JWT-based login/register flow with protected routes.
- **Responsive Navigation**: Sidebar navigation optimizing workspace size on desktops.

---

## 🛠️ Technology Stack

| Role | Technology |
|---|---|
| **Framework** | React 18 + Vite |
| **Routing** | React Router |
| **State Management** | Zustand |
| **Data Fetching** | React Query / Axios |
| **Styling** | Tailwind CSS / Framer Motion |
| **Icons** | Lucide React |
| **Visualization** | Three.js / React-Force-Graph / Chart.js |

---

## 🚀 Quick Setup

### 1. Requirements
Ensure **Node.js** (v18+) and **npm/yarn** are installed.

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
