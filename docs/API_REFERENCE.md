# Aequitas API Reference

Complete specification for Next.js API endpoints in Aequitas.

---

## 1. `/api/parse` (POST)

Parses uploaded document files (PDF, DOCX, TXT) or raw text payloads into structured clause arrays with character offsets.

### Request Payload
- **Content-Type**: `application/json` or `multipart/form-data`
- Body:
  ```json
  {
    "text": "Leave & Licence agreement text..."
  }
  ```

### Response (200 OK)
```json
{
  "documentId": "doc_12345",
  "detectedType": "rental",
  "confidence": 0.92,
  "wordCount": 450,
  "isScanned": false,
  "clauses": [
    {
      "id": "c-0001",
      "heading": "Security Deposit",
      "text": "The Licensee shall pay a security deposit of INR 50,000...",
      "startOffset": 0,
      "endOffset": 120
    }
  ]
}
```

---

## 2. `/api/analyze` (POST)

Runs Context Engine rules, deterministic clause detectors, and LLM synthesis to return risk cards, action items, negotiation asks, and a legal brief.

### Request Payload
```json
{
  "text": "Full document text...",
  "clauses": [...],
  "context": {
    "persona": "tenant",
    "jurisdiction": "MH",
    "goal": "negotiate",
    "language": "en",
    "readingLevel": "standard"
  },
  "documentType": "rental"
}
```

### Response (200 OK)
```json
{
  "plan": {
    "documentType": "rental",
    "priorityClauseTypes": ["security-deposit", "lock-in"],
    "rationale": ["Tenant in MH with negotiation goal"]
  },
  "synthesis": {
    "summary": "Plain language 8th-grade summary...",
    "topRisks": [...],
    "checklist": [...],
    "negotiationAsks": [...],
    "lawyerBrief": {...}
  }
}
```

---

## 3. `/api/ask` (POST)

Answers user questions about the contract using in-process BM25 clause retrieval and LLM generation with strict citation chip validation.

### Request Payload
```json
{
  "question": "What happens if I leave during the lock-in period?",
  "context": { "persona": "tenant", "jurisdiction": "MH" },
  "clauses": [...]
}
```

### Response (200 OK)
```json
{
  "answer": "If you vacate within the lock-in period, the security deposit is forfeited [c-0001].",
  "citations": ["c-0001"],
  "isUnanswered": false
}
```

---

## 4. `/api/compare` (POST)

Compares clauses between two contracts or a contract vs. built-in fair market baseline.

### Request Payload
```json
{
  "docA": { "title": "Your Rental Contract", "clauses": [...] },
  "context": { "persona": "tenant", "jurisdiction": "MH" },
  "isBaseline": true
}
```

### Response (200 OK)
```json
{
  "items": [
    {
      "clauseType": "security-deposit",
      "docAPosition": "30 days refund",
      "docBPosition": "7 days refund",
      "betterForPersona": "docB",
      "why": "Baseline offers faster deposit return."
    }
  ],
  "summary": "Comparison summary..."
}
```

---

## 5. `/api/brief` (POST)

Formats client intake summary data into a 1-page Lawyer Brief and plain-text markdown export.

### Request Payload
```json
{
  "synthesis": {...},
  "context": { "persona": "tenant", "jurisdiction": "MH" },
  "documentType": "rental"
}
```

### Response (200 OK)
```json
{
  "brief": {...},
  "documentType": "rental",
  "markdownExport": "# AEQUITAS CLIENT LEGAL BRIEF\n..."
}
```
