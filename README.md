# Veryon Data Wizard

Build "Veryon Excel Transformation Tool" — a 4-step wizard web app that lets a user pick a

template, upload a customer Excel file, map its columns to the template's columns with

transformations, and download a generated output workbook.

BRANDING & VISUAL DESIGN

- Company name: Veryon. Show "Veryon" (plus "Excel Transformation Tool" as a subtitle) in the

  top navigation bar/header on every page.

- Primary color: black (#000000 / near-black e.g. #0A0A0A for surfaces) — used for the header

  background, primary buttons, active nav/stepper states, and body text.

- Secondary/accent color: yellow (#FFC107 or #FBBF24) — used for primary call-to-action buttons

  (e.g. "Generate", "Download", "Continue"), the active step indicator in the ProgressStepper,

  selected TemplateCard border/highlight, links, and small accent details (icons, badges).

- Background: white/light gray (#FFFFFF, #F9FAFB) for page canvas and cards, so black and

  yellow both stand out — do not use black as the page background, only header/nav/buttons.

- Configure this as a Tailwind theme (tailwind.config): extend colors with

  brand.black = "#000000" (or "#0A0A0A") and brand.yellow = "#FBBF24", and use those tokens

  instead of hardcoded colors throughout components. Also set shadcn/ui's primary color to the

  black tone and a custom "accent"/secondary variant to the yellow tone for buttons/badges.

- Typography: clean, modern sans-serif (e.g. Inter), bold headings, generous whitespace —

  professional/enterprise feel (this is a B2B ops tool), not playful.

- Buttons: primary actions (Generate, Continue, Download) = yellow background with black text

  (high contrast); secondary/ghost actions (Back, Cancel) = black outline or plain text on

  white.

- Header: black bar, "Veryon" wordmark/logo placeholder in white or yellow, ProgressStepper

  underneath or inline showing the 4 wizard steps with the active step highlighted in yellow.

- Favicon/page title: "Veryon | Excel Transformation Tool".

TECH STACK (use exactly this, do not substitute defaults):

- React 18 + TypeScript (strict mode), Vite

- TanStack Router for routing (NOT React Router) — typed routes carrying templateId/uploadId/jobId

- TanStack Query for ALL server/API calls, caching, and loading/error state

- TanStack Table for the Excel preview grid and mapping table

- TanStack Form for the mapping row forms and formula inputs

- Zustand for client state (selected template, upload metadata, in-progress mappings, wizard step),

  persisted to sessionStorage (not localStorage)

- Tailwind CSS + shadcn/ui components (Dialog, Card, Table, Button, Tabs, Toast, Select, Input),

  themed with the black/yellow brand tokens above

- Monaco Editor for a formula editor with {{ColumnName}} placeholder autocomplete

- Do NOT use Supabase or any built-in backend/database — this app talks to an external REST API

  only, via fetch, with the base URL read from an environment variable (VITE_API_BASE_URL,

  default "http://127.0.0.1:8000")

APP FLOW (linear 4-step wizard with a black-and-yellow ProgressStepper at the top of every step):

1. Choose Template  → route /templates

2. Upload Excel     → route /upload/:templateId

3. Mapping Screen   → route /mapping/:templateId/:uploadId

4. Download         → route /download/:jobId

STEP 1 — Choose Template (/templates)

- On mount, call GET {API_BASE_URL}/api/templates → returns an array of

  { id, name, description, sheet_name }

- Render each as a selectable TemplateCard (shadcn Card) in a responsive grid; selected/hovered

  card gets a yellow border/ring highlight

- Selecting a card stores templateId in the Zustand store and navigates to /upload/:templateId

STEP 2 — Upload Excel (/upload/:templateId)

- On mount, call GET {API_BASE_URL}/api/templates/{templateId} to get the template's

  { columns, required_columns, output_format } so we can show what's expected

- UploadBox component: drag-and-drop + a plain file input, accepts only .xlsx; dashed black

  border, turns yellow on drag-over

- Client-side pre-checks before sending: file extension must be .xlsx, size must be ≤ 10MB —

  show inline errors if either fails, without calling the API

- On valid file, POST multipart/form-data to {API_BASE_URL}/api/upload with field name "file"

  using a TanStack Query mutation; show upload progress/loading state

- Response shape: { upload_id, file_name, columns, sample_rows, row_count }

- Handle 400 errors from the API (body: { detail: string }) as an inline alert (e.g. wrong

  extension, oversized, or "File content is not a valid Excel workbook")

- On success: store upload_id/columns/sample_rows in Zustand, render a PreviewGrid (TanStack

  Table) of the sample_rows with the detected columns as headers (paginated, read-only), then

  navigate to /mapping/:templateId/:uploadId

STEP 3 — Mapping Screen (/mapping/:templateId/:uploadId)

- Fetch template detail (columns + required_columns) and reuse the stored upload columns

- Render one MappingRow per template destination column, in template column order:

  - A multi-select of source columns (options = upload.columns)

  - An operation dropdown with exactly these values: copy, trim, uppercase, lowercase,

    concatenate, multiply, formula, replace, date_format, constant

  - Conditional fields per operation:

    - concatenate → "separator" text input (default " ")

    - replace → "find" and "replace" text inputs

    - date_format → "format" text input (strftime pattern, default "%Y-%m-%d")

    - constant → "value" text input, and disable/hide the source-column selector

    - formula → show the FormulaEditor (Monaco) instead of a plain input

- FormulaEditor: Monaco-based, single-line-ish formula editor for expressions like

  "{{Price}} * {{Quantity}}". Autocomplete {{...}} suggestions from upload.columns only.

  Support + - * / % and parentheses. This is UI-only — never evaluate formulas in the browser,

  the backend evaluates them safely.

- Client-side validation before enabling "Generate":

  - every column in template.required_columns must have a mapping row with ≥1 source

    (constant operations count as satisfying a required column even with 0 sources)

  - concatenate needs ≥2 sources

  - multiply needs ≥1 source

  - formula needs a non-empty formula string, and every {{placeholder}} in it must be one of

    upload.columns

  - constant needs a non-empty "value" option

  - no duplicate destination rows

  - show inline validation errors per row; disable the Generate button (yellow, disabled = gray)

    until all pass

STEP 4 — Generate & Download

- "Generate" button (yellow, black text) builds this exact JSON body and POSTs to

  {API_BASE_URL}/api/generate:

  {

    "template_id": string,

    "upload_id": string,

    "mappings": [

      {

        "destination": string,

        "sources": string[],

        "operation": "copy"|"trim"|"uppercase"|"lowercase"|"concatenate"|"multiply"|"formula"|"replace"|"date_format"|"constant",

        "formula": string | null,

        "options": { [key: string]: any }

      }

    ]

  }

- Success (200): response is a binary .xlsx file with header X-Job-Id containing a job id.

  Trigger a browser download of the blob, then navigate to /download/:jobId and show a

  DownloadCard (black header icon, yellow accent button) with the file name, a "Download again"

  button (re-fetches GET {API_BASE_URL}/api/download/{jobId}), and a "Start over" button that

  resets the Zustand store and navigates back to /templates

- Error 400 (mapping validation failed): body is

  { "detail": "Mapping validation failed", "errors": [{ "destination": string, "message": string }] }

  → show a shadcn Dialog listing every error, each one linking/scrolling back to the offending

  MappingRow on the mapping screen

- Error 404 (unknown template_id or upload_id): body is { "detail": string } → show as a toast

  and offer to start over

CROSS-CUTTING

- Global TanStack Query client with sane defaults (1 retry for GET requests, no auto-retry on

  the generate mutation to avoid duplicate file generation)

- Persist the Zustand store to sessionStorage so refreshing mid-wizard doesn't lose progress

- Loading skeletons for template list, upload preview, and mapping screen

- Keyboard-accessible ProgressStepper with aria-current on the active step

- Consistent black/yellow branding across every page and component (see BRANDING section)

FOLDER STRUCTURE

src/

├── components/   (TemplateCard, UploadBox, PreviewGrid, MappingRow, FormulaEditor,

│                  ProgressStepper, DownloadCard)

├── pages/        (ChooseTemplate, UploadExcel, Mapping, Download — route components)

├── routes/       (TanStack Router route tree)

├── hooks/        (useTemplates, useUpload, useGenerate, useMappingValidation)

├── api/          (typed fetch client + endpoint functions used by TanStack Query)

├── store/        (Zustand store)

└── types/        (MappingRule, Operation, Template, UploadResult types — mirrored below)

TYPES (define these exactly in src/types/):

type Operation = "copy" | "trim" | "uppercase" | "lowercase" | "concatenate" | "multiply"

  | "formula" | "replace" | "date_format" | "constant";

interface MappingRule {

  destination: string;

  sources: string[];

  operation: Operation;

  formula?: string | null;

  options?: Record<string, unknown>;

}

interface TemplateSummary { id: string; name: string; description: string; sheet_name: string; }

interface TemplateDetail extends TemplateSummary {

  columns: string[];

  required_columns: string[];

  output_format: Record<string, unknown>;

}

interface UploadResponse {

  upload_id: string;

  file_name: string;

  columns: string[];

  sample_rows: Record<string, unknown>[];

  row_count: number;

}

Start by scaffolding the project structure, routing, Zustand store, API client, and the

black/yellow Tailwind theme, then build Step 1 (Choose Template) fully working end-to-end

against the real API before moving to the next steps.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e014e333-e7c7-4b22-984c-8440aa15fa6c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
