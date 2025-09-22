import MovieCard from "../components/MovieCard";
import { useState, useEffect } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import "../css/Home.css";

function Home() {
  const { movies, loading, error, loadPopularMovies } = useMovieContext();
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
    if (!movies || movies.length === 0) {
      loadPopularMovies();
    }
  }, [loadPopularMovies, movies]);

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
              const video = document.querySelector(".hero-video");
              if (video) {
                video.style.display = "block";
                video.style.opacity = "1";
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
              const video = document.querySelector(".hero-video");
              if (video) {
                video.play().catch((err) => {
                  console.log("⚠️ Video play from loadedData blocked:", err);
                });
              }
            }}
            onPlay={() => {
              console.log("✅ Video is playing");
              const fallback = document.querySelector(".hero-video-fallback");
              if (fallback) fallback.style.display = "none";
            }}
            onError={(e) => {
              console.error("❌ Video failed to load:", e);
              console.error("❌ Video error:", e.target.error);
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
            <svg
              className="hero-arrow-icon"
              width="32"
              height="32"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <g
                fill="none"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 28 L24 16 L34 28" />
                <path d="M12 32 L36 32" />
              </g>
            </svg>
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
            <svg
              className="hero-arrow-icon"
              width="32"
              height="32"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <g
                fill="none"
                stroke="white"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 20 L24 32 L34 20" />
                <path d="M12 16 L36 16" />
              </g>
            </svg>
          </button>
        </div>
      </div>

      {/* Search moved to Navbar */}

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
