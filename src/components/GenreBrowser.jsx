import { useEffect, useState, useCallback } from "react";
import { fetchGenres, fetchMoviesByGenre } from "../services/api";
import { useMovieContext } from "../contexts/MovieContext";
import "../css/Genres.css";

/*
  GenreBrowser responsibilities:
  - Fetch and render list of genres
  - Allow selecting one genre (or All)
  - On selection: fetch movies for that genre and push into global movie context
  - Show loading & error states
*/

export default function GenreBrowser() {
  const { loadPopularMovies, setMovies } = useMovieContext();
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]); // array of IDs
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [loadingGenreMovies, setLoadingGenreMovies] = useState(false);
  const [error, setError] = useState(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const updateShadows = useCallback((el) => {
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeftShadow(scrollLeft > 4);
    setShowRightShadow(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  const loadGenres = useCallback(async () => {
    try {
      setLoadingGenres(true);
      setError(null);
      const list = await fetchGenres();
      setGenres(list);
    } catch (err) {
      setError(err?.message || "Failed to load genres");
    } finally {
      setLoadingGenres(false);
    }
  }, []);

  const selectAll = async () => {
    setSelectedGenres([]);
    setError(null);
    setLoadingGenreMovies(true);
    try {
      await loadPopularMovies();
    } finally {
      setLoadingGenreMovies(false);
    }
  };

  const toggleGenre = async (genreId) => {
    setError(null);
    setLoadingGenreMovies(true);
    try {
      let next;
      if (selectedGenres.includes(genreId)) {
        next = selectedGenres.filter((id) => id !== genreId);
      } else {
        next = [...selectedGenres, genreId];
      }
      setSelectedGenres(next);
      if (next.length === 0) {
        await loadPopularMovies();
      } else {
        const list = await fetchMoviesByGenre(next);
        setMovies(list);
      }
    } catch (err) {
      setError(err?.message || "Failed to update genre filter");
    } finally {
      setLoadingGenreMovies(false);
    }
  };

  const removeGenre = async (genreId, e) => {
    e?.stopPropagation();
    if (!selectedGenres.includes(genreId)) return;
    setError(null);
    setLoadingGenreMovies(true);
    try {
      const next = selectedGenres.filter((id) => id !== genreId);
      setSelectedGenres(next);
      if (next.length === 0) {
        await loadPopularMovies();
      } else {
        const list = await fetchMoviesByGenre(next);
        setMovies(list);
      }
    } catch (err) {
      setError(err?.message || "Failed to remove genre");
    } finally {
      setLoadingGenreMovies(false);
    }
  };

  useEffect(() => {
    loadGenres();
  }, [loadGenres]);

  // Provide a minimal skeleton shimmer for genres
  const skeletons = Array.from({ length: 8 }).map((_, i) => (
    <div key={i} className="genre-chip skeleton" />
  ));

  return (
    <div className="genre-browser">
      <div className="genre-header">
        <h2 className="genre-title">Browse by Genre</h2>
      </div>
      {error && (
        <div className="genre-error" role="alert">
          {error}
          <button className="retry-btn" onClick={loadGenres}>
            Retry
          </button>
        </div>
      )}
      <div
        className={`genre-chips-wrapper ${
          showLeftShadow ? "shadow-left" : ""
        } ${showRightShadow ? "shadow-right" : ""}`}
        ref={(el) => {
          if (el) {
            updateShadows(el);
            const handler = () => updateShadows(el);
            el.addEventListener("scroll", handler, { passive: true });
            // Cleanup when element changes
            return () => el.removeEventListener("scroll", handler);
          }
        }}
      >
        <div className="genre-chips" aria-label="Movie Genres" role="list">
          <button
            type="button"
            className={`genre-chip all ${
              selectedGenres.length === 0 ? "active" : ""
            }`}
            onClick={selectAll}
            disabled={loadingGenreMovies}
          >
            All Movies
          </button>
          {loadingGenres
            ? skeletons
            : genres.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  role="listitem"
                  className={`genre-chip ${
                    selectedGenres.includes(g.id) ? "active multi" : ""
                  }`}
                  onClick={() => toggleGenre(g.id)}
                  disabled={
                    loadingGenreMovies && !selectedGenres.includes(g.id)
                  }
                >
                  <span className="genre-label">{g.name}</span>
                  {selectedGenres.includes(g.id) && (
                    <span
                      className="chip-close"
                      role="button"
                      aria-label={`Remove ${g.name}`}
                      onClick={(e) => removeGenre(g.id, e)}
                    >
                      ×
                    </span>
                  )}
                </button>
              ))}
        </div>
      </div>
      {loadingGenreMovies && (
        <div className="genre-loading-bar">
          <div className="bar" />
        </div>
      )}
    </div>
  );
}
