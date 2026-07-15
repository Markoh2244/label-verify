# TTB Label Verify

AI-powered alcohol beverage label verification tool for TTB compliance review.

![TTB Label Verify](https://img.shields.io/badge/Status-Prototype-blue) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Overview

This application helps TTB compliance agents verify that alcohol beverage labels match their submitted COLA (Certificate of Label Approval) applications. It uses OpenAI's GPT-4o vision model to extract text from label images and compare them against application data.

### Key Features

- **Fast Processing**: AI extracts label data in under 5 seconds per label
- **Batch Upload**: Process multiple labels simultaneously for efficiency
- **Smart Matching**: Handles minor formatting differences (capitalization, spacing) while flagging actual mismatches
- **Government Warning Verification**: Strict validation of the required warning statement format
- **Simple Interface**: Clean, intuitive design accessible to users of all technical levels

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key with GPT-4o access

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

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your OpenAI API key:
   ```
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

The application uses OpenAI's GPT-4o vision model to:
- Read text from label images regardless of orientation or lighting
- Extract structured data for each required field
- Handle partial visibility and image quality issues

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

### Trade-offs

1. **Cloud API vs. Local Processing**: Using OpenAI's API provides better accuracy than local OCR but requires internet connectivity. The stakeholder notes mentioned firewall concerns - for production, consider self-hosted alternatives.

2. **Processing Speed vs. Accuracy**: Using `gpt-4o` with `detail: high` provides best accuracy but takes 2-4 seconds per label. Could use `detail: low` for faster but less accurate results.

3. **Fuzzy Matching Threshold**: Current implementation uses simple normalization. More sophisticated fuzzy matching (Levenshtein distance) could be added but may introduce false positives.

## Testing

### Creating Test Labels

As suggested in the requirements, AI image generation tools work well for creating test labels. You can use tools like:
- DALL-E 3
- Midjourney
- Stable Diffusion

Prompt example:
> "A bourbon whiskey bottle label for 'OLD TOM DISTILLERY' showing: Kentucky Straight Bourbon Whiskey, 45% Alc./Vol., 750 mL, with a vintage distillery illustration"

### Sample Test Data

Click "Fill sample data" in the application to populate the form with:
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

Remember to set the `OPENAI_API_KEY` environment variable in your deployment settings.

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

Built with Next.js, TypeScript, Tailwind CSS, and OpenAI GPT-4o Vision.
