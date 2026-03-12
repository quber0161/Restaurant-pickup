# Push to a New GitHub Repository

Follow these steps to publish your Restaurant Pickup project to a **new** GitHub repository.

## 1. Create a new repository on GitHub

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon (top right) → **New repository**
3. Name it (e.g. `restaurant-pickup`)
4. Set visibility to **Public**
5. **Do NOT** add a README, .gitignore, or license (you already have these)
6. Click **Create repository**

## 2. Initialize Git and push (from your project folder)

Open a terminal in the `Restaurant-pickup` folder and run:

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# First commit
git commit -m "Initial commit: Restaurant pickup app"

# Add your new GitHub repo as remote (replace YOUR_USERNAME and REPO_NAME with yours)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 3. Environment variables (for deployment)

Your `.env` file is **not** pushed (it's in `.gitignore`). When deploying:

- **Render (backend):** Add env vars in Render Dashboard → Environment
- **Vercel (frontend):** Add env vars in Vercel Dashboard → Settings → Environment Variables

Required variables: `MONGODB_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `EMAIL_USER`, `EMAIL_PASS`, `SUPERADMIN_EMAIL`, `SUPERADMIN_PASSWORD`, `FRONTEND_URL`.

## 4. Production URLs

- **Frontend:** https://restaurant-pickup-psi.vercel.app (or your Vercel URL)
- **Backend:** https://restaurant-pickup-1.onrender.com (or your Render URL)

Set `FRONTEND_URL` on Render to your Vercel URL so Stripe redirects and emails work.
