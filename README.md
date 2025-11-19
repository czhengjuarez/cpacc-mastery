# CPACC Mastery - Flashcard Study App

A flashcard application for studying Core Competencies Training Exam concepts, deployed on Cloudflare Workers with R2 storage.

## Features

- **Flashcard Study Mode**: Review questions one at a time with timer
- **Progress Tracking**: Track "Got it right" vs "Needs practice"
- **Completion Dashboard**: Visual gauge with percentage score and confetti celebration
- **Admin Panel**: Add new flashcards via web interface
- **Cloud Storage**: All flashcards stored in Cloudflare R2

## Live Deployment

- **App**: https://leo-cpacc2.px-tester.workers.dev
- **Admin**: https://leo-cpacc2.px-tester.workers.dev/admin.html

## Local Development

### Prerequisites

- Node.js and npm
- Wrangler CLI: `npm install -g wrangler`
- Cloudflare account with Workers and R2 enabled

### Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env`:
   ```
   CLOUDFLARE_ACCOUNT_ID=your_account_id
   CLOUDFLARE_API_TOKEN=your_api_token
   ```

### Deploy

Set environment variables and deploy:

```bash
export CLOUDFLARE_ACCOUNT_ID="your_account_id"
export CLOUDFLARE_API_TOKEN="your_api_token"

cd worker-frontend
npx wrangler deploy
```

### Local Testing (Static Files Only)

```bash
python3 -m http.server 8001
```

Then visit `http://localhost:8001/index.html`

**Note**: The API endpoints won't work locally since they require R2 access.

## Project Structure

```
cpacc-mastery/
├── index.html              # Welcome page
├── flashcard.html          # Main flashcard study interface
├── admin.html              # Admin panel for adding cards
├── main.js                 # Flashcard app logic
├── admin.js                # Admin panel logic
├── styles.css              # Legacy styles (unused)
├── flashcards.json         # Local copy of flashcard data
├── worker/                 # API-only Worker (optional)
│   ├── wrangler.toml
│   └── src/index.js
└── worker-frontend/        # Combined frontend + API Worker
    ├── wrangler.toml
    └── src/index.js        # Serves static files + API endpoints
```

## API Endpoints

### GET `/api/flashcards`
Returns all flashcards as JSON array.

### POST `/api/flashcards`
Add a new flashcard.

**Request body:**
```json
{
  "term": "Question or term",
  "definition": "Answer or definition"
}
```

**Response:**
```json
{
  "success": true,
  "card_id": 6
}
```

## Git Branches

- **`main`**: Original version with remote API
- **`json-flashcards`**: Local JSON file version
- **`worker-deployment`**: Full Cloudflare Worker + R2 deployment with admin panel

## Security Notes

- The admin panel is currently public (no authentication)
- For production use, add authentication and rate limiting
- Never commit `.env` or credentials to Git
- API token has write access to Workers and R2

## License

MIT
