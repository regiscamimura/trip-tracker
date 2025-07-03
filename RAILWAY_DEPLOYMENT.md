# 🚀 Railway Backend Deployment

Since your frontend is already deployed on Netlify, we just need to deploy the Django backend to Railway.

## 🎯 Why Railway for Backend?

- **Perfect for Django**: No size limitations
- **Easy database setup**: Built-in PostgreSQL
- **Automatic deployments**: Git-based
- **Free tier**: 500 hours/month
- **Simple configuration**: Minimal setup needed

## 📋 Deployment Steps

### Step 1: Deploy to Railway

1. **Go to Railway**: [railway.app](https://railway.app)
2. **Sign up/Login** with GitHub
3. **Create new project** → "Deploy from GitHub repo"
4. **Select your repository**
5. **Set root directory**: `backend`
6. **Railway will automatically detect Django**

### Step 2: Database Setup

**SQLite is used by default** - no additional database setup needed!

- SQLite file is created automatically
- Migrations run automatically on deployment
- Perfect for demo apps

### Step 3: Configure Environment Variables

In Railway dashboard → Variables tab, add:

```bash
SECRET_KEY=your_django_secret_key_here
DEBUG=False
ALLOWED_HOSTS=your-railway-domain.railway.app
```

### Step 4: Update CORS Settings

Update `backend/trip_tracker/settings_production.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "https://your-netlify-app.netlify.app",
    "https://your-custom-domain.com",
]
```

### Step 5: Update Frontend API URL

In your Netlify dashboard, update the environment variable:

```bash
VITE_API_URL=https://your-railway-domain.railway.app
```

## 🔧 Configuration Files

Railway will use these files automatically:

- `backend/railway.json` - Railway configuration
- `backend/requirements.txt` - Python dependencies
- `backend/Procfile` - Process configuration

## 🚀 Quick Deploy

```bash
# Test backend locally first
cd backend
python manage.py check --deploy

# Railway will deploy automatically when you:
# 1. Connect GitHub repo
# 2. Set root directory to 'backend'
# 3. Add environment variables
```

## 🔐 Environment Variables

### Required in Railway:

```bash
SECRET_KEY=your_django_secret_key
DEBUG=False
ALLOWED_HOSTS=your-railway-domain.railway.app
```

### Update in Netlify:

```bash
VITE_API_URL=https://your-railway-domain.railway.app
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

## 🗄️ Database Setup

**SQLite is used by default** - super simple!

- **No setup required** - SQLite file created automatically
- **Migrations run** automatically on deployment
- **Perfect for demos** - no external database needed
- **Data persists** between deployments

## 🔄 Continuous Deployment

- **Automatic**: Every push to main branch deploys
- **Preview deployments**: Pull requests get preview URLs
- **Rollback**: Easy rollback from Railway dashboard

## 💰 Cost

- **Railway**: Free tier (500 hours/month)
- **Netlify**: Already deployed (free tier)
- **Total**: $0/month for small to medium usage

## 🎉 Benefits

1. **Simple**: Just backend deployment
2. **Reliable**: No size limitations
3. **Integrated**: Database included
4. **Scalable**: Easy to upgrade when needed

## 🆘 Troubleshooting

### Common Issues:

1. **Build fails**: Check Railway logs
2. **Database connection**: Verify `DATABASE_URL` is set
3. **CORS errors**: Update `CORS_ALLOWED_ORIGINS`
4. **API not working**: Check Railway deployment logs

### Debug Commands:

```bash
# Check Django deployment
python manage.py check --deploy

# Test database connection
python manage.py dbshell

# Run migrations manually
python manage.py migrate
```

## 🎯 Next Steps

1. **Deploy backend to Railway** (follow steps above)
2. **Update Netlify environment variables** with Railway URL
3. **Test the full application**
4. **Monitor logs** in Railway dashboard

---

🎉 **You're almost there! Just deploy the backend to Railway and you'll have a fully working app!**
