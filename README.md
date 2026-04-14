# Event Booking System

A full-stack event booking application built with **Express.js**, **MongoDB**, and **React**.

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **Security:** Helmet, CORS, Rate Limiting, Mongo Sanitize
- **File Upload:** Multer
- **Email:** Nodemailer

### Frontend
- **Library:** React 19
- **Bundler:** Vite
- **Styling:** Tailwind CSS 4
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Notifications:** React Hot Toast
- **QR Code:** qrcode.react

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### Installation

1. **Server setup:**
```bash
cd server
npm install
```

2. **Client setup:**
```bash
cd client
npm install
```

3. **Environment variables:**
   - Copy `server/.env` and fill in your own values

### Running the App

**Development mode:**
```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

Server runs on `http://localhost:5000`
Client runs on `http://localhost:5173`
