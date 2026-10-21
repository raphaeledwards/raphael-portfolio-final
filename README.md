# Raphael J. Edwards - AI-Powered Portfolio

A cutting-edge portfolio application built with **React**, **Vite**, and **Tailwind CSS**, featuring a custom **RAG (Retrieval-Augmented Generation) AI Assistant** that lets visitors chat with a digital persona of Raphael.

## 🚀 Key Features

-   **🤖 RAG AI Assistant**: Uses Google Gemini API to answer questions drawing from vector-embedded context (Resume, Projects, Blog).
-   **🔥 Engagement System**: Interactive "Reaction" buttons with optimistic UI and real-time Firestore sync.
-   **📰 Curated Feed**: "Director's Cut" tab featuring a custom feed of external artifacts with personal analysis.
-   **🔎 Advanced Blog UX**: Client-side filtering (tags), sorting (date), and scalable pagination.
-   **🔐 Secure Admin Panel**: Decoupled administration area for content management.
-   **⚡ High Performance**: Lazy loading, optimized code splitting, and fast initial paint.
-   **🛠️ Developer Mode**: "Index Source Code" feature allows the AI to answer technical questions about the codebase itself.
-   **📱 Fully Responsive**: Premium mobile-first design with smooth animations.
-   **🕸️ Agent/Crawler Readable**: Every route has real static HTML and a Markdown twin generated at build time (no JS required to read content), real 404s, a build-time `sitemap.xml`/`llms.txt`, and content negotiation via `Accept: text/markdown`. See `AGENT_READINESS_PLAN.md` for the full rationale.

## 🛠️ Tech Stack

-   **Frontend**: React (Vite), Tailwind CSS, Lucide React (Icons).
-   **Backend / Serverless**: Firebase (Auth, Firestore), Vercel Serverless Functions (`api/chat.js`, `api/embed.js` — Gemini calls run server-side, never in the client bundle).
-   **AI**: Google Gemini API (Embeddings & Completion).
-   **Static generation**: `scripts/prerender.js` (postbuild step) generates per-route static HTML + Markdown, a real sitemap, and `llms.txt` from `portfolioData.js`; `middleware.js` handles `Accept`-header content negotiation.
-   **Deployment**: Vercel (SPA + static routes).

## ⚙️ Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/raphael-portfolio-final.git
    cd raphael-portfolio-final
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory. You will need Firebase credentials and a Gemini API key.
    ```env
    # Firebase Configuration
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id

    # AI Configuration — server-only, no VITE_ prefix (Vite inlines VITE_* vars into
    # the public bundle, so this one must stay out of client code; read only by api/*.js)
    GEMINI_API_KEY=your_gemini_api_key

    # Admin Access (Comma separated). UI-only gate — enforce real admin access with
    # Firestore Security Rules (see firestore.rules), not this list.
    VITE_ADMIN_EMAILS=your_email@example.com,other@example.com
    ```

4.  **Run Locally:**
    ```bash
    npm run dev
    ```

## 🔐 Admin & Content Management

1.  **Access**: Click the lock icon in the footer (or "Admin" in header if logged in via AI chat).
2.  **Authentication**: Only emails listed in `VITE_ADMIN_EMAILS` can access the panel.
3.  **Seeding Database**:
    -   Content is managed locally in `src/data/portfolioData.js`.
    -   Click **"⚡ Seed Database"** in the Admin Panel to upload this data to Firestore.
    -   Click **"Generate Embeddings"** to vectorize the data for the AI.
4.  **Indexing Source Code**:
    -   Run `npm run build` locally to generate the manifest.
    -   In Admin Panel, click **"Index Source Code"** to let the AI "read" your latest code.

## 📦 Deployment

This project is configured for **Vercel**.
-   `npm run build` runs `prebuild` (source manifest) → `vite build` → `postbuild` (OG image + `scripts/prerender.js`, which writes static HTML/Markdown/sitemap/404 pages for every route into `dist/`).
-   `middleware.js` serves the Markdown twin instead of HTML when a request's `Accept` header prefers `text/markdown`.
-   Ensure you add all Environment Variables to your Vercel Project Settings — **for both Production and Preview scopes**. `VITE_`-prefixed vars should be set as **Config/Plaintext**, not Secret/Sensitive (Vite inlines them into the public bundle regardless, so marking them Sensitive just makes them write-only in the dashboard without adding real secrecy). `GEMINI_API_KEY` (no prefix) is the one that should stay Secret.

---
&copy; 2025 Raphael J. Edwards
