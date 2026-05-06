# Vitto — MSME Lending Decision System

A lightweight, end-to-end lending decision system that accepts MSME business profiles and loan inputs, runs them through a credit decision engine, and surfaces a structured decision with reasoning.

**Tech Stack:** React (Vite) · Node.js / Express · In-memory data store

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### 1. Clone & Install

```bash
git clone <repo-url>
cd Vitto-Assignment

# Install all dependencies
cd server && npm install
cd ../client && npm install
cd ..
```

### 2. Run

Open **two terminals**:

```bash
# Terminal 1 — Backend API (port 5000)
cd server
npm run dev

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## API Reference

All endpoints are prefixed with `/api`.

### `POST /api/applications`

Submit a complete loan application. Creates business profile, runs decision engine, returns result.

**Request Body:**
```json
{
  "businessProfile": {
    "ownerName": "Rajesh Kumar",
    "pan": "ABCDE1234F",
    "businessType": "manufacturing",
    "monthlyRevenue": 500000
  },
  "loanDetails": {
    "amount": 1000000,
    "tenure": 24,
    "purpose": "Purchase raw materials"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "businessProfile": { ... },
    "loanDetails": { ... },
    "decision": {
      "decision": "APPROVED",
      "creditScore": 78,
      "reasons": [],
      "breakdown": {
        "revenueToEmiScore": 30,
        "loanToRevenueScore": 20,
        "tenureRiskScore": 15,
        "businessTypeScore": 15,
        "revenueLevelScore": 15,
        "consistencyPenalty": 0
      },
      "details": {
        "estimatedEMI": 47073,
        "revenueToEmiRatio": 10.62,
        "loanToRevenueRatio": 2,
        "interestRate": "12.0% p.a."
      }
    },
    "status": "approved",
    "createdAt": "2026-05-06T...",
    "updatedAt": "2026-05-06T..."
  }
}
```

### `GET /api/applications`

List all submitted applications (audit trail).

### `GET /api/applications/:id`

Retrieve a specific application by ID.

### `GET /api/health`

Health check endpoint.

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": [
      { "field": "pan", "message": "Invalid PAN format. Expected: ABCDE1234F" }
    ]
  }
}
```

---

## Decision Logic

### Scoring Model (0–100 scale)

| Signal                  | Max Points | Description                                       |
|-------------------------|------------|---------------------------------------------------|
| Revenue-to-EMI Ratio    | 30         | Can the borrower comfortably service the loan?    |
| Loan-to-Revenue Multiple| 25         | Is the loan amount reasonable relative to income? |
| Tenure Risk             | 15         | Is the repayment window reasonable?               |
| Business Type           | 15         | Industry-based risk weighting                     |
| Revenue Level           | 15         | Absolute revenue as a stability indicator         |
| Consistency Checks      | −20 each   | Fraud/data integrity flags                        |

**Decision threshold:** Score ≥ 60 → **Approved**, else **Rejected**

### Key Assumptions

- **Interest rate:** 12% p.a. (1% monthly) — typical MSME unsecured lending rate in India
- **EMI calculation:** Standard reducing balance formula
- **Business type risk ordering:** Manufacturing > Services > Retail > Agriculture > Other
- **Revenue-to-EMI ratio ≥ 3** is considered safe; < 2 is high risk
- **Loan-to-revenue ratio > 10x** is considered high risk
- **Tenure sweet spot:** 6–36 months

### Reason Codes

| Code                   | Meaning                                            |
|------------------------|-----------------------------------------------------|
| `LOW_REVENUE_TO_EMI`   | Monthly revenue cannot comfortably cover EMI        |
| `HIGH_LOAN_RATIO`      | Loan amount too high relative to monthly revenue    |
| `LOW_REVENUE`          | Absolute revenue is below ₹50,000/month             |
| `TENURE_TOO_SHORT`     | Tenure < 3 months — risky for both parties          |
| `TENURE_TOO_LONG`      | Tenure > 48 months — extended risk exposure         |
| `DATA_INCONSISTENCY`   | Loan > 50× monthly revenue — likely data error      |
| `SUSPICIOUS_LOAN_AMOUNT`| Very low revenue with disproportionate loan request |
| `INSUFFICIENT_CREDIT_SCORE` | General low score without specific flags       |

---

## Architecture

```
Vitto-Assignment/
├── server/                    # Backend API
│   ├── server.js              # Express entry point
│   └── src/
│       ├── config/            # Environment config
│       ├── controllers/       # Request handlers
│       ├── middleware/        # Validation, error handling, rate limiting
│       ├── routes/            # Route definitions
│       ├── services/          # Decision engine (core business logic)
│       ├── store/             # Data persistence layer
│       └── utils/             # Response helpers
├── client/                    # Frontend (React + Vite)
│   └── src/
│       ├── components/        # UI components
│       ├── services/          # API client
│       ├── App.jsx            # Main app
│       └── App.css            # Styles
└── README.md
```

### Design Decisions

1. **In-memory store with repository pattern** — for a 1-day sprint, this avoids database setup overhead while keeping the code structured for easy migration to PostgreSQL/MongoDB. The store API (`saveApplication`, `getApplicationById`, `getAllApplications`) maps 1:1 to database operations.

2. **Single submission endpoint** — while individual `/business-profiles`, `/loan-applications`, and `/decisions` endpoints would be more RESTful, a combined `/applications` endpoint provides better UX (one API call instead of three) while still maintaining clean internal separation.

3. **Deterministic scoring** — no ML/randomness. Given the same inputs, you always get the same score. This makes the system testable and defensible.

4. **Client-side + server-side validation** — the form validates before sending, but the server re-validates everything. Defense in depth.

---

## What I'd Improve With More Time

- **PostgreSQL + MongoDB** — Use PostgreSQL for business profiles (ACID for financial data) and MongoDB for audit logs (flexible schema, append-heavy)
- **Authentication** — JWT-based auth for multi-tenant support
- **Async processing** — Queue-based decision pipeline with WebSocket status updates
- **Unit tests** — Jest for backend, React Testing Library for frontend
- **Docker Compose** — Full containerized setup
- **CI/CD** — GitHub Actions for lint, test, build, deploy
- **More nuanced scoring** — Industry benchmarks, historical data weighting, external credit bureau integration
