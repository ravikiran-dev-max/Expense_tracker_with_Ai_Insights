# Expense-Tracker Frontend (Vite / React SPA)

This folder contains the React Single Page Application (SPA) client interface for the MERN Expense-Tracker. It is configured to run on top of the Vite bundler and utilizes Recharts for visual metrics, Lucide icons, and Tesseract.js for scanning receipts locally.

---

## 📂 Folder Structure

```text
frontend/
├── public/              # Global static asset templates
├── src/
│   ├── assets/          # Project specific images and icons
│   ├── components/      # Reusable UI component blocks
│   │   ├── AiAnalytics.jsx      # AI insight visualization panels
│   │   ├── ChatBot.jsx          # Chat dialog bubble overlay
│   │   ├── Navbar.jsx           # Global header navigation and notification polling
│   │   ├── ProtectedRoute.jsx   # Route guard checking authentication state
│   │   ├── Sidebar.jsx          # Collapsible navigation drawer
│   │   ├── TransactionModal.jsx # Add / Edit transaction dialog form
│   │   └── TransactionTable.jsx # Tabular transaction logs (desktop table / mobile cards)
│   ├── context/         # Central React Context state providers
│   │   ├── AlertContext.jsx     # Toaster notifications manager
│   │   └── AuthContext.jsx      # User authentication session and fetch wrappers
│   ├── pages/           # Page-level dashboard route nodes
│   │   ├── Dashboard.jsx        # Graphical cashflows and distribution widgets
│   │   ├── Home.jsx             # Marketing landing page
│   │   ├── Login.jsx            # Account sign-in validation card
│   │   ├── Profile.jsx          # Settings and budget configurations
│   │   ├── Signup.jsx           # Registration validation card
│   │   └── Transactions.jsx     # Full listings table, CSV exports, and OCR scans
│   ├── App.css          # Styling rules
│   ├── App.jsx          # Routing layouts mapping
│   ├── index.css        # Core design system stylesheet (Tailwind directives)
│   └── main.jsx         # App mounting entry point
├── eslint.config.js     # Code quality checker configuration
├── index.html           # Core single-page entry template
├── package.json         # Project metadata, scripts, and dependencies
├── postcss.config.js    # Style preprocess module configurations
├── tailwind.config.js   # Tailwind grid and design token settings
├── vercel.json          # Redirect rules for client-side routing on Vercel
└── vite.config.js       # Bundler setup rules
```

---

## 🛠️ Tech Stack & Key Dependencies

- **Build Engine**: Vite (v8.0.12)
- **UI Library**: React (v19.2.6) & React DOM
- **Routing**: React Router DOM (v7.15.1) for Single Page application path management
- **Charts & Graphs**: Recharts (v3.8.1) for Area, Line, Bar, and Pie visualizations
- **OCR Engine**: Tesseract.js (v7.0.0) for scanning receipt values directly in browser sandboxes
- **Icons**: Lucide React (v1.16.0) for visual assets
- **Styling**: TailwindCSS (v3.4.19) for responsive design and dark mode themes

---

## 🔑 Environment Variables Configuration

To run the application, the client needs to know where the backend API server is located. The host can be configured dynamically by adding an `.env` file in the root of the `frontend` folder:

```ini
# Production API base URL (Vite parses variables prefixed with VITE_)
# Make sure to include the "/api" suffix.
# If omitted or left blank, the client automatically falls back to http://localhost:5000/api
VITE_API_BASE=https://expense-tracker-backend.onrender.com/api
```

---

## 🚀 Local Installation & Setup

1. Open your terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the development server (runs locally on Port 5173 by default):
   ```bash
   npm run dev
   ```
4. Build the application for production optimization:
   ```bash
   npm run build
   ```
5. Preview the local production build bundle:
   ```bash
   npm run preview
   ```

---

## ☁️ Deployment Instructions

### Hosting on Vercel (recommended)

Vercel is the ideal choice for hosting static Vite/React apps. To prevent Vercel from returning a `404 Not Found` error when refreshing routes like `/dashboard` or `/profile`, we have included a [`vercel.json`](file:///c:/Users/ravik/OneDrive/Desktop/3rdweek/Expense-Tracker/frontend/vercel.json) file that rewrites all requests back to `/index.html`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Steps to Deploy:
1. Connect your GitHub repository to Vercel.
2. Select the `Vite` project preset.
3. Configure the Root Directory parameter to `frontend` if the workspace is in a sub-folder.
4. Add the Environmental Variable `VITE_API_BASE` pointing to your deployed backend domain (e.g. `https://my-backend-app.onrender.com/api`).
5. Click **Deploy**.
