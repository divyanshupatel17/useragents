# User Agent Server

A serverless API that provides sequential user agents (UAs) on-demand. The project generates user agents locally, uploads them to Vercel, and serves them with persistent indexing.

---

## 📊 Current Status

**Last Updated**: `2025-11-01`  
**Total User Agents**: `5,000`  
**Current Index**: `1` 

> 💡 **Note**: Update these values in this README when deploy to production. The current index should match your Redis database state.

---

## 👤 Author

**Divyanshu Patel**  
📧 Email: [itzdivyanshupatel@gmail.com](mailto:itzdivyanshupatel@gmail.com)

---

## 📄 License & Credits

**This project is open for all!** Feel free to use, modify, and distribute it for any purpose.

**Please give credit** when using this project in your work. A simple attribution is appreciated:

```
Credits: User Agent Server by Divyanshu Patel
```

---

## ❓ Questions?

If you have any questions, suggestions, or need help with this project, feel free to reach out:

- 📧 **Email**: [itzdivyanshupatel@gmail.com](mailto:itzdivyanshupatel@gmail.com)
- 👤 **Author**: Divyanshu Patel

Don't hesitate to ask! 🚀

---

## Project Structure

```
USERAGENTS/
├── useragent-generate/    # Local UA generation script
│   └── generate-ua.py     # Python script to generate UAs
├── ua-server/             # Vercel serverless API
│   ├── api/
│   │   └── ua.js          # API endpoint handler
│   ├── data/
│   │   └── ua.json        # Generated user agents data
│   └── package.json       # Server dependencies
└── README.md              # This file
```

## How It Works

1. **Generate User Agents**: Run the Python script locally to generate user agents
2. **Upload to Vercel**: Deploy the `ua-server` folder to Vercel
3. **API Request**: Your app calls the API endpoint
4. **Sequential Delivery**: Server returns the next UA and increments the index
5. **Persistent State**: Index is stored in Vercel KV to maintain state across requests

## Setup Steps

### 1. Generate User Agents

```bash
cd useragent-generate
python generate-ua.py
```

- Choose browser type (Chrome, Firefox, Edge, Mix, or All)
- Enter count (default: 1000)
- Output: `latest-useragents.json`

### 2. Prepare Data for Server

Copy the generated JSON to the server:
```bash
# Copy latest-useragents.json to ua-server/data/ua.json
cp useragent-generate/latest-useragents.json ua-server/data/ua.json
```

### 3. Setup Upstash Redis via Marketplace (Required for Persistent Index)

**KV is now available through the Vercel Marketplace via Upstash:**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to **Storage** → **Create New**
3. Select **"Upstash"** from the Marketplace
4. Choose **"Upstash Redis"** (Redis-based key-value store)
5. Follow the prompts to create the Redis database
6. **IMPORTANT**: After creating, connect it to your project:
   - On the Upstash Redis database page, click **"Connect to a project"**
   - Select your **`ua-server`** project
   - Click **"Connect"**
7. Vercel will automatically add environment variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`
   - `REDIS_URL`

**Free Tier (Hobby Plan):**
- ✅ 1 KV database
- ✅ 30,000 requests per month
- ✅ 256 MB storage
- ✅ 256 MB data transfer per month

*Perfect for personal projects and low-traffic apps!*

### 4. Install Dependencies

```bash
cd ua-server
npm install
```

This installs `@upstash/redis` for Redis connectivity.

### 5. Deploy to Vercel

```bash
vercel deploy
```

```bash
vercel deploy --prod
```

Or use Vercel CLI or connect your GitHub repo.

**Note**: The environment variables (`KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc.) are automatically configured by Vercel when you connect the Upstash Redis database to your project.

### 6. Index Control on Deployment (Optional)

When deploying to production, you can control the index behavior:

**Option 1: Continue from Last Index** (Default)
- Don't set any variable
- Index continues from where you left off

**Option 2: Restart from Index 1**
- Set environment variable: `RESET_INDEX=true` in Vercel Dashboard
- See `ua-server/DEPLOYMENT_INDEX_CONTROL.md` for details

**Option 3: Start from Custom Index**
- Set environment variable: `START_INDEX=250` (any number)
- See `ua-server/DEPLOYMENT_INDEX_CONTROL.md` for details

📖 **Full guide**: See `ua-server/DEPLOYMENT_INDEX_CONTROL.md` for step-by-step instructions.

## API Usage

**Endpoint**: `https://ua-server.vercel.app/api/ua`

**Method**: `GET`

**Response**:
```json
{
  "authorisedUserAgent": "Mozilla/5.0 ...",
  "indexReturned": 1,
  "total": 5000,
  "updated": "2025-10-29",
  "browserChoice": "mix"
}
```

Each request returns the next user agent sequentially. Index wraps around after reaching the total.

## Issue Analysis & Fix

### The Problem

**Why the index was resetting:**
1. **Stateless Edge Functions**: Vercel Edge Functions don't maintain state between requests
2. **Multiple Edge Locations**: Your requests can hit different edge locations, each with its own in-memory state
3. **Instance Recycling**: After idle time, edge function instances are killed and restarted, resetting in-memory variables
4. **No Persistence**: The original code used `let currentIndex = 0` which is lost on each restart

**What you observed:**
- Immediate check → Returns next UA (works within the same instance's lifecycle)
- After some time → Starts from 1 again (instance restarted, index reset)

### The Solution

**Upstash Redis (via Vercel Marketplace)**:
- Stores the index in a shared Redis database accessible by all edge locations
- Index persists across function restarts, deployments, and edge locations
- Provides truly global state for your application
- Uses `@upstash/redis` SDK for reliable connectivity
- Free tier includes 30,000 requests/month (perfect for this use case)

**How it works now:**
1. Each API request reads the current index from KV
2. Increments the index and saves it back to KV
3. All edge locations share the same KV store, ensuring consistency

## Troubleshooting

- **Index resets**: Ensure Vercel KV is properly configured with environment variables
- **CORS issues**: Already handled with `Access-Control-Allow-Origin: *`
- **Empty responses**: Check that `ua.json` is properly formatted
# useragents
