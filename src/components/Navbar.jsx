import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        <span className="brand-mark">CM</span>

        <span>
          <strong>CivicMind AI</strong>
          <small>Community Operations</small>
        </span>
      </Link>

      <nav className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/reports">Reports</Link>
      </nav>
    </header>
  );
}

export default Navbar;