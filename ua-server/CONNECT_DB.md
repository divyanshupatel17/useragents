# How to Connect Upstash Redis to Your Vercel Server

## Step-by-Step Connection Guide

### Step 1: Link Database to Your Project

1. Go to your **Upstash Redis database page** in Vercel Dashboard
2. Look for **"Connect to a project"** section
3. Click **"Connect to a project"** button
4. Select your **`ua-server`** project from the dropdown
5. Click **"Connect"**

This will automatically:
- ✅ Link the database to your project
- ✅ Add environment variables to your Vercel project:
  - `KV_REST_API_URL`
  - `KV_REST_API_TOKEN`
  - `KV_REST_API_READ_ONLY_TOKEN`
  - `REDIS_URL`

### Step 2: Install Dependencies Locally

```bash
cd ua-server
npm install
```

This installs `@upstash/redis` package.

### Step 3: Pull Environment Variables (For Local Testing)

If you want to test locally, pull the environment variables:

```bash
# Make sure you're in the ua-server directory
vercel env pull .env.local
```

This creates a `.env.local` file with all the environment variables for local development.

**Note**: For production, environment variables are automatically available on Vercel.

### Step 4: Deploy to Vercel

```bash
vercel deploy
```

Or if you have it connected to GitHub, just push your code:
```bash
git add .
git commit -m "Add Upstash Redis integration"
git push
```

Vercel will automatically redeploy with the database connected.

### Step 5: Verify Connection

After deployment, test your API:
```
https://ua-server.vercel.app/api/ua
```

You should get a response with the user agent and index. The index should persist across requests now!

---

## Troubleshooting

### Database Not Connected

**Symptoms**: Getting error about missing environment variables

**Solution**:
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Check if these variables exist:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
3. If missing, go back to your Upstash Redis page and click **"Connect to a project"**

### Still Getting Errors

1. **Redeploy after connecting**: After connecting the database, redeploy your project
2. **Check environment variables**: Ensure they're added to Production, Preview, and Development environments
3. **Check logs**: Go to Vercel Dashboard → Your Project → **Deployments** → Click on deployment → **Functions** → Check logs for errors

### Local Development

If testing locally, make sure:
1. You've run `vercel env pull .env.local`
2. Your `.env.local` file exists in `ua-server/` directory
3. You're running the development server properly

---

## Quick Checklist

- [ ] Upstash Redis database created
- [ ] Database connected to `ua-server` project in Vercel
- [ ] Environment variables visible in Vercel project settings
- [ ] `npm install` run successfully
- [ ] Code deployed to Vercel
- [ ] API tested and working
- [ ] Index persists across requests ✅

