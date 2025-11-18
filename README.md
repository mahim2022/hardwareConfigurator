## Hardware Configurator

Requirement-driven PC/Laptop/Server recommender focused on enterprise and bulk procurement workflows. Users fill a structured brief, a rules engine derives the baseline spec, and OpenRouter (Claude 3.5 Sonnet by default) adds reasoning plus alternatives.

### Tech Stack
- Next.js App Router + React 19
- Tailwind CSS v4 (inline directives)
- API route for rules + OpenRouter chat completion

## Setup

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to use the requirement form UI.

### Environment variables

Copy `env.sample` to `.env.local` and add your OpenRouter key:

```
OPENROUTER_API_KEY=sk-or-xxxxxxxx
```

Without the key, the UI still shows the rule-based baseline, but AI reasoning is disabled.

## API Route (Hoppscotch-ready)

Endpoint: `POST http://localhost:3000/api/generate`

Example JSON body:

```json
{
  "usageType": "coding",
  "budgetRange": "1500-2000",
  "quantity": "20-50",
  "formFactor": "laptop",
  "requiredSoftware": ["VS Code", "Docker Desktop"],
  "brandConstraints": "Dell, Lenovo",
  "performancePriority": "cpu",
  "storageRequirements": "1 TB NVMe",
  "networkingNeeds": "Dual 2.5GbE via dock, Wi-Fi 7",
  "warrantyPreferences": "3Y onsite NBD",
  "complianceNotes": "TPM 2.0, Bitlocker ready"
}
```

Use Hoppscotch or any REST client to validate the payload/response before wiring other consumers.

Response payload:
- `baselineSpec`: Deterministic build derived from rule mappings
- `aiSummary`: JSON narrative from OpenRouter (null if the key is missing or the call fails)
- `generatedAt`: ISO timestamp

## Next Steps

- Persist briefs/configurations in MongoDB
- Add PDF/export pipeline
- Introduce authentication for multi-tenant procurement teams
