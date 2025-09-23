import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { getPopularMovies, searchMovies } from "../services/api";

const MovieContext = createContext();

export const useMovieContext = () => useContext(MovieContext);

export const MovieProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedFavs = localStorage.getItem("favorites");

    if (storedFavs) setFavorites(JSON.parse(storedFavs));
  }, []);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (movie) => {
    setFavorites((prev) => [...prev, movie]);
  };

  const removeFromFavorites = (movieId) => {
    setFavorites((prev) => prev.filter((movie) => movie.id !== movieId));
  };

  const isFavorite = (movieId) => {
    return favorites.some((movie) => movie.id === movieId);
  };

  const loadPopularMovies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await getPopularMovies();
      setMovies(list);
    } catch (err) {
      setError(err?.message || "Failed to load movies");
    } finally {
      setLoading(false);
    }
  }, []);

  const performSearch = useCallback(
    async (query) => {
      const q = (query ?? "").trim();
      setSearchQuery(q);
      if (!q) {
        await loadPopularMovies();
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const list = await searchMovies(q);
        setMovies(list);
      } catch (err) {
        setError(err?.message || "Failed to search movies");
      } finally {
        setLoading(false);
      }
    },
    [loadPopularMovies]
  );

  const value = {
    movies,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    loadPopularMovies,
    performSearch,
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };

  return (
    <MovieContext.Provider value={value}>{children}</MovieContext.Provider>
  );
};
