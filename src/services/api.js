const API_KEY = "Yde79c44241a0e1db09617217f8b8692a";
const BASE_URL = "https://api.themoviedb.org/3";

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
];

// Check if API is accessible (to avoid repeated timeout attempts)
let apiAccessible = null;

export const getPopularMovies = async () => {
  // If we know API is not accessible, return mock data immediately
  if (apiAccessible === false) {
    console.log("🎭 Using cached mock data (API known to be inaccessible)");
    return mockMovies;
  }

  try {
    console.log("🎬 Attempting to fetch popular movies from TMDB...");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(
      `${BASE_URL}/movie/popular?api_key=${API_KEY}`,
      {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(
      "✅ TMDB API Success! Retrieved",
      data.results?.length,
      "movies"
    );

    apiAccessible = true; // Mark API as working
    return data.results || [];
  } catch (error) {
    console.log("⚠️ TMDB API unavailable, using mock data");
    apiAccessible = false; // Mark API as not working
    return mockMovies;
  }
};

export const searchMovies = async (query) => {
  // If we know API is not accessible, filter mock data immediately
  if (apiAccessible === false) {
    console.log("🔍 Filtering mock data for:", query);
    const filtered = mockMovies.filter((movie) =>
      movie.title.toLowerCase().includes(query.toLowerCase())
    );
    console.log("🎭 Found", filtered.length, "matching mock movies");
    return filtered;
  }

  try {
    console.log("🔍 Searching TMDB for:", query);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
        query
      )}`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(
      "✅ TMDB Search Success! Found",
      data.results?.length,
      "movies"
    );

    apiAccessible = true; // Mark API as working
    return data.results || [];
  } catch (error) {
    console.log("⚠️ TMDB Search unavailable, filtering mock data");
    apiAccessible = false; // Mark API as not working

    const filtered = mockMovies.filter((movie) =>
      movie.title.toLowerCase().includes(query.toLowerCase())
    );
    console.log("🎭 Found", filtered.length, "matching mock movies");
    return filtered;
  }
};
