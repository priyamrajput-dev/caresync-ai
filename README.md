# 🏥 CareSync AI — Autonomous Healthcare Operations Intelligence Platform

[![Stack: MERN](https://img.shields.io/badge/Stack-MERN-green.svg)](https://github.com/codewithEshaYoutube/CareSync-AI)
[![Backend: Node.js / Express](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express.js-blue.svg)](https://expressjs.com/)
[![Database: MongoDB Mongoose](https://img.shields.io/badge/Database-MongoDB%20%7C%20Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![Vector DB: Atlas Vector Search](https://img.shields.io/badge/Vector%20Search-MongoDB%20Atlas-forestgreen.svg)](https://www.mongodb.com/products/platform/atlas-vector-search)
[![Frontend: React Vite](https://img.shields.io/badge/Frontend-React.js%20%7C%20Vite-61dafb.svg)](https://react.dev/)
[![AI: Anthropic Claude](https://img.shields.io/badge/AI-Anthropic%20Claude-purple.svg)](https://www.anthropic.com/)
[![Test Suite: Passing (14/14)](https://img.shields.io/badge/Tests-14%2F14%20Passing-success.svg)](https://nodejs.org/)

> **"Predicting and preventing healthcare resource crises using autonomous AI agents, MongoDB Atlas Vector Search, and real-time operational telemetry."**

---

## 📑 Table of Contents
1. [Production MERN Architecture](#1-production-mern-architecture)
2. [Project Structure](#2-project-structure)
3. [Quickstart & Setup Instructions](#3-quickstart--setup-instructions)
4. [Feature Audit Summary](#4-feature-audit-summary)
5. [AI Architecture, ReAct Agent & Tools](#5-ai-architecture-react-agent--tools)
6. [MongoDB Atlas Vector Search & RAG](#6-mongodb-atlas-vector-search--rag)
7. [Complete REST API Reference](#7-complete-rest-api-reference)
8. [Automated Test Suite](#8-automated-test-suite)
9. [Default Credentials](#9-default-credentials)
10. [License](#10-license)

---

## 1. Production MERN Architecture

CareSync AI has been modernized from an experimental Python FastAPI prototype into a **production-grade MERN stack** (MongoDB, Express.js, React.js, Node.js) web application.

```
                              ┌────────────────────────────────────────┐
                              │           React.js Frontend            │
                              │ (Vite, Dynamic India Map, Chat, RAG)   │
                              └───────────────────┬────────────────────┘
                                                  │ REST API / JWT
                                                  ▼
                              ┌────────────────────────────────────────┐
                              │       Node.js / Express Backend        │
                              │ (Controllers, Middleware, Guardrails)  │
                              └───────┬────────────────────────┬───────┘
                                      │                        │
                   ┌──────────────────┴──┐           ┌─────────┴────────────────┐
                   ▼                     ▼           ▼                          ▼
          ┌─────────────────┐   ┌─────────────┐ ┌─────────────┐     ┌───────────────────────┐
          │Hospital Service │   │ Procurement │ │ Discharge   │     │ Native AI ReAct Agent │
          │Inventory Service│   │   Service   │ │  Workflow   │     │  (Autonomous Tool     │
          └────────┬────────┘   └──────┬──────┘ └──────┬──────┘     │   Calling Runtime)    │
                   │                   │               │            └───────────┬───────────┘
                   └──────────┬────────┴───────────────┘                        │
                              ▼                                                 ▼
             ┌─────────────────────────────────┐               ┌─────────────────────────────────┐
             │       MongoDB / Mongoose        │               │   Anthropic Claude SDK Client   │
             │   (Hospitals, Inventory, Users, │               │   (Claude 3.5 Sonnet / Haiku    │
             │     Alerts, POs, Telemetry)     │               │   with Simulation Fallback)     │
             └────────────────┬────────────────┘               └────────────────┬────────────────┘
                              │                                                 │
                              └────────────────────────┬────────────────────────┘
                                                       ▼
                                      ┌─────────────────────────────────┐
                                      │   MongoDB Atlas Vector Search   │
                                      │   ($vectorSearch Aggregation,   │
                                      │    Cosine Similarity Fallback)  │
                                      └─────────────────────────────────┘
```

### Key Architectural Shifts:
- **Frontend:** React 19 + Vite with modular pages, context providers, responsive cybernetic healthcare design tokens, and a dynamic vector map matching MongoDB facility coordinates.
- **Backend:** Node.js (ES modules) + Express.js structured into clean MVC layers (`controllers/`, `services/`, `models/`, `routes/`, `validators/`, `middleware/`).
- **Database:** MongoDB 6+ managed via Mongoose 8+, featuring 16 schemas with compound indexes, soft status states, and referential integrity.
- **Vector Search:** MongoDB Atlas Vector Search utilizing the `$vectorSearch` aggregation stage with HNSW indexing and metadata filtering, complemented by a zero-dependency cosine fallback for local development.
- **AI Core:** Native JavaScript ReAct loop with `@anthropic-ai/sdk`, tool calling, input validation, runaway iteration limits, and clinical disclaimers.

---

## 2. Project Structure

```
caresync-ai/
├── README.md                  # Unified Master Documentation
├── client/                    # Production React Frontend (Vite)
│   ├── .env.example           # Frontend environment template
│   ├── src/
│   │   ├── assets/            # Platform screenshots, icons, and vector graphics
│   │   ├── components/        # Reusable UI components (Navbar, NationalMap, Telemetry, Chat)
│   │   ├── context/           # AuthContext, ThemeContext
│   │   ├── pages/             # Dashboard, Facilities, Inventory, Alerts, Discharge, RAG
│   │   ├── services/api/      # Axios/Fetch API client wrappers
│   │   ├── App.jsx            # Root application assembly & modal controller
│   │   └── index.css          # Cybernetic Healthcare Design Tokens & Responsive CSS
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js         # Vite configuration
│
└── server/                    # Production Node.js + Express Backend
    ├── .env.example           # Backend environment template
    ├── config/                # Environment variables, MongoDB connection
    ├── controllers/           # Thin MVC controllers (Auth, Dashboard, AI, Vector, etc.)
    ├── middleware/            # JWT authentication, RBAC, error handler, rate limiters
    ├── models/                # 16 Mongoose Schemas (User, Hospital, Resource, Alert, etc.)
    ├── prompts/               # System prompts, ReAct templates, RAG synthesis prompts
    ├── routes/                # Express router declarations
    ├── services/
    │   ├── ai/                # LLM service, ReAct agent, Guardrails, Vector search, RAG
    │   ├── business/          # Hospital, Inventory, Procurement domain services
    │   └── database/          # Database seeder (Facilities, suppliers, vector chunks)
    ├── test/                  # Node.js native test runner test suite (14 tests)
    ├── app.js                 # Express application definition
    ├── package.json           # Backend dependencies
    └── server.js              # Server entry point
```

---

## 3. Quickstart & Setup Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: v6.0 or higher (Local or MongoDB Atlas cluster)
- **Anthropic API Key** *(Optional - includes intelligent local simulation fallback)*

---

### Step 1: Start MongoDB Daemon
Ensure MongoDB is running locally on port `27017` or prepare your Atlas URI:
```bash
# Example starting local mongod
mongod --dbpath server/data/db --port 27017 --bind_ip 127.0.0.1
```

---

### Step 2: Configure Environment Variables

**Backend (`server/.env`):**
```bash
cp server/.env.example server/.env
```
Default configuration:
```ini
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/caresync
JWT_SECRET=caresync-super-secret-production-jwt-key-2026-secure
ANTHROPIC_API_KEY=your_anthropic_api_key_or_leave_blank_for_simulation
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

**Frontend (`client/.env`):**
```bash
cp client/.env.example client/.env
```
```ini
VITE_API_URL=http://localhost:8000/api
```

---

### Step 3: Run the Express Backend & Seed Data
```bash
cd server
npm install
npm start
```
*Note: On initial startup, the backend automatically seeds the database with 5 hospitals, 25 inventory trackers, verified medical suppliers, alerts, and 6 vectorized clinical SOP documents.*

To verify the backend health:
```bash
curl http://localhost:8000/api/health
```

---

### Step 4: Run the React Frontend
Open a new terminal:
```bash
cd client
npm install
npm run dev
```
Open your browser at: **`http://localhost:5173`**

---

## 4. Feature Audit Summary

| # | Feature | Legacy Status | Target MERN Status | Classification |
|---|---|---|---|---|
| 1 | Hospital Overview Dashboard | Mocked in React (`setTimeout`) | Live MongoDB aggregates | **COMPLETED & CONNECTED** |
| 2 | National Geographic Map | California canvas drawing | Dynamic SVG based on India DB coords | **FIXED & CONNECTED** |
| 3 | Granular Facility Telemetry | Static data in UI | Live `/api/hospitals/:id/inventory` | **COMPLETED & CONNECTED** |
| 4 | Inventory Depletion Tracking | Static numbers | Real-time threshold monitoring | **COMPLETED & CONNECTED** |
| 5 | AI ReAct Chat Copilot | Hardcoded frontend if-else | Multi-turn agent with Mongoose tools | **REIMPLEMENTED NATIVE JS** |
| 6 | Automated Procurement Flow | Browser `alert()` prompt | Multi-stage PO lifecycle with approval | **COMPLETED & CONNECTED** |
| 7 | Clinical Alert System | Hardcoded UI cards | CRUD + Acknowledge + Resolve APIs | **COMPLETED & CONNECTED** |
| 8 | Patient Discharge Summarizer | Non-existent in UI | LLM Clinical Note Synthesis + DB | **NEWLY IMPLEMENTED** |
| 9 | Atlas Vector Knowledge Base | Mocked Python strings | `$vectorSearch` Aggregation + RAG | **NATIVE ATLAS IMPLEMENTATION** |
| 10 | Shortage Assessment Workflow | Broken LangGraph nodes | Deterministic 4-node JS pipeline | **REIMPLEMENTED NATIVE JS** |
| 11 | Authentication & RBAC | Mock tokens | JWT + Bcrypt + Role Middleware | **COMPLETED & CONNECTED** |
| 12 | Predictive Deficit Forecasting | Hardcoded JSON | Database-backed trend projection | **COMPLETED & CONNECTED** |
| 13 | Audit Logging & Telemetry | Empty Python dicts | Indexed Mongoose `AgentLog` model | **COMPLETED & CONNECTED** |
| 14 | Responsive Theming | Partial CSS | Full Dark/Light theme token system | **POLISHED** |

---

## 5. AI Architecture, ReAct Agent & Tools

CareSync AI features an in-house JavaScript ReAct agent loop replacing legacy LangGraph/LangChain dependencies:

```
User Message
     │
     ▼
[Input Guardrails Check] ──(Violation)──► Return Safe Rejection
     │
     ▼
[Assemble Conversation Context & System Prompt]
     │
 ┌───┴─────────────────────────────────────────┐
 │ Turn N (Max 6 turns)                        │
 │   1. Call Claude / LLM Service with Tools   │
 │   2. If Final Text (no tools) ──────────────┼──► Return Final Response
 │   3. If Tool Calls:                         │
 │      a. Validate tool arguments             │
 │      b. Execute tool against MongoDB        │
 │      c. Append tool output to context       │
 └───┬─────────────────────────────────────────┘
     │
     ▼
[Output Sanitization & Clinical Disclaimer Append]
     │
     ▼
[Log Execution to MongoDB AgentLog Collection]
```

### Operational AI Tools (`server/services/ai/tool.service.js`)
1. **`get_hospital_metrics`**: Queries live occupancy, ICU beds, oxygen levels, and active alert counts.
2. **`check_resource_inventory`**: Inspects granular inventory stocks across national medical facilities.
3. **`search_suppliers`**: Queries verified commercial suppliers filtered by lead time and reliability score.
4. **`create_procurement_order`**: Drafts purchase orders with mandatory human-in-the-loop approval.
5. **`get_active_alerts`**: Retrieves unresolved clinical alerts sorted by severity.
6. **`search_knowledge_base`**: Executes MongoDB Atlas Vector Search over clinical operating procedures.

### AI Guardrails (`server/services/ai/guardrails.service.js`)
- **Input Validation**: Sanitizes queries, enforces a 2,000-character boundary, and rejects known prompt injection patterns.
- **Max Loop Turns**: Hard limit of 6 agent thought-action-observation turns to eliminate runaway API costs.
- **Clinical Notice Enforcement**: Appends mandatory operational intelligence disclaimers to all AI-generated outputs.
- **Simulation Fallback**: When an Anthropic API key is not supplied, executes deterministic high-fidelity local simulation rather than failing.

---

## 6. MongoDB Atlas Vector Search & RAG

CareSync AI utilizes **MongoDB Atlas Vector Search** as the sole vector database and retrieval engine for healthcare operational protocols, standard operating procedures (SOPs), clinical guidelines, and supply chain contingency documents.

### Document Chunk Schema (`server/models/DocumentChunk.js`)
```javascript
const documentChunkSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  category: {
    type: String,
    enum: ['clinical_protocol', 'supply_chain', 'contingency_plan', 'facility_guideline'],
    default: 'clinical_protocol',
    index: true,
  },
  region: { type: String, default: 'National', index: true },
  content: { type: String, required: true },
  embedding: {
    type: [Number],
    required: true,
    validate: [v => Array.isArray(v) && v.length === 1536, '1536-dimensional float vector required'],
  },
  metadata: Object,
}, { timestamps: true });
```

### Atlas Search Index Definition (`vector_index`)
To index in MongoDB Atlas:
```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    { "type": "filter", "path": "category" },
    { "type": "filter", "path": "region" }
  ]
}
```

### Aggregation Pipeline (`server/services/ai/vector.service.js`)
```javascript
const pipeline = [
  {
    $vectorSearch: {
      index: 'vector_index',
      path: 'embedding',
      queryVector: queryEmbedding,
      numCandidates: 40,
      limit: 4,
      filter: { category: { $eq: 'clinical_protocol' } },
    },
  },
  {
    $project: {
      title: 1,
      category: 1,
      content: 1,
      score: { $meta: 'vectorSearchScore' },
    },
  },
];
const results = await DocumentChunk.aggregate(pipeline);
```

*Portability Note: When running in local development or standalone MongoDB instances where the Atlas Search daemon is not active, `vector.service.js` automatically executes an exact in-memory cosine similarity fallback.*

---

## 7. Complete REST API Reference

**Base URL:** `http://localhost:8000/api`  
**Authentication Header:** `Authorization: Bearer <JWT_TOKEN>`  
**Response Formats:**
- **Success:** `{ "success": true, "data": { ... }, "message": "..." }`
- **Error:** `{ "success": false, "error": { "code": "...", "message": "..." } }`

### Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | System health and stack status | No |
| `POST` | `/api/auth/register` | Register new operator account | No |
| `POST` | `/api/auth/login` | Login and obtain JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `GET` | `/api/dashboard/summary` | Global healthcare metrics & telemetry | No |
| `GET` | `/api/hospitals` | List all verified hospitals | No |
| `GET` | `/api/hospitals/:id` | Hospital details and inventory | No |
| `GET` | `/api/hospitals/:id/inventory`| Granular inventory tracking | No |
| `GET` | `/api/hospitals/:id/alerts` | Hospital-specific active alerts | No |
| `GET` | `/api/procurement/orders` | List purchase orders | Yes |
| `POST` | `/api/procurement/orders` | Create draft purchase order | Yes |
| `PATCH`| `/api/procurement/orders/:id/status` | Update PO status | Yes (Operator/Admin) |
| `GET` | `/api/alerts` | List active emergency alerts | No |
| `POST` | `/api/alerts/:id/acknowledge`| Acknowledge emergency alert | No |
| `PATCH`| `/api/alerts/:id/resolve` | Resolve emergency alert | No |
| `POST` | `/api/chat` | Autonomous AI ReAct agent chat | No |
| `POST` | `/api/vector/search` | Atlas Vector Search over SOPs | No |
| `POST` | `/api/vector/query` | Grounded RAG synthesis with Claude | No |
| `GET` | `/api/discharges` | List patient discharge summaries | No |
| `POST` | `/api/discharges` | Generate discharge summary via AI | No |
| `POST` | `/api/workflow/shortage-assessment`| Run multi-node shortage triage | No |

---

## 8. Automated Test Suite

All 14 integration tests pass via Node.js native test runner:

```bash
cd server && npm test
```

```
✔ GET /api/health returns 200 and MERN status (196ms)
✔ POST /api/auth/login succeeds with valid credentials (141ms)
✔ POST /api/auth/login fails with invalid password (106ms)
✔ GET /api/dashboard/summary returns operational aggregate metrics (22ms)
✔ POST /api/chat runs ReAct agent and returns tool calls and clinical disclaimer (13ms)
✔ POST /api/vector/search retrieves relevant chunks using vector similarity (9ms)
✔ GuardrailsService blocks prompt injection attempts (0.4ms)
✔ EmbeddingService calculates valid cosine similarity between vectors (1.5ms)
✔ GET /api/hospitals returns hospital list and detail (32ms)
✔ Procurement API creates, retrieves, and updates orders (137ms)
✔ Alerts API lists alerts and acknowledges an alert (5ms)
✔ Discharge API generates clinical summary and lists summaries (34ms)
✔ POST /api/vector/query performs grounded RAG with synthesis (6ms)
✔ POST /api/workflow/shortage-assessment executes shortage assessment workflow (11ms)

ℹ tests 14 | pass 14 | fail 0 | duration_ms 1247
```

---

## 9. Default Credentials

Initial operational credentials seeded on database startup:

| Role | Email | Password |
|---|---|---|
| **Administrator / Director** | `sarah.chen@caresync.gov.in` | `CareSync@2026` |

---

## 10. License
MIT License. Built for modern healthcare operational resilience.
