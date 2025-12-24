<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1fkmd4YUU-vnPzd8yEbSDkV_f5q2cA8dp

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEYS=your-api-key-1,your-api-key-2,your-api-key-3
   ```
   
   **Note:** You can use multiple API keys separated by commas for better token distribution and fallback support.

3. Run the app:
   ```bash
   npm run dev
   ```

## Deploy on Vercel

### Step 1: Push to GitHub

1. Make sure `.env.local` is in `.gitignore` (it should be by default)
2. Commit and push your code to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

### Step 2: Deploy on Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. **Important:** Before deploying, add your environment variables:
   - Go to **Settings** → **Environment Variables**
   - Add a new variable:
     - **Name:** `GEMINI_API_KEYS` (exact name, case-sensitive!)
     - **Value:** `your-api-key-1,your-api-key-2,your-api-key-3` (no spaces, separated by commas)
     - **Environment:** Select all (Production, Preview, Development)
   - Click **Save**
   - **Important:** After adding env vars, you MUST redeploy for them to take effect!

5. **Build Settings** (Vercel should auto-detect, but verify):
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

6. Click **Deploy**

**Note:** The `vercel.json` file is already configured to handle SPA routing correctly.

### Troubleshooting

**If you get 404 errors:**
- Make sure `vercel.json` is committed to your repository
- Check that the build completes successfully in Vercel logs

**If API calls fail:**
- Verify `GEMINI_API_KEYS` is set correctly in Vercel (Settings → Environment Variables)
- Check the build logs - you should see: `🔑 Building with API keys: AIzaSy...`
- **Redeploy after adding/changing environment variables** - they only apply to new deployments
- Make sure the environment variable name is exactly `GEMINI_API_KEYS` (case-sensitive)
- Check browser console for error messages about missing API keys

### Security Notes

✅ **Safe to commit:**
- `.env.example` (template file)
- All source code (no API keys hardcoded)
- `.gitignore` (ensures `.env.local` is excluded)

❌ **Never commit:**
- `.env.local` (contains your actual API keys)
- Any file with actual API keys

Your API keys are now secure and will only be available in Vercel's environment variables, not in your GitHub repository!
