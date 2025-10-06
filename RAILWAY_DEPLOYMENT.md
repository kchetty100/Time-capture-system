# 🚀 Railway Deployment Guide

## Quick Deploy to Railway

### 1. Connect to Railway
1. Go to [railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `Time-capture-system` repository

### 2. Configure Environment Variables
In Railway dashboard, go to your project → Variables tab and add:

```
NODE_ENV=production
SESSION_SECRET=your-super-secure-random-string-here
DB_PATH=/app/data/reverside_time_tracker.db
```

**Important:** Generate a strong SESSION_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Deploy
Railway will automatically:
- ✅ Install dependencies (`npm install`)
- ✅ Run database migrations
- ✅ Start the application
- ✅ Provide a public URL

### 4. Access Your App
- Railway will give you a URL like: `https://your-app-name.railway.app`
- The app will be available immediately!

## 🔧 Production Features

### Automatic Database Setup
- Database migrations run automatically on startup
- SQLite database is persistent across deployments
- Data directory is created automatically

### Security Features
- HTTPS enabled in production
- Secure session cookies
- CSRF protection
- XSS protection

### Monitoring
- Railway provides built-in logs
- Health checks enabled
- Automatic restarts on failure

## 📊 Admin Access

**Default Admin Credentials:**
- Email: `admin@reverside.com`
- Password: `admin123`

**Change these immediately after first login!**

## 🔄 Updates

To update your app:
1. Push changes to your GitHub repository
2. Railway automatically redeploys
3. Database migrations run automatically

## 🆘 Troubleshooting

### Common Issues:

**Database Errors:**
- Check that migrations ran successfully in logs
- Verify SESSION_SECRET is set

**App Won't Start:**
- Check Railway logs for errors
- Verify all environment variables are set
- Ensure port 3000 is used (Railway sets PORT automatically)

**Session Issues:**
- Make sure SESSION_SECRET is set and consistent
- Check that cookies are working in your browser

## 📈 Scaling

Railway automatically handles:
- Load balancing
- SSL certificates
- Domain management
- Performance monitoring

For high traffic, consider upgrading to Railway Pro plan.

---

**Need Help?** Check Railway's documentation or contact support through their dashboard.
