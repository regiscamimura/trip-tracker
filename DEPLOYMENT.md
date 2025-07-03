# 🚀 Deployment Guide - Trip Tracker App

This guide will help you deploy your Trip Tracker app to production.

## Architecture Overview

Your app consists of:

- **Frontend**: React app (deployed to Netlify)
- **Backend**: Django API (needs separate hosting)

## Frontend Deployment (Netlify)

### 1. Automatic Deployment (Recommended)

1. **Connect to GitHub**:

   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository
   - Select your repository

2. **Configure Build Settings**:

   - **Base directory**: `frontend`
   - **Build command**: `pnpm build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

3. **Environment Variables**:
   Add these in Netlify dashboard → Site settings → Environment variables:

   ```
   VITE_API_URL=https://your-backend-domain.com
   VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
   ```

4. **Deploy**:
   - Click "Deploy site"
   - Netlify will automatically build and deploy your frontend

### 2. Manual Deployment

If you prefer manual deployment:

```bash
# Build the frontend
cd frontend
pnpm build

# Deploy to Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

## Backend Deployment

Your Django backend needs to be deployed separately. Here are some options:

### Option 1: Railway (Recommended for simplicity)

1. **Connect to Railway**:

   - Go to [Railway](https://railway.app)
   - Connect your GitHub repository
   - Select the `backend` directory

2. **Environment Variables**:

   ```
   DATABASE_URL=your_database_url
   SECRET_KEY=your_secret_key
   DEBUG=False
   ALLOWED_HOSTS=your-domain.railway.app
   ```

3. **Deploy**:
   - Railway will automatically detect Django and deploy

### Option 2: Render

1. **Create a new Web Service**:

   - Go to [Render](https://render.com)
   - Connect your GitHub repository
   - Select "Web Service"

2. **Configure**:
   - **Root Directory**: `backend`
   - **Build Command**: `uv sync && uv run python manage.py migrate`
   - **Start Command**: `uv run gunicorn trips.wsgi:application`

### Option 3: Heroku

1. **Create Heroku app**:

   ```bash
   heroku create your-app-name
   ```

2. **Configure**:

   ```bash
   heroku config:set DEBUG=False
   heroku config:set SECRET_KEY=your_secret_key
   ```

3. **Deploy**:
   ```bash
   git subtree push --prefix backend heroku main
   ```

## Environment Variables

### Frontend (Netlify)

- `VITE_API_URL`: Your backend API URL
- `VITE_MAPBOX_ACCESS_TOKEN`: Mapbox API token for routing

### Backend

- `DATABASE_URL`: Database connection string
- `SECRET_KEY`: Django secret key
- `DEBUG`: Set to `False` in production
- `ALLOWED_HOSTS`: Comma-separated list of allowed domains

## Post-Deployment

1. **Update API URL**: Make sure your frontend's `VITE_API_URL` points to your deployed backend
2. **Test the app**: Verify all features work in production
3. **Set up custom domain** (optional): Configure your domain in Netlify settings

## Troubleshooting

### Common Issues

1. **Build fails**: Check Node.js version and build logs
2. **API calls fail**: Verify `VITE_API_URL` is correct
3. **CORS errors**: Ensure backend allows your Netlify domain
4. **Routing issues**: Check that `_redirects` file is in the `public` folder

### Debugging

- Check Netlify build logs for frontend issues
- Check backend logs for API issues
- Use browser dev tools to debug API calls

## Security Notes

- Never commit API keys or secrets to Git
- Use environment variables for all sensitive data
- Enable HTTPS in production
- Set up proper CORS configuration on backend

---

Need help? Check the [Netlify docs](https://docs.netlify.com) or [Railway docs](https://docs.railway.app).
