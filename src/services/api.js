const API_KEY = "de79c44241a0e1db09617217f8b8692a";
const BASE_URL = "https://api.themoviedb.org/3";
const V4_TOKEN =
  typeof import.meta !== "undefined"
    ? import.meta.env?.VITE_TMDB_V4_TOKEN
    : undefined;
const REQUEST_TIMEOUT_MS = 10000; // 10s to avoid false timeouts

// Mock data for when API is blocked
const mockMovies = [
  {
    id: 5,
    title: "Interstellar",
    poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    release_date: "2014-11-07",
    vote_average: 8.6,
  },
  {
    id: 2,
    title: "The Godfather",
    poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    release_date: "1972-03-14",
    vote_average: 9.2,
  },
  {
    id: 3,
    title: "The Dark Knight",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    release_date: "2008-07-18",
    vote_average: 9.0,
  },
  {
    id: 4,
    title: "Pulp Fiction",
    poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    release_date: "1994-10-14",
    vote_average: 8.9,
  },
  {
    id: 6,
    title: "Oppenheimer",
    poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    release_date: "2023-07-21",
    vote_average: 8.3,
  },
  {
    id: 7,
    title: "Harry Potter and the Philosopher's Stone",
    poster_path: "/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg",
    release_date: "2001-11-16",
    vote_average: 7.9,
  },
  {
    id: 8,
    title: "Iron Man 3",
    poster_path: "/qhPtAc1TKbMPqNvcdXSOn9Bn7hZ.jpg",
    release_date: "2013-04-18",
    vote_average: 7.1,
  },
  {
    id: 9,
    title: "Seven",
    poster_path: "/6yoghtyTpznpBik8EngEmJskVUO.jpg",
    release_date: "1995-09-22",
    vote_average: 8.4,
  },
  {
    id: 10,
    title: "Inception",
    poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    release_date: "2010-07-16",
    vote_average: 8.8,
  },
  {
    id: 11,
    title: "The Matrix",
    poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    release_date: "1999-03-24",
    vote_average: 8.7,
  },
  {
    id: 12,
    title: "Titanic",
    poster_path: "/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
    release_date: "1997-12-19",
    vote_average: 7.9,
  },
  {
    id: 13,
    title: "Avatar",
    poster_path: "/6EiRUJpuoeQPghrs3YNktfnqOVh.jpg",
    release_date: "2009-12-18",
    vote_average: 7.9,
  },
  {
    id: 14,
    title: "The Avengers",
    poster_path: "/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg",
    release_date: "2012-05-04",
    vote_average: 8.0,
  },
  {
    id: 15,
    title: "Spider-Man: No Way Home",
    poster_path: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    release_date: "2021-12-17",
    vote_average: 8.4,
  },
  {
    id: 16,
    title: "Forrest Gump",
    poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    release_date: "1994-07-06",
    vote_average: 8.8,
  },
  {
    id: 17,
    title: "Gran Turismo",
    poster_path: "/51tqzRtKMMZEYUpSYkrUE7v9ehm.jpg",
    release_date: "2023-08-25",
    vote_average: 7.2,
  },
];

// Basic mock genres if API unavailable
const mockGenres = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 18, name: "Drama" },
  { id: 878, name: "Science Fiction" },
  { id: 53, name: "Thriller" },
  { id: 35, name: "Comedy" },
];

// Centralized API status & backoff tracking
const apiStatus = {
  invalidKey: false, // set true on 401/403
  lastFailureAt: 0, // timestamp of last network failure
  cooldownMs: 60000, // 60s cooldown after generic failures
  rateLimitUntil: 0, // timestamp until we should wait after 429
};

const now = () => Date.now();

const shouldSkipNetwork = () => {
  if (apiStatus.invalidKey) return { skip: true, reason: "invalid-key" };
  if (now() < apiStatus.rateLimitUntil)
    return { skip: true, reason: "rate-limit" };
  if (
    apiStatus.lastFailureAt &&
    now() - apiStatus.lastFailureAt < apiStatus.cooldownMs
  )
    return { skip: true, reason: "cooldown" };
  return { skip: false };
};

const buildHeaders = () => {
  const headers = { Accept: "application/json" };
  if (V4_TOKEN) headers["Authorization"] = `Bearer ${V4_TOKEN}`;
  return headers;
};

const withTimeout = (signal) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const composite = new AbortController();
  const onAbort = () => composite.abort();
  if (signal) signal.addEventListener("abort", onAbort, { once: true });
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeoutId),
    composite,
    detach: () => signal && signal.removeEventListener("abort", onAbort),
  };
};

