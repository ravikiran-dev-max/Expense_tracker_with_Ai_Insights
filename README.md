# SpendWise: MERN Expense-Tracker with AI Insights

SpendWise is a premium personal financial tracking dashboard designed to simplify logging transactions, monitoring monthly budgets, and obtaining intelligent advice. It utilizes a MERN stack (MongoDB, Express, React, Node.js) with client-side OCR scanners (Tesseract.js) and integrates AI financial analytics powered by Google Gemini and local Ollama nodes.

---

## System Architecture & Data Flow

Below is the design detailing how the frontend client, backend server, database, and AI engines interface:

```mermaid
graph TD
    subgraph Client Application (Vite + React)
        UI[User Dashboard & Forms]
        Tess[Tesseract.js OCR Engine]
        AContext[Auth & Alert Contexts]
    end

    subgraph API Gateway (Express.js)
        Server[Express App Server]
        AuthMid[Auth Guard Middleware]
        Multer[Multer File Upload]
    end

    subgraph Database & Cloud Storage
        DB[(MongoDB Atlas / Local)]
        Cloud[Cloudinary CDN]
    end

    subgraph Artificial Intelligence
        Gemini[Google Gemini API]
        Ollama[Ollama Local LLM]
        Fallback[Local Aggregations Engine]
    end

    UI -->|OCR Image Scanner| Tess
    Tess -->|Prefills| UI
    UI -->|API Requests + JWT| AContext
    AContext -->|HTTP / HTTPS| Server
    Server --> AuthMid
    AuthMid -->|DB Queries| DB
    Server -->|Multipart Avatars| Multer
    Multer -->|Saves Temp & Uploads| Cloud
    Cloud -->|Returns Secure URL| Server
    Server -->|Financial Analysis Prompts| Gemini
    Server -->|Local LLM Prompts| Ollama
    Server -->|Heuristics Failback| Fallback
```

---

##  Key Features

1. **Transaction Ledger & CRUD**: Clean list of incomes and expenses with category divisions, chronological logs, search tools, and filters.
2. **Dynamic Data Visualizations**: Interactive cashflow timeline graphs (Recharts Area/Line/Bar charts) and categorical distribution pie breakdowns.
3. **Smart Budget Notifications**: Real-time evaluation of monthly spending limits. Generates inbox warning alerts when expenses exceed 80% and 100% budget capacities.
4. **Optical Receipt Scanner (OCR)**: Scans transaction receipts client-side using Tesseract.js. It automatically extracts merchant titles, dates, amounts, and category mappings to prefill forms.
5. **AI Financial Diagnostics**: Analyzes transactions using Google Gemini or Ollama models. Generates detailed risk alerts, predictive cash forecasts, and suggested corrections.
6. **Dynamic Avatar Handling**: Configures file uploads locally or via Cloudinary CDN depending on active environmental parameters.

---

##  Project Structure

This project is organized into two primary folders: backend foleder and frontend folerder

**backend-|
          |-config - |-cloundinary.js
          |          |-db.js
          |
          |-controllers-|-aiControllers.js
                        |-authController.js
                        |-notificationController.js
                        |-transactionContrller.js
          |-middleware-|-authmiddleware.js
          |-models-|-Notification.js
                   |-Transaction.js
                   |-User.js
          |-routes(routes of api)-|-airoutes.js
                                  |-authRoutes.js
                                  |-notificationRoutes.js
                                  |-reportRoutes.js
                                  |-transactionRoutes.js
 **frontend-|-
            |
            |
            |




---   

##  Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- MongoDB installed locally or a MongoDB Atlas Database cluster
- Optional:  Ollama running locally

### Local setup

1. Clone the repository
2. **Setup Backend**:
   -
     cd backend
     npm install
     npm run dev
     ```
3. **Setup Frontend**:
   - install dependencies.
   - Run the client bundle development server:
     ```bash
     cd ../frontend
     npm install
     npm run dev
     ```

---


