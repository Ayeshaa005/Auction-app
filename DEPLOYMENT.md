# Deploying Auction House (free tier)

Goal: a public link anyone can open. Three pieces get hosted:

- **Frontend (Next.js)** → **Vercel** (free)
- **Backend (NestJS + WebSockets)** → **Render** (free)
- **PostgreSQL** → **Render** (free)

Do the steps **in order** — the frontend needs to know the backend's URL, and the backend needs to know the frontend's URL.

---

## Step 1 — Put the code on GitHub

1. Go to <https://github.com/new> and create a repository (e.g. `auction-app`). Leave it empty (no README/.gitignore). Click **Create repository**.
2. Copy the repo URL GitHub shows you (e.g. `https://github.com/YOURNAME/auction-app.git`).
3. In a terminal **in this project folder**, run (replace the URL):

   ```bash
   git remote add origin https://github.com/YOURNAME/auction-app.git
   git branch -M main
   git push -u origin main
   ```

   The first push opens a browser window to sign in to GitHub — approve it. Done.

---

## Step 2 — Deploy the backend + database on Render

1. Sign up / log in at <https://render.com> (use "Sign in with GitHub").
2. Click **New ➜ Blueprint**.
3. Select your `auction-app` repo. Render detects `render.yaml` and shows a backend service **+ a PostgreSQL database**.
4. Click **Apply**. Render creates the database, then builds the backend (first build ~3–5 min).
5. When it's live, open the **auction-backend** service and copy its URL — looks like:

   ```
   https://auction-backend.onrender.com
   ```

6. Quick check: open `https://auction-backend.onrender.com/api/auctions` in your browser. You should see `[]` (empty list) — that means the API and database work.

> `JWT_SECRET` is generated automatically and migrations run on every deploy. `CORS_ORIGIN` is intentionally left blank for now — you'll set it in Step 4.

---

## Step 3 — Deploy the frontend on Vercel

1. Sign up / log in at <https://vercel.com> (use "Continue with GitHub").
2. **Add New ➜ Project**, import your `auction-app` repo.
3. Set **Root Directory** to `frontend` (click *Edit* next to Root Directory and pick the `frontend` folder).
4. Expand **Environment Variables** and add these two (use your real backend URL from Step 2):

   | Name                   | Value                                          |
   | ---------------------- | ---------------------------------------------- |
   | `NEXT_PUBLIC_API_URL`  | `https://auction-backend.onrender.com/api`     |
   | `NEXT_PUBLIC_WS_URL`   | `https://auction-backend.onrender.com`         |

5. Click **Deploy**. After ~1–2 min you'll get a public URL like:

   ```
   https://auction-app.vercel.app
   ```

   **This is the link you share with people.** 🎉

---

## Step 4 — Connect the two (CORS)

The backend must allow requests from your Vercel site.

1. In **Render** → open **auction-backend** → **Environment** tab.
2. Set `CORS_ORIGIN` to your Vercel URL (no trailing slash), e.g.:

   ```
   https://auction-app.vercel.app
   ```

3. Click **Save Changes**. Render redeploys automatically (~2 min).

Now open your Vercel link, register an account, and bid. Open it on your phone too — it's live for anyone.

---

## Step 5 (optional) — Add demo auctions

A fresh deploy has no auctions yet. To add the sample ones:

1. In **Render** → **auction-backend** → **Shell** tab.
2. Run:

   ```bash
   npm run db:seed
   ```

   This adds two demo auctions (sellers `alice@example.com` / `bob@example.com`, password `password123`).

> Better long-term: a "Create auction" page in the app so users post their own items. Ask and I'll add it.

---

## Updating the live app later

Any time you change code:

```bash
git add -A
git commit -m "describe your change"
git push
```

Render and Vercel redeploy automatically on every push to `main`.

---

## Notes & gotchas

- **Free backend sleeps after ~15 min idle.** The first visit afterwards takes ~30–50s to wake up, then it's fast. Upgrading the Render service to a paid plan removes this.
- **Render free PostgreSQL expires after 90 days.** Render emails you; you can create a new free DB or upgrade.
- Secrets (`.env`, `.env.local`) are git-ignored and never pushed. Production secrets live in the Render/Vercel dashboards.
- If a deploy fails on the `bcrypt` step, tell me — I'll switch it to `bcryptjs` (no native build) and push the fix.
