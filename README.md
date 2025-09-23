# Raspiflix – Movie App

A polished React + Vite movie app featuring a full‑screen hero video, transparent overlay navbar with centered navigation and right‑aligned global search, favorites, and a resilient TMDB integration with mock fallback.

## Highlights

- Full‑bleed hero section with video, gradient overlay, overlaid title/description, and arrow/dot hero controls
- Transparent navbar over the hero; brand on the left, links centered, global search on the right with clear (×)
- Smooth nav hover scaling without layout shift; hero controls styled to match the design
- Global search in the navbar powered by React Context (results populate the Home grid)
- Favorites with local storage persistence
- Resilient TMDB API client: longer timeouts, rate‑limit backoff, temporary cooldowns, and helpful error messages
- Automatic mock data fallback when the API is unavailable (keeps the UI usable)

## Screenshot

Place the homepage screenshot at `public/images/homepage-hero.jpg` and it will render below:

![Homepage – Hero](/images/homepage-hero.jpg)

> Tip: You can change the filename and update this link accordingly.

## Project Structure

```
movie-app/
├── public/
│   ├── images/
│   │   └── homepage-hero.jpg        # Add your screenshot
│   ├── videos/
│   │   ├── Interstellar_clip.mp4
│   │   └── F1_Clip.mp4
│   ├── vite.svg
│   └── video-placeholder.txt
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── components/
│   │   ├── MovieCard.jsx
│   │   └── NavBar.jsx
│   ├── contexts/
│   │   └── MovieContext.jsx
│   ├── pages/
│   │   ├── Favorites.jsx
│   │   └── Home.jsx
│   ├── services/
│   │   └── api.js
│   ├── css/
│   │   ├── App.css
│   │   ├── Favorites.css
│   │   ├── Home.css
│   │   ├── MovieCard.css
│   │   ├── Navbar.css
│   │   └── index.css
│   └── Images/
│       └── Raspiflix.png
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
└── README.md
```

## Setup

1. Install dependencies

```powershell
npm install
```

2. Configure TMDB API

- Option A: v3 API key (query param – already wired)
  - In `src/services/api.js`, `API_KEY` is used when no v4 token is provided.
- Option B: v4 bearer token (recommended for production)
  - Create `.env` and add your token:
    ```env
    VITE_TMDB_V4_TOKEN=eyJhbGciOiJIUzI1...
    ```
  - The client will automatically switch to the `Authorization: Bearer <token>` header and remove the `api_key` query param.

3. Run the dev server

```powershell
npm run dev
```

Open http://localhost:5173

## API Resilience

The TMDB client is designed to avoid breaking the UI:

- 10s request timeout with graceful aborts
- 401/403: surfaces “Invalid API key” and halts retries until the key changes
- 429: reads `Retry-After` (30–120s clamp) and backs off
- Network/timeout: switches to mock data and cools down for 60s before retrying
- Mock fallback maintains a functional experience (search filters mock data)

## UX Details

- Transparent navbar overlays the hero, links are centered, search sits on the right with a simple clear (×)
- Nav link hover uses transform scale (center origin) to avoid shifting siblings
- Hero controls: minimalist arrows and centered dots at the bottom
- Home grid is responsive and uses `MovieCard` for consistent visuals

## Scripts

- `npm run dev` – Start the development server
- `npm run build` – Build for production
- `npm run preview` – Preview the production build

## Notes

- If you run behind corporate networks or ad-blockers, consider a dev proxy to avoid CORS/key exposure.
- Favorites persist in `localStorage`.

## License

MIT