export const getPopularMovies = async () => {
  const skip = shouldSkipNetwork();
  if (skip.skip) {
    console.log(`🎭 Using mock data due to: ${skip.reason}`);
    return mockMovies;
  }
  try {
    console.log("🎬 Attempting to fetch popular movies from TMDB...");
    const { signal, clear } = withTimeout();
    const url = V4_TOKEN
      ? `${BASE_URL}/movie/popular`
      : `${BASE_URL}/movie/popular?api_key=${API_KEY}`;
    const response = await fetch(url, { signal, headers: buildHeaders() });
    clear();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        apiStatus.invalidKey = true;
        throw new Error("Invalid API key");
      }
      if (response.status === 429) {
        const retryAfter = parseInt(
          response.headers.get("Retry-After") || "60",
          10
        );
        apiStatus.rateLimitUntil =
          now() + Math.min(Math.max(retryAfter, 30), 120) * 1000; // clamp 30-120s
        console.warn(`⏳ Rate limited. Backing off for ${retryAfter}s.`);
        return mockMovies;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    apiStatus.invalidKey = false;
    apiStatus.lastFailureAt = 0;
    apiStatus.rateLimitUntil = 0;
    console.log(
      "✅ TMDB API Success! Retrieved",
      data.results?.length,
      "movies"
    );
    return data.results || [];
  } catch (error) {
    if (error.name === "AbortError") {
      console.warn(
        "⏱️ TMDB request timed out. Using mock data and cooling down."
      );
      apiStatus.lastFailureAt = now();
      return mockMovies;
    }
    if (error.message === "Invalid API key") {
      console.error(
        "🔒 Invalid API key. Blocking further attempts until key changes."
      );
      throw error; // propagate so UI can show specific error
    }
    console.warn("⚠️ TMDB API error. Using mock data.", error?.message);
    apiStatus.lastFailureAt = now();
    return mockMovies;
  }
};

export const searchMovies = async (query) => {
  const skip = shouldSkipNetwork();
  if (skip.skip) {
    console.log(`🔍 Using mock search due to: ${skip.reason}`);
    return mockMovies.filter((m) =>
      m.title.toLowerCase().includes(query.toLowerCase())
    );
  }
  try {
    console.log("🔍 Searching TMDB for:", query);
    const { signal, clear } = withTimeout();
    const url = V4_TOKEN
      ? `${BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
          query
        )}`;
    const response = await fetch(url, { signal, headers: buildHeaders() });
    clear();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        apiStatus.invalidKey = true;
        throw new Error("Invalid API key");
      }
      if (response.status === 429) {
        const retryAfter = parseInt(
          response.headers.get("Retry-After") || "60",
          10
        );
        apiStatus.rateLimitUntil =
          now() + Math.min(Math.max(retryAfter, 30), 120) * 1000;
        console.warn(`⏳ Rate limited. Backing off for ${retryAfter}s.`);
        return mockMovies.filter((m) =>
          m.title.toLowerCase().includes(query.toLowerCase())
        );
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    apiStatus.invalidKey = false;
    apiStatus.lastFailureAt = 0;
    apiStatus.rateLimitUntil = 0;
    console.log(
      "✅ TMDB Search Success! Found",
      data.results?.length,
      "movies"
    );
    return data.results || [];
  } catch (error) {
    if (error.name === "AbortError") {
      console.warn(
        "⏱️ TMDB search timed out. Using mock filter and cooling down."
      );
      apiStatus.lastFailureAt = now();
      return mockMovies.filter((m) =>
        m.title.toLowerCase().includes(query.toLowerCase())
      );
    }
    if (error.message === "Invalid API key") {
      console.error("🔒 Invalid API key on search.");
      throw error;
    }
    console.warn("⚠️ TMDB search error. Using mock filter.", error?.message);
    apiStatus.lastFailureAt = now();
    return mockMovies.filter((m) =>
      m.title.toLowerCase().includes(query.toLowerCase())
    );
  }
};

// Get movie videos (trailers, clips, etc.)
export const getMovieVideos = async (movieId) => {
  const skip = shouldSkipNetwork();
  if (skip.skip) {
    console.log(`🎭 Skipping video fetch due to: ${skip.reason}`);
    return [];
  }
  try {
    console.log("🎬 Fetching videos for movie ID:", movieId);
    const { signal, clear } = withTimeout();
    const url = V4_TOKEN
      ? `${BASE_URL}/movie/${movieId}/videos`
      : `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`;
    const response = await fetch(url, { signal, headers: buildHeaders() });
    clear();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        apiStatus.invalidKey = true;
        throw new Error("Invalid API key");
      }
      if (response.status === 429) {
        const retryAfter = parseInt(
          response.headers.get("Retry-After") || "60",
          10
        );
        apiStatus.rateLimitUntil =
          now() + Math.min(Math.max(retryAfter, 30), 120) * 1000;
        console.warn(
          `⏳ Rate limited on videos. Backing off for ${retryAfter}s.`
        );
        return [];
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    apiStatus.invalidKey = false;
    apiStatus.lastFailureAt = 0;
    apiStatus.rateLimitUntil = 0;
    console.log("✅ Videos retrieved:", data.results?.length, "videos");
    const videos =
      data.results?.filter(
        (video) =>
          video.site === "YouTube" &&
          (video.type === "Trailer" ||
            video.type === "Clip" ||
            video.type === "Teaser")
      ) || [];
    return videos;
  } catch (error) {
    if (error.name === "AbortError") {
      console.warn("⏱️ Video request timed out. Cooling down.");
      apiStatus.lastFailureAt = now();
      return [];
    }
    if (error.message === "Invalid API key") {
      console.error("🔒 Invalid API key while fetching videos.");
      throw error;
    }
    console.log("⚠️ Videos unavailable for movie:", movieId);
    apiStatus.lastFailureAt = now();
    return [];
  }
};

