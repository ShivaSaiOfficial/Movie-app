import MovieCard from "../components/MovieCard";
import { useState, useEffect } from "react";
import {
  searchMovies,
  getPopularMovies,
  getFeaturedMovieVideos,
} from "../services/api";
import "../css/Home.css";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);

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

    const loadFeaturedVideos = async () => {
      try {
        console.log("🎬 Home: Loading featured videos...");
        const videos = await getFeaturedMovieVideos();
        console.log("🎬 Home: Received videos:", videos?.length);
        setFeaturedVideos(videos);
      } catch (err) {
        console.error("💥 Home: Error loading videos:", err);
      } finally {
        setVideosLoading(false);
      }
    };

    loadPopularMovies();
    loadFeaturedVideos();
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

  const getYouTubeUrl = (videoKey) =>
    `https://www.youtube.com/embed/${videoKey}?autoplay=0&controls=1&rel=0`;

  return (
    <div className="home">
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

      {/* Featured Videos Section */}
      {!videosLoading && featuredVideos.length > 0 && (
        <div className="featured-videos-section">
          <h2 className="section-title">🎬 Featured Trailers</h2>
          <div className="videos-carousel">
            {featuredVideos.map((movieData) =>
              movieData.videos.slice(0, 1).map((video) => (
                <div key={video.key} className="video-card">
                  <h3 className="video-title">{movieData.movieTitle}</h3>
                  <iframe
                    src={getYouTubeUrl(video.key)}
                    title={`${movieData.movieTitle} - ${video.name}`}
                    className="video-frame"
                    frameBorder="0"
                    allowFullScreen
                  />
                  <p className="video-type">{video.type}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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
