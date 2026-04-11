# Deployment Guide (Render)

This platform is ready for deployment on **Render.com**. Follow these steps to set up your production environment.

## 1. Backend Deployment (Node.js Service)
- **Service Type**: Web Service
- **Root Directory**: `.` (leave as default)
- **Build Command**: `npm run build:server`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `MONGODB_URI`: Your MongoDB Compass/Atlas connection string.
  - `JWT_SECRET`: A long random string for security.
  - `PAYSTACK_SECRET_KEY`: Your production Secret Key from Paystack.
  - `BOSSU_API_URL`: `https://bossudata.com/api/` (or your provider's URL).
  - `BOSSU_API_KEY`: Your provider api key.
  - `FRONTEND_URL`: The URL of your deployed frontend (e.g., `https://bossdata.onrender.com`).
  - `NODE_ENV`: `production`

## 2. Frontend Deployment (Static Site)
- **Service Type**: Static Site
- **Root Directory**: `.` (leave as default)
- **Build Command**: `npm run build:webapp`
- **Publish Directory**: `webapp/dist`
- **Environment Variables**:
  - `VITE_API_URL`: The URL of your deployed **Backend Service** (e.g., `https://bossdata-api.onrender.com/api`).

## 3. Post-Deployment
- Ensure you update the **Webhook URL** in your Paystack dashboard to point to your new production backend: `https://your-backend.onrender.com/api/payment/webhook`.
- Update your provider callback URLs if necessary.

---
*Note: I have centralized the API configuration in `webapp/src/api/config.js` so it automatically picks up the `VITE_API_URL` variable.*
