# BossuData Reselling Platform

A premium data reselling platform integrated with Bossu Data Hub API.

## Features
- **Real-time Data Purchase**: Fast and reliable data delivery.
- **Wallet Management**: Users can track their balance and transaction history.
- **Premium UI**: Modern dark mode with glassmorphism and smooth animations.
- **Multi-Network Support**: MTN, Vodafone, and AirtelTigo.

## Tech Stack
- **Frontend**: React, Vite, Framer Motion, Lucide Icons, Axios.
- **Backend**: Node.js, Express, MongoDB, Mongoose.
- **Authentication**: JWT (JSON Web Tokens) with Bcrypt password hashing.

## Setup Instructions

### Backend
1. `cd server`
2. `npm install`
3. Create `.env` with:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   BOSSU_API_KEY=your_api_key
   BOSSU_API_URL=https://bossudatahub.com/api.php
   JWT_SECRET=your_jwt_secret
   ```
4. `npm start` (or `nodemon index.js`)

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## API Documentation
Integrated with Bossu Data Hub API. Refer to [https://bossudatahub.com/api-docs](https://bossudatahub.com/api-docs) for details.
