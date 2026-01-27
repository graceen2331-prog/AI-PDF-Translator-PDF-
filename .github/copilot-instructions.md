# AI PDF Translator - Copilot Instructions

## Project Overview

A React + Vite SPA for translating English PDFs to Simplified Chinese using LLM APIs. Extracts text from PDFs using `pdfjs-dist`, maintains text structure through coordinate-based parsing, and processes pages sequentially with status tracking. Originally built for financial reports and technical documentation.

## Architecture & Data Flow

### Core Pipeline (Sequential Processing)
1. **PDF Upload** → [`FileUpload.tsx`](../components/FileUpload.tsx): File validation (PDF only, drag-and-drop)
2. **Text Extraction** → [`pdfUtils.ts`](../services/pdfUtils.ts): Coordinate-based parsing with heuristic layout reconstruction
3. **Translation Loop** → [`App.tsx`](../App.tsx): Sequential page-by-page translation (avoids rate limits)
4. **Display** → [`TranslationViewer.tsx`](../components/TranslationViewer.tsx): Side-by-side original/translated with print support

### State Management
- **Local state in `App.tsx`**: File, pages array (`TranslationPage[]`), progress, error
- **No global state**: Single-component orchestration pattern
- **Page status lifecycle**: `pending` → `processing` → `completed`/`error`

## Critical Technical Decisions

### PDF Text Extraction Logic ([`pdfUtils.ts`](../services/pdfUtils.ts))
- **Coordinate-based parsing**: Uses `transform[4]` (X) and `transform[5]` (Y) from PDF.js items
- **Sorting**: Y descending (top-to-bottom), then X ascending (left-to-right)
- **Line grouping**: Items within 8 units on Y-axis are treated as same line
- **Paragraph detection**: Vertical gap > 20 units triggers new paragraph
- **Hyphen handling**: Removes trailing `-` when merging lines (e.g., "commu-nication" → "communication")
- **List preservation**: Detects bullet points (`^[•\-\*]`) and numbered lists (`^\d+\.`) to avoid merging with previous line

**Why this matters**: Changing thresholds (8, 20 units) affects text structure quality. Too strict = broken sentences, too loose = merged sections.

### LLM Integration ([`geminiService.ts`](../services/geminiService.ts))
- **API Provider**: **DeepSeek API** via backend proxy (Vercel Serverless Function)
- **Backend Proxy**: [`api/translate.ts`](../api/translate.ts) - keeps API key secure on server
- **Endpoint**: Frontend calls `/api/translate`, proxy calls `https://api.deepseek.com/chat/completions`
- **Model**: `deepseek-chat` (OpenAI-compatible API)
- **API Key**: Stored in `DEEPSEEK_API_KEY` env variable (server-side only, no `VITE_` prefix)
- **System Prompt**: "Translate to Simplified Chinese, maintain formatting and tone"
- **No streaming**: `stream: false` for simpler state management

**Security**: API key is never exposed to frontend. The serverless function acts as a secure proxy.

### Sequential vs Parallel Translation
- **Current**: Pages translated one-by-one in [`App.tsx`](../App.tsx) (lines 33-54)
- **Why**: Avoids rate limits, shows progressive updates, simpler error isolation
- **Trade-off**: Slower than parallel but more reliable for large documents

## Development Workflows

### Local Setup
```bash
npm install
npm run dev        # Frontend only (localhost:3000)
npm run dev:api    # API server only (localhost:3001) - requires vercel CLI
npm run dev:full   # Both frontend + API concurrently
```

### Environment Variables
Create `.env` file in project root:
```
DEEPSEEK_API_KEY=sk-xxxxx  # Server-side only (no VITE_ prefix)
```

**Important**: For Vercel deployment, add `DEEPSEEK_API_KEY` in Project Settings → Environment Variables.

### Build & Deploy
```bash
npm run build    # Output to dist/
npm run preview  # Test production build locally
```

### Debugging PDF Extraction Issues
1. Check console for coordinate dumps in [`pdfUtils.ts`](../services/pdfUtils.ts)
2. Common issues:
   - Multi-column layouts: Adjust X-sorting logic (line 60)
   - Broken paragraphs: Tweak `dy > 20` threshold (line 113)
   - Missing text: Verify `item.str.trim()` filter (line 47)

## Project-Specific Conventions

### Styling Approach
- **Tailwind via CDN**: Configured in [`index.html`](../index.html) with custom theme (brand colors, fonts)
- **Print styles**: `.no-print` / `.print-only` classes for PDF export functionality
- **Font families**:
  - `font-sans` (Inter) for English/UI
  - `font-chinese` (Noto Sans SC) for Chinese translations

### Component Patterns
1. **Props over Context**: All components use explicit props (no React Context)
2. **Callback pattern**: `onFileSelect` in [`FileUpload.tsx`](../components/FileUpload.tsx) triggers processing in parent
3. **Status-driven rendering**: Components render based on `status` field in `TranslationPage` type

### Type System ([`types.ts`](../types.ts))
```typescript
interface TranslationPage {
  id: number;                 // Page number (1-indexed)
  originalText: string;        // Extracted from PDF
  translatedText: string;      // LLM output
  status: 'pending' | 'processing' | 'completed' | 'error';
}
```

### Error Handling Strategy
- **PDF parsing errors**: Caught in [`pdfUtils.ts`](../services/pdfUtils.ts), rethrown with descriptive message
- **Translation errors**: Per-page error status (doesn't block other pages)
- **API errors**: Show error message in UI, allow reset via `handleReset()`

## Key Files Reference

| File | Purpose | Critical Logic |
|------|---------|----------------|
| [`App.tsx`](../App.tsx) | Main orchestrator | Sequential translation loop (lines 33-54) |
| [`api/translate.ts`](../api/translate.ts) | Backend proxy | Vercel Serverless Function, protects API key |
| [`services/geminiService.ts`](../services/geminiService.ts) | Translation client | Calls `/api/translate` endpoint |
| [`services/pdfUtils.ts`](../services/pdfUtils.ts) | PDF parsing | Coordinate-based layout reconstruction (lines 60-113) |
| [`components/TranslationViewer.tsx`](../components/TranslationViewer.tsx) | Results display | Side-by-side view with Markdown rendering |
| [`vite.config.ts`](../vite.config.ts) | Build config | Env variable injection, dev server port |

## Common Modification Patterns

### Changing Translation Provider
1. Update API endpoint and headers in [`geminiService.ts`](../services/geminiService.ts)
2. Adjust request/response format to match new provider's schema
3. Update env variable name if desired (currently `VITE_GEMINI_API_KEY`)

### Adjusting PDF Layout Detection
- **Line grouping**: Modify `Math.abs(item.y - currentLineY) < 8` in [`pdfUtils.ts`](../services/pdfUtils.ts) (line 68)
- **Paragraph breaks**: Change `dy > 20` threshold (line 113)
- **Hyphen merging**: Toggle `if (pageContent.endsWith('-'))` logic (line 124)

### Adding Translation Options
1. Extend system prompt in [`geminiService.ts`](../services/geminiService.ts)
2. Add UI controls in [`App.tsx`](../App.tsx) (e.g., target language selector)
3. Pass options through `translateTextWithGemini()` optional params
