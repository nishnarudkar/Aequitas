# Setup and Testing Guide

Complete guide for installing, running, configuring, and testing **Aequitas**.

---

## 1. Prerequisites

- **Node.js**: v18.x or v20.x
- **npm**: v9.x or higher
- **Git**

---

## 2. Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/nishnarudkar/Aequitas.git
cd Aequitas

# 2. Install dependencies
npm install

# 3. Start development server in zero-config Mock Mode
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

### Mock Mode (Default)
```env
LLM_PROVIDER=mock
```

### Google Gemini Mode
```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
```

### Anthropic Claude Mode
```env
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

---

## 4. Running Test Suites

### Unit & Integration Tests (Vitest)
```bash
# Run unit test suite (111 tests)
npm run test

# Watch mode during development
npm run test:watch

# Coverage report
npm run test:coverage
```

### Typechecking & Linting
```bash
# TypeScript strict type check
npm run typecheck

# ESLint check
npm run lint
```

### Production Build
```bash
# Build optimized Next.js bundle
npm run build

# Start production server
npm run start
```

### Playwright E2E Tests
```bash
# Execute happy-path E2E tests
npx playwright test
```
