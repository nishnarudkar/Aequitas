# Aequitas — Project Demo Video Script & Submission Guide

> **Document Purpose:** Complete reference manual and script for recording the 4-minute submission video for Aequitas.  
> **Target Duration:** 3 minutes 45 seconds (Strictly < 4:00 limit)  
> **Repository Path:** `docs/DEMO_VIDEO_GUIDE.md`

---

## 1. Submission Criteria & Evaluation Alignment

This script and recording guide is engineered to directly satisfy all **6 Official Submission Criteria**:

| Section | Criterion | How Aequitas Meets It | Script Section |
|---|---|---|---|
| **1. Walkthrough** | Show project's core features from start to finish. | Demonstrates full lifecycle: Context Intake Wizard → Context Engine Plan → Document Parse → Risk Workspace → Grounded Q&A → Redline Negotiation → Fair Market Comparison → Printable Lawyer Brief. | Scenes 1 to 6 |
| **2. Live Testing** | Enter data live on screen; test success and edge/error cases. | Performs live selection of Persona/Jurisdiction/Goal, live typing of deadline days, live pasting of Leave & License contract text, tests non-OCR scanned PDF warning edge case, and tests unmentioned Q&A pet question fallback. | Scene 2 & Scene 4 |
| **3. GenAI in Action** | Point out exactly where and how AI powers the solution; prove dynamic response. | Highlights Context Engine analysis plan generation, persona-weighted clause risk scoring, grounded Q&A with clickable citation chips (`[c-0001]`), and AI redline counter-wording generation. | Scene 3 & Scene 4 |
| **4. Clear Presentation** | Logical step-by-step order; steady pacing; visible cursor and readable text. | Structured into 6 timed scenes with exact mouse movement cues, voiceover transcript, on-screen captions, and 2-second pauses on text entry. | All Scenes |
| **5. Time Limit** | Under 4 minutes total length. | Script is timed to **3:45**, providing a 15-second safety buffer under the 4:00 limit. | Timeline Table |
| **6. Submission** | Public Google Drive link or YouTube link tested in incognito mode. | Includes post-recording export, share permission, and incognito verification steps. | Section 5 |

---

## 2. Pre-Recording Preparation Checklist

Before launching your screen recording software, complete these setup steps:

### A. Environment & Server Setup
1. **Start Development Server:**
   ```bash
   # Run in deterministic mock mode (no API key needed)
   LLM_PROVIDER=mock npm run dev

   # OR run with real Gemini 2.0 Flash model if GEMINI_API_KEY is configured
   LLM_PROVIDER=gemini GEMINI_API_KEY=your_key_here npm run dev
   ```
2. **Open Browser:** Navigate to `http://localhost:3000` in Google Chrome or Microsoft Edge.
3. **Clean UI:** Close unnecessary tabs, hide bookmark bar (`Ctrl+Shift+B`), and disable browser extension popups.

### B. Screen Recorder Setup
1. **Resolution:** Set canvas to 1920×1080 (1080p FHD) or 3840×2160 (4K).
2. **Cursor Cues:** Enable "Show Mouse Cues / Mouse Click Effects" in your recording software.
3. **Audio:** Test microphone input for clear speech without echo or background hum.

