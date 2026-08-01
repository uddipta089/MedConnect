# MedConnect AI - Production-Grade Healthcare Appointment Platform

MedConnect AI is an enterprise-level healthcare appointment booking platform designed to bridge the gap between patients and doctors through a seamless, intelligent, and real-time cloud solution.

## 🚀 Key Features

*   **Authentication & Authorization:** Secure JWT-based auth with bcrypt hashing and strict Role-Based Access Control (Patient, Doctor, Admin).
*   **Dynamic Appointment System:** Automated slot generation preventing double bookings using MongoDB transactions.
*   **Real-Time Notifications:** Instant Socket.io events for appointment updates and prescription readiness.
*   **Medical Records Management:** Secure upload and access control for lab reports and prescriptions via Cloudinary.
*   **AI Healthcare Assistant:** Google Gemini API integration for symptom checking, medical report summarization, and a wellness chatbot (Note: includes strict medical disclaimers).
*   **Admin Dashboard & Analytics:** Comprehensive platform oversight with aggregations and structured data APIs.
*   **Premium Utilities:** Email notifications (Nodemailer), QR Code Check-In, and Advanced Availability Heatmaps.

## 🏗 Architecture

The platform uses a clean **MVC (Model-View-Controller)** architecture to separate concerns, ensuring high maintainability and scalability.

### Backend (Express.js)
*   **Controllers:** Thin validation and response mapping.
*   **Services:** Heavy business logic (slot generation, transactions, AI prompting).
*   **Models:** Mongoose schemas with strict validations and indexing.
*   **Middlewares:** Custom global error handler, async handler, Zod validators, and JWT role verification.

### Frontend (React.js)
*   **Vite:** Extremely fast builds.
*   **Tailwind CSS:** Professional utility-first styling for premium design aesthetics.
*   **Redux Toolkit & React Query:** State and cache management.
*   **React Router:** Secure routing based on user roles.

## 📂 Folder Structure

```
MedConnect-AI/
├── client/                     # React Frontend App
│   ├── src/                    
│   │   ├── components/         # Reusable UI elements
│   │   ├── pages/              # Role-specific dashboard views
│   │   ├── store/              # Redux slices
│   │   └── App.jsx             
│   ├── package.json            
│   └── vite.config.js          
├── server/                     # Node.js/Express Backend App
│   ├── config/                 # DB config
│   ├── controllers/            # Route controllers
│   ├── middleware/             # Auth, error, validation middlewares
│   ├── models/                 # Mongoose models
│   ├── routes/                 # API endpoint definitions
│   ├── services/               # Business logic and external API integrations
│   ├── socket/                 # Socket.io managers and events
│   ├── utils/                  # Cloudinary, Logger, Response helpers
│   └── server.js               # Entry point
└── README.md                   
```

## 🛠 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   MongoDB Instance (Local or Atlas)
*   Cloudinary Account
*   Google Gemini API Key

### 1. Setup Backend
```bash
cd server
npm install
# Create .env based on .env.example
npm run dev
```

### 2. Setup Frontend
```bash
cd client
npm install
npm run dev
```

## 🌐 Deployment Guide

### Backend (Render)
1. Push your repository to GitHub.
2. In Render, create a new "Web Service" and link your repository.
3. Set the Root Directory to `server`.
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add all Environment Variables exactly as in `.env.example`.
7. Deploy.

### Frontend (Vercel)
1. In Vercel, import your GitHub repository.
2. Set the Root Directory to `client`.
3. Framework Preset: Vite.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variable: `VITE_API_URL` pointing to your Render backend URL.
7. Deploy.

### Database (MongoDB Atlas)
1. Create a cluster in MongoDB Atlas.
2. Whitelist `0.0.0.0/0` in Network Access for deployment.
3. Get the connection string and place it in your backend's `MONGODB_URI` environment variable.

## 🔮 Future Improvements
*   WebRTC Video Consultations integration.
*   Voice Symptom Input.
*   Advanced Health Score Engine algorithms.
*   Mobile Application using React Native.

## 📄 License
This project is for educational and portfolio purposes.
