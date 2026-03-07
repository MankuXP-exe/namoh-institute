# NAMOH Institute — Full-Stack Vercel Deployment Guide

## Overview

This project is a full-stack web application for NAMOH Institute of Computer & Spoken English.

- **Frontend** — Static HTML/CSS/JS (`index.html`)
- **Backend** — Vercel Serverless Functions (`/api` folder)
- **Database** — MongoDB Atlas (free M0 tier)
- **AI Chatbot** — OpenAI GPT-3.5-turbo

---

## Project Structure

```
namoh-institute/
├── api/
│   ├── lead.js          ← POST /api/lead  (enrollment form)
│   ├── leads.js         ← GET  /api/leads (admin — all leads)
│   └── chat.js          ← POST /api/chat  (AI chatbot)
├── lib/
│   ├── db.js            ← MongoDB connection (cached for serverless)
│   ├── rateLimiter.js   ← Per-IP rate limiting
│   └── sanitize.js      ← Input validation & sanitization
├── components/
│   └── chatbot.js       ← Floating chat widget (vanilla JS)
├── css/style.css
├── js/main.js
├── index.html
├── vercel.json
├── package.json
└── .env.example
```

---

## Step 1 — Set Up MongoDB Atlas

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a **free account**
2. Create a **new project** → **Build a Database** → choose **M0 Free tier**
3. Choose a cloud/region (AWS Mumbai recommended for India)
4. Create a **username and password** for the database user
5. Under **Network Access**, click **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) — This is required for Vercel serverless
6. Go to **Clusters** → **Connect** → **Drivers** → copy the connection string

It looks like:
```
mongodb+srv://myuser:mypassword@cluster0.abc12.mongodb.net/?retryWrites=true&w=majority
```

Change `?` to `/namoh?` to specify the database name:
```
mongodb+srv://myuser:mypassword@cluster0.abc12.mongodb.net/namoh?retryWrites=true&w=majority
```

---

## Step 2 — Get an OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click **Create new secret key**
3. Copy the key (starts with `sk-proj-...`)
4. Add some credits to your account (GPT-3.5-turbo is very cheap — ~₹0.15 per 1000 tokens)

---

## Step 3 — Deploy to Vercel

### Option A: Deploy from GitHub (Recommended)

1. Push this repository to GitHub (if not already):
   ```bash
   git add .
   git commit -m "Add full-stack backend with chatbot"
   git push origin main
   ```

2. Go to [https://vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo

3. In the **Environment Variables** section, add:

   | Name | Value |
   |------|-------|
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `OPENAI_API_KEY` | Your OpenAI API key |
   | `ADMIN_SECRET` | Any strong random string (e.g. 32 random chars) |

4. Click **Deploy** — Vercel will auto-detect the serverless functions in `/api`

### Option B: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# Set environment variables
vercel env add MONGODB_URI
vercel env add OPENAI_API_KEY
vercel env add ADMIN_SECRET

# Deploy to production
vercel --prod
```

---

## Step 4 — Test the API

After deploying, test the endpoints:

```bash
# 1. Submit a lead (enrollment form)
curl -X POST https://namoh-institute.vercel.app/api/lead \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Student","phone":"9876543210","course":"Basic Computer","message":"Test"}'

# Expected response:
# {"success":true,"message":"Thank you, Test Student! ...","id":"..."}


# 2. View all leads (admin)
curl https://namoh-institute.vercel.app/api/leads \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"

# Expected response:
# {"success":true,"total":1,"page":1,"limit":20,"pages":1,"data":[...]}


# 3. Chat with the AI assistant
curl -X POST https://namoh-institute.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What computer courses do you offer?"}'

# Expected response:
# {"success":true,"reply":"NAMOH Institute offers a wide range of computer courses..."}
```

---

## Security Features

| Feature | Details |
|---------|---------|
| Rate Limiting | `/api/lead`: 5 req/15 min per IP; `/api/chat`: 10 req/10 min per IP |
| Honeypot | Hidden `website` field catches and silently blocks bots |
| Input Validation | Name (2–80 chars), Phone (Indian 10-digit), Course (strict allowlist) |
| HTML Sanitization | All inputs stripped of HTML/script tags |
| CORS | Restricted to production domain in `/api/lead` |
| Admin Auth | Bearer token protects `/api/leads` |
| IP Privacy | IPs stored as one-way hash (not raw) |
| Security Headers | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` |

---

## Local Development

For local testing with a real backend:

```bash
# Install dependencies
npm install

# Create .env from template
copy .env.example .env
# Then edit .env with your actual credentials

# Install Vercel CLI
npm i -g vercel

# Run locally (simulates Vercel serverless functions)
vercel dev
```

The site will be available at `http://localhost:3000` with full API functionality.

---

## Rate Limits & Costs

| Service | Free Tier | Cost |
|---------|-----------|------|
| MongoDB Atlas M0 | 512 MB storage, shared cluster | Free forever |
| OpenAI GPT-3.5-turbo | Pay per use | ~$0.002 per 1K tokens (≈ ₹0.16) |
| Vercel Hobby | 100GB bandwidth, 100K serverless invocations/month | Free |

For a coaching institute with moderate traffic, **monthly costs are typically under ₹100**.

---

## Viewing Leads (Admin)

You can view all course inquiries by making a GET request with your admin token:

```bash
# All leads
curl https://namoh-institute.vercel.app/api/leads \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"

# Filter by course
curl "https://namoh-institute.vercel.app/api/leads?course=Basic+Computer" \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"

# Paginate
curl "https://namoh-institute.vercel.app/api/leads?page=2&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_SECRET"
```

Or you can view leads directly in MongoDB Atlas under **Browse Collections** → `namoh` database → `leads` collection.
