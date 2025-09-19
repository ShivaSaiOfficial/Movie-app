import MovieCard from "../components/MovieCard";
import { useState, useEffect } from "react";
import { searchMovies, getPopularMovies } from "../services/api";
import "../css/Home.css";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPopularMovies = async () => {
      try {
        console.log("🏠 Home: Starting to load popular movies...");
        setError(null); // Clear any previous errors

        const popularMovies = await getPopularMovies();
        console.log("🏠 Home: Received movies:", popularMovies?.length);

        if (popularMovies && popularMovies.length > 0) {
          setMovies(popularMovies);
          console.log("✅ Movies set successfully");
        } else {
          console.warn("⚠️ No movies received");
          setError("No movies found");
        }
      } catch (err) {
        console.error("💥 Home: Error loading movies:", err);
        setError("Failed to load movies: " + err.message);
      } finally {
        console.log("🏁 Home: Loading finished");
        setLoading(false);
      }
    };

    loadPopularMovies();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (loading) return;

    setLoading(true);
    try {
      const searchResults = await searchMovies(searchQuery);
      setMovies(searchResults);
      setError(null);
    } catch (err) {
      console.log(err);
      setError("Failed to search movies...");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Banner Section */}
      <div className="hero-banner">
        <div className="hero-video-container">
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            onError={(e) => {
              console.log("Video failed to load, using fallback background");
              e.target.style.display = "none";
            }}
          >
            <source src="/videos/Interstellar clip.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="hero-video-fallback"></div>
          <div className="hero-video-overlay"></div>
        </div>

        <div className="hero-content">
          <h1 className="hero-title">Interstellar</h1>
          <p className="hero-description">
            A team of explorers travel through a wormhole in space in an attempt
            to ensure humanity's survival. Experience this mind-bending journey
            through space and time that will challenge everything you think you
            know about our universe.
          </p>
          <div className="hero-buttons">
            <button className="hero-btn hero-btn-play">▶ Watch Now</button>
            <button className="hero-btn hero-btn-info">ℹ More Info</button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search for movies..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="movies-grid">
          {movies.map((movie) => (
            <MovieCard movie={movie} key={movie.id} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
