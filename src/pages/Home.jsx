import MovieCard from "../components/MovieCard";
import { useState, useEffect } from "react";
import { searchMovies, getPopularMovies } from "../services/api";
import "../css/Home.css";

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  const heroVideos = [
    {
      id: "interstellar",
      src: "/videos/Interstellar_clip.mp4",
      title: "Interstellar",
      description:
        "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival. Experience this mind-bending journey through space and time that will challenge everything you think you know about our universe.",
    },
    {
      id: "f1",
      src: "/videos/F1_Clip.mp4",
      title: "Formula 1",
      description:
        "Feel the speed and drama of Formula 1 — blistering pace, razor-thin margins, and relentless strategy at the highest level of motorsport.",
    },
  ];

  const currentHero = heroVideos[heroIndex];

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
        <div
          className="hero-video-container"
          onClick={() => {
            const video = document.querySelector(".hero-video");
            if (video && video.paused) {
              video
                .play()
                .then(() => {
                  console.log("✅ Video played after user interaction");
                })
                .catch((err) => {
                  console.log("❌ Video play after click failed:", err);
                });
            }
          }}
        >
          <video
            key={currentHero.id}
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onLoadStart={() => {
              console.log("✅ Video loading started");
            }}
            onCanPlay={() => {
              console.log("✅ Video can play");
              // Ensure video is visible and force play
              const video = document.querySelector(".hero-video");
              if (video) {
                video.style.display = "block";
                video.style.opacity = "1";
                // Force play with promise handling
                video
                  .play()
                  .then(() => {
                    console.log("✅ Video play() succeeded");
                  })
                  .catch((err) => {
                    console.log("⚠️ Video autoplay blocked:", err);
                  });
              }
            }}
            onLoadedData={() => {
              console.log("✅ Video data loaded");
              // Try to play when data is loaded
              const video = document.querySelector(".hero-video");
              if (video) {
                video.play().catch((err) => {
                  console.log("⚠️ Video play from loadedData blocked:", err);
                });
              }
            }}
            onPlay={() => {
              console.log("✅ Video is playing");
              // Hide fallback when video plays
              const fallback = document.querySelector(".hero-video-fallback");
              if (fallback) fallback.style.display = "none";
            }}
            onError={(e) => {
              console.error("❌ Video failed to load:", e);
              console.error("❌ Video error:", e.target.error);
              // Show fallback on error
              const fallback = document.querySelector(".hero-video-fallback");
              if (fallback) fallback.style.display = "block";
            }}
          >
            <source src={currentHero.src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="hero-video-fallback"></div>
          <div className="hero-video-overlay"></div>
        </div>

        <div className="hero-content">
          <h1 className="hero-title">{currentHero.title}</h1>
          <p className="hero-description">{currentHero.description}</p>
          <div className="hero-buttons">
            <button className="hero-btn hero-btn-play">▶ Watch Now</button>
            <button className="hero-btn hero-btn-info">ℹ More Info</button>
          </div>
          <div className="hero-controls">
            <button
              type="button"
              aria-label="Previous Hero"
              className="hero-arrow hero-arrow-left"
              onClick={() =>
                setHeroIndex(
                  (i) => (i - 1 + heroVideos.length) % heroVideos.length
                )
              }
            >
              ‹
            </button>
            <div className="hero-dots">
              {heroVideos.map((v, idx) => (
                <button
                  key={v.id}
                  type="button"
                  className={`hero-dot ${idx === heroIndex ? "active" : ""}`}
                  aria-label={`Go to ${v.title}`}
                  onClick={() => setHeroIndex(idx)}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Next Hero"
              className="hero-arrow hero-arrow-right"
              onClick={() => setHeroIndex((i) => (i + 1) % heroVideos.length)}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Search below hero */}
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
