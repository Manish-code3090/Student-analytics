# Student Management System — MERN Basic Setup

Basic scaffold reflecting the architecture we planned: multi-tenant, with
**Center → Batch → Class → Test → Result**, and roles that are per-center via
a **Membership** join table (not stored directly on User).

## Structure

```
student-mgmt/
├── backend/
│   ├── config/db.js              MongoDB connection
│   ├── models/                   User, Center, Membership, Batch, Class, Test, Result
│   ├── controllers/               auth, center (others are inline in routes for now)
│   ├── routes/                    auth, centers, batches, classes, tests, results
│   ├── middleware/auth.js         JWT verification + role guard
│   ├── server.js                  Express app entry point
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/client.js           axios instance with auth token attached
    │   ├── context/AuthContext.jsx session state (memberships, active center, role)
    │   ├── pages/
    │   │   ├── Login.jsx           step 1: phone/password
    │   │   ├── ChooseCenter.jsx    step 2: pick center + role from memberships
    │   │   └── Dashboard.jsx       placeholder, role-specific views go here
    │   └── App.jsx
    └── vite.config.js              dev server proxies /api to localhost:5000
```

## Getting started

**Backend**
```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI and JWT_SECRET
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## What's intentionally stubbed / not decided yet

- **Student PIN login** (`loginStudent` in authController.js) — needs the real
  roll number + PIN lookup and bcrypt compare against `Membership.pinHash`.
- **CSV result upload** (`POST /api/results/csv`) — multer is wired up, parsing
  with `csv-parse` still needs to be written.
- **Center creation permissions** — `POST /api/centers` currently lets any
  logged-in user create a center and become its admin. This was flagged as an
  open question and should be locked down once decided.
- **Co-teaching** — `Class.teacherMemberships` is already an array, so multiple
  teachers per class is supported at the data level; UI for managing it isn't built.
- **Batch-level analytics** (public aggregates) and **personalized analysis**
  (private, with improvement plans) — no models/routes yet, since the depth of
  student-visible batch analytics is still an open question.

## Suggested next step

Given the plan-first approach so far, it's worth nailing down the three open
questions (co-teaching, center creation permissions, batch analytics depth)
before building out the controllers this scaffold stubbed out.
