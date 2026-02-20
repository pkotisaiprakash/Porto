# Free Deployment Guide

This guide covers deploying your Portfolio Builder application for free using various hosting platforms.

## Recommended Free Hosting Options

| Platform | Backend | Database | Free Limits |
|----------|---------|----------|-------------|
| [Render](#render) | ✅ | ✅ (Redis) | 750 hrs/month |
| [Railway](#railway) | ✅ | ✅ (MongoDB) | $5 credit/month |
| [Cyclic](#cyclic) | ✅ | ❌ | 100K requests/month |
| [Fly.io](#flyio) | ✅ | ✅ | 3 apps, 160GB outbound |

## Option 1: Deploy with Render (Recommended)

Render offers both backend hosting and MongoDB database for free.

### Backend Deployment

1. **Push your code to GitHub** (see README.md)

2. **Create a Render account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

3. **Create a Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: portfolio-builder-api
     - **Root Directory**: backend
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

4. **Add Environment Variables**
   - Add the following in the Render dashboard:
   ```
   MONGO_URI: your_mongodb_connection_string
   JWT_SECRET: generate_a_secure_random_string
   JWT_EXPIRE: 7d
   PORT: 5000
   NODE_ENV: production
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

### Database (MongoDB)

1. **Use MongoDB Atlas** (Free Tier)
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
   - Create a free account
   - Create a free cluster
   - Get your connection string
   - Add to Render environment variables

---

## Option 2: Deploy with Railway

Railway provides easy deployment with $5/month free credit.

### Backend Deployment

1. **Push your code to GitHub**

2. **Create Railway account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

3. **Deploy Backend**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Set root directory to `backend`
   - Add environment variables:
     ```
     MONGO_URI: your_mongodb_connection_string
     JWT_SECRET: generate_a_secure_random_string
     JWT_EXPIRE: 7d
     PORT: 5000
     NODE_ENV: production
     ```

4. **Deploy**

### Database

1. **Add MongoDB Plugin**
   - In your project, click "New" → "Database" → "MongoDB"
   - Railway will provide the connection string
   - Copy it to your backend environment variables

---

## Option 3: Deploy Frontend to Vercel

Vercel offers excellent free hosting for React/Vite apps.

1. **Push your code to GitHub**

2. **Create Vercel account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

3. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Build Command**: `npm run build` or `vite build`
     - **Output Directory**: `dist`

4. **Environment Variables**
   - Add:
     ```
     VITE_API_URL: https://your-backend-url.onrender.com/api
     ```

5. **Deploy**

---

## Option 4: Full Stack on Cyclic

Cyclic can host the entire app (frontend + backend) together.

1. **Push your code to GitHub**

2. **Modify for Single Deployment**
   - Create a `server.js` in root that serves both:
   ```javascript
   // Root server.js
   const express = require('express');
   const path = require('path');
   
   const app = express();
   
   // Serve static files from frontend/dist
   app.use(express.static(path.join(__dirname, 'frontend/dist')));
   
   // API routes (import from backend)
   // ... include your backend routes here
   
   // Serve React app for all other routes
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
   });
   
   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
   ```

3. **Deploy to Cyclic**
   - Go to [cyclic.sh](https://cyclic.sh)
   - Sign up with GitHub
   - Connect your repository
   - Add environment variables in Cyclic dashboard

---

## Option 5: Separate Deployments

### Backend → Render
### Frontend → Netlify or Vercel

#### Frontend on Netlify

1. Go to [netlify.com](https://netlify.com)
2. Sign up with GitHub
3. "Add new site" → "Import an existing project"
4. Select your repository
5. Configure:
   - **Base directory**: frontend
   - **Build command**: npm run build
   - **Publish directory**: dist
6. Add environment variable:
   - `VITE_API_URL`: your-backend-url.onrender.com/api
7. Deploy

---

## Environment Variables Summary

### Backend (.env)

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/portfolio-builder
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=production
```

### Frontend (.env)

```env
VITE_API_URL=https://your-backend-service.onrender.com/api
```

---

## Updating API URL in Frontend

After deploying the backend, update the frontend to point to your production API:

1. If using Vercel/Netlify: Add `VITE_API_URL` in the dashboard (e.g. `https://porto-okmw.onrender.com/api`)
2. The frontend reads this variable at build time; the code automatically appends `/api` if you forget it. See `frontend/src/services/api.js` for details.

```javascript
// normalization ensures there is always a trailing `/api` segment:
let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (!API_URL.endsWith('/api')) {
  API_URL = API_URL.replace(/\/+$/, '') + '/api';
}
```
---

## Common Issues

### CORS Errors
If you get CORS errors in production:
- Update CORS configuration in `backend/server.js`:
```javascript
app.use(cors({
  origin: ['https://your-frontend.vercel.app'],
  credentials: true
}));
```

### MongoDB Connection Timeout
- Ensure your MongoDB IP whitelist includes all IPs (for testing)
- Use MongoDB Atlas Network Access to allow all IPs

### Static Files Not Loading
- Ensure `backend/uploads` is accessible or use cloud storage (AWS S3, Cloudinary)

---

## Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas account created
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel/Netlify
- [ ] Environment variables configured
- [ ] CORS updated with frontend URL
- [ ] Test the deployed application

---

## Alternative: Use Coolify (Self-Hosted)

If you have a VPS, Coolify provides free self-hosted deployment:

1. Install Coolify on your server
2. Connect your GitHub repository
3. Set up MongoDB (via Coolify)
4. Deploy both frontend and backend

---

For more help, check the main [README.md](./README.md)
