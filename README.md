# Vicharanashala AI-Powered FAQ Ecosystem

Welcome to the **Vicharanashala AI-Powered FAQ Ecosystem**—a production-grade, stateful institutional knowledge network built on a strict, modern MERN architecture. It is designed specifically to serve the Vicharanashala Internship Program, aligning core learnings with automatic query handling and high-fidelity AI support.

Instead of a standard CRUD app or static lists, this platform acts as an intelligent knowledge base combining the best features of:
- **StackOverflow** (for community answers, thread upvoting, and verified solution checkmarks)
- **Perplexity / Discord Help** (for RAG context queries and citation tracking)
- **Notion** (for official categories and verified course-work indexes)

---

## 🛠️ Technology Stack

- **Frontend**: React.js, TypeScript, Tailwind CSS, Lucide icons, Framer Motion-inspired animations.
- **Backend**: Node.js, Express.js, TypeScript, Native ES compilation.
- **Database / File Engine**: Stateful custom json-based SQLite file buffer mapping Schemas securely.
- **AI Triage Layer**: `@google/genai` TypeScript SDK (Lazily initialized). Features dual mode:
  1. **Yaksha Core**: RAG (Retrieval-Augmented Generation) mapping user questions to nearby FAQ matching nodes, injecting citations and safety context models.
  2. **Yaksha Mini**: Quantized sub-40ms operational simulator for rapid curriculum rules.

---

## 💡 Mandatory & Innovative Features

### 1. Ask Before Asking (Pre-Screening Engine)
When interns enter a title inside the home screen, Yaksha triggers an immediate semantic screening request. It maps the query against all verified FAQ articles and solved tickets, showing if a matching response already exists—preventing ticket duplicates.

### 2. Live Notifications & simulated Role-Switching
Simulation menus allow testing the platform through 4 distinct roles:
1. **Aarav Sharma (Intern - Backend)**: Can raise questions, upvote threads, talk to Yaksha.
2. **Ananya Iyer (Intern - AI Research)**: Contributes to other interns' tickets.
3. **Dr. Vinayak Sen (Mentor)**: Self-assigns open queries, reviews suggestions, and places official verification checkmarks on correct responses.
4. **Barnik Basu (Admin)**: Access to audit trails, system prompts configurations, and model temperature sliders.

### 3. Voice Simulation Input & File Zones
Interns can click the **Voice Dictation** button inside the form, which simulates natural speech processing, and attach docker files or stacktraces using high-fidelity upload dropzones.

---

## 🏗️ Architecture & RAG Pipeline

```
Intern Query Input
       │
       ▼
Local Context Search (Token Rank TF-IDF Embeddings mapping)
       │
       ├─► [High match discovered] ─► Return direct solution summary with references
       ▼
Augment prompt system instructions with matching articles
       │
       ▼
Gemini LLM Synthesis (lazy, graceful simulation fallback if keys absent)
       │
       ▼
Markdown Response + Bibliographies + Confidence Metrics
```

---

## 🚀 Execution & Command Reference

Install dependencies:
```bash
npm install
```

Start the development server (runs full-stack Node server on port 3000):
```bash
npm run dev
```

Build the static SPA bundle and compile the Node server for production:
```bash
npm run build
```

Run in production mode:
```bash
npm run start
```
