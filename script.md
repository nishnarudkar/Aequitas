# Aequitas — Submission Video Demo Script & Recording Guide

> **Total Video Target Length:** 3 Minutes 45 Seconds (Strictly under the 4-minute limit)  
> **Project Name:** Aequitas — Equal footing in every agreement.  
> **Target Audience for Video:** Hackathon / Contest Judges

---

## 📋 Pre-Recording Checklist

Before hitting record, ensure you have the following ready:

- [ ] **Development Server Running:** Execute `LLM_PROVIDER=mock npm run dev` (or `LLM_PROVIDER=gemini npm run dev` with valid API key) and open `http://localhost:3000`.
- [ ] **Screen Recording Software:** Set resolution to 1080p (1920x1080) or 4K. Ensure cursor highlight/visibility is turned **ON**.
- [ ] **Sample File / Text Ready:** Open [`fixtures/01_tenant_rental_agreement.txt`](file:///c:/Users/Asus/OneDrive/Desktop/Aequitas/fixtures/01_tenant_rental_agreement.txt) in a side text editor so you can copy and paste it live during recording.
- [ ] **Browser Window:** Clean browser window with extensions hidden and bookmark bar toggled off.
- [ ] **Audio Setup:** Clear microphone with minimal background noise, speaking at a steady, deliberate pace.

---

## ⏱️ Video Timeline & Scene Breakdown

| Scene | Time | Focus Area | Submission Requirement Met |
|---|---|---|---|
| **Scene 1** | 0:00 - 0:30 (30s) | Introduction & Problem Statement | Clear Presentation & Walkthrough Start |
| **Scene 2** | 0:30 - 1:15 (45s) | Live Intake Wizard, Edge Case & Parsing | Live Testing & Readable Inputs |
| **Scene 3** | 1:15 - 2:20 (65s) | Analysis Workspace & Risk Breakdown | GenAI Integration & Persona Tuning |
| **Scene 4** | 2:20 - 3:00 (40s) | Grounded Interactive Q&A & Citation Chips | GenAI in Action (Dynamic vs Edge Case) |
| **Scene 5** | 3:00 - 3:30 (30s) | Negotiation Redlines & Baseline Comparison | Core Feature Demonstration |
| **Scene 6** | 3:30 - 3:45 (15s) | Printable Lawyer Brief, Safety & Wrap-up | Compliance, Safety & Time Limit |

---

## 🎬 Detailed Step-by-Step Script & Actions

### Scene 1: Introduction & Problem Statement (0:00 – 0:30)

**Visual Action:**
- Screen opens on the Aequitas landing page (`http://localhost:3000`).
- Hover cursor smoothly over the header text *"Equal footing in every agreement"* and the 3-Step Context Wizard.

**Audio / Voiceover Script:**
> *"Hi everyone! Welcome to Aequitas — an AI-powered legal document engine designed to give everyday individuals equal footing in every agreement.*
>
> *In India, millions of tenants, freelancers, employees, and consumers sign dense legal contracts every day without understanding predatory clauses, hidden penalties, or notice asymmetries. Aequitas converts complex contracts into plain-language summaries, calculates persona-tuned risk scores, generates actionable redline negotiation points, and builds a printable brief for legal aid — all with zero server-side data persistence."*

**On-Screen Overlay Caption (Optional):**
`Aequitas: Plain-language contract analysis for everyday non-lawyers in India`

---

### Scene 2: Live Intake Wizard, Edge Testing & Parsing (0:30 – 1:15)

**Visual Action:**
1. **Live Intake Selection:**
   - Click **Persona**: Select `Tenant`.
   - Click **Jurisdiction**: Select `Maharashtra (MH)`.
   - Click **Goal**: Select `Negotiate terms`.
   - Set **Deadline**: Type `4` in the deadline input field.
2. **Edge Case Test (Scanned PDF Warning):**
   - Click **Upload File** tab. Select a sample scanned image PDF if available (or switch to Paste tab and paste a short invalid line `"Scanned document image"`).
   - *Show warning badge:* Demonstrate how Aequitas detects non-OCR/scanned content safely.
3. **Success Case Live Data Entry:**
   - Click **Paste Text** tab.
   - Paste the contents of `01_tenant_rental_agreement.txt` live into the text area.
   - **Pause 2 seconds** on screen so viewers can read the input values (e.g. *INR 150,000 security deposit*, *7-day notice period*, *11-month lock-in*).
4. **Execute Parsing:**
   - Click the amber **"Parse & Inspect Document"** button.
   - Show the generated **Analysis Plan Reasoning** box that appears dynamically based on Maharashtra jurisdiction and the tenant persona.

**Audio / Voiceover Script:**
> *"Let's test Aequitas live. We'll set our persona as a **Tenant** in **Maharashtra**, with a goal to **Negotiate**, and a tight deadline of **4 days**.*
>
> *Next, we paste our actual Leave & License contract text directly on screen. Aequitas parses the raw text into structured clauses and passes them to our deterministic Context Engine.*
>
> *Notice how the engine immediately generates an Analysis Plan specific to Maharashtra rental laws, prioritizing deposit forfeiture and asymmetric termination risks."*

---

### Scene 3: Analysis Workspace & GenAI Risk Breakdown (1:15 – 2:20)

**Visual Action:**
1. Click **"Proceed to Full Analysis Workspace"**.
2. **Summary View:** Highlight the **Plain Language Summary** card (written at an 8th-grade reading level).
3. **Risk Scoring Demonstration:**
   - Scroll through **Key Clause Risks**.
   - Hover over **Clause 4 (Lock-in & Termination)** showing **Risk Score 88/100 (High Risk - Get legal advice)**.
   - Click on the Clause 4 card -> Watch the left-hand **Document Viewer** automatically scroll and highlight Clause 4 in red.
4. **Missing Clauses Section:**
   - Scroll to **Missing Protective Clauses**. Show missing items like *"Deposit Return Deadline Guarantee"* and *"Licensor Repairs Cap"*.

**Audio / Voiceover Script:**
> *"In the Analysis Workspace, our GenAI pipeline takes the structured Analysis Plan and evaluates every clause.*
>
> *First, we get an 8th-grade plain-language summary. Next, each clause receives a persona-weighted risk score. Look at Clause 4: the licensor demands an 11-month lock-in with deposit forfeiture for the tenant, but allows themselves to terminate with only 7 days' notice.*
>
> *Aequitas flags this as an 88 out of 100 severe risk. Clicking the risk card instantly scrolls the split-pane viewer to highlight the exact contract clause.*
>
> *The AI also detects missing protective clauses — such as the absence of a strict deposit refund guarantee."*

---

### Scene 4: Grounded Interactive Q&A & Citation Chips (2:20 – 3:00)

**Visual Action:**
1. **Live Input (Grounded Success Case):**
   - In the right-hand **Ask Document Q&A** panel, type live:  
     `When will my security deposit be refunded?`
   - Click **Ask**.
2. **Show GenAI Response & Citations:**
   - Show AI answer: *"The deposit of INR 150,000 will be refunded within 90 days after vacating..."*
   - Point cursor to the blue clickable citation chip `[c-0003]`. Click `[c-0003]` -> split pane highlights Clause 3 in Document Viewer.
3. **Live Input (Edge Case - Unanswered Query):**
   - Type live in Q&A box:  
     `Are pets allowed in the flat?`
   - Click **Ask**.
   - Show response: *"Not mentioned in document text."*
   - Show button: **"Suggested Lawyer Question: Ask licensor if pet clause can be added"**. Click **"Add to Lawyer Brief"**.

**Audio / Voiceover Script:**
> *"Now let's look at GenAI in action with our grounded Q&A engine. Every response MUST be strictly backed by contract citations.*
>
> *We type live: 'When will my security deposit be refunded?' The AI answers instantly and attaches citation chip `[c-0003]`. Clicking the chip navigates straight to the source clause.*
>
> *What if we ask about something NOT in the agreement? We type: 'Are pets allowed?' The model safely recognizes it is unmentioned, prevents hallucinations, and offers a one-click button to add a custom question to our Lawyer Brief."*

---

### Scene 5: Negotiation Redlines & Baseline Comparison (3:00 – 3:30)

**Visual Action:**
1. Click **Checklist & Negotiation** tab.
   - Show **Negotiation Asks**: Highlight proposed redline counter-wording (e.g. changing Licensor notice from 7 days to 30 days).
2. Click **Compare** tab.
   - Show document comparison against **Maharashtra Fair Market Baseline**.
   - Highlight the side-by-side delta showing how this contract strays from standard market terms.

**Audio / Voiceover Script:**
> *"Under the Checklist & Negotiation tab, Aequitas transforms findings into immediate action items, providing exact redline wording to send to the landlord.*
>
> *In the Compare tab, we benchmark our document against a pre-loaded Fair Market Baseline for Maharashtra rental agreements, instantly surfacing unfair deviations."*

---

### Scene 6: Printable Lawyer Brief, Safety & Wrap-up (3:30 – 3:45)

**Visual Action:**
1. Click **Print Lawyer Brief** tab.
   - Show the clean 1-page printable summary featuring key findings, user context, custom questions added, and free legal aid helpline pointers (NALSA / Tele-Law 1915).
2. Highlight disclaimer banner at bottom.

**Audio / Voiceover Script:**
> *"Finally, the user can generate a 1-page Printable Lawyer Brief to take to free legal aid services like Tele-Law or NALSA. Aequitas never gives formal legal advice, but ensures no non-lawyer ever walks into a negotiation blind.*
>
> *Thank you for watching!"*

---

## 📌 Submission Checklist Mapping

Verify that your video includes every single criteria item required by the judges:

| Criteria | How It Is Addressed In Script | Timestamp |
|---|---|---|
| **1. Walkthrough** | Complete end-to-end flow: Context Wizard -> Parse -> Analysis Workspace -> Q&A -> Redlines -> Baseline Compare -> Lawyer Brief | 0:00 – 3:45 |
| **2. Live Testing** | Live selection of options, live typing/pasting of agreement text, readable values shown, tested valid rental input & scanned/unsupported edge cases | 0:30 – 1:15 |
| **3. GenAI in Action** | Explicit callouts for Context Engine prompt planning, clause risk extraction, grounded citation Q&A (`[c-0001]`), dynamic redline text generation | 1:15 – 3:00 |
| **4. Clear Presentation** | 6 logical step-by-step scenes, steady cursor movements, clear narration transcript, zero rushed typing | Entire Video |
| **5. Time Limit** | Total length is **3 minutes 45 seconds**, leaving a 15-second buffer under the 4-minute ceiling | Total: 3m 45s |
| **6. Submission Link** | Shared via public Google Drive link ("Anyone with link") or YouTube Unlisted video link | Post-recording |

---

## 📤 Upload & Verification Guide

1. **Record & Export:** Save video as `.mp4` or `.webm` in HD 1080p.
2. **Option A — Google Drive:**
   - Upload your video file to Google Drive.
   - Right-click the file -> **Share** -> Change access to **"Anyone with the link" (Viewer)**.
   - Copy the share link.
3. **Option B — YouTube:**
   - Upload video to YouTube.
   - Set visibility to **Unlisted** (or Public).
   - Copy the YouTube video link.
4. **Incognito Verification (MANDATORY):**
   - Open a **New Incognito / Private Window** in your browser.
   - Paste the link into the address bar.
   - Confirm that the video plays immediately without requiring a Google login or permission request!
