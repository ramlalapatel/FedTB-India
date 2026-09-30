# FedTB-India: Privacy-Preserving Tuberculosis Detection

An interactive web platform demonstrating federated deep learning (FedAvg, FedProx, DP-SGD, Secure Aggregation) for chest X-ray tuberculosis detection across Indian hospitals.

---

## 🚀 Instant GitHub Pages Deployment (Direct Live Link)

Ye project GitHub par push karte hi **automatically live link generate** karne ke liye configure kar diya gaya hai.

### Steps:
1. Apne GitHub repository ki **Settings** me jayein:
   - `Settings` ➜ `Pages` (Left sidebar me)
2. **Build and deployment** section ke andar:
   - **Source:** select karein **`GitHub Actions`** (na ki "Deploy from a branch").
3. Ab jaise hi aap code `main` ya `master` branch par push karenge:
   - GitHub Actions automatically build karega (`npm run build`)
   - 1 se 2 minute me aapki live URL generate ho jayegi:
     `https://<your-username>.github.io/<your-repo-name>/`
4. Aap repo ke **Actions** tab me live build and deployment status dekh sakte hain!

---

## ⚡ Alternative Free 1-Click Hosting: Vercel / Render

Agar aapko Gemini API backend features (`/api/analyze-xray`) bhi cloud server pe chalane hain:

### Option A: Vercel (Recommended for frontend + serverless)
1. [vercel.com](https://vercel.com) par login karein.
2. `Add New Project` ➜ Select your GitHub Repository.
3. Environment variable add karein: `GEMINI_API_KEY`
4. Click **Deploy**. Direct URL mil jayegi: `https://your-project.vercel.app`

### Option B: Render.com (Full Node Express Server)
1. [render.com](https://render.com) par `New Web Service`.
2. Connect your GitHub Repo.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Free live link: `https://fedtb-india.onrender.com`
