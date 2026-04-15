# Project Environment Variables

Copy these to your Render dashboard or local `.env` files.

## 🟢 Backend (`server/.env`)
These are required for the server to run, connect to the database, and process payments.

| Variable | Description | Example / Required |
| :--- | :--- | :--- |
| **`MONGODB_URI`** | MongoDB connection string | `mongodb+srv://...` |
| **`JWT_SECRET`** | Secret key for login security | `any_long_random_string` |
| **`PAYSTACK_SECRET_KEY`** | Paystack Secret Key | `sk_live_...` or `sk_test_...` |
| **`BOSSU_API_URL`** | Data Provider endpoint | `https://bossudata.com/api/` |
| **`BOSSU_API_KEY`** | Data Provider API key | `your_provider_key` |
| **`FRONTEND_URL`** | Production URL of your site | `https://bossdata.onrender.com` |
| **`ADMIN_URL`** | (Optional) Admin panel URL | `https://bossdata.onrender.com` |
| **`RESEND_API_KEY`** | API Key for Email Service | `re_Tj6d...` |
| **`ADMIN_EMAIL`** | Email to receive fund alerts | `admin@email.com` |
| **`PORT`** | Server port (Render sets this automatically) | `5000` |
| **`NODE_ENV`** | Environment mode | `production` |
| **`CLOUDINARY_CLOUD_NAME`** | Cloudinary Cloud Name | `your_name` |
| **`CLOUDINARY_API_KEY`** | Cloudinary API Key | `your_key` |
| **`CLOUDINARY_API_SECRET`** | Cloudinary API Secret | `your_secret` |

---

## 🔵 Frontend (`webapp/.env` / Render Env)
The frontend only needs to know where the backend is.

| Variable | Description | Example / Required |
| :--- | :--- | :--- |
| **`VITE_API_URL`** | Production URL of your Backend API | `https://bossdata-api.onrender.com/api` |

---

### ⚠️ Important Note:
When deploying to Render:
1.  **Frontend**: Make sure the environment variable starts with `VITE_` (e.g., `VITE_API_URL`), otherwise the browser won't be able to see it.
2.  **Paystack**: In your Paystack dashboard, set your **Webhook URL** to `https://your-api.onrender.com/api/paystack-webhook`.
