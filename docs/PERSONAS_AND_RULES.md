# Personas, Jurisdictions & Risk Model Rules

Specification of personas, jurisdictional statutes, risk formulas, and baseline clauses in **Aequitas**.

---

## 1. Persona Profiles

| Persona ID | Who | Target Contracts | Key Concerns & Risk Targets |
|---|---|---|---|
| `tenant` | Home Renter | Leave & Licence, Rent Agreement | Deposit forfeiture, lock-in period, notice asymmetry, rent escalation |
| `freelancer` | Independent Contractor | Service Agreement, SOW, NDA, MSA | Payment terms, late payment interest, IP assignment, non-compete |
| `employee` | Salaried Worker | Offer Letter, Employment Contract | Notice period length, training bonds, garden leave, non-compete |
| `consumer` | App User / Buyer | T&C, Privacy Policy, Warranty | Data sharing, unilateral amendments, arbitration waivers, auto-renewal |
| `borrower` | Credit Applicant | Loan Sanction Letter, Guarantee | Prepayment penalty, hidden interest, guarantor liability, default recovery |

---

## 2. Jurisdictions & Statute Pointers

Aequitas includes non-opinion informational pointers referencing statutory frameworks in India:

- **Maharashtra (`MH`)**: *Maharashtra Rent Control Act 1999* (Leave & Licence registration, deposit terms).
- **Delhi (`DL`)**: *Delhi Rent Control Act 1958* / *Model Tenancy Act*.
- **Karnataka (`KA`)**: *Karnataka Rent Control Act 1999*.
- **Telangana (`TG`)** / **West Bengal (`WB`)**: Regional Tenancy & Contract Norms.
- **Generic / All States**:
  - *Indian Contract Act 1872 §27* (Non-compete clauses voidness pointers).
  - *Consumer Protection Act 2019* (Unfair contract terms pointers).
  - *Digital Personal Data Protection Act 2023 (DPDP)* (Privacy & data consent pointers).

---

## 3. Deterministic Risk Scoring Model

Risk scores range from $0$ to $100$ and map to 4 risk bands:

$$\text{RiskScore} = \text{clamp}\left(0, 100, \text{severity} \times 10 \times \text{personaWeight} + \text{asymmetryPenalty} + \text{deadlinePressure} - \text{mutualityCredit}\right)$$

### Risk Bands
- **`standard` (0–29)**: Standard commercial terms.
- **`worth-a-look` (30–59)**: Requires client awareness.
- **`negotiate` (60–79)**: One-sided term; negotiate before signing.
- **`get-advice` (80–100)**: High-risk clause; consult a legal aid professional.

---

## 4. Fair Baseline References

Aequitas maintains fair market baselines ([`src/data/baselines/`](file:///c:/Users/Asus/OneDrive/Desktop/Aequitas/src/data/baselines/)) for:
- **`rental.json`**: 30-day reciprocal notice, 7-day deposit refund, max 1-month lock-in.
- **`service-agreement.json`**: Net 15/30 payment terms, mutual IP retention, mutual termination.
- **`employment.json`**: 30-day notice, non-compete limited to employment duration.
