# 🚀 Quick Deployment Guide

## Prerequisites
- GitHub account
- Git installed (or GitHub Desktop)

## 🎯 Recommended: Railway + Vercel

### Step 1: Push to GitHub
```bash
# If you have Git installed:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/p2p-file-sharing-app.git
git push -u origin main
```

### Step 2: Deploy Backend (Railway)
1. Go to https://railway.app/
2. Login with GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variable:
   - `FRONTEND_URL` = `https://your-app.vercel.app`

### Step 3: Deploy Frontend (Vercel)
1. Go to https://vercel.com/
2. Login with GitHub
3. "New Project" → Import your repo
4. Settings:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Add environment variable:
   - `REACT_APP_BACKEND_URL` = `https://your-app.railway.app`

### Step 4: Update Railway
1. Go back to Railway
2. Update `FRONTEND_URL` with your actual Vercel URL
3. Redeploy

## 🌐 Your Live Website
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-app.railway.app`

## 🎉 Done!
Your P2P file sharing app is now live on the internet!

## 📱 Share Your App
- Send the Vercel URL to anyone
- They can use it from any device with a modern browser
- Files transfer directly between devices (P2P)
- No registration required!

## 🔧 Custom Domain (Optional)
- **Vercel**: Add custom domain in project settings
- **Railway**: Add custom domain in project settings
- Point your domain's DNS to the provided URLs

## 💡 Tips
- **Free Tiers**: Both Railway and Vercel have generous free tiers
- **Automatic Deploys**: Push to GitHub = automatic deployment
- **HTTPS**: Both platforms provide free SSL certificates
- **Global CDN**: Your app will be fast worldwide