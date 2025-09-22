import { Link } from "react-router-dom";
import "../css/Navbar.css";
import RaspiflixLogo from "../Images/Raspiflix.png";
import { useMovieContext } from "../contexts/MovieContext";

function NavBar() {
  const { searchQuery, performSearch, setSearchQuery, loading } =
    useMovieContext();

  const onSubmit = (e) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery("");
    performSearch("");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <img src={RaspiflixLogo} alt="RaspiFlix" className="navbar-logo" />
        </Link>
      </div>
      <div className="navbar-links">
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to="/favorites" className="nav-link">
          Favorites
        </Link>
      </div>
      <form className="navbar-search" onSubmit={onSubmit} role="search">
        <div className="navbar-search-field">
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search for movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
          />
          {searchQuery && (
            <button
              type="button"
              className="navbar-search-clear"
              aria-label="Clear search"
              onClick={clearSearch}
            >
              ×
            </button>
          )}
        </div>
        <button
          type="submit"
          className="navbar-search-submit"
          disabled={loading}
        >
          Search
        </button>
      </form>
    </nav>
  );
}

export default NavBar;
