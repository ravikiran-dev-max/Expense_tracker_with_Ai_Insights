# Expense-Tracker Backend API Server

This folder contains the backend RESTful API server for the MERN Expense-Tracker application. It is built using Node.js, Express, MongoDB (Mongoose), and incorporates AI financial insights via Google Gemini or local Ollama instances.

---

##  Folder Structure

```text
backend/
├── config/
│   ├── db.js          # MongoDB Mongoose connection and DNS helper
│   └── cloudinary.js  # Optional Cloudinary image upload SDK config
├── controllers/
│   ├── aiController.js          # AI analytics generator and chatbot responses
│   ├── authController.js        # User authentication and profile editing endpoints
│   ├── notificationController.js# Alert notifications management
│   ├── reportController.js      # Consolidated budget history aggregation logic
│   └── transactionController.js # Transaction CRUD operations and budget checks
├── middleware/
│   └── authMiddleware.js        # Route-level JWT verification helper
├── models/
│   ├── Notification.js # Alert database model
│   ├── Transaction.js  # Financial transaction database model
│   └── User.js         # User registration database model (bcrypt pre-save hook)
├── public/
│   └── uploads/        # Local disk storage folder for user avatar image uploads
├── routes/
│   ├── aiRoutes.js           # AI and Chat routes mapping
│   ├── authRoutes.js         # User Auth routes mapping (signup, login, profile, avatar)
│   ├── notificationRoutes.js # Alerts and notification routes mapping
│   ├── reportRoutes.js       # Financial aggregation reports routes mapping
│   └── transactionRoutes.js  # Transaction operations routes mapping
├── .env.example        # Reference environmental configuration variables template
├── .gitignore          # Backend file exclusion patterns
├── package.json        # Project metadata, scripts, and package dependencies
└── server.js           # Core backend entry file (Express server setup)
```

---

##  Tech Stack & Key Dependencies

- **Runtime Environment**: Node.js (v18+)
- **Server Framework**: Express.js (v4.19.2)
- **Database Model Engine**: Mongoose (v8.3.0) for MongoDB
- **AI Services**:
  - Google Gemini API (`@google/generative-ai` v0.21.0)
  - Ollama API (Llama 3/Local LLMs)
- **Authentication**: JWT (`jsonwebtoken` v9.0.2) & encryption (`bcryptjs` v2.4.3)
- **File Uploads**: `multer` (v1.4.5-lts.1) for handling multipart image data
- **Cloud Storage**: `cloudinary` (v2.0.0) for persistent image hosting
- **Utility Modules**: `cors`, `dotenv`, and `nodemon` (development daemon)

---

##  Environment Variables Configuration

Create a `.env` file in the root of this `backend` folder. Reference the variables defined below (and in [.env.example](file:///c:/Users/ravik/OneDrive/Desktop/3rdweek/Expense-Tracker/backend/.env.example)):

```ini
# Server Setup
PORT=5000
NODE_ENV=development

# Database Connection (Local MongoDB or MongoDB Atlas cluster connection string)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/ExpenseTracker?retryWrites=true&w=majority

# Authentication Secrets
JWT_SECRET=YOUR_SUPER_SECRET_JWT_SIGNING_KEY_32_CHARS

# AI Service Provider:  'ollama'
AI_PROVIDER=olama

---

## Local Installation & Setup

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` configuration file based on `.env.example`.
4. Run the API server in development mode (launches hot-reloads using `nodemon` on Port 5000 or fallback 5010):
   ```bash
   npm run dev
   ```
5. Run the production build startup command:
   ```bash
   npm start
   ```

---

## API Route Reference

All routes are prefixed with `/api`.

### 1. Authentication (`/api/auth`)
| HTTP Method | Route Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/signup` | Public | Create a user account |
| **POST** | `/login` | Public | Verify details and return JWT token |
| **GET** | `/profile` | Private | Fetch user settings and details |
| **PUT** | `/profile` | Private | Update user details (username, monthly budget limit) |
| **PUT** | `/password` | Private | Securely update password |
| **PUT** | `/avatar` | Private | Upload and update profile image |

### 2. Transactions (`/api/transactions`)
| HTTP Method | Route Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Private | Retrieve all transactions (latest first) |
| **POST** | `/` | Private | Add a transaction record (evaluates budget) |
| **GET** | `/:id` | Private | Fetch a single transaction detail |
| **PUT** | `/:id` | Private | Edit a transaction |
| **DELETE**| `/:id` | Private | Remove a transaction record |

### 3. Reports (`/api/reports`)
| HTTP Method | Route Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/summary` | Private | Get spending grouped by month and categories |

### 4. Notifications (`/api/notifications`)
| HTTP Method | Route Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Private | Retrieve user warnings and budget alerts |
| **PUT** | `/read-all` | Private | Clear all notifications as read |
| **PUT** | `/:id/read` | Private | Mark a specific notification read by ID |

### 5. AI financial services (`/api/ai`)
| HTTP Method | Route Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/analytics` | Private | Fetch AI-driven insights (Gemini/Ollama/Fallback) |
| **POST** | `/chat` | Private | Submit prompt to AI financial chatbot |

---