### C. Fixture Text Preparation
Open [`fixtures/01_tenant_rental_agreement.txt`](file:///c:/Users/Asus/OneDrive/Desktop/Aequitas/fixtures/01_tenant_rental_agreement.txt) in a side text editor so you can copy it quickly to paste live during recording.

---

## 3. Video Timeline & Scene Breakdown

```
[0:00] ── Scene 1: Introduction & Problem Statement (30s)
[0:30] ── Scene 2: Live Intake, Edge Case & Document Parsing (45s)
[1:15] ── Scene 3: Analysis Workspace & Persona Risk Breakdown (65s)
[2:20] ── Scene 4: GenAI Grounded Q&A & Citation Chips (40s)
[3:00] ── Scene 5: Negotiation Redlines & Baseline Comparison (30s)
[3:30] ── Scene 6: Printable Lawyer Brief, Safety & Wrap-up (15s)
[3:45] ── End of Video
```

---

## 4. Master Recording Script & Action Guide

### Scene 1: Introduction & Problem Statement
- **Timestamp:** `0:00 – 0:30` (30 seconds)
- **Visual Action:** 
  - Show the clean Aequitas landing page (`http://localhost:3000`).
  - Move the cursor over the headline: *"Equal footing in every agreement."*
  - Hover over the 3-step Context Wizard cards (Persona, Jurisdiction, Goal).
- **Voiceover Script:**
  > *"Welcome to Aequitas — an AI-powered legal document engine built to give everyday individuals equal footing in every agreement.*
  >
  > *In India, millions of tenants, freelancers, salaried employees, and consumers sign dense legal contracts without understanding predatory lock-in clauses, hidden forfeiture penalties, or notice asymmetries.*
  >
  > *Aequitas transforms complex contracts into plain-language summaries, calculates persona-tuned risk scores, generates redline negotiation asks, and builds a printable brief for free legal aid — all with zero server-side data persistence."*
- **On-Screen Caption:** `Aequitas: Plain-Language Legal Contract Analysis & Persona-Tuned Guidance`

---

### Scene 2: Live Intake, Edge Case & Document Parsing
- **Timestamp:** `0:30 – 1:15` (45 seconds)
- **Visual Action:**
  1. **Live Intake Selection:**
     - Select **Persona**: `Tenant`
     - Select **Jurisdiction**: `Maharashtra (MH)`
     - Select **Goal**: `Negotiate terms`
     - Type **Deadline**: `4` (days)
  2. **Edge Case Demonstration (Scanned PDF Alert):**
     - Click **Upload File** tab. Select an image/scanned file or paste non-OCR text.
     - Highlight the alert: *"Scanned Image PDF Detected — Aequitas prompts user to paste readable text."*
  3. **Live Text Entry:**
     - Click **Paste Text** tab.
     - Paste full text of `01_tenant_rental_agreement.txt`.
     - **Pause 2 seconds** on screen so viewers can read exact values (*INR 150,000 deposit, 11-month lock-in, 7-day licensor notice*).
  4. **Execute Parsing:**
     - Click amber button **"Parse & Inspect Document"**.
     - Point cursor to the generated **Analysis Plan Reasoning** container.
- **Voiceover Script:**
  > *"Let's test Aequitas live. We set our persona as a Tenant in Maharashtra aiming to Negotiate under a 4-day deadline.*
  >
  > *If a user uploads a scanned image PDF, Aequitas detects non-OCR text safely and guides them to paste text directly.*
  >
  > *Now we paste an actual Leave & License agreement. Notice our exact inputs: INR 150,000 deposit and an 11-month lock-in.*
  >
  > *When we click 'Parse & Inspect', our Context Engine dynamically formulates an Analysis Plan tailored to Maharashtra rental law before calling the AI model."*

---

### Scene 3: Analysis Workspace & Persona Risk Breakdown
- **Timestamp:** `1:15 – 2:20` (65 seconds)
- **Visual Action:**
  1. Click green button **"Proceed to Full Analysis Workspace"**.
  2. Highlight the **Plain Language Summary** card (written at an 8th-grade level).
  3. **Risk Scoring Demo:**
     - Scroll down **Key Clause Risks**.
     - Hover cursor on **Clause 4 (Lock-in & Termination)** showing **Risk Score 88/100 (High Risk)**.
     - Click Clause 4 card → split-pane **Document Viewer** automatically scrolls and highlights Clause 4 in red.
  4. Scroll to **Missing Protective Clauses** section (highlighting missing deposit refund guarantee).
- **Voiceover Script:**
  > *"In the Analysis Workspace, our GenAI pipeline analyzes the document against our Context Plan.*
  >
  > *First, we receive an 8th-grade plain-language summary. Next, each clause receives a persona-weighted risk score.*
  >
  > *Look at Clause 4: the licensor demands an 11-month lock-in with deposit forfeiture for the tenant, but reserves the right to terminate with only 7 days' notice.*
  >
  > *Aequitas calculates a severe 88 out of 100 risk score. Clicking the card scrolls the contract viewer straight to the source clause.*
  >
  > *The AI also flags missing protective clauses, like the lack of a mandatory deposit refund window."*

---

### Scene 4: GenAI Grounded Q&A & Citation Chips
- **Timestamp:** `2:20 – 3:00` (40 seconds)
- **Visual Action:**
  1. **Grounded Success Case:**
     - Move to right-side **Ask Document Q&A** panel.
     - Type live: `When will my security deposit be refunded?`
     - Click **Ask**.
     - Show AI output: *"The deposit of INR 150,000 will be refunded within 90 days after vacating..."*
     - Click blue citation chip `[c-0003]` → left pane highlights Clause 3.
  2. **Unmentioned Edge Case:**
     - Type live: `Are pets allowed in the flat?`
     - Click **Ask**.
     - Show response: *"Not mentioned in document text."*
     - Click **"Suggested Lawyer Question: Ask licensor if pet clause can be added"** → click **"Add to Lawyer Brief"**.
- **Voiceover Script:**
  > *"Next, let's look at our grounded document Q&A. Every AI answer is strictly cited.*
  >
  > *We type live: 'When will my security deposit be refunded?' The AI answers dynamically and attaches citation chip `[c-0003]`. Clicking it highlights Clause 3 in the document viewer.*
  >
  > *If we ask an unmentioned question like 'Are pets allowed?', Aequitas prevents hallucination, explicitly states it is missing, and provides a one-click button to add a custom question to our Lawyer Brief."*

---

### Scene 5: Negotiation Redlines & Baseline Comparison
- **Timestamp:** `3:00 – 3:30` (30 seconds)
- **Visual Action:**
  1. Click **Checklist & Negotiation** tab.
     - Scroll through **Negotiation Asks**: highlight proposed redline counter-wording (changing licensor notice from 7 days to 30 days).
  2. Click **Compare** tab.
     - Show side-by-side comparison against **Maharashtra Fair Market Baseline Leave & License Agreement**.
- **Voiceover Script:**
  > *"Under the Checklist & Negotiation tab, Aequitas translates risk analysis into actionable redline clauses you can copy and send directly to your landlord.*
  >
  > *In the Compare tab, we benchmark our agreement against Maharashtra Fair Market baselines to immediately highlight unfair deviations."*

---

### Scene 6: Printable Lawyer Brief, Safety & Wrap-up
- **Timestamp:** `3:30 – 3:45` (15 seconds)
- **Visual Action:**
  1. Click **Print Lawyer Brief** tab.
     - Scroll through 1-page summary showing user context, key risks, custom added questions, and free legal aid helpline pointers (NALSA / Tele-Law 1915).
  2. Hover cursor over the safety legal disclaimer at the bottom.
- **Voiceover Script:**
  > *"Finally, users can print a 1-page Lawyer Brief to take to free legal aid resources like Tele-Law or NALSA.*
  >
  > *Aequitas never provides legal advice, but ensures no everyday citizen enters a negotiation unprepared. Thank you!"*

---

## 5. Video Export & Incognito Submission Guide

After recording:

1. **Export Video:** Save as 1080p MP4 (`.mp4`) or WebM (`.webm`).
2. **Upload & Share:**
   - **Google Drive:** Upload file → Set Sharing to **"Anyone with the link" (Viewer)**.
   - **YouTube:** Upload file → Set Visibility to **Unlisted** (or Public).
3. **Mandatory Incognito Test:**
   - Open a **New Incognito Window** (`Ctrl+Shift+N`).
   - Paste the submission link.
   - Verify the video plays directly without requesting login or access permission.
