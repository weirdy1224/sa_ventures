# HOOOMANS - MERN E-Commerce Platform

![MERN Stack](https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge&logo=mongodb)
![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![Vite](https://img.shields.io/badge/Vite-8.0-purple?style=for-the-badge&logo=vite)

HOOOMANS is a comprehensive, full-stack e-commerce platform built with the MERN stack (MongoDB, Express, React, Node.js). It features a modern, responsive storefront and robust role-based portals for Admins, Staff, and Delivery personnel.

## 🌟 Features

- **Modern UI/UX**: Responsive storefront with a premium visual design, dynamic animations, and dark/light modes.
- **Robust Authentication**: Cookie-based session management (`express-session`), JWT support, and OAuth integrations (`passport`).
- **Role-Based Access Control**: Dedicated dashboards for Admins, Staff, and Delivery personnel.
- **Real-Time Features**: WebSockets (`socket.io`) integration for real-time tracking, notifications, and analytics.
- **Order Management & Tracking**: End-to-end checkout process, interactive map tracking (`leaflet`), and PDF invoice generation.
- **Payments & Notifications**: Razorpay payment gateway integration, email notifications (`nodemailer`), and SMS alerts (`twilio`).
- **Data Visualization**: Rich dashboards with dynamic charts to display traffic, security metrics, and sales (`recharts`).
- **Security Hardened**: Helmet, Express Rate Limit, CORS protection, and secure cookie architecture.

## 🛠 Tech Stack

### Frontend (Client)
- **Framework**: React 19 + Vite
- **Styling**: Vanilla CSS, Framer Motion (Animations)
- **Data Visualization**: Recharts
- **Maps**: Leaflet & React-Leaflet
- **Other**: Axios, React-Router, Socket.io-client

### Backend (Server)
- **Framework**: Node.js with Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: Passport.js (Local & Google OAuth), express-session, Connect-Mongo, bcryptjs
- **Payments**: Razorpay
- **Communications**: Twilio (SMS), Nodemailer (Email)
- **Other**: Socket.io (WebSockets), Node-cron (Task Scheduling), PDFKit (Invoices), multer (File Uploads)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local instance or MongoDB Atlas)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/sa_ventures.git
   cd sa_ventures
   ```

2. **Install Server Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

### Environment Variables

Create a `.env` file in the `server` directory and add the required configuration variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Connection
MONGO_URI=your_mongodb_connection_string

# Authentication Secrets
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Notifications
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password
```

Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5000
```

### Running the Application

**1. Run Backend (Development)**
```bash
cd server
npm run dev
```

**2. Run Frontend (Development)**
```bash
cd client
npm run dev
```

The client will typically start on `http://localhost:5173` and the server on `http://localhost:5000`.

## 📂 Project Structure

```
sa_ventures/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (Storefront, Admin, Staff, etc.)
│   │   ├── assets/         # Images, icons, etc.
│   │   └── index.css       # Global styles and design system
│   └── package.json
└── server/                 # Node.js Backend
    ├── controllers/        # Route logic and request handlers
    ├── models/             # Mongoose database schemas
    ├── routes/             # API endpoints definitions
    ├── middleware/         # Custom Express middleware (auth, error-handling)
    ├── config/             # DB and auth configurations
    └── package.json
```

## 📜 License
This project is licensed under the [ISC](LICENSE) License.
