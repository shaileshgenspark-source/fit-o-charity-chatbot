# 🚀 Fit-O-Charity Chatbot - Deployment Guide

A step-by-step guide to deploy your Fit-O-Charity chatbot for **FREE** on Vercel or Netlify.

---

## 📋 Pre-requisites

Before deploying, you need:
1. ✅ A **GitHub account** (free) - [Sign up here](https://github.com/signup)
2. ✅ A **Gemini API Key** (free) - [Get it here](https://aistudio.google.com/apikey)
3. ✅ Your code ready (we'll prepare this below)

---

## 🔧 Step 1: Prepare Your Code

First, let's make sure the build works locally:

```bash
# Navigate to your project
cd /home/wadhawaniya/rag-file-search/ask-the-manual

# Build the project
npm run build
```

If the build succeeds, you'll see a `dist` folder created.

---

## 📦 Step 2: Push Code to GitHub

### If you don't have Git initialized:

```bash
# Initialize git repository
cd /home/wadhawaniya/rag-file-search/ask-the-manual
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Fit-O-Charity Chatbot"
```

### Create a new repository on GitHub:

1. Go to [github.com/new](https://github.com/new)
2. Name it: `fit-o-charity-chatbot`
3. Keep it **Public** (free) or Private
4. DON'T initialize with README
5. Click **Create repository**

### Push your code:

```bash
# Add GitHub as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/fit-o-charity-chatbot.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🟢 Option A: Deploy on Vercel (Recommended - Easier)

### Step 1: Sign up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub

### Step 2: Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Find your `fit-o-charity-chatbot` repository
3. Click **"Import"**

### Step 3: Configure Build Settings

Vercel should auto-detect Vite, but verify these settings:

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### Step 4: Add Environment Variables (Important!)

1. Expand **"Environment Variables"** section
2. Add the following:

| Name | Value | Description |
|------|-------|-------------|
| `VITE_GEMINI_API_KEY` | `AIzaSy...` | Your Gemini API Key |
| `VITE_RAG_STORE_NAME` | `fileSearchStores/...` | The Knowledgebase ID (See below) |

> **How to get the Knowledgebase ID?**
> 1. Run the app locally (`npm run dev`)
> 2. Go to **Admin Panel** → Upload your documents
> 3. Copy the ID from the **"Save for Everyone"** section
> 4. Paste it as `VITE_RAG_STORE_NAME` in Vercel

> ⚠️ **Keep this secret!** Never share your API key publicly.

### Step 5: Deploy!

1. Click **"Deploy"**
2. Wait 1-2 minutes for build
3. 🎉 Your app is live at: `https://your-project.vercel.app`

---

## 🔵 Option B: Deploy on Netlify

### Step 1: Sign up for Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click **"Sign up"**
3. Choose **"GitHub"**
4. Authorize Netlify to access your GitHub

### Step 2: Import Your Project

1. Click **"Add new site"** → **"Import an existing project"**
2. Choose **"Deploy with GitHub"**
3. Select your `fit-o-charity-chatbot` repository

### Step 3: Configure Build Settings

| Setting | Value |
|---------|-------|
| Branch to deploy | `main` |
| Build command | `npm run build` |
| Publish directory | `dist` |

### Step 4: Add Environment Variable

1. Click **"Show advanced"** → **"New variable"**
2. Add:

| Key | Value | Description |
|-----|-------|-------------|
| `VITE_GEMINI_API_KEY` | `AIzaSy...` | Your Gemini API Key |
| `VITE_RAG_STORE_NAME` | `fileSearchStores/...` | The Knowledgebase ID (from Admin Panel) |

### Step 5: Deploy!

1. Click **"Deploy site"**
2. Wait 1-2 minutes
3. 🎉 Your app is live at: `https://random-name.netlify.app`

### (Optional) Custom Domain Name

1. Go to **"Domain settings"**
2. Click **"Options"** → **"Edit site name"**
3. Change to: `fit-o-charity` (becomes `fit-o-charity.netlify.app`)

---

## 🔐 Security Notes

### Your API Key is Safe Because:

1. ✅ **Environment variables** on Vercel/Netlify are encrypted
2. ✅ They are injected at **build time**, not visible in source code
3. ✅ Users can't see them in browser developer tools
4. ❌ **BUT**: API calls still go from user's browser to Google

### For Extra Security (Optional):

Consider setting up API key restrictions in Google Cloud Console:
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your API key
4. Under **Application restrictions**, add your deployed URL

---

## 🔄 Updating Your App

After making changes locally:

```bash
# Stage and commit changes
git add .
git commit -m "Update: description of changes"

# Push to GitHub
git push
```

**Vercel/Netlify will automatically redeploy!** 🚀

---

## 🆘 Troubleshooting

### Build fails?

```bash
# Try building locally first
npm run build

# Check for TypeScript errors
npm run build 2>&1 | head -50
```

### API key not working?

1. Check if `VITE_GEMINI_API_KEY` is spelled correctly
2. Make sure there are no spaces around the key
3. Redeploy after adding the environment variable

### Blank page after deploy?

1. Check browser console for errors (F12)
2. Ensure `dist` folder is set as publish directory
3. Check that all imports have correct paths

---

## 📱 Share Your App!

Once deployed, share these links:

- **For Users**: `https://your-app.vercel.app`
- **For Admins**: `https://your-app.vercel.app` → Click 🔐 Admin → PIN: 1234

---

## 💡 Quick Summary

| Platform | Free Tier | Build Time | Custom Domain |
|----------|-----------|------------|---------------|
| **Vercel** | 100GB bandwidth/month | ~1 min | ✅ Free |
| **Netlify** | 100GB bandwidth/month | ~1 min | ✅ Free |

Both are excellent choices for hosting your Fit-O-Charity chatbot! 🎉
