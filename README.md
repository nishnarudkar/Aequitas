# Aequitas — Equal footing in every agreement.

> Plain-language legal contract analysis, clause risk detection, persona-tuned guidance, and actionable briefs for non-lawyers in India.

---

## 📖 Overview

**Aequitas** is an open-source web application engineered for everyday individuals without a legal background. When a user pastes or uploads a legal contract — such as a Leave & Licence agreement, freelance contract, employment offer letter, consumer privacy policy, or loan sanction letter — Aequitas provides:

1. **Plain-Language Summary**: 8th-grade reading level executive overview.
2. **Clause-by-Clause Breakdown**: Severity and risk scoring tuned strictly to user **Persona** and **State Jurisdiction**.
3. **Grounded Document Q&A**: Interactive Q&A backed by in-process BM25 retrieval with clickable citation chips (`[c-0001]`).
4. **Contract Comparison Matrix**: Compare clauses against a second contract or built-in fair market baselines.
5. **Action Checklist & Negotiation Asks**: Concrete counter-proposals with suggested redline wording.
6. **1-Page Printable Lawyer Brief**: Structured intake summary to hand to a legal aid attorney.
7. **Emergency Safety Escalation**: Automatic detection of emergency scenarios (evictions, harassment, court summons) routing users to free legal aid resources (NALSA, Tele-Law, NCH 1915).

Aequitas **never gives legal advice** and operates on a privacy-first, zero-persistence model.

---

## 🎯 Target Personas & Jurisdictions

### Verticals & Personas

| Persona | Target User | Typical Contracts | Primary Concerns & Risks |
|---|---|---|---|
| `tenant` | Home renter | Leave & Licence, rent agreement, NOC | Deposit forfeiture, sudden eviction, hidden charges, lock-in period |
| `freelancer` | Independent contractor | Service agreement, SOW, NDA, MSA | Non-payment, unlimited liability, IP assignment on signature, non-competes |
| `employee` | Salaried worker | Offer letter, employment contract, bond | Long notice periods, training bonds/penalties, non-competes, garden leave |
| `consumer` | App user / buyer | Privacy policy, T&C, warranty, insurance | Data sharing, auto-renewal, arbitration waivers, unilateral amendments |
| `borrower` | Credit applicant | Loan sanction letter, personal loan, guarantee | Hidden interest rates, prepayment/foreclosure fees, guarantor liability |

### Supported Jurisdictions
- **Default Jurisdiction**: India (State-selectable: Maharashtra `MH`, Delhi `DL`, Karnataka `KA`, Telangana `TG`, West Bengal `WB`, and `Other`).
- **Statute Pointers**: Informational pointers referencing relevant statutes (e.g., *Maharashtra Rent Control Act 1999*, *Indian Contract Act 1872 §27*, *Consumer Protection Act 2019*, *DPDP Act 2023*).

---

## ⚙️ Architecture & Data Flow

```mermaid
flowchart TD
    A[Raw PDF / DOCX / Text Input] --> B[Parser & Clause Segmentation with Offsets]
    B --> C[Deterministic Rule Detectors (~20 detectors)]
    C --> D[Deterministic Context Engine]
    D --> E[AnalysisPlan Generation]
    E --> F[Plan-Driven LLM Passes / Mock Adapter]
    F --> G[Zod Output Schema Validation & Repair]
    G --> H[Deterministic Risk Scoring Engine]
    H --> I[4-Pane Workspace UI & Printable Lawyer Brief]
```

### Key Technical Architecture Highlights

- **Deterministic Context Engine** ([`src/lib/context/router.ts`](file:///c:/Users/Asus/OneDrive/Desktop/Aequitas/src/lib/context/router.ts)): Evaluates Persona $\times$ Jurisdiction $\times$ Goal $\times$ Deadline *before* any LLM call to generate a deterministic `AnalysisPlan`.
- **In-Process BM25 Retrieval** ([`src/lib/bm25/index.ts`](file:///c:/Users/Asus/OneDrive/Desktop/Aequitas/src/lib/bm25/index.ts)): Lightweight, fast in-memory text retrieval over clause chunks with zero external vector database dependencies.
- **Pluggable LLM Adapter System** ([`src/lib/llm/`](file:///c:/Users/Asus/OneDrive/Desktop/Aequitas/src/lib/llm/)): Supports **Google Gemini**, **Anthropic Claude**, and a deterministic **Mock Provider** for zero-API-key offline development.
- **PII Redaction & Sanitization** ([`src/lib/security/`](file:///c:/Users/Asus/OneDrive/Desktop/Aequitas/src/lib/security/)): Aadhaar, PAN, phone numbers, email addresses, and names are sanitized prior to model inference.

---

## 🚀 API Endpoint Reference

| Endpoint | Method | Description | Payload Schema |
|---|---|---|---|
| `/api/parse` | `POST` | Parses PDF/DOCX/TXT into segmented clauses with character offsets | `FormData` or `{ text: string }` |
| `/api/analyze` | `POST` | Runs Context Engine rules & LLM synthesis to return risk cards & brief | `{ clauses, context, documentType }` |
| `/api/ask` | `POST` | BM25 retrieval + LLM grounded Q&A with strict citation validation | `{ question, context, clauses }` |
| `/api/compare` | `POST` | Compares two contracts or document vs fair market baseline | `{ docA, docB, context, isBaseline }` |
| `/api/brief` | `POST` | Formats 1-page printable legal brief and plain-text markdown export | `{ synthesis, context, documentType }` |

---

## ⚡ How to Run Locally

### 1. Mock Mode (Default - Zero API Key Required)

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Real LLM Mode (Gemini / Anthropic)

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Configure `.env.local`:
   ```env
   LLM_PROVIDER=gemini
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.0-flash
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

---

## 🧪 Testing & Verification

```bash
# Run Unit & Integration Test Suite (111 tests)
npm run test

# Run TypeScript Strict Check
npm run typecheck

# Run Next.js Linter
npm run lint

# Build Production Bundle
npm run build

# Run Playwright E2E Tests
npx playwright test
```

---

## ⚖️ Safety & Legal Disclaimer

- **Informational Purpose Only**: Aequitas is an AI-powered document analysis tool designed for intake preparation and educational clarity. It does not provide formal legal advice or create an attorney-client relationship.
- **Legal Aid Referrals**: If emergency legal situations or high-risk disputes are detected, Aequitas connects users to free legal aid resources:
  - **NALSA Helpline**: `15100`
  - **Tele-Law**: `14416`
  - **National Consumer Helpline**: `1915`

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
