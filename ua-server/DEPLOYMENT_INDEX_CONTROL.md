# Index Control During Deployment

This guide explains how to control the index behavior when deploying to production.

## Three Options

### Option 1: Continue from Last Index (Default) ✅
**Behavior**: Continues from where you left off (last index in Redis)

**How to set:**
- Don't set any environment variable, OR
- Set: `RESET_INDEX=false` in Vercel Dashboard

**When to use:**
- Normal deployments
- Don't want to lose progress
- Continue serving sequentially

---

### Option 2: Restart from Index 1 🔄
**Behavior**: Resets the index to 1 on next request after deployment

**How to set:**
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add new variable:
   - **Name**: `RESET_INDEX`
   - **Value**: `true`
   - **Environment**: Select `Production` (or `Preview`/`Development` as needed)
3. Click **Save**
4. Redeploy your project

**Alternative:**
- Use variable name: `RESTART_INDEX=true` (both work the same)

**When to use:**
- Starting fresh after updating user agent list
- Testing from beginning
- Resetting sequence

**Important**: After first request, this variable is no longer needed. You can remove it or set it to `false` to continue normally.

---

### Option 3: Start from Custom Index 🎯
**Behavior**: Starts from a specific index (e.g., 250) on next request after deployment

**How to set:**
1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add new variable:
   - **Name**: `START_INDEX`
   - **Value**: `250` (or any number between 1 and total count)
   - **Environment**: Select `Production` (or `Preview`/`Development` as needed)
3. Click **Save**
4. Redeploy your project

**When to use:**
- Starting from a specific point
- Resuming from a known index
- Testing middle of sequence

**Important**: 
- Index must be between 1 and total count (e.g., 5000)
- After first request, you can remove this variable to continue normally

---

## Testing Locally

You can test index control using query parameters:

```bash
# Reset to index 1
curl "https://ua-server.vercel.app/api/ua?reset=1"

# Start from custom index (e.g., 100)
curl "https://ua-server.vercel.app/api/ua?start=100"

# Normal request (continue from last)
curl "https://ua-server.vercel.app/api/ua"
```

---

## Step-by-Step: Restart from Index 1

1. **Open Vercel Dashboard** → Your Project (`ua-server`)
2. Go to **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter:
   - Key: `RESET_INDEX`
   - Value: `true`
   - Environment: `Production` (check this)
   - Optional: Also check `Preview` if you want it in preview deployments
5. Click **Save**
6. **Redeploy** your project:
   ```bash
   vercel deploy --prod
   ```
   Or push to GitHub if auto-deploy is enabled
7. **Make one request** to your API:
   ```
   https://ua-server.vercel.app/api/ua
   ```
8. **Remove the variable** (optional):
   - Go back to Environment Variables
   - Delete `RESET_INDEX` or set it to `false`
   - This allows normal continuation after the reset

---

## Step-by-Step: Start from Custom Index

1. **Open Vercel Dashboard** → Your Project (`ua-server`)
2. Go to **Settings** → **Environment Variables**
3. Click **Add New**
4. Enter:
   - Key: `START_INDEX`
   - Value: `250` (your desired starting index)
   - Environment: `Production`
5. Click **Save**
6. **Redeploy** your project
7. **Make one request** - it will start from index 250
8. **Remove the variable** to continue normally after first request

---

## Environment Variables Summary

| Variable | Value | Effect |
|----------|-------|--------|
| (none) | - | Continue from last index (default) |
| `RESET_INDEX` | `true` | Reset to index 1 |
| `RESTART_INDEX` | `true` | Reset to index 1 (same as above) |
| `START_INDEX` | `250` | Start from custom index (250) |
| `RESET_INDEX` | `false` | Continue from last (explicit) |

---

## Important Notes

⚠️ **One-time effect**: These environment variables only affect the **first request** after deployment. After that, normal increment continues.

⚠️ **Variable priority**: If multiple variables are set, priority is:
1. `START_INDEX` (if set, this is used)
2. `RESET_INDEX=true` (if START_INDEX not set)
3. Default behavior (continue from last)

⚠️ **Validation**: Custom `START_INDEX` is automatically clamped between 1 and total count.

⚠️ **Remove after use**: After the reset/start happens, you can remove the environment variable to avoid accidental resets in future deployments.

---

## Example Workflow

**Scenario**: You've updated your user agent list and want to restart from index 1.

1. ✅ Update `ua.json` with new user agents
2. ✅ Set `RESET_INDEX=true` in Vercel environment variables
3. ✅ Deploy to production
4. ✅ Make one API request (index resets to 1)
5. ✅ Remove `RESET_INDEX` variable (optional, but recommended)
6. ✅ Future requests continue sequentially from 1

---

## Troubleshooting

**Q: Index didn't reset?**
- Make sure environment variable is set for correct environment (Production/Preview/Development)
- Redeploy after adding the variable
- Check variable name is exactly `RESET_INDEX` or `RESTART_INDEX`

**Q: Want to continue from last after a reset?**
- Remove the `RESET_INDEX` variable
- Or set `RESET_INDEX=false`
- Next request will continue from where it left off

**Q: Can I use both RESET_INDEX and START_INDEX?**
- `START_INDEX` takes priority over `RESET_INDEX`
- Only set one at a time to avoid confusion

