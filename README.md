# Trace: Digital Asset Authentication

**Trace** is a high-fidelity digital asset authentication and document signing platform. It provides an immutable ledger of all actions taken on a document, ensuring transparency, security, and an ironclad audit trail for any digital asset.

## Live Demo

Trace is currently live at [https://trace-ten-delta.vercel.app/](https://trace-ten-delta.vercel.app/).

## 🚀 Tech Stack

### Frontend
- **Framework**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [React Context API](https://react.dev/learn/passing-data-deeply-with-context)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Notifications**: [Sonner](https://sonner.stevenly.me/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Storage**: Supabase Storage
- **File Upload**: [Multer](https://github.com/expressjs/multer)
- **Password Hashing**: [bcryptjs](https://github.com/dcodeIO/bcrypt.js)

---

## ✨ Features

### 🛠️ Core Functionality
- **Secure Authentication**: Robust Sign Up and Sign In system using JWT and bcrypt.
- **Document Repository**: Upload and manage PDF assets with real-time status tracking.
- **Internal Signing**: Securely sign documents using saved or custom-drawn signatures.
- **Public Signature Requests**: Generate secure, tokenized links for external parties to sign documents.
- **Secure Downloads**: Export both original and signed versions of your assets.

### 🎨 UX & Visual Fidelity
- **Premium Dashboard**: Real-time overview of your assets with dynamic statistics and interactive cards.
- **Immutable Ledger**: A dedicated Audit Trail for every document, featuring glassmorphism and smooth staggered animations.
- **High-Fidelity Transitions**: Fluid interactions powered by Framer Motion and modern Tailwind CSS v4.
- **System Integrity**: Smart error boundaries and global notification system for a stable user experience.

---

## 📄 API Documentation

### 🔐 Authentication
- `POST /api/auth/signup`: Register a new account.
- `POST /api/auth/signin`: Authenticate and receive a JWT.
- `GET /api/auth/me`: Get current user profile (Requires Auth).

### 📂 Documents
- `GET /api/documents`: List all user documents (Requires Auth).
- `POST /api/documents`: Upload a new PDF asset (Requires Auth).
- `GET /api/documents/:id`: Get specific document details (Requires Auth).
- `DELETE /api/documents/:id`: Delete an asset (Requires Auth).
- `GET /api/documents/:id/download/original`: Download the raw PDF (Requires Auth).
- `GET /api/documents/:id/download/signed`: Download the signed version (Requires Auth).
- `GET /api/documents/:token/view`: Publicly view a document via secure token.

### ✍️ Signatures
- `GET /api/signatures/:documentId`: List all signatures for a document (Requires Auth).
- `POST /api/signatures`: Create a signature placeholder (Requires Auth).
- `POST /api/signatures/sign`: Finalize an internal signature (Requires Auth).
- `POST /api/signatures/public`: Create a public signature request (Requires Auth).
- `GET /api/signatures/public/:token`: Retrieve public signature request details.
- `POST /api/signatures/public/:token/finalize`: Finalize a public signature.
- `DELETE /api/signatures/:id`: Delete a signature (Requires Auth).

### 🛡️ Audit
- `GET /api/audit/:documentId`: Retrieve the full audit trail for a document (Requires Auth).

---

## 📁 Project Structure

### Backend (`/backend`)
Core API logic, database integration, and authentication services.

```text
backend
├── src
│   ├── config         # Environment & database configuration
│   ├── controllers    # Request handlers & business logic
│   ├── middlewares    # Auth guards & request processing
│   ├── routes         # API endpoint definitions
│   ├── services       # External integrations (PDF, Storage)
│   └── utils          # Shared helpers (Logger, JWT)
└── package.json
```

### Frontend (`/frontend`)
React-based UI, client-side routing, and component library.

```text
frontend
├── src
│   ├── api            # Backend integration & Axios setup
│   ├── components     # Reusable UI building blocks
│   │   └── ui         # Shadcn/Radix UI primitives
│   ├── hooks          # Custom React hooks (Theme, etc.)
│   ├── layouts        # Page wrappers & structural components
│   ├── lib            # Utility functions & class mergers
│   └── pages          # Application views & route targets
└── package.json
```

---

## 🔑 Environment Variables

### Backend (`/backend/.env`)
- `PORT`: Port to run the server (e.g., `5000`).
- `FRONTEND_URL`: URL of the frontend (e.g., `http://localhost:5173`).
- `JWT_SECRET`: Secret key for JWT signing.
- `SUPABASE_URL`: Your Supabase Project URL.
- `SUPABASE_ANON_KEY`: Your Supabase Anonymous Key.
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key.

### Frontend (`/frontend/.env`)
- `VITE_API_BASE_URL`: URL of the backend API (e.g., `http://localhost:5000`).

---

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/mdfaizan0/trace.git
cd trace
```

### 2. Supabase Setup
- Create a new project on [Supabase](https://supabase.com/).
- **Database**: Run the provided migration SQL (if any) or create tables: `users`, `documents`, `signatures`, `audit_logs`.
- **Storage**: Create a public bucket (e.g., `documents`) in Supabase Storage.
- **Keys**: Copy your URL and Keys into the backend `.env`.

### 3. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

Thank You 💚