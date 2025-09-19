import { Link } from "react-router-dom";
import "../css/Navbar.css";
import RaspiflixLogo from "../Images/Raspiflix.png";

function NavBar() {
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
    </nav>
  );
}

export default NavBar;
