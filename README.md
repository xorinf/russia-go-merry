# Yaksha FAQ Portal — v0.1

> Semantic search-powered FAQ and community board for internship students.

---

## Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, Tailwind CSS, Vite                    |
| Backend    | Node.js, Express.js                             |
| Database   | MongoDB Atlas                                   |
| Search     | MongoDB Atlas Vector Search (cosine similarity) |
| Embeddings | `sentence-transformers` (Python, one-time seed) |
| Auth       | JWT + bcrypt                                    |

---

## Project Structure

```
yaksha-faq-portal/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── communityController.js
│   │   ├── faqController.js
│   │   └── searchController.js
│   ├── middleware/
│   │   └── auth.js                # JWT protect middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── FAQ.js
│   │   ├── CommunityPost.js
│   │   └── SearchLog.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── faq.js
│   │   ├── community.js
│   │   └── search.js
│   ├── scripts/
│   │   └── seed_and_embed.py      # One-time seed + embedding script
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/Navbar.jsx
    │   │   └── ui/
    │   │       ├── SearchBar.jsx
    │   │       ├── SearchResults.jsx
    │   │       ├── TrendingQueries.jsx
    │   │       ├── FAQAccordion.jsx
    │   │       └── CommunityPostCard.jsx
    │   ├── hooks/
    │   │   └── useAuth.jsx         # Auth context + hook
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── HomePage.jsx
    │   │   ├── FAQPage.jsx
    │   │   └── CommunityPage.jsx
    │   ├── utils/
    │   │   ├── api.js              # Axios instance
    │   │   └── embeddings.js       # @xenova/transformers browser embeddings
    │   ├── styles/index.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

---

## Setup Guide

### Step 1 — MongoDB Atlas (from scratch)

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account.
2. Click **"Build a Database"** → choose **M0 Free Tier** → select a region close to you.
3. Set a username and password (save these).
4. Under **Network Access**, click **"Add IP Address"** → **"Allow Access from Anywhere"** (for development).
5. Under **Database**, click **"Connect"** → **"Drivers"** → copy the connection string.
   - It looks like: `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/`

---

### Step 2 — Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/yaksha_faq?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
```

Install dependencies:

```bash
npm install
```

---

### Step 3 — Run the Python Seed Script

This script generates 384-dim sentence embeddings and seeds all sample data into MongoDB.

**Requirements:**

```bash
pip install pymongo sentence-transformers python-dotenv bcrypt
```

**Run:**

```bash
cd backend/scripts
python seed_and_embed.py
```

This will:
- Create 2 users (student + admin)
- Insert 12 FAQ entries with embeddings
- Insert 6 community posts with embeddings
- Insert sample search logs for trending

**First run downloads the model (~90 MB). Subsequent runs are instant.**

---

### Step 4 — Create Vector Search Indexes in Atlas

This is required for semantic search to work.

1. In MongoDB Atlas, go to your cluster → **"Atlas Search"** tab.
2. Click **"Create Search Index"**.
3. Choose **"JSON Editor"** → select database `yaksha_faq`.

**For FAQs — collection: `faqs`:**

- Index name: `vector_index`
- JSON definition:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    }
  ]
}
```

**Repeat for Community Posts — collection: `communityposts`:**

- Index name: `vector_index`
- Same JSON definition as above.

4. Wait for index status to show **"Active"** (1-3 minutes).

---

### Step 5 — Start the Backend

```bash
cd backend
npm run dev
```

Backend runs at `http://localhost:5000`

---

### Step 6 — Frontend Setup

```bash
cd frontend
cp .env.example .env
```

`.env` contents (default):

```env
VITE_API_URL=http://localhost:5000/api
```

Install and run:

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## How Semantic Search Works

```
User types query
       ↓
Browser generates 384-dim embedding
(using @xenova/transformers — same model as Python seed)
       ↓
POST /api/search { query, embedding }
       ↓
MongoDB Atlas Vector Search
(cosine similarity against faqs + communityposts)
       ↓
Top 3 results returned (merged, ranked by score)
       ↓
4th result: always "Go to Community Board →"
```

The model used is `all-MiniLM-L6-v2`:
- Runs in Python (seed script) and in the browser (transformers.js)
- Both use identical vector space → embeddings are comparable
- Model downloads to browser cache on first search (~25 MB, cached forever after)

---

## API Reference

| Method | Route               | Auth | Description                    |
|--------|---------------------|------|--------------------------------|
| POST   | /api/auth/login     | No   | Login with email + password    |
| GET    | /api/auth/me        | Yes  | Get current user               |
| GET    | /api/faq            | Yes  | All FAQs grouped by category   |
| GET    | /api/faq/:id        | Yes  | Single FAQ                     |
| GET    | /api/community      | Yes  | All community posts             |
| GET    | /api/community/:id  | Yes  | Single community post           |
| POST   | /api/community      | Yes  | Create a new post               |
| POST   | /api/search         | Yes  | Semantic search                 |
| GET    | /api/search/trending| Yes  | Top trending queries            |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable        | Description                        | Required |
|----------------|------------------------------------|----------|
| MONGODB_URI    | MongoDB Atlas connection string    | Yes      |
| JWT_SECRET     | Secret key for JWT signing         | Yes      |
| JWT_EXPIRES_IN | Token expiry (e.g. `7d`)           | No       |
| PORT           | Server port (default: 5000)        | No       |
| CLIENT_URL     | Frontend URL for CORS              | No       |

### Frontend (`frontend/.env`)

| Variable       | Description              | Required |
|---------------|--------------------------|----------|
| VITE_API_URL  | Backend API base URL     | No       |

---

## Test Credentials

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Student | student@yaksha.com     | password123 |
| Admin   | admin@yaksha.com       | admin123    |

---

## MongoDB Schema Notes

### FAQ document
```json
{
  "_id": "ObjectId",
  "question": "How do I submit my weekly report?",
  "answer": "Log in to the portal...",
  "category": "Reporting",
  "embedding": [0.023, -0.114, ...],  // 384 floats — hidden from API responses
  "searchCount": 0,
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

### CommunityPost document
```json
{
  "_id": "ObjectId",
  "title": "Is it okay to use personal GitHub?",
  "body": "My mentor hasn't set up a company GitHub yet...",
  "author": "ObjectId → User",
  "status": "answered",
  "answer": "Yes, you may use a personal GitHub temporarily...",
  "embedding": [0.011, -0.089, ...],  // 384 floats — hidden from API responses
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```