// Get featured movie videos for homepage
export const getFeaturedMovieVideos = async () => {
  try {
    // Get videos for popular movies (first few from our mock data)
    const featuredMovieIds = [5, 6, 3, 10]; // Interstellar, Oppenheimer, Dark Knight, Inception
    const allVideos = [];

    for (const movieId of featuredMovieIds) {
      const videos = await getMovieVideos(movieId);
      if (videos.length > 0) {
        allVideos.push({
          movieId,
          movieTitle:
            mockMovies.find((m) => m.id === movieId)?.title || "Unknown",
          videos: videos.slice(0, 2), // Get max 2 videos per movie
        });
      }
    }

    return allVideos;
  } catch (error) {
    console.log("⚠️ Featured videos unavailable");
    return [];
  }
};

// Fetch list of genres
export const fetchGenres = async () => {
  const skip = shouldSkipNetwork();
  if (skip.skip) {
    console.log(`🎭 Using mock genres due to: ${skip.reason}`);
    return mockGenres;
  }
  try {
    console.log("🗂️ Fetching movie genres...");
    const { signal, clear } = withTimeout();
    const url = V4_TOKEN
      ? `${BASE_URL}/genre/movie/list`
      : `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`;
    const response = await fetch(url, { signal, headers: buildHeaders() });
    clear();
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        apiStatus.invalidKey = true;
        throw new Error("Invalid API key");
      }
      if (response.status === 429) {
        const retryAfter = parseInt(
          response.headers.get("Retry-After") || "60",
          10
        );
        apiStatus.rateLimitUntil =
          now() + Math.min(Math.max(retryAfter, 30), 120) * 1000;
        console.warn(`⏳ Rate limited for genres. Backing off.`);
        return mockGenres;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data.genres || [];
  } catch (error) {
    if (error.message === "Invalid API key") throw error;
    console.warn("⚠️ Genre fetch failed, using mock.", error?.message);
    return mockGenres;
  }
};

// Fetch movies filtered by one or multiple genres
export const fetchMoviesByGenre = async (genreInput) => {
  if (!genreInput || (Array.isArray(genreInput) && genreInput.length === 0)) {
    return getPopularMovies();
  }
  const ids = Array.isArray(genreInput) ? genreInput : [genreInput];
  const param = ids.join(",");
  const skip = shouldSkipNetwork();
  if (skip.skip) {
    console.log(`🎭 Using mock movie filter due to: ${skip.reason}`);
    // naive mock filter using parity across sum of genre ids for deterministic subset
    const sum = ids.reduce((a, b) => a + b, 0);
    return mockMovies.filter((m) => (m.id + sum) % 2 === 0);
  }
  try {
    console.log("🎬 Discover movies for genres:", param);
    const { signal, clear } = withTimeout();
    const url = V4_TOKEN
      ? `${BASE_URL}/discover/movie?with_genres=${param}`
      : `${BASE_URL}/discover/movie?with_genres=${param}&api_key=${API_KEY}`;
    const response = await fetch(url, { signal, headers: buildHeaders() });
    clear();
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        apiStatus.invalidKey = true;
        throw new Error("Invalid API key");
      }
      if (response.status === 429) {
        const retryAfter = parseInt(
          response.headers.get("Retry-After") || "60",
          10
        );
        apiStatus.rateLimitUntil =
          now() + Math.min(Math.max(retryAfter, 30), 120) * 1000;
        console.warn(`⏳ Rate limited on discover. Using mock filter.`);
        const sum = ids.reduce((a, b) => a + b, 0);
        return mockMovies.filter((m) => (m.id + sum) % 2 === 0);
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    if (error.message === "Invalid API key") throw error;
    console.warn("⚠️ Genre movie fetch failed, using mock.", error?.message);
    const sum = ids.reduce((a, b) => a + b, 0);
    return mockMovies.filter((m) => (m.id + sum) % 2 === 0);
  }
};
