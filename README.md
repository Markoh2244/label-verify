# TTB Label Verify

AI-powered alcohol beverage label verification tool for TTB compliance review.

![TTB Label Verify](https://img.shields.io/badge/Status-Prototype-blue) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Overview

This application helps TTB compliance agents verify that alcohol beverage labels match their submitted COLA (Certificate of Label Approval) applications. By default it uses **Tesseract.js** (free local OCR, no API key). Optionally it can use OpenAI GPT-4o when a key is configured.

### Key Features

- **No API key required by default**: Tesseract.js OCR runs locally
- **Optional GPT-4o**: Set `OPENAI_API_KEY` and `VERIFICATION_ENGINE=openai` (or `auto`) for higher accuracy
- **Batch Upload**: Process multiple labels simultaneously for efficiency
- **Smart Matching**: Handles minor formatting differences (capitalization, spacing) while flagging actual mismatches
- **Government Warning Verification**: Strict validation of the required warning statement format
- **Simple Interface**: Clean, intuitive design accessible to users of all technical levels

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- (Optional) OpenAI API key if you want GPT-4o instead of OCR

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd label-verify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment (optional)**
   ```bash
   cp .env.example .env.local
   ```

   Defaults need **no API key**. This free mode uses browser OCR and can be less accurate/slower on hard images. To use OpenAI instead:

   ```
   VERIFICATION_ENGINE=openai
   OPENAI_API_KEY=sk-your-actual-api-key
   ```

   Or use OCR first with OpenAI only when confidence is low:

   ```
   VERIFICATION_ENGINE=auto
   OPENAI_API_KEY=sk-your-actual-api-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Single Label Verification

1. **Upload a label image** - Drag and drop or click to select a label image (PNG, JPG, JPEG, WebP)
2. **Enter application data** - Fill in the fields with data from the COLA application (or use "Fill sample data" for testing)
3. **Click "Verify Label"** - The AI will extract text from the label and compare it against your application data
4. **Review results** - Each field shows match status: Pass (exact match), Fuzzy Match (minor differences), or Fail (mismatch/missing)

### Batch Verification

1. Upload multiple label images at once
2. The system processes them sequentially with progress indication
3. Results are displayed for each label with summary statistics

## Architecture

```
label-verify/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── verify/        # API route for label verification
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main application page
│   ├── components/
│   │   ├── LabelUpload.tsx    # File upload with drag-and-drop
│   │   ├── ApplicationForm.tsx # COLA application data form
│   │   └── VerificationResults.tsx # Results display
│   └── lib/
│       ├── types.ts           # TypeScript interfaces
│       └── comparison.ts      # Field comparison logic
```

## Technical Approach

### Label Extraction

**Default — Tesseract.js + Sharp**
- Preprocesses images (resize, grayscale, contrast)
- Runs free open-source OCR (no API key)
- Parses brand, ABV, net contents, producer, and government warning with heuristics

**Optional — OpenAI GPT-4o**
- Set `VERIFICATION_ENGINE=openai` or `auto` with `OPENAI_API_KEY`
- Better on glare, angles, and small warning text
- Results UI shows which engine was used (`Tesseract OCR` or `GPT-4o`)

**Limitation:** No-key OCR mode is weaker than GPT-4o on imperfect photos and may take longer on complex labels. Prefer clear label images or `auto`/`openai` for demos that need higher accuracy.

### Comparison Logic

Fields are compared using a tiered approach:

| Match Type | Description | Result |
|------------|-------------|--------|
| **Exact** | Normalized text matches exactly | ✅ Pass |
| **Fuzzy** | Minor formatting differences only | ⚠️ Review |
| **Mismatch** | Substantive text differences | ❌ Fail |
| **Missing** | Field not found on label | ❌ Fail |

### Government Warning Validation

The government warning statement receives special treatment:
- Must include "GOVERNMENT WARNING:" in all capitals
- Must contain exact required wording
- No fuzzy matching allowed for this field

## Assumptions & Trade-offs

### Assumptions Made

1. **Single application per batch**: All labels in a batch are compared against the same application data (typical workflow for reviewing multiple images of the same label)
2. **Standard label formats**: Labels follow typical alcohol beverage label conventions
3. **English language**: Text extraction optimized for English labels

### Demo trade-off: free OCR vs. paid vision APIs

This prototype defaults to **Tesseract.js** so reviewers can run and evaluate the product **without purchasing API keys** or wiring cloud billing. That was an intentional demo constraint, not a recommendation for production at TTB scale.

**What we give up with free local OCR:**
- Lower accuracy on imperfect photos (glare, odd angles, small government-warning text)
- More false mismatches / “missing field” results that agents must override by hand
- Less reliable structured extraction (brand vs. producer vs. class/type) than a multimodal model
- Harder to hit the stakeholder **~5 second** usability bar consistently on difficult labels

**What a real-world budget would buy:**
- Switching `VERIFICATION_ENGINE` to `openai` (or `auto`) with an `OPENAI_API_KEY` measurably improves field extraction and warning-statement checks
- With procurement funding, the same architecture could use other commercial or FedRAMP-minded vision APIs, or a self-hosted VLM (e.g. via Ollama / agency-approved hosting) to address the network/firewall concerns raised in discovery
- Paid vision models are the clearer path to the accuracy and speed agents need day-to-day; free OCR is suitable for proving UX and workflow, not for replacing manual review at volume

In short: **Tesseract keeps the demo free and deployable; API-backed (or approved self-hosted) vision is what we’d use in production once budget and compliance allow.**

### Other trade-offs

1. **Cloud API vs. local / self-hosted**: Cloud APIs are simplest for a prototype, but production under Treasury may require approved hosting and limited outbound domains—plan for that early.

2. **Processing speed vs. accuracy**: `gpt-4o` with `detail: high` is typically strong within a few seconds per label; OCR can be faster on clean images but fails more often on the hard cases Sarah and Jenny described.

3. **Fuzzy matching threshold**: Current matching uses simple normalization. Stronger fuzzy matching (e.g. Levenshtein) could reduce false fails but risks false passes—agent override exists for judgment calls either way.

## Testing

### Creating Test Labels

As suggested in the requirements, AI image generation tools work well for creating test labels. You can use tools like:
- DALL-E 3
- Midjourney
- Stable Diffusion

Prompt example:
> "A bourbon whiskey bottle label for 'OLD TOM DISTILLERY' showing: Kentucky Straight Bourbon Whiskey, 45% Alc./Vol., 750 mL, with a vintage distillery illustration"

Sample SVG labels are also included under `public/samples/` — see `public/samples/README.md` for application field values.

### Sample Test Data

Click "Load sample application" in the form to populate:
- Brand Name: OLD TOM DISTILLERY
- Class/Type: Kentucky Straight Bourbon Whiskey
- Alcohol Content: 45% Alc./Vol. (90 Proof)
- Net Contents: 750 mL

## Future Enhancements

Potential improvements not implemented due to scope:

1. **Label template detection** - Auto-detect beverage type and suggest required fields
2. **Historical comparison** - Compare against previous approved labels for the same brand
3. **Batch application data** - Upload CSV of application data for true batch processing
4. **Export reports** - Generate PDF reports of verification results
5. **COLA system integration** - Direct integration with TTB systems (requires authorization)

## Deployment

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

**Important (demo / Hobby plan):** Server-side Tesseract often hits Vercel’s **~10s function timeout** and returns **504**. This app runs **OCR in the browser** and uses `/api/verify` only for fast field comparison, so deploys work without an API key.

For GPT-4o on Vercel, set:
```
OPENAI_API_KEY=...
VERIFICATION_ENGINE=openai
NEXT_PUBLIC_VERIFICATION_ENGINE=openai
```
(Pro plan recommended if server-side vision regularly exceeds Hobby limits.)

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## License

This is a prototype for demonstration purposes.

---

Built with Next.js, TypeScript, Tailwind CSS, Tesseract.js (default), and optional OpenAI GPT-4o Vision.

